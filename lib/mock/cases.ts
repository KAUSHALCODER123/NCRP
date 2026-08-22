import type { Case, Lien, TimelineEvent } from "../types";
import { rupeesToPaise } from "../money";
import { makeSla, SOP } from "../sla";

/**
 * Seeded cases, generated relative to "now" so the SLA clocks are genuinely
 * live when a judge opens them. Hard-coded dates would show a breached case
 * whose deadline passed months ago.
 */

const HOUR = 3600_000;
const DAY = 24 * HOUR;

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

let seq = 0;
function ev(
  offsetMs: number,
  stage: TimelineEvent["stage"],
  title: string,
  tone: TimelineEvent["tone"] = "neutral",
  detail?: string,
): TimelineEvent {
  seq += 1;
  return { id: `ev-${seq}`, at: iso(offsetMs), stage, title, detail, tone };
}

/* ------------------------------------------------------------------ */
/* ramesh@demo — day 4, assigned, SLA running down                     */
/* ------------------------------------------------------------------ */

function rameshCase(): Case {
  const filedAt = -4 * DAY;
  return {
    id: "SHY-2026-08-3312",
    ownerEmail: "ramesh@demo",
    kind: "financial",
    status: "investigating",
    filedAt: iso(filedAt),
    transaction: {
      amountPaise: rupeesToPaise(184_000),
      bank: "ICICI Bank",
      rail: "card",
      occurredAt: iso(filedAt - 40 * 60_000),
      counterparty: "DIGIPAY ONLINE",
      reference: "5521904488",
    },
    narrative:
      "I received a call saying my credit card had a fraudulent transaction. They asked me to confirm an OTP to reverse it. Within a minute ₹1,84,000 was gone.",
    classification: {
      category: "Financial Fraud",
      subcategory: "Card Fraud / OTP Compromise",
      sections: ["BNS 318(4)", "IT Act s.66D"],
      modus: "Vishing — impersonated bank fraud desk, harvested OTP",
      routedTo: "Cyber PS, Chennai City",
      fallback: false,
    },
    freezes: [
      {
        institutionId: "icici",
        institutionName: "ICICI Bank",
        role: "debit",
        ack: "acknowledged",
        heldPaise: 0,
        requestedAt: iso(filedAt + 20_000),
        respondedAt: iso(filedAt + 32_000),
      },
      {
        institutionId: "yesbank",
        institutionName: "Yes Bank",
        role: "beneficiary",
        ack: "held",
        heldPaise: rupeesToPaise(121_500),
        requestedAt: iso(filedAt + 20_000),
        respondedAt: iso(filedAt + 51_000),
      },
      {
        institutionId: "paytm",
        institutionName: "Paytm Payments Bank",
        role: "layer2",
        ack: "moved",
        heldPaise: 0,
        requestedAt: iso(filedAt + 60_000),
        respondedAt: iso(filedAt + 96_000),
        exitTrail: { to: "Wallet ending 7781", rail: "wallet" },
      },
    ],
    evidence: [
      { id: "e1", label: "Bank SMS", kind: "screenshot", addedAt: iso(filedAt + 3 * 60_000) },
      { id: "e2", label: "Call log — 9142207781", kind: "call_log", addedAt: iso(filedAt + 6 * 60_000) },
      { id: "e3", label: "Card statement (Aug)", kind: "statement", addedAt: iso(filedAt + 2 * HOUR) },
    ],
    timeline: [
      ev(filedAt, "filed", "Complaint filed", "neutral", "Acknowledgement SHY-2026-08-3312"),
      ev(filedAt + 51_000, "freezing", "₹1,21,500 held at Yes Bank", "held", "Beneficiary account frozen for the disputed amount"),
      ev(filedAt + 96_000, "freezing", "Money had already moved from Paytm wallet", "breach", "Exit trail shared — layer-2 trace opened automatically"),
      ev(filedAt + 6 * HOUR, "routed", "Routed to Cyber PS, Chennai City", "neutral", "Jurisdiction derived from the money trail — you were not asked to choose"),
      ev(filedAt + 2 * DAY, "assigned", "Assigned to Inspector, Cyber PS Chennai City", "neutral"),
      ev(filedAt + 3 * DAY, "investigating", "Investigating officer requested wallet KYC from Paytm", "neutral"),
    ],
    restoration: {
      status: "auto_filed",
      autoFiled: true,
      filedAt: iso(filedAt + 2 * DAY),
      creditedPaise: 0,
      sla: makeSla(
        "Money restoration decision",
        SOP.IO_DECISION_HOURS,
        "Investigating Officer, Cyber PS Chennai City",
        "District Grievance Officer",
        iso(filedAt + 2 * DAY),
      ),
    },
    clusterId: "CL-6042",
    assignedOwner: "Inspector, Cyber PS Chennai City",
    firNumber: null,
    // Deliberately ~78% elapsed so it reads amber the moment a judge opens it.
    sla: makeSla(
      "FIR decision",
      SOP.AUTO_ESCALATE_HOURS,
      "Inspector, Cyber PS Chennai City",
      "District Grievance Officer",
      iso(filedAt - 7.7 * DAY),
    ),
    reportedWithinRbiWindow: true,
  };
}

