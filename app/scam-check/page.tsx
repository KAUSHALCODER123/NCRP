"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { formatPaise } from "@/lib/money";
import { lookupCluster, CLUSTERS } from "@/lib/mock/clusters";
import type { ClusterHit } from "@/lib/types";

/**
 * Scam Check — prevention, and the reason to visit before being defrauded.
 *
 * NCRP already holds the largest fraud-signal corpus in India: millions of
 * reported UPI IDs, phone numbers and URLs. None of it is returned to citizens
 * as a check-before-you-pay service. This is the single most wasted asset in
 * the system.
 *
 * Note: shipping a lookup without an appeal path would inherit the real
 * Suspect Registry's defect — unverified crowdsourcing that can wrongly flag a
 * legitimate business. The appeal route is surfaced on every high-risk result.
 */
export default function ScamCheckPage() {
  const [q, setQ] = useState("");
  const [hit, setHit] = useState<ClusterHit | null>(null);

  function check(value: string) {
    setQ(value);
    setHit(lookupCluster(value));
  }

  return (
    <>
      <TopBar back={{ href: "/", label: "Home" }} />
      <Shell>
        <h1 className="font-display text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          Is this a scam?
        </h1>
        <p className="mt-3 text-ink-soft">
          Paste a UPI ID, phone number, link or account number. We check it
          against every complaint reported by other citizens — before you pay.
        </p>

        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            check(q);
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="rahul.verma@ybl"
            aria-label="UPI ID, phone number or link"
            className="w-full rounded-xl border border-line-strong bg-surface p-4 text-[19px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
          />
          <Button type="submit" className="mt-3 w-full" disabled={!q.trim()}>
            Check it
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="py-1 text-[15px] text-ink-faint">Try:</span>
          {CLUSTERS.slice(0, 3).map((c) => (
            <button
              key={c.identifier}
              type="button"
              onClick={() => check(c.identifier)}
              className="data rounded-full border border-line-strong bg-surface px-3 py-1 text-[15px] font-medium text-primary hover:bg-primary-soft"
            >
              {c.identifier}
            </button>
          ))}
        </div>

        {hit ? <Result hit={hit} /> : null}
      </Shell>
    </>
  );
}

function Result({ hit }: { hit: ClusterHit }) {
  const risky = hit.reports > 0;
  const high = hit.risk === "high";

  return (
    <Card
      className={clsx(
        "mt-6",
        high && "border-breach/30 bg-breach-soft",
        !high && risky && "border-pending/30 bg-pending-soft",
        !risky && "border-line",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="data break-all text-[19px] font-bold text-ink">
          {hit.identifier}
        </p>
        <Chip tone={high ? "breach" : risky ? "pending" : "neutral"}>
          {high ? "🔴 High risk" : risky ? "🟠 Reported" : "⚪ No reports"}
        </Chip>
      </div>

      {risky ? (
        <>
          <p className="mt-3 text-[17px] text-ink">
            <strong className="data">{hit.reports}</strong> fraud reports ·{" "}
            <strong className="data">
              {formatPaise(hit.totalReportedPaise)}
            </strong>{" "}
            reported lost
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            First reported{" "}
            {new Date(hit.firstReportedAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}{" "}
            · active cluster {hit.clusterId}
          </p>
          <p className="mt-4 text-[19px] font-bold text-breach">
            Do not pay. Do not share an OTP.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/freeze" variant="secondary">
              I already paid
            </Button>
            <Button href="/scam-check/appeal" variant="ghost">
              This is my account — appeal
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-[17px] text-ink-soft">
            Nobody has reported this yet. That is <strong>not</strong> the same
            as safe — most frauds are reported only after the money is gone.
          </p>
          <p className="mt-3 text-[16px] text-ink-soft">
            Still unsure? Never pay to &ldquo;verify&rdquo; your own money, and
            no real officer will ever ask you to.
          </p>
        </>
      )}
    </Card>
  );
}
