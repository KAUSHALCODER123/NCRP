# Phase 1 — Research Report
## Rebuilding India's National Cyber Crime Reporting Portal (NCRP)

**Project:** "Build What Moves India" hackathon (Varun Mayya × OpenAI India)
**Target platform:** `cybercrime.gov.in` — National Cyber Crime Reporting Portal, run by I4C / MHA
**Date:** 22 August 2026
**Round 1 deadline:** 28 August 2026, 8:00 PM IST — **6 days from today**

---

# 0. Competition constraints (from the rules video, uploaded 21 Aug 2026)

These constraints shape every design decision below. Read this first — it's why the report emphasises *citizen-visible ideas* over backend engineering.

| Rule | Detail |
|---|---|
| What to build | Pick one of 10 listed public service platforms; rebuild it **entirely** as a comprehensive proof of concept |
| Backend | **Mock everything** — mock data, mock backend, mock accounts. No real scale expected |
| Delivery | A **live public URL that opens in a browser**. "If it doesn't open on a browser, it doesn't exist." No mobile apps |
| Credentials | You must supply **login credentials** so judges can get in |
| Judging lens | Graded **as a citizen using it**. The **admin side is not evaluated** |
| Priority | **Ideas over code.** "What public service websites in India need is new ideas" |
| Team | Solo or **max 2 people**; both must be registered; each must enter the other's email |
| Identity | **Your registered email is your ID.** No exceptions, no recovery |
| Submission | (1) live link, (2) ≤2-min self-recorded video — 1 min using it as a citizen, 1 min how you built it, (3) **exactly 250-word** summary of what it is and why it's better, (4) partner's email |
| Round 1 close | **28 Aug 2026, 8:00 PM IST** |
| Shortlist | Top **250** announced between 28 Aug – 1 Sept, judged by VM's team + OpenAI India team |
| Mentorship | 1 week in a WhatsApp group with 5 mentors (senior engineers, Tech Twitter, OpenAI people) |
| Round 2 | **7 Sept 2026** — improved submission, *same emails* |
| Top 10 | Announced 8–12 Sept; present **live in Bangalore on 12 Sept** to founders, creators, mentors and **government officials** |
| Prizes | Top 10: 1 yr Codex Pro + Codex micro · Top 3: MacBook · Top 1: SF trip (visa permitting) |

**Platform confirmed on-list** (verified 22 Aug 2026): NCRP appears in the official set alongside EPFO, MCA and UMANG.

**The catch that comes with it.** NCRP is the most emotionally charged platform on that list — everyone has been scammed or knows someone who has. Expect it to be one of the **most-picked** options among 5,000+ entrants, and expect a large fraction of those submissions to be the same project: a cleaner complaint form, a nicer tracker, a chatbot. Being on-list removes the odds penalty and buys judge familiarity; it does **not** buy differentiation. That is why §3.3 B0 (the collateral freeze cascade) and §5.6 (micro-liens + self-service NOC) matter disproportionately here — they are the parts of this problem space that almost nobody else will have found, because they require reading the SOP rather than using the website.

**Strategic read:** the judges are busy people clicking through hundreds of links. The first 30 seconds of your live demo decides everything. Government officials are in the room at the final — so the ideas must be *implementable on a legacy codebase*, not fantasy. Optimise for **one unforgettable citizen moment**, not feature count.

---

# 1. How the NCRP officially works today

## 1.1 The institutional map

NCRP is not one system. It is the public front door to a federated machine:

```
                    ┌──────────────────────────────────────────┐
                    │   I4C — Indian Cyber Crime Coordination   │
                    │        Centre (MHA, Govt of India)        │
                    └──────────────────────────────────────────┘
   7 verticals:
   1. NCRP        — the public reporting portal (cybercrime.gov.in)
   2. NCTAU       — National Cybercrime Threat Analytics Unit
   3. NCEMU       — Ecosystem Management Unit
   4. JCCT        — Joint Cybercrime Coordination Teams (inter-state cases)
   5. NCFL        — National Cyber Forensic Laboratory
   6. NCTC        — National Cybercrime Training Centre
   7. NCR&IC      — Research & Innovation Centre
```

Supporting systems that NCRP touches:
- **CFCFRMS** — Citizen Financial Cyber Fraud Reporting & Management System (launched 2021; **CFCFRMS 2.0** is the current generation). The financial interdiction clearinghouse. I4C's own page cites **~85 financial institutions**; current operational reporting puts the onboarded set at **250+** banks, payment aggregators, wallets and FinTechs — cite it as "85–250+ depending on source and date", not a single number.
- **CFMC** — **Cyber Fraud Mitigation Centre**: a co-located operational floor where representatives of major banks, telecom service providers, social media intermediaries and state LEAs sit together for real-time interdiction. This is the human fast-path that exists because the automated path is too slow.
- **TAU** — National Cybercrime Threat Analytics Unit: aggregates threat intel, identifies syndicates, produces cross-jurisdictional tactical reports.
- **Pratibimb module** — geospatial mapping of suspect infrastructure, active SIMs and device clusters using telecom tower data and cell-ID triangulation. Deployed against known hotspots (Jamtara, Mewat).
- **Suspect Registry** — central repository of flagged bank accounts, UPI handles, URLs and phone numbers, aggregated from citizen complaints, with a public search interface.
- **NDISC / NCFL** — National Digital Investigation Support Centre / National Cyber Forensic Laboratory: forensics support to field officers.
- **Grievance Redressal & Money Restoration Module** — operational from **April 2026**, enforcing 7-day bank review and 15-day IO decision windows.
- **1930** — national toll-free cyber-fraud helpline, staffed by *state* call centres.
- **CCTNS** — Crime & Criminal Tracking Network & Systems (the FIR/case system every police station runs on).
- **ICJS** — Interoperable Criminal Justice System, stitching Police (CCTNS) + Courts (e-Courts) + Jails (e-Prisons) + Forensics (e-Forensic) + Prosecution (e-Prosecution).
- **S4C / R4C** — State/Regional Cyber Crime Coordination Centres. Established in **Bihar, Chhattisgarh, Haryana, Himachal Pradesh, Kerala, Maharashtra, Tamil Nadu, Telangana, Uttar Pradesh, West Bengal**.
- **SAHYOG** — takedown/notice portal to intermediaries.
- **Vani – CyberDost** — the portal's AI chatbot.
- **Sanchar Saathi / CEIR / TAFCOP** (DoT) — SIM and IMEI blocking, adjacent but not deeply joined.

**Key structural fact:** NCRP registers and routes. It **does not investigate**. Policing is a State subject under the Constitution. I4C can route a complaint to a state and can build a dashboard showing it's pending — it cannot compel an officer to act. Almost every citizen-facing failure below traces back to this seam.

## 1.2 Entry points (four doors, four different IDs)

| Door | What happens | ID you get |
|---|---|---|
| **cybercrime.gov.in** | Self-service web form | 14-digit acknowledgement starting with **2** |
| **1930 helpline** | Operator creates a CFCFRMS ticket for you | 14-digit acknowledgement starting with **3**; you must then complete details online **within 24 hours** |
| **Police station** | Officer files on your behalf / registers FIR | FIR number (CCTNS) |
| **Your bank** | Bank raises it into CFCFRMS | Bank complaint reference |

A single victim commonly ends up holding **three or four different reference numbers for the same incident**, with no screen anywhere that shows them as one case. This is the single most under-appreciated UX failure in the system.

## 1.3 The two report tracks

At the top of the funnel the portal splits you:

**A. Report Financial Fraud** — login is **mandatory** (mobile + OTP), because a money trail needs a verified claimant.

**B. Report Other Cybercrime** — which further splits:
- **Crime against Women / Children** (obscene content, CSAM, sextortion, cyberstalking) — **anonymous reporting allowed**, deliberately, to remove fear as a barrier.
- **Other cybercrime** — "Report & Track" mode, login required.

