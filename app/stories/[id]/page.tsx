import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, Chip, Shell, TopBar } from "@/components/ui";
import { IconArrow } from "@/components/icons";
import { STORIES, storyById, OUTCOME_LABEL, OUTCOME_TONE } from "@/lib/stories";
import { SCAMS } from "@/lib/learning";

export function generateStaticParams() {
  return STORIES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = storyById(id);
  return s
    ? { title: `${s.title} — Sahaay`, description: s.lesson }
    : { title: "Survivor stories — Sahaay" };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = storyById(id);
  if (!s) notFound();

  const scam = SCAMS.find((x) => x.slug === s.scamSlug);

  return (
    <>
      <TopBar back={{ href: "/stories", label: "Survivor stories" }} />
      <Shell>
        <div className="flex flex-wrap items-center gap-3">
          <Chip>Fictional composite</Chip>
          <Chip tone={OUTCOME_TONE[s.outcome]}>{OUTCOME_LABEL[s.outcome]}</Chip>
        </div>

        <h1 className="mt-4 font-display text-[30px] font-bold leading-tight text-ink sm:text-[36px]">
          {s.title}
        </h1>
        <p className="mt-3 text-[16px] text-ink-faint">
          {s.author} · {s.city} ·{" "}
          {new Date(s.publishedAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          })}
        </p>

        <Card className="mt-7">
          <dl className="grid grid-cols-2 gap-5">
            <div>
              <dt className="text-[15px] text-ink-faint">Taken</dt>
              <dd className="data text-[24px] font-semibold text-ink">
                ₹{s.amountLostRupees.toLocaleString("en-IN")}
              </dd>
            </div>
            <div>
              <dt className="text-[15px] text-ink-faint">Came back</dt>
              <dd
                className={
                  s.amountBackRupees > 0
                    ? "data text-[24px] font-semibold text-secondary-text"
                    : "data text-[24px] font-semibold text-critical-text"
                }
              >
                ₹{s.amountBackRupees.toLocaleString("en-IN")}
              </dd>
            </div>
          </dl>
        </Card>

        <div className="mt-8 space-y-5">
          {s.body.map((p, i) => (
            <p key={i} className="text-[18px] leading-relaxed text-ink-soft">
              {p}
            </p>
          ))}
        </div>

        <Card className="mt-8 border-secondary-border bg-secondary-soft">
          <p className="eyebrow">The safety lesson</p>
          <p className="mt-2.5 text-[19px] font-semibold leading-snug text-ink">
            {s.lesson}
          </p>
        </Card>

        {scam ? (
          <Link
            href={`/learn/${scam.slug}`}
            className="press mt-8 inline-flex min-h-[52px] items-center gap-2 rounded-[10px] border border-line-strong bg-surface px-5 text-[16px] font-semibold text-ink shadow-sm hover:bg-sunken"
          >
            How {scam.name.toLowerCase()} works
            <IconArrow className="h-4 w-4" />
          </Link>
        ) : null}
      </Shell>
    </>
  );
}
