/**
 * Field validation.
 *
 * Rule inherited from the research: validation exists to catch mistakes, never
 * to reject input. The real portal enforces a 200-character minimum and
 * rejects `# $ @ ^ * ' ~ | !` — so pasting a UPI handle, a URL or a
 * transaction log fails, which is to say the characters the crime is made of
 * are the characters the form forbids.
 *
 * Everything here therefore either (a) accepts and normalises, or (b) warns
 * without blocking. The only hard blocks are on fields where a wrong value
 * silently misroutes a freeze request to the wrong institution.
 */

export interface FieldCheck {
  ok: boolean;
  /** Blocking problems only. */
  error?: string;
  /** Non-blocking: shown, but never prevents submission. */
  warn?: string;
  /** Cleaned value to store. */
  value?: string;
}

/** Indian mobile: 10 digits starting 6-9. Tolerates +91, 0, spaces, dashes. */
export function checkMobile(raw: string): FieldCheck {
  const digits = raw.replace(/\D/g, "");
  const local = digits.replace(/^(91|0)(?=\d{10}$)/, "");

  if (!local) return { ok: false, error: "Enter your mobile number" };
  if (local.length < 10)
    return { ok: false, error: "That's too short — Indian numbers have 10 digits" };
  if (local.length > 10)
    return { ok: false, error: "That's too long — check for an extra digit" };
  if (!/^[6-9]\d{9}$/.test(local))
    return {
      ok: false,
      error: "Indian mobile numbers start with 6, 7, 8 or 9",
    };

  return { ok: true, value: local };
}

/**
 * UTR / transaction reference, validated per payment rail.
 *
 * A wrong reference is the one field that genuinely matters: the automated
 * freeze is dispatched against it, and a malformed value fails silently at the
 * bank gateway while the citizen believes their money is being held.
 *
 * So we check it hard — but we still never block. A victim who cannot find
 * their UTR must be able to file anyway; the manual-trace path costs the
 * investigation 15–45 minutes, and blocking costs them everything.
 */
export type Rail = "upi" | "imps" | "neft" | "rtgs" | "card" | "other";

const RAIL_RULES: Record<Rail, { re: RegExp; shape: string } | null> = {
  upi: { re: /^\d{12}$/, shape: "12 digits" },
  imps: { re: /^\d{12}$/, shape: "12 digits" },
  neft: { re: /^[A-Za-z]{4}[0-9]{7,16}$/, shape: "4 letters then 7–16 digits" },
  rtgs: {
    re: /^[A-Za-z]{4}[A-Za-z0-9]{16,18}$/,
    shape: "4 letters then 16–18 characters",
  },
  card: null,
  other: null,
};

export interface UtrCheck extends FieldCheck {
  /** How far off we are, so the UI can offer the right assist. */
  hint?: "too_short" | "too_long" | "wrong_shape";
  missingDigits?: number;
}

export function checkUtr(raw: string, rail: Rail = "upi"): UtrCheck {
  const v = raw.trim().replace(/[\s-]/g, "").toUpperCase();
  if (!v) return { ok: true, value: "" };

  const rule = RAIL_RULES[rail];
  if (!rule) return { ok: true, value: v };

  if (rule.re.test(v)) return { ok: true, value: v };

  // Numeric rails: say exactly how many digits are missing rather than
  // showing a generic "invalid format".
  if (rail === "upi" || rail === "imps") {
    const digits = v.replace(/\D/g, "");
    if (digits.length < 12) {
      return {
        ok: true,
        value: v,
        hint: "too_short",
        missingDigits: 12 - digits.length,
        warn: `That's ${digits.length} digits. ${rail.toUpperCase()} references are 12 — ${12 - digits.length} more to find.`,
      };
    }
    if (digits.length > 12) {
      return {
        ok: true,
        value: v,
        hint: "too_long",
        warn: `That's ${digits.length} digits. ${rail.toUpperCase()} references are 12 — you may have included the account number.`,
      };
    }
  }

  return {
    ok: true,
    value: v,
    hint: "wrong_shape",
    warn: `${rail.toUpperCase()} references look like ${rule.shape}. We'll still file it, and trace manually if it doesn't match.`,
  };
}

/** Pulls candidate references out of pasted text or OCR output. */
export function extractUtrCandidates(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(/\b\d{12}\b/g)) out.add(m[0]);
  for (const m of text.matchAll(/\b[A-Za-z]{4}[A-Za-z0-9]{7,18}\b/g))
    out.add(m[0].toUpperCase());
  for (const m of text.matchAll(/\b\d{10,22}\b/g)) out.add(m[0]);
  return [...out].slice(0, 8);
}

export const HIGH_SEVERITY_PAISE = 100_000_00; // ₹1,00,000

export function checkAmount(rupees: string): FieldCheck & { paise?: number } {
  const n = Number(rupees.replace(/[₹,\s]/g, ""));
  if (!rupees.trim()) return { ok: false, error: "How much was taken?" };
  if (Number.isNaN(n)) return { ok: false, error: "Enter the amount in numbers" };
  if (n <= 0) return { ok: false, error: "The amount must be more than zero" };

  const paise = Math.round(n * 100);
  return {
    ok: true,
    paise,
    warn:
      paise >= HIGH_SEVERITY_PAISE
        ? "High severity — an e-Zero FIR is registered automatically at this amount"
        : undefined,
  };
}

/** OTP: exactly 6 digits. */
export function checkOtp(raw: string): FieldCheck {
  const v = raw.replace(/\D/g, "");
  if (v.length !== 6) return { ok: false, error: "Enter all 6 digits" };
  return { ok: true, value: v };
}
