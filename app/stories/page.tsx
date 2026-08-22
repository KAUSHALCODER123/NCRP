import Link from "next/link";
import type { Metadata } from "next";
import { Chip, Shell, TopBar } from "@/components/ui";
import { IconArrow, IconShield } from "@/components/icons";
import { STORIES, OUTCOME_LABEL, OUTCOME_TONE } from "@/lib/stories";
import { SCAMS } from "@/lib/learning";

export const metadata: Metadata = {
  title: "Survivor stories — Sahaay",
  description:
    "Written by people who reported, and verified against their own case number.",
};

/**
 * Survivor stories.
 *
 * Outcomes are shown plainly on every card, including the ones that recovered
 * nothing. Showing only successes would make the system look better than the
 * numbers say it is, and this project's whole argument rests on those numbers
 * being honest.
 */
export default function StoriesPage() {
  return (
    <>
      <TopBar back={{ href: "/learn", label: "Learning Corner" }} />
      <Shell width="lg">
        <h1 className="font-display text-[32px] font-bold leading-tight text-ink sm:text-[38px]">
          Survivor stories
        </h1>
        <p className="mt-3 max-w-2xl text-[18px] leading-relaxed text-ink-soft">
          Written by people who reported, and verified against their own case
          number. Nobody here is a made-up example.
        </p>

        <p className="mt-5 max-w-2xl rounded-card border border-line bg-sunken p-5 text-[16px] leading-relaxed text-ink-soft">
          <strong className="text-ink">These are not all success stories.</strong>{" "}
          Most reported money is never recovered, and pretending otherwise would
          be its own kind of dishonesty. The accounts that end badly are often
          the most useful ones to read.
        </p>

        <div className="mt-10 space-y-5">
          {STORIES.map((s) => {
            const scam = SCAMS.find((x) => x.slug === s.scamSlug);
            return (
              <Link
                key={s.id}
                href={`/stories/${s.id}`}
                className="lift group block rounded-card border border-line bg-surface p-6 hover:border-line-strong sm:p-7"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Chip tone={OUTCOME_TONE[s.outcome]}>
                    {OUTCOME_LABEL[s.outcome]}
                  </Chip>
                  {scam ? (
                    <span className="text-[15px] text-ink-faint">
                      {scam.name}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 font-display text-[23px] font-bold leading-tight text-ink">
                  {s.title}
                </p>
                <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
                  {s.body[0].slice(0, 165)}…
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <span className="text-[15px] text-ink-faint">
                    {s.author} · {s.city} ·{" "}
                    <span className="data">
                      ₹{s.amountLostRupees.toLocaleString("en-IN")} lost
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary-text">
                    Read
                    <IconArrow className="row-arrow h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-card border border-primary-border bg-primary-soft p-6 sm:p-7">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary text-primary-on">
            <IconShield className="h-6 w-6" />
          </span>
          <p className="mt-4 font-display text-[22px] font-bold text-ink">
            Been through this? Write yours.
          </p>
          <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
            You can write once your case reaches an outcome. We check it against
            your case number, so every story here comes from someone who
            actually went through the process — and you never have to use your
            real name.
          </p>
          <Link
            href="/stories/write"
            className="press mt-5 inline-flex min-h-[52px] items-center gap-2 rounded-[10px] bg-primary px-6 text-[17px] font-semibold text-primary-on shadow-sm hover:bg-primary-hover"
          >
            Write your story
            <IconArrow className="h-5 w-5" />
          </Link>
        </div>
      </Shell>
    </>
  );
}
