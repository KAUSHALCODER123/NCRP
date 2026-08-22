import {
  answerLocally,
  asksForSecret,
  extractActions,
  stripPaths,
  SYSTEM_PROMPT,
  type AssistantReply,
} from "@/lib/assistant";
import { guard } from "@/lib/rate-limit";

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

  const key = process.env.OPENAI_API_KEY;
  if (!key || !latest.trim()) {
    return Response.json(local, { headers: gate.headers });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 260,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...turns],
      }),
    });

    if (!res.ok) return Response.json(local, { headers: gate.headers });

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return Response.json(local, { headers: gate.headers });

    /*
     * Last line of defence. If a reply ever asks for a secret, we discard it
     * and use the local answer instead — a model regression must not be able
     * to turn this into the thing it warns people about.
     */
    if (/\b(your|the)\s+(otp|pin|cvv|password|passcode)\b/i.test(raw)) {
      const suspicious = /(share|send|tell|give|enter|provide)\b[^.?!]{0,40}\b(otp|pin|cvv|password)/i;
      if (suspicious.test(raw)) return Response.json(local, { headers: gate.headers });
    }

    const reply: AssistantReply = {
      text: stripPaths(raw),
      actions: extractActions(raw).length ? extractActions(raw) : local.actions,
      fallback: false,
      urgent: local.urgent,
    };
    return Response.json(reply, { headers: gate.headers });
  } catch {
    return Response.json(local, { headers: gate.headers });
  } finally {
    clearTimeout(timer);
  }
}
