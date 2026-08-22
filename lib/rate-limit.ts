/**
 * Rate limiting for the API routes.
 *
 * Two of these endpoints spend money on every call (`/api/classify` and
 * `/api/ocr` both hit a paid model), and one holds a connection open for
 * several seconds (`/api/freeze/stream`). Unmetered, a single script could
 * drain the project's API credit in minutes or exhaust the server's
 * connections — and the demo would be dead in front of judges.
 *
 * A fixed-window counter in memory, deliberately:
 *  - it needs no external service, which matters for a mocked POC,
 *  - it is per-instance, so a serverless deployment enforces roughly
 *    limit × instances. That is a real limitation, stated rather than
 *    hidden; production would use Redis or Vercel KV for a shared window.
 *
 * The limits are chosen to be invisible to a person and obstructive to a
 * loop. Nobody classifies twenty complaints a minute by hand.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Stops the map growing without bound on a long-lived server. */
function sweep(now: number) {
  if (windows.size < 5_000) return;
  for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
}

export interface Limit {
  /** Requests permitted per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export const LIMITS = {
  /** Paid model call. */
  classify: { limit: 20, windowMs: 60_000 },
  /** Paid vision call, and a much heavier one. */
  ocr: { limit: 8, windowMs: 60_000 },
  /** Holds a connection open for seconds at a time. */
  stream: { limit: 30, windowMs: 60_000 },
} satisfies Record<string, Limit>;

export interface Verdict {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

/**
 * Identifies the caller.
 *
 * Behind Vercel, `x-forwarded-for` is set by the platform. Locally it is
 * absent, so everything collapses to one bucket — fine for development, and
 * not something to paper over with a spoofable fallback header.
 */
export function callerKey(request: Request, bucket: string): string {
  const fwd = request.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
  return `${bucket}:${ip}`;
}

export function check(key: string, { limit, windowMs }: Limit): Verdict {
  const now = Date.now();
  sweep(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    windows.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt, retryAfterSec: 0 };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const ok = existing.count <= limit;
  return {
    ok,
    remaining,
    resetAt: existing.resetAt,
    retryAfterSec: ok ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  };
}

export function headers(v: Verdict, l: Limit): Record<string, string> {
  const h: Record<string, string> = {
    "RateLimit-Limit": String(l.limit),
    "RateLimit-Remaining": String(v.remaining),
    "RateLimit-Reset": String(Math.ceil((v.resetAt - Date.now()) / 1000)),
  };
  if (!v.ok) h["Retry-After"] = String(v.retryAfterSec);
  return h;
}

/**
 * Guards a route. Returns a 429 Response when the caller is over budget,
 * or null to proceed.
 *
 * The body is shaped like the endpoint's normal success payload wherever it
 * can be, so a rate-limited client falls back to its offline path instead of
 * showing the citizen an error they cannot act on.
 */
export interface Guarded {
  /** Non-null when the caller is over budget — return it immediately. */
  refusal: Response | null;
  /** Merge into the success response so clients can pace themselves. */
  headers: Record<string, string>;
}

export function guard(
  request: Request,
  bucket: keyof typeof LIMITS,
  fallbackBody: unknown,
): Guarded {
  const l = LIMITS[bucket];
  const v = check(callerKey(request, bucket), l);
  const h = headers(v, l);

  if (v.ok) return { refusal: null, headers: h };

  return {
    refusal: Response.json(fallbackBody, {
      status: 429,
      headers: { ...h, "Cache-Control": "no-store" },
    }),
    headers: h,
  };
}
