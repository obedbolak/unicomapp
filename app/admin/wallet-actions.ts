"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getWallet } from "@/lib/wallet";
import { distributeDividend, getCapTable } from "@/lib/shares";

/* ── Assignments (admin) ─────────────────────────────────────────────────── */

/**
 * Put someone on a project, or change their role.
 *
 * Assignment carries no money. Company equity is a separate concern and is
 * managed on /admin/wallet — see setHolding below. sharePct is written as null
 * here so a project can never quietly credit a revenue share on delivery.
 */
export async function assignToProject(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const projectId = String(formData.get("projectId"));
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role") ?? "").trim() || null;

  if (!projectId || !userId) throw new Error("Project and person are required");

  await prisma.projectAssignment.upsert({
    where: { projectId_userId: { projectId, userId } },
    create: { projectId, userId, role, sharePct: null },
    update: { role, sharePct: null },
  });

  await logActivity(admin.id, "project.assigned", "Project", projectId, {
    userId,
    role,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/dashboard");
}

export async function removeAssignment(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("assignmentId"));
  const assignment = await prisma.projectAssignment.delete({ where: { id } });

  await logActivity(
    admin.id,
    "project.unassigned",
    "Project",
    assignment.projectId,
    { userId: assignment.userId },
  );

  revalidatePath("/admin/projects");
  revalidatePath("/dashboard");
}

/* ── Fixed-pay claims ────────────────────────────────────────────────────── */
//
// A flat amount someone is owed, either for one project or for one month.
// Submitted by the person, worth nothing until an admin approves it: claims sit
// at PENDING, and getWallet only ever sums CREDITED rows, so an unapproved
// claim cannot be requested as a payout.

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** "2026-08" for the month we are currently in, in the server's timezone. */
function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Submit, or revise, a claim.
 *
 * There is at most one claim per person per project, and one per person per
 * month — enforced in the schema. Resubmitting revises that row instead of
 * stacking a second one, which is what lets somebody fix and resend a claim an
 * admin rejected. An already-approved claim is closed: it is real money in a
 * ledger by then, and editing it after the fact would rewrite history.
 */
export async function submitClaim(formData: FormData) {
  const user = await requireUser();
  if (!user) throw new Error("Not authorized");

  const kind = String(formData.get("kind"));
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!amount || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Enter an amount greater than zero");
  }

  let existingId: string | null = null;
  let data: {
    userId: string;
    projectId: string | null;
    periodMonth: string | null;
    source: "PROJECT_FEE" | "MONTHLY";
  };
  let label: string;

  if (kind === "PROJECT") {
    const projectId = String(formData.get("projectId") ?? "");
    if (!projectId) throw new Error("Choose a project");

    // Only for work you are actually on — otherwise anyone could invoice any
    // project in the system.
    const assignment = await prisma.projectAssignment.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
      select: { project: { select: { title: true } } },
    });
    if (!assignment) {
      throw new Error("You are not assigned to that project");
    }

    const existing = await prisma.earning.findFirst({
      where: { userId: user.id, projectId, source: "PROJECT_FEE" },
      select: { id: true, status: true },
    });
    if (existing?.status === "CREDITED") {
      throw new Error(
        "Your claim for that project has already been approved and paid.",
      );
    }

    existingId = existing?.id ?? null;
    data = {
      userId: user.id,
      projectId,
      periodMonth: null,
      source: "PROJECT_FEE",
    };
    label = assignment.project.title;
  } else if (kind === "MONTH") {
    const periodMonth = String(formData.get("periodMonth") ?? "").trim();
    if (!MONTH_RE.test(periodMonth)) {
      throw new Error("Choose a month");
    }
    // Claiming ahead would let someone bank next quarter today.
    if (periodMonth > currentMonth()) {
      throw new Error("You cannot claim a month that hasn't happened yet");
    }

    const existing = await prisma.earning.findFirst({
      where: { userId: user.id, periodMonth, source: "MONTHLY" },
      select: { id: true, status: true },
    });
    if (existing?.status === "CREDITED") {
      throw new Error(
        `Your claim for ${periodMonth} has already been approved and paid.`,
      );
    }

    existingId = existing?.id ?? null;
    data = {
      userId: user.id,
      projectId: null,
      periodMonth,
      source: "MONTHLY",
    };
    label = periodMonth;
  } else {
    throw new Error("Unknown claim type");
  }

  if (existingId) {
    await prisma.earning.update({
      where: { id: existingId },
      data: {
        amount,
        note,
        // Back to pending, and the old decision is cleared — this is a new ask.
        status: "PENDING",
        decidedAt: null,
        decidedById: null,
      },
    });
  } else {
    await prisma.earning.create({
      data: { ...data, amount, note, status: "PENDING" },
    });
  }

  await logActivity(user.id, "claim.submitted", "User", user.id, {
    kind,
    label,
    amount,
    revised: Boolean(existingId),
  });

  revalidatePath("/dashboard/wallet");
  revalidatePath("/admin/wallet");
}

