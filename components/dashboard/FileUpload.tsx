"use client";

// Direct-to-R2 uploader.
//
// Flow: ask our server for a signed URL → PUT the file straight to R2 → hand
// the resulting URL/key back to the parent. The file never passes through
// Vercel, so there's no 4.5MB body limit and no bandwidth cost.
//
// XMLHttpRequest rather than fetch() because fetch still has no upload
// progress events, and a silent progress bar on a 25MB PDF is worse than none.

import { useRef, useState } from "react";

export type UploadResult = {
  /** Upload row id — what other models store to reference this file. */
  uploadId: string;
  key: string;
  /** Permanent CDN URL for public categories, null for private ones. */
  publicUrl: string | null;
  visibility: "public" | "private";
};

export default function FileUpload({
  category,
  accept,
  label = "Choose file",
  currentUrl,
  onUploaded,
}: {
  category: "avatars" | "projects" | "certificates" | "materials";
  accept?: string;
  label?: string;
  /** Existing file, shown as a preview before anything new is picked. */
  currentUrl?: string | null;
  onUploaded: (result: UploadResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  const isImage = (url: string | null) =>
    !!url && /\.(png|jpe?g|webp|avif|gif)(\?|$)/i.test(url);

  async function handleFile(file: File) {
    setError(null);
    setProgress(0);

    try {
      // 1. Ask our server to sign it. Server re-checks type and size.
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      const presign = await presignRes.json();
      if (!presignRes.ok) {
        throw new Error(presign.error ?? "Could not prepare the upload");
      }

      // 2. PUT straight to R2. This is the request the bucket's CORS policy
      //    has to allow — origin listed, PUT in AllowedMethods.
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presign.uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(
                new Error(
                  xhr.status === 0
                    ? "Upload blocked — check the bucket's CORS policy allows this origin and PUT."
                    : `R2 rejected the upload (${xhr.status})`,
                ),
              );
        xhr.onerror = () =>
          reject(
            new Error(
              "Upload blocked — check the bucket's CORS policy allows this origin and PUT.",
            ),
          );
        xhr.send(file);
      });

      // 3. Tell our server it landed, so the Upload row stops counting as an
      //    abandoned orphan.
      await fetch("/api/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: presign.uploadId }),
      });

      setProgress(100);
      if (presign.publicUrl) setPreview(presign.publicUrl);

      onUploaded({
        uploadId: presign.uploadId,
        key: presign.key,
        publicUrl: presign.publicUrl,
        visibility: presign.visibility,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setTimeout(() => setProgress(null), 600);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {isImage(preview) && (
          <img
            src={preview!}
            alt=""
            width={44}
            height={44}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              objectFit: "cover",
              border: "1px solid var(--dash-card-border)",
              flex: "none",
            }}
          />
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            // Reset so picking the same file twice still fires onChange.
            e.target.value = "";
          }}
        />

        <button
          type="button"
          className="dash-btn"
          disabled={progress !== null}
          onClick={() => inputRef.current?.click()}
        >
          {progress !== null ? `Uploading ${progress}%` : label}
        </button>
      </div>

      {progress !== null && (
        <div className="dash-track" style={{ marginTop: "0.6rem" }}>
          <div className="dash-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && (
        <p
          className="dash-hint"
          style={{ color: "#f87171", marginTop: "0.5rem" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
