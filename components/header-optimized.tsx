"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/button";

export type Page = "home" | "about" | "services" | "projects" | "contact";

interface HeaderProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navLinks: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "About Us", page: "about" },
  { label: "Services", page: "services" },
  { label: "Our Projects", page: "projects" },
  { label: "Contact", page: "contact" },
];

export default function HeaderOptimized({
  activePage,
  onNavigate,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(window.scrollY);

  /**
   * OPTIMIZED: Debounced scroll handler using RequestAnimationFrame
   * Instead of firing on every scroll event, batch updates with RAF
   */
  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      // Cancel previous RAF
      if (rafId) cancelAnimationFrame(rafId);

      // Use RAF to batch updates on next frame
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Update scrolled state (for background change)
        setScrolled(currentScrollY > 20);

        // Hide on scroll down, show on scroll up
        if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
          setIsVisible(false);
          setMenuOpen(false);
        } else {
          setIsVisible(true);
        }

        lastScrollY.current = currentScrollY;
      });
    };

    // Passive listener - doesn't block scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleNav = useCallback(
    (page: Page) => {
      onNavigate(page);
      setMenuOpen(false);
    },
    [onNavigate],
  );

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
          z-index: 50;
        }
        .hamburger-btn:hover { color: var(--color-text); }

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
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -80,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`header${scrolled ? " scrolled" : ""}`}
        style={{ zIndex: 50 }}
      >
        <div className="header-content">
          <button className="logo-btn" onClick={() => handleNav("home")}>
            <span className="logo-text">UnicomTeam</span>
          </button>

          <nav className="desktop-nav">
            {navLinks.map(({ label, page }) => (
              <button
                key={page}
                className="nav-btn"
                onClick={() => handleNav(page)}
                style={{
                  color:
                    activePage === page ? "var(--color-primary)" : "inherit",
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          <Button onClick={() => handleNav("contact")}>Get in Touch</Button>

          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 left-0 right-0 md:hidden z-40 bg-slate-950"
            >
              {navLinks.map(({ label, page }) => (
                <button
                  key={page}
                  onClick={() => handleNav(page)}
                  className="block w-full text-left px-4 py-3 hover:bg-slate-900"
                >
                  {label}
                </button>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
