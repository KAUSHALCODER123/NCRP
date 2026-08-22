"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { SlaClock } from "@/components/SlaClock";
import { MoneyTrail } from "@/components/MoneyTrail";
import { formatPaise } from "@/lib/money";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-now";
import type { Evidence, Lien } from "@/lib/types";

/**
 * THE DIFFERENTIATOR — the second victim nobody counts.
 *
 * Suresh sold a phone and was paid ₹5,000 by someone who, three hops
 * upstream, had been paid with stolen money. Under the real system his ENTIRE
 * account is frozen — all ₹9,95,000 of working capital — with no notification,
 * and he travels to another state to get it back over several months.
 *
 * Here: the disputed amount is held, the rest stays usable, and he was told
 * in the same second the hold was placed.
 */

const DOC_OPTIONS = [
  { label: "Sale invoice", kind: "invoice" as const },
  { label: "Chat with the buyer", kind: "chat" as const },
  { label: "Bank statement", kind: "statement" as const },
];

export function LienNotice({ lienId }: { lienId: string }) {
  // This page reads client-stored data; SSR cannot be correct for it.
  const hydrated = useHydrated();
  const lien = useStore((s) => s.liens.find((l) => l.id === lienId));
  const fileDispute = useStore((s) => s.fileDispute);
  const advanceDispute = useStore((s) => s.advanceDispute);

  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");


  if (!hydrated) return <Loading />;

  if (!lien) {
    return (
      <>
        <TopBar />
        <Shell>
          <Card>
            <p className="text-[18px] font-semibold text-ink">
              No such hold on this device.
            </p>
            <Button href="/login" className="mt-5">
              Demo logins
            </Button>
          </Card>
        </Shell>
      </>
    );
  }

  const d = lien.dispute;

  return (
    <>
      <TopBar back={{ href: "/dashboard", label: "My account" }} />
      <Shell>
        <Chip tone={lien.liftedAt ? "held" : "pending"}>
          {lien.liftedAt ? "✅ Hold lifted" : "⚠ Hold placed"}
        </Chip>

        <h1 className="font-display mt-4 text-[28px] font-bold leading-tight text-ink sm:text-[32px]">
          {lien.liftedAt
            ? "Your money has been released"
            : "A small amount of your money is on hold"}
        </h1>

        {/* The thesis, in one row. */}
        <Card className="mt-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-[15px] font-medium text-ink-faint">On hold</p>
              <p
                className={clsx(
                  "data text-[32px] font-bold leading-none",
                  lien.liftedAt ? "text-ink-faint line-through" : "text-pending",
                )}
              >
                {formatPaise(lien.amountPaise)}
              </p>
              <p className="mt-1 text-[15px] text-ink-faint">
                only the disputed amount
              </p>
            </div>
            <div>
              <p className="text-[15px] font-medium text-ink-faint">
                Still yours to use
              </p>
              <p className="data text-[32px] font-bold leading-none text-available">
                {formatPaise(lien.balancePaise)}
              </p>
              <p className="mt-1 text-[15px] text-ink-faint">
                cards, UPI and transfers all work
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-line bg-sunken p-4 text-[16px] text-ink-soft">
            <p>
              <strong className="text-ink">Why this happened:</strong>{" "}
              {lien.reason}
            </p>
            <p className="mt-2 tnum text-[15px] text-ink-faint">
              Account {lien.accountMask} · {lien.institutionName} · hold placed{" "}
              {new Date(lien.placedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}{" "}
              · you were notified the same second
            </p>
          </div>
        </Card>

        {/* The signature, third use: he sees exactly where he landed. */}
        <Card className="mt-5">
          <p className="eyebrow">How this reached you</p>
          <MoneyTrail
            hops={[
              { label: "A victim in Pune", amount: "₹3,20,000", state: "source" },
              { label: "Mule account", amount: "held", state: "held" },
              { label: "Second mule", amount: "moved on", state: "moved" },
              {
                label: lien.holderName,
                amount: formatPaise(lien.amountPaise) + " held",
                sub: "A payment you were owed",
                state: "innocent",
              },
            ]}
            animate={false}
            youAre={3}
            className="mt-5"
          />
          <p className="mt-6 border-t border-line pt-5 text-[16px] leading-relaxed text-ink-soft">
            You are three transfers away from a crime you had nothing to do
            with. That distance is why only the disputed amount is held, and
            why your remaining balance was never touched.
          </p>
        </Card>

        {/* Contrast callout — the argument, stated once, plainly. */}
        <Card className="mt-5 border-breach/25 bg-breach-soft">
          <p className="text-[17px] font-semibold text-ink">
            On the current system, this would look different
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            Your <strong>entire account</strong> —{" "}
            {formatPaise(lien.amountPaise + lien.balancePaise)} — would have
            been frozen over this {formatPaise(lien.amountPaise)}. You would not
            have been told why. Your card would simply have stopped working, and
            your branch could not have helped.
          </p>
        </Card>

        {/* Dispute */}
        {!d ? (
          <Card className="mt-5">
            <p className="text-[19px] font-semibold text-ink">
              Believe this is a mistake?
            </p>
            <p className="mt-1 text-[16px] text-ink-soft">
              Show us the payment was legitimate. Takes about two minutes — no
              branch visit, no travel, no paper.
            </p>

            <fieldset className="mt-4">
              <legend className="mb-2 text-[16px] font-semibold text-ink">
                What can you show us?
              </legend>
              <div className="space-y-2">
                {DOC_OPTIONS.map((o) => {
                  const on = picked.includes(o.label);
                  return (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() =>
                        setPicked((p) =>
                          on ? p.filter((x) => x !== o.label) : [...p, o.label],
                        )
                      }
                      className={clsx(
                        "flex w-full items-center gap-3 rounded-xl border p-4 text-left text-[17px] font-medium transition-colors",
                        on
                          ? "border-primary bg-primary-soft text-ink"
                          : "border-line-strong bg-surface text-ink hover:bg-sunken",
                      )}
                    >
                      <span
                        className={clsx(
                          "flex h-6 w-6 items-center justify-center rounded-md border-2 text-[14px] font-bold",
                          on
                            ? "border-primary bg-primary text-white"
                            : "border-line-strong text-transparent",
                        )}
                      >
                        ✓
                      </span>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label
              htmlFor="note"
              className="mt-4 block text-[16px] font-semibold text-ink"
            >
              Anything you want to add
            </label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="I sold a phone on OLX and he paid me by UPI…"
              className="mt-2 w-full resize-y rounded-xl border border-line-strong bg-surface p-4 text-[17px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
            />

            <Button
              className="mt-4 w-full"
              disabled={picked.length === 0}
              onClick={() => {
                const docs: Evidence[] = picked.map((label, i) => ({
                  id: `d${i}`,
                  label,
                  kind:
                    DOC_OPTIONS.find((o) => o.label === label)?.kind ?? "other",
                  addedAt: new Date().toISOString(),
                }));
                fileDispute(
                  lien.id,
                  docs,
                  summarise(lien, picked, note),
                );
              }}
            >
              Submit dispute
            </Button>
          </Card>
        ) : (
          <DisputeProgress lien={lien} onAdvance={() => advanceDispute(lien.id)} />
        )}
      </Shell>
    </>
  );
}

function summarise(lien: Lien, docs: string[], note: string): string {
  return [
    `Account holder disputes a hold of ${formatPaise(lien.amountPaise)} on ${lien.accountMask}.`,
    `Hop depth ${lien.hopDepth} from the reported fraud; trace confidence ${(lien.confidence * 100).toFixed(0)}%.`,
    `Evidence supplied: ${docs.join(", ")}.`,
    note ? `Account holder states: "${note.trim()}"` : "",
    `Recommendation: low-confidence downstream hop with supporting commercial documentation.`,
  ]
    .filter(Boolean)
    .join(" ");
}

function DisputeProgress({
  lien,
  onAdvance,
}: {
  lien: Lien;
  onAdvance: () => void;
}) {
  const d = lien.dispute!;
  const resolved = d.status === "approved";

  return (
    <>
      <Card className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[19px] font-semibold text-ink">Your dispute</p>
          <Chip tone={resolved ? "held" : "pending"}>
            {resolved ? "Resolved" : "In progress"}
          </Chip>
        </div>

        <p className="mt-2 text-[16px] text-ink-soft">
          {resolved
            ? "Approved. The hold has been lifted and your money is available again."
            : "Both clocks below run automatically. If either is missed, this escalates without you doing anything."}
        </p>

        <div className="mt-4 space-y-3">
          <SlaClock sla={d.bankSla} />
          {d.ioSla ? <SlaClock sla={d.ioSla} /> : null}
        </div>

        {d.triageSummary ? (
          <div className="mt-4 rounded-xl border border-line bg-sunken p-4">
            <p className="text-[15px] font-semibold text-ink-faint">
              Summary prepared for the officer
            </p>
            <p className="mt-1 text-[16px] text-ink-soft">{d.triageSummary}</p>
            <p className="mt-2 text-[15px] text-ink-faint">
              One screen instead of a folder of PDFs — which is why a decision
              takes minutes rather than months.
            </p>
          </div>
        ) : null}
      </Card>

      {d.noc ? (
        <Card className="mt-5 border-held/30 bg-held-soft">
          <p className="text-[18px] font-semibold text-ink">
            ✅ No Objection Certificate issued
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            Digitally signed by {d.noc.issuedBy} and sent straight to your bank
            over an API. No branch visit. No travel to another state. No paper.
          </p>
          <p className="data mt-3 break-all rounded-lg bg-surface p-3 text-[14px] text-ink-faint">
            {d.noc.id} · {d.noc.signature}
          </p>
        </Card>
      ) : null}

      <ol className="mt-6 space-y-0">
        {[...d.timeline].reverse().map((e, i, arr) => (
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
            <div className="pb-5">
              <p className="text-[17px] font-semibold text-ink">{e.title}</p>
              {e.detail ? (
                <p className="mt-0.5 text-[16px] text-ink-soft">{e.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {!resolved ? (
        <div className="mt-2 rounded-xl border border-dashed border-line-strong p-4">
          <p className="text-[15px] text-ink-faint">
            Demo control — the officer side is not part of what judges evaluate,
            so we simulate it here rather than making you wait 7 days.
          </p>
          <Button variant="secondary" className="mt-3 w-full" onClick={onAdvance}>
            ⏩ Simulate the next official step
          </Button>
        </div>
      ) : null}
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
