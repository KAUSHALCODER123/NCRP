# Design System

Design direction for Sahaay, and the tokens that implement it.

---

## 1. The brief

The user arrives **having just lost money**, or having just discovered their account is frozen for reasons nobody explained. They are not browsing. They are not reading carefully. They may be crying, or on a call with a fraudster who is still talking to them.

Design for that person.

**Shock mode is the default mode**, not an accessibility toggle:

- One decision per screen
- 18px minimum body text, 48px minimum touch targets
- Short declarative sentences. No jargon, no legalese, no acronyms without expansion
- Never more than six choices visible at once
- The next action is always the largest thing on screen

## 2. Anti-brief — what this must not look like

| Not this | Why |
|---|---|
| A government portal reskin | Being *prettier* than cybercrime.gov.in is not the argument. Being *faster* is |
| A SaaS landing page | Gradient hero, feature grid, testimonials — wrong register entirely for a crime report |
| A fintech dashboard | Dense metric cards flatter the builder, not the victim |
| Bells and whistles | The rules video warns directly: "crazy 3D content… might not actually be very valuable for the end consumers" |

**No 3D. No WebGL. No stock illustration. No hero animation. No dark mode.** Every pixel carries information or it goes.

---

## 3. Colour

Semantic only. Colour in this app **means something** — it is never decoration. A user should be able to read case state from colour alone at arm's length.

| Token | Meaning | Never used for |
|---|---|---|
| `--color-primary` | The next action | Anything non-interactive |
| `--color-held` (green) | Money secured, SLA healthy, dispute resolved | Generic success chrome |
| `--color-pending` (amber) | SLA at risk, awaiting acknowledgement | Warnings in general |
| `--color-breach` (red) | SLA breached, money moved, freeze failed | Errors in general, destructive buttons |
| `--color-available` (green, muted) | The balance that **remains usable** under a micro-lien | Anything else |

That last token exists for one screen — `₹5,000 held · ₹9,95,000 available` — and it is arguably the most important colour in the project. It renders the entire thesis in a single line.

Contrast: **WCAG 2.2 AA minimum**, AAA for body text. Verify with a checker, don't eyeball it. Judges may be on a laptop screen in a bright room.

---

## 4. Typography

Two families maximum.

- **Latin + Devanagari must both look deliberate.** A Latin face with a fallback Devanagari is immediately visible to an Indian audience and reads as carelessness. Pick a pairing that covers both properly.
- Numerals: **tabular figures** everywhere money or countdowns appear. A rupee total that shifts width while a clock ticks looks broken.
- Body 18px / 1.6. Never below 16px, anywhere, for any reason.
- `font-display: swap`, Devanagari subset only.

---

## 5. Money and time formatting

Two rules, applied without exception, because both are instantly recognisable to Indian judges when wrong:

**Indian digit grouping.** `₹9,95,000` — not `₹995,000`. Lakh/crore grouping via `Intl.NumberFormat('en-IN')`.

**Live countdowns read in human units.** `5 days 03 h remaining`, not `123:44:12`. The SLA clock is a promise, not a stopwatch.

Store paise as integers. Format only at the render boundary. See `lib/money.ts`.

---

## 6. Motion

Motion budget is spent almost entirely in one place.

**The freeze receipt animates.** Bank acknowledgements land one at a time with irregular, realistic latency; the held-amount total counts up; the golden-hour clock runs. This is the emotional payload of the whole project — the moment the citizen sees the system working *for* them instead of demanding things *from* them. It earns real animation work.

**Everything else is still.** No page transitions, no scroll-triggered reveals, no skeleton shimmer where a static placeholder would do.

Respect `prefers-reduced-motion`: the freeze rows still arrive, they just arrive without movement.

---

## 7. Tailwind v4 note

There is **no `tailwind.config.js`** in Tailwind v4. All tokens are declared CSS-first in `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary:   /* … */;
  --color-held:      /* … */;
  --color-pending:   /* … */;
  --color-breach:    /* … */;
  --color-available: /* … */;
}
```

The scaffold ships a `prefers-color-scheme: dark` block in `globals.css`. **Delete it.** Dark mode is explicitly out of scope, and a half-supported dark mode is worse than none — it will render one screen wrong in front of a judge whose OS is set to dark.

---

## 8. Copy rules

The interface is mostly words. Treat copy as design work, not filler.

- Read every string aloud. If it sounds like a government form, rewrite it.
- Second person, active voice, present tense. "We've asked 3 banks to hold your money" — not "Freeze request has been initiated."
- Never make the user guess what happens next. Every state ends with a sentence telling them what to expect and roughly when.
- Numbers over adjectives. "3 banks contacted, ₹47,500 held" beats "Your complaint is being processed."
- Explain every acronym on first use. NCRP, CFCFRMS, FIR, IO, NOC, BNSS — a citizen knows none of them, and a judge shouldn't have to look one up.

**The single highest-leverage copy in the app** is the lien notification. It has to explain, to someone who did nothing wrong and is frightened, that a small amount of their money is held, the rest is fine, why this happened, and how to fix it — in about forty words. Write that one last, and rewrite it five times.
