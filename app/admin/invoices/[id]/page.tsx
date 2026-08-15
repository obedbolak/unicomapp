import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  addInvoiceItem,
  deleteInvoiceItem,
  updateInvoiceMeta,
  updateInvoiceStatus,
} from "../../invoice-actions";
import {
  Badge,
  Card,
  PageHeader,
  Table,
  money,
  shortDate,
} from "@/components/dashboard/ui";
import type { InvoiceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: InvoiceStatus[] = [
  "DRAFT",
  "SENT",
  "PARTIAL",
  "PAID",
  "OVERDUE",
  "VOID",
];

function dateInputValue(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: { select: { name: true, email: true } },
      project: { select: { title: true } },
      items: { orderBy: { sortOrder: "asc" } },
      payments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          status: true,
          method: true,
          createdAt: true,
        },
      },
    },
  });

  if (!invoice) notFound();

  const paid = invoice.payments
    .filter((p) => p.status === "CONFIRMED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const balance = Number(invoice.total) - paid;

  return (
    <>
      <PageHeader
        title={invoice.number}
        subtitle={`Issued ${shortDate(invoice.issueDate)}${
          invoice.client ? ` · ${invoice.client.name}` : ""
        }`}
        action={
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <Badge value={invoice.status} />
            <Link href="/admin/invoices" className="dash-btn">
              ← All invoices
            </Link>
          </div>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: "1.5rem",
          alignItems: "start",
        }}
        className="dash-grid--hero"
      >
        {/* ── Line items ── */}
        <div>
          <Card title="Line items" flush>
            <Table
              headers={["Description", "Qty", "Unit price", "Amount", ""]}
              empty="No line items yet. Add the first one below."
            >
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td className="dash-td-muted">{Number(item.quantity)}</td>
                  <td className="dash-nowrap dash-td-muted">
                    {money(item.unitPrice.toString(), invoice.currency)}
                  </td>
                  <td className="dash-nowrap">
                    {money(item.amount.toString(), invoice.currency)}
                  </td>
                  <td>
                    <form action={deleteInvoiceItem}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="invoiceId" value={invoice.id} />
                      <button type="submit" className="dash-btn">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </Table>

            <div style={{ padding: "1.35rem" }}>
              <form action={addInvoiceItem}>
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <div className="dash-formgrid">
                  <label style={{ gridColumn: "span 2" }}>
                    <span className="dash-field-label">Description</span>
                    <input
                      name="description"
                      required
                      maxLength={300}
                      placeholder="Landing page design — 3 revisions"
                      className="dash-input"
                    />
                  </label>

                  <label>
                    <span className="dash-field-label">Qty</span>
                    <input
                      type="number"
                      name="quantity"
                      min="0.01"
                      step="0.01"
                      defaultValue={1}
                      required
                      className="dash-input"
                    />
                  </label>

                  <label>
                    <span className="dash-field-label">
                      Unit price ({invoice.currency})
                    </span>
                    <input
                      type="number"
                      name="unitPrice"
                      min="0"
                      step="0.01"
                      required
                      className="dash-input"
                    />
                  </label>

                  <button type="submit" className="dash-btn dash-btn--primary">
                    Add line
                  </button>
                </div>
              </form>
            </div>
          </Card>

          <div style={{ marginTop: "1.5rem" }}>
            <Card
              title="Payments against this invoice"
              subtitle="Recorded from the Payments page."
              flush
            >
              <Table
                headers={["Date", "Method", "Amount", "Status"]}
                empty="No payments recorded against this invoice yet."
              >
                {invoice.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="dash-nowrap dash-td-muted">
                      {shortDate(p.createdAt)}
                    </td>
                    <td className="dash-td-muted">
                      {p.method.replace(/_/g, " ")}
                    </td>
                    <td className="dash-nowrap">
                      {money(p.amount.toString(), invoice.currency)}
                    </td>
                    <td>
                      <Badge value={p.status} />
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          </div>
        </div>

        {/* ── Summary & meta ── */}
        <div>
          <Card title="Summary">
            <dl className="dash-deflist" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <dt>Subtotal</dt>
                <dd>{money(invoice.subtotal.toString(), invoice.currency)}</dd>
              </div>
              <div>
                <dt>Tax</dt>
                <dd>{money(invoice.tax.toString(), invoice.currency)}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                  {money(invoice.total.toString(), invoice.currency)}
                </dd>
              </div>
              <div>
                <dt>Paid</dt>
                <dd style={{ color: "#22c55e" }}>
                  {money(paid, invoice.currency)}
                </dd>
              </div>
              <div>
                <dt>Balance</dt>
                <dd
                  style={{
                    color: balance > 0 ? "var(--color-primary)" : "#22c55e",
                    fontWeight: 700,
                  }}
                >
                  {money(balance, invoice.currency)}
                </dd>
              </div>
            </dl>

            <p className="dash-hint">
              Subtotal is the sum of the line items and cannot be typed in
              directly — it recalculates whenever a line changes.
            </p>

            <div className="dash-rule" style={{ margin: "1.1rem 0 0.9rem" }} />

            <form action={updateInvoiceStatus} className="dash-inline-form">
              <input type="hidden" name="id" value={invoice.id} />
              <select
                name="status"
                defaultValue={invoice.status}
                className="dash-select"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <button type="submit" className="dash-btn">
                Update
              </button>
            </form>
          </Card>

          <div style={{ marginTop: "1.5rem" }}>
            <Card title="Details">
              <form action={updateInvoiceMeta}>
                <input type="hidden" name="id" value={invoice.id} />

                <label style={{ display: "block" }}>
                  <span className="dash-field-label">Due date</span>
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={dateInputValue(invoice.dueDate)}
                    className="dash-input"
                  />
                </label>

                <label style={{ display: "block", marginTop: "0.7rem" }}>
                  <span className="dash-field-label">
                    Tax ({invoice.currency})
                  </span>
                  <input
                    type="number"
                    name="tax"
                    min="0"
                    step="0.01"
                    defaultValue={Number(invoice.tax)}
                    className="dash-input"
                  />
                </label>

                <label style={{ display: "block", marginTop: "0.7rem" }}>
                  <span className="dash-field-label">Notes</span>
                  <textarea
                    name="notes"
                    rows={4}
                    maxLength={2000}
                    defaultValue={invoice.notes ?? ""}
                    className="dash-input"
                    style={{ resize: "vertical" }}
                  />
                </label>

                <div className="dash-actions">
                  <button type="submit" className="dash-btn dash-btn--primary">
                    Save
                  </button>
                </div>
              </form>

              <div className="dash-rule" style={{ margin: "1.1rem 0 0.9rem" }} />

              <dl className="dash-deflist" style={{ gridTemplateColumns: "1fr" }}>
                <div>
                  <dt>Client</dt>
                  <dd>
                    {invoice.client?.name ?? "—"}
                    {invoice.client?.email && (
                      <div className="dash-td-muted" style={{ fontSize: "0.75rem" }}>
                        {invoice.client.email}
                      </div>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Project</dt>
                  <dd>{invoice.project?.title ?? "—"}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
