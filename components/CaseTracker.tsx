"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button, Card, Chip, Shell, Stat, TopBar } from "@/components/ui";
import { SlaClock } from "@/components/SlaClock";
import { CaseIntake } from "@/components/CaseIntake";
import { formatPaise } from "@/lib/money";
import { readSla } from "@/lib/sla";
import { useNow } from "@/lib/use-now";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-now";
import { clusterById } from "@/lib/mock/clusters";
import type { Case, CaseStatus } from "@/lib/types";
import { useT, type Key } from "@/lib/i18n";

/**
 * The live case tracker — replaces "Under Process".
 *
 * Three deliberate choices:
 *  - The money-back stage is on the main rail from day one. In the real
 *    portal it is invisible, which is a large part of why only ~2.18% of
 *    reported stolen money is ever returned.
 *  - Sahaay files the restoration application FOR the victim. Removing
 *    victim-initiation is the highest-leverage fix available.
 *  - Escalation is a button, not a directory of nodal officers' phone numbers.
 */

const RAIL: { key: CaseStatus; label: Key }[] = [
  { key: "filed", label: "ct.filed" },
  { key: "freezing", label: "ct.moneyHeld" },
  { key: "routed", label: "ct.routed" },
  { key: "assigned", label: "ct.officer" },
  { key: "fir_registered", label: "ct.fir" },
  { key: "closed", label: "ct.returned" },
];

function railIndex(c: Case): number {
  const order: CaseStatus[] = [
    "filed",
    "freezing",
    "routed",
    "assigned",
    "investigating",
    "fir_registered",
    "restoring",
    "closed",
  ];
  const i = order.indexOf(c.status);
  if (c.status === "investigating") return 3;
  if (c.status === "restoring") return 4;
  if (c.status === "closed") return 5;
  return Math.min(i, 5);
}

