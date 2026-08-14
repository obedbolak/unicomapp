import { prisma } from "@/lib/prisma";
import { updateEnrollmentStatus } from "../actions";
import {
  Badge,
  PageHeader,
  Table,
  font,
  money,
  shortDate,
  td,
  tdMuted,
} from "@/components/dashboard/ui";
import type { EnrollmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: EnrollmentStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERVIEW",
  "ACCEPTED",
  "PAID",
  "ENROLLED",
  "ACTIVE",
  "COMPLETED",
  "REJECTED",
  "WITHDRAWN",
];

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as EnrollmentStatus)
    ? (sp.status as EnrollmentStatus)
    : undefined;
  const type =
    sp.type === "TRAINING" || sp.type === "INTERNSHIP" ? sp.type : undefined;

  const enrollments = await prisma.enrollment.findMany({
    where: { ...(status ? { status } : {}), ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      payments: { select: { amount: true, status: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Enrollments & applications"
        subtitle={`${enrollments.length} record${
          enrollments.length === 1 ? "" : "s"
        }${status ? ` · ${status}` : ""}${type ? ` · ${type}` : ""}`}
      />

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "0.35rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
        }}
      >
        <FilterLink href="/admin/enrollments" label="All" active={!status && !type} />
        {STATUSES.map((s) => (
          <FilterLink
            key={s}
            href={`/admin/enrollments?status=${s}`}
            label={s.replace(/_/g, " ")}
            active={status === s}
          />
        ))}
      </div>

      <Table
        headers={[
          "Reference",
          "Applicant",
          "Applying for",
          "Plan",
          "Paid",
          "Received",
          "Status",
        ]}
        empty="No applications match this filter."
      >
        {enrollments.map((e) => {
          const paid = e.payments
            .filter((p) => p.status === "CONFIRMED")
            .reduce((sum, p) => sum + Number(p.amount), 0);

          return (
            <tr key={e.id}>
              <td style={tdMuted}>
                <div>{e.reference}</div>
                <div style={{ fontSize: "0.6875rem", opacity: 0.7 }}>
                  {e.type}
                </div>
                {!e.emailSent && (
                  <div style={{ fontSize: "0.6875rem", color: "#ef4444" }}>
                    email not sent
                  </div>
                )}
              </td>
              <td style={td}>
                <div style={{ fontWeight: 700 }}>{e.fullName}</div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <a href={`mailto:${e.email}`} style={{ color: "inherit" }}>
                    {e.email}
                  </a>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <a
                    href={`https://wa.me/${e.phone.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit" }}
                  >
                    {e.phone}
                  </a>{" "}
                  · {e.country}
                </div>
              </td>
              <td style={td}>
                <div>{e.courseName}</div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {[e.level, e.months ? `${e.months} months` : null, e.cohortLabel]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </td>
              <td style={tdMuted}>
                {e.plan === "INSTALLMENTS" ? "Installments" : "Pay in full"}
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                  {e.priceLabel ?? "—"}
                </div>
              </td>
              <td style={tdMuted}>{paid ? money(paid) : "—"}</td>
              <td style={tdMuted}>{shortDate(e.createdAt)}</td>
              <td style={td}>
                <form
                  action={updateEnrollmentStatus}
                  style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}
                >
                  <input type="hidden" name="id" value={e.id} />
                  <select
                    name="status"
                    defaultValue={e.status}
                    style={selectStyle}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} style={optionStyle}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <button type="submit" style={saveBtn}>
                    Save
                  </button>
                </form>
                <div style={{ marginTop: "0.35rem" }}>
                  <Badge value={e.status} />
                </div>
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      style={{
        fontFamily: font,
        fontSize: "0.75rem",
        fontWeight: 700,
        textDecoration: "none",
        padding: "0.35rem 0.7rem",
        borderRadius: "0.5rem",
        color: active ? "#000" : "var(--color-text-muted)",
        background: active ? "var(--color-primary)" : "transparent",
        border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
      }}
    >
      {label}
    </a>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "0.35rem 0.5rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--color-text)",
  fontFamily: font,
  fontSize: "0.75rem",
  outline: "none",
};

const optionStyle: React.CSSProperties = {
  background: "#111",
  color: "#fff",
};

const saveBtn: React.CSSProperties = {
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
