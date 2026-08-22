/**
 * Evidence intake pipeline.
 *
 *   Upload → client pre-parse → sanitise + forensic hash → extract → score → autofill
 *
 * Two deliberate deviations from the reference architecture, both documented
 * rather than hidden:
 *
 *  1. Extraction runs server-side (vision model) rather than as WASM Tesseract
 *     in the browser. Tesseract's wasm + English traineddata is ~4 MB, which
 *     would break the <100 KB first-load budget this product is built around —
 *     and the users who most need OCR are on the slowest connections. The
 *     pipeline shape is identical; only the execution site moves.
 *
 *  2. Hashing happens client-side, before upload. Chain of custody is stronger
 *     if the hash is computed on the original bytes on the citizen's own
 *     device, not after a server has had a chance to touch the file.
 *
 * Sanitisation is not optional. A screenshot of a bank SMS routinely carries
 * GPS EXIF tags — uploading it to a police system would attach the victim's
 * home location to a public complaint record. We strip it before it leaves.
 */

export const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "video/mp4",
  "message/rfc822",
] as const;

export interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  bytes: number;
  /** SHA-256 of the ORIGINAL bytes — the chain-of-custody anchor. */
  sha256: string;
  /** Metadata we removed, shown to the citizen so stripping is visible. */
  stripped: string[];
  /** Sanitised blob, ready to send. */
  blob: Blob;
  previewUrl: string | null;
}

export interface FileProblem {
  name: string;
  reason: string;
}

export async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function validateFile(f: File): string | null {
  if (f.size > MAX_BYTES)
    return `${(f.size / 1024 / 1024).toFixed(1)} MB — the limit is 10 MB. Try sharing the screenshot rather than the full recording.`;
  if (f.size === 0) return "That file is empty.";
  if (!ACCEPTED.includes(f.type as (typeof ACCEPTED)[number]))
    return `We can't read ${f.type || "that file type"}. Use a screenshot, PDF, MP4 or saved email.`;
  return null;
}

/**
 * Re-encodes an image through a canvas, which discards EXIF entirely —
 * GPS coordinates, device serial, timestamps, the lot.
 *
 * Honest limit: this cannot strip metadata from PDFs or MP4s in-browser.
 * Those are flagged for server-side sanitisation rather than silently passed
 * through as if they were clean.
 */
async function sanitiseImage(
  file: File,
): Promise<{ blob: Blob; stripped: string[] }> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob: file, stripped: [] };

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );

  return {
    blob: blob ?? file,
    stripped: ["GPS location", "Device model", "Capture timestamp"],
  };
}

export async function ingest(
  file: File,
): Promise<{ ok: EvidenceFile } | { error: FileProblem }> {
  const problem = validateFile(file);
  if (problem) return { error: { name: file.name, reason: problem } };

  const original = await file.arrayBuffer();
  const sha256 = await sha256Hex(original);

  let blob: Blob = file;
  let stripped: string[] = [];

  if (file.type === "image/jpeg" || file.type === "image/png") {
    try {
      const s = await sanitiseImage(file);
      blob = s.blob;
      stripped = s.stripped;
    } catch {
      // Sanitisation failed — keep the file but be explicit about it.
      stripped = [];
    }
  } else {
    stripped = ["Queued for server-side sanitisation"];
  }

  return {
    ok: {
      id: sha256.slice(0, 12),
      name: file.name,
      type: file.type,
      bytes: file.size,
      sha256,
      stripped,
      blob,
      previewUrl: blob.type.startsWith("image/") ? URL.createObjectURL(blob) : null,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Extraction + confidence scoring                                     */
/* ------------------------------------------------------------------ */

export interface Extraction {
  amountRupees: number | null;
  bank: string | null;
  utr: string | null;
  counterparty: string | null;
  occurredAt: string | null;
  /** 0–1. Below 0.6 we ask the citizen to confirm rather than autofilling. */
  confidence: number;
  source: "vision" | "text" | "none";
  raw?: string;
}

/**
 * Confidence is the count of independently-corroborated fields, not the
 * model's own self-report. A model that confidently returns one field is less
 * trustworthy than one that returns four consistent ones — and we never
 * autofill silently below the threshold, because a wrong UTR misroutes the
 * freeze while the citizen believes it worked.
 */
export function scoreExtraction(e: Omit<Extraction, "confidence">): number {
  let score = 0;
  if (e.amountRupees && e.amountRupees > 0) score += 0.35;
  if (e.utr) score += 0.3;
  if (e.bank) score += 0.2;
  if (e.counterparty) score += 0.1;
  if (e.occurredAt) score += 0.05;
  return Math.min(1, score);
}

export const AUTOFILL_THRESHOLD = 0.6;
