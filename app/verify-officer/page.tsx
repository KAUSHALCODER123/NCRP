"use client";

import { useState } from "react";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";

/**
 * Officer Verify — the anti-digital-arrest primitive.
 *
 * "Digital arrest" scams work by impersonating Police/CBI/ED/RBI, often with
 * forged emails, SMS and lookalike gov.in domains. MHA has warned about this
 * since March 2024. The exploit is a trust asymmetry: a citizen has no way to
 * check whether the officer on the call is real.
 *
 * Every genuine officer contact generates a code tied to a real case. Every
 * fake one fails. It costs almost nothing to implement.
 */

const VALID_CODES: Record<
  string,
  { officer: string; station: string; caseId: string }
> = {
  "483921": {
    officer: "SI Anil Kadam",
    station: "Cyber PS, Pune City",
    caseId: "SHY-2026-08-2904",
  },
  "771204": {
    officer: "Inspector M. Raghavan",
    station: "Cyber PS, Chennai City",
    caseId: "SHY-2026-08-3312",
  },
};

export default function VerifyOfficerPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<"idle" | "valid" | "invalid">("idle");

  function verify() {
    const hit = VALID_CODES[code.replace(/\D/g, "")];
    setResult(hit ? "valid" : "invalid");
  }

  const hit = VALID_CODES[code.replace(/\D/g, "")];

  return (
    <>
      <TopBar back={{ href: "/", label: "Home" }} />
      <Shell>
        <h1 className="font-display text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          Is this really the police?
        </h1>
        <p className="mt-3 text-ink-soft">
          Every real officer who contacts you about a case gets a code tied to
          that case. Ask for it. Check it here.
        </p>

        <Card className="mt-6">
          <label htmlFor="code" className="block text-[17px] font-semibold text-ink">
            The 6-digit code they gave you
          </label>
          <input
            id="code"
            inputMode="numeric"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setResult("idle");
            }}
            placeholder="483921"
            className="data mt-2 w-full rounded-xl border border-line-strong bg-surface p-4 text-[24px] font-bold tracking-[0.2em] text-ink placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-faint focus:border-primary focus:outline-none"
          />
          <Button className="mt-3 w-full" onClick={verify} disabled={!code.trim()}>
            Check this officer
          </Button>
          <p className="mt-3 text-[15px] text-ink-faint">
            Demo codes: <span className="data font-semibold">483921</span> is
            real, anything else is not.
          </p>
        </Card>

        {result === "valid" && hit ? (
          <Card className="mt-5 border-held/30 bg-held-soft">
            <Chip tone="held">✅ Verified</Chip>
            <p className="mt-3 text-[22px] font-bold text-ink">{hit.officer}</p>
            <p className="text-[17px] text-ink-soft">{hit.station}</p>
            <p className="data mt-3 text-[16px] text-ink-soft">
              Contacting you about your case {hit.caseId}
            </p>
            <p className="mt-4 text-[16px] text-ink-soft">
              Even so: a real officer will never ask you for an OTP, a password,
              or a payment of any kind.
            </p>
          </Card>
        ) : null}

        {result === "invalid" ? (
          <Card className="mt-5 border-breach/30 bg-breach-soft">
            <Chip tone="breach">❌ Not found</Chip>
            <p className="mt-3 text-[22px] font-bold text-ink">
              No officer is contacting you about any case.
            </p>
            <p className="mt-2 text-[17px] text-ink-soft">
              Police do not arrest people over a video call. There is no such
              thing as a &ldquo;digital arrest&rdquo;. You are not in trouble —
              someone is trying to frighten you into paying.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href="/freeze" variant="secondary">
                I already paid them
              </Button>
              <Button href="/scam-check" variant="ghost">
                Check their number
              </Button>
            </div>
          </Card>
        ) : null}
      </Shell>
    </>
  );
}
