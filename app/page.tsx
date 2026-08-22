import Link from "next/link";
import { HeroTicker } from "@/components/HeroTicker";
import { MoneyTrail, type Hop } from "@/components/MoneyTrail";

/**
 * Home.
 *
 * Government portals stack every section at equal visual weight, which is why
 * they are hard to use under stress: nothing tells you what matters. Here the
 * hierarchy is two-tier — the emergency owns a deep field at full bleed, and
 * everything below it is a quiet index.
 *
 * The money trail is the one bold element, and it appears exactly twice: once
 * to explain the crime, once to explain the fix. Everything else stays out of
 * its way.
 */

const TILES = [
  {
    href: "/freeze",
    kicker: "Money is gone",
    title: "Financial fraud",
    body: "UPI, card, net banking or wallet. We contact the banks before we ask you anything else.",
    meta: "About 60 seconds",
    primary: true,
  },
  {
    href: "/report/harassment",
    kicker: "Someone is threatening you",
    title: "Women & children",
    body: "Blackmail, intimate images, stalking, or abuse of a child. You can report without giving your name.",
    meta: "Anonymous option",
  },
  {
    href: "/report/impersonation",
    kicker: "Something else happened",
    title: "Other cyber crime",
    body: "Impersonation, a hacked account, or a fake profile using your name.",
    meta: "Guided, no jargon",
  },
];

/* The same trail, rewritten as it should work. */
const FIXED: Hop[] = [
  { label: "Your account", amount: "₹47,500", state: "source" },
  { label: "Mule account", amount: "₹34,200 held", state: "held" },
  { label: "Second mule", amount: "₹13,300 gone", state: "moved" },
  {
    label: "A shop in Kollam",
    amount: "₹5,000 held",
    sub: "₹9,95,000 still spendable",
    state: "innocent",
  },
];

const LEARN = [
  {
    href: "/learn/digital-arrest",
    title: "Digital arrest",
    body: "There is no such thing. Police do not arrest anyone over a video call.",
  },
  {
    href: "/learn/upi-collect-request",
    title: "The reverse UPI request",
    body: "You never enter your PIN to receive money. Not once, not for a test.",
  },
  {
    href: "/learn/otp-vishing",
    title: "The fake bank call",
    body: "An OTP only ever authorises money leaving. Never money coming back.",
  },
  {
    href: "/learn/task-job-scam",
    title: "The task and job scam",
    body: "You are asked to pay in order to get paid. A real job never needs that.",
  },
];

