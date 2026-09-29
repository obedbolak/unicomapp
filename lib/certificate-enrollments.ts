// lib/certificate-enrollments.ts
//
// Turns an enrollment into the details a certificate needs, so neither the
// single "Issue a certificate" form nor "Issue for a group" makes the admin
// retype what the applicant already told us.

import { prisma } from "@/lib/prisma";
import type { EnrollmentStatus } from "@prisma/client";

export type EnrollmentCert = {
  id: string;
  label: string;
  name: string;
  email: string;
  studentId: string | null;
  type: "INTERNSHIP" | "TRAINING";
  program: string;
  department: string | null;
  periodStart: string | null; // yyyy-mm-dd
  periodEnd: string | null;
};

/** Finished or running — and (in the queries) no certificate yet. */
const ELIGIBLE_STATUSES: EnrollmentStatus[] = [
  "ACTIVE",
  "COMPLETED",
  "ENROLLED",
];

const SELECT = {
  id: true,
  fullName: true,
  email: true,
  studentId: true,
  courseName: true,
  type: true,
  category: true,
  months: true,
  program: { select: { title: true } },
  cohort: { select: { startDate: true, endDate: true } },
} as const;

type Row = {
  id: string;
  fullName: string;
  email: string;
  studentId: string | null;
  courseName: string;
  type: "INTERNSHIP" | "TRAINING";
  category: string | null;
  months: number | null;
  program: { title: string } | null;
  cohort: { startDate: Date | null; endDate: Date | null } | null;
};

const ymd = (d: Date) => d.toISOString().slice(0, 10);

function toCert(e: Row): EnrollmentCert {
  // End date: the cohort's, or else the start plus the months applied for.
  const start = e.cohort?.startDate ?? null;
  let end = e.cohort?.endDate ?? null;
  if (!end && start && e.months) {
    end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + e.months);
    end.setUTCDate(end.getUTCDate() - 1);
  }
  return {
    id: e.id,
    label: `${e.fullName} — ${e.courseName}`,
    name: e.fullName,
    email: e.email,
    studentId: e.studentId,
    type: e.type,
    program: e.program?.title ?? e.courseName,
    department: e.category ?? null,
    periodStart: start ? ymd(start) : null,
    periodEnd: end ? ymd(end) : null,
  };
}

export async function eligibleEnrollments(): Promise<EnrollmentCert[]> {
  const rows = await prisma.enrollment.findMany({
    where: { status: { in: ELIGIBLE_STATUSES }, certificate: null },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: SELECT,
  });
  return (rows as Row[]).map(toCert);
}

/** The chosen ones, re-read from the database (never trust the browser's copy). */
export async function eligibleEnrollmentsByIds(
  ids: string[],
): Promise<EnrollmentCert[]> {
  if (!ids.length) return [];
  const rows = await prisma.enrollment.findMany({
    where: {
      id: { in: ids },
      status: { in: ELIGIBLE_STATUSES },
      certificate: null,
    },
    orderBy: { fullName: "asc" },
    select: SELECT,
  });
  return (rows as Row[]).map(toCert);
}
