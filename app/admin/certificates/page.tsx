import { prisma } from "@/lib/prisma";
import { issueCertificate, setCertificateStatus } from "../actions";
import {
  Badge,
  Card,
  PageHeader,
  StatGrid,
  StatTile,
  Table,
  shortDate,
} from "@/components/dashboard/ui";
import { IconAward, IconCheck, IconSearch } from "@/components/dashboard/icons";

import SubmitButton from "@/components/ui/SubmitButton";
import EnrollmentPicker from "@/components/dashboard/EnrollmentPicker";
import { eligibleEnrollments } from "@/lib/certificate-enrollments";
import {
  issueCertificatesBulk,
  resendCertificateEmail,
} from "../certificate-actions";
export const dynamic = "force-dynamic";

type Search = Record<string, string | string[] | undefined>;

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [certificates, valid, revoked, checksThisMonth, enrollmentOptions] =
    await Promise.all([
      prisma.certificate.findMany({
        orderBy: { dateIssued: "desc" },
        take: 200,
        include: {
          _count: { select: { verifications: true } },
          enrollment: { select: { email: true } },
          student: { select: { email: true } },
        },
      }),
      prisma.certificate.count({ where: { status: "VALID" } }),
      prisma.certificate.count({ where: { status: "REVOKED" } }),
      prisma.certificateVerification.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      eligibleEnrollments(),
    ]);

  const today = new Date().toISOString().slice(0, 10);
  const ready = enrollmentOptions.filter((e) => e.periodStart && e.periodEnd);
  const notReady = enrollmentOptions.filter(
    (e) => !e.periodStart || !e.periodEnd,
  );
  const notice = resultNotice(one);
  const year = new Date().getFullYear();

  return (
    <>
      <PageHeader
        title="Certificates"
        subtitle="Issued here, verified live at /verify — no code edits needed."
      />

      <StatGrid>
        <StatTile label="Valid" value={valid} icon={<IconCheck size={20} />} />
        <StatTile
          label="Revoked"
          value={revoked}
          icon={<IconAward size={20} />}
        />
        <StatTile
          label="Verification checks"
          value={checksThisMonth}
          hint="This month"
          icon={<IconSearch size={20} />}
        />
      </StatGrid>

      {notice && (
        <div
          role="status"
          style={{
            margin: "0 0 1.5rem",
            padding: "0.85rem 1.1rem",
            borderRadius: "0.75rem",
            border: `1px solid ${notice.ok ? "#22c55e55" : "#f59e0b66"}`,
            background: notice.ok ? "#22c55e14" : "#f59e0b14",
            fontSize: "0.875rem",
            lineHeight: 1.5,
          }}
        >
          {notice.text}
        </div>
      )}

      <Card
        title="Issue a certificate"
        subtitle={`Leave the number blank and it's generated for you (UCT-INT-${year}-0001). Press Preview to see the certificate before issuing it — nothing is saved until you press Issue.`}
        style={{ marginBottom: "1.5rem" }}
      >
        <form action={issueCertificate} className="dash-formgrid">
          <EnrollmentPicker options={enrollmentOptions} />

          <label>
            <span className="dash-field-label">Holder name</span>
            <input name="name" required className="dash-input" />
          </label>

          <label>
            <span className="dash-field-label">Holder email</span>
            <input
              name="email"
              type="email"
              placeholder="Filled from the enrollment"
              className="dash-input"
            />
          </label>

          <label style={checkRow}>
            <input type="checkbox" name="sendEmail" defaultChecked />
            <span>Email the certificate to the holder when issued</span>
          </label>

          <label>
            <span className="dash-field-label">Type</span>
            <select
              name="type"
              defaultValue="INTERNSHIP"
              className="dash-select"
            >
              <option value="INTERNSHIP">Internship</option>
              <option value="TRAINING">Training</option>
              <option value="CRASH_COURSE">Crash course</option>
            </select>
          </label>

          <label>
            <span className="dash-field-label">Programme</span>
            <input
              name="program"
              required
              placeholder="Full Stack Development Internship"
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Department</span>
            <input
              name="department"
              required
              placeholder="Full Stack Development"
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Period start</span>
            <input
              name="periodStart"
              type="date"
              required
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Period end</span>
            <input
              name="periodEnd"
              type="date"
              required
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Date issued</span>
            <input
              name="dateIssued"
              type="date"
              defaultValue={today}
              required
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Certificate no.</span>
            <input name="certNo" placeholder="auto" className="dash-input" />
          </label>

          <label>
            <span className="dash-field-label">Supervisor</span>
            <input
              name="supervisorName"
              defaultValue="Obed Bolak Fuchu"
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Supervisor title</span>
            <input
              name="supervisorTitle"
              defaultValue="CEO & Internship Supervisor"
              className="dash-input"
            />
          </label>

          <div
            style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end" }}
          >
            {/* Opens the PDF in a new tab straight from the form, without
                saving: the button overrides the form's action for this click. */}
            <button
              type="submit"
              formAction="/api/certificates/preview"
              formMethod="post"
              formEncType="multipart/form-data"
              formTarget="_blank"
              className="dash-btn"
            >
              Preview
            </button>
            <SubmitButton
              className="dash-btn dash-btn--primary"
              pendingText="Issuing…"
            >
              Issue →
            </SubmitButton>
          </div>
        </form>
      </Card>

      <Card
        title="Issue for a group"
        subtitle="Everyone below has finished or is finishing, and has no certificate yet. Tick who to certify — names, programmes and dates come from their enrollments."
        style={{ marginBottom: "1.5rem" }}
      >
        {ready.length === 0 ? (
          <p className="dash-td-muted" style={{ margin: 0 }}>
            Nobody is ready for a certificate right now.
          </p>
        ) : (
          <form action={issueCertificatesBulk}>
            <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
              <table className="dash-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}></th>
                    <th>Name</th>
                    <th>Programme</th>
                    <th>Period</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {ready.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <input
                          type="checkbox"
                          name="enrollmentIds"
                          value={e.id}
                          aria-label={`Certify ${e.name}`}
                        />
                      </td>
                      <td style={{ fontWeight: 700 }}>{e.name}</td>
                      <td className="dash-td-muted">
                        {e.program}
                        <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                          {e.type === "INTERNSHIP" ? "Internship" : "Training"}
                          {e.department ? ` · ${e.department}` : ""}
                        </div>
                      </td>
                      <td className="dash-td-muted">
                        {shortDate(new Date(e.periodStart!))} –{" "}
                        {shortDate(new Date(e.periodEnd!))}
                      </td>
                      <td className="dash-td-muted">{e.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="dash-formgrid">
              <label>
                <span className="dash-field-label">
                  Department (when the enrollment has none)
                </span>
                <input
                  name="department"
                  placeholder="Software Engineering"
                  className="dash-input"
                />
              </label>
              <label>
                <span className="dash-field-label">Date issued</span>
                <input
                  name="dateIssued"
                  type="date"
                  defaultValue={today}
                  required
                  className="dash-input"
                />
              </label>
              <label>
                <span className="dash-field-label">Supervisor</span>
                <input
                  name="supervisorName"
                  defaultValue="Obed Bolak Fuchu"
                  className="dash-input"
                />
              </label>
              <label>
                <span className="dash-field-label">Supervisor title</span>
                <input
                  name="supervisorTitle"
                  defaultValue="CEO & Internship Supervisor"
                  className="dash-input"
                />
              </label>
              <label style={checkRow}>
                <input type="checkbox" name="sendEmail" defaultChecked />
                <span>Email each person their certificate</span>
              </label>
              <SubmitButton
                className="dash-btn dash-btn--primary"
                pendingText="Issuing…"
              >
                Issue selected →
              </SubmitButton>
            </div>
          </form>
        )}

        {notReady.length > 0 && (
          <p
            className="dash-td-muted"
            style={{ fontSize: "0.75rem", margin: "1rem 0 0" }}
          >
            Not listed because their cohort has no dates yet:{" "}
            {notReady.map((e) => e.name).join(", ")}. Add dates to their cohort,
            or issue theirs with the form above.
          </p>
        )}
      </Card>

      <Card flush>
        <Table
          headers={[
            "Certificate no.",
            "Holder",
            "Programme",
            "Period",
            "Checks",
            "Status",
            "",
          ]}
          empty="No certificates issued yet."
        >
          {certificates.map((c) => (
            <tr key={c.id}>
              <td>
                <a
                  href={`/verify/${c.certNo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-primary)", fontWeight: 700 }}
                >
                  {c.certNo}
                </a>
              </td>
              <td style={{ fontWeight: 700 }}>{c.name}</td>
              <td className="dash-td-muted">
                {c.program}
                <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                  {c.department}
                </div>
              </td>
              <td className="dash-td-muted">
                {shortDate(c.periodStart)} – {shortDate(c.periodEnd)}
              </td>
              <td
                className="dash-td-muted"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {c._count.verifications}
              </td>
              <td>
                <Badge value={c.status} />
              </td>
              <td>
                <div
                  style={{
                    display: "flex",
                    gap: "0.4rem",
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <a
                    href={`/api/certificates/${c.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dash-btn"
                  >
                    View
                  </a>
                  <a
                    href={`/api/certificates/${c.id}/pdf?download=1`}
                    className="dash-btn"
                  >
                    Download
                  </a>
                  <a href={`/admin/certificates/${c.id}`} className="dash-btn">
                    Edit
                  </a>
                  {(c.enrollment?.email || c.student?.email) && (
                    <form action={resendCertificateEmail}>
                      <input type="hidden" name="id" value={c.id} />
                      <SubmitButton className="dash-btn" pendingText="Sending…">
                        Email
                      </SubmitButton>
                    </form>
                  )}
                  <form action={setCertificateStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={c.status === "VALID" ? "REVOKED" : "VALID"}
                    />
                    <SubmitButton className="dash-btn">
                      {c.status === "VALID" ? "Revoke" : "Restore"}
                    </SubmitButton>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

const checkRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.8125rem",
  alignSelf: "end",
  paddingBottom: "0.6rem",
};

/** The message shown after Issue / Issue selected / Email. */
function resultNotice(
  one: (k: string) => string | undefined,
): { ok: boolean; text: string } | null {
  const issued = one("issued");
  if (issued) {
    const email = one("email");
    return {
      ok: email !== "failed",
      text:
        email === "sent"
          ? `${issued} issued and emailed to the holder.`
          : email === "failed"
            ? `${issued} issued, but the email didn't send. Use its Email button to try again.`
            : `${issued} issued.`,
    };
  }

  const bulk = one("bulk");
  if (bulk !== undefined) {
    const n = Number(bulk);
    const emailed = Number(one("emailed") ?? 0);
    const failed = Number(one("emailFailed") ?? 0);
    const skipped = one("skipped");
    const parts = [
      `${n} certificate${n === 1 ? "" : "s"} issued`,
      emailed ? `${emailed} emailed` : "",
      failed
        ? `${failed} email${failed === 1 ? "" : "s"} didn't send (use Email to retry)`
        : "",
    ].filter(Boolean);
    return {
      ok: !failed && !skipped,
      text:
        parts.join(", ") +
        "." +
        (skipped ? ` Skipped (missing dates or department): ${skipped}.` : ""),
    };
  }

  const edited = one("edited");
  if (edited === "saved")
    return {
      ok: true,
      text: `${one("cert")} updated. The PDF and verify page now show the changes.`,
    };
  if (edited === "unchanged")
    return { ok: true, text: `No changes to ${one("cert")}.` };
  if (edited === "invalid")
    return {
      ok: false,
      text: `${one("cert")} wasn't saved: a field was empty or the dates didn't make sense.`,
    };

  const resent = one("resent");
  if (resent === "sent")
    return { ok: true, text: `${one("cert")} emailed to the holder.` };
  if (resent === "failed")
    return {
      ok: false,
      text: `The email for ${one("cert")} didn't send. Please try again shortly.`,
    };
  if (resent === "noemail")
    return {
      ok: false,
      text: "No email address is known for that certificate.",
    };
  return null;
}
