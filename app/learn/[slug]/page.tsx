import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { SCAMS, scamBySlug } from "@/lib/learning";
import { clusterById } from "@/lib/mock/clusters";
import { formatPaise } from "@/lib/money";

export function generateStaticParams() {
  return SCAMS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = scamBySlug(slug);
  return s
    ? { title: `${s.name} — Sahaay`, description: s.oneLine }
    : { title: "Learning Corner — Sahaay" };
}

export default async function ScamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = scamBySlug(slug);
  if (!s) notFound();

  const cluster = clusterById(s.clusterId ?? null);

  return (
    <>
      <TopBar back={{ href: "/learn", label: "Learning Corner" }} />
      <Shell>
        <h1 className="text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          {s.name}
        </h1>
        <p className="mt-3 text-[19px] text-ink-soft">{s.oneLine}</p>
        <p className="mt-2 text-[15px] text-ink-faint">
          Also called: {s.alsoCalled.join(" · ")}
        </p>

        {cluster ? (
          <Card className="mt-6 border-breach/25 bg-breach-soft">
            <p className="text-[17px] font-semibold text-ink">
              {cluster.reports} people have reported this pattern
            </p>
            <p className="mt-1 text-[16px] text-ink-soft">
              {formatPaise(cluster.totalReportedPaise)} reported lost · active
              cluster {cluster.clusterId}
            </p>
          </Card>
        ) : null}

        {/* The tell first — someone mid-scam does not scroll. */}
        <Card className="mt-6 border-held/30 bg-held-soft">
          <Chip tone="held">The one thing to remember</Chip>
          <p className="mt-3 text-[20px] font-semibold leading-snug text-ink">
            {s.tell}
          </p>
        </Card>

        <Section title="How it starts">
          <p className="text-[17px] text-ink-soft">{s.opens}</p>
        </Section>

        <Section title="What they say">
          <ul className="space-y-3">
            {s.script.map((line) => (
              <li
                key={line}
                className="rounded-xl border border-line bg-sunken p-4 text-[17px] italic leading-relaxed text-ink"
              >
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[15px] text-ink-faint">
            These are close to the exact words used. People recognise a script
            far more reliably than they recognise a category name.
          </p>
        </Section>

        <Section title="Why it works">
          <p className="text-[17px] text-ink-soft">{s.whyItWorks}</p>
        </Section>

        <Section title="What to do">
          <ul className="space-y-2">
            {s.doNow.map((d) => (
              <li key={d} className="flex gap-3 text-[17px] text-ink-soft">
                <span aria-hidden="true" className="text-held">
                  ✓
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Card className="mt-8 border-primary/25 bg-primary-soft">
          <p className="text-[18px] font-semibold text-ink">
            If you already paid
          </p>
          <p className="mt-1 text-[17px] text-ink-soft">{s.ifYouPaid}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/freeze">Report it now</Button>
            <Button href="/scam-check" variant="secondary">
              Check their UPI ID
            </Button>
          </div>
          <p className="mt-4 text-[16px] text-ink-soft">
            This happens to careful people every day. Reporting quickly matters
            far more than how it happened.
          </p>
        </Card>

        <nav className="mt-10">
          <p className="text-[16px] font-semibold text-ink">Read next</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SCAMS.filter((o) => o.slug !== s.slug)
              .slice(0, 4)
              .map((o) => (
                <Link
                  key={o.slug}
                  href={`/learn/${o.slug}`}
                  className="rounded-full border border-line-strong bg-surface px-4 py-2 text-[16px] font-medium text-primary hover:bg-primary-soft"
                >
                  {o.name}
                </Link>
              ))}
          </div>
        </nav>
      </Shell>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-[22px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}