## 1.4 Financial fraud flow (the "golden hour" path)

This is the flow that carries the money, and the one worth rebuilding.

```
 T+0    Victim realises money is gone
   │
   ├──► calls 1930  ──► operator creates CFCFRMS ticket ──┐
   └──► cybercrime.gov.in ──► login (mobile+OTP) ─────────┤
                                                          ▼
                                          ┌──────────────────────────────┐
                                          │  CFCFRMS ticket created      │
                                          │  (14-digit ack no.)          │
                                          └──────────────────────────────┘
                                                          │
                     ┌────────────────────────────────────┼───────────────────────┐
                     ▼                                    ▼                       ▼
            Victim's (debit) bank            Beneficiary bank / wallet      Merchant / PG
                     │                                    │                       │
                     └────────────► HOLD / LIEN placed on disputed amount ◄────────┘
                                                          │
                                      money already moved on?  ──► bank returns "exit details"
                                      (ATM, device, next wallet)      │
                                                          ▼          ▼
                                              layer-2, layer-3 fan-out  (manual chase)
                                                          │
                                                          ▼
                    ┌──────────────────────────────────────────────────────────┐
                    │  Complaint lands in the State/UT LEA queue on NCRP        │
                    │  → State nodal officer → District → Police Station        │
                    └──────────────────────────────────────────────────────────┘
                                                          │
                          ┌───────────────────────────────┴──────────────────┐
                          ▼                                                  ▼
              FIR registered in CCTNS                              No FIR — stays "under process"
              (e-Zero FIR auto-triggers for                         (this is ~98.6% of cases)
               losses ≥ ₹10 lakh, since May 2025)
                          │
                          ▼
              Investigation (IO assigned) ──► ICJS ──► court
                          │
                          ▼
              ┌───────────────────────────────────────────────────────────┐
              │  MONEY RESTORATION MODULE (the part nobody reaches)        │
              │  Victim applies → IO verifies (15 days) → notice to        │
              │  suspect (15-day window, video conference) → SP/DCP        │
              │  approval → s.106(3) BNSS notice to bank → bank credits    │
              │  within 15 days → victim signs indemnity bond              │
              │  Multi-victim pools: pro-rata / equitable distribution     │
              └───────────────────────────────────────────────────────────┘
```

**Published SOP timelines:**

| Stage | SLA |
|---|---|
| Bank places hold on notice | real-time (expected) |
| Victim grievance forwarded to module | 7 days |
| IO verification decision | 15 days |
| District-level appeal decision | 15 days |
| Auto-escalation on non-action | 15 days |
| "Long-pending hold" review threshold | 90 days |

Three distinct severity levels exist on the suspect side, and are frequently confused even inside the system: **Hold** (disputed amount blocked) → **Suspension** (UPI/NEFT/ATM/card disabled) → **Seizure** (full account lock, rare).

## 1.5 Non-financial flow and the status machine

```
Submitted → Under Process → Assigned → Under Investigation
                                  ├──► Additional Information Required
                                  ├──► Closed
                                  └──► Rejected
```

That is the entire vocabulary the citizen sees. There is no owner name, no SLA clock, no "what happens next", no estimated date, and no explanation attached to *Closed* or *Rejected*.

## 1.6 Escalation as it exists today

If nothing happens, the portal's answer is a **static HTML list of State/UT Nodal Officers and Grievance Officers** (`Crime_NodalGrivanceList.aspx`) — names, phone numbers, email addresses. The escalation path is *"go find the right officer's phone number and call them yourself."*

---

# 2. How state cyber crime portals connect to NCRP

## 2.1 The actual pattern

Most people assume every state runs its own reporting portal that syncs with the national one. It doesn't work that way.

**NCRP is the single front door. States are the back office.** There is deliberately no parallel state-level *intake* channel for cybercrime — state cyber-crime websites (Maharashtra Cyber, Telangana, Kerala, etc.) are overwhelmingly **awareness pages that redirect you to cybercrime.gov.in**, plus a local helpline number.

The integration is not portal-to-portal. It is:

```
   CITIZEN
      │  (one national intake — NCRP web / 1930 / PS / bank)
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NCRP  (central, I4C/MHA)                    │
│   routing engine: State/UT + District chosen by complainant      │
└─────────────────────────────────────────────────────────────────┘
      │                    │                      │
      ▼                    ▼                      ▼
 STATE LEA           STATE 1930 CALL         S4C / R4C
 DASHBOARD           CENTRE (state-run,      (10 states) — intel
 (state → district   answering the           and threat-feed
  → police station    national number)        exchange
  logins on NCRP)
      │
      ▼
  CCTNS  (FIR + case file, per state instance)
      │
      ▼
  ICJS  (courts / jails / forensics / prosecution)
      │
      ▼
  JCCT  (Joint Cybercrime Coordination Teams) for inter-state cases
```

So the "connection" is four separate things:
1. **Role-scoped logins** — state, district and police-station officers log into NCRP itself and work a queue. There is no data federation; there is a shared central database with access control.
2. **Monitoring dashboards** — National / State / District level, so I4C can see pendency by state.
3. **CCTNS/ICJS handoff** — happens only *if* an FIR is registered. Before that, the complaint lives only in NCRP and is invisible to the criminal justice system.
4. **Human coordination** — nodal officers, JCCT, S4C. Phone calls and emails between states.

## 2.2 Where the seam tears

- **Routing depends on the victim guessing.** The complainant selects the state and district. Cybercrime is placeless — the victim is in Pune, the mule account is in Jamtara, the SIM is from Mewat, the server is offshore. A wrong pick sends the case to a queue that will never own it.
- **No transfer primitive the citizen can see.** When a case is moved between states, the citizen isn't told, and the clock silently restarts.
- **Only 10 of 36 states/UTs have an S4C/R4C.** Intelligence sharing is uneven by geography.
- **Complaint ≠ case.** Until FIR conversion, a complaint has no legal existence in ICJS. With a **1.4% FIR conversion rate (2025)**, ~98.6% of reported cybercrime never becomes a case anywhere in the justice system.
- **Capacity is the binding constraint.** The Parliamentary Standing Committee on Home Affairs (254th Report) found *"acute shortages of skilled cyber investigators, digital forensic analysts, and prosecutors with techno-legal expertise"* in multiple states. A better portal routes faster into the same bottleneck — which is exactly why the redesign must reduce *load per case*, not just improve the form.

---

# 3. The problems — what the evidence actually shows

## 3.1 The numbers that frame everything

| Metric | Value |
|---|---|
| NCRP complaints, 2022 | 4.52 lakh |
| NCRP complaints, 2024 | 19.18 lakh |
| NCRP complaints, 2025 | **28.15 lakh** |
| Incidents reported (2026 run-rate) | ~2.3 million/yr |
| Reported financial loss, 2024 | ₹22,845 crore (+206% YoY) |
| Reported financial loss, 2025 | ₹19,813 crore |
| **FIR conversion rate, 2022** | ~5% |
| **FIR conversion rate, 2024** | ~3% |
| **FIR conversion rate, 2025** | **1.4%** |
| Total reported to CFCFRMS, Apr 2021 – Nov 2025 | ~₹52,969 crore |
| Amount **held/saved** in that period | ~₹7,647 crore (~14%) |
| Amount **actually restored to victims** | **~₹167 crore — 2.18%** |
| Amount saved, cumulative to 30 Jun 2026 | ₹11,158 crore across 32.80 lakh complaints |

Read those last three rows together. **The system is decent at freezing money and catastrophic at returning it.** Roughly 14% of stolen money gets frozen; of what's reported, about **0.3% finds its way back to the person it was taken from**. Meanwhile FIR conversion has fallen by ~72% relative since 2022 — volume is growing 6× faster than the system's capacity to convert complaints into cases.

