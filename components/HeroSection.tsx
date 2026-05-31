"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowDown, Clock, Zap, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type Page = "home" | "services" | "contact";

/* ============================================================================
   ANIMATED COUNTER
   ============================================================================ */

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

/* ============================================================================
   HERO SECTION
   ============================================================================ */

export default function HeroSection({
  onNavigate,
}: {
  onNavigate: (page: Page) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="section-hero relative">
      <div className="container-7xl">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-md backdrop-blur-sm"
            style={{ color: "var(--color-blue-light)" }}
          >
            UnicomTeam • From Ideas to Reality
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="hero-heading" style={{ color: "var(--color-text)" }}>
            Digital Solutions.
            <span className="block mt-1 gradient-text">
              Empowering Business.
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="hero-subtitle"
        >
          We are shaping a next-generation ecosystem for our upcoming
          deployment. Next-tier software engineering designed explicitly for
          commercial scale.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="btn-group"
        >
          <Button
            variant="primary"
            size="md"
            icon={<Zap size={18} />}
            onClick={() => onNavigate("contact")}
          >
            Get in touch
          </Button>

          <Button
            variant="ghost"
            size="md"
            icon={<ArrowDown size={16} />}
            iconPosition="right"
            onClick={() => onNavigate("services")}
          >
            Our Services
          </Button>
        </motion.div>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.85 }}
        className="stats-container"
      >
        <div className="stats-content">
          {[
            { icon: Target, value: 50, suffix: "+", label: "Projects" },
            { icon: Users, value: 30, suffix: "+", label: "Clients" },
            { icon: Clock, value: 5, suffix: "y", label: "Experience" },
          ].map((stat) => (
            <div key={stat.label} className="stat-item">
              <stat.icon className="stat-icon" />
              <span className="stat-value">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
