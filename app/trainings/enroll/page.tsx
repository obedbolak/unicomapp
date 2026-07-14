"use client";

import { useEffect, useState } from "react";

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

const internshipRoles = [
  "Frontend Engineering Intern",
  "Backend Engineering Intern",
  "UI/UX Design Intern",
  "Digital Marketing Intern",
  "Mobile Development Intern",
  "Desktop App Dev Intern",
];
type FormData = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  type: "training" | "internship"; // ← NEW
  course: string;
  category: string;
  price: string;
  months: number;
  cohort: string;
  level: string;
  goals: string;
  portfolio: string; // ← NEW (CV / GitHub / portfolio link)
  plan: string;
  agree: boolean;
};

const levels = [
  "Complete Beginner",
  "Some Experience",
  "Intermediate",
  "Advanced",
];
const plans = ["Pay in Full", "Monthly Installments"];

const countryOptions = [
  { name: "Cameroon", dialCode: "+237" },
  { name: "Nigeria", dialCode: "+234" },
  { name: "Ghana", dialCode: "+233" },
  { name: "Kenya", dialCode: "+254" },
  { name: "South Africa", dialCode: "+27" },
  { name: "United States", dialCode: "+1" },
  { name: "United Kingdom", dialCode: "+44" },
  { name: "France", dialCode: "+33" },
  { name: "Canada", dialCode: "+1" },
  { name: "Germany", dialCode: "+49" },
  { name: "India", dialCode: "+91" },
  { name: "United Arab Emirates", dialCode: "+971" },
];

const crashCoursePrices: Record<string, string> = {
  "Graphics Design (Crash Course)": "From 25,000 FCFA",
  "Microsoft Excel (Crash Course)": "From 25,000 FCFA",
  "Microsoft Office (Crash Course)": "From 25,000 FCFA",
};

const STEPS = ["Your Details", "Choose Course", "Goals", "Review"];

