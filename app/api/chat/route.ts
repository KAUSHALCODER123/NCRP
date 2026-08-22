import {
  answerLocally,
  asksForSecret,
  extractActions,
  stripPaths,
  SYSTEM_PROMPT,
  type AssistantReply,
} from "@/lib/assistant";
import { guard } from "@/lib/rate-limit";
import { askAI } from "@/lib/ai";

/**
 * The assistant endpoint.
 *
 * Non-streaming on purpose. Replies are two to four sentences, so streaming
 * would buy a few hundred milliseconds of perceived speed in exchange for a
 * much harder failure mode — a half-delivered instruction to someone in a
 * panic is worse than a whole one that arrives a moment later.
 *
 * Every failure path returns a usable answer built from the same scam library
 * the model is briefed on. There is no state in which this endpoint tells a
 * frightened person that something went wrong.
 */

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 9_000;
const MAX_TURNS = 12;
const MAX_CHARS = 1_500;

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  let turns: Turn[] = [];
  try {
    const body = (await request.json()) as { messages?: Turn[] };
    turns = (body.messages ?? [])
      .filter((m) => m && (m.role === "user" || m.role === "assistant"))
      .slice(-MAX_TURNS)
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, MAX_CHARS) }));
  } catch {
    /* fall through to the local answer */
  }

  const latest = [...turns].reverse().find((m) => m.role === "user")?.content ?? "";
  const local = answerLocally(latest);

  const gate = guard(request, "classify", local);
  if (gate.refusal) return gate.refusal;

  if (!latest.trim()) {
    return Response.json(local, { headers: gate.headers });
  }

  const raw = await askAI({
    system: SYSTEM_PROMPT,
    messages: turns.map((m) => ({ role: m.role, text: m.content })),
    maxTokens: 260,
    temperature: 0.3,
    timeoutMs: TIMEOUT_MS,
  });

  if (!raw) return Response.json(local, { headers: gate.headers });

  /*
   * Last line of defence. A reply that solicits a secret is discarded, and the
   * check is negation-aware — "never share your OTP" is the most important
   * sentence this assistant can say, and a naive check would throw it away.
   */
  if (asksForSecret(raw)) {
    return Response.json(local, { headers: gate.headers });
  }

  const reply: AssistantReply = {
    text: stripPaths(raw),
    actions: extractActions(raw).length ? extractActions(raw) : local.actions,
    fallback: false,
    urgent: local.urgent,
  };
  return Response.json(reply, { headers: gate.headers });
}