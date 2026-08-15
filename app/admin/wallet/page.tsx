import { prisma } from "@/lib/prisma";
import { getWallet } from "@/lib/wallet";
import { addEarning, decidePayout } from "../wallet-actions";
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
    select: { id: true, name: true, email: true, image: true },
  });

  // One wallet per person. Fine at team scale; if this ever grows past a few
  // dozen people, replace with a single grouped aggregate.
  const wallets = await Promise.all(
    staff.map(async (s) => ({ ...s, wallet: await getWallet(s.id) })),
  );

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
