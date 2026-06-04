"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Smartphone,
  Globe,
  Paintbrush,
  Gauge,
  RefreshCw,
  Puzzle,
} from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Native iOS and Android apps, or cross-platform solutions with React Native and Expo — built for performance and app store approval.",
  },
  {
    icon: Globe,
    title: "Web Application Development",
    desc: "Responsive, SEO-ready web apps built with Next.js and modern frameworks that load fast and scale without friction.",
  },
  {
    icon: Paintbrush,
    title: "UI/UX Design",
    desc: "User research, wireframing, and high-fidelity Figma prototypes that turn complex workflows into intuitive interfaces.",
  },
  {
    icon: Gauge,
    title: "Performance Optimization",
    desc: "Lighthouse audits, image optimization, code splitting, and Core Web Vitals improvements for a snappy user experience.",
  },
  {
    icon: RefreshCw,
    title: "Maintenance & Updates",
    desc: "Ongoing support, dependency updates, bug fixes, and feature additions to keep your product healthy and competitive.",
  },
  {
    icon: Puzzle,
    title: "Third-Party Integrations",
    desc: "Payment gateways, CRMs, analytics, push notifications, maps, and any API your product needs to function seamlessly.",
  },
];

const process = [
  {
    step: "01",
    title: "Discovery & Wireframing",
    desc: "We define user flows, information architecture, and screen layouts before any design or code begins.",
  },
  {
    step: "02",
    title: "UI Design & Prototype",
    desc: "High-fidelity mockups built in Figma, reviewed with you, and iterated until every interaction feels right.",
  },
  {
    step: "03",
    title: "Development Sprints",
    desc: "Two-week cycles of focused engineering with daily standups and a live staging environment you can test throughout.",
  },
  {
    step: "04",
    title: "Testing & QA",
    desc: "Device testing across screen sizes, OS versions, and browsers — plus automated test suites before every release.",
  },
  {
    step: "05",
    title: "Launch & Support",
    desc: "App store submission, web deployment, and a dedicated support period to handle any post-launch issues fast.",
  },
];

const stack = [
  "React Native",
  "Expo",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Figma",
  "Supabase",
  "Firebase",
  "Stripe",
  "Mapbox",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function MobileWebDevelopmentPage() {
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
          <span className="section-eyebrow">Development</span>
          <h1
            className="section-heading"
            style={{ color: "var(--color-text)", maxWidth: "700px" }}
          >
            Apps & Websites Built for{" "}
            <span className="gradient-text">Every Screen</span>
          </h1>
          <p
            className="hero-subtitle"
            style={{ maxWidth: "600px", marginBottom: "2rem" }}
          >
            We craft polished mobile and web experiences — from concept and
            design through to launch — that your users will actually enjoy
            using.
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
              Start Building <ArrowUpRight size={16} />
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
          <span className="section-eyebrow">What We Build</span>
          <h2
            className="section-heading"
            style={{
              color: "var(--color-text)",
              fontSize: "1.75rem",
              marginBottom: "2rem",
            }}
          >
            End-to-end product delivery
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
            Our development process
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

        {/* Tech Stack */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: "5rem" }}>
          <span className="section-eyebrow">Tech Stack</span>
          <h2
            className="section-heading"
            style={{
              color: "var(--color-text)",
              fontSize: "1.75rem",
              marginBottom: "1.5rem",
            }}
          >
            Tools we build with
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {stack.map((tech) => (
              <span
                key={tech}
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
                {tech}
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
              Have an app idea in mind?
            </h3>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}
            >
              Share your vision with us and we'll scope it into a buildable plan
              within 48 hours.
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
