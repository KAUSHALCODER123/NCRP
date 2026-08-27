"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconCheck, IconClock } from "@/components/icons";
import { useT, type Key } from "@/lib/i18n";

/**
 * The hero panel — what happens when you report, shown rather than described.
 *
 * Tabs, not a carousel. Nothing rotates on its own: an auto-advancing hero
 * moves the emergency demo away from someone who is reading it, and WCAG
 * 2.2.2 would then require a pause control nobody uses. Tabs are keyboard
 * navigable, announce themselves, and leave the strongest demo as the
 * default.
 *
 * They exist because the panel used to show only the money flow, which told
 * anyone arriving to report blackmail that this site was not for them. Each
 * tab shows the same three beats — what you hand over, what happens before
 * anything else is asked of you, and the outcome — because that shape is the
 * argument, and it holds for every kind of crime here.
 */

export interface Demo {
  id: string;
  tab: Key;
  /** The headline copy beside the panel — the left column follows the tab. */
  h1a: Key;
  h1b: Key;
  sub: Key;
  cta: Key;
  href: string;
  give: Key;
  /** The thing the citizen already has. A raw string, or a key to resolve. */
  sample: { text: string } | { key: Key };
  act: Key;
  rows: { name: string; amount?: Key }[];
  outcome: Key;
  figure?: Key;
  seconds: string;
  anonymous?: boolean;
}

const SMS =
  "Rs.47,500.00 debited from A/c XX4471 to VPA sample.fraud@demo. Not you? -DEMO";

export const HERO_DEMOS: Demo[] = [
  {
    id: "money",
    tab: "hero.tab.money",
    h1a: "hero.h1a",
    h1b: "hero.h1b",
    sub: "hero.sub",
    cta: "hero.ctaReport",
    href: "/freeze",
    give: "hero.give.money",
    sample: { text: SMS },
    act: "hero.act.money",
    rows: [
      { name: "HDFC Bank" },
      { name: "Paytm Payments Bank", amount: "hero.done.money" },
      { name: "PhonePe" },
    ],
    outcome: "hero.out.money",
    figure: "hero.done.money",
    seconds: "41s",
  },
  {
    id: "blackmail",
    tab: "hero.tab.blackmail",
    h1a: "hero.h1a.blackmail",
    h1b: "hero.h1b.blackmail",
    sub: "hero.sub.blackmail",
    cta: "hero.cta.blackmail",
    href: "/report/harassment",
    give: "hero.give.blackmail",
    sample: { key: "hero.sample.blackmail" },
    act: "hero.act.blackmail",
    rows: [
      { name: "Instagram / Meta" },
      { name: "WhatsApp" },
      { name: "Your telecom operator" },
      { name: "Chakshu (Dept of Telecom)" },
    ],
    outcome: "hero.out.blackmail",
    seconds: "38s",
    anonymous: true,
  },
  {
    id: "impersonation",
    tab: "hero.tab.impersonation",
    h1a: "hero.h1a.impersonation",
    h1b: "hero.h1b.impersonation",
    sub: "hero.sub.impersonation",
    cta: "hero.cta.impersonation",
    href: "/report/impersonation",
    give: "hero.give.impersonation",
    sample: { key: "hero.sample.impersonation" },
    act: "hero.act.impersonation",
    rows: [
      { name: "Instagram / Meta" },
      { name: "The hosting provider" },
      { name: "X" },
    ],
    outcome: "hero.out.impersonation",
    seconds: "33s",
  },
  {
    id: "account",
    tab: "hero.tab.account",
    h1a: "hero.h1a.account",
    h1b: "hero.h1b.account",
    sub: "hero.sub.account",
    cta: "hero.cta.account",
    href: "/report/account",
    give: "hero.give.account",
    sample: { key: "hero.sample.account" },
    act: "hero.act.account",
    rows: [
      { name: "Google" },
      { name: "Your telecom operator" },
      { name: "Meta" },
    ],
    outcome: "hero.out.account",
    seconds: "29s",
  },
];

/**
 * `active` is owned by the page, not by this component: the headline, the
 * blurb and the primary button beside the panel belong to the same crime as
 * the tab, so a citizen who arrives for blackmail is not read a paragraph
 * about stolen money.
 */
