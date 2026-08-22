"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

/**
 * The money trail — the signature element of this product.
 *
 * Stolen money does not sit still. It hops: you → a mule account → another
 * mule → and often a real shopkeeper who sold something and got paid. That
 * one structure explains everything this project argues:
 *
 *   · why speed matters      — the freeze is a race along this line
 *   · why holds fail         — money leaves a hop before we reach it
 *   · who gets hurt by it    — the person at the last hop did nothing wrong
 *
 * Built mobile-first: a vertical rail on phones, a horizontal one from 640px.
 * Connectors are borders rather than background gradients, so a dashed line
 * reads correctly in both directions without duplicating markup.
 *
 * The line is data, not decoration — solid where the money was caught,
 * dashed where it kept moving.
 */

export interface Hop {
  label: string;
  sub?: string;
  amount?: string;
  state: "source" | "held" | "moved" | "innocent" | "pending";
}

export function MoneyTrail({
  hops,
  animate = true,
  youAre,
  className,
}: {
  hops: Hop[];
  animate?: boolean;
  /** Index of the viewer's own position, marked "you are here". */
  youAre?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(animate ? 0 : hops.length);

  useEffect(() => {
    if (!animate) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = hops.map((_, i) =>
      setTimeout(() => setShown(i + 1), reduced ? 0 : 650 + i * 800),
    );
    return () => timers.forEach(clearTimeout);
    // Hop count drives the sequence; the array identity is not stable across
    // renders and re-running on it would restart the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, hops.length]);

  return (
    <ol className={clsx("sm:flex", className)} aria-label="Where the money went">
      {hops.map((h, i) => {
        const on = i < shown;
        const last = i === hops.length - 1;
        return (
          <li
            key={h.label + i}
            className="relative flex gap-3.5 sm:block sm:min-w-0 sm:flex-1 sm:gap-0"
          >
            {/* Horizontal connector (640px+): joins this node to the next. */}
            {!last ? (
              <span
                aria-hidden="true"
                className={clsx(
                  "hidden sm:absolute sm:left-[22px] sm:right-1 sm:top-[10px] sm:block sm:origin-left sm:border-t-2 sm:transition-transform sm:duration-700 sm:ease-out",
                  on ? "sm:scale-x-100" : "sm:scale-x-0",
                  edgeFor(h.state),
                )}
              />
            ) : null}

            {/* Node + vertical connector (under 640px) */}
            <div className="flex shrink-0 flex-col items-center sm:block">
              <span
                className={clsx(
                  "relative z-10 block h-[18px] w-[18px] shrink-0 rounded-full border-[3px] transition-all duration-500 sm:h-5 sm:w-5",
                  on ? "scale-100 opacity-100" : "scale-75 opacity-25",
                  nodeFor(h.state),
                  h.state === "pending" && on && "pulse-ring",
                )}
              />
              {!last ? (
                <span
                  aria-hidden="true"
                  className={clsx(
                    "mt-1 w-0 flex-1 origin-top border-l-2 transition-transform duration-700 sm:hidden",
                    on ? "scale-y-100" : "scale-y-0",
                    edgeFor(h.state),
                  )}
                />
              ) : null}
            </div>

            <div
              className={clsx(
                "min-w-0 pb-7 transition-opacity duration-500 sm:pb-0 sm:pr-4 sm:pt-3.5",
                last && "pb-0",
                on ? "opacity-100" : "opacity-0",
              )}
            >
              <p className="eyebrow !text-[11px]">
                {i === 0 ? "Taken from" : `Hop ${i}`}
              </p>
              <p className="mt-1 text-[16px] font-semibold leading-snug">
                {h.label}
              </p>
              {h.amount ? (
                <p
                  className={clsx(
                    "data mt-0.5 break-words text-[15px] font-semibold",
                    textFor(h.state),
                  )}
                >
                  {h.amount}
                </p>
              ) : null}
              {h.sub ? (
                <p className="mt-0.5 text-[14px] leading-snug opacity-70">
                  {h.sub}
                </p>
              ) : null}
              {youAre === i ? (
                <p className="mt-2 inline-block rounded-full border border-current px-2.5 py-0.5 text-[13px] font-bold">
                  You are here
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function nodeFor(s: Hop["state"]) {
  switch (s) {
    case "held":
      return "border-secondary bg-secondary";
    case "moved":
      return "border-critical bg-transparent";
    case "innocent":
      return "border-tertiary bg-tertiary";
    default:
      return "border-current bg-transparent";
  }
}

/** Solid means the money was caught here; dashed means it kept going. */
function edgeFor(s: Hop["state"]) {
  switch (s) {
    case "held":
      return "border-secondary border-solid";
    case "moved":
      return "border-critical border-dashed";
    case "innocent":
      return "border-tertiary border-solid";
    default:
      return "border-current border-solid opacity-40";
  }
}

function textFor(s: Hop["state"]) {
  switch (s) {
    case "held":
      return "text-secondary-text";
    case "moved":
      return "text-critical-text";
    case "innocent":
      return "text-tertiary-text";
    default:
      return "";
  }
}
