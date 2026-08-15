import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getUpcoming } from "@/lib/wallet";
import WalletCard from "@/components/dashboard/WalletCard";
import SharesCard from "@/components/dashboard/SharesCard";
import {
  Badge,
  Card,
  PageHeader,
  Table,
  money,
  shortDate,
} from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function StaffWalletPage() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/wallet");

  const upcoming = await getUpcoming(user.id);
  const upcomingTotal = upcoming.reduce((sum, u) => sum + u.amount, 0);

  return (
    <>
      <PageHeader
        title="Wallet"
        subtitle="Your share of project revenue, and payouts."
      />

      <WalletCard userId={user.id} />

      {/* Renders nothing for people who hold no shares. */}
      <div style={{ marginTop: "1.5rem" }}>
        <SharesCard userId={user.id} />
      </div>

      {/* ── Pipeline ──
          Kept visually separate from the balance tiles above. None of this is
          earned yet, and presenting it alongside real money would be
          misleading. */}
      <div style={{ marginTop: "1.5rem" }}>
        <Card
          title="Coming up"
          subtitle="Your share of projects still in progress. Credited on delivery."
          action={
            upcomingTotal > 0 ? (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "var(--color-blue-light)",
                  }}
                >
                  {money(upcomingTotal)}
                </div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--dash-ink-dim)",
                  }}
                >
                  in the pipeline
                </div>
              </div>
            ) : undefined
          }
          flush
        >
          <Table
            headers={["Project", "Status", "Your share", "Worth", "Due"]}
            empty="You're not assigned to any active project with a revenue share."
          >
            {upcoming.map((u) => (
              <tr key={u.projectId}>
                <td style={{ fontWeight: 600 }}>{u.title}</td>
                <td>
                  <Badge value={u.status} />
                </td>
                <td className="dash-td-muted">{u.sharePct}%</td>
                <td className="dash-nowrap" style={{ fontWeight: 700 }}>
                  {money(u.amount, u.currency)}
                </td>
                <td className="dash-nowrap dash-td-muted">
                  {shortDate(u.dueDate)}
                </td>
              </tr>
            ))}
          </Table>

          {upcoming.length > 0 && (
            <p className="dash-hint" style={{ padding: "0 1.35rem 1.1rem" }}>
              Estimates based on each project&apos;s current budget. Nothing
              here is owed to you until the project is marked delivered, and a
              cancelled project earns nothing.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
