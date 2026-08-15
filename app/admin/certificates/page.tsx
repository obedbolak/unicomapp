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
import {
  IconAward,
  IconCheck,
  IconSearch,
} from "@/components/dashboard/icons";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [certificates, valid, revoked, checksThisMonth, completedEnrollments] =
    await Promise.all([
      prisma.certificate.findMany({
        orderBy: { dateIssued: "desc" },
        take: 200,
        include: { _count: { select: { verifications: true } } },
      }),
      prisma.certificate.count({ where: { status: "VALID" } }),
      prisma.certificate.count({ where: { status: "REVOKED" } }),
      prisma.certificateVerification.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.enrollment.findMany({
        where: {
          status: { in: ["ACTIVE", "COMPLETED", "ENROLLED"] },
          certificate: null,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, fullName: true, courseName: true },
      }),
    ]);

  const today = new Date().toISOString().slice(0, 10);
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

      <Card
        title="Issue a certificate"
        subtitle={`Leave the number blank and it's generated for you (UCT-INT-${year}-0001).`}
        style={{ marginBottom: "1.5rem" }}
      >
        <form action={issueCertificate} className="dash-formgrid">
          <label>
            <span className="dash-field-label">Link to enrollment</span>
            <select name="enrollmentId" defaultValue="" className="dash-select">
              <option value="">None</option>
              {completedEnrollments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName} — {e.courseName}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="dash-field-label">Holder name</span>
            <input name="name" required className="dash-input" />
          </label>

          <label>
            <span className="dash-field-label">Type</span>
            <select name="type" defaultValue="INTERNSHIP" className="dash-select">
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
              defaultValue="Obed Bolak F."
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

          <button type="submit" className="dash-btn dash-btn--primary">
            Issue →
          </button>
        </form>
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
                <form action={setCertificateStatus}>
                  <input type="hidden" name="id" value={c.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={c.status === "VALID" ? "REVOKED" : "VALID"}
                  />
                  <button type="submit" className="dash-btn">
                    {c.status === "VALID" ? "Revoke" : "Restore"}
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