**This is your headline. Not "the form is ugly." The product should be measured in rupees returned, not complaints registered.**

## 3.2 Citizen-facing problems (Class A — UX)

**A0. The form actively fights the user.** These are the concrete, demonstrable defects — the ones to show side-by-side in the video, because a judge recognises every one of them instantly:

| Defect | Consequence |
|---|---|
| Incident description enforces a **200-character minimum** | A victim who can only say "I got a call, they took ₹47,500 from my account" is blocked until they pad it out |
| Description field **rejects `# $ @ ^ * ' ~ \| !`** | Pasting a UPI handle (`name@ybl`), an email, a URL or a transaction log throws an uninformative validation error — or fails silently. The characters the crime is *made of* are the characters the form forbids |
| **30-minute OTP session window**, no form-state persistence | Leave to fetch a bank statement, come back to an expired session and an empty form. Restart from registration |
| **No OCR anywhere** | Manual transcription of 12-digit UTRs, IFSC codes, merchant IDs. One typo silently misroutes the CFCFRMS bank dispatch — the freeze goes to the wrong place and nobody tells the victim |
| Upload caps: **ID ≤ 5 MB, each evidence file ≤ 10 MB** | Modern phone screenshots and screen recordings routinely exceed this; no client-side compression offered |
| **Non-editable after submission** | A typo in the UTR is unfixable. The case is now permanently wrong |
| Fragmented menu across isolated `.aspx` sub-pages; **horizontal scrolling on mobile** | The device where fraud is *discovered* is the device the portal handles worst |

Every one of these is a solved problem in 2026 consumer software. That gap — between what the citizen uses daily and what the state gives them at their worst moment — is the emotional core of the pitch.

**A1. The golden hour is spent filling a form.**
Fund recovery is a race against layering. Every minute matters. Yet the current flow demands registration, OTP, category selection, a long detail form, personal identification (name, address, Aadhaar, PAN, email, mobile), and evidence upload — *before* a freeze request goes out. The highest-value 20 minutes of a victim's life are consumed by data entry.

**A2. Category paralysis.**
The portal opens with an abstract taxonomy split (financial vs. "other", then women/child vs. other) followed by dozens of sub-categories. A panicking 58-year-old who just lost ₹4 lakh to a "digital arrest" call does not know whether that is impersonation, extortion, or online financial fraud. Filing in the wrong category is documented as a top failure mode — and it misroutes the case.

**A3. Non-editable submissions + the "Additional Information Required" dead end.**
Once submitted, a complaint cannot be edited. If an officer later marks *Additional Information Required*, there's no notification discipline, no clear channel, and no deadline — cases silently rot in that state.

**A4. Status opacity.**
"Under Process" for months, with no owner, no SLA, no next step, no reason on closure. Users consistently report that **tracking status is difficult and responses are delayed** — this is the most commonly cited complaint about the portal across coverage.

**A5. Jurisdiction guessing.**
The citizen is asked a question — which district owns this crime? — that even the police often can't answer.

**A6. Login and identity friction.**
Mandatory mobile+OTP on the financial track. One mobile = one identity. If a victim's SIM is the thing that was compromised (SIM swap is a common attack), the reporting channel itself is compromised.

**A7. Language.**
The portal is functionally English-first. The victim population is not. Voice input in an Indian language is not an option anywhere in the flow.

**A8. Accessibility and the elderly.**
Research cited in Indian coverage: **71% of elders use basic phones, only 41% own smartphones, 13% access the internet, and just 5% use online services like banking apps** — while reporting suggests a very large share of cyber-fraud victims are senior citizens. The population most targeted is the population least able to use a web form. There is no assisted-filing, guardian, or feature-phone flow.

**A9. Mobile-hostile evidence capture.**
Evidence lives on a phone — the SMS, the WhatsApp thread, the UPI receipt, the call log. The portal expects desktop-style file uploads of screenshots and bank statements.

**A10. Four IDs, one incident.**
As established in §1.2. No unified case view. Victims re-tell their story to 1930, the portal, the bank, and the police station.

## 3.3 Process and trust problems (Class B)

### B0. The collateral freeze cascade — the second victim nobody counts

**This is the most under-reported failure in the entire system, and the strongest single idea in this project.**

Stolen money does not sit still. Syndicates layer it across secondary and tertiary mule accounts within minutes. CFCFRMS follows the trail and dispatches automated debit-freeze alerts **down the whole chain**. Two compounding errors turn a fraud remedy into a fraud of its own:

1. **Multi-hop blast radius.** One complaint can trigger holds on dozens of downstream accounts. The people at hop 2 and hop 3 are frequently *legitimate* — a P2P crypto trader, an e-commerce seller, a freelancer who invoiced a client, a shopkeeper who accepted a UPI payment, someone who sold a second-hand phone.

2. **Blanket freeze instead of a targeted lien.** Faced with a ₹5,000 disputed credit, risk-averse bank policy commonly executes a **total debit freeze on the entire account**. A business owner with ₹10,00,000 of working capital loses all of it over a ₹5,000 dispute they had no part in.

```
   Victim reports ₹47,500 fraud
        │
        ▼
   Mule A ──► Mule B ──► ▓ Merchant C  (legit, took ₹5,000 for a genuine sale)
        │         │         └──► ENTIRE ₹10,00,000 balance frozen
        │         └──► ▓ Freelancer D (legit invoice)  ── frozen
        └──► ▓ 40+ further accounts ── frozen

   One complaint. Dozens of innocent accounts paralysed.
   None of them were notified. None of them know who to call.
```

**Then the unfreeze process punishes them again.** The innocent account holder must:
- work out *which* cyber cell originated the hold — often in a state 2,000 km away;
- deal with the fact that their **local bank branch cannot lift the freeze** without explicit Investigating Officer authorisation;
- travel physically or file legal representations with invoices, bank statements and tax records;
- obtain a formal **No Objection Certificate** — issued manually, on paper, by an IO who has thousands of other cases.

Turnaround is routinely **months, sometimes over a year**. The April 2026 SOPs mandate 7-day bank review and 15-day IO decision windows, but **enforcement inside the portal is still partly manual and fragmented** — the SLA exists on paper without a system that counts down and escalates.

**Why this matters strategically:** every other team in this hackathon will redesign the *victim's* form. Almost none will notice that the system manufactures a second class of victim, at scale, silently. Fixing it — with **amount-specific micro-liens** and a **self-service digital NOC** (§5.6) — is a genuinely new idea, it is directly implementable on CFCFRMS 2.0, and it is exactly the kind of thing the government officials in the Bangalore room will react to, because they are already fielding these complaints.

**B1. Money-back is where victims are abandoned.** The restoration path — apply → IO verification (15d) → notice to suspect (15d) → SP/DCP approval → BNSS s.106(3) notice → bank credit (15d) → indemnity bond — is **victim-initiated**, legally dense, and largely invisible. Most victims never learn it exists. Result: 2.18%.

**B2. Frozen-money limbo.** The SOP itself acknowledges *"money kept on hold for long periods, without clear process to release it."* A 90-day review threshold now exists, but requires victim initiative.

**B3. Innocent account holders.** Salary or business accounts get frozen because one fraudulent credit landed in them. The grievance path requires a **bank branch visit plus CDD/EDD verification before escalation** — a documentation burden dumped on someone who did nothing wrong. The SOP lists this among its own failure points.

**B4. Suspect non-response stalls everything.** If the account holder doesn't attend the 15-day video conference, the process halts at IO discretion.

**B5. Exit-trail dead ends.** Money into another wallet, a merchant, or crypto → the bank hands over exit details and the police must open a fresh trace. Cross-border, it usually stops.

**B6. Complaint ≠ FIR ≠ recourse.** The Parliamentary Committee on the Empowerment of Women explicitly raised converting NCRP complaints into **e-FIRs**, precisely because *non-registration of FIRs blocks the refunding of the lien amount to victims*. The absence of an FIR is not a paperwork issue — it's why the money can't legally come back.

