// components/dashboard/ClaimsCard.tsx
// Staff side of fixed pay: claim a flat amount for a project or for a month,
// then wait for an admin to approve it.
//
// Nothing here counts as money. getWallet sums CREDITED rows only, so a claim
// sitting at PENDING cannot be withdrawn, and is shown apart from the balance
// for exactly that reason.

import { prisma } from "@/lib/prisma";
import { submitClaim, withdrawClaim } from "@/app/admin/wallet-actions";
import { Badge, Card, Table, money, shortDate } from "./ui";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ClaimsCard({ userId }: { userId: string }) {
  const [assignments, claims] = await Promise.all([
    prisma.projectAssignment.findMany({
      where: {
        userId,
        project: { status: { notIn: ["CANCELLED"] } },
      },
      select: {
        project: { select: { id: true, title: true, status: true } },
      },
      orderBy: { assignedAt: "desc" },
    }),
    prisma.earning.findMany({
      where: { userId, source: { in: ["PROJECT_FEE", "MONTHLY"] } },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        project: { select: { title: true } },
        decidedBy: { select: { name: true } },
      },
    }),
  ]);

  const pending = claims.filter((c) => c.status === "PENDING");
  const pendingTotal = pending.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <>
      <Card
        title="Claim payment"
        subtitle="A flat amount for a project you worked on, or for a month. An admin has to approve it before it reaches your balance."
      >
        {assignments.length > 0 ? (
          <form action={submitClaim}>
            <input type="hidden" name="kind" value="PROJECT" />
            <div className="dash-formgrid">
              <label>
                <span className="dash-field-label">Project</span>
                <select name="projectId" required className="dash-select">
                  <option value="">Select…</option>
                  {assignments.map((a) => (
                    <option key={a.project.id} value={a.project.id}>
                      {a.project.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="dash-field-label">Amount (FCFA)</span>
                <input
                  type="number"
                  name="amount"
                  min={1}
                  step={1}
                  required
                  placeholder="150000"
                  className="dash-input"
                />
              </label>

              <label>
                <span className="dash-field-label">Note</span>
                <input
                  name="note"
                  maxLength={200}
                  placeholder="Frontend build, 3 weeks"
                  className="dash-input"
                />
              </label>

              <button type="submit" className="dash-btn dash-btn--primary">
                Claim
              </button>
            </div>
          </form>
        ) : (
          <p className="dash-hint" style={{ marginTop: 0 }}>
            You&rsquo;re not on any project yet, so there is nothing to claim
            against. Monthly pay is below.
          </p>
        )}

        <div className="dash-rule" style={{ margin: "1.1rem 0 0.9rem" }} />

        <form action={submitClaim}>
          <input type="hidden" name="kind" value="MONTH" />
          <div className="dash-formgrid">
            <label>
              <span className="dash-field-label">Month</span>
              <input
                type="month"
                name="periodMonth"
                required
                max={currentMonth()}
                defaultValue={currentMonth()}
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">Amount (FCFA)</span>
              <input
                type="number"
                name="amount"
                min={1}
                step={1}
                required
                placeholder="200000"
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">Note</span>
              <input
                name="note"
                maxLength={200}
                placeholder="August"
                className="dash-input"
              />
            </label>

            <button type="submit" className="dash-btn dash-btn--primary">
              Claim
            </button>
          </div>
        </form>

        <p className="dash-hint">
          One claim per project and one per month. Sending another for the same
          one revises it rather than adding a second — which is how you fix and
          resend something that was turned down. Once approved it is locked.
        </p>
      </Card>

      <div style={{ marginTop: "1.5rem" }}>
        <Card
          title="Your claims"
          subtitle="Pending claims are not part of your balance."
          action={
            pendingTotal > 0 ? (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "var(--color-blue-light)",
                  }}
                >
                  {money(pendingTotal)}
                </div>
                <div
                  style={{ fontSize: "0.6875rem", color: "var(--dash-ink-dim)" }}
                >
                  awaiting approval
                </div>
              </div>
            ) : undefined
          }
          flush
        >
          <Table
            headers={["Sent", "For", "Amount", "Status", ""]}
            empty="You haven't claimed anything yet."
          >
            {claims.map((c) => (
              <tr key={c.id}>
                <td className="dash-nowrap dash-td-muted">
                  {shortDate(c.createdAt)}
                </td>
                <td>
                  {c.source === "MONTHLY"
                    ? c.periodMonth
                    : (c.project?.title ?? "—")}
                  {c.note && (
                    <div
                      className="dash-td-muted"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {c.note}
                    </div>
                  )}
                </td>
                <td className="dash-nowrap" style={{ fontWeight: 700 }}>
                  {money(c.amount.toString(), c.currency)}
                </td>
                <td>
                  <Badge
                    value={c.status === "CANCELLED" ? "REJECTED" : c.status}
                  />
                  {c.decidedBy?.name && (
                    <div
                      className="dash-td-muted"
                      style={{ fontSize: "0.68rem", marginTop: "0.2rem" }}
                    >
                      by {c.decidedBy.name}
                    </div>
                  )}
                </td>
                <td>
                  {c.status === "PENDING" && (
                    <form action={withdrawClaim}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="dash-btn">
                        Withdraw
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
