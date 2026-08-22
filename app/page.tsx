import Link from "next/link";
import { HeroTicker } from "@/components/HeroTicker";

/**
 * Home.
 *
 * Government portals stack every section at equal visual weight, which is why
 * they are hard to use under stress: nothing tells you what matters. Here the
 * hierarchy is strictly two-tier — the emergency lives on a deep field at full
 * bleed, and everything else is a quiet index below the rule. Visual weight
 * encodes urgency, not importance-in-the-org-chart.
 */

const TILES = [
  {
    href: "/freeze",
    kicker: "Money is gone",
    title: "Financial fraud",
    body: "UPI, card, net banking, wallet. We contact the banks before we ask you anything else.",
    time: "About 60 seconds",
    primary: true,
  },
  {
    href: "/report/harassment",
    kicker: "Someone is threatening you",
    title: "Women & children",
    body: "Blackmail, intimate images, stalking, abuse of a child. You can report without giving your name.",
    time: "Anonymous option",
  },
  {
    href: "/report/impersonation",
    kicker: "Something else happened",
    title: "Other cyber crime",
    body: "Impersonation, a hacked account, a fake profile using your name.",
    time: "Guided, no jargon",
  },
];

const STATS = [
  {
    figure: "2.18%",
    label: "of reported stolen money reaches victims",
    note: "₹7,647 cr frozen of ₹52,969 cr reported — about ₹167 cr returned",
    tone: "breach" as const,
  },
  {
    figure: "1.4%",
    label: "of complaints became an FIR in 2025",
    note: "Down from roughly 5% in 2022",
    tone: "breach" as const,
  },
  {
    figure: "28.15",
    suffix: "lakh",
    label: "complaints filed in 2025",
    note: "4.52 lakh in 2022 — six times the growth of capacity",
    tone: "neutral" as const,
  },
];

const WHATS_NEW = [
  {
    tag: "Alert",
    tone: "breach" as const,
    text: "1,024 reports this month naming a fake CBI verification site. No police force arrests anyone over a video call.",
    href: "/learn/digital-arrest",
  },
  {
    tag: "New",
    tone: "held" as const,
    text: "Holds now cover only the disputed amount. The rest of your balance keeps working while a dispute is reviewed.",
    href: "/help#frozen",
  },
  {
    tag: "Notice",
    tone: "neutral" as const,
    text: "Losses of ₹1,00,000 or more now register an e-Zero FIR automatically. You don't have to ask for one.",
    href: "/freeze",
  },
];

const LEARN = [
  {
    href: "/learn",
    title: "Learning Corner",
    body: "Every scam written as the script it actually is — the words used, and the one tell.",
  },
  {
    href: "/learn/for/senior",
    title: "For senior citizens",
    body: "The most targeted group, and the least served by a web form.",
  },
  {
    href: "/help",
    title: "How reporting works",
    body: "What happens after you file, who becomes responsible, and by when.",
  },
  {
    href: "/scam-check",
    title: "Check before you pay",
    body: "Paste a UPI ID, number or link and see what others have reported.",
  },
];

