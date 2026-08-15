import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import Shell, { type NavItem } from "@/components/dashboard/Shell";

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

  const nav: NavItem[] = [
    { href: "/dashboard", label: "My work", icon: "grid" },
    ...(user.role?.includes("ADMIN")
      ? ([
          { href: "/admin", label: "Overview", icon: "spark", section: "Admin" },
          { href: "/admin/enrollments", label: "Enrollments", icon: "users" },
          { href: "/admin/payments", label: "Payments", icon: "wallet" },
          { href: "/admin/certificates", label: "Certificates", icon: "award" },
          { href: "/admin/projects", label: "Projects", icon: "briefcase" },
          { href: "/admin/team", label: "Team", icon: "team" },
        ] as NavItem[])
      : []),
  ];

  return (
    <Shell
      nav={nav}
      userName={user.name ?? user.email ?? "Team member"}
      userTitle={user.title}
      userImage={user.image}
      profileHref={user.role?.includes("ADMIN") ? "/admin/profile" : "/dashboard"}
    >
      {children}
    </Shell>
  );
}