const initialData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  course: courses[0],
  type: "training", // default to training
  portfolio: "", // default empty
  category: "",
  price: "",
  months: 3,
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
  const isInternship = data.type === "internship";
  const options = isInternship ? internshipRoles : courses;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type =
      params.get("type") === "internship" ? "internship" : "training";
    const course = params.get("course")?.trim();
    const category = params.get("category")?.trim() ?? "";
    const price = params.get("price")?.trim() ?? "";

    setData((current) => ({
      ...current,
      type,
      course:
        course || (type === "internship" ? internshipRoles[0] : current.course),
      category,
      price,
      level: levels.includes(category) ? category : current.level,
    }));
  }, []);

  const set = (key: keyof FormData, value: string | boolean | number) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleCountryChange = (countryName: string) => {
    const selectedCountry = countryOptions.find((c) => c.name === countryName);
    const dialCode = selectedCountry?.dialCode ?? "";

    set("country", countryName);

    if (!dialCode) return;

    setData((d) => {
      const currentPhone = d.phone.trim();
      if (!currentPhone) {
        return { ...d, phone: dialCode };
      }
      if (currentPhone.startsWith(dialCode)) {
        return d;
      }
      if (currentPhone.startsWith("+")) {
        return { ...d, phone: dialCode };
      }
      return { ...d, phone: `${dialCode} ${currentPhone}` };
    });
  };

  // compute price when course, type, or months changes
  useEffect(() => {
    const months = Number(data.months || 0) || 0;
    const selectedCourse = data.course?.trim() ?? "";

    if (data.type === "internship") {
      // internships: 15k per month
      const per = 15;
      const total = months * per;
      const price = `${months} month${months > 1 ? "s" : ""} @ ${per}k/month — ${total}k`;
      if (price !== data.price) set("price", price);
    } else {
      const mappedPrice = crashCoursePrices[selectedCourse];
      if (mappedPrice) {
        if (mappedPrice !== data.price) set("price", mappedPrice);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const queryPrice = params.get("price")?.trim() ?? "";
      if (queryPrice) {
        if (queryPrice !== data.price) set("price", queryPrice);
        return;
      }

      // trainings: fixed tiers
      const map: Record<number, string> = { 3: "75k", 6: "150k", 12: "220k" };
      const tier = map[months] || "Custom";
      const price = `${tier}`;
      if (price !== data.price) set("price", price);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.months, data.type, data.course]);

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
          <h1>{isInternship ? "Application received!" : "You're enrolled!"}</h1>
          <p style={muted}>
            Thanks {data.fullName.split(" ")[0]}! We've sent a confirmation
            email to <strong>{data.email}</strong>{" "}
            {isInternship
              ? "— we'll review your application and reach out to schedule a short interview for "
              : "with your next steps for "}
            <strong style={{ color: "var(--color-primary)" }}>
              {data.course}
            </strong>
            .
          </p>
          {(data.category || data.price) && (
            <div style={{ ...summaryCard, marginTop: "1.25rem" }}>
              <SummaryRow label="Course" value={data.course} />
              {data.category && (
                <SummaryRow label="Category" value={data.category} />
              )}
              {data.price && <SummaryRow label="Price" value={data.price} />}
            </div>
          )}
          <a
            href={isInternship ? "/trainings/internships" : "/trainings"}
            style={{
              ...primaryBtn,
              display: "inline-block",
              marginTop: "1.5rem",
            }}
          >
            {isInternship ? "Back to Internships" : "Back to Programs"}{" "}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="section-page" style={pageStyle}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={h1}>
            {isInternship ? "Apply for Internship" : "Enroll Now"}
          </h1>
          <p style={muted}>
            Complete 4 quick steps to{" "}
            {isInternship ? "submit your application" : "secure your seat"}
            {data.course ? ` for ${data.course}` : ""}.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "1.25rem",
          }}
          className="enroll-layout"
        >
          <style>{`
            @media (min-width: 900px) {
              .enroll-layout {
                grid-template-columns: minmax(0, 1fr) 300px !important;
                align-items: start;
              }
            }
          `}</style>

          <div>
            {/* Progress */}
            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}
            >
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
                        i <= step
                          ? "var(--color-text)"
                          : "var(--color-text-muted)",
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
                  <Field label="Country" error={errors.country}>
                    <select
                      className="enroll-select"
                      style={selectStyle}
                      value={data.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                    >
                      <option value="">Select your country</option>
                      {countryOptions.map((country) => (
                        <option key={country.name} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Phone" error={errors.phone}>
                    <input
                      style={input}
                      value={data.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+237 6x xxx xxxx"
                    />
                  </Field>
                </div>
              )}

              {/* Step 1 — course */}
              {step === 1 && (
                <div style={fieldset}>
                  <Field
                    label={isInternship ? "Select Role" : "Select Course"}
                    error={errors.course}
                  >
                    <select
                      className="enroll-select"
                      style={selectStyle}
                      value={data.course}
                      onChange={(e) => set("course", e.target.value)}
                    >
                      {options.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Duration (months)">
                    <select
                      className="enroll-select"
                      style={selectStyle}
                      value={String(data.months)}
                      onChange={(e) => set("months", Number(e.target.value))}
                    >
                      <option value={3}>3 months</option>
                      <option value={6}>6 months</option>
                      <option value={12}>12 months</option>
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
                  {!isInternship && (
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
                  )}
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
                  {isInternship && (
                    <Field
                      label="Portfolio / GitHub / CV Link"
                      error={errors.portfolio}
                    >
                      <input
                        style={input}
                        value={data.portfolio}
                        onChange={(e) => set("portfolio", e.target.value)}
                        placeholder="https://github.com/yourname"
                      />
                    </Field>
                  )}
                  <Field
                    label="What do you want to achieve?"
                    error={errors.goals}
                  >
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
                    ["Type", isInternship ? "Internship" : "Training"],
                    ["Name", data.fullName],
                    ["Email", data.email],
                    ["Phone", data.phone],
                    ["Country", data.country],
                    [isInternship ? "Role" : "Course", data.course],
                    ...(isInternship
                      ? [
                          ["Portfolio", data.portfolio],
                          ["Duration", `${data.months} months`],
                        ]
                      : [
                          ["Category", data.category],
                          ["Price", data.price],
                          ["Payment Plan", data.plan],
                          ["Duration", `${data.months} months`],
                        ]),
                    ["Preferred Start", data.cohort],
                    ["Level", data.level],
                    [isInternship ? "Motivation" : "Goals", data.goals],
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
                        {v || "-"}
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
                      <a
                        href="/terms"
                        style={{
                          color: "var(--color-primary)",
                          cursor: "pointer",
                        }}
                      >
                        Terms
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        style={{
                          color: "var(--color-primary)",
                          cursor: "pointer",
                        }}
                      >
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
                      : isInternship
                        ? "Submit Application"
                        : "Confirm Enrollment"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside style={{ ...card, position: "sticky", top: "6rem" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6875rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-primary)",
                marginBottom: "0.75rem",
              }}
            >
              {isInternship ? "Selected Role" : "Selected Program"}{" "}
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                fontWeight: 900,
                color: "var(--color-text)",
                lineHeight: 1.25,
                margin: "0 0 1rem",
              }}
            >
              {data.course}
            </h2>
            <div style={summaryCard}>
              {data.category && (
                <SummaryRow label="Category" value={data.category} />
              )}
              {!isInternship && data.price && (
                <SummaryRow label="Price" value={data.price} />
              )}
              {!isInternship && (
                <SummaryRow label="Payment" value={data.plan} />
              )}
              {data.months && (
                <SummaryRow label="Duration" value={`${data.months} months`} />
              )}
              <SummaryRow label="Level" value={data.level} />
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.8125rem",
                lineHeight: 1.6,
                color: "var(--color-text-muted)",
                marginTop: "1rem",
              }}
            >
              After you confirm, your enrollment request is submitted
              automatically for this course.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.45rem 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.75rem",
          fontWeight: 800,
          color: "var(--color-text)",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
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
const summaryCard: React.CSSProperties = {
  borderRadius: "0.875rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--color-border)",
  padding: "0.75rem 1rem",
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
