"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

// ── Floating geometry shapes ─────────────────────────────────────────────
function FloatingShapesOptimized() {
  const groupRef = useRef<THREE.Group>(null);
  const frameCount = useRef(0);

  useFrame((state) => {
    frameCount.current += 1;
    if (frameCount.current % 3 === 0 && groupRef.current) {
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
          <torusKnotGeometry args={[1.2, 0.4, 32, 16]} />
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
          <sphereGeometry args={[3, 16, 16]} />
          <meshStandardMaterial
            color="#001f54"
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

// ── Mouse light — frame-skip throttle, no requestIdleCallback ───────────
function MouseLightOptimized() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { viewport, mouse } = useThree();
  const frameCount = useRef(0);

  useFrame(() => {
    frameCount.current += 1;
    if (lightRef.current && frameCount.current % 4 === 0) {
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

// ── Scene content — NO EffectComposer/Bloom on iOS ───────────────────────
function SceneContent({ usePostProcessing }: { usePostProcessing: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#3385ff"
      />
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#FF8C00" />
      <MouseLightOptimized />
      <Stars
        radius={120}
        depth={60}
        count={2000}
        factor={5}
        saturation={0}
        fade
        speed={1.2}
      />
      <FloatingShapesOptimized />
      {/* Bloom is skipped on iOS — framebuffer float extension restricted in iOS 18 */}
      {usePostProcessing && <PostFX />}
    </>
  );
}

// ── Postprocessing isolated so it can be tree-shaken on iOS ─────────────
function PostFX() {
  // Dynamically imported so the module never even loads on iOS
  const [Comps, setComps] = useState<{
    EffectComposer: React.ComponentType<{ children: React.ReactNode }>;
    Bloom: React.ComponentType<{
      luminanceThreshold: number;
      luminanceSmoothing: number;
      intensity: number;
      height: number;
    }>;
  } | null>(null);

  useEffect(() => {
    import("@react-three/postprocessing")
      .then((mod) => {
        setComps({
          EffectComposer: mod.EffectComposer as React.ComponentType<{
            children: React.ReactNode;
          }>,
          Bloom: mod.Bloom as React.ComponentType<{
            luminanceThreshold: number;
            luminanceSmoothing: number;
            intensity: number;
            height: number;
          }>,
        });
      })
      .catch(() => {
        // postprocessing unavailable — silently skip
      });
  }, []);

  if (!Comps) return null;
  const { EffectComposer, Bloom } = Comps;

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={0.6}
        height={300}
      />
    </EffectComposer>
  );
}

// ── Device detection ─────────────────────────────────────────────────────
function detectDevice() {
  if (typeof navigator === "undefined")
    return { isIOS: false, isMobile: false };
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS 13+
  const isMobile = isIOS || /Mobi|Android/i.test(ua);
  return { isIOS, isMobile };
}

// ── WebGL capability check ───────────────────────────────────────────────
function checkWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    return !!gl;
  } catch {
    return false;
  }
}

// ── Main export ──────────────────────────────────────────────────────────
export default function Scene3DOptimized() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [device, setDevice] = useState({ isIOS: false, isMobile: false });

  useEffect(() => {
    setDevice(detectDevice());
    setSupported(checkWebGL());
  }, []);

  if (supported === null) return null;

  if (!supported) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at 70% 20%, #001f54 0%, #000814 60%, #0d1b2e 100%)",
        }}
      />
    );
  }

  return (
    <Canvas
      style={{
        position: "absolute", // not "fixed" — parent div in ClientLayout is already fixed
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
      camera={{ position: [0, 0, 15], fov: 75 }}
      gl={{
        antialias: !device.isMobile, // off on all mobile (Android fix carried over)
        alpha: true,
        powerPreference: "default", // "low-power" suspends context on iOS
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
      }}
    >
      {/* Bloom postprocessing disabled on iOS 18 — float framebuffer restricted */}
      <SceneContent usePostProcessing={!device.isIOS} />
    </Canvas>
  );
}
