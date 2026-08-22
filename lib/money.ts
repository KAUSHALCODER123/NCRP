import type { Paise } from "./types";

/**
 * Money is integer paise everywhere in this codebase.
 * Format only at the render boundary.
 */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹9,95,000 — Indian digit grouping, not ₹995,000. */
export function formatPaise(p: Paise): string {
  return inr.format(Math.round(p) / 100);
}

export function formatPaisePrecise(p: Paise): string {
  return inrPrecise.format(Math.round(p) / 100);
}

export function rupeesToPaise(rupees: number): Paise {
  return Math.round(rupees * 100);
}

export function paiseToRupees(p: Paise): number {
  return Math.round(p) / 100;
}

export function sumPaise(values: Paise[]): Paise {
  return values.reduce((a, b) => a + b, 0);
}

/**
 * "43 seconds", "6 minutes", "5 days 03 h".
 * Countdowns read in human units, never as 123:44:12.
 */
export function humanDuration(ms: number): string {
  const abs = Math.abs(ms);
  const s = Math.floor(abs / 1000);
  if (s < 60) return `${s} second${s === 1 ? "" : "s"}`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"}`;
  const h = Math.floor(m / 60);
  if (h < 24) {
    const rm = m % 60;
    return rm ? `${h} h ${String(rm).padStart(2, "0")} m` : `${h} hour${h === 1 ? "" : "s"}`;
  }
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh ? `${d} day${d === 1 ? "" : "s"} ${String(rh).padStart(2, "0")} h` : `${d} day${d === 1 ? "" : "s"}`;
}

/** Elapsed clock for the golden hour: mm:ss. */
export function clock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Masks at construction. A full account number should never reach app state. */
export function maskAccount(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return `XXXX${digits.slice(-4)}`;
}
