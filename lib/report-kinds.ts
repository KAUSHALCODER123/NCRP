/**
 * The non-financial report flows.
 *
 * These follow the same thesis as the money flow — act first, ask afterwards —
 * but the thing being raced is different. There is no money to hold, so the
 * urgent action is a takedown and a preservation request: content spreads, and
 * platforms delete logs on a retention clock, so the first minutes decide what
 * evidence still exists when an investigator finally looks.
 *
 * Anonymity is the default for crimes against women and children. That is
 * deliberate policy on the real portal and the reason many people report at
 * all — the Standing Committee on Home Affairs found underreporting driven by
 * stigma and fear of retaliation. An anonymous report still gets a claim token
 * so it can be tracked and added to later without ever attaching a name.
 */

export type ReportKind = "harassment" | "impersonation" | "account";

export interface Situation {
  id: string;
  label: string;
  sub: string;
  /** Shown immediately on selection — the one thing to do right now. */
  firstAction: string;
}

export interface KindConfig {
  kind: ReportKind;
  title: string;
  lede: string;
  /** Anonymous reporting available, and on by default. */
  anonymous: boolean;
  /** What the system races to do, in the citizen's words. */
  raceLabel: string;
  raceDetail: string;
  situations: Situation[];
  /** Places a takedown or preservation notice is sent. */
  targets: string[];
  /** Safety guidance shown before anything is collected. */
  safety: string[];
}

export const REPORT_KINDS: Record<ReportKind, KindConfig> = {
  harassment: {
    kind: "harassment",
    title: "Someone is threatening or blackmailing you",
    lede: "You have not done anything wrong, and you are not in trouble. You can do this without giving your name.",
    anonymous: true,
    raceLabel: "Getting the content taken down",
    raceDetail:
      "We ask the platforms to remove it and to preserve the account records before they are deleted on their own schedule.",
    situations: [
      {
        id: "intimate",
        label: "Private photos or videos of me are being used",
        sub: "Shared, threatened, or edited from ordinary photos.",
        firstAction:
          "Do not pay and do not reply. Screenshot the profile and the demand before you block — evidence disappears the moment they delete the account.",
      },
      {
        id: "blackmail",
        label: "Someone is demanding money to stay quiet",
        sub: "Sextortion, a threatened leak, or a fake recording.",
        firstAction:
          "Paying proves the leverage works and a second demand almost always follows. Stop replying and keep everything they sent you.",
      },
      {
        id: "stalking",
        label: "Someone will not leave me alone",
        sub: "Repeated messages, fake accounts, following me between apps.",
        firstAction:
          "Keep the messages rather than deleting them. A pattern across weeks is what makes this provable.",
      },
      {
        id: "child",
        label: "A child is involved",
        sub: "Content involving a minor, or a child being contacted.",
        firstAction:
          "This is treated as the highest priority and can be reported entirely anonymously. Do not share or forward the material to anyone, including to show what happened.",
      },
      {
        id: "other",
        label: "Something else",
        sub: "It does not match anything above.",
        firstAction:
          "Describe it in your own words below, in any language. A situation that does not fit the list is not a smaller problem — new methods appear before anyone has a name for them.",
      },
    ],
    targets: [
      "Instagram / Meta",
      "WhatsApp",
      "Telegram",
      "X",
      "YouTube",
      "The hosting provider",
    ],
    safety: [
      "Use a private device if someone else can see or check this one.",
      "Nothing here is stored on this device once you leave.",
      "You never have to give your name for this kind of report.",
    ],
  },

  impersonation: {
    kind: "impersonation",
    title: "Someone is pretending to be you",
    lede: "A fake profile, or your name and photos used to cheat other people.",
    anonymous: false,
    raceLabel: "Getting the fake account suspended",
    raceDetail:
      "We ask the platform to suspend it and to preserve its records, so the people already being contacted stop being deceived.",
    situations: [
      {
        id: "profile",
        label: "There is a fake profile using my name or photos",
        sub: "On social media, a marketplace, or a dating app.",
        firstAction:
          "Do not message the account yourself. Screenshot the profile URL and any conversations others have shown you.",
      },
      {
        id: "money",
        label: "Someone is asking my contacts for money as me",
        sub: "Friends or family being messaged for an urgent transfer.",
        firstAction:
          "Tell your contacts directly, on a channel the impersonator does not control. That stops the loss faster than any takedown.",
      },
      {
        id: "documents",
        label: "My documents or identity were used",
        sub: "A SIM, a loan, or an account opened in my name.",
        firstAction:
          "Check what is registered against you: TAFCOP shows every SIM in your name, and it is free.",
      },
      {
        id: "other",
        label: "Something else",
        sub: "It does not match anything above.",
        firstAction:
          "Describe it in your own words below, in any language. If you have a link or a username, that is the single most useful thing you can give us.",
      },
    ],
    targets: ["Instagram / Meta", "X", "The marketplace or app", "The hosting provider"],
    safety: [
      "Do not confront the account. It tells them to move before the records are preserved.",
      "Keep the profile link — it is the single most useful thing for a takedown.",
    ],
  },

  account: {
    kind: "account",
    title: "Your account was hacked",
    lede: "Email, social media, or banking access taken over.",
    anonymous: false,
    raceLabel: "Locking the intruder out",
    raceDetail:
      "We ask the provider to end every active session and to preserve the login records showing where the access came from.",
    situations: [
      {
        id: "email",
        label: "My email was taken over",
        sub: "The one that resets everything else.",
        firstAction:
          "Start here rather than anywhere else. Email is the master key — whoever holds it can reset every other account you own.",
      },
      {
        id: "social",
        label: "My social media account",
        sub: "Posting as me, or messaging my contacts.",
        firstAction:
          "Warn your contacts on a different channel. The account is being used to reach them, not you.",
      },
      {
        id: "banking",
        label: "My banking or payment app",
        sub: "Transactions I did not make, or a device I do not recognise.",
        firstAction:
          "If money has already left, report that first — it is a different and faster path.",
      },
      {
        id: "other",
        label: "Something else",
        sub: "It does not match anything above.",
        firstAction:
          "Describe it in your own words below. If you can still sign in, change the password now from a device you trust.",
      },
    ],
    targets: ["Google", "Meta", "The bank or payment app", "Your telecom operator"],
    safety: [
      "Change the password from a different device, not the one that may be compromised.",
      "Remove any screen-sharing app you were asked to install.",
    ],
  },
};

export function kindConfig(kind: string): KindConfig | null {
  return REPORT_KINDS[kind as ReportKind] ?? null;
}
