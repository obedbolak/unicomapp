import { Fragment } from "react";
import { prisma } from "@/lib/prisma";
import {
  createProject,
  toggleProjectPublished,
  updateProjectStatus,
} from "../actions";
import {
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
import ProjectManage from "@/components/dashboard/ProjectManage";
import StatusSelect from "@/components/dashboard/StatusSelect";
import ProjectFields, {
  PROJECT_STATUSES,
  humanise,
} from "@/components/dashboard/ProjectFields";

const statusOptions = PROJECT_STATUSES.map((s) => ({
  value: s,
  label: humanise(s),
}));

export const dynamic = "force-dynamic";

/**
 * Section order is the life of a project, not the alphabet: what is being
 * worked on sits at the top, what is finished or abandoned sinks. Cancelled
 * last, because it is the one you almost never want to look at.
 */
const SECTIONS: {
  status: (typeof PROJECT_STATUSES)[number];
  blurb: string;
}[] = [
  { status: "IN_PROGRESS", blurb: "Being worked on right now." },
  { status: "REVIEW", blurb: "Built, waiting on sign-off." },
  { status: "PLANNING", blurb: "Scoped but not started." },
  { status: "MAINTENANCE", blurb: "Live, still being looked after." },
  { status: "ON_HOLD", blurb: "Paused." },
  { status: "DELIVERED", blurb: "Finished and handed over." },
  { status: "CANCELLED", blurb: "Abandoned. Nothing will be credited." },
];

export default async function ProjectsPage() {
  const [projects, clientRows, leadRows, clients, active, delivered] =
    await Promise.all([
      prisma.project.findMany({
        orderBy: [{ sortOrder: "asc" }, { dueDate: "asc" }, { title: "asc" }],
        include: {
          client: { select: { name: true } },
          lead: { select: { name: true } },
          _count: { select: { tasks: true, milestones: true } },
        },
      }),
      prisma.client.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.user.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true },
      }),
      prisma.client.count(),
      prisma.project.count({
        where: { status: { in: ["PLANNING", "IN_PROGRESS", "REVIEW"] } },
      }),
      prisma.project.count({ where: { status: "DELIVERED" } }),
    ]);

  const published = projects.filter((p) => p.published).length;

  // Passed down so the manage panel doesn't re-query these per open row.
  const clientOptions = clientRows.map((c) => ({ id: c.id, label: c.name }));
  const leadOptions = leadRows.map((l) => ({
    id: l.id,
    label: l.name ?? l.email,
  }));

  return (
    <>
      <PageHeader
        title="Projects & clients"
        subtitle="Grouped by where each one stands. Published projects appear on the public /projects page."
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

      {/* ── New ── */}
      <Card
        title="Add a project"
        subtitle="Only a title and the short blurb are required — everything else can be filled in later from Manage."
        style={{ marginBottom: "1.5rem" }}
      >
        <details>
          <summary
            style={{
              cursor: "pointer",
              fontSize: "0.8rem",
              color: "var(--dash-ink-muted)",
              padding: "0.2rem 0",
            }}
          >
            New project
          </summary>

          <form action={createProject} style={{ paddingTop: "0.9rem" }}>
            <ProjectFields
              idPrefix="new"
              clients={clientOptions}
              leads={leadOptions}
            />
            <button
              type="submit"
              className="dash-btn dash-btn--primary"
              style={{ marginTop: "1rem" }}
            >
              Create project
            </button>
          </form>
        </details>
      </Card>

      {/* ── By state ── */}
      {SECTIONS.map((section) => {
        const rows = projects.filter((p) => p.status === section.status);
        if (rows.length === 0) return null;

        return (
          <Card
            key={section.status}
            title={`${humanise(section.status)} · ${rows.length}`}
            subtitle={section.blurb}
            flush
            style={{ marginBottom: "1.5rem" }}
          >
            <Table
              headers={[
                "Project",
                "Client",
                "Lead",
                "Budget",
                "Due",
                "Public",
                "Move to",
              ]}
              empty="Nothing here."
            >
              {rows.map((p) => (
                <Fragment key={p.id}>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.title}</div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--dash-ink-muted)",
                        }}
                      >
                        {humanise(p.category)} · {p._count.tasks} task
                        {p._count.tasks === 1 ? "" : "s"} ·{" "}
                        {p._count.milestones} milestone
                        {p._count.milestones === 1 ? "" : "s"}
                      </div>
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
                      <StatusSelect
                        id={p.id}
                        current={p.status}
                        options={statusOptions}
                        action={updateProjectStatus}
                        buttonLabel="Move"
                      />
                    </td>
                  </tr>

                  {/* Everything about the project, one row down. Collapsed so
                      the section stays a scannable list until you need it. */}
                  <tr>
                    <td colSpan={7} style={{ paddingTop: 0 }}>
                      <details>
                        <summary
                          style={{
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            color: "var(--dash-ink-muted)",
                            padding: "0.25rem 0",
                          }}
                        >
                          Manage — {p.title}
                        </summary>
                        <ProjectManage
                          projectId={p.id}
                          clients={clientOptions}
                          leads={leadOptions}
                        />
                      </details>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </Table>
          </Card>
        );
      })}

      {projects.length === 0 && (
        <Card>
          <p className="dash-hint" style={{ marginTop: 0 }}>
            No projects yet. Add one above, or run the seed to import the nine
            case studies from the site.
          </p>
        </Card>
      )}

    </>
  );
}
