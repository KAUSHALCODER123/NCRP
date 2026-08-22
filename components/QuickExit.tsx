"use client";

import { useEffect } from "react";
import { useT } from "@/lib/i18n";

/**
 * Quick Exit — a floating safety switch.
 *
 * For someone reporting intimate-image abuse, sextortion or domestic abuse,
 * the person who is hurting them may be in the room, or may check the device
 * afterwards. Being seen on this site is itself a risk.
 *
 * On activation we:
 *  1. replace the current history entry, so Back does not return here,
 *  2. open a neutral page in this tab,
 *  3. and only then try to clear local traces.
 *
 * Order matters: navigation must never wait on cleanup. Escape pressed three
 * times does the same thing, for when reaching for a button is too slow.
 *
 * This cannot clear browser history — that is a real limit, and we say so on
 * the page rather than implying a safety we cannot deliver.
 */

const NEUTRAL = "https://www.google.com/search?q=weather+today";

export function QuickExit() {
  const t = useT();
  useEffect(() => {
    let taps = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      taps += 1;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        taps = 0;
      }, 1200);
      if (taps >= 3) leave();
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={leave}
      aria-label="Quick exit — leave this site immediately"
      className="fixed bottom-4 right-4 z-50 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-exit px-5 text-[17px] font-bold text-exit-on shadow-lg press hover:scale-[1.03] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span aria-hidden="true">✕</span>
      {t("quick.exit")}
    </button>
  );
}

function leave() {
  // 1. Poison the back button first — cheap and synchronous.
  try {
    window.history.replaceState(null, "", "/");
  } catch {
    /* ignore */
  }

  // 2. Leave. Never let cleanup delay this.
  try {
    window.location.replace(NEUTRAL);
  } catch {
    window.location.href = NEUTRAL;
  }

  // 3. Best-effort cleanup on the way out.
  try {
    localStorage.removeItem("sahaay-demo");
    sessionStorage.clear();
  } catch {
    /* storage may be unavailable; leaving still worked */
  }
}
