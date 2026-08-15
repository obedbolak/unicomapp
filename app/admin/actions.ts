"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { nextCertificateNumber } from "@/lib/reference";
import { creditProjectShares } from "@/lib/wallet";
import type {
  CertificateType,
  EnrollmentStatus,
  PaymentStatus,
  ProjectStatus,
} from "@prisma/client";

async function log(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  meta?: Record<string, unknown>,
) {
  await prisma.activityLog
    .create({ data: { userId, action, entity, entityId, meta: meta as any } })
    .catch(() => {});
}

/* ── Enrollments ─────────────────────────────────────────────────────────── */

export async function updateEnrollmentStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as EnrollmentStatus;

  await prisma.enrollment.update({ where: { id }, data: { status } });
  await log(admin.id, "enrollment.status_changed", "Enrollment", id, { status });

  revalidatePath("/admin/enrollments");
  revalidatePath("/admin");
}

export async function saveEnrollmentNote(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const adminNotes = String(formData.get("adminNotes") ?? "").slice(0, 2000);

  await prisma.enrollment.update({ where: { id }, data: { adminNotes } });
  revalidatePath("/admin/enrollments");
}

/* ── Payments ────────────────────────────────────────────────────────────── */

export async function updatePaymentStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as PaymentStatus;

  await prisma.payment.update({
    where: { id },
    data: {
      status,
      confirmedAt: status === "CONFIRMED" ? new Date() : null,
      confirmedById: status === "CONFIRMED" ? admin.id : null,
      paidAt: status === "CONFIRMED" ? new Date() : null,
    },
  });
  await log(admin.id, "payment.status_changed", "Payment", id, { status });

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

export async function recordPayment(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const enrollmentId = String(formData.get("enrollmentId"));
  const amount = Number(formData.get("amount"));
  if (!enrollmentId || !amount || Number.isNaN(amount)) {
    throw new Error("An enrollment and a valid amount are required");
  }

  const payment = await prisma.payment.create({
    data: {
      enrollmentId,
      amount,
      currency: "XAF",
      method: (formData.get("method") as any) ?? "MOMO",
      kind: (formData.get("kind") as any) ?? "TUITION",
      status: "CONFIRMED",
      momoNumber: (formData.get("momoNumber") as string) || null,
      note: (formData.get("note") as string) || null,
      paidAt: new Date(),
      confirmedAt: new Date(),
      confirmedById: admin.id,
    },
  });

  await log(admin.id, "payment.recorded", "Payment", payment.id, { amount });

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

/* ── Certificates ────────────────────────────────────────────────────────── */

const KIND_BY_TYPE = {
  INTERNSHIP: "INT",
  TRAINING: "TRN",
  CRASH_COURSE: "CRC",
} as const;

export async function issueCertificate(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const type = String(formData.get("type") || "INTERNSHIP") as CertificateType;
  const certNo =
    (formData.get("certNo") as string)?.trim().toUpperCase() ||
    (await nextCertificateNumber(KIND_BY_TYPE[type]));

  const enrollmentId = (formData.get("enrollmentId") as string) || null;

  const certificate = await prisma.certificate.create({
    data: {
      certNo,
      type,
      name: String(formData.get("name")).trim(),
      program: String(formData.get("program")).trim(),
      department: String(formData.get("department")).trim(),
      periodStart: new Date(String(formData.get("periodStart"))),
      periodEnd: new Date(String(formData.get("periodEnd"))),
      dateIssued: new Date(
        String(formData.get("dateIssued") || new Date().toISOString()),
      ),
      supervisorName: String(
        formData.get("supervisorName") || "Obed Bolak F.",
      ).trim(),
      supervisorTitle: String(
        formData.get("supervisorTitle") || "CEO & Internship Supervisor",
      ).trim(),
      supervisorId: admin.id,
      enrollmentId: enrollmentId || undefined,
    },
  });

  await log(admin.id, "certificate.issued", "Certificate", certificate.id, {
    certNo,
  });

  revalidatePath("/admin/certificates");
  revalidatePath(`/verify/${certNo}`);
}

export async function setCertificateStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const revoke = String(formData.get("status")) === "REVOKED";

  const cert = await prisma.certificate.update({
    where: { id },
    data: {
      status: revoke ? "REVOKED" : "VALID",
      revokedAt: revoke ? new Date() : null,
      revokedReason: revoke
        ? (formData.get("reason") as string) || "Revoked by admin"
        : null,
    },
  });

  await log(admin.id, "certificate.status_changed", "Certificate", id, {
    status: cert.status,
  });

  revalidatePath("/admin/certificates");
  revalidatePath(`/verify/${cert.certNo}`);
}

/* ── Projects ────────────────────────────────────────────────────────────── */

export async function updateProjectStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ProjectStatus;

  await prisma.project.update({
    where: { id },
    data: {
      status,
      deliveredAt: status === "DELIVERED" ? new Date() : undefined,
    },
  });
  await log(admin.id, "project.status_changed", "Project", id, { status });

  // Delivery is the moment revenue shares are earned. creditProjectShares is
  // idempotent, so toggling a project in and out of DELIVERED cannot pay
  // anyone twice.
  if (status === "DELIVERED") {
    const { created, skipped } = await creditProjectShares(id, admin.id);
    if (created > 0) {
      console.log(`[wallet] credited ${created} share(s) for project ${id}`);
    }
    if (skipped.length > 0) {
      console.log(`[wallet] project ${id}: ${skipped.join("; ")}`);
    }
  }

  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/admin/wallet");
  revalidatePath("/dashboard");
}

export async function toggleProjectPublished(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const current = await prisma.project.findUnique({
    where: { id },
    select: { published: true },
  });
  if (!current) return;

  await prisma.project.update({
    where: { id },
    data: { published: !current.published },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

/* ── Tasks (staff dashboard) ─────────────────────────────────────────────── */

export async function updateTaskStatus(formData: FormData) {
  const user = await requireUser();
  if (!user) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as
    | "TODO"
    | "IN_PROGRESS"
    | "BLOCKED"
    | "DONE";

  const task = await prisma.task.findUnique({
    where: { id },
    select: { assigneeId: true },
  });
  const admin = user.role?.includes("ADMIN");
  if (!task || (task.assigneeId !== user.id && !admin)) {
    throw new Error("Not authorized");
  }

  await prisma.task.update({
    where: { id },
    data: {
      status,
      completedAt: status === "DONE" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}
