// POST /api/uploads/complete
// Marks an Upload row confirmed once the browser's PUT to R2 succeeded.
//
// Rows that never reach this endpoint stay confirmed:false — an abandoned or
// failed upload. That is the whole point of the two-step flow: an object in the
// bucket with no confirmed row is a known orphan and can be swept.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  let uploadId: string | undefined;
  try {
    ({ uploadId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!uploadId) {
    return NextResponse.json({ error: "uploadId is required" }, { status: 400 });
  }

  const upload = await prisma.upload.findUnique({ where: { id: uploadId } });

  if (!upload) {
    return NextResponse.json({ error: "Unknown upload" }, { status: 404 });
  }
  // Only the person who requested the signature may confirm it.
  if (upload.uploadedById !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const confirmed = await prisma.upload.update({
    where: { id: uploadId },
    data: { confirmed: true },
    select: { id: true, key: true, url: true, visibility: true, filename: true },
  });

  await logActivity(user.id, "upload.completed", "User", user.id, {
    category: upload.category,
    key: upload.key,
    size: upload.size,
  });

  return NextResponse.json(confirmed);
}
