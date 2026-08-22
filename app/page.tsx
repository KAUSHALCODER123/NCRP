"use client";

import Link from "next/link";
import { HeroTicker } from "@/components/HeroTicker";
import {
  IconArrow,
  IconBook,
  IconCheck,
  IconLock,
  IconMask,
  IconPhone,
  IconRupee,
  IconSearch,
  IconShield,
  IconUser,
} from "@/components/icons";
import { useT } from "@/lib/i18n";

/**
 * Home.
 *
 * Light field, navy primary, white elevated cards, generous whitespace.
 * Hierarchy is carried by elevation and scale rather than by a dark band:
 * the emergency card sits highest, everything else settles beneath it.
 */

const TILES = [
  { href: "/freeze", Icon: IconRupee, title: "tiles.t1", body: "tiles.t1body", meta: "tiles.t1meta", primary: true },
  { href: "/report/harassment", Icon: IconMask, title: "tiles.t2", body: "tiles.t2body", meta: "tiles.t2meta", primary: false },
  { href: "/report/impersonation", Icon: IconUser, title: "tiles.t3", body: "tiles.t3body", meta: "tiles.t3meta", primary: false },
  { href: "/blocked", Icon: IconLock, title: "tiles.t4", body: "tiles.t4body", meta: "tiles.t4meta", primary: false },
] as const;

const TRUST = [
  { Icon: IconLock, k: "hero.trust1" },
  { Icon: IconCheck, k: "hero.trust2" },
  { Icon: IconShield, k: "hero.trust3" },
] as const;


const LEARN = [
  {
    href: "/learn/digital-arrest",
    title: "Digital arrest",
    body: "There is no such thing. Police do not arrest anyone over a video call.",
  },
  {
    href: "/learn/upi-collect-request",
    title: "The reverse UPI request",
    body: "You never enter your PIN to receive money. Not once, not for a test.",
  },
  {
    href: "/learn/otp-vishing",
    title: "The fake bank call",
    body: "An OTP only ever authorises money leaving. Never money coming back.",
  },
  {
    href: "/learn/task-job-scam",
    title: "The task and job scam",
    body: "You are asked to pay in order to get paid. A real job never needs that.",
  },
];

export default function Home() {
  const t = useT();
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="border-b border-line bg-sunken/60">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-border bg-primary-soft px-3.5 py-1.5 text-[14px] font-semibold text-primary-text">
                <IconShield className="h-4 w-4" />
                {t("hero.badge")}
              </span>

              <h1 className="mt-6 font-display text-[40px] font-bold leading-[1.06] tracking-tight text-ink sm:text-[54px]">
                {t("hero.h1a")}
                <span className="block text-primary-text">{t("hero.h1b")}</span>
              </h1>

              <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-ink-soft">
                {t("hero.sub")}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/freeze"
                  className="press inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[10px] bg-primary px-7 text-[17px] font-semibold text-primary-on shadow-md hover:bg-primary-hover"
                >
                  {t("hero.ctaReport")}
                  <IconArrow className="h-5 w-5" />
                </Link>
                <a
                  href="tel:1930"
                  className="press inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[10px] border border-line-strong bg-surface px-7 text-[17px] font-semibold text-ink shadow-sm hover:bg-sunken"
                >
                  <IconPhone className="h-5 w-5" />
                  {t("hero.ctaCall")} <span className="data">1930</span>
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
                {TRUST.map((item) => (
                  <li
                    key={item.k}
                    className="inline-flex items-center gap-2 text-[15px] text-ink-faint"
                  >
                    <item.Icon className="h-4 w-4 text-secondary-text" />
                    {t(item.k)}
                  </li>
                ))}
              </ul>
            </div>

            <HeroTicker />
          </div>
        </div>
      </section>

      {/* ---------------- The three doors ---------------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{t("tiles.eyebrow")}</p>
          <h2 className="mt-3 font-display text-[30px] font-bold tracking-tight text-ink sm:text-[36px]">
            {t("tiles.h2")}
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">
            {t("tiles.sub")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className={
                tile.primary
                  ? "lift group flex flex-col rounded-card border-2 border-primary bg-surface p-7"
                  : "lift group flex flex-col rounded-card border border-line bg-surface p-7 hover:border-line-strong"
              }
            >
              <span
                className={
                  tile.primary
                    ? "inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary text-primary-on"
                    : "inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary-soft text-primary-text"
                }
              >
                <tile.Icon className="h-6 w-6" />
              </span>
              <p className="mt-5 font-display text-[22px] font-bold leading-tight text-ink">
                {t(tile.title)}
              </p>
              <p className="mt-2.5 flex-1 text-[16px] leading-relaxed text-ink-soft">
                {t(tile.body)}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-primary-text">
                {t(tile.meta)}
                <IconArrow className="row-arrow h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Learning Corner ---------------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="eyebrow">{t("home.learnEyebrow")}</p>
            <h2 className="mt-3 font-display text-[30px] font-bold tracking-tight text-ink sm:text-[36px]">
              {t("home.learnH2")}
            </h2>
            <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">
              Each one is the script as it is actually spoken — how the call
              opens, the words they use, and the single tell that gives it away.
            </p>
          </div>
          <Link
            href="/learn"
            className="press inline-flex min-h-[48px] items-center gap-2 rounded-[10px] border border-line-strong bg-surface px-5 text-[16px] font-semibold text-ink shadow-sm hover:bg-sunken"
          >
            <IconBook className="h-5 w-5" />
            {t("home.learnAll")}
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {LEARN.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="lift group flex items-start gap-4 rounded-card border border-line bg-surface p-6 hover:border-line-strong"
            >
              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-tertiary-soft text-tertiary-text">
                <IconBook className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[19px] font-bold text-ink">
                  {l.title}
                </span>
                <span className="mt-1.5 block text-[16px] leading-relaxed text-ink-soft">
                  {l.body}
                </span>
              </span>
              <IconArrow className="row-arrow mt-1 h-5 w-5 shrink-0 text-primary-text" />
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { href: "/scam-check", Icon: IconSearch, label: "home.quickCheck" },
            { href: "/verify-officer", Icon: IconShield, label: "home.quickVerify" },
            { href: "/login", Icon: IconUser, label: "home.quickLogins" },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="press inline-flex min-h-[56px] items-center gap-3 rounded-[10px] border border-line bg-surface px-5 text-[16px] font-semibold text-ink shadow-sm hover:bg-sunken"
            >
              <q.Icon className="h-5 w-5 shrink-0 text-primary-text" />
              {t(q.label as Parameters<typeof t>[0])}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
