import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Shell from "@/components/dashboard/Shell";

export const metadata = {
  title: "Admin — UnicomTeam",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/enrollments", label: "Enrollments" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/certificates", label: "Certificates" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/team", label: "Team" },
  { href: "/dashboard", label: "My work" },
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
    >
      {children}
    </Shell>
  );
}
