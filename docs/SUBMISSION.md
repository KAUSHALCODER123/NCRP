# Submission Control Sheet

**Project:** Sahaay — NCRP reimagined
**Team:** Solo
**Round 1 deadline:** 28 Aug 2026, 20:00 IST
**Working deadline:** 28 Aug 2026, **14:00 IST** (submit 6 hours early)

---

## 1. Identity — the thing that gets people disqualified

> "Your email is your ID. The email you registered with is your identity for every form, result, and invite. And there are no exceptions to this."

| Field | Value |
|---|---|
| Registered email | ⚠️ **FILL THIS IN — must match buildwhatmovesindia.com registration exactly** |
| Partner email | *n/a — solo entry, leave blank on the form* |

**Rules:**
- Use the **same email** in Round 1 (28 Aug) and Round 2 (7 Sept). A different email = treated as a different entrant.
- Do not lose access to this inbox. There is no recovery path.
- Solo entry: leave the partner-email field **blank**. Do not put your own email there.

---

## 2. The four submission artefacts

| # | Artefact | Status | Notes |
|---|---|---|---|
| 1 | Live public browser URL | ⬜ | Vercel. Must open in a browser — no app downloads. Set `GEMINI_API_KEY` in the project env vars, or the AI features quietly run offline |
| 2 | Video, **max 2:00** | ⬜ | 1 min using it as a citizen · 1 min how it was built |
| 3 | Summary, **exactly 250 words** | ⬜ | Count it twice |
| 4 | Partner email | ✅ | Blank — solo |

---

## 3. Demo credentials (put these on the login screen too)

A judge who cannot log in scores zero. These go **both** in the submission form and printed on the login page.

| Login | Persona | What it demonstrates |
|---|---|---|
| `priya@demo` | Fresh victim, ₹47,500 UPI fraud | Empty state — judge runs the 60-second freeze live |
| `ramesh@demo` | Day 4, assigned to IO, SLA amber | Tracker mid-investigation |
| `anjali@demo` | Money returned, case closed | The complete journey, including refund |
| `suresh@demo` | Innocent merchant, ₹5,000 micro-lien | **The differentiator** — collateral-victim flow |

Password (all accounts): `sahaay2026`

---

## 4. The 250-word summary

> Brief: exactly 250 words on *what it is* and *why it's better than the current solution*.
> Angle: lead with **2.18%** and **1.4%**, then the two inversions (freeze-first; freeze the amount not the person), then close on implementability — it runs on the existing NCRP/CFCFRMS 2.0 backend and enforces the government's own April 2026 SOP timelines rather than proposing new policy. That last line is aimed at the officials in the Bangalore room.

```
[ DRAFT PENDING — day 0 ]
```

**Word count:** ⬜ / 250

---

## 5. Video script (2:00 hard cap)

| Time | Beat |
|---|---|
| 0:00–0:12 | The number: *"₹52,969 crore reported stolen. ₹167 crore returned. 2.18%."* Cut to 3s of the real portal rejecting a pasted UPI ID |
| 0:12–0:50 | File a case live: paste SMS → freeze receipt → tracker. No feature narration — just do it |
| 0:50–1:00 | The second victim: merchant's lien notice → dispute → auto-NOC. *"We freeze the amount, not the person."* |
| 1:00–2:00 | How it was built: architecture, why freeze-first inverts the flow, why micro-liens end the collateral cascade, what's mocked vs. real |

```
[ SCRIPT PENDING — day 0 ]
```

**Timed length:** ⬜ / 2:00

---

## 6. "Before" footage to capture on the real portal

Three seconds each, cut against our version. Costs ten minutes, most persuasive material available.

- ⬜ 200-character minimum on the incident description
- ⬜ Special-character rejection when pasting a UPI ID (`name@ybl`)
- ⬜ Expired 30-minute OTP session wiping the form

---

## 7. Pre-submit checklist (run 28 Aug, 09:00)

- ⬜ Live URL opens in a **fresh incognito window**
- ⬜ All four demo logins work in that window
- ⬜ 60-second freeze flow completes without an account
- ⬜ Tested on a real phone, throttled to slow 3G
- ⬜ Video is ≤ 2:00
- ⬜ Summary is exactly 250 words
- ⬜ Registered email matches exactly
- ⬜ No secrets committed (`git log -p | grep -i "sk-"` returns nothing)
- ⬜ Disclaimer visible: not affiliated with I4C / MHA / cybercrime.gov.in
