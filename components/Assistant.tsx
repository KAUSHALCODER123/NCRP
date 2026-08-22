"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { IconArrow, IconExit, IconShield } from "@/components/icons";
import { answerLocally, type Action } from "@/lib/assistant";

/**
 * The assistant panel.
 *
 * Anchored bottom-LEFT on purpose. Quick Exit owns the bottom-right corner
 * and is safety-critical for someone whose abuser may be in the room —
 * nothing may compete with it for that spot or sit near enough to be hit by
 * mistake.
 *
 * Opens closed, and never interrupts. A panel that pops itself open over a
 * form someone is filling in during a fraud would be actively harmful.
 */

interface Msg {
  role: "user" | "assistant";
  content: string;
  actions?: Action[];
  fallback?: boolean;
  urgent?: boolean;
}

const OPENERS = [
  "Someone is calling me about a parcel",
  "Money left my account",
  "Is this UPI ID safe?",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Tell me what happened in your own words — in any language. If money has already gone, say so first and I'll get you straight to the fastest thing.",
  actions: [{ label: "Report money lost", href: "/freeze" }],
};

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const next: Msg[] = [...msgs, { role: "user", content: question }];
    setMsgs(next);
    setDraft("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const r = (await res.json()) as {
        text: string;
        actions: Action[];
        fallback: boolean;
        urgent?: boolean;
      };
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: r.text,
          actions: r.actions,
          fallback: r.fallback,
          urgent: r.urgent,
        },
      ]);
    } catch {
      // The endpoint already falls back; this covers losing the network
      // entirely, and still answers from the same scam library.
      const local = answerLocally(question);
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: local.text,
          actions: local.actions,
          fallback: true,
          urgent: local.urgent,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press fixed bottom-4 left-4 z-40 inline-flex min-h-[52px] items-center gap-2.5 rounded-full border border-line bg-surface px-5 text-[16px] font-semibold text-ink shadow-lg hover:bg-sunken"
        >
          <IconShield className="h-5 w-5 text-primary-text" />
          Ask for help
        </button>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Sahaay assistant"
          className="fixed bottom-4 left-4 right-4 z-40 flex max-h-[min(78dvh,620px)] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-lg sm:right-auto sm:w-[420px]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-line bg-sunken px-4 py-3">
            <span className="flex items-center gap-2.5">
              <IconShield className="h-5 w-5 text-primary-text" />
              <span>
                <span className="block text-[16px] font-semibold leading-tight text-ink">
                  Sahaay assistant
                </span>
                <span className="block text-[13px] leading-tight text-ink-faint">
                  Not a real officer. Never asks for an OTP.
                </span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the assistant"
              className="press rounded-lg p-2 text-ink-soft hover:bg-line"
            >
              <IconExit className="h-5 w-5" />
            </button>
          </header>

          <div
            ref={log}
            className="flex-1 space-y-3 overflow-y-auto p-4"
            role="log"
            aria-live="polite"
          >
            {msgs.map((m, i) => (
              <div
                key={i}
                className={clsx(
                  "max-w-[92%]",
                  m.role === "user" ? "ml-auto" : "mr-auto",
                )}
              >
                <div
                  className={clsx(
                    "rounded-card px-4 py-3 text-[16px] leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-on"
                      : m.urgent
                        ? "border border-critical-border bg-critical-soft text-ink"
                        : "border border-line bg-sunken text-ink",
                  )}
                >
                  {m.content}
                </div>

                {m.actions?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.actions.map((a) => (
                      <Link
                        key={a.href}
                        href={a.href}
                        onClick={() => setOpen(false)}
                        className="press inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-primary-border bg-primary-soft px-3.5 text-[15px] font-semibold text-primary-text"
                      >
                        {a.label}
                        <IconArrow className="h-4 w-4" />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {busy ? (
              <p className="mr-auto rounded-card border border-line bg-sunken px-4 py-3 text-[16px] text-ink-faint">
                Thinking<span className="caret">…</span>
              </p>
            ) : null}

            {msgs.length === 1 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {OPENERS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => send(o)}
                    className="press rounded-full border border-line-strong bg-surface px-3.5 py-2 text-left text-[15px] text-ink-soft hover:bg-sunken"
                  >
                    {o}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            className="border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <label htmlFor="assistant-input" className="sr-only">
              Describe what happened
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="assistant-input"
                ref={input}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                placeholder="What happened?"
                className="max-h-28 min-h-[48px] w-full resize-none rounded-[10px] border border-line-strong bg-surface p-3 text-[16px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || busy}
                aria-label="Send"
                className="press inline-flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-on disabled:opacity-40"
              >
                <IconArrow className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-[13px] leading-snug text-ink-faint">
              For a real emergency call{" "}
              <a href="tel:1930" className="font-semibold text-primary-text">
                1930
              </a>
              . This is a student project and files no real complaint.
            </p>
          </form>
        </div>
      ) : null}
    </>
  );
}