/** Take back your own claim while it is still pending. */
export async function withdrawClaim(formData: FormData) {
  const user = await requireUser();
  if (!user) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const claim = await prisma.earning.findUnique({
    where: { id },
    select: { userId: true, status: true },
  });

  if (!claim || claim.userId !== user.id) throw new Error("Not authorized");
  if (claim.status !== "PENDING") {
    throw new Error("That claim has already been decided");
  }

  // Deleted rather than cancelled: nothing was ever owed, and leaving a
  // tombstone would block the next claim for the same project or month.
  await prisma.earning.delete({ where: { id } });

  revalidatePath("/dashboard/wallet");
  revalidatePath("/admin/wallet");
}

/** Approve or reject a claim. Approving is what turns it into real money. */
export async function decideClaim(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));

  const claim = await prisma.earning.findUnique({
    where: { id },
    select: { status: true, userId: true, amount: true },
  });
  if (!claim) throw new Error("No such claim");
  if (claim.status !== "PENDING") {
    throw new Error("That claim has already been decided");
  }
  if (decision !== "APPROVE" && decision !== "REJECT") {
    throw new Error("Unknown decision");
  }

  await prisma.earning.update({
    where: { id },
    data: {
      status: decision === "APPROVE" ? "CREDITED" : "CANCELLED",
      decidedAt: new Date(),
      decidedById: admin.id,
    },
  });

  await logActivity(
    admin.id,
    decision === "APPROVE" ? "claim.approved" : "claim.rejected",
    "User",
    claim.userId,
    { amount: Number(claim.amount) },
  );

  revalidatePath("/admin/wallet");
  revalidatePath("/dashboard/wallet");
  revalidatePath("/dashboard");
}

/* ── Payout requests (staff) ─────────────────────────────────────────────── */

export async function requestPayout(formData: FormData) {
  const user = await requireUser();
  if (!user) throw new Error("Not authorized");

  const amount = Number(formData.get("amount"));
  const destination = String(formData.get("destination") ?? "").trim();

  if (!amount || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Enter an amount greater than zero");
  }
  if (!destination) {
    throw new Error("Enter the number to send the money to");
  }

  // Re-checked server-side: the form's max attribute is a hint, not a control.
  const wallet = await getWallet(user.id);
  if (amount > wallet.available) {
    throw new Error(
      `You can request at most ${wallet.available.toLocaleString("en-US")} FCFA`,
    );
  }

  await prisma.payoutRequest.create({
    data: {
      userId: user.id,
      amount,
      destination: destination.slice(0, 40),
      note: String(formData.get("note") ?? "").slice(0, 500) || null,
    },
  });

  await logActivity(user.id, "payout.requested", "User", user.id, { amount });

  revalidatePath("/dashboard");
  revalidatePath("/admin/wallet");
}

