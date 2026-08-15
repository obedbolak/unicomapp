import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Shell, { type NavItem } from "@/components/dashboard/Shell";

export const metadata = {
  title: "Admin — UnicomTeam",
  robots: { index: false, follow: false },
};

const nav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "grid" },
  { href: "/admin/messages", label: "Messages", icon: "mail" },
  { href: "/admin/enrollments", label: "Enrollments", icon: "users" },
  { href: "/admin/payments", label: "Payments", icon: "wallet" },
  { href: "/admin/invoices", label: "Invoices", icon: "receipt" },
  { href: "/admin/certificates", label: "Certificates", icon: "award" },
  { href: "/admin/projects", label: "Projects", icon: "briefcase" },
  { href: "/admin/team", label: "Team", icon: "team" },

  {
    href: "/admin/activity",
    label: "Activity",
    icon: "pulse",
    section: "Audit",
  },
  { href: "/admin/verifications", label: "Verifications", icon: "shield" },

  {
    href: "/dashboard",
    label: "My work",
    icon: "spark",
    section: "Personal",
  },
  { href: "/admin/profile", label: "Profile", icon: "user" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?callbackUrl=/admin");

  return (
    <Shell
      nav={nav}
      userName={admin.name ?? admin.email ?? "Admin"}
      userTitle={admin.title}
      userImage={admin.image}
      profileHref="/admin/profile"
    >
      {children}
    </Shell>
  );
}
