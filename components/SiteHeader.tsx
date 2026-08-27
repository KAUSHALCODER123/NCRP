"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { IconPhone } from "@/components/icons";
import { Wordmark } from "@/components/Logo";
import { LOCALES, setLocale, useLocale, useT, type Locale } from "@/lib/i18n";
import { setContrast, setScale, setTheme, usePrefs } from "@/lib/prefs";

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
  { href: "/", key: "nav.home" },
  { href: "/report", key: "nav.report" },
  { href: "/dashboard", key: "nav.track" },
  { href: "/scam-check", key: "nav.check" },
  { href: "/learn", key: "nav.learn" },
  { href: "/help", key: "nav.help" },
] as const;

const BUILD_LINK = { href: "/how-built", key: "nav.built" } as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { scale, contrast, theme } = usePrefs();
  const locale = useLocale();
  const t = useT();

  return (
    <header>
      {/* Identity bar */}
      <div className="bg-primary text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-1.5 sm:px-5">
          <p className="hidden text-[13px] leading-tight sm:block">
            {t("hdr.notGov")}
          </p>
          <div className="flex items-center gap-1">
            <span className="sr-only" id="a11y-label">
              {t("hdr.a11y")}
            </span>
            <div
              className="flex items-center gap-0.5"
              role="group"
              aria-labelledby="a11y-label"
            >
              <span className="hidden items-center gap-0.5 sm:flex">
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
              </span>
              <A11yBtn
                onClick={() => setContrast(!contrast)}
                active={contrast}
                label="High contrast"
              >
                ◐
              </A11yBtn>
            </div>
            <span className="mx-0.5 hidden h-4 w-px bg-white/25 sm:block" aria-hidden="true" />
            <ThemeToggle theme={theme} />
            <span className="mx-1 h-4 w-px bg-white/25" aria-hidden="true" />
            <LanguagePicker locale={locale} label={t("hdr.language")} />
          </div>
        </div>
      </div>

      {/* Brand + nav */}
      <div className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          <div className="flex items-center justify-between gap-3 py-2.5 sm:py-3">
            <Link href="/" className="press flex items-center">
              <Wordmark />
            </Link>

            <div className="flex items-center gap-2">
              <a
                href="tel:1930"
                className="press hidden items-center gap-2 rounded-[10px] border border-critical-border bg-critical-soft px-3.5 py-2 text-[15px] font-semibold text-critical-text sm:inline-flex"
              >
                <IconPhone className="h-4 w-4" />
                <span className="data">1930</span>
              </a>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="primary-nav"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line-strong px-3 text-[15px] font-semibold text-ink md:hidden"
              >
                {open ? t("hdr.close") : t("hdr.menu")}
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
                        "press block border-b-2 px-3 py-2.5 text-[15px] font-semibold",
                        active
                          ? "border-primary text-primary-text"
                          : "border-transparent text-ink-soft hover:border-line-strong hover:text-ink",
                      )}
                    >
                      {t(n.key)}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href={BUILD_LINK.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "press block border-b-2 px-3 py-2.5 text-[15px] font-semibold",
                    pathname.startsWith(BUILD_LINK.href)
                      ? "border-primary text-primary-text"
                      : "border-transparent text-ink-soft hover:border-line-strong hover:text-ink",
                  )}
                >
                  {t(BUILD_LINK.key)}
                </Link>
              </li>
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
        "press min-w-[32px] rounded px-2 py-1 text-[13px] font-bold",
        active ? "bg-white text-primary" : "hover:bg-white/20",
      )}
    >
      {children}
    </button>
  );
}

function LanguagePicker({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  /* A native <select>: it is keyboard accessible for free, opens as a
     system picker on phones, and stays legible at 128% text scale — all
     things a custom dropdown would have to re-earn. */
  return (
    <label className="flex items-center">
      <span className="sr-only">{label}</span>
      <select
        data-testid="language"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="cursor-pointer rounded bg-transparent px-1.5 py-1 text-[13px] font-semibold text-white outline-none hover:bg-white/20 focus-visible:bg-white/20"
      >
        {LOCALES.map((l) => (
          <option key={l.id} value={l.id} className="text-ink">
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}

function ThemeToggle({ theme }: { theme: "" | "light" | "dark" }) {
  /* Three states, because "follow my device" is a real preference and
     silently overriding it is the thing dark-mode toggles usually get wrong. */
  const OPTIONS = [
    { id: "" as const, glyph: "◑", label: "Match my device" },
    { id: "light" as const, glyph: "☀", label: "Light" },
    { id: "dark" as const, glyph: "☾", label: "Dark" },
  ];
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Theme">
      {OPTIONS.map((o) => (
        <button
          key={o.id || "system"}
          type="button"
          onClick={() => setTheme(o.id)}
          aria-label={o.label}
          aria-pressed={theme === o.id}
          className={clsx(
            "press min-w-[30px] rounded px-1.5 py-1 text-[13px] font-bold",
            theme === o.id ? "bg-white text-primary" : "hover:bg-white/20",
          )}
        >
          {o.glyph}
        </button>
      ))}
    </div>
  );
}
