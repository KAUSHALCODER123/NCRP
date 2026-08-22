import { classifyLocally, isValidClassification } from "@/lib/classify";
import type { Classification } from "@/lib/types";
import { guard } from "@/lib/rate-limit";
import { askOpenAI } from "@/lib/openai";

/**
 * Free text (typed or spoken, any language) -> category, statute, routing.
 *
 * The citizen never picks a category. The real portal opens with an abstract
 * taxonomy that a panicking victim cannot navigate, and filing under the wrong
 * one misroutes the case.
 *
 * Hard rule: a 4-second timeout and a deterministic fallback. A judge will not
 * wait, and a model outage must never be visible.
 */

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 4000;

const SYSTEM = `You classify cybercrime complaints reported by Indian citizens.
Return ONLY compact JSON, no prose, with exactly these keys:
{"category":string,"subcategory":string,"sections":string[],"modus":string,"routedTo":string}

- category: one of "Financial Fraud", "Impersonation", "Account Compromise", "Harassment", "Other"
- subcategory: specific modus (e.g. "Digital Arrest / Law Enforcement Impersonation", "UPI Fraud")
- sections: applicable Indian statute references, e.g. "BNS 318(4)", "IT Act s.66D"
- modus: one plain sentence a citizen would understand, no legalese
- routedTo: always "Cyber Police Station (auto-routed from the money trail)"

The complaint may be in any Indian language. Reply in English.`;

export async function POST(request: Request) {
  let text = "";

  /* Over budget: return the deterministic classification rather than an
     error. The citizen still gets a working form; only the model call is
     withheld. */
  const gate = guard(request, "classify", classifyLocally(""));
  if (gate.refusal) return gate.refusal;

  try {
    const body = (await request.json()) as { text?: string };
    text = (body.text ?? "").slice(0, 4000);
  } catch {
    /* fall through to fallback */
  }

  const fallback = classifyLocally(text);
  if (!text.trim()) return Response.json(fallback, { headers: gate.headers });

  const raw = await askOpenAI({
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: text },
    ],
    maxTokens: 300,
    jsonObject: true,
    timeoutMs: TIMEOUT_MS,
  });
  if (!raw) return Response.json(fallback, { headers: gate.headers });

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidClassification(parsed)) {
      return Response.json(fallback, { headers: gate.headers });
    }
    const out: Classification = { ...parsed, fallback: false };
    return Response.json(out, { headers: gate.headers });
  } catch {
    return Response.json(fallback, { headers: gate.headers });
  }
}
