"use client";

import { useSyncExternalStore } from "react";

/**
 * A shared ticking clock.
 *
 * Wall-clock time is an external system, not React state — modelling it with
 * useSyncExternalStore avoids the cascading re-renders that setState-in-effect
 * produces, and one interval serves every subscriber on the page instead of
 * one per component.
 *
 * The snapshot is cached rather than returning Date.now() on every read,
 * because React requires getSnapshot to be stable between ticks.
 */

let cached = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function tick() {
  cached = Date.now();
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (!timer) {
    cached = Date.now();
    timer = setInterval(tick, 250);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Current epoch ms, refreshed ~4x/second. Returns 0 during SSR. */
export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => cached || Date.now(),
    () => 0,
  );
}
