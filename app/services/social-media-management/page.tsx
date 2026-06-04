"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  MessageSquare,
  Calendar,
  Users,
  TrendingUp,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Calendar,
    title: "Content Planning & Scheduling",
    desc: "Monthly content calendars aligned to your brand voice, campaign goals, and platform-specific best practices — planned and scheduled in advance.",
  },
  {
    icon: Video,
    title: "Creative Content Production",
    desc: "Scroll-stopping graphics, short-form videos, reels, and carousels produced by our in-house creative team.",
  },
  {
    icon: MessageSquare,
    title: "Community Management",
    desc: "Timely, on-brand responses to comments, DMs, and mentions — building genuine relationships with your audience every day.",
  },
  {
    icon: Users,
    title: "Influencer Partnerships",
    desc: "Identifying, vetting, and managing influencer collaborations that reach your target audience authentically and affordably.",
  },
  {
    icon: TrendingUp,
    title: "Growth & Engagement Strategy",
    desc: "Organic growth tactics — hashtag research, posting cadence, engagement pods, and trend-jacking — to expand your reach consistently.",
  },
  {
    icon: TrendingUp,
    title: "Platform-Specific Expertise",
    desc: "Dedicated strategies for Instagram, TikTok, LinkedIn, Facebook, X, and YouTube — each platform treated on its own terms.",
  },
];

const process = [
  {
    step: "01",
    title: "Brand & Audience Audit",
    desc: "We review your current presence, tone of voice, competitors, and audience demographics to establish a clear baseline.",
  },
  {
    step: "02",
    title: "Strategy & Content Pillars",
    desc: "We define your content themes, posting frequency, and platform mix based on where your audience actually spends time.",
  },
  {
    step: "03",
    title: "Content Creation",
    desc: "Our creative team produces a full month of content — copy, visuals, and video — reviewed and approved by you before publishing.",
  },
  {
    step: "04",
    title: "Publishing & Engagement",
    desc: "We schedule posts at optimal times and manage daily community interactions to keep your audience engaged and growing.",
  },
  {
    step: "05",
    title: "Monthly Review",
    desc: "We share a performance report covering reach, engagement, follower growth, and insights, then refine strategy for the next month.",
  },
];

const platforms = [
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Facebook",
  "X (Twitter)",
  "YouTube",
  "Pinterest",
  "Threads",
  "Reels",
  "Stories",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function SocialMediaManagementPage() {
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
          <span className="section-eyebrow">Social Media</span>
          <h1
            className="section-heading"
            style={{ color: "var(--color-text)", maxWidth: "700px" }}
          >
            Social Media That{" "}
            <span className="gradient-text">Builds Your Brand</span>
          </h1>
          <p
            className="hero-subtitle"
            style={{ maxWidth: "600px", marginBottom: "2rem" }}
          >
            We manage your social presence end-to-end — strategy, content
            creation, scheduling, and community management — so you can focus on
            running your business.
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
              Grow My Audience <ArrowUpRight size={16} />
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
          <span className="section-eyebrow">What We Handle</span>
          <h2
            className="section-heading"
            style={{
              color: "var(--color-text)",
              fontSize: "1.75rem",
              marginBottom: "2rem",
            }}
          >
            Everything your social needs
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
            Our management process
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

        {/* Platforms */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: "5rem" }}>
          <span className="section-eyebrow">Platforms</span>
          <h2
            className="section-heading"
            style={{
              color: "var(--color-text)",
              fontSize: "1.75rem",
              marginBottom: "1.5rem",
            }}
          >
            Where we show up for you
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {platforms.map((p) => (
              <span
                key={p}
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
                {p}
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
              Ready to take social seriously?
            </h3>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}
            >
              Tell us about your brand and we'll put together a tailored social
              strategy.
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
