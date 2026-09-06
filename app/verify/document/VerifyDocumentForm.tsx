"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const field: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  borderRadius: "0.65rem",
  border: "1px solid var(--color-border)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--color-text)",
  fontFamily: "var(--font-display)",
  fontSize: "0.875rem",
  outline: "none",
};

const label: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--color-text)",
  display: "block",
  marginBottom: "0.4rem",
};

export default function VerifyDocumentForm({
  defaultNumber = "",
  defaultCode = "",
}: {
  defaultNumber?: string;
  defaultCode?: string;
}) {
  const router = useRouter();
  const [number, setNumber] = useState(defaultNumber);
  const [code, setCode] = useState(defaultCode);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!number.trim() || !code.trim()) {
      setError("Enter both the document number and the verification code.");
      return;
    }

    // A GET with the answer in the query string, so the result is a real URL:
    // it can be bookmarked, sent to an accountant, or reached straight from a
    // link printed on the document.
    router.push(
      `/verify/document?no=${encodeURIComponent(
        number.trim(),
      )}&code=${encodeURIComponent(code.trim())}`,
    );
  };

  return (
    <form
      onSubmit={submit}
      style={{
        borderRadius: "1.25rem",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.1rem",
      }}
    >
      <div>
        <label style={label} htmlFor="verify-number">
          Document number
        </label>
        <input
          id="verify-number"
          value={number}
          onChange={(e) => {
            setNumber(e.target.value);
            setError("");
          }}
          placeholder="e.g. UCT-QTE-2026-0001"
          autoComplete="off"
          spellCheck={false}
          style={field}
        />
      </div>

      <div>
        <label style={label} htmlFor="verify-code">
          Verification code
        </label>
        <input
          id="verify-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          placeholder="e.g. 7K2M-9QXA"
          autoComplete="off"
          spellCheck={false}
          style={{ ...field, letterSpacing: "0.08em" }}
        />
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            margin: "0.45rem 0 0",
            lineHeight: 1.5,
          }}
        >
          Both are printed at the foot of every page of your quote or invoice.
        </p>
      </div>

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
  );
}
