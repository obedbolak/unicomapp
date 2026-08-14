// components/dashboard/Shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";

export type NavItem = { href: string; label: string };

export default function Shell({
  nav,
  userName,
  userTitle,
  children,
}: {
  nav: NavItem[];
  userName: string;
  userTitle?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const font = "var(--font-display)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg, #0a0a0a)",
        paddingTop: "calc(var(--header-height-mobile) + 1rem)",
        paddingBottom: "4rem",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.25rem",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            paddingBottom: "1rem",
            marginBottom: "1.25rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: font,
                fontSize: "0.9375rem",
                fontWeight: 800,
                color: "var(--color-text)",
              }}
            >
              {userName}
            </div>
            {userTitle && (
              <div
                style={{
                  fontFamily: font,
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {userTitle}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Link
              href="/"
              style={{
                fontFamily: font,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textDecoration: "none",
                padding: "0.45rem 0.8rem",
              }}
            >
              View site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                fontFamily: font,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--color-text)",
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "0.6rem",
                padding: "0.45rem 0.9rem",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            display: "flex",
            gap: "0.35rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: font,
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  padding: "0.5rem 0.9rem",
                  borderRadius: "0.6rem",
                  color: active ? "#000" : "var(--color-text-muted)",
                  background: active ? "var(--color-primary)" : "transparent",
                  border: `1px solid ${
                    active ? "var(--color-primary)" : "var(--color-border)"
                  }`,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
