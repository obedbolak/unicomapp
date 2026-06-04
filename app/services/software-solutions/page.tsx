//app/services/software-solutions/page.tsx

"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Code,
  Layers,
  Cloud,
  ShieldCheck,
  Zap,
  GitBranch,
} from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Layers,
    title: "Full-Stack Architecture",
    desc: "End-to-end system design covering frontend, backend, databases, and infrastructure — built for long-term scalability.",
  },
  {
    icon: Cloud,
    title: "Cloud Integration",
    desc: "Seamless deployment on AWS, Vercel, or GCP with auto-scaling, load balancing, and environment management.",
  },
  {
    icon: ShieldCheck,
    title: "Security First",
    desc: "Authentication, authorization, data encryption, and vulnerability audits baked into every layer of your system.",
  },
  {
    icon: Zap,
    title: "High Performance",
    desc: "Optimized queries, caching strategies, and CDN-backed assets to keep response times under 100ms at scale.",
  },
  {
    icon: GitBranch,
    title: "CI/CD Pipelines",
    desc: "Automated testing, code reviews, and deployment pipelines so your team ships fast without breaking things.",
  },
  {
    icon: Code,
    title: "API Development",
    desc: "RESTful and GraphQL APIs designed for developer experience, with proper versioning, documentation, and rate limiting.",
  },
];

const process = [
  {
    step: "01",
    title: "Discovery & Scoping",
    desc: "We map your requirements, constraints, and goals into a technical specification before writing a single line of code.",
  },
  {
    step: "02",
    title: "Architecture Design",
    desc: "System diagrams, database schemas, and API contracts are defined upfront to prevent costly refactors later.",
  },
  {
    step: "03",
    title: "Agile Development",
    desc: "Two-week sprints with demos, giving you visibility into progress and the ability to steer direction at every milestone.",
  },
  {
    step: "04",
    title: "QA & Testing",
    desc: "Unit, integration, and end-to-end tests run automatically on every pull request before anything reaches production.",
  },
  {
    step: "05",
    title: "Deployment & Handoff",
    desc: "We deploy to your infrastructure, write documentation, and train your team so you own the product completely.",
  },
];

const stack = [
  "Next.js",
  "React",
  "Node.js",
  "TypeScript",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Prisma",
  "GraphQL",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function SoftwareSolutionsPage() {
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
          <span className="section-eyebrow">Engineering</span>
          <h1
            className="section-heading"
            style={{ color: "var(--color-text)", maxWidth: "700px" }}
          >
            Software Solutions Built for{" "}
            <span className="gradient-text">Commercial Scale</span>
          </h1>
          <p
            className="hero-subtitle"
            style={{ maxWidth: "600px", marginBottom: "2rem" }}
          >
            We design and build tailored software architectures that handle
            real-world load, integrate with your existing tools, and evolve with
            your business.
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
              Start a Project <ArrowUpRight size={16} />
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
            Everything your product needs
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
            Our delivery process
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
                {/* Line */}
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
                {/* Content */}
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
            Tools we trust
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
              Ready to build something great?
            </h3>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}
            >
              Tell us about your project and we'll get back to you within 24
              hours.
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
