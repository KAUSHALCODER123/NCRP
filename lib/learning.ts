/**
 * Learning Corner.
 *
 * The real NCRP has one, and it is a page of downloadable PDFs and posters.
 * The problem is not that the advice is wrong — it is that it is generic,
 * undated, and disconnected from what is actually happening this week, even
 * though the same organisation holds the largest fraud-signal corpus in India.
 *
 * Two changes here:
 *  - Every scam is written as a script: how it opens, the exact words used,
 *    the one tell that gives it away, and what to do. People recognise a
 *    script far more reliably than they recognise a category name.
 *  - Each entry is linked to live report counts, so "trending now" is real.
 */

export type Audience =
  | "senior"
  | "student"
  | "women"
  | "business"
  | "everyone";

export interface Scam {
  slug: string;
  name: string;
  alsoCalled: string[];
  oneLine: string;
  /** Cluster identifier in lib/mock/clusters.ts, when we have live signal. */
  clusterId?: string;
  audiences: Audience[];
  /** How the approach begins. */
  opens: string;
  /** The words they actually use — recognisable, not paraphrased. */
  script: string[];
  /** The single most reliable giveaway. */
  tell: string;
  /** Why it works — said without blaming the victim. */
  whyItWorks: string;
  doNow: string[];
  ifYouPaid: string;
}

export const AUDIENCES: { id: Audience; label: string; note: string }[] = [
  { id: "everyone", label: "Everyone", note: "The ones that reach the most people" },
  { id: "senior", label: "Senior citizens", note: "Most targeted, least protected" },
  { id: "student", label: "Students & job seekers", note: "Money, jobs, and pressure" },
  { id: "women", label: "Women", note: "Image-based abuse and coercion" },
  { id: "business", label: "Small businesses", note: "Payments, holds and impersonation" },
];

