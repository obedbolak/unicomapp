"use server";

// app/admin/certificate-actions.ts
//
// Issuing certificates for a whole group at once, and (re)sending a
// certificate to its holder by email.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { nextCertificateNumber } from "@/lib/reference";
import { eligibleEnrollmentsByIds } from "@/lib/certificate-enrollments";
import {
  CERT_PREFIX,
  emailCertificateTo,
  saveCertificateCopy,
} from "@/lib/certificates.server";

async function log(
  userId: string,
  action: string,
  entityId: string,
  meta?: Record<string, unknown>,
) {
  await prisma.activityLog
    .create({
      data: {
        userId,
        action,
        entity: "Certificate",
        entityId,
        meta: meta as any,
      },
    })
    .catch(() => {});
}

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

/**
 * Issues one certificate per ticked enrollment. Details are re-read from the
 * database, not taken from the page. Enrollments without dates (no cohort)
 * are skipped and reported, so nobody gets a certificate with a blank period.
 */
export async function issueCertificatesBulk(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const ids = formData.getAll("enrollmentIds").map(String).filter(Boolean);
  const fallbackDepartment = text(formData, "department");
  const dateIssued = new Date(
    text(formData, "dateIssued") || new Date().toISOString().slice(0, 10),
  );
  const supervisorName = text(formData, "supervisorName") || "Obed Bolak Fuchu";
  const supervisorTitle =
    text(formData, "supervisorTitle") || "CEO & Internship Supervisor";
  const sendEmail = formData.get("sendEmail") === "on";

  const people = await eligibleEnrollmentsByIds(ids);
  let issued = 0;
  let emailed = 0;
  let emailFailed = 0;
  const skipped: string[] = [];

  for (const p of people) {
    const department = p.department || fallbackDepartment;
    if (!p.periodStart || !p.periodEnd || !department) {
      skipped.push(p.name);
      continue;
    }

    const certNo = await nextCertificateNumber(CERT_PREFIX[p.type]);
    const cert = await prisma.certificate.create({
      data: {
        certNo,
        type: p.type,
        name: p.name,
        program: p.program,
        department,
        periodStart: new Date(p.periodStart),
        periodEnd: new Date(p.periodEnd),
        dateIssued,
        supervisorName,
        supervisorTitle,
        supervisorId: admin.id,
        enrollmentId: p.id,
        studentId: p.studentId ?? undefined,
      },
    });
    issued++;
    await log(admin.id, "certificate.issued", cert.id, { certNo, bulk: true });
    await saveCertificateCopy(cert.id, admin.id);
    revalidatePath(`/verify/${certNo}`);

    if (sendEmail && p.email) {
      try {
        await emailCertificateTo(cert.id, p.email);
        emailed++;
        await log(admin.id, "certificate.emailed", cert.id, {
          certNo,
          to: p.email,
        });
      } catch (err) {
        console.error(`[certificates] email for ${certNo} failed:`, err);
        emailFailed++;
      }
    }
  }

  revalidatePath("/admin/certificates");
  const q = new URLSearchParams({
    bulk: String(issued),
    emailed: String(emailed),
    emailFailed: String(emailFailed),
  });
  if (skipped.length) q.set("skipped", skipped.join(", "));
  redirect(`/admin/certificates?${q.toString()}`);
}

/** "Email" on a certificate row: sends the holder their download link again. */
export async function resendCertificateEmail(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = text(formData, "id");
  const cert = await prisma.certificate.findUnique({
    where: { id },
    select: {
      certNo: true,
      enrollment: { select: { email: true } },
      student: { select: { email: true } },
    },
  });
  const to = cert?.enrollment?.email || cert?.student?.email;
  if (!cert || !to) redirect("/admin/certificates?resent=noemail");

  let ok = true;
  try {
    await emailCertificateTo(id, to);
    await log(admin.id, "certificate.emailed", id, { certNo: cert.certNo, to });
  } catch (err) {
    console.error(`[certificates] resend for ${cert.certNo} failed:`, err);
    ok = false;
  }
  redirect(
    `/admin/certificates?resent=${ok ? "sent" : "failed"}&cert=${encodeURIComponent(cert.certNo)}`,
  );
}

/**
 * Saves corrections to an issued certificate. The number and type never
 * change (see the edit page). What changed is written to the activity log,
 * so there's a record of who altered a certificate and from what.
 */
export async function updateCertificate(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = text(formData, "id");
  const before = await prisma.certificate.findUnique({ where: { id } });
  if (!before) redirect("/admin/certificates");

  const next = {
    name: text(formData, "name"),
    program: text(formData, "program"),
    department: text(formData, "department"),
    periodStart: new Date(text(formData, "periodStart")),
    periodEnd: new Date(text(formData, "periodEnd")),
    dateIssued: new Date(text(formData, "dateIssued")),
    supervisorName: text(formData, "supervisorName"),
    supervisorTitle: text(formData, "supervisorTitle"),
  };

  const invalidDate = [next.periodStart, next.periodEnd, next.dateIssued].some(
    (d) => Number.isNaN(d.getTime()),
  );
  if (
    !next.name ||
    !next.program ||
    !next.department ||
    !next.supervisorName ||
    invalidDate ||
    next.periodEnd < next.periodStart
  ) {
    redirect(
      `/admin/certificates?edited=invalid&cert=${encodeURIComponent(before.certNo)}`,
    );
  }

  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(next) as (keyof typeof next)[]) {
    const a = before[key];
    const b = next[key];
    const same =
      a instanceof Date && b instanceof Date
        ? a.getTime() === b.getTime()
        : a === b;
    if (!same) changes[key] = { from: a, to: b };
  }

  if (Object.keys(changes).length) {
    await prisma.certificate.update({ where: { id }, data: next });
    await log(admin.id, "certificate.edited", id, {
      certNo: before.certNo,
      changes,
    });
    await saveCertificateCopy(id, admin.id);
  }

  revalidatePath("/admin/certificates");
  revalidatePath(`/verify/${before.certNo}`);
  redirect(
    `/admin/certificates?edited=${Object.keys(changes).length ? "saved" : "unchanged"}&cert=${encodeURIComponent(before.certNo)}`,
  );
}
