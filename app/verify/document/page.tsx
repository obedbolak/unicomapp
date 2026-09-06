// app/verify/document/page.tsx
//
// Public check that a quote or invoice really came from us.
//
// Deliberately says nothing about money. The client already holds the PDF with
// every figure in it; what they cannot tell from a PDF is whether it is
// genuine, whether it is still in force, and whether we have recorded their
// payment. That is what this page answers.

import Link from "next/link";
import { headers } from "next/headers";
import { verifyDocument, type VerifiedDocument } from "@/lib/verification";
import VerifyDocumentForm from "./VerifyDocumentForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Verify a quote or invoice — UnicomTeam",
  description:
    "Confirm that a UnicomTeam quote or invoice is genuine, and see whether it is still in force.",
  robots: { index: true, follow: true },
};

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** The client's IP as the edge saw it, for the audit trail. */
async function requestMeta() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return {
    ip: forwarded ? forwarded.split(",")[0].trim() : h.get("x-real-ip"),
    userAgent: h.get("user-agent"),
  };
}

export default async function VerifyDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; code?: string }>;
}) {
  const { no = "", code = "" } = await searchParams;
  const attempted = !!no && !!code;

  const result = attempted
    ? await verifyDocument(no, code, await requestMeta())
    : null;

  return (
    <main
      className="section-page"
      style={{
        width: "100%",
        paddingBottom: "4rem",
        paddingTop: "calc(var(--header-height-mobile) + 2rem)",
      }}
    >
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
              fontWeight: 900,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Verify a Quote or Invoice
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: "var(--color-text-muted)",
              margin: "0.5rem 0 0",
              lineHeight: 1.6,
            }}
          >
            Confirm that a document is genuinely ours and see whether it is
            still in force.
          </p>
        </div>

        {result?.ok && <Verified doc={result.document} />}
        {result && !result.ok && <NotFound />}

        <VerifyFormBlock
          defaultNumber={result?.ok ? "" : no}
          defaultCode={result?.ok ? "" : code}
          collapsed={!!result?.ok}
        />

        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.8125rem",
            color: "var(--color-text-muted)",
            textAlign: "center",
            margin: "1.5rem 0 0",
            lineHeight: 1.6,
          }}
        >
          Checking a certificate instead?{" "}
          <Link href="/verify" style={{ color: "var(--color-primary)" }}>
            Verify a certificate
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

/* ── Result panels ───────────────────────────────────────────────────────── */

function Verified({ doc }: { doc: VerifiedDocument }) {
  const rows: [string, string][] = [
    ["Document", doc.number],
    ["Type", doc.typeLabel],
    ...(doc.subject ? ([["Regarding", doc.subject]] as [string, string][]) : []),
    ...(doc.clientName
      ? ([["Issued to", doc.clientName]] as [string, string][])
      : []),
    ["Issued on", longDate(doc.issueDate)],
    ...(doc.validUntil
      ? ([
          [
            doc.expired ? "Expired on" : "Valid until",
            longDate(doc.validUntil),
          ],
        ] as [string, string][])
      : []),
    ["Status", doc.statusLabel],
    ["Issued by", doc.issuer],
  ];

  return (
    <div
      style={{
        borderRadius: "1.25rem",
        background: "var(--color-surface)",
        border: "1px solid rgba(34,197,94,0.35)",
        padding: "1.75rem",
        marginBottom: "1.5rem",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.35rem 0.8rem",
          borderRadius: "999px",
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.35)",
          color: "#22c55e",
          fontFamily: "var(--font-display)",
          fontSize: "0.8125rem",
          fontWeight: 700,
          marginBottom: "1.25rem",
        }}
      >
        ✓ Genuine document
      </div>

      <dl style={{ margin: 0, display: "grid", gap: "0.85rem" }}>
        {rows.map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 8rem) minmax(0, 1fr)",
              gap: "0.75rem",
              alignItems: "baseline",
            }}
          >
            <dt
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              {k}
            </dt>
            <dd
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              {v}
            </dd>
          </div>
        ))}
      </dl>

      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          lineHeight: 1.65,
          margin: "1.35rem 0 0",
          paddingTop: "1.1rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {doc.statusNote}
        {doc.expired && " This quote has passed its validity date — ask us for a fresh one before acting on it."}
      </p>

      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
          lineHeight: 1.6,
          margin: "1rem 0 0",
        }}
      >
        Amounts and line items are not shown here — check them against the copy
        you hold. If they differ from what you were sent,{" "}
        <Link href="/contact" style={{ color: "var(--color-primary)" }}>
          tell us
        </Link>
        .
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div
      style={{
        borderRadius: "1.25rem",
        background: "var(--color-surface)",
        border: "1px solid rgba(239,68,68,0.35)",
        padding: "1.75rem",
        marginBottom: "1.5rem",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.35rem 0.8rem",
          borderRadius: "999px",
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.35)",
          color: "#ef4444",
          fontFamily: "var(--font-display)",
          fontSize: "0.8125rem",
          fontWeight: 700,
          marginBottom: "1rem",
        }}
      >
        No match
      </div>

      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.9375rem",
          color: "var(--color-text)",
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        That number and code do not match a document we issued.
      </p>

      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          lineHeight: 1.65,
          margin: "0.75rem 0 0",
        }}
      >
        Check both against the foot of the document — the code is eight
        characters and the dash is optional. If they are right and this still
        fails, do not act on the document:{" "}
        <Link href="/contact" style={{ color: "var(--color-primary)" }}>
          contact us
        </Link>{" "}
        before paying anything.
      </p>
    </div>
  );
}

/* ── Form, collapsed once a document has been confirmed ──────────────────── */

function VerifyFormBlock({
  defaultNumber,
  defaultCode,
  collapsed,
}: {
  defaultNumber: string;
  defaultCode: string;
  collapsed: boolean;
}) {
  if (collapsed) {
    return (
      <details>
        <summary
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            textAlign: "center",
            listStyle: "none",
          }}
        >
          Check another document
        </summary>
        <div style={{ marginTop: "1rem" }}>
          <VerifyDocumentForm defaultNumber="" defaultCode="" />
        </div>
      </details>
    );
  }

  return (
    <VerifyDocumentForm
      defaultNumber={defaultNumber}
      defaultCode={defaultCode}
    />
  );
}
