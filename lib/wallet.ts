// lib/wallet.ts
// Balances are always derived by summing the ledger — there is deliberately no
// stored balance column. A cached total is a number that can disagree with its
// own history, and reconciling that after the fact is miserable.

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export type Wallet = {
  /** Everything ever credited and not cancelled. */
  earned: number;
  /** Already sent to them. */
  paidOut: number;
  /** Requested or approved but not yet sent — reserved, not spendable. */
  inFlight: number;
  /** What they could request right now. */
  available: number;
};

export async function getWallet(userId: string): Promise<Wallet> {
  const [earnings, payouts] = await Promise.all([
    prisma.earning.aggregate({
      where: { userId, status: "CREDITED" },
      _sum: { amount: true },
    }),
    prisma.payoutRequest.groupBy({
      by: ["status"],
      where: { userId, status: { in: ["REQUESTED", "APPROVED", "PAID"] } },
      _sum: { amount: true },
    }),
  ]);

  const sumFor = (status: string) =>
    Number(payouts.find((p) => p.status === status)?._sum.amount ?? 0);

  const earned = Number(earnings._sum.amount ?? 0);
  const paidOut = sumFor("PAID");
  // Requested and approved money is spoken for. Leaving it out of `available`
  // is what stops someone requesting the same balance twice.
  const inFlight = sumFor("REQUESTED") + sumFor("APPROVED");

  return {
    earned,
    paidOut,
    inFlight,
    available: earned - paidOut - inFlight,
  };
}

export type UpcomingShare = {
  projectId: string;
  title: string;
  status: string;
  sharePct: number;
  amount: number;
  currency: string;
  dueDate: Date | null;
};

/**
 * Shares on projects the person is assigned to that have not been delivered
 * yet - money in the pipeline, not money owed.
 *
 * Deliberately excluded from the wallet balance: nothing here is earned, and a
 * cancelled project earns nothing at all. It exists so someone can see what
 * they are working toward.
 */
export async function getUpcoming(userId: string): Promise<UpcomingShare[]> {
  const assignments = await prisma.projectAssignment.findMany({
    where: {
      userId,
      sharePct: { not: null },
      project: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
    },
    select: {
      sharePct: true,
      project: {
        select: {
          id: true,
          title: true,
          status: true,
          budget: true,
          currency: true,
          dueDate: true,
        },
      },
    },
  });

  return assignments
    .filter((a) => a.project.budget && Number(a.project.budget) > 0)
    .map((a) => {
      const pct = Number(a.sharePct);
      return {
        projectId: a.project.id,
        title: a.project.title,
        status: a.project.status,
        sharePct: pct,
        amount: Math.round((Number(a.project.budget) * pct) / 100),
        currency: a.project.currency,
        dueDate: a.project.dueDate,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Credits every assignee's revenue share for a delivered project.
 *
 * Idempotent by way of the @@unique([projectId, userId, source]) constraint —
 * calling it twice on the same project credits nobody twice, so it is safe to
 * hang off a status change that an admin might toggle back and forth.
 *
 * Returns how many earnings were created.
 */
export async function creditProjectShares(
  projectId: string,
  actorId: string,
): Promise<{ created: number; skipped: string[] }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      budget: true,
      currency: true,
      assignments: {
        select: {
          userId: true,
          sharePct: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  const skipped: string[] = [];

  if (!project) return { created: 0, skipped: ["Project not found"] };

  if (!project.budget || Number(project.budget) <= 0) {
    return {
      created: 0,
      skipped: ["Project has no budget set, so there is nothing to share"],
    };
  }

  const budget = Number(project.budget);
  const withShares = project.assignments.filter(
    (a) => a.sharePct && Number(a.sharePct) > 0,
  );

  if (withShares.length === 0) {
    return { created: 0, skipped: ["No assignee has a share percentage set"] };
  }

  const totalPct = withShares.reduce((sum, a) => sum + Number(a.sharePct), 0);
  if (totalPct > 100) {
    // Refuse rather than silently over-committing the budget.
    return {
      created: 0,
      skipped: [
        `Shares add up to ${totalPct}% — more than the project budget. Fix the assignments first.`,
      ],
    };
  }

  let created = 0;

  for (const assignment of withShares) {
    const pct = Number(assignment.sharePct);
    const amount = Math.round((budget * pct) / 100);

    try {
      await prisma.earning.create({
        data: {
          userId: assignment.userId,
          projectId: project.id,
          source: "PROJECT_SHARE",
          status: "CREDITED",
          amount,
          currency: project.currency,
          sharePct: pct,
          note: `${pct}% of ${project.title}`,
        },
      });
      created += 1;
    } catch {
      // Unique constraint — already credited on a previous delivery.
      skipped.push(assignment.user.name ?? assignment.user.email);
    }
  }

  if (created > 0) {
    await logActivity(actorId, "earning.credited", "Project", project.id, {
      project: project.title,
      count: created,
      totalPct,
    });
  }

  return { created, skipped };
}
