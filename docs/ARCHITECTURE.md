# Architecture

How the Sahaay proof of concept is put together, and why.

> **Everything below the UI is mocked**, per the hackathon rules: "Mock the data, the back end, and the accounts." This document describes both the mock (what we build this week) and the production shape it stands in for (what we describe in the video and to officials). Where they differ, both are stated.

---

## 1. Runtime

| | |
|---|---|
| Framework | **Next.js 16.3.2**, App Router |
| React | 19.2.8 |
| Language | TypeScript, strict |
| Styling | **Tailwind CSS v4** (CSS-first config via `@theme`, not `tailwind.config.js`) |
| Deploy | Vercel |
| Node | 24.x local |

> ⚠️ **Next 16 is newer than most training data.** APIs and conventions differ from Next 13–15. Before writing routing, caching, or data-fetching code, read the bundled docs at `node_modules/next/dist/docs/01-app/`. Do not assume `getServerSideProps`, older `fetch` caching defaults, or pre-16 route-handler signatures.
>
> ⚠️ **Tailwind v4 has no `tailwind.config.js`.** Design tokens are declared in `app/globals.css` inside `@theme`. Adding a config file will not do what you expect.

---

## 2. Directory layout

```
app/
├── layout.tsx                 root shell, fonts, i18n provider
├── globals.css                Tailwind v4 @theme — ALL design tokens live here
├── page.tsx                   Screen 1 — "What happened?"
│
├── (report)/                  the victim flow
│   ├── freeze/                Screen 2 — SMS paste + parse + 3 fields
│   ├── receipt/[caseId]/      Screen 3 — live freeze receipt
│   └── complete/[caseId]/     progressive case building (autosave)
│
├── (track)/
│   └── case/[caseId]/         live tracker: timeline, SLA, escalate, money-back
│
├── (lien)/                    THE DIFFERENTIATOR — collateral victim
│   ├── notice/[lienId]/       "₹5,000 held · ₹9,95,000 available"
│   ├── dispute/[lienId]/      2-minute self-service dispute
│   └── noc/[lienId]/          cryptographic NOC + lift confirmation
│
├── (public)/
│   ├── scam-check/            paste a UPI ID / number / URL → risk score
│   └── verify-officer/        anti-digital-arrest verification
│
├── login/                     mock auth; credentials printed on the page
└── api/                       mock route handlers (see §4)

components/
├── ui/                        shadcn primitives
└── domain/                    FreezeReceipt, CaseTimeline, SlaClock, LienCard…

lib/
├── sms-parser.ts              bank SMS → structured transaction  ← the magic moment
├── sla.ts                     countdown + auto-escalation state machine
├── classify.ts                AI intake (OpenAI) + deterministic fallback
├── money.ts                   paise-integer arithmetic + ₹ formatting
└── mock/
    ├── personas.ts            the 4 demo logins
    ├── cases.ts               seeded case states
    ├── banks.ts               institutions + simulated ack latency
    └── clusters.ts            fraud clusters for Scam Check

locales/
├── en.json
└── hi.json
```

**Route-group convention:** parentheses group by *journey*, not by feature. A reader should be able to open `app/(lien)/` and see the entire collateral-victim story in one folder — because that story is the thing the project is arguing for.

---

## 3. Domain model

Five entities. Kept deliberately small.

```
Case ──────┬── Transaction[]      what left, when, by which rail
           ├── FreezeRequest[]    one per institution contacted
           ├── Evidence[]         uploads + parsed metadata
           ├── TimelineEvent[]    append-only; drives the tracker UI
           └── Restoration?       the money-back lane

Lien ──────┬── Case               the originating complaint
           ├── hopDepth           1 = direct beneficiary, 2+ = downstream
           ├── amountPaise        THE POINT: a lien has an amount
           └── Dispute?           ── Documents[] ── NOC?
```

### Key type sketches

```ts
type CaseStatus =
  | 'filed' | 'freezing' | 'routed' | 'assigned'
  | 'investigating' | 'fir_registered' | 'restoring' | 'closed'

type FreezeAck = 'pending' | 'acknowledged' | 'held' | 'partial' | 'moved' | 'failed'

type Lien = {
  id: string
  caseId: string
  accountMask: string        // "XXXX4471" — never a full account number
  amountPaise: number        // the disputed quantum ONLY
  balancePaise: number       // shown to prove the rest stays usable
  hopDepth: number
  confidence: number         // decays with hopDepth
  placedAt: string
  notifiedAt: string | null  // MUST be non-null — see invariant below
}
```

### Invariants worth enforcing in code

