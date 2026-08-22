/**
 * Help content.
 *
 * Copy rules from docs/DESIGN-SYSTEM.md apply hardest here: second person,
 * active voice, no acronym without expansion, and never leave the reader
 * without a next step. The people reading this have just lost money or just
 * found their account restricted — they are not browsing.
 */

export interface FaqItem {
  q: string;
  a: string;
  cta?: { label: string; href: string };
}

export interface FaqGroup {
  id: string;
  title: string;
  blurb: string;
  items: FaqItem[];
}

export const FAQ: FaqGroup[] = [
  {
    id: "just-happened",
    title: "It just happened",
    blurb: "The first hour matters more than anything else you will do.",
    items: [
      {
        q: "Money just left my account. What do I do first?",
        a: "Report it now — before you gather documents, before you call anyone. Stolen money gets moved between accounts within minutes, and a hold can only catch what has not moved yet. Paste the message your bank sent you and we ask the banks to hold the money straight away. Everything else can wait.",
        cta: { label: "Report it now", href: "/freeze" },
      },
      {
        q: "How long do I have?",
        a: "There is no hard cutoff, but every minute lowers what can be recovered. Reporting inside the first hour gives the best chance. Reporting inside three days also matters for a separate reason: under Reserve Bank of India rules on unauthorised electronic transactions, reporting promptly protects you from liability. We stamp and sign the exact moment you report so you have proof.",
      },
      {
        q: "Do I need to create an account first?",
        a: "No. You can report without signing up, and we start contacting banks before we ask you for anything else. We verify your mobile number in the background while the money is already being held.",
      },
      {
        q: "I don't have the bank SMS. Can I still report?",
        a: "Yes. The message just saves you typing. You can enter the amount and what happened in your own words instead, and correct anything later — nothing is locked once submitted.",
        cta: { label: "Report it now", href: "/freeze" },
      },
      {
        q: "Should I call 1930 as well?",
        a: "Yes. 1930 is the real national cyber-fraud helpline and it is free. Sahaay is a student proof of concept and does not replace it. For a real incident, call 1930 and file at cybercrime.gov.in.",
      },
    ],
  },
  {
    id: "how-it-works",
    title: "How your case moves",
    blurb: "What happens after you report, and who is responsible at each step.",
    items: [
      {
        q: "What does 'holding my money' actually mean?",
        a: "We ask every bank or wallet in the chain to place a hold on the disputed amount so it cannot be withdrawn or moved on. A hold is not the same as getting your money back — it stops the money leaving while your case is investigated. Getting it returned is a later step, and we start that one for you automatically.",
      },
      {
        q: "Why does it say some money 'already moved on'?",
        a: "Fraud networks split stolen money across several accounts within minutes. If it left before our request reached that bank, the bank tells us where it went and we follow it automatically. We show you this honestly rather than hiding it — it is the main reason recovery is hard.",
      },
      {
        q: "Which police station handles my case?",
        a: "We work it out from the money trail, not from your address. You are never asked to choose a state or district, because cybercrime has no geography — the victim, the account and the person behind it are usually in three different places.",
      },
      {
        q: "Nothing has happened for days. What can I do?",
        a: "Open your case and look at the clock. Every stage has a deadline and a named owner. If a deadline passes, the case escalates on its own — and you can push it up yourself with one tap. You never need to find a nodal officer's phone number.",
        cta: { label: "Track a case", href: "/dashboard" },
      },
      {
        q: "Will I actually get my money back?",
        a: "Honestly: often not, and that is the failure this project is about. Across India's real system, roughly ₹52,969 crore has been reported stolen, about ₹7,647 crore was frozen, and only around ₹167 crore has reached victims — about 2.18%. Most victims never even learn that a money-restoration process exists, because they have to start it themselves. Here we file it for you the moment it becomes possible.",
      },
    ],
  },
  {
    id: "frozen",
    title: "My account has a hold and I did nothing wrong",
    blurb:
      "You are not a suspect. This is the most common way honest people get caught up in someone else's fraud.",
    items: [
      {
        q: "Why is there a hold on my account?",
        a: "Someone paid you with money that, several transfers earlier, had been reported stolen. You may have sold something, invoiced a client, or simply been paid. The hold covers only the disputed amount — the rest of your balance still works normally, including cards, UPI and transfers.",
      },
      {
        q: "Is my whole account frozen?",
        a: "No. Only the specific disputed amount is held. This is the core difference from the current system, where one small disputed credit routinely freezes an entire account — a business with ten lakh of working capital losing all of it over five thousand rupees.",
      },
      {
        q: "How do I get the hold removed?",
        a: "Open the notice we sent you and show us the payment was legitimate — an invoice, a chat with the buyer, or a bank statement. A bank review is owed within 7 days and an officer's decision within 15. Both clocks are visible to you and escalate automatically if missed.",
        cta: { label: "See my holds", href: "/dashboard" },
      },
      {
        q: "Do I have to visit a branch or travel to another state?",
        a: "No. That is exactly what this replaces. Today an affected person often has to reach a cyber cell in a different state and collect a paper No Objection Certificate by hand, which can take months. Here the certificate is issued digitally and sent to your bank automatically.",
      },
      {
        q: "Will this affect my credit score or record?",
        a: "A hold is not an accusation and not a criminal record. If your explanation is accepted, the hold is lifted and the matter ends there.",
      },
    ],
  },
  {
    id: "safety",
    title: "Staying safe",
    blurb: "The two questions worth asking before you pay anyone.",
    items: [
      {
        q: "Someone claiming to be the police says I am under 'digital arrest'.",
        a: "There is no such thing as a digital arrest. Police in India do not arrest anyone over a video call, do not demand payment to clear your name, and do not ask you to stay on camera. Hang up. If a real officer is contacting you about a real case, they will have a code you can check here in seconds.",
        cta: { label: "Verify an officer", href: "/verify-officer" },
      },
      {
        q: "How do I check if a UPI ID or number is a scam?",
        a: "Paste it into Scam Check. We tell you how many people have already reported it and how much they lost. No reports is not proof of safety — most frauds are reported only after the money is gone — but a heavily reported identifier is a clear warning.",
        cta: { label: "Check something", href: "/scam-check" },
      },
      {
        q: "Will anyone from Sahaay ask for my OTP or password?",
        a: "Never. Nobody legitimate will — not a bank, not the police, not us. Anyone asking for an OTP is committing the fraud, whatever they say their reason is.",
      },
      {
        q: "My identifier is listed and I run a legitimate business.",
        a: "Being reported is not proof of anything, and honest businesses do get flagged by mistake or maliciously. You can contest it, and we mark it as disputed straight away so anyone checking sees that.",
        cta: { label: "Appeal a listing", href: "/scam-check/appeal" },
      },
    ],
  },
  {
    id: "about",
    title: "About this site",
    blurb: "What Sahaay is, and what it deliberately is not.",
    items: [
      {
        q: "Is this the official government portal?",
        a: "No. Sahaay is an independent student proof of concept built for the Build What Moves India hackathon. It is not affiliated with I4C, the Ministry of Home Affairs, or cybercrime.gov.in. No real complaint is filed here, no real bank is contacted, and every case and response you see is fictional. Real incidents go to cybercrime.gov.in or 1930.",
      },
      {
        q: "Is my data safe here?",
        a: "Nothing you type is sent anywhere except, if you use the 'tell us what happened' box, to a language model that classifies it. Cases live in your own browser and disappear when you clear site data. Please do not enter real personal or banking details.",
      },
      {
        q: "Why does this focus only on financial fraud?",
        a: "Because that is where the failure is largest and most measurable. Harassment, impersonation and account takeover follow the same principles here — act first, show a running clock, name an owner — but the money path is where a redesign can be proven with numbers.",
      },
    ],
  },
];
