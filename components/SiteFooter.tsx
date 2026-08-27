"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

/**
 * Footer, following the official portal's multi-column structure —
 * with the disclaimer given the weight it deserves rather than being
 * buried under policy links.
 *
 * That prominence is not decoration: a realistic clone of a government
 * crime-reporting portal is structurally identical to a phishing site, and
 * this project's own research documents lookalike-domain fraud as an active
 * attack pattern in India.
 */

const GROUPS: { title: string; links: { href: string; key: string }[] }[] = [
  {
    title: "foot.gReport",
    links: [
      { href: "/report", key: "foot.reportCrime" },
      { href: "/freeze", key: "foot.financial" },
      { href: "/report/harassment", key: "foot.blackmail" },
      { href: "/report/impersonation", key: "foot.impersonation" },
      { href: "/report/account", key: "foot.hacked" },
      { href: "/blocked", key: "foot.blocked" },
    ],
  },
  {
    title: "foot.gCheck",
    links: [
      { href: "/scam-check", key: "foot.checkId" },
      { href: "/verify-officer", key: "foot.verify" },
      { href: "/scam-check/appeal", key: "foot.appeal" },
      { href: "/dashboard", key: "foot.track" },
    ],
  },
  {
    title: "foot.gLearn",
    links: [
      { href: "/learn", key: "foot.learning" },
      { href: "/stories", key: "foot.stories" },
      { href: "/learn/for/senior", key: "foot.seniors" },
      { href: "/learn/for/women", key: "foot.women" },
      { href: "/learn/for/business", key: "foot.business" },
    ],
  },
  {
    title: "foot.gAbout",
    links: [
      { href: "/help", key: "foot.help" },
      { href: "/help#about", key: "foot.about" },
      { href: "/how-built", key: "foot.built" },
      { href: "/login", key: "foot.logins" },
    ],
  },
];

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 className="eyebrow">{t(g.title as Parameters<typeof t>[0])}</h2>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.href + l.key}>
                    <Link
                      href={l.href}
                      className="link-draw text-[15px] text-ink-soft hover:text-ink"
                    >
                      {t(l.key as Parameters<typeof t>[0])}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-7 text-[14px] leading-relaxed text-ink-faint">
          <p>
            <strong className="text-ink">
              {t("foot.discStrong")}
            </strong>{" "}
            {t("foot.discBody")}{" "}
            {t("foot.realRouteBefore")} {" "}
            <a href="tel:1930" className="font-semibold text-primary-text">
              1930
            </a>{" "}
            {t("foot.orUse")} {" "}
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-primary-text"
            >
              cybercrime.gov.in
            </a>
            .
          </p>
          <p className="mt-3">
            {t("foot.hackathon")}
          </p>
          <p className="mt-3 text-ink-faint">
            <span className="data">{t("foot.updated")}</span> · {t("foot.browser")}
          </p>
        </div>
      </div>
    </footer>
  );
}
