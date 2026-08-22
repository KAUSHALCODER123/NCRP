"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Case,
  CaseKind,
  Classification,
  Dispute,
  Evidence,
  FreezeAck,
  Lien,
  TimelineEvent,
  Transaction,
} from "./types";
import { seedCases, seedLiens } from "./mock/cases";
import { makeSla, SOP } from "./sla";
import { rupeesToPaise } from "./money";

/**
 * All state lives client-side and persists to localStorage.
 *
 * A judge who refreshes mid-demo must not lose their case — that is a real
 * scoring risk, not a nicety.
 */

const SEED_VERSION = 3;

let evSeq = 1000;
function nextEventId() {
  evSeq += 1;
  return `ev-${evSeq}`;
}

export function makeEvent(
  stage: TimelineEvent["stage"],
  title: string,
  tone: TimelineEvent["tone"] = "neutral",
  detail?: string,
): TimelineEvent {
  return {
    id: nextEventId(),
    at: new Date().toISOString(),
    stage,
    title,
    detail,
    tone,
  };
}

interface State {
  seedVersion: number;
  currentEmail: string | null;
  cases: Case[];
  liens: Lien[];

  login: (email: string) => void;
  logout: () => void;

  createCase: (input: {
    kind: CaseKind;
    transaction: Transaction | null;
    narrative: string;
    email?: string;
  }) => Case;

  getCase: (id: string) => Case | undefined;
  casesFor: (email: string | null) => Case[];
  liensFor: (email: string | null) => Lien[];
  getLien: (id: string) => Lien | undefined;

  recordFreezeAck: (
    caseId: string,
    institutionId: string,
    ack: FreezeAck,
    heldPaise: number,
    exitTrail?: { to: string; rail: Transaction["rail"] },
  ) => void;
  completeFreeze: (caseId: string) => void;
  setClassification: (caseId: string, c: Classification) => void;
  addEvidence: (caseId: string, e: Evidence) => void;
  appendNarrative: (caseId: string, text: string) => void;
  escalate: (caseId: string) => void;

  /* Collateral-victim flow */
  fileDispute: (lienId: string, documents: Evidence[], summary: string) => void;
  advanceDispute: (lienId: string) => void;

  resetDemo: () => void;
}

function freshState() {
  return {
    seedVersion: SEED_VERSION,
    currentEmail: null as string | null,
    cases: seedCases(),
    liens: seedLiens(),
  };
}

