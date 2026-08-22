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

const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Report",
    links: [
      { href: "/freeze", label: "Financial fraud" },
      { href: "/report/harassment", label: "Threats or blackmail" },
      { href: "/report/impersonation", label: "Impersonation" },
      { href: "/report/account", label: "Hacked account" },
    ],
  },
  {
    title: "Check",
    links: [
      { href: "/scam-check", label: "Check a UPI ID or number" },
      { href: "/verify-officer", label: "Verify an officer" },
      { href: "/scam-check/appeal", label: "Appeal a listing" },
      { href: "/dashboard", label: "Track a case" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/learn", label: "Learning Corner" },
      { href: "/learn/for/senior", label: "For senior citizens" },
      { href: "/learn/for/women", label: "For women" },
      { href: "/learn/for/business", label: "For small businesses" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/help", label: "Help and FAQs" },
      { href: "/help#about", label: "What this is" },
      { href: "/login", label: "Demo logins" },
    ],
  },
];

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        {/* Helpline, first — it is the most useful thing on this page. */}
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-primary-border bg-primary-soft p-6">
          <div>
            <p className="font-display text-[21px] font-bold text-ink">
              {t("foot.helpTitle")}
            </p>
            <p className="mt-1 text-[16px] text-ink-soft">
              {t("foot.helpSub")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:1930"
              className="press inline-flex min-h-[50px] items-center gap-2 rounded-[10px] bg-primary px-6 text-[17px] font-semibold text-primary-on shadow-sm hover:bg-primary-hover"
            >
              <span className="data">1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer noopener"
              className="press inline-flex min-h-[50px] items-center rounded-[10px] border border-line-strong bg-surface px-6 text-[16px] font-semibold text-ink shadow-sm hover:bg-sunken"
            >
              cybercrime.gov.in
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 className="eyebrow">{g.title}</h2>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="link-draw text-[15px] text-ink-soft hover:text-ink"
                    >
                      {l.label}
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
            {t("foot.discBody")}
          </p>
          <p className="mt-3">
            Built for the Build What Moves India hackathon. Research sources are
            in the project repository.
          </p>
          <p className="mt-3 text-ink-faint">
            <span className="data">Last updated 22/08/2026</span> · Works in any
            modern browser
          </p>
        </div>
      </div>
    </footer>
  );
}