**B7. Underreporting.** The Standing Committee found serious underreporting driven by **stigma, digital illiteracy, and fear of retaliation** — especially for sextortion and crimes against women.

## 3.4 Structural and technical problems (Class C)

**C1. Legacy stack.** The portal is ASP.NET WebForms — every URL is a `.aspx` page (`Webform/Accept.aspx`, `Crime_AuthoLogin.aspx`, `chkackstatus.aspx`, `Crime_NodalGrivanceList.aspx`). This implies server-rendered postbacks, ViewState payloads, sticky sessions, CAPTCHA-gated forms, and hostile behaviour on flaky mobile networks. It also actively blocks non-browser clients (the site returns **403** to programmatic fetches), which makes it hard to build anything on top of.

**C2. Scale mismatch.** ~2.3M complaints/year is only ~7 requests/second average — but 1930 and post-scam-wave traffic is extremely spiky, and freeze fan-out to 85 institutions per complaint multiplies write amplification. A page-postback monolith is the wrong shape for time-critical fan-out.

**C3. Technology gap acknowledged at the top.** The Standing Committee (254th Report) states that **PMT, SAHYOG, and NCRP all "require significant upgradation,"** and that AI-enabled crime, encrypted platforms and anonymisation tools are **outpacing investigative and regulatory capacity**.

**C4. No public API / no data returned to citizens.** NCRP sits on the largest fraud-signal corpus in India — millions of reported UPI IDs, phone numbers, URLs, account numbers, IFSCs. **None of it is exposed back to citizens as a check-before-you-pay service.** This is the single biggest wasted asset in the system.

**C5. Uneven bank participation.** 85–250+ institutions onboarded, but hold latency and quality varies widely across them, and mule-account networks recycle faster than enhanced due diligence can catch them.

**C6. No real-time bi-directional sync with state CCTNS.** Once NCRP routes a complaint to a state cyber cell, the case moves into local police workflow and the state's CCTNS instance. Updates flow back asynchronously, in batch, if at all. The citizen's tracker therefore shows a **static status** while real work may or may not be happening — this is the direct mechanical cause of the "black hole" perception in A4, and of the phone calls and physical police-station visits it produces.

## 3.5 Security and trust-surface problems (Class D)

**D1. The portal is impersonated as an attack.** "Digital arrest" scams work by impersonating Police/CBI/ED/RBI, often via **forged emails, SMS, and lookalike websites mimicking `gov.in`/`nic.in` domains**. MHA has issued warnings since March 2024. There is currently **no primitive that lets a citizen verify that the officer calling them is real** — the trust asymmetry is the exploit.

**D2. NCRP is a database of people's worst days.** It holds Aadhaar, PAN, bank details, sextortion material, CSAM reports, and victim identity, accessible to thousands of officers across 36 states/UTs. Access-control failures here are far more damaging than downtime. The DPDP Act 2023 obligations are non-trivial and largely invisible in the current UX (no consent surface, no retention story, no access log the citizen can see).

**D3. Anonymous track vs. accountability.** Anonymous reporting for women/child crime is correct policy — but there's no way for an anonymous reporter to later claim, augment, or track their case without giving up anonymity.

**D4. False and weaponised complaints.** No visible mechanism to detect complaint-spam, retaliatory filings, or coordinated abuse of the freeze mechanism.

**D5. The Suspect Registry is unverified crowdsourcing.** The public suspect-search repository is populated from citizen complaints with no automated real-time verification and **no visible appeal flow**. A legitimate business's UPI handle or phone number can be flagged by a mistaken or malicious report and stay flagged — reputational damage and wrongful blocking with no due process. Any redesign that leans on this corpus (as §5.5(a) does) must ship the appeal path *in the same release* as the lookup, or it inherits the defect and amplifies it.

---

# 4. Fix principles — what a redesign must be organised around

Ten principles. Every feature in §5 traces to one of these.

1. **Golden hour first.** The freeze request must leave the building in under 60 seconds. Details are collected *after* the money is held, not before.
2. **Report once, resolve anywhere.** One case ID that unifies 1930, web, bank, and police station. The citizen never re-tells their story.
3. **Radical status transparency.** Every stage has a named owner (designation), a visible SLA clock, an explicit "what happens next", and a one-tap escalation when the clock breaches.
4. **Delete the jurisdiction question.** Infer routing from the money trail, the accused's bank branch, the victim's location, and telecom data. Never ask a victim to pick a district.
5. **Category-free intake.** The citizen describes what happened in their own words (typed or spoken, any Indian language). The system classifies, maps to statute, and fills the form — showing its work, editable.
6. **Money back is the north-star metric.** Not complaints registered. Not amount frozen. Rupees returned to victims. Publish it.
7. **Turn the corpus into a shield.** Expose the fraud-signal database as a public check-before-you-pay lookup. Prevention scales infinitely better than investigation.
8. **Make trust verifiable.** Any citizen must be able to confirm in 5 seconds whether an "officer" contacting them is real. This directly defuses digital-arrest.
9. **Design for the actual victim.** Elderly, low-literacy, feature-phone, non-English, in shock. Assisted mode and voice are not accessibility extras — they are the primary flow.
10. **Reduce load per case, not just intake friction.** Auto-clustering of duplicate complaints against the same mule account turns 400 separate investigations into one. This is how you survive 1.4% conversion.
11. **Do no harm downstream.** Freeze the disputed *amount*, never the person. Anyone affected by an enforcement action must be notified immediately, told why, and given a self-service path out with an enforced clock. Enforcement without notification is not enforcement — it is an outage inflicted on a citizen.
12. **Turn every SOP timeline into a running clock.** The April 2026 SOP already specifies 7-day and 15-day windows. A timeline that isn't counted down and auto-escalated is a suggestion. Encoding existing policy as enforced state machines is the cheapest, most credible reform available — and the easiest for an official to say yes to, because it changes no policy.

---

# 5. Proposed product and flow

## 5.1 Naming

| Option | Reasoning |
|---|---|
| **Prahari** (प्रहरी — "sentinel") | Recommended. Short, Indic, not already taken by a major govt scheme, reads as protective rather than punitive |
| **Sahaay** | Emphasises help over enforcement; softer, good for the assisted-filing angle |
| **1930.in** | Instantly recognisable — leans entirely on the helpline number people already know |

Report proceeds using **Prahari**.

## 5.2 The core flow — "60 seconds to freeze"

```
┌──────────────────────────────────────────────────────────────────────┐
│  SCREEN 1 — WHAT HAPPENED?   (no login, no category tree)            │
│                                                                       │
│   [ 💸  I lost money ]                                                │
│   [ 😨  Someone is threatening / blackmailing me ]                    │
│   [ 🎭  Someone is pretending to be me ]                              │
│   [ 🔒  My account was hacked ]                                       │
│   [ 🔍  I got a suspicious message — is this a scam? ]  ← prevention  │
│   [ 🎤  Just tell me what happened ]  ← voice, 12 languages           │
└──────────────────────────────────────────────────────────────────────┘
                                   │  "I lost money"
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  SCREEN 2 — FREEZE FIRST  (target: < 60 seconds, 3 fields)           │
│                                                                       │
│   Paste the bank SMS you received  ┌────────────────────────────┐    │
│                                     │ "Rs 47,500 debited A/c ..." │    │
│                                     └────────────────────────────┘    │
│   → auto-parsed: ₹47,500 · HDFC ·  UPI · 21:14 · VPA xxx@ybl        │
│                                                                       │
│   Your mobile: [ 98XXXXXX ]   [ Send freeze request now ]            │
│                                                                       │
│   OTP verifies IN PARALLEL — the freeze fan-out has already started   │
└──────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  SCREEN 3 — FREEZE RECEIPT   (the "wow" moment for judges)           │
│                                                                       │
│   ✅ Case PRH-2026-08-4471X created at 21:16:42                       │
│   ⏱  Freeze request sent to 3 institutions in 41 seconds              │
│                                                                       │
│   HDFC Bank (your bank)        ✅ acknowledged   21:16:51            │
│   Paytm Payments Bank (dest.)  ✅ HOLD placed    ₹47,500  21:17:09   │
│   PhonePe (layer 2)            ⏳ pending        SLA 15 min           │
│                                                                       │
│   💡 You are 6 minutes into the golden hour. Money held so far:      │
│      ₹47,500 of ₹47,500.                                             │
│                                                                       │
│   [ Continue — add details to strengthen your case ]                 │
└──────────────────────────────────────────────────────────────────────┘
```

