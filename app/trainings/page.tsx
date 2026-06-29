"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

const programs = [
  {
    badge: "Beginner",
    badgeColor: "rgba(34,197,94,0.15)",
    badgeBorder: "rgba(34,197,94,0.3)",
    badgeText: "#22c55e",
    title: "Frontend Development",
    subtitle: "HTML · CSS · JavaScript · React",
    description:
      "Master the fundamentals of the web. Go from zero to building fully responsive, interactive UIs with React and modern CSS.",
    duration: "3, 6 Months",
    sessions: "24 Live Sessions",
    mentorship: "1-on-1 Mentorship",
    outcome: "Portfolio + Certificate",
    icon: "🖥️",
    accent: "rgba(255,140,0,0.12)",
    accentBorder: "rgba(255,140,0,0.25)",
    featured: false,
    topics: null,
  },
  {
    badge: "Intermediate",
    badgeColor: "rgba(59,130,246,0.15)",
    badgeBorder: "rgba(59,130,246,0.3)",
    badgeText: "#3b82f6",
    title: "Backend Development",
    subtitle: "Node.js · Express · PostgreSQL · REST APIs",
    description:
      "Build powerful server-side applications. Learn databases, authentication, REST API design, and deploy production-ready backends with confidence.",
    duration: "3, 6 Months",
    sessions: "48 Live Sessions",
    mentorship: "Weekly Reviews",
    outcome: "Portfolio + Certificate",
    icon: "⚙️",
    accent: "rgba(59,130,246,0.08)",
    accentBorder: "rgba(59,130,246,0.2)",
    featured: false,
    topics: ["Auth & JWT", "SQL & ORMs", "Caching & Queues", "CI/CD Deploys"],
  },
  {
    badge: "Intermediate",
    badgeColor: "rgba(168,85,247,0.15)",
    badgeBorder: "rgba(168,85,247,0.3)",
    badgeText: "#a855f7",
    title: "UI/UX Design",
    subtitle: "Figma · Design Systems · Prototyping",
    description:
      "Learn to design products people love. From wireframes to high-fidelity prototypes, build a designer's eye and a real-world portfolio.",
    duration: "3, 6 Months",
    sessions: "20 Live Sessions",
    mentorship: "Portfolio Reviews",
    outcome: "Figma Portfolio + Certificate",
    icon: "🎨",
    accent: "rgba(168,85,247,0.08)",
    accentBorder: "rgba(168,85,247,0.2)",
    featured: false,
    topics: null,
  },
  {
    badge: "Advanced",
    badgeColor: "rgba(239,68,68,0.15)",
    badgeBorder: "rgba(239,68,68,0.3)",
    badgeText: "#ef4444",
    title: "Full-Stack Engineering",
    subtitle: "React · Node · Databases · DevOps",
    description:
      "The complete track. Build, deploy, and scale full-stack web applications end-to-end with industry-grade tooling and battle-tested engineering practices.",
    duration: "3, 6 Months, 1Y",
    sessions: "96 Live Sessions",
    mentorship: "Dedicated Mentor",
    outcome: "Full Portfolio + Certificate",
    icon: "🚀",
    accent: "rgba(255,140,0,0.12)",
    accentBorder: "rgba(255,140,0,0.25)",
    featured: true,
    topics: [
      "Frontend with React",
      "REST & GraphQL APIs",
      "Databases & Auth",
      "Docker & DevOps",
      "Testing & CI/CD",
      "System Design",
    ],
  },
  {
    badge: "Beginner",
    badgeColor: "rgba(34,197,94,0.15)",
    badgeBorder: "rgba(34,197,94,0.3)",
    badgeText: "#22c55e",
    title: "Digital Marketing",
    subtitle: "SEO · Ads · Social Media · Analytics",
    description:
      "Drive traffic, generate leads, and grow brands online. Master SEO, paid ads, content strategy, and data-driven marketing.",
    duration: "3, 6 Months",
    sessions: "18 Live Sessions",
    mentorship: "Strategy Reviews",
    outcome: "Campaign Portfolio + Certificate",
    icon: "📈",
    accent: "rgba(34,197,94,0.08)",
    accentBorder: "rgba(34,197,94,0.2)",
    featured: false,
    topics: null,
  },
  {
    badge: "Intermediate",
    badgeColor: "rgba(251,191,36,0.15)",
    badgeBorder: "rgba(251,191,36,0.3)",
    badgeText: "#fbbf24",
    title: "Mobile Development",
    subtitle: "React Native · Expo · App Store Deployment",
    description:
      "Build cross-platform mobile apps for iOS and Android. Learn React Native, state management, and ship real apps to the stores.",
    duration: "3, 6 Months, 1Y",
    sessions: "40 Live Sessions",
    mentorship: "Weekly Reviews",
    outcome: "App Portfolio + Certificate",
    icon: "📱",
    accent: "rgba(251,191,36,0.08)",
    accentBorder: "rgba(251,191,36,0.2)",
    featured: false,
    topics: ["RN Fundamentals", "Navigation", "Native APIs", "Store Deploy"],
  },
  {
    badge: "Advanced",
    badgeColor: "rgba(14,165,233,0.15)",
    badgeBorder: "rgba(14,165,233,0.3)",
    badgeText: "#0ea5e9",
    title: "Desktop App Development",
    subtitle: "Electron · Tauri · Cross-Platform Desktop",
    description:
      "Build native-feeling desktop applications for Windows, macOS, and Linux. Learn Electron and Tauri, packaging, auto-updates, and shipping installable apps.",
    duration: "3, 6 Months, 1Y",
    sessions: "36 Live Sessions",
    mentorship: "Weekly Reviews",
    outcome: "Desktop App Portfolio + Certificate",
    icon: "💻",
    accent: "rgba(14,165,233,0.08)",
    accentBorder: "rgba(14,165,233,0.2)",
    featured: false,
    topics: [
      "Electron & Tauri",
      "Native Menus & APIs",
      "Packaging & Installers",
      "Auto-Updates",
    ],
  },
];

