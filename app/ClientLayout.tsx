"use client";

import React from "react";
import Scene3DOptimized from "@/components/Scene3DOptimized";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 3D Scene Background - Fixed behind everything */}
      <div className="fixed inset-0 w-screen h-screen -z-10 pointer-events-none">
        <Scene3DOptimized />
      </div>

      {/* Page Content - Scrolls over the fixed background */}
      <div className="relative z-10 w-full">{children}</div>
    </>
  );
}
