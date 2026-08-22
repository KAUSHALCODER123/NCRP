# Sahaay

**Reimagining India's National Cyber Crime Reporting Portal (NCRP).**

Built for [Build What Moves India](https://buildwhatmovesindia.com/) — a hackathon asking builders to rethink public service platforms from the point of view of an everyday citizen.

---

## The problem, in three numbers

| | |
|---|---|
| **2.18%** | Of the money reported stolen to India's cyber-fraud system, roughly ₹7,647 cr of ₹52,969 cr was frozen — but only ~₹167 cr was actually **returned to victims** |
| **1.4%** | Share of cybercrime complaints that became an FIR in 2025, down from ~5% in 2022 |
| **28.15 lakh** | Complaints filed in 2025, up from 4.52 lakh in 2022 |

The system freezes money well and returns it catastrophically. Meanwhile the reporting flow itself spends a victim's most valuable minutes — the "golden hour", when funds can still be intercepted — on a form that rejects the very characters a UPI ID is made of.

## Two inversions

**1. Freeze first, ask later.**
Today: register → OTP → pick a category → fill a long form → upload ID → *then* a freeze request goes out.
Sahaay: paste the bank SMS → freeze request dispatched in **under 60 seconds** → details collected afterwards, while the money is already held.

**2. Freeze the amount, not the person.**
A single fraud report currently cascades debit freezes down the whole transaction chain, and banks routinely block the **entire account** over a small disputed credit. An innocent merchant loses ₹10,00,000 of working capital over ₹5,000 they legitimately earned — then travels to another state to get it back.
Sahaay places an **amount-specific micro-lien**, notifies the affected person instantly, and gives them a self-service dispute path with a cryptographic NOC and an SLA clock that escalates on its own.

## Status

Round 1 build in progress. See [`docs/`](./docs) for the full research and build plan:

- [`PHASE-1-RESEARCH.md`](./docs/PHASE-1-RESEARCH.md) — how NCRP works today, how states connect to it, what's broken, and the proposed architecture
- [`PHASE-2-BUILD-PLAN.md`](./docs/PHASE-2-BUILD-PLAN.md) — scope, stack, timeline

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind · Vercel. Backend, data and accounts are **mocked**, per the hackathon rules.

## Running locally

```bash
npm install
npm run dev
```

Optional — for live AI features (the assistant, intake classification and
receipt OCR), create `.env.local` with either provider, or both:

```
GEMINI_API_KEY=...       # tried first
NVIDIA_API_KEY=...       # NVIDIA NIM
OPENROUTER_API_KEY=...   # free tier
OPENAI_API_KEY=...       # last
```

Gemini leads because this product answers in seven Indian languages and its
flash-lite tier handles Indic scripts markedly better than the small open
models behind the others. OpenAI is last despite being the most capable: an
exhausted account returns 429, and spending a round-trip on that before
reaching a provider that can answer costs time while someone is waiting.

Both are optional. Without a key the app answers from a deterministic
classifier built on the same scam library the model is briefed on, so every
flow still works — the demo does not depend on a model being reachable.

Model choice is the cheapest tier of each provider (`gemini-*-flash-lite`,
`gpt-5-nano`), since every call is a short classification or a two-to-four
sentence reply. Override with `GEMINI_MODEL` or `OPENAI_CHAT_MODEL`.

When both providers fail, one line is logged server-side naming the reason.
Silent degradation is easy to miss here precisely because the offline answers
are good.

---

*This is an independent proof of concept. It is not affiliated with, endorsed by, or connected to I4C, the Ministry of Home Affairs, or cybercrime.gov.in. No real complaint is filed and no real data is processed. To report an actual cybercrime in India, use [cybercrime.gov.in](https://cybercrime.gov.in) or call **1930**.*
