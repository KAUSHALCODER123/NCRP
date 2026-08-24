import type { Metadata } from "next";
import { Card, Chip, Shell, TopBar } from "@/components/ui";

export const metadata: Metadata = {
  title: "How this is built — Sahaay",
  description:
    "What is real, what is simulated, how a report moves through Sahaay, and the prototype’s known limitations.",
};

const LIMITATIONS = [
  {
    title: "No bank or government integration",
    body: "Freeze requests, acknowledgements, case routing, officer actions and money restoration are simulations. This prototype cannot file a complaint or place a real lien.",
  },
  {
    title: "Rate limits are per server instance",
    body: "The in-memory limiter protects the demo from simple abuse, but limits do not coordinate across Vercel instances. A production service would use a shared store such as Redis.",
  },
  {
    title: "Language coverage is incomplete",
    body: "Core interface strings cover seven languages, but long-form learning content and this technical page remain in English. Machine-generated translations need native-speaker review before public use.",
  },
  {
    title: "The suspect corpus starts small",
    body: "Scam Check begins with clearly labelled seeded examples. Live reports add only anonymous identifiers to the shared signal store; it is not an authoritative suspect registry.",
  },
] as const;

const REALITY = [
  ["Citizen journeys", "Real interface", "The report, tracker, lien dispute, accessibility controls and seven-language shell are fully clickable browser experiences."],
  ["Bank action", "Simulated", "Institution routing, acknowledgements, money movement, micro-liens and restoration use fictional data and timed events."],
  ["AI classification", "Real + fallback", "Up to four configured providers are tried in sequence. A deterministic classifier takes over on failure or timeout."],
  ["Receipt OCR", "Real + manual fallback", "A vision model transcribes uploaded receipts. Parsing remains deterministic, and a failed OCR call never blocks manual entry."],
  ["Fraud-signal database", "Real, deliberately narrow", "MongoDB stores the reported identifier, scam type, coarse amount band and timestamps—never a complainant, case, message or evidence file."],
  ["Abuse protection", "Real, prototype-scale", "Classification, OCR and event streams have per-IP fixed-window rate limits with standard response headers."],
  ["Evidence handling", "Real in the browser", "Images are re-encoded to remove EXIF location data; SHA-256 is computed from the original bytes as a chain-of-custody anchor."],
  ["Accounts and cases", "Simulated", "Demo credentials, personas, case histories and balances are fictional and persist locally in the judge’s browser."],
] as const;

function FlowStep({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <li className="relative flex gap-4 pb-8 last:pb-0">
      <span className="data relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-on">
        {number}
      </span>
      <div className="pt-1">
        <h3 className="text-[18px] font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-[16px] leading-relaxed text-ink-soft">{body}</p>
      </div>
    </li>
  );
}

