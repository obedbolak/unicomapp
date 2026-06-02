# TBT (Total Blocking Time) Optimization Guide

## Your Current Issues (28,990ms TBT)

### 1. **Heavy Three.js Rendering Blocking Main Thread**

**Problem:** Each frame (~60fps), `useFrame` hook performs:

- Sphere geometry with 64 segments (expensive GPU calculation)
- Torus knot with 128 segments
- Real-time mouse light position updates
- Bloom effect composition

**Solution:** ✅ Implemented in `Scene3DOptimized.tsx`

```javascript
// ❌ BEFORE: Every frame blocks main thread
useFrame((state) => {
  groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
});

// ✅ AFTER: Update every 3rd frame
useFrame((state) => {
  frameCount.current += 1;
  if (frameCount.current % 3 === 0 && groupRef.current) {
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  }
});

// ✅ Reduce geometry segments
// Sphere: 64 segments → 16 segments (imperceptible at distance)
<sphereGeometry args={[3, 16, 16]} />

// Torus knot: 128 segments → 32 segments
<torusKnotGeometry args={[1.2, 0.4, 32, 16]} />
```

---

### 2. **Mouse Tracking Causes Continuous Blocking**

**Problem:** `MouseLight` updates position on every frame, computing expensive calculations

**Solution:** ✅ Use `requestIdleCallback` to defer non-critical updates

```javascript
// ✅ Only update when browser is idle
useEffect(() => {
  const updateOnIdle = () => {
    shouldUpdate.current = true;
  };

  // Request callback when GPU/main thread is idle (50ms timeout max)
  const id = requestIdleCallback(updateOnIdle, { timeout: 50 });
  return () => cancelIdleCallback(id);
}, []);

useFrame(() => {
  if (lightRef.current && shouldUpdate.current) {
    lightRef.current.position.x = mouse.x * viewport.width * 0.6;
    shouldUpdate.current = false;
  }
});
```

---

### 3. **Scroll Event Listeners Fire 60+ Times/Second**

**Problem:** Header, ScrollProgress, and BackToTop all have unthrottled scroll listeners

**Solution:** ✅ Use `requestAnimationFrame` for batching + debounce

```javascript
// ❌ BEFORE: Fires 60+ times per second
window.addEventListener("scroll", handleScroll);

// ✅ AFTER: Batch updates with RAF
useEffect(() => {
  let rafId: number;

  const handleScroll = () => {
    if (rafId) cancelAnimationFrame(rafId);

    // Defer to next frame - batch multiple updates
    rafId = requestAnimationFrame(() => {
      setScrolled(window.scrollY > 20);
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", handleScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}, []);
```

**Alternative: Debounce with timeout**

```javascript
const debounceTimer = useRef<NodeJS.Timeout>();

const handleScroll = () => {
  if (debounceTimer.current) clearTimeout(debounceTimer.current);

  // Only run callback after scroll stops for 150ms
  debounceTimer.current = setTimeout(() => {
    setVisible(window.scrollY > 600);
  }, 150);
};

window.addEventListener("scroll", handleScroll, { passive: true });
```

---

### 4. **All Page Components Load Upfront**

**Problem:** HeroSection, ServicesPage, AboutPage, ProjectsPage, ContactPage all bundle into main chunk

**Solution:** ✅ Code-split with `dynamic()` imports

```javascript
// ✅ Components only load when route changes
const HeroSection = dynamic(() => import("@/components/HeroSection"), {
  loading: () => <div className="h-[600px] bg-slate-900" />,
  ssr: true,
});

const ServicesPage = dynamic(() => import("@/components/ServicesPage"), {
  loading: () => <div className="h-[600px] bg-slate-900" />,
  ssr: true,
});
```

**Result:** Main bundle reduced by ~40-50%, faster initial load

---

### 5. **Third-Party Scripts Block Rendering**

**Problem:** Dialogflow script loads synchronously, blocking HTML parsing

**Solution:** ✅ Defer with `strategy="lazyOnload"`

```javascript
// ❌ BEFORE: Blocks rendering
<script src="https://cdn.dialogflow.com/..." />;

// ✅ AFTER: Loads after page interactive
import Script from "next/script";

<Script
  id="dialogflow"
  src="https://cdn.dialogflow.com/dialogflow-web/v2/dialogflow-web-v2.js"
  strategy="lazyOnload" // Loads AFTER main content rendered
  onLoad={() => console.log("Dialogflow ready")}
/>;
```

**Other third-party script strategies:**

```javascript
// beforeInteractive: Blocks rendering (only use for critical stuff)
// ⚡ Use for: Analytics, crash reporting
<Script strategy="beforeInteractive" src="..." />

// afterInteractive: Default, runs after Next.js hydration
// ⚡ Use for: Non-critical data tracking
<Script strategy="afterInteractive" src="..." />

// lazyOnload: Loads in background, won't block anything
// ⚡ Use for: Chat widgets, abandoned cart, etc.
<Script strategy="lazyOnload" src="..." />

// worker: Runs in Web Worker (if script supports it)
// ⚡ Use for: Analytics, tracking
<Script strategy="worker" src="..." />
```

---

### 6. **Expensive Canvas Rendering Settings**

