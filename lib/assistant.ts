import { SCAMS, type Scam } from "./learning";

/**
 * The assistant.
 *
 * Not a FAQ bot. Its job is to recognise which scam is happening from the
 * person's own words and tell them what to do in the next sixty seconds —
 * because the thing that decides how much money comes back is what happens
 * in the first hour, not how well the site explains itself.
 *
 * Two hard constraints shape everything here:
 *
 *  1. It must never ask for an OTP, PIN, CVV, password, full account number
 *     or Aadhaar. Asking for those is the exact behaviour of the frauds this
 *     product exists to fight, and a crime-reporting site that does it is
 *     teaching victims the wrong reflex.
 *  2. It must push toward action, not conversation. A long helpful chat while
 *     money is being layered across accounts is a failure, however pleasant.
 */

export interface Action {
  label: string;
  href: string;
}

export interface AssistantReply {
  text: string;
  actions: Action[];
  /** True when produced without the model — kept honest in the UI. */
  fallback: boolean;
  /** Set when the person appears to be mid-attack. */
  urgent?: boolean;
}

export const SAFETY_RULES = [
  "Never ask for an OTP, PIN, CVV, password, full card or account number, Aadhaar number, or any screen-sharing app.",
  "Never promise that money will be recovered. Say what the process is and what improves the odds.",
  "Never give legal advice or quote what punishment someone will receive.",
  "If the person is on a call with the fraudster right now, tell them to hang up before anything else.",
  "If money has already left, the first instruction is always to report it immediately — details come afterwards.",
] as const;

export const SYSTEM_PROMPT = `You are Sahaay's assistant, helping people in India who may be experiencing cyber fraud right now.

You are talking to someone who may be frightened, may have just lost money, and is not reading carefully. Write accordingly.

HARD RULES — never break these:
${SAFETY_RULES.map((r) => `- ${r}`).join("\n")}
- Never claim to be the police, a bank, or a government service. Sahaay is a student proof of concept and files no real complaint.
- For a real incident, the free national helpline is 1930 and the official portal is cybercrime.gov.in. Say so whenever it matters.

HOW TO REPLY:
- 2 to 4 short sentences. No lists unless asked. No preamble.
- Reply in the same language the person wrote in. Indian languages are expected.
- Lead with the single most useful thing. If they are mid-attack, that is "hang up".
- Name the scam if you recognise it, and give the one tell that identifies it.
- End with one concrete next step, never two.
- Never say "I'm sorry to hear that" or similar filler. Be warm by being useful.
- Never blame them. These frauds catch careful people every day.

SCAMS YOU KNOW (use the tell verbatim where it fits):
${SCAMS.map((s) => `• ${s.name} (${s.alsoCalled.join(", ")}): ${s.oneLine} TELL: ${s.tell}`).join("\n")}

WHERE TO SEND PEOPLE:
- Money already gone → /freeze (holds the money before asking anything else)
- Checking a UPI ID, number or link before paying → /scam-check
- Someone claiming to be police → /verify-officer
- Understanding a scam in depth → /learn/<slug>
- An existing case → /dashboard`;

/* ------------------------------------------------------------------ */
/* Deterministic fallback                                              */
/* ------------------------------------------------------------------ */

/** Someone is being defrauded as they type. This outranks everything. */
const LIVE_ATTACK =
  /right now|on the (phone|call)|they are calling|still on|video call|don'?t disconnect|asking me to|telling me to|screen ?share|anydesk|teamviewer/i;

const MONEY_GONE =
  /lost|debited|deducted|transferred|paid|gone|withdraw|stole|cheated|fraud.*money|money.*fraud|₹|rs\.?\s*\d|rupees/i;

const ASKS_FOR_SECRET = /otp|pin|cvv|password|passcode/i;

function matchScam(text: string): Scam | null {
  const t = text.toLowerCase();
  let best: { scam: Scam; hits: number } | null = null;

  for (const s of SCAMS) {
    const terms = [
      s.name,
      ...s.alsoCalled,
      ...s.slug.split("-"),
    ].map((x) => x.toLowerCase());
    const hits = terms.filter((term) => term.length > 3 && t.includes(term)).length;
    if (hits && (!best || hits > best.hits)) best = { scam: s, hits };
  }
  if (best) return best.scam;

  // Fall back to the vocabulary each scam is actually described with.
  const CUES: Array<[RegExp, string]> = [
    [/cbi|police|arrest|parcel|customs|narcotic|court case|warrant/i, "digital-arrest"],
    [/otp|kyc|card block|bank called|expire/i, "otp-vishing"],
    [/collect request|scan.*receive|qr|olx|army|selling/i, "upi-collect-request"],
    [/task|part.?time|work from home|commission|deposit.*unlock/i, "task-job-scam"],
    [/invest|trading|profit|crypto|stock|withdraw.*tax/i, "investment-scam"],
    [/loan app|contacts|gallery|emi|recovery agent/i, "loan-app-extortion"],
    [/nude|intimate|blackmail|morph|sextort|video.*record/i, "sextortion"],
    [/customer care|helpline|refund|support number|searched/i, "fake-customer-care"],
  ];
  for (const [re, slug] of CUES) {
    if (re.test(text)) return SCAMS.find((s) => s.slug === slug) ?? null;
  }
  return null;
}

