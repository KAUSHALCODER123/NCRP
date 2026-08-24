# Phase 2 — Build Plan
## "Prahari" — NCRP reimagined | Build What Moves India

**Written:** 22 Aug 2026
**Round 1 deadline:** 28 Aug 2026, 20:00 IST
**Working deadline:** 28 Aug, **18:00 IST** (2-hour buffer — forms break, uploads fail, Vercel has bad days)
**Days available:** 7 (22–28 Aug)

> **FEATURE FREEZE DECLARED — 24 Aug 2026.** No new features or journeys.
> Changes from this point must fix an observed usability problem, a broken
> judging path, an accessibility regression, a deployment failure, or an
> inaccurate product claim. New ideas go to `ICEBOX.md`.

---

## 1. What we are actually submitting

Four artefacts, per the rules. All four are graded; three of them are not code.

| # | Artefact | Owner | Done by |
|---|---|---|---|
| 1 | Live public browser URL | build | 27 Aug |
| 2 | ≤2-min video (1 min citizen use, 1 min how built) | narrative | 27 Aug |
| 3 | **Exactly 250-word** summary | narrative | 22 Aug (locked first) |
| 4 | Partner email (mutual cross-entry) + login credentials | admin | **today** |

**Non-negotiable admin, do it before writing any code:**
- Both teammates registered at buildwhatmovesindia.com with the emails we will use for **both rounds**.
- Each enters the other's email in the submission form. One-sided = disqualified.
- Write both emails into `docs/SUBMISSION.md` and never deviate. Email is the only identity key; there is no recovery.

---

## 2. Scope — locked

The single biggest risk in a 7-day hackathon is scope drift. This list is closed. **New ideas go in `docs/ICEBOX.md`, not in the build.**

### Tier 1 — the demo (if these aren't perfect, nothing else matters)
1. **Screen 1** — "What happened?" Six large buttons, no login, no category tree.
2. **Screen 2** — Freeze first. Paste bank SMS → auto-parse → 3 fields → submit.
3. **Screen 3** — Live freeze receipt. Bank acknowledgements arriving in real time, golden-hour clock.
4. **Case tracker** — Delivery-style timeline, SLA countdowns, named owner, escalate button, money-back lane visible from day one.
5. **Collateral-victim journey** — innocent merchant: lien notice → "₹5,000 held, ₹9,95,000 available" → dispute in 2 min → SLA clock → auto-NOC → lifted. **This is the differentiator. It ships or we don't submit.**
6. **Seeded demo logins** — judges must be able to see a *finished* journey, not an empty form.

### Tier 2 — build only if Tier 1 is done and polished
7. AI intake panel (free text/voice → category + statute + auto-routing, editable card)
8. Scam Check lookup with cluster data
9. Officer Verify
10. Language switcher + voice input (2 languages is enough to prove it)
11. RBI 3-day zero-liability timestamp receipt

### Tier 3 — icebox, mention in video only
Assisted/guardian mode · WhatsApp bot · public transparency dashboard · Suspect Registry appeal flow · officer/admin console

### Explicitly NOT building
Admin console (not judged) · real bank integrations · mobile app (rules forbid) · real auth · real database

---

## 3. Stack — decided, no debate

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16.3.2 (App Router) + TypeScript** | Vercel deploy is one command; judges open a URL. ⚠️ Next 16, not 15 — APIs differ from most references; check `node_modules/next/dist/docs/01-app/` |
| Styling | **Tailwind + shadcn/ui** | Fast, looks intentional, not templated if we set our own tokens |
| State | **Zustand** + `localStorage` | No backend needed; survives refresh during judging |
| "Backend" | **Next route handlers + JSON seed files** | Mock, per the rules. Zero infra |
| Realtime | **Server-Sent Events** (or staggered `setTimeout`) | Makes the freeze receipt feel alive |
| AI intake | **OpenAI API** via server route, deterministic fallback if no key | OpenAI India is on the judging panel. Use it, but never let it break the demo |
| Voice | **Web Speech API** | Native, free, works in Chrome — which is what judges use |
| i18n | Static JSON dictionaries (EN + HI minimum) | Bhashini is the *stated* production path; static proves the idea |
| Deploy | **Vercel** | Named in the rules video as the safe default |
| Analytics | none | Don't waste a day |

