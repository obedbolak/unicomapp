import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateMessageStatus } from "../inbox-actions";
import {
  Badge,
  Card,
  PageHeader,
  StatGrid,
  StatTile,
  Table,
  shortDate,
} from "@/components/dashboard/ui";
import { IconUsers, IconBell, IconAward } from "@/components/dashboard/icons";
import type { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: LeadStatus[] = ["NEW", "READ", "REPLIED", "ARCHIVED"];

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = STATUSES.includes(status as LeadStatus)
    ? (status as LeadStatus)
    : undefined;

  const [messages, counts, unhandled] = await Promise.all([
    prisma.contactMessage.findMany({
      where: active ? { status: active } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { handledBy: { select: { name: true } } },
    }),
    prisma.contactMessage.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  const countFor = (s: LeadStatus) =>
    counts.find((c) => c.status === s)?._count._all ?? 0;

  const total = counts.reduce((sum, c) => sum + c._count._all, 0);

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Leads from the contact form on the public site."
      />

      <StatGrid>
        <StatTile
          label="Unread"
          value={unhandled}
          hint={unhandled > 0 ? "Waiting on a first reply" : "All caught up"}
          icon={<IconBell size={20} />}
          accent={unhandled > 0 ? "var(--color-primary)" : undefined}
        />
        <StatTile
          label="Replied"
          value={countFor("REPLIED")}
          icon={<IconAward size={20} />}
        />
        <StatTile label="Total received" value={total} icon={<IconUsers size={20} />} />
      </StatGrid>

      <Card
        title="Inbox"
        subtitle={
          active
            ? `Showing ${active.toLowerCase()} messages.`
            : "Showing every message, newest first."
        }
        flush
      >
        <div className="dash-filters" style={{ padding: "0 1.35rem" }}>
          <Link
            href="/admin/messages"
            className="dash-chip"
            data-active={!active}
          >
            All ({total})
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/messages?status=${s}`}
              className="dash-chip"
              data-active={active === s}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()} ({countFor(s)})
            </Link>
          ))}
        </div>

        <Table
          headers={[
            "Received",
            "From",
            "Subject / service",
            "Message",
            "Status",
            "Handled by",
            "",
          ]}
          empty={
            active
              ? `No ${active.toLowerCase()} messages.`
              : "No messages yet. They'll appear here when someone uses the contact form."
          }
        >
          {messages.map((m) => (
            <tr key={m.id}>
              <td className="dash-nowrap dash-td-muted">
                {shortDate(m.createdAt)}
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <a
                  href={`mailto:${m.email}`}
                  className="dash-td-muted"
                  style={{ fontSize: "0.75rem", textDecoration: "none" }}
                >
                  {m.email}
                </a>
                {m.phone && (
                  <div className="dash-td-muted" style={{ fontSize: "0.75rem" }}>
                    {m.phone}
                  </div>
                )}
              </td>
              <td>
                <div>{m.subject ?? "—"}</div>
                {m.service && (
                  <div className="dash-td-muted" style={{ fontSize: "0.75rem" }}>
                    {m.service}
                  </div>
                )}
              </td>
              <td
                className="dash-td-muted"
                style={{ maxWidth: 320, minWidth: 220 }}
              >
                {m.message.length > 180
                  ? `${m.message.slice(0, 180)}…`
                  : m.message}
              </td>
              <td>
                <Badge value={m.status} />
              </td>
              <td className="dash-td-muted dash-nowrap">
                {m.handledBy?.name ?? "—"}
              </td>
              <td>
                <form action={updateMessageStatus} className="dash-inline-form">
                  <input type="hidden" name="id" value={m.id} />
                  <select
                    name="status"
                    defaultValue={m.status}
                    className="dash-select"
                    style={{ width: "auto", minWidth: 110 }}
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
    </>
  );
}
