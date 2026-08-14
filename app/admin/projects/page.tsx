import { prisma } from "@/lib/prisma";
import { toggleProjectPublished, updateProjectStatus } from "../actions";
import {
  Badge,
  PageHeader,
  StatGrid,
  StatTile,
  Table,
  font,
  money,
  shortDate,
  td,
  tdMuted,
} from "@/components/dashboard/ui";
import type { ProjectStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: ProjectStatus[] = [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "DELIVERED",
  "MAINTENANCE",
  "ON_HOLD",
  "CANCELLED",
];

export default async function ProjectsPage() {
  const [projects, clients, active, delivered] = await Promise.all([
    prisma.project.findMany({
      orderBy: [{ status: "asc" }, { sortOrder: "asc" }],
      include: {
        client: { select: { name: true } },
        lead: { select: { name: true } },
        _count: { select: { tasks: true, milestones: true } },
      },
    }),
    prisma.client.count(),
    prisma.project.count({
      where: { status: { in: ["PLANNING", "IN_PROGRESS", "REVIEW"] } },
    }),
    prisma.project.count({ where: { status: "DELIVERED" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Projects & clients"
        subtitle="Published projects appear on the public /projects page."
      />

      <StatGrid>
        <StatTile label="Clients" value={clients} />
        <StatTile label="Active" value={active} accent="#3b82f6" />
        <StatTile label="Delivered" value={delivered} accent="#22c55e" />
        <StatTile
          label="On the site"
          value={projects.filter((p) => p.published).length}
          hint={`of ${projects.length} total`}
        />
      </StatGrid>

      <Table
        headers={["Project", "Client", "Lead", "Budget", "Due", "Public", "Status"]}
        empty="No projects yet — run the seed to import the nine case studies from the site."
      >
        {projects.map((p) => (
          <tr key={p.id}>
            <td style={td}>
              <div style={{ fontWeight: 700 }}>{p.title}</div>
              <div
                style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}
              >
                {p.category.replace(/_/g, " ")} · {p._count.tasks} task
                {p._count.tasks === 1 ? "" : "s"}
              </div>
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-primary)",
                  }}
                >
                  {p.liveUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
            </td>
            <td style={tdMuted}>{p.client?.name ?? "—"}</td>
            <td style={tdMuted}>{p.lead?.name ?? "—"}</td>
            <td style={tdMuted}>
              {p.budget ? money(p.budget.toString(), p.currency) : "—"}
            </td>
            <td style={tdMuted}>{shortDate(p.dueDate)}</td>
            <td style={td}>
              <form action={toggleProjectPublished}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" style={smallBtn}>
                  {p.published ? "Published" : "Hidden"}
                </button>
              </form>
            </td>
            <td style={td}>
              <form
                action={updateProjectStatus}
                style={{ display: "flex", gap: "0.35rem" }}
              >
                <input type="hidden" name="id" value={p.id} />
                <select
                  name="status"
                  defaultValue={p.status}
                  style={selectStyle}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} style={optionStyle}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <button type="submit" style={smallBtn}>
                  Save
                </button>
              </form>
              <div style={{ marginTop: "0.35rem" }}>
                <Badge value={p.status} />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "0.35rem 0.5rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--color-text)",
  fontFamily: font,
  fontSize: "0.75rem",
  outline: "none",
};

const optionStyle: React.CSSProperties = { background: "#111", color: "#fff" };

const smallBtn: React.CSSProperties = {
  padding: "0.35rem 0.6rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text)",
  fontFamily: font,
  fontSize: "0.7rem",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
