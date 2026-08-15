import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/ui";
import ProfilePanels from "@/components/dashboard/ProfilePanels";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/profile");

  const isAdmin = user.role?.includes("ADMIN") ?? false;

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Your details, password and active sessions."
      />
      <ProfilePanels userId={user.id} canEditTitle={isAdmin} />
    </>
  );
}
