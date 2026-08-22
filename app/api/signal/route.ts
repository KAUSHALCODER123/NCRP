import { recordSignal, countSignal, amountBand } from "@/lib/db";
import { guard } from "@/lib/rate-limit";
import { identify } from "@/lib/identify";

/**
 * Records one anonymous fraud signal, and reads back how many people have
 * reported the same identifier.
 *
 * The request body is deliberately narrow. Only the identifier, the scam slug
 * and an amount in paise are read; anything else a client sends is ignored
 * rather than stored, so a future caller cannot accidentally start persisting
 * a complainant's details by adding a field.
 *
 * A failed write is never surfaced as an error. The citizen's report lives in
 * their browser and their case is already open — the database is where the
 * warning to the next person accumulates, and losing that is worth far less
 * than interrupting someone mid-report.
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const gate = guard(request, "classify", { ok: false, reports: 0 });
  if (gate.refusal) return gate.refusal;

  let identifier = "";
  let scam: string | undefined;
  let paise = 0;

  try {
    const body = (await request.json()) as {
      identifier?: string;
      scam?: string;
      amountPaise?: number;
    };
    /*
     * Not truncated. Slicing an over-long value to fit would store a
     * meaningless fragment that matches nothing and pollutes the counts —
     * refusing it is both cleaner and honest about what happened.
     */
    identifier = String(body.identifier ?? "");
    scam = body.scam ? String(body.scam).slice(0, 40) : undefined;
    paise = Number(body.amountPaise) || 0;
  } catch {
    return Response.json({ ok: false, reports: 0 }, { headers: gate.headers });
  }

  if (!identifier.trim() || identifier.length > 120) {
    return Response.json({ ok: false, reports: 0 }, { headers: gate.headers });
  }

  const { kind } = identify(identifier);
  const written = await recordSignal({
    identifier,
    kind: kind === "app" ? "unknown" : kind,
    scam,
    band: amountBand(paise),
  });

  const count = await countSignal(identifier);

  return Response.json(
    { ok: written, reports: count?.reports ?? 0 },
    { headers: gate.headers },
  );
}

export async function GET(request: Request) {
  const gate = guard(request, "classify", { reports: 0 });
  if (gate.refusal) return gate.refusal;

  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (!q.trim()) return Response.json({ reports: 0 }, { headers: gate.headers });

  const count = await countSignal(q);
  return Response.json(
    {
      reports: count?.reports ?? 0,
      kind: count?.kind ?? null,
      firstAt: count?.firstAt ?? null,
      scams: count?.scams ?? [],
    },
    { headers: gate.headers },
  );
}
