"use client";

import { useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useInView } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { programs, type Course } from "@/lib/data/trainings";
import "@/app/training-section.css";

/* ── Content ─────────────────────────────────────────────────────────────── */

// Three programs, pulled straight from the same data the real /trainings page
// uses — never a separate, hand-typed price list that can drift out of sync.
const FEATURED_SLUGS = [
  "frontend-development",
  "full-stack-engineering",
  "digital-marketing",
];

const featured = FEATURED_SLUGS.map((slug) =>
  programs.find((p) => p.slug === slug),
).filter((p): p is Course => Boolean(p));

const rise = (i: number) => ({ "--i": i }) as CSSProperties;

// Same query-string shape the /trainings page's own "View Details" links use,
// so the enroll form pre-fills identically whichever page sent the visitor.
function enrollHref(p: Course) {
  const params = new URLSearchParams({
    course: p.title,
    category: p.category,
    price: p.variants[0].price,
  });
  return `/trainings/enroll?${params.toString()}`;
}

/* ── Card ────────────────────────────────────────────────────────────────── */

function ProgramCard({ program, index }: { program: Course; index: number }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const cheapest = program.variants[0];

  return (
    <article
      className={`th-card th-reveal${program.featured ? " th-card--featured" : ""}`}
      style={rise(index)}
    >
      {program.featured && <span className="th-badge">Most Popular</span>}

      <div className="th-body">
        <div className="th-icon" aria-hidden="true">
          {program.icon}
        </div>
        <span className="th-tag">{program.badge}</span>
        <h3 className="th-card-title">{program.title}</h3>
        <p className="th-card-subtitle">{program.subtitle}</p>
        <div className="th-price">
          <span className="th-price-from">From</span>
          <span className="th-price-num">{cheapest.price}</span>
        </div>
        <p className="th-desc">{program.description}</p>
      </div>

      <button
        type="button"
        className="th-toggle"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{open ? "Hide details" : "View details"}</span>
        <ChevronDown size={16} aria-hidden />
      </button>

      <div id={detailsId} className="th-details" data-open={open}>
        {program.topics && (
          <>
            <div className="th-rule" />
            <div className="th-includes">
              <p className="th-section-label">{"What you'll learn"}</p>
              <ul className="th-topics">
                {program.topics.map((topic) => (
                  <li key={topic}>
                    <Check size={14} aria-hidden />
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="th-rule" />
        <div className="th-includes">
          <p className="th-section-label">Includes</p>
          <ul className="th-topics">
            <li>
              <Check size={14} aria-hidden />
              {cheapest.sessions}
            </li>
            <li>
              <Check size={14} aria-hidden />
              {cheapest.mentorship}
            </li>
            <li>
              <Check size={14} aria-hidden />
              {cheapest.outcome}
            </li>
            <li>
              <Check size={14} aria-hidden />
              Available as{" "}
              {program.variants.map((v) => v.duration).join(", ")}
            </li>
          </ul>
        </div>

        <div style={{ padding: "0 1.75rem 1.75rem" }}>
          <Link href={enrollHref(program)} className="th-cta">
            Enroll Now <ArrowUpRight size={15} aria-hidden />
          </Link>
        </div>

        <div className="th-focus" style={{ paddingBottom: "1.5rem" }}>
          <Link href={`/trainings/${program.slug}`}>
            See full curriculum →
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export default function TrainingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="th-section"
      data-in={revealed}
      aria-labelledby="th-heading"
    >
      <div className="th-head">
        <div className="th-reveal" style={rise(0)}>
          <span className="th-eyebrow">Training Programs</span>
          <h2 id="th-heading" className="th-title">
            Invest in your <span className="th-grad">future</span>
          </h2>
          <p className="th-sub">
            Structured, mentor-led programs that take you from beginner to
            professional. Pick the path that fits your goals.
          </p>
        </div>

        <Link href="/trainings" className="th-all th-reveal" style={rise(1)}>
          View all programs <ArrowRight size={16} aria-hidden />
        </Link>
      </div>

      <div className="th-grid">
        {featured.map((program, i) => (
          <ProgramCard key={program.slug} program={program} index={i + 2} />
        ))}
      </div>
    </section>
  );
}
