import { useRef, useEffect, useCallback, useState } from "react";

/**
 * ⚡ Hook: Debounce scroll/resize events
 *
 * Usage:
 * const debouncedScroll = useDebounce(() => {
 * setVisible(window.scrollY > 600);
 * }, 150);
 *
 * window.addEventListener("scroll", debouncedScroll, { passive: true });
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
): T {
  // ✅ Fixed: Added | null and initialized with null
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  ) as T;

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * ⚡ Hook: Throttle events with requestAnimationFrame
 *
 * Usage:
 * const throttledScroll = useThrottle(() => {
 * setScrolled(window.scrollY > 20);
 * });
 *
 * window.addEventListener("scroll", throttledScroll, { passive: true });
 */
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
): T {
  const rafRef = useRef<number | null>(null);
  const lastCallRef = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: any[]) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const now = Date.now();
        // Only call if enough time has passed since last call
        if (now - lastCallRef.current >= 16) {
          callback(...args);
          lastCallRef.current = now;
        }
      });
    },
    [callback],
  ) as T;

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * ⚡ Hook: Defer work to idle time
 *
 * Usage:
 * useIdleCallback(() => {
 * // Heavy computation happens when browser is idle
 * analytics.track("page-viewed");
 * });
 */
export function useIdleCallback(
  callback: () => void,
  options?: { timeout?: number },
): void {
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(callback, {
        timeout: options?.timeout || 50,
      });
      return () => cancelIdleCallback(id);
    } else {
      // Fallback for browsers without requestIdleCallback
      const timer = setTimeout(callback, 0);
      return () => clearTimeout(timer);
    }
  }, [callback, options]);
}

/**
 * ⚡ Hook: Run heavy computation in worker thread
 *
 * Usage:
 * const result = useWebWorker(expensiveFunction, [input]);
 *
 * Note: Only works with pure functions (no closures)
 */
export function useWebWorker<T, R>(fn: (data: T) => R, data: T): R | undefined {
  const [result, setResult] = useState<R>();

  useEffect(() => {
    // Create inline worker
    const workerCode = `
      self.onmessage = function(e) {
        const result = (${fn.toString()})(e.data);
        self.postMessage(result);
      }
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (e) => {
      setResult(e.data);
      worker.terminate();
    };

    worker.postMessage(data);

    return () => {
      worker.terminate();
    };
  }, [data]);

  return result;
}

/**
 * ⚡ Example: Use throttle + debounce together for optimal scroll performance
 *
 * Common pattern for scroll listeners:
 * - Throttle rapid updates with RAF (60fps limit)
 * - Debounce final action with setTimeout
 */
export function useScrollListener(onScroll: (scrollY: number) => void): void {
  // ✅ Fixed: Added | null and initialized with null
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Cancel previous RAF
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      // Throttle with RAF
      rafRef.current = requestAnimationFrame(() => {
        // Debounce heavy work
        debounceRef.current = setTimeout(() => {
          onScroll(window.scrollY);
        }, 150);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [onScroll]);
}

/**
 * ⚡ Example: Lazy load heavy components only when visible
 *
 * Usage:
 * const ref = useRef<HTMLDivElement>(null);
 * const isVisible = useIntersectionObserver(ref);
 *
 * if (!isVisible) return <div ref={ref} />;
 * return <HeavyComponent />;
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  options?: IntersectionObserverInit,
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, ...options },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
}

const performanceHooks = {
  useDebounce,
  useThrottle,
  useIdleCallback,
  useWebWorker,
  useScrollListener,
  useIntersectionObserver,
};

export default performanceHooks;
