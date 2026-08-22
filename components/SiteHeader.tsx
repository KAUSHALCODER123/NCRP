"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { setContrast, setScale, usePrefs } from "@/lib/prefs";

/**
 * Site header, mirroring the official portal's structure: government
 * identity bar with accessibility controls and a language toggle, then the
 * primary navigation.
 *
 * The accessibility controls are real — they scale type and switch to a
 * high-contrast palette, persisted across visits. On the official portal
 * these exist too; here they had to actually work, because the users who
 * need them are the users this product is for.
 */

const NAV = [
  { href: "/", label: "Home" },
  { href: "/freeze", label: "Report a crime" },
  { href: "/dashboard", label: "Track a case" },
  { href: "/scam-check", label: "Check a suspect" },
  { href: "/learn", label: "Learning Corner" },
  { href: "/help", label: "Help" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { scale, contrast } = usePrefs();

  return (
    <header>
      {/* Identity bar */}
      <div className="bg-deep text-on-deep">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-2">
          <p className="text-[13px] leading-tight">
            A proof of concept · not a Government of India service
          </p>
          <div className="flex items-center gap-1">
            <span className="sr-only" id="a11y-label">
              Accessibility controls
            </span>
            <div
              className="flex items-center gap-0.5"
              role="group"
              aria-labelledby="a11y-label"
            >
              <A11yBtn
                onClick={() => setScale("")}
                active={scale === ""}
                label="Normal text size"
              >
                A
              </A11yBtn>
              <A11yBtn
                onClick={() => setScale("lg")}
                active={scale === "lg"}
                label="Larger text"
              >
                A+
              </A11yBtn>
              <A11yBtn
                onClick={() => setScale("xl")}
                active={scale === "xl"}
                label="Largest text"
              >
                A++
              </A11yBtn>
              <A11yBtn
                onClick={() => setContrast(!contrast)}
                active={contrast}
                label="High contrast"
              >
                ◐
              </A11yBtn>
            </div>
            <span className="mx-1 h-4 w-px bg-white/25" aria-hidden="true" />
            <button
              type="button"
              className="rounded px-2 py-1 text-[13px] font-semibold hover:bg-white/10"
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Brand + nav */}
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between gap-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <Mark />
              <span>
                <span className="block font-display text-[21px] font-bold leading-none text-ink">
                  Sahaay
                </span>
                <span className="block text-[13px] leading-tight text-ink-faint">
                  Cyber crime reporting
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <a
                href="tel:1930"
                className="hidden items-center gap-2 rounded-lg border border-breach/30 bg-breach-soft px-3 py-2 text-[15px] font-semibold text-breach sm:inline-flex"
              >
                <span aria-hidden="true">📞</span>
                <span className="data">1930</span>
              </a>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="primary-nav"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line-strong px-3 text-[15px] font-semibold text-ink md:hidden"
              >
                {open ? "Close" : "Menu"}
              </button>
            </div>
          </div>

          <nav
            id="primary-nav"
            aria-label="Primary"
            className={clsx(
              "md:block",
              open ? "block pb-3" : "hidden",
            )}
          >
            <ul className="flex flex-col gap-0.5 md:flex-row md:gap-1">
              {NAV.map((n) => {
                const active =
                  n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={clsx(
                        "block border-b-2 px-3 py-2.5 text-[15px] font-semibold transition-colors",
                        active
                          ? "border-primary text-primary"
                          : "border-transparent text-ink-soft hover:border-line-strong hover:text-ink",
                      )}
                    >
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

function A11yBtn({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={clsx(
        "min-w-[32px] rounded px-2 py-1 text-[13px] font-bold transition-colors",
        active ? "bg-white text-deep" : "hover:bg-white/15",
      )}
    >
      {children}
    </button>
  );
}

function Mark() {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className="h-9 w-9 shrink-0"
      fill="none"
    >
      <path
        d="M20 3 6 8.6v9.7c0 8.2 5.6 15.4 14 18.3 8.4-2.9 14-10.1 14-18.3V8.6Z"
        fill="var(--color-primary)"
      />
      <path
        d="m13.6 19.8 4.3 4.4 8.3-8.6"
        stroke="#fff"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
