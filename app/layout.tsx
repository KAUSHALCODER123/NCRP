import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Sans_Devanagari,
  IBM_Plex_Serif,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { QuickExit } from "@/components/QuickExit";
import { PREFS_SCRIPT } from "@/lib/prefs";

/* Display — institutional authority, used with restraint. */
const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-plex-serif",
  display: "swap",
});

/* UI — Devanagari and Latin as equals, not one falling back to the other. */
const plexSans = IBM_Plex_Sans_Devanagari({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

/* Data — every amount, reference, case ID and clock. */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sahaay — report cyber fraud in 60 seconds",
  description:
    "A proof of concept reimagining India's National Cyber Crime Reporting Portal. Freeze first, ask later — and freeze the amount, not the person.",
};

export const viewport: Viewport = {
  themeColor: "#0a1a2f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plexSerif.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <head>
        {/* Applies saved text-scale and contrast before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        <QuickExit />
      </body>
    </html>
  );
}
