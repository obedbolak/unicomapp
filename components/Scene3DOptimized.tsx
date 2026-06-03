"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * OPTIMIZED: Use lower geometry complexity
 * Sphere: 64 segs → 16 segs (preserves visual quality at distance)
 * Torus: 128 segs → 32 segs
 */
function FloatingShapesOptimized() {
  const groupRef = useRef<THREE.Group>(null);
  const frameCount = useRef(0);

  // Optimization: Only update on every 3rd frame instead of every frame
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
          {/* Reduced from 128 segs to 32 segs */}
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
          {/* Reduced from 64 segs to 16 segs */}
          <sphereGeometry args={[3, 16, 16]} />
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

/**
 * OPTIMIZED: Defer mouse tracking with requestIdleCallback
 * Only track mouse when the GPU is idle
 */
function MouseLightOptimized() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { viewport, mouse } = useThree();
  const shouldUpdate = useRef(true);

  useEffect(() => {
    const updateOnIdle = () => {
      shouldUpdate.current = true;
    };

    // Request idle callback: only update when browser is not busy
    const id = requestIdleCallback(updateOnIdle, { timeout: 50 });
    return () => cancelIdleCallback(id);
  }, []);

  useFrame(() => {
    if (lightRef.current && shouldUpdate.current) {
      lightRef.current.position.x = mouse.x * viewport.width * 0.6;
      lightRef.current.position.y = mouse.y * viewport.height * 0.6;
      shouldUpdate.current = false;
    }
  });

  return (
    <>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <pointLight
        ref={lightRef}
        intensity={4}
        color="#FF8C00"
        distance={20}
        decay={2}
      />
    </>
  );
}

function SceneContent() {
  return (
    <>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <ambientLight intensity={0.4} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#3385ff"
      />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#FF8C00" />
      <MouseLightOptimized />
      <Stars
        radius={120}
        depth={60}
        count={2000} // Reduced from 4000
        factor={5}
        saturation={0}
        fade
        speed={1.2}
      />
      <FloatingShapesOptimized />
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

export default function Scene3DOptimized() {
  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
      camera={{ position: [0, 0, 15], fov: 75 }}
      gl={{ antialias: true, alpha: true }}
    >
      <SceneContent />
    </Canvas>
  );
}