/* ------------------------------------------------------------------ */
/* anjali@demo — the complete journey, money actually returned          */
/* ------------------------------------------------------------------ */

function anjaliCase(): Case {
  const filedAt = -46 * DAY;
  const credited = rupeesToPaise(62_000);
  return {
    id: "SHY-2026-07-1180",
    ownerEmail: "anjali@demo",
    kind: "financial",
    status: "closed",
    filedAt: iso(filedAt),
    transaction: {
      amountPaise: rupeesToPaise(62_000),
      bank: "Axis Bank",
      rail: "upi",
      occurredAt: iso(filedAt - 12 * 60_000),
      counterparty: "quickloan.support@okaxis",
      reference: "441209887761",
    },
    narrative:
      "A loan app I had installed locked my photos and demanded money. I paid ₹62,000 over UPI before I realised it was extortion.",
    classification: {
      category: "Financial Fraud",
      subcategory: "Loan App Extortion",
      sections: ["BNS 308(2)", "IT Act s.66E"],
      modus: "Predatory lending app — contact-list scraping and coercion",
      routedTo: "Cyber PS, Pune City",
      fallback: false,
    },
    freezes: [
      {
        institutionId: "axis",
        institutionName: "Axis Bank",
        role: "debit",
        ack: "acknowledged",
        heldPaise: 0,
        requestedAt: iso(filedAt + 18_000),
        respondedAt: iso(filedAt + 29_000),
      },
      {
        institutionId: "kotak",
        institutionName: "Kotak Mahindra Bank",
        role: "beneficiary",
        ack: "held",
        heldPaise: credited,
        requestedAt: iso(filedAt + 18_000),
        respondedAt: iso(filedAt + 44_000),
      },
    ],
    evidence: [
      { id: "e1", label: "UPI receipt", kind: "screenshot", addedAt: iso(filedAt + 4 * 60_000) },
      { id: "e2", label: "Threat messages", kind: "chat", addedAt: iso(filedAt + 9 * 60_000) },
    ],
    timeline: [
      ev(filedAt, "filed", "Complaint filed", "neutral"),
      ev(filedAt + 44_000, "freezing", "₹62,000 held at Kotak Mahindra Bank", "held", "Full amount secured in 44 seconds"),
      ev(filedAt + 5 * HOUR, "routed", "Routed to Cyber PS, Pune City", "neutral"),
      ev(filedAt + 1 * DAY, "assigned", "Assigned to Sub-Inspector, Cyber PS Pune City", "neutral"),
      ev(filedAt + 3 * DAY, "fir_registered", "FIR 0214/2026 registered", "neutral", "Cluster CL-7730 — filed jointly for 62 victims"),
      ev(filedAt + 4 * DAY, "restoring", "Restoration application filed for you", "neutral", "You did not have to know this step existed"),
      ev(filedAt + 21 * DAY, "restoring", "Suspect did not contest within 15 days", "neutral"),
      ev(filedAt + 26 * DAY, "restoring", "Approved by DCP — notice issued to bank under s.106(3) BNSS", "neutral"),
      ev(filedAt + 33 * DAY, "closed", "₹62,000 credited back to your account", "held", "Case closed"),
    ],
    restoration: {
      status: "credited",
      autoFiled: true,
      filedAt: iso(filedAt + 4 * DAY),
      creditedPaise: credited,
      sla: {
        ...makeSla(
          "Money restoration decision",
          SOP.IO_DECISION_HOURS,
          "Investigating Officer, Cyber PS Pune City",
          "District Grievance Officer",
          iso(filedAt + 4 * DAY),
        ),
        metAt: iso(filedAt + 26 * DAY),
      },
    },
    clusterId: "CL-7730",
    assignedOwner: "Sub-Inspector, Cyber PS Pune City",
    firNumber: "0214/2026",
    sla: null,
    reportedWithinRbiWindow: true,
  };
}

