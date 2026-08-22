import type { ClusterHit } from "../types";
import { rupeesToPaise } from "../money";

/**
 * Seeded fraud clusters, powering Scam Check and the "you are not alone"
 * banner on a new case.
 *
 * The banner is the point: NCRP already holds the largest fraud-signal corpus
 * in India — millions of reported UPI IDs, numbers and URLs — and returns
 * none of it to citizens. Clustering also turns 213 separate investigations
 * into one, which is the only realistic answer to a 1.4% FIR conversion rate.
 */

export const CLUSTERS: ClusterHit[] = [
  {
    identifier: "rahul.verma@ybl",
    kind: "upi",
    reports: 213,
    totalReportedPaise: rupeesToPaise(12_400_000),
    firstReportedAt: "2026-08-04T09:12:00.000Z",
    clusterId: "CL-8821",
    risk: "high",
  },
  {
    identifier: "9142207781",
    kind: "phone",
    reports: 487,
    totalReportedPaise: rupeesToPaise(31_800_000),
    firstReportedAt: "2026-06-19T06:40:00.000Z",
    clusterId: "CL-6042",
    risk: "high",
  },
  {
    identifier: "cbi-verification-portal.in",
    kind: "url",
    reports: 1024,
    totalReportedPaise: rupeesToPaise(88_200_000),
    firstReportedAt: "2026-05-02T11:05:00.000Z",
    clusterId: "CL-4417",
    risk: "high",
  },
  {
    identifier: "quickloan.support@okaxis",
    kind: "upi",
    reports: 62,
    totalReportedPaise: rupeesToPaise(2_100_000),
    firstReportedAt: "2026-07-28T14:22:00.000Z",
    clusterId: "CL-7730",
    risk: "medium",
  },
  {
    identifier: "8890114522",
    kind: "phone",
    reports: 9,
    totalReportedPaise: rupeesToPaise(148_000),
    firstReportedAt: "2026-08-15T17:31:00.000Z",
    clusterId: "CL-9033",
    risk: "medium",
  },
];

function classify(raw: string): ClusterHit["kind"] {
  const q = raw.trim();
  if (/^[a-z0-9][a-z0-9._-]{1,48}@[a-z]{2,12}$/i.test(q)) return "upi";
  if (/^\+?\d[\d\s-]{7,14}$/.test(q)) return "phone";
  if (/^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(q)) return "url";
  return "account";
}

function normalise(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/[\s-]/g, "");
}

export function lookupCluster(query: string): ClusterHit {
  const q = normalise(query);
  const hit = CLUSTERS.find((c) => normalise(c.identifier) === q);
  if (hit) return hit;

  return {
    identifier: query.trim(),
    kind: classify(query),
    reports: 0,
    totalReportedPaise: 0,
    firstReportedAt: "",
    clusterId: "",
    risk: "unknown",
  };
}

export function clusterById(id: string | null): ClusterHit | null {
  if (!id) return null;
  return CLUSTERS.find((c) => c.clusterId === id) ?? null;
}
