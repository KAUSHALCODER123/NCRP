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
export type Theme = "" | "light" | "dark"; // "" follows the operating system

export interface Prefs {
  scale: Scale;
  contrast: boolean;
  theme: Theme;
}

const DEFAULTS: Prefs = { scale: "", contrast: false, theme: "" };

let cache: Prefs = DEFAULTS;
const listeners = new Set<() => void>();

function readDom(): Prefs {
  const d = document.documentElement.dataset;
  return {
    scale: (d.scale ?? "") as Scale,
    contrast: d.contrast === "high",
    theme: (d.theme ?? "") as Theme,
  };
}

function snapshot(): Prefs {
  const next = readDom();
  // getSnapshot must be referentially stable between changes.
  if (
    next.scale !== cache.scale ||
    next.contrast !== cache.contrast ||
    next.theme !== cache.theme
  ) {
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

export function setTheme(theme: Theme) {
  const d = document.documentElement;
  if (theme) d.dataset.theme = theme;
  else delete d.dataset.theme;
  try {
    localStorage.setItem("sahaay-theme", theme);
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
export const PREFS_SCRIPT = `(function(){try{var d=document.documentElement,s=localStorage.getItem('sahaay-scale'),c=localStorage.getItem('sahaay-contrast'),t=localStorage.getItem('sahaay-theme');if(s)d.dataset.scale=s;if(c==='high')d.dataset.contrast='high';if(t)d.dataset.theme=t;var g=localStorage.getItem('sahaay-lang');if(g)d.lang=g;}catch(e){}})();`;
