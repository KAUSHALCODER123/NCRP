/**
 * Vision pass over an uploaded receipt or SMS screenshot.
 *
 * Returns raw transcribed text; entity extraction then happens in
 * lib/parser.ts, identically to pasted text. Keeping extraction in one place
 * means the regex/keyword rules are testable and the model is only ever asked
 * to do the thing models are good at — reading pixels.
 *
 * Handles vernacular notifications: bank SMS in Devanagari, Tamil or Bengali
 * still carries Latin numerals, so transcribing the script verbatim is enough
 * for the numeric fields that matter.
 *
 * Falls back to empty text rather than erroring. The citizen always keeps the
 * manual path, and an OCR outage must never block a report.
 */

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 12_000;
const MAX_BYTES = 10 * 1024 * 1024;

const PROMPT = `Transcribe ALL text visible in this payment receipt or bank SMS screenshot.

Rules:
- Output the text verbatim, preserving the order it appears on screen.
- Keep every digit exactly as shown. Do not correct, group or reformat numbers.
- Preserve labels next to values (e.g. "UPI Transaction ID", "Order ID", "Avl Bal") — the label matters more than the value.
- If text is in Hindi, Tamil, Bengali or another Indian script, transcribe it as-is; keep numerals as digits.
- No commentary, no summary. Text only.`;

export async function POST(request: Request) {
  const empty = { text: "", ok: false as const };

  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json(empty);

  let dataUrl = "";
  try {
    const body = (await request.json()) as { image?: string };
    dataUrl = body.image ?? "";
  } catch {
    return Response.json(empty);
  }

  if (!dataUrl.startsWith("data:image/")) return Response.json(empty);
  // base64 is ~4/3 of the byte size; guard before spending a request.
  if (dataUrl.length > MAX_BYTES * 1.4) return Response.json(empty);

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
        temperature: 0,
        max_tokens: 900,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) return Response.json(empty);

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    return Response.json({ text, ok: Boolean(text.trim()) });
  } catch {
    return Response.json(empty);
  } finally {
    clearTimeout(timer);
  }
}
