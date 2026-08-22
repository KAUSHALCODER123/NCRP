"use client";

import { useSyncExternalStore } from "react";

/**
 * Accessibility preferences: text scale and high contrast.
 *
 * The document element is the source of truth, not React state. A blocking
 * script in <head> applies the saved values before first paint, so a user who
 * needs 128% text never sees a flash of 100% — which for the people relying on
 * this setting is the whole point of having it.
 */

export type Scale = "" | "lg" | "xl";

export interface Prefs {
  scale: Scale;
  contrast: boolean;
}

const DEFAULTS: Prefs = { scale: "", contrast: false };

let cache: Prefs = DEFAULTS;
const listeners = new Set<() => void>();

function readDom(): Prefs {
  const d = document.documentElement.dataset;
  return {
    scale: (d.scale ?? "") as Scale,
    contrast: d.contrast === "high",
  };
}

function snapshot(): Prefs {
  const next = readDom();
  // getSnapshot must be referentially stable between changes.
  if (next.scale !== cache.scale || next.contrast !== cache.contrast) {
    cache = next;
  }
  return cache;
}

function emit() {
  for (const l of listeners) l();
}

export function setScale(scale: Scale) {
  const d = document.documentElement;
  if (scale) d.dataset.scale = scale;
  else delete d.dataset.scale;
  try {
    localStorage.setItem("sahaay-scale", scale);
  } catch {
    /* preference just won't persist */
  }
  emit();
}

export function setContrast(high: boolean) {
  const d = document.documentElement;
  if (high) d.dataset.contrast = "high";
  else delete d.dataset.contrast;
  try {
    localStorage.setItem("sahaay-contrast", high ? "high" : "");
  } catch {
    /* ignore */
  }
  emit();
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    snapshot,
    () => DEFAULTS,
  );
}

/** Runs before paint. Kept tiny and dependency-free on purpose. */
export const PREFS_SCRIPT = `(function(){try{var d=document.documentElement,s=localStorage.getItem('sahaay-scale'),c=localStorage.getItem('sahaay-contrast');if(s)d.dataset.scale=s;if(c==='high')d.dataset.contrast='high';}catch(e){}})();`;
