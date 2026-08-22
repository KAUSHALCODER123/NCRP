"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Button, Card, Chip } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Case, Classification } from "@/lib/types";

/**
 * Category-free intake.
 *
 * The citizen describes what happened in their own words — typed or spoken —
 * and the system classifies, maps to statute, and routes. It shows its work
 * and stays editable, because the real portal's submissions are permanently
 * non-editable and a single wrong category misroutes a case forever.
 */

type SpeechCtor = new () => SpeechRecognitionLike;
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function CaseIntake({ kase }: { kase: Case }) {
  const setClassification = useStore((s) => s.setClassification);
  const appendNarrative = useStore((s) => s.appendNarrative);

  const [text, setText] = useState(kase.narrative);
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const [listening, setListening] = useState(false);
  const recog = useRef<SpeechRecognitionLike | null>(null);

  /*
   * Feature-detect and hide the mic rather than shipping a broken affordance.
   * useSyncExternalStore (rather than an effect) so the server renders "no
   * speech" and the client corrects it without a cascading re-render.
   */
  const speechOk = useSyncExternalStore(
    () => () => {},
    () => {
      const w = window as unknown as {
        SpeechRecognition?: SpeechCtor;
        webkitSpeechRecognition?: SpeechCtor;
      };
      return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
    },
    () => false,
  );

  function toggleMic() {
    const w = window as unknown as {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;

    if (listening) {
      recog.current?.stop();
      setListening(false);
      return;
    }

    const r = new Ctor();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = true;
    r.onresult = (e) => {
      let out = "";
      for (let i = 0; i < e.results.length; i++) {
        out += e.results[i][0].transcript;
      }
      setText(out);
    };
    r.onend = () => setListening(false);
    recog.current = r;
    r.start();
    setListening(true);
  }

  async function analyse() {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const c = (await res.json()) as Classification;
      setClassification(kase.id, c);
      if (text !== kase.narrative) appendNarrative(kase.id, text);
    } catch {
      /* route already falls back; nothing to surface */
    } finally {
      setBusy(false);
    }
  }

  const c = kase.classification;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[18px] font-semibold text-ink">
          Tell us what happened
        </p>
        <div className="flex gap-1 rounded-full border border-line p-0.5">
          {(["en-IN", "hi-IN"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={
                lang === l
                  ? "rounded-full bg-primary px-3 py-1 text-[15px] font-semibold text-white"
                  : "rounded-full px-3 py-1 text-[15px] font-semibold text-ink-soft"
              }
            >
              {l === "en-IN" ? "English" : "हिन्दी"}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-1 text-[16px] text-ink-soft">
        In your own words. No minimum length, and every character works —
        including {"@"}, {"#"} and {"'"}.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={
          lang === "hi-IN"
            ? "जो हुआ वह अपने शब्दों में लिखें…"
            : "They called saying my card was blocked and asked for an OTP…"
        }
        className="mt-3 w-full resize-y rounded-xl border border-line-strong bg-surface p-4 text-[17px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap gap-3">
        <Button onClick={analyse} disabled={!text.trim() || busy}>
          {busy ? "Reading…" : c ? "Update" : "Continue"}
        </Button>
        {speechOk ? (
          <Button variant="secondary" onClick={toggleMic}>
            {listening ? "◼ Stop" : "🎤 Speak instead"}
          </Button>
        ) : null}
      </div>

      {c ? (
        <div className="mt-5 rounded-xl border border-line bg-sunken p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[17px] font-semibold text-ink">
              What we understood
            </p>
            <Chip tone={c.fallback ? "neutral" : "primary"}>
              {c.fallback ? "Offline classifier" : "AI"}
            </Chip>
          </div>
          <dl className="mt-3 space-y-2 text-[16px]">
            <Row label="Category" value={`${c.category} → ${c.subcategory}`} />
            <Row label="Sections" value={c.sections.join(" · ")} />
            <Row label="What happened" value={c.modus} />
            <Row label="Routing" value={`⚑ ${c.routedTo}`} />
          </dl>
          <p className="mt-3 text-[15px] text-ink-soft">
            You never had to pick a category, and you were never asked which
            district this belongs to. Anything wrong here is editable — unlike
            the official portal, where a submitted complaint can never be
            corrected.
          </p>
        </div>
      ) : null}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="w-full shrink-0 font-medium text-ink-faint sm:w-[110px]">{label}</dt>
      <dd className="min-w-0 flex-1 font-semibold text-ink">{value}</dd>
    </div>
  );
}