export default function HowBuiltPage() {
  return (
    <>
      <TopBar back={{ href: "/", label: "Home" }} />
      <Shell width="lg">
        <Chip tone="primary">Prototype transparency</Chip>
        <h1 className="mt-5 max-w-3xl font-display text-[34px] font-bold leading-tight tracking-tight text-ink sm:text-[44px]">
          How this is built
        </h1>
        <p className="mt-4 max-w-3xl text-[18px] leading-relaxed text-ink-soft">
          Sahaay is a working citizen-interface proof of concept, not a connected
          government service. This page separates the implemented engineering
          from the systems the demo represents.
        </p>

        <section aria-labelledby="limits" className="mt-12">
          <p className="eyebrow">Limitations first</p>
          <h2 id="limits" className="mt-2 font-display text-[28px] font-bold text-ink">
            What this prototype cannot prove
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {LIMITATIONS.map((item) => (
              <Card key={item.title} className="border-pending/30 bg-pending-soft/40">
                <h3 className="text-[18px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">{item.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="reality" className="mt-16">
          <p className="eyebrow">No black boxes</p>
          <h2 id="reality" className="mt-2 font-display text-[28px] font-bold text-ink">
            What is real and what is simulated
          </h2>
          <div className="mt-6 overflow-x-auto rounded-card border border-line bg-surface shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead className="bg-sunken">
                <tr>
                  <th scope="col" className="px-5 py-4 text-[15px] font-semibold text-ink">Part</th>
                  <th scope="col" className="px-5 py-4 text-[15px] font-semibold text-ink">Status</th>
                  <th scope="col" className="px-5 py-4 text-[15px] font-semibold text-ink">What that means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {REALITY.map(([part, status, meaning]) => (
                  <tr key={part} className="align-top">
                    <th scope="row" className="px-5 py-4 text-[16px] font-semibold text-ink">{part}</th>
                    <td className="px-5 py-4 text-[15px] font-semibold text-primary-text">{status}</td>
                    <td className="px-5 py-4 text-[16px] leading-relaxed text-ink-soft">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="architecture" className="mt-16">
          <p className="eyebrow">End to end</p>
          <h2 id="architecture" className="mt-2 font-display text-[28px] font-bold text-ink">
            From one report to the next person’s warning
          </h2>
          <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-ink-soft">
            The urgent case stays in the citizen’s browser. Only a narrow,
            anonymous warning signal crosses the database boundary.
          </p>
          <Card className="mt-6 sm:p-8">
            <ol className="relative before:absolute before:bottom-5 before:left-[21px] before:top-5 before:w-px before:bg-line-strong">
              <FlowStep number="01" title="Paste a bank SMS or upload a receipt" body="Deterministic parsing extracts the amount, rail and transaction reference. OCR can supply text from an image, but it is optional." />
              <FlowStep number="02" title="Classify and dispatch immediately" body="The classifier identifies the route while a simulated freeze fan-out begins. Details continue after dispatch: freeze first, ask later." />
              <FlowStep number="03" title="Follow only the disputed amount" body="Timed bank events show the money trail. Each downstream hold is represented as an amount-specific micro-lien, never an account freeze." />
              <FlowStep number="04" title="Notify the affected person in the same operation" body="The lien notice shows the held amount, usable balance, reason, dispute route and SLA. Enforcement cannot exist without notification in the domain model." />
              <FlowStep number="05" title="Turn the report into prevention" body="The app sends only the suspect identifier, scam type and a coarse amount band to MongoDB. The next Scam Check can warn that others reported the same identifier." />
            </ol>
          </Card>
        </section>

        <section aria-labelledby="safeguards" className="mt-16">
          <p className="eyebrow">Deliberate engineering</p>
          <h2 id="safeguards" className="mt-2 font-display text-[28px] font-bold text-ink">
            Failure is designed to be boring
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="data text-[24px] font-semibold text-primary-text">4 → offline</p>
              <h3 className="mt-2 text-[18px] font-semibold text-ink">AI failover</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">Gemini, NVIDIA NIM, OpenRouter and OpenAI are optional. Exhausting the chain returns a safe deterministic answer.</p>
            </Card>
            <Card>
              <p className="data text-[24px] font-semibold text-primary-text">0 PII</p>
              <h3 className="mt-2 text-[18px] font-semibold text-ink">Database boundary</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">The signal API allow-lists a few fields and ignores everything else. Tests enforce that names, case IDs, free text and evidence never enter it.</p>
            </Card>
            <Card>
              <p className="data text-[24px] font-semibold text-primary-text">SHA-256</p>
              <h3 className="mt-2 text-[18px] font-semibold text-ink">Evidence integrity</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">Original bytes are hashed before a display copy is re-encoded, stripping EXIF metadata such as a victim’s location.</p>
            </Card>
          </div>
        </section>

        <Card className="mt-16 border-primary/25 bg-primary-soft">
          <p className="text-[18px] font-semibold text-ink">The production claim is intentionally smaller than the product idea.</p>
          <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
            Sahaay demonstrates a safer sequence and a citizen-visible contract.
            Shipping it would still require I4C and bank integrations, shared
            abuse controls, security review, native-language review and formal
            operating authority.
          </p>
        </Card>
      </Shell>
    </>
  );
}
