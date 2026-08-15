// lib/reference.ts
// Human-readable, sequential reference numbers: UCT-ENR-2026-0001.

import { prisma } from "@/lib/prisma";

type Kind = "ENR" | "INV" | "INT" | "TRN" | "CRC";

function pad(n: number) {
  return String(n).padStart(4, "0");
}

async function nextSequence(prefix: string, count: number) {
  return `${prefix}-${pad(count + 1)}`;
}

/** UCT-ENR-2026-0001 */
export async function nextEnrollmentReference(date = new Date()) {
  const year = date.getFullYear();
  const prefix = `UCT-ENR-${year}`;
  const count = await prisma.enrollment.count({
    where: { reference: { startsWith: prefix } },
  });
  return nextSequence(prefix, count);
}

/** UCT-INV-2026-0001 — base prefix comes from Settings → invoicePrefix. */
export async function nextInvoiceNumber(
  basePrefix = "UCT-INV",
  date = new Date(),
) {
  const year = date.getFullYear();
  const prefix = `${basePrefix}-${year}`;
  const count = await prisma.invoice.count({
    where: { number: { startsWith: prefix } },
  });
  return nextSequence(prefix, count);
}

/** UCT-INT-2026-0015 — kind matches the certificate type. */
export async function nextCertificateNumber(
  kind: Kind = "INT",
  date = new Date(),
) {
  const year = date.getFullYear();
  const prefix = `UCT-${kind}-${year}`;
  const count = await prisma.certificate.count({
    where: { certNo: { startsWith: prefix } },
  });
  return nextSequence(prefix, count);
}

/** "From 75,000 FCFA" → 75000. Returns null when there's no number. */
export function parseAmount(label?: string | null): number | null {
  if (!label) return null;
  const digits = label.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}
