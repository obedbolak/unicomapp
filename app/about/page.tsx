"use client";

import { motion } from "framer-motion";
import {
  UserGroupIcon,
  LightBulbIcon,
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

const departments = [
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

// Team Members
const teamMembers = [
  {
    name: "Alvine Malyka",
    role: "Core Systems Engineer",
    image: "/team/bbty.png",
  },
  {
    name: "Fomusoh Stephanie",
    role: "Frontend & UI/UX Designer",
    image: "/team/steph.png",
  },

  {
    name: "Ngwang Barbara",
    role: "Creative Director",
    image: "/team/nguan.png",
  },
  {
    name: "Rosine Mbashi",
    role: "Marketing & Business Strategist",
    image: "/team/rosin.png",
  },
  {
    name: " lilian martin",
    role: "Frontend & UI Specialist",
    image: "/team/lili.png",
  },
  {
    name: "Longe Antia",
    role: "Marketing Director",
    image: "/team/along.png",
  },
  {
    name: "Obed Bolak",
    role: "CEO & FULL-STACK DEVELOPER",
    image: "/team/ceo.png",
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

        {/* Two Column Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
            marginBottom: "5rem",
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

          {/* Left Column */}
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

          {/* Right Column */}
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

            {departments.map(({ name, role, bio }, i) => (
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

            {/* Glow Banner */}
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

        {/* Team Members Grid */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: "4rem",
          }}
        >
          <div style={{ marginBottom: "2.5rem" }}>
            <span className="section-eyebrow">The Minds Behind UnicomTeam</span>
            <h2
              className="section-heading"
              style={{ color: "var(--color-text)", fontSize: "2rem" }}
            >
              Meet Our <span className="gradient-text">Experts</span>
            </h2>
          </div>
        </motion.div>
        {/* Team Members Grid */}
        <div
          className="team-members-grid"
          style={{
            display: "grid",
            gap: "2rem",
          }}
        >
          {teamMembers.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "2.5rem 1.5rem",
                background: "rgba(255, 255, 255, 0.02)",
                transition: "background 0.3s ease, border-color 0.3s ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "130px",
                  height: "130px",
                  borderRadius: "50%",
                  marginBottom: "1.5rem",
                  padding: "4px",
                  background:
                    "linear-gradient(135deg, rgba(255,140,0,0.3) 0%, rgba(255,255,255,0.05) 100%)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                  />
                </div>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: "var(--color-text)",
                  marginBottom: "0.25rem",
                }}
              >
                {member.name}
              </h3>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: "var(--color-text-muted)",
                }}
              >
                {member.role}
              </span>
            </motion.div>
          ))}

          {/* ── Join the team card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: teamMembers.length * 0.1, duration: 0.5 }}
            className="team-card-cta"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "2.5rem 1.75rem",
              borderRadius: "1rem",
              background: "rgba(255,140,0,0.04)",
              border: "1px dashed rgba(255,140,0,0.25)",
              gap: "1rem",
            }}
          >
            {/* Pulse dot */}
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                boxShadow: "0 0 10px rgba(255,140,0,0.6)",
                animation: "pulseDot 2s ease-in-out infinite",
              }}
            />

            <div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Growing Team
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "var(--color-text)",
                  lineHeight: 1.3,
                  marginBottom: "0.75rem",
                }}
              >
                Want to build the future with us?
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.6,
                }}
              >
                We are always looking for passionate engineers, designers, and
                strategists to join our remote-first collective. If that sounds
                like you, reach out.
              </p>
            </div>

            <a
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "0.5rem",
                padding: "0.6rem 1.25rem",
                borderRadius: "0.5rem",
                background: "rgba(255,140,0,0.12)",
                border: "1px solid rgba(255,140,0,0.3)",
                color: "var(--color-primary)",
                fontFamily: "var(--font-display)",
                fontSize: "0.8125rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textDecoration: "none",
                transition: "background 0.2s ease",
              }}
            >
              Get in touch →
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
