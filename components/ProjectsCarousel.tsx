"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "VIHIPEX Academy Portal",
    category: "Software Development",
    description:
      "A fully bespoke school management infrastructure with real-time grading metrics and high-security administrative controls.",
    image: "https://images.unsplash.com/photo-1623461487986-9400110de28e",
    link: "#",
  },
  {
    title: "E-Commerce Fluid Architecture",
    category: "Mobile / Web App",
    description:
      "A conversion-optimized store platform featuring serverless checkouts, high-fidelity responsive filters, and sub-100ms render speeds.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    link: "#",
  },
  {
    title: "OmniChannel Strategic Engine",
    category: "Digital Marketing",
    description:
      "An automated multi-platform content delivery system engineered to manage high-yield acquisition layers across modern networks.",
    image:
      "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80",
    link: "#",
  },
  {
    title: "SaaS Analytics Dashboard",
    category: "UI/UX Design",
    description:
      "A data-rich analytics interface built for real-time decision making, combining elegant design with powerful filtering systems.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    link: "#",
  },
  {
    title: "Brand Identity System",
    category: "Brand Strategy",
    description:
      "A complete visual identity overhaul including logo system, color language, and component library for a fintech startup.",
    image:
      "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800&q=80",
    link: "#",
  },
];

const loopedProjects = [...projects, ...projects];

export default function ProjectsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const isPaused = useRef(false);

  // Silently reset to midpoint to create seamless loop
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Start at midpoint so left-scroll also works
    const onReady = () => {
      track.scrollLeft = track.scrollWidth / 2;
    };
    // Wait for layout
    setTimeout(onReady, 50);

    const handleScroll = () => {
      const mid = track.scrollWidth / 2;
      if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) {
        track.scrollLeft = mid - track.clientWidth;
      } else if (track.scrollLeft <= 2) {
        track.scrollLeft = mid;
      }
    };
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, []);

  const scroll = useCallback((dir: "left" | "right") => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector(
      ".proj-card-inner",
    ) as HTMLElement;
    const amount = card ? card.offsetWidth + 24 : 360;
    trackRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused.current) scroll("right");
    }, 5000);
    return () => clearInterval(interval);
  }, [scroll]);

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100%",
        paddingTop: "5rem",
        paddingBottom: "5rem",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          paddingLeft: "clamp(1rem, 5vw, 4rem)",
          paddingRight: "clamp(1rem, 5vw, 4rem)",
          marginBottom: "2.5rem",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span className="section-eyebrow">What We've Done</span>
          <h2
            className="section-heading"
            style={{
              color: "var(--color-text)",
              fontSize: "2rem",
              marginBottom: 0,
            }}
          >
            Selected <span className="gradient-text">Projects</span>
          </h2>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          {(
            [
              { dir: "left", Icon: ArrowLeft },
              { dir: "right", Icon: ArrowRight },
            ] as const
          ).map(({ dir, Icon }) => (
            <button
              key={dir}
              onClick={() => {
                isPaused.current = true;
                scroll(dir);
                setTimeout(() => {
                  isPaused.current = false;
                }, 8000);
              }}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,140,0,0.1)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--color-text-muted)";
              }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Carousel track */}
      <div
        ref={trackRef}
        onMouseEnter={() => {
          isPaused.current = true;
        }}
        onMouseLeave={() => {
          isPaused.current = false;
        }}
        style={{
          display: "flex",
          gap: "1.5rem",
          overflowX: "auto",
          paddingLeft: "clamp(1rem, 5vw, 4rem)",
          paddingRight: "clamp(1rem, 5vw, 4rem)",
          paddingBottom: "1rem",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {loopedProjects.map((project, i) => (
          <div
            key={i}
            className="proj-card-inner"
            style={{
              flexShrink: 0,
              width: "clamp(280px, 75vw, 680px)",
              borderRadius: "1rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              overflow: "hidden",
            }}
          >
            {/* Image */}
            <div
              className="proj-image"
              style={{ overflow: "hidden", flexShrink: 0 }}
            >
              <img
                src={project.image}
                alt={project.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  transition: "transform 0.4s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.transform =
                    "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.transform =
                    "scale(1)")
                }
              />
            </div>

            {/* Description */}
            <div
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minWidth: 0,
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
                  padding: "0.2rem 0.5rem",
                  borderRadius: "6px",
                  alignSelf: "flex-start",
                  marginBottom: "0.75rem",
                }}
              >
                {project.category}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: "var(--color-text)",
                  marginBottom: "0.5rem",
                  lineHeight: 1.4,
                }}
              >
                {project.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {project.description}
              </p>
              <a
                href={project.link}
                style={{
                  marginTop: "1.25rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  letterSpacing: "0.03em",
                  transition: "gap 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.gap = "0.65rem")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.gap = "0.4rem")
                }
              >
                View Project <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .proj-card-inner {
          display: flex;
          flex-direction: column;
        }
        .proj-image {
          width: 100%;
          height: 200px;
        }
        @media (min-width: 600px) {
          .proj-card-inner { flex-direction: row; }
          .proj-image { width: 220px; min-width: 220px; height: auto; }
        }
      `}</style>
    </section>
  );
}
