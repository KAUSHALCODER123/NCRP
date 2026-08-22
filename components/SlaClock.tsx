"use client";

import clsx from "clsx";
import type { Sla } from "@/lib/types";
import { readSla } from "@/lib/sla";
import { humanDuration } from "@/lib/money";
import { useNow } from "@/lib/use-now";

/**
 * A running SLA clock.
 *
 * The April 2026 MHA SOP already specifies these windows. A timeline that
 * isn't counted down and auto-escalated is a suggestion — this component is
 * what turns existing policy into an enforced promise.
 */
export function SlaClock({ sla, compact }: { sla: Sla; compact?: boolean }) {
  /*
   * The clock reads from the shared tick store, which reports 0 during server
   * rendering and on the first client paint. Deriving the countdown from a
   * fresh Date() here instead meant the server and the client rendered
   * different numbers, and React discarded and rebuilt the tree on every
   * page that shows an SLA.
   */
  const now = useNow();
  const settled = now > 0;
  // Before hydration, read against the SLA's own start so the value is
  // deterministic and the server and client agree.
  const r = readSla(sla, settled ? new Date(now) : new Date(sla.startedAt));

  const tone =
    r.state === "met"
      ? "held"
      : r.state === "breached"
        ? "breach"
        : r.state === "at_risk"
          ? "pending"
          : "neutral";

  const text = !settled
    ? "—"
    : r.state === "met"
      ? "Completed"
      : r.state === "breached"
        ? `Overdue by ${humanDuration(-r.remainingMs)}`
        : `${humanDuration(r.remainingMs)} remaining`;

  if (compact) {
    return (
      <span
        className={clsx(
          "data text-[15px] font-semibold",
          tone === "held" && "text-held",
          tone === "pending" && "text-pending",
          tone === "breach" && "text-breach",
          tone === "neutral" && "text-ink-soft",
        )}
      >
        {text}
      </span>
    );
  }

  return (
    <div
      className={clsx(
        "rounded-xl border p-4",
        tone === "held" && "border-held/30 bg-held-soft",
        tone === "pending" && "border-pending/30 bg-pending-soft",
        tone === "breach" && "border-breach/30 bg-breach-soft",
        tone === "neutral" && "border-line bg-sunken",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[17px] font-semibold text-ink">{sla.label}</p>
        <p
          className={clsx(
            "data text-[17px] font-bold",
            tone === "held" && "text-held",
            tone === "pending" && "text-pending",
            tone === "breach" && "text-breach",
            tone === "neutral" && "text-ink-soft",
          )}
        >
          {text}
        </p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
        <div
          className={clsx(
            "h-full rounded-full transition-[width] duration-1000",
            tone === "held" && "bg-held",
            tone === "pending" && "bg-pending",
            tone === "breach" && "bg-breach",
            tone === "neutral" && "bg-primary",
          )}
          style={{ width: settled ? `${Math.round(r.fraction * 100)}%` : "0%" }}
        />
      </div>

      <p className="mt-2 text-[15px] text-ink-soft">
        Owed by <strong className="text-ink">{sla.owner}</strong>
        {r.state === "breached"
          ? ` — now escalating to ${sla.escalatesTo}.`
          : `. If missed, this escalates to ${sla.escalatesTo} automatically.`}
      </p>
    </div>
  );
}