**Why this wins the demo:** it inverts the current product. Today the citizen does 20 minutes of work and then hopes. Here the citizen does 40 seconds of work and *watches the system work for them*. A judge feels this instantly.

## 5.3 Then: progressive case-building (not a form)

```
SCREEN 4 — "COMPLETE YOUR CASE"     [████████░░ 60% complete]

  A chat/wizard hybrid. Autosaves. Resumable from SMS link. Editable
  after submission — every edit versioned and visible to the IO.

  ✓ What was taken            (done — parsed from SMS)
  ✓ How they contacted you    (paste/forward the WhatsApp, SMS, or call log)
  ○ What they said            🎤 speak it — transcribed, translated,
                                 summarised into the official narrative
  ○ Evidence                  📱 share-sheet from any app · gallery ·
                                 WhatsApp chat export · call recording
  ○ Who you are               Prefilled via DigiLocker if you consent
```

**AI intake panel (always visible, always editable):**

```
  ┌────────────────────────────────────────────────────────────┐
  │  What we understood                          [ Edit ]      │
  │                                                             │
  │  Category   : Financial Fraud → UPI Fraud → Digital Arrest  │
  │  Sections   : BNS 318(4), 319(2) · IT Act s.66D             │
  │  Modus      : Impersonation of law enforcement +            │
  │               coerced transfer under video call             │
  │  Routing    : ⚑ Auto-routed — you don't need to choose      │
  │                                                             │
  │  ⚠ 213 other people reported this same VPA in 30 days.      │
  │    Your case has been linked to cluster #CL-8821.           │
  └────────────────────────────────────────────────────────────┘
```

That last box is principle #10 in action: **duplicate-complaint clustering**. It's also the single most persuasive slide for the government officials in the Bangalore room, because it directly attacks the 1.4% conversion problem — one investigation, 213 victims.

## 5.4 Live case tracker (replaces "Under Process")

```
CASE PRH-2026-08-4471X                        ₹47,500 · filed 21 Aug, 21:16

●━━━━━━━●━━━━━━━●━━━━━━━○───────○───────○
Filed   Frozen  Routed  Assigned  FIR   Money back

✅ Filed                21 Aug 21:16
✅ Money held           21 Aug 21:17   ₹47,500 held across 2 banks
✅ Routed               21 Aug 21:22   → Cyber PS, Pune City (auto)
🟡 Assigned to officer  SLA: 48 h   ⏱ 31 h remaining
                        Owner: Inspector, Cyber PS Pune City
                        Next: an IO will call you from a verified number
⚪ FIR / e-Zero FIR     Auto-triggers if loss ≥ ₹10 L or cluster ≥ 50 victims
⚪ Money restoration    We will file this FOR you the moment FIR is registered

                                   [ ⚡ Escalate — SLA at risk ]
```

Three deliberate design choices:
- **The money-back stage is on the main timeline from day one**, so the victim knows it exists. Today it's invisible.
- **The system files the restoration application on the victim's behalf.** Removing victim-initiation is the highest-leverage fix available for the 2.18% number.
- **Escalation is a button, not a phone directory.** It routes up the S4C → I4C chain with the SLA breach attached as evidence.

## 5.5 The other four surfaces

**(a) Scam Check — prevention, and the growth engine**
```
   Paste a UPI ID, phone number, link, or account number
   ┌─────────────────────────────────────┐
   │ rahul.verma@ybl                     │  [ Check ]
   └─────────────────────────────────────┘

   🔴 HIGH RISK
   213 fraud reports in the last 30 days · ₹1.2 crore reported
   First reported 4 Aug 2026 · Active cluster CL-8821
   → Do not pay. [ Report this ]  [ Share this warning ]
```
This is the "crazier idea" the rules video asks for. It turns a complaints database into a public utility, it's the reason someone visits Prahari *before* being defrauded, and it's genuinely feasible — the data already exists inside NCRP.

**(b) Officer Verify — the anti-digital-arrest primitive**
```
   Someone claiming to be police contacted you?

   Enter the code they gave you:  [ ________ ]
   or the number that called you: [ ________ ]

   ✅ VERIFIED — SI Anil Kadam, Cyber PS Pune City,
      calling about YOUR case PRH-2026-08-4471X
   ❌ NOT FOUND — No officer is contacting you about any case.
      Police NEVER arrest you over a video call. [ Report this call ]
```
Every genuine officer contact generates a code tied to a real case; every fake one fails. This single feature attacks the highest-loss scam category in India today, and it costs almost nothing to implement.

**(c) Assisted / Guardian mode**
File on behalf of a parent with their consent; a WhatsApp bot and an IVR path for feature phones; a "helper" role that a bank employee, a relative, or a CSC operator can use. Directly targets the 71%-basic-phone / 13%-internet reality of the elderly victim population.

**(d) Public transparency dashboard**
Rupees reported / held / **returned**, by state, by month, with SLA compliance per state. Publishing "returned" is the accountability lever that makes every other fix stick.

## 5.6 The second product: "Freeze the amount, not the person"

This is the counterpart surface, aimed at the collateral victims of §B0. It is the differentiator — build it.

### Micro-lien engine (replaces the blanket freeze)

Today the interdiction instruction is effectively binary: *freeze this account*. The redesign makes it **amount-specific and per-hop**:

```
   Disputed amount at this hop:  L = ₹5,000
   Account balance:              B = ₹10,00,000

   OLD:  freeze(account)              → ₹10,00,000 unusable
   NEW:  lien(account, L)             → ₹5,000 held
                                        ₹9,95,000 remains fully usable
```

Plus **hop-decay**: confidence that funds at hop *n* are actually tainted falls with each hop. Beyond hop 2, default to a lien on the traced quantum only, flag for human review at CFMC, and never suspend the account's payment rails. Business continuity is preserved for legitimate economic actors by default, not by appeal.

### Self-service dispute portal — the digital NOC

Four steps replacing months of travel and paper:

```
 1. INSTANT NOTIFICATION   The moment a lien is placed, the account holder gets
    ─────────────────────  SMS + email with the amount, the reason, a case
                           reference, and a secure direct link. Today they get
                           silence and a declined transaction.

 2. AUTHENTICATE & UPLOAD  Aadhaar/DigiLocker OTP → upload proof the credit was
    ─────────────────────  legitimate: invoice, sales contract, service
                           agreement, chat with the buyer.

 3. AI-ASSISTED TRIAGE     Document parser extracts and cross-checks the amount,
    ─────────────────────  date and counterparty against the flagged transaction,
                           and hands the IO a structured one-screen summary
                           instead of a folder of PDFs.

 4. CRYPTOGRAPHIC NOC      On approval, the system mints a digitally signed No
    ─────────────────────  Objection Certificate that calls the bank API and
                           lifts the lien automatically. No branch visit, no
                           paper, no travel.

    ⏱ SLA ENFORCEMENT      7-day bank review, 15-day IO decision (April 2026 MHA
                           SOP) enforced by a countdown timer. On breach, the
                           file AUTO-ESCALATES to the District Grievance Officer.
                           The SOP stops being paper and becomes code.
```

