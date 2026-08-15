import { prisma } from "@/lib/prisma";
import { toggleProjectPublished, updateProjectStatus } from "../actions";
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
  IconBriefcase,
  IconCheck,
  IconExternal,
  IconTeam,
} from "@/components/dashboard/icons";
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

  const published = projects.filter((p) => p.published).length;

  return (
    <>
      <PageHeader
        title="Projects & clients"
        subtitle="Published projects appear on the public /projects page."
      />

      <StatGrid>
        <StatTile label="Clients" value={clients} icon={<IconTeam size={20} />} />
        <StatTile
          label="Active"
          value={active}
          icon={<IconBriefcase size={20} />}
        />
        <StatTile
          label="Delivered"
          value={delivered}
          icon={<IconCheck size={20} />}
        />
        <StatTile
          label="On the site"
          value={published}
          hint={`of ${projects.length} total`}
          icon={<IconExternal size={20} />}
        />
      </StatGrid>

      <Card flush>
        <Table
          headers={[
            "Project",
            "Client",
            "Lead",
            "Budget",
            "Due",
            "Public",
            "Status",
          ]}
          empty="No projects yet — run the seed to import the nine case studies from the site."
        >
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <div style={{ fontWeight: 700 }}>{p.title}</div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--dash-ink-muted)",
                  }}
                >
                  {p.category.replace(/_/g, " ").toLowerCase()} ·{" "}
                  {p._count.tasks} task{p._count.tasks === 1 ? "" : "s"}
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
              <td className="dash-td-muted">{p.client?.name ?? "—"}</td>
              <td className="dash-td-muted">{p.lead?.name ?? "—"}</td>
              <td className="dash-td-muted">
                {p.budget ? money(p.budget.toString(), p.currency) : "—"}
              </td>
              <td className="dash-td-muted">{shortDate(p.dueDate)}</td>
              <td>
                <form action={toggleProjectPublished}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="dash-btn">
                    {p.published ? "Published" : "Hidden"}
                  </button>
                </form>
              </td>
              <td>
                <form
                  action={updateProjectStatus}
                  style={{ display: "flex", gap: "0.35rem" }}
                >
                  <input type="hidden" name="id" value={p.id} />
                  <select
                    name="status"
                    defaultValue={p.status}
                    className="dash-select"
                    style={{ width: "auto" }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="dash-btn">
                    Save
                  </button>
                </form>
                <div style={{ marginTop: "0.4rem" }}>
                  <Badge value={p.status} />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
