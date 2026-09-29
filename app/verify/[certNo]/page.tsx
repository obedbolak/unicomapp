import {
  clientIp,
  findCertificate,
  formatDate,
  tooManyLookups,
} from "@/lib/certificates";
import type { Certificate } from "@/lib/certificates";
import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { certificateVerifyLink } from "@/lib/qr";
import { headers } from "next/headers";

// Always hit the database — a certificate can be revoked at any time.
export const dynamic = "force-dynamic";

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
  const h = await headers();
  const ip = clientIp(h);
  const limited = await tooManyLookups(ip);
  const cert = limited
    ? null
    : await findCertificate(decodeURIComponent(certNo), {
        ip,
        userAgent: h.get("user-agent"),
      });

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
        {limited ? (
          <SlowDownCard />
        ) : cert && cert.status === "valid" ? (
          <ValidCard
            cert={cert}
            linkedIn={linkedInUrl(
              cert,
              certificateVerifyLink(
                (await getSettings()).companyWebsite,
                cert.certNo,
              ),
            )}
          />
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

const CERT_TITLE: Record<Certificate["type"], string> = {
  internship: "Certificate of Internship",
  training: "Certificate of Training",
  "crash-course": "Certificate of Completion",
};

/**
 * LinkedIn's "Add to profile" link, pre-filled so the holder only presses
 * Save. It links back here, so anyone viewing their profile can check it.
 * Set LINKEDIN_ORGANIZATION_ID (the number in your company page's admin URL)
 * to show UnicomTeam's logo and link to the company page instead of plain text.
 */
function linkedInUrl(cert: Certificate, verifyUrl: string): string {
  const issued = new Date(cert.dateIssued);
  const q = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${CERT_TITLE[cert.type]} — ${cert.program}`,
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: verifyUrl,
    certId: cert.certNo,
  });
  const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
  if (orgId) q.set("organizationId", orgId);
  else q.set("organizationName", "UnicomTeam");
  return `https://www.linkedin.com/profile/add?${q.toString()}`;
}

function ValidCard({
  cert,
  linkedIn,
}: {
  cert: Certificate;
  linkedIn: string;
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

      <div style={{ marginTop: "1.5rem" }}>
        <a
          href={linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.55rem",
            padding: "0.7rem 1.2rem",
            borderRadius: "0.65rem",
            background: "#0A66C2",
            color: "#fff",
            fontFamily: "var(--font-display)",
            fontSize: "0.875rem",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
            />
          </svg>
          Add to LinkedIn profile
        </a>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            margin: "0.6rem 0 0",
          }}
        >
          Is this your certificate? Add it to your profile in one click.
        </p>
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

function SlowDownCard() {
  return (
    <div style={cardStyle}>
      <StatusBadge label="Please wait" color="#f59e0b" />
      <h1 style={nameStyle}>Too Many Checks</h1>
      <p style={subStyle}>
        You&apos;ve checked a lot of certificates in a short time. Please try
        again in about 15 minutes, or contact us if you need to verify several
        certificates at once.
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