**Hard performance budget:** first paint < 100 KB, usable on 2G, no layout shift. A judge on hotel wifi must not wait.

---

## 4. Design direction

Not another government-portal reskin, and not a startup landing page either. Target: **calm, high-contrast, unmistakably Indian, built for someone in shock.**

- **Shock mode by default** — large type, one decision per screen, short sentences, no jargon. The user has just lost money and is not reading carefully.
- Type scale starts at 18px body. Touch targets ≥ 48px.
- Colour: a single confident primary, semantic green/amber/red used *only* for case state — never decoratively. Money held = green. SLA at risk = amber. Breached = red.
- **No stock illustrations. No 3D. No hero animation.** The rules video explicitly warns that bells and whistles ≠ value. Every pixel should be information.
- Dark mode: skip. Not worth a day.
- Devanagari and Latin must both look deliberate — pick a font pairing that supports both.

One motion exception: the **freeze receipt** animates. Bank acknowledgements landing one by one, the golden-hour clock counting, the held-amount total rising. That is the emotional payload of the entire project and it earns real animation budget.

---

## 5. Seed personas (build these first — they drive every screen)

| Login | Persona | State shown | Why it exists |
|---|---|---|---|
| `priya@demo` | Fresh victim, ₹47,500 UPI fraud | Empty — judge does the flow live | The 30-second wow |
| `ramesh@demo` | Day 4, assigned to IO, SLA amber | Mid-investigation | Proves the tracker isn't a mockup |
| `anjali@demo` | Money returned, case closed | Complete journey | Proves the north-star metric is real |
| `suresh@demo` | **Innocent merchant, ₹5,000 lien** | Collateral victim | The differentiator |
| `lakshmi@demo` | 68, Hindi, voice intake, assisted | Accessibility | Only if Tier 2 lands |

Password for all: something judges cannot fat-finger. Put credentials **in the submission form and on the login screen itself** — a judge locked out is a judge who scores zero.

---

## 6. Day-by-day

### Day 0 — Fri 22 Aug (today) — **Narrative lock**
- [ ] Register both teammates; cross-enter emails
- [ ] Write the **250-word summary** — exactly 250, counted
- [ ] Write the **2-min video script**, timed with a stopwatch
- [ ] **Capture "before" footage** on the real portal: 200-char minimum, special-character rejection on a pasted UPI ID, expired 30-min OTP session. 3 seconds each
- [ ] `npx create-next-app`, Tailwind, shadcn, deploy an empty page to Vercel **today** (never leave first deploy to the last day)
- [ ] Write `docs/ICEBOX.md`

> Locking the narrative first is not ceremony. It forces the hard cuts now, and every build decision for the next 6 days gets measured against "does this appear in the video?"

### Day 1 — Sat 23 Aug — **Freeze flow**
- Design tokens, layout shell, i18n scaffold
- Screen 1 (what happened) → Screen 2 (SMS paste + parse) → Screen 3 (live freeze receipt)
- SMS parser: regex over ~8 real bank SMS formats (HDFC, SBI, ICICI, Axis, Paytm, PhonePe, GPay, Kotak). This is the "magic" moment — make it robust
- **End of day: the first 30 seconds of the video must be recordable.**

### Day 2 — Sun 24 Aug — **Tracker + case building**
- Case tracker: timeline, SLA countdowns, owner, escalate, money-back lane
- Progressive case-building wizard (autosave, resumable, **editable after submit**)
- Seed personas 1–3 wired end to end

