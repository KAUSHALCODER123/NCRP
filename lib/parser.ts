/**
 * Entity extraction from bank SMS, payment receipts and screenshots.
 *
 * Runs on text — either pasted directly, or returned by the vision pass for
 * an uploaded image. Context keywords carry most of the weight: a screenshot
 * routinely contains several 12-digit numbers, and the surrounding label is
 * the only thing that distinguishes a UPI reference from an order ID.
 *
 * Where two candidates are plausible we do NOT guess. A wrong reference fails
 * silently at the bank gateway while the citizen believes their money is being
 * held — so ambiguity is surfaced as a choice, never resolved by confidence.
 */

export interface Candidate {
  value: string;
  /** The label found next to it, e.g. "UPI Transaction ID". */
  context: string | null;
  /** Higher wins. Recommendation only — never auto-resolves ambiguity. */
  weight: number;
}

export interface ParseResult {
  amountRupees: number | null;
  bank: string | null;
  counterparty: string | null;
  beneficiaryAccount: string | null;
  occurredAt: string | null;
  utrCandidates: Candidate[];
  /** Areas masked before archiving (e.g. remaining balance). */
  masked: string[];
}

/* Context keywords, per the extraction spec. */
const UTR_KEYS = [
  "upi ref",
  "upi transaction id",
  "upi txn",
  "ref no",
  "reference no",
  "utr",
  "txn id",
  "transaction id",
  "imps ref",
  "rrn",
];

const AMOUNT_KEYS = [
  "debited",
  "sent to",
  "paid to",
  "transfer of",
  "deducted",
  "spent",
  "withdrawn",
];

/** Labels that look like a UTR but are not one. */
const DECOY_KEYS = [
  "google transaction id",
  "order id",
  "merchant",
  "customer id",
  "invoice",
  "bill",
];

const BANKS: Array<[RegExp, string]> = [
  [/\bHDFC\b/i, "HDFC Bank"],
  [/\bICICI\b/i, "ICICI Bank"],
  [/\bSBI\b|\bState Bank\b/i, "State Bank of India"],
  [/\bAXIS\b/i, "Axis Bank"],
  [/\bKOTAK\b/i, "Kotak Mahindra Bank"],
  [/\bPNB\b|Punjab National/i, "Punjab National Bank"],
  [/\bBOB\b|Bank of Baroda/i, "Bank of Baroda"],
  [/\bYES BANK\b/i, "Yes Bank"],
  [/\bIDFC\b/i, "IDFC First Bank"],
  [/\bCanara\b/i, "Canara Bank"],
  [/\bUnion Bank\b/i, "Union Bank of India"],
  [/\bPaytm\b/i, "Paytm Payments Bank"],
  [/\bPhonePe\b/i, "PhonePe"],
  [/\bGoogle ?Pay\b|\bGPay\b/i, "Google Pay"],
];

/** Payment app branding — used to offer app-specific "where to find it" help. */
export const APP_BRANDS: Array<[RegExp, string]> = [
  [/\bPhonePe\b/i, "PhonePe"],
  [/\bGoogle ?Pay\b|\bGPay\b/i, "GPay"],
  [/\bPaytm\b/i, "Paytm"],
  [/\bYONO\b/i, "SBI YONO"],
  [/\bHDFC\b/i, "HDFC NetBanking"],
];

/** Text immediately before a match, for context labelling. */
function contextBefore(text: string, index: number, span = 44): string {
  return text.slice(Math.max(0, index - span), index).toLowerCase();
}

