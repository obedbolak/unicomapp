import { prisma } from "@/lib/prisma";
import {
  Card,
  PageHeader,
  StatGrid,
  StatTile,
  Table,
} from "@/components/dashboard/ui";
import { IconAward, IconSearch, IconClose } from "@/components/dashboard/icons";

export const dynamic = "force-dynamic";

function when(d: Date) {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "Mozilla/5.0 (Windows NT 10.0…) Chrome/120" → "Chrome · Windows" */
function readableAgent(ua: string | null): string {
  if (!ua) return "—";
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\//.test(ua) ? "Opera"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : /Firefox\//.test(ua) ? "Firefox"
    : "Unknown browser";

  const os =
    /Windows/.test(ua) ? "Windows"
    : /Android/.test(ua) ? "Android"
    : /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Mac OS X/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux"
    : "";

  return os ? `${browser} · ${os}` : browser;
}

export default async function VerificationsPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [rows, total, thisMonth, misses] = await Promise.all([
    prisma.certificateVerification.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        certificate: { select: { name: true, program: true, status: true } },
      },
    }),
    prisma.certificateVerification.count(),
    prisma.certificateVerification.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.certificateVerification.count({ where: { found: false } }),
  ]);

  return (
    <>
      <PageHeader
        title="Verifications"
        subtitle="Every lookup made on the public /verify page."
      />

      <StatGrid>
        <StatTile
          label="Checks this month"
          value={thisMonth}
          icon={<IconSearch size={20} />}
        />
        <StatTile label="Total checks" value={total} icon={<IconAward size={20} />} />
        <StatTile
          label="Not found"
          value={misses}
          hint={
            misses > 0
              ? "Mistyped numbers — or someone probing"
              : "Every lookup matched"
          }
          icon={<IconClose size={20} />}
          accent={misses > 0 ? "#f87171" : undefined}
        />
      </StatGrid>

      <Card
        title="Lookup log"
        subtitle="Most recent 200 checks."
        flush
      >
        <Table
          headers={["When", "Certificate no.", "Result", "Holder", "Source", "IP"]}
          empty="No verifications yet."
        >
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="dash-nowrap dash-td-muted">{when(r.createdAt)}</td>
              <td className="dash-mono">{r.certNo}</td>
              <td>
                <span
                  className="dash-badge"
                  style={{
                    background: r.found ? "#22c55e1f" : "#f871711f",
                    border: `1px solid ${r.found ? "#22c55e59" : "#f8717159"}`,
                    color: r.found ? "#22c55e" : "#f87171",
                  }}
                >
                  {r.found ? "FOUND" : "NOT FOUND"}
                </span>
              </td>
              <td>
                {r.certificate?.name ?? "—"}
                {r.certificate?.program && (
                  <div className="dash-td-muted" style={{ fontSize: "0.75rem" }}>
                    {r.certificate.program}
                  </div>
                )}
              </td>
              <td className="dash-td-muted">{readableAgent(r.userAgent)}</td>
              <td className="dash-td-muted dash-mono">{r.ip ?? "—"}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
