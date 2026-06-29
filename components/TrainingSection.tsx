"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Check, ArrowUpRight, ChevronDown } from "lucide-react";

const plans = [
  {
    duration: "3M",
    label: "Starter",
    price: "75,000",
    description:
      "Perfect for beginners who want a solid foundation in modern web development and design.",
    featured: false,
    curriculum: [
      {
        phase: "Phase 1 — Foundations",
        topics: ["HTML & CSS Fundamentals", "JavaScript Basics", "Git & Version Control"],
      },
      {
        phase: "Phase 2 — Hands-On",
        topics: ["Responsive Design", "React Basics", "1 Real Project"],
      },
    ],
    includes: ["Live sessions weekly", "1-on-1 mentorship", "Certificate of completion"],
  },
  {
    duration: "6M",
    label: "Professional",
    price: "150,000",
    description:
      "For those ready to go deeper — build full-stack apps and develop a professional portfolio.",
    featured: true,
    curriculum: [
      {
        phase: "Phase 1 — Core Skills",
        topics: ["Advanced JavaScript", "React & Next.js", "Node.js & REST APIs"],
      },
      {
        phase: "Phase 2 — Full Stack",
        topics: ["Databases (SQL & NoSQL)", "Authentication & Security", "Deployment & CI/CD"],
      },
      {
        phase: "Phase 3 — Portfolio",
        topics: ["2 Full Projects", "Code Reviews", "Career Prep"],
      },
    ],
    includes: ["Live sessions 3x/week", "Priority mentorship", "Portfolio review", "Certificate of completion"],
  },
  {
    duration: "1Y",
    label: "Elite",
    price: "220,000",
    description:
      "The complete career transformation — from zero to job-ready full-stack developer.",
    featured: false,
    curriculum: [
      {
        phase: "Phase 1 — Mastery",
        topics: ["Advanced React Patterns", "System Design", "TypeScript"],
      },
      {
        phase: "Phase 2 — Specialization",
        topics: ["Mobile Dev (React Native)", "Cloud & DevOps (AWS)", "UI/UX Principles"],
      },
      {
        phase: "Phase 3 — Real World",
        topics: ["Team Project (Agile)", "Open Source Contribution", "Interview Preparation"],
      },
      {
        phase: "Phase 4 — Launch",
        topics: ["Job Placement Support", "LinkedIn & CV Review", "Network Access"],
      },
    ],
    includes: [
      "Daily live sessions",
      "Dedicated mentor",
      "4 Portfolio projects",
      "Job placement support",
      "Certificate of completion",
    ],
  },
];

