"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Routes that render their own full-screen chrome (sidebar dashboards). */
export const APP_ROUTES = ["/admin", "/dashboard", "/login"];

export function isAppRoute(pathname: string | null) {
  if (!pathname) return false;
  return APP_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

/**
 * Hides the marketing header / footer / chatbot on the dashboard routes,
 * so the sidebar layout gets the whole viewport.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isAppRoute(pathname)) return null;
  return <>{children}</>;
}