export function CaseTracker({ caseId }: { caseId: string }) {
  // This page reads client-stored data; SSR cannot be correct for it.
  const hydrated = useHydrated();
  const t = useT();
  const kase = useStore((s) => s.cases.find((c) => c.id === caseId));
  const escalate = useStore((s) => s.escalate);
  const [escalated, setEscalated] = useState(false);
  // Same reason as SlaClock: 0 until hydrated, so server and client agree.
  const now = useNow();


  if (!hydrated) return <Loading />;

  if (!kase) {
    return (
      <>
        <TopBar />
        <Shell>
          <Card>
            <p className="text-[18px] font-semibold text-ink">
              No such case on this device.
            </p>
            <p className="mt-2 text-ink-soft">
              Demo data lives in your browser. Try a demo login, or file a new
              report.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="/login">Demo logins</Button>
              <Button href="/freeze" variant="secondary">
                File a report
              </Button>
            </div>
          </Card>
        </Shell>
      </>
    );
  }

  const held = kase.freezes.reduce((a, f) => a + f.heldPaise, 0);
  const reported = kase.transaction?.amountPaise ?? 0;
  const idx = railIndex(kase);
  const cluster = clusterById(kase.clusterId);
  const slaReading =
    kase.sla && now > 0 ? readSla(kase.sla, new Date(now)) : null;
  const canEscalate =
    slaReading && (slaReading.state === "breached" || slaReading.state === "at_risk");

  return (
    <>
      <TopBar back={{ href: "/dashboard", label: "My cases" }} />
      <Shell>
        <div className="flex flex-wrap items-center gap-3">
          <span className="data text-[16px] font-semibold text-ink-soft">
            {kase.id}
          </span>
          {kase.firNumber ? (
            <Chip tone="primary">FIR {kase.firNumber}</Chip>
          ) : null}
          {kase.status === "closed" ? <Chip tone="held">Closed</Chip> : null}
        </div>

        <h1 className="font-display mt-3 text-[28px] font-bold leading-tight text-ink sm:text-[32px]">
          {kase.status === "closed"
            ? t("ct.moneyBack")
            : t("ct.whereis")}
        </h1>

        {/* Money summary */}
        <Card className="mt-6">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <Stat label={t("ct.youReported")} value={formatPaise(reported)} />
            <Stat
              label={t("ct.heldForYou")}
              value={formatPaise(held)}
              tone={held > 0 ? "held" : "neutral"}
            />
            <Stat
              label={t("ct.backInAccount")}
              value={formatPaise(kase.restoration.creditedPaise)}
              tone={kase.restoration.creditedPaise > 0 ? "held" : "neutral"}
              hint={
                kase.restoration.creditedPaise > 0
                  ? undefined
                  : t("ct.theGoal")
              }
            />
          </div>
        </Card>

        {/* Progress rail */}
        <div className="-mx-5 mt-6 overflow-x-auto px-5 pb-1">
          <ol className="flex min-w-[520px] items-center gap-1 sm:min-w-0">
            {RAIL.map((s, i) => {
              const state = i < idx ? "done" : i === idx ? "current" : "todo";
              return (
                <li key={s.key} className="flex flex-1 items-center gap-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={clsx(
                        "flex h-7 w-7 items-center justify-center rounded-full border-2 text-[14px] font-bold",
                        state === "done" &&
                          "border-held bg-held text-white",
                        state === "current" &&
                          "border-primary bg-primary text-white",
                        state === "todo" &&
                          "border-line-strong bg-surface text-ink-faint",
                      )}
                    >
                      {state === "done" ? "✓" : i + 1}
                    </span>
                    <span
                      className={clsx(
                        "whitespace-nowrap text-[14px] font-semibold",
                        state === "todo" ? "text-ink-faint" : "text-ink",
                      )}
                    >
                      {t(s.label)}
                    </span>
                  </div>
                  {i < RAIL.length - 1 ? (
                    <span
                      className={clsx(
                        "mb-6 h-0.5 flex-1",
                        i < idx ? "bg-held" : "bg-line",
                      )}
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Who owns it now */}
        {kase.assignedOwner ? (
          <Card className="mt-6">
            <p className="text-[15px] font-medium text-ink-faint">
              {t("ct.currentlyWith")}
            </p>
            <p className="text-[20px] font-semibold text-ink">
              {kase.assignedOwner}
            </p>
            <p className="mt-1 text-[16px] text-ink-soft">
              {t("ct.contactNote")}
            </p>
          </Card>
        ) : null}

        {kase.sla ? (
          <div className="mt-5">
            <SlaClock sla={kase.sla} />
            {canEscalate ? (
              <div className="mt-3">
                {escalated ? (
                  <p className="rounded-xl border border-pending/30 bg-pending-soft p-4 text-[16px] text-ink">
                    {t("ct.escalated")}
                  </p>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      escalate(kase.id);
                      setEscalated(true);
                    }}
                  >
                    ⚡ {t("ct.escalate")}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Money-back lane, always visible */}
        <Card className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[18px] font-semibold text-ink">
              {t("ct.gettingBack")}
            </p>
            {kase.restoration.autoFiled ? (
              <Chip tone="held">{t("ct.filedForYou")}</Chip>
            ) : (
              <Chip>{t("ct.notStarted")}</Chip>
            )}
          </div>
          <p className="mt-2 text-[16px] text-ink-soft">
            {kase.restoration.status === "credited"
              ? `${formatPaise(kase.restoration.creditedPaise)} was credited back to your account.`
              : kase.restoration.autoFiled
                ? "We filed the restoration application on your behalf. You didn't need to know this step existed, or read a single section of law."
                : "Once an officer is assigned, we file this for you automatically."}
          </p>
          {kase.restoration.sla ? (
            <div className="mt-4">
              <SlaClock sla={kase.restoration.sla} />
            </div>
          ) : null}
        </Card>

        {cluster ? (
          <Card className="mt-5 border-primary/25 bg-primary-soft">
            <p className="text-[17px] font-semibold text-ink">
              {t("ct.notAlone")} {cluster.reports} {t("ct.notAloneSub")}
            </p>
            <p className="mt-1 text-[16px] text-ink-soft">
              All linked to cluster {cluster.clusterId}. One investigation
              covers every victim, instead of {cluster.reports} separate files
              competing for the same officer&apos;s time.
            </p>
          </Card>
        ) : null}

        {/* What we understood + add details */}
        <div id="add-details" className="mt-5 scroll-mt-24">
          <CaseIntake kase={kase} />
        </div>

        {/* Timeline */}
        <h2 className="mt-8 text-[22px] font-bold text-ink">
          {t("ct.timeline")}
        </h2>
        <ol className="mt-4 space-y-0">
          {[...kase.timeline].reverse().map((e, i, arr) => (
            <li key={e.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={clsx(
                    "mt-1.5 h-3 w-3 shrink-0 rounded-full",
                    e.tone === "held" && "bg-held",
                    e.tone === "pending" && "bg-pending",
                    e.tone === "breach" && "bg-breach",
                    e.tone === "neutral" && "bg-line-strong",
                  )}
                />
                {i < arr.length - 1 ? (
                  <span className="w-0.5 flex-1 bg-line" />
                ) : null}
              </div>
              <div className="pb-6">
                <p className="text-[17px] font-semibold text-ink">{e.title}</p>
                {e.detail ? (
                  <p className="mt-0.5 text-[16px] text-ink-soft">{e.detail}</p>
                ) : null}
                <p className="data mt-1 text-[14px] text-ink-faint">
                  {new Date(e.at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Shell>
    </>
  );
}

function Loading() {
  return (
    <Shell>
      <div className="animate-pulse space-y-4" aria-hidden="true">
        <div className="h-6 w-40 rounded bg-sunken" />
        <div className="h-10 w-3/4 rounded bg-sunken" />
        <div className="h-32 rounded-card bg-sunken" />
        <div className="h-24 rounded-card bg-sunken" />
      </div>
      <p className="sr-only">Loading your case…</p>
    </Shell>
  );
}
