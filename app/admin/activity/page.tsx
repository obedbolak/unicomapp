import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { describeAction } from "@/lib/activity";
import { Card, PageHeader, Table } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 60;

function when(d: Date) {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function summarize(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "—";
  const entries = Object.entries(meta as Record<string, unknown>);
  if (entries.length === 0) return "—";
  return entries
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
    .join(" · ");
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; entity?: string }>;
}) {
  const { page, entity } = await searchParams;
  const current = Math.max(1, Number(page) || 1);

  const where = entity ? { entity } : undefined;

  const [logs, total, entities] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (current - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.activityLog.count({ where }),
    prisma.activityLog.groupBy({ by: ["entity"], _count: { _all: true } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const link = (p: number) =>
    `/admin/activity?page=${p}${entity ? `&entity=${entity}` : ""}`;

  return (
    <>
      <PageHeader
        title="Activity"
        subtitle="Every change made through the admin, newest first."
      />

      <Card
        title="Audit trail"
        subtitle={`${total.toLocaleString("en-US")} entries${
          entity ? ` for ${entity}` : ""
        }`}
        flush
      >
        <div className="dash-filters" style={{ padding: "0 1.35rem" }}>
          <Link href="/admin/activity" className="dash-chip" data-active={!entity}>
            All
          </Link>
          {entities
            .sort((a, b) => b._count._all - a._count._all)
            .map((e) => (
              <Link
                key={e.entity}
                href={`/admin/activity?entity=${e.entity}`}
                className="dash-chip"
                data-active={entity === e.entity}
              >
                {e.entity} ({e._count._all})
              </Link>
            ))}
        </div>

        <Table
          headers={["When", "Who", "Action", "Entity", "Details"]}
          empty="Nothing logged yet. Entries appear as you use the admin."
        >
          {logs.map((l) => (
            <tr key={l.id}>
              <td className="dash-nowrap dash-td-muted">{when(l.createdAt)}</td>
              <td className="dash-nowrap">
                {l.user?.name ?? l.user?.email ?? "System"}
              </td>
              <td>{describeAction(l.action)}</td>
              <td className="dash-td-muted">
                {l.entity}
                {l.entityId && (
                  <span className="dash-mono" style={{ opacity: 0.6 }}>
                    {" "}
                    {l.entityId.slice(0, 8)}
                  </span>
                )}
              </td>
              <td className="dash-td-muted">{summarize(l.meta)}</td>
            </tr>
          ))}
        </Table>

        {pages > 1 && (
          <div
            className="dash-filters"
            style={{ padding: "1rem 1.35rem", marginBottom: 0 }}
          >
            {current > 1 && (
              <Link href={link(current - 1)} className="dash-chip">
                ← Previous
              </Link>
            )}
            <span className="dash-chip" data-active>
              Page {current} of {pages}
            </span>
            {current < pages && (
              <Link href={link(current + 1)} className="dash-chip">
                Next →
              </Link>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
