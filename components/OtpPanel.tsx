"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Button, Card, Chip } from "@/components/ui";
import { checkOtp } from "@/lib/validation";

/**
 * OTP with a full fallback architecture.
 *
 * Crucially, this never gates the freeze. The freeze request is already in
 * flight by the time this panel appears — verification runs alongside it.
 * Gating on OTP is what spends the golden hour on identity while the money is
 * still moving, and it is the single thing this project argues hardest against.
 *
 * The edge cases matter more than the happy path here. SIM swap is a common
 * component of the very frauds being reported, which means the verification
 * channel is sometimes the thing the attacker already controls.
 */

const DEMO_OTP = "483921";
const ALT_CHANNEL_AFTER_MS = 30_000;
const LOCKOUT_MS = 15 * 60_000;
const MAX_ATTEMPTS = 3;

type Channel = "sms" | "voice" | "whatsapp";

export function OtpPanel({
  mobile,
  onVerified,
  onBypass,
}: {
  mobile: string;
  onVerified: () => void;
  onBypass: (mode: "aadhaar" | "emergency") => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [channel, setChannel] = useState<Channel>("sms");
  // Lockout is measured against the same tick counter as everything else,
  // so nothing here has to read the wall clock during render.
  const [lockedAt, setLockedAt] = useState<number | null>(null);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (verified) return;
    const t = setInterval(() => setElapsed((e) => e + 1000), 1000);
    return () => clearInterval(t);
  }, [verified]);

  const locked = lockedAt !== null && elapsed - lockedAt < LOCKOUT_MS;
  const altAvailable = elapsed >= ALT_CHANNEL_AFTER_MS;
  const altIn = Math.max(0, Math.ceil((ALT_CHANNEL_AFTER_MS - elapsed) / 1000));

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    setError(null);
    if (d && i < 5) boxes.current[i + 1]?.focus();
    if (next.every((x) => x)) submit(next.join(""));
  }

  function onPaste(e: React.ClipboardEvent) {
    const v = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (v.length < 2) return;
    e.preventDefault();
    const next = Array(6)
      .fill("")
      .map((_, i) => v[i] ?? "");
    setDigits(next);
    if (v.length === 6) submit(v);
  }

  function submit(code: string) {
    if (locked) return;
    const c = checkOtp(code);
    if (!c.ok) {
      setError(c.error ?? "Enter all 6 digits");
      return;
    }
    if (code === DEMO_OTP) {
      setVerified(true);
      onVerified();
      return;
    }
    const left = attemptsLeft - 1;
    setAttemptsLeft(left);
    setDigits(Array(6).fill(""));
    boxes.current[0]?.focus();

    if (left <= 0) {
      // Lock generation on this number, not the whole session — and hand over
      // a route that does not depend on the phone at all.
      setLockedAt(elapsed);
      setError(null);
      return;
    }
    setError(`Incorrect OTP. You have ${left} attempt${left === 1 ? "" : "s"} remaining.`);
  }

  if (verified) {
    return (
      <Card className="border-held/30 bg-held-soft">
        <Chip tone="held">✅ Number verified</Chip>
        <p className="mt-2 text-[16px] text-ink-soft">
          Verified alongside the freeze — your money was never waiting on this.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[18px] font-semibold text-ink">
          Verify your number
        </p>
        <Chip tone="pending">Freeze already sent</Chip>
      </div>
      <p className="mt-1 text-[16px] text-ink-soft">
        We sent a 6-digit code to{" "}
        <strong className="data text-ink">+91 {mobile}</strong>
        {channel !== "sms" ? ` by ${channel === "voice" ? "voice call" : "WhatsApp"}` : ""}
        . Demo code: <strong className="data">{DEMO_OTP}</strong>
      </p>

      <div className="mt-4 flex gap-2" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              boxes.current[i] = el;
            }}
            value={d}
            disabled={locked}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1} of 6`}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0)
                boxes.current[i - 1]?.focus();
            }}
            className={clsx(
              "data h-14 w-full min-w-0 rounded-xl border-2 text-center text-[24px] font-bold text-ink focus:outline-none",
              error ? "border-breach" : "border-line-strong focus:border-primary",
              locked && "opacity-50",
            )}
          />
        ))}
      </div>

      {error ? (
        <p className="mt-2 text-[16px] font-semibold text-breach">✕ {error}</p>
      ) : null}

      {/* Locked out — hand over a route that does not need the phone. */}
      {locked ? (
        <div className="mt-4 rounded-xl border border-breach/30 bg-breach-soft p-4">
          <p className="text-[17px] font-semibold text-ink">
            Too many attempts
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            Codes for this number are paused for 15 minutes. Your freeze request
            is unaffected and still active.
          </p>
          <div className="mt-3 rounded-lg bg-surface p-3">
            <p className="text-[16px] font-semibold text-ink">
              📞 Call 1930 and skip the menu
            </p>
            <p className="mt-1 text-[16px] text-ink-soft">
              Press 1, then enter bridge code{" "}
              <strong className="data text-ink">884-219</strong> to go straight
              to an operator with your case already open.
            </p>
            <a
              href="tel:1930"
              className="mt-3 inline-flex min-h-[48px] items-center rounded-xl bg-primary px-5 font-semibold text-white"
            >
              Call 1930
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Alternate channels after 30s */}
          <div className="mt-4">
            {altAvailable ? (
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setChannel("voice")}>
                  📞 Get the code by call
                </Button>
                <Button variant="secondary" onClick={() => setChannel("whatsapp")}>
                  💬 Send on WhatsApp
                </Button>
              </div>
            ) : (
              <p className="data text-[15px] text-ink-faint">
                Didn&apos;t get the SMS? Other ways to receive it appear in{" "}
                {String(altIn).padStart(2, "0")}s.
              </p>
            )}
          </div>

          {/* SIM swap / device theft */}
          <details className="mt-4 rounded-xl border border-line bg-sunken p-4">
            <summary className="cursor-pointer list-none text-[17px] font-semibold text-ink">
              🚨 Can&apos;t use this number right now?
            </summary>
            <p className="mt-2 text-[16px] text-ink-soft">
              Phone stolen, SIM swapped, or no network. SIM swap is often part
              of the fraud itself — if that happened, this number is the one
              thing you should not have to rely on.
            </p>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => onBypass("aadhaar")}
                className="w-full rounded-xl border border-line-strong bg-surface p-4 text-left hover:bg-sunken"
              >
                <span className="block text-[17px] font-semibold text-ink">
                  Verify with Aadhaar or DigiLocker
                </span>
                <span className="mt-0.5 block text-[16px] text-ink-soft">
                  Use a different number, a family member&apos;s phone, or your
                  net-banking token.
                </span>
              </button>
              <button
                type="button"
                onClick={() => onBypass("emergency")}
                className="w-full rounded-xl border border-pending/40 bg-pending-soft p-4 text-left hover:bg-pending-soft/70"
              >
                <span className="block text-[17px] font-semibold text-ink">
                  Emergency bypass
                </span>
                <span className="mt-0.5 block text-[16px] text-ink-soft">
                  Issues a provisional case ID valid for 3 hours and sends an
                  interim freeze alert to your bank immediately. An officer
                  verifies your identity within that window.
                </span>
              </button>
            </div>
          </details>
        </>
      )}
    </Card>
  );
}
