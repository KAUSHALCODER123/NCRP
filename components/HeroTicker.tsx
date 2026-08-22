"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { IconCheck, IconClock } from "@/components/icons";

/**
 * The hero panel — what happens when you report, shown rather than described.
 *
 * Deliberately one story and one number. An earlier version drew the whole
 * money trail here, with mule accounts and hop numbers and four competing
 * amounts; that is the product's argument, and it belongs further down the
 * page where there is room to explain it. Someone who has just lost money
 * and landed on the homepage needs to understand one thing: paste the
 * message, and banks start holding your money in under a minute.
 */

const SMS =
  "Rs.47,500.00 debited from A/c XX4471 to VPA rahul.verma@ybl. Not you? -HDFC Bank";

interface Row {
  bank: string;
  note: string;
  amount?: string;
  at: number;
}

const ROWS: Row[] = [
  { bank: "HDFC Bank", note: "Your bank confirmed the debit", at: 2200 },
  { bank: "Paytm Payments Bank", note: "Money held", amount: "₹34,200", at: 3400 },
  { bank: "PhonePe", note: "Traced and flagged", at: 4600 },
];

export function HeroTicker() {
  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const t = setTimeout(() => {
        setTyped(SMS.length);
        setShown(ROWS.length);
      }, 0);
      return () => clearTimeout(t);
    }

    const reveal = setInterval(() => {
      setTyped((n) => {
        if (n >= SMS.length) {
          clearInterval(reveal);
          return n;
        }
        return Math.min(SMS.length, n + 2);
      });
    }, 18);

    const timers = ROWS.map((r, i) => setTimeout(() => setShown(i + 1), r.at));

    return () => {
      clearInterval(reveal);
      timers.forEach(clearTimeout);
    };
  }, []);

  const done = shown >= ROWS.length;

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-lg">
      <div className="border-b border-line bg-sunken px-5 py-3">
        <p className="text-[15px] font-semibold text-ink">
          What happens when you report
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {/* 1. The thing the citizen already has in their hand. */}
        <p className="text-[15px] font-semibold text-ink-soft">
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-on">
            1
          </span>
          You paste the message your bank sent you
        </p>
        <p className="mt-2.5 rounded-[10px] border border-line bg-sunken p-3.5 text-[14px] leading-relaxed text-ink-soft">
          <span className="data break-words">{SMS.slice(0, typed)}</span>
          <span
            className={clsx(
              "ml-0.5 inline-block h-[14px] w-[6px] translate-y-[2px] bg-ink-faint",
              typed >= SMS.length && "caret",
            )}
          />
        </p>

        {/* 2. The system acting, before anything else is asked of them. */}
        <p className="mt-6 text-[15px] font-semibold text-ink-soft">
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-on">
            2
          </span>
          We ask the banks to hold your money
        </p>

        <ul className="mt-3 space-y-2">
          {ROWS.map((r, i) => {
            const on = i < shown;
            return (
              <li
                key={r.bank}
                className={clsx(
                  "flex items-center justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 transition-colors",
                  on
                    ? "ack-in border-secondary-border bg-secondary-soft"
                    : "border-line bg-surface",
                )}
              >
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-ink">
                    {r.bank}
                  </span>
                  <span className="block text-[14px] text-ink-soft">
                    {on ? r.note : "Contacting…"}
                  </span>
                </span>
                {on ? (
                  <span className="flex shrink-0 items-center gap-1.5 text-secondary-text">
                    {r.amount ? (
                      <span className="data text-[15px] font-semibold">
                        {r.amount}
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

        {/* 3. The outcome, as one sentence and one number. */}
        <div
          className={clsx(
            "mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 transition-opacity duration-500",
            done ? "opacity-100" : "opacity-0",
          )}
        >
          <p className="text-[16px] text-ink-soft">
            <strong className="data text-[20px] font-semibold text-secondary-text">
              ₹34,200
            </strong>{" "}
            held before you filled in a single form
          </p>
          <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-faint">
            <IconClock className="h-4 w-4" />
            <span className="data">41 seconds</span>
          </span>
        </div>
      </div>
    </div>
  );
}
