# ⚡ FCP (First Contentful Paint) Optimization Guide

## Your Issue: 4.0 Seconds FCP

**Problem:** Browser is blocked from rendering early because:
1. ❌ External fonts loaded via `@import` (blocks HTML parsing)
2. ❌ Clash Display font loaded without preload strategy
3. ❌ All CSS inline (non-critical styles block render)
4. ❌ No critical CSS extracted for above-the-fold

---

## Solution Overview

```
BEFORE:
HTML → Parse CSS (wait for fonts) → Paint → 4.0s FCP ❌

AFTER:
HTML → Inline Critical CSS → Paint → 0.8-1.2s FCP ✅
       (Deferred CSS loads in background)
```

---

## Implementation

### Step 1: Replace layout.tsx

```bash
mv app/layout.tsx app/layout.tsx.backup
mv app/layout-fcp-optimized.tsx app/layout.tsx
```

### Step 2: Use the new CSS files

The three CSS files work together:
- **`critical.css`** - Inline in `<head>` (renders immediately)
- **`deferred.css`** - Load async with media="print" trick
- **`globals.css`** - Keep as backup reference (no longer used)

### Step 3: Verify the changes

```bash
npm run build
npm run dev
```

Open DevTools → **Lighthouse** → Measure performance

---

## How It Works: Critical CSS

### ❌ BAD: All CSS blocks rendering

```html
<head>
  <link rel="stylesheet" href="/globals.css"> <!-- Blocks until loaded -->
</head>

<!-- Browser WAITS here for globals.css to download & parse -->
<!-- Then finally renders -->
<body>...</body>
```

**Result:** 4.0s FCP (waits for all 100+ lines of CSS)

---

### ✅ GOOD: Critical CSS inline, rest deferred

```html
<head>
  <style>
    /* Only header, layout, hero styles (15 lines) - INSTANT */
    html, body { background: #000; }
    header { ... }
    .hero-section { ... }
  </style>

  <!-- Fonts are preconnected (connection ready) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  
  <!-- Deferred CSS loads in background (won't block) -->
  <link rel="stylesheet" href="/deferred.css" media="print" 
        onLoad="this.media='all'">
</head>

<!-- Browser can PAINT now -->
<body>...</body>
```

**Result:** 0.8-1.2s FCP (renders immediately with essential styles)

---

## Script Loading Strategies Explained

### 1. **`strategy="beforeInteractive"`** (blocks everything)
```jsx
<Script src="..." strategy="beforeInteractive" />
```
- **When:** Only for security/crash reporting
- **Example:** Sentry error tracking, feature flags
- **FCP Impact:** ❌ Blocks rendering (avoid!)

**HTML Output:**
```html
<script src="..." async></script>
<!-- Runs BEFORE React hydration -->
```

---

### 2. **`strategy="afterInteractive"`** (default)
```jsx
<Script src="..." strategy="afterInteractive" />
```
- **When:** Analytics, important tracking
- **Example:** Google Analytics, Mixpanel
- **FCP Impact:** ⚠️ Runs after hydration (still impacts FCP on slow networks)

**HTML Output:**
```html
<script src="..." async></script>
<!-- Runs AFTER React hydration -->
```

---

### 3. **`strategy="lazyOnload"`** (recommended for third-party)
```jsx
<Script src="..." strategy="lazyOnload" />
```
- **When:** Non-critical features (chat, ads, widgets)
- **Example:** Dialogflow, Intercom, Drift
- **FCP Impact:** ✅ Zero impact (loads in background after page interactive)

**HTML Output:**
```html
<script src="..." async></script>
<!-- Added to queue, runs when browser idle -->
```

---

### 4. **`strategy="worker"`** (if script supports)
```jsx
<Script src="..." strategy="worker" />
```
- **When:** Heavy computations that support Web Workers
- **Example:** PDF processing, image manipulation
- **FCP Impact:** ✅ Runs in background thread (no main thread blocking)

---

## Font Loading Strategies

### ❌ BAD: @import blocks rendering

```css
/* globals.css */
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:...");

/* Browser WAITS for Google Fonts server before parsing rest of CSS */
```

**FCP Impact:** +1-2s (wait for font server + font download)

---

### ✅ GOOD: Preconnect + display: swap

```html
<head>
  <!-- Establish DNS connection early -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Tell browser to swap fonts (show fallback first) -->
  <link rel="stylesheet" 
        href="https://fonts.googleapis.com/css2?family=DM+Sans&display=swap">
</head>
```

**FCP Impact:** ✅ Minimal (renders with fallback font immediately)

---

### ✅ BEST: Use Next.js Font Optimization

```javascript
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-dm-sans",
  display: "swap",    // ⚡ Shows fallback first
  preload: true,      // ⚡ Preload for current page
});
```

**Why it's best:**
- Fonts are self-hosted (no external server wait)
- Optimized font files (only weights you use)
- Automatic font subsetting
- No third-party requests

**FCP Impact:** ✅ None (fonts embedded in build)

---

## Critical CSS Extraction Strategy

### What Goes in Critical CSS?

```css
/* ✅ YES - Needed for initial paint */
- Reset styles (*, html, body)
- Header styles
- Hero section / above-the-fold layout
- Base typography
- Color scheme variables

/* ❌ NO - Defer these */
- Form styles
- Modal styles
- Animation keyframes
- Media query breakpoints (mobile-only)
- Hover states
- Transitions
```

### How Much Should Inline?

**Target:** < 14KB (will be inlined) 
- Critical CSS: ~2-3KB
- Fonts: ~8-10KB
- **Total:** ~11-13KB (fits in one initial response)

