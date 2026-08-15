// components/dashboard/WalletCard.tsx
// Staff-facing wallet: balance, ledger, payout requests.

import { prisma } from "@/lib/prisma";
import { getWallet } from "@/lib/wallet";
import { cancelPayoutRequest, requestPayout } from "@/app/admin/wallet-actions";
import { Badge, Card, StatGrid, StatTile, Table, money, shortDate } from "./ui";
import { IconWallet, IconTrend, IconCheck } from "./icons";

export default async function WalletCard({ userId }: { userId: string }) {
  const [wallet, earnings, payouts] = await Promise.all([
    getWallet(userId),
    prisma.earning.findMany({
      where: { userId, status: "CREDITED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { project: { select: { title: true } } },
    }),
    prisma.payoutRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <>
      <StatGrid>
        <StatTile
          label="Available to withdraw"
          value={money(wallet.available)}
          hint={
            wallet.inFlight > 0
              ? `${money(wallet.inFlight)} awaiting payout`
              : undefined
          }
          icon={<IconWallet size={20} />}
          accent={wallet.available > 0 ? "var(--color-primary)" : undefined}
        />
        <StatTile
          label="Earned all time"
          value={money(wallet.earned)}
          icon={<IconTrend size={20} />}
        />
        <StatTile
          label="Paid out"
          value={money(wallet.paidOut)}
          icon={<IconCheck size={20} />}
        />
      </StatGrid>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* ── Earnings ledger ── */}
        <Card
          title="Earnings"
          subtitle="Your share of delivered projects, plus any bonuses."
          flush
        >
          <Table
            headers={["Date", "Source", "Share", "Amount"]}
            empty="Nothing yet. Shares are credited when a project you're assigned to is marked delivered."
          >
            {earnings.map((e) => (
              <tr key={e.id}>
                <td className="dash-nowrap dash-td-muted">
                  {shortDate(e.createdAt)}
                </td>
                <td>
                  {e.project?.title ?? e.note ?? "—"}
                  <div className="dash-td-muted" style={{ fontSize: "0.7rem" }}>
                    {e.source.replace(/_/g, " ").toLowerCase()}
                  </div>
                </td>
                <td className="dash-td-muted">
                  {e.sharePct ? `${Number(e.sharePct)}%` : "—"}
                </td>
                <td
                  className="dash-nowrap"
                  style={{
                    color: Number(e.amount) < 0 ? "#f87171" : "#22c55e",
                    fontWeight: 700,
                  }}
                >
                  {money(e.amount.toString(), e.currency)}
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        {/* ── Payouts ── */}
        <Card title="Withdraw" subtitle="Request a transfer of your balance.">
          {wallet.available > 0 ? (
            <form action={requestPayout}>
              <div className="dash-formgrid">
                <label>
                  <span className="dash-field-label">Amount (FCFA)</span>
                  <input
                    type="number"
                    name="amount"
                    min={1}
                    max={wallet.available}
                    step={1}
                    required
                    defaultValue={wallet.available}
                    className="dash-input"
                  />
                </label>

                <label>
                  <span className="dash-field-label">Send to (MoMo)</span>
                  <input
                    name="destination"
                    required
                    maxLength={40}
                    placeholder="6XXXXXXXX"
                    className="dash-input"
                  />
                </label>
              </div>

              <div className="dash-actions">
                <button type="submit" className="dash-btn dash-btn--primary">
                  Request payout
                </button>
              </div>
            </form>
          ) : (
            <p className="dash-hint" style={{ marginTop: 0 }}>
              {wallet.inFlight > 0
                ? `You have ${money(wallet.inFlight)} awaiting payout. Request again once it has been sent.`
                : "No balance available to withdraw yet."}
            </p>
          )}

          <div className="dash-rule" style={{ margin: "1.25rem 0 0.9rem" }} />

          <Table
            headers={["Requested", "Amount", "Status", ""]}
            empty="No payout requests yet."
          >
            {payouts.map((p) => (
              <tr key={p.id}>
                <td className="dash-nowrap dash-td-muted">
                  {shortDate(p.requestedAt)}
                </td>
                <td className="dash-nowrap">
                  {money(p.amount.toString(), p.currency)}
                </td>
                <td>
                  <Badge value={p.status} />
                </td>
                <td>
                  {p.status === "REQUESTED" && (
                    <form action={cancelPayoutRequest}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="dash-btn">
                        Cancel
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}
