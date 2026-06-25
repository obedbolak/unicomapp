"use client";

import { motion } from "framer-motion";
import {
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

/* ── Data ────────────────────────────────────────────────────────────────── */

const projects = [
  {
    title: "VIHIPEX University Portal",
    category: "Software Development",
    description:
      "An enterprise-grade university campus management infrastructure featuring secure student information systems, real-time grading metrics, and high-security administrative controls.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Framer Motion"],
    link: "https://vihipex.com",
  },
  {
    title: "E-Commerce Fluid Architecture",
    category: "Mobile / Web App",
    description:
      "A conversion-optimized custom store platform featuring serverless instant checkouts, high-fidelity responsive filters, and sub-100ms render speeds.",
    tags: ["React Native", "TailwindCSS", "Node.js", "GraphQL"],
    link: "#",
  },
  {
    title: "Gracy Global Ecosystem",
    category: "Mobile / Web App",
    description:
      "A multi-faceted community platform bridging telehealth counseling workflows, remote job acquisition pipelines, and digital skill education databases.",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "Real-time Chat"],
    link: "https://gracyglobal.com",
  },
  {
    title: "Legacy Language Center",
    category: "Mobile / Web App",
    description:
      "A specialized exam preparation platform providing expert coaching for IELTS, TOEFL, and French proficiency exams with personalized progress tracking.",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "UI/UX Design"],
    link: "https://legacylanguagecenter.com",
  },
  {
    title: "Mr. A Tutoring Agency",
    category: "Mobile / Web App",
    description:
      "A custom K-12 STEM educational engine supporting interactive booking workflows, teacher profiles, and highly targeted lesson scheduling.",
    tags: ["React", "Node.js", "TailwindCSS", "Web Hosting"],
    link: "https://mratutoring.com",
  },
  {
    title: "Earth Design Engineering Ltd",
    category: "Software Development",
    description:
      "An enterprise-grade engineering portal optimized for rapid portfolio loads, structural blueprints, and civil project telemetry.",
    tags: ["Next.js", "TailwindCSS", "Framer Motion", "SEO Optimization"],
    link: "https://earthdesignengineeringltd.com",
  },
  {
    title: "Chicad-ES Architecture",
    category: "Software Development",
    description:
      "A high-fidelity digital architecture portfolio showcasing minimalist spatial components, spatial design rendering layouts, and interactive case structures.",
    tags: ["React", "TypeScript", "TailwindCSS", "Creative Coding"],
    link: "https://chicad-es.com",
  },
  {
    title: "Kingslife Enterprises",
    category: "Digital Marketing & Strategy",
    description:
      "A premium strategic brand ecosystem designed for enterprise growth hacking, cross-network distribution layers, and high-yield asset delivery.",
    tags: ["Automation", "Data Analytics", "Growth Hacking", "Webflow"],
    link: "https://kingslifeenterprises.com",
  },
  {
    title: "OmniChannel Strategic Engine",
    category: "Digital Marketing & Strategy",
    description:
      "An automated multi-platform content delivery system engineered to manage high-yield acquisition layers across modern networks.",
    tags: ["Automation", "Data Analytics", "Growth Hacking"],
    link: "#",
  },
];

/* ── Component ───────────────────────────────────────────────────────────── */

export default function ProjectsPage() {
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
          <span className="section-eyebrow">Case Studies</span>
          <h1
            className="section-heading"
            style={{ color: "var(--color-text)" }}
          >
            Selected digital <span className="gradient-text">masterpieces</span>
          </h1>
          <p
            className="hero-subtitle"
            style={{ marginBottom: 0, maxWidth: "600px" }}
          >
            Explore the specialized architectures, platforms, and interactive
            software designs we have recently shipped for ambitious teams.
          </p>
        </motion.div>

        {/* Layout Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1.5rem",
          }}
          className="projects-grid"
        >
          <style>{`
            @media (min-width: 768px) {
              .projects-grid {
                grid-template-columns: repeat(2, 1fr) !important;
              }
            }
            @media (min-width: 1024px) {
              .projects-grid {
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 2rem !important;
              }
            }
            .project-tag {
              font-family: var(--font-display);
              font-size: 0.75rem;
              font-weight: 600;
              padding: 0.25rem 0.625rem;
              border-radius: 6px;
              background: rgba(255,255,255,0.04);
              border: 1px solid rgba(255,255,255,0.08);
              color: rgba(255,255,255,0.5);
            }
            .project-link-icon {
              color: rgba(255,255,255,0.3);
              transition: color 0.2s, transform 0.2s;
            }
            .project-card-interactive:hover .project-link-icon {
              color: var(--color-primary);
              transform: translate(2px, -2px);
            }
          `}</style>

          {/* Loop Projects */}
          {projects.map(({ title, category, description, tags, link }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <a
                href={link}
                target={link.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="card project-card-interactive"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "2rem",
                  height: "100%",
                  textDecoration: "none",
                  transition:
                    "border-color 0.2s, background 0.2s, transform 0.2s",
                }}
              >
                {/* Header Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1.25rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-primary)",
                      background: "rgba(255,140,0,0.08)",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "6px",
                    }}
                  >
                    {category}
                  </span>
                  <ArrowTopRightOnSquareIcon
                    className="project-link-icon"
                    style={{ width: "18px" }}
                  />
                </div>

                {/* Info Text */}
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: "var(--color-text)",
                    marginBottom: "0.75rem",
                    lineHeight: 1.4,
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
                    marginBottom: "2rem",
                  }}
                >
                  {description}
                </p>

                {/* Tech Tags Footer Row */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.375rem",
                    marginTop: "auto",
                  }}
                >
                  {tags.map((tag) => (
                    <span key={tag} className="project-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
