"use client";

import { useSyncExternalStore } from "react";

/**
 * Draft persistence for a half-filled report.
 *
 * The real portal's 30-minute OTP window silently discards a part-filled form
 * when someone steps away to fetch a bank statement — which is exactly what a
 * victim is most likely to do. Losing that work at that moment is how people
 * give up on reporting entirely.
 *
 * Modelled as an external store rather than an effect so reading it on mount
 * doesn't trigger a cascading render, and so SSR renders "no draft" cleanly.
 */

const KEY = "sahaay-draft";
const MAX_AGE_MS = 6 * 3600_000;

export interface Draft {
  savedAt: number;
  when?: string | null;
  raw?: string;
  amount?: string;
  bank?: string;
  rail?: string;
  utr?: string;
  counterparty?: string;
  mobile?: string;
}

let cache: Draft | null | undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function read(): Draft | null {
  if (cache !== undefined) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Draft) : null;
    cache =
      parsed && Date.now() - parsed.savedAt < MAX_AGE_MS ? parsed : null;
  } catch {
    cache = null;
  }
  return cache;
}

/** Writes without notifying: the editing component already holds these values. */
export function saveDraft(d: Omit<Draft, "savedAt">) {
  const full: Draft = { ...d, savedAt: Date.now() };
  cache = full;
  try {
    localStorage.setItem(KEY, JSON.stringify(full));
  } catch {
    /* storage unavailable — editing continues, just without recovery */
  }
}

export function clearDraft() {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** The draft as it was when this page loaded. Null during SSR. */
export function useDraft(): Draft | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