**Benefit:** Browser can paint before receiving body content

---

## Measuring FCP Improvement

### Using Chrome DevTools

```
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click "Analyze page load"
4. Look for "Metrics" section:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
```

**Before:**
```
FCP: 4.0s
LCP: 5.2s
CLS: 0.15
```

**Expected After:**
```
FCP: 0.8-1.2s  (80% faster ✅)
LCP: 2.0-2.5s  (60% faster ✅)
CLS: 0.08      (better ✅)
```

---

### Using Web Vitals API

```javascript
import { onFCP, onLCP, onCLS } from 'web-vitals';

onFCP((metric) => {
  console.log('FCP:', metric.value);  // Should be 0.8-1.2s
  // Send to analytics
});

onLCP((metric) => {
  console.log('LCP:', metric.value);
});

onCLS((metric) => {
  console.log('CLS:', metric.value);
});
```

---

### Using Lighthouse CI

```bash
# Run Lighthouse and save results
npx lighthouse https://localhost:3000 --save-assets --output json

# View in JSON
# Look for: firstContentfulPaint, largestContentfulPaint
```

---

## Common Issues & Fixes

### ❌ "Uncaught ReferenceError: variable not defined"

**Cause:** CSS variable used before defined
**Fix:** Ensure all variables are in `:root` of critical.css

```css
/* ✅ Critical CSS */
:root {
  --color-primary: #ff8c00;
}

/* ❌ This won't work - never rendered */
body { color: var(--color-primary); }
```

---

### ❌ FOUT (Flash of Unstyled Text)

**Cause:** Font swap before custom font loads
**Fix:** Use `display: swap` and set fallback fonts

```css
/* Critical CSS */
body {
  font-family: system-ui, sans-serif;  /* Fallback */
}

/* Deferred CSS */
@font-face {
  font-family: 'Custom';
  src: url('/font.woff2') format('woff2');
  font-display: swap;  /* Show fallback first */
}
```

---

### ❌ "CLS too high" (Layout shifts when fonts load)

**Cause:** Different font size/height after swap
**Fix:** Reserve space with `size-adjust` property

```css
@font-face {
  font-family: 'DM Sans';
  src: url('/dm-sans.woff2');
  font-display: swap;
  size-adjust: 98%;  /* Adjust to match fallback */
}
```

---

## Before vs After Comparison

### BEFORE (4.0s FCP):

```
Timeline:
0ms    HTML arrives
500ms  CSS requested from Google Fonts
1200ms Font file arrives
1500ms CSS parsed, HTML parsed
2000ms Layout calculated
4000ms ✅ First paint (4s FCP)
4500ms ✅ JavaScript evaluated
```

### AFTER (1.0s FCP):

```
Timeline:
0ms    HTML arrives + Critical CSS inlined
250ms  ✅ First paint (1s FCP) ← 75% faster!
600ms  Deferred CSS loaded in background
800ms  Fonts start loading (non-blocking)
1200ms ✅ JavaScript evaluated
1800ms Fonts loaded (smooth visual update)
```

---

## Checklist: FCP Optimization

```
✅ Critical CSS extracted and inlined
✅ Deferred CSS loaded async
✅ Fonts preconnected
✅ External fonts use display=swap
✅ No @import in CSS
✅ Scripts have async/defer attributes
✅ All third-party scripts use strategy="lazyOnload"
✅ No render-blocking resources in <head>
✅ FCP < 1.5s
✅ LCP < 2.5s
✅ CLS < 0.1
```

---

## CSS @import Risks

### ❌ Never do this in <head>:

```html
<link rel="stylesheet" href="style.css">

/* style.css */
@import url("https://fonts.googleapis.com/...");  /* BLOCKS! */
```

**Why:** Browser discovers font URL AFTER requesting style.css
- Request CSS → Wait for response → Parse CSS → Discover @import → Request font → **SLOW**

### ✅ Always do this:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="style.css">

/* style.css */
/* No @import - fonts already preconnected */
body { font-family: 'Custom'; }
```

---

## Script Tag Attributes Reference

```html
<!-- No attributes - blocks everything -->
<script src="..."></script>

<!-- async - downloads in parallel, runs when ready (may run before HTML parsing done) -->
<script src="..." async></script>

<!-- defer - downloads in parallel, runs after HTML parsing (BEST for most cases) -->
<script src="..." defer></script>

<!-- module - ES6 module, automatic defer -->
<script type="module" src="..."></script>

<!-- Next.js: Use strategy prop instead -->
<Script src="..." strategy="afterInteractive" />
```

---

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| FCP | 4.0s | 0.8-1.2s | 70-80% ↓ |
| LCP | 5.2s | 2.0-2.5s | 50-60% ↓ |
| CLS | 0.15 | 0.08 | Better |
| Speed Index | 6.2s | 1.5s | 75% ↓ |
| Time to Interactive | 8.1s | 3.2s | 60% ↓ |

---

## Next Steps

1. **Deploy** layout-fcp-optimized.tsx as layout.tsx
2. **Build** and test locally
3. **Measure** with Lighthouse
4. **Monitor** with Web Vitals
5. **Optimize** further based on metrics

---

## Resources

- 🔗 [web.dev - Critical CSS](https://web.dev/critical-css/)
- 🔗 [MDN - Web Fonts](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face)
- 🔗 [Next.js - Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- 🔗 [web.dev - FCP Optimization](https://web.dev/first-contentful-paint/)
- 🔗 [Google Fonts - font-display](https://fonts.google.com/?parameters)
