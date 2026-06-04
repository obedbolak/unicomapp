"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  BarChart2,
  Mail,
  Target,
  TrendingUp,
  MousePointerClick,
} from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Search,
    title: "SEO & Content Strategy",
    desc: "Keyword research, on-page optimization, and content planning that drives organic traffic and ranks you where your customers are searching.",
  },
  {
    icon: MousePointerClick,
    title: "Paid Advertising (PPC)",
    desc: "Google Ads and Meta campaigns engineered for ROI — not just clicks. We manage budgets, audiences, and creatives end-to-end.",
  },
  {
    icon: Mail,
    title: "Email Marketing",
    desc: "Automated drip sequences and broadcast campaigns that nurture leads and convert them into repeat customers.",
  },
  {
    icon: Target,
    title: "Conversion Rate Optimization",
    desc: "A/B testing, heatmaps, and funnel analysis to turn your existing traffic into more revenue without increasing ad spend.",
  },
  {
    icon: BarChart2,
    title: "Analytics & Reporting",
    desc: "Custom dashboards and monthly reports that surface the metrics that matter — so you can make data-driven decisions.",
  },
  {
    icon: TrendingUp,
    title: "Growth Strategy",
    desc: "A full-funnel plan connecting awareness to retention, built around your business model and growth targets.",
  },
];

const process = [
  {
    step: "01",
    title: "Audit & Research",
    desc: "We analyze your current digital presence, competitors, and target audience to identify the highest-leverage opportunities.",
  },
  {
    step: "02",
    title: "Strategy & Planning",
    desc: "A tailored roadmap across channels — SEO, paid, email, and content — with clear KPIs and timelines for each.",
  },
  {
    step: "03",
    title: "Campaign Execution",
    desc: "Our team launches and manages campaigns across every channel with rigorous attention to creative quality and targeting.",
  },
  {
    step: "04",
    title: "Optimization",
    desc: "Continuous testing and iteration based on real performance data to improve results week over week.",
  },
  {
    step: "05",
    title: "Reporting & Insight",
    desc: "Monthly strategy calls and transparent reporting keep you fully informed on what's working and what's next.",
  },
];

const channels = [
  "Google Ads",
  "Meta Ads",
  "SEO",
  "Email Automation",
  "Content Marketing",
  "Landing Pages",
  "Analytics",
  "LinkedIn Ads",
  "YouTube Ads",
  "Retargeting",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function DigitalMarketingPage() {
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
          <span className="section-eyebrow">Marketing</span>
          <h1
            className="section-heading"
            style={{ color: "var(--color-text)", maxWidth: "700px" }}
          >
            Digital Marketing That{" "}
            <span className="gradient-text">Drives Real Growth</span>
          </h1>
          <p
            className="hero-subtitle"
            style={{ maxWidth: "600px", marginBottom: "2rem" }}
          >
            From search to social, we build and manage data-driven campaigns
            that attract the right audience, convert them into customers, and
            keep them coming back.
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
              Start a Campaign <ArrowUpRight size={16} />
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
          <span className="section-eyebrow">What We Do</span>
          <h2
            className="section-heading"
            style={{
              color: "var(--color-text)",
              fontSize: "1.75rem",
              marginBottom: "2rem",
            }}
          >
            Full-funnel marketing coverage
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
            Our marketing process
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

        {/* Channels */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: "5rem" }}>
          <span className="section-eyebrow">Channels & Tools</span>
          <h2
            className="section-heading"
            style={{
              color: "var(--color-text)",
              fontSize: "1.75rem",
              marginBottom: "1.5rem",
            }}
          >
            Where we grow your brand
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {channels.map((ch) => (
              <span
                key={ch}
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
                {ch}
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
              Ready to grow your audience?
            </h3>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}
            >
              Let's talk about your goals and build a marketing plan around
              them.
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
            Get in touch <ArrowUpRight size={16} />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
