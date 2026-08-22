import { INSTITUTIONS } from "@/lib/mock/banks";
import { guard } from "@/lib/rate-limit";

/**
 * Server-Sent Events: bank acknowledgements arriving one at a time.
 *
 * This is the most important piece of engineering in the project. It is the
 * difference between "a form that submitted" and "a system visibly working
 * for you" — the moment the citizen stops being asked for things and starts
 * watching the state act.
 *
 * Timing is deliberately irregular. Banks are not uniform, and a receipt
 * where every row lands on a metronome reads as fake.
 */

export const dynamic = "force-dynamic";

type Role = "debit" | "beneficiary" | "layer2";

interface Plan {
  id: string;
  role: Role;
  name: string;
  latency: [number, number];
}

function jitter([lo, hi]: [number, number]) {
  return lo + Math.random() * (hi - lo);
}

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  /* Each stream holds a connection open for seconds. The client has a local
     simulation fallback, so refusing here degrades the animation, never the
     case itself. */
  const gate = guard(request, "stream", { error: "rate_limited" });
  if (gate.refusal) return gate.refusal;

  const url = new URL(request.url);
  const amountPaise = Number(url.searchParams.get("amount") ?? "0");
  const raw = url.searchParams.get("insts") ?? "";

  const plans: Plan[] = raw
    .split(",")
    .filter(Boolean)
    .map((pair) => {
      const [id, role] = pair.split(":");
      const inst = INSTITUTIONS.find((i) => i.id === id);
      return {
        id,
        role: (role as Role) ?? "beneficiary",
        name: inst?.name ?? id,
        latency: inst?.latency ?? [800, 1800],
      };
    });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const push = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(sse(event, data)));
        } catch {
          closed = true;
        }
      };

      const wait = (ms: number) =>
        new Promise((r) => setTimeout(r, Math.max(120, ms)));

      request.signal.addEventListener("abort", () => {
        closed = true;
      });

      push("open", { at: Date.now(), contacted: plans.length });

      /*
       * Ordering is causal, not just fast-to-slow: you only learn that hop 2
       * exists from hop 1's exit trail, so layer2 can never resolve before the
       * beneficiary. Within that constraint, latency decides who lands first.
       */
      const hasLayer2 = plans.some((p) => p.role === "layer2");
      const ordered = [...plans].sort((a, b) => {
        const rank = (r: Role) => (r === "layer2" ? 1 : 0);
        if (rank(a.role) !== rank(b.role)) return rank(a.role) - rank(b.role);
        return jitter(a.latency) - jitter(b.latency);
      });

      /*
       * When the trail has a second hop, part of the money was layered onward
       * before we reached it. Holding ~72% and honestly showing the rest as
       * gone is both truer to how layering works and a better argument than a
       * clean 100% — it is exactly why the recovery rate is what it is.
       */
      const holdable = hasLayer2
        ? Math.round(amountPaise * 0.72)
        : amountPaise;

      let remaining = holdable;
      let leaked = amountPaise - holdable;
      let elapsed = 0;

      for (let i = 0; i < ordered.length && !closed; i++) {
        const p = ordered[i];
        const delay = jitter(p.latency);
        elapsed += delay;
        await wait(delay);
        if (closed) break;

        if (p.role === "debit") {
          // The victim's own bank confirms the debit; it holds nothing.
          push("ack", {
            institutionId: p.id,
            institutionName: p.name,
            role: p.role,
            ack: "acknowledged",
            heldPaise: 0,
            atMs: Math.round(elapsed),
          });
          continue;
        }

        if (p.role === "layer2") {
          if (leaked > 0) {
            // Layered onward before we got here. This is also where the
            // collateral damage begins: the account at this hop is frequently
            // innocent, and the real system freezes all of it.
            leaked = 0;
            push("ack", {
              institutionId: p.id,
              institutionName: p.name,
              role: p.role,
              ack: "moved",
              heldPaise: 0,
              atMs: Math.round(elapsed),
              exitTrail: { to: "Wallet ending 7781", rail: "wallet" },
            });
          } else {
            push("ack", {
              institutionId: p.id,
              institutionName: p.name,
              role: p.role,
              ack: "acknowledged",
              heldPaise: 0,
              atMs: Math.round(elapsed),
            });
          }
          continue;
        }

        const held = remaining;
        remaining = 0;
        push("ack", {
          institutionId: p.id,
          institutionName: p.name,
          role: p.role,
          ack: held > 0 ? "held" : "acknowledged",
          heldPaise: held,
          atMs: Math.round(elapsed),
        });
      }

      if (!closed) {
        push("done", {
          heldPaise: holdable - remaining,
          totalMs: Math.round(elapsed),
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...gate.headers,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
