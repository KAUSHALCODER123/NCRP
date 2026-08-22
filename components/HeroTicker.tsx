"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { MoneyTrail, type Hop } from "@/components/MoneyTrail";
import { IconCheck, IconClock } from "@/components/icons";

/**
 * The hero panel — a white, elevated card carrying the product's thesis.
 *
 * A bank SMS arrives (the artifact every Indian recognises instantly), then
 * the money trail draws itself along the hops the money actually took. By the
 * last hop the argument has landed without a line of marketing copy:
 *
 *   money moves in hops · we caught some · some got away ·
 *   and the last person on the line is a shopkeeper who did nothing wrong.
 */

const SMS =
  "Rs.47,500.00 debited from A/c XX4471 on 21-08-26 at 21:14:07 to VPA rahul.verma@ybl (UPI Ref 456123789012). Not you? -HDFC Bank";

const HOPS: Hop[] = [
  {
    label: "Your account",
    amount: "₹47,500",
    sub: "HDFC Bank · 21:14",
    state: "source",
  },
  {
    label: "Mule account",
    amount: "₹34,200 held",
    sub: "Frozen 31 seconds in",
    state: "held",
  },
  {
    label: "Second mule",
    amount: "₹13,300 gone",
    sub: "Moved on before we arrived",
    state: "moved",
  },
  {
    label: "A shop in Kollam",
    amount: "₹5,000 held",
    sub: "Sold a phone. Did nothing wrong.",
    state: "innocent",
  },
];

export function HeroTicker() {
  const [typed, setTyped] = useState(0);
  const [trail, setTrail] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t = setTimeout(() => {
        setTyped(SMS.length);
        setTrail(true);
      }, 0);
      return () => clearTimeout(t);
    }
    const reveal = setInterval(() => {
      setTyped((n) => {
        if (n >= SMS.length) {
          clearInterval(reveal);
          return n;
        }
        return Math.min(SMS.length, n + 3);
      });
    }, 16);
    const start = setTimeout(() => setTrail(true), 1300);
    return () => {
      clearInterval(reveal);
      clearTimeout(start);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-lg">
      {/* Status strip — a live case, not a screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-sunken px-5 py-3">
        <span className="data text-[13px] font-semibold text-ink-soft">
          CASE SHY-2026-08-4471
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-2.5 py-1 text-[13px] font-semibold text-secondary-text">
          <IconCheck className="h-3.5 w-3.5" />
          Open · banks contacted
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <p className="eyebrow">The message you already have</p>
        <p className="mt-2.5 rounded-[10px] border border-line bg-sunken p-4 text-[14px] leading-relaxed text-ink-soft">
          <span className="data break-words">{SMS.slice(0, typed)}</span>
          <span
            className={clsx(
              "ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] bg-ink-faint",
              typed >= SMS.length && "caret",
            )}
          />
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="eyebrow">Where that money went</p>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-faint">
            <IconClock className="h-4 w-4" />
            <span className="data">41s</span>
          </span>
        </div>

        <MoneyTrail hops={HOPS} animate={trail} className="mt-4" />

        <p
          className={clsx(
            "mt-2 border-t border-line pt-4 text-[15px] leading-relaxed text-ink-soft transition-opacity duration-700",
            trail ? "opacity-100" : "opacity-0",
          )}
        >
          Every portal is built for the first box. This one is also built for
          the last — because today a shopkeeper at hop three loses{" "}
          <strong className="font-semibold text-ink">his entire account</strong>
          , not ₹5,000.
        </p>
      </div>
    </div>
  );
}
