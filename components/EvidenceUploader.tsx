"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { Button, Card, Chip } from "@/components/ui";
import {
  AUTOFILL_THRESHOLD,
  ingest,
  scoreExtraction,
  type EvidenceFile,
} from "@/lib/evidence";
import { useT } from "@/lib/i18n";
import {
  detectApp,
  parseEvidenceText,
  WHERE_IS_UTR,
  type Candidate,
  type ParseResult,
} from "@/lib/parser";

/**
 * Upload → scan → review → autofill.
 *
 * State A is the scanning progress; State B is the review, which surfaces a
 * disambiguation choice whenever more than one plausible reference was found.
 * We never silently pick between them: a wrong reference fails at the bank
 * gateway while the citizen believes their money is being held.
 */

export interface Autofill {
  amountRupees: number | null;
  bank: string | null;
  utr: string | null;
  counterparty: string | null;
  occurredAt: string | null;
}

type Phase = "idle" | "hashing" | "scanning" | "review" | "unreadable";

export function EvidenceUploader({
  onAutofill,
  onFiles,
  context = "financial",
}: {
  onAutofill: (a: Autofill) => void;
  onFiles?: (files: EvidenceFile[]) => void;
  /*
   * What the evidence IS changes what we do with it, not just what we call
   * it. A bank receipt is parsed for an amount and a reference; a screenshot
   * of a threat is preserved and fingerprinted and must not be run through a
   * transaction parser that will find nothing and report a failure for it.
   */
  context?: "financial" | "content";
}) {
  const t = useT();
  const financial = context === "financial";
  const input = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState<string>("");
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [chosenUtr, setChosenUtr] = useState<string>("");
  const [app, setApp] = useState<string | null>(null);

  async function handle(list: FileList | null) {
    if (!list?.length) return;
    setErrors([]);
    setParsed(null);
    setPhase("hashing");
    setProgress(10);

    const accepted: EvidenceFile[] = [];
    const problems: string[] = [];

    for (const f of Array.from(list)) {
      setCurrent(f.name);
      const r = await ingest(f);
      if ("error" in r) problems.push(`${r.error.name}: ${r.error.reason}`);
      else accepted.push(r.ok);
    }

    setFiles((prev) => [...prev, ...accepted]);
    setErrors(problems);
    onFiles?.(accepted);
    setProgress(40);

    const image = financial
      ? accepted.find((f) => f.type.startsWith("image/"))
      : undefined;
    if (!image) {
      setPhase(accepted.length ? "review" : "idle");
      return;
    }

    setPhase("scanning");
    setProgress(60);

    const text = await readImage(image);
    setProgress(90);

    if (!text.trim()) {
      setPhase("unreadable");
      setProgress(100);
      return;
    }

    const result = parseEvidenceText(text);
    setApp(detectApp(text));
    setParsed(result);
    setChosenUtr(result.utrCandidates[0]?.value ?? "");
    setProgress(100);
    setPhase("review");
  }

  function confirm() {
    if (!parsed) return;
    onAutofill({
      amountRupees: parsed.amountRupees,
      bank: parsed.bank,
      utr: chosenUtr || null,
      counterparty: parsed.counterparty,
      occurredAt: parsed.occurredAt,
    });
  }

  const confidence = parsed
    ? scoreExtraction({
        amountRupees: parsed.amountRupees,
        bank: parsed.bank,
        utr: chosenUtr || null,
        counterparty: parsed.counterparty,
        occurredAt: parsed.occurredAt,
        source: "vision",
      })
    : 0;

  const ambiguous = (parsed?.utrCandidates.length ?? 0) > 1;

  return (
    <Card>
      <p className="text-[18px] font-semibold text-ink">
        {financial ? t("ev.finTitle") : t("ev.conTitle")}
      </p>
      <p className="mt-1 text-[16px] text-ink-soft">
        {financial ? t("ev.finSub") : t("ev.conSub")}
      </p>

      <input
        ref={input}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.eml"
        className="sr-only"
        onChange={(e) => handle(e.target.files)}
      />

      <Button
        variant="secondary"
        className="mt-4 w-full"
        onClick={() => input.current?.click()}
      >
        {t("ev.choose")}
      </Button>

      {/* State A — scanning */}
      {(phase === "hashing" || phase === "scanning") && (
        <div className="mt-4 rounded-xl border border-line bg-sunken p-4">
          <p className="truncate text-[16px] font-semibold text-ink">
            {phase === "hashing" ? t("ev.securing") : t("ev.reading")} {current}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-[15px] text-ink-soft">
            {phase === "hashing"
              ? t("ev.hashing")
              : financial
                ? t("ev.scanning")
                : t("ev.preserving")}
          </p>
        </div>
      )}

      {/* Unreadable */}
      {phase === "unreadable" && (
        <div className="mt-4 rounded-xl border border-pending/30 bg-pending-soft p-4">
          <p className="text-[17px] font-semibold text-ink">
            We couldn&apos;t read that clearly
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            Cropped or blurred screenshots are hard to read. If your banking app
            offers a PDF receipt, that works best. Your file is still attached
            as evidence either way — you can type the details in instead.
          </p>
          {app && WHERE_IS_UTR[app] ? (
            <p className="mt-3 rounded-lg bg-surface p-3 text-[16px] text-ink-soft">
              <strong className="text-ink">Using {app}?</strong>{" "}
              {WHERE_IS_UTR[app]}
            </p>
          ) : null}
        </div>
      )}

      {/* State B — review */}
      {phase === "review" && parsed ? (
        <div className="mt-4 rounded-xl border border-held/30 bg-held-soft p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[17px] font-semibold text-ink">
              ✅ We found transaction details
            </p>
            <Chip tone={confidence >= AUTOFILL_THRESHOLD ? "held" : "pending"}>
              {Math.round(confidence * 100)}% confident
            </Chip>
          </div>

          <dl className="mt-3 space-y-2 text-[16px]">
            <Detected label="Amount" value={fmt(parsed.amountRupees)} />
            <Detected label="Bank" value={parsed.bank} />
            <Detected label="Paid to" value={parsed.counterparty} />
            <Detected
              label="When"
              value={
                parsed.occurredAt
                  ? new Date(parsed.occurredAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null
              }
            />
          </dl>

          {ambiguous ? (
            <fieldset className="mt-4 rounded-lg border border-pending/40 bg-surface p-4">
              <legend className="px-1 text-[16px] font-semibold text-ink">
                ⚠ Which one is the transaction reference?
              </legend>
              <p className="mb-3 text-[15px] text-ink-soft">
                We found {parsed.utrCandidates.length} numbers that could be it.
                Picking the wrong one sends the freeze to the wrong place, so
                we&apos;d rather you chose.
              </p>
              <div className="space-y-2">
                {parsed.utrCandidates.map((c, i) => (
                  <CandidateRow
                    key={c.value}
                    c={c}
                    recommended={i === 0}
                    checked={chosenUtr === c.value}
                    onPick={() => setChosenUtr(c.value)}
                  />
                ))}
              </div>
            </fieldset>
          ) : parsed.utrCandidates[0] ? (
            <dl className="mt-2 text-[16px]">
              <Detected label="Reference" value={parsed.utrCandidates[0].value} />
            </dl>
          ) : (
            <div className="mt-3 rounded-lg bg-surface p-3 text-[16px] text-ink-soft">
              <strong className="text-ink">No reference number found.</strong>{" "}
              {app && WHERE_IS_UTR[app]
                ? WHERE_IS_UTR[app]
                : "That's fine — your amount and timestamp are enough to start a manual trace."}
            </div>
          )}

          {parsed.masked.length ? (
            <p className="mt-3 text-[15px] text-ink-soft">
              🛡 Hidden before storing: {parsed.masked.join(", ")}.
            </p>
          ) : null}

          <Button className="mt-4 w-full" onClick={confirm}>
            Confirm and fill the form
          </Button>
        </div>
      ) : null}

      {/* Attached files + chain of custody */}
      {files.length ? (
        <ul className="mt-4 space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="rounded-xl border border-line bg-surface p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="truncate text-[16px] font-semibold text-ink">
                  {f.name}
                </span>
                <span className="text-[15px] text-ink-faint">
                  {(f.bytes / 1024).toFixed(0)} KB
                </span>
              </div>
              <p className="data mt-1 break-all text-[14px] text-ink-faint">
                SHA-256 {f.sha256.slice(0, 24)}…
              </p>
              {f.stripped.length ? (
                <p className="mt-1 text-[14px] text-held">
                  {t("ev.removed")} {f.stripped.join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {!financial && files.length ? (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {t("ev.preservedNote")}
        </p>
      ) : null}

      {errors.length ? (
        <ul className="mt-3 space-y-1">
          {errors.map((e) => (
            <li key={e} className="text-[15px] text-breach">
              {e}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

function CandidateRow({
  c,
  recommended,
  checked,
  onPick,
}: {
  c: Candidate;
  recommended: boolean;
  checked: boolean;
  onPick: () => void;
}) {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3",
        checked ? "border-primary bg-primary-soft" : "border-line bg-surface",
      )}
    >
      <input
        type="radio"
        name="utr"
        checked={checked}
        onChange={onPick}
        className="mt-1.5 h-5 w-5 accent-[var(--color-primary)]"
      />
      <span className="min-w-0">
        <span className="data block break-all text-[17px] font-bold text-ink">
          {c.value}
        </span>
        <span className="block text-[15px] text-ink-soft">
          {c.context ? `Listed as “${c.context}”` : "No label found nearby"}
          {recommended ? " · recommended" : ""}
        </span>
      </span>
    </label>
  );
}

function Detected({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="w-[92px] shrink-0 text-ink-faint">{label}</dt>
      <dd className="data min-w-0 flex-1 font-semibold text-ink">
        {value ?? <span className="font-normal text-ink-faint">not found</span>}
      </dd>
      {value ? <span className="text-[15px] text-held">✓ auto</span> : null}
    </div>
  );
}

function fmt(n: number | null): string | null {
  if (!n) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

async function readImage(f: EvidenceFile): Promise<string> {
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(f.blob);
    });
    const res = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl }),
    });
    const data = (await res.json()) as { text?: string };
    return data.text ?? "";
  } catch {
    return "";
  }
}
