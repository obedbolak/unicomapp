"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { useInView } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services } from "@/app/services/data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin);
}

const carouselImages = [
  "https://pub-7fd63a2e70b04035b7d924eefdda4be9.r2.dev/media/d5d9b668-ca4a-4030-a249-30fb1d82a935-d1570c9e2eec347288e189dc96ace828-edited.png",
  "https://pub-7fd63a2e70b04035b7d924eefdda4be9.r2.dev/media/e4717b70-63a3-49a2-8008-0bbd3bbcb1fc-96e51f04-ad45-4560-87d7-4f7e8a7cb1ba_removalai_preview.png",
  "https://pub-7fd63a2e70b04035b7d924eefdda4be9.r2.dev/media/20273d53-ffcf-447b-9f37-736b2b69f70d-eeaca5bae7807810e402477eddbcba42-edited.png",
  "https://pub-7fd63a2e70b04035b7d924eefdda4be9.r2.dev/media/e4717b70-63a3-49a2-8008-0bbd3bbcb1fc-96e51f04-ad45-4560-87d7-4f7e8a7cb1ba_removalai_preview.png",
  "https://pub-7fd63a2e70b04035b7d924eefdda4be9.r2.dev/media/e4717b70-63a3-49a2-8008-0bbd3bbcb1fc-96e51f04-ad45-4560-87d7-4f7e8a7cb1ba_removalai_preview.png",
];

const slides = services.map((service, index) => ({
  ...service,
  image: carouselImages[index] || carouselImages[0],
}));

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2500;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function HeroSection() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayedSlide, setDisplayedSlide] = useState(0);

  const isTransitioningRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);
  const slideDuration = 6000;

  const startAutoplay = () => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    autoplayTimer.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, slideDuration);
  };

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, []);

  const goToSlide = (index: number) => {
    if (index === activeSlide || isTransitioningRef.current) return;
    setActiveSlide(index);
    startAutoplay();
  };

  // Handle slide transitions with a downward card swipe instead of a fade
  useEffect(() => {
    if (activeSlide === displayedSlide) return;
    isTransitioningRef.current = true;

    const currentNode = containerRef.current?.querySelector(
      `.hero-image-${displayedSlide}`,
    );
    const nextNode = containerRef.current?.querySelector(
      `.hero-image-${activeSlide}`,
    );

    gsap.to(textGroupRef.current, {
      opacity: 0,
      y: 24,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => {
        setDisplayedSlide(activeSlide);
      },
    });

    if (currentNode) {
      gsap.to(currentNode, {
        opacity: 0,
        y: 28,
        duration: 0.55,
        ease: "power2.in",
        zIndex: 0,
      });
    }

    if (nextNode) {
      gsap.fromTo(
        nextNode,
        { opacity: 0, y: -28, scale: 1.02 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power2.out",
          zIndex: 10,
        },
      );
    }

    // Restart progress bar
    gsap.fromTo(
      containerRef.current!.querySelectorAll(".slide-progress"),
      { width: "0%" },
      { width: "100%", duration: slideDuration / 1000, ease: "none" },
    );
  }, [activeSlide, displayedSlide]);

  // Handle Entrance / Typing effect after React renders the new text
  useEffect(() => {
    const revealText = () => {
      gsap.to(textGroupRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
      });

      if (headingRef.current) {
        gsap.from(headingRef.current, {
          text: "",
          duration: 0.9,
          ease: "none",
        });
      }

      if (descRef.current) {
        gsap.fromTo(
          descRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.6 },
        );
      }

      if (buttonsRef.current) {
        gsap.fromTo(
          buttonsRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, delay: 0.8 },
        );
      }
    };

    revealText();
    isTransitioningRef.current = false;
  }, [displayedSlide]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        gsap.set(textGroupRef.current, { opacity: 1, y: 0 });
        gsap.set(descRef.current, { opacity: 1, y: 0 });
        gsap.set(buttonsRef.current, { opacity: 1, y: 0 });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const currentSlide = slides[displayedSlide];

  return (
    <section
      className="section-hero relative overflow-hidden"
      ref={containerRef}
    >
      {/* Background visual accents */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ zIndex: 0 }}
      >
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--color-primary)] rounded-full blur-[120px] mix-blend-screen opacity-30 transform translate-x-1/3 -translate-y-1/3"></div>
      </div>

      {/* Diagonal grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(-45deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          zIndex: 0,
        }}
      ></div>

      <div className="container-7xl relative" style={{ zIndex: 1 }}>
        <div className="hero-carousel-layout">
          {/* ── LEFT: Text content ── */}
          <div className="hero-content-col">
            <div ref={textGroupRef} className="hero-text-group mt-8 lg:mt-0">
              <div className="mb-4">
                <span
                  ref={tagRef}
                  className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full backdrop-blur-md"
                  style={{
                    color: "var(--color-text)",
                    background: "var(--color-surface-primary)",
                    border: "1px solid var(--color-border-primary)",
                  }}
                >
                  <span className="tag-pulse-dot" />
                  {currentSlide.tag}
                </span>
              </div>

              <h1
                ref={headingRef}
                className="hero-heading"
                style={{ color: "var(--color-text)", marginBottom: "1.5rem" }}
              >
                {currentSlide.title}
              </h1>

              <p
                ref={descRef}
                className="hero-subtitle"
                style={{
                  margin: 0,
                  marginBottom: "2.5rem",
                  maxWidth: "40rem",
                  fontSize: "1.125rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {currentSlide.desc}
              </p>

              <div
                ref={buttonsRef}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push("/contact")}
                >
                  Get in Touch <ArrowRight className="ml-2" size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push(`/services/${currentSlide.slug}`)}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
          {/* end hero-content-col */}

          {/* ── RIGHT: Image container ── */}
          <div className="hero-image-col mt-8 lg:mt-0 flex-col">
            <div
              className="hero-image-wrapper relative w-full"
              style={{ aspectRatio: "4/3", position: "relative" }}
            >
              <div className="hero-image-glow" />
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className={`hero-image-${i} hero-image-slide absolute inset-0 w-full h-full`}
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="hero-image-figure"
                  />
                </div>
              ))}
            </div>

            {/* Slide Controls Below Image */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className="relative overflow-hidden cursor-pointer flex items-center justify-center"
                  style={{
                    width: i === activeSlide ? "12px" : "8px",
                    height: i === activeSlide ? "12px" : "8px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    transition: "width 0.4s ease",
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  {i === activeSlide && (
                    <div className="slide-progress absolute top-0 left-0 h-full w-full bg-[var(--color-text)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats Block */}
      <div className="stats-floating-card">
        <div className="stats-floating-inner">
          <div className="stat-col">
            <div className="stats-number">
              <span>
                <AnimatedCounter target={6} />.
                <AnimatedCounter target={7} suffix="k" />
              </span>
            </div>
            <span className="stats-label">Active Projects</span>
          </div>

          <div className="stats-divider" aria-hidden="true"></div>

          <div className="stat-col">
            <div className="stats-number stats-rating">
              <Star
                size={18}
                fill="var(--color-primary)"
                className="text-[var(--color-primary)]"
              />
              <span>
                <AnimatedCounter target={4} />.<AnimatedCounter target={8} />
              </span>
            </div>
            <span className="stats-label">1.6k Reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
