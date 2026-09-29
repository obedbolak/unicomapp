// lib/certificates.server.ts
//
// Turns a certificate (a saved row, or the admin form before saving) into the
// PDF. Everything that is not typed by the admin is decided here: the wording
// comes from the type, the QR from the certificate number, and the signature,
// stamp and logo from the private/ and public/ folders.

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { readLogo, readSignature, readStamp } from "@/lib/documents";
import { certificateVerifyLink } from "@/lib/qr";
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
  const host = settings.companyWebsite.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
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
    mode: mode === "preview" ? "preview" : c.status === "REVOKED" ? "revoked" : "issued",
  };
}

export async function renderCertificate(payload: CertificatePayload): Promise<Buffer> {
  return renderToBuffer(
    React.createElement(CertificateDocument, { c: payload }) as any,
  );
}

export async function loadCertificateInput(id: string): Promise<CertificateInput | null> {
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
