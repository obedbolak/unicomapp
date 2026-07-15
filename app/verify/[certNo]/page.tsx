import { findCertificate, formatDate } from "@/lib/certificates";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certNo: string }>;
}): Promise<Metadata> {
  const { certNo } = await params;
  return {
    title: `Certificate Verification — ${certNo} | UnicomTeam`,
    robots: { index: false, follow: false },
  };
}

export default async function VerifyResultPage({
  params,
}: {
  params: Promise<{ certNo: string }>;
}) {
  const { certNo } = await params;
  const cert = findCertificate(decodeURIComponent(certNo));

  return (
    <main
      className="section-page"
      style={{
        width: "100%",
        paddingBottom: "4rem",
        paddingTop: "calc(var(--header-height-mobile) + 2rem)",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 1.5rem" }}>
        {cert && cert.status === "valid" ? (
          <ValidCard cert={cert} />
        ) : cert && cert.status === "revoked" ? (
          <RevokedCard certNo={certNo} />
        ) : (
          <NotFoundCard certNo={certNo} />
        )}

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a
            href="/verify"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              textDecoration: "none",
            }}
          >
            ← Check another certificate
          </a>
        </div>
      </div>
    </main>
  );
}

function ValidCard({
  cert,
}: {
  cert: NonNullable<ReturnType<typeof findCertificate>>;
}) {
  return (
    <div style={cardStyle}>
      <StatusBadge label="✓ Valid Certificate" color="#22c55e" />
      <h1 style={nameStyle}>{cert.name}</h1>
      <p style={subStyle}>{cert.program}</p>

      <div style={gridStyle}>
        <Row label="Certificate No." value={cert.certNo} />
        <Row label="Department" value={cert.department} />
        <Row
          label="Period"
          value={`${formatDate(cert.periodStart)} – ${formatDate(cert.periodEnd)}`}
        />
        <Row label="Date Issued" value={formatDate(cert.dateIssued)} />
        <Row
          label="Issued By"
          value="UnicomTeam Software Development Company"
        />
        <Row
          label="Signed"
          value={`${cert.supervisor}, ${cert.supervisorTitle}`}
        />
      </div>
    </div>
  );
}

function RevokedCard({ certNo }: { certNo: string }) {
  return (
    <div style={cardStyle}>
      <StatusBadge label="⚠ Revoked" color="#f59e0b" />
      <h1 style={nameStyle}>Certificate No Longer Valid</h1>
      <p style={subStyle}>
        The certificate <strong>{certNo}</strong> exists in our records but has
        been revoked. Contact us if you believe this is an error.
      </p>
    </div>
  );
}

function NotFoundCard({ certNo }: { certNo: string }) {
  return (
    <div style={cardStyle}>
      <StatusBadge label="✕ Not Found" color="#ef4444" />
      <h1 style={nameStyle}>We Couldn't Verify This Certificate</h1>
      <p style={subStyle}>
        No record matches <strong>{certNo}</strong>. Double-check the
        certificate number and try again, or contact us for support.
      </p>
    </div>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "var(--font-display)",
        fontSize: "0.75rem",
        fontWeight: 800,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "0.35rem 0.8rem",
        borderRadius: 999,
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
        marginBottom: "1rem",
      }}
    >
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.6rem 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "var(--color-text)",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: "1.25rem",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  padding: "2rem",
  textAlign: "center",
};
const nameStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "1.5rem",
  fontWeight: 900,
  color: "var(--color-text)",
  margin: "0 0 0.35rem",
};
const subStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "0.9375rem",
  color: "var(--color-text-muted)",
  margin: "0 0 1.5rem",
  lineHeight: 1.6,
};
const gridStyle: React.CSSProperties = {
  textAlign: "left",
};
