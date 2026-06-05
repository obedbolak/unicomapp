"use client";

import React, { useState, useEffect } from "react";
import Scene3DOptimized from "@/components/Scene3DOptimized";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* 3D Scene Background */}
      <div style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 0, pointerEvents: "none",
      }}>
        {mounted && <Scene3DOptimized />}
      </div>

      {/* Page Content */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", minHeight: "100vh" }}>
        {children}
      </div>
    </>
  );
}
