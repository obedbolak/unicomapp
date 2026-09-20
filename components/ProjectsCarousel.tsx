"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import "@/app/projects-carousel.css";

/* ── Content ─────────────────────────────────────────────────────────────── */

// `link` of "#" (or empty) means "no case-study page yet" — those cards send
// visitors to the projects page instead of jumping to the top of the home page.
const projects = [
  {
    title: "VIHIPEX Academy Portal",
    category: "Software Development",
    description:
      "A fully bespoke school management infrastructure with real-time grading metrics and high-security administrative controls.",
    // The original URL had no size parameters, so the browser downloaded the
    // full-resolution photo for a card that is 400px wide.
    image:
      "https://images.unsplash.com/photo-1623461487986-9400110de28e?w=800&q=80&auto=format&fit=crop",
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

// Seconds per card. Total loop time scales with the list, so adding a sixth
// project doesn't speed the whole strip up.
const SECONDS_PER_CARD = 5;

const pad = (n: number) => String(n).padStart(2, "0");
const rise = (i: number) => ({ "--i": i }) as CSSProperties;

function ProjectLink({ href, title }: { href: string; title: string }) {
  const content = (
    <>
      View project <ArrowUpRight size={16} aria-hidden />
      <span className="up-sr">: {title}</span>
    </>
  );
  return /^https?:\/\//.test(href) ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="up-link"
    >
      {content}
    </a>
  ) : (
    <Link href={href} className="up-link">
      {content}
    </Link>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export default function ProjectsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useInView(sectionRef, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [userPaused, setUserPaused] = useState(false);

  // A seamless loop needs the list drawn twice back to back — the CSS slides
  // the whole strip left by exactly one set's width, so the moment the first
  // copy scrolls out, the second is sitting exactly where the first began.
  // With reduced motion there is no animation, so a single copy is enough
  // and it stays a plain scrollable row instead.
  const track = reduce ? projects : [...projects, ...projects];

  return (
    <section
      ref={sectionRef}
      className="up-section"
      data-in={revealed}
      aria-labelledby="up-heading"
    >
      <div className="up-head">
        <div className="up-reveal" style={rise(0)}>
          <span className="up-eyebrow">{"What We've Done"}</span>
          <h2 id="up-heading" className="up-title">
            Selected <span className="up-grad">Projects</span>
          </h2>
          <p className="up-sub">
            A look at recent work across engineering, design and growth.
          </p>
        </div>

        <div className="up-tools up-reveal" style={rise(1)}>
          <Link href="/projects" className="up-all">
            View all projects <ArrowRight size={16} aria-hidden />
          </Link>
          {!reduce && (
            <button
              type="button"
              className="up-round"
              aria-label={
                userPaused ? "Resume auto-scroll" : "Pause auto-scroll"
              }
              aria-pressed={userPaused}
              onClick={() => setUserPaused((v) => !v)}
            >
              {userPaused ? (
                <Play size={16} aria-hidden />
              ) : (
                <Pause size={16} aria-hidden />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="up-viewport" role="region" aria-label="Selected projects">
        <div
          className="up-track"
          data-paused={userPaused}
          style={
            {
              "--up-duration": `${projects.length * SECONDS_PER_CARD}s`,
            } as CSSProperties
          }
        >
          {track.map((p, i) => {
            const href = p.link && p.link !== "#" ? p.link : "/projects";
            // The second copy exists only so the strip has something to
            // slide onto — screen readers should only ever hear the first.
            const isDuplicate = i >= projects.length;
            return (
              <article
                key={i}
                className="up-card up-reveal"
                style={rise(i + 2)}
                aria-hidden={isDuplicate || undefined}
                tabIndex={isDuplicate ? -1 : undefined}
                inert={isDuplicate ? true : undefined}
              >
                <div className="up-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={`${p.title} — ${p.category}`}
                    width={800}
                    height={500}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="up-chip">{p.category}</span>
                  <span className="up-num" aria-hidden="true">
                    {pad((i % projects.length) + 1)}
                  </span>
                </div>

                <div className="up-body">
                  <h3 className="up-card-title">{p.title}</h3>
                  <p className="up-desc">{p.description}</p>
                  <ProjectLink href={href} title={p.title} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
