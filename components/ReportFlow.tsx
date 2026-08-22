"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { IconCheck, IconClock, IconLock, IconShield } from "@/components/icons";
import { EvidenceUploader } from "@/components/EvidenceUploader";
import { useHydrated } from "@/lib/use-now";
import type { KindConfig } from "@/lib/report-kinds";
import { useT, type Key } from "@/lib/i18n";
import { identify, detectedKey } from "@/lib/identify";
import { lookupCluster } from "@/lib/mock/clusters";
import { reportSignal, signalCount } from "@/lib/signal";

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
  const t = useT();

  /*
   * The flow's own copy lives in lib/report-kinds.ts so a reader of that file
   * sees real sentences rather than key names. Translations layer on top by
   * key, and fall back to the English already in the config when a key is
   * missing — so a gap shows the original sentence, never a blank.
   */
  const rk = (suffix: string, fallback: string) => {
    const key = `rk.${config.kind}.${suffix}` as Key;
    const value = t(key);
    return value === key ? fallback : value;
  };
  const hydrated = useHydrated();

  const [situation, setSituation] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(config.anonymous);
  const [where, setWhere] = useState("");
  const [detail, setDetail] = useState("");
  const [phase, setPhase] = useState<Phase>("triage");
  const [liveReports, setLiveReports] = useState(0);
  const [sent, setSent] = useState(0);
  const [caseId] = useState(makeCaseId);
  const [token] = useState(makeToken);

  const chosen = config.situations.find((s) => s.id === situation) ?? null;

  /*
   * What was pasted decides where the notice goes. A phone number cannot be
   * taken down by a platform — it needs the telecom operator and Chakshu —
   * so the dispatch list is built from the identifier, not fixed in advance.
   */
  const identified = identify(where);

  useEffect(() => {
    const value = identified.value;
    let cancelled = false;

    /*
     * Debounced, and every write happens in a callback rather than in the
     * effect body — clearing the count synchronously on each keystroke would
     * cascade a render per character typed.
     */
    const timer = setTimeout(() => {
      if (!value || value.length < 4) {
        setLiveReports(0);
        return;
      }
      void signalCount(value).then((n) => {
        if (!cancelled) setLiveReports(n);
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [identified.value]);

  const targets = [...identified.extraTargets, ...config.targets];
  // Seeded demo data plus whatever this deployment has actually recorded.
  const seeded = identified.value ? lookupCluster(identified.value) : null;
  const reports = (seeded?.reports ?? 0) + liveReports;

  /* Dispatch, shown as it happens — the analogue of the freeze receipt. */
  useEffect(() => {
    if (phase !== "acting") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = targets.map((_, i) =>
      setTimeout(() => setSent(i + 1), reduced ? 0 : 500 + i * 620),
    );
    const finish = setTimeout(
      () => setPhase("done"),
      reduced ? 10 : 500 + targets.length * 620 + 500,
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, targets.length]);

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
          {rk("title", config.title)}
        </h1>
        <p className="mt-3 text-[18px] leading-relaxed text-ink-soft">
          {rk("lede", config.lede)}
        </p>

        {/* Safety, before anything is collected. */}
        <Card className="mt-6 border-primary-border bg-primary-soft">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary text-primary-on">
            <IconShield className="h-5 w-5" />
          </span>
          <p className="mt-3.5 text-[17px] font-semibold text-ink">
            {t("rp.beforeStart")}
          </p>
          <ul className="mt-2.5 space-y-2 text-[16px] leading-relaxed text-ink-soft">
            {config.safety.map((line, i) => (
              <li key={line} className="flex gap-2.5">
                <span aria-hidden="true" className="text-primary-text">
                  •
                </span>
                <span>{rk(`safety.${i}`, line)}</span>
              </li>
            ))}
          </ul>
        </Card>

        {phase === "triage" ? (
          <>
            {/* 1. What is happening */}
            <section className="mt-8">
              <h2 className="font-display text-[22px] font-bold text-ink">
                {t("rp.whatHappening")}
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
                      {rk(`s.${s.id}.label`, s.label)}
                    </span>
                    <span className="mt-1 block text-[16px] text-ink-soft">
                      {rk(`s.${s.id}.sub`, s.sub)}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* The one thing to do right now, before any form. */}
            {chosen ? (
              <Card className="mt-5 border-tertiary-border bg-tertiary-soft">
                <p className="eyebrow">{t("rp.doFirst")}</p>
                <p className="mt-2 text-[17px] leading-relaxed text-ink">
                  {rk(`s.${chosen.id}.first`, chosen.firstAction)}
                </p>
              </Card>
            ) : null}

            {/* 2. Identity */}
            {chosen ? (
              <section className="mt-8">
                <h2 className="font-display text-[22px] font-bold text-ink">
                  {t("rp.howRecord")}
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
                          {t("rp.withoutName")}
                        </span>
                        <span className="mt-1 block text-[16px] text-ink-soft">
{t("rp.withoutNameSub")}
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
                        {t("rp.withDetails")}
                      </span>
                      <span className="mt-1 block text-[16px] text-ink-soft">
{t("rp.withDetailsSub")}
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
                  {t("rp.whereHappening")}
                </h2>
                <label htmlFor="where" className="sr-only">
                  Link, username or platform
                </label>
                <p className="mt-1 text-[16px] text-ink-soft">
                  {t("rp.whereHint")}
                </p>
                <input
                  id="where"
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder={t("rp.wherePlaceholder")}
                  className="mt-3 w-full rounded-[10px] border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
                />

                {where.trim() ? (
                  <p className="mt-2 text-[15px] leading-relaxed text-secondary-text">
                    {t(detectedKey(identified.kind) as Key)}
                  </p>
                ) : null}

                {reports > 0 ? (
                  <div className="mt-3 rounded-[10px] border border-tertiary-border bg-tertiary-soft p-4">
                    <p className="text-[16px] font-semibold text-ink">
                      {t("rp.alreadyReported")} — {reports}
                    </p>
                    <p className="mt-1 text-[16px] text-ink-soft">
                      {t("rp.alreadyReportedSub")}
                    </p>
                  </div>
                ) : null}

                <label
                  htmlFor="detail"
                  className="mt-5 block text-[17px] font-semibold text-ink"
                >
                  {situation === "other"
                    ? t("rp.addAnything")
                    : t("rp.addAnything")}{" "}
                  {situation === "other" ? null : (
                    <span className="font-normal text-ink-faint">optional</span>
                  )}
                </label>
                <p className="mt-1 text-[15px] text-ink-soft">
{t("rp.addAnythingSub")}
                </p>
                <textarea
                  id="detail"
                  rows={4}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  className="mt-2 w-full resize-y rounded-[10px] border border-line-strong bg-surface p-4 text-[17px] leading-relaxed focus:border-primary focus:outline-none"
                />

                <div className="mt-5">
                  <EvidenceUploader onAutofill={() => {}} context="content" />
                </div>

                <Button
                  className="mt-6 w-full"
                  disabled={
                    !where.trim() ||
                    (situation === "other" && detail.trim().length < 20)
                  }
                  onClick={() => {
                    reportSignal({
                      identifier: identified.value,
                      scam: config.kind,
                    });
                    setPhase("acting");
                  }}
                >
                  {rk("raceLabel", config.raceLabel)} →
                </Button>
                <p className="mt-2 text-center text-[15px] text-ink-faint">
                  {t("rp.startsBefore")}
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
                {rk("raceLabel", config.raceLabel)}
              </p>
              <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-faint">
                <IconClock className="h-4 w-4" />
                <span className="data">
                  {sent}/{targets.length}
                </span>
              </span>
            </div>
            <p className="mt-1.5 text-[16px] text-ink-soft">
              {rk("raceDetail", config.raceDetail)}
            </p>

            <ul className="mt-4 space-y-2">
              {targets.map((target, i) => {
                const on = i < sent;
                return (
                  <li
                    key={target}
                    className={clsx(
                      "flex items-center justify-between gap-3 rounded-[10px] border px-4 py-3",
                      on
                        ? "ack-in border-secondary-border bg-secondary-soft"
                        : "border-line bg-surface",
                    )}
                  >
                    <span className="text-[16px] font-semibold text-ink">
                      {target}
                    </span>
                    {on ? (
                      <span className="flex items-center gap-1.5 text-[15px] font-semibold text-secondary-text">
                        {t("rp.noticeSent")}
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
                {t("rp.reportOpen")}
              </Chip>
              <p className="mt-3 text-[20px] font-bold text-ink">
                {anonymous ? t("rp.recordedAnon") : `${caseId}`}
              </p>

              {anonymous ? (
                <>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
{t("rp.keepCode")}
                  </p>
                  <p className="data mt-4 rounded-[10px] border border-line bg-surface p-4 text-center text-[24px] font-bold tracking-[0.16em] text-ink">
                    {token}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
{t("rp.officerReach")}
                </p>
              )}
            </Card>

            <Card className="mt-5">
              <p className="text-[17px] font-semibold text-ink">
                {t("rp.whatNext")}
              </p>
              <ul className="mt-3 space-y-2.5 text-[16px] leading-relaxed text-ink-soft">
                <li>
{t("rp.next1")}
                </li>
                <li>
{t("rp.next2")}
                </li>
                <li>
                  {anonymous
                    ? t("rp.next3anon")
                    : t("rp.next3named")}
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/learn" variant="secondary">
                  {t("rp.howScamWorks")}
                </Button>
                {!anonymous ? (
                  <Button href="/dashboard" variant="secondary">
                    {t("rp.trackIt")}
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
