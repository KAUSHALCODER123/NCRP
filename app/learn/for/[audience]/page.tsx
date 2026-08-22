import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Button, Card, Shell, TopBar } from "@/components/ui";
import { AUDIENCES, scamsFor, type Audience } from "@/lib/learning";

const GUIDANCE: Record<Audience, { title: string; lede: string; tips: string[] }> = {
  senior: {
    title: "For senior citizens",
    lede:
      "Older people are targeted more than any other group — and the advice they are usually given assumes a smartphone and a data plan they may not have.",
    tips: [
      "Agree one rule with your family: before sending money to anyone you have not met, you call one named person first. Every time, no exceptions.",
      "Nobody official will ever ask you to stay on a video call. You are always allowed to hang up and call back.",
      "Keep the number 1930 written down on paper near the phone. It is free.",
      "You do not have to do any of this alone — someone in your family can file a report on your behalf.",
    ],
  },
  student: {
    title: "For students and job seekers",
    lede:
      "The scams aimed at you use money you need and jobs you are hoping for. That is not naivety — it is leverage.",
    tips: [
      "No real employer asks you to deposit money to unlock work, a commission, or a withdrawal.",
      "An internship or job offer that arrives unsolicited on WhatsApp or Telegram is a sales channel, not a recruitment channel.",
      "Instant-loan apps that want your contacts and gallery are not lenders. Check the permissions before installing, not after.",
      "If you are already several deposits in, stopping now is the cheapest option available to you. It does not get better.",
    ],
  },
  women: {
    title: "For women",
    lede:
      "Image-based abuse works on shame and speed. Both of those are the abuser's tools, not evidence that you did anything wrong.",
    tips: [
      "You can report anonymously. You never have to give your name, and you can still track and add to your report.",
      "Do not pay and do not negotiate. Paying proves the leverage works and a second demand almost always follows.",
      "Screenshot the profile, the messages and the payment demand before you block — evidence disappears fast.",
      "Increasingly the images are generated and never existed. The threat is real; the material often is not.",
    ],
  },
  business: {
    title: "For small businesses and freelancers",
    lede:
      "You face two risks: being defrauded, and being caught in someone else's fraud when a payment you legitimately received turns out to be traced.",
    tips: [
      "You never enter your UPI PIN to receive money. A collect request is a request to pay.",
      "Keep invoices and buyer chats for every sale. If a payment you received is ever held, that documentation is what releases it.",
      "If a hold appears on your account, you are not a suspect. Dispute it — do not just wait.",
      "Never install a screen-sharing app because someone from 'support' asked you to.",
    ],
  },
  everyone: { title: "For everyone", lede: "", tips: [] },
};

export function generateStaticParams() {
  return AUDIENCES.filter((a) => a.id !== "everyone").map((a) => ({
    audience: a.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ audience: string }>;
}): Promise<Metadata> {
  const { audience } = await params;
  const g = GUIDANCE[audience as Audience];
  return { title: g ? `${g.title} — Sahaay` : "Learning Corner — Sahaay" };
}

export default async function AudiencePage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience } = await params;
  const key = audience as Audience;
  const g = GUIDANCE[key];
  if (!g || key === "everyone") notFound();

  const scams = scamsFor(key);

  return (
    <>
      <TopBar back={{ href: "/learn", label: "Learning Corner" }} />
      <Shell>
        <h1 className="font-display text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          {g.title}
        </h1>
        <p className="mt-3 text-[18px] text-ink-soft">{g.lede}</p>

        <Card className="mt-6">
          <ul className="space-y-4">
            {g.tips.map((t) => (
              <li key={t} className="flex gap-3 text-[17px] text-ink-soft">
                <span aria-hidden="true" className="text-primary">
                  →
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>

        <h2 className="mt-10 text-[22px] font-bold text-ink">
          The scams aimed at you
        </h2>
        <div className="mt-3 space-y-3">
          {scams.map((s) => (
            <Link
              key={s.slug}
              href={`/learn/${s.slug}`}
              className="block rounded-card border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-sunken"
            >
              <p className="text-[19px] font-semibold text-ink">{s.name}</p>
              <p className="mt-1 text-[16px] text-ink-soft">{s.oneLine}</p>
            </Link>
          ))}
        </div>

        <Card className="mt-8 border-primary/25 bg-primary-soft">
          <p className="text-[17px] font-semibold text-ink">
            Already lost money?
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            Report first, read later. The first hour decides how much can be
            held.
          </p>
          <Button href="/freeze" className="mt-4">
            Report it now
          </Button>
        </Card>
      </Shell>
    </>
  );
}