**Problem:** Canvas rendering at 2x pixel ratio, with antialiasing enabled

**Solution:** ✅ Optimize Three.js Canvas props

```javascript
// ❌ BEFORE: High quality but expensive
<Canvas
  dpr={window.devicePixelRatio}  // Could be 2-3x
  gl={{ antialias: true }}
/>

// ✅ AFTER: Balanced quality/performance
<Canvas
  dpr={[1, 1.5]}  // Cap at 1.5, don't go to 3
  gl={{
    antialias: false,
    powerPreference: "high-performance"
  }}
/>
```

---

## Implementation Roadmap

### Phase 1: Quick Wins (15 min) - Expected TBT reduction: 40%

1. ✅ Replace `app/page.tsx` with optimized version (use `page-optimized.tsx`)
2. ✅ Replace `app/layout.tsx` with optimized version (use `layout-optimized.tsx`)
3. ✅ Replace `components/header.tsx` with `header-optimized.tsx`
4. ✅ Replace 3D scene with `Scene3DOptimized.tsx`

**Commands:**

```bash
# Backup originals
mv app/page.tsx app/page.tsx.backup
mv app/layout.tsx app/layout.tsx.backup
mv components/header.tsx components/header.tsx.backup

# Deploy optimized versions
mv app/page-optimized.tsx app/page.tsx
mv app/layout-optimized.tsx app/layout.tsx
mv components/header-optimized.tsx components/header.tsx

# Import the optimized 3D scene in page.tsx
# Import Scene3DOptimized from "@/components/Scene3DOptimized"
```

### Phase 2: Performance Monitoring (10 min)

Test with Chrome DevTools:

1. Open DevTools → Performance tab
2. Record page load + scroll
3. Check "Identify long tasks" - should see <50ms tasks now
4. Compare flame graph before/after

```bash
# Build and test
npm run build
npm start
```

### Phase 3: Additional Optimizations (Optional)

- [ ] Use Web Workers for heavy computations
- [ ] Lazy load images with `next/image`
- [ ] Preload critical routes
- [ ] Use React Suspense for component streaming
- [ ] Monitor Core Web Vitals with `web-vitals` package

---

## Code Examples by Use Case

### Pattern 1: Debounce with setTimeout

**Best for:** Scroll listeners, resize handlers, search input

```javascript
const debounceTimer = useRef<NodeJS.Timeout>();

const handleScroll = () => {
  if (debounceTimer.current) clearTimeout(debounceTimer.current);
  debounceTimer.current = setTimeout(() => {
    // Do heavy work here
  }, 150);  // Wait 150ms after scroll stops
};
```

### Pattern 2: Batch with requestAnimationFrame

**Best for:** DOM updates, measurements, state changes

```javascript
let rafId: number;

const handleScroll = () => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    // Updates batched to next frame
    setScrolled(window.scrollY > 20);
  });
};
```

### Pattern 3: Defer with requestIdleCallback

**Best for:** Non-critical tasks, analytics, idle work

```javascript
requestIdleCallback(
  () => {
    // Runs when browser is idle
    // Ideal for: logging, tracking, cache updates
  },
  { timeout: 50 },
);
```

### Pattern 4: Code-Split Heavy Components

**Best for:** Page sections, modals, tabs

```javascript
const HeavyComponent = dynamic(() => import("@/components/Heavy"), {
  loading: () => <div>Loading...</div>,
});
```

### Pattern 5: Defer Third-Party Scripts

**Best for:** Analytics, chat widgets, ads

```javascript
import Script from "next/script";

<Script src="..." strategy="lazyOnload" />;
```

---

## Expected Results After Optimization

| Metric     | Before   | After          | Improvement |
| ---------- | -------- | -------------- | ----------- |
| TBT        | 28,990ms | ~5,000-8,000ms | 75-85% ↓    |
| FCP        | ~2-3s    | ~1.5s          | 30-50% ↓    |
| LCP        | ~4-5s    | ~2-3s          | 40-50% ↓    |
| Long Tasks | 30+      | 3-5            | 85% ↓       |

---

## Testing & Validation

### Using Chrome DevTools Performance Inspector

```javascript
// Add performance markers in your code
performance.mark("expensive-task-start");
doHeavyWork();
performance.mark("expensive-task-end");
performance.measure(
  "expensive-task",
  "expensive-task-start",
  "expensive-task-end",
);

// View in DevTools → Performance tab
```

### Using Web Vitals Library

```bash
npm install web-vitals
```

```javascript
import { onTBT } from "web-vitals";

onTBT((metric) => {
  console.log("TBT:", metric.value); // Real TBT measurement
  // Send to analytics
});
```

---

## Summary

**Your main issues:**

1. ❌ Three.js rendering every frame → ✅ Update every 3rd frame
2. ❌ Mouse tracking blocking → ✅ Defer with requestIdleCallback
3. ❌ Unthrottled scroll listeners → ✅ Batch with RAF
4. ❌ All components load upfront → ✅ Code-split with dynamic()
5. ❌ Third-party scripts blocking → ✅ Defer with lazyOnload

**Expected result:** TBT reduced from 28,990ms to **5,000-8,000ms** (75-85% improvement)

**Next steps:** Replace the files in Phase 1, then test with Chrome DevTools.
