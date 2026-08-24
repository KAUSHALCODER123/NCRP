/**
 * Domain model for Sahaay.
 *
 * Invariants enforced here by construction (see AGENTS.md):
 *  - Money is integer paise. Never a float.
 *  - There is no "freeze account" operation. Only a lien, which HAS an amount.
 *  - A lien carries `notifiedAt`. Enforcement and notification are inseparable.
 *  - Timelines are append-only.
 *  - Account numbers are masked at construction, never at display.
 */

export type Paise = number;

/** Payment rail the money left by. */
export type Rail = "upi" | "card" | "netbanking" | "wallet" | "imps" | "neft";

export type CaseStatus =
  | "filed"
  | "freezing"
  | "routed"
  | "assigned"
  | "investigating"
  | "fir_registered"
  | "restoring"
  | "closed";

export type CaseKind =
  | "financial"
  | "harassment"
  | "impersonation"
  | "account_hacked"
  | "other";

/** Per-institution response to a freeze request. */
export type FreezeAck =
  | "pending"
  | "acknowledged"
  | "held"
  | "partial"
  | "moved"
  | "failed";

export interface Institution {
  id: string;
  name: string;
  kind: "bank" | "wallet" | "psp" | "merchant";
  /** Simulated acknowledgement latency window, ms. Banks are not uniform. */
  latency: [number, number];
}

export interface FreezeRequest {
  institutionId: string;
  institutionName: string;
  role: "debit" | "beneficiary" | "layer2";
  ack: FreezeAck;
  heldPaise: Paise;
  requestedAt: string;
  respondedAt: string | null;
  /** Populated when ack === "moved": where the money went next. */
  exitTrail?: { to: string; rail: Rail };
}

export interface Transaction {
  amountPaise: Paise;
  bank: string;
  rail: Rail;
  occurredAt: string;
  counterparty: string | null;
  reference: string | null;
}

export interface Evidence {
  id: string;
  label: string;
  kind: "screenshot" | "statement" | "chat" | "call_log" | "invoice" | "other";
  addedAt: string;
}

export interface TimelineEvent {
  id: string;
  at: string;
  /** Stage this event belongs to, for the tracker rail. */
  stage: CaseStatus | "lien" | "dispute";
  title: string;
  detail?: string;
  tone: "neutral" | "held" | "pending" | "breach";
}

/** An SLA promise with a running clock. Never a suggestion. */
export interface Sla {
  label: string;
  startedAt: string;
  /** Duration in hours, from the April 2026 MHA SOP where applicable. */
  hours: number;
  /** Set when the obligation was met. */
  metAt: string | null;
  /** Who owes this, by designation. Citizens never see personal names. */
  owner: string;
  escalatesTo: string;
}

export interface Restoration {
  status: "not_started" | "auto_filed" | "verifying" | "approved" | "credited";
  /** Sahaay files this FOR the victim. The real portal makes them initiate it. */
  autoFiled: boolean;
  filedAt: string | null;
  creditedPaise: Paise;
  sla?: Sla;
}

export interface Classification {
  category: string;
  subcategory: string;
  sections: string[];
  modus: string;
  routedTo: string;
  /** True when produced by the deterministic fallback rather than the model. */
  fallback: boolean;
}

export interface Case {
  id: string;
  ownerEmail: string;
  kind: CaseKind;
  status: CaseStatus;
  filedAt: string;
  transaction: Transaction | null;
  narrative: string;
  classification: Classification | null;
  freezes: FreezeRequest[];
  evidence: Evidence[];
  timeline: TimelineEvent[];
  restoration: Restoration;
  /** Other complaints against the same counterparty. Turns 213 cases into 1. */
  clusterId: string | null;
  assignedOwner: string | null;
  firNumber: string | null;
  sla: Sla | null;
  /** Signed intake timestamp — proof of reporting inside RBI's 3-day window. */
  reportedWithinRbiWindow: boolean;
}

/**
 * The minimum receipt needed to reopen an anonymous non-financial report.
 * It deliberately excludes the identifier, narrative, evidence and identity.
 */
export interface AnonymousClaim {
  token: string;
  caseId: string;
  kind: "harassment" | "impersonation" | "account" | "other";
  situation: string;
  filedAt: string;
  noticeTargets: string[];
}

/* ------------------------------------------------------------------ */
/* The collateral victim — the part of the system nobody counts        */
/* ------------------------------------------------------------------ */

export type DisputeStatus =
  | "none"
  | "submitted"
  | "bank_review"
  | "io_review"
  | "approved"
  | "rejected"
  | "escalated";

export interface Dispute {
  id: string;
  lienId: string;
  status: DisputeStatus;
  submittedAt: string;
  documents: Evidence[];
  /** AI-generated one-screen summary handed to the IO instead of a PDF folder. */
  triageSummary: string | null;
  bankSla: Sla;
  ioSla: Sla | null;
  timeline: TimelineEvent[];
  noc: Noc | null;
}

/** Digitally signed No Objection Certificate. Lifts the lien via bank API. */
export interface Noc {
  id: string;
  issuedAt: string;
  issuedBy: string;
  signature: string;
  liftedAt: string | null;
}

export interface Lien {
  id: string;
  caseId: string;
  ownerEmail: string;
  holderName: string;
  institutionName: string;
  /** Masked at construction. A full account number never exists in app state. */
  accountMask: string;
  /** THE POINT: a lien has an amount. The rest of the balance stays usable. */
  amountPaise: Paise;
  balancePaise: Paise;
  /** 1 = direct beneficiary, 2+ = downstream. Confidence decays with depth. */
  hopDepth: number;
  confidence: number;
  reason: string;
  placedAt: string;
  /**
   * Never null. Set in the same operation that creates the lien —
   * enforcement without notification is the bug this project exists to fix.
   */
  notifiedAt: string;
  dispute: Dispute | null;
  liftedAt: string | null;
}

export interface Persona {
  email: string;
  name: string;
  role: "victim" | "merchant";
  blurb: string;
  demonstrates: string;
}

export interface ClusterHit {
  identifier: string;
  kind: "upi" | "phone" | "url" | "account";
  reports: number;
  totalReportedPaise: Paise;
  firstReportedAt: string;
  clusterId: string;
  risk: "high" | "medium" | "low" | "unknown";
}
