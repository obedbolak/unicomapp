import { prisma } from "@/lib/prisma";
import { getWallet } from "@/lib/wallet";
import { getCapTable } from "@/lib/shares";
import {
  addEarning,
  decideClaim,
  decidePayout,
  payDividend,
  removeShares,
  setHolding,
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
import {
  IconWallet,
  IconTrend,
  IconTeam,
  IconCheck,
} from "@/components/dashboard/icons";

export const dynamic = "force-dynamic";

export default async function AdminWalletPage() {
  const [staff, organizations] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, image: true, role: true },
    }),
    prisma.organization.findMany({ orderBy: { name: "asc" } }),
  ]);

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

  // Fixed-pay claims waiting on a decision. Oldest first — the person who has
  // been waiting longest should be the one you see at the top.
  const claims = await prisma.earning.findMany({
    where: { status: "PENDING", source: { in: ["PROJECT_FEE", "MONTHLY"] } },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { title: true } },
    },
  });
  const claimsTotal = claims.reduce((s, c) => s + Number(c.amount), 0);

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
          label="Claims to approve"
          value={money(claimsTotal)}
          hint={`${claims.length} awaiting approval`}
          icon={<IconCheck size={20} />}
          accent={claims.length > 0 ? "var(--color-primary)" : undefined}
        />
        <StatTile
          label="Team members"
          value={staff.length}
          icon={<IconTeam size={20} />}
        />
      </StatGrid>

      {/* ── Claims ──
          Fixed pay somebody has asked for. Nothing here is in anyone's balance
          until it is approved, so this sits above payouts: approve first, then
          decide what to send. */}
      <Card
        title="Claims awaiting approval"
        subtitle="Flat amounts claimed for a project or a month. Approving credits the person's wallet."
        flush
        style={{ marginBottom: "1.5rem" }}
      >
        <Table
          headers={["Sent", "Who", "For", "Amount", "Note", "Decision"]}
          empty="Nothing waiting on you."
        >
          {claims.map((c) => (
            <tr key={c.id}>
              <td className="dash-nowrap dash-td-muted">
                {shortDate(c.createdAt)}
              </td>
              <td style={{ fontWeight: 600 }}>{c.user.name ?? c.user.email}</td>
              <td>
                {c.source === "MONTHLY"
                  ? c.periodMonth
                  : (c.project?.title ?? "—")}
                <div className="dash-td-muted" style={{ fontSize: "0.7rem" }}>
                  {c.source === "MONTHLY" ? "monthly" : "project fee"}
                </div>
              </td>
              <td className="dash-nowrap" style={{ fontWeight: 700 }}>
                {money(c.amount.toString(), c.currency)}
              </td>
              <td className="dash-td-muted">{c.note ?? "—"}</td>
              <td>
                <form action={decideClaim} className="dash-inline-form">
                  <input type="hidden" name="id" value={c.id} />
                  <select
                    name="decision"
                    defaultValue="APPROVE"
                    className="dash-select"
                    style={{ width: "auto" }}
                  >
                    <option value="APPROVE">Approve</option>
                    <option value="REJECT">Reject</option>
                  </select>
                  <button type="submit" className="dash-btn">
                    Go
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card title="Payout requests" flush>
        <Table
          headers={[
            "Requested",
            "Who",
            "Amount",
            "Send to",
            "Status",
            "Action",
          ]}
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
              <td className="dash-mono dash-td-muted">
                {r.destination ?? "—"}
              </td>
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
            headers={[
              "Team member",
              "Earned",
              "Paid out",
              "In flight",
              "Available",
            ]}
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
          subtitle="Company equity. Only partners hold shares — set who's a partner on the Team page."
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
            headers={[
              "Shareholder",
              "Shares",
              "Ownership",
              "Worth",
              "Split",
              "",
            ]}
            empty="No shares issued yet. Set someone's holding below."
          >
            {capTable.rows.map((r) => (
              <tr key={r.holderId}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>

                {/* Type the number they should hold and save. The difference
                    against what they hold now is what gets written to the
                    ledger, so the history stays intact. */}
                <td>
                  <form action={setHolding} className="dash-inline-form">
                    <input
                      type="hidden"
                      name="holderType"
                      value={r.holderType}
                    />
                    <input
                      type="hidden"
                      name={
                        r.holderType === "ORGANIZATION"
                          ? "organizationId"
                          : "userId"
                      }
                      value={r.holderId}
                    />
                    <input
                      type="number"
                      name="shares"
                      min={0}
                      step={1}
                      defaultValue={r.shares}
                      aria-label={`Shares held by ${r.name}`}
                      className="dash-input"
                      style={{ width: 96 }}
                    />
                    <button type="submit" className="dash-btn">
                      Save
                    </button>
                  </form>
                </td>

                <td className="dash-nowrap">{r.pctOfIssued.toFixed(2)}%</td>
                <td className="dash-nowrap dash-td-muted">
                  {capTable.valuation > 0 ? money(r.value) : "—"}
                </td>
                <td style={{ width: "25%", minWidth: 100 }}>
                  <div className="dash-track">
                    <div
                      className="dash-fill"
                      style={{ width: `${r.pctOfIssued}%` }}
                    />
                  </div>
                </td>
                <td>
                  <form action={removeShares}>
                    <input
                      type="hidden"
                      name="holderType"
                      value={r.holderType}
                    />
                    <input
                      type="hidden"
                      name={
                        r.holderType === "ORGANIZATION"
                          ? "organizationId"
                          : "userId"
                      }
                      value={r.holderId}
                    />
                    <button
                      type="submit"
                      className="dash-btn"
                      style={{ color: "#f87171" }}
                    >
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </Table>

          <div style={{ padding: "1.35rem" }}>
            <p className="dash-field-label" style={{ marginBottom: "0.6rem" }}>
              Set a shareholder&rsquo;s shares
            </p>

            <form action={setHolding}>
              <div className="dash-formgrid">
                <label>
                  <span className="dash-field-label">Shareholder</span>
                  <select name="holder" required className="dash-select">
                    <option value="">Select…</option>
                    {partners.map((s) => (
                      <option key={`user:${s.id}`} value={`USER:${s.id}`}>
                        {s.name ?? s.email}
                      </option>
                    ))}
                    {organizations.map((organization) => (
                      <option
                        key={`organization:${organization.id}`}
                        value={`ORGANIZATION:${organization.id}`}
                      >
                        {organization.name} (organization)
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="dash-field-label">Shares they hold</span>
                  <input
                    type="number"
                    name="shares"
                    min={0}
                    step={1}
                    required
                    placeholder="100"
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
                  Save
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
                  Enter the total they should hold, not the change. Someone on
                  100 set to 150 is recorded as +50; set to 80 it&rsquo;s a
                  buyback of 20. Zero, or the Remove button above, clears them
                  out. Every change keeps its history.
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
            subtitle="Splits an amount across partner wallets by holding. Organization-held shares remain with the company."
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
