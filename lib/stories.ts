import type { Case } from "./types";

/**
 * Survivor stories.
 *
 * Attaching a story to a real case ID is the good idea here: it is the only
 * verification mechanism this product already owns, it cannot be gamed by
 * someone who has not been through the process, and it turns the case ID from
 * a receipt number into a credential.
 *
 * It also aims at a documented problem. The Parliamentary Standing Committee
 * on Home Affairs found serious underreporting driven by stigma, digital
 * illiteracy and fear of retaliation. Nothing counters shame like reading
 * that it happened to someone like you and they reported it anyway.
 *
 * Two deliberate departures from "only completed cases may post":
 *
 *  1. ANY resolved outcome qualifies, including cases that recovered nothing.
 *     Gating on recovery would mean almost nobody could write — only 1.4% of
 *     complaints become an FIR and around 2.18% of reported money reaches
 *     victims — and it would fill the page with happy endings, making the
 *     system look far better than it is. This whole project argues from the
 *     honesty of those numbers; the stories cannot quietly contradict them.
 *     A story that ends "I never got it back, here is how to avoid it" is the
 *     most useful thing on the page.
 *
 *  2. Crimes against women and children can never be published, at any stage.
 *     That track exists precisely because anonymity is what makes reporting
 *     possible, and a published account of sextortion or child abuse — even
 *     anonymised — carries a real re-identification and retaliation risk.
 */

export type Outcome = "recovered" | "partial" | "nothing" | "ongoing";

export interface Story {
  id: string;
  caseId: string;
  /** Display name. "Anonymous" is the default and the common case. */
  author: string;
  city: string;
  scamSlug: string;
  title: string;
  outcome: Outcome;
  amountLostRupees: number;
  amountBackRupees: number;
  publishedAt: string;
  /** What happened, in the person's own words. */
  body: string[];
  /** The one thing they want the reader to take away. */
  lesson: string;
}

export const OUTCOME_LABEL: Record<Outcome, string> = {
  recovered: "Money returned",
  partial: "Part returned",
  nothing: "Nothing recovered",
  ongoing: "Still open",
};

export const OUTCOME_TONE: Record<Outcome, "held" | "pending" | "breach"> = {
  recovered: "held",
  partial: "pending",
  nothing: "breach",
  ongoing: "pending",
};

/* ------------------------------------------------------------------ */
/* Eligibility                                                         */
/* ------------------------------------------------------------------ */

export interface Eligibility {
  ok: boolean;
  reason: string;
}

export function canShare(kase: Case | undefined): Eligibility {
  if (!kase) {
    return { ok: false, reason: "We couldn't find a case with that number." };
  }

  // Never, at any stage. See the note at the top of this file.
  if (kase.kind === "harassment") {
    return {
      ok: false,
      reason:
        "Cases involving women and children are never published, at any stage. Anonymity is what makes those reports possible, and we will not put it at risk.",
    };
  }

  const RESOLVED: Case["status"][] = [
    "fir_registered",
    "restoring",
    "closed",
  ];
  if (!RESOLVED.includes(kase.status)) {
    return {
      ok: false,
      reason:
        "You can write once your case reaches an outcome — an FIR, a restoration decision, or a closure. Until then the details may still change.",
    };
  }

  return { ok: true, reason: "" };
}

export function outcomeOf(kase: Case): Outcome {
  const lost = kase.transaction?.amountPaise ?? 0;
  const back = kase.restoration.creditedPaise;
  if (back <= 0) return kase.status === "closed" ? "nothing" : "ongoing";
  if (back >= lost) return "recovered";
  return "partial";
}

/* ------------------------------------------------------------------ */
/* Seeded stories                                                      */
/* ------------------------------------------------------------------ */

export const STORIES: Story[] = [
  {
    id: "st-0041",
    caseId: "SHY-2026-07-1180",
    author: "Anjali D.",
    city: "Pune",
    scamSlug: "loan-app-extortion",
    title: "I paid ₹62,000 to stop them messaging my family",
    outcome: "recovered",
    amountLostRupees: 62_000,
    amountBackRupees: 62_000,
    publishedAt: "2026-07-29T10:00:00.000Z",
    body: [
      "I needed ₹15,000 for a medical bill and downloaded an app that promised it in five minutes. It asked for my contacts and gallery during install and I allowed it, because I was in a hurry and everyone allows those.",
      "Four days later the messages started. They said they had my photos and would send them to everyone in my phone. I paid ₹20,000. Then they asked for more. I paid again. By the third demand I understood that paying was the thing keeping it going.",
      "What I did not expect was how ordinary reporting felt. I pasted the UPI message, and within a minute I could see the money had been held at the other bank. It took another five weeks and a lot of waiting, but it came back.",
    ],
    lesson:
      "Paying does not end it. The first demand is a test to see whether you will pay the second.",
  },
  {
    id: "st-0038",
    caseId: "SHY-2026-06-0912",
    author: "Anonymous",
    city: "Coimbatore",
    scamSlug: "digital-arrest",
    title: "Nine hours on a video call with a man in a police uniform",
    outcome: "partial",
    amountLostRupees: 480_000,
    amountBackRupees: 172_000,
    publishedAt: "2026-07-14T10:00:00.000Z",
    body: [
      "It started with a courier company saying a parcel in my name had been seized with fake passports inside. They transferred me to someone who called himself a cyber crime officer. He had a uniform, a desk, a board behind him with a government emblem.",
      "He told me I was under digital arrest and could not leave the camera or tell anyone, including my wife. I believed him for nine hours. I am a retired bank employee. I have told people for thirty years not to share their details.",
      "I transferred ₹4,80,000 to an account he said was for RBI verification. About ₹1,72,000 was held at the second bank. The rest had already gone.",
    ],
    lesson:
      "There is no such thing as a digital arrest. If someone tells you not to tell your family, that instruction is the crime.",
  },
  {
    id: "st-0035",
    caseId: "SHY-2026-05-4417",
    author: "Ravi K.",
    city: "Indore",
    scamSlug: "task-job-scam",
    title: "I never got my money back, and I still think reporting was worth it",
    outcome: "nothing",
    amountLostRupees: 214_000,
    amountBackRupees: 0,
    publishedAt: "2026-06-02T10:00:00.000Z",
    body: [
      "It was a Telegram group for reviewing hotels. The first three tasks paid ₹150 each, real money, into my account. Then came the prepaid tasks. Deposit ₹5,000, get ₹7,500 back. That worked too.",
      "By the time it stopped working I had put in ₹2,14,000, mostly borrowed. Every failed withdrawal came with a reason, and each reason needed one more deposit to fix.",
      "The money was gone before I reported — moved through four accounts in under an hour. I got nothing back. But mine was one of sixty complaints against the same accounts, and those accounts are frozen now. I would rather my report counted for someone else than not exist at all.",
    ],
    lesson:
      "If you are asked to pay in order to get paid, stop there. And report even when you think it is too late — your report is evidence in someone else's case.",
  },
];

export function storyById(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}
