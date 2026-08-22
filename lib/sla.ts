import type { Sla } from "./types";

/**
 * SLA state machine.
 *
 * The April 2026 MHA SOP already specifies 7-day bank review and 15-day IO
 * decision windows. A timeline that isn't counted down and auto-escalated is
 * a suggestion. Encoding existing policy as an enforced clock is the cheapest,
 * most credible reform available — it changes no policy at all.
 */

export const SOP = {
  /** Bank review of an innocent account holder's representation. */
  BANK_REVIEW_HOURS: 7 * 24,
  /** Investigating Officer decision. */
  IO_DECISION_HOURS: 15 * 24,
  /** District-level appeal. */
  APPEAL_HOURS: 15 * 24,
  /** Non-action auto-escalation trigger. */
  AUTO_ESCALATE_HOURS: 15 * 24,
  /** Long-pending hold review threshold. */
  LONG_HOLD_HOURS: 90 * 24,
  /** Our own promise: a case reaches a named officer within 48h. */
  ASSIGNMENT_HOURS: 48,
} as const;

export type SlaState = "met" | "healthy" | "at_risk" | "breached";

export interface SlaReading {
  state: SlaState;
  /** Negative once breached. */
  remainingMs: number;
  elapsedMs: number;
  fraction: number;
  deadline: Date;
}

export function readSla(sla: Sla, now: Date = new Date()): SlaReading {
  const started = new Date(sla.startedAt).getTime();
  const totalMs = sla.hours * 3600_000;
  const deadline = new Date(started + totalMs);

  if (sla.metAt) {
    return {
      state: "met",
      remainingMs: 0,
      elapsedMs: new Date(sla.metAt).getTime() - started,
      fraction: 1,
      deadline,
    };
  }

  const elapsedMs = now.getTime() - started;
  const remainingMs = deadline.getTime() - now.getTime();
  const fraction = Math.min(1, Math.max(0, elapsedMs / totalMs));

  let state: SlaState = "healthy";
  if (remainingMs <= 0) state = "breached";
  else if (fraction >= 0.75) state = "at_risk";

  return { state, remainingMs, elapsedMs, fraction, deadline };
}

export function makeSla(
  label: string,
  hours: number,
  owner: string,
  escalatesTo: string,
  startedAt: Date | string = new Date(),
): Sla {
  return {
    label,
    hours,
    owner,
    escalatesTo,
    startedAt:
      typeof startedAt === "string" ? startedAt : startedAt.toISOString(),
    metAt: null,
  };
}

export const SLA_TONE: Record<SlaState, "held" | "pending" | "breach" | "neutral"> = {
  met: "held",
  healthy: "neutral",
  at_risk: "pending",
  breached: "breach",
};

export function slaHeadline(reading: SlaReading, sla: Sla): string {
  switch (reading.state) {
    case "met":
      return `${sla.label} — completed`;
    case "breached":
      return `${sla.label} — overdue, escalating to ${sla.escalatesTo}`;
    case "at_risk":
      return `${sla.label} — deadline approaching`;
    default:
      return sla.label;
  }
}