/* ------------------------------------------------------------------ */
/* The originating case behind Suresh's lien                            */
/* ------------------------------------------------------------------ */

function originCase(): Case {
  const filedAt = -6 * DAY;
  return {
    id: "SHY-2026-08-2904",
    ownerEmail: "system@demo",
    kind: "financial",
    status: "investigating",
    filedAt: iso(filedAt),
    transaction: {
      amountPaise: rupeesToPaise(320_000),
      bank: "HDFC Bank",
      rail: "upi",
      occurredAt: iso(filedAt - 20 * 60_000),
      counterparty: "rahul.verma@ybl",
      reference: "456123789012",
    },
    narrative: "Digital arrest scam — victim coerced into transferring funds.",
    classification: null,
    freezes: [],
    evidence: [],
    timeline: [ev(filedAt, "filed", "Complaint filed", "neutral")],
    restoration: {
      status: "not_started",
      autoFiled: false,
      filedAt: null,
      creditedPaise: 0,
    },
    clusterId: "CL-8821",
    assignedOwner: "Inspector, Cyber PS Pune City",
    firNumber: null,
    sla: null,
    reportedWithinRbiWindow: true,
  };
}

/* ------------------------------------------------------------------ */
/* suresh@demo — THE DIFFERENTIATOR                                    */
/*                                                                     */
/* Suresh did nothing wrong. He sold a phone and was paid ₹5,000 by     */
/* someone who, three hops upstream, had been paid with stolen money.   */
/*                                                                     */
/* Under the real system his ENTIRE account would be frozen — all       */
/* ₹9,95,000 of working capital — with no notification, and he would    */
/* travel to another state to get it back over several months.          */
/*                                                                     */
/* Here: ₹5,000 held, the rest usable, notified in the same second.     */
/* ------------------------------------------------------------------ */

function sureshLien(): Lien {
  const placedAt = -2 * DAY;
  return {
    id: "LN-2026-08-7741",
    caseId: "SHY-2026-08-2904",
    ownerEmail: "suresh@demo",
    holderName: "Suresh Pillai",
    institutionName: "Kotak Mahindra Bank",
    accountMask: "XXXX4471",
    amountPaise: rupeesToPaise(5_000),
    balancePaise: rupeesToPaise(995_000),
    hopDepth: 3,
    confidence: 0.21,
    reason:
      "A payment you received has been traced, three transfers back, to funds reported stolen in case SHY-2026-08-2904.",
    placedAt: iso(placedAt),
    // Never null. Set in the same operation that placed the lien.
    notifiedAt: iso(placedAt),
    dispute: null,
    liftedAt: null,
  };
}

/* ------------------------------------------------------------------ */

export function seedCases(): Case[] {
  seq = 0;
  return [rameshCase(), anjaliCase(), originCase()];
}

export function seedLiens(): Lien[] {
  return [sureshLien()];
}
