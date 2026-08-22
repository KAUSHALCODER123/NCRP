import Link from "next/link";
import type { Metadata } from "next";
import { Button, Card, Shell, TopBar } from "@/components/ui";
import { FAQ } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Help — Sahaay",
  description:
    "What to do first, how your case moves, what to do if your account has a hold, and how to spot a scam.",
};

/**
 * Help / FAQ.
 *
 * Deliberately a server component with plain <details> disclosure — no
 * JavaScript, so it renders instantly, works on 2G, is searchable with the
 * browser's own find-in-page, and stays accessible by default.
 *
 * Ordered by urgency, not by topic: someone who has just lost money should
 * hit the answer they need without scrolling past "about this project".
 */
export default function HelpPage() {
  return (
    <>
      <TopBar back={{ href: "/", label: "Home" }} />
      <Shell>
        <h1 className="text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          Help
        </h1>
        <p className="mt-3 text-ink-soft">
          Plain answers, most urgent first. If money has just left your account,
          start with the first section.
        </p>

        <Card className="mt-6 border-primary/25 bg-primary-soft">
          <p className="text-[17px] font-semibold text-ink">
            If this is happening right now
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            Report first and read afterwards. Every minute lowers what can be
            recovered.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/freeze">Report it now</Button>
            <Button href="/verify-officer" variant="secondary">
              Verify an officer
            </Button>
          </div>
        </Card>

        {/* Jump links — cheap, and the fastest way to the right answer. */}
        <nav aria-label="Sections" className="mt-6 flex flex-wrap gap-2">
          {FAQ.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="rounded-full border border-line-strong bg-surface px-4 py-2 text-[16px] font-semibold text-primary hover:bg-primary-soft"
            >
              {g.title}
            </a>
          ))}
        </nav>

        {FAQ.map((group) => (
          <section key={group.id} id={group.id} className="mt-10 scroll-mt-6">
            <h2 className="text-[24px] font-bold leading-tight text-ink">
              {group.title}
            </h2>
            <p className="mt-1 text-[16px] text-ink-soft">{group.blurb}</p>

            <div className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
              {group.items.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 text-[18px] font-semibold text-ink hover:bg-sunken [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[20px] leading-none text-ink-faint transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-[17px] leading-relaxed text-ink-soft">
                    <p>{item.a}</p>
                    {item.cta ? (
                      <Link
                        href={item.cta.href}
                        className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-primary hover:underline"
                      >
                        {item.cta.label} →
                      </Link>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <Card className="mt-10">
          <p className="text-[18px] font-semibold text-ink">
            Still stuck?
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            For a real incident in India, call{" "}
            <strong className="tnum text-ink">1930</strong> — it is free, staffed,
            and the fastest way to get a bank hold placed. You can also file at{" "}
            <a
              className="font-semibold text-primary underline underline-offset-2"
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer noopener"
            >
              cybercrime.gov.in
            </a>
            .
          </p>
        </Card>
      </Shell>
    </>
  );
}