// ── Quick crash courses (short, high-volume, easy-buy) ──
const crashCourses = [
  {
    title: "Graphics Design Crash Course",
    subtitle: "Photoshop · Illustrator · Canva",
    description:
      "Design logos, flyers, social posts, and brand kits in weeks. Perfect for freelancers and side hustles.",
    duration: "1,2,4 Weeks",
    sessions: "8 Live Sessions",
    icon: "🎨",
    accent: "rgba(236,72,153,0.12)",
    accentBorder: "rgba(236,72,153,0.3)",
    badgeText: "#ec4899",
  },
  {
    title: "Microsoft Excel Crash Course",
    subtitle: "Formulas · Pivot Tables · Dashboards",
    description:
      "Go from beginner to spreadsheet pro. Master formulas, charts, pivot tables, and automation that employers love.",
    duration: "1,2,3 Weeks",
    sessions: "6 Live Sessions",
    icon: "📊",
    accent: "rgba(34,197,94,0.12)",
    accentBorder: "rgba(34,197,94,0.3)",
    badgeText: "#22c55e",
  },
  {
    title: "Microsoft Office Crash Course",
    subtitle: "Word · Excel · PowerPoint · Outlook",
    description:
      "Become office-ready fast. Master the everyday tools every workplace expects you to know inside out.",
    duration: "1,2,4 Weeks",
    sessions: "8 Live Sessions",
    icon: "🗂️",
    accent: "rgba(59,130,246,0.12)",
    accentBorder: "rgba(59,130,246,0.3)",
    badgeText: "#3b82f6",
  },
];

const valueProps = [
  {
    icon: "💰",
    title: "Pay Once, Learn for Life",
    text: "Lifetime access to all materials, recordings, and our private community.",
  },
  {
    icon: "🛡️",
    title: "7-Day Money-Back Guarantee",
    text: "Not satisfied in your first week? Get a full refund, no questions asked.",
  },
  {
    icon: "💳",
    title: "Flexible Payment Plans",
    text: "Split your tuition into easy monthly installments that fit your budget.",
  },
  {
    icon: "📜",
    title: "Verified Certificate",
    text: "Earn a shareable certificate recognized by our hiring partners.",
  },
];

