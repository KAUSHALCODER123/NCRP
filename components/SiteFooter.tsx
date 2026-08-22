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
    title: "foot.gReport",
    links: [
      { href: "/report", label: "Report a crime" },
      { href: "/freeze", label: "Financial fraud" },
      { href: "/report/harassment", label: "Threats or blackmail" },
      { href: "/report/impersonation", label: "Impersonation" },
      { href: "/report/account", label: "Hacked account" },
    ],
  },
  {
    title: "foot.gCheck",
    links: [
      { href: "/scam-check", label: "Check a UPI ID or number" },
      { href: "/verify-officer", label: "Verify an officer" },
      { href: "/scam-check/appeal", label: "Appeal a listing" },
      { href: "/dashboard", label: "Track a case" },
    ],
  },
  {
    title: "foot.gLearn",
    links: [
      { href: "/learn", label: "Learning Corner" },
      { href: "/stories", label: "Survivor stories" },
      { href: "/learn/for/senior", label: "For senior citizens" },
      { href: "/learn/for/women", label: "For women" },
      { href: "/learn/for/business", label: "For small businesses" },
    ],
  },
  {
    title: "foot.gAbout",
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 className="eyebrow">{t(g.title as Parameters<typeof t>[0])}</h2>
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
            {t("foot.discBody")}{" "}
            To report an actual cybercrime in India, call{" "}
            <a href="tel:1930" className="font-semibold text-primary-text">
              1930
            </a>{" "}
            or use{" "}
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
            Built for the Build What Moves India hackathon. Research sources are
            in the project repository.
          </p>
          <p className="mt-3 text-ink-faint">
            <span className="data">{t("foot.updated")}</span> · Works in any
            modern browser
          </p>
        </div>
      </div>
    </footer>
  );
}
