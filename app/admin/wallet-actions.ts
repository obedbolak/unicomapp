"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getWallet } from "@/lib/wallet";
import { distributeDividend, getCapTable } from "@/lib/shares";

/* ── Assignments (admin) ─────────────────────────────────────────────────── */

export async function assignToProject(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const projectId = String(formData.get("projectId"));
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role") ?? "").trim() || null;

  const sharePctRaw = String(formData.get("sharePct") ?? "").trim();
  const sharePct = sharePctRaw ? Number(sharePctRaw) : null;

  if (!projectId || !userId) throw new Error("Project and person are required");
  if (sharePct !== null && (Number.isNaN(sharePct) || sharePct < 0 || sharePct > 100)) {
    throw new Error("Share must be between 0 and 100");
  }

  // Guard the total here too, not just at credit time — better to refuse the
  // assignment than to discover the over-commitment on delivery day.
  if (sharePct) {
    const existing = await prisma.projectAssignment.aggregate({
      where: { projectId, userId: { not: userId } },
      _sum: { sharePct: true },
    });
    const total = Number(existing._sum.sharePct ?? 0) + sharePct;
    if (total > 100) {
      throw new Error(
        `Shares would total ${total}%. Reduce another assignee first.`,
      );
    }
  }

  await prisma.projectAssignment.upsert({
    where: { projectId_userId: { projectId, userId } },
    create: { projectId, userId, role, sharePct },
    update: { role, sharePct },
  });

  await logActivity(admin.id, "project.assigned", "Project", projectId, {
    userId,
    sharePct,
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

export async function grantShares(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not authorized");

  const userId = String(formData.get("userId"));
  const shares = Number(formData.get("shares"));
  const note = String(formData.get("note") ?? "").trim();

  if (!userId) throw new Error("Choose a team member");
  if (!shares || Number.isNaN(shares) || !Number.isInteger(shares)) {
    throw new Error("Enter a whole number of shares");
  }

  const table = await getCapTable();

  // Issuing past the authorized ceiling should be a deliberate decision made
  // in Settings, not something that happens by accident here.
  if (shares > 0 && table.authorized > 0) {
    if (table.issued + shares > table.authorized) {
      throw new Error(
        `Only ${table.unallocated} of ${table.authorized} authorized shares are unallocated. Raise the ceiling in Settings first.`,
      );
    }
  }

  // A buyback cannot take more than the person actually holds.
  if (shares < 0) {
    const held = table.rows.find((r) => r.userId === userId)?.shares ?? 0;
    if (held + shares < 0) {
      throw new Error(`They only hold ${held} share(s).`);
    }
  }

  await prisma.shareGrant.create({
    data: {
      userId,
      shares,
      note: note || (shares > 0 ? "Allocation" : "Buyback"),
      grantedById: admin.id,
    },
  });

  await logActivity(admin.id, "shares.granted", "User", userId, { shares });

  revalidatePath("/admin/wallet");
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
