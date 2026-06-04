"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Compass,
  LineChart,
  Users,
  Lightbulb,
  BookOpen,
  Network,
} from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Compass,
    title: "Business Model Design",
    desc: "We help you define how your business creates, delivers, and captures value — from pricing models to revenue streams and go-to-market approach.",
  },
  {
    icon: LineChart,
    title: "Market & Competitive Analysis",
    desc: "In-depth research into your market size, customer segments, and competitor positioning to find gaps you can own.",
  },
  {
    icon: Lightbulb,
    title: "Growth & Expansion Strategy",
    desc: "Roadmaps for entering new markets, launching new products, or scaling existing operations — backed by data, not guesswork.",
  },
  {
    icon: Users,
    title: "Organizational Design",
    desc: "Structuring teams, roles, and workflows so your business operates efficiently as it grows from 5 to 50 to 500 people.",
  },
  {
    icon: BookOpen,
    title: "Investor Readiness",
    desc: "Pitch decks, financial models, and narrative frameworks that help you articulate your vision and close funding rounds.",
  },
  {
    icon: Network,
    title: "Partnership & Ecosystem Strategy",
    desc: "Identifying the right partners, distribution channels, and alliances that accelerate growth without diluting your brand.",
  },
];

const process = [
  {
    step: "01",
    title: "Situation Assessment",
    desc: "We run a deep diagnostic of your current business — financials, operations, market position, and team — to understand where you actually are.",
  },
  {
    step: "02",
    title: "Goal Alignment",
    desc: "We work with your leadership to define clear, measurable objectives for the next 12–36 months and agree on what success looks like.",
  },
  {
    step: "03",
    title: "Strategy Development",
    desc: "We synthesize findings into a concrete strategic plan with prioritized initiatives, resource requirements, and timelines.",
  },
  {
    step: "04",
    title: "Roadmap & Execution Plan",
    desc: "Strategy without execution is just theory. We translate the plan into quarterly OKRs, workstreams, and ownership assignments.",
  },
  {
    step: "05",
    title: "Advisory & Review",
    desc: "Ongoing quarterly strategy reviews and advisory support to adapt the plan as market conditions and business realities evolve.",
  },
];

const deliverables = [
  "Market Analysis",
  "Business Model Canvas",
  "Competitive Mapping",
  "Financial Projections",
  "Pitch Deck",
  "OKR Framework",
  "Go-to-Market Plan",
  "Org Design",
  "Risk Assessment",
  "Growth Roadmap",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function BusinessStrategyPage() {
  const router = useRouter();

  return (
    <div className="section-page">
      <div className="container-7xl">
        {/* Back */}
        <motion.button
          {...fadeUp()}
          onClick={() => router.push("/services")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-display)",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "2.5rem",
            padding: 0,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "var(--color-primary)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "var(--color-text-muted)")
          }
        >
          <ArrowLeft size={16} /> Back to Services
        </motion.button>

        {/* Hero */}
        <motion.div {...fadeUp(0.05)} style={{ marginBottom: "4rem" }}>
          <span className="section-eyebrow">Strategy</span>
          <h1
            className="section-heading"
            style={{ color: "var(--color-text)", maxWidth: "700px" }}
          >
            Business Strategy for{" "}
            <span className="gradient-text">Sustainable Growth</span>
          </h1>
          <p
            className="hero-subtitle"
            style={{ maxWidth: "600px", marginBottom: "2rem" }}
          >
            We work alongside founders and leadership teams to build the
            strategic clarity, operational frameworks, and growth plans needed
            to scale with confidence.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                background: "var(--color-primary)",
                color: "#000",
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
              }
            >
              Book a Strategy Call <ArrowUpRight size={16} />
            </a>
            <a
              href="/projects"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View Our Work
            </a>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: "5rem" }}>
          <span className="section-eyebrow">What We Offer</span>
          <h2
            className="section-heading"
            style={{
              color: "var(--color-text)",
              fontSize: "1.75rem",
              marginBottom: "2rem",
            }}
          >
            Strategic support across every stage
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "1.25rem",
            }}
          >
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                {...fadeUp(i * 0.07)}
                className="card"
                style={{ padding: "1.5rem" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    marginBottom: "1rem",
                    background: "rgba(255,140,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-primary)",
                  }}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--color-text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Process */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: "5rem" }}>
          <span className="section-eyebrow">How We Work</span>
          <h2
            className="section-heading"
            style={{
              color: "var(--color-text)",
              fontSize: "1.75rem",
              marginBottom: "2rem",
            }}
          >
            Our engagement process
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0",
              maxWidth: "720px",
            }}
          >
            {process.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                {...fadeUp(i * 0.08)}
                style={{ display: "flex", gap: "1.5rem", position: "relative" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "rgba(255,140,0,0.1)",
                      border: "1px solid rgba(255,140,0,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.6875rem",
                      fontWeight: 800,
                      color: "var(--color-primary)",
                    }}
                  >
                    {step}
                  </div>
                  {i < process.length - 1 && (
                    <div
                      style={{
                        width: "1px",
                        flex: 1,
                        background: "rgba(255,140,0,0.15)",
                        margin: "4px 0",
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    paddingBottom: i < process.length - 1 ? "1.75rem" : 0,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--color-text)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.875rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Deliverables */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: "5rem" }}>
          <span className="section-eyebrow">Deliverables</span>
          <h2
            className="section-heading"
            style={{
              color: "var(--color-text)",
              fontSize: "1.75rem",
              marginBottom: "1.5rem",
            }}
          >
            What you walk away with
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {deliverables.map((d) => (
              <span
                key={d}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  padding: "0.4rem 0.875rem",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          {...fadeUp(0.1)}
          style={{
            padding: "2.5rem",
            borderRadius: "1.25rem",
            background: "rgba(255,140,0,0.05)",
            border: "1px solid rgba(255,140,0,0.2)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "var(--color-text)",
                marginBottom: "0.5rem",
              }}
            >
              Let's build your growth plan.
            </h3>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}
            >
              Book a free 30-minute strategy call and leave with at least one
              actionable insight.
            </p>
          </div>
          <a
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              background: "var(--color-primary)",
              color: "#000",
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "opacity 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
            }
          >
            Book a call <ArrowUpRight size={16} />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
