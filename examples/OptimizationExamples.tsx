/**
 * EXAMPLE 1: Optimized Scroll Performance with Combined Throttle + Debounce
 * This is the RIGHT WAY to handle scroll listeners
 */

"use client";

import { useState } from "react";
import { useThrottle } from "@/hooks/usePerformance";

export function OptimizedScrollExample() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // ✅ Throttle scroll updates with requestAnimationFrame
  const handleScroll = useThrottle(() => {
    setScrollY(window.scrollY);
    setIsScrolling(true);
  });

  // Optional: Detect when scroll stops
  useState(() => {
    const timer = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
    return () => clearTimeout(timer);
  });

  return (
    <>
      <div style={{ position: "fixed", top: 0, right: 0, zIndex: 999 }}>
        ScrollY: {scrollY} | Scrolling: {isScrolling ? "yes" : "no"}
      </div>
      {/* Content here */}
    </>
  );
}

/**
 * EXAMPLE 2: Heavy Analytics Tracking Deferred to Idle Time
 */

("use client");

import { useIdleCallback } from "@/hooks/usePerformance";

interface PageViewEvent {
  page: string;
  timestamp: number;
}

export function PageWithDeferredAnalytics({ page }: { page: string }) {
  // ✅ Send analytics when browser is idle, don't block page render
  useIdleCallback(() => {
    const event: PageViewEvent = {
      page,
      timestamp: Date.now(),
    };

    // Send to analytics
    console.log("📊 Analytics sent:", event);

    // This won't block the main thread
    fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify(event),
    }).catch(() => {}); // Ignore errors for non-critical tracking
  });

  return <div>Page content for {page}</div>;
}

/**
 * EXAMPLE 3: Lazy Load Heavy Components Only When Visible
 */

("use client");

import { useRef } from "react";
import { useIntersectionObserver } from "@/hooks/usePerformance";
import dynamic from "next/dynamic";

// Only loads when user scrolls to this section
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <div className="h-96 bg-slate-900">Loading chart...</div>,
});

export function LazyLoadedChart() {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref);

  return (
    <div ref={ref} className="h-96">
      {isVisible ? <HeavyChart /> : <div className="h-96 bg-slate-900" />}
    </div>
  );
}

/**
 * EXAMPLE 4: Debounced Search Input (Search/Filter)
 */

("use client");

import { useState } from "react";
import { useDebounce } from "@/hooks/usePerformance";

export function OptimizedSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  // ✅ Wait 300ms after user stops typing before searching
  const performSearch = useDebounce(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();
      setResults(data);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    performSearch(value);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
      />
      {isSearching && <p>Searching...</p>}
      <ul>
        {results.map((result) => (
          <li key={result}>{result}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * EXAMPLE 5: Window Resize Handler with Debounce
 */

("use client");

import { useState } from "react";
import { useDebounce } from "@/hooks/usePerformance";

export function ResponsiveLayout() {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  // ✅ Wait 200ms after resize stops before updating layout
  const handleResize = useDebounce(() => {
    setWindowWidth(window.innerWidth);
  }, 200);

  return (
    <div>
      <p>Window width: {windowWidth}px</p>
      <p>Device: {windowWidth < 768 ? "Mobile" : "Desktop"}</p>
    </div>
  );
}

/**
 * EXAMPLE 6: Heavy Computation in Web Worker (No Main Thread Blocking)
 */

("use client");

import { useState } from "react";
import { useWebWorker } from "@/hooks/usePerformance";

// ✅ Pure function that will run in worker thread
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

export function HeavyCalculation() {
  const result = useWebWorker(fibonacci, 35);

  return (
    <div>
      <p>Calculating fibonacci(35) in Web Worker...</p>
      {result !== undefined && <p>Result: {result}</p>}
    </div>
  );
}

/**
 * EXAMPLE 7: Combining Multiple Techniques for Optimal Performance
 */

("use client");

import { useState, useRef } from "react";
import { useThrottle, useIdleCallback } from "@/hooks/usePerformance";

export function HighPerformanceDashboard() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // ✅ Throttle scroll tracking with RAF
  const handleScroll = useThrottle(() => {
    const windowHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    setScrollProgress(scrolled);
    setIsActive(true);
  });

  // ✅ Defer analytics to idle time
  useIdleCallback(() => {
    console.log("📊 User interacted with page at", new Date());
  });

  return (
    <div>
      {/* Fixed scroll indicator - doesn't block scroll */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "4px",
          backgroundColor: "#0066ff",
          width: `${scrollProgress}%`,
          transition: "width 0.1s ease",
          zIndex: 999,
        }}
      />

      <p>Scroll progress: {scrollProgress.toFixed(1)}%</p>
      <p>Is active: {isActive ? "yes" : "no"}</p>

      {/* Long content */}
      <div style={{ height: "200vh" }} />
    </div>
  );
}

/**
 * EXAMPLE 8: Form Input with Validation Debounce
 */

("use client");

import { useState } from "react";
import { useDebounce } from "@/hooks/usePerformance";

export function OptimizedForm() {
  const [email, setEmail] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // ✅ Wait 500ms after user stops typing to validate
  const validateEmail = useDebounce(async (emailValue: string) => {
    if (!emailValue) {
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    try {
      // Check if email already exists in database
      const response = await fetch(`/api/validate-email?email=${emailValue}`);
      const { valid } = await response.json();
      setIsValid(valid);
    } finally {
      setIsValidating(false);
    }
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        placeholder="Enter email..."
      />
      {isValidating && <p>Validating...</p>}
      {isValid && <p style={{ color: "green" }}>✓ Email available</p>}
      {!isValid && !isValidating && email && (
        <p style={{ color: "red" }}>✗ Email not available</p>
      )}
    </div>
  );
}

/**
 * SUMMARY OF WHEN TO USE EACH PATTERN:
 *
 * ✅ useThrottle:     Scroll, resize, mouse move (frequent events)
 * ✅ useDebounce:     Search input, form validation, window resize (after action completes)
 * ✅ useIdleCallback: Analytics, logging, non-critical updates
 * ✅ useWebWorker:    Heavy math, image processing, data parsing
 * ✅ useIntersectionObserver: Lazy load images/components only when visible
 *
 * GENERAL RULE:
 * - If event fires 60+x/sec → use useThrottle
 * - If event should wait until complete → use useDebounce
 * - If task is non-critical → use useIdleCallback
 * - If computation is heavy → use useWebWorker
 * - If element is below the fold → use useIntersectionObserver + dynamic()
 */
