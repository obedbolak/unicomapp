// lib/certificates.ts
// Now DB-backed. The exported shape is unchanged, so app/verify/* keeps working —
// but findCertificate is async, so callers must await it (the verify pages already do).

import { prisma } from "@/lib/prisma";

export type CertificateType = "internship" | "training" | "crash-course";
export type CertificateStatus = "valid" | "revoked";

export interface Certificate {
  certNo: string;
  name: string;
  type: CertificateType;
  program: string; // e.g. "Full Stack Development Internship"
  department: string;
  periodStart: string; // ISO date, e.g. "2026-04-12"
  periodEnd: string;
  dateIssued: string;
  status: CertificateStatus;
  supervisor: string;
  supervisorTitle: string;
}

const TYPE_TO_UI: Record<string, CertificateType> = {
  INTERNSHIP: "internship",
  TRAINING: "training",
  CRASH_COURSE: "crash-course",
};

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toUi(row: {
  certNo: string;
  name: string;
  type: string;
  program: string;
  department: string;
  periodStart: Date;
  periodEnd: Date;
  dateIssued: Date;
  status: string;
  supervisorName: string;
  supervisorTitle: string;
}): Certificate {
  return {
    certNo: row.certNo,
    name: row.name,
    type: TYPE_TO_UI[row.type] ?? "training",
    program: row.program,
    department: row.department,
    periodStart: toIso(row.periodStart),
    periodEnd: toIso(row.periodEnd),
    dateIssued: toIso(row.dateIssued),
    status: row.status === "REVOKED" ? "revoked" : "valid",
    supervisor: row.supervisorName,
    supervisorTitle: row.supervisorTitle,
  };
}

/**
 * Look up a certificate by number. Case-insensitive, whitespace-tolerant.
 * Every lookup is recorded in certificate_verifications so you can see
 * which certificates employers are actually checking.
 */
export async function findCertificate(
  certNo: string,
  meta?: { ip?: string | null; userAgent?: string | null },
): Promise<Certificate | null> {
  const normalized = certNo.trim().toUpperCase();
  if (!normalized) return null;

  const row = await prisma.certificate.findFirst({
    where: { certNo: { equals: normalized, mode: "insensitive" } },
  });

  // Fire-and-forget audit — never let logging break the page
  void prisma.certificateVerification
    .create({
      data: {
        certNo: normalized,
        found: !!row,
        certificateId: row?.id,
        ip: meta?.ip ?? undefined,
        userAgent: meta?.userAgent ?? undefined,
      },
    })
    .catch(() => {});

  return row ? toUi(row) : null;
}

/** All certificates, newest first — used by the admin dashboard. */
export async function listCertificates(): Promise<Certificate[]> {
  const rows = await prisma.certificate.findMany({
    orderBy: { dateIssued: "desc" },
  });
  return rows.map(toUi);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
