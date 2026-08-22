import type { Metadata, Viewport } from "next";
import { Hind } from "next/font/google";
import "./globals.css";
import { Disclaimer } from "@/components/Disclaimer";
import { QuickExit } from "@/components/QuickExit";

/** Hind covers Latin and Devanagari properly — neither is a fallback. */
const appSans = Hind({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-app-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sahaay — report cyber fraud in 60 seconds",
  description:
    "A proof of concept reimagining India's National Cyber Crime Reporting Portal. Freeze first, ask later — and freeze the amount, not the person.",
};

export const viewport: Viewport = {
  themeColor: "#f7f8fa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={appSans.variable}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <div className="flex min-h-dvh flex-col">
          <main id="main" className="flex-1">
            {children}
          </main>
          <Disclaimer />
        </div>
        <QuickExit />
      </body>
    </html>
  );
}
