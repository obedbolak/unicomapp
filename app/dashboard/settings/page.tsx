import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updateNotificationPrefs } from "@/app/admin/settings-actions";
import { Card, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function StaffSettingsPage() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/settings");

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: { notifyOnLead: true, notifyOnPayment: true },
  });

  const isAdmin = user.role?.includes("ADMIN") ?? false;

  return (
    <>
      <PageHeader title="Settings" subtitle="Preferences for your account." />

      <Card title="Notifications" subtitle="What you want to hear about.">
        <form action={updateNotificationPrefs}>
          <label className="dash-check">
            <input
              type="checkbox"
              name="notifyOnLead"
              defaultChecked={me?.notifyOnLead ?? true}
            />
            <span>
              <strong>New contact messages</strong>
              <em>When someone submits the contact form.</em>
            </span>
          </label>

          <label className="dash-check">
            <input
              type="checkbox"
              name="notifyOnPayment"
              defaultChecked={me?.notifyOnPayment ?? true}
            />
            <span>
              <strong>Payments and earnings</strong>
              <em>When a payment is recorded or a share is credited to you.</em>
            </span>
          </label>

          <p className="dash-hint">
            Stored, but nothing delivers them yet — the notification bell is
            still decorative.
          </p>

          <div className="dash-actions">
            <button type="submit" className="dash-btn dash-btn--primary">
              Save preferences
            </button>
          </div>
        </form>

        <div className="dash-rule" style={{ margin: "1.25rem 0 0.9rem" }} />

        <p className="dash-hint" style={{ marginTop: 0 }}>
          Password and session controls are on the{" "}
          <Link
            href="/dashboard/profile"
            style={{ color: "var(--color-primary)" }}
          >
            Profile
          </Link>{" "}
          page.
          {isAdmin && (
            <>
              {" "}
              Organization settings live in{" "}
              <Link
                href="/admin/settings"
                style={{ color: "var(--color-primary)" }}
              >
                Admin → Settings
              </Link>
              .
            </>
          )}
        </p>
      </Card>
    </>
  );
}
