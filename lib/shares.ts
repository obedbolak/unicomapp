// lib/shares.ts
// Company equity. Holdings are summed from the ShareGrant ledger — there is no
// shares-held column, for the same reason the wallet has no balance column.

import { prisma } from "@/lib/prisma";
import { getSetting, getSettings } from "@/lib/settings";
import { logActivity } from "@/lib/activity";

export type Holding = {
  shares: number;
  /** Of shares actually issued, not of the authorized pool. */
  pctOfIssued: number;
  /** Worth in currency, from Settings → companyValuation. 0 when unset. */
  value: number;
  /** Dividends actually received to date — real money, unlike `value`. */
  dividendsReceived: number;
  /** Total issued across everyone — returned so callers need only one call. */
  issued: number;
  currency: string;
};

/** Total shares issued across everyone. The denominator for ownership. */
export async function getIssuedTotal(): Promise<number> {
  const agg = await prisma.shareGrant.aggregate({ _sum: { shares: true } });
  return agg._sum.shares ?? 0;
}

export async function getHolding(userId: string): Promise<Holding> {
  // Sequential on purpose. Firing five aggregates at once from every card on
  // the wallet page is what saturates the connection pool; these are fast
  // indexed reads and the added latency is not perceptible.
  const agg = await prisma.shareGrant.aggregate({
    where: { userId },
    _sum: { shares: true },
  });
  const issued = await getIssuedTotal();
  const settings = await getSettings();
  const dividends = await prisma.earning.aggregate({
    where: { userId, source: "BONUS", status: "CREDITED" },
    _sum: { amount: true },
  });

  const shares = agg._sum.shares ?? 0;
  const pctOfIssued = issued > 0 ? (shares / issued) * 100 : 0;
  const valuation = Number(settings.companyValuation) || 0;

  return {
    shares,
    pctOfIssued,
    value: Math.round((valuation * pctOfIssued) / 100),
    dividendsReceived: Number(dividends._sum.amount ?? 0),
    issued,
    currency: settings.currency,
  };
}

export type CapTableRow = {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  shares: number;
  pctOfIssued: number;
  value: number;
};

export type CapTable = {
  rows: CapTableRow[];
  issued: number;
  /** Ceiling from Settings, so you can see how much is still unallocated. */
  authorized: number;
  unallocated: number;
  valuation: number;
};

export async function getCapTable(): Promise<CapTable> {
  const [grouped, users, authorizedRaw, valuationRaw] = await Promise.all([
    prisma.shareGrant.groupBy({ by: ["userId"], _sum: { shares: true } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, image: true },
    }),
    getSetting("authorizedShares"),
    getSetting("companyValuation"),
  ]);

  const byUser = new Map(users.map((u) => [u.id, u]));
  const issued = grouped.reduce((sum, g) => sum + (g._sum.shares ?? 0), 0);
  const authorized = Number(authorizedRaw) || 0;
  const valuation = Number(valuationRaw) || 0;

  const rows: CapTableRow[] = grouped
    .map((g) => {
      const u = byUser.get(g.userId);
      const shares = g._sum.shares ?? 0;
      const pctOfIssued = issued > 0 ? (shares / issued) * 100 : 0;
      return {
        userId: g.userId,
        name: u?.name ?? u?.email ?? "Unknown",
        email: u?.email ?? "",
        image: u?.image ?? null,
        shares,
        pctOfIssued,
        value: Math.round((valuation * pctOfIssued) / 100),
      };
    })
    // Zero-holding rows are people whose grants netted out — not shareholders.
    .filter((r) => r.shares !== 0)
    .sort((a, b) => b.shares - a.shares);

  return {
    rows,
    issued,
    authorized,
    unallocated: Math.max(0, authorized - issued),
    valuation,
  };
}

/**
 * Splits an amount across shareholders in proportion to their holdings and
 * credits it to their wallets as BONUS earnings.
 *
 * Uses a largest-remainder pass so the parts sum exactly to the amount —
 * rounding each share independently would leave a few francs unaccounted for.
 */
export async function distributeDividend(
  totalAmount: number,
  note: string,
  actorId: string,
): Promise<{ credited: number; recipients: number }> {
  const { rows, issued } = await getCapTable();

  if (issued <= 0 || rows.length === 0) {
    throw new Error("No shares have been issued yet");
  }
  if (!totalAmount || totalAmount <= 0) {
    throw new Error("Enter an amount greater than zero");
  }

  const exact = rows.map((r) => ({
    userId: r.userId,
    raw: (totalAmount * r.shares) / issued,
  }));

  const allocations = exact.map((e) => ({
    userId: e.userId,
    amount: Math.floor(e.raw),
    remainder: e.raw - Math.floor(e.raw),
  }));

  // Hand out the leftover units to the largest remainders.
  let leftover =
    totalAmount - allocations.reduce((sum, a) => sum + a.amount, 0);
  allocations
    .slice()
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((a) => {
      if (leftover > 0) {
        a.amount += 1;
        leftover -= 1;
      }
    });

  await prisma.earning.createMany({
    data: allocations
      .filter((a) => a.amount > 0)
      .map((a) => ({
        userId: a.userId,
        amount: a.amount,
        source: "BONUS" as const,
        note,
      })),
  });

  await logActivity(actorId, "dividend.distributed", "User", null, {
    total: totalAmount,
    recipients: allocations.length,
    note,
  });

  return { credited: totalAmount, recipients: allocations.length };
}
