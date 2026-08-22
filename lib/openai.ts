/**
 * Shared OpenAI call.
 *
 * MODEL CHOICE. Everything here is short classification and 2–4 sentence
 * replies, so the cheapest tier is the right tier — a larger model costs more
 * per call without writing a better "hang up first". The chain below is
 * cheapest-first as of August 2026 (roughly $0.05, $0.10 and $0.15 per million
 * input tokens). Override with OPENAI_CHAT_MODEL.
 *
 * WHY THIS IS SO FORGIVING. Every failure here degrades silently to canned
 * text — the answer still looks fine, so nobody notices the model stopped
 * being called. That has already happened twice in this project. So: model
 * identifiers get retried down the chain, and a rejected parameter is dropped
 * and retried rather than treated as a dead end. Newer models reject
 * `max_tokens`, older ones reject `max_completion_tokens`, and some accept
 * only the default temperature — none of which should silently disable the
 * assistant.
 *
 * A failure logs once, server-side, without the key or the payload.
 */

const CHEAPEST_FIRST = ["gpt-5-nano", "gpt-4.1-nano", "gpt-4o-mini"] as const;

/** Receipt OCR needs vision, so that path has its own chain. */
const VISION_FIRST = ["gpt-4.1-nano", "gpt-4o-mini"] as const;

export interface ChatOptions {
  messages: unknown[];
  maxTokens: number;
  temperature?: number;
  jsonObject?: boolean;
  vision?: boolean;
  timeoutMs: number;
}

type Body = Record<string, unknown>;

/** Names the parameter an error message is complaining about, if any. */
function offendingParam(message: string): string | null {
  const named = /(?:unsupported|unrecognized|unknown|invalid)[^.]*?['"]([a-z_]+)['"]/i.exec(
    message,
  );
  if (named) return named[1];
  if (/max_completion_tokens/i.test(message)) return "max_completion_tokens";
  if (/max_tokens/i.test(message)) return "max_tokens";
  if (/temperature/i.test(message)) return "temperature";
  return null;
}

/** Returns the assistant's text, or null on any failure. Never throws. */
export async function askOpenAI(opts: ChatOptions): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const override = process.env.OPENAI_CHAT_MODEL;
  const chain = override
    ? [override]
    : [...(opts.vision ? VISION_FIRST : CHEAPEST_FIRST)];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
  let lastError = "";

  try {
    for (const model of chain) {
      // Newer models want max_completion_tokens; older ones want max_tokens.
      // Start with the modern spelling and fall back on complaint.
      const body: Body = {
        model,
        max_completion_tokens: opts.maxTokens,
        messages: opts.messages,
      };
      if (opts.temperature !== undefined) body.temperature = opts.temperature;
      if (opts.jsonObject) body.response_format = { type: "json_object" };

      // At most a few retries per model, each dropping one rejected parameter.
      for (let attempt = 0; attempt < 4; attempt++) {
        let res: Response;
        try {
          res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify(body),
          });
        } catch {
          // Aborted or network-level: no other model will do better.
          return null;
        }

        if (res.ok) {
          const data = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const text = data.choices?.[0]?.message?.content?.trim();
          if (text) return text;
          lastError = `${model}: empty completion`;
          break;
        }

        const raw = await res.text();
        lastError = `${model}: ${res.status} ${raw.slice(0, 180)}`;

        if (res.status !== 400 && res.status !== 404) break;

        // A rejected parameter is recoverable: drop it and try again.
        const param = offendingParam(raw);
        if (param === "max_completion_tokens") {
          delete body.max_completion_tokens;
          body.max_tokens = opts.maxTokens;
          continue;
        }
        if (param === "max_tokens") {
          delete body.max_tokens;
          body.max_completion_tokens = opts.maxTokens;
          continue;
        }
        if (param && param in body) {
          delete body[param];
          continue;
        }

        // Unknown model, or something we cannot fix: try the next model.
        break;
      }
    }

    if (lastError) {
      // One line, no key, no payload. Silent degradation is the failure mode
      // this whole file exists to prevent.
      console.warn(`[openai] falling back to offline answer — ${lastError}`);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
