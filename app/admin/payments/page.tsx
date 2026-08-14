import { prisma } from "@/lib/prisma";
import { recordPayment, updatePaymentStatus } from "../actions";
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

export default async function PaymentsPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [payments, pending, collectedMonth, collectedAll, openEnrollments] =
    await Promise.all([
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
        where: {
          status: { notIn: ["REJECTED", "WITHDRAWN", "COMPLETED"] },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, reference: true, fullName: true, courseName: true },
      }),
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
          value={money(collectedMonth._sum.amount?.toString() ?? 0)}
          accent="#22c55e"
        />
        <StatTile
          label="Collected all time"
          value={money(collectedAll._sum.amount?.toString() ?? 0)}
        />
        <StatTile
          label="Outstanding"
          value={money(pending._sum.amount?.toString() ?? 0)}
          hint={`${pending._count} pending`}
          accent="#fbbf24"
        />
      </StatGrid>

      {/* Record a payment */}
      <form
        action={recordPayment}
        style={{
          ...card,
          marginBottom: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
            Record a payment
          </h2>
          <p
            style={{
              fontFamily: font,
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              margin: "0.25rem 0 0",
            }}
          >
            Someone sent MoMo to 681529488 — log it here and it&apos;s counted
            immediately.
          </p>
        </div>

        <Field label="Enrollment">
          <select name="enrollmentId" required style={inputStyle}>
            <option value="" style={optionStyle}>
              Select…
            </option>
            {openEnrollments.map((e) => (
              <option key={e.id} value={e.id} style={optionStyle}>
                {e.fullName} — {e.courseName} ({e.reference})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Amount (FCFA)">
          <input
            name="amount"
            type="number"
            min="0"
            step="1"
            required
            style={inputStyle}
          />
        </Field>

        <Field label="Kind">
          <select name="kind" defaultValue="TUITION" style={inputStyle}>
            <option value="REGISTRATION_FEE" style={optionStyle}>
              Registration fee
            </option>
            <option value="TUITION" style={optionStyle}>
              Tuition
            </option>
            <option value="INSTALLMENT" style={optionStyle}>
              Installment
            </option>
            <option value="OTHER" style={optionStyle}>
              Other
            </option>
          </select>
        </Field>

        <Field label="Method">
          <select name="method" defaultValue="MOMO" style={inputStyle}>
            <option value="MOMO" style={optionStyle}>
              MTN MoMo
            </option>
            <option value="ORANGE_MONEY" style={optionStyle}>
              Orange Money
            </option>
            <option value="BANK_TRANSFER" style={optionStyle}>
              Bank transfer
            </option>
            <option value="CASH" style={optionStyle}>
              Cash
            </option>
            <option value="OTHER" style={optionStyle}>
              Other
            </option>
          </select>
        </Field>

        <Field label="Sender number">
          <input name="momoNumber" style={inputStyle} />
        </Field>

        <button type="submit" style={primaryBtn}>
          Record →
        </button>
      </form>

      <Table
        headers={["Date", "Payer", "For", "Amount", "Method", "Status", ""]}
        empty="No payments recorded yet."
      >
        {payments.map((p) => (
          <tr key={p.id}>
            <td style={tdMuted}>{shortDate(p.paidAt ?? p.createdAt)}</td>
            <td style={td}>
              <div style={{ fontWeight: 700 }}>
                {p.enrollment?.fullName ?? p.payerName ?? "—"}
              </div>
              <div
                style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}
              >
                {p.enrollment?.reference ?? p.invoice?.number ?? ""}
              </div>
            </td>
            <td style={tdMuted}>
              {p.enrollment?.courseName ?? p.note ?? "—"}
              <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                {p.kind.replace(/_/g, " ")}
              </div>
            </td>
            <td style={{ ...td, fontWeight: 700 }}>
              {money(p.amount.toString(), p.currency)}
            </td>
            <td style={tdMuted}>{p.method.replace(/_/g, " ")}</td>
            <td style={td}>
              <Badge value={p.status} />
              {p.confirmedBy?.name && (
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted)",
                    marginTop: 2,
                  }}
                >
                  by {p.confirmedBy.name}
                </div>
              )}
            </td>
            <td style={td}>
              {p.status !== "CONFIRMED" ? (
                <form action={updatePaymentStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="CONFIRMED" />
                  <button type="submit" style={smallBtn}>
                    Confirm
                  </button>
                </form>
              ) : (
                <form action={updatePaymentStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="REFUNDED" />
                  <button type="submit" style={smallBtn}>
                    Refund
                  </button>
                </form>
              )}
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
  whiteSpace: "nowrap",
};