### What the innocent account holder sees

```
  ⚠ A hold has been placed on ₹5,000 in your account XXXX4471
    Reason: linked to reported fraud · Case ref CFC-2026-08-9912
    Your remaining balance of ₹9,95,000 is fully available.

    Believe this is a mistake?          [ Dispute in 2 minutes ]

    Bank review    ⏱ 5 days 03 h remaining
    IO decision    ⏱ not started (starts after bank review)
    If either clock expires, this escalates automatically.
```

Compare that to the status quo — a declined card at a till, no notification, no reason, no reference number, and a phone call to a branch that tells you it cannot help. **This screen alone is a top-250 submission.**

---

# 6. Reference architecture (scalable, secure)

> For the hackathon this is *mocked*. But you must be able to explain it in the second minute of the video, and government officials will ask about it in Bangalore. Design it as if it ships.

## 6.1 System diagram

```
   Citizens (web / PWA / WhatsApp / IVR-1930)      Officers (state, district, PS)
              │                                              │
              ▼                                              ▼
    ┌────────────────────────────────────────────────────────────────┐
    │  Edge — CDN + WAF + DDoS + bot mgmt (multi-AZ, India regions)   │
    └────────────────────────────────────────────────────────────────┘
              │
    ┌────────────────────────────────────────────────────────────────┐
    │  API Gateway / BFF — authn, rate limit, idempotency keys        │
    └────────────────────────────────────────────────────────────────┘
              │
   ┌──────────┴───────────────────────────────────────────────────────┐
   │                        CORE SERVICES                             │
   │                                                                   │
   │  Intake ──► Classification ──► Case ──► Routing ──► Notification  │
   │  Svc        Svc (LLM)          Svc      Svc         Svc           │
   │                                                                   │
   │  Freeze Orchestrator   Evidence Svc   Identity Svc   Shield API   │
   │  (saga, fan-out)       (encrypted)    (OTP/DigiLocker) (public)   │
   │                                                                   │
   │  Threat-Graph Svc      Restoration Svc     SLA/Escalation Engine  │
   └───────────────────────────────────────────────────────────────────┘
              │
    ┌────────────────────────────────────────────────────────────────┐
    │  Event bus (Kafka) — transactional outbox, exactly-once semantics│
    └────────────────────────────────────────────────────────────────┘
              │
   ┌──────────┴──────────┬──────────────┬───────────────┬────────────┐
   │ PostgreSQL          │ Object store │ Graph DB      │ ClickHouse │
   │ (cases; partitioned │ (evidence,   │ (money trail, │ (analytics,│
   │  by state+month)    │  per-case    │  mule network,│  dashboards)│
   │                     │  KMS keys)   │  clustering)  │            │
   └─────────────────────┴──────────────┴───────────────┴────────────┘
              │
    ┌────────────────────────────────────────────────────────────────┐
    │  Integration adapters (anti-corruption layer per partner)       │
    │  CFCFRMS/banks(85) · CCTNS · ICJS · DigiLocker · UIDAI ·        │
    │  SAHYOG (takedown) · NPCI/UPI · Sanchar Saathi / CEIR / TAFCOP  │
    └────────────────────────────────────────────────────────────────┘
```

## 6.2 Why this shape

**Freeze Orchestrator is the heart.** It is a **saga** with compensation, not a request/response. On complaint creation it emits `FreezeRequested`, fans out to N bank adapters in parallel with per-adapter circuit breakers, tracks per-institution acknowledgement SLAs, retries with exponential backoff, and streams state back to the citizen's receipt screen over SSE. Layer-2 fan-out is triggered automatically when an adapter returns exit details — the current manual chase becomes a recursive automated one.

**Scale envelope.** 2.3M complaints/yr ≈ 7 rps average; design for **500 rps burst** (scam waves are spiky) and note the write amplification: one complaint = up to 85 potential adapter calls. Stateless services + HPA; Kafka absorbs the burst so the citizen never waits on a slow bank.

**Micro-Lien Engine sits beside it.** The orchestrator decides *who* to contact; the lien engine decides *how much* and *how hard*. It emits per-hop `LienRequested(account, amount, hop_depth, confidence)` rather than `FreezeAccount(account)`, applies hop-decay to confidence, and refuses to escalate from lien → suspension → seizure without an explicit human decision recorded at CFMC. Every lien it places automatically fires a `NotifyAffectedParty` event — notification is structurally inseparable from enforcement, so it cannot be skipped.

**Intake stack.** Bhashini NLP for conversational intake across all 22 official languages (voice or text), with client-side OCR parsing bank statements, UPI receipts and chat screenshots to extract UTRs, IFSC codes, timestamps and account numbers. Validation moves from **restrictive client-side regex to server-side sanitisation** — the 200-character minimum and the special-character blacklist simply cease to exist. Draft state autosaves locally and to encrypted cloud storage continuously, so a session can never be lost.

**Data model choices.**
- Postgres partitioned by `state + month` for the encrypted relational audit trail — matches the query pattern (officers query their own state) and makes retention/purge tractable.
- A distributed NoSQL store (Cassandra/MongoDB) for high-throughput operational intake writes, decoupled from the relational tier.
- Graph DB (Neo4j) for the money trail and mule network — this is what makes multi-hop tracing, mule-cluster detection and `213 victims, 1 VPA` a query instead of a research project, and it is what feeds TAU.
- Redis for low-latency Suspect Registry lookups (the Scam Check path must answer in <100 ms).
- ClickHouse for the public dashboard and threat analytics.
- Object store with **per-case encryption keys**, so revoking access to one case is a key operation, not a scan.

**Zero-knowledge lookups for the Suspect Registry.** The public Scam Check API should answer "is this identifier flagged, and how heavily" **without exposing the underlying complaints or complainant identities**. ZK-proof-backed lookups let a citizen or a bank verify a risk assertion without the registry disclosing who reported it or what they said. Pair it with the mandatory appeal flow from §D5.

## 6.3 Security design

