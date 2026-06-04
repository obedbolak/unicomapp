"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Code, Globe, Smartphone, Share2, TrendingUp } from "lucide-react";
import Button from "@/components/ui/button";
import Image from "next/image";

export type Page = "home" | "about" | "services" | "projects" | "contact";

interface HeaderProps {
  activePage?: Page;
  onNavigate?: (page: Page) => void;
}

const serviceLinks = [
  { label: "Software Solutions", slug: "software-solutions", icon: Code },
  { label: "Digital Marketing", slug: "digital-marketing", icon: Globe },
  { label: "Mobile & Web Dev", slug: "mobile-web-development", icon: Smartphone },
  { label: "Social Media", slug: "social-media-management", icon: Share2 },
  { label: "Business Strategy", slug: "business-strategy", icon: TrendingUp },
];

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
  const [isVisible, setIsVisible] = useState(true);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
        setMenuOpen(false);
        setServicesOpen(false);
      } else {
        setIsVisible(true);
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
    setMenuOpen(false);
    setServicesOpen(false);
  };

  const handleServicesMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setServicesOpen(true);
  };

  const handleServicesMouseLeave = () => {
    hoverTimer.current = setTimeout(() => setServicesOpen(false), 150);
  };

  return (
    <>
      <style>{`
        .logo-btn {
          display: flex; align-items: center; gap: 0.5rem;
          background: none; border: none; padding: 0; cursor: pointer;
        }
        .logo-btn .logo-text {
          font-family: var(--font-display); font-weight: 700;
          font-size: 1rem; letter-spacing: -0.01em;
          color: var(--color-text); transition: color 0.2s ease;
        }
        .logo-btn:hover .logo-text { color: var(--color-primary); }
        .desktop-nav { display: none; align-items: center; gap: 0.25rem; }
        .nav-btn {
          position: relative; padding: 0.5rem 1rem;
          font-size: 0.875rem; font-weight: 500;
          font-family: var(--font-display);
          background: none; border: none; cursor: pointer;
          transition: color 0.2s ease;
        }
        .hamburger-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 0.5rem; background: none; border: none;
          cursor: pointer; color: var(--color-text-muted);
          transition: color 0.2s ease; z-index: 50;
        }
        .hamburger-btn:hover { color: var(--color-text); }
        .mobile-overlay {
          position: fixed; inset: 0; width: 100vw; height: 100vh;
          z-index: 39; background: rgba(0,0,0,0.2);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
        }
        .svc-dropdown-item {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.6rem 0.75rem; border-radius: 0.5rem;
          font-family: var(--font-display); font-size: 0.8125rem;
          font-weight: 500; color: var(--color-text-muted);
          background: none; border: none; cursor: pointer;
          transition: background 0.15s, color 0.15s; white-space: nowrap;
          width: 100%; text-align: left; text-decoration: none;
        }
        .svc-dropdown-item:hover {
          background: rgba(255,140,0,0.08); color: var(--color-primary);
        }
        @media (min-width: 768px) {
          .desktop-nav { display: flex; }
          .hamburger-btn { display: none; }
        }
      `}</style>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -80 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`header${scrolled ? " scrolled" : ""}`}
        style={{ zIndex: 50, borderBottomColor: isVisible ? "rgba(255,255,255,0.06)" : "transparent" }}
      >
        <div className="header-content">
          {/* Logo */}
          <button className="logo-btn" onClick={() => handleNav("home")}>
            <Image src="/images/logo.png" alt="UnicomTeam Logo" width={32} height={26} />
            <span className="logo-text">UNICOM<span className="gradient-text">TEAM</span></span>
          </button>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            {navLinks.map(({ label, page }) =>
              page === "services" ? (
                <div
                  key={page}
                  ref={servicesRef}
                  style={{ position: "relative" }}
                  onMouseEnter={handleServicesMouseEnter}
                  onMouseLeave={handleServicesMouseLeave}
                >
                  <button
                    className="nav-btn"
                    onClick={() => handleNav("services")}
                    style={{
                      color: resolvedActive === "services" ? "var(--color-primary)" : "var(--color-text-muted)",
                      display: "flex", alignItems: "center", gap: "0.25rem",
                    }}
                  >
                    {resolvedActive === "services" && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: "rgba(255,140,0,0.1)", border: "1px solid var(--color-border-primary)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">Services</span>
                    <motion.span
                      className="relative z-10"
                      animate={{ rotate: servicesOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} />
                    </motion.span>
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        onMouseEnter={handleServicesMouseEnter}
                        onMouseLeave={handleServicesMouseLeave}
                        style={{
                          position: "absolute", top: "calc(100% + 0.5rem)", left: "50%",
                          transform: "translateX(-50%)", width: "220px",
                          background: "rgba(0,8,20,0.9)", backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "0.875rem", padding: "0.5rem",
                          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
                          zIndex: 60,
                        }}
                      >
                        {/* top glow line */}
                        <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(255,140,0,0.4),transparent)", borderRadius: "999px" }} />
                        {serviceLinks.map(({ label, slug, icon: Icon }) => (
                          <button
                            key={slug}
                            className="svc-dropdown-item"
                            onClick={() => { router.push(`/services/${slug}`); setServicesOpen(false); }}
                          >
                            <Icon size={14} style={{ flexShrink: 0, color: "var(--color-primary)", opacity: 0.7 }} />
                            {label}
                          </button>
                        ))}
                        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0.25rem 0.25rem" }} />
                        <button
                          className="svc-dropdown-item"
                          style={{ color: "var(--color-primary)", fontWeight: 700 }}
                          onClick={() => { handleNav("services"); }}
                        >
                          View all services →
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  key={page}
                  onClick={() => handleNav(page)}
                  className="nav-btn"
                  style={{ color: resolvedActive === page ? "var(--color-primary)" : "var(--color-text-muted)" }}
                >
                  {resolvedActive === page && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: "rgba(255,140,0,0.1)", border: "1px solid var(--color-border-primary)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              )
            )}
            <Button variant="primary" size="sm" className="ml-4" onClick={() => handleNav("contact")}>
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 16px)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0 0% 0 round 16px)" }}
              exit={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 16px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed", top: "calc(var(--header-height-mobile) + 0.5rem)",
                left: "1rem", right: "1rem", zIndex: 40,
                background: "rgba(0,8,20,0.65)", backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px", padding: "0.75rem",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(255,140,0,0.4),transparent)", borderRadius: "999px" }} />

              <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {navLinks.map(({ label, page }, i) =>
                  page === "services" ? (
                    <div key={page}>
                      <motion.button
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        onClick={() => setMobileServicesOpen((v) => !v)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          width: "100%", textAlign: "left", padding: "0.875rem 1rem",
                          borderRadius: "10px", fontSize: "0.9375rem", fontWeight: 600,
                          fontFamily: "var(--font-display)", cursor: "pointer",
                          border: "none", transition: "background 0.2s, color 0.2s",
                          color: resolvedActive === "services" ? "var(--color-primary)" : "rgba(255,255,255,0.75)",
                          background: resolvedActive === "services" ? "rgba(255,140,0,0.1)" : "transparent",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "999px", flexShrink: 0, background: resolvedActive === "services" ? "var(--color-primary)" : "rgba(255,255,255,0.2)" }} />
                          {label}
                        </span>
                        <motion.span animate={{ rotate: mobileServicesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={15} />
                        </motion.span>
                      </motion.button>

                      <AnimatePresence>
                        {mobileServicesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: "hidden", paddingLeft: "1.5rem" }}
                          >
                            {serviceLinks.map(({ label, slug, icon: Icon }) => (
                              <button
                                key={slug}
                                className="svc-dropdown-item"
                                onClick={() => { router.push(`/services/${slug}`); setMenuOpen(false); }}
                              >
                                <Icon size={13} style={{ flexShrink: 0, color: "var(--color-primary)", opacity: 0.7 }} />
                                {label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.button
                      key={page}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => handleNav(page)}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        textAlign: "left", padding: "0.875rem 1rem", borderRadius: "10px",
                        fontSize: "0.9375rem", fontWeight: 600, fontFamily: "var(--font-display)",
                        cursor: "pointer", border: "none", transition: "background 0.2s, color 0.2s",
                        color: resolvedActive === page ? "var(--color-primary)" : "rgba(255,255,255,0.75)",
                        background: resolvedActive === page ? "rgba(255,140,0,0.1)" : "transparent",
                        width: "100%",
                      }}
                    >
                      <span style={{ width: "5px", height: "5px", borderRadius: "999px", flexShrink: 0, background: resolvedActive === page ? "var(--color-primary)" : "rgba(255,255,255,0.2)", transition: "background 0.2s" }} />
                      {label}
                    </motion.button>
                  )
                )}

                <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0.375rem 0.25rem" }} />
                <div style={{ padding: "0.25rem" }}>
                  <Button variant="primary" size="md" fullWidth onClick={() => handleNav("contact")}>
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
