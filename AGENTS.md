<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Sahaay — agent context

## What this is

A proof of concept that reimagines India's **National Cyber Crime Reporting Portal** (cybercrime.gov.in), built for the *Build What Moves India* hackathon.

**Round 1 deadline: 28 Aug 2026, 20:00 IST.** Solo entry. Every decision is made under that clock.

Read [`docs/PHASE-1-RESEARCH.md`](./docs/PHASE-1-RESEARCH.md) before proposing product changes — the design is grounded in specific, evidenced failures of the real system, not in generic UX intuition.

## The two ideas the whole project exists to argue

1. **Freeze first, ask later.** The current portal spends the golden hour — the minutes when stolen money can still be intercepted — on registration, OTP, category selection and a long form. Sahaay dispatches the freeze request in under 60 seconds from a pasted bank SMS, then collects details while the money is already held.

2. **Freeze the amount, not the person.** One fraud report currently cascades debit freezes down the transaction chain, and banks routinely block an *entire account* over a small disputed credit — paralysing innocent merchants and freelancers for months. Sahaay places an amount-specific micro-lien, notifies the affected person instantly, and gives them a self-service dispute path with an SLA clock that escalates on its own.

If a proposed change does not serve one of these, it probably belongs in [`docs/ICEBOX.md`](./docs/ICEBOX.md).

## Hackathon rules that constrain the code

- **Mock everything** — data, backend, accounts. No database, no real auth, no real bank integrations.
- **Browser only.** "If it doesn't open on a browser, it doesn't exist." No native app.
- **Judged as a citizen.** The admin/officer side is explicitly *not* evaluated — don't build it.
- **Ideas over code.** Effort goes into interfaces and interactions, not backend sophistication.
- Judges must be able to log in. Demo credentials are printed on the login screen.

## Stack

Next.js **16.3.2** (App Router) · React 19 · TypeScript strict · **Tailwind v4** · Zustand + localStorage · Vercel.

Two traps worth stating plainly:
- **Next 16 differs from Next 13–15.** Check `node_modules/next/dist/docs/01-app/` before writing routing, caching or route-handler code.
- **Tailwind v4 has no `tailwind.config.js`.** Tokens live in `app/globals.css` under `@theme`.

## Invariants — do not violate

1. Money is **integer paise**. Never a float. Format only at the render boundary (`lib/money.ts`).
2. There is **no "freeze account" operation** in this codebase. Only `lien(account, amount)`. That absence is the argument.
3. **Placing a lien emits a notification in the same operation.** `notifiedAt` is never null. Enforcement and notification are structurally inseparable.
4. The case **timeline is append-only**. Never mutate an event; add one.
5. Account numbers are **masked at construction**, never at display. A full account number should not exist in app state.
6. The AI classifier **always has a working deterministic fallback**, with a 4-second timeout. An API failure must never be visible to a judge.
7. **Indian digit grouping** (`₹9,95,000`, not `₹995,000`) and **tabular figures** wherever money or countdowns render.

## Conventions

- Server Components by default; `'use client'` only for genuine interactivity (SMS paste, freeze stream, SLA clocks, dispute form).
- Route groups organise by **journey**, not feature — `app/(lien)/` holds the entire collateral-victim story.
- Performance budget: **< 100 KB first-load JS**, usable on slow 3G, CLS 0.
- WCAG 2.2 AA minimum. 18px body minimum, 48px touch targets.
- Colour is **semantic only** — it encodes case state and never decorates. See [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md).

## Scope discipline

Scope creep is the primary failure mode of a 7-day build. The tier list in [`docs/PHASE-2-BUILD-PLAN.md`](./docs/PHASE-2-BUILD-PLAN.md) §2 is **closed**, and there is a hard feature freeze on **26 Aug at 20:00**.

New ideas go to `docs/ICEBOX.md`. Do not act on them. Round 2 (7 Sept) exists for exactly this.

Do not build: admin console · dark mode · real auth · native app · 3D/WebGL · gamification · marketing landing page.

## Ethics — non-negotiable

This is a realistic clone of a government crime-reporting portal, which is structurally identical to a phishing site. The project's own research documents lookalike-domain fraud as an active attack pattern in India.

Therefore, on every page:
- A visible disclaimer that this is **not affiliated with I4C, MHA, or cybercrime.gov.in**, that no real complaint is filed, and that real incidents go to `cybercrime.gov.in` or **1930**.
- No real personal data. All personas are fictional.
- Never register a lookalike domain or anything that could be mistaken for the real service.

## Secrets

`OPENAI_API_KEY` lives in `.env.local` (git-ignored) and in Vercel env vars. Server-side only, never sent to the client, never committed, never printed to a terminal or transcript.
