import { prisma } from "@/lib/prisma";
import { issueCertificate, setCertificateStatus } from "../actions";
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
        select: {
          id: true,
          reference: true,
          fullName: true,
          courseName: true,
          type: true,
        },
      }),
    ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Certificates"
        subtitle="Issued from here, verified live at /verify — no code edits needed."
      />

      <StatGrid>
        <StatTile label="Valid" value={valid} accent="#22c55e" />
        <StatTile label="Revoked" value={revoked} accent="#f59e0b" />
        <StatTile
          label="Verification checks"
          value={checksThisMonth}
          hint="This month"
        />
      </StatGrid>

      {/* Issue */}
      <form
        action={issueCertificate}
        style={{
          ...card,
          marginBottom: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "0.75rem",
          alignItems: "end",
        }}
      >
        <div style={{ gridColumn: "1 / -1" }}>
          <h2
            style={{
              fontFamily: font,
              fontSize: "0.9375rem",
              fontWeight: 800,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Issue a certificate
          </h2>
          <p
            style={{
              fontFamily: font,
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              margin: "0.25rem 0 0",
            }}
          >
            Leave the number blank and it&apos;s generated for you
            (UCT-INT-{new Date().getFullYear()}-0001).
          </p>
        </div>

        <Field label="Link to enrollment (optional)">
          <select name="enrollmentId" defaultValue="" style={inputStyle}>
            <option value="" style={optionStyle}>
              None
            </option>
            {completedEnrollments.map((e) => (
              <option key={e.id} value={e.id} style={optionStyle}>
                {e.fullName} — {e.courseName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Holder name">
          <input name="name" required style={inputStyle} />
        </Field>

        <Field label="Type">
          <select name="type" defaultValue="INTERNSHIP" style={inputStyle}>
            <option value="INTERNSHIP" style={optionStyle}>
              Internship
            </option>
            <option value="TRAINING" style={optionStyle}>
              Training
            </option>
            <option value="CRASH_COURSE" style={optionStyle}>
              Crash course
            </option>
          </select>
        </Field>

        <Field label="Programme">
          <input
            name="program"
            required
            placeholder="Full Stack Development Internship"
            style={inputStyle}
          />
        </Field>

        <Field label="Department">
          <input
            name="department"
            required
            placeholder="Full Stack Development"
            style={inputStyle}
          />
        </Field>

        <Field label="Period start">
          <input name="periodStart" type="date" required style={inputStyle} />
        </Field>

        <Field label="Period end">
          <input name="periodEnd" type="date" required style={inputStyle} />
        </Field>

        <Field label="Date issued">
          <input
            name="dateIssued"
            type="date"
            defaultValue={today}
            required
            style={inputStyle}
          />
        </Field>

        <Field label="Certificate no. (optional)">
          <input name="certNo" placeholder="auto" style={inputStyle} />
        </Field>

        <Field label="Supervisor">
          <input
            name="supervisorName"
            defaultValue="Obed Bolak F."
            style={inputStyle}
          />
        </Field>

        <Field label="Supervisor title">
          <input
            name="supervisorTitle"
            defaultValue="CEO & Internship Supervisor"
            style={inputStyle}
          />
        </Field>

        <button type="submit" style={primaryBtn}>
          Issue →
        </button>
      </form>

      <Table
        headers={["Certificate no.", "Holder", "Programme", "Period", "Checks", "Status", ""]}
        empty="No certificates issued yet."
      >
        {certificates.map((c) => (
          <tr key={c.id}>
            <td style={td}>
              <a
                href={`/verify/${c.certNo}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-primary)", fontWeight: 700 }}
              >
                {c.certNo}
              </a>
            </td>
            <td style={{ ...td, fontWeight: 700 }}>{c.name}</td>
            <td style={tdMuted}>
              {c.program}
              <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                {c.department}
              </div>
            </td>
            <td style={tdMuted}>
              {shortDate(c.periodStart)} – {shortDate(c.periodEnd)}
            </td>
            <td style={tdMuted}>{c._count.verifications}</td>
            <td style={td}>
              <Badge value={c.status} />
            </td>
            <td style={td}>
              <form action={setCertificateStatus}>
                <input type="hidden" name="id" value={c.id} />
                <input
                  type="hidden"
                  name="status"
                  value={c.status === "VALID" ? "REVOKED" : "VALID"}
                />
                <button type="submit" style={smallBtn}>
                  {c.status === "VALID" ? "Revoke" : "Restore"}
                </button>
              </form>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          fontFamily: font,
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.7rem",
  borderRadius: "0.6rem",
  border: "1px solid var(--color-border)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--color-text)",
  fontFamily: font,
  fontSize: "0.8125rem",
  outline: "none",
};

const optionStyle: React.CSSProperties = { background: "#111", color: "#fff" };

const primaryBtn: React.CSSProperties = {
  padding: "0.6rem 1.1rem",
  borderRadius: "0.6rem",
  background: "var(--color-primary)",
  border: "1px solid var(--color-primary)",
  color: "#000",
  fontFamily: font,
  fontSize: "0.8125rem",
  fontWeight: 700,
  cursor: "pointer",
};

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
