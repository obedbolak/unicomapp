"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyLandingPage() {
  const router = useRouter();
  const [certNo, setCertNo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certNo.trim();
    if (!trimmed) {
      setError("Please enter a certificate number.");
      return;
    }
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main
      className="section-page"
      style={{
        width: "100%",
        paddingBottom: "4rem",
        paddingTop: "calc(var(--header-height-mobile) + 2rem)",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
              fontWeight: 900,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Verify a Certificate
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: "var(--color-text-muted)",
              margin: "0.5rem 0 0",
              lineHeight: 1.6,
            }}
          >
            Enter the certificate number found on the document to confirm its
            authenticity.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            borderRadius: "1.25rem",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <label
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--color-text)",
            }}
          >
            Certificate Number
          </label>
          <input
            value={certNo}
            onChange={(e) => {
              setCertNo(e.target.value);
              setError("");
            }}
            placeholder="e.g. UCT-INT-2026-0015"
            style={{
              width: "100%",
              padding: "0.7rem 0.9rem",
              borderRadius: "0.65rem",
              border: "1px solid var(--color-border)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--color-text)",
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
          {error && (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                color: "#ef4444",
              }}
            >
              {error}
            </span>
          )}
          <button
            type="submit"
            style={{
              padding: "0.8rem 1.5rem",
              borderRadius: "0.75rem",
              background: "var(--color-primary)",
              border: "1px solid var(--color-primary)",
              color: "#000",
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Verify →
          </button>
        </form>
      </div>
    </main>
  );
}
