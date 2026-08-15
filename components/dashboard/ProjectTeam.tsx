// components/dashboard/ProjectTeam.tsx
// Assign people to a project and set each one's revenue share.
//
// Rendered per project row on /admin/projects inside a <details>, so the page
// stays a scannable table until you actually want to edit a team.

import { prisma } from "@/lib/prisma";
import { assignToProject, removeAssignment } from "@/app/admin/wallet-actions";
import { money } from "./ui";

export default async function ProjectTeam({
  projectId,
  budget,
  currency,
}: {
  projectId: string;
  budget: string | null;
  currency: string;
}) {
  const [assignments, staff] = await Promise.all([
    prisma.projectAssignment.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { assignedAt: "asc" },
    }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const assignedIds = new Set(assignments.map((a) => a.userId));
  const available = staff.filter((s) => !assignedIds.has(s.id));

  const totalPct = assignments.reduce(
    (sum, a) => sum + Number(a.sharePct ?? 0),
    0,
  );
  const budgetNum = budget ? Number(budget) : 0;

  return (
    <div style={{ padding: "0.5rem 0 0.25rem" }}>
      {assignments.length > 0 && (
        <table className="dash-table" style={{ minWidth: 0, marginBottom: "0.75rem" }}>
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Share</th>
              <th>Worth</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id}>
                <td>{a.user.name ?? a.user.email}</td>
                <td className="dash-td-muted">{a.role ?? "—"}</td>
                <td>{a.sharePct ? `${Number(a.sharePct)}%` : "—"}</td>
                <td className="dash-nowrap dash-td-muted">
                  {a.sharePct && budgetNum
                    ? money(
                        Math.round((budgetNum * Number(a.sharePct)) / 100),
                        currency,
                      )
                    : "—"}
                </td>
                <td>
                  <form action={removeAssignment}>
                    <input type="hidden" name="assignmentId" value={a.id} />
                    <button type="submit" className="dash-btn">
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="dash-hint" style={{ marginTop: 0 }}>
        {totalPct > 0 ? (
          <>
            Shares allocated: <strong>{totalPct}%</strong>
            {totalPct > 100 && (
              <span style={{ color: "#f87171" }}>
                {" "}
                — over budget, delivery will refuse to credit
              </span>
            )}
            {budgetNum === 0 && (
              <span style={{ color: "#fbbf24" }}>
                {" "}
                — set a project budget or shares are worth nothing
              </span>
            )}
          </>
        ) : (
          "No revenue shares set. Shares are credited when this project is marked delivered."
        )}
      </p>

      {available.length > 0 && (
        <form action={assignToProject} style={{ marginTop: "0.75rem" }}>
          <input type="hidden" name="projectId" value={projectId} />
          <div className="dash-formgrid">
            <label>
              <span className="dash-field-label">Assign</span>
              <select name="userId" required className="dash-select">
                <option value="">Select…</option>
                {available.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? s.email}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="dash-field-label">Role</span>
              <input
                name="role"
                maxLength={60}
                placeholder="Frontend"
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">Share %</span>
              <input
                type="number"
                name="sharePct"
                min={0}
                max={100}
                step="0.5"
                placeholder="20"
                className="dash-input"
              />
            </label>

            <button type="submit" className="dash-btn dash-btn--primary">
              Add
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
