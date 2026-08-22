import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Sans_Devanagari,
  IBM_Plex_Serif,
  IBM_Plex_Mono,
  Noto_Sans_Gujarati,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Noto_Sans_Kannada,
} from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { QuickExit } from "@/components/QuickExit";
import { Assistant } from "@/components/Assistant";
import Script from "next/script";
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

/* IBM Plex covers Latin and Devanagari (Hindi, Marathi). The other four
   scripts need their own faces. All four sit in the same font stack, and
   because next/font emits unicode-range subsets, a browser downloads a
   file only when that script actually appears on screen — a Hindi reader
   never pays for Tamil. */
const notoGu = Noto_Sans_Gujarati({
  subsets: ["gujarati"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-gu",
  display: "swap",
});
const notoTa = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ta",
  display: "swap",
});
const notoTe = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-te",
  display: "swap",
});
const notoKn = Noto_Sans_Kannada({
  subsets: ["kannada"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kn",
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
      className={`${plexSerif.variable} ${plexSans.variable} ${plexMono.variable} ${notoGu.variable} ${notoTa.variable} ${notoTe.variable} ${notoKn.variable}`}
    >
      <body className="min-h-dvh antialiased">
        {/* Applies saved theme, text scale and language before first paint.
            next/script with beforeInteractive is the sanctioned way to do
            this; a bare <script> in the tree is treated as a React child and
            logs an error. */}
        <Script id="prefs" strategy="beforeInteractive">
          {PREFS_SCRIPT}
        </Script>
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
        <Assistant />
        <QuickExit />
      </body>
    </html>
  );
}
