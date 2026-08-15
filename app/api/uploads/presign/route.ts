// POST /api/uploads/presign
// Hands the browser a short-lived URL to PUT a file straight into R2.
//
// Signing is the sensitive part: anyone who can call this endpoint can write
// to the bucket, so it is gated on a signed-in user and validates the category,
// MIME type and size before signing anything.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import {
  buildKey,
  bucketNameFor,
  isCategory,
  presignUpload,
  publicUrlFor,
  validateUpload,
  CATEGORIES,
} from "@/lib/r2";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  let body: { category?: string; filename?: string; contentType?: string; size?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { category, filename, contentType, size } = body;

  if (!category || !isCategory(category)) {
    return NextResponse.json(
      {
        error: `Unknown category. Expected one of: ${Object.keys(CATEGORIES).join(", ")}`,
      },
      { status: 400 },
    );
  }
  if (!filename || !contentType || typeof size !== "number") {
    return NextResponse.json(
      { error: "filename, contentType and size are required" },
      { status: 400 },
    );
  }

  // Certificates and course materials are staff-facing content, not something
  // any signed-in account should be able to write.
  const adminOnly: string[] = ["certificates", "materials", "projects"];
  if (adminOnly.includes(category) && !user.role?.includes("ADMIN")) {
    return NextResponse.json(
      { error: "Only admins can upload to this category" },
      { status: 403 },
    );
  }

  const invalid = validateUpload(category, contentType, size);
  if (invalid) {
    return NextResponse.json(invalid, { status: 400 });
  }

  try {
    const key = buildKey(category, filename);
    const uploadUrl = await presignUpload(category, key, contentType);
    const visibility = CATEGORIES[category].visibility;
    const publicUrl = publicUrlFor(category, key);

    // Recorded up front, unconfirmed. If the browser never reports success the
    // row stays confirmed:false and is a known orphan rather than an invisible
    // object nobody can enumerate.
    const upload = await prisma.upload.create({
      data: {
        key,
        bucket: bucketNameFor(category),
        category,
        visibility,
        filename: filename.slice(0, 255),
        contentType,
        size,
        url: publicUrl,
        confirmed: false,
        uploadedById: user.id,
      },
      select: { id: true },
    });

    return NextResponse.json({
      uploadUrl,
      key,
      uploadId: upload.id,
      // null for private categories — those are read via /api/uploads/download
      publicUrl,
      visibility,
    });
  } catch (err) {
    console.error("[uploads] presign failed:", err);
    return NextResponse.json(
      { error: "Could not prepare the upload. Check the R2 configuration." },
      { status: 500 },
    );
  }
}
