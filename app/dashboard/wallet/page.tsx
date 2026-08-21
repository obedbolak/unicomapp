import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import WalletCard from "@/components/dashboard/WalletCard";
import SharesCard from "@/components/dashboard/SharesCard";
import ClaimsCard from "@/components/dashboard/ClaimsCard";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function StaffWalletPage() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/wallet");

  return (
    <>
      <PageHeader
        title="Wallet"
        subtitle="What you've earned, your equity, and payouts."
      />

      <WalletCard userId={user.id} />

      <div style={{ marginTop: "1.5rem" }}>
        <ClaimsCard userId={user.id} />
      </div>

      {/* Renders nothing for people who hold no shares. */}
      <div style={{ marginTop: "1.5rem" }}>
        <SharesCard userId={user.id} />
      </div>
    </>
  );
}