export function HeroTicker({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (i: number) => void;
}) {
  const t = useT();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const demo = HERO_DEMOS[active];

  function onTabKey(e: React.KeyboardEvent, i: number) {
    const last = HERO_DEMOS.length - 1;
    let next = i;
    if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    onSelect(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-lg">
      <div
        role="tablist"
        aria-label={t("hero.tabsLabel")}
        className="flex gap-1 overflow-x-auto border-b border-line bg-sunken px-2 py-2"
      >
        {HERO_DEMOS.map((d, i) => (
          <button
            key={d.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`hero-tab-${d.id}`}
            aria-selected={i === active}
            aria-controls={`hero-panel-${d.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={clsx(
              "press shrink-0 rounded-lg px-3.5 py-2 text-[15px] font-semibold",
              i === active
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-soft hover:bg-surface/60",
            )}
          >
            {t(d.tab)}
          </button>
        ))}
      </div>

      {/*
       * Keyed by tab, so switching remounts the panel and the sequence
       * restarts from the beginning. Resetting the animation inside an effect
       * instead would mean setting state during an effect body, which
       * cascades renders — and would show a finished state for a moment
       * before rewinding.
       */}
      <DemoPanel key={demo.id} demo={demo} />
    </div>
  );
}

function DemoPanel({ demo }: { demo: Demo }) {
  const t = useT();
  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);

  const sample = "text" in demo.sample ? demo.sample.text : t(demo.sample.key);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const settle = setTimeout(() => {
        setTyped(sample.length);
        setShown(demo.rows.length);
      }, 0);
      return () => clearTimeout(settle);
    }

    const reveal = setInterval(() => {
      setTyped((n) => {
        if (n >= sample.length) {
          clearInterval(reveal);
          return n;
        }
        return Math.min(sample.length, n + 2);
      });
    }, 18);

    const start = 800 + sample.length * 9;
    const timers = demo.rows.map((_, i) =>
      setTimeout(() => setShown(i + 1), start + i * 600),
    );

    return () => {
      clearInterval(reveal);
      timers.forEach(clearTimeout);
    };
  }, [sample, demo.rows.length]);

  const done = shown >= demo.rows.length;

  return (
    <div
      role="tabpanel"
      id={`hero-panel-${demo.id}`}
      aria-labelledby={`hero-tab-${demo.id}`}
      className="p-5 sm:p-6"
    >
      <p className="text-[15px] font-semibold text-ink-soft">
        <Step n={1} />
        {t(demo.give)}
      </p>
      <p className="mt-2.5 min-h-[64px] rounded-[10px] border border-line bg-sunken p-3.5 text-[14px] leading-relaxed text-ink-soft">
        <span className="data break-words">{sample.slice(0, typed)}</span>
        <span
          className={clsx(
            "ml-0.5 inline-block h-[14px] w-[6px] translate-y-[2px] bg-ink-faint",
            typed >= sample.length && "caret",
          )}
        />
      </p>

      <p className="mt-6 text-[15px] font-semibold text-ink-soft">
        <Step n={2} />
        {t(demo.act)}
      </p>

      <ul className="mt-3 space-y-2">
        {demo.rows.map((r, i) => {
          const on = i < shown;
          return (
            <li
              key={r.name}
              className={clsx(
                "flex items-center justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 transition-colors",
                on
                  ? "ack-in border-secondary-border bg-secondary-soft"
                  : "border-line bg-surface",
              )}
            >
              <span className="min-w-0 truncate text-[15px] font-semibold text-ink">
                {r.name}
              </span>
              {on ? (
                <span className="flex shrink-0 items-center gap-1.5 text-secondary-text">
                  {r.amount ? (
                    <span className="data text-[15px] font-semibold">
                      {t(r.amount)}
                    </span>
                  ) : null}
                  <IconCheck className="h-5 w-5" />
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="pulse-ring h-2.5 w-2.5 shrink-0 rounded-full bg-line-strong text-ink-faint"
                />
              )}
            </li>
          );
        })}
      </ul>

      <div
        className={clsx(
          "mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 transition-opacity duration-500",
          done ? "opacity-100" : "opacity-0",
        )}
      >
        <p className="text-[16px] text-ink-soft">
          <strong className="data text-[20px] font-semibold text-secondary-text">
            {demo.figure ? t(demo.figure) : demo.rows.length}{" "}
          </strong>
          {t(demo.outcome)}
        </p>
        <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-faint">
          <IconClock className="h-4 w-4" />
          <span className="data">{demo.seconds}</span>
        </span>
      </div>

      {demo.anonymous ? (
        <p
          className={clsx(
            "mt-2 text-[15px] text-ink-faint transition-opacity duration-500",
            done ? "opacity-100" : "opacity-0",
          )}
        >
          {t("hero.anonNote")}
        </p>
      ) : null}
    </div>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-on">
      {n}
    </span>
  );
}
