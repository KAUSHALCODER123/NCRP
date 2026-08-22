"use client";

import { cloneElement, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { EvidenceUploader, type Autofill } from "@/components/EvidenceUploader";
import { OtpPanel } from "@/components/OtpPanel";
import { parseSms, SAMPLE_SMS } from "@/lib/sms-parser";
import { clearDraft, saveDraft, useDraft } from "@/lib/draft";
import { useNow } from "@/lib/use-now";
import { useT } from "@/lib/i18n";
import { reportSignal } from "@/lib/signal";
import { formatPaise } from "@/lib/money";
import { useStore } from "@/lib/store";
import { planFanOut } from "@/lib/mock/banks";
import { BANK_DIRECTORY, bankByName, NON_BANK_ROUTE } from "@/lib/mock/directory";
import {
  checkAmount,
  checkMobile,
  checkUtr,
  HIGH_SEVERITY_PAISE,
  type Rail,
} from "@/lib/validation";
import type { FreezeRequest, Rail as TxRail } from "@/lib/types";

/**
 * Emergency financial freeze — triage, then dispatch.
 *
 * The ordering is the argument. Triage and transaction details come first;
 * the freeze goes out the moment we have an amount and a bank; identity
 * verification runs alongside it, never in front of it.
 *
 * Draft state is cached continuously, because the real portal's 30-minute OTP
 * window silently discards a half-filled form when someone steps away to fetch
 * a bank statement.
 */

type When = "under2h" | "2to24h" | "over24h";

/*
 * Each option says what happens for THAT person, never how they rank against
 * the others. An earlier version read "highest chance" / "still worth it" /
 * "report anyway", which told someone arriving on day three that they were a
 * lost cause — at the exact moment they had finally worked up to reporting.
 * Most people do not notice a fraud within two hours, and a late report still
 * freezes the account and strengthens every other case against the same
 * people. All of that is true, so it is what we say.
 */
const WHEN_OPTIONS = [
  { id: "under2h", label: "fz.when1", note: "fz.when1sub" },
  { id: "2to24h", label: "fz.when2", note: "fz.when2sub" },
  { id: "over24h", label: "fz.when3", note: "fz.when3sub" },
] as const;

export default function FreezePage() {
  const router = useRouter();
  const createCase = useStore((s) => s.createCase);
  const t = useT();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [when, setWhen] = useState<When | null>(null);
  const [called1930, setCalled1930] = useState<boolean | null>(null);
  const [incidentId, setIncidentId] = useState("");

  const [raw, setRaw] = useState("");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [rail, setRail] = useState<Rail>("upi");
  const [utr, setUtr] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [nonBank, setNonBank] = useState(false);
  const [mobile, setMobile] = useState("");

  const [caseId, setCaseId] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);
  const [dismissedRestore, setDismissedRestore] = useState(false);
  const draft = useDraft();
  const now = useNow();

  /* ---- Draft cache: survive a closed tab, a dead battery, a stepped-away user */
  useEffect(() => {
    if (!amount && !raw && !bank) return;
    saveDraft({ when, raw, amount, bank, rail, utr, counterparty, mobile });
  }, [when, raw, amount, bank, rail, utr, counterparty, mobile]);

  useEffect(() => {
    function warn(e: BeforeUnloadEvent) {
      if (amount || raw) e.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [amount, raw]);

  /* ---- SMS paste -------------------------------------------------
   * Applied in the change handler rather than an effect: parsing is a
   * response to the user typing, not state synchronisation. */
  function onSmsChange(text: string) {
    setRaw(text);
    const tx = parseSms(text).transaction;
    if (!tx) return;
    setAmount((a) => a || String(tx.amountPaise / 100));
    setBank((b) => b || tx.bank);
    setCounterparty((c) => c || tx.counterparty || "");
    setUtr((u) => u || tx.reference || "");
    if (tx.rail === "upi" || tx.rail === "imps" || tx.rail === "neft") setRail(tx.rail);
  }

  function applyAutofill(a: Autofill) {
    if (a.amountRupees) setAmount(String(a.amountRupees));
    if (a.bank) setBank(a.bank);
    if (a.utr) setUtr(a.utr);
    if (a.counterparty) setCounterparty(a.counterparty);
  }

  /* ---- Validation ------------------------------------------------- */
  const amountCheck = checkAmount(amount);
  const mobileCheck = checkMobile(mobile);
  const utrCheck = checkUtr(utr, rail);
  const highSeverity = (amountCheck.paise ?? 0) >= HIGH_SEVERITY_PAISE;
  const nodal = bankByName(bank);

  const duplicate = useStore((s) =>
    utrCheck.value
      ? s.cases.find((c) => c.transaction?.reference === utrCheck.value)
      : undefined,
  );

  const canDispatch = amountCheck.ok && bank.trim().length > 0;

  /* ---- Dispatch: freeze first, verify alongside -------------------- */
  function dispatch() {
    if (!canDispatch || caseId) return;

    const txRail: TxRail = nonBank ? "wallet" : (rail as TxRail);
    const c = createCase({
      kind: "financial",
      transaction: {
        amountPaise: amountCheck.paise ?? 0,
        bank: bank || "Your bank",
        rail: txRail,
        occurredAt: new Date().toISOString(),
        counterparty: counterparty || null,
        reference: utrCheck.value || null,
      },
      narrative: "",
      email: useStore.getState().currentEmail ?? "guest@demo",
    });

    const { debit, beneficiary, layer2 } = planFanOut(bank);
    const now = new Date().toISOString();
    const freezes: FreezeRequest[] = [
      { institutionId: debit.id, institutionName: debit.name, role: "debit", ack: "pending", heldPaise: 0, requestedAt: now, respondedAt: null },
      { institutionId: beneficiary.id, institutionName: beneficiary.name, role: "beneficiary", ack: "pending", heldPaise: 0, requestedAt: now, respondedAt: null },
      { institutionId: layer2.id, institutionName: layer2.name, role: "layer2", ack: "pending", heldPaise: 0, requestedAt: now, respondedAt: null },
    ];
    useStore.setState((s) => ({
      cases: s.cases.map((x) => (x.id === c.id ? { ...x, freezes } : x)),
    }));

    /*
     * The identifier the money went to is the only thing worth keeping
     * beyond this browser: it is what warns the next person and what turns
     * separate complaints into one investigation. Nothing about the
     * complainant is sent.
     */
    reportSignal({
      identifier: counterparty || utrCheck.value,
      scam: "financial",
      amountPaise: amountCheck.paise ?? 0,
    });

    setCaseId(c.id);
    setStep(3);
    clearDraft();

    // Bank gateways are slow. Never make the citizen watch a spinner for it —
    // the token is issued now and the request queues with retry behind it.
    setTimeout(() => setQueued(true), 8000);
  }

  return (
    <>
      <TopBar back={{ href: "/", label: "Back" }} />
      <Shell>
        <h1 className="sr-only">Report financial fraud</h1>

        {/* Emergency banner */}
        <div className="rounded-card border-2 border-breach bg-breach-soft p-5">
          <p className="text-[19px] font-bold text-ink" aria-hidden="true">
            {t("fz.banner")}
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            {t("fz.bannerSub")}
          </p>
          <p className="mt-3 rounded-lg bg-surface p-3 text-[16px] text-ink">
            ⏱ {t("fz.time")}
          </p>
          <a
            href="tel:1930"
            className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-breach px-6 text-[18px] font-bold text-white"
          >
            {t("fz.call1930")}
          </a>
        </div>

        {draft && !dismissedRestore ? (
          <Card className="mt-5 border-pending/30 bg-pending-soft">
            <p className="text-[17px] font-semibold text-ink">
              We saved your progress
            </p>
            <p className="mt-1 text-[16px] text-ink-soft">
              You were partway through a report{" "}
              {Math.max(1, Math.round(((now || draft.savedAt) - draft.savedAt) / 60000))}{" "}
              minutes ago.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setWhen((draft.when as When) ?? null);
                  setRaw(draft.raw ?? "");
                  setAmount(draft.amount ?? "");
                  setBank(draft.bank ?? "");
                  setRail((draft.rail as Rail) ?? "upi");
                  setUtr(draft.utr ?? "");
                  setCounterparty(draft.counterparty ?? "");
                  setMobile(draft.mobile ?? "");
                  if (draft.amount) setStep(2);
                  setDismissedRestore(true);
                }}
              >
                Restore it
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  clearDraft();
                  setDismissedRestore(true);
                }}
              >
                Start fresh
              </Button>
            </div>
          </Card>
        ) : null}

        <Steps step={step} />

        {/* ---------------- Step 1: triage ---------------- */}
        {step === 1 ? (
          <div className="mt-6 space-y-5">
            <Card>
              <p className="text-[18px] font-semibold text-ink">
                {t("fz.step1")}
              </p>
              <p className="mt-1 text-[16px] text-ink-soft">
                {t("fz.noDeadline")}
              </p>
              <div className="mt-3 space-y-2">
                {WHEN_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setWhen(o.id)}
                    className={clsx(
                      "w-full rounded-xl border p-4 text-left transition-colors",
                      when === o.id
                        ? "border-primary bg-primary-soft"
                        : "border-line-strong bg-surface hover:bg-sunken",
                    )}
                  >
                    <span className="block text-[17px] font-semibold text-ink">
                      {t(o.label)}
                    </span>
                    <span className="mt-0.5 block text-[16px] text-ink-soft">
                      {t(o.note)}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-[18px] font-semibold text-ink">
                {t("fz.step2")}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button
                  variant={called1930 === true ? "primary" : "secondary"}
                  onClick={() => setCalled1930(true)}
                >
                  {t("fz.called")}
                </Button>
                <Button
                  variant={called1930 === false ? "primary" : "secondary"}
                  onClick={() => setCalled1930(false)}
                >
                  {t("fz.notCalled")}
                </Button>
              </div>
              {called1930 ? (
                <input
                  value={incidentId}
                  onChange={(e) => setIncidentId(e.target.value)}
                  placeholder="14-digit acknowledgement number"
                  className="data mt-3 w-full rounded-xl border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
                />
              ) : null}
              {called1930 === false ? (
                <p className="mt-3 text-[16px] text-ink-soft">
                  That&apos;s fine — filing here sends the same freeze request.
                  You can still call 1930 afterwards.
                </p>
              ) : null}
            </Card>

            <Button
              className="w-full"
              disabled={!when || called1930 === null}
              onClick={() => setStep(2)}
            >
              {t("fz.continue")} →
            </Button>
          </div>
        ) : null}

        {/* ---------------- Step 2: transaction ---------------- */}
        {step === 2 ? (
          <div className="mt-6 space-y-5">
            <Card>
              <label htmlFor="sms" className="block text-[18px] font-semibold text-ink">
                {t("fz.paste")}
              </label>
              <p className="mt-1 text-[16px] text-ink-soft">
                {t("fz.pasteSub")}
              </p>
              <textarea
                id="sms"
                rows={4}
                value={raw}
                onChange={(e) => onSmsChange(e.target.value)}
                placeholder="Paste the SMS or notification here…"
                className="mt-3 w-full resize-y rounded-xl border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {SAMPLE_SMS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => onSmsChange(s.text)}
                    className="rounded-full border border-line-strong bg-surface px-3 py-1 text-[15px] font-medium text-primary hover:bg-primary-soft"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Card>

            <EvidenceUploader onAutofill={applyAutofill} />

            <Card>
              <p className="text-[18px] font-semibold text-ink">
                Transaction details
              </p>

              <Field label={t("fz.amount")} error={amountCheck.error} warn={amountCheck.warn}>
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="47500"
                  className="data w-full rounded-xl border border-line-strong bg-surface p-4 text-[19px] focus:border-primary focus:outline-none"
                />
              </Field>
              {highSeverity ? (
                <p className="-mt-2 mb-4 rounded-lg bg-breach-soft p-3 text-[16px] text-ink">
                  <strong>High severity.</strong> At ₹1,00,000 or more an
                  e-Zero FIR is registered automatically — you don&apos;t have
                  to ask for one.
                </p>
              ) : null}

              <Field label={t("fz.bank")}>
                <input
                  list="banks"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  placeholder="Start typing…"
                  className="w-full rounded-xl border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
                />
              </Field>
              <datalist id="banks">
                {BANK_DIRECTORY.map((b) => (
                  <option key={b.id} value={b.name} />
                ))}
              </datalist>
              {nodal ? (
                <p className="-mt-2 mb-4 text-[15px] text-held">
                  ✓ Routing to {nodal.name}&apos;s nodal cyber officer
                  automatically — you don&apos;t need to find them.
                </p>
              ) : null}

              <fieldset className="mb-4">
                <legend className="mb-2 block text-[17px] font-semibold text-ink">
                  {t("fz.rail")}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {(["upi", "imps", "neft", "rtgs", "card"] as Rail[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRail(r)}
                      className={clsx(
                        "min-h-[48px] rounded-xl border px-4 text-[16px] font-semibold uppercase",
                        rail === r
                          ? "border-primary bg-primary-soft text-ink"
                          : "border-line-strong bg-surface text-ink-soft",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </fieldset>

              <Field
                label={t("fz.utr")}
                warn={utrCheck.warn}
                optional
              >
                <input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="12-digit reference"
                  className="data w-full rounded-xl border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
                />
              </Field>

              {utrCheck.hint ? (
                <div className="-mt-2 mb-4 rounded-xl border border-pending/30 bg-pending-soft p-4">
                  <p className="text-[16px] font-semibold text-ink">
                    🛠 Can&apos;t find the right number?
                  </p>
                  <p className="mt-1 text-[16px] text-ink-soft">
                    Upload the receipt above and we&apos;ll pull it out for you.
                    Or continue without it — police and bank teams trace it from
                    your account and the timestamp instead. That adds roughly
                    15–45 minutes, and is far better than not reporting.
                  </p>
                </div>
              ) : null}

              <Field label={t("fz.who")} optional>
                <input
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  placeholder="UPI ID, phone number or account"
                  className="w-full rounded-xl border border-line-strong bg-surface p-4 text-[17px] focus:border-primary focus:outline-none"
                />
              </Field>
              <p className="-mt-2 mb-4 rounded-lg bg-sunken p-3 text-[16px] text-ink-soft">
                Don&apos;t know who received it? Leave it blank. Your reference
                is enough to trace where the money landed.
              </p>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line-strong bg-surface p-4">
                <input
                  type="checkbox"
                  checked={nonBank}
                  onChange={(e) => setNonBank(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-[var(--color-primary)]"
                />
                <span>
                  <span className="block text-[17px] font-semibold text-ink">
                    This was crypto, a gift card, or a closed wallet
                  </span>
                  <span className="mt-0.5 block text-[16px] text-ink-soft">
                    Binance TXID, gift card PIN, Telegram escrow and similar.
                  </span>
                </span>
              </label>
              {nonBank ? (
                <p className="mt-2 text-[15px] text-held">
                  ✓ Routing to the {NON_BANK_ROUTE} instead of the bank freeze
                  system.
                </p>
              ) : null}
            </Card>

            {duplicate ? (
              <Card className="border-pending/30 bg-pending-soft">
                <p className="text-[17px] font-semibold text-ink">
                  This transaction is already reported
                </p>
                <p className="mt-1 text-[16px] text-ink-soft">
                  Reference {utrCheck.value} is on case{" "}
                  <strong className="data">{duplicate.id}</strong>. Anything you
                  add here will be merged into that case rather than starting a
                  second one — duplicate freeze requests slow the bank down.
                </p>
                <Button href={`/case/${duplicate.id}`} variant="secondary" className="mt-3">
                  Open that case
                </Button>
              </Card>
            ) : null}

            <Card>
              <div className="mb-4">
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-[17px] font-semibold text-ink"
                >
                  {t("fz.mobile")}
                </label>
                <div className="flex gap-2">
                  <span
                    aria-hidden="true"
                    className="data flex min-h-[56px] items-center rounded-xl border border-line-strong bg-sunken px-4 text-[17px] font-semibold text-ink-soft"
                  >
                    +91
                  </span>
                  <input
                    id="mobile"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    aria-describedby={mobileCheck.error ? "mobile-msg" : undefined}
                    className="data w-full rounded-xl border border-line-strong bg-surface p-4 text-[19px] focus:border-primary focus:outline-none"
                  />
                </div>
                {mobileCheck.error ? (
                  <p
                    id="mobile-msg"
                    role="alert"
                    className="mt-1.5 text-[16px] font-semibold text-breach"
                  >
                    {mobileCheck.error}
                  </p>
                ) : null}
              </div>
              <p className="text-[16px] text-ink-soft">{t("fz.mobileSub")}</p>
            </Card>

            <Button className="w-full" disabled={!canDispatch} onClick={dispatch}>
              {canDispatch
                ? `${t("fz.submit")} · ${formatPaise(amountCheck.paise ?? 0)}`
                : t("fz.submitBlocked")}
            </Button>
          </div>
        ) : null}

        {/* ---------------- Step 3: dispatched ---------------- */}
        {step === 3 && caseId ? (
          <div className="mt-6 space-y-5">
            <Card className="border-held/30 bg-held-soft">
              <Chip tone="held">✅ Freeze request sent</Chip>
              <p className="mt-3 text-[20px] font-bold text-ink">
                Case {caseId} is open
              </p>
              <p className="mt-1 text-[16px] text-ink-soft">
                Banks are being contacted right now. Verify your number below —
                the two happen at the same time.
              </p>
              <Button href={`/receipt/${caseId}`} className="mt-4 w-full">
                Watch the banks respond →
              </Button>
            </Card>

            {queued ? (
              <Card className="border-pending/30 bg-pending-soft">
                <p className="text-[17px] font-semibold text-ink">
                  One bank is responding slowly
                </p>
                <p className="mt-1 text-[16px] text-ink-soft">
                  Your request is queued for priority retry. Your case ID is
                  already issued and nothing is lost — you don&apos;t need to
                  wait on this page.
                </p>
              </Card>
            ) : null}

            <OtpPanel
              mobile={mobileCheck.value ?? mobile}
              onVerified={() => {}}
              onBypass={(mode) => router.push(`/receipt/${caseId}?bypass=${mode}`)}
            />
          </div>
        ) : null}
      </Shell>
    </>
  );
}

function Steps({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["When & how", "What happened", "Freeze sent"];
  return (
    <ol className="mt-6 flex items-center gap-2">
      {labels.map((l, i) => (
        <li key={l} className="flex flex-1 items-center gap-2">
          <span
            className={clsx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-bold",
              i + 1 < step && "bg-held text-white",
              i + 1 === step && "bg-primary text-white",
              i + 1 > step && "bg-sunken text-ink-faint",
            )}
          >
            {i + 1 < step ? "✓" : i + 1}
          </span>
          <span
            className={clsx(
              "hidden text-[15px] font-semibold sm:block",
              i + 1 === step ? "text-ink" : "text-ink-faint",
            )}
          >
            {l}
          </span>
          {i < 2 ? <span className="h-0.5 flex-1 bg-line" /> : null}
        </li>
      ))}
    </ol>
  );
}

function Field({
  label,
  children,
  error,
  warn,
  optional,
}: {
  label: string;
  children: React.ReactElement<{ id?: string; "aria-describedby"?: string }>;
  error?: string;
  warn?: string;
  optional?: boolean;
}) {
  /*
   * The label is bound to the control, and any error or hint is bound as its
   * description. Without this a screen reader announces an unlabelled text
   * box — and on a form where a mistyped reference silently misroutes a
   * freeze request, that is not a cosmetic problem.
   */
  const t = useT();
  const id = useId();
  const msgId = `${id}-msg`;
  const message = error ?? warn;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="mb-2 block text-[17px] font-semibold text-ink"
      >
        {label}
        {optional ? (
          <span className="ml-2 text-[15px] font-normal text-ink-faint">
            {t("fz.optional")}
          </span>
        ) : null}
      </label>
      {cloneElement(children, {
        id,
        "aria-describedby": message ? msgId : undefined,
      })}
      {error ? (
        <p
          id={msgId}
          role="alert"
          className="mt-1.5 text-[16px] font-semibold text-breach"
        >
          {error}
        </p>
      ) : null}
      {!error && warn ? (
        <p id={msgId} className="mt-1.5 text-[16px] text-pending">
          {warn}
        </p>
      ) : null}
    </div>
  );
}