export default function Home() {
  return (
    <>
      {/* ---------- Tier 1: the emergency ---------- */}
      <section className="bg-deep text-on-deep">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <p className="eyebrow !text-on-deep/60">
                National cyber crime reporting · reimagined
              </p>
              <h1 className="mt-4 font-display text-[38px] font-bold leading-[1.08] text-white sm:text-[52px]">
                Your money is still
                <br />
                moving. So are we.
              </h1>
              <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-on-deep/85">
                Stolen money is layered across accounts within minutes. Every
                other portal spends those minutes on a form. This one asks the
                banks to hold your money first, and collects the details
                afterwards.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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

              <p className="mt-4 text-[15px] text-on-deep/65">
                No account needed. Nothing here files a real complaint.
              </p>
            </div>

            <HeroTicker />
          </div>
        </div>
      </section>

      {/* ---------- Tier 1b: the three doors ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <h2 className="font-display text-[26px] font-bold text-ink sm:text-[30px]">
          What happened?
        </h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Pick the closest one. You don&apos;t need to know what the crime is
          called, and you&apos;ll never be asked which district it belongs to.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {TILES.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={clsxTile(t.primary)}
            >
              <p className="eyebrow">{t.kicker}</p>
              <p className="mt-2 text-[24px] font-bold leading-tight text-ink">
                {t.title}
              </p>
              <p className="mt-2 flex-1 text-[16px] leading-relaxed text-ink-soft">
                {t.body}
              </p>
              <p className="data mt-4 text-[13px] font-semibold text-primary">
                {t.time} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <div className="rule" />
      </div>

      {/* ---------- Why this exists ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <p className="eyebrow">Why this had to change</p>
        <h2 className="mt-3 max-w-2xl font-display text-[26px] font-bold leading-tight text-ink sm:text-[32px]">
          The system is good at freezing money and catastrophic at returning it.
        </h2>

        <dl className="mt-8 grid gap-6 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.figure} className="border-t-2 border-line-strong pt-4">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <p
                  className={`data text-[42px] font-semibold leading-none ${
                    s.tone === "breach" ? "text-breach" : "text-ink"
                  }`}
                >
                  {s.figure}
                  {s.suffix ? (
                    <span className="ml-1.5 text-[18px] font-medium text-ink-faint">
                      {s.suffix}
                    </span>
                  ) : null}
                </p>
                <p className="mt-2.5 text-[16px] font-semibold text-ink">
                  {s.label}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-faint">
                  {s.note}
                </p>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-7 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
          So this rebuild is measured in rupees returned, not complaints
          registered — and it fixes a second failure nobody counts: the honest
          merchants and freelancers whose entire accounts are frozen because
          someone paid them with money that was stolen three transfers earlier.{" "}
          <Link
            href="/help#frozen"
            className="font-semibold text-primary underline underline-offset-4"
          >
            We freeze the amount, not the person.
          </Link>
        </p>
      </section>

      {/* ---------- What's new ---------- */}
      <section className="bg-sunken">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-14">
          <p className="eyebrow">Being reported right now</p>
          <ul className="mt-5 grid gap-3 md:grid-cols-3">
            {WHATS_NEW.map((n) => (
              <li key={n.text}>
                <Link
                  href={n.href}
                  className="flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-colors hover:border-line-strong"
                >
                  <span
                    className={`eyebrow ${
                      n.tone === "breach"
                        ? "!text-breach"
                        : n.tone === "held"
                          ? "!text-held"
                          : ""
                    }`}
                  >
                    {n.tag}
                  </span>
                  <span className="mt-2 text-[16px] leading-relaxed text-ink">
                    {n.text}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Tier 2: the quiet index ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <p className="eyebrow">Before anything happens to you</p>
        <h2 className="mt-3 text-[26px] font-bold text-ink sm:text-[30px]">
          Learning Corner
        </h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Prevention scales further than investigation ever will.
        </p>

        <div className="mt-7 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
          {LEARN.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group bg-surface p-6 transition-colors hover:bg-primary-soft"
            >
              <p className="font-display text-[19px] font-bold text-ink">
                {l.title}
              </p>
              <p className="mt-1.5 text-[16px] leading-relaxed text-ink-soft">
                {l.body}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/verify-officer"
            className="inline-flex min-h-[48px] items-center rounded-lg border border-line-strong bg-surface px-5 text-[16px] font-semibold text-ink hover:bg-sunken"
          >
            Verify an officer who called you
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-[48px] items-center rounded-lg border border-line-strong bg-surface px-5 text-[16px] font-semibold text-ink hover:bg-sunken"
          >
            Track an existing case
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

function clsxTile(primary?: boolean) {
  return [
    "flex flex-col rounded-card border p-6 transition-colors",
    primary
      ? "border-2 border-primary bg-primary-soft hover:bg-primary-soft/70"
      : "border-line bg-surface hover:border-line-strong hover:bg-sunken",
  ].join(" ");
}