function labelFor(ctx: string): { context: string | null; weight: number } {
  for (const k of UTR_KEYS) {
    if (ctx.includes(k)) {
      return { context: titleCase(k), weight: 10 };
    }
  }
  for (const k of DECOY_KEYS) {
    if (ctx.includes(k)) return { context: titleCase(k), weight: -5 };
  }
  return { context: null, weight: 0 };
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseEvidenceText(raw: string): ParseResult {
  const text = raw || "";
  const lower = text.toLowerCase();
  const masked: string[] = [];

  /* ---- Amount ---------------------------------------------------- */
  let amountRupees: number | null = null;
  let best = -1;
  const amountRe = /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{2})?)/gi;
  for (const m of text.matchAll(amountRe)) {
    const n = parseFloat(m[1].replace(/,/g, ""));
    if (Number.isNaN(n) || n <= 0) continue;
    const ctx = contextBefore(text, m.index ?? 0);

    // "Avl bal" / "balance" is the citizen's remaining money, not the loss.
    // We never treat it as the amount, and we mask it before archiving.
    if (/bal|balance|available/.test(ctx)) {
      masked.push("Account balance");
      continue;
    }
    const weight = AMOUNT_KEYS.some((k) => ctx.includes(k)) ? 10 : 1;
    if (weight > best) {
      best = weight;
      amountRupees = n;
    }
  }

  /* ---- UTR candidates -------------------------------------------- */
  const seen = new Map<string, Candidate>();
  const add = (value: string, index: number, baseWeight: number) => {
    const { context, weight } = labelFor(contextBefore(text, index));
    const existing = seen.get(value);
    const total = baseWeight + weight;
    if (!existing || total > existing.weight) {
      seen.set(value, { value, context, weight: total });
    }
  };

  for (const m of text.matchAll(/\b\d{12}\b/g)) add(m[0], m.index ?? 0, 6);
  for (const m of text.matchAll(/\b[A-Za-z]{4}[A-Za-z0-9]{8,18}\b/g))
    add(m[0].toUpperCase(), m.index ?? 0, 4);
  for (const m of text.matchAll(/\b[A-Za-z0-9]{12,22}\b/g)) {
    if (/^\d+$/.test(m[0]) && m[0].length === 12) continue;
    add(m[0].toUpperCase(), m.index ?? 0, 2);
  }

  const utrCandidates = [...seen.values()]
    .filter((c) => c.weight > -5)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  /* ---- Bank ------------------------------------------------------- */
  let bank: string | null = null;
  for (const [re, name] of BANKS) {
    if (re.test(text)) {
      bank = name;
      break;
    }
  }

  /* ---- Suspect VPA ------------------------------------------------ */
  let counterparty: string | null = null;
  const vpa = /\b([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64})\b/.exec(text);
  if (vpa) counterparty = vpa[1];

  /* ---- Beneficiary account (masked on sight) ---------------------- */
  let beneficiaryAccount: string | null = null;
  const acct =
    /(?:a\/?c|acct|account)[^0-9a-z]{0,14}(?:ending|no\.?|number)?[^0-9x*]{0,6}([x*\d]{4,18})/i.exec(
      text,
    );
  if (acct) {
    const digits = acct[1].replace(/\D/g, "");
    if (digits.length >= 4) beneficiaryAccount = `XXXX${digits.slice(-4)}`;
  }

  /* ---- Timestamp -------------------------------------------------- */
  let occurredAt: string | null = null;
  const dm =
    /\b(\d{1,2})[-/.](\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-/.](\d{2,4})\b/i.exec(
      text,
    );
  if (dm) {
    const day = parseInt(dm[1], 10);
    const rawM = dm[2].toLowerCase();
    const month = /^\d+$/.test(rawM)
      ? parseInt(rawM, 10) - 1
      : MONTHS[rawM.slice(0, 3)];
    let year = parseInt(dm[3], 10);
    if (year < 100) year += 2000;

    let h = 0;
    let mi = 0;
    const tm = /\b(\d{1,2}):(\d{2})(?::\d{2})?\s*([APap][Mm])?\b/.exec(text);
    if (tm) {
      h = parseInt(tm[1], 10);
      mi = parseInt(tm[2], 10);
      const mer = tm[3]?.toLowerCase();
      if (mer === "pm" && h < 12) h += 12;
      if (mer === "am" && h === 12) h = 0;
    }
    if (month !== undefined && !Number.isNaN(month)) {
      const d = new Date(year, month, day, h, mi);
      if (!Number.isNaN(d.getTime())) occurredAt = d.toISOString();
    }
  }

  if (/bal|balance/.test(lower) && !masked.includes("Account balance")) {
    masked.push("Account balance");
  }

  return {
    amountRupees,
    bank,
    counterparty,
    beneficiaryAccount,
    occurredAt,
    utrCandidates,
    masked,
  };
}

/** Detects which payment app a screenshot came from, for targeted help. */
export function detectApp(text: string): string | null {
  for (const [re, name] of APP_BRANDS) if (re.test(text)) return name;
  return null;
}

/** Where the UTR hides in each app — shown when branding is found but no UTR. */
export const WHERE_IS_UTR: Record<string, string> = {
  PhonePe:
    "Open the payment, tap “View Details” or “Transfer Details” at the bottom, then screenshot again — the 12-digit UTR appears there.",
  GPay: "Tap the payment, scroll to the bottom and look for “UPI transaction ID” — it's 12 digits.",
  Paytm:
    "Open the transaction, tap “View Details”, and copy the “UPI Ref No” — not the Order ID above it.",
  "SBI YONO":
    "Go to Transaction History, tap the entry, and use the “Reference Number” field.",
  "HDFC NetBanking":
    "In Account Statement, expand the row — the reference is in the Narration column.",
};
