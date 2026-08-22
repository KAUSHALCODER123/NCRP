"use client";

import Link from "next/link";
import { Card, Shell, TopBar } from "@/components/ui";
import { IconArrow, IconCheck, IconClock, IconLock } from "@/components/icons";
import { useT } from "@/lib/i18n";

/**
 * For the person whose account has a hold on it.
 *
 * This used to be an essay on the home page — a shopkeeper in Kollam, hop
 * numbers, four amounts and a policy statistic. It argued a point at readers
 * who had come to do something, and the one person it was actually about
 * would never have found it by scrolling.
 *
 * So it is a door instead. Short, no jargon, and every line answers a
 * question this person is actually asking: am I in trouble, how much is
 * blocked, how do I get it back, and how long will it take.
 */

const STEPS = [
  { icon: IconCheck, key: "blocked.s1" },
  { icon: IconClock, key: "blocked.s2" },
  { icon: IconArrow, key: "blocked.s3" },
] as const;

export default function BlockedPage() {
  const t = useT();

  return (
    <>
      <TopBar back={{ href: "/", label: t("ui.home") }} />
      <Shell>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-[10px] bg-primary-soft text-primary-text">
          <IconLock className="h-6 w-6" />
        </span>

        <h1 className="mt-5 font-display text-[30px] font-bold leading-tight text-ink sm:text-[36px]">
          {t("frozen.h1")}
        </h1>
        <p className="mt-4 text-[18px] leading-relaxed text-ink-soft">
          {t("frozen.lede")}
        </p>

        <Card className="mt-7 border-secondary-border bg-secondary-soft">
          <p className="text-[17px] leading-relaxed text-ink">
            {t("frozen.gotSms")}
          </p>
        </Card>

        <h2 className="mt-10 font-display text-[22px] font-bold text-ink">
          {t("frozen.whatNext")}
        </h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map((s, i) => (
            <li
              key={s.key}
              className="flex gap-4 rounded-card border border-line bg-surface p-5"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-on">
                {i + 1}
              </span>
              <p className="text-[17px] leading-relaxed text-ink-soft">
                {t(s.key)}
              </p>
            </li>
          ))}
        </ol>

        <Card className="mt-8">
          <p className="text-[18px] font-semibold text-ink">
            {t("frozen.lostSms")}
          </p>
          <p className="mt-1.5 text-[16px] leading-relaxed text-ink-soft">
            {t("frozen.lostSmsSub")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="press inline-flex min-h-[52px] items-center gap-2 rounded-[10px] bg-primary px-6 text-[17px] font-semibold text-primary-on shadow-sm hover:bg-primary-hover"
            >
              {t("frozen.checkHolds")}
              <IconArrow className="h-5 w-5" />
            </Link>
            <Link
              href="/help#frozen"
              className="press inline-flex min-h-[52px] items-center rounded-[10px] border border-line-strong bg-surface px-6 text-[16px] font-semibold text-ink shadow-sm hover:bg-sunken"
            >
              {t("frozen.readMore")}
            </Link>
          </div>
        </Card>
      </Shell>
    </>
  );
}
