"use client";

import Link from "next/link";
import { Shell, TopBar } from "@/components/ui";
import {
  IconArrow,
  IconLock,
  IconMask,
  IconRupee,
  IconUser,
} from "@/components/icons";
import { useT, type Key } from "@/lib/i18n";

/**
 * The crime-type chooser.
 *
 * "Report a crime" in the navigation used to go straight to the financial
 * freeze flow, which meant anyone arriving to report blackmail or a hacked
 * account was immediately asked for a transaction reference. The nav promised
 * a general entry point and delivered one specific form.
 *
 * The wording follows the same rule as the home tiles: describe what happened
 * to the person, not what the offence is called. Nobody arrives knowing they
 * are about to file under "impersonation".
 */

interface Option {
  href: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  title: Key;
  body: Key;
  meta: Key;
  primary?: boolean;
}

const OPTIONS: Option[] = [
  {
    href: "/freeze",
    Icon: IconRupee,
    title: "tiles.t1",
    body: "tiles.t1body",
    meta: "tiles.t1meta",
    primary: true,
  },
  {
    href: "/report/harassment",
    Icon: IconMask,
    title: "tiles.t2",
    body: "tiles.t2body",
    meta: "tiles.t2meta",
  },
  {
    href: "/report/impersonation",
    Icon: IconUser,
    title: "rk.impersonation.title",
    body: "rk.impersonation.lede",
    meta: "tiles.t3meta",
  },
  {
    href: "/report/account",
    Icon: IconLock,
    title: "rk.account.title",
    body: "rk.account.lede",
    meta: "tiles.t3meta",
  },
];

export default function ReportChooser() {
  const t = useT();

  return (
    <>
      <TopBar back={{ href: "/", label: t("ui.home") }} />
      <Shell width="lg">
        <p className="eyebrow">{t("tiles.eyebrow")}</p>
        <h1 className="mt-3 font-display text-[32px] font-bold leading-tight text-ink sm:text-[38px]">
          {t("tiles.h2")}
        </h1>
        <p className="mt-3 max-w-2xl text-[18px] leading-relaxed text-ink-soft">
          {t("tiles.sub")}
        </p>

        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          {OPTIONS.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              className={
                o.primary
                  ? "lift group flex flex-col rounded-card border-2 border-primary bg-surface p-7"
                  : "lift group flex flex-col rounded-card border border-line bg-surface p-7 hover:border-line-strong"
              }
            >
              <span
                className={
                  o.primary
                    ? "inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary text-primary-on"
                    : "inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary-soft text-primary-text"
                }
              >
                <o.Icon className="h-6 w-6" />
              </span>
              <p className="mt-5 font-display text-[22px] font-bold leading-tight text-ink">
                {t(o.title)}
              </p>
              <p className="mt-2.5 flex-1 text-[16px] leading-relaxed text-ink-soft">
                {t(o.body)}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-primary-text">
                {t(o.meta)}
                <IconArrow className="row-arrow h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
          {t("rp.notSureNote")}
        </p>
      </Shell>
    </>
  );
}
