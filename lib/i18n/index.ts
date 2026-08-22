"use client";

import { useSyncExternalStore } from "react";
import en from "./en.json";
import hi from "./hi.json";
import mr from "./mr.json";
import gu from "./gu.json";
import ta from "./ta.json";
import te from "./te.json";
import kn from "./kn.json";

/**
 * Localisation.
 *
 * Seven languages covering roughly three quarters of India by first language.
 * English is the source of truth: `en.json` defines every key and its type, so
 * a key added there and forgotten elsewhere falls back to English rather than
 * rendering a blank — a missing string on a crime-reporting form is worse than
 * an English one.
 *
 * Translations are generated from `en.json` and reviewed, with product names,
 * statutes and identifiers held verbatim. That last part is not cosmetic: a
 * translated helpline number would be actively dangerous, so `1930`,
 * `cybercrime.gov.in`, UPI, OTP, UTR and every rupee figure survive
 * translation unchanged, and there is a test asserting it.
 *
 * Long-form editorial content — the Learning Corner scam scripts and the
 * survivor stories — stays in English deliberately. The whole value of a scam
 * script is recognising the exact wording someone will hear, and a
 * machine-translated approximation of that is worse than an honest English
 * one. Bhashini is the production answer for those, and for voice intake.
 */

export const LOCALES = [
  { id: "en", label: "English", native: "English" },
  { id: "hi", label: "Hindi", native: "हिन्दी" },
  { id: "mr", label: "Marathi", native: "मराठी" },
  { id: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { id: "ta", label: "Tamil", native: "தமிழ்" },
  { id: "te", label: "Telugu", native: "తెలుగు" },
  { id: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
] as const;

export type Locale = (typeof LOCALES)[number]["id"];

/** Every key, derived from the English file so the two cannot drift. */
export type Key = keyof typeof en;

const DICTS: Record<Locale, Partial<Record<Key, string>>> = {
  en,
  hi,
  mr,
  gu,
  ta,
  te,
  kn,
};

/* ---------------- store ---------------- */

let cache: Locale = "en";
const listeners = new Set<() => void>();

function snapshot(): Locale {
  const l = (document.documentElement.lang || "en") as Locale;
  const next = l in DICTS ? l : "en";
  if (next !== cache) cache = next;
  return cache;
}

export function setLocale(locale: Locale) {
  document.documentElement.lang = locale;
  try {
    localStorage.setItem("sahaay-lang", locale);
  } catch {
    /* the preference just will not persist */
  }
  for (const l of listeners) l();
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    snapshot,
    () => "en",
  );
}

/** Falls back to English per key, so a gap is never a blank. */
export function useT(): (k: Key) => string {
  const locale = useLocale();
  return (k) => DICTS[locale]?.[k] || en[k];
}

/** For server components and tests, where there is no subscription. */
export function translate(locale: Locale, k: Key): string {
  return DICTS[locale]?.[k] || en[k];
}
