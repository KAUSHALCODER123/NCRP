import { Button, Card, Shell, TopBar } from "@/components/ui";

/**
 * The appeal path for the Suspect Registry.
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
        <h1 className="text-[28px] font-bold leading-tight text-ink sm:text-[32px]">
          This is my account and it&apos;s been wrongly flagged
        </h1>
        <p className="mt-3 text-ink-soft">
          Being reported is not proof of anything. Legitimate businesses get
          flagged by mistake, and sometimes maliciously.
        </p>

        <Card className="mt-6">
          <p className="text-[17px] font-semibold text-ink">
            What we do while you appeal
          </p>
          <ul className="mt-3 space-y-2 text-[16px] text-ink-soft">
            <li>
              <strong className="text-ink">We mark it &ldquo;disputed&rdquo;</strong>{" "}
              immediately — anyone checking sees that you have contested it.
            </li>
            <li>
              <strong className="text-ink">A clock starts.</strong> The review is
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
            Not built out for this round
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            The appeal form itself is scoped for round two. It is documented
            here rather than hidden, because a public risk lookup without a way
            to contest it is the defect we set out to fix, not a feature.
          </p>
          <Button href="/scam-check" className="mt-4" variant="secondary">
            Back to Scam Check
          </Button>
        </Card>
      </Shell>
    </>
  );
}
