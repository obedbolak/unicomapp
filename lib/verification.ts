// lib/verification.ts
//
// Public verification of a quote or invoice.
//
// The threat this is built against is enumeration, not forgery. Document
// numbers are sequential by design — UCT-QTE-2026-0001, -0002, -0003 — so a
// lookup keyed on the number alone would hand anyone a directory of who our
// clients are and what they were quoted. Possession of the PDF is therefore
// the credential: each document carries a random code, and the number without
// the code proves nothing.
//
// What comes back is deliberately thin. A caller who passes the check learns
// that the document is genuine, when it was issued, who it is addressed to and
// where it stands — never the amounts or the line items. Those are already in
// the PDF the caller is holding, so restating them here would only widen what
// a leaked code is worth.

import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * No 0/O, 1/I/L, 5/S, 8/B. The code is read off a printed page and typed by
 * hand — often by someone's accountant, often from a phone photo — so the
 * alphabet leaves out every pair that is routinely misread. 27 symbols over 8
 * characters is about 38 bits, far past guessable at any rate a web form
 * allows, and short enough that nobody minds typing it.
 */
const ALPHABET = "234679ACDEFGHJKMNPQRTUVWXYZ";
const LENGTH = 8;

/** "7K2M9QXA" → "7K2M-9QXA". Grouped for reading aloud and typing. */
export function formatCode(code: string): string {
  return code.length === LENGTH ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

/** Accepts "7k2m-9qxa", " 7K2M 9QXA " and anything between. */
export function normalizeCode(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function normalizeNumber(input: string): string {
  return input.trim().toUpperCase();
}

function generateCode(): string {
  let out = "";
  // randomInt, not Math.random: this is a credential, and Math.random is
  // seeded predictably enough that a determined caller could narrow the space.
  for (let i = 0; i < LENGTH; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/**
 * Returns the document's verification code, minting one the first time it is
 * needed.
 *
 * Called when a PDF is rendered rather than when the row is created, so
 * documents that already existed before this feature get a code the moment
 * they are first printed — there is no backfill to run and nothing to
 * remember. The unique constraint on verifyCode is what makes the retry loop
 * correct: a collision fails the write rather than silently pointing two
 * documents at one code.
 */
export async function ensureVerifyCode(invoiceId: string): Promise<string> {
  const existing = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { verifyCode: true },
  });

  if (existing?.verifyCode) return existing.verifyCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      const updated = await prisma.invoice.update({
        where: { id: invoiceId },
        data: { verifyCode: code },
        select: { verifyCode: true },
      });
      return updated.verifyCode!;
    } catch {
      // Either the code collided or another request minted one first. Re-read:
      // if a code now exists, that one is authoritative and we use it.
      const now = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { verifyCode: true },
      });
      if (now?.verifyCode) return now.verifyCode;
    }
  }

  throw new Error(
    `Could not allocate a verification code for invoice ${invoiceId}`,
  );
}

/** Generates a code for a document being created. */
export function newVerifyCode(): string {
  return generateCode();
}

/* ── Lookup ──────────────────────────────────────────────────────────────── */

export type VerificationResult =
  | { ok: true; document: VerifiedDocument }
  | { ok: false; reason: "not-found" };

export type VerifiedDocument = {
  number: string;
  docType: "QUOTE" | "INVOICE";
  /** "Quote" | "Invoice" */
  typeLabel: string;
  subject: string | null;
  clientName: string | null;
  issueDate: string;
  /** Quotes only. */
  validUntil: string | null;
  expired: boolean;
  status: string;
  statusLabel: string;
  /** Plain-language line for the client: what this status means for them. */
  statusNote: string;
  issuer: string;
};

const STATUS_LABELS: Record<string, [label: string, note: string]> = {
  DRAFT: [
    "Draft",
    "This document has not been issued yet. Treat any copy you hold as provisional.",
  ],
  SENT: ["Issued", "This document has been issued and is currently in force."],
  PARTIAL: [
    "Partly settled",
    "This document has been issued and payment against it has begun.",
  ],
  PAID: ["Settled", "This document has been paid in full."],
  OVERDUE: [
    "Overdue",
    "This document has been issued and payment is past its due date.",
  ],
  VOID: [
    "Cancelled",
    "This document has been cancelled and is no longer in force.",
  ],
};

const THROTTLE_WINDOW_MS = 15 * 60 * 1000;

/**
 * Failed lookups from one address inside the throttle window.
 *
 * Returns 0 if the count itself fails: a database hiccup in the throttle must
 * not lock out legitimate clients, and the real protection is the size of the
 * code space, not this.
 */
async function recentFailures(ip: string): Promise<number> {
  try {
    return await prisma.documentVerification.count({
      where: {
        ip,
        found: false,
        createdAt: { gte: new Date(Date.now() - THROTTLE_WINDOW_MS) },
      },
    });
  } catch {
    return 0;
  }
}

/**
 * Checks a number and code together.
 *
 * Both a wrong number and a wrong code return the same "not-found", on
 * purpose: telling a caller that the number is real but the code is wrong
 * confirms the document exists, which is exactly what enumeration is after.
 */
export async function verifyDocument(
  numberInput: string,
  codeInput: string,
  meta?: { ip?: string | null; userAgent?: string | null },
): Promise<VerificationResult> {
  const number = normalizeNumber(numberInput);
  const code = normalizeCode(codeInput);

  if (!number || !code) return { ok: false, reason: "not-found" };

  // 38 bits is not brute-forceable, but a public form with no ceiling still
  // invites someone to try — and the audit table we already write gives us the
  // counter for free. Ten misses from one address in fifteen minutes is far
  // more than a client mistyping a code off their own document.
  if (meta?.ip && (await recentFailures(meta.ip)) >= 10) {
    return { ok: false, reason: "not-found" };
  }

  const row = await prisma.invoice.findFirst({
    where: {
      number: { equals: number, mode: "insensitive" },
      verifyCode: code,
    },
    include: { client: { select: { name: true } } },
  });

  // Fire-and-forget audit. A logging failure must never be the reason a client
  // cannot check their own quote.
  void prisma.documentVerification
    .create({
      data: {
        number,
        found: !!row,
        invoiceId: row?.id,
        ip: meta?.ip ?? undefined,
        userAgent: meta?.userAgent ?? undefined,
      },
    })
    .catch(() => {});

  if (!row) return { ok: false, reason: "not-found" };

  const [statusLabel, statusNote] =
    STATUS_LABELS[row.status] ?? ["Issued", "This document has been issued."];

  const expired =
    row.docType === "QUOTE" &&
    !!row.validUntil &&
    row.validUntil.getTime() < Date.now();

  return {
    ok: true,
    document: {
      number: row.number,
      docType: row.docType,
      typeLabel: row.docType === "QUOTE" ? "Quote" : "Invoice",
      subject: row.subject,
      clientName: row.client?.name ?? null,
      issueDate: row.issueDate.toISOString(),
      validUntil: row.validUntil ? row.validUntil.toISOString() : null,
      expired,
      status: row.status,
      statusLabel,
      statusNote,
      issuer: "UnicomTeam",
    },
  };
}
