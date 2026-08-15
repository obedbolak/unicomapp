"use client";

// WhatsApp-style avatar: the picture *is* the control. Tap it, pick a file,
// and it uploads and saves itself — no separate "Save changes" step.
//
// That also closes a real trap in the old version: the photo lived in the
// profile form, so uploading without pressing Save silently discarded it.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { removeAvatar, updateAvatar } from "@/app/admin/settings-actions";

export default function AvatarField({
  defaultValue,
  name,
}: {
  defaultValue?: string | null;
  /** Used for the initials fallback. */
  name?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [url, setUrl] = useState(defaultValue ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initials = (name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();

  async function handleFile(file: File) {
    setError(null);
    setProgress(0);

    // Show the local file straight away. Waiting on a network round trip
    // before anything visibly changes is what makes uploads feel broken.
    const localPreview = URL.createObjectURL(file);
    const previous = url;
    setUrl(localPreview);

    try {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "avatars",
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const presign = await presignRes.json();
      if (!presignRes.ok) throw new Error(presign.error ?? "Upload failed");

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
            : reject(new Error(`R2 rejected the upload (${xhr.status})`));
        xhr.onerror = () =>
          reject(
            new Error(
              "Upload blocked — check the bucket's CORS policy allows this origin and PUT.",
            ),
          );
        xhr.send(file);
      });

      await fetch("/api/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: presign.uploadId }),
      });

      // Persist immediately — this is the whole point of the pattern.
      await updateAvatar(presign.publicUrl);
      setUrl(presign.publicUrl);
      URL.revokeObjectURL(localPreview);

      // Refresh so the topbar avatar updates without a manual reload.
      router.refresh();
    } catch (err) {
      // Put the old picture back rather than leaving a preview that was
      // never saved.
      setUrl(previous);
      URL.revokeObjectURL(localPreview);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setTimeout(() => setProgress(null), 500);
    }
  }

  const busy = progress !== null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        className="avatar-picker"
        onClick={() => !busy && inputRef.current?.click()}
        aria-label={url ? "Change profile photo" : "Add a profile photo"}
        title="Click to change your photo"
        disabled={busy}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob: previews
          // and arbitrary R2 hosts; next/image can do neither without config.
          <img src={url} alt="" className="avatar-picker-img" />
        ) : (
          <span className="avatar-picker-initials">{initials}</span>
        )}

        <span className="avatar-picker-overlay" aria-hidden="true">
          {busy ? (
            <span className="avatar-picker-pct">{progress}%</span>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7l1.2-2h7.2l1.2 2h1.7A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
              <circle cx="12" cy="12.5" r="3.4" />
            </svg>
          )}
        </span>
      </button>

      <div style={{ minWidth: 0 }}>
        <span className="dash-field-label">Profile photo</span>
        <p
          className="dash-hint"
          style={{ margin: "0.15rem 0 0", fontSize: "0.72rem" }}
        >
          {busy ? "Uploading…" : "Click the photo to change it. Saves instantly."}
        </p>

        {url && !busy && (
          <button
            type="button"
            className="dash-btn"
            style={{ marginTop: "0.5rem", fontSize: "0.65rem" }}
            onClick={async () => {
              setUrl("");
              await removeAvatar();
              router.refresh();
            }}
          >
            Remove photo
          </button>
        )}

        {error && (
          <p
            className="dash-hint"
            style={{ color: "#f87171", marginTop: "0.4rem" }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
