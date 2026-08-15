import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { createInvoice, updateInvoiceStatus } from "../invoice-actions";
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
import { IconWallet, IconTrend, IconBriefcase } from "@/components/dashboard/icons";
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

export default async function InvoicesPage() {
  const [invoices, clients, projects, settings, paidAgg, openAgg] =
    await Promise.all([
      prisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          client: { select: { name: true } },
          project: { select: { title: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.client.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
        take: 200,
      }),
      prisma.project.findMany({
        orderBy: { title: "asc" },
        select: { id: true, title: true },
        take: 200,
      }),
      getSettings(),
      prisma.invoice.aggregate({
        where: { status: "PAID" },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { status: { in: ["SENT", "PARTIAL", "OVERDUE"] } },
        _sum: { total: true },
        _count: true,
      }),
    ]);

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Client billing. Totals are derived from line items."
      />

      <StatGrid>
        <StatTile
          label="Paid"
          value={moneyCompact(paidAgg._sum.total?.toString(), settings.currency)}
          icon={<IconTrend size={20} />}
        />
        <StatTile
          label="Outstanding"
          value={moneyCompact(openAgg._sum.total?.toString(), settings.currency)}
          hint={`${openAgg._count} open`}
          icon={<IconWallet size={20} />}
        />
        <StatTile
          label="Total issued"
          value={invoices.length}
          icon={<IconBriefcase size={20} />}
        />
      </StatGrid>

      <Card
        title="New invoice"
        subtitle={`The number is generated automatically from the ${settings.invoicePrefix} prefix. Add line items on the next screen.`}
      >
        <form action={createInvoice}>
          <div className="dash-formgrid">
            <label>
              <span className="dash-field-label">Client</span>
              <select name="clientId" className="dash-select">
                <option value="">None</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="dash-field-label">Project</span>
              <select name="projectId" className="dash-select">
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="dash-field-label">Due date</span>
              <input type="date" name="dueDate" className="dash-input" />
            </label>

            <label>
              <span className="dash-field-label">Tax ({settings.currency})</span>
              <input
                type="number"
                name="tax"
                min={0}
                step="0.01"
                defaultValue={0}
                className="dash-input"
              />
            </label>

            <button type="submit" className="dash-btn dash-btn--primary">
              Create draft →
            </button>
          </div>
        </form>
      </Card>

      <div style={{ marginTop: "1.5rem" }}>
        <Card title="All invoices" flush>
          <Table
            headers={[
              "Number",
              "Client",
              "Project",
              "Issued",
              "Due",
              "Lines",
              "Total",
              "Status",
              "",
            ]}
            empty="No invoices yet. Create a draft above."
          >
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="dash-nowrap">
                  <Link
                    href={`/admin/invoices/${inv.id}`}
                    className="dash-mono"
                    style={{
                      color: "var(--color-primary)",
                      textDecoration: "none",
                    }}
                  >
                    {inv.number}
                  </Link>
                </td>
                <td>{inv.client?.name ?? "—"}</td>
                <td className="dash-td-muted">{inv.project?.title ?? "—"}</td>
                <td className="dash-nowrap dash-td-muted">
                  {shortDate(inv.issueDate)}
                </td>
                <td className="dash-nowrap dash-td-muted">
                  {shortDate(inv.dueDate)}
                </td>
                <td className="dash-td-muted">{inv._count.items}</td>
                <td className="dash-nowrap">
                  {money(inv.total.toString(), inv.currency)}
                </td>
                <td>
                  <Badge value={inv.status} />
                </td>
                <td>
                  <form
                    action={updateInvoiceStatus}
                    className="dash-inline-form"
                  >
                    <input type="hidden" name="id" value={inv.id} />
                    <select
                      name="status"
                      defaultValue={inv.status}
                      className="dash-select"
                      style={{ width: "auto", minWidth: 100 }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="dash-btn">
                      Set
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}
