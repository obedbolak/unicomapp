import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, Table } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const team = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { assignments: true, ledProjects: true, tasks: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Everyone with access. Roles decide which dashboard they land on."
      />

      <Card flush>
        <Table
          headers={[
            "Name",
            "Role",
            "Title",
            "Projects",
            "Open tasks",
            "Access",
          ]}
          empty="No team members yet — run the seed."
        >
          {team.map((u) => (
            <tr key={u.id}>
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
                    <div style={{ fontWeight: 700 }}>{u.name ?? "—"}</div>
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
                {u.role.map((r) => (
                  <span key={r} style={{ marginRight: 4 }}>
                    <Badge value={r} />
                  </span>
                ))}
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
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
