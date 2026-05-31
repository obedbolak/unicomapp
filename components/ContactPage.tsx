"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CodeBracketIcon,
  MegaphoneIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

/* ── Types ───────────────────────────────────────────────────────────────── */

type FormData = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
};

/* ── Data ────────────────────────────────────────────────────────────────── */

const projectTypes = [
  { value: "software", label: "Software Development", icon: CodeBracketIcon },
  { value: "mobile", label: "Mobile / Web App", icon: DevicePhoneMobileIcon },
  { value: "marketing", label: "Digital Marketing", icon: MegaphoneIcon },
  { value: "social", label: "Social Media", icon: ShareIcon },
  { value: "strategy", label: "Business Strategy", icon: ChartBarIcon },
];

const budgets = [
  "< 20,000 FCFA",
  "20,000 – 50,000 FCFA",
  "50,000 – 100,000 FCFA",
  "100,000 – 250,000 FCFA",
  "250,000+ FCFA",
];

const timelines = [
  "ASAP",
  "1 – 3 months",
  "3 – 6 months",
  "6 – 12 months",
  "Flexible",
];

const contactDetails = [
  {
    icon: EnvelopeIcon,
    label: "Email",
    value: "contact@unicomteam.com",
    href: "mailto:contact@unicomteam.com",
  },
  {
    icon: PhoneIcon,
    label: "Phone",
    value: "+237 681 529 488",
    href: "tel:+237681529488",
  },
  {
    icon: MapPinIcon,
    label: "Location",
    value: "Remote — worldwide",
    href: null,
  },
];

