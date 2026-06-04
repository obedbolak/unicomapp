// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ProjectsCarousel from "@/components/ProjectsCarousel";
import TrainingSection from "@/components/TrainingSection";
import FAQSection from "@/components/FAQSection";

/* ============================================================================
   SCROLL PROGRESS BAR
   ============================================================================ */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, var(--color-primary), var(--color-primary-dark), var(--color-primary))",
      }}
    />
  );
}

/* ============================================================================
   BACK TO TOP
   ============================================================================ */

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // ✅ Throttled scroll listener - prevents excessive main thread work
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > 600);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full 
                     text-white transition-colors shadow-lg"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid var(--color-border)",
            backdropFilter: "blur(12px)",
          }}
        >
          <ChevronUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ============================================================================
   MAIN PAGE
   ============================================================================ */

export default function Page() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <HeroSection />
      <ProjectsCarousel />
      <TrainingSection />
      <FAQSection />
      <BackToTop />
    </main>
  );
}