### Day 3 — Mon 25 Aug — **The differentiator**
- Collateral-victim journey end to end: lien notification → balance-available screen → 2-minute dispute → document upload → AI triage summary → SLA countdown → auto-NOC → lifted
- Persona `suresh@demo` complete
- **End of day: the differentiator must be recordable.**

### Day 4 — Tue 26 Aug — **Tier 2 + FEATURE FREEZE**
- AI intake panel; Scam Check; Officer Verify; language switcher; voice input; RBI receipt
- **20:00 — HARD FEATURE FREEZE.** Nothing new after this, no exceptions. Everything from here is polish, bugs, and recording.

### Day 5 — Wed 27 Aug — **Polish, record, deploy**
- Mobile QA on a real phone (not devtools). Slow-3G throttle test
- Empty states, error states, loading states — judges *will* find them
- Copy pass: every string read aloud. If it sounds like a government form, rewrite it
- **Record the video.** Budget 3+ takes. Both teammates on camera if two of us
- Final Vercel deploy; test the live URL in a fresh incognito window with the demo credentials

### Day 6 — Thu 28 Aug — **Submit early**
- 09:00 Fresh-eyes pass: open the live link as a stranger would
- 12:00 Final read of the 250 words (still exactly 250?)
- **14:00 SUBMIT.** Six hours early
- Remaining time: buffer only. Do not touch the deploy after submitting

---

## 7. Repo layout

```
NCC-webiste/
├── docs/
│   ├── PHASE-1-RESEARCH.md      ← research (done)
│   ├── PHASE-2-BUILD-PLAN.md    ← this file
│   ├── SUBMISSION.md            ← emails, credentials, 250 words, script
│   └── ICEBOX.md                ← where good ideas go to not derail us
├── app/
│   ├── (citizen)/               ← report · freeze · track · disputes
│   ├── (public)/                ← scam-check · verify-officer
│   └── api/                     ← mock route handlers
├── components/
├── lib/
│   ├── sms-parser.ts            ← the magic moment
│   ├── sla.ts                   ← countdown + auto-escalation logic
│   └── mock/                    ← seed cases, banks, clusters, personas
└── locales/                     ← en.json, hi.json
```

---

## 8. Risk register

| Risk | Mitigation |
|---|---|
| **Scope creep** — the fatal one | Tier list is closed. Feature freeze 26 Aug 20:00. Ideas → ICEBOX |
| Deploy fails on the last day | Deploy an empty app **today**, redeploy daily |
| Video over 2:00 | Script and stopwatch it on day 0, not day 5 |
| Summary ≠ 250 words | Count it, twice, on day 0 and day 6 |
| Partner email mismatch | Do the cross-entry today; screenshot the confirmation |
| OpenAI API fails during judging | Deterministic fallback path, always. Never let AI be a single point of failure |
| Judge can't log in | Credentials printed on the login screen *and* in the form |
| Building the admin console | Explicitly out of scope — it is not judged |
| Over-designing | No 3D, no stock art, no hero animation. Information density wins |

---

## 9. Definition of done

We ship when a stranger can, in a fresh incognito window:
1. Land on the URL and understand what this is in under 10 seconds
2. File a fraud report and see a freeze receipt in **under 60 seconds**, without an account
3. Log in as `suresh@demo` and understand the collateral-freeze problem without narration
4. Open it on a phone on slow 3G without anything breaking

If all four hold, we're top-250 competitive.

---

## 10. Decisions still needed from you

1. **Solo or two-person?** Changes the day plan and the video format. If two: register the partner today.
2. **Name** — recommending **Prahari** (प्रहरी, "sentinel"). Alternatives: Sahaay, 1930.in.
3. **OpenAI API key available?** If yes, real AI intake. If no, deterministic mock — costs nothing in scoring, and the fallback is built either way.
4. **Git init + GitHub?** Recommended: cheap insurance, and a public repo is proof-of-work for the top-250 honours page mentioned in the rules video.
