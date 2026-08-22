"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { parseSms, SAMPLE_SMS } from "@/lib/sms-parser";
import { formatPaise } from "@/lib/money";
import { useStore } from "@/lib/store";
import { planFanOut } from "@/lib/mock/banks";
import type { FreezeRequest } from "@/lib/types";

/**
 * Screen 2 — Freeze first.
 *
 * Three fields. The bank already sent the victim an SMS containing every
 * detail the form needs; the real portal makes them hand-transcribe a
 * 12-digit UTR instead, where one typo silently misroutes the freeze.
 */
export default function FreezePage() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [mobile, setMobile] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const createCase = useStore((s) => s.createCase);

  const parsed = useMemo(() => parseSms(raw), [raw]);
  const tx = parsed.transaction;
  const canSubmit = Boolean(tx) && mobile.replace(/\D/g, "").length >= 10;

  function submit() {
    if (!tx || submitting) return;
    setSubmitting(true);

    const c = createCase({
      kind: "financial",
      transaction: tx,
      narrative: "",
      email: useStore.getState().currentEmail ?? "guest@demo",
    });

    // Plan the fan-out now so the receipt page can stream acknowledgements.
    const { debit, beneficiary, layer2 } = planFanOut(tx.bank);
    const now = new Date().toISOString();
    const freezes: FreezeRequest[] = [
      {
        institutionId: debit.id,
        institutionName: debit.name,
        role: "debit",
        ack: "pending",
        heldPaise: 0,
        requestedAt: now,
        respondedAt: null,
      },
      {
        institutionId: beneficiary.id,
        institutionName: beneficiary.name,
        role: "beneficiary",
        ack: "pending",
        heldPaise: 0,
        requestedAt: now,
        respondedAt: null,
      },
      {
        institutionId: layer2.id,
        institutionName: layer2.name,
        role: "layer2",
        ack: "pending",
        heldPaise: 0,
        requestedAt: now,
        respondedAt: null,
      },
    ];

    useStore.setState((s) => ({
      cases: s.cases.map((x) => (x.id === c.id ? { ...x, freezes } : x)),
    }));

    router.push(`/receipt/${c.id}`);
  }

  return (
    <>
      <TopBar back={{ href: "/", label: "Back" }} />
      <Shell>
        <p className="mb-2 text-[15px] font-semibold uppercase tracking-wide text-ink-faint">
          Step 1 of 2
        </p>
        <h1 className="text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          Let&apos;s hold your money first
        </h1>
        <p className="mt-3 text-ink-soft">
          Paste the message your bank sent you. We&apos;ll read the details out
          of it — you don&apos;t have to type any numbers.
        </p>

        <div className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="sms"
              className="mb-2 block text-[17px] font-semibold text-ink"
            >
              The bank message
            </label>
            <textarea
              id="sms"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={5}
              placeholder="Paste the SMS or notification here…"
              className="w-full resize-y rounded-xl border border-line-strong bg-surface p-4 text-[17px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="py-1 text-[15px] text-ink-faint">
                No message handy?
              </span>
              {SAMPLE_SMS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setRaw(s.text)}
                  className="rounded-full border border-line-strong bg-surface px-3 py-1 text-[15px] font-medium text-primary hover:bg-primary-soft"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {tx ? (
            <Card className="border-held/30 bg-held-soft">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[17px] font-semibold text-ink">
                  We read this from your message
                </p>
                <Chip tone="held">✓ Auto-filled</Chip>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Field label="Amount" value={formatPaise(tx.amountPaise)} big />
                <Field label="Bank" value={tx.bank} />
                <Field label="Paid by" value={tx.rail.toUpperCase()} />
                <Field
                  label="When"
                  value={new Date(tx.occurredAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                {tx.counterparty ? (
                  <Field label="Sent to" value={tx.counterparty} wide />
                ) : null}
                {tx.reference ? (
                  <Field label="Reference" value={tx.reference} wide />
                ) : null}
              </dl>
              <p className="mt-4 text-[15px] text-ink-soft">
                Something wrong? You can correct any of this after we&apos;ve
                asked the banks to hold your money.
              </p>
            </Card>
          ) : raw.trim() ? (
            <Card className="border-pending/30 bg-pending-soft">
              <p className="text-[17px] font-semibold text-ink">
                We couldn&apos;t find an amount in that message
              </p>
              <p className="mt-1 text-[16px] text-ink-soft">
                Paste the full message, or tap one of the examples above. We
                accept any format — including the {"@"} and {"#"} characters the
                official portal rejects.
              </p>
            </Card>
          ) : null}

          <div>
            <label
              htmlFor="mobile"
              className="mb-2 block text-[17px] font-semibold text-ink"
            >
              Your mobile number
            </label>
            <input
              id="mobile"
              inputMode="numeric"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile"
              className="tnum w-full rounded-xl border border-line-strong bg-surface p-4 text-[19px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
            />
            <p className="mt-2 text-[15px] text-ink-soft">
              We verify this in the background. Your money is being held while
              that happens — you are not waiting on an OTP.
            </p>
          </div>

          <Button onClick={submit} disabled={!canSubmit} className="w-full">
            {submitting ? "Sending…" : "Send freeze request now"}
          </Button>

          <p className="text-center text-[15px] text-ink-faint">
            No account needed. Details come afterwards.
          </p>
        </div>
      </Shell>
    </>
  );
}

function Field({
  label,
  value,
  big,
  wide,
}: {
  label: string;
  value: string;
  big?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-[15px] font-medium text-ink-faint">{label}</dt>
      <dd
        className={
          big
            ? "tnum text-[24px] font-bold text-ink"
            : "tnum break-words text-[17px] font-semibold text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}