| Layer | Control |
|---|---|
| **Transport** | TLS 1.3 everywhere; mTLS between services; zero-trust, no implicit intra-cluster trust |
| **Citizen auth** | Mobile OTP → **passkeys** on return visits; optional DigiLocker for verified identity; SIM-swap detection before allowing OTP on a recently-ported number |
| **Anonymous track** | Anonymous complaints get a **claim token** (offline, printable) that later lets the reporter track or augment without ever revealing identity |
| **Officer auth** | Hardware-backed 2FA; **ABAC** — an officer can read only cases assigned to their jurisdiction and role; break-glass access requires a reason string and notifies a supervisor |
| **PII** | Field-level encryption for Aadhaar/PAN/account numbers; tokenised account references in the graph; **no PII in logs, ever**; data minimisation at intake (don't ask for Aadhaar before you need it) |
| **Evidence** | Hash-chained on upload → chain-of-custody provable in court; virus/CSAM scanning at ingest; CSAM auto-quarantined and never rendered in ordinary officer UIs |
| **Audit** | Append-only, hash-chained audit log of every read and write. **The citizen can see who accessed their case and when** — this is the trust feature nobody has |
| **Compliance** | DPDP Act 2023 (consent notice, purpose limitation, stated retention, grievance officer); CERT-In 6-hour incident reporting; annual VAPT + a bug bounty |
| **Anti-abuse** | Device fingerprinting, velocity limits, false-complaint scoring, graph-based detection of coordinated freeze abuse |
| **Anti-impersonation** | Signed officer-contact codes (the Officer Verify feature); DNS/brand monitoring for lookalike domains feeding straight into SAHYOG takedown |
| **Availability** | Multi-AZ active-active; the freeze path is the only truly critical path — it degrades to a queue-and-retry mode rather than failing |

## 6.3a Legal and regulatory alignment (say this out loud in Bangalore)

| Framework | How the design maps to it |
|---|---|
| **DPDP Act 2023** | Data minimisation at intake (don't ask for Aadhaar/PAN before they're needed); AES-256 field-level encryption at rest, TLS 1.3 in transit; **dynamic consent logs the citizen can read**, showing which agency accessed their record and when; stated retention and purge |
| **IT Act 2000** | Workflows map complaint narratives to **s.66C** (identity theft), **s.66D** (cheating by personation), **s.67B** (CSAM) — the AI intake panel surfaces the sections so the citizen and the IO see the same legal frame |
| **BNSS / CrPC** | Lien and restoration actions carry a verifiable legal trail; s.91 CrPC / BNSS production requests and the **s.106(3) BNSS** notice-to-bank are first-class, logged system events rather than offline paperwork |
| **RBI limited-liability framework** | This is the sleeper feature. RBI's rules give a customer **zero liability for unauthorised electronic transactions reported within 3 days**. By recording an **immutable, signed submission timestamp** at the moment of 1930 or web intake, the platform hands the victim cryptographic proof that they reported inside the window — turning a reporting portal into an instrument that directly protects the victim's money under existing banking law. Surface this to the citizen as "✅ You reported within the RBI 3-day zero-liability window — here is your proof." No policy change required |
| **CERT-In** | 6-hour incident reporting; annual VAPT; public bug bounty |

## 6.3b Phased rollout (how this ships without taking the portal down)

**Phase 1 — Intake overhaul (lowest risk, highest visible win).** Responsive web + PWA; Bhashini conversational assistant; client-side OCR; passkeys + Aadhaar/DigiLocker SSO; autosaving drafts; the logistics-style visual tracker. **Delete the restrictive regex** and move to server-side sanitisation. Nothing downstream changes — this is pure frontend and intake-service work, and it alone would fix most of Class A.

**Phase 2 — Micro-liens and dispute resolution.** Extend the CFCFRMS API contract across onboarded institutions to accept amount-specific liens; launch the self-service dispute portal and cryptographic NOC; turn on instant SMS/email notification on every lien; wire the April 2026 SLA windows into an escalation engine. This is where the collateral-damage problem actually gets solved.

**Phase 3 — Event mesh and graph analytics.** Migrate the backend to Kafka-backed microservices; deploy the Neo4j fraud-graph engine for mule-cluster detection; establish **bi-directional real-time streaming with state CCTNS, e-FIR and judicial tracking** so the citizen tracker stops being static; add ZK-proof lookups to the Suspect Registry.

## 6.4 Frontend

Next.js PWA, offline-first (service worker queues a complaint drafted with no signal and submits when connectivity returns — genuinely important in rural India). Performance budget: **< 100 KB critical path, usable on 2G**. Hindi-first i18n with 12 languages including voice input/output. WCAG 2.2 AA, large touch targets, high-contrast mode, and a deliberate "shock mode" — bigger type, fewer choices per screen, calm copy — because users arrive panicking.

---

# 7. What to actually build in the next 6 days

Ideas > code, mock backend, browser-only, judged as a citizen. Ruthless prioritisation:

### Must ship (this is the demo)
1. **Screen 1 → 2 → 3: the 60-second freeze with the live receipt.** Animate the bank acknowledgements arriving. This is your first 30 seconds and it must land.
2. **SMS paste-and-parse** — feels like magic, is trivial to fake convincingly.
3. **AI intake panel** — free-text/voice → category + statute + auto-routing, shown as an editable card.
4. **Live case tracker with SLA clocks and the escalate button**, including the money-back lane on the timeline.
5. **Scam Check lookup** with seeded data showing a real cluster.
6. **Demo logins** — at least 3 seeded personas: fresh victim, mid-investigation case, money-returned case. Judges must be able to see a *finished* journey, not just an empty form.

7. **The collateral-victim journey** — a second demo login as an innocent merchant: lien notification → dispute in 2 minutes → SLA countdown → auto-NOC → lien lifted. **This is your differentiator. Do not cut it.** Include the "₹5,000 held, ₹9,95,000 available" screen — the contrast with a blanket freeze is the whole argument in one line.

### Should ship
8. **Officer Verify** — 30 seconds of demo, enormous narrative payoff.
9. **Language switcher + voice input** on the intake screen (even 2 languages proves the idea).
10. **Duplicate-cluster banner** ("213 others reported this VPA").
11. **RBI 3-day zero-liability proof** — a signed timestamp receipt on the freeze screen. One line of UI, real legal weight.

### Nice to have
12. Assisted/guardian mode; WhatsApp-bot mockup; public transparency dashboard with the ₹ returned metric; Suspect Registry appeal flow.

### The "before" shots worth capturing
Screen-record the real portal hitting the **200-character minimum**, the **special-character rejection** when you paste a UPI ID, and the **expired 30-minute OTP session**. Three seconds of each, cut against your version, is the most persuasive footage you can put in the video — and it costs nothing but a browser and ten minutes.

### Explicitly out of scope
Admin/officer console (not judged), real bank integrations, mobile app, real auth.

### Video plan (2 min, hard cap)
- **0:00–0:12** — the problem in one number: *"₹52,969 crore reported stolen. ₹167 crore returned. 2.18%."* Cut to 3 seconds of the real portal rejecting a pasted UPI ID.
- **0:12–0:50** — file a case live: paste SMS → freeze receipt → tracker. No narration of features; just do it.
- **0:50–1:00** — the second victim: the innocent merchant's lien notification → dispute → auto-NOC. *"We freeze the amount, not the person."*
- **1:00–2:00** — how you built it: architecture diagram; why freeze-first inverts the current flow; why micro-liens end the collateral cascade; why cluster-detection attacks the 1.4% FIR problem; what's mocked and what would be real.

### 250-word summary angle
Lead with two numbers — **2.18% of stolen money returned**, and **1.4% FIR conversion** — then the two inversions: *freeze first, ask later* and *freeze the amount, not the person*. Close by stating plainly that all of it is implementable on the existing NCRP/CFCFRMS 2.0 backend and enforces the government's own April 2026 SOP timelines rather than proposing new policy. That last sentence is aimed squarely at the officials in the Bangalore room, and it separates you from every submission that just reskinned the homepage.

---

# 8. Feature → judge-impact map

| Feature | Principle | What a citizen-judge feels in the first 60s |
|---|---|---|
| 60-second freeze receipt | 1 | "This actually did something for me instead of asking me for things" |
| SMS paste-and-parse | 1, 9 | "It already knows. I didn't have to type anything" |
| Category-free AI intake | 5 | "I didn't have to know what crime this legally is" |
| No jurisdiction question | 4 | Absence is the feature — nothing to be confused by |
| SLA clocks + named owner | 3 | "Someone specific is responsible and there's a deadline" |
| Money-back on the timeline | 6 | "Getting my money back is the actual goal here" |
| System files restoration for you | 6, 3 | "I don't have to know the law to get my money" |
| Cluster banner (213 victims) | 10 | "I'm not alone, and that means this will get investigated" |
| Scam Check | 7 | "I'd use this even if I hadn't been scammed" |
| Officer Verify | 8 | "This would have saved my father ₹8 lakh" |
| Voice + 22 languages (Bhashini) | 9 | "My mother could use this" |
| Micro-lien: ₹5,000 held, ₹9,95,000 free | 11 | "Wait — the current system freezes *everything*?" |
| Instant lien notification | 11 | "At least they'd tell me why my card stopped working" |
| Self-service dispute + auto-NOC | 11, 3 | "I wouldn't have to fly to another state to get my own money" |
| SLA countdown that auto-escalates | 12 | "There's a deadline and it enforces itself" |
| RBI 3-day zero-liability receipt | 6 | "This is proof the bank owes me" |

---

# 9. Open questions for Phase 2

1. ~~Is NCRP on the official list of 10 platforms?~~ **RESOLVED (22 Aug 2026).** Confirmed on-list at `buildwhatmovesindia.com`, shown alongside EPFO, MCA and UMANG. No "off-list, lower odds" penalty applies, and the evaluating team will have hands-on familiarity with the platform — which means the "before" footage in §7 lands with people who already recognise the pain.
2. Can we get screenshots/screen recordings of the *actual* current portal flow for a before/after in the video? (The site blocks programmatic access — needs a manual browser pass.)
3. Team: solo or two? If two, both must be registered and cross-enter emails **before** submission.
4. Hosting choice for the live link — Vercel is the safe default.
5. Do we build the officer-side at all, even as a mock? (Rules say it isn't judged — recommend no, except one screenshot in the architecture segment.)

---

# 10. Sources

- [I4C — National Cybercrime Reporting Portal (NCRP)](https://i4c.mha.gov.in/ncrp.aspx)
- [cybercrime.gov.in — Filing a Complaint](https://www.cybercrime.gov.in/Webform/Accept.aspx)
- [cybercrime.gov.in — State/UT Nodal & Grievance Officer list](https://www.cybercrime.gov.in/Webform/Crime_NodalGrivanceList.aspx)
- [cybercrime.gov.in — Check acknowledgement status](https://cybercrime.gov.in/Webform/chkackstatus.aspx)
- [NCRP–CFCFRMS Cyber Fraud SOP 2026 (detailed process, timelines, restoration, failure points)](https://www.prashantkanha.com/ncrp-cfcfrms-cyber-fraud-sop-2026/)
- [NCRP Portal Guide 2026 — step-by-step UX and common mistakes](https://blogs.nahar.om/fraud-cybercrime/ncrp-portal-guide/)
- [IMPRI — CFCFRMS: Strengthening India's Response to Digital Financial Fraud](https://www.impriindia.com/insights/policy-update/citizen-financial-cyber-fraud-reporting-and-management-system-cfcfrms-strengthening-indias-response-to-digital-financial-fraud/)
- [PIB — CFCFRMS 2.0 Platform](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2290377&reg=22&lang=1)
- [News on AIR — Over ₹7,000 crore saved through CFCFRMS](https://www.newsonair.gov.in/over-rs-7000-crore-saved-through-citizen-financial-cyber-fraud-reporting-and-management-system/)
- [Lok Sabha Q&A — CFCFRMS / NCRP figures (MHA)](https://xn--i1b5bzbybhfo5c8b4bxh.xn--11b7cb3a6a.xn--h2brj9c/MHA1/Par2017/pdfs/par2025-pdfs/LS05082025/2565.pdf)
- [Fox Mandal — Parliamentary Panel's Recommendations on Cybercrime (254th Report, Standing Committee on Home Affairs)](https://foxmandal.in/News/parliamentary-panels-recommendations-on-cybercrime/)
- [Ikigai Law — Fourth Report of the Parliamentary Committee on Empowerment of Women: Cyber Crimes and Cyber Safety of Women](https://www.ikigailaw.com/article/672/summary-of-the-fourth-report-of-the-parliamentary-committee-on-the-empowerment-of-women-on-cyber-crimes-and-cyber-safety-of-women)
- [Mondaq — Summary of the same Fourth Report (e-FIR conversion, lien refunds)](https://www.mondaq.com/india/social-media/1769942/summary-of-the-fourth-report-of-the-parliamentary-committee-on-the-empowerment-of-women-on-cyber-crimes-and-cyber-safety-of-women)
- [MediaNama — Parliamentary panel recommendations on digital payment fraud](https://www.medianama.com/2024/02/223-parliamentary-panel-report-digital-payment-fraud-2/)
- [Daily Pioneer — Parliament panel questions Big Tech; ₹22,495 crore lost in 2025](https://dailypioneer.com/news/panel-turns-heat-on-big-tech)
- [Vaarta — India Cybercrime Statistics 2025–2026](https://vaarta.space/blog/india-cybercrime-statistics-2025-2026-report)
- [IndiaSpend — DataViz: How India's Cyber Crime Incidence Is Rising](https://www.indiaspend.com/data-viz/dataviz-how-indias-cyber-crime-incidence-is-rising-972933)
- [data.gov.in — State/UT-wise NCRP cyber fraud statistics](https://www.data.gov.in/resource/stateut-wise-details-statistics-national-cyber-crime-reporting-portal-ncrp-related-cyber)
- [PIB / GlobalSecurity — Establishment of Cyber Crime Units, S4C/R4C states](https://www.globalsecurity.org/security/library/news/2025/12/sec-251209-india-pib01.htm)
- [MHA Digital Police — CCTNS](https://digitalpolice.gov.in/DigitalPolice/AboutUs)
- [MHA — CCTNS / ICJS features for police investigation](https://www.mha.gov.in/en/divisionofmha/women-safety-division/cctns)
- [News on AIR — Maharashtra launches India's first integrated state-level Cyber Command and Control Centre](https://newsonair.gov.in/maharashtra-launches-indias-first-integrated-state-level-cyber-command-and-control-center)
- [Deccan Herald — National portal best for cyber crime complaints (inter-state nodal officer flow)](https://www.deccanherald.com/amp/story/india%2Fkarnataka%2Fbengaluru%2Fnational-portal-best-for-cyber-crime-complaints-988520.html)
- [Deccan Herald — 88% of seniors offline; HelpAge urges action](https://www.deccanherald.com/india/karnataka/bengaluru/88-seniors-offline-helpage-urges-action-3585484)
- [ISACA — Trapped Virtually: Understanding Digital Arrest Scams](https://www.isaca.org/resources/news-and-trends/industry-news/2025/trapped-virtually-understanding-digital-arrest-scams)
- [The420.in — Digital Arrest Scams Explained](https://the420.in/digital-arrest-scams-explained-stages-prevention-india/)
- [Forbes India — What is the digital arrest scam](https://www.forbesindia.com/article/explainers/what-is-the-digital-arrest-scam-and-how-to-be-aware/2988963/1)
- [ThreatBlock — A Guide to the National Cyber Crime Reporting Portal](https://threatblock.in/blog/a-guide-to-the-national-cyber-crime-reporting-portal)
- [Build What Moves India — Rules & How to Participate (Varun Mayya, 21 Aug 2026)](https://www.youtube.com/watch?v=NjKwtdv9WPs)

**Additional input:** a parallel research pass supplied by the project owner (22 Aug 2026) contributed the CFMC / Pratibimb / TAU / NDISC module map, the concrete intake-validation defects (200-character minimum, special-character blacklist, 30-minute OTP window, 5 MB / 10 MB upload caps), the 250+ onboarded-institution figure, the April 2026 Grievance Redressal Module timelines, the multi-hop collateral-freeze analysis, the micro-lien and digital-NOC proposals, the Bhashini/OCR intake stack, the ZK-proof suspect-lookup idea, and the RBI 3-day zero-liability angle. Those points are integrated throughout §1.1, §3.2 (A0), §3.3 (B0), §3.4 (C5–C6), §3.5 (D5), §5.6 and §6.3a–b. **Before submission, spot-verify the specific validation limits (200 chars, character blacklist, 30-min OTP, upload caps) by hand in a browser** — they are the claims most likely to be challenged, and a screen recording settles the question permanently.

**Data-quality note:** the Wikipedia article on NCRP is a stub and gives a launch date of 11 Dec 2023, which contradicts I4C's own page (30 Aug 2019, evolving from an earlier child-exploitation-only portal). I4C's figure is the one used in this report. Loss figures for 2024 vary across sources (₹22,845 cr / ₹22,812 cr / ₹22,495 cr) depending on whether the basis is calendar year, reported vs. confirmed, and NCRP vs. CFCFRMS — cite the range, not a single number, in the submission.
