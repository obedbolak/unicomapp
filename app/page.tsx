// app/page.tsx
"use client";

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { ChevronUp } from "lucide-react";

import Header from "@/components/header";
import HeroSection from "@/components/HeroSection";

// ✅ ALL heavy pages loaded lazily - not in initial bundle
const ServicesPage = lazy(() => import("@/components/ServicesPage"));
const ContactPage = lazy(() => import("@/components/ContactPage"));
const AboutPage = lazy(() => import("@/components/aboutPage"));
const ProjectsPage = lazy(() => import("@/components/ourProjects"));

export type Page = "home" | "about" | "services" | "projects" | "contact";

/* ============================================================================
   3D CANVAS - Deferred until after page is interactive
   ============================================================================ */

// Lazy import the entire 3D scene - keeps Three.js OUT of initial bundle
const Scene3DCanvas = lazy(() => import("@/components/Scene3DCanvas"));

function DeferredBackground({
  opacity,
}: {
  opacity: import("framer-motion").MotionValue<number>;
}) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // ✅ Wait until browser is idle THEN load 3D scene
    // This ensures FCP and TTI are not blocked
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(
        () => setShouldRender(true),
        { timeout: 4000 }, // Force load after 4s max
      );
      return () => cancelIdleCallback(id);
    } else {
      // Fallback for Safari
      const t = setTimeout(() => setShouldRender(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed inset-0 z-0 pointer-events-none"
    >
      {/* Static gradient shown immediately - zero JS cost */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,31,84,0.4) 0%, transparent 70%)",
        }}
      />

      {/* 3D scene only loads after idle */}
      {shouldRender && (
        <Suspense fallback={null}>
          <Scene3DCanvas />
        </Suspense>
      )}
    </motion.div>
  );
}

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
   PAGE TRANSITION VARIANTS
   ============================================================================ */

const pageVariants: import("framer-motion").Variants = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

/* ============================================================================
   PAGE CONTENT WRAPPER - Suspense boundary per page
   ============================================================================ */

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-8 h-8 border-2 border-white/20 border-t-white/80 
                      rounded-full animate-spin"
      />
    </div>
  );
}

/* ============================================================================
   MAIN PAGE
   ============================================================================ */

export default function Page() {
  const [activePage, setActivePage] = useState<Page>("home");
  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 500], [1, 0.6]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{
        background: "var(--gradient-bg)",
        isolation: "isolate",
      }}
    >
      <ScrollProgress />

      {/* ✅ 3D background deferred until browser is idle */}
      <DeferredBackground opacity={backgroundOpacity} />

      {/* Ambient glows - pure CSS, zero JS cost */}
      <div
        className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] 
                   rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(255,59,0,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed top-[25%] right-[5%] w-[700px] h-[500px] 
                   rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,102,255,0.1) 0%, transparent 70%)",
        }}
      />

      <Header activePage={activePage} onNavigate={setActivePage} />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {activePage === "home" && (
            <motion.div
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* ✅ HeroSection is lightweight - loads immediately */}
              <HeroSection onNavigate={setActivePage} />
            </motion.div>
          )}

          {activePage === "services" && (
            <motion.div
              key="services"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Suspense fallback={<PageFallback />}>
                <ServicesPage />
              </Suspense>
            </motion.div>
          )}

          {activePage === "contact" && (
            <motion.div
              key="contact"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Suspense fallback={<PageFallback />}>
                <ContactPage />
              </Suspense>
            </motion.div>
          )}

          {activePage === "about" && (
            <motion.div
              key="about"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Suspense fallback={<PageFallback />}>
                <AboutPage />
              </Suspense>
            </motion.div>
          )}

          {activePage === "projects" && (
            <motion.div
              key="projects"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Suspense fallback={<PageFallback />}>
                <ProjectsPage />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BackToTop />
    </main>
  );
}
