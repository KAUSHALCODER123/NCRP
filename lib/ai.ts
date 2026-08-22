/**
 * Model access, provider-agnostic.
 *
 * PROVIDERS. Gemini first, OpenAI second — whichever has a key. Two providers
 * rather than one because this project has already lost its AI features once
 * to an exhausted quota, and the failure was invisible: the offline answers
 * are good enough that nothing looked broken. A second provider turns a dead
 * demo into a slightly cheaper one.
 *
 * MODELS. Everything here is short classification and 2–4 sentence replies, so
 * the cheapest tier is the right tier — a larger model costs more per call
 * without writing a better "hang up first". Chains are cheapest-first and are
 * tried in order, because model identifiers get renamed and retired.
 *
 * FORGIVENESS. A wrong model name or a rejected parameter returns a 400 that
 * looks like any other failure. Rather than treating that as fatal, the caller
 * walks the chain and drops rejected parameters. Every exhausted path logs one
 * line server-side, with no key and no payload — silent degradation is the
 * failure mode this file exists to prevent.
 */

export interface AiMessage {
  role: "user" | "assistant";
  text: string;
}

export interface AskOptions {
  system?: string;
  messages: AiMessage[];
  /** data: URL. Routes to a vision-capable model. */
  image?: string;
  maxTokens: number;
  temperature?: number;
  /** Ask for a bare JSON object back. */
  json?: boolean;
  timeoutMs: number;
}

const GEMINI_TEXT = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
];
const GEMINI_VISION = ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite"];

const OPENAI_TEXT = ["gpt-5-nano", "gpt-4.1-nano", "gpt-4o-mini"];
const OPENAI_VISION = ["gpt-4.1-nano", "gpt-4o-mini"];

/** Names the parameter an error is complaining about, if any. */
function offendingParam(message: string): string | null {
  const named =
    /(?:unsupported|unrecognized|unknown|invalid)[^.]*?['"]([a-zA-Z_]+)['"]/.exec(
      message,
    );
  if (named) return named[1];
  if (/max_completion_tokens/.test(message)) return "max_completion_tokens";
  if (/max_tokens/.test(message)) return "max_tokens";
  if (/temperature/.test(message)) return "temperature";
  return null;
}

function splitDataUrl(dataUrl: string): { mime: string; b64: string } | null {
  const m = /^data:([^;,]+);base64,([\s\S]+)$/.exec(dataUrl);
  return m ? { mime: m[1], b64: m[2] } : null;
}

/* ------------------------------------------------------------------ */
/* Gemini                                                              */
/* ------------------------------------------------------------------ */

async function askGemini(
  opts: AskOptions,
  signal: AbortSignal,
): Promise<{ text: string | null; error: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { text: null, error: "" };

  const chain = process.env.GEMINI_MODEL
    ? [process.env.GEMINI_MODEL]
    : opts.image
      ? GEMINI_VISION
      : GEMINI_TEXT;

  let error = "";

  for (const model of chain) {
    const parts: unknown[] = [];
    const last = opts.messages[opts.messages.length - 1];
    if (opts.image) {
      const img = splitDataUrl(opts.image);
      if (!img) return { text: null, error: "bad image data url" };
      parts.push({ text: last?.text ?? "" });
      parts.push({ inline_data: { mime_type: img.mime, data: img.b64 } });
    }

    const contents = opts.image
      ? [{ role: "user", parts }]
      : opts.messages.map((m) => ({
          // Gemini calls the assistant turn "model".
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.text }],
        }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: opts.maxTokens,
        ...(opts.temperature !== undefined
          ? { temperature: opts.temperature }
          : {}),
        ...(opts.json ? { responseMimeType: "application/json" } : {}),
      },
    };
    if (opts.system) {
      body.systemInstruction = { parts: [{ text: opts.system }] };
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = (data.candidates?.[0]?.content?.parts ?? [])
          .map((p) => p.text ?? "")
          .join("")
          .trim();
        if (text) return { text, error: "" };
        error = `gemini/${model}: empty completion`;
        continue;
      }

      const raw = (await res.text()).replace(key, "<redacted>");
      error = `gemini/${model}: ${res.status} ${raw.slice(0, 160)}`;
      // 404 is an unknown model; 400 is often a bad parameter. Both are worth
      // trying the next model for. Anything else fails identically.
      if (res.status !== 400 && res.status !== 404) break;
    } catch {
      return { text: null, error: "gemini: aborted or network failure" };
    }
  }

  return { text: null, error };
}

/* ------------------------------------------------------------------ */
/* OpenAI                                                              */
/* ------------------------------------------------------------------ */

async function askOpenAI(
  opts: AskOptions,
  signal: AbortSignal,
): Promise<{ text: string | null; error: string }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { text: null, error: "" };

  const chain = process.env.OPENAI_CHAT_MODEL
    ? [process.env.OPENAI_CHAT_MODEL]
    : opts.image
      ? OPENAI_VISION
      : OPENAI_TEXT;

  const messages: unknown[] = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  if (opts.image) {
    const last = opts.messages[opts.messages.length - 1];
    messages.push({
      role: "user",
      content: [
        { type: "text", text: last?.text ?? "" },
        { type: "image_url", image_url: { url: opts.image, detail: "high" } },
      ],
    });
  } else {
    for (const m of opts.messages) {
      messages.push({ role: m.role, content: m.text });
    }
  }

  let error = "";

  for (const model of chain) {
    // Newer models want max_completion_tokens; older ones want max_tokens.
    const body: Record<string, unknown> = {
      model,
      max_completion_tokens: opts.maxTokens,
      messages,
    };
    if (opts.temperature !== undefined) body.temperature = opts.temperature;
    if (opts.json) body.response_format = { type: "json_object" };

    for (let attempt = 0; attempt < 4; attempt++) {
      let res: Response;
      try {
        res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify(body),
        });
      } catch {
        return { text: null, error: "openai: aborted or network failure" };
      }

      if (res.ok) {
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { text, error: "" };
        error = `openai/${model}: empty completion`;
        break;
      }

      const raw = await res.text();
      error = `openai/${model}: ${res.status} ${raw.slice(0, 160)}`;
      if (res.status !== 400 && res.status !== 404) break;

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
      break;
    }
  }

  return { text: null, error };
}

/* ------------------------------------------------------------------ */

/** Returns the model's text, or null. Never throws. */
export async function askAI(opts: AskOptions): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
  const errors: string[] = [];

  try {
    for (const provider of [askGemini, askOpenAI]) {
      const { text, error } = await provider(opts, controller.signal);
      if (text) return text;
      if (error) errors.push(error);
    }

    if (errors.length) {
      console.warn(`[ai] using offline answer — ${errors.join(" | ")}`);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
