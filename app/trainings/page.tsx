"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

import { programs, crashCourses } from "@/lib/data/trainings";

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

function enrollHref({
  title,
  category,
  price,
}: {
  title: string;
  category: string;
  price: string;
}) {
  const params = new URLSearchParams({
    course: title,
    category,
    price,
  });

  return `/trainings/enroll?${params.toString()}`;
}

export default function TrainingSection() {
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = [program.title, program.subtitle, program.description, program.category]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    const matchesCategory = activeCategory === "All" || activeCategory === "Courses";
    return matchesSearch && matchesCategory;
  });

  const filteredCrashCourses = crashCourses.filter((course) => {
    const matchesSearch = [course.title, course.subtitle, course.description, course.category]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    const matchesCategory = activeCategory === "All" || activeCategory === "Crash Courses";
    return matchesSearch && matchesCategory;
  });

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
      <style>{`
        .filters-desktop {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          flex: 1;
        }
        .filter-toggle-mobile {
          display: none;
        }
        .filters-mobile {
          display: none;
        }
        @media (max-width: 768px) {
          .filters-desktop {
            display: none !important;
          }
          .mobile-search-row {
            display: flex;
            width: 100%;
            gap: 0.5rem;
          }
          .filter-toggle-mobile {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            padding: 0 1rem;
            border-radius: 999px;
            border: 1px solid var(--color-border);
            background: var(--color-surface);
            color: var(--color-text);
            font-size: 0.875rem;
            font-weight: 600;
            font-family: var(--font-display);
            cursor: pointer;
            flex-shrink: 0;
          }
          .filters-mobile.open {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
            margin-bottom: 1rem;
          }
        }
        @media (min-width: 769px) {
          .mobile-search-row {
            width: 100%;
            max-width: 320px;
          }
        }
      `}</style>
      <div
        style={{
          maxWidth: "var(--container-7xl)",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        {/* Category Pills (Desktop) */}
        <div className="filters-desktop">
          {["All", "Courses", "Crash Courses", "Internships"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (cat === "Internships") {
                  router.push("/trainings/internships");
                } else {
                  setActiveCategory(cat);
                }
              }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                fontFamily: "var(--font-display)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                border: activeCategory === cat ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                background: activeCategory === cat ? "rgba(255,140,0,0.1)" : "var(--color-surface)",
                color: activeCategory === cat ? "var(--color-primary)" : "var(--color-text-muted)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile Search Row (Button + Search beside each other) */}
        <div className="mobile-search-row">
          
          {/* Mobile Filter Toggle */}
          <button className="filter-toggle-mobile" onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}>
            <span>Filter</span>
            <span style={{ fontSize: "0.7rem" }}>{isMobileFilterOpen ? "▲" : "▼"}</span>
          </button>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            style={{
              flex: 1,
              width: "100%",
              padding: "0.65rem 1rem",
              borderRadius: "999px",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
        </div>

        {/* Mobile Filters Dropdown (Appears full width below the row) */}
        <div className={`filters-mobile ${isMobileFilterOpen ? 'open' : ''}`}>
          {["All", "Courses", "Crash Courses", "Internships"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (cat === "Internships") {
                  router.push("/trainings/internships");
                } else {
                  setActiveCategory(cat);
                  setIsMobileFilterOpen(false);
                }
              }}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                fontWeight: 600,
                textAlign: "left",
                border: activeCategory === cat ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                background: activeCategory === cat ? "rgba(255,140,0,0.1)" : "var(--color-surface)",
                color: activeCategory === cat ? "var(--color-primary)" : "var(--color-text-muted)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
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
        style={{ maxWidth: "var(--container-7xl)", margin: "0 auto", padding: "0 1.5rem" }}
      >
        {filteredPrograms.map((p, i) => (
          <div
            key={p.title}
            className="train-card"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              breakInside: "avoid",
              marginBottom: "1.25rem",
              position: "relative",
              borderRadius: "1.25rem",
              border: `1px solid ${hovered === i || p.featured ? p.accentBorder : "var(--color-border)"}`,
              background:
                hovered === i || p.featured ? p.accent : "var(--color-surface)",
              padding: "1.5rem",
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
                gridTemplateColumns: "1fr",
                gap: "0.5rem",
              }}
            >
              {[
                { icon: "🕐", label: p.variants.map((v) => v.duration).join(", ") },
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
                marginTop: "auto",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8125rem",
                  fontWeight: 800,
                  color:
                    hovered === i || p.featured
                      ? "var(--color-primary)"
                      : "var(--color-text)",
                  whiteSpace: "nowrap",
                }}
              >
                From {p.variants[0].price}
              </span>
              <button
                onClick={() => router.push(`/trainings/${p.slug}`)}
                style={{
                  flex: "1 1 150px",
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
                  cursor: "pointer",
                }}
              >
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Crash courses ── */}
      <div
        style={{ maxWidth: "var(--container-7xl)", margin: "5rem auto 0", padding: "0 1.5rem" }}
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
          {filteredCrashCourses.map((c) => (
            <div
              key={c.title}
              style={{
                position: "relative",
                borderRadius: "1.25rem",
                border: `1px solid ${c.accentBorder}`,
                background: c.accent,
                padding: "1.5rem",
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
                  🕐 {c.variants.map(v => v.duration).join(", ")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  marginTop: "auto",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.8125rem",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    whiteSpace: "nowrap",
                  }}
                >
                  From {c.variants[0].price}
                </span>
                <button
                  onClick={() => router.push(`/trainings/${c.slug}`)}
                  style={{
                    flex: "1 1 150px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.7rem 1rem",
                    borderRadius: "0.75rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)")}
                >
                  View Details →
                </button>
              </div>
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
