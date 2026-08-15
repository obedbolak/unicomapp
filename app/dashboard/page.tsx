import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updateTaskStatus } from "../admin/actions";
import {
  Badge,
  Card,
  StatGrid,
  StatTile,
  Table,
  shortDate,
} from "@/components/dashboard/ui";
import {
  IconBriefcase,
  IconCheck,
  IconTrend,
} from "@/components/dashboard/icons";
import type { TaskStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

export default async function StaffDashboard() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const weekAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [tasks, projects, openCount, dueSoon, doneCount] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: user.id, status: { not: "DONE" } },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 50,
      include: { project: { select: { title: true } } },
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { leadId: user.id },
          { assignments: { some: { userId: user.id } } },
        ],
        status: { notIn: ["CANCELLED"] },
      },
      orderBy: { dueDate: "asc" },
      include: {
        client: { select: { name: true } },
        milestones: {
          where: { completedAt: null },
          orderBy: { dueDate: "asc" },
          take: 1,
        },
        _count: { select: { tasks: true } },
      },
    }),
    prisma.task.count({
      where: { assigneeId: user.id, status: { not: "DONE" } },
    }),
    prisma.task.count({
      where: {
        assigneeId: user.id,
        status: { not: "DONE" },
        dueDate: { lte: weekAhead },
      },
    }),
    prisma.task.count({ where: { assigneeId: user.id, status: "DONE" } }),
  ]);

  const firstName = (user.name ?? "there").split(" ")[0];

  return (
    <>
      <StatGrid>
        <StatTile
          label="Open tasks"
          value={openCount}
          hint={`${doneCount} completed`}
          icon={<IconCheck size={20} />}
        />
        <StatTile
          label="Due this week"
          value={dueSoon}
          hint={dueSoon > 0 ? "Needs attention" : "All clear"}
          icon={<IconTrend size={20} />}
        />
        <StatTile
          label="My projects"
          value={projects.length}
          icon={<IconBriefcase size={20} />}
        />
      </StatGrid>

      <div className="dash-grid dash-grid--hero">
        <section className="dash-card dash-hero">
          <div className="dash-hero-orb" aria-hidden="true" />
          <p className="dash-hero-eyebrow">Welcome back,</p>
          <h2 className="dash-hero-name">{firstName}</h2>
          <p className="dash-hero-text">
            {openCount > 0
              ? `You have ${openCount} open task${openCount === 1 ? "" : "s"}${
                  dueSoon > 0 ? `, ${dueSoon} due within the week` : ""
                }.`
              : "Nothing open right now. Enjoy the quiet."}
          </p>
          <Link href="/" className="dash-hero-link">
            View the site →
          </Link>
        </section>

        <Card title="My projects" subtitle="Everything you're assigned to">
          {projects.length === 0 ? (
            <div className="dash-empty">
              You&apos;re not assigned to any project yet.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
              }}
            >
              {projects.slice(0, 4).map((p) => (
                <div key={p.id}>
                  <div className="dash-row-top">
                    <span className="dash-row-name">{p.title}</span>
                    <Badge value={p.status} />
                  </div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--dash-ink-dim)",
                      margin: 0,
                    }}
                  >
                    {p.client?.name ?? "Internal"} · {p._count.tasks} task
                    {p._count.tasks === 1 ? "" : "s"}
                    {p.milestones[0] &&
                      ` · next: ${p.milestones[0].title} (${shortDate(
                        p.milestones[0].dueDate,
                      )})`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="My tasks" subtitle="Highest priority first" flush>
        <Table
          headers={["Task", "Project", "Priority", "Due", "Status"]}
          empty="Nothing assigned to you right now."
        >
          {tasks.map((t) => (
            <tr key={t.id}>
              <td style={{ fontWeight: 600 }}>{t.title}</td>
              <td className="dash-td-muted">{t.project?.title ?? "—"}</td>
              <td>
                <Badge value={t.priority} />
              </td>
              <td className="dash-td-muted">{shortDate(t.dueDate)}</td>
              <td>
                <form
                  action={updateTaskStatus}
                  style={{ display: "flex", gap: "0.35rem" }}
                >
                  <input type="hidden" name="id" value={t.id} />
                  <select
                    name="status"
                    defaultValue={t.status}
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
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
