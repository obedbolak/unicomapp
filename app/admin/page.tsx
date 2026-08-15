import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AreaChart, BarChart, Meter } from "@/components/dashboard/Charts";
import {
  Badge,
  Card,
  ProgressRows,
  StatGrid,
  StatTile,
  Table,
  compact,
  money,
  moneyCompact,
  pctChange,
  shortDate,
} from "@/components/dashboard/ui";
import {
  IconAward,
  IconBriefcase,
  IconUsers,
  IconWallet,
} from "@/components/dashboard/icons";

export const dynamic = "force-dynamic";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** The first day of each of the last 12 months, oldest first. */
function last12Months(now: Date) {
  const out: { key: string; label: string; start: Date; end: Date }[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    out.push({
      key: `${start.getFullYear()}-${start.getMonth()}`,
      label: MONTHS[start.getMonth()],
      start,
      end,
    });
  }
  return out;
}

function bucketKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export default async function AdminOverview() {
  const admin = await requireAdmin();
  const now = new Date();
  const months = last12Months(now);
  const windowStart = months[0].start;
  const thisMonthStart = months[11].start;
  const lastMonthStart = months[10].start;

  const [
    enrollmentRows,
    paymentRows,
    pendingAgg,
    activeProjects,
    totalProjects,
    validCerts,
    checksThisMonth,
    unsentEmails,
    byStatus,
    byProgram,
    recent,
    confirmedAll,
  ] = await Promise.all([
    prisma.enrollment.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
    prisma.payment.findMany({
      where: { status: "CONFIRMED", confirmedAt: { gte: windowStart } },
      select: { amount: true, confirmedAt: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.project.count({
      where: { status: { in: ["PLANNING", "IN_PROGRESS", "REVIEW"] } },
    }),
    prisma.project.count(),
    prisma.certificate.count({ where: { status: "VALID" } }),
    prisma.certificateVerification.count({
      where: { createdAt: { gte: thisMonthStart } },
    }),
    prisma.enrollment.count({ where: { emailSent: false } }),
    prisma.enrollment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.enrollment.groupBy({
      by: ["courseName"],
      _count: { _all: true },
      orderBy: { _count: { courseName: "desc" } },
      take: 5,
    }),
    prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
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
    prisma.payment.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { amount: true },
    }),
  ]);

  /* ── Series ──────────────────────────────────────────────────────────── */

  const enrollBuckets = new Map(months.map((m) => [m.key, 0]));
  for (const e of enrollmentRows) {
    const k = bucketKey(e.createdAt);
    if (enrollBuckets.has(k)) enrollBuckets.set(k, enrollBuckets.get(k)! + 1);
  }

  const revenueBuckets = new Map(months.map((m) => [m.key, 0]));
  for (const p of paymentRows) {
    if (!p.confirmedAt) continue;
    const k = bucketKey(p.confirmedAt);
    if (revenueBuckets.has(k))
      revenueBuckets.set(k, revenueBuckets.get(k)! + Number(p.amount));
  }

  const enrollSeries = months.map((m) => ({
    label: m.label,
    value: enrollBuckets.get(m.key) ?? 0,
  }));
  const revenueSeries = months.map((m) => ({
    label: m.label,
    value: revenueBuckets.get(m.key) ?? 0,
  }));

  const enrollThis = enrollSeries[11].value;
  const enrollPrev = enrollSeries[10].value;
  const revenueThis = revenueSeries[11].value;
  const revenuePrev = revenueSeries[10].value;

  const statusCount = (s: string) =>
    byStatus.find((r) => r.status === s)?._count._all ?? 0;

  const totalEnrollments = byStatus.reduce((n, r) => n + r._count._all, 0);
  const won =
    statusCount("PAID") +
    statusCount("ENROLLED") +
    statusCount("ACTIVE") +
    statusCount("COMPLETED");
  const conversion = totalEnrollments ? (won / totalEnrollments) * 100 : 0;

  const pending = Number(pendingAgg._sum.amount ?? 0);
  const collectedAll = Number(confirmedAll._sum.amount ?? 0);

  const firstName = (admin?.name ?? "there").split(" ")[0];

  return (
    <>
      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <StatGrid>
        <StatTile
          label="Applications"
          value={compact(enrollThis)}
          delta={pctChange(enrollThis, enrollPrev)}
          hint={`this month · ${compact(totalEnrollments)} all time`}
          icon={<IconUsers size={20} />}
        />
        <StatTile
          label="Collected"
          value={moneyCompact(revenueThis)}
          delta={pctChange(revenueThis, revenuePrev)}
          hint={`this month · ${moneyCompact(collectedAll)} all time`}
          icon={<IconWallet size={20} />}
        />
        <StatTile
          label="Outstanding"
          value={moneyCompact(pending)}
          hint={`${pendingAgg._count} payment${pendingAgg._count === 1 ? "" : "s"} pending`}
          icon={<IconBriefcase size={20} />}
        />
        <StatTile
          label="Certificates"
          value={compact(validCerts)}
          hint={`valid · ${checksThisMonth} check${checksThisMonth === 1 ? "" : "s"} this month`}
          icon={<IconAward size={20} />}
        />
      </StatGrid>

      {unsentEmails > 0 && (
        <div
          className="dash-card"
          style={{
            marginBottom: "1.5rem",
            borderColor: "rgba(248,113,113,0.35)",
            background:
              "linear-gradient(127deg, rgba(60,16,20,0.6) 20%, rgba(20,6,10,0.7) 100%)",
            fontSize: "0.8125rem",
          }}
        >
          <strong>{unsentEmails}</strong> application
          {unsentEmails === 1 ? "" : "s"} saved without a confirmation email
          reaching the applicant. Nothing was lost — follow up manually.{" "}
          <Link
            href="/admin/enrollments"
            style={{ color: "var(--color-primary)", fontWeight: 700 }}
          >
            Review →
          </Link>
        </div>
      )}

      {/* ── Welcome + conversion ────────────────────────────────────────── */}
      <div className="dash-grid dash-grid--hero">
        <section className="dash-card dash-hero">
          <div className="dash-hero-orb" aria-hidden="true" />
          <p className="dash-hero-eyebrow">Welcome back,</p>
          <h2 className="dash-hero-name">{firstName}</h2>
          <p className="dash-hero-text">
            {enrollThis > 0
              ? `${enrollThis} ${enrollThis === 1 ? "person has" : "people have"} applied this month, and ${money(revenueThis)} came in. Here's where everything stands.`
              : "No applications yet this month. Everything below updates the moment one arrives."}
          </p>
          <Link href="/admin/enrollments" className="dash-hero-link">
            Review applications →
          </Link>
        </section>

        <Card
          title="Conversion"
          subtitle="Applications that reached paid or enrolled"
        >
          <Meter
            value={conversion}
            caption={`${won} of ${totalEnrollments || 0} applications`}
          />
        </Card>
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className="dash-grid dash-grid--charts">
        <Card
          title="Applications overview"
          subtitle="Last 12 months, all programmes"
        >
          <AreaChart data={enrollSeries} unit="applications" id="apps" />
        </Card>

        <Card title="Money collected" subtitle="Confirmed payments per month">
          <BarChart data={revenueSeries} unit="FCFA" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              marginTop: "1.1rem",
              paddingTop: "1.1rem",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div>
              <p className="dash-stat-label">Active projects</p>
              <p style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                {activeProjects}
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "var(--dash-ink-dim)",
                  }}
                >
                  {" "}
                  / {totalProjects}
                </span>
              </p>
            </div>
            <div>
              <p className="dash-stat-label">New this month</p>
              <p style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                {enrollThis}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Pipeline + top programmes ───────────────────────────────────── */}
      <div className="dash-grid dash-grid--half">
        <Card title="Pipeline" subtitle="Where every application currently sits">
          {totalEnrollments === 0 ? (
            <div className="dash-empty">
              No applications yet. This fills in as the enrollment form is used.
            </div>
          ) : (
            <ProgressRows
              rows={[
                "NEW",
                "CONTACTED",
                "INTERVIEW",
                "ACCEPTED",
                "PAID",
                "ENROLLED",
                "ACTIVE",
              ]
                .map((s) => ({
                  label: s.charAt(0) + s.slice(1).toLowerCase(),
                  value: statusCount(s),
                }))
                .filter((r) => r.value > 0)}
            />
          )}
        </Card>

        <Card title="Most requested" subtitle="Top programmes by application">
          {byProgram.length === 0 ? (
            <div className="dash-empty">Nothing requested yet.</div>
          ) : (
            <ProgressRows
              rows={byProgram.map((p) => ({
                label: p.courseName,
                value: p._count._all,
              }))}
            />
          )}
        </Card>
      </div>

      {/* ── Latest applications ─────────────────────────────────────────── */}
      <Card
        title="Latest applications"
        subtitle="Newest first"
        flush
        action={
          <Link
            href="/admin/enrollments"
            className="dash-chip"
            style={{ marginRight: "1.35rem" }}
          >
            View all
          </Link>
        }
      >
        <Table
          headers={["Reference", "Name", "Applying for", "Type", "Status", "Received"]}
          empty="No applications yet — they appear the moment someone submits the enrollment form."
        >
          {recent.map((e) => (
            <tr key={e.id}>
              <td className="dash-td-muted dash-nowrap">
                {e.reference}
                {!e.emailSent && (
                  <span
                    title="Confirmation email not delivered"
                    style={{ color: "#f87171", marginLeft: 6 }}
                  >
                    ●
                  </span>
                )}
              </td>
              <td style={{ fontWeight: 700 }}>{e.fullName}</td>
              <td>{e.courseName}</td>
              <td className="dash-td-muted">{e.type}</td>
              <td>
                <Badge value={e.status} />
              </td>
              <td className="dash-td-muted">{shortDate(e.createdAt)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