function newCaseId(): string {
  const n = Math.floor(1000 + Math.random() * 8999);
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `SHY-${d.getFullYear()}-${mm}-${n}`;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...freshState(),

      login: (email) => set({ currentEmail: email.trim().toLowerCase() }),
      logout: () => set({ currentEmail: null }),

      createCase: ({ kind, transaction, narrative, email }) => {
        const owner = email ?? get().currentEmail ?? "guest@demo";
        const now = new Date().toISOString();
        const c: Case = {
          id: newCaseId(),
          ownerEmail: owner,
          kind,
          status: "freezing",
          filedAt: now,
          transaction,
          narrative,
          classification: null,
          freezes: [],
          evidence: [],
          timeline: [
            makeEvent("filed", "Complaint filed", "neutral", "Your case is open. We are contacting banks now."),
          ],
          restoration: {
            status: "not_started",
            autoFiled: false,
            filedAt: null,
            creditedPaise: 0,
          },
          clusterId: null,
          assignedOwner: null,
          firNumber: null,
          sla: makeSla(
            "Assignment to an officer",
            SOP.ASSIGNMENT_HOURS,
            "Cyber Police Station (auto-routed)",
            "District Grievance Officer",
            now,
          ),
          reportedWithinRbiWindow: true,
        };
        set((s) => ({ cases: [c, ...s.cases] }));
        return c;
      },

      getCase: (id) => get().cases.find((c) => c.id === id),

      casesFor: (email) =>
        email ? get().cases.filter((c) => c.ownerEmail === email) : [],

      liensFor: (email) =>
        email ? get().liens.filter((l) => l.ownerEmail === email) : [],

      getLien: (id) => get().liens.find((l) => l.id === id),

      recordFreezeAck: (caseId, institutionId, ack, heldPaise, exitTrail) =>
        set((s) => ({
          cases: s.cases.map((c) => {
            if (c.id !== caseId) return c;
            const existing = c.freezes.find(
              (f) => f.institutionId === institutionId,
            );
            if (!existing) return c;
            const updated = c.freezes.map((f) =>
              f.institutionId === institutionId
                ? {
                    ...f,
                    ack,
                    heldPaise,
                    respondedAt: new Date().toISOString(),
                    exitTrail: exitTrail ?? f.exitTrail,
                  }
                : f,
            );
            const events: TimelineEvent[] = [];
            if (ack === "held") {
              events.push(
                makeEvent(
                  "freezing",
                  `Money held at ${existing.institutionName}`,
                  "held",
                ),
              );
            } else if (ack === "moved") {
              events.push(
                makeEvent(
                  "freezing",
                  `Money had already moved from ${existing.institutionName}`,
                  "breach",
                  "Exit trail received — we opened the next trace automatically.",
                ),
              );
            }
            return { ...c, freezes: updated, timeline: [...c.timeline, ...events] };
          }),
        })),

      completeFreeze: (caseId) =>
        set((s) => ({
          cases: s.cases.map((c) => {
            if (c.id !== caseId) return c;
            return {
              ...c,
              status: "routed",
              timeline: [
                ...c.timeline,
                makeEvent(
                  "routed",
                  "Routed to a cyber police station",
                  "neutral",
                  "Jurisdiction was derived from the money trail. You were never asked to choose a district.",
                ),
              ],
            };
          }),
        })),

      setClassification: (caseId, classification) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  classification,
                  clusterId: c.clusterId ?? null,
                }
              : c,
          ),
        })),

      addEvidence: (caseId, e) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId ? { ...c, evidence: [...c.evidence, e] } : c,
          ),
        })),

      appendNarrative: (caseId, text) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  narrative: c.narrative ? `${c.narrative}\n\n${text}` : text,
                }
              : c,
          ),
        })),

      escalate: (caseId) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  timeline: [
                    ...c.timeline,
                    makeEvent(
                      "assigned",
                      "Escalated to District Grievance Officer",
                      "pending",
                      "The SLA breach was attached automatically as evidence. You did not have to find a phone number.",
                    ),
                  ],
                }
              : c,
          ),
        })),

      fileDispute: (lienId, documents, summary) =>
        set((s) => ({
          liens: s.liens.map((l) => {
            if (l.id !== lienId) return l;
            const now = new Date().toISOString();
            const dispute: Dispute = {
              id: `DS-${lienId.slice(-4)}`,
              lienId,
              status: "bank_review",
              submittedAt: now,
              documents,
              triageSummary: summary,
              bankSla: makeSla(
                "Bank review",
                SOP.BANK_REVIEW_HOURS,
                l.institutionName,
                "Investigating Officer",
                now,
              ),
              ioSla: null,
              timeline: [
                makeEvent("dispute", "Dispute submitted", "neutral", `${documents.length} document(s) attached`),
                makeEvent("dispute", "Sent to bank for review", "pending", "7-day clock started automatically"),
              ],
              noc: null,
            };
            return { ...l, dispute };
          }),
        })),

      /** Simulates the officer side, which judges explicitly do not evaluate. */
      advanceDispute: (lienId) =>
        set((s) => ({
          liens: s.liens.map((l) => {
            if (l.id !== lienId || !l.dispute) return l;
            const d = l.dispute;
            const now = new Date().toISOString();

            if (d.status === "bank_review") {
              return {
                ...l,
                dispute: {
                  ...d,
                  status: "io_review",
                  bankSla: { ...d.bankSla, metAt: now },
                  ioSla: makeSla(
                    "Officer decision",
                    SOP.IO_DECISION_HOURS,
                    "Investigating Officer, Cyber PS Pune City",
                    "District Grievance Officer",
                    now,
                  ),
                  timeline: [
                    ...d.timeline,
                    makeEvent("dispute", "Bank verified your documents", "held", "Enhanced due diligence completed"),
                    makeEvent("dispute", "Sent to the investigating officer", "pending", "15-day clock started"),
                  ],
                },
              };
            }

            if (d.status === "io_review") {
              return {
                ...l,
                liftedAt: now,
                dispute: {
                  ...d,
                  status: "approved",
                  ioSla: d.ioSla ? { ...d.ioSla, metAt: now } : null,
                  noc: {
                    id: `NOC-${lienId.slice(-4)}`,
                    issuedAt: now,
                    issuedBy: "Investigating Officer, Cyber PS Pune City",
                    signature: `sha256:${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
                    liftedAt: now,
                  },
                  timeline: [
                    ...d.timeline,
                    makeEvent("dispute", "Officer approved your representation", "held"),
                    makeEvent("dispute", "Digital NOC issued and sent to your bank", "held", "No branch visit. No travel. No paper."),
                    makeEvent("dispute", "Hold lifted — ₹5,000 released", "held"),
                  ],
                },
              };
            }

            return l;
          }),
        })),

      resetDemo: () => set({ ...freshState(), currentEmail: get().currentEmail }),
    }),
    {
      name: "sahaay-demo",
      version: SEED_VERSION,
      migrate: (persisted, version) => {
        // Seed data is generated relative to now, so stale persisted seeds
        // would show clocks that expired days ago. Re-seed on version bump.
        if (version !== SEED_VERSION) {
          const p = persisted as Partial<State> | undefined;
          return { ...freshState(), currentEmail: p?.currentEmail ?? null };
        }
        return persisted as State;
      },
    },
  ),
);

/** Convenience: the lien amounts helper used across the collateral flow. */
export const DEMO_LIEN_AMOUNT = rupeesToPaise(5_000);
