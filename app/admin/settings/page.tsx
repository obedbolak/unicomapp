import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { updateNotificationPrefs, updateOrgSettings } from "../settings-actions";
import { Card, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?callbackUrl=/admin/settings");

  const [settings, me] = await Promise.all([
    getSettings(),
    prisma.user.findUnique({
      where: { id: admin.id },
      select: { notifyOnLead: true, notifyOnPayment: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Organization details and your account preferences."
      />

      {/* ── Organization ── */}
      <Card
        title="Organization"
        subtitle="Used across invoices, certificates and the payments page."
      >
        <form action={updateOrgSettings}>
          <div className="dash-formgrid">
            <label>
              <span className="dash-field-label">Company name</span>
              <input
                name="companyName"
                defaultValue={settings.companyName}
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">Contact email</span>
              <input
                name="companyEmail"
                type="email"
                defaultValue={settings.companyEmail}
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">Contact phone</span>
              <input
                name="companyPhone"
                defaultValue={settings.companyPhone}
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">Address</span>
              <input
                name="companyAddress"
                defaultValue={settings.companyAddress}
                placeholder="Douala, Cameroon"
                className="dash-input"
              />
            </label>
          </div>

          <div className="dash-rule" style={{ margin: "1.25rem 0 1rem" }} />

          <div className="dash-formgrid">
            <label>
              <span className="dash-field-label">MTN MoMo number</span>
              <input
                name="momoNumber"
                defaultValue={settings.momoNumber}
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">Orange Money number</span>
              <input
                name="orangeMoneyNumber"
                defaultValue={settings.orangeMoneyNumber}
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">Currency</span>
              <input
                name="currency"
                defaultValue={settings.currency}
                maxLength={8}
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">Registration fee</span>
              <input
                name="registrationFee"
                type="number"
                min={0}
                defaultValue={settings.registrationFee}
                className="dash-input"
              />
            </label>
          </div>

          <p className="dash-hint">
            The MoMo number appears on the Payments page as the number students
            send to. It used to be hardcoded in the source.
          </p>

          <div className="dash-rule" style={{ margin: "1rem 0" }} />

          <div className="dash-formgrid">
            <label>
              <span className="dash-field-label">Invoice prefix</span>
              <input
                name="invoicePrefix"
                defaultValue={settings.invoicePrefix}
                maxLength={16}
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">Certificate prefix</span>
              <input
                name="certificatePrefix"
                defaultValue={settings.certificatePrefix}
                maxLength={16}
                className="dash-input"
              />
            </label>
          </div>

          <p className="dash-hint">
            Prefixes affect newly generated references only —{" "}
            <code>{settings.invoicePrefix}-2026-0001</code>. Existing records
            keep the number they were issued with.
          </p>

          <div className="dash-rule" style={{ margin: "1rem 0" }} />

          <div className="dash-formgrid">
            <label>
              <span className="dash-field-label">Authorized shares</span>
              <input
                name="authorizedShares"
                type="number"
                min={0}
                defaultValue={settings.authorizedShares}
                className="dash-input"
              />
            </label>

            <label>
              <span className="dash-field-label">
                Company valuation ({settings.currency})
              </span>
              <input
                name="companyValuation"
                type="number"
                min={0}
                defaultValue={settings.companyValuation}
                className="dash-input"
              />
            </label>
          </div>

          <p className="dash-hint">
            Authorized shares caps how many can be allocated on the Wallet page.
            Valuation turns a shareholding into a figure in{" "}
            {settings.currency} — leave it at 0 and partners see shares and
            percentage only.
          </p>

          <div className="dash-actions">
            <button type="submit" className="dash-btn dash-btn--primary">
              Save organization settings
            </button>
          </div>
        </form>
      </Card>

      {/* ── Account ── */}
      <div style={{ marginTop: "1.5rem" }}>
        <Card
          title="Account"
          subtitle="Preferences that apply to your login only."
        >
          <form action={updateNotificationPrefs}>
            <label className="dash-check">
              <input
                type="checkbox"
                name="notifyOnLead"
                defaultChecked={me?.notifyOnLead ?? true}
              />
              <span>
                <strong>New contact messages</strong>
                <em>Notify me when someone submits the contact form.</em>
              </span>
            </label>

            <label className="dash-check">
              <input
                type="checkbox"
                name="notifyOnPayment"
                defaultChecked={me?.notifyOnPayment ?? true}
              />
              <span>
                <strong>Payments recorded</strong>
                <em>Notify me when a payment is logged or confirmed.</em>
              </span>
            </label>

            <p className="dash-hint">
              These preferences are stored, but no delivery channel is wired up
              yet — the notification bell in the topbar is still decorative.
              Hooking them to EmailJS is a small follow-up.
            </p>

            <div className="dash-actions">
              <button type="submit" className="dash-btn dash-btn--primary">
                Save preferences
              </button>
            </div>
          </form>

          <div className="dash-rule" style={{ margin: "1.25rem 0 0.9rem" }} />

          <p className="dash-hint" style={{ marginTop: 0 }}>
            Password and session controls live on the{" "}
            <a href="/admin/profile" style={{ color: "var(--color-primary)" }}>
              Profile
            </a>{" "}
            page.
          </p>
        </Card>
      </div>
    </>
  );
}
