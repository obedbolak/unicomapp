"use client";

import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Trainings", href: "/trainings" },
  { label: "Contact", href: "/contact" },
];

const services = [
  { label: "Software Solutions", href: "/services/software-solutions" },
  {
    label: "Mobile & Web Development",
    href: "/services/mobile-web-development",
  },
  { label: "Digital Marketing", href: "/services/digital-marketing" },
  {
    label: "Social Media Management",
    href: "/services/social-media-management",
  },
  { label: "Business Strategy", href: "/services/business-strategy" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/18keP13dmW",
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.675 0h-21.35C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.326 24h11.495v-9.294H9.692V11.01h3.129V8.414c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.237h3.587l-.467 3.696h-3.12V24h6.112C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@unicomteam0",
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.895 2.895 0 0 1 2.754-4.551c.298 0 .59.046.866.134V9.499a6.329 6.329 0 0 0-.866-.059 6.33 6.33 0 0 0-5.283 9.827 6.33 6.33 0 0 0 11.175-4.052V8.28a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/unicomteam1",
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        paddingTop: "4rem",
      }}
    >
      {/* ── Main grid ── */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 clamp(1rem, 5vw, 4rem)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "3rem",
          paddingBottom: "3.5rem",
        }}
      >
        {/* Brand column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Logo */}
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.375rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--color-text)",
            }}
          >
            UNICOM
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--color-primary), #ff6a00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              TEAM
            </span>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              maxWidth: "240px",
              margin: 0,
            }}
          >
            Elite software strategy, design, and engineering for ambitious
            teams.
          </p>

          {/* Social icons */}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "0.5rem",
                  border: "1px solid var(--color-border)",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-muted)",
                  transition: "border-color 0.2s, color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = "rgba(255,140,0,0.4)";
                  el.style.color = "var(--color-primary)";
                  el.style.background = "rgba(255,140,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = "var(--color-border)";
                  el.style.color = "var(--color-text-muted)";
                  el.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation column */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            Navigation
          </p>
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-text-muted)")
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Services column */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            Services
          </p>
          {services.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-text-muted)")
              }
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Contact + Newsletter column */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            Contact
          </p>
          <a
            href="mailto:contact@unicomteam.com"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color =
                "var(--color-primary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color =
                "var(--color-text-muted)")
            }
          >
            contact@unicomteam.com
          </a>
          <a
            href="tel:+237681529488"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color =
                "var(--color-primary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color =
                "var(--color-text-muted)")
            }
          >
            +237 681 529 488
          </a>

          {/* Newsletter */}
          <div style={{ marginTop: "0.75rem" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                margin: "0 0 0.5rem",
              }}
            >
              Stay in the loop
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ display: "flex", gap: "0.5rem" }}
            >
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--color-border)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8125rem",
                  outline: "none",
                }}
                onFocus={(e) =>
                  ((e.currentTarget as HTMLInputElement).style.borderColor =
                    "rgba(255,140,0,0.4)")
                }
                onBlur={(e) =>
                  ((e.currentTarget as HTMLInputElement).style.borderColor =
                    "var(--color-border)")
                }
              />
              <button
                type="submit"
                style={{
                  flexShrink: 0,
                  padding: "0.5rem 0.875rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "var(--color-primary)",
                  color: "#000",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.opacity =
                    "0.85")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
                }
              >
                →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 clamp(1rem, 5vw, 4rem)",
          borderTop: "1px solid var(--color-border)",
          paddingTop: "1.25rem",
          paddingBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.8125rem",
            color: "var(--color-text-muted)",
            margin: 0,
          }}
        >
          © {new Date().getFullYear()} UnicomTeam. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-text-muted)")
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
