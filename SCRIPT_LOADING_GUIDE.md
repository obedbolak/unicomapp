# 📜 Script Loading Strategies - Complete Reference

## Quick Decision Tree

```
Is the script critical for page render?
├─ YES → Use strategy="beforeInteractive"
│        Examples: Crash reporters, feature flags
│        FCP Impact: ❌ Blocks rendering
│
└─ NO → Is it important for first interaction?
         ├─ YES → Use strategy="afterInteractive"
         │        Examples: Analytics, tracking
         │        FCP Impact: ⚠️ Slight impact
         │
         └─ NO → Use strategy="lazyOnload" ✅
                  Examples: Chat, ads, dialogs
                  FCP Impact: ✅ None
```

---

## Strategy Comparison Table

| Strategy | Load Timing | Execute Timing | FCP Impact | Use Case |
|----------|-------------|---------------|-----------|-|
| `beforeInteractive` | Before hydration | Before hydration | ❌ Blocks | Crashes, security |
| `afterInteractive` | After HTML loads | After hydration | ⚠️ Slight | Analytics, tracking |
| `lazyOnload` | When idle | When idle | ✅ None | Chat, ads, widgets |
| `worker` | Parallel thread | In Web Worker | ✅ None | Heavy computation |

---

## Example 1: Analytics (use `afterInteractive`)

```typescript
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}

        {/* ✅ GOOD: Analytics tracks page views after render */}
        <Script
          id="google-analytics"
          src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
          strategy="afterInteractive"
        />
        <Script
          id="ga-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_ID');
            `,
          }}
        />
      </body>
    </html>
  );
}
```

**Result:** FCP unaffected, analytics loads after page render

---

## Example 2: Chat Widget (use `lazyOnload`)

```typescript
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}

        {/* ✅ BEST: Chat loads in background, zero FCP impact */}
        <Script
          id="intercom"
          src="https://widget.intercom.io/widget/ABC123"
          strategy="lazyOnload"
          onLoad={() => {
            // Intercom is ready
            if (window.Intercom) {
              window.Intercom('boot', {
                app_id: 'ABC123',
              });
            }
          }}
        />
      </body>
    </html>
  );
}
```

**Result:** Chat loads only when user might interact, zero FCP impact

---

## Example 3: Error Tracking (use `beforeInteractive`)

```typescript
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}

        {/* ⚠️ ONLY if critical: Sentry error tracking */}
        {/* This DOES block rendering, but catches all errors */}
        <Script
          id="sentry"
          src="https://js.sentry-cdn.com/ABC123.min.js"
          strategy="beforeInteractive"
          onLoad={() => {
            window.sentryLoaded = true;
          }}
        />
      </body>
    </html>
  );
}
```

**Result:** All JS errors caught, but FCP is delayed by ~100-200ms

---

## Example 4: Multiple Scripts with Different Strategies

```typescript
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}

        {/* ✅ Crash tracking - only if absolutely essential */}
        <Script
          id="sentry"
          src="https://js.sentry-cdn.com/ABC123.min.js"
          strategy="beforeInteractive"
        />

        {/* ✅ Analytics - important but not render-critical */}
        <Script
          id="analytics"
          src="https://www.google-analytics.com/analytics.js"
          strategy="afterInteractive"
        />

        {/* ✅ Chat - optional feature */}
        <Script
          id="drift"
          src="https://js.driftt.com/include/ABC123/platform.js"
          strategy="lazyOnload"
        />

        {/* ✅ Ads - lowest priority */}
        <Script
          id="ads"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          strategy="lazyOnload"
          async
        />
      </body>
    </html>
  );
}
```

**Execution order:**
1. Sentry (beforeInteractive) - Blocks everything
2. Page renders (FCP happens here)
3. React hydrates
4. Google Analytics (afterInteractive) runs
5. When user might interact:
   - Drift (lazyOnload) loads
   - AdSense (lazyOnload) loads

---

## Example 5: Inline Script with Strategy

```typescript
import Script from 'next/script';

