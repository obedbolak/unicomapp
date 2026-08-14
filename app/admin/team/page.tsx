import { prisma } from "@/lib/prisma";
import {
  Badge,
  PageHeader,
  Table,
  td,
  tdMuted,
} from "@/components/dashboard/ui";

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
        subtitle="Everyone with access. Roles decide what they can see."
      />

      <Table
        headers={["Name", "Role", "Department", "Projects", "Open tasks", "Access"]}
        empty="No team members yet — run the seed."
      >
        {team.map((u) => (
          <tr key={u.id}>
            <td style={td}>
              <div style={{ fontWeight: 700 }}>{u.name ?? "—"}</div>
              <div
                style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}
              >
                {u.email}
              </div>
            </td>
            <td style={td}>
              {u.role.map((r) => (
                <span key={r} style={{ marginRight: 4 }}>
                  <Badge value={r} />
                </span>
              ))}
            </td>
            <td style={tdMuted}>
              {u.title ?? "—"}
              <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                {u.department ?? ""}
              </div>
            </td>
            <td style={tdMuted}>
              {u._count.assignments + u._count.ledProjects}
            </td>
            <td style={tdMuted}>{u._count.tasks}</td>
            <td style={td}>
              <Badge value={u.active ? "ACTIVE" : "INACTIVE"} />
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
