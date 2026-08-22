"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

/**
 * The signature element.
 *
 * The hero is not a description of the product — it is the product, running.
 * A bank SMS (the one artifact every Indian recognises instantly) arrives, and
 * the system answers it while you watch. Timestamps are the structural device
 * because elapsed time is the actual subject of this whole project.
 *
 * Runs once on load, then rests. Respects prefers-reduced-motion by showing
 * the settled end state immediately.
 */

interface Row {
  at: string;
  label: string;
  detail: string;
  tone: "neutral" | "held" | "breach";
  delay: number;
}

const ROWS: Row[] = [
  {
    at: "T+0s",
    label: "Message pasted",
    detail: "₹47,500 · HDFC Bank · UPI",
    tone: "neutral",
    delay: 900,
  },
  {
    at: "T+9s",
    label: "Freeze request sent to 3 institutions",
    detail: "No account. No category. No district.",
    tone: "neutral",
    delay: 2000,
  },
  {
    at: "T+31s",
    label: "₹34,200 held at Paytm Payments Bank",
    detail: "Beneficiary account frozen",
    tone: "held",
    delay: 3300,
  },
  {
    at: "T+41s",
    label: "₹13,300 had already moved on",
    detail: "Exit trail received · next trace opened automatically",
    tone: "breach",
    delay: 4600,
  },
];

const SMS =
  "Dear Customer, Rs.47,500.00 has been debited from A/c XX4471 on 21-08-26 at 21:14:07 to VPA rahul.verma@ybl (UPI Ref No 456123789012). Not you? -HDFC Bank";

export function HeroTicker() {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Reduced motion still gets the full sequence — it just arrives at once,
    // so the information is never withheld from anyone.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = ROWS.map((r, i) =>
      setTimeout(() => setShown(i + 1), reduced ? 0 : r.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="rounded-card border border-white/15 bg-white/[0.06] p-4 sm:p-5">
      {/* The artifact everyone recognises */}
      <p className="eyebrow !text-on-deep/55">The message you already have</p>
      <p className="mt-2 rounded-lg border border-white/12 bg-deep-soft/70 p-3.5 text-[14px] leading-relaxed text-on-deep/95">
        <span className="data">{SMS}</span>
        <span className="caret ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] bg-on-deep/70" />
      </p>

      <div className="mt-5 flex items-baseline justify-between gap-3">
        <p className="eyebrow !text-on-deep/55">What happens next</p>
        <p className="data text-[13px] text-on-deep/55">
          {shown}/{ROWS.length}
        </p>
      </div>

      <ol className="mt-2.5">
        {ROWS.map((r, i) => (
          <li
            key={r.at}
            className={clsx(
              "flex gap-3 border-t border-white/10 py-2.5 first:border-t-0",
              i < shown ? "ack-in" : "invisible",
            )}
          >
            <span className="data w-[52px] shrink-0 pt-0.5 text-[13px] text-on-deep/55">
              {r.at}
            </span>
            <span
              className={clsx(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                r.tone === "held" && "bg-[var(--color-held-soft)]",
                r.tone === "breach" && "bg-[var(--color-breach-soft)]",
                r.tone === "neutral" && "bg-on-deep/40",
              )}
            />
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold leading-snug text-white">
                {r.label}
              </span>
              <span className="block text-[14px] leading-snug text-on-deep/70">
                {r.detail}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p
        className={clsx(
          "mt-3 border-t border-white/10 pt-3 text-[14px] text-on-deep/70 transition-opacity duration-500",
          shown >= ROWS.length ? "opacity-100" : "opacity-0",
        )}
      >
        The official portal asks for all of this{" "}
        <em className="not-italic text-white">before</em> contacting a single
        bank.
      </p>
    </div>
  );
}
