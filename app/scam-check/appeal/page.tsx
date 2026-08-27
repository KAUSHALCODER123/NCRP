import { Button, Card, Shell, TopBar } from "@/components/ui";

/**
 * The production requirement for any future public risk corpus.
 *
 * The real public suspect-search repository is populated from citizen
 * complaints with no automated verification and no visible appeal flow — a
 * legitimate business's UPI handle can be flagged by a mistaken or malicious
 * report and stay flagged.
 *
 * Any product that leans on that corpus must ship the appeal in the same
 * release as the lookup, or it inherits the defect and amplifies it.
 */
export default function AppealPage() {
  return (
    <>
      <TopBar back={{ href: "/scam-check", label: "Back" }} />
      <Shell>
        <h1 className="font-display text-[28px] font-bold leading-tight text-ink sm:text-[32px]">
          No real account is listed on Sahaay
        </h1>
        <p className="mt-3 text-ink-soft">
          Scam Check uses only fictional, non-resolvable seed examples. Visitor
          submissions are not accepted or published by this prototype.
        </p>

        <Card className="mt-6">
          <p className="text-[17px] font-semibold text-ink">
            What a production version must do
          </p>
          <ul className="mt-3 space-y-2 text-[16px] text-ink-soft">
            <li>
              <strong className="text-ink">Mark it &ldquo;disputed&rdquo;</strong>{" "}
              immediately — anyone checking sees that you have contested it.
            </li>
            <li>
              <strong className="text-ink">Start a clock.</strong> The review is
              owed inside 7 days, and escalates on its own if it&apos;s missed.
            </li>
            <li>
              <strong className="text-ink">Nothing is frozen by a flag alone.</strong>{" "}
              A listing is a warning to others, not an enforcement action against
              you.
            </li>
          </ul>
        </Card>

        <Card className="mt-5 border-dashed">
          <p className="text-[17px] font-semibold text-ink">
            Why there is no appeal form here
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            There is nothing real to appeal: no visitor accusation enters the
            corpus. A production launch would require verified I4C data,
            moderation, notice, dispute status, and an enforceable appeal SLA
            to ship together. Until then, public submissions remain disabled.
          </p>
          <Button href="/scam-check" className="mt-4" variant="secondary">
            Back to Scam Check
          </Button>
        </Card>
      </Shell>
    </>
  );
}
