"use client";

import { motion } from "framer-motion";
import {
  UserGroupIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

/* ── Data ────────────────────────────────────────────────────────────────── */

const values = [
  {
    icon: LightBulbIcon,
    title: "Innovation",
    description:
      "We push the boundaries of what's possible, implementing cutting-edge tools to give your product an unfair competitive advantage.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Elite Quality",
    description:
      "Every line of code and pixel of design undergoes thorough review. We build reliable, premium software meant to scale.",
  },
  {
    icon: UserGroupIcon,
    title: "Client Synergy",
    description:
      "We don't work *for* you, we work *with* you. Transparent workflows, persistent communication, and mutual growth define us.",
  },
];

const team = [
  {
    name: "Core Engineering",
    role: "Full-Stack & Systems",
    bio: "Specializing in Next.js, robust Cloud architectures, and high-performance interactive experiences.",
  },
  {
    name: "Creative & Design",
    role: "UI/UX & Brand Identity",
    bio: "Crafting beautiful interfaces, optimized layouts, and engaging visual ecosystems that users adore.",
  },
  {
    name: "Growth Strategy",
    role: "Marketing & Operations",
    bio: "Driving massive user acquisition via targeted digital marketing setups and data-backed business growth.",
  },
];

/* ── Component ───────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <div className="section-page">
      <div className="container-7xl">
        {/* Page Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <span className="section-eyebrow">Who We Are</span>
          <h1
            className="section-heading"
            style={{ color: "var(--color-text)" }}
          >
            Architects of elite{" "}
            <span className="gradient-text">digital realities</span>
          </h1>
          <p
            className="hero-subtitle"
            style={{ marginBottom: 0, maxWidth: "680px" }}
          >
            UnicomTeam is a global remote software collaborative. We combine
            high-end software development, mesmerizing creative design, and
            aggressive digital strategy to scale your business.
          </p>
        </motion.div>

        {/* Two Column Section (Mission + Core Values) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
            marginBottom: "4rem",
          }}
          className="about-grid"
        >
          <style>{`
            @media (min-width: 1024px) {
              .about-grid {
                grid-template-columns: 1fr 420px !important;
                gap: 3rem !important;
              }
            }
          `}</style>

          {/* Left: Our Philosophy & Values Loop */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className="card" style={{ padding: "2rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "var(--color-text)",
                  marginBottom: "1rem",
                }}
              >
                Our Mission
              </h2>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.7,
                  fontFamily: "var(--font-display)",
                }}
              >
                We believe that modern software shouldn't just run smoothly—it
                should captivate users instantly. Our team untangles complex
                technological problems to build incredibly fast, elegant
                products that accelerate your growth metrics, regardless of your
                geographic location.
              </p>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text-dim)",
                  marginBottom: "1rem",
                }}
              >
                Core Pillars
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {values.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="card"
                    style={{
                      display: "flex",
                      gap: "1.25rem",
                      padding: "1.25rem 1.5rem",
                      alignItems: "flex-start",
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
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Icon style={{ width: "20px" }} />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "var(--color-text)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {title}
                      </h4>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.875rem",
                          color: "var(--color-text-muted)",
                          lineHeight: 1.5,
                        }}
                      >
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Operational Strengths & Glow Note */}
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
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-text-dim)",
                marginBottom: "0.25rem",
              }}
            >
              The Collective Team
            </p>

            {team.map(({ name, role, bio }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                className="card-primary"
                style={{ padding: "1.25rem 1.5rem" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-primary)",
                    display: "block",
                    marginBottom: "0.2rem",
                  }}
                >
                  {role}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    color: "var(--color-text)",
                    marginBottom: "0.4rem",
                  }}
                >
                  {name}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {bio}
                </p>
              </motion.div>
            ))}

            {/* Glowing Accent Banner */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderRadius: "1rem",
                background: "rgba(255,140,0,0.05)",
                border: "1px solid rgba(255,140,0,0.12)",
                marginTop: "auto",
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
                  }}
                />
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "var(--color-text)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Global Capabilities
                  </h4>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    Operating purely in cloud networks allows us to assemble
                    exceptional cross-border development workflows smoothly for
                    you.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
