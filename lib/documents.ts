// lib/documents.ts
//
// The shape of a printed document, and the formatting rules that go with it.
//
// This module deliberately imports nothing from Prisma. The PDF template
// depends on it, and keeping it database-free means the template is a pure
// function of plain JSON: renderable from a route, from a background job that
// e-mails a quote, or from a script — and testable with a fixture instead of a
// database. Loading a real document lives next door in documents.server.ts.

import fs from "node:fs";
import path from "node:path";

/* ── Shape handed to the template ────────────────────────────────────────── */

export type DocLine = {
  id: string;
  /** Left column: "UI/UX Design". */
  label: string;
  /** Middle column: "Wireframes, visual identity, design system". */
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type DocSection = {
  id: string;
  title: string;
  subtitle: string | null;
  items: DocLine[];
  total: number;
};

export type DocInstallment = {
  id: string;
  label: string;
  trigger: string;
  amount: number;
  status: string;
  dueDate: string | null;
};

export type DocumentPayload = {
  docType: "QUOTE" | "INVOICE";
  number: string;
  status: string;
  title: string;
  subject: string | null;
  scope: string | null;
  budgetLabel: string | null;

  currency: string;
  issueDate: string;
  dueDate: string | null;
  validUntil: string | null;

  clientName: string | null;
  clientEmail: string | null;
  projectTitle: string | null;

  sections: DocSection[];
  /** Items belonging to no section — printed only in the financial summary. */
  extras: DocLine[];
  /** True when every item sits in a section, i.e. the document is phased. */
  phased: boolean;

  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;

  installments: DocInstallment[];
  terms: string[];
  notes: string | null;

  company: {
    name: string;
    subname: string;
    tagline: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    logo: string | null;
  };

  signatures: {
    clientLabel: string;
    clientName: string | null;
    issuerLabel: string;
    issuerName: string;
    issuerRole: string;
    date: string;
  };
};

/* ── Formatting ──────────────────────────────────────────────────────────── */

/** 35000 → "35,000". Table columns are headed "Amount (FCFA)", so the unit is
 *  stated once in the header rather than repeated on every row. */
export function num(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** 750000, "XAF" → "750,000 FCFA" */
export function amountWithUnit(n: number, currency: string): string {
  return `${num(n)} ${currencyLabel(currency)}`;
}

export function currencyLabel(currency: string): string {
  return currency === "XAF" ? "FCFA" : currency;
}

/** "03 September 2026" — the long form the printed document uses. */
export function longDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** "1st", "2nd", "3rd", "4th" … for auto-generated installment labels. */
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/* ── Assets ──────────────────────────────────────────────────────────────── */

/**
 * The letterhead logo, inlined as a data URI.
 *
 * react-pdf can fetch a remote image, but that would put a network round-trip
 * (and a failure mode) in the middle of rendering a document. Reading the file
 * that already ships in /public is synchronous, local, and cannot half-fail.
 * Cached because the file never changes between deploys.
 */
let logoCache: string | null | undefined;

export function readLogo(): string | null {
  if (logoCache !== undefined) return logoCache;

  const candidates = [
    "public/images/logo.png",
    "public/logo.png",
    "public/images/logo.jpg",
  ];

  for (const rel of candidates) {
    const file = path.join(process.cwd(), rel);
    try {
      if (!fs.existsSync(file)) continue;
      const ext = path.extname(file).toLowerCase();
      const mime = ext === ".png" ? "image/png" : "image/jpeg";
      logoCache = `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
      return logoCache;
    } catch {
      // A missing or unreadable logo is a cosmetic problem, never a reason to
      // fail the document. Fall through and print the company name instead.
    }
  }

  logoCache = null;
  return logoCache;
}

/**
 * The filename the browser saves. Uses the document number, which is unique
 * and already human-readable — "UCT-QTE-2026-0001.pdf" beats "invoice.pdf" in
 * a client's downloads folder.
 */
export function documentFilename(doc: DocumentPayload): string {
  return `${doc.number}.pdf`;
}
