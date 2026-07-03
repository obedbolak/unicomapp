"use client";

const internships = [
  {
    icon: "🖥️",
    title: "Frontend Engineering Intern",
    stack: "React · TypeScript · Tailwind",
    description:
      "Work alongside our engineers building real client-facing UIs. Ship features to production with mentor guidance.",
    duration: "3–6 Months",
    type: "Hybrid",
    slots: "3 Slots",
    accent: "rgba(255,140,0,0.12)",
    accentBorder: "rgba(255,140,0,0.25)",
    paid: true,
  },
  {
    icon: "⚙️",
    title: "Backend Engineering Intern",
    stack: "Node.js · PostgreSQL · APIs",
    description:
      "Build and maintain APIs, work with databases, and learn production deployment in a real engineering team.",
    duration: "6 Months",
    type: "Remote",
    slots: "2 Slots",
    accent: "rgba(59,130,246,0.08)",
    accentBorder: "rgba(59,130,246,0.2)",
    paid: true,
  },
  {
    icon: "🎨",
    title: "UI/UX Design Intern",
    stack: "Figma · Prototyping · Research",
    description:
      "Contribute to live product designs, run user research, and build a portfolio of shipped work.",
    duration: "3 Months",
    type: "Remote",
    slots: "2 Slots",
    accent: "rgba(168,85,247,0.08)",
    accentBorder: "rgba(168,85,247,0.2)",
    paid: false,
  },
  {
    icon: "📈",
    title: "Digital Marketing Intern",
    stack: "SEO · Ads · Content · Analytics",
    description:
      "Run real campaigns, manage social channels, and learn data-driven marketing on live brands.",
    duration: "3 Months",
    type: "Hybrid",
    slots: "2 Slots",
    accent: "rgba(34,197,94,0.08)",
    accentBorder: "rgba(34,197,94,0.2)",
    paid: false,
  },
  {
    icon: "📱",
    title: "Mobile Development Intern",
    stack: "React Native · Expo",
    description:
      "Help build and ship cross-platform mobile apps to the app stores under senior mentorship.",
    duration: "6 Months",
    type: "Remote",
    slots: "1 Slot",
    accent: "rgba(251,191,36,0.08)",
    accentBorder: "rgba(251,191,36,0.2)",
    paid: true,
  },
  {
    icon: "💻",
    title: "Desktop App Dev Intern",
    stack: "Electron · Tauri",
    description:
      "Build installable desktop tools for Windows, macOS, and Linux while learning packaging and auto-updates.",
    duration: "5 Months",
    type: "Remote",
    slots: "1 Slot",
    accent: "rgba(14,165,233,0.08)",
    accentBorder: "rgba(14,165,233,0.2)",
    paid: true,
  },
];
function applyHref(role?: { title: string }) {
  const params = new URLSearchParams({ type: "internship" });
  if (role) params.set("course", role.title);
  return `/trainings/enroll?${params.toString()}`;
}
const perks = [
  {
    icon: "🚀",
    title: "Real Project Experience",
    text: "Work on live products and client projects, not throwaway exercises.",
  },
  {
    icon: "👨‍🏫",
    title: "Senior Mentorship",
    text: "Get paired with experienced engineers and designers who review your work.",
  },
  {
    icon: "📜",
    title: "Certificate & Reference",
    text: "Earn a verified internship certificate and a professional reference letter.",
  },
  {
    icon: "💼",
    title: "Path to Full-Time",
    text: "Top-performing interns are offered full-time roles or freelance contracts.",
  },
];

const steps = [
  {
    num: "01",
    title: "Apply",
    text: "Submit your application and tell us the role you want.",
  },
  {
    num: "02",
    title: "Interview",
    text: "A short call to understand your skills and goals.",
  },
  {
    num: "03",
    title: "Onboard",
    text: "Meet your mentor and team, and set up your tools.",
  },
  {
    num: "04",
    title: "Build & Ship",
    text: "Work on real projects and grow your portfolio.",
  },
];

