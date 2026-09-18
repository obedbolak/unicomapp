"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/dashboard/FileUpload";
import { Card, shortDate } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { deleteMediaAction } from "./media-actions";

type MediaItem = {
  id: string;
  filename: string;
  url: string | null;
  size: number;
  contentType: string;
  createdAt: Date;
};

export default function MediaClientPage({ initialMedia }: { initialMedia: MediaItem[] }) {
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const copyToClipboard = async (url: string | null) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy link.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file? This cannot be undone and any pages using this link will break.")) return;
    
    setIsDeleting(id);
    const res = await deleteMediaAction(id);
    if (res.success) {
      setMedia(media.filter(m => m.id !== id));
      router.refresh();
    } else {
      alert("Failed to delete: " + res.error);
    }
    setIsDeleting(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <Card title="Upload New Media">
        <FileUpload
          category="media"
          label="Drop a photo or video here, or click to browse"
          onUploaded={() => {
            // Refresh to show the new item
            router.refresh();
            // Optional: The server will send down fresh initialMedia props, but since we use state,
            // we should technically reload or sync state. An easy way is to let the server re-render.
            window.location.reload();
          }}
        />
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {media.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No media uploaded yet.</p>
        ) : (
          media.map((item) => {
            const isVideo = item.contentType.startsWith("video/");
            return (
              <div
                key={item.id}
                style={{
                  background: "var(--dash-card-bg)",
                  border: "1px solid var(--dash-card-border)",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Media Preview */}
                <div
                  style={{
                    height: "180px",
                    background: "rgba(0,0,0,0.2)",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isVideo ? (
                    <video
                      src={item.url || ""}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      controls={false}
                      muted
                      preload="metadata"
                    />
                  ) : item.url ? (
                    <img
                      src={item.url}
                      alt={item.filename}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ color: "var(--color-text-muted)" }}>Preview Unavailable</span>
                  )}
                  {isVideo && (
                    <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem" }}>
                      <span className="dash-badge" style={{ background: '#3b82f61f', color: '#3b82f6', border: '1px solid #3b82f659' }}>
                        Video
                      </span>
                    </div>
                  )}
                </div>

                {/* Details & Actions */}
                <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                  <div>
                    <h4
                      style={{
                        margin: "0 0 0.25rem",
                        fontSize: "0.875rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={item.filename}
                    >
                      {item.filename}
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {formatBytes(item.size)} • {shortDate(item.createdAt)}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ flex: 1 }}
                      onClick={() => copyToClipboard(item.url)}
                      disabled={!item.url}
                    >
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting === item.id}
                      style={{ color: "var(--color-error)", borderColor: "var(--color-error)" }}
                    >
                      {isDeleting === item.id ? "..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
