import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Unicom — We craft software teams love",
  description: "Strategy, design and engineering — one seamless team.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        {/* Clash Display for headings (optional extra weight) */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={dmSans.className}>
        <div className="app-wrapper">{children}</div>
      </body>
    </html>
  );
}
