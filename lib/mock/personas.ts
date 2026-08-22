import type { Persona } from "../types";

/**
 * Demo logins. A judge who cannot get in scores zero, so these are printed
 * on the login screen itself as well as in the submission form.
 */
export const DEMO_PASSWORD = "sahaay2026";

export const PERSONAS: Persona[] = [
  {
    email: "priya@demo",
    name: "Priya Nair",
    role: "victim",
    blurb: "Nothing filed yet — run the 60-second freeze yourself.",
    demonstrates: "Freeze first, ask later",
  },
  {
    email: "ramesh@demo",
    name: "Ramesh Iyer",
    role: "victim",
    blurb: "Day 4. Assigned to an officer, SLA clock running down.",
    demonstrates: "A tracker that names an owner and a deadline",
  },
  {
    email: "anjali@demo",
    name: "Anjali Desai",
    role: "victim",
    blurb: "Money recovered and credited back. The complete journey.",
    demonstrates: "Money returned — the metric that actually matters",
  },
  {
    email: "suresh@demo",
    name: "Suresh Pillai",
    role: "merchant",
    blurb:
      "Did nothing wrong. ₹5,000 held from a legitimate sale — and the rest of his money still works.",
    demonstrates: "Freeze the amount, not the person",
  },
];

export function personaByEmail(email: string): Persona | null {
  const e = email.trim().toLowerCase();
  return PERSONAS.find((p) => p.email === e) ?? null;
}
