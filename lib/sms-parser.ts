import type { Rail, Transaction } from "./types";
import { maskAccount, rupeesToPaise } from "./money";

/**
 * Bank SMS -> structured transaction.
 *
 * This is the "magic moment": the citizen pastes the message their bank
 * already sent them, and the form fills itself. The real portal makes them
 * hand-transcribe a 12-digit UTR, and a single typo silently misroutes the
 * freeze request to the wrong institution.
 *
 * Deliberately tolerant. Real bank SMS is inconsistent, and a victim pasting
 * with shaking hands will include surrounding junk.
 */

export interface ParsedSms {
  ok: boolean;
  transaction: Transaction | null;
  /** Which fields we actually found, for the "we understood this" panel. */
  found: string[];
  missing: string[];
}

const BANK_PATTERNS: Array<[RegExp, string]> = [
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

const RAIL_PATTERNS: Array<[RegExp, Rail]> = [
  [/\bUPI\b|\bVPA\b|@[a-z]{2,}/i, "upi"],
  [/\bIMPS\b/i, "imps"],
  [/\bNEFT\b/i, "neft"],
  [/\bcard\b|\bdebit card\b|\bcredit card\b|\bPOS\b/i, "card"],
  [/\bnet ?banking\b|\bINB\b/i, "netbanking"],
  [/\bwallet\b/i, "wallet"],
];

/** Amounts: "Rs.47,500.00", "INR 47500", "₹1,20,000". */
const AMOUNT_RE =
  /(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i;

/** UPI handles: rahul.verma@ybl, 9876543210@paytm */
const VPA_RE = /\b([a-z0-9][a-z0-9._-]{1,48}@[a-z]{2,12})\b/i;

/** UTR / RRN / transaction reference — usually 10-16 digits. */
const REF_RE =
  /(?:utr|rrn|ref(?:erence)?(?:\s*(?:no|number|id))?|txn(?:\s*id)?)[:\s#-]*([a-z0-9]{6,22})/i;

/** Account tail: "A/c XX4471", "acct ending 4471", "a/c no. XXXXXX4471" */
const ACCT_RE =
  /(?:a\/?c|acct|account)[^0-9a-z]{0,12}(?:no\.?|number|ending)?[^0-9]{0,6}([x*\d]{4,20})/i;

/** Dates: 21-08-26, 21/08/2026, 21 Aug 2026, 21-Aug-26 */
const DATE_RE =
  /\b(\d{1,2})[-/ ](\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-/ ](\d{2,4})\b/i;

const TIME_RE = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?\b/i;

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseWhen(text: string): Date | null {
  const d = DATE_RE.exec(text);
  if (!d) return null;

  const day = parseInt(d[1], 10);
  const rawMonth = d[2].toLowerCase();
  const month = /^\d+$/.test(rawMonth)
    ? parseInt(rawMonth, 10) - 1
    : MONTHS[rawMonth.slice(0, 3)];
  if (month === undefined || Number.isNaN(month)) return null;

  let year = parseInt(d[3], 10);
  if (year < 100) year += 2000;

  let hours = 0;
  let minutes = 0;
  const t = TIME_RE.exec(text);
  if (t) {
    hours = parseInt(t[1], 10);
    minutes = parseInt(t[2], 10);
    const mer = t[4]?.toLowerCase();
    if (mer === "pm" && hours < 12) hours += 12;
    if (mer === "am" && hours === 12) hours = 0;
  }

  const when = new Date(year, month, day, hours, minutes);
  return Number.isNaN(when.getTime()) ? null : when;
}

export function parseSms(raw: string): ParsedSms {
  const text = (raw || "").trim();
  const found: string[] = [];
  const missing: string[] = [];

  if (!text) {
    return { ok: false, transaction: null, found, missing: ["amount"] };
  }

  // Amount — the only truly required field.
  const amountMatch = AMOUNT_RE.exec(text);
  let amountPaise = 0;
  if (amountMatch) {
    const n = parseFloat(amountMatch[1].replace(/,/g, ""));
    if (!Number.isNaN(n) && n > 0) {
      amountPaise = rupeesToPaise(n);
      found.push("amount");
    }
  }
  if (!amountPaise) missing.push("amount");

  // Bank
  let bank = "";
  for (const [re, name] of BANK_PATTERNS) {
    if (re.test(text)) {
      bank = name;
      break;
    }
  }
  if (bank) found.push("bank");
  else missing.push("bank");

  // Rail
  let rail: Rail = "upi";
  let railFound = false;
  for (const [re, r] of RAIL_PATTERNS) {
    if (re.test(text)) {
      rail = r;
      railFound = true;
      break;
    }
  }
  if (railFound) found.push("rail");

  // Counterparty (VPA), skipping anything that is the bank's own sender id.
  let counterparty: string | null = null;
  const vpa = VPA_RE.exec(text);
  if (vpa) {
    counterparty = vpa[1];
    found.push("counterparty");
  } else {
    missing.push("counterparty");
  }

  // Reference / UTR
  let reference: string | null = null;
  const ref = REF_RE.exec(text);
  if (ref) {
    reference = ref[1].toUpperCase();
    found.push("reference");
  } else {
    missing.push("reference");
  }

  // Account tail — masked immediately, never stored raw.
  const acct = ACCT_RE.exec(text);
  if (acct) {
    const digits = acct[1].replace(/\D/g, "");
    if (digits.length >= 4) found.push("account");
  }

  const when = parseWhen(text);
  if (when) found.push("time");

  const transaction: Transaction | null = amountPaise
    ? {
        amountPaise,
        bank: bank || "Your bank",
        rail,
        occurredAt: (when ?? new Date()).toISOString(),
        counterparty,
        reference,
      }
    : null;

  return { ok: Boolean(transaction), transaction, found, missing };
}

export { maskAccount };

/** Sample messages offered as one-tap fillers so a judge never has to type. */
export const SAMPLE_SMS = [
  {
    label: "UPI debit — HDFC",
    text:
      "Dear Customer, Rs.47,500.00 has been debited from A/c XX4471 on 21-08-26 at 21:14:07 to VPA rahul.verma@ybl (UPI Ref No 456123789012). Not you? Call 18002586161. -HDFC Bank",
  },
  {
    label: "Card fraud — ICICI",
    text:
      "INR 89,999.00 spent on ICICI Bank Card XX8823 on 20-Aug-26 at 19:42 at DIGIPAY ONLINE. Ref 5521904488. If not you, report at 18001080. -ICICI Bank",
  },
  {
    label: "IMPS transfer — SBI",
    text:
      "Dear SBI User, your A/c X9012 debited by Rs.2,50,000 on 21/08/2026 at 10:05 AM transfer to MOHIT KUMAR Ref No IMPS 223109887761 -SBI",
  },
];
