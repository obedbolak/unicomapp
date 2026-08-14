import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import Shell from "@/components/dashboard/Shell";

export const metadata = {
  title: "My work — UnicomTeam",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const nav = [
    { href: "/dashboard", label: "My work" },
    ...(user.role?.includes("ADMIN")
      ? [{ href: "/admin", label: "Admin" }]
      : []),
  ];

  return (
    <Shell
      nav={nav}
      userName={user.name ?? user.email ?? "Team member"}
      userTitle={user.title}
    >
      {children}
    </Shell>
  );
}
