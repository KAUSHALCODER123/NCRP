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
 * Drawn once on the hero, and reused on the lien notice with `youAre` set,
 * so an innocent account holder can see exactly where they landed and why.
 *
 * The line is data, not decoration: hop distance is uniform because hops are
 * discrete events, and colour is the same semantic scale used everywhere else.
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
      setTimeout(() => setShown(i + 1), reduced ? 0 : 700 + i * 850),
    );
    return () => timers.forEach(clearTimeout);
    // Hop count is what drives the sequence; the array identity is not stable
    // across renders and re-running on it would restart the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, hops.length]);

  return (
    <ol
      className={clsx(
        "flex flex-col gap-0 sm:flex-row sm:gap-0",
        className,
      )}
      aria-label="Where the money went"
    >
      {hops.map((h, i) => {
        const on = i < shown;
        return (
          <li
            key={h.label + i}
            className="relative flex flex-1 gap-4 sm:block"
          >
            {/* Connector: vertical on mobile, horizontal on wider screens */}
            <div className="flex flex-col items-center sm:absolute sm:left-0 sm:top-[9px] sm:h-0.5 sm:w-full sm:flex-row">
              {i > 0 ? (
                <span
                  className={clsx(
                    "hidden h-0.5 origin-left transition-transform duration-700 ease-out sm:block sm:w-1/2",
                    on ? "scale-x-100" : "scale-x-0",
                    dashFor(hops[i - 1].state),
                  )}
                />
              ) : (
                <span className="hidden sm:block sm:w-1/2" />
              )}
              <span className="hidden sm:block sm:w-1/2" />
            </div>

            {/* Node */}
            <div className="flex flex-col items-center sm:block">
              <span
                className={clsx(
                  "relative z-10 mt-1 block h-5 w-5 shrink-0 rounded-full border-[3px] transition-all duration-500 sm:mt-0",
                  on ? "opacity-100 scale-100" : "opacity-25 scale-75",
                  nodeFor(h.state),
                  h.state === "pending" && on && "pulse-ring",
                )}
              />
              {i < hops.length - 1 ? (
                <span
                  className={clsx(
                    "w-0.5 flex-1 origin-top transition-transform duration-700 sm:hidden",
                    on ? "scale-y-100" : "scale-y-0",
                    dashFor(h.state),
                  )}
                />
              ) : null}
            </div>

            <div
              className={clsx(
                "pb-7 transition-opacity duration-500 sm:pb-0 sm:pr-5 sm:pt-3",
                on ? "opacity-100" : "opacity-0",
              )}
            >
              <p className="eyebrow !text-[11px]">
                {i === 0 ? "Taken from" : `Hop ${i}`}
              </p>
              <p className="mt-1 text-[16px] font-semibold leading-snug text-[color:inherit]">
                {h.label}
              </p>
              {h.amount ? (
                <p
                  className={clsx(
                    "data mt-0.5 text-[15px] font-semibold",
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
    case "source":
      return "border-current bg-transparent";
    case "held":
      return "border-[var(--color-held)] bg-[var(--color-held)]";
    case "moved":
      return "border-[var(--color-breach)] bg-transparent";
    case "innocent":
      return "border-[var(--color-pending)] bg-[var(--color-pending)]";
    default:
      return "border-current bg-transparent";
  }
}

/** A solid line means the money was caught; dashed means it kept going. */
function dashFor(s: Hop["state"]) {
  return s === "held"
    ? "bg-[var(--color-held)]"
    : s === "moved"
      ? "bg-[repeating-linear-gradient(90deg,currentColor_0_6px,transparent_6px_11px)] sm:bg-[repeating-linear-gradient(90deg,currentColor_0_6px,transparent_6px_11px)]"
      : "bg-current opacity-40";
}

function textFor(s: Hop["state"]) {
  switch (s) {
    case "held":
      return "text-[var(--color-held)]";
    case "moved":
      return "text-[var(--color-breach)]";
    case "innocent":
      return "text-[var(--color-pending)]";
    default:
      return "";
  }
}