export const SCAMS: Scam[] = [
  {
    slug: "digital-arrest",
    name: "Digital arrest",
    alsoCalled: ["CBI scam", "parcel scam", "video call arrest"],
    oneLine:
      "Someone in a police or CBI uniform video-calls you, says you are under investigation, and keeps you on camera until you pay.",
    clusterId: "CL-4417",
    audiences: ["senior", "everyone"],
    opens:
      "A call or WhatsApp video call, often starting with a courier company: a parcel in your name has been seized containing drugs, fake passports, or SIM cards.",
    script: [
      "\"A parcel booked with your Aadhaar has been seized at Mumbai airport.\"",
      "\"I am transferring you to the Cyber Crime branch. Do not disconnect.\"",
      "\"You are under digital arrest. You cannot leave the camera or tell anyone.\"",
      "\"Your accounts are under investigation. Transfer the funds to this RBI verification account and they will be returned within 24 hours.\"",
    ],
    tell:
      "There is no such thing as a digital arrest. No police force in India arrests anyone over a video call, and none will ever ask you to transfer money to 'verify' it.",
    whyItWorks:
      "It runs for hours. They keep you isolated, on camera, and too frightened to check with anyone — which is the whole design. Falling for it is not carelessness; it is what sustained fear does to anybody.",
    doNow: [
      "Hang up. You are allowed to. Nothing happens if you do.",
      "Tell one person in your family immediately — isolation is the weapon.",
      "If they gave you an officer's name or code, check it before believing anything.",
    ],
    ifYouPaid:
      "Report within the hour if you possibly can. Money moves through several accounts within minutes, and a hold only catches what has not moved yet.",
  },
  {
    slug: "otp-vishing",
    name: "The fake bank call",
    alsoCalled: ["vishing", "KYC update scam", "card blocked scam"],
    oneLine:
      "A caller who sounds exactly like your bank creates a small emergency, then asks you to confirm an OTP.",
    clusterId: "CL-6042",
    audiences: ["senior", "everyone"],
    opens:
      "An incoming call, often spoofed to show a real-looking bank number, sometimes right after a genuine transaction so the timing feels credible.",
    script: [
      "\"Your KYC has expired and your account will be blocked in 2 hours.\"",
      "\"We have detected a fraudulent transaction of ₹49,000. Was this you?\"",
      "\"To reverse it, I am sending an OTP. Please read it back to confirm your identity.\"",
      "\"Do not disconnect, sir, otherwise the reversal will fail.\"",
    ],
    tell:
      "Nobody legitimate ever needs your OTP. Not your bank, not the police, not a payment app. An OTP only ever authorises money leaving — never money coming back.",
    whyItWorks:
      "They manufacture urgency and then offer to help with it. The 'reversal' framing is deliberate: it makes reading out an OTP feel like protecting your money rather than giving it away.",
    doNow: [
      "Hang up and call the number printed on your own card or passbook.",
      "Never share an OTP, PIN, CVV or password — there is no exception to this.",
      "If you already read one out, block the card from your bank's app immediately.",
    ],
    ifYouPaid:
      "Report straight away and freeze the card. If you reported promptly, RBI rules on unauthorised electronic transactions work in your favour — keep proof of when you reported.",
  },
  {
    slug: "upi-collect-request",
    name: "The reverse UPI request",
    alsoCalled: ["collect request scam", "refund scam", "OLX scam"],
    oneLine:
      "They send you a request to *pay* while telling you it is how you *receive* money.",
    clusterId: "CL-8821",
    audiences: ["business", "student", "everyone"],
    opens:
      "You are selling something online, or expecting a refund. The buyer is friendly, often claims to be army personnel posted somewhere remote, and is in a hurry.",
    script: [
      "\"I'm sending the money now — just approve the request you get.\"",
      "\"Scan this QR code to receive the payment.\"",
      "\"The first ₹1 is a test transaction. Approve it and I'll send the rest.\"",
    ],
    tell:
      "You never enter your UPI PIN to receive money. Not once, not for a test, not ever. Entering your PIN always means money is leaving your account.",
    whyItWorks:
      "The interface genuinely is confusing, and a collect request looks almost identical to an incoming payment. This one catches careful people constantly.",
    doNow: [
      "Decline any request you did not initiate.",
      "Check the app's own wording: it always says 'paying' when money is leaving.",
      "For a sale, wait until the money is visible in your balance — not in a screenshot.",
    ],
    ifYouPaid:
      "Report the UPI ID immediately. These handles are usually reported by dozens of people within days, and clustered reports get investigated far faster than single ones.",
  },
  {
    slug: "task-job-scam",
    name: "The task and job scam",
    alsoCalled: ["work from home scam", "part-time job scam", "prepaid task fraud"],
    oneLine:
      "You are paid small amounts for simple tasks until you are asked to deposit money to unlock bigger ones.",
    audiences: ["student", "women", "everyone"],
    opens:
      "An unsolicited WhatsApp or Telegram message offering part-time work — liking videos, rating hotels, writing reviews.",
    script: [
      "\"Complete 3 tasks and receive ₹150. No investment needed.\"",
      "\"You have been upgraded to a prepaid task. Deposit ₹5,000 to unlock a ₹7,500 commission.\"",
      "\"Your withdrawal failed because the task set is incomplete. One more deposit will release everything.\"",
    ],
    tell:
      "You are asked to pay in order to get paid. A real job never requires that — and the small early payouts exist only to buy your trust.",
    whyItWorks:
      "The first payments are genuine. By the time a deposit is requested, the pattern feels proven, and the sunk cost makes stopping feel like losing.",
    doNow: [
      "Stop depositing. The withdrawal will never release, no matter how many more tasks you complete.",
      "Screenshot the whole chat before you are removed from the group.",
      "Report the UPI IDs and numbers you paid — every one of them.",
    ],
    ifYouPaid:
      "Report all the transactions together, not just the biggest one. The full chain is what lets investigators map the network.",
  },
  {
    slug: "investment-scam",
    name: "The investment group",
    alsoCalled: ["stock tip scam", "trading app scam", "crypto doubling"],
    oneLine:
      "A WhatsApp group full of enthusiastic members shows you profits on an app that only exists to show you profits.",
    audiences: ["everyone", "senior"],
    opens:
      "You are added to a group by a stranger, often named after a real broking firm, with a 'teacher' giving free tips that appear to work.",
    script: [
      "\"Members made 40% this week — see the screenshots.\"",
      "\"Install our institutional app, it isn't on the Play Store yet.\"",
      "\"To withdraw, you must first pay 20% tax on your profits.\"",
    ],
    tell:
      "You are asked to pay a fee, tax or margin to withdraw your own profits. The dashboard showing your balance is just a webpage — the money was never invested.",
    whyItWorks:
      "Most of the group are part of the operation. Watching other people succeed is far more persuasive than any sales pitch.",
    doNow: [
      "Do not pay the withdrawal fee. It is the last stage of the scam, not a way out.",
      "Check the entity on the SEBI register before believing any credential.",
      "Save the app link, group name and every account you paid.",
    ],
    ifYouPaid:
      "Report immediately and include the app link. These platforms are taken down and rebuilt constantly, so the link is evidence that expires.",
  },
  {
    slug: "loan-app-extortion",
    name: "Loan app extortion",
    alsoCalled: ["instant loan harassment", "predatory lending app"],
    oneLine:
      "A small instant loan turns into threats sent to everyone in your contact list.",
    audiences: ["student", "women", "everyone"],
    opens:
      "An app promising a loan in five minutes with no paperwork, which requests access to your contacts, photos and storage during install.",
    script: [
      "\"Your EMI is overdue. Pay now or we inform your contacts.\"",
      "\"We have your photos. Pay ₹20,000 today or they go to your family.\"",
    ],
    tell:
      "A legitimate lender never needs your contact list or your gallery, and never threatens to contact people you know.",
    whyItWorks:
      "The shame is the product. They rely on you paying quietly rather than telling anyone — which is exactly what makes reporting the right move.",
    doNow: [
      "Uninstall the app and revoke its permissions in your phone settings.",
      "Do not pay more. Payment increases the demands; it never ends them.",
      "Tell your family before the abusers do. It removes their only real leverage.",
    ],
    ifYouPaid:
      "Report it — this is extortion, not a debt. You have not done anything wrong, and nothing about the original loan makes the threats lawful.",
  },
  {
    slug: "sextortion",
    name: "Sextortion and image abuse",
    alsoCalled: ["video call blackmail", "morphed photo threat"],
    oneLine:
      "A stranger records or fabricates an intimate video call and threatens to send it to your contacts.",
    audiences: ["women", "student", "everyone"],
    opens:
      "A friendly stranger on social media moves quickly to a video call, which they record. Increasingly the images are simply generated and never existed at all.",
    script: [
      "\"I have recorded everything. I have your friends list.\"",
      "\"Pay ₹15,000 in the next hour and I will delete it.\"",
      "\"Someone will call claiming to be police or from YouTube — pay them to remove it.\"",
    ],
    tell:
      "The threat always comes with a deadline measured in minutes or hours. Real processes do not work that way; panic-buying does.",
    whyItWorks:
      "They are counting on you being too ashamed to tell anyone. Paying almost always leads to a second demand, because paying proves the leverage works.",
    doNow: [
      "Do not pay. Do not negotiate. Stop replying.",
      "Screenshot the profile, the messages and the payment demand.",
      "You can report this anonymously — you never have to give your name.",
    ],
    ifYouPaid:
      "Report anyway, and report every account you paid. Paying is not something to be embarrassed about; almost everyone who is targeted considers it.",
  },
  {
    slug: "fake-customer-care",
    name: "The fake helpline number",
    alsoCalled: ["search result scam", "customer care fraud"],
    oneLine:
      "You search for a company's helpline, call the number at the top, and reach a fraudster.",
    audiences: ["senior", "business", "everyone"],
    opens:
      "You have a genuine problem — a failed refund, a stuck delivery, a blocked account — and you search for support. The number you find is planted.",
    script: [
      "\"Install AnyDesk / TeamViewer so I can process the refund.\"",
      "\"Open your banking app and enter ₹1 so I can verify the account.\"",
      "\"Read me the code on your screen to complete the refund.\"",
    ],
    tell:
      "Any request to install a screen-sharing app is the scam, without exception. No real support agent needs to see or control your banking screen.",
    whyItWorks:
      "You initiated the call, so the usual suspicion never activates. That single detail does most of the work.",
    doNow: [
      "Get support numbers from the company's own app or your card, never from a search result.",
      "Uninstall any remote-access app immediately if you installed one.",
      "Change your banking password from a different device.",
    ],
    ifYouPaid:
      "Report immediately and tell your bank a remote-access app was installed — that changes how they secure the account.",
  },
];

export function scamBySlug(slug: string): Scam | undefined {
  return SCAMS.find((s) => s.slug === slug);
}

export function scamsFor(audience: Audience): Scam[] {
  if (audience === "everyone") return SCAMS;
  return SCAMS.filter((s) => s.audiences.includes(audience));
}
