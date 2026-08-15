"use client";

// Avatar picker for the profile form.
//
// Keeps a hidden input named "image" in sync with whatever was uploaded, so
// the surrounding server action still just reads formData.get("image") and
// knows nothing about R2. The URL stays editable by hand for anyone who wants
// to paste one in.

import { useState } from "react";
import FileUpload from "./FileUpload";

export default function AvatarField({
  defaultValue,
}: {
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");

  return (
    <div>
      <span className="dash-field-label">Profile photo</span>

      <FileUpload
        category="avatars"
        accept="image/png,image/jpeg,image/webp,image/avif"
        label={url ? "Replace photo" : "Upload photo"}
        currentUrl={url || null}
        onUploaded={(result) => {
          if (result.publicUrl) setUrl(result.publicUrl);
        }}
      />

      <input
        name="image"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="…or paste an image URL"
        maxLength={500}
        className="dash-input"
        style={{ marginTop: "0.6rem" }}
      />
    </div>
  );
}
