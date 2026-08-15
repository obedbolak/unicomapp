import { prisma } from "@/lib/prisma";
import { updateEnrollmentStatus } from "../actions";
import {
  Badge,
  Card,
  PageHeader,
  Table,
  money,
  shortDate,
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
    include: { payments: { select: { amount: true, status: true } } },
  });

  return (
    <>
      <PageHeader
        title="Enrollments & applications"
        subtitle={`${enrollments.length} record${
          enrollments.length === 1 ? "" : "s"
        }${status ? ` · ${status.toLowerCase()}` : ""}`}
      />

      <div
        style={{
          display: "flex",
          gap: "0.35rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
        }}
      >
        <a
          href="/admin/enrollments"
          className="dash-chip"
          data-active={!status && !type}
        >
          All
        </a>
        <a
          href="/admin/enrollments?type=TRAINING"
          className="dash-chip"
          data-active={type === "TRAINING"}
        >
          Training
        </a>
        <a
          href="/admin/enrollments?type=INTERNSHIP"
          className="dash-chip"
          data-active={type === "INTERNSHIP"}
        >
          Internship
        </a>
        {STATUSES.map((s) => (
          <a
            key={s}
            href={`/admin/enrollments?status=${s}`}
            className="dash-chip"
            data-active={status === s}
          >
            {s.replace(/_/g, " ").toLowerCase()}
          </a>
        ))}
      </div>

      <Card flush>
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
                <td className="dash-td-muted dash-nowrap">
                  <div>{e.reference}</div>
                  <div style={{ fontSize: "0.6875rem", opacity: 0.7 }}>
                    {e.type}
                  </div>
                  {!e.emailSent && (
                    <div style={{ fontSize: "0.6875rem", color: "#f87171" }}>
                      email not sent
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{e.fullName}</div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--dash-ink-muted)",
                    }}
                  >
                    <a href={`mailto:${e.email}`} style={{ color: "inherit" }}>
                      {e.email}
                    </a>
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--dash-ink-muted)",
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
                <td>
                  <div>{e.courseName}</div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--dash-ink-muted)",
                    }}
                  >
                    {[
                      e.level,
                      e.months ? `${e.months} months` : null,
                      e.cohortLabel,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </td>
                <td className="dash-td-muted">
                  {e.plan === "INSTALLMENTS" ? "Installments" : "Pay in full"}
                  <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                    {e.priceLabel ?? "—"}
                  </div>
                </td>
                <td className="dash-td-muted">{paid ? money(paid) : "—"}</td>
                <td className="dash-td-muted">{shortDate(e.createdAt)}</td>
                <td>
                  <form
                    action={updateEnrollmentStatus}
                    style={{
                      display: "flex",
                      gap: "0.35rem",
                      alignItems: "center",
                    }}
                  >
                    <input type="hidden" name="id" value={e.id} />
                    <select
                      name="status"
                      defaultValue={e.status}
                      className="dash-select"
                      style={{ width: "auto" }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="dash-btn">
                      Save
                    </button>
                  </form>
                  <div style={{ marginTop: "0.4rem" }}>
                    <Badge value={e.status} />
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
