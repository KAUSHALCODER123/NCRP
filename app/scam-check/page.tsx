"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { IconAlert, IconArrow, IconCheck, IconSearch } from "@/components/icons";
import { formatPaise } from "@/lib/money";
import { lookupCluster, CLUSTERS } from "@/lib/mock/clusters";
import {
  MIX_2025,
  NATIONAL_2025,
  RED_FLAGS,
  REAL_SERVICES,
  SOURCES,
} from "@/lib/scam-data";
import type { ClusterHit } from "@/lib/types";
import { signalCount } from "@/lib/signal";

/**
 * Scam Check.
 *
 * The identifier lookup is seeded demo data and is labelled as such. Inventing
 * a database of "reported fraudsters" would be defamatory if wrong, and it is
 * precisely the unverified-crowdsourcing defect this project criticises in the
 * real Suspect Registry.
 *
 * What is real on this page: the national figures, with sources and dates; the
 * government services that genuinely perform a lookup today, which most people
 * have never heard of; and the red flags, which need no database at all — a
 * fraudster can always move to a new UPI ID, but cannot stop needing you to
 * enter a PIN to "receive" money.
 */
export default function ScamCheckPage() {
  const [q, setQ] = useState("");
  const [hit, setHit] = useState<ClusterHit | null>(null);
  const [live, setLive] = useState(0);
  const [checked, setChecked] = useState("");

  function check(value: string) {
    setQ(value);
    setHit(lookupCluster(value));
    setChecked(value.trim());
  }

  /*
   * Answers from what this deployment has actually recorded, on top of the
   * seeded set. It is the project's own argument made literal: reports made
   * here become the warning the next person sees.
   */
  useEffect(() => {
    let cancelled = false;
    // Every write happens in a callback: clearing the count synchronously in
    // the effect body cascades a render on each change.
    void (checked ? signalCount(checked) : Promise.resolve(0)).then((n) => {
      if (!cancelled) setLive(n);
    });
    return () => {
      cancelled = true;
    };
  }, [checked]);

  return (
    <>
      <TopBar back={{ href: "/", label: "Home" }} />
      <Shell width="lg">
        <h1 className="font-display text-[32px] font-bold leading-tight text-ink sm:text-[38px]">
          Is this a scam?
        </h1>
        <p className="mt-3 max-w-2xl text-[18px] leading-relaxed text-ink-soft">
          Check an identifier below, or skip straight to the six signs that need
          no database at all.
        </p>

        {/* ---------------- Lookup ---------------- */}
        <Card className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[18px] font-semibold text-ink">
              Check a UPI ID, number or link
            </p>
            <Chip>{live > 0 ? "Seeded + live" : "Demo data"}</Chip>
          </div>
          <p className="mt-1.5 text-[16px] text-ink-soft">
            This searches a small seeded set, plus anything reported through
            this site. Reports here are stored without any personal detail —
            only the identifier, so it becomes the warning the next person
            sees. On the live system it would query the reports already held
            by I4C.
          </p>

          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              check(q);
            }}
          >
            <label htmlFor="identifier" className="sr-only">
              UPI ID, phone number or link
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id="identifier"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="rahul.verma@ybl"
                className="min-w-0 flex-1 rounded-[10px] border border-line-strong bg-surface p-4 text-[18px] focus:border-primary focus:outline-none"
              />
              <Button type="submit" disabled={!q.trim()}>
                <IconSearch className="h-5 w-5" />
                Check it
              </Button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="py-1 text-[15px] text-ink-faint">Try:</span>
            {CLUSTERS.slice(0, 3).map((c) => (
              <button
                key={c.identifier}
                type="button"
                onClick={() => check(c.identifier)}
                className="press data rounded-full border border-line-strong bg-surface px-3 py-1.5 text-[15px] font-medium text-primary-text hover:bg-primary-soft"
              >
                {c.identifier}
              </button>
            ))}
          </div>

          {hit ? <Result hit={hit} live={live} /> : null}
        </Card>

        {/* ---------------- Real services ---------------- */}
        <section className="mt-14">
          <p className="eyebrow">Real services, working today</p>
          <h2 className="mt-3 font-display text-[27px] font-bold text-ink sm:text-[31px]">
            India already runs these checks
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            Most people have never heard of them, which is the actual problem.
            These are live government services and they work right now — this
            prototype is not a substitute for any of them.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {REAL_SERVICES.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="lift flex flex-col rounded-card border border-line bg-surface p-6 hover:border-line-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-[21px] font-bold text-ink">
                    {s.name}
                  </p>
                  <IconArrow className="mt-1 h-5 w-5 shrink-0 text-primary-text" />
                </div>
                <p className="mt-0.5 text-[14px] text-ink-faint">{s.run_by}</p>
                <p className="mt-3 text-[16px] leading-relaxed text-ink">
                  {s.what}
                </p>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-soft">
                  {s.when}
                </p>
                {s.impact ? (
                  <p className="mt-4 border-t border-line pt-3 text-[14px] leading-relaxed text-ink-faint">
                    {s.impact}
                  </p>
                ) : null}
              </a>
            ))}
          </div>
        </section>

        {/* ---------------- Red flags ---------------- */}
        <section className="mt-14">
          <p className="eyebrow">No lookup needed</p>
          <h2 className="mt-3 font-display text-[27px] font-bold text-ink sm:text-[31px]">
            Six signs that settle it
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            A fraudster can always move to a new UPI ID. They cannot stop
            needing you to do these things — which makes these more reliable
            than any database.
          </p>

          <ul className="mt-7 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
            {RED_FLAGS.map((f) => (
              <li key={f.flag} className="flex gap-4 p-5 sm:p-6">
                <IconAlert className="mt-0.5 h-6 w-6 shrink-0 text-critical-text" />
                <div>
                  <p className="text-[18px] font-semibold leading-snug text-ink">
                    {f.flag}
                  </p>
                  <p className="mt-1.5 text-[16px] leading-relaxed text-ink-soft">
                    {f.why}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- National picture ---------------- */}
        <section className="mt-14">
          <p className="eyebrow">What actually happens in India</p>
          <h2 className="mt-3 font-display text-[27px] font-bold text-ink sm:text-[31px]">
            You are not the only one this happened to
          </h2>

          <dl className="mt-7 grid gap-6 sm:grid-cols-3">
            {NATIONAL_2025.map((f) => (
              <div key={f.label} className="border-t-2 border-line-strong pt-4">
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <p className="data text-[32px] font-semibold leading-none text-ink">
                    {f.value}
                  </p>
                  <p className="mt-2.5 text-[16px] font-semibold text-ink">
                    {f.label}
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-faint">
                    {f.detail}
                  </p>
                  <p className="mt-2 text-[13px] text-ink-faint">{f.source}</p>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-9 rounded-card border border-line bg-surface p-6 sm:p-7">
            <p className="text-[18px] font-semibold text-ink">
              Where the cases are, and where the money is
            </p>
            <p className="mt-1.5 text-[16px] text-ink-soft">
              These two things are not the same, which is why the scam that
              takes the most money is not the one you hear about most.
            </p>

            <div className="mt-6 space-y-5">
              {MIX_2025.map((m) => (
                <div key={m.slug}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={`/learn/${m.slug}`}
                      className="link-draw text-[17px] font-semibold text-ink"
                    >
                      {m.name}
                    </Link>
                    <span className="data text-[15px] text-ink-faint">
                      {m.cases}% of cases · {m.losses}% of money
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <Bar value={m.cases} tone="primary" label="Share of cases" />
                    <Bar value={m.losses} tone="critical" label="Share of money lost" />
                  </div>
                  <p className="mt-2 text-[15px] text-ink-soft">{m.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Sources ---------------- */}
        <section className="mt-12 border-t border-line pt-6">
          <p className="eyebrow">Sources</p>
          <ul className="mt-3 space-y-1.5">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-draw text-[15px] text-ink-soft"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-faint">
            Loss totals differ between reports depending on whether the basis is
            NCRP or CFCFRMS, calendar year or financial year, and reported
            versus confirmed. Figures above are cited with their source rather
            than merged into a single number.
          </p>
        </section>
      </Shell>
    </>
  );
}

function Bar({
  value,
  tone,
  label,
}: {
  value: number;
  tone: "primary" | "critical";
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[132px] shrink-0 text-[13px] text-ink-faint">
        {label}
      </span>
      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-sunken">
        <span
          className={clsx(
            "block h-full rounded-full",
            tone === "critical" ? "bg-critical" : "bg-primary",
          )}
          style={{ width: `${value}%` }}
        />
      </span>
    </div>
  );
}

function Result({ hit, live }: { hit: ClusterHit; live: number }) {
  const reports = hit.reports + live;
  const risky = reports > 0;
  // Seeded high-risk, or enough real reports here to be worth warning about.
  const high = hit.risk === "high" || live >= 3;

  return (
    <div
      className={clsx(
        "mt-5 rounded-card border p-5",
        high && "border-critical-border bg-critical-soft",
        !high && risky && "border-tertiary-border bg-tertiary-soft",
        !risky && "border-line bg-sunken",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="data break-all text-[19px] font-bold text-ink">
          {hit.identifier}
        </p>
        <Chip tone={high ? "breach" : risky ? "pending" : "neutral"}>
          {high ? "High risk" : risky ? "Reported" : "No reports"}
        </Chip>
      </div>

      {risky ? (
        <>
          <p className="mt-3 text-[17px] text-ink">
            <strong className="data">{reports}</strong> reports ·{" "}
            <strong className="data">
              {formatPaise(hit.totalReportedPaise)}
            </strong>{" "}
            reported lost
          </p>
          <p className="mt-4 text-[19px] font-bold text-critical-text">
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
          <p className="mt-3 flex gap-2.5 text-[17px] text-ink-soft">
            <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-ink-faint" />
            <span>
              Nobody in this demo set has reported it. That is{" "}
              <strong className="text-ink">not</strong> the same as safe — most
              frauds are only reported after the money is gone.
            </span>
          </p>
          <p className="mt-3 text-[16px] text-ink-soft">
            Check it against the six signs below instead. They are more reliable
            than any list.
          </p>
        </>
      )}
    </div>
  );
}
