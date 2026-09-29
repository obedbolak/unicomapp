// app/api/certificates/[id]/saved/route.ts
//
// Admin only: the saved copy of a certificate — the exact PDF as it stood when
// issued or last edited — from the private bucket, through a link that
// expires in five minutes.

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { presignDownload } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return new Response("Not authorized", { status: 401 });

  const { id } = await params;
  const cert = await prisma.certificate.findUnique({
    where: { id },
    select: { file: { select: { key: true } } },
  });
  if (!cert?.file) return new Response("No saved copy yet", { status: 404 });

  const url = await presignDownload("certificates", cert.file.key, 300);
  return Response.redirect(url, 302);
}
