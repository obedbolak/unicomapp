import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { recordPayment, updatePaymentStatus } from "../actions";
import {
  Badge,
  Card,
  PageHeader,
  StatGrid,
  StatTile,
  Table,
  money,
  moneyCompact,
  shortDate,
} from "@/components/dashboard/ui";
import {
  IconWallet,
  IconTrend,
  IconBriefcase,
} from "@/components/dashboard/icons";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    payments,
    pending,
    collectedMonth,
    collectedAll,
    openEnrollments,
    settings,
  ] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        enrollment: {
          select: { reference: true, fullName: true, courseName: true },
        },
        invoice: { select: { number: true } },
        confirmedBy: { select: { name: true } },
      },
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
    prisma.payment.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { amount: true },
    }),
    prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, reference: true, fullName: true, courseName: true },
    }),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Mobile Money registration fees, tuition instalments and project payments."
      />

      <StatGrid>
        <StatTile
          label="Collected this month"
          value={moneyCompact(collectedMonth._sum.amount?.toString() ?? 0)}
          icon={<IconWallet size={20} />}
        />
        <StatTile
          label="Collected all time"
          value={moneyCompact(collectedAll._sum.amount?.toString() ?? 0)}
          icon={<IconTrend size={20} />}
        />
        <StatTile
          label="Outstanding"
          value={moneyCompact(pending._sum.amount?.toString() ?? 0)}
          hint={`${pending._count} pending`}
          icon={<IconBriefcase size={20} />}
        />
      </StatGrid>

      <Card
        title="Record a payment"
        subtitle={`Someone sent MoMo to ${settings.momoNumber} — log it here and it counts immediately.`}
        style={{ marginBottom: "1.5rem" }}
      >
        <form action={recordPayment} className="dash-formgrid">
          <label>
            <span className="dash-field-label">Enrollment</span>
            <select name="enrollmentId" required className="dash-select">
              <option value="">
                {openEnrollments.length > 0
                  ? "Select…"
                  : "No enrollments found"}
              </option>
              {openEnrollments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName} — {e.courseName} ({e.reference})
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="dash-field-label">Amount (FCFA)</span>
            <input
              name="amount"
              type="number"
              min="0"
              step="1"
              required
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Kind</span>
            <select name="kind" defaultValue="TUITION" className="dash-select">
              <option value="REGISTRATION_FEE">Registration fee</option>
              <option value="TUITION">Tuition</option>
              <option value="INSTALLMENT">Installment</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <label>
            <span className="dash-field-label">Method</span>
            <select name="method" defaultValue="MOMO" className="dash-select">
              <option value="MOMO">MTN MoMo</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <label>
            <span className="dash-field-label">Sender number</span>
            <input name="momoNumber" className="dash-input" />
          </label>

          <button type="submit" className="dash-btn dash-btn--primary">
            Record →
          </button>
        </form>
      </Card>

      <Card flush>
        <Table
          headers={["Date", "Payer", "For", "Amount", "Method", "Status", ""]}
          empty="No payments recorded yet."
        >
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="dash-td-muted">
                {shortDate(p.paidAt ?? p.createdAt)}
              </td>
              <td>
                <div style={{ fontWeight: 700 }}>
                  {p.enrollment?.fullName ?? p.payerName ?? "—"}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--dash-ink-muted)",
                  }}
                >
                  {p.enrollment?.reference ?? p.invoice?.number ?? ""}
                </div>
              </td>
              <td className="dash-td-muted">
                {p.enrollment?.courseName ?? p.note ?? "—"}
                <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                  {p.kind.replace(/_/g, " ")}
                </div>
              </td>
              <td style={{ fontWeight: 700 }}>
                {money(p.amount.toString(), p.currency)}
              </td>
              <td className="dash-td-muted">{p.method.replace(/_/g, " ")}</td>
              <td>
                <Badge value={p.status} />
                {p.confirmedBy?.name && (
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--dash-ink-dim)",
                      marginTop: 2,
                    }}
                  >
                    by {p.confirmedBy.name}
                  </div>
                )}
              </td>
              <td>
                <form action={updatePaymentStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={p.status === "CONFIRMED" ? "REFUNDED" : "CONFIRMED"}
                  />
                  <button type="submit" className="dash-btn">
                    {p.status === "CONFIRMED" ? "Refund" : "Confirm"}
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
