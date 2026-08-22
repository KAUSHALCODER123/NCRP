"use client";

/**
 * Sends one anonymous signal, and never lets it matter.
 *
 * Fire-and-forget on purpose: a citizen's report is already open in their
 * browser by the time this runs, and the database only holds the warning that
 * accumulates for the next person. A slow or dead cluster must not delay a
 * freeze receipt or surface an error to someone mid-report.
 */
export function reportSignal(input: {
  identifier: string | null | undefined;
  scam?: string;
  amountPaise?: number;
}): void {
  const identifier = (input.identifier ?? "").trim();
  if (!identifier) return;

  void fetch("/api/signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier,
      scam: input.scam,
      amountPaise: input.amountPaise,
    }),
    keepalive: true,
  }).catch(() => {
    /* the report itself is unaffected */
  });
}

/** Reads how many people have reported an identifier. 0 when unavailable. */
export async function signalCount(q: string): Promise<number> {
  try {
    const r = await fetch(`/api/signal?q=${encodeURIComponent(q)}`);
    const d = (await r.json()) as { reports?: number };
    return d.reports ?? 0;
  } catch {
    return 0;
  }
}
