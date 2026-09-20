"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Pause, Play, Star } from "lucide-react";
import { services } from "@/app/services/data";
import "@/app/hero.css";

/* ── Content ─────────────────────────────────────────────────────────────── */

const carouselImages = [
  "https://pub-7fd63a2e70b04035b7d924eefdda4be9.r2.dev/media/d5d9b668-ca4a-4030-a249-30fb1d82a935-d1570c9e2eec347288e189dc96ace828-edited.png",
  "https://pub-7fd63a2e70b04035b7d924eefdda4be9.r2.dev/media/e4717b70-63a3-49a2-8008-0bbd3bbcb1fc-96e51f04-ad45-4560-87d7-4f7e8a7cb1ba_removalai_preview.png",
  "https://pub-7fd63a2e70b04035b7d924eefdda4be9.r2.dev/media/20273d53-ffcf-447b-9f37-736b2b69f70d-eeaca5bae7807810e402477eddbcba42-edited.png",
  "https://pub-7fd63a2e70b04035b7d924eefdda4be9.r2.dev/media/e4717b70-63a3-49a2-8008-0bbd3bbcb1fc-96e51f04-ad45-4560-87d7-4f7e8a7cb1ba_removalai_preview.png",
  "https://pub-7fd63a2e70b04035b7d924eefdda4be9.r2.dev/media/e4717b70-63a3-49a2-8008-0bbd3bbcb1fc-96e51f04-ad45-4560-87d7-4f7e8a7cb1ba_removalai_preview.png",
];

// Each service gets its own light colour. Some of the photos repeat, so the
// colour is what makes every slide feel distinct.
const ACCENTS = ["#3385ff", "#ff8c00", "#4da3ff", "#ff5a2b", "#ffb300"];

// How long each service stays on screen. It is passed to the progress bar's
// animation-duration, and that animation is the slideshow timer.
const SLIDE_MS = 6000;

const slides = services.map((service, index) => ({
  ...service,
  image: carouselImages[index] ?? carouselImages[0],
  accent: ACCENTS[index % ACCENTS.length],
}));

const pad = (n: number) => String(n).padStart(2, "0");
const rise = (i: number) => ({ "--i": i }) as CSSProperties;

/* ── Counter ─────────────────────────────────────────────────────────────── */

