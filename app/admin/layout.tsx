import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
  { href: "/admin/wallet", label: "Wallet", icon: "wallet" },

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

  // Read the display fields from the database rather than the session. The
  // session carries a snapshot taken when the JWT was issued, so editing your
  // profile would leave the topbar showing the old name and photo until the
  // token happened to be re-issued. This layout is already dynamic (it reads
  // cookies), so the query costs one indexed lookup per navigation.
  const me = await prisma.user.findUnique({
    where: { id: admin.id },
    select: { name: true, email: true, title: true, image: true },
  });

  return (
    <Shell
      nav={nav}
      userName={me?.name ?? me?.email ?? "Admin"}
      userTitle={me?.title}
      userImage={me?.image}
      profileHref="/admin/profile"
    >
      {children}
    </Shell>
  );
}