function PlanCard({ plan, index, isInView }: { plan: typeof plans[0]; index: number; isInView: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: "1.25rem",
        border: plan.featured ? "1px solid rgba(255,140,0,0.4)" : "1px solid var(--color-border)",
        background: plan.featured ? "rgba(255,140,0,0.05)" : "var(--color-surface)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Featured badge */}
      {plan.featured && (
        <div
          style={{
            position: "absolute", top: "1.25rem", right: "1.25rem",
            background: "var(--color-primary)", color: "#000",
            fontFamily: "var(--font-display)", fontSize: "0.625rem",
            fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "0.2rem 0.6rem", borderRadius: "999px",
          }}
        >
          Most Popular
        </div>
      )}

      {/* Summary — always visible */}
      <div style={{ padding: "1.75rem 1.75rem 1.25rem" }}>
        <span
          style={{
            fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--color-primary)", display: "block", marginBottom: "0.4rem",
          }}
        >
          {plan.label}
        </span>
        <h3
          style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "1.375rem", color: "var(--color-text)", marginBottom: "0.75rem",
          }}
        >
          {plan.duration}
        </h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", marginBottom: "0.75rem" }}>
          <span
            style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem",
              color: plan.featured ? "var(--color-primary)" : "var(--color-text)", lineHeight: 1,
            }}
          >
            {plan.price}
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            FCFA
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          {plan.description}
        </p>
      </div>

      {/* Mobile toggle button */}
      <button
        className="training-toggle-btn"
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "calc(100% - 3.5rem)",
          margin: "0 1.75rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.65rem 1rem",
          borderRadius: "0.75rem",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-display)",
          fontSize: "0.8125rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <span>{expanded ? "Hide details" : "View details"}</span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={16} />
        </motion.span>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            {/* Divider */}
            <div style={{ height: "1px", background: "var(--color-border)", margin: "0 1.75rem" }} />

            {/* Curriculum */}
            <div style={{ padding: "1.25rem 1.75rem" }}>
              <p
                style={{
                  fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--color-text-dim)", marginBottom: "1rem",
                }}
              >
                Curriculum
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {plan.curriculum.map((phase, pi) => (
                  <div key={phase.phase} style={{ display: "flex", gap: "0.75rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "16px" }}>
                      <div
                        style={{
                          width: "8px", height: "8px", borderRadius: "50%",
                          background: plan.featured ? "var(--color-primary)" : "rgba(255,255,255,0.2)",
                          flexShrink: 0, marginTop: "5px",
                        }}
                      />
                      {pi < plan.curriculum.length - 1 && (
                        <div
                          style={{
                            flex: 1, width: "1px",
                            background: plan.featured ? "rgba(255,140,0,0.2)" : "rgba(255,255,255,0.06)",
                            marginTop: "4px",
                          }}
                        />
                      )}
                    </div>
                    <div style={{ paddingBottom: pi < plan.curriculum.length - 1 ? "0.5rem" : 0 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "0.3rem" }}>
                        {phase.phase}
                      </p>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        {phase.topics.map((topic) => (
                          <li key={topic} style={{ fontFamily: "var(--font-display)", fontSize: "0.8125rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span style={{ color: "var(--color-text-dim)", fontSize: "0.6rem" }}>▸</span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--color-border)", margin: "0 1.75rem" }} />

            {/* Includes + CTA */}
            <div style={{ padding: "1.25rem 1.75rem 1.75rem" }}>
              <p
                style={{
                  fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--color-text-dim)", marginBottom: "0.75rem",
                }}
              >
                Includes
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {plan.includes.map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-display)", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                    <Check size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="/contact"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                  background: plan.featured ? "var(--color-primary)" : "rgba(255,255,255,0.05)",
                  border: plan.featured ? "none" : "1px solid var(--color-border)",
                  color: plan.featured ? "#000" : "var(--color-text)",
                  fontFamily: "var(--font-display)", fontSize: "0.875rem",
                  fontWeight: 700, textDecoration: "none", transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
              >
                Enroll Now <ArrowUpRight size={15} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop-only: always show full content */}
      <div className="training-desktop-content">
        {/* Divider */}
        <div style={{ height: "1px", background: "var(--color-border)", margin: "0 1.75rem" }} />

        {/* Curriculum */}
        <div style={{ padding: "1.25rem 1.75rem" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-dim)", marginBottom: "1rem" }}>
            Curriculum
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {plan.curriculum.map((phase, pi) => (
              <div key={phase.phase} style={{ display: "flex", gap: "0.75rem" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "16px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: plan.featured ? "var(--color-primary)" : "rgba(255,255,255,0.2)", flexShrink: 0, marginTop: "5px" }} />
                  {pi < plan.curriculum.length - 1 && (
                    <div style={{ flex: 1, width: "1px", background: plan.featured ? "rgba(255,140,0,0.2)" : "rgba(255,255,255,0.06)", marginTop: "4px" }} />
                  )}
                </div>
                <div style={{ paddingBottom: pi < plan.curriculum.length - 1 ? "0.5rem" : 0 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "0.3rem" }}>
                    {phase.phase}
                  </p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    {phase.topics.map((topic) => (
                      <li key={topic} style={{ fontFamily: "var(--font-display)", fontSize: "0.8125rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ color: "var(--color-text-dim)", fontSize: "0.6rem" }}>▸</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--color-border)", margin: "0 1.75rem" }} />

        {/* Includes + CTA */}
        <div style={{ padding: "1.25rem 1.75rem 1.75rem" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-dim)", marginBottom: "0.75rem" }}>
            Includes
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {plan.includes.map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-display)", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <Check size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
          <a
            href="/contact"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "0.75rem",
              background: plan.featured ? "var(--color-primary)" : "rgba(255,255,255,0.05)",
              border: plan.featured ? "none" : "1px solid var(--color-border)",
              color: plan.featured ? "#000" : "var(--color-text)",
              fontFamily: "var(--font-display)", fontSize: "0.875rem",
              fontWeight: 700, textDecoration: "none", transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
          >
            Enroll Now <ArrowUpRight size={15} />
          </a>
        </div>
      </div>

      <style>{`
        .training-toggle-btn { display: flex; }
        .training-desktop-content { display: none; }
        @media (min-width: 768px) {
          .training-toggle-btn { display: none !important; }
          .training-desktop-content { display: block; }
        }
      `}</style>
    </motion.div>
  );
}

export default function TrainingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100%",
        paddingTop: "5rem",
        paddingBottom: "5rem",
        paddingLeft: "clamp(1rem, 5vw, 4rem)",
        paddingRight: "clamp(1rem, 5vw, 4rem)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: "center", marginBottom: "3.5rem" }}
      >
        <span className="section-eyebrow">Training Programs</span>
        <h2 className="section-heading" style={{ color: "var(--color-text)", fontSize: "2rem", marginBottom: "0.75rem" }}>
          Invest in Your <span className="gradient-text">Future</span>
        </h2>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.9375rem", color: "var(--color-text-muted)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.6 }}>
          Structured, mentor-led programs designed to take you from beginner to professional. Pick the path that fits your goals.
        </p>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "1.5rem",
          alignItems: "start",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {plans.map((plan, i) => (
          <PlanCard key={plan.duration} plan={plan} index={i} isInView={isInView} />
        ))}
      </div>
    </section>
  );
}
