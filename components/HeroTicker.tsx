"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { MoneyTrail, type Hop } from "@/components/MoneyTrail";

/**
 * The hero, and the thesis.
 *
 * A bank SMS arrives — the one artifact every Indian recognises instantly —
 * and then the money trail draws itself along the hops the money actually
 * took. By the fourth hop the viewer has been told the entire argument
 * without a word of marketing copy:
 *
 *   money moves in hops · we caught some · some got away ·
 *   and the last person on the line is a shopkeeper who did nothing wrong.
 *
 * That last beat is the one nobody else builds, so it gets the final frame.
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
    sub: "Frozen 31 seconds after you tapped",
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
    // The message arrives the way it actually does: all at once, then read.
    const reveal = setInterval(() => {
      setTyped((n) => {
        if (n >= SMS.length) {
          clearInterval(reveal);
          return n;
        }
        return Math.min(SMS.length, n + 3);
      });
    }, 16);
    const start = setTimeout(() => setTrail(true), 1400);
    return () => {
      clearInterval(reveal);
      clearTimeout(start);
    };
  }, []);

  return (
    <div className="text-on-deep">
      <p className="eyebrow !text-on-deep/50">The message you already have</p>
      <p className="mt-2 rounded-lg border border-white/12 bg-white/[0.06] p-4 text-[14px] leading-relaxed">
        <span className="data">{SMS.slice(0, typed)}</span>
        <span
          className={clsx(
            "ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] bg-on-deep/70",
            typed >= SMS.length && "caret",
          )}
        />
      </p>

      <p className="eyebrow mt-8 !text-on-deep/50">Where that money went</p>
      <MoneyTrail hops={HOPS} animate={trail} className="mt-4" />

      <p
        className={clsx(
          "mt-2 border-t border-white/12 pt-4 text-[15px] leading-relaxed text-on-deep/80 transition-opacity duration-700",
          trail ? "opacity-100" : "opacity-0",
        )}
      >
        Every portal is built for the first box. This one is also built for the
        last — because today, a shopkeeper at hop three loses{" "}
        <span className="font-semibold text-white">his entire account</span>,
        not ₹5,000.
      </p>
    </div>
  );
}
