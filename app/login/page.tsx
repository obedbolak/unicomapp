"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import "@/components/dashboard/dashboard.css";
import "@/app/dash-glass.css";
import { IconSpark } from "@/components/dashboard/icons";

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

  return (
    <div
      className="dash"
      style={{ display: "grid", placeItems: "center", padding: "2rem 1.25rem" }}
    >
      <form
        onSubmit={handleSubmit}
        className="dash-card"
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.9rem",
        }}
      >
        <div style={{ marginBottom: "0.4rem" }}>
          <span className="dash-brand-mark" aria-hidden="true">
            <IconSpark size={17} style={{ color: "#100a02" }} />
          </span>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 900,
              margin: "0.9rem 0 0.25rem",
              letterSpacing: "-0.02em",
            }}
          >
            UnicomTeam
          </h1>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--dash-ink-muted)",
              margin: 0,
            }}
          >
            Sign in to your team dashboard.
          </p>
        </div>

        <label>
          <span className="dash-field-label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="dash-input"
            style={{ padding: "0.7rem 0.9rem", fontSize: "0.8125rem" }}
          />
        </label>

        <label>
          <span className="dash-field-label">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="dash-input"
            style={{ padding: "0.7rem 0.9rem", fontSize: "0.8125rem" }}
          />
        </label>

        {error && (
          <span style={{ fontSize: "0.75rem", color: "#f87171" }}>{error}</span>
        )}

        <button
          type="submit"
          disabled={loading}
          className="dash-btn dash-btn--primary"
          style={{
            marginTop: "0.4rem",
            padding: "0.8rem",
            fontSize: "0.8125rem",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing in…" : "Sign in →"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
