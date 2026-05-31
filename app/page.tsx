"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, Stars, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ChevronUp } from "lucide-react";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import Header from "@/components/header";
import HeroSection from "@/components/HeroSection";
import ServicesPage from "@/components/ServicesPage";
import ContactPage from "@/components/ContactPage";
import AboutPage from "@/components/aboutPage";
import ProjectsPage from "@/components/ourProjects";

// Change this line near the top:
export type Page = "home" | "about" | "services" | "projects" | "contact";
/* ============================================================================
   3D SCENE COMPONENTS
   ============================================================================ */

function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { viewport, mouse } = useThree();

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.x = mouse.x * viewport.width * 0.6;
      lightRef.current.position.y = mouse.y * viewport.height * 0.6;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      intensity={4}
      color="#FF8C00"
      distance={20}
      decay={2}
    />
  );
}

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  const cubePositions: [number, number, number][] = [
    [3, -4, -4],
    [-4, 3, -5],
    [6, 0, -7],
    [-3, -5, -3],
  ];

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={3}>
        <mesh position={[5, 2, -8]}>
          <icosahedronGeometry args={[1.8, 0]} />
          <meshStandardMaterial
            color="#FF8C00"
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={3} floatIntensity={4}>
        <mesh position={[-5, -3, -6]}>
          <torusKnotGeometry args={[1.2, 0.4, 128, 16]} />
          <meshStandardMaterial
            color="#3385ff"
            wireframe
            transparent
            opacity={0.2}
          />
        </mesh>
      </Float>
      <Float speed={1} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[0, 4, -12]}>
          <sphereGeometry args={[3, 64, 64]} />
          <MeshDistortMaterial
            color="#001f54"
            distort={0.5}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>
      {cubePositions.map((pos, i) => (
        <Float
          key={i}
          speed={2 + i * 0.5}
          rotationIntensity={2}
          floatIntensity={2}
        >
          <mesh position={pos}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#FF8C00" : "#0066ff"}
              emissive={i % 2 === 0 ? "#FF4500" : "#0044cc"}
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#3385ff"
      />
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#FF8C00" />
      <MouseLight />
      <Stars
        radius={120}
        depth={60}
        count={4000}
        factor={5}
        saturation={0}
        fade
        speed={1.2}
      />
      <FloatingShapes />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.6}
          height={300}
        />
      </EffectComposer>
    </>
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
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
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

      {/* ── Fixed 3D canvas — always covers full viewport ── */}
      {/*
        NOTE: We do NOT apply a Framer Motion `y` transform here.
        Applying transform to a `position:fixed` element creates a new
        stacking context in most browsers, causing the canvas to lose its
        fixed positioning and collapse to 0 height.
        The subtle parallax opacity is safe; positional parallax is dropped.
      */}
      <motion.div
        style={{ opacity: backgroundOpacity }}
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0, 12], fov: 50 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "transparent",
          }}
        >
          <Scene3D />
        </Canvas>
      </motion.div>

      {/* Ambient glows — fixed, behind content */}
      <div
        className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(255,59,0,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed top-[25%] right-[5%] w-[700px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,102,255,0.1) 0%, transparent 70%)",
        }}
      />

      {/* Header — sits above 3D canvas */}
      <Header activePage={activePage} onNavigate={setActivePage} />

      {/* Page content — z-10 ensures it renders above the z-0 canvas */}
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
              <ServicesPage />
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
              <ContactPage />
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
              <AboutPage />
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
              <ProjectsPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BackToTop />
    </main>
  );
}
