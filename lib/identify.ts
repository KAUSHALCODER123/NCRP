/**
 * Works out what kind of identifier someone pasted.
 *
 * The "where is it happening" field takes anything — a link, a username, a
 * phone number, or just an app name — because asking a frightened person to
 * classify their own evidence is the sort of question that stops people
 * reporting. The classification happens here instead.
 *
 * It is not cosmetic. A phone number and a profile link need different
 * takedown routes: a link goes to the platform, a number goes to the telecom
 * operator and to Chakshu, which is the channel that actually disconnects
 * connections. Getting that wrong sends the notice somewhere that cannot act
 * on it.
 */

export type IdentifierKind =
  | "phone"
  | "upi"
  | "url"
  | "username"
  | "app"
  | "unknown";

export interface Identified {
  kind: IdentifierKind;
  /** Cleaned form, suitable for matching against reported identifiers. */
  value: string;
  /** Extra places a notice must go, beyond the platform targets. */
  extraTargets: string[];
}

/** Indian mobile, tolerating +91, 0, spaces, dashes and brackets. */
const PHONE = /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/;
const UPI = /^[a-z0-9][a-z0-9._-]{1,48}@[a-z]{2,12}$/i;
const URL = /^(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/\S*)?$/i;
const HANDLE = /^@?[a-z0-9._]{2,30}$/i;

const APPS = [
  "whatsapp", "telegram", "instagram", "facebook", "snapchat", "x", "twitter",
  "youtube", "olx", "tinder", "bumble", "signal", "linkedin", "sharechat",
];

export function identify(raw: string): Identified {
  const input = (raw || "").trim();
  if (!input) return { kind: "unknown", value: "", extraTargets: [] };

  const digits = input.replace(/[\s\-()]/g, "");
  if (PHONE.test(digits)) {
    return {
      kind: "phone",
      // Store the 10-digit local form so it matches reported numbers.
      value: digits.replace(/^(?:\+?91|0)/, ""),
      /*
       * A number cannot be taken down by a platform. It goes to the operator
       * that issued the SIM, and to Chakshu, which is the route that actually
       * disconnects connections and blacklists handsets.
       */
      extraTargets: ["Your telecom operator", "Chakshu (Dept of Telecom)"],
    };
  }

  if (UPI.test(input)) {
    return {
      kind: "upi",
      value: input.toLowerCase(),
      // A payment handle is frozen by the bank behind it, not by a platform.
      extraTargets: ["The bank behind this UPI ID", "NPCI"],
    };
  }

  const lower = input.toLowerCase();
  if (APPS.includes(lower.replace(/[^a-z]/g, ""))) {
    return { kind: "app", value: lower, extraTargets: [] };
  }

  if (URL.test(input)) {
    return {
      kind: "url",
      value: lower.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      extraTargets: [],
    };
  }

  if (HANDLE.test(input)) {
    return { kind: "username", value: lower.replace(/^@/, ""), extraTargets: [] };
  }

  return { kind: "unknown", value: input, extraTargets: [] };
}

/** Key for the line explaining what we recognised. */
export function detectedKey(kind: IdentifierKind): string {
  return `rp.detected.${kind}`;
}
