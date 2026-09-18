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
  IconImage,
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
  IconChevronDown,
  IconChevronRight,
} from "./icons";
import NotificationBell from "./NotificationBell";

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
  image: IconImage,
} as const;

export type IconKey = keyof typeof ICONS;

export type NavItem = {
  href: string;
  label: string;
  icon: IconKey;
  /** Renders a small uppercase heading above this item. */
  section?: string;
  children?: NavItem[];
};

/** "Obed Bolak" → "OB". Falls back to the first character for one-word names. */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function NavAccordion({ 
  item, 
  pathname, 
  setOpen,
  isOpen,
  onToggle
}: { 
  item: NavItem; 
  pathname: string; 
  setOpen: (v: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = ICONS[item.icon];
  // Check if any child is active
  const isActive = item.children?.some(child => child.href === pathname || pathname.startsWith(child.href + "/"));

  return (
    <div key={item.href}>
      {item.section && <div className="dash-navlabel">{item.section}</div>}
      <button 
        className={`dash-navitem`}
        onClick={onToggle}
        style={{ 
          width: '100%', 
          background: 'transparent', 
          cursor: 'pointer', 
          justifyContent: 'space-between',
          border: '1px solid transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="dash-navicon" style={{ 
            background: isActive ? 'var(--gradient-primary)' : '', 
            color: isActive ? '#0b0b0b' : '',
            boxShadow: isActive ? '0 5px 14px rgba(255, 140, 0, 0.4)' : ''
          }}>
            <Icon size={16} />
          </span>
          <span style={{ color: isActive ? 'var(--dash-ink)' : '' }}>{item.label}</span>
        </div>
        <span style={{ color: 'var(--dash-ink-dim)', flex: 'none' }}>
          {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
        </span>
      </button>

      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', paddingLeft: '2.75rem' }}>
          {item.children?.map(child => {
            const isChildActive = child.href === pathname || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                className="dash-navitem"
                aria-current={isChildActive ? "page" : undefined}
                onClick={() => setOpen(false)}
                style={{ padding: '0.5rem 0.7rem' }}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
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

  // Figure out which accordion should be open on initial load
  const [openAccordion, setOpenAccordion] = useState<string | null>(() => {
    const activeParent = nav.find(item => item.children?.some(child => child.href === pathname || pathname.startsWith(child.href + "/")));
    return activeParent ? activeParent.label : null;
  });

  // Flatten nav to find current item for the title
  const flatNav = nav.flatMap(n => n.children ? [n, ...n.children] : [n]);
  const current =
    flatNav.find((n) => n.href === pathname) ??
    flatNav
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
            if (item.children && item.children.length > 0) {
              return (
                <NavAccordion 
                  key={item.label} 
                  item={item} 
                  pathname={pathname} 
                  setOpen={setOpen} 
                  isOpen={openAccordion === item.label}
                  onToggle={() => setOpenAccordion(openAccordion === item.label ? null : item.label)}
                />
              );
            }

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

            <NotificationBell />
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