/* ── Input style helper ──────────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "var(--color-text)",
  fontFamily: "var(--font-display)",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
  marginBottom: "0.5rem",
};

/* ── Component ───────────────────────────────────────────────────────────── */

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Simulate send — replace with your API call
    await new Promise((r) => setTimeout(r, 1200));
    console.log(data);
    setSubmitted(true);
  };

  return (
    <div className="section-page">
      <style>{`
        .contact-input:focus {
          border-color: var(--color-primary) !important;
          background: rgba(255,140,0,0.04) !important;
        }
        .contact-input::placeholder { color: rgba(255,255,255,0.2); }
        .project-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.55);
          font-family: var(--font-display);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .project-chip:hover {
          border-color: rgba(255,140,0,0.4);
          color: var(--color-primary);
          background: rgba(255,140,0,0.06);
        }
        .project-chip.active {
          border-color: var(--color-primary);
          background: rgba(255,140,0,0.12);
          color: var(--color-primary);
        }
        .submit-btn {
          width: 100%;
          padding: 0.875rem 2rem;
          border-radius: 10px;
          border: none;
          background: var(--gradient-primary);
          color: var(--color-background-dark);
          font-family: var(--font-display);
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(255,140,0,0.25);
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255,140,0,0.4);
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .select-styled {
          appearance: none;
          -webkit-appearance: none;
        }
        .select-styled option { background: #000d1a; color: #fff; }
      `}</style>

      <div className="container-7xl">
        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <span className="section-eyebrow">Get In Touch</span>
          <h1
            className="section-heading"
            style={{ color: "var(--color-text)" }}
          >
            Let's build something <span className="gradient-text">great</span>
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            Tell us about your project and we'll get back to you within 24
            hours.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
          }}
          className="contact-grid"
        >
          <style>{`
            @media (min-width: 1024px) {
              .contact-grid {
                grid-template-columns: 1fr 420px !important;
                gap: 3rem !important;
              }
            }
          `}</style>

          {/* ── LEFT: Form ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {submitted ? (
              /* Success state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-primary flex flex-col items-center justify-center text-center"
                style={{ padding: "4rem 2rem", minHeight: "420px" }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "999px",
                    background: "rgba(255,140,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <CheckCircleIcon
                    style={{ width: "32px", color: "var(--color-primary)" }}
                  />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    color: "var(--color-text)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Message sent!
                </h3>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    maxWidth: "320px",
                    lineHeight: 1.6,
                  }}
                >
                  Thanks for reaching out. We'll review your project details and
                  get back to you within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="card"
                style={{ padding: "2rem" }}
                noValidate
              >
                {/* Row 1: Name + Email */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1.25rem",
                  }}
                  className="form-row"
                >
                  <style>{`
                    @media (max-width: 540px) { .form-row { grid-template-columns: 1fr !important; } }
                  `}</style>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      {...register("name", { required: true })}
                      placeholder="Alex Johnson"
                      className="contact-input"
                      style={{
                        ...inputStyle,
                        borderColor: errors.name
                          ? "rgba(255,80,80,0.6)"
                          : "rgba(255,255,255,0.1)",
                      }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      {...register("email", {
                        required: true,
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      })}
                      type="email"
                      placeholder="alex@company.com"
                      className="contact-input"
                      style={{
                        ...inputStyle,
                        borderColor: errors.email
                          ? "rgba(255,80,80,0.6)"
                          : "rgba(255,255,255,0.1)",
                      }}
                    />
                  </div>
                </div>

                {/* Company */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={labelStyle}>Company / Organisation</label>
                  <input
                    {...register("company")}
                    placeholder="Acme Inc. (optional)"
                    className="contact-input"
                    style={inputStyle}
                  />
                </div>

                {/* Project type chips */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={labelStyle}>Project Type *</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    {projectTypes.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        className={`project-chip${selectedType === value ? " active" : ""}`}
                        onClick={() => {
                          setSelectedType(value);
                          setValue("projectType", value);
                        }}
                      >
                        <Icon style={{ width: "14px", flexShrink: 0 }} />
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="hidden"
                    {...register("projectType", { required: true })}
                  />
                  {errors.projectType && (
                    <p
                      style={{
                        color: "rgba(255,80,80,0.8)",
                        fontSize: "0.75rem",
                        marginTop: "0.375rem",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      Please select a project type
                    </p>
                  )}
                </div>

                {/* Budget + Timeline */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1.25rem",
                  }}
                  className="form-row"
                >
                  <div>
                    <label style={labelStyle}>Budget Range</label>
                    <select
                      {...register("budget")}
                      className="contact-input select-styled"
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="">Select budget</option>
                      {budgets.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Timeline</label>
                    <select
                      {...register("timeline")}
                      className="contact-input select-styled"
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="">Select timeline</option>
                      {timelines.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={labelStyle}>Project Details *</label>
                  <textarea
                    {...register("message", { required: true, minLength: 20 })}
                    rows={4}
                    placeholder="Tell us about your project — what problem are you solving, who are your users, and what does success look like?"
                    className="contact-input"
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      lineHeight: 1.6,
                      borderColor: errors.message
                        ? "rgba(255,80,80,0.6)"
                        : "rgba(255,255,255,0.1)",
                    }}
                  />
                  {errors.message && (
                    <p
                      style={{
                        color: "rgba(255,80,80,0.8)",
                        fontSize: "0.75rem",
                        marginTop: "0.375rem",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      Please describe your project (at least 20 characters)
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        style={{
                          width: "18px",
                          animation: "spin 0.8s linear infinite",
                        }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRightIcon style={{ width: "17px" }} />
                    </>
                  )}
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </form>
            )}
          </motion.div>

          {/* ── RIGHT: Contact details ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.25,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Contact info cards */}
            {contactDetails.map(({ icon: Icon, label, value, href }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
              >
                {href ? (
                  <a
                    href={href}
                    className="card-primary group"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1.25rem 1.5rem",
                      textDecoration: "none",
                      transition: "transform 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "rgba(255,140,0,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "var(--color-primary)",
                      }}
                    >
                      <Icon style={{ width: "20px" }} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--color-text-dim)",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          color: "var(--color-text)",
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  </a>
                ) : (
                  <div
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1.25rem 1.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      <Icon style={{ width: "20px" }} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--color-text-dim)",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Response time note */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              style={{
                padding: "1.25rem 1.5rem",
                borderRadius: "1rem",
                background: "rgba(255,140,0,0.05)",
                border: "1px solid rgba(255,140,0,0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    background: "var(--color-primary)",
                    flexShrink: 0,
                    marginTop: "6px",
                    boxShadow: "0 0 8px rgba(255,140,0,0.6)",
                    animation: "pulse 2s infinite",
                  }}
                />
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "var(--color-text)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Typically reply within 24h
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    We review every submission personally and tailor our
                    response to your specific project needs.
                  </p>
                </div>
              </div>
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.5; transform: scale(1.4); }
                }
              `}</style>
            </motion.div>

            {/* Socials row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text-dim)",
                  marginBottom: "0.75rem",
                }}
              >
                Follow us
              </p>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                {[
                  {
                    label: "Instagram",
                    href: "https://www.instagram.com/unicomteam1",
                    color: "#E1306C",
                  },
                  {
                    label: "Facebook",
                    href: "https://www.facebook.com/share/18keP13dmW",
                    color: "#1877F2",
                  },
                  {
                    label: "TikTok",
                    href: "https://tiktok.com/@unicomteam0",
                    color: "#69C9D0",
                  },
                ].map(({ label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "999px",
                      border: `1px solid ${color}30`,
                      background: `${color}0d`,
                      color,
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "background 0.2s, transform 0.2s",
                      display: "inline-block",
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Footer note */}
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                color: "var(--color-text-dim)",
                marginTop: "auto",
                paddingTop: "0.5rem",
              }}
            >
              © 2026 UnicomTeam. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