export async function cancelPayoutRequest(formData: FormData) {
  const user = await requireUser();
  if (!user) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const request = await prisma.payoutRequest.findUnique({ where: { id } });

  if (!request || request.userId !== user.id) {
    throw new Error("Not authorized");
  }
  if (request.status !== "REQUESTED") {
    throw new Error("This request has already been actioned");
  }

  await prisma.payoutRequest.update({
    where: { id },
    data: { status: "REJECTED", decidedAt: new Date(), note: "Cancelled by requester" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin/wallet");
}

/* ── Payout decisions (admin) ────────────────────────────────────────────── */

export async function decidePayout(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));

  const data: Record<string, unknown> = {
    decidedAt: new Date(),
    decidedById: admin.id,
  };

  if (decision === "APPROVED") {
    data.status = "APPROVED";
  } else if (decision === "PAID") {
    data.status = "PAID";
    data.paidAt = new Date();
    data.reference = String(formData.get("reference") ?? "").trim() || null;
  } else if (decision === "REJECTED") {
    data.status = "REJECTED";
  } else {
    throw new Error("Unknown decision");
  }

  await prisma.payoutRequest.update({ where: { id }, data });
  await logActivity(admin.id, `payout.${decision.toLowerCase()}`, "User", id);

  revalidatePath("/admin/wallet");
  revalidatePath("/dashboard");
}

/* ── Equity (admin) ────────────────────────────────────────────────────── */

/**
 * Set how many shares somebody holds, as an absolute number.
 *
 * The stored form is still a ledger of grants — this works out the difference
 * against what they hold today and records that as one entry, so every change
 * keeps its history and who made it. Setting 150 on a 100 holder writes +50;
 * setting 80 writes -20 as a buyback. Setting 0 clears them out.
 */
export async function setHolding(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const userId = String(formData.get("userId"));
  const raw = String(formData.get("shares") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!userId) throw new Error("Choose a team member");
  if (raw === "") throw new Error("Enter a number of shares");

  const target = Number(raw);
  if (Number.isNaN(target) || !Number.isInteger(target) || target < 0) {
    throw new Error("Enter a whole number of shares, zero or more");
  }

  const holder = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true, email: true },
  });
  if (!holder) throw new Error("No such user");
  if (!holder.role.includes("PARTNER")) {
    throw new Error(
      `${holder.name ?? holder.email} is not a partner. Use “Make partner” on the Team page first.`,
    );
  }

  const table = await getCapTable();
  const held = table.rows.find((r) => r.userId === userId)?.shares ?? 0;
  const delta = target - held;

  if (delta === 0) return; // Nothing changed — don't pad the ledger.

  // Issuing past the authorized ceiling should be a deliberate decision made
  // in Settings, not something that happens by accident here.
  if (delta > 0 && table.authorized > 0) {
    if (table.issued + delta > table.authorized) {
      throw new Error(
        `That needs ${delta} more share(s) but only ${table.unallocated} of ${table.authorized} authorized are unallocated. Raise the ceiling in Settings first.`,
      );
    }
  }

  await prisma.shareGrant.create({
    data: {
      userId,
      shares: delta,
      note: note || (delta > 0 ? `Set to ${target}` : `Reduced to ${target}`),
      grantedById: admin.id,
    },
  });

  await logActivity(admin.id, "shares.set", "User", userId, {
    from: held,
    to: target,
    delta,
  });

  revalidatePath("/admin/wallet");
  revalidatePath("/admin/team");
  revalidatePath("/dashboard/wallet");
}

/** Clears somebody's holding entirely, recorded as a buyback of what they hold. */
export async function removeShares(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const userId = String(formData.get("userId"));
  if (!userId) throw new Error("Choose a team member");

  const table = await getCapTable();
  const held = table.rows.find((r) => r.userId === userId)?.shares ?? 0;

  if (held === 0) return; // Already holds nothing.

  await prisma.shareGrant.create({
    data: {
      userId,
      shares: -held,
      note: "Holding removed",
      grantedById: admin.id,
    },
  });

  await logActivity(admin.id, "shares.removed", "User", userId, { was: held });

  revalidatePath("/admin/wallet");
  revalidatePath("/admin/team");
  revalidatePath("/dashboard/wallet");
}

export async function payDividend(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim() || "Dividend";

  const { recipients } = await distributeDividend(amount, note, admin.id);
  console.log(`[shares] dividend split across ${recipients} shareholder(s)`);

  revalidatePath("/admin/wallet");
  revalidatePath("/dashboard/wallet");
}

/** Manual credit — bonuses, corrections, anything outside a project share. */
export async function addEarning(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const userId = String(formData.get("userId"));
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim();

  if (!userId) throw new Error("Choose a team member");
  if (!amount || Number.isNaN(amount)) throw new Error("Enter an amount");

  await prisma.earning.create({
    data: {
      userId,
      amount,
      // Negative amounts are allowed and recorded as an adjustment — a
      // correction should appear in the ledger, not quietly edit history.
      source: amount < 0 ? "ADJUSTMENT" : "BONUS",
      note: note || (amount < 0 ? "Adjustment" : "Bonus"),
    },
  });

  await logActivity(admin.id, "earning.manual", "User", userId, { amount });

  revalidatePath("/admin/wallet");
  revalidatePath("/dashboard");
}