/**
 * Answers without the model.
 *
 * This is not a degraded path — it is what runs when the key is missing, the
 * quota is spent, or the network is slow, and it must still be genuinely
 * useful. It is built from the same scam library the model is briefed on.
 */
export function answerLocally(text: string): AssistantReply {
  const scam = matchScam(text);

  if (LIVE_ATTACK.test(text)) {
    return {
      urgent: true,
      fallback: true,
      text: scam
        ? `Hang up first — you are allowed to, and nothing happens if you do. ${scam.tell} Once you are off the call, tell one person in your family.`
        : "Hang up first. You are allowed to end the call, and nothing happens if you do. Nobody legitimate needs you to stay on the line, and no officer will ever ask you to stay on camera.",
      actions: [
        { label: "Check if the officer is real", href: "/verify-officer" },
        ...(scam ? [{ label: `About ${scam.name.toLowerCase()}`, href: `/learn/${scam.slug}` }] : []),
      ],
    };
  }

  if (ASKS_FOR_SECRET.test(text)) {
    return {
      fallback: true,
      text:
        "Never share an OTP, PIN, CVV or password — with anyone, for any reason. An OTP only ever authorises money leaving your account, never money coming back. If you already shared one, block the card in your bank's app and report it now.",
      actions: [{ label: "Report money lost", href: "/freeze" }],
    };
  }

  if (MONEY_GONE.test(text)) {
    return {
      urgent: true,
      fallback: true,
      text: scam
        ? `That sounds like ${scam.name.toLowerCase()}. ${scam.ifYouPaid} Report it now — we ask the banks to hold the money before asking you anything else.`
        : "Report it now, before gathering documents. Stolen money is moved between accounts within minutes, and a hold only catches what has not moved yet. Paste the message your bank sent you and we do the rest.",
      actions: [
        { label: "Report it now", href: "/freeze" },
        ...(scam ? [{ label: `How this scam works`, href: `/learn/${scam.slug}` }] : []),
      ],
    };
  }

  if (scam) {
    return {
      fallback: true,
      text: `That sounds like ${scam.name.toLowerCase()}. ${scam.tell}`,
      actions: [
        { label: `Read the full script`, href: `/learn/${scam.slug}` },
        { label: "Check a UPI ID or number", href: "/scam-check" },
      ],
    };
  }

  return {
    fallback: true,
    text:
      "Tell me what happened in your own words — what they said, and whether any money left your account. If money is already gone, report it first and read afterwards; the first hour decides how much can be held.",
    actions: [
      { label: "Report money lost", href: "/freeze" },
      { label: "Check something before I pay", href: "/scam-check" },
    ],
  };
}

/**
 * True when a reply actually solicits a secret.
 *
 * Negation-aware on purpose. "Never share your OTP" is the single most
 * important sentence this assistant can say, and a naive keyword check both
 * flags it as dangerous and — if used as a guard — throws the good reply away
 * and replaces it with canned text. So we look at what precedes each match
 * and only refuse a genuine instruction to hand a secret over.
 */
export function asksForSecret(text: string): boolean {
  const SECRET = "otp|pin|cvv|password|passcode";
  const ask = new RegExp(
    `(share|send|tell|give|enter|provide|reveal|confirm)\s+(?:me\s+|us\s+)?(?:your\s+|the\s+|an?\s+)?(${SECRET})`,
    "gi",
  );
  const NEGATED = /(never|not|non|don'?t|do not|no one|nobody|avoid|refuse|without)/i;

  for (const m of text.matchAll(ask)) {
    const i = m.index ?? 0;
    const before = text.slice(Math.max(0, i - 34), i);
    if (NEGATED.test(before)) continue;
    return true;
  }

  // Direct solicitation, however politely phrased.
  return new RegExp(`what(?:'s| is) your (${SECRET})`, "i").test(text);
}

/** Pulls links out of a model reply so they can be rendered as buttons. */
export function extractActions(text: string): Action[] {
  const LABELS: Record<string, string> = {
    "/freeze": "Report money lost",
    "/scam-check": "Check a UPI ID or number",
    "/verify-officer": "Verify an officer",
    "/dashboard": "Track a case",
    "/help": "Help",
    "/learn": "Learning Corner",
  };
  const out: Action[] = [];
  for (const m of text.matchAll(/\/(freeze|scam-check|verify-officer|dashboard|help|learn(?:\/[a-z-]+)?)\b/g)) {
    const href = m[0];
    const label =
      LABELS[href] ??
      (href.startsWith("/learn/")
        ? SCAMS.find((s) => `/learn/${s.slug}` === href)?.name ?? "Read more"
        : "Open");
    if (!out.some((a) => a.href === href)) out.push({ label, href });
  }
  return out.slice(0, 2);
}

/** Strips bare paths out of prose once they are rendered as buttons. */
export function stripPaths(text: string): string {
  return text
    .replace(/\s*\(?\/(freeze|scam-check|verify-officer|dashboard|help|learn(?:\/[a-z-]+)?)\)?/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
