"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { IconCheck, IconClock, IconLock, IconShield } from "@/components/icons";
import { EvidenceUploader } from "@/components/EvidenceUploader";
import { useHydrated } from "@/lib/use-now";
import type { KindConfig } from "@/lib/report-kinds";

/**
 * The non-financial report.
 *
 * Same shape as the money flow — a short triage, then the system acting before
 * it asks for anything else — because the underlying race is the same. Here it
 * is content spreading and platform logs ageing out rather than money moving
 * between accounts.
 *
 * Anonymity, where offered, is on by default rather than an option to find.
 * The claim token is what makes that workable: it lets someone come back to a
 * report they filed without a name.
 */

type Phase = "triage" | "acting" | "done";

function makeToken() {
  const block = () =>
    Math.random().toString(36).replace(/[^a-z0-9]/g, "").slice(0, 4).toUpperCase();
  return `${block()}-${block()}-${block()}`;
}

function makeCaseId() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `SHY-${d.getFullYear()}-${mm}-${Math.floor(1000 + Math.random() * 8999)}`;
}

export function ReportFlow({ config }: { config: KindConfig }) {
  const hydrated = useHydrated();

  const [situation, setSituation] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(config.anonymous);
  const [where, setWhere] = useState("");
  const [detail, setDetail] = useState("");
  const [phase, setPhase] = useState<Phase>("triage");
  const [sent, setSent] = useState(0);
  const [caseId] = useState(makeCaseId);
  const [token] = useState(makeToken);

  const chosen = config.situations.find((s) => s.id === situation) ?? null;

  /* Dispatch, shown as it happens — the analogue of the freeze receipt. */
  useEffect(() => {
    if (phase !== "acting") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = config.targets.map((_, i) =>
      setTimeout(() => setSent(i + 1), reduced ? 0 : 500 + i * 620),
    );
    const finish = setTimeout(
      () => setPhase("done"),
      reduced ? 10 : 500 + config.targets.length * 620 + 500,
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [phase, config.targets]);

  if (!hydrated) {
    return (
      <Shell>
        <div className="animate-pulse space-y-4" aria-hidden="true">
          <div className="h-9 w-72 rounded bg-sunken" />
          <div className="h-28 rounded-card bg-sunken" />
        </div>
      </Shell>
    );
  }

  return (
    <>
      <TopBar back={{ href: "/", label: "Back" }} />
      <Shell>
        <h1 className="font-display text-[30px] font-bold leading-tight text-ink sm:text-[35px]">
          {config.title}
        </h1>
        <p className="mt-3 text-[18px] leading-relaxed text-ink-soft">
          {config.lede}
        </p>

        {/* Safety, before anything is collected. */}
        <Card className="mt-6 border-primary-border bg-primary-soft">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary text-primary-on">
            <IconShield className="h-5 w-5" />
          </span>
          <p className="mt-3.5 text-[17px] font-semibold text-ink">
            Before you start
          </p>
          <ul className="mt-2.5 space-y-2 text-[16px] leading-relaxed text-ink-soft">
            {config.safety.map((s) => (
              <li key={s} className="flex gap-2.5">
                <span aria-hidden="true" className="text-primary-text">
                  •
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        {phase === "triage" ? (
          <>
            {/* 1. What is happening */}
            <section className="mt-8">
              <h2 className="font-display text-[22px] font-bold text-ink">
                What is happening?
              </h2>
              <div className="mt-4 space-y-3">
                {config.situations.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSituation(s.id)}
                    aria-pressed={situation === s.id}
                    className={clsx(
                      "press w-full rounded-card border p-5 text-left",
                      situation === s.id
                        ? "border-2 border-primary bg-primary-soft"
                        : "border-line bg-surface hover:border-line-strong hover:bg-sunken",
                    )}
                  >
                    <span className="block text-[18px] font-semibold text-ink">
                      {s.label}
                    </span>
                    <span className="mt-1 block text-[16px] text-ink-soft">
                      {s.sub}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* The one thing to do right now, before any form. */}
            {chosen ? (
              <Card className="mt-5 border-tertiary-border bg-tertiary-soft">
                <p className="eyebrow">Do this first</p>
                <p className="mt-2 text-[17px] leading-relaxed text-ink">
                  {chosen.firstAction}
                </p>
              </Card>
            ) : null}

            {/* 2. Identity */}
            {chosen ? (
              <section className="mt-8">
                <h2 className="font-display text-[22px] font-bold text-ink">
                  How should we record this?
                </h2>
                <div className="mt-4 space-y-3">
                  {config.anonymous ? (
                    <label
                      className={clsx(
                        "flex cursor-pointer items-start gap-3 rounded-card border p-5",
                        anonymous
                          ? "border-2 border-primary bg-primary-soft"
                          : "border-line bg-surface",
                      )}
                    >
                      <input
                        type="radio"
                        name="identity"
                        checked={anonymous}
                        onChange={() => setAnonymous(true)}
                        className="mt-1 h-5 w-5 accent-[var(--color-primary)]"
                      />
                      <span>
                        <span className="flex items-center gap-2 text-[18px] font-semibold text-ink">
                          <IconLock className="h-5 w-5" />
                          Without my name
                        </span>
                        <span className="mt-1 block text-[16px] text-ink-soft">
                          You get a code to track it and add to it later. We
                          never learn who you are, and nobody can ask us.
                        </span>
                      </span>
                    </label>
                  ) : null}

                  <label
                    className={clsx(
                      "flex cursor-pointer items-start gap-3 rounded-card border p-5",
                      !anonymous
                        ? "border-2 border-primary bg-primary-soft"
                        : "border-line bg-surface",
                    )}
                  >
                    <input
                      type="radio"
                      name="identity"
                      checked={!anonymous}
                      onChange={() => setAnonymous(false)}
                      className="mt-1 h-5 w-5 accent-[var(--color-primary)]"
                    />
                    <span>
                      <span className="block text-[18px] font-semibold text-ink">
                        With my details
                      </span>
                      <span className="mt-1 block text-[16px] text-ink-soft">
                        An officer can call you, and you can be told what
                        happened. Needed if you want anything back.
                      </span>
                    </span>
                  </label>
                </div>
              </section>
            ) : null}

            {/* 3. Where, and evidence */}
            {chosen ? (
              <section className="mt-8">
                <h2 className="font-display text-[22px] font-bold text-ink">
                  Where is it happening?
                </h2>
                <label htmlFor="where" className="sr-only">
                  Link, username or platform
                </label>
                <input
                  id="where"
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder="A link, a username, or just the app name"
                  className="mt-3 w-full rounded-[10px] border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
                />

                <label
                  htmlFor="detail"
                  className="mt-5 block text-[17px] font-semibold text-ink"
                >
                  Anything you want to add{" "}
                  <span className="font-normal text-ink-faint">optional</span>
                </label>
                <p className="mt-1 text-[15px] text-ink-soft">
                  In any language. There is no minimum length, and every
                  character works.
                </p>
                <textarea
                  id="detail"
                  rows={4}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  className="mt-2 w-full resize-y rounded-[10px] border border-line-strong bg-surface p-4 text-[17px] leading-relaxed focus:border-primary focus:outline-none"
                />

                <div className="mt-5">
                  <EvidenceUploader onAutofill={() => {}} />
                </div>

                <Button
                  className="mt-6 w-full"
                  disabled={!where.trim()}
                  onClick={() => setPhase("acting")}
                >
                  {config.raceLabel} →
                </Button>
                <p className="mt-2 text-center text-[15px] text-ink-faint">
                  We start before asking you anything else.
                </p>
              </section>
            ) : null}
          </>
        ) : null}

        {/* Dispatch receipt */}
        {phase !== "triage" ? (
          <Card className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[18px] font-semibold text-ink">
                {config.raceLabel}
              </p>
              <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-faint">
                <IconClock className="h-4 w-4" />
                <span className="data">
                  {sent}/{config.targets.length}
                </span>
              </span>
            </div>
            <p className="mt-1.5 text-[16px] text-ink-soft">
              {config.raceDetail}
            </p>

            <ul className="mt-4 space-y-2">
              {config.targets.map((t, i) => {
                const on = i < sent;
                return (
                  <li
                    key={t}
                    className={clsx(
                      "flex items-center justify-between gap-3 rounded-[10px] border px-4 py-3",
                      on
                        ? "ack-in border-secondary-border bg-secondary-soft"
                        : "border-line bg-surface",
                    )}
                  >
                    <span className="text-[16px] font-semibold text-ink">
                      {t}
                    </span>
                    {on ? (
                      <span className="flex items-center gap-1.5 text-[15px] font-semibold text-secondary-text">
                        Notice sent
                        <IconCheck className="h-5 w-5" />
                      </span>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="pulse-ring h-2.5 w-2.5 rounded-full bg-line-strong text-ink-faint"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        ) : null}

        {phase === "done" ? (
          <>
            <Card className="mt-5 border-secondary-border bg-secondary-soft">
              <Chip tone="held">
                <IconCheck className="h-4 w-4" />
                Report open
              </Chip>
              <p className="mt-3 text-[20px] font-bold text-ink">
                {anonymous ? "Recorded without your name" : `Case ${caseId}`}
              </p>

              {anonymous ? (
                <>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
                    Keep this code somewhere safe. It is the only way back to
                    this report, and it is not linked to you in any way — if you
                    lose it, nobody can recover it for you, which is exactly
                    what makes it anonymous.
                  </p>
                  <p className="data mt-4 rounded-[10px] border border-line bg-surface p-4 text-center text-[24px] font-bold tracking-[0.16em] text-ink">
                    {token}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
                  An officer can reach you about this. You can follow it from
                  your case list at any time.
                </p>
              )}
            </Card>

            <Card className="mt-5">
              <p className="text-[17px] font-semibold text-ink">
                What happens next
              </p>
              <ul className="mt-3 space-y-2.5 text-[16px] leading-relaxed text-ink-soft">
                <li>
                  Platforms have been asked to preserve the records now, before
                  their own retention clock deletes them.
                </li>
                <li>
                  A cyber police station is assigned from where the content is
                  hosted — you were never asked to pick a district.
                </li>
                <li>
                  {anonymous
                    ? "You can add to this report later with your code, without ever giving a name."
                    : "You will be told when it is assigned, and by when."}
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/learn" variant="secondary">
                  How this scam works
                </Button>
                {!anonymous ? (
                  <Button href="/dashboard" variant="secondary">
                    Track it
                  </Button>
                ) : null}
              </div>
            </Card>
          </>
        ) : null}
      </Shell>
    </>
  );
}
