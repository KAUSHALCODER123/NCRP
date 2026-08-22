import Link from "next/link";

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
  return (
    <footer className="mt-20 bg-deep text-on-deep">
      <div className="mx-auto max-w-6xl px-5 py-12">
        {/* Helpline, first — it is the most useful thing on this page. */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-white/15 bg-white/5 p-5">
          <div>
            <p className="font-display text-[20px] font-bold text-white">
              Report a real cybercrime
            </p>
            <p className="mt-1 text-[15px] text-on-deep/85">
              Free, 24×7, in your language. The faster you call, the more can be
              held.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:1930"
              className="inline-flex min-h-[48px] items-center rounded-lg bg-white px-5 text-[17px] font-bold text-deep"
            >
              <span className="data">1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[48px] items-center rounded-lg border border-white/40 px-5 text-[16px] font-semibold text-white"
            >
              cybercrime.gov.in
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 className="eyebrow !text-on-deep/60">{g.title}</h2>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-[15px] text-on-deep/90 underline-offset-4 hover:text-white hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/15 pt-6 text-[14px] leading-relaxed text-on-deep/75">
          <p>
            <strong className="text-white">
              Sahaay is a student proof of concept, not a government service.
            </strong>{" "}
            It is not affiliated with, endorsed by, or connected to I4C, the
            Ministry of Home Affairs, or cybercrime.gov.in. No real complaint is
            filed here and no real data is processed. Every name, case, bank
            response and statistic shown in the interface is fictional.
          </p>
          <p className="mt-3">
            Built for the Build What Moves India hackathon. Research sources are
            in the project repository.
          </p>
          <p className="mt-3 text-on-deep/60">
            <span className="data">Last updated 22/08/2026</span> · Works in any
            modern browser
          </p>
        </div>
      </div>
    </footer>
  );
}
