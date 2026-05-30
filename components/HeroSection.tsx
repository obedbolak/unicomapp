"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Text, Stars } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ─── Color Palette ───────────────────────────────────────────────────────── */
const C = {
  navy: "#0A1A4E",
  deep: "#0D2060",
  blue: "#1D4ED8",
  sky: "#3B82F6",
  orange: "#F97316",
  amber: "#FBBF24",
  white: "#FFFFFF",
  slate: "#94A3B8",
};

/* ─── Animated wave mesh ──────────────────────────────────────────────────── */
function WavePlane({
  color,
  z = 0,
  speed = 0.4,
  amplitude = 0.3,
}: {
  color: string;
  z?: number;
  speed?: number;
  amplitude?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const geo = useMemo(() => new THREE.PlaneGeometry(16, 6, 100, 40), []);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(
        i,
        Math.sin(x * 0.5 + t) * amplitude +
          Math.cos(y * 0.7 + t * 1.1) * amplitude * 0.5,
      );
    }
    pos.needsUpdate = true;

    // Subtle pulse on opacity
    if (materialRef.current) {
      materialRef.current.opacity = 0.15 + Math.sin(t * 0.5) * 0.03;
    }
  });

  return (
    <mesh
      ref={mesh}
      geometry={geo}
      position={[0, 0, z]}
      rotation={[-0.2, 0, 0]}
    >
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        wireframe={false}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

/* ─── Floating orb with glow ──────────────────────────────────────────────── */
function Orb({
  position,
  color,
  scale = 1,
  distort = 0.4,
  speed = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  distort?: number;
  speed?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.x = clock.getElapsedTime() * 0.2;
      mesh.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={mesh} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={speed * 2}
          transparent
          opacity={0.65}
          roughness={0.1}
          metalness={0.5}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Glow halo */}
      <mesh position={position} scale={scale * 1.4}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
    </Float>
  );
}

/* ─── Particle field with depth ───────────────────────────────────────────── */
function Particles({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const palette = [
      new THREE.Color(C.orange),
      new THREE.Color(C.sky),
      new THREE.Color(C.white),
      new THREE.Color(C.amber),
    ];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = Math.random() * 0.06 + 0.02;
    }
    return { positions, colors, sizes };
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Transparent background fix ──────────────────────────────────────────── */
function TransparentBackground() {
  const { gl } = useThree();
  useFrame(() => {
    gl.setClearColor(0x000000, 0);
  });
  return null;
}

/* ─── 3D Scene ────────────────────────────────────────────────────────────── */
function Scene({ onReady }: { onReady: () => void }) {
  const firedRef = useRef(false);

  return (
    <Canvas
      frameloop="always"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 55 }}
      gl={{
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      }}
      style={{ width: "100%", height: "100%", display: "block" }}
      onCreated={({ scene, gl }) => {
        scene.background = null;
        gl.setClearColor(new THREE.Color(0x000000), 0);

        let frames = 0;
        const waitFrames = () => {
          frames++;
          if (frames < 3) {
            requestAnimationFrame(waitFrames);
            return;
          }
          if (!firedRef.current) {
            firedRef.current = true;
            onReady();
          }
        };
        requestAnimationFrame(waitFrames);
      }}
    >
      <TransparentBackground />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} color="#8BA3E8" />
      <pointLight position={[-4, 2, 2]} intensity={1.8} color={C.orange} />
      <pointLight position={[4, -2, 1]} intensity={1.2} color={C.sky} />
      <pointLight position={[0, 3, -3]} intensity={0.8} color={C.amber} />

      <Stars
        radius={80}
        depth={40}
        count={400}
        factor={3}
        saturation={0}
        fade
        speed={1}
      />

      <WavePlane color={C.blue} z={-2} speed={0.25} amplitude={0.4} />
      <WavePlane color={C.orange} z={-3} speed={0.18} amplitude={0.3} />
      <WavePlane color="#1E3A8A" z={-1} speed={0.35} amplitude={0.25} />

      <Orb
        position={[-6, 2, -1.5]}
        color={C.blue}
        scale={1.6}
        distort={0.5}
        speed={0.7}
      />
      <Orb
        position={[6, -1.5, -2.5]}
        color={C.orange}
        scale={1.3}
        distort={0.35}
        speed={1.1}
      />
      <Orb
        position={[0, -3, -3.5]}
        color="#1E3A8A"
        scale={2}
        distort={0.28}
        speed={0.5}
      />
      <Orb
        position={[-3, -2, 0.5]}
        color={C.amber}
        scale={0.9}
        distort={0.45}
        speed={1.3}
      />

      <Particles count={220} />
    </Canvas>
  );
}

