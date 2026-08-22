"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { clock, formatPaise } from "@/lib/money";
import { useNow } from "@/lib/use-now";
import { useStore } from "@/lib/store";
import { INSTITUTIONS } from "@/lib/mock/banks";
import { lookupCluster } from "@/lib/mock/clusters";
import type { FreezeAck, FreezeRequest } from "@/lib/types";

/**
 * Screen 3 — the live freeze receipt.
 *
 * Inverts the current portal: the citizen did ~40 seconds of work and now
 * watches the system work for them, instead of doing 20 minutes of work and
 * then hoping.
 *
 * Streams over SSE, with a client-side simulation fallback. An API failure
 * during judging must never be visible.
 */

interface AckPayload {
  institutionId: string;
  institutionName: string;
  role: FreezeRequest["role"];
  ack: FreezeAck;
  heldPaise: number;
  atMs: number;
  exitTrail?: { to: string; rail: string };
}

export function FreezeReceipt({ caseId }: { caseId: string }) {
  const kase = useStore((s) => s.cases.find((c) => c.id === caseId));
  const recordFreezeAck = useStore((s) => s.recordFreezeAck);
  const completeFreeze = useStore((s) => s.completeFreeze);

  const now = useNow();
  const kicked = useRef(false);

  const amountPaise = kase?.transaction?.amountPaise ?? 0;
  const freezes = kase?.freezes ?? [];

  /*
   * `done` is derived, not stored: it is exactly "every institution has
   * answered". Keeping it in state would mean two sources of truth that can
   * disagree after a refresh.
   */
  const done = freezes.length > 0 && freezes.every((f) => f.ack !== "pending");

  /*
   * Elapsed is measured from when the citizen tapped (the case's filedAt),
   * not from when this component mounted — so a refresh shows the true
   * response time rather than restarting the clock at zero.
   */
  const startedAt = kase ? new Date(kase.filedAt).getTime() : 0;
  const lastResponse = freezes.reduce(
    (m, f) => (f.respondedAt ? Math.max(m, new Date(f.respondedAt).getTime()) : m),
    0,
  );
  // Once everyone has answered, freeze the readout at the real response time
  // rather than letting it keep counting.
  const endAt = done && lastResponse ? lastResponse : now;
  const elapsed = endAt && startedAt ? Math.max(0, endAt - startedAt) : 0;

  /* Stream acknowledgements */
  useEffect(() => {
    if (!kase || kicked.current) return;
    if (freezes.length === 0) return;
    // Already-settled case (e.g. a refresh): don't re-run the theatre.
    if (freezes.every((f) => f.ack !== "pending")) return;
    kicked.current = true;

    const insts = freezes.map((f) => `${f.institutionId}:${f.role}`).join(",");
    const url = `/api/freeze/stream?amount=${amountPaise}&insts=${encodeURIComponent(insts)}`;

    let es: EventSource | null = null;
    let fallbackTimers: ReturnType<typeof setTimeout>[] = [];
    let gotAnything = false;

    const apply = (p: AckPayload) => {
      gotAnything = true;
      recordFreezeAck(
        caseId,
        p.institutionId,
        p.ack,
        p.heldPaise,
        p.exitTrail as AckPayload["exitTrail"] & { rail: never },
      );
    };

    /** If SSE never connects, run the same sequence locally — same rules. */
    const runFallback = () => {
      let t = 0;
      const hasLayer2 = freezes.some((f) => f.role === "layer2");
      const holdable = hasLayer2 ? Math.round(amountPaise * 0.72) : amountPaise;
      let remaining = holdable;
      let leaked = amountPaise - holdable;

      // Causal ordering: layer2 can never resolve before the beneficiary.
      const ordered = [...freezes].sort((a, b) => {
        const rank = (r: FreezeRequest["role"]) => (r === "layer2" ? 1 : 0);
        if (rank(a.role) !== rank(b.role)) return rank(a.role) - rank(b.role);
        const la = INSTITUTIONS.find((i) => i.id === a.institutionId)?.latency[0] ?? 900;
        const lb = INSTITUTIONS.find((i) => i.id === b.institutionId)?.latency[0] ?? 900;
        return la - lb;
      });

      ordered.forEach((f) => {
        const inst = INSTITUTIONS.find((i) => i.id === f.institutionId);
        const [lo, hi] = inst?.latency ?? [800, 1800];
        t += lo + Math.random() * (hi - lo);
        const at = t;
        fallbackTimers.push(
          setTimeout(() => {
            if (f.role === "debit") {
              apply({ ...f, ack: "acknowledged", heldPaise: 0, atMs: at } as AckPayload);
            } else if (f.role === "layer2") {
              if (leaked > 0) {
                leaked = 0;
                apply({
                  ...f,
                  ack: "moved",
                  heldPaise: 0,
                  atMs: at,
                  exitTrail: { to: "Wallet ending 7781", rail: "wallet" },
                } as AckPayload);
              } else {
                apply({ ...f, ack: "acknowledged", heldPaise: 0, atMs: at } as AckPayload);
              }
            } else {
              const held = remaining;
              remaining = 0;
              apply({ ...f, ack: held > 0 ? "held" : "acknowledged", heldPaise: held, atMs: at } as AckPayload);
            }
          }, at),
        );
      });
      fallbackTimers.push(
        setTimeout(() => completeFreeze(caseId), t + 700),
      );
    };

    try {
      es = new EventSource(url);
      es.addEventListener("ack", (e) => {
        apply(JSON.parse((e as MessageEvent).data) as AckPayload);
      });
      es.addEventListener("done", () => {
        completeFreeze(caseId);
        es?.close();
      });
      es.onerror = () => {
        es?.close();
        if (!gotAnything) runFallback();
      };
    } catch {
      runFallback();
    }

    return () => {
      es?.close();
      fallbackTimers.forEach(clearTimeout);
      fallbackTimers = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kase?.id, freezes.length]);

  if (!kase) {
    return (
      <>
        <TopBar />
        <Shell>
          <Card>
            <p className="text-[18px] font-semibold text-ink">
              We couldn&apos;t find that case on this device.
            </p>
            <p className="mt-2 text-ink-soft">
              Demo cases are stored in your browser. Start a new report to see
              the freeze flow.
            </p>
            <Button href="/freeze" className="mt-5">
              Start a report
            </Button>
          </Card>
        </Shell>
      </>
    );
  }

  const heldTotal = freezes.reduce((a, f) => a + f.heldPaise, 0);
  const settled = freezes.filter((f) => f.ack !== "pending").length;
  const cluster = kase.transaction?.counterparty
    ? lookupCluster(kase.transaction.counterparty)
    : null;

  return (
    <>
      <TopBar back={{ href: "/", label: "Home" }} />
      <Shell>
        <div className="flex flex-wrap items-center gap-3">
          <Chip tone="held">✅ Case open</Chip>
          <span className="data text-[16px] font-semibold text-ink-soft">
            {kase.id}
          </span>
        </div>

        <h1 className="font-display mt-4 text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          We&apos;re holding your money
        </h1>
        <p className="mt-3 text-ink-soft">
          You didn&apos;t have to register, pick a category, or choose a
          district. We started before asking you anything else.
        </p>

        {/* The headline pair: seconds elapsed, rupees secured */}
        <Card className="mt-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-[15px] font-medium text-ink-faint">
                Time since you tapped
              </p>
              <p className="data text-[34px] font-bold leading-none text-ink">
                {clock(elapsed)}
              </p>
              <p className="mt-1 text-[15px] text-ink-faint">
                {settled} of {freezes.length} institutions responded
              </p>
            </div>
            <div>
              <p className="text-[15px] font-medium text-ink-faint">
                Money held so far
              </p>
              <p
                className={clsx(
                  "data text-[34px] font-bold leading-none",
                  heldTotal > 0 ? "text-held" : "text-ink-faint",
                )}
              >
                {formatPaise(heldTotal)}
              </p>
              <p className="mt-1 text-[15px] text-ink-faint">
                of {formatPaise(amountPaise)} reported
              </p>
            </div>
          </div>
        </Card>

        {/* The stream */}
        <ul className="mt-5 space-y-3">
          {freezes.map((f) => (
            <AckRow key={f.institutionId} f={f} />
          ))}
        </ul>

        {kase.reportedWithinRbiWindow ? (
          <Card className="mt-5 border-held/30 bg-held-soft">
            <p className="text-[17px] font-semibold text-ink">
              ✅ You reported inside the RBI 3-day window
            </p>
            <p className="mt-1 text-[16px] text-ink-soft">
              We&apos;ve stamped and signed the exact moment you reported. Under
              RBI rules on unauthorised electronic transactions, that timestamp
              is your proof of zero liability — keep it.
            </p>
          </Card>
        ) : null}

        {cluster && cluster.reports > 0 ? (
          <Card className="mt-5 border-pending/30 bg-pending-soft">
            <p className="text-[17px] font-semibold text-ink">
              ⚠ {cluster.reports} other people reported {cluster.identifier}
            </p>
            <p className="mt-1 text-[16px] text-ink-soft">
              Your case has been linked to cluster {cluster.clusterId}. One
              investigation now covers all of you — instead of{" "}
              {cluster.reports} separate files that never get opened.
            </p>
          </Card>
        ) : null}

        <div className="mt-7 space-y-3">
          <Button
            href={`/case/${kase.id}`}
            className="w-full"
            variant={done ? "primary" : "secondary"}
          >
            {done ? "Continue — add details" : "Add details while we work"}
          </Button>
          <p className="text-center text-[15px] text-ink-faint">
            Your case is already open. Details make it stronger, but nothing is
            waiting on you.
          </p>
        </div>
      </Shell>
    </>
  );
}

function AckRow({ f }: { f: FreezeRequest }) {
  const roleLabel =
    f.role === "debit"
      ? "your bank"
      : f.role === "beneficiary"
        ? "received the money"
        : "next in the trail";

  const pending = f.ack === "pending";

  const tone =
    f.ack === "held"
      ? "held"
      : f.ack === "moved"
        ? "breach"
        : pending
          ? "pending"
          : "neutral";

  const statusText: Record<FreezeAck, string> = {
    pending: "Contacting…",
    acknowledged: "Acknowledged",
    held: `Held ${formatPaise(f.heldPaise)}`,
    partial: `Partially held ${formatPaise(f.heldPaise)}`,
    moved: "Money already moved on",
    failed: "No response",
  };

  return (
    <li
      className={clsx(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-card border bg-surface p-4",
        !pending && "ack-in",
        tone === "held" && "border-held/30 bg-held-soft",
        tone === "breach" && "border-breach/30 bg-breach-soft",
        tone === "pending" && "border-line",
        tone === "neutral" && "border-line",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-[18px] font-semibold text-ink">
          {f.institutionName}
        </p>
        <p className="text-[15px] text-ink-faint">{roleLabel}</p>
      </div>
      <div className="shrink-0 text-right">
        {pending ? (
          <span className="inline-flex items-center gap-2 text-[16px] font-semibold text-ink-faint">
            <span className="pulse-ring inline-block h-2.5 w-2.5 rounded-full bg-pending" />
            Contacting…
          </span>
        ) : (
          <span
            className={clsx(
              "data text-[17px] font-bold",
              tone === "held" && "text-held",
              tone === "breach" && "text-breach",
              tone === "neutral" && "text-ink-soft",
            )}
          >
            {statusText[f.ack]}
          </span>
        )}
        {f.exitTrail ? (
          <p className="mt-0.5 text-[14px] text-ink-faint">
            → traced to {f.exitTrail.to}
          </p>
        ) : null}
      </div>
    </li>
  );
}