function Counter({
  to,
  decimals = 0,
  suffix = "",
  duration = 1800,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setValue(to * (1 - Math.pow(1 - p, 3))); // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to, duration]);

  // With reduced motion the number is simply shown, no counting up.
  const shown = reduce && inView ? to : value;

  return (
    <span ref={ref}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────────── */

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [interacted, setInteracted] = useState(false);

  const rootRef = useRef<HTMLElement>(null);
  const onScreen = useInView(rootRef, { amount: 0.25 });
  const reduce = useReducedMotion();

  // The slideshow holds still while the visitor is reading or pointing at it,
  // while it is scrolled out of view, or when they press pause.
  const paused = userPaused || hovering || keyboardFocus || !onScreen;

  const next = useCallback(
    () => setActive((i) => (i + 1) % slides.length),
    [],
  );

  const select = (i: number) => {
    setActive(i);
    setInteracted(true);
  };

  /* Gentle 3D tilt that follows the pointer over the visual */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.6 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-7, 7]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const shiftX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const shiftY = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  const onStageMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onStageLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const current = slides[active];
  const CurrentIcon = current.icon;

  return (
    <section
      ref={rootRef}
      className="uh-hero"
      data-paused={paused}
      aria-label="UnicomTeam introduction"
      style={{ "--uh-accent": current.accent } as CSSProperties}
    >
      {/* Background light — decorative */}
      <div className="uh-bg" aria-hidden="true">
        <span className="uh-aurora uh-aurora--a" />
        <span className="uh-aurora uh-aurora--b" />
        <span className="uh-grid" />
      </div>

      <div className="uh-shell">
        <div className="uh-layout">
          {/* ── Copy ── */}
          <div className="uh-copy">
            <p className="uh-eyebrow uh-rise" style={rise(0)}>
              <span className="uh-dot" aria-hidden="true" />
              Your distributed product team
            </p>

            <h1 className="uh-title uh-rise" style={rise(1)}>
              We craft software{" "}
              <span className="uh-gradient">teams love.</span>
            </h1>

            <p className="uh-lead uh-rise" style={rise(2)}>
              Elite strategy, high-fidelity design and bespoke engineering —
              one seamless team building systems that scale.
            </p>

            {/* Every service shares one grid cell, so the height never jumps */}
            <div className="uh-spot uh-rise" style={rise(3)}>
              {slides.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.slug}
                    className="uh-spot-item"
                    data-active={i === active}
                    aria-hidden={i !== active}
                  >
                    <div className="uh-spot-head">
                      <span className="uh-spot-icon" aria-hidden="true">
                        <Icon size={20} />
                      </span>
                      <div>
                        <p className="uh-spot-tag">{s.tag}</p>
                        <h2 className="uh-spot-title">{s.title}</h2>
                      </div>
                    </div>
                    <p className="uh-spot-desc">{s.desc}</p>
                    <Link
                      href={`/services/${s.slug}`}
                      className="uh-link"
                      tabIndex={i === active ? 0 : -1}
                    >
                      Explore {s.title} <ArrowRight size={16} aria-hidden />
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="uh-cta uh-rise" style={rise(4)}>
              <Link href="/contact" className="uh-btn uh-btn--primary">
                Start a project <ArrowRight size={18} aria-hidden />
              </Link>
              <Link href="/projects" className="uh-btn uh-btn--ghost">
                See our work
              </Link>
            </div>

            <div className="uh-proof uh-rise" style={rise(5)}>
              <div className="uh-proof-item">
                <span className="uh-proof-num">
                  <Counter to={6.7} decimals={1} suffix="k" />
                </span>
                <span className="uh-proof-label">Active projects</span>
              </div>
              <span className="uh-proof-sep" aria-hidden="true" />
              <div className="uh-proof-item">
                <span className="uh-proof-num uh-proof-num--rating">
                  <Star size={22} fill="currentColor" aria-hidden />
                  <Counter to={4.8} decimals={1} />
                </span>
                <span className="uh-proof-label">1.6k reviews</span>
              </div>
            </div>
          </div>

          {/* ── Visual ── */}
          <div
            className="uh-visual uh-rise"
            style={rise(3)}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            onFocus={(e) => {
              // Only keyboard focus pauses; a mouse click leaves focus on the
              // tab, and that must not freeze the slideshow indefinitely.
              if (e.target.matches(":focus-visible")) setKeyboardFocus(true);
            }}
            onBlur={() => setKeyboardFocus(false)}
          >
            <motion.div
              className="uh-stage"
              onPointerMove={onStageMove}
              onPointerLeave={onStageLeave}
              style={{ rotateX, rotateY, transformPerspective: 1100 }}
            >
              <div className="uh-orbit uh-orbit--1" aria-hidden="true" />
              <div className="uh-orbit uh-orbit--2" aria-hidden="true" />
              <div className="uh-glow" aria-hidden="true" />
              <div className="uh-floor" aria-hidden="true" />

              <motion.div
                className="uh-layers"
                style={{ x: shiftX, y: shiftY }}
              >
                {slides.map((s, i) => (
                  <div
                    key={s.slug}
                    className="uh-slide"
                    data-active={i === active}
                    aria-hidden={i !== active}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={s.title}
                      width={800}
                      height={800}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      decoding="async"
                      draggable={false}
                      className="uh-img"
                    />
                  </div>
                ))}
              </motion.div>

              <div className="uh-chip uh-chip--service" aria-hidden="true">
                <span key={active} className="uh-chip-body">
                  <span className="uh-chip-icon">
                    <CurrentIcon size={18} />
                  </span>
                  <span className="uh-chip-text">
                    <strong>{current.title}</strong>
                    <small>{current.tag}</small>
                  </span>
                </span>
              </div>

              <div className="uh-chip uh-chip--index" aria-hidden="true">
                <strong key={active}>{pad(active + 1)}</strong>
                <span>/ {pad(slides.length)}</span>
              </div>
            </motion.div>

            <div className="uh-controls">
              <div
                className="uh-rail"
                role="group"
                aria-label="Choose a featured service"
              >
                {slides.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      className="uh-tab"
                      aria-current={i === active ? "true" : undefined}
                      onClick={() => select(i)}
                    >
                      <Icon size={16} aria-hidden />
                      <span>{s.tag}</span>
                      <span className="uh-tab-track" aria-hidden="true">
                        {i === active && (
                          <span
                            key={active}
                            className="uh-tab-progress"
                            style={{ animationDuration: `${SLIDE_MS}ms` }}
                            onAnimationEnd={next}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="uh-pause"
                aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                aria-pressed={userPaused}
                onClick={() => setUserPaused((v) => !v)}
              >
                {userPaused ? (
                  <Play size={16} aria-hidden />
                ) : (
                  <Pause size={16} aria-hidden />
                )}
              </button>
            </div>

            <p className="uh-sr" aria-live="polite">
              {interacted ? `Showing ${current.title}` : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