/* ─── Social icons ────────────────────────────────────────────────────────── */
const SocialIcon = ({
  letter,
  color,
  href,
}: {
  letter: string;
  color: string;
  href?: string;
}) => (
  <motion.a
    href={href || "#"}
    whileHover={{ y: -5, scale: 1.12, rotate: 5 }}
    whileTap={{ scale: 0.95 }}
    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg cursor-pointer transition-all duration-300"
    style={{
      background: color.includes("gradient") ? color : color,
      boxShadow: `0 4px 15px ${color}40`,
    }}
  >
    {letter}
  </motion.a>
);

/* ─── Service badge ───────────────────────────────────────────────────────── */
const ServiceBadge = ({
  icon,
  label,
  delay,
}: {
  icon: string;
  label: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, scale: 1.05 }}
    className="flex flex-col items-center gap-2 text-white/85 text-[0.65rem] font-semibold tracking-wide"
  >
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/25 flex items-center justify-center text-xl shadow-lg">
      {icon}
    </div>
    <span className="text-center leading-tight max-w-[90px]">{label}</span>
  </motion.div>
);

/* ─── CTA Button ──────────────────────────────────────────────────────────── */
function CTAButton({
  children,
  primary,
  delay,
}: {
  children: React.ReactNode;
  primary?: boolean;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`
        px-7 py-3 rounded-full font-bold text-sm tracking-wide shadow-xl transition-all duration-300
        ${
          primary
            ? "bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white"
            : "bg-white/10 hover:bg-white/15 text-white border border-white/30 backdrop-blur-md"
        }
      `}
      style={{
        boxShadow: primary
          ? "0 8px 30px rgba(249, 115, 22, 0.4)"
          : "0 4px 20px rgba(255,255,255,0.1)",
      }}
    >
      {children}
    </motion.button>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
function StatCard({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col"
    >
      <div
        className="text-2xl md:text-3xl font-black tracking-tight"
        style={{ color: C.orange }}
      >
        {value}
      </div>
      <div className="text-[0.6rem] text-white/50 font-semibold tracking-[0.15em] uppercase mt-1">
        {label}
      </div>
    </motion.div>
  );
}

/* ─── Device Mockup ───────────────────────────────────────────────────────── */
function DeviceMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50, rotateY: -15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-72 h-48 perspective-1000"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Laptop */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-64 h-36 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-2xl border border-gray-600 overflow-hidden shadow-2xl"
        style={{ transform: "rotateY(-5deg)" }}
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-3 flex flex-col gap-2">
          {/* Browser bar */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/70" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <div className="w-2 h-2 rounded-full bg-green-500/70" />
            <div className="flex-1 h-1.5 bg-white/10 rounded-full ml-2" />
          </div>
          {/* Content */}
          <div className="flex gap-2 flex-1">
            <div className="w-14 bg-white/10 rounded-lg p-1.5 space-y-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-1 bg-white/20 rounded" />
              ))}
            </div>
            <div className="flex-1 bg-white/5 rounded-lg p-2">
              <div className="h-16 bg-gradient-to-tr from-orange-500/50 via-blue-400/30 to-purple-500/40 rounded-lg" />
            </div>
          </div>
        </div>
        {/* Laptop base */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-72 h-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-lg border-t border-gray-600" />
      </motion.div>

      {/* Phone */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute top-2 -right-2 w-24 h-40 bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-gray-600 overflow-hidden shadow-xl"
        style={{ transform: "rotateY(5deg) rotateZ(3deg)" }}
      >
        <div className="w-full h-full bg-gradient-to-b from-blue-800 via-blue-700 to-blue-600 p-2 flex flex-col gap-2">
          <div className="h-1 w-12 bg-white/20 rounded-full mx-auto" />
          <div className="flex-1 bg-white/10 rounded-xl p-2 space-y-1.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-1.5 bg-white/20 rounded" />
            ))}
          </div>
          <div className="h-6 bg-gradient-to-r from-orange-500/60 to-orange-400/60 rounded-xl" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Hero ───────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const [sceneReady, setSceneReady] = useState(false);
  const handleReady = useCallback(() => setSceneReady(true), []);

  return (
    <section
      className="relative w-full min-h-[600px] lg:min-h-[750px] overflow-hidden"
      style={{
        background: C.navy,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Font imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; }
        }
      `}</style>

      {/* 3D animated background */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{ opacity: sceneReady ? 1 : 0 }}
      >
        <Scene onReady={handleReady} />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0A1A4E]/90 via-[#0D2060]/70 to-[#0A1A4E]/40" />

      {/* Subtle gradient sweep */}
      <div
        className="absolute z-[1] opacity-20"
        style={{
          top: "20%",
          left: "-10%",
          width: "60%",
          height: "60%",
          background: `radial-gradient(ellipse, ${C.orange}30 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Top navigation bar */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md px-6 lg:px-10 py-4 flex items-center justify-between border-b border-white/20 shadow-lg">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 relative">
            <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-lg">
              <defs>
                <linearGradient
                  id="logoGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={C.blue} />
                  <stop offset="50%" stopColor={C.orange} />
                  <stop offset="100%" stopColor={C.amber} />
                </linearGradient>
              </defs>
              <path
                d="M6 12 Q6 34 22 34 Q38 34 38 12 L38 6 L26 6 L26 26 Q26 30 22 30 Q18 30 18 26 L18 6 Z"
                fill="url(#logoGrad)"
              />
            </svg>
          </div>
          <div>
            <div className="text-lg font-black leading-none tracking-tight">
              <span style={{ color: C.navy }}>Unicom</span>
              <span style={{ color: C.orange }}>Team</span>
              <sup className="text-[8px] text-gray-400 ml-0.5 font-medium">
                ™
              </sup>
            </div>
            <div className="text-[9px] tracking-[0.2em] text-gray-500 uppercase font-semibold">
              Software Development Company
            </div>
          </div>
        </motion.div>

        {/* Nav links */}
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:flex items-center gap-6"
        >
          {["Services", "Portfolio", "About", "Contact"].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              whileHover={{ y: -2, color: C.orange }}
              className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors"
            >
              {item}
            </motion.a>
          ))}
        </motion.nav>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="hidden lg:block px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-sm font-bold rounded-full shadow-lg"
          style={{ boxShadow: "0 4px 20px rgba(249, 115, 22, 0.35)" }}
        >
          Get Quote
        </motion.button>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-16 py-12 lg:py-16 gap-10 lg:gap-16">
        {/* Left — devices + social */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-6 flex-shrink-0"
        >
          {/* Social icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex gap-2.5"
          >
            <SocialIcon letter="f" color="#1877F2" />
            <SocialIcon letter="in" color="#0A66C2" />
            <SocialIcon letter="P" color="#E60023" />
            <SocialIcon
              letter="📸"
              color="linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"
            />
          </motion.div>

          {/* Device mockup */}
          <DeviceMockup />

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex gap-8 mt-2"
          >
            <StatCard value="150+" label="Projects" delay={0.9} />
            <StatCard value="98%" label="Satisfaction" delay={1} />
            <StatCard value="24/7" label="Support" delay={1.1} />
          </motion.div>
        </motion.div>

        {/* Center — headline */}
        <div className="flex-1 text-center lg:text-left max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/75 text-base lg:text-lg font-medium mb-3 tracking-wide"
          >
            Software & Digital Marketing Solutions
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6"
          >
            <span className="text-white">Empowering Your</span>
            <br />
            <span
              className="inline-block"
              style={{
                background: `linear-gradient(90deg, ${C.orange}, ${C.amber}, ${C.orange})`,
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientFlow 3s ease infinite",
              }}
            >
              Business Online
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-white/60 text-sm lg:text-base leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
          >
            We build cutting-edge digital solutions that drive growth, enhance
            user experience, and transform your vision into reality. From web
            development to strategic marketing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex gap-4 justify-center lg:justify-start flex-wrap"
          >
            <CTAButton primary delay={1}>
              Get Started →
            </CTAButton>
            <CTAButton delay={1.1}>View Portfolio</CTAButton>
          </motion.div>
        </div>

        {/* Right — team placeholder */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="hidden xl:flex items-end justify-center w-64 h-56 relative"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/15 to-orange-500/10 border border-white/15 backdrop-blur-md shadow-2xl" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-blue-500 flex items-center justify-center text-3xl shadow-xl"
              style={{ boxShadow: "0 8px 30px rgba(249, 115, 22, 0.4)" }}
            >
              👥
            </motion.div>
            <div className="text-white/65 text-xs text-center leading-relaxed">
              Expert Team Ready
              <br />
              to Transform Your Business
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 border border-white/25 backdrop-blur-md">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/85 text-xs font-semibold tracking-wide">
                Available Now
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom service bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="relative z-10 border-t border-white/10 bg-[#0A1A4E]/85 backdrop-blur-md px-6 lg:px-16 py-6 lg:py-8"
      >
        <div className="flex items-center justify-center lg:justify-around gap-6 lg:gap-8 flex-wrap">
          {[
            { icon: "💻", label: "Web Development", delay: 1.2 },
            { icon: "📱", label: "Mobile Apps", delay: 1.3 },
            { icon: "📢", label: "Digital Marketing", delay: 1.4 },
            { icon: "🔗", label: "Social Media", delay: 1.5 },
            { icon: "🎯", label: "Business Strategy", delay: 1.6 },
          ].map((s) => (
            <ServiceBadge
              key={s.label}
              icon={s.icon}
              label={s.label}
              delay={s.delay}
            />
          ))}
        </div>
      </motion.div>

      {/* Orange accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-[1] h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-400" />
    </section>
  );
}
