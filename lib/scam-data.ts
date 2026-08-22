/**
 * Real, citable figures and real services.
 *
 * A deliberate line runs through this file. The identifier lookup elsewhere in
 * this project is seeded demo data, and it says so — publishing invented UPI
 * IDs or phone numbers as "reported fraudsters" would be defamatory if wrong,
 * and it is exactly the unverified-crowdsourcing defect this project
 * criticises in the real Suspect Registry.
 *
 * What can be shown honestly is: what actually happens in India, sourced and
 * dated; and where a person can check something for real, today, on a
 * government service that genuinely performs the lookup. Those are far more
 * useful than a fabricated database.
 *
 * Every figure here carries its source and its as-of date. Loss totals vary
 * between reports depending on whether the basis is calendar year, NCRP or
 * CFCFRMS, and reported versus confirmed — so the source is part of the fact.
 */

export interface Figure {
  value: string;
  label: string;
  detail: string;
  source: string;
}

/** National picture, calendar year 2025. */
export const NATIONAL_2025: Figure[] = [
  {
    value: "₹22,495 cr",
    label: "lost to cyber fraud in 2025",
    detail:
      "Across roughly 28.1 lakh complaints — a 24% rise on the year before.",
    source: "Ministry of Home Affairs / I4C, 2025",
  },
  {
    value: "76%",
    label: "of all money lost was investment fraud",
    detail:
      "It is 35% of cases but three quarters of the losses — the amounts per victim are enormous.",
    source: "MHA / I4C, 2025",
  },
  {
    value: "₹7,130 cr",
    label: "held before it reached criminals",
    detail:
      "Across about 23 lakh complaints reported through 1930 and cybercrime.gov.in.",
    source: "I4C, 2025",
  },
];

/** Share of complaints, and share of money, by scam type. */
export interface Slice {
  name: string;
  slug: string;
  cases: number;
  losses: number;
  note: string;
}

export const MIX_2025: Slice[] = [
  {
    name: "Investment fraud",
    slug: "investment-scam",
    cases: 35,
    losses: 76,
    note: "Fewer victims than you would expect, each losing far more.",
  },
  {
    name: "Sextortion",
    slug: "sextortion",
    cases: 19,
    losses: 4,
    note: "Nearly a fifth of all complaints. Almost certainly under-reported.",
  },
  {
    name: "Digital arrest",
    slug: "digital-arrest",
    cases: 6,
    losses: 9,
    note: "Small share of cases, disproportionate share of money.",
  },
];

/**
 * Services that actually perform a check, today.
 *
 * This is the honest answer to "is this a scam?" — India already runs real
 * lookups, and most people have never heard of them. Pointing at them is
 * worth more than any database this project could invent.
 */
export interface Service {
  name: string;
  run_by: string;
  what: string;
  when: string;
  href: string;
  impact?: string;
}

export const REAL_SERVICES: Service[] = [
  {
    name: "Chakshu",
    run_by: "Department of Telecommunications",
    what: "Report a suspicious call, SMS or WhatsApp message.",
    when: "Use this when no money has been lost yet — a call that felt wrong, a link you did not click.",
    href: "https://sancharsaathi.gov.in/",
    impact:
      "7.7 lakh reports since launch have led to 39.43 lakh connections disconnected, 2.27 lakh handsets blacklisted and 1.31 lakh SMS templates blocked (Rajya Sabha, Feb 2026).",
  },
  {
    name: "TAFCOP",
    run_by: "Department of Telecommunications",
    what: "See every mobile connection registered against your name, across all operators.",
    when: "Worth doing once a year. A SIM you did not take is how account takeovers start.",
    href: "https://sancharsaathi.gov.in/",
  },
  {
    name: "CEIR",
    run_by: "Department of Telecommunications",
    what: "Block a lost or stolen handset by its IMEI, on every network.",
    when: "The moment a phone goes missing — before someone uses the SIM inside it.",
    href: "https://sancharsaathi.gov.in/",
  },
  {
    name: "1930 · cybercrime.gov.in",
    run_by: "Indian Cyber Crime Coordination Centre",
    what: "Report a fraud where money has actually left your account.",
    when: "Immediately. This is the one that can get banks to hold the money.",
    href: "https://cybercrime.gov.in",
  },
];

/**
 * Red flags that need no database.
 *
 * Every one of these is checkable by the person in the moment, which makes
 * them more useful than a lookup — a fraudster can always move to a new UPI
 * ID, but they cannot stop needing you to do these things.
 */
export interface Flag {
  flag: string;
  why: string;
}

export const RED_FLAGS: Flag[] = [
  {
    flag: "You are asked to enter your UPI PIN to receive money",
    why: "A PIN only ever authorises money leaving. There is no exception, and no test transaction that needs one.",
  },
  {
    flag: "Someone in a uniform on a video call says you cannot tell your family",
    why: "There is no such thing as a digital arrest. The instruction to stay silent is the crime itself.",
  },
  {
    flag: "You are asked to install AnyDesk, TeamViewer or any screen-sharing app",
    why: "No genuine support agent needs to see or control your banking screen. This one has no honest version.",
  },
  {
    flag: "You must pay a fee, tax or margin to withdraw your own money",
    why: "Real profits do not require a payment to release. This is the last stage of an investment scam, not a way out.",
  },
  {
    flag: "The support number came from a search result rather than your own app",
    why: "Fraudulent helpline numbers are planted to rank highly. Take the number from your card or the official app.",
  },
  {
    flag: "A deadline measured in minutes",
    why: "Urgency is manufactured so you cannot check. Nothing legitimate collapses because you called back in an hour.",
  },
];

export const SOURCES = [
  {
    label: "Ministry of Home Affairs / I4C cybercrime figures, 2025",
    href: "https://www.i4c.mha.gov.in/",
  },
  {
    label: "Sanchar Saathi — Chakshu, TAFCOP and CEIR",
    href: "https://sancharsaathi.gov.in/",
  },
  {
    label: "National Cyber Crime Reporting Portal",
    href: "https://cybercrime.gov.in",
  },
];
