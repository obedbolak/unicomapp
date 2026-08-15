// components/dashboard/SharesCard.tsx
// Equity panel for the staff wallet.
//
// Renders nothing at all for people with no shares. A permanent "0 shares"
// card would tell every worker, on every visit, that they are not an owner.

import { prisma } from "@/lib/prisma";
import { getHolding, getIssuedTotal } from "@/lib/shares";
import { Card, Table, shortDate } from "./ui";

export default async function SharesCard({ userId }: { userId: string }) {
  const [holding, issued, grants] = await Promise.all([
    getHolding(userId),
    getIssuedTotal(),
    prisma.shareGrant.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { grantedBy: { select: { name: true } } },
    }),
  ]);

  if (holding.shares === 0 && grants.length === 0) return null;

  return (
    <Card
      title="Company shares"
      subtitle="Your equity stake, separate from project earnings."
      action={
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            {holding.shares.toLocaleString("en-US")}
          </div>
          <div
            style={{ fontSize: "0.6875rem", color: "var(--dash-ink-dim)" }}
          >
            {holding.pctOfIssued.toFixed(2)}% of {issued.toLocaleString("en-US")}{" "}
            issued
          </div>
        </div>
      }
    >
      {/* A plain proportion bar reads faster than the percentage alone. */}
      <div
        className="dash-track"
        style={{ height: 8 }}
        role="img"
        aria-label={`${holding.pctOfIssued.toFixed(2)} percent of issued shares`}
      >
        <div
          className="dash-fill"
          style={{ width: `${Math.min(100, holding.pctOfIssued)}%` }}
        />
      </div>

      <p className="dash-hint">
        Dividends are split in proportion to shares and land in your wallet as
        earnings. Shares themselves are not withdrawable.
      </p>

      <div className="dash-rule" style={{ margin: "1.1rem 0 0.9rem" }} />

      <Table headers={["Date", "Change", "Note", "By"]} empty="No grants yet.">
        {grants.map((g) => (
          <tr key={g.id}>
            <td className="dash-nowrap dash-td-muted">
              {shortDate(g.createdAt)}
            </td>
            <td
              className="dash-nowrap"
              style={{
                fontWeight: 700,
                color: g.shares < 0 ? "#f87171" : "#22c55e",
              }}
            >
              {g.shares > 0 ? "+" : ""}
              {g.shares.toLocaleString("en-US")}
            </td>
            <td className="dash-td-muted">{g.note ?? "—"}</td>
            <td className="dash-td-muted">{g.grantedBy?.name ?? "—"}</td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}