export default function Page() {
  return (
    <>
      {/* ✅ Load external script async */}
      <Script
        id="custom"
        src="/custom.js"
        strategy="afterInteractive"
      />

      {/* ✅ Run inline JavaScript after hydration */}
      <Script
        id="init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            console.log('Page initialized');
            
            // Initialize custom features
            if (window.CustomLib) {
              window.CustomLib.init({ theme: 'dark' });
            }
          `,
        }}
      />
    </>
  );
}
```

---

## Example 6: Conditional Script Loading

```typescript
import Script from 'next/script';
import { useRouter } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isProd = process.env.NODE_ENV === 'production';

  return (
    <html>
      <body>
        {children}

        {/* ✅ Only load analytics in production */}
        {isProd && (
          <Script
            id="analytics"
            src="https://www.google-analytics.com/analytics.js"
            strategy="afterInteractive"
          />
        )}

        {/* ✅ Load A/B testing script conditionally */}
        {isProd && (
          <Script
            id="optimizely"
            src="https://cdn.optimizely.com/js/ABC123.js"
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
```

---

## Example 7: Script with Error Handling

```typescript
import Script from 'next/script';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Monitor script loading failures
    const handleScriptError = (e: Event) => {
      const target = e.target as HTMLScriptElement;
      console.error(`Failed to load script: ${target.src}`);
      // Fallback behavior
    };

    document.addEventListener('error', handleScriptError, true);
    return () => document.removeEventListener('error', handleScriptError, true);
  }, []);

  return (
    <html>
      <body>
        {children}

        {/* Script with error callback */}
        <Script
          id="analytics"
          src="https://www.google-analytics.com/analytics.js"
          strategy="afterInteractive"
          onError={() => {
            console.warn('Analytics failed to load');
            // Track failure somewhere else
          }}
        />
      </body>
    </html>
  );
}
```

---

## Example 8: Lazy Load Script on User Interaction

```typescript
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function ChatWidget() {
  const [showChat, setShowChat] = useState(false);

  // Load chat script only when user clicks the button
  const handleOpenChat = () => {
    setShowChat(true);
  };

  return (
    <>
      <button onClick={handleOpenChat}>Open Chat</button>

      {/* ✅ Only load chat script if user actually opens it */}
      {showChat && (
        <Script
          id="intercom"
          src="https://widget.intercom.io/widget/ABC123"
          strategy="lazyOnload"
          onLoad={() => {
            window.Intercom?.('boot', { app_id: 'ABC123' });
          }}
        />
      )}
    </>
  );
}
```

**FCP Impact:** Zero! Chat only loads if user shows interest

---

## Real-World Priority Matrix

```
┌─────────────────────────────────────────────────┐
│ Critical              │ High Priority           │
│ (beforeInteractive)   │ (afterInteractive)      │
├─────────────────────────────────────────────────┤
│ • Sentry              │ • Google Analytics      │
│ • Feature flags       │ • Hotjar                │
│ • Crash reporter      │ • Amplitude             │
│ • Security check      │ • Mixpanel              │
├─────────────────────────────────────────────────┤
│ Nice to Have          │ Low Priority            │
│ (lazyOnload)          │ (lazyOnload)            │
├─────────────────────────────────────────────────┤
│ • Drift Chat          │ • Google Ads            │
│ • Intercom            │ • Facebook Pixel        │
│ • Olark               │ • LinkedIn Insight      │
│ • Calendly embed      │ • Twitter Pixel         │
└─────────────────────────────────────────────────┘
```

---

## Before vs After: Execution Timeline

### BEFORE (All scripts loaded early):

```
0ms    HTML loading
500ms  script[1] loading (analytics)
600ms  script[1] done ✓
700ms  script[2] loading (chat)
800ms  script[2] done ✓
900ms  script[3] loading (ads)
1000ms script[3] done ✓
1100ms ✅ FINALLY: FCP (1.1s)
1200ms React hydration
1500ms Page interactive
```

### AFTER (Smart script loading):

```
0ms    HTML loading + Critical CSS inlined
200ms  ✅ FCP (0.2s) - 5x faster! 🚀
400ms  React hydration
500ms  script[1] loading (analytics) - afterInteractive
600ms  script[1] done ✓
700ms  ✅ Page interactive
800ms  script[2] queued (chat/ads) - lazyOnload
1000ms When browser idle:
1100ms  script[2] loading (chat)
1200ms  script[3] loading (ads)
```

**FCP improved by 5x (1.1s → 0.2s)!**

---

## TypeScript Definitions for Scripts

```typescript
import Script, { ScriptProps } from 'next/script';

interface CustomScriptProps extends ScriptProps {
  id: string;
  src?: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
  onLoad?: () => void;
  onError?: () => void;
  onReady?: () => void;
  dangerouslySetInnerHTML?: { __html: string };
  children?: React.ReactNode;
}

// Example typed component
function MyScript(props: CustomScriptProps) {
  return <Script {...props} />;
}
```

---

## Checklist: Script Loading Optimization

```
✅ All analytics use strategy="afterInteractive"
✅ Chat/ads use strategy="lazyOnload"
✅ Only crash reporters use strategy="beforeInteractive"
✅ No inline <script> tags in <head>
✅ All scripts have id attribute
✅ Error handlers defined for critical scripts
✅ Conditional loading for prod-only scripts
✅ FCP < 1.2s
✅ No render-blocking third-party scripts
✅ Scripts tested in slow network (DevTools Throttling)
```

---

## Testing Script Impact

### Measure with DevTools

```
1. Open DevTools → Network tab
2. Set throttling: "Slow 4G"
3. Check "Disable cache"
4. Reload page
5. In Performance tab, look for script load timing
6. Should not overlap with FCP marker
```

### Monitor with Lighthouse

```bash
npx lighthouse https://localhost:3000 \
  --output json \
  | grep -E "firstContentfulPaint|largestContentfulPaint"
```

### Web Vitals Monitoring

```javascript
import { onFCP } from 'web-vitals';

onFCP((metric) => {
  // Should be < 1.2s
  console.log('FCP:', metric.value);
});
```

---

## Common Mistakes

### ❌ DON'T: Load analytics with beforeInteractive

```typescript
// ❌ WRONG: Blocks FCP
<Script
  id="analytics"
  src="https://www.google-analytics.com/analytics.js"
  strategy="beforeInteractive"  // ❌ No!
/>
```

### ✅ DO: Use afterInteractive for analytics

```typescript
// ✅ CORRECT: Doesn't block FCP
<Script
  id="analytics"
  src="https://www.google-analytics.com/analytics.js"
  strategy="afterInteractive"  // ✅ Yes!
/>
```

---

### ❌ DON'T: Use lazyOnload for tracking

```typescript
// ❌ WRONG: Tracking too late
<Script
  src="https://tracking.example.com/analytics.js"
  strategy="lazyOnload"  // ❌ May miss events
/>
```

### ✅ DO: Use afterInteractive for tracking

```typescript
// ✅ CORRECT: Tracks user quickly
<Script
  src="https://tracking.example.com/analytics.js"
  strategy="afterInteractive"  // ✅ Yes!
/>
```

---

## Summary

| Type | Strategy | FCP Impact |
|------|----------|-----------|
| Crash reporting | beforeInteractive | ❌ Slow |
| Analytics | afterInteractive | ⚠️ OK |
| Chat/Ads | lazyOnload | ✅ Fast |
| Heavy computation | worker | ✅ Fast |

**Rule of thumb:** Use the least blocking strategy that still works for your use case.