export default function InternshipsPage() {
  return (
    <main className="section-page" style={pageStyle}>
      {/* ── Hero ── */}
      {/* ── Hero with classroom background ── */}
      <section
        style={{
          position: "relative",
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "4rem 1.5rem",
          overflow: "hidden",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
        {/* Dark gradient overlay for readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.75), rgba(10,10,10,0.9))",
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: 760 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 0 3px rgba(34,197,94,0.25)",
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
              {internships.length} Internships Open
            </span>
          </div>
          <h1 style={{ ...h1, color: "#fff" }}>
            Launch Your Career With a{" "}
            <span style={{ color: "var(--color-primary)" }}>
              Real Internship
            </span>
          </h1>
          <p style={{ ...muted, color: "rgba(255,255,255,0.85)" }}>
            Gain hands-on experience on live projects, learn from senior
            mentors, and build a portfolio that gets you hired. Remote and
            hybrid roles available.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "2rem",
            }}
          >
            <a href="#roles" style={{ ...primaryBtn, display: "inline-block" }}>
              View Open Roles
            </a>
            <a
              href={applyHref()}
              style={{
                ...ghostBtn,
                display: "inline-block",
                textDecoration: "none",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              Apply Now
            </a>
          </div>
        </div>
      </section>

      {/* ── Open roles (masonry) ── */}
      <section id="roles" style={{ paddingBottom: "4rem" }}>
        <SectionHeader
          title="Open Internships"
          subtitle="Find a role that matches your skills and ambitions."
        />
        <div
          className="masonry"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}
        >
          {internships.map((role) => (
            <div
              key={role.title}
              style={{
                breakInside: "avoid",
                marginBottom: "1.5rem",
                borderRadius: "1.25rem",
                border: `1px solid ${role.accentBorder}`,
                background: role.accent,
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {role.icon}
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
                    background: role.paid
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(255,255,255,0.06)",
                    border: `1px solid ${role.paid ? "rgba(34,197,94,0.3)" : "var(--color-border)"}`,
                    color: role.paid ? "#22c55e" : "var(--color-text-muted)",
                  }}
                >
                  {role.paid ? "Paid" : "Unpaid"}
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
                  {role.title}
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
                  {role.stack}
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
                {role.description}
              </p>
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}
              >
                <span style={tag}>🕐 {role.duration}</span>
                <span style={tag}>📍 {role.type}</span>
                <span style={tag}>👥 {role.slots}</span>
              </div>
              <a
                href={applyHref(role)}
                style={{
                  ...primaryBtn,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "auto",
                }}
              >
                Apply for this Role →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Perks ── */}
      <section
        style={{ padding: "0 1.5rem 4rem", maxWidth: 1100, margin: "0 auto" }}
      >
        <SectionHeader
          title="Why Intern With Us"
          subtitle="An internship that actually moves your career forward."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {perks.map((p) => (
            <div
              key={p.title}
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
              <span style={{ fontSize: "1.75rem" }}>{p.icon}</span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                {p.title}
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
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        style={{ padding: "0 1.5rem 4rem", maxWidth: 1100, margin: "0 auto" }}
      >
        <SectionHeader
          title="How It Works"
          subtitle="From application to your first shipped project."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {steps.map((s) => (
            <div
              key={s.num}
              style={{
                padding: "1.75rem",
                borderRadius: "1.25rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "var(--color-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                {s.num}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.0625rem",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  margin: "0 0 0.4rem",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        style={{ padding: "0 1.5rem 5rem", maxWidth: 900, margin: "0 auto" }}
      >
        <div
          style={{
            padding: "3rem 2rem",
            borderRadius: "1.5rem",
            background: "var(--color-primary)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 900,
              color: "#000",
              margin: "0 0 0.75rem",
            }}
          >
            Ready to gain real experience?
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
            Apply today, slots are limited and fill up fast each cohort.
          </p>
          <a
            href={applyHref()}
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
            Apply for an Internship →
          </a>
        </div>
      </section>

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
    </main>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: "2.5rem",
        padding: "0 1.5rem",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
          fontWeight: 900,
          color: "var(--color-text)",
          margin: "0 0 0.6rem",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          color: "var(--color-text-muted)",
          margin: 0,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

// ── Shared styles ──
const pageStyle: React.CSSProperties = {
  width: "100%",
  paddingBottom: "4rem",
  paddingTop: "calc(var(--header-height-mobile) + 2rem)",
};
const h1: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(2rem, 6vw, 3.25rem)",
  fontWeight: 900,
  color: "var(--color-text)",
  lineHeight: 1.1,
  margin: "0 0 1.25rem",
};
const muted: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "1.0625rem",
  color: "var(--color-text-muted)",
  lineHeight: 1.7,
  margin: 0,
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
const tag: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.3rem",
  fontFamily: "var(--font-display)",
  fontSize: "0.75rem",
  color: "var(--color-text-muted)",
};
