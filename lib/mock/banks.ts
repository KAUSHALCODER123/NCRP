import type { Institution } from "../types";

/**
 * Institutions contacted during a freeze fan-out.
 *
 * Latency windows are deliberately irregular. Banks are not uniform, and a
 * receipt where every row lands on a metronome reads as fake.
 */
export const INSTITUTIONS: Institution[] = [
  { id: "hdfc", name: "HDFC Bank", kind: "bank", latency: [700, 1600] },
  { id: "icici", name: "ICICI Bank", kind: "bank", latency: [900, 2100] },
  { id: "sbi", name: "State Bank of India", kind: "bank", latency: [1800, 4200] },
  { id: "axis", name: "Axis Bank", kind: "bank", latency: [800, 1900] },
  { id: "kotak", name: "Kotak Mahindra Bank", kind: "bank", latency: [700, 1700] },
  { id: "paytm", name: "Paytm Payments Bank", kind: "wallet", latency: [500, 1200] },
  { id: "phonepe", name: "PhonePe", kind: "psp", latency: [600, 1400] },
  { id: "gpay", name: "Google Pay", kind: "psp", latency: [600, 1500] },
  { id: "yesbank", name: "Yes Bank", kind: "bank", latency: [1200, 2800] },
  { id: "idfc", name: "IDFC First Bank", kind: "bank", latency: [900, 2000] },
];

export function institutionByName(name: string): Institution {
  const hit = INSTITUTIONS.find(
    (i) => i.name.toLowerCase() === name.toLowerCase(),
  );
  return hit ?? INSTITUTIONS[0];
}

export function randomInstitution(exclude: string[] = []): Institution {
  const pool = INSTITUTIONS.filter((i) => !exclude.includes(i.id));
  return pool[Math.floor(Math.random() * pool.length)] ?? INSTITUTIONS[0];
}

/**
 * Builds the fan-out plan for a freeze request.
 *
 * Hop 1 is the beneficiary. If the money has already moved, hop 2 exists —
 * and that is exactly where the collateral damage problem begins, because
 * the person at hop 2 is frequently innocent.
 */
export function planFanOut(debitBank: string) {
  const debit = institutionByName(debitBank);
  const beneficiary = randomInstitution([debit.id]);
  const layer2 = randomInstitution([debit.id, beneficiary.id]);
  return { debit, beneficiary, layer2 };
}
