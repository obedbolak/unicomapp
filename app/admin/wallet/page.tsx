import { prisma } from "@/lib/prisma";
import { getWallet } from "@/lib/wallet";
import { getCapTable } from "@/lib/shares";
import {
  addEarning,
  decidePayout,
  grantShares,
  payDividend,
} from "../wallet-actions";
import {
  Badge,
  Card,
  PageHeader,
  StatGrid,
  StatTile,
  Table,
  money,
  shortDate,
} from "@/components/dashboard/ui";
import { IconWallet, IconTrend, IconTeam } from "@/components/dashboard/icons";

export const dynamic = "force-dynamic";

export default async function AdminWalletPage() {
  const staff = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  // Only partners can be allocated shares — equity status is set on the Team
  // page, so the two cannot drift apart.
  const partners = staff.filter((s) => s.role.includes("PARTNER"));

  // One wallet per person. Fine at team scale; if this ever grows past a few
  // dozen people, replace with a single grouped aggregate.
  const wallets = await Promise.all(
    staff.map(async (s) => ({ ...s, wallet: await getWallet(s.id) })),
  );

  const capTable = await getCapTable();

  const requests = await prisma.payoutRequest.findMany({
    orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  const owed = wallets.reduce((sum, w) => sum + w.wallet.available, 0);
  const pending = requests.filter((r) => r.status === "REQUESTED");
  const pendingTotal = pending.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <>
      <PageHeader
        title="Wallet"
        subtitle="What the team has earned, and what they've asked to withdraw."
      />

      <StatGrid>
        <StatTile
          label="Owed to team"
          value={money(owed)}
          hint="Credited but not yet paid"
          icon={<IconWallet size={20} />}
          accent={owed > 0 ? "var(--color-primary)" : undefined}
        />
        <StatTile
          label="Pending requests"
          value={money(pendingTotal)}
          hint={`${pending.length} awaiting your decision`}
          icon={<IconTrend size={20} />}
        />
        <StatTile
          label="Team members"
          value={staff.length}
          icon={<IconTeam size={20} />}
        />
      </StatGrid>

      <Card title="Payout requests" flush>
        <Table
          headers={["Requested", "Who", "Amount", "Send to", "Status", "Action"]}
          empty="No payout requests."
        >
          {requests.map((r) => (
            <tr key={r.id}>
              <td className="dash-nowrap dash-td-muted">
                {shortDate(r.requestedAt)}
              </td>
              <td>{r.user.name ?? r.user.email}</td>
              <td className="dash-nowrap" style={{ fontWeight: 700 }}>
                {money(r.amount.toString(), r.currency)}
              </td>
              <td className="dash-mono dash-td-muted">{r.destination ?? "—"}</td>
              <td>
                <Badge value={r.status} />
              </td>
              <td>
                {(r.status === "REQUESTED" || r.status === "APPROVED") && (
                  <form action={decidePayout} className="dash-inline-form">
                    <input type="hidden" name="id" value={r.id} />
                    <input
                      name="reference"
                      placeholder="Txn ref"
                      className="dash-input"
                      style={{ width: 110 }}
                    />
                    <select
                      name="decision"
                      defaultValue="PAID"
                      className="dash-select"
                      style={{ width: "auto" }}
                    >
                      <option value="PAID">Mark paid</option>
                      <option value="APPROVED">Approve</option>
                      <option value="REJECTED">Reject</option>
                    </select>
                    <button type="submit" className="dash-btn">
                      Go
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <div style={{ marginTop: "1.5rem" }}>
        <Card title="Balances" flush>
          <Table
            headers={["Team member", "Earned", "Paid out", "In flight", "Available"]}
            empty="No active team members."
          >
            {wallets.map((w) => (
              <tr key={w.id}>
                <td style={{ fontWeight: 600 }}>{w.name ?? w.email}</td>
                <td className="dash-nowrap dash-td-muted">
                  {money(w.wallet.earned)}
                </td>
                <td className="dash-nowrap dash-td-muted">
                  {money(w.wallet.paidOut)}
                </td>
                <td className="dash-nowrap dash-td-muted">
                  {money(w.wallet.inFlight)}
                </td>
                <td
                  className="dash-nowrap"
                  style={{
                    fontWeight: 700,
                    color:
                      w.wallet.available > 0
                        ? "var(--color-primary)"
                        : undefined,
                  }}
                >
                  {money(w.wallet.available)}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      {/* ── Equity ── */}
      <div style={{ marginTop: "1.5rem" }}>
        <Card
          title="Cap table"
          subtitle="Company shares. Separate from project revenue shares — not everyone holds equity."
          action={
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                {capTable.issued.toLocaleString("en-US")}
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--dash-ink-dim)",
                }}
              >
                issued of {capTable.authorized.toLocaleString("en-US")} ·{" "}
                {capTable.unallocated.toLocaleString("en-US")} left
              </div>
            </div>
          }
          flush
        >
          <Table
            headers={["Shareholder", "Shares", "Ownership", "Worth", ""]}
            empty="No shares issued yet. Allocate some below."
          >
            {capTable.rows.map((r) => (
              <tr key={r.userId}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td
                  className="dash-nowrap"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {r.shares.toLocaleString("en-US")}
                </td>
                <td className="dash-nowrap">{r.pctOfIssued.toFixed(2)}%</td>
                <td className="dash-nowrap dash-td-muted">
                  {capTable.valuation > 0 ? money(r.value) : "—"}
                </td>
                <td style={{ width: "35%", minWidth: 120 }}>
                  <div className="dash-track">
                    <div
                      className="dash-fill"
                      style={{ width: `${r.pctOfIssued}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          <div style={{ padding: "1.35rem" }}>
            <form action={grantShares}>
              <div className="dash-formgrid">
                <label>
                  <span className="dash-field-label">Team member</span>
                  <select name="userId" required className="dash-select">
                    <option value="">Select…</option>
                    {partners.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name ?? s.email}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="dash-field-label">Shares</span>
                  <input
                    type="number"
                    name="shares"
                    step={1}
                    required
                    placeholder="100 or -50"
                    className="dash-input"
                  />
                </label>

                <label>
                  <span className="dash-field-label">Note</span>
                  <input
                    name="note"
                    maxLength={200}
                    placeholder="Founding allocation"
                    className="dash-input"
                  />
                </label>

                <button type="submit" className="dash-btn dash-btn--primary">
                  Allocate
                </button>
              </div>
            </form>

            <p className="dash-hint">
              {partners.length === 0 ? (
                <strong style={{ color: "#fbbf24" }}>
                  Nobody is marked as a partner yet. Use “Make partner” on the
                  Team page first — only partners can hold equity.
                </strong>
              ) : (
                <>
                  A negative number records a buyback. Allocations are a ledger,
                  not an edit — every change keeps its history.
                </>
              )}{" "}
              Ceiling and valuation live in Settings →{" "}
              <code>authorizedShares</code>, <code>companyValuation</code>.
              {capTable.valuation === 0 &&
                " Set a valuation to show stakes in FCFA."}
            </p>
          </div>
        </Card>
      </div>

      {capTable.issued > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <Card
            title="Pay a dividend"
            subtitle="Splits an amount across shareholders by holding and credits it to their wallets."
          >
            <form action={payDividend}>
              <div className="dash-formgrid">
                <label>
                  <span className="dash-field-label">Total amount (FCFA)</span>
                  <input
                    type="number"
                    name="amount"
                    min={1}
                    step={1}
                    required
                    className="dash-input"
                  />
                </label>

                <label>
                  <span className="dash-field-label">Note</span>
                  <input
                    name="note"
                    maxLength={200}
                    placeholder="Q3 dividend"
                    className="dash-input"
                  />
                </label>

                <button type="submit" className="dash-btn dash-btn--primary">
                  Distribute
                </button>
              </div>
            </form>

            <p className="dash-hint">
              Split across {capTable.rows.length} shareholder
              {capTable.rows.length === 1 ? "" : "s"} in proportion to their
              holdings. Rounding is handled so the parts add up to exactly the
              amount entered.
            </p>
          </Card>
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <Card
          title="Add a bonus or adjustment"
          subtitle="Anything outside a project share. A negative amount records a correction."
        >
          <form action={addEarning}>
            <div className="dash-formgrid">
              <label>
                <span className="dash-field-label">Team member</span>
                <select name="userId" required className="dash-select">
                  <option value="">Select…</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name ?? s.email}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="dash-field-label">Amount (FCFA)</span>
                <input
                  type="number"
                  name="amount"
                  step={1}
                  required
                  placeholder="25000 or -5000"
                  className="dash-input"
                />
              </label>

              <label>
                <span className="dash-field-label">Note</span>
                <input
                  name="note"
                  maxLength={200}
                  placeholder="Q3 performance bonus"
                  className="dash-input"
                />
              </label>

              <button type="submit" className="dash-btn dash-btn--primary">
                Add to ledger
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
