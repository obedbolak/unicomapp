import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  PageHeader,
  StatGrid,
  StatTile,
  Table,
  card,
  font,
  money,
  shortDate,
  td,
  tdMuted,
} from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    newEnrollments,
    totalEnrollments,
    enrollmentsThisMonth,
    activeProjects,
    pendingPayments,
    confirmedThisMonth,
    validCertificates,
    unsentEmails,
    recentEnrollments,
    verificationsThisMonth,
  ] = await Promise.all([
    prisma.enrollment.count({ where: { status: "NEW" } }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.project.count({
      where: { status: { in: ["PLANNING", "IN_PROGRESS", "REVIEW"] } },
    }),
    prisma.payment.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { status: "CONFIRMED", confirmedAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.certificate.count({ where: { status: "VALID" } }),
    prisma.enrollment.count({ where: { emailSent: false } }),
    prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        reference: true,
        fullName: true,
        courseName: true,
        type: true,
        status: true,
        createdAt: true,
        emailSent: true,
      },
    }),
    prisma.certificateVerification.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Everything happening at UnicomTeam right now."
      />

      <StatGrid>
        <StatTile
          label="New applications"
          value={newEnrollments}
          hint="Waiting for a first response"
          accent={newEnrollments > 0 ? "var(--color-primary)" : "#64748b"}
        />
        <StatTile
          label="Enrollments this month"
          value={enrollmentsThisMonth}
          hint={`${totalEnrollments} all time`}
        />
        <StatTile
          label="Collected this month"
          value={money(confirmedThisMonth._sum.amount?.toString() ?? 0)}
          accent="#22c55e"
        />
        <StatTile
          label="Outstanding"
          value={money(pendingPayments._sum.amount?.toString() ?? 0)}
          hint={`${pendingPayments._count} pending payment(s)`}
          accent="#fbbf24"
        />
        <StatTile label="Active projects" value={activeProjects} />
        <StatTile
          label="Valid certificates"
          value={validCertificates}
          hint={`${verificationsThisMonth} checks this month`}
        />
      </StatGrid>

      {unsentEmails > 0 && (
        <div
          style={{
            ...card,
            borderColor: "rgba(239,68,68,0.35)",
            background: "rgba(239,68,68,0.06)",
            marginBottom: "2rem",
            fontFamily: font,
            fontSize: "0.875rem",
            color: "var(--color-text)",
          }}
        >
          <strong>{unsentEmails}</strong> application
          {unsentEmails === 1 ? "" : "s"} saved without a confirmation email
          reaching the applicant. They&apos;re safe in the database — follow up
          manually.{" "}
          <Link
            href="/admin/enrollments"
            style={{ color: "var(--color-primary)" }}
          >
            Review →
          </Link>
        </div>
      )}

      <h2
        style={{
          fontFamily: font,
          fontSize: "1rem",
          fontWeight: 800,
          color: "var(--color-text)",
          margin: "0 0 0.9rem",
        }}
      >
        Latest applications
      </h2>

      <Table
        headers={["Reference", "Name", "Applying for", "Type", "Status", "Received"]}
        empty="No applications yet. They'll appear here the moment someone submits the enrollment form."
      >
        {recentEnrollments.map((e) => (
          <tr key={e.id}>
            <td style={tdMuted}>
              {e.reference}
              {!e.emailSent && (
                <span
                  title="Confirmation email not delivered"
                  style={{ color: "#ef4444", marginLeft: 6 }}
                >
                  ●
                </span>
              )}
            </td>
            <td style={{ ...td, fontWeight: 700 }}>{e.fullName}</td>
            <td style={td}>{e.courseName}</td>
            <td style={tdMuted}>{e.type}</td>
            <td style={td}>
              <Badge value={e.status} />
            </td>
            <td style={tdMuted}>{shortDate(e.createdAt)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
