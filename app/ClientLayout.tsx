"use client";

import React, { useState, useEffect, Component, ReactNode } from "react";
import Scene3DOptimized from "@/components/Scene3DOptimized";

/* ── Error boundary: silently catches WebGL / Three.js crashes ── */
class Scene3DBoundary extends Component<
  { children: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false };
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[Scene3D] Skipped — device unsupported:", err.message);
  }
  render() {
    return this.state.crashed ? null : this.props.children;
  }
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* 3D background — only after mount, wrapped so crashes can't
          propagate to children and blank the page */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {mounted && (
          <Scene3DBoundary>
            <Scene3DOptimized />
          </Scene3DBoundary>
        )}
      </div>

      {/* Page content — always renders, never gated */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </>
  );
}
