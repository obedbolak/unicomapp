// components/dashboard/Shell.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, type ReactNode } from "react";
import "./dashboard.css";
// Imported after dashboard.css on purpose — it thins the dashboard's opaque
// background layers so the 3D scene reads through the cards.
import "@/app/dash-glass.css";
import {
  IconAward,
  IconBell,
  IconBriefcase,
  IconClose,
  IconGrid,
  IconLogout,
  IconMenu,
  IconMail,
  IconPulse,
  IconReceipt,
  IconSearch,
  IconSettings,
  IconShield,
  IconSpark,
  IconTeam,
  IconUser,
  IconUsers,
  IconWallet,
} from "./icons";

const ICONS = {
  grid: IconGrid,
  users: IconUsers,
  wallet: IconWallet,
  award: IconAward,
  briefcase: IconBriefcase,
  team: IconTeam,
  spark: IconSpark,
  mail: IconMail,
  receipt: IconReceipt,
  pulse: IconPulse,
  shield: IconShield,
  settings: IconSettings,
  user: IconUser,
} as const;

export type IconKey = keyof typeof ICONS;

export type NavItem = {
  href: string;
  label: string;
  icon: IconKey;
  /** Renders a small uppercase heading above this item. */
  section?: string;
};

/** "Obed Bolak" → "OB". Falls back to the first character for one-word names. */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Shell({
  nav,
  userName,
  userTitle,
  userImage,
  profileHref = "/admin/profile",
  title,
  children,
}: {
  nav: NavItem[];
  userName: string;
  userTitle?: string | null;
  userImage?: string | null;
  /** Where the avatar links to. */
  profileHref?: string;
  title?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const current =
    nav.find((n) => n.href === pathname) ??
    nav
      .filter((n) => pathname.startsWith(n.href + "/"))
      .sort((a, b) => b.href.length - a.href.length)[0];

  const pageTitle = title ?? current?.label ?? "Dashboard";

  return (
    <div className="dash" data-open={open}>
      {open && (
        <div
          className="dash-scrim"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className="dash-sidebar">
        {/* Same mark as the public site header, so the dashboard doesn't feel
            like a different product. */}
        <Link href="/" className="dash-brand" title="Back to the website">
          <Image
            src="/images/logo.png"
            alt=""
            width={32}
            height={26}
            className="dash-brand-logo"
            priority
          />
          <span className="dash-brand-text">
            UNICOM<span className="gradient-text">TEAM</span>
          </span>
        </Link>

        <div className="dash-rule" />

        <nav className="dash-nav">
          {nav.map((item) => {
            const Icon = ICONS[item.icon];
            const active =
              item.href === pathname || pathname.startsWith(item.href + "/");

            return (
              <div key={item.href}>
                {item.section && (
                  <div className="dash-navlabel">{item.section}</div>
                )}
                <Link
                  href={item.href}
                  className="dash-navitem"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="dash-navicon">
                    <Icon size={16} />
                  </span>
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="dash-help">
          <span className="dash-brand-mark" aria-hidden="true">
            <IconSpark size={16} style={{ color: "#100a02" }} />
          </span>
          <p className="dash-help-title">Need a hand?</p>
          <p className="dash-help-text">
            Setup steps, schema notes and next steps live in the project README.
          </p>
          <Link href="/" className="dash-help-btn">
            View site
          </Link>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              className="dash-iconbtn dash-burger"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <IconClose size={17} /> : <IconMenu size={17} />}
            </button>
            <div>
              <p className="dash-crumb">
                Pages / <strong>{pageTitle}</strong>
              </p>
              <h1 className="dash-pagetitle">{pageTitle}</h1>
            </div>
          </div>

          <div className="dash-topbar-actions">
            <label className="dash-search">
              <IconSearch size={14} />
              <input placeholder="Type here..." aria-label="Search" />
            </label>

            <Link
              href={profileHref}
              className="dash-userchip"
              title="View your profile"
            >
              <span className="dash-userchip-text">
                <span className="dash-userchip-name">{userName}</span>
                {userTitle && (
                  <span className="dash-userchip-title">{userTitle}</span>
                )}
              </span>

              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- avatars
                // are arbitrary user-supplied URLs; next/image would need every
                // host allow-listed in next.config.ts.
                <img
                  src={userImage}
                  alt=""
                  className="dash-avatar"
                  width={36}
                  height={36}
                />
              ) : (
                <span className="dash-avatar dash-avatar--initials">
                  {initials(userName)}
                </span>
              )}
            </Link>

            <button className="dash-iconbtn" aria-label="Notifications">
              <IconBell size={16} />
            </button>
            <button
              className="dash-iconbtn"
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Sign out"
              title="Sign out"
            >
              <IconLogout size={16} />
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
