import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-dm-sans",
  display: "swap", // Use font-display: swap to prevent FOUT
});

/* ── PRODUCTION METADATA CONFIGURATION ────────────────────────────────────── */

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

  /* Open Graph (Facebook, LinkedIn, WhatsApp) */
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

  /* Twitter / X Meta Tags */
  twitter: {
    card: "summary_large_image",
    title: "UnicomTeam — Premium Software Engineering",
    description:
      "Bespoke engineering, interactive design, and premium growth strategy handled by a single seamless team.",
    images: ["/images/og-image.jpg"],
  },

  /* App Icons Configuration */
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

/* Viewport configurations separated from Metadata (Next.js 14+ standard) */
export const viewport: Viewport = {
  themeColor: "#000814",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/* ── ROOT LAYOUT ─────────────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        {/* ⚡ OPTIMIZED: Load Clash Display with font-display: swap */}
        {/* This prevents blocking rendering while the font loads */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@700,800&display=swap"
          rel="preload"
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
      </head>
      <body className={dmSans.className}>
        <div className="app-wrapper">{children}</div>

        {/* ⚡ OPTIMIZED: Defer Dialogflow script to worker thread */}
        {/* This script runs AFTER the main content loads, not blocking rendering */}
        <Script
          id="dialogflow"
          src="https://cdn.dialogflow.com/dialogflow-web/v2/dialogflow-web-v2.js"
          strategy="lazyOnload" // Loads after the page becomes interactive
          onLoad={() => {
            // Initialize only when needed
            console.log("Dialogflow loaded");
          }}
        />

        {/* ⚡ OPTIONAL: Google Analytics - also deferred */}
        {/* Uncomment if you use Google Analytics */}
        {/* <Script
          id="google-analytics"
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics-config"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        /> */}
      </body>
    </html>
  );
}
