# ⚡ Performance Optimization Quick Reference

## When to Use Each Technique

```
SCROLL/RESIZE/MOUSE MOVE (60+ events/sec)
├─ Use: useThrottle (requestAnimationFrame)
├─ Delay: ~16ms (next frame)
└─ Example: Scroll progress bar, header hide/show

SEARCH/FORM INPUT (User pauses)
├─ Use: useDebounce (setTimeout)
├─ Delay: 150-500ms
└─ Example: Email validation, auto-save

HEAVY MATH/IMAGE PROCESSING
├─ Use: useWebWorker (run in thread)
├─ Delay: Async
└─ Example: Image filters, data parsing

ANALYTICS/LOGGING (Not urgent)
├─ Use: useIdleCallback (requestIdleCallback)
├─ Delay: When CPU idle
└─ Example: Page views, crash reports

COMPONENTS BELOW FOLD
├─ Use: dynamic() + useIntersectionObserver
├─ Delay: Load when visible
└─ Example: Charts, heavy features
```

---

## Code Snippets (Copy-Paste Ready)

### 1. Throttle with RAF (Scroll)

```javascript
const [scrollY, setScrollY] = useState(0);
let rafId: number;

const handleScroll = () => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    setScrollY(window.scrollY);
  });
};

useEffect(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

### 2. Debounce with Timeout (Search)

```javascript
const [query, setQuery] = useState("");
const debounceRef = useRef<NodeJS.Timeout>();

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setQuery(e.target.value);

  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    performSearch(e.target.value);
  }, 300);
};
```

### 3. Defer with requestIdleCallback (Analytics)

```javascript
useEffect(() => {
  const id = requestIdleCallback(
    () => {
      // Send analytics
      fetch("/api/analytics", { method: "POST", body: JSON.stringify(data) });
    },
    { timeout: 50 },
  );

  return () => cancelIdleCallback(id);
}, []);
```

### 4. Lazy Load Component

```javascript
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <div>Loading...</div>,
});
```

### 5. Defer Script Tag

```javascript
import Script from "next/script";

<Script
  src="https://external.js"
  strategy="lazyOnload" // After main render
/>;
```

### 6. Optimize Canvas

```javascript
<Canvas
  dpr={[1, 1.5]} // Cap pixel ratio
  gl={{ antialias: false }} // Disable antialiasing
>
  {/* Scene */}
</Canvas>
```

### 7. Reduce Geometry Complexity

```javascript
// ❌ Before: 64 segments
<sphereGeometry args={[3, 64, 64]} />

// ✅ After: 16 segments
<sphereGeometry args={[3, 16, 16]} />
```

---

## Measurement Commands

### Lighthouse Score

```bash
# Full Lighthouse audit
npx lighthouse https://localhost:3000 --view

# Just Core Web Vitals
npx lighthouse https://localhost:3000 --only-categories=performance --view
```

### Monitor TBT

```javascript
import { onTBT } from "web-vitals";

onTBT((metric) => {
  console.log("TBT:", metric.value, "ms");
  // Target: < 10,000ms
});
```

### Check Performance

```bash
# Build analysis
npm run build
# Look at build output for bundle size

# Runtime profiling
npm run dev
# Open DevTools > Performance tab
# Record and analyze
```

---

## Common Patterns

| Problem              | Solution                | File                                 |
| -------------------- | ----------------------- | ------------------------------------ |
| TBT too high         | Break up tasks with RAF | `components/Scene3DOptimized.tsx`    |
| Scroll jank          | Throttle with RAF       | `components/header-optimized.tsx`    |
| Search slow          | Debounce input          | `examples/OptimizedSearch`           |
| Chart not visible    | Lazy load               | `examples/LazyLoadedChart`           |
| Analytics blocking   | Defer to idle           | `examples/PageWithDeferredAnalytics` |
| Form validation slow | Debounce validation     | `examples/OptimizedForm`             |
| Heavy math           | Web Worker              | `examples/HeavyCalculation`          |

---

## Performance Checklist

```javascript
// Before shipping:
[ ] All scroll listeners throttled
[ ] All inputs debounced
[ ] All heavy components lazy loaded
[ ] All third-party scripts deferred
[ ] Canvas optimized (dpr, antialias)
[ ] Geometry simplified
[ ] No synchronous fetches
[ ] No unmounted listeners
[ ] TBT < 10,000ms
[ ] No console errors
```

---

## Debugging TBT

### Find the blocking code:

```javascript
// Chrome DevTools > Performance
1. Record 5-10 seconds
2. Look for yellow/red bars in "Main" row
3. Click bar to see function that's blocking
4. Common causes:
   - Heavy computation
   - Large DOM updates
   - Multiple animations
   - Expensive event listeners
```

### Add performance markers:

```javascript
performance.mark("my-task-start");
expensiveFunction();
performance.mark("my-task-end");
performance.measure("my-task", "my-task-start", "my-task-end");

// View in DevTools > Performance tab
```

---

## Resources

- 🔗 [Web.dev - Long Tasks](https://web.dev/long-tasks-devtools/)
- 🔗 [MDN - requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- 🔗 [MDN - requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
- 🔗 [React - useCallback](https://react.dev/reference/react/useCallback)
- 🔗 [Next.js - dynamic()](https://nextjs.org/docs/app/building-your-application/optimizing/dynamic-imports)
- 🔗 [Three.js - Performance](https://threejs.org/docs/index.html#manual/en/introduction/How-to-run-things-locally)

---

## Key Takeaway

**Split long tasks into chunks < 50ms using:**

1. `requestAnimationFrame()` - Batch updates to next frame
2. `setTimeout()` - Defer work after action completes
3. `requestIdleCallback()` - Run when CPU is idle
4. `dynamic()` - Split code by route/component
5. `strategy="lazyOnload"` - Defer third-party scripts

**Expected results:**

- TBT: 28,990ms → 5,000-8,000ms (75-85% reduction)
- FCP: Faster initial render
- Scroll: Smooth 60 FPS
- Interactivity: Responsive UI
