import { INSTITUTIONS } from "./banks";

/**
 * Bank directory with nodal cyber officer routing.
 *
 * Selecting a bank auto-populates its nodal officer, so the citizen never has
 * to find one. On the real portal this is a static HTML page of names and
 * phone numbers, and the escalation path is "go look one up and call them".
 */

export interface BankEntry {
  id: string;
  name: string;
  nodalEmail: string;
  grievance: string;
}

export const BANK_DIRECTORY: BankEntry[] = INSTITUTIONS.map((i) => ({
  id: i.id,
  name: i.name,
  nodalEmail: `nodal.cyber@${i.id}.example`,
  grievance: `1800-${(1000 + i.name.length * 37) % 9000}-${(100 + i.id.length * 11) % 900}`,
}));

export function bankByName(name: string): BankEntry | undefined {
  return BANK_DIRECTORY.find(
    (b) => b.name.toLowerCase() === name.trim().toLowerCase(),
  );
}

export function searchBanks(q: string): BankEntry[] {
  const s = q.trim().toLowerCase();
  if (!s) return BANK_DIRECTORY;
  return BANK_DIRECTORY.filter((b) => b.name.toLowerCase().includes(s));
}

/** Non-bank rails route to forensic units, not the bank freeze API. */
export const NON_BANK_ROUTE =
  "Cyber Forensic Unit (blockchain & merchant fraud)";
