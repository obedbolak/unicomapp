"use client";

import { motion } from "framer-motion";
import {
  Code,
  Globe,
  Smartphone,
  Share2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Code,
    title: "Software Solutions",
    desc: "Tailored software architectures engineered for scale, security, and commercial performance. From API design to full-stack deployment.",
    tag: "Engineering",
  },
  {
    icon: Globe,
    title: "Digital Marketing",
    desc: "Data-driven campaigns that convert. SEO, SEM, and growth hacking for modern businesses aiming to dominate their market.",
    tag: "Growth",
  },
  {
    icon: Smartphone,
    title: "Mobile & Web Development",
    desc: "Progressive web apps and native mobile experiences built with React, Next.js, and modern stacks that scale.",
    tag: "Development",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    desc: "Content strategy, community building, and analytics across Instagram, TikTok, Facebook, and beyond.",
    tag: "Social",
  },
  {
    icon: TrendingUp,
    title: "Business Strategy",
    desc: "Operational consulting and digital transformation roadmaps for enterprise and startup growth.",
    tag: "Strategy",
  },
];

export default function ServicesPage() {
  return (
    <div className="section-page">
      <div className="container-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <span className="section-eyebrow">What We Do</span>
          <h1
            className="section-heading"
            style={{ color: "var(--color-text)" }}
          >
            Services built for <span className="gradient-text">impact</span>
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            Everything you need to build, grow, and scale your digital presence
            — under one roof.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid-services">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + i * 0.08,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                y: -6,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className="group card relative overflow-hidden cursor-default"
              style={{ padding: "1.75rem 1.75rem 1.5rem" }}
            >
              {/* Hover glow overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,140,0,0.07) 0%, transparent 60%)",
                }}
              />
              {/* Top shine line on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,140,0,0.5), transparent)",
                }}
              />

              <div className="relative z-10 flex flex-col h-full">
                {/* Tag */}
                <span
                  className="self-start text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-md mb-5"
                  style={{
                    color: "var(--color-primary)",
                    background: "rgba(255,140,0,0.1)",
                    border: "1px solid var(--color-border-primary)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {service.tag}
                </span>

                {/* Title + Icon — same row, space-between */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.0625rem",
                      lineHeight: 1.3,
                      color: "var(--color-text)",
                      transition: "color 0.3s",
                    }}
                  >
                    {service.title}
                  </h3>

                  <div
                    className="flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
                    style={{
                      display: "inline-flex",
                      padding: "0.625rem",
                      borderRadius: "0.75rem",
                      background:
                        "linear-gradient(135deg, rgba(255,140,0,0.15) 0%, rgba(255,59,0,0.08) 100%)",
                      color: "var(--color-primary)",
                    }}
                  >
                    <service.icon size={22} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Description */}
                <p
                  className="flex-1 text-sm leading-relaxed"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {service.desc}
                </p>

                {/* Learn more */}
                <div
                  className="mt-5 flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: "rgba(255,140,0,0.6)" }}
                >
                  Learn more <ArrowRight size={13} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
