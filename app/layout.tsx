import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import Header from "@/components/header";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-dm-sans",
  display: "swap",
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

  /* Open Graph (Facebook, Instagram, WhatsApp) */
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
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "UnicomTeam — Premium Software Engineering",
        type: "image/png",
      },
    ],
  },

  /* Twitter / X Meta Tags */
  twitter: {
    card: "summary_large_image",
    title: "UnicomTeam — Premium Software Engineering",
    description:
      "Bespoke engineering, interactive design, and premium growth strategy handled by a single seamless team.",
    images: ["/images/og-image.png"],
  },

  /* App Icons Configuration */
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico", // Or apple-touch-icon.png if available
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
        {/* Clash Display for headings */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={dmSans.className}>
        <Header />
        <div className="app-wrapper">
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  );
}