const trustLogos = [
  "Paystack",
  "Flutterwave",
  "Andela",
  "Interswitch",
  "MTN",
  "Microsoft",
];

export default function TrainingSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".train-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.15,
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      className="section-page"
      style={{
        width: "100%",
        paddingBottom: "4rem",
        paddingTop: "calc(var(--header-height-mobile) + 2rem)",
      }}
    >
      {/* ── Live banner ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 0 3px rgba(34,197,94,0.25)",
            display: "inline-block",
            animation: "pulse 2s infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#22c55e",
            letterSpacing: "0.05em",
          }}
        >
          {programs.length} Programs Currently Running
        </span>
      </div>

      {/* ── Masonry grid ── */}
      <div
        className="masonry"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}
      >
        {programs.map((p, i) => (
          <div
            key={p.title}
            className="train-card"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              breakInside: "avoid",
              marginBottom: "1.5rem",
              position: "relative",
              borderRadius: "1.25rem",
              border: `1px solid ${hovered === i || p.featured ? p.accentBorder : "var(--color-border)"}`,
              background:
                hovered === i || p.featured ? p.accent : "var(--color-surface)",
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              transition:
                "border-color 0.3s, background 0.3s, transform 0.3s, box-shadow 0.3s",
              transform: hovered === i ? "translateY(-4px)" : "none",
              boxShadow:
                hovered === i ? "0 12px 32px rgba(0,0,0,0.25)" : "none",
            }}
          >
            {p.featured && (
              <span
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  fontSize: "0.625rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "0.25rem 0.6rem",
                  borderRadius: 999,
                  background: "var(--color-primary)",
                  color: "#000",
                }}
              >
                ★ Most Popular
              </span>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "2rem", lineHeight: 1 }}>{p.icon}</span>
              {!p.featured && (
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    padding: "0.3rem 0.65rem",
                    borderRadius: 999,
                    background: p.badgeColor,
                    border: `1px solid ${p.badgeBorder}`,
                    color: p.badgeText,
                  }}
                >
                  {p.badge}
                </span>
              )}
            </div>

            <div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  margin: "0 0 0.25rem",
                  lineHeight: 1.3,
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  color: "var(--color-primary)",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {p.subtitle}
              </p>
            </div>

            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {p.description}
            </p>

            {p.topics && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                  }}
                >
                  What you'll learn
                </span>
                {p.topics.map((topic) => (
                  <div
                    key={topic}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-primary)",
                        fontSize: "0.75rem",
                      }}
                    >
                      ✓
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.8125rem",
                        color: "var(--color-text)",
                      }}
                    >
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
              }}
            >
              {[
                { icon: "🕐", label: p.duration },
                { icon: "📡", label: p.sessions },
                { icon: "👤", label: p.mentorship },
                { icon: "🏆", label: p.outcome },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.4rem 0.6rem",
                    borderRadius: "0.5rem",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <span style={{ fontSize: "0.75rem" }}>{stat.icon}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      lineHeight: 1.3,
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="/trainings/enroll"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.7rem 1rem",
                borderRadius: "0.75rem",
                background:
                  hovered === i || p.featured
                    ? "var(--color-primary)"
                    : "rgba(255,255,255,0.05)",
                border: `1px solid ${hovered === i || p.featured ? "var(--color-primary)" : "var(--color-border)"}`,
                color:
                  hovered === i || p.featured
                    ? "#000"
                    : "var(--color-text-muted)",
                fontFamily: "var(--font-display)",
                fontSize: "0.8125rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "background 0.2s, color 0.2s",
                marginTop: "auto",
              }}
            >
              Enroll Now →
            </a>
          </div>
        ))}
      </div>

      {/* ── Crash courses ── */}
      <div
        style={{ maxWidth: 1100, margin: "5rem auto 0", padding: "0 1.5rem" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              marginBottom: "0.75rem",
            }}
          >
            ⚡ Fast-Track
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 900,
              color: "var(--color-text)",
              margin: "0 0 0.6rem",
            }}
          >
            Crash Courses
          </h2>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            Pick up a job-ready skill in weeks, not months.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {crashCourses.map((c) => (
            <div
              key={c.title}
              style={{
                position: "relative",
                borderRadius: "1.25rem",
                border: `1px solid ${c.accentBorder}`,
                background: c.accent,
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {c.icon}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    padding: "0.3rem 0.65rem",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${c.accentBorder}`,
                    color: c.badgeText,
                  }}
                >
                  Crash Course
                </span>
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.0625rem",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    margin: "0 0 0.25rem",
                    lineHeight: 1.3,
                  }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.75rem",
                    color: "var(--color-primary)",
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {c.subtitle}
                </p>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.7,
                  margin: 0,
                  flexGrow: 1,
                }}
              >
                {c.description}
              </p>
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  🕐 {c.duration}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  📡 {c.sessions}
                </span>
              </div>
              <a
                href="/contact"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.7rem 1rem",
                  borderRadius: "0.75rem",
                  background: "var(--color-primary)",
                  border: "1px solid var(--color-primary)",
                  color: "#000",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  marginTop: "auto",
                }}
              >
                Enroll Now →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ── Value props / why buy ── */}
      <div
        style={{ maxWidth: 1100, margin: "5rem auto 0", padding: "0 1.5rem" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 900,
              color: "var(--color-text)",
              margin: "0 0 0.6rem",
            }}
          >
            Why Enroll Today
          </h2>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            Your enrollment is protected, flexible, and built to pay off.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {valueProps.map((v) => (
            <div
              key={v.title}
              style={{
                padding: "1.75rem",
                borderRadius: "1.25rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <span style={{ fontSize: "1.75rem" }}>{v.icon}</span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                {v.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8125rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust / social proof logos ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "4rem auto 0",
          padding: "0 1.5rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "1.5rem",
          }}
        >
          Our graduates now work at
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1rem 2.5rem",
            alignItems: "center",
          }}
        >
          {trustLogos.map((logo) => (
            <span
              key={logo}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.125rem",
                fontWeight: 800,
                color: "var(--color-text-muted)",
                opacity: 0.7,
              }}
            >
              {logo}
            </span>
          ))}
        </div>
      </div>

      {/* ── Urgency + Final CTA ── */}
      <div
        style={{ maxWidth: 900, margin: "5rem auto 0", padding: "0 1.5rem" }}
      >
        <div
          style={{
            padding: "3rem 2rem",
            borderRadius: "1.5rem",
            background: "var(--color-primary)",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0.35rem 0.8rem",
              borderRadius: 999,
              background: "#000",
              color: "var(--color-primary)",
              marginBottom: "1rem",
            }}
          >
            🔥 Next Cohort Starts Soon · Limited Seats
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 900,
              color: "#000",
              margin: "0 0 0.75rem",
            }}
          >
            Secure Your Seat Before It's Gone
          </h2>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: "rgba(0,0,0,0.7)",
              margin: "0 0 1.75rem",
              lineHeight: 1.6,
            }}
          >
            Spots fill fast every cohort. Lock in today with our 7-day
            money-back guarantee, zero risk.
          </p>
          <a
            href="/trainings/enroll"
            style={{
              display: "inline-block",
              padding: "0.9rem 2rem",
              borderRadius: "0.75rem",
              background: "#000",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.9375rem",
              textDecoration: "none",
            }}
          >
            Enroll Today →
          </a>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              color: "rgba(0,0,0,0.6)",
              margin: "1rem 0 0",
            }}
          >
            ✓ 7-day refund · ✓ Flexible payment plans · ✓ Lifetime access
          </p>
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.25); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0.08); }
        }
        .masonry { column-count: 1; column-gap: 1.5rem; }
        @media (min-width: 640px) { .masonry { column-count: 2; } }
        @media (min-width: 1024px) { .masonry { column-count: 3; } }
        @media (min-width: 768px) {
          .section-page { padding-top: calc(var(--header-height-desktop) + 2rem) !important; }
        }
      `}</style>
    </section>
  );
}
