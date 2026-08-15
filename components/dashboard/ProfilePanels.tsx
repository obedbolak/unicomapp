// components/dashboard/ProfilePanels.tsx
// Shared by /admin/profile and /dashboard/profile.
//
// `canEditTitle` is the only difference between the two. Job title is an
// organisational fact, not a personal preference — staff see theirs but an
// admin sets it from the Team page. The server action enforces this too; the
// disabled input here is only the visible half of the rule.

import { prisma } from "@/lib/prisma";
import { describeAction } from "@/lib/activity";
import {
  changePassword,
  signOutEverywhere,
  updateProfile,
} from "@/app/admin/settings-actions";
import { Card, Table, shortDate } from "./ui";
import AvatarField from "./AvatarField";

function formatMeta(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "—";
  const entries = Object.entries(meta as Record<string, unknown>);
  if (entries.length === 0) return "—";
  return entries.map(([k, v]) => `${k}: ${String(v)}`).join(" · ");
}

export default async function ProfilePanels({
  userId,
  canEditTitle,
}: {
  userId: string;
  canEditTitle: boolean;
}) {
  const [user, recentAuth] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        title: true,
        phone: true,
        bio: true,
        role: true,
        department: true,
        joinedAt: true,
        sessionsValidFrom: true,
      },
    }),
    prisma.activityLog.findMany({
      where: { userId, entity: "Auth" },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  if (!user) return null;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* ── Details ── */}
        <Card
          title="Your details"
          subtitle="Shown on the team page and in the topbar."
        >
          <form action={updateProfile}>
            <div className="dash-formgrid">
              <label>
                <span className="dash-field-label">Full name</span>
                <input
                  name="name"
                  defaultValue={user.name ?? ""}
                  required
                  maxLength={120}
                  className="dash-input"
                />
              </label>

              <label>
                <span className="dash-field-label">
                  Job title{!canEditTitle && " (set by an admin)"}
                </span>
                <input
                  name="title"
                  defaultValue={user.title ?? ""}
                  maxLength={120}
                  readOnly={!canEditTitle}
                  disabled={!canEditTitle}
                  placeholder={canEditTitle ? "Frontend Developer" : "—"}
                  className="dash-input"
                  style={
                    canEditTitle
                      ? undefined
                      : { opacity: 0.55, cursor: "not-allowed" }
                  }
                />
              </label>

              <label>
                <span className="dash-field-label">Phone</span>
                <input
                  name="phone"
                  defaultValue={user.phone ?? ""}
                  maxLength={40}
                  className="dash-input"
                />
              </label>

              <AvatarField defaultValue={user.image} />
            </div>

            <label style={{ display: "block", marginTop: "0.85rem" }}>
              <span className="dash-field-label">Bio</span>
              <textarea
                name="bio"
                defaultValue={user.bio ?? ""}
                maxLength={1000}
                rows={4}
                className="dash-input"
                style={{ resize: "vertical", lineHeight: 1.55 }}
              />
            </label>

            <div className="dash-actions">
              <button type="submit" className="dash-btn dash-btn--primary">
                Save changes
              </button>
            </div>
          </form>

          <div className="dash-rule" style={{ margin: "1.25rem 0 0.9rem" }} />

          <dl className="dash-deflist">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{user.role.join(", ")}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{user.department ?? "—"}</dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{shortDate(user.joinedAt)}</dd>
            </div>
          </dl>
          <p className="dash-hint">
            Email, role{!canEditTitle && ", job title"} and department are set
            by an admin from the Team page.
          </p>
        </Card>

        {/* ── Password ── */}
        <Card
          title="Password"
          subtitle="At least 8 characters. You'll stay signed in on this device."
        >
          <form action={changePassword}>
            <label style={{ display: "block" }}>
              <span className="dash-field-label">Current password</span>
              <input
                type="password"
                name="currentPassword"
                required
                autoComplete="current-password"
                className="dash-input"
              />
            </label>

            <label style={{ display: "block", marginTop: "0.7rem" }}>
              <span className="dash-field-label">New password</span>
              <input
                type="password"
                name="newPassword"
                required
                minLength={8}
                autoComplete="new-password"
                className="dash-input"
              />
            </label>

            <label style={{ display: "block", marginTop: "0.7rem" }}>
              <span className="dash-field-label">Confirm new password</span>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={8}
                autoComplete="new-password"
                className="dash-input"
              />
            </label>

            <div className="dash-actions">
              <button type="submit" className="dash-btn dash-btn--primary">
                Update password
              </button>
            </div>
          </form>
        </Card>
      </div>

      {/* ── Sessions ── */}
      <div style={{ marginTop: "1.5rem" }}>
        <Card
          title="Sessions"
          subtitle="Sign-in activity for your account."
          action={
            <form action={signOutEverywhere}>
              <button type="submit" className="dash-btn">
                Sign out everywhere
              </button>
            </form>
          }
        >
          <p className="dash-hint" style={{ marginTop: 0 }}>
            This app uses JWT sessions, so there is no server-side list of live
            devices to revoke one by one. <strong>Sign out everywhere</strong>{" "}
            stamps your account and every token issued before that moment stops
            working.
            {user.sessionsValidFrom &&
              ` Last revoked ${shortDate(user.sessionsValidFrom)}.`}
          </p>

          <Table
            headers={["When", "Event", "Details"]}
            empty="No sign-in activity recorded yet."
          >
            {recentAuth.map((row) => (
              <tr key={row.id}>
                <td className="dash-nowrap">{shortDate(row.createdAt)}</td>
                <td>{describeAction(row.action)}</td>
                <td className="dash-td-muted">{formatMeta(row.meta)}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}
