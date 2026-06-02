"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { ChevronUp } from "lucide-react";
import dynamic from "next/dynamic";
import Header from "@/components/header";
import Scene3DOptimized from "@/components/Scene3DOptimized";

// Code-split components - only load when scrolled into view
const HeroSection = dynamic(() => import("@/components/HeroSection"), {
  loading: () => (
    <div className="h-[600px] bg-gradient-to-b from-slate-900 to-slate-950" />
  ),
  ssr: true,
});

const ServicesPage = dynamic(() => import("@/components/ServicesPage"), {
  loading: () => <div className="h-[600px] bg-slate-950" />,
  ssr: true,
});

const AboutPage = dynamic(() => import("@/components/aboutPage"), {
  loading: () => <div className="h-[600px] bg-slate-950" />,
  ssr: true,
});

const ProjectsPage = dynamic(() => import("@/components/ourProjects"), {
  loading: () => <div className="h-[600px] bg-slate-950" />,
  ssr: true,
});

const ContactPage = dynamic(() => import("@/components/ContactPage"), {
  loading: () => <div className="h-[600px] bg-slate-950" />,
  ssr: true,
});

export type Page = "home" | "about" | "services" | "projects" | "contact";

/* ============================================================================
   OPTIMIZED SCROLL PROGRESS WITH DEBOUNCING
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
   OPTIMIZED: BACK TO TOP WITH DEBOUNCED SCROLL LISTENER
   ============================================================================ */

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Clear previous timer
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      // Debounce scroll handler - only run every 150ms
      debounceTimer.current = setTimeout(() => {
        setVisible(window.scrollY > 600);
      }, 150);
    };

    // Use passive listener to not block scrolling
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          onClick={handleScrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full text-white transition-colors shadow-lg"
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
   PAGE TRANSITION VARIANTS
   ============================================================================ */

const pageVariants = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

/* ============================================================================
   MAIN PAGE
   ============================================================================ */

export default function Page() {
  const [activePage, setActivePage] = useState<Page>("home");

  const handleNavigate = (page: Page) => {
    setActivePage(page);
  };

  return (
    <div className="app">
      <Header activePage={activePage} onNavigate={handleNavigate} />
      <ScrollProgress />

      {/* 3D Canvas - Optimized */}
      <div className="relative w-full h-screen top-0 left-0">
        <Canvas
          dpr={[1, 1.5]} // Cap pixel ratio at 1.5 instead of 2
          gl={{
            antialias: false, // Disable antialiasing for better performance
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 0, 15], fov: 75 }}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Scene3DOptimized />
        </Canvas>
      </div>

      {/* Page Content with Motion */}
      <motion.div
        key={activePage}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative z-10"
      >
        {activePage === "home" && (
          <HeroSection onNavigate={handleNavigate} />
        )}
        {activePage === "services" && <ServicesPage />}
        {activePage === "about" && <AboutPage />}
        {activePage === "projects" && <ProjectsPage />}
        {activePage === "contact" && <ContactPage />}
      </motion.div>

      <BackToTop />
    </div>
  );
}
