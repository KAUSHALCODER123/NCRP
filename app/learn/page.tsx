import Link from "next/link";
import type { Metadata } from "next";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { AUDIENCES, SCAMS } from "@/lib/learning";
import { CLUSTERS } from "@/lib/mock/clusters";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = {
  title: "Learning Corner — Sahaay",
  description:
    "How each scam actually works, the exact words they use, and the one tell that gives it away.",
};

/**
 * Learning Corner.
 *
 * The real NCRP version is a shelf of undated PDF posters. The advice is not
 * wrong — it is just disconnected from what is happening this week, even
 * though the same system holds the reports that would tell you.
 *
 * Here the top of the page is generated from live report counts, and each
 * scam is written as a recognisable script rather than a category name.
 */
export default function LearnPage() {
  const trending = [...CLUSTERS].sort((a, b) => b.reports - a.reports).slice(0, 3);

  return (
    <>
      <TopBar back={{ href: "/", label: "Home" }} />
      <Shell>
        <h1 className="font-display text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          Learning Corner
        </h1>
        <p className="mt-3 text-ink-soft">
          Not a list of rules. Each one below is the actual script — how the
          call opens, what they say, and the single thing that gives it away.
        </p>

        {/* Live, because the data exists. */}
        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-[22px] font-bold text-ink">
              Being reported right now
            </h2>
            <span className="text-[15px] text-ink-faint">
              from complaints filed this month
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {trending.map((c) => (
              <div
                key={c.clusterId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="data break-all text-[17px] font-semibold text-ink">
                    {c.identifier}
                  </p>
                  <p className="text-[15px] text-ink-soft">
                    {c.reports} reports · {formatPaise(c.totalReportedPaise)}{" "}
                    reported lost
                  </p>
                </div>
                <Chip tone={c.risk === "high" ? "breach" : "pending"}>
                  {c.risk === "high" ? "High risk" : "Reported"}
                </Chip>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[15px] text-ink-soft">
            The official Learning Corner cannot show you this, even though the
            same system holds the reports. Prevention scales further than
            investigation ever will.
          </p>
        </section>

        {/* Audience routing */}
        <section className="mt-10">
          <h2 className="font-display text-[22px] font-bold text-ink">Who is this for?</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {AUDIENCES.filter((a) => a.id !== "everyone").map((a) => (
              <Link
                key={a.id}
                href={`/learn/for/${a.id}`}
                className="rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-sunken"
              >
                <p className="text-[18px] font-semibold text-ink">{a.label}</p>
                <p className="mt-0.5 text-[16px] text-ink-soft">{a.note}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* The library */}
        <section className="mt-10">
          <h2 className="font-display text-[22px] font-bold text-ink">
            Every scam, as it actually sounds
          </h2>
          <div className="mt-3 space-y-3">
            {SCAMS.map((s) => (
              <Link
                key={s.slug}
                href={`/learn/${s.slug}`}
                className="block rounded-card border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-sunken"
              >
                <p className="text-[20px] font-semibold text-ink">{s.name}</p>
                <p className="mt-1 text-[16px] text-ink-soft">{s.oneLine}</p>
                <p className="mt-2 text-[15px] text-ink-faint">
                  Also called: {s.alsoCalled.join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <Card className="mt-10 border-primary/25 bg-primary-soft">
          <p className="text-[18px] font-semibold text-ink">
            Someone is asking you for money right now?
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            Check the UPI ID or number before you pay. It takes five seconds.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/scam-check">Check it first</Button>
            <Button href="/verify-officer" variant="secondary">
              Verify an officer
            </Button>
          </div>
        </Card>
      </Shell>
    </>
  );
}
