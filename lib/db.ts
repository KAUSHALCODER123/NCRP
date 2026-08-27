import { MongoClient, type Collection, type Db } from "mongodb";

/**
 * Anonymous fraud signals.
 *
 * What goes in here is deliberately not a complaint. It is the identifier that
 * was reported — a UPI ID, a phone number, a link — with the kind of scam, a
 * coarse amount band and a timestamp. Nothing else. No name, no contact
 * number, no free text, no evidence, no case ID.
 *
 * That constraint is the point rather than a limitation. This site is a
 * realistic clone of a government reporting portal, and once it is on a public
 * URL some people will file real complaints into it believing they have
 * reported a crime. Storing their details would create a victim database in an
 * unreviewed cluster, held by someone with no authority to hold it. Storing
 * only the identifier they warn others about carries none of that, and is the
 * half that actually does any good — it is what turns separate complaints into
 * one investigation, and what makes Scam Check answer from real reports rather
 * than a seeded list.
 *
 * Amounts are stored as bands, never exact figures: an exact rupee amount plus
 * a timestamp is close to identifying on its own.
 */

export interface Signal {
  /** Normalised: lowercased, +91 stripped, protocol removed. */
  identifier: string;
  kind: "upi" | "phone" | "url" | "username" | "account" | "unknown";
  /** Learning Corner slug, when the flow knew it. */
  scam?: string;
  /** Coarse band. Never an exact amount. */
  band?: string;
  at: Date;
}

export interface SignalCount {
  identifier: string;
  kind: Signal["kind"];
  reports: number;
  firstAt: Date;
  lastAt: Date;
  scams: string[];
}

/** Bands, not figures. Wide enough that no single report is identifying. */
export function amountBand(paise: number): string | undefined {
  if (!paise || paise <= 0) return undefined;
  const rupees = paise / 100;
  if (rupees < 5_000) return "under-5k";
  if (rupees < 25_000) return "5k-25k";
  if (rupees < 100_000) return "25k-1L";
  if (rupees < 500_000) return "1L-5L";
  return "over-5L";
}

export function normaliseIdentifier(raw: string): string {
  const trimmed = raw.trim().toLowerCase();

  /*
   * Phone numbers first, and carefully. Indian mobiles start 6-9, so a bare
   * ten-digit number can legitimately begin "91" — that prefix can be part
   * number, not a country code followed by eight digits. Stripping a leading
   * 91 unconditionally turned that into 42207781 and split one reported
   * number into two identifiers that never met.
   *
   * So the country code only comes off when what remains is still a valid
   * ten-digit mobile.
   */
  const digits = trimmed.replace(/[^0-9+]/g, "");
  if (/^\+?\d{10,13}$/.test(digits)) {
    const bare = digits.replace(/^\+/, "");
    if (bare.length === 12 && bare.startsWith("91")) return bare.slice(2);
    if (bare.length === 11 && bare.startsWith("0")) return bare.slice(1);
    if (bare.length === 10) return bare;
    return bare;
  }

  return trimmed
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")
    .replace(/[\s()]/g, "");
}

/* ------------------------------------------------------------------ */

/*
 * Cached across hot reloads. Next recreates modules on every edit in
 * development, and without this each save would open another pool until the
 * cluster refuses connections.
 */
const globalForMongo = globalThis as unknown as {
  _mongo?: Promise<MongoClient> | null;
};

/**
 * One line per distinct failure, server-side.
 *
 * Every path in this file swallows its errors so a citizen's report never
 * depends on the database — which is correct, and which is exactly how a
 * broken connection stays invisible for a week. So failures are named once.
 */
let lastFailure = "";
function note(where: string, e: unknown) {
  const msg = `${where}: ${e instanceof Error ? e.message : String(e)}`.slice(0, 200);
  if (msg === lastFailure) return;
  lastFailure = msg;
  console.warn(`[db] ${msg}`);
}

function client(): Promise<MongoClient> | null {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    note("config", "MONGODB_URI is not set");
    return null;
  }
  if (!globalForMongo._mongo) {
    globalForMongo._mongo = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8_000,
      connectTimeoutMS: 8_000,
    })
      .connect()
      .catch((e) => {
        note("connect", e);
        // Do not cache a rejected promise: a transient network failure would
        // otherwise disable the database for the lifetime of the process.
        globalForMongo._mongo = null;
        throw e;
      });
  }
  return globalForMongo._mongo;
}

async function collection(): Promise<Collection<Signal> | null> {
  const c = client();
  if (!c) return null;
  try {
    const db: Db = (await c).db(process.env.MONGODB_DB || "NCRP");
    return db.collection<Signal>(process.env.MONGODB_COLLECTION || "complains");
  } catch (e) {
    note("collection", e);
    return null;
  }
}

let indexed = false;

async function ensureIndexes(col: Collection<Signal>) {
  if (indexed) return;
  indexed = true;
  try {
    await col.createIndex({ identifier: 1 });
    await col.createIndex({ at: -1 });
  } catch {
    /* an index we could not create is not worth failing a report over */
  }
}

/**
 * Records one signal. Returns false when the database is unreachable.
 *
 * Never throws, and callers never block on it: a citizen's report must not
 * depend on a database being up, and a failed write is worth strictly less
 * than the report itself.
 */
export async function recordSignal(s: Omit<Signal, "at">): Promise<boolean> {
  const id = normaliseIdentifier(s.identifier);
  if (!id || id.length > 120) return false;

  const col = await collection();
  if (!col) return false;

  try {
    await ensureIndexes(col);
    const doc: Signal = { identifier: id, kind: s.kind, at: new Date() };
    // Omit rather than store null: an absent band means "not applicable",
    // and a null in the collection invites someone to read it as zero.
    if (s.scam) doc.scam = s.scam;
    if (s.band) doc.band = s.band;
    await col.insertOne(doc);
    return true;
  } catch (e) {
    note("insert", e);
    return false;
  }
}

/** How many people have reported this identifier. Null if unreachable. */
export async function countSignal(raw: string): Promise<SignalCount | null> {
  const id = normaliseIdentifier(raw);
  if (!id) return null;

  const col = await collection();
  if (!col) return null;

  try {
    const [row] = await col
      .aggregate<SignalCount>([
        { $match: { identifier: id } },
        {
          $group: {
            _id: "$identifier",
            identifier: { $first: "$identifier" },
            kind: { $first: "$kind" },
            reports: { $sum: 1 },
            firstAt: { $min: "$at" },
            lastAt: { $max: "$at" },
            scams: { $addToSet: "$scam" },
          },
        },
      ])
      .toArray();
    if (!row) return null;
    return { ...row, scams: (row.scams ?? []).filter(Boolean) };
  } catch (e) {
    note("count", e);
    return null;
  }
}

/** Most-reported identifiers, for the Learning Corner's live section. */
export async function topSignals(limit = 5): Promise<SignalCount[]> {
  const col = await collection();
  if (!col) return [];

  try {
    return await col
      .aggregate<SignalCount>([
        {
          $group: {
            _id: "$identifier",
            identifier: { $first: "$identifier" },
            kind: { $first: "$kind" },
            reports: { $sum: 1 },
            firstAt: { $min: "$at" },
            lastAt: { $max: "$at" },
            scams: { $addToSet: "$scam" },
          },
        },
        { $sort: { reports: -1 } },
        { $limit: limit },
      ])
      .toArray();
  } catch {
    return [];
  }
}
