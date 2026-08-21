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
  ProjectCategory,
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

const CATEGORIES: ProjectCategory[] = [
  "SOFTWARE_DEVELOPMENT",
  "MOBILE_WEB_APP",
  "DIGITAL_MARKETING",
  "SOCIAL_MEDIA",
  "BUSINESS_STRATEGY",
];

const PROJECT_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "DELIVERED",
  "MAINTENANCE",
  "ON_HOLD",
  "CANCELLED",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Slugs are unique and also the public URL, so a clash cannot be allowed to
 * throw a raw constraint error at someone typing a project title. Suffix until
 * it is free, skipping the row we are editing.
 */
async function uniqueSlug(base: string, exceptId?: string): Promise<string> {
  const root = slugify(base) || "project";
  let candidate = root;
  let n = 2;

  for (;;) {
    const clash = await prisma.project.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!clash || clash.id === exceptId) return candidate;
    candidate = `${root}-${n}`;
    n += 1;
  }
}

/** Empty string from a form input means "not set", not an empty date. */
function optionalDate(value: FormDataEntryValue | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function tagList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);
}

/** Everything the create and edit forms have in common. */
function readProjectFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const categoryRaw = String(formData.get("category") ?? "");
  const statusRaw = String(formData.get("status") ?? "");

  return {
    title,
    description,
    longDescription:
      String(formData.get("longDescription") ?? "").trim() || null,
    category: CATEGORIES.includes(categoryRaw as ProjectCategory)
      ? (categoryRaw as ProjectCategory)
      : "SOFTWARE_DEVELOPMENT",
    status: PROJECT_STATUSES.includes(statusRaw as ProjectStatus)
      ? (statusRaw as ProjectStatus)
      : "PLANNING",
    tags: tagList(formData.get("tags")),
    liveUrl: String(formData.get("liveUrl") ?? "").trim() || null,
    repoUrl: String(formData.get("repoUrl") ?? "").trim() || null,
    coverImage: String(formData.get("coverImage") ?? "").trim() || null,
    clientId: String(formData.get("clientId") ?? "").trim() || null,
    leadId: String(formData.get("leadId") ?? "").trim() || null,
    budget: optionalNumber(formData.get("budget")),
    currency: String(formData.get("currency") ?? "XAF").trim() || "XAF",
    startDate: optionalDate(formData.get("startDate")),
    dueDate: optionalDate(formData.get("dueDate")),
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
  };
}

export async function createProject(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const fields = readProjectFields(formData);

  if (!fields.title) throw new Error("A title is required");
  if (!fields.description) {
    throw new Error("A short description is required — it's the card blurb");
  }

  const project = await prisma.project.create({
    data: {
      ...fields,
      slug: await uniqueSlug(fields.title),
      // A project created straight into DELIVERED still gets a delivery date,
      // so the timeline is never blank for a finished job.
      deliveredAt: fields.status === "DELIVERED" ? new Date() : null,
    },
    select: { id: true, title: true },
  });

  await log(admin.id, "project.created", "Project", project.id, {
    title: project.title,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/projects");
}

/**
 * Full edit from the manage panel.
 *
 * Status is handled here too, which means moving a project to DELIVERED from
 * this form credits shares exactly as the row dropdown does — one behaviour, so
 * where you happen to change it from cannot matter.
 */
export async function updateProject(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const fields = readProjectFields(formData);

  if (!id) throw new Error("No project given");
  if (!fields.title) throw new Error("A title is required");
  if (!fields.description) throw new Error("A short description is required");

  const current = await prisma.project.findUnique({
    where: { id },
    select: { status: true, title: true, deliveredAt: true },
  });
  if (!current) throw new Error("No such project");

  const nowDelivered =
    fields.status === "DELIVERED" && current.status !== "DELIVERED";

  await prisma.project.update({
    where: { id },
    data: {
      ...fields,
      // Retitling changes the public URL. That is the intent — the slug is
      // derived from the title — but it must stay unique.
      slug: await uniqueSlug(fields.title, id),
      deliveredAt: nowDelivered
        ? new Date()
        : fields.status === "DELIVERED"
          ? current.deliveredAt
          : null,
    },
  });

  await log(admin.id, "project.updated", "Project", id, {
    title: fields.title,
    status: fields.status,
  });

  if (nowDelivered) {
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
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

/**
 * Permanent delete. Refused once money is attached: earnings and invoices are
 * financial history, and cascading them away to tidy a list is not a trade
 * worth offering. Cancelling is the right answer there.
 */
export async function deleteProject(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));

  const [earnings, invoices, project] = await Promise.all([
    prisma.earning.count({ where: { projectId: id } }),
    prisma.invoice.count({ where: { projectId: id } }),
    prisma.project.findUnique({ where: { id }, select: { title: true } }),
  ]);

  if (!project) throw new Error("No such project");

  if (earnings > 0 || invoices > 0) {
    throw new Error(
      `${project.title} has ${earnings} earning(s) and ${invoices} invoice(s) attached. Set it to Cancelled instead — deleting would erase that history.`,
    );
  }

  await prisma.project.delete({ where: { id } });
  await log(admin.id, "project.deleted", "Project", id, {
    title: project.title,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/projects");
}

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
