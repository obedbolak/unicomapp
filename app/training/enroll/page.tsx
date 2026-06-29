"use client";

import { useState } from "react";

const courses = [
  "Frontend Development",
  "Backend Development",
  "UI/UX Design",
  "Full-Stack Engineering",
  "Digital Marketing",
  "Mobile Development",
  "Desktop App Development",
  "Graphics Design (Crash Course)",
  "Microsoft Excel (Crash Course)",
  "Microsoft Office (Crash Course)",
];

const levels = [
  "Complete Beginner",
  "Some Experience",
  "Intermediate",
  "Advanced",
];
const plans = ["Pay in Full", "Monthly Installments"];

const STEPS = ["Your Details", "Choose Course", "Goals", "Review"];

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  course: string;
  cohort: string;
  level: string;
  goals: string;
  plan: string;
  agree: boolean;
};

const initialData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  course: courses[0],
  cohort: "",
  level: levels[0],
  goals: "",
  plan: plans[0],
  agree: false,
};

export default function EnrollPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverError, setServerError] = useState("");

  const set = (key: keyof FormData, value: string | boolean) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!data.fullName.trim()) e.fullName = "Full name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        e.email = "Enter a valid email.";
      if (!data.phone.trim()) e.phone = "Phone number is required.";
      if (!data.country.trim()) e.country = "Country is required.";
    }
    if (step === 1) {
      if (!data.course) e.course = "Please select a course.";
      if (!data.cohort) e.cohort = "Please choose a preferred start.";
    }
    if (step === 2) {
      if (!data.level) e.level = "Please select your level.";
      if (!data.goals.trim()) e.goals = "Tell us your goals.";
    }
    if (step === 3) {
      if (!data.agree) e.agree = "You must accept the terms to continue.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validateStep()) return;
    setStatus("submitting");
    setServerError("");

    try {
      const { agree, ...payload } = data;
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong.");
      }
      setStatus("success");
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Submission failed. Please try again.",
      );
      setStatus("error");
    }
  };

  // ── Success screen ──
  if (status === "success") {
    return (
      <main className="section-page" style={pageStyle}>
        <div
          style={{
            ...card,
            maxWidth: 560,
            textAlign: "center",
            margin: "0 auto",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <h1 style={{ ...h1, marginBottom: "0.75rem" }}>You're enrolled!</h1>
          <p style={muted}>
            Thanks {data.fullName.split(" ")[0]}! We've sent a confirmation
            email to{" "}
            <strong style={{ color: "var(--color-text)" }}>{data.email}</strong>{" "}
            with your next steps for{" "}
            <strong style={{ color: "var(--color-primary)" }}>
              {data.course}
            </strong>
            .
          </p>
          <a
            href="/training"
            style={{
              ...primaryBtn,
              display: "inline-block",
              marginTop: "1.5rem",
            }}
          >
            Back to Programs
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="section-page" style={pageStyle}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={h1}>Enroll Now</h1>
          <p style={muted}>Complete 4 quick steps to secure your seat.</p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background:
                    i <= step
                      ? "var(--color-primary)"
                      : "rgba(255,255,255,0.12)",
                  transition: "background 0.3s",
                  marginBottom: "0.5rem",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color:
                    i <= step ? "var(--color-text)" : "var(--color-text-muted)",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div style={card}>
          {/* Step 0 — details */}
          {step === 0 && (
            <div style={fieldset}>
              <Field label="Full Name" error={errors.fullName}>
                <input
                  style={input}
                  value={data.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Jane Doe"
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  style={input}
                  type="email"
                  value={data.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="jane@example.com"
                />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input
                  style={input}
                  value={data.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+237 6x xxx xxxx"
                />
              </Field>
              <Field label="Country" error={errors.country}>
                <input
                  style={input}
                  value={data.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder="e.g. Cameroon"
                />
              </Field>
            </div>
          )}

          {/* Step 1 — course */}
          {step === 1 && (
            <div style={fieldset}>
              <Field label="Select Course" error={errors.course}>
                <select
                  className="enroll-select"
                  style={selectStyle}
                  value={data.course}
                  onChange={(e) => set("course", e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Preferred Start" error={errors.cohort}>
                <input
                  style={input}
                  type="month"
                  value={data.cohort}
                  onChange={(e) => set("cohort", e.target.value)}
                />
              </Field>
              <Field label="Payment Plan">
                <select
                  className="enroll-select"
                  style={selectStyle}
                  value={data.plan}
                  onChange={(e) => set("plan", e.target.value)}
                >
                  {plans.map((p) => (
                    <option key={p} value={p} style={optionStyle}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {/* Step 2 — goals */}
          {step === 2 && (
            <div style={fieldset}>
              <Field label="Your Current Level" error={errors.level}>
                <select
                  className="enroll-select"
                  style={selectStyle}
                  value={data.level}
                  onChange={(e) => set("level", e.target.value)}
                >
                  {levels.map((l) => (
                    <option key={l} value={l} style={optionStyle}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="What do you want to achieve?" error={errors.goals}>
                <textarea
                  style={{ ...input, minHeight: 110, resize: "vertical" }}
                  value={data.goals}
                  onChange={(e) => set("goals", e.target.value)}
                  placeholder="e.g. Land a frontend job within 6 months."
                />
              </Field>
            </div>
          )}

          {/* Step 3 — review */}
          {step === 3 && (
            <div style={fieldset}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  margin: "0 0 0.5rem",
                }}
              >
                Review your details
              </h3>
              {[
                ["Name", data.fullName],
                ["Email", data.email],
                ["Phone", data.phone],
                ["Country", data.country],
                ["Course", data.course],
                ["Preferred Start", data.cohort],
                ["Payment Plan", data.plan],
                ["Level", data.level],
                ["Goals", data.goals],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "0.6rem 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {k}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      textAlign: "right",
                    }}
                  >
                    {v || "—"}
                  </span>
                </div>
              ))}
              <label
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  alignItems: "flex-start",
                  marginTop: "1rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={data.agree}
                  onChange={(e) => set("agree", e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  I agree to the{" "}
                  <a href="/terms" style={{ color: "var(--color-primary)" }}>
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" style={{ color: "var(--color-primary)" }}>
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              {errors.agree && <span style={errStyle}>{errors.agree}</span>}
              {status === "error" && (
                <p style={{ ...errStyle, marginTop: "0.75rem" }}>
                  {serverError}
                </p>
              )}
            </div>
          )}

          {/* Nav */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              marginTop: "1.75rem",
            }}
          >
            <button
              onClick={back}
              disabled={step === 0 || status === "submitting"}
              style={{
                ...ghostBtn,
                opacity: step === 0 ? 0.4 : 1,
                cursor: step === 0 ? "not-allowed" : "pointer",
              }}
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={next} style={primaryBtn}>
                Continue →
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={status === "submitting"}
                style={{
                  ...primaryBtn,
                  opacity: status === "submitting" ? 0.7 : 1,
                }}
              >
                {status === "submitting"
                  ? "Submitting..."
                  : "Confirm Enrollment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--color-text)",
        }}
      >
        {label}
      </label>
      {children}
      {error && <span style={errStyle}>{error}</span>}
    </div>
  );
}

// ── Shared styles ──
const pageStyle: React.CSSProperties = {
  width: "100%",
  paddingBottom: "4rem",
  paddingTop: "calc(var(--header-height-mobile) + 2rem)",
};
const card: React.CSSProperties = {
  borderRadius: "1.25rem",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  padding: "1.75rem",
};
const fieldset: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.1rem",
};
const input: React.CSSProperties = {
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
const h1: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
  fontWeight: 900,
  color: "var(--color-text)",
  margin: 0,
};
const muted: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "1rem",
  color: "var(--color-text-muted)",
  margin: "0.5rem 0 0",
  lineHeight: 1.6,
};
const primaryBtn: React.CSSProperties = {
  padding: "0.8rem 1.5rem",
  borderRadius: "0.75rem",
  background: "var(--color-primary)",
  border: "1px solid var(--color-primary)",
  color: "#000",
  fontFamily: "var(--font-display)",
  fontSize: "0.875rem",
  fontWeight: 700,
  textDecoration: "none",
  cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  padding: "0.8rem 1.5rem",
  borderRadius: "0.75rem",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontFamily: "var(--font-display)",
  fontSize: "0.875rem",
  fontWeight: 700,
  cursor: "pointer",
};
const errStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "0.75rem",
  color: "#ef4444",
};
const selectStyle: React.CSSProperties = {
  ...input,
  background: "var(--color-surface)", // opaque, not the translucent rgba
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  cursor: "pointer",
};
const optionStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  color: "var(--color-text)",
};
