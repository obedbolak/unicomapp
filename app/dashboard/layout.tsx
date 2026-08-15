import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: "user",
      section: "Account",
    },
    { href: "/dashboard/settings", label: "Settings", icon: "settings" },

    ...(user.role?.includes("ADMIN")
      ? ([
          { href: "/admin", label: "Overview", icon: "spark", section: "Admin" },
          { href: "/admin/enrollments", label: "Enrollments", icon: "users" },
          { href: "/admin/payments", label: "Payments", icon: "wallet" },
          { href: "/admin/certificates", label: "Certificates", icon: "award" },
          { href: "/admin/projects", label: "Projects", icon: "briefcase" },
          { href: "/admin/team", label: "Team", icon: "team" },
          { href: "/admin/wallet", label: "Wallet", icon: "wallet" },
        ] as NavItem[])
      : []),
  ];

  // From the database, not the session — see the note in app/admin/layout.tsx.
  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, title: true, image: true },
  });

  return (
    <Shell
      nav={nav}
      userName={me?.name ?? me?.email ?? "Team member"}
      userTitle={me?.title}
      userImage={me?.image}
      profileHref="/dashboard/profile"
    >
      {children}
    </Shell>
  );
}
