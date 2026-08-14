import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updateTaskStatus } from "../admin/actions";
import {
  Badge,
  PageHeader,
  StatGrid,
  StatTile,
  Table,
  card,
  font,
  shortDate,
  td,
  tdMuted,
} from "@/components/dashboard/ui";
import type { TaskStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

export default async function StaffDashboard() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const [tasks, projects, openCount, dueSoon] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: user.id, status: { not: "DONE" } },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 50,
      include: { project: { select: { title: true } } },
    }),
    prisma.project.findMany({
      where: {
        OR: [{ leadId: user.id }, { assignments: { some: { userId: user.id } } }],
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
        dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return (
    <>
      <PageHeader
        title={`Hi ${(user.name ?? "there").split(" ")[0]}`}
        subtitle="Your projects and everything on your plate."
      />

      <StatGrid>
        <StatTile label="Open tasks" value={openCount} />
        <StatTile
          label="Due this week"
          value={dueSoon}
          accent={dueSoon > 0 ? "#fbbf24" : "#64748b"}
        />
        <StatTile label="Projects" value={projects.length} />
      </StatGrid>

      <h2 style={sectionHeading}>My projects</h2>

      {projects.length === 0 ? (
        <div
          style={{
            ...card,
            fontFamily: font,
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            textAlign: "center",
            padding: "2.5rem 1.5rem",
            marginBottom: "2rem",
          }}
        >
          You&apos;re not assigned to any project yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {projects.map((p) => (
            <div key={p.id} style={card}>
              <Badge value={p.status} />
              <h3
                style={{
                  fontFamily: font,
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  margin: "0.75rem 0 0.25rem",
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontFamily: font,
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {p.client?.name ?? "Internal"} · {p._count.tasks} task
                {p._count.tasks === 1 ? "" : "s"}
              </p>
              {p.milestones[0] && (
                <p
                  style={{
                    fontFamily: font,
                    fontSize: "0.75rem",
                    color: "var(--color-text)",
                    margin: "0.75rem 0 0",
                  }}
                >
                  Next: {p.milestones[0].title}
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {" "}
                    · {shortDate(p.milestones[0].dueDate)}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <h2 style={sectionHeading}>My tasks</h2>

      <Table
        headers={["Task", "Project", "Priority", "Due", "Status"]}
        empty="Nothing assigned to you right now."
      >
        {tasks.map((t) => (
          <tr key={t.id}>
            <td style={{ ...td, fontWeight: 600 }}>{t.title}</td>
            <td style={tdMuted}>{t.project?.title ?? "—"}</td>
            <td style={td}>
              <Badge value={t.priority} />
            </td>
            <td style={tdMuted}>{shortDate(t.dueDate)}</td>
            <td style={td}>
              <form
                action={updateTaskStatus}
                style={{ display: "flex", gap: "0.35rem" }}
              >
                <input type="hidden" name="id" value={t.id} />
                <select
                  name="status"
                  defaultValue={t.status}
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
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

const sectionHeading: React.CSSProperties = {
  fontFamily: font,
  fontSize: "1rem",
  fontWeight: 800,
  color: "var(--color-text)",
  margin: "0 0 0.9rem",
};

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
};
