// components/dashboard/ProjectManage.tsx
// Everything about one project, in the row that expands under it.
//
// What it leads with depends on the project's state: an active project shows
// how long is left and shouts when that has run out, a delivered one shows when
// it landed and what it paid, a cancelled one says plainly that it will pay
// nothing. The same facts in every state would make the interesting ones hard
// to spot.

import { prisma } from "@/lib/prisma";
import { createTask, deleteProject, updateProject } from "@/app/admin/actions";
import ProjectTeam from "./ProjectTeam";
import ProjectFields, { humanise } from "./ProjectFields";
import { Badge, money, shortDate } from "./ui";

type Option = { id: string; label: string };

const DAY = 1000 * 60 * 60 * 24;

function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / DAY);
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="dash-field-label"
        style={{ marginBottom: "0.15rem", opacity: 0.75 }}
      >
        {label}
      </p>
      <div style={{ fontSize: "0.85rem" }}>{children}</div>
    </div>
  );
}

export default async function ProjectManage({
  projectId,
  clients,
  leads,
}: {
  projectId: string;
  clients: Option[];
  leads: Option[];
}) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: { select: { name: true, email: true, phone: true } },
      lead: { select: { name: true, email: true } },
      milestones: { orderBy: { sortOrder: "asc" } },
      _count: {
        select: {
          tasks: true,
          milestones: true,
          invoices: true,
          timeEntries: true,
          assignments: true,
          earnings: true,
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!project) {
    return <p className="dash-hint">This project no longer exists.</p>;
  }

  const projectMembers = [
    ...(project.lead
      ? [
          {
            id: project.leadId!,
            name: project.lead.name,
            email: project.lead.email,
          },
        ]
      : []),
    ...(
      await prisma.projectAssignment.findMany({
        where: { projectId },
        select: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { assignedAt: "asc" },
      })
    ).map((assignment) => assignment.user),
  ].filter(
    (member, index, members) =>
      members.findIndex((item) => item.id === member.id) === index,
  );

  const [doneTasks, credited] = await Promise.all([
    prisma.task.count({ where: { projectId, status: "DONE" } }),
    prisma.earning.aggregate({
      where: { projectId, status: "CREDITED" },
      _sum: { amount: true },
    }),
  ]);

  const now = new Date();
  const paidOut = Number(credited._sum.amount ?? 0);
  const settled =
    project.status === "DELIVERED" || project.status === "CANCELLED";
  const daysLeft = project.dueDate ? daysBetween(now, project.dueDate) : null;
  const overdue = daysLeft !== null && daysLeft < 0 && !settled;

  // ── The one line that changes with state ──
  let banner: { tone: string; text: string };
  switch (project.status) {
    case "PLANNING":
      banner = {
        tone: "#8b5cf6",
        text: project.startDate
          ? `Starts ${shortDate(project.startDate)}. Nothing is being tracked against it yet.`
          : "Still being scoped — no start date set.",
      };
      break;
    case "IN_PROGRESS":
    case "REVIEW":
      banner = overdue
        ? {
            tone: "#f87171",
            text: `Overdue by ${Math.abs(daysLeft!)} day${Math.abs(daysLeft!) === 1 ? "" : "s"} — it was due ${shortDate(project.dueDate)}.`,
          }
        : {
            tone: project.status === "REVIEW" ? "#fbbf24" : "#3b82f6",
            text:
              daysLeft === null
                ? "No due date set, so nothing is tracking how late this is getting."
                : `${daysLeft} day${daysLeft === 1 ? "" : "s"} until it's due on ${shortDate(project.dueDate)}.`,
          };
      break;
    case "DELIVERED":
      banner = {
        tone: "#22c55e",
        text: `Delivered ${shortDate(project.deliveredAt ?? project.updatedAt)}${
          paidOut > 0
            ? ` · ${money(paidOut, project.currency)} credited to the team`
            : " · nothing credited to the team"
        }.`,
      };
      break;
    case "MAINTENANCE":
      banner = { tone: "#06b6d4", text: "Live and under maintenance." };
      break;
    case "ON_HOLD":
      banner = {
        tone: "#f59e0b",
        text: "Paused. Nothing is expected to move until it's picked back up.",
      };
      break;
    default:
      banner = {
        tone: "#f87171",
        text: "Cancelled. Nothing further will be credited against it.",
      };
  }

  return (
    <div style={{ padding: "0.75rem 0 0.5rem" }}>
      {/* ── State ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.7rem",
          padding: "0.7rem 0.9rem",
          borderRadius: 12,
          background: `${banner.tone}14`,
          border: `1px solid ${banner.tone}44`,
          marginBottom: "1rem",
        }}
      >
        <Badge value={project.status} />
        <span style={{ fontSize: "0.82rem", color: "var(--dash-ink-muted)" }}>
          {banner.text}
        </span>
      </div>

      {/* ── Facts ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.9rem 1.2rem",
          marginBottom: "1rem",
        }}
      >
        <Detail label="Client">
          {project.client?.name ?? "—"}
          {project.client?.email && (
            <div className="dash-td-muted" style={{ fontSize: "0.72rem" }}>
              {project.client.email}
            </div>
          )}
        </Detail>
        <Detail label="Lead">{project.lead?.name ?? "Nobody yet"}</Detail>
        <Detail label="Category">{humanise(project.category)}</Detail>
        <Detail label="Budget">
          {project.budget
            ? money(project.budget.toString(), project.currency)
            : "Not set"}
        </Detail>
        <Detail label="Credited so far">
          {paidOut > 0 ? money(paidOut, project.currency) : "—"}
        </Detail>
        <Detail label="Started">{shortDate(project.startDate)}</Detail>
        <Detail label="Due">
          <span
            style={overdue ? { color: "#f87171", fontWeight: 700 } : undefined}
          >
            {shortDate(project.dueDate)}
          </span>
        </Detail>
        <Detail label="Delivered">{shortDate(project.deliveredAt)}</Detail>
        <Detail label="Tasks">
          {doneTasks}/{project._count.tasks} done
        </Detail>
        <Detail label="Milestones">{project._count.milestones}</Detail>
        <Detail label="Invoices">{project._count.invoices}</Detail>
        <Detail label="Time entries">{project._count.timeEntries}</Detail>
        <Detail label="Public page">
          {project.published ? "Published" : "Hidden"}
          {project.featured && " · featured"}
        </Detail>
        <Detail label="Slug">
          <code style={{ fontSize: "0.75rem" }}>/{project.slug}</code>
        </Detail>
      </div>

      {(project.liveUrl || project.repoUrl) && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
            fontSize: "0.8rem",
          }}
        >
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-primary)" }}
            >
              {project.liveUrl.replace(/^https?:\/\//, "")}
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--dash-ink-muted)" }}
            >
              {project.repoUrl.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      )}

      {project.description && (
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--dash-ink-muted)",
            marginBottom: "0.6rem",
          }}
        >
          {project.description}
        </p>
      )}

      {project.longDescription && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--dash-ink-dim)",
            whiteSpace: "pre-wrap",
            marginBottom: "0.6rem",
          }}
        >
          {project.longDescription}
        </p>
      )}

      {project.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem",
            marginBottom: "1rem",
          }}
        >
          {project.tags.map((t) => (
            <span
              key={t}
              className="dash-badge"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--dash-card-border)",
                color: "var(--dash-ink-dim)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {project.milestones.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <p className="dash-field-label">Milestones</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {project.milestones.map((m) => (
              <li
                key={m.id}
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  alignItems: "baseline",
                  fontSize: "0.8rem",
                  padding: "0.25rem 0",
                  opacity: m.completedAt ? 0.55 : 1,
                }}
              >
                <span style={{ color: m.completedAt ? "#22c55e" : "#94a3b8" }}>
                  {m.completedAt ? "✓" : "○"}
                </span>
                <span
                  style={{
                    textDecoration: m.completedAt ? "line-through" : undefined,
                  }}
                >
                  {m.title}
                </span>
                <span
                  className="dash-td-muted"
                  style={{ fontSize: "0.72rem", marginLeft: "auto" }}
                >
                  {shortDate(m.completedAt ?? m.dueDate)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dash-rule" style={{ margin: "1rem 0" }} />

      {/* ── Team ── */}
      <p className="dash-field-label">
        Team — {project._count.assignments} assigned
      </p>
      <ProjectTeam projectId={project.id} />

      <div className="dash-rule" style={{ margin: "1rem 0" }} />

      <p className="dash-field-label">Tasks — {project.tasks.length}</p>
      {project.tasks.length > 0 && (
        <div
          style={{ display: "grid", gap: "0.45rem", marginBottom: "0.8rem" }}
        >
          {project.tasks.map((task) => (
            <div key={task.id} className="dash-row-top">
              <span>
                <strong>{task.title}</strong>
                <span
                  className="dash-td-muted"
                  style={{ display: "block", fontSize: "0.72rem" }}
                >
                  {task.assignee?.name ?? task.assignee?.email ?? "Unassigned"}
                </span>
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "0.35rem",
                  alignItems: "center",
                }}
              >
                <Badge value={task.priority} />
                <Badge value={task.status} />
              </span>
            </div>
          ))}
        </div>
      )}
      {projectMembers.length > 0 ? (
        <form
          action={createTask}
          className="dash-formgrid"
          style={{ marginTop: "0.7rem" }}
        >
          <input type="hidden" name="projectId" value={project.id} />
          <label>
            <span className="dash-field-label">New task</span>
            <input
              name="title"
              required
              maxLength={200}
              className="dash-input"
              placeholder="Task title"
            />
          </label>
          <label>
            <span className="dash-field-label">Assign to</span>
            <select name="assigneeId" required className="dash-select">
              <option value="">Select…</option>
              {projectMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name ?? member.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="dash-field-label">Priority</span>
            <select
              name="priority"
              defaultValue="MEDIUM"
              className="dash-select"
            >
              {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="dash-field-label">Due</span>
            <input name="dueDate" type="date" className="dash-input" />
          </label>
          <button type="submit" className="dash-btn dash-btn--primary">
            Add task
          </button>
        </form>
      ) : (
        <p className="dash-hint">Assign a team member before creating tasks.</p>
      )}

      <div className="dash-rule" style={{ margin: "1rem 0" }} />

      {/* ── Edit ── */}
      <details>
        <summary
          style={{
            cursor: "pointer",
            fontSize: "0.78rem",
            color: "var(--dash-ink-muted)",
            padding: "0.2rem 0",
          }}
        >
          Edit details
        </summary>

        <form action={updateProject} style={{ paddingTop: "0.9rem" }}>
          <input type="hidden" name="id" value={project.id} />
          <ProjectFields
            idPrefix={`edit-${project.id}`}
            clients={clients}
            leads={leads}
            defaults={{
              title: project.title,
              description: project.description,
              longDescription: project.longDescription,
              category: project.category,
              status: project.status,
              tags: project.tags,
              liveUrl: project.liveUrl,
              repoUrl: project.repoUrl,
              coverImage: project.coverImage,
              clientId: project.clientId,
              leadId: project.leadId,
              budget: project.budget ? project.budget.toString() : null,
              currency: project.currency,
              startDate: project.startDate,
              dueDate: project.dueDate,
              published: project.published,
              featured: project.featured,
            }}
          />

          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            style={{ marginTop: "1rem" }}
          >
            Save project
          </button>

          <p className="dash-hint">
            Renaming changes the public URL — the slug follows the title.
            Setting the status to Delivered here credits the team exactly as the
            dropdown in the row does.
          </p>
        </form>
      </details>

      {/* ── Danger ── */}
      {project._count.earnings === 0 && project._count.invoices === 0 && (
        <details style={{ marginTop: "0.5rem" }}>
          <summary
            style={{
              cursor: "pointer",
              fontSize: "0.78rem",
              color: "#f87171",
              padding: "0.2rem 0",
            }}
          >
            Delete project
          </summary>
          <div style={{ paddingTop: "0.6rem" }}>
            <form action={deleteProject}>
              <input type="hidden" name="id" value={project.id} />
              <button
                type="submit"
                className="dash-btn"
                style={{ color: "#f87171" }}
              >
                Delete {project.title} permanently
              </button>
            </form>
            <p className="dash-hint">
              Tasks, milestones and assignments go with it. Once a project has
              earnings or invoices attached this option disappears — cancel it
              instead.
            </p>
          </div>
        </details>
      )}
    </div>
  );
}
