import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  addInvoiceInstallment,
  addInvoiceItem,
  addInvoiceSection,
  deleteInvoiceInstallment,
  deleteInvoiceItem,
  deleteInvoiceSection,
  updateInstallmentStatus,
  updateInvoiceDocument,
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
import type { InstallmentStatus, InvoiceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: InvoiceStatus[] = [
  "DRAFT",
  "SENT",
  "PARTIAL",
  "PAID",
  "OVERDUE",
  "VOID",
];

const INSTALLMENT_STATUSES: InstallmentStatus[] = [
  "PENDING",
  "DUE",
  "PAID",
  "WAIVED",
];

function dateInputValue(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

function sentenceCase(v: string) {
  return v.charAt(0) + v.slice(1).toLowerCase();
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
      sections: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
      items: { orderBy: { sortOrder: "asc" } },
      installments: { orderBy: { sortOrder: "asc" } },
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

  const isQuote = invoice.docType === "QUOTE";
  const loose = invoice.items.filter((i) => !i.sectionId);

  // The schedule is a plan, the total is a fact. When they disagree the
  // document contradicts itself, so surface it here rather than letting the
  // client be the one to notice.
  const scheduled = invoice.installments.reduce(
    (sum, x) => sum + Number(x.amount),
    0,
  );
  const scheduleGap = Number(invoice.total) - scheduled;

  const pdfHref = `/api/invoices/${invoice.id}/pdf`;

  /** The add-a-line form, reused inside each phase and for loose lines. */
  const itemForm = (sectionId: string | null) => (
    <div style={{ padding: "1.1rem 1.35rem" }}>
      <form action={addInvoiceItem}>
        <input type="hidden" name="invoiceId" value={invoice.id} />
        <input type="hidden" name="sectionId" value={sectionId ?? ""} />
        <div className="dash-formgrid">
          <label>
            <span className="dash-field-label">Item</span>
            <input
              name="label"
              maxLength={120}
              placeholder="UI/UX Design"
              className="dash-input"
            />
          </label>

          <label style={{ gridColumn: "span 2" }}>
            <span className="dash-field-label">Description</span>
            <input
              name="description"
              required
              maxLength={300}
              placeholder="Wireframes, visual identity, design system"
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
      <p className="dash-hint">
        Leave <strong>Item</strong> blank for a plain line — the description
        then fills the whole cell. Fill both and the PDF prints them as the
        two-column layout your quotes use.
      </p>
    </div>
  );

  const itemRows = (
    items: {
      id: string;
      label: string | null;
      description: string;
      quantity: unknown;
      unitPrice: unknown;
      amount: unknown;
    }[],
  ) =>
    items.map((item) => (
      <tr key={item.id}>
        <td>
          {item.label ? (
            <>
              <strong>{item.label}</strong>
              <div className="dash-td-muted" style={{ fontSize: "0.75rem" }}>
                {item.description}
              </div>
            </>
          ) : (
            item.description
          )}
        </td>
        <td className="dash-td-muted">{Number(item.quantity)}</td>
        <td className="dash-nowrap dash-td-muted">
          {money(String(item.unitPrice), invoice.currency)}
        </td>
        <td className="dash-nowrap">
          {money(String(item.amount), invoice.currency)}
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
    ));

  return (
    <>
      <PageHeader
        title={invoice.number}
        subtitle={`${isQuote ? "Quote" : "Invoice"} · issued ${shortDate(
          invoice.issueDate,
        )}${invoice.client ? ` · ${invoice.client.name}` : ""}`}
        action={
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <Badge value={invoice.status} />
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-btn"
            >
              Preview PDF
            </a>
            <a href={`${pdfHref}?download=1`} className="dash-btn dash-btn--primary">
              Download PDF
            </a>
            <Link href="/admin/invoices" className="dash-btn">
              ← All
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
        {/* ── Left: what the document actually contains ── */}
        <div>
          {/* ── Phases ── */}
          {invoice.sections.map((section) => {
            const sectionTotal = section.items.reduce(
              (sum, i) => sum + Number(i.amount),
              0,
            );

            return (
              <div key={section.id} style={{ marginBottom: "1.5rem" }}>
                <Card
                  title={section.title}
                  subtitle={section.subtitle ?? undefined}
                  flush
                  action={
                    <div
                      style={{
                        display: "flex",
                        gap: "0.6rem",
                        alignItems: "center",
                      }}
                    >
                      <strong className="dash-nowrap">
                        {money(sectionTotal, invoice.currency)}
                      </strong>
                      <form action={deleteInvoiceSection}>
                        <input
                          type="hidden"
                          name="sectionId"
                          value={section.id}
                        />
                        <input
                          type="hidden"
                          name="invoiceId"
                          value={invoice.id}
                        />
                        <button type="submit" className="dash-btn">
                          Remove phase
                        </button>
                      </form>
                    </div>
                  }
                >
                  <Table
                    headers={["Item", "Qty", "Unit price", "Amount", ""]}
                    empty="No lines in this phase yet."
                  >
                    {itemRows(section.items)}
                  </Table>
                  {itemForm(section.id)}
                </Card>
              </div>
            );
          })}

          {/* ── Add a phase ── */}
          <Card
            title="Add a phase"
            subtitle="Phases become the separate tables and the financial summary in the printed document. An invoice with no phases prints as one plain table."
          >
            <form action={addInvoiceSection}>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <div className="dash-formgrid">
                <label style={{ gridColumn: "span 2" }}>
                  <span className="dash-field-label">Title</span>
                  <input
                    name="title"
                    required
                    maxLength={160}
                    placeholder="PHASE 1 — WEBSITE (NEXT.JS & REACT)"
                    className="dash-input"
                  />
                </label>
                <label style={{ gridColumn: "span 2" }}>
                  <span className="dash-field-label">
                    Subtitle <span className="dash-td-muted">(optional)</span>
                  </span>
                  <input
                    name="subtitle"
                    maxLength={200}
                    placeholder="Estimated delivery: 4–6 weeks from start date"
                    className="dash-input"
                  />
                </label>
                <button type="submit" className="dash-btn dash-btn--primary">
                  Add phase
                </button>
              </div>
            </form>
          </Card>

          {/* ── Lines outside any phase ── */}
          <div style={{ marginTop: "1.5rem" }}>
            <Card
              title={invoice.sections.length ? "Additional lines" : "Line items"}
              subtitle={
                invoice.sections.length
                  ? "Lines that belong to no phase — contingency, bonuses, discounts. They are left out of the phase tables and printed as their own rows in the financial summary."
                  : undefined
              }
              flush
            >
              <Table
                headers={["Item", "Qty", "Unit price", "Amount", ""]}
                empty="No lines here yet."
              >
                {itemRows(loose)}
              </Table>
              {itemForm(null)}
            </Card>
          </div>

          {/* ── Payment schedule ── */}
          <div style={{ marginTop: "1.5rem" }}>
            <Card
              title="Payment schedule"
              subtitle="What unlocks each instalment. Printed as the schedule table; leave it empty and the table is omitted."
              flush
              action={
                scheduled > 0 && Math.abs(scheduleGap) > 0.5 ? (
                  <span
                    className="dash-nowrap"
                    style={{ color: "var(--color-primary)", fontWeight: 700 }}
                  >
                    {scheduleGap > 0 ? "Unscheduled " : "Over-scheduled "}
                    {money(Math.abs(scheduleGap), invoice.currency)}
                  </span>
                ) : undefined
              }
            >
              <Table
                headers={["Instalment", "Trigger", "Amount", "Status", ""]}
                empty="No instalments yet."
              >
                {invoice.installments.map((x, idx) => (
                  <tr key={x.id}>
                    <td className="dash-nowrap">
                      {x.label ??
                        `${idx + 1}${
                          x.percent !== null
                            ? ` — ${Number(x.percent)}%`
                            : ""
                        }`}
                    </td>
                    <td>{x.trigger}</td>
                    <td className="dash-nowrap">
                      {money(String(x.amount), invoice.currency)}
                    </td>
                    <td>
                      <form
                        action={updateInstallmentStatus}
                        className="dash-inline-form"
                      >
                        <input
                          type="hidden"
                          name="installmentId"
                          value={x.id}
                        />
                        <input
                          type="hidden"
                          name="invoiceId"
                          value={invoice.id}
                        />
                        <select
                          name="status"
                          defaultValue={x.status}
                          className="dash-select"
                        >
                          {INSTALLMENT_STATUSES.map((sv) => (
                            <option key={sv} value={sv}>
                              {sentenceCase(sv)}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="dash-btn">
                          Set
                        </button>
                      </form>
                    </td>
                    <td>
                      <form action={deleteInvoiceInstallment}>
                        <input
                          type="hidden"
                          name="installmentId"
                          value={x.id}
                        />
                        <input
                          type="hidden"
                          name="invoiceId"
                          value={invoice.id}
                        />
                        <button type="submit" className="dash-btn">
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </Table>

              <div style={{ padding: "1.1rem 1.35rem" }}>
                <form action={addInvoiceInstallment}>
                  <input type="hidden" name="invoiceId" value={invoice.id} />
                  <div className="dash-formgrid">
                    <label style={{ gridColumn: "span 2" }}>
                      <span className="dash-field-label">Trigger</span>
                      <input
                        name="trigger"
                        required
                        maxLength={300}
                        placeholder="Contract signed — Phase 1 kickoff"
                        className="dash-input"
                      />
                    </label>
                    <label>
                      <span className="dash-field-label">
                        Amount ({invoice.currency})
                      </span>
                      <input
                        type="number"
                        name="amount"
                        min="0.01"
                        step="0.01"
                        required
                        className="dash-input"
                      />
                    </label>
                    <label>
                      <span className="dash-field-label">
                        % <span className="dash-td-muted">(optional)</span>
                      </span>
                      <input
                        type="number"
                        name="percent"
                        min="0"
                        max="100"
                        step="0.1"
                        className="dash-input"
                      />
                    </label>
                    <button type="submit" className="dash-btn dash-btn--primary">
                      Add instalment
                    </button>
                  </div>
                </form>
              </div>
            </Card>
          </div>

          {/* ── Payments received ── */}
          <div style={{ marginTop: "1.5rem" }}>
            <Card
              title="Payments received"
              subtitle="Recorded from the Payments page. An instalment is the plan; these are the facts."
              flush
            >
              <Table
                headers={["Date", "Method", "Amount", "Status"]}
                empty="No payments recorded against this document yet."
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
                      {money(String(p.amount), invoice.currency)}
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

        {/* ── Right: money, then the wording the PDF prints ── */}
        <div>
          <Card title="Summary">
            <dl className="dash-deflist" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <dt>Subtotal</dt>
                <dd>{money(String(invoice.subtotal), invoice.currency)}</dd>
              </div>
              <div>
                <dt>Tax</dt>
                <dd>{money(String(invoice.tax), invoice.currency)}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                  {money(String(invoice.total), invoice.currency)}
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
              Subtotal is the sum of every line — phase lines and additional
              lines alike — and cannot be typed in directly.
            </p>

            <div className="dash-rule" style={{ margin: "1.1rem 0 0.9rem" }} />

            <form action={updateInvoiceStatus} className="dash-inline-form">
              <input type="hidden" name="id" value={invoice.id} />
              <select
                name="status"
                defaultValue={invoice.status}
                className="dash-select"
              >
                {STATUSES.map((sv) => (
                  <option key={sv} value={sv}>
                    {sentenceCase(sv)}
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
                      <div
                        className="dash-td-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
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

          {/* ── Everything that only the printed PDF cares about ── */}
          <div style={{ marginTop: "1.5rem" }}>
            <Card
              title="Printed document"
              subtitle="Wording for the PDF. None of it changes the arithmetic."
            >
              <form action={updateInvoiceDocument}>
                <input type="hidden" name="id" value={invoice.id} />

                <label style={{ display: "block" }}>
                  <span className="dash-field-label">Document type</span>
                  <select
                    name="docType"
                    defaultValue={invoice.docType}
                    className="dash-select"
                    style={{ width: "100%" }}
                  >
                    <option value="QUOTE">Quote</option>
                    <option value="INVOICE">Invoice</option>
                  </select>
                </label>

                <label style={{ display: "block", marginTop: "0.7rem" }}>
                  <span className="dash-field-label">Headline</span>
                  <input
                    name="title"
                    maxLength={160}
                    defaultValue={invoice.title ?? ""}
                    placeholder={
                      isQuote ? "QUOTE & FUND DISTRIBUTION" : "INVOICE"
                    }
                    className="dash-input"
                  />
                </label>

                <label style={{ display: "block", marginTop: "0.7rem" }}>
                  <span className="dash-field-label">Sub-headline</span>
                  <input
                    name="subject"
                    maxLength={240}
                    defaultValue={invoice.subject ?? ""}
                    placeholder="Groupe ZONECINQ® — Website & Mobile Application"
                    className="dash-input"
                  />
                </label>

                <label style={{ display: "block", marginTop: "0.7rem" }}>
                  <span className="dash-field-label">Project scope</span>
                  <textarea
                    name="scope"
                    rows={3}
                    maxLength={1200}
                    defaultValue={invoice.scope ?? ""}
                    placeholder="Modern Next.js & React Web Application, Native Android Application…"
                    className="dash-input"
                    style={{ resize: "vertical" }}
                  />
                </label>

                <label style={{ display: "block", marginTop: "0.7rem" }}>
                  <span className="dash-field-label">
                    Budget line{" "}
                    <span className="dash-td-muted">(optional)</span>
                  </span>
                  <input
                    name="budgetLabel"
                    maxLength={120}
                    defaultValue={invoice.budgetLabel ?? ""}
                    placeholder={money(String(invoice.total), invoice.currency)}
                    className="dash-input"
                  />
                </label>

                <label style={{ display: "block", marginTop: "0.7rem" }}>
                  <span className="dash-field-label">Valid until</span>
                  <input
                    type="date"
                    name="validUntil"
                    defaultValue={dateInputValue(invoice.validUntil)}
                    className="dash-input"
                  />
                </label>

                <label style={{ display: "block", marginTop: "0.7rem" }}>
                  <span className="dash-field-label">
                    Terms & conditions — one per line
                  </span>
                  <textarea
                    name="terms"
                    rows={8}
                    defaultValue={invoice.terms.join("\n")}
                    className="dash-input"
                    style={{ resize: "vertical" }}
                  />
                </label>

                <div className="dash-rule" style={{ margin: "1.1rem 0 0.9rem" }} />

                <label style={{ display: "block" }}>
                  <span className="dash-field-label">Client signatory</span>
                  <input
                    name="clientSignerName"
                    maxLength={120}
                    defaultValue={invoice.clientSignerName ?? ""}
                    placeholder={invoice.client?.name ?? "Client name"}
                    className="dash-input"
                  />
                </label>

                <label style={{ display: "block", marginTop: "0.7rem" }}>
                  <span className="dash-field-label">Our signatory</span>
                  <input
                    name="issuerSignerName"
                    maxLength={120}
                    defaultValue={invoice.issuerSignerName ?? ""}
                    placeholder="Obed Bolak Fuchu"
                    className="dash-input"
                  />
                </label>

                <label style={{ display: "block", marginTop: "0.7rem" }}>
                  <span className="dash-field-label">Signature caption</span>
                  <input
                    name="issuerSignerRole"
                    maxLength={80}
                    defaultValue={invoice.issuerSignerRole ?? ""}
                    placeholder="Authorized Signature"
                    className="dash-input"
                  />
                </label>

                <div className="dash-actions">
                  <button type="submit" className="dash-btn dash-btn--primary">
                    Save document
                  </button>
                </div>
              </form>

              <p className="dash-hint">
                Blank fields fall back to your company settings, so most
                documents only need the sub-headline and the scope.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