1. **Money is integer paise.** Never a float. Format only at the render boundary.
2. **A lien has an amount.** There is no "freeze account" operation in this codebase. That absence is the argument.
3. **Placing a lien emits a notification.** `notifiedAt` is set in the same operation that creates the lien — enforcement and notification are structurally inseparable. This is the fix for the collateral-damage problem, expressed as a type constraint.
4. **Timeline is append-only.** Never mutate a `TimelineEvent`; add a new one. The tracker's credibility comes from the log being a log.
5. **Confidence decays with hop depth.** Past hop 2, default to lien-on-traced-quantum only, never rail suspension.
6. **Account numbers are masked at construction**, not at display. A full account number should never exist in app state.

---

## 4. The mock backend

Route handlers under `app/api/`, backed by seeded JSON in `lib/mock/`. No database.

| Route | Does |
|---|---|
| `POST /api/parse-sms` | Bank SMS → `{ amount, bank, rail, timestamp, counterparty }` |
| `POST /api/cases` | Creates a case, returns id, kicks off the freeze fan-out |
| `GET /api/cases/[id]/freeze-stream` | **SSE** — bank acknowledgements arriving one by one |
| `POST /api/classify` | Free text/voice → category + statute + routing (OpenAI, with fallback) |
| `GET /api/scam-check?q=` | Risk score for a UPI ID / phone / URL |
| `POST /api/liens/[id]/dispute` | Files a dispute, starts the SLA clock |

**Persistence:** Zustand + `localStorage`. A judge who refreshes mid-demo must not lose their case — this is a real scoring risk, not a nicety.

**The SSE freeze stream is the single most important piece of engineering in the project.** It is what makes the difference between "a form that submits" and "a system visibly working for you." Stagger acknowledgements with realistic, slightly irregular latency (banks are not uniform); let one institution return `moved` so the layer-2 fan-out is visible.

### Production shape (what we describe, don't build)

Kafka event bus · Freeze Orchestrator as a saga with per-adapter circuit breakers · Micro-Lien Engine emitting `LienRequested(account, amount, hop, confidence)` · Neo4j for money-trail and mule-cluster detection · Postgres partitioned by `state+month` · per-case KMS keys for evidence. Full treatment in [`PHASE-1-RESEARCH.md`](./PHASE-1-RESEARCH.md) §6.

---

## 5. AI intake

```
user text/voice
      │
      ▼
POST /api/classify ──► OPENAI_API_KEY present? ──yes──► OpenAI ──► validate shape
      │                        │                                        │
      │                        no                              invalid / error / timeout
      │                        ▼                                        │
      └──────────────► deterministic keyword classifier ◄───────────────┘
                                │
                                ▼
              { category, subcategory, sections[], modus, routing }
```

**Rule: the fallback is not a degraded path, it is the default assumption.** The demo must be indistinguishable in shape whether or not the API responds. Timeout at 4 seconds and fall through — a judge will not wait, and an API failure during judging must never be visible.

`OPENAI_API_KEY` lives in `.env.local` (git-ignored) and in Vercel project env vars. It is never committed and never sent to the client.

---

## 6. Internationalisation

Static JSON dictionaries, `en` + `hi` minimum. No i18n library — a `useTranslation` hook over a typed dictionary is enough at this scale and costs nothing in bundle size.

Voice input via the **Web Speech API** (`webkitSpeechRecognition`), which is native in Chrome — the browser judges will use. Feature-detect and hide the mic button where unsupported rather than shipping a broken affordance.

Production path is **Bhashini** for all 22 official languages; say so in the video, don't build it.

---

## 7. Performance budget

| Metric | Budget |
|---|---|
| First-load JS | **< 100 KB** |
| Usable on | Slow 3G |
| CLS | 0 — reserve space for streaming freeze rows |
| Fonts | 2 max, `display: swap`, Devanagari subset |

Server Components by default. `'use client'` only where there is genuine interactivity: the SMS paste box, the freeze stream, the SLA clocks, the dispute form.

The freeze receipt is the one place motion earns real budget. Everything else is static.

---

## 8. Security posture (in a mocked app)

Even mocked, the demo should not model bad practice — officials are watching.

- No real PII anywhere. All personas are fictional; account numbers are masked in the seed data itself.
- The OpenAI key is server-side only; `/api/classify` is the boundary.
- No analytics, no third-party scripts, no external asset hosts.
- A visible disclaimer on every page: **not affiliated with I4C / MHA / cybercrime.gov.in**, no real complaint is filed, and real incidents go to `cybercrime.gov.in` or **1930**. This is an ethical requirement, not a legal formality — a realistic clone of a government reporting portal is exactly the shape of a phishing site, and the project's own research documents lookalike-domain fraud as an active attack pattern.
