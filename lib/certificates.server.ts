// lib/certificates.server.ts
//
// Turns a certificate (a saved row, or the admin form before saving) into the
// PDF. Everything that is not typed by the admin is decided here: the wording
// comes from the type, the QR from the certificate number, and the signature,
// stamp and logo from the private/ and public/ folders.

import React from "react";
import { createHmac, timingSafeEqual } from "node:crypto";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { readLogo, readSignature, readStamp } from "@/lib/documents";
import { certificateVerifyLink } from "@/lib/qr";
import { sendCertificateEmail } from "@/lib/emailjs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, bucketNameFor } from "@/lib/r2";
import {
  CertificateDocument,
  type CertificateKind,
  type CertificatePayload,
} from "@/components/pdf/CertificateDocument";

export const CERT_KIND: Record<string, CertificateKind> = {
  INTERNSHIP: "internship",
  TRAINING: "training",
  CRASH_COURSE: "crash-course",
};

/** Number prefix per type: UCT-INT-…, UCT-TRN-…, UCT-CRC-… */
export const CERT_PREFIX = {
  INTERNSHIP: "INT",
  TRAINING: "TRN",
  CRASH_COURSE: "CRC",
} as const;

/**
 * The handwritten signature in private/signature.png is Obed Bolak Fuchu's.
 * It is printed only when he is the signing supervisor; for anyone else the
 * line is left blank to be signed by hand, rather than putting his signature
 * above someone else's name.
 */
const SIGNATURE_OWNER = /\bobed\b/i;

export type CertificateInput = {
  certNo: string;
  name: string;
  type: string; // INTERNSHIP | TRAINING | CRASH_COURSE
  program: string;
  department: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  dateIssued: Date | string;
  supervisorName: string;
  supervisorTitle: string;
  status?: string; // VALID | REVOKED
};

const iso = (d: Date | string) =>
  (d instanceof Date ? d : new Date(d)).toISOString();

export async function certificatePayload(
  c: CertificateInput,
  mode: "issued" | "preview" = "issued",
): Promise<CertificatePayload> {
  const settings = await getSettings();
  const host = settings.companyWebsite
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const signs = SIGNATURE_OWNER.test(c.supervisorName);

  return {
    certNo: c.certNo,
    name: c.name,
    type: CERT_KIND[c.type] ?? "training",
    program: c.program,
    department: c.department,
    periodStart: iso(c.periodStart),
    periodEnd: iso(c.periodEnd),
    dateIssued: iso(c.dateIssued),
    supervisor: c.supervisorName,
    supervisorTitle: c.supervisorTitle,
    verifyLink: certificateVerifyLink(settings.companyWebsite, c.certNo),
    verifyUrl: `${host}/verify`,
    logo: readLogo(),
    signature: signs ? readSignature() : null,
    stamp: readStamp(),
    mode:
      mode === "preview"
        ? "preview"
        : c.status === "REVOKED"
          ? "revoked"
          : "issued",
  };
}

export async function renderCertificate(
  payload: CertificatePayload,
): Promise<Buffer> {
  return renderToBuffer(
    React.createElement(CertificateDocument, { c: payload }) as any,
  );
}

export async function loadCertificateInput(
  id: string,
): Promise<CertificateInput | null> {
  const row = await prisma.certificate.findUnique({ where: { id } });
  if (!row) return null;
  return {
    certNo: row.certNo,
    name: row.name,
    type: row.type,
    program: row.program,
    department: row.department,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    dateIssued: row.dateIssued,
    supervisorName: row.supervisorName,
    supervisorTitle: row.supervisorTitle,
    status: row.status,
  };
}

/** "UCT-INT-2026-0012-Ngwa-Brenda-Achaleke.pdf" — safe in any downloads folder. */
export function certificateFilename(certNo: string, name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${certNo}${slug ? `-${slug}` : ""}.pdf`;
}

export function pdfResponse(pdf: Buffer, filename: string, download: boolean) {
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.length),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

/* ── Private download link (for emailing the holder) ─────────────────────
 * The PDF route is admin-only. The link we email carries a signature made
 * from the certificate's id and the server's secret: it opens that one
 * certificate and nothing else, and it can't be guessed or edited into
 * someone else's. */

function linkSecret(): string {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";
}

export function certificateToken(id: string): string | null {
  const secret = linkSecret();
  if (!secret) return null;
  return createHmac("sha256", secret)
    .update(`certificate-download:${id}`)
    .digest("base64url")
    .slice(0, 32);
}

export function checkCertificateToken(id: string, token: string): boolean {
  const expected = certificateToken(id);
  if (!expected || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

function siteOrigin(website: string) {
  return `https://${website
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")}`;
}

const TYPE_TITLE: Record<string, string> = {
  INTERNSHIP: "Certificate of Internship",
  TRAINING: "Certificate of Training",
  CRASH_COURSE: "Certificate of Completion",
};

/** Emails the holder a link to download their certificate. Throws on failure. */
export async function emailCertificateTo(
  id: string,
  to: string,
): Promise<void> {
  const row = await prisma.certificate.findUnique({ where: { id } });
  if (!row) throw new Error("Certificate not found");
  const token = certificateToken(id);
  if (!token)
    throw new Error(
      "NEXTAUTH_SECRET is not set, so no safe download link can be made",
    );

  const settings = await getSettings();
  const origin = siteOrigin(settings.companyWebsite);
  await sendCertificateEmail({
    to,
    name: row.name,
    certNo: row.certNo,
    title: TYPE_TITLE[row.type] ?? "Certificate",
    program: row.program,
    downloadUrl: `${origin}/api/certificates/${id}/pdf?download=1&t=${token}`,
    verifyUrl: certificateVerifyLink(settings.companyWebsite, row.certNo),
  });
}

/* ── Saved copy ──────────────────────────────────────────────────────────
 * The PDF from View/Download is always drawn fresh from the database, so it
 * follows the current design. Alongside that, each certificate keeps the
 * exact PDF as it was when issued (and after each edit), in the PRIVATE
 * bucket: a permanent record of what the holder was given. Never fatal —
 * if storage isn't configured or is down, issuing still succeeds. */
export async function saveCertificateCopy(
  id: string,
  uploadedById?: string,
): Promise<boolean> {
  if (!process.env.R2_BUCKET_PRIVATE || !process.env.R2_ACCOUNT_ID)
    return false;
  try {
    const input = await loadCertificateInput(id);
    if (!input) return false;
    const pdf = await renderCertificate(await certificatePayload(input));

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = certificateFilename(input.certNo, input.name);
    const key = `certificates/${input.certNo}/${stamp}-${crypto.randomUUID()}.pdf`;
    const bucket = bucketNameFor("certificates");

    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: pdf,
        ContentType: "application/pdf",
        ContentDisposition: `attachment; filename="${filename}"`,
      }),
    );

    const upload = await prisma.upload.create({
      data: {
        key,
        bucket,
        category: "certificates",
        visibility: "private",
        filename,
        contentType: "application/pdf",
        size: pdf.length,
        confirmed: true,
        uploadedById: uploadedById ?? null,
      },
    });
    await prisma.certificate.update({
      where: { id },
      data: { fileId: upload.id },
    });
    return true;
  } catch (err) {
    console.error(`[certificates] could not save a copy of ${id}:`, err);
    return false;
  }
}
