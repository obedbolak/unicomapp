// components/dashboard/SharesCard.tsx
// Equity panel for the staff wallet.
//
// Gated on the PARTNER role, not on holding > 0. Someone can be made a partner
// before any shares are allocated, and a partner whose grants net to zero is
// still a partner. Non-partners never see this section at all.

import { prisma } from "@/lib/prisma";
import { getHolding, getIssuedTotal } from "@/lib/shares";
import { getSetting } from "@/lib/settings";
import { Card, Table, money, shortDate } from "./ui";

export default async function SharesCard({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user?.role.includes("PARTNER")) return null;

  const [holding, issued, currency, grants] = await Promise.all([
    getHolding(userId),
    getIssuedTotal(),
    getSetting("currency"),
    prisma.shareGrant.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { grantedBy: { select: { name: true } } },
    }),
  ]);

  return (
    <Card
      title="Company shares"
      subtitle="Your equity stake, separate from project earnings."
    >
      {/* Three figures, most concrete last: how many, what proportion, and
          what has actually reached them. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <p className="dash-stat-label">Shares held</p>
          <p className="dash-stat-value">
            {holding.shares.toLocaleString("en-US")}
          </p>
          <p className="dash-stat-hint">
            of {issued.toLocaleString("en-US")} issued
          </p>
        </div>

        <div>
          <p className="dash-stat-label">Ownership</p>
          <p className="dash-stat-value" style={{ color: "var(--color-primary)" }}>
            {holding.pctOfIssued.toFixed(2)}%
          </p>
          <p className="dash-stat-hint">of the company</p>
        </div>

        {holding.value > 0 ? (
          <div>
            <p className="dash-stat-label">Stake worth</p>
            <p className="dash-stat-value">{money(holding.value, currency)}</p>
            <p className="dash-stat-hint">at current valuation</p>
          </div>
        ) : (
          <div>
            <p className="dash-stat-label">Stake worth</p>
            <p className="dash-stat-value" style={{ opacity: 0.4 }}>
              —
            </p>
            <p className="dash-stat-hint">no valuation set</p>
          </div>
        )}

        <div>
          <p className="dash-stat-label">Dividends received</p>
          <p className="dash-stat-value" style={{ color: "#22c55e" }}>
            {money(holding.dividendsReceived, currency)}
          </p>
          <p className="dash-stat-hint">paid into your wallet</p>
        </div>
      </div>

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
        {holding.value > 0
          ? "Stake worth is an estimate from the company's current valuation, not cash you can withdraw."
          : "Set a company valuation in Settings to see this stake in FCFA."}{" "}
        Dividends are split by holding and land in your wallet as earnings.
      </p>

      <div className="dash-rule" style={{ margin: "1.1rem 0 0.9rem" }} />

      <Table
        headers={["Date", "Change", "Note", "By"]}
        empty="No shares allocated to you yet."
      >
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
