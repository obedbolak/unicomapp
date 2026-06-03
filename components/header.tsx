"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/button";
import Image from "next/image";

// 1. Updated your Page type definitions
export type Page = "home" | "about" | "services" | "projects" | "contact";

interface HeaderProps {
  activePage?: Page;
  onNavigate?: (page: Page) => void;
}

// 2. Updated navLinks with About Us and Our Projects
const navLinks: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "About Us", page: "about" },
  { label: "Services", page: "services" },
  { label: "Our Projects", page: "projects" },
  { label: "Contact", page: "contact" },
];

export default function Header({ activePage, onNavigate }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // New States: Tracking visibility position
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;

      // Add solid styled background variant if scrolled down past 20px
      setScrolled(currentScrollY > 20);

      // Hide if scrolling down, Show if scrolling up.
      // Keep it visible if near the top edge (< 50px) to prevent layout jumping.
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false); // Scrolling Down -> Hide Header
        setMenuOpen(false); // Auto-close menu if user scrolls down
      } else {
        setIsVisible(true); // Scrolling Up -> Show Header
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const router = useRouter();
  const pathname = usePathname();

  const resolvedActive: Page =
    activePage ??
    ((): Page => {
      const p = pathname || "/";
      if (p === "/" || p === "") return "home";
      if (p.startsWith("/about")) return "about";
      if (p.startsWith("/services")) return "services";
      if (p.startsWith("/projects")) return "projects";
      if (p.startsWith("/contact")) return "contact";
      return "home";
    })();

  const navigate =
    onNavigate ??
    ((page: Page) => {
      const path = page === "home" ? "/" : `/${page}`;
      router.push(path);
    });

  const handleNav = (page: Page) => {
    navigate(page);
    setMenuOpen(false); // Closes the mobile navigation element automatically on route pick
  };

  return (
    <>
      <style>{`
        .logo-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .logo-btn .logo-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: -0.01em;
          color: var(--color-text);
          transition: color 0.2s ease;
        }
        .logo-btn:hover .logo-text {
          color: var(--color-primary);
        }

        .desktop-nav {
          display: none;
          align-items: center;
          gap: 0.25rem;
        }

        .nav-btn {
          position: relative;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: var(--font-display);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-muted);
          transition: color 0.2s ease;
          z-index: 50; /* Ensure burger stays interactive during dropdown activation */
        }
        .hamburger-btn:hover { color: var(--color-text); }

        /* Fullscreen backdrop interceptor */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 39;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        @media (min-width: 768px) {
          .desktop-nav  { display: flex; }
          .hamburger-btn { display: none; }
        }
      `}</style>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        // Dynamic animation values tied directly to scrolling states
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -80,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`header${scrolled ? " scrolled" : ""}`}
        style={{ zIndex: 50 }} // Keeps global positioning over normal grid layouts
      >
        <div className="header-content">
          {/* Logo */}
          <button className="logo-btn" onClick={() => handleNav("home")}>
            <Image
              src="/images/logo.png"
              alt="UnicomTeam Logo"
              width={32}
              height={26}
            />
            <span className="logo-text">
              UNICOM<span className="gradient-text">TEAM</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            {navLinks.map(({ label, page }) => (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className="nav-btn"
                style={{
                  color:
                    resolvedActive === page
                      ? "var(--color-primary)"
                      : "var(--color-text-muted)",
                }}
              >
                {resolvedActive === page && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "rgba(255,140,0,0.1)",
                      border: "1px solid var(--color-border-primary)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}

            <Button
              variant="primary"
              size="sm"
              className="ml-4"
              onClick={() => handleNav("contact")}
            >
              Get Started
            </Button>
          </nav>

          {/* Hamburger */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Dropdown Menu Framework */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Click Outside Interceptor Overlay */}
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Dropdown Navigation Box */}
            <motion.div
              initial={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 16px)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0 0% 0 round 16px)" }}
              exit={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 16px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                top: "calc(var(--header-height-mobile) + 0.5rem)",
                left: "1rem",
                right: "1rem",
                zIndex: 40,
                background: "rgba(0, 8, 20, 0.65)", // Darkened incrementally to balance legibility over blurry canvases
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "0.75rem",
                boxShadow:
                  "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,140,0,0.4), transparent)",
                  borderRadius: "999px",
                }}
              />

              <nav
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                {navLinks.map(({ label, page }, i) => (
                  <motion.button
                    key={page}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => handleNav(page)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      textAlign: "left",
                      padding: "0.875rem 1rem",
                      borderRadius: "10px",
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                      cursor: "pointer",
                      border: "none",
                      transition: "background 0.2s, color 0.2s",
                      color:
                        resolvedActive === page
                          ? "var(--color-primary)"
                          : "rgba(255,255,255,0.75)",
                      background:
                        resolvedActive === page
                          ? "rgba(255,140,0,0.1)"
                          : "transparent",
                      width: "100%",
                    }}
                  >
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "999px",
                        flexShrink: 0,
                        background:
                          resolvedActive === page
                            ? "var(--color-primary)"
                            : "rgba(255,255,255,0.2)",
                        transition: "background 0.2s",
                      }}
                    />
                    {label}
                  </motion.button>
                ))}

                <div
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.06)",
                    margin: "0.375rem 0.25rem",
                  }}
                />

                <div style={{ padding: "0.25rem" }}>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => handleNav("contact")}
                  >
                    Get Started
                  </Button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
