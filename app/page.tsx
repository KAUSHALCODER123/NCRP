import Link from "next/link";
import { Shell, ShieldMark } from "@/components/ui";

/**
 * Screen 1 — "What happened?"
 *
 * No login. No category tree. No jurisdiction question.
 * The real portal opens with an abstract taxonomy split; a panicking victim
 * does not know whether a "digital arrest" call is impersonation, extortion
 * or financial fraud. So we don't ask.
 */

const OPTIONS = [
  {
    href: "/freeze",
    emoji: "💸",
    title: "I lost money",
    sub: "Money left my account. Every minute counts.",
    urgent: true,
  },
  {
    href: "/report/harassment",
    emoji: "😨",
    title: "Someone is threatening or blackmailing me",
    sub: "Including photos, videos or messages being used against you.",
  },
  {
    href: "/report/impersonation",
    emoji: "🎭",
    title: "Someone is pretending to be me",
    sub: "A fake profile, or my name used to cheat others.",
  },
  {
    href: "/report/account",
    emoji: "🔒",
    title: "My account was hacked",
    sub: "Email, social media, or banking access taken over.",
  },
  {
    href: "/scam-check",
    emoji: "🔍",
    title: "I got a suspicious message — is this a scam?",
    sub: "Check a UPI ID, number or link before you pay anything.",
  },
  {
    href: "/verify-officer",
    emoji: "👮",
    title: "Someone says they are the police",
    sub: "Check whether an officer contacting you is real.",
  },
];

export default function Home() {
  return (
    <>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-5 py-3">
          <span className="flex items-center gap-2 font-bold text-ink">
            <ShieldMark />
            Sahaay
          </span>
          <Link
            href="/login"
            className="text-[16px] font-semibold text-primary hover:underline"
          >
            Demo logins
          </Link>
        </div>
      </div>

      <Shell>
        <h1 className="text-[32px] font-bold leading-tight text-ink sm:text-[38px]">
          What happened?
        </h1>
        <p className="mt-3 text-ink-soft">
          Tap the closest one. You don&apos;t need an account, and you
          don&apos;t need to know what the crime is called.
        </p>

        <nav className="mt-7 space-y-3">
          {OPTIONS.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              className={
                o.urgent
                  ? "flex items-start gap-4 rounded-card border-2 border-primary bg-primary-soft p-5 transition-colors hover:bg-primary-soft/70"
                  : "flex items-start gap-4 rounded-card border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-sunken"
              }
            >
              <span aria-hidden="true" className="text-[28px] leading-none">
                {o.emoji}
              </span>
              <span className="min-w-0">
                <span className="block text-[20px] font-semibold text-ink">
                  {o.title}
                </span>
                <span className="mt-1 block text-[16px] text-ink-soft">
                  {o.sub}
                </span>
                {o.urgent ? (
                  <span className="mt-2 inline-block text-[15px] font-semibold text-primary">
                    Takes about 60 seconds →
                  </span>
                ) : null}
              </span>
            </Link>
          ))}
        </nav>

        <p className="mt-8 rounded-card border border-line bg-sunken p-5 text-[16px] text-ink-soft">
          <strong className="text-ink">In a hurry?</strong> Start with
          &ldquo;I lost money&rdquo;. We ask banks to hold your money first and
          collect the details afterwards — not the other way round.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/learn"
            className="rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-sunken"
          >
            <span className="block text-[18px] font-semibold text-ink">
              Learning Corner
            </span>
            <span className="mt-0.5 block text-[16px] text-ink-soft">
              How each scam actually sounds, and the one tell that gives it away.
            </span>
          </Link>
          <Link
            href="/help"
            className="rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-sunken"
          >
            <span className="block text-[18px] font-semibold text-ink">
              Help
            </span>
            <span className="mt-0.5 block text-[16px] text-ink-soft">
              What to do first, and what happens after you report.
            </span>
          </Link>
        </div>
      </Shell>
    </>
  );
}
