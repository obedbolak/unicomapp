import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";

// Import critical CSS (will be inlined)
import criticalCssModule from "./critical.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true, // Preload this font for faster delivery
});

const siteUrl = "https://www.unicomteam.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "UnicomTeam — We Craft Software Teams Love",
    template: "%s | UnicomTeam",
  },
  description:
    "Elite strategy, high-fidelity design, and bespoke engineering. We operate as your distributed product force to build robust software systems that scale.",
  keywords: [
    "UnicomTeam",
    "Software Development",
    "Web Development",
    "Mobile App Development",
    "UI/UX Design",
    "Digital Marketing",
    "Business Strategy",
    "Next.js Developer",
  ],
  authors: [{ name: "UnicomTeam", url: siteUrl }],
  creator: "UnicomTeam",
  publisher: "UnicomTeam",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "UnicomTeam — We Craft Software Teams Love",
    description:
      "Bespoke engineering, interactive design, and premium growth strategy handled by a single seamless team.",
    siteName: "UnicomTeam",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "UnicomTeam Premium Digital Infrastructure",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "UnicomTeam — Premium Software Engineering",
    description:
      "Bespoke engineering, interactive design, and premium growth strategy handled by a single seamless team.",
    images: ["/images/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#000814",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        {/* ⚡ CRITICAL: Preconnect to font services to speed up connection */}
        {/* This establishes connection early, reducing latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://api.fontshare.com" />

        {/* ⚡ CRITICAL: Inline critical CSS directly in <head>
            This prevents render-blocking and allows immediate painting
            Size: ~2KB minified - negligible impact on HTML size
        */}
        <style
          dangerouslySetInnerHTML={{ __html: criticalCssModule }}
          suppressHydrationWarning
        />

        {/* ⚡ CRITICAL: DNS Prefetch for external APIs
            Resolves DNS before the browser needs it
        */}
        <link rel="dns-prefetch" href="https://cdn.dialogflow.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* ⚡ OPTIMIZED: Clash Display font with proper loading strategy
            Preload tells browser this is important, display=swap prevents FOIT
        */}
        <link
          rel="preload"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@700,800&display=swap"
          as="style"
          onLoad={(e) => {
            if (e instanceof Event && e.target instanceof HTMLLinkElement) {
              e.target.onload = null;
              e.target.rel = "stylesheet";
            }
          }}
        />
        <noscript>
          <link
            href="https://api.fontshare.com/v2/css?f[]=clash-display@700,800&display=swap"
            rel="stylesheet"
          />
        </noscript>

        {/* ⚡ OPTIMIZED: Load deferred CSS asynchronously
            Uses media="print" trick: loads as print, then switches to "all" onload
            This prevents render-blocking while still loading all styles
        */}
        <link
          rel="stylesheet"
          href="/app/deferred.css"
          media="print"
          onLoad={(e) => {
            if (e instanceof Event && e.target instanceof HTMLLinkElement) {
              e.target.media = "all";
            }
          }}
        />
        <noscript>
          <link rel="stylesheet" href="/app/deferred.css" media="all" />
        </noscript>
      </head>
      <body className={dmSans.className}>
        <div className="app-wrapper">{children}</div>

        {/* ⚡ OPTIMIZED: Defer non-critical scripts
            strategy="lazyOnload" ensures they load AFTER the page becomes interactive
            This is the safest strategy for third-party scripts
        */}
        <Script
          id="dialogflow"
          src="https://cdn.dialogflow.com/dialogflow-web/v2/dialogflow-web-v2.js"
          strategy="lazyOnload"
          onLoad={() => {
            console.log("Dialogflow loaded");
          }}
        />

        {/* ⚡ OPTIONAL: Google Analytics (uncomment if using)
            Using strategy="afterInteractive" to not block, but load faster than lazyOnload
        */}
        {/* <Script
          id="google-analytics"
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        /> */}

        {/* ⚡ TIP: For any other third-party scripts, use:
            - strategy="beforeInteractive" - Only for critical stuff (crashes, security)
            - strategy="afterInteractive" - For important but not urgent (analytics)
            - strategy="lazyOnload" - For everything else (chat, ads, widgets)
        */}
      </body>
    </html>
  );
}
