import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  deleteTeamMember,
  resetUserPassword,
  setUserRole,
  toggleUserActive,
} from "../team-actions";
import { Badge, Card, PageHeader, Table } from "@/components/dashboard/ui";
import NewMemberForm from "@/components/dashboard/NewMemberForm";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const admin = await requireAdmin();

  const team = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          assignments: true,
          ledProjects: true,
          tasks: true,
          earnings: true,
          payoutRequests: true,
        },
      },
    },
  });

  const activeAdmins = team.filter(
    (u) => u.active && u.role.includes("ADMIN"),
  ).length;

  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Everyone with access. Roles decide which dashboard they land on."
      />

      <Card
        title="Add a team member"
        subtitle="Creates a login immediately. There's no invite email yet, so hand them the password yourself."
        style={{ marginBottom: "1.5rem" }}
      >
        <NewMemberForm />
      </Card>

      <Card flush>
        <Table
          headers={[
            "Name",
            "Role",
            "Title",
            "Projects",
            "Tasks",
            "Access",
            "Manage",
          ]}
          empty="No team members yet — run the seed."
        >
          {team.map((u) => {
            const isSelf = u.id === admin?.id;
            const isLastAdmin =
              u.role.includes("ADMIN") && u.active && activeAdmins <= 1;
            // Deleting someone with money history would cascade their earnings
            // and payouts away, so the option is not offered.
            const hasFinancials =
              u._count.earnings > 0 || u._count.payoutRequests > 0;

            return (
              <tr key={u.id} style={{ opacity: u.active ? 1 : 0.55 }}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.65rem",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 11,
                        flex: "none",
                        display: "grid",
                        placeItems: "center",
                        background: u.image
                          ? `center/cover url(${u.image})`
                          : "var(--gradient-primary)",
                        color: "#100a02",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                      }}
                    >
                      {!u.image && (u.name ?? u.email).charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {u.name ?? "—"}
                        {isSelf && (
                          <span
                            className="dash-td-muted"
                            style={{ fontWeight: 400, fontSize: "0.7rem" }}
                          >
                            {" "}
                            (you)
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--dash-ink-muted)",
                        }}
                      >
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <form action={setUserRole} className="dash-inline-form">
                    <input type="hidden" name="id" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role.includes("ADMIN") ? "ADMIN" : "STAFF"}
                      className="dash-select"
                      style={{ width: "auto" }}
                      disabled={isLastAdmin}
                    >
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="dash-btn"
                      disabled={isLastAdmin}
                    >
                      Set
                    </button>
                  </form>
                </td>

                <td className="dash-td-muted">
                  {u.title ?? "—"}
                  <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                    {u.department ?? ""}
                  </div>
                </td>

                <td
                  className="dash-td-muted"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {u._count.assignments + u._count.ledProjects}
                </td>
                <td
                  className="dash-td-muted"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {u._count.tasks}
                </td>

                <td>
                  <Badge value={u.active ? "ACTIVE" : "INACTIVE"} />
                </td>

                <td>
                  <details>
                    <summary
                      style={{
                        cursor: "pointer",
                        fontSize: "0.7rem",
                        color: "var(--dash-ink-muted)",
                      }}
                    >
                      Manage
                    </summary>

                    <div style={{ paddingTop: "0.6rem", minWidth: 240 }}>
                      <form
                        action={resetUserPassword}
                        className="dash-inline-form"
                      >
                        <input type="hidden" name="id" value={u.id} />
                        <input
                          name="password"
                          minLength={8}
                          required
                          placeholder="New password"
                          className="dash-input"
                          autoComplete="off"
                        />
                        <button type="submit" className="dash-btn">
                          Reset
                        </button>
                      </form>

                      <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                        <form action={toggleUserActive}>
                          <input type="hidden" name="id" value={u.id} />
                          <button
                            type="submit"
                            className="dash-btn"
                            disabled={isLastAdmin}
                          >
                            {u.active ? "Deactivate" : "Reactivate"}
                          </button>
                        </form>

                        {!hasFinancials && !isSelf && (
                          <form action={deleteTeamMember}>
                            <input type="hidden" name="id" value={u.id} />
                            <button
                              type="submit"
                              className="dash-btn"
                              style={{ color: "#f87171" }}
                            >
                              Delete
                            </button>
                          </form>
                        )}
                      </div>

                      <p
                        className="dash-hint"
                        style={{ marginTop: "0.6rem", fontSize: "0.7rem" }}
                      >
                        {hasFinancials
                          ? `Has ${u._count.earnings} earning(s) and ${u._count.payoutRequests} payout record(s), so deletion is blocked. Deactivating ends access and keeps the history.`
                          : "Deactivating ends access immediately and signs them out everywhere."}
                      </p>
                    </div>
                  </details>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
