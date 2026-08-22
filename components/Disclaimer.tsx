/**
 * Non-negotiable, on every page.
 *
 * This is a realistic clone of a government crime-reporting portal, which is
 * structurally identical to a phishing site — and the project's own research
 * documents lookalike-domain fraud as an active attack pattern in India.
 * The disclaimer is an ethical requirement, not a legal formality.
 */
import Link from "next/link";

export function Disclaimer() {
  return (
    <footer className="mt-16 border-t border-line bg-sunken px-5 py-6 text-[15px] leading-relaxed text-ink-soft">
      <div className="mx-auto max-w-3xl space-y-2">
        <p className="pb-1">
          <Link
            href="/help"
            className="font-semibold text-primary underline underline-offset-2"
          >
            Help &amp; common questions
          </Link>
          {" · "}
          <Link
            href="/learn"
            className="font-semibold text-primary underline underline-offset-2"
          >
            Learning Corner
          </Link>
        </p>
        <p>
          <strong className="text-ink">
            This is a student proof of concept, not a government service.
          </strong>{" "}
          Sahaay is not affiliated with, endorsed by, or connected to I4C, the
          Ministry of Home Affairs, or cybercrime.gov.in. No real complaint is
          filed here and no real data is processed. Every name, case and bank
          response on this site is fictional.
        </p>
        <p>
          To report an actual cybercrime in India, use{" "}
          <a
            className="font-semibold text-primary underline underline-offset-2"
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer noopener"
          >
            cybercrime.gov.in
          </a>{" "}
          or call <strong className="text-ink tnum">1930</strong>.
        </p>
      </div>
    </footer>
  );
}
