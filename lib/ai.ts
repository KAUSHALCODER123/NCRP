/**
 * Model access, provider-agnostic.
 *
 * PROVIDERS. Gemini, then NVIDIA NIM, then OpenRouter, then OpenAI —
 * whichever has a key.
 * Several rather than one because this project has already lost its AI
 * features to an exhausted quota, and the failure was invisible: the offline
 * answers are good enough that nothing looked broken.
 *
 * The order is not arbitrary. This product answers in seven Indian languages,
 * and Gemini's flash-lite tier handles Indic scripts markedly better than the
 * small open models available elsewhere. The rest are redundancy: they keep
 * the demo alive if Gemini is unreachable, accepting a weaker answer over no
 * answer at all.
 *
 * OpenRouter is last, and that is a measured decision rather than a slight.
 * Its free tier is genuinely free, but several models return 429 at any given
 * moment, and the ones that stay up are reasoning models that leak their
 * working into the reply — "User wants a reply in Tamil, one short
 * sentence: ..." is not something to show someone who has just been
 * defrauded. So replies that look like leaked reasoning are rejected, and the
 * chain moves on.
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

/* NVIDIA NIM is OpenAI-compatible, so it reuses the same request path. */
const NIM_BASE = "https://integrate.api.nvidia.com/v1/chat/completions";
const NIM_TEXT = ["meta/llama-3.1-8b-instruct", "google/gemma-3-4b-it"];
const NIM_VISION = ["google/gemma-3-4b-it"];

/* OpenRouter is OpenAI-compatible too. Free slugs only. */
const OR_BASE = "https://openrouter.ai/api/v1/chat/completions";
const OR_TEXT = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "nvidia/nemotron-nano-9b-v2:free",
];

/**
 * Reasoning models on the free tier narrate their own thinking before
 * answering. That text is coherent enough to pass a length check and utterly
 * wrong to show a frightened person, so it is rejected rather than trimmed —
 * a half-stripped monologue is worse than moving to the next model.
 */
const LEAKED_REASONING = new RegExp(
  String.raw`^\s*(okay|alright|so|hmm|let me|the user|user wants|user is asking|we need to|we must|i need to|first,? i)`,
  "i",
);

export function looksLikeReasoning(text: string): boolean {
  return LEAKED_REASONING.test(text);
}

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

async function askOpenAICompatible(
  label: string,
  url: string,
  key: string | undefined,
  chain: string[],
  opts: AskOptions,
  signal: AbortSignal,
): Promise<{ text: string | null; error: string }> {
  if (!key) return { text: null, error: "" };

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
        res = await fetch(url, {
          method: "POST",
          signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
            // OpenRouter attributes usage to the calling app.
            "HTTP-Referer": "https://sahaay.example",
            "X-Title": "Sahaay",
          },
          body: JSON.stringify(body),
        });
      } catch {
        return { text: null, error: `${label}: aborted or network failure` };
      }

      if (res.ok) {
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text && looksLikeReasoning(text)) {
          error = `${label}/${model}: leaked reasoning, rejected`;
          break;
        }
        if (text) return { text, error: "" };
        error = `${label}/${model}: empty completion`;
        break;
      }

      const raw = await res.text();
      error = `${label}/${model}: ${res.status} ${raw.slice(0, 160)}`;
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

function openaiChain(opts: AskOptions) {
  return process.env.OPENAI_CHAT_MODEL
    ? [process.env.OPENAI_CHAT_MODEL]
    : opts.image
      ? OPENAI_VISION
      : OPENAI_TEXT;
}

function nimChain(opts: AskOptions) {
  return process.env.NVIDIA_MODEL
    ? [process.env.NVIDIA_MODEL]
    : opts.image
      ? NIM_VISION
      : NIM_TEXT;
}

/** Returns the model's text, or null. Never throws. */
export async function askAI(opts: AskOptions): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
  const errors: string[] = [];

  try {
    /*
     * Order: Gemini, NVIDIA, OpenRouter, OpenAI.
     *
     * Gemini leads because this product answers in seven Indian languages and
     * its flash-lite tier handles Indic scripts markedly better than the small
     * open models behind the others.
     *
     * OpenAI is last despite being the most capable of the four, because its
     * credit is exhausted: putting it earlier spends a round-trip on a
     * guaranteed 429 before reaching a provider that can actually answer, and
     * this chain runs while someone is waiting. It stays in the list so that
     * topping up the account silently restores it.
     */
    const providers = [
      () => askGemini(opts, controller.signal),
      () =>
        askOpenAICompatible(
          "nvidia",
          NIM_BASE,
          process.env.NVIDIA_API_KEY,
          nimChain(opts),
          opts,
          controller.signal,
        ),
      () =>
        askOpenAICompatible(
          "openrouter",
          OR_BASE,
          process.env.OPENROUTER_API_KEY,
          process.env.OPENROUTER_MODEL
            ? [process.env.OPENROUTER_MODEL]
            : OR_TEXT,
          opts,
          controller.signal,
        ),
      () =>
        askOpenAICompatible(
          "openai",
          "https://api.openai.com/v1/chat/completions",
          process.env.OPENAI_API_KEY,
          openaiChain(opts),
          opts,
          controller.signal,
        ),
    ];

    for (const provider of providers) {
      const { text, error } = await provider();
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
