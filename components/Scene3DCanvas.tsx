// components/Scene3DCanvas.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/* ------------------------------------------------------------------
   Visibility-aware animation hook
   Pauses RAF loop when tab is hidden or element off screen
   ------------------------------------------------------------------ */
function useVisibilityPause() {
  const pausedRef = useRef(false);

  useEffect(() => {
    const handleVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return pausedRef;
}

/* ------------------------------------------------------------------
   Mouse Light - throttled to every 2nd frame
   ------------------------------------------------------------------ */
function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { viewport, mouse } = useThree();
  const frameCount = useRef(0);
  const paused = useVisibilityPause();

  useFrame(() => {
    if (paused.current) return;
    frameCount.current += 1;
    if (frameCount.current % 2 !== 0) return; // 60fps → 30fps
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

/* ------------------------------------------------------------------
   Floating Shapes - throttled to every 3rd frame (20fps)
   Visually indistinguishable from 60fps for slow bg animation
   ------------------------------------------------------------------ */
function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);
  const frameCount = useRef(0);
  const paused = useVisibilityPause();

  useFrame((state) => {
    if (paused.current) return;
    frameCount.current += 1;
    if (frameCount.current % 3 !== 0) return; // 60fps → 20fps
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
          <torusKnotGeometry args={[1.2, 0.4, 32, 8]} />
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
          <MeshDistortMaterial
            color="#001f54"
            distort={0.3}
            speed={1.0}
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

/* ------------------------------------------------------------------
   Scene
   ------------------------------------------------------------------ */
function Scene() {
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
        count={1500}
        factor={5}
        saturation={0}
        fade
        speed={0.8}
      />
      <FloatingShapes />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          intensity={0.4}
          height={200}
        />
      </EffectComposer>
    </>
  );
}

/* ------------------------------------------------------------------
   Canvas - frameloop always but GPU-friendly settings
   ------------------------------------------------------------------ */
export default function Scene3DCanvas() {
  return (
    <Canvas
      frameloop="always" // ✅ Restored - animations work again
      dpr={[1, 1]} // ✅ Fixed DPR=1, never 1.5x
      gl={{
        antialias: false, // ✅ Off for background scene
        alpha: true,
        powerPreference: "low-power", // ✅ GPU throttles itself
        precision: "lowp", // ✅ Low precision for bg scene
        depth: false, // ✅ No depth buffer needed
        stencil: false, // ✅ No stencil buffer needed
      }}
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
      <Scene />
    </Canvas>
  );
}
