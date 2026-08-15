// lib/r2.ts
// Cloudflare R2 (S3-compatible) storage.
//
// TWO BUCKETS, on purpose:
//
//   public  — has a custom domain attached, so every object in it is readable
//             by anyone with the URL. Avatars and project images live here.
//   private — no public access, no custom domain. Reached only through
//             short-lived signed GET URLs. Certificates and course materials
//             live here.
//
// Attaching a custom domain makes a whole bucket public; there is no
// per-object toggle. Mixing both in one bucket would mean a student's
// certificate is one guessed URL away from being downloadable.

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

/* ── Upload categories ─────────────────────────────────────────────────────
   Every upload must name a category. The category decides which bucket it
   lands in, what it's allowed to be, and how big it may get — so the limits
   are enforced server-side and can't be edited away in devtools.
   ────────────────────────────────────────────────────────────────────────── */

export const CATEGORIES = {
  avatars: {
    visibility: "public",
    maxBytes: 2 * 1024 * 1024, // 2 MB
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  },
  projects: {
    visibility: "public",
    maxBytes: 5 * 1024 * 1024, // 5 MB
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  },
  certificates: {
    visibility: "private",
    maxBytes: 10 * 1024 * 1024, // 10 MB
    mimeTypes: ["application/pdf"],
  },
  materials: {
    visibility: "private",
    maxBytes: 25 * 1024 * 1024, // 25 MB
    mimeTypes: [
      "application/pdf",
      "application/zip",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
} as const;

export type Category = keyof typeof CATEGORIES;

export function isCategory(value: string): value is Category {
  return value in CATEGORIES;
}

/** Public alias — the Upload registry records which bucket an object is in. */
export function bucketNameFor(category: Category): string {
  return bucketFor(category);
}

function bucketFor(category: Category): string {
  const visibility = CATEGORIES[category].visibility;
  const name =
    visibility === "public"
      ? process.env.R2_BUCKET_PUBLIC
      : process.env.R2_BUCKET_PRIVATE;

  if (!name) {
    throw new Error(
      `Missing ${visibility === "public" ? "R2_BUCKET_PUBLIC" : "R2_BUCKET_PRIVATE"} in the environment`,
    );
  }
  return name;
}

/** Strips anything that would make a messy or unsafe object key. */
function safeName(filename: string): string {
  const cleaned = filename
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned.slice(-80) || "file";
}

/**
 * Object key. The random prefix means re-uploading the same filename never
 * overwrites the previous object, and keys can't be guessed by iterating.
 */
export function buildKey(category: Category, filename: string): string {
  return `${category}/${crypto.randomUUID()}-${safeName(filename)}`;
}

export type ValidationError = { error: string };

/** Server-side guard. Never trust the size or type the browser reports alone. */
export function validateUpload(
  category: Category,
  contentType: string,
  size: number,
): ValidationError | null {
  const rules = CATEGORIES[category];

  if (!(rules.mimeTypes as readonly string[]).includes(contentType)) {
    return {
      error: `${contentType} is not allowed for ${category}. Allowed: ${rules.mimeTypes.join(", ")}`,
    };
  }
  if (!Number.isFinite(size) || size <= 0) {
    return { error: "Invalid file size" };
  }
  if (size > rules.maxBytes) {
    return {
      error: `File is too large. Maximum for ${category} is ${Math.round(rules.maxBytes / 1024 / 1024)} MB`,
    };
  }
  return null;
}

/**
 * Short-lived PUT URL the browser uploads to directly. Five minutes is plenty
 * to start an upload and short enough that a leaked URL is near-useless.
 */
export async function presignUpload(
  category: Category,
  key: string,
  contentType: string,
) {
  return getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: bucketFor(category),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 },
  );
}

/**
 * Where the file can be read from after upload.
 * Public categories return a permanent custom-domain URL; private ones return
 * null, because reading them requires a signed URL generated on demand.
 */
export function publicUrlFor(category: Category, key: string): string | null {
  if (CATEGORIES[category].visibility !== "public") return null;

  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) {
    throw new Error("Missing R2_PUBLIC_BASE_URL in the environment");
  }
  return `${base.replace(/\/$/, "")}/${key}`;
}

/** Time-limited read URL for a private object. Default one hour. */
export async function presignDownload(
  category: Category,
  key: string,
  expiresIn = 3600,
) {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: bucketFor(category), Key: key }),
    { expiresIn },
  );
}

export async function deleteObject(category: Category, key: string) {
  await r2.send(
    new DeleteObjectCommand({ Bucket: bucketFor(category), Key: key }),
  );
}
