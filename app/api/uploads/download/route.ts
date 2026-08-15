// GET /api/uploads/download?category=certificates&key=...
// Issues a time-limited read URL for an object in a PRIVATE bucket and
// redirects to it.
//
// Public categories are deliberately rejected: those already have a permanent
// custom-domain URL, and routing them through here would waste a round trip
// and bypass Cloudflare's edge cache.

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { CATEGORIES, isCategory, presignDownload } from "@/lib/r2";

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "";
  const key = searchParams.get("key") ?? "";

  if (!isCategory(category)) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }
  if (!key || !key.startsWith(`${category}/`)) {
    // Pinning the key to its category prefix stops a caller reaching into
    // another category by passing a crafted key.
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }
  if (CATEGORIES[category].visibility === "public") {
    return NextResponse.json(
      { error: "This category is served from the public CDN URL" },
      { status: 400 },
    );
  }

  try {
    const url = await presignDownload(category, key, 300);
    return NextResponse.redirect(url, 302);
  } catch (err) {
    console.error("[uploads] download presign failed:", err);
    return NextResponse.json(
      { error: "Could not generate a download link" },
      { status: 500 },
    );
  }
}
