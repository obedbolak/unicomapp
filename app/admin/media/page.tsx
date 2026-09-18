import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/ui";
import MediaClientPage from "./media-client";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?callbackUrl=/admin/media");

  // Only fetch confirmed media items
  const media = await prisma.upload.findMany({
    where: { category: "media", confirmed: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      url: true,
      size: true,
      contentType: true,
      createdAt: true,
    },
  });

  return (
    <>
      <PageHeader
        title="Media Gallery"
        subtitle="Manage and upload photos and videos to use anywhere on the site."
      />
      <MediaClientPage initialMedia={media as any} />
    </>
  );
}