export default function Home() {
  return (
    <>
      {/* ---------- Tier 1: the emergency ---------- */}
      <section className="bg-deep">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="eyebrow !text-on-deep/50">
              National cyber crime reporting · reimagined
            </p>
            <h1 className="mt-5 font-display text-[40px] font-bold leading-[1.04] text-white sm:text-[60px]">
              Your money is still
              <br />
              moving. So are we.
            </h1>
            <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-on-deep/85">
              Stolen money is split across accounts within minutes. Every other
              portal spends those minutes on a form. This one asks the banks to
              hold your money first and collects the details afterwards.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/freeze"
                className="inline-flex min-h-[58px] items-center justify-center rounded-lg bg-white px-7 text-[18px] font-bold text-deep transition-transform hover:scale-[1.015]"
              >
                Report money lost →
              </Link>
              <a
                href="tel:1930"
                className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-lg border border-white/35 px-7 text-[18px] font-semibold text-white hover:bg-white/10"
              >
                Call <span className="data">1930</span>
              </a>
            </div>
          </div>

          {/* The signature, given the full measure */}
          <div className="mt-14 border-t border-white/12 pt-10">
            <HeroTicker />
          </div>
        </div>
      </section>

      {/* ---------- The three doors ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
        <h2 className="font-display text-[27px] font-bold text-ink sm:text-[32px]">
          What happened?
        </h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Pick the closest one. You don&apos;t need to know what the crime is
          called, and you will never be asked which district it belongs to.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TILES.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={
                t.primary
                  ? "flex flex-col rounded-card border-2 border-primary bg-primary-soft p-6 transition-colors hover:bg-primary-soft/60"
                  : "flex flex-col rounded-card border border-line bg-surface p-6 transition-colors hover:border-line-strong hover:bg-sunken"
              }
            >
              <p className="eyebrow">{t.kicker}</p>
              <p className="mt-2 font-display text-[24px] font-bold leading-tight text-ink">
                {t.title}
              </p>
              <p className="mt-2 flex-1 text-[16px] leading-relaxed text-ink-soft">
                {t.body}
              </p>
              <p className="data mt-5 text-[13px] font-semibold text-primary">
                {t.meta} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- The second victim: the signature, reused ---------- */}
      <section className="border-y border-line bg-sunken">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
          <p className="eyebrow">The part nobody counts</p>
          <h2 className="mt-4 max-w-3xl font-display text-[27px] font-bold leading-tight text-ink sm:text-[34px]">
            One report currently freezes every account on the line — including
            the shopkeeper&apos;s.
          </h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            He sold a phone and was paid ₹5,000. Three transfers earlier, that
            money had been stolen. Today his{" "}
            <strong className="text-ink">entire balance</strong> is frozen with
            no notice, and getting it back can mean travelling to a police
            station in another state. It takes months.
          </p>

          <div className="mt-9 rounded-card border border-line bg-surface p-6 text-ink sm:p-8">
            <p className="eyebrow">Here, the same trail</p>
            <MoneyTrail hops={FIXED} animate={false} className="mt-5" />
            <p className="mt-6 border-t border-line pt-5 text-[17px] leading-relaxed text-ink-soft">
              We hold the disputed ₹5,000 and leave the other ₹9,95,000 working.
              He is told the moment it happens, and can clear it from his phone
              in about two minutes.{" "}
              <Link
                href="/lien/LN-2026-08-7741"
                className="font-semibold text-primary underline underline-offset-4"
              >
                See what he sees →
              </Link>
            </p>
          </div>

          <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            Of roughly{" "}
            <span className="data font-semibold text-ink">₹52,969 crore</span>{" "}
            reported stolen, about{" "}
            <span className="data font-semibold text-breach">2.18%</span> has
            reached the people it was taken from. That is the number this
            rebuild is measured against — not complaints registered.
          </p>
        </div>
      </section>

      {/* ---------- Before it happens ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Before anything happens to you</p>
            <h2 className="mt-3 font-display text-[27px] font-bold text-ink sm:text-[32px]">
              Learning Corner
            </h2>
          </div>
          <Link
            href="/learn"
            className="text-[16px] font-semibold text-primary hover:underline"
          >
            All scams and guides →
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Each one is the script as it is actually spoken — how the call opens,
          the words they use, and the single tell that gives it away.
        </p>

        <ul className="mt-8 divide-y divide-line border-y border-line">
          {LEARN.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5 transition-colors hover:bg-primary-soft/50"
              >
                <span className="font-display text-[20px] font-bold text-ink sm:w-[280px]">
                  {l.title}
                </span>
                <span className="flex-1 text-[16px] text-ink-soft">
                  {l.body}
                </span>
                <span
                  aria-hidden="true"
                  className="text-primary opacity-0 transition-opacity group-hover:opacity-100"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/scam-check"
            className="inline-flex min-h-[48px] items-center rounded-lg border border-line-strong bg-surface px-5 text-[16px] font-semibold text-ink hover:bg-sunken"
          >
            Check a UPI ID before you pay
          </Link>
          <Link
            href="/verify-officer"
            className="inline-flex min-h-[48px] items-center rounded-lg border border-line-strong bg-surface px-5 text-[16px] font-semibold text-ink hover:bg-sunken"
          >
            Verify an officer who called you
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-[48px] items-center rounded-lg border border-line-strong bg-surface px-5 text-[16px] font-semibold text-ink hover:bg-sunken"
          >
            Demo logins for judges
          </Link>
        </div>
      </section>
    </>
  );
}
