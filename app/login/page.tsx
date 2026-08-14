"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  const font = "var(--font-display)";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: "1.25rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ marginBottom: "0.5rem" }}>
          <h1
            style={{
              fontFamily: font,
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            UnicomTeam
          </h1>
          <p
            style={{
              fontFamily: font,
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              margin: "0.35rem 0 0",
            }}
          >
            Sign in to your team dashboard.
          </p>
        </div>

        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          style={inputStyle}
        />

        {error && (
          <span
            style={{ fontFamily: font, fontSize: "0.75rem", color: "#ef4444" }}
          >
            {error}
          </span>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "0.5rem",
            padding: "0.8rem 1.5rem",
            borderRadius: "0.75rem",
            background: "var(--color-primary)",
            border: "1px solid var(--color-primary)",
            color: "#000",
            fontFamily: font,
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Signing in…" : "Sign in →"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--color-text)",
};

const inputStyle: React.CSSProperties = {
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
