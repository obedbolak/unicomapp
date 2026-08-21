// components/dashboard/ProjectTeam.tsx
// Who is working on a project, and in what role. Nothing else.
//
// Company equity is a separate thing entirely and lives on /admin/wallet —
// deliberately not surfaced here.
//
// Rendered per project row on /admin/projects inside a <details>, so the page
// stays a scannable table until you actually want to edit a team.

import { prisma } from "@/lib/prisma";
import { assignToProject, removeAssignment } from "@/app/admin/wallet-actions";

export default async function ProjectTeam({
  projectId,
}: {
  projectId: string;
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

  return (
    <div style={{ padding: "0.5rem 0 0.25rem" }}>
      {assignments.length > 0 && (
        <table
          className="dash-table"
          style={{ minWidth: 0, marginBottom: "0.75rem" }}
        >
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id}>
                <td>{a.user.name ?? a.user.email}</td>

                {/* Editable in place. assignToProject upserts on
                    (projectId, userId), so saving updates the existing
                    assignment rather than creating a second one. */}
                <td>
                  <form action={assignToProject} className="dash-inline-form">
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="userId" value={a.userId} />
                    <input
                      name="role"
                      maxLength={60}
                      defaultValue={a.role ?? ""}
                      placeholder="Frontend"
                      aria-label={`Role for ${a.user.name ?? a.user.email}`}
                      className="dash-input"
                      style={{ width: 150 }}
                    />
                    <button type="submit" className="dash-btn">
                      Save
                    </button>
                  </form>
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

      {assignments.length === 0 && (
        <p className="dash-hint" style={{ marginTop: 0 }}>
          Nobody is assigned to this project yet.
        </p>
      )}

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

            <button type="submit" className="dash-btn dash-btn--primary">
              Add
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
