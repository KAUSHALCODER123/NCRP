import Link from "next/link";
import { Button, Card, Shell, TopBar } from "@/components/ui";

/**
 * Non-financial intake.
 *
 * There is no money to freeze here, so the first promise is different: for
 * harassment and image-based abuse, the urgent action is takedown and
 * evidence preservation, not a lien.
 *
 * Anonymous reporting is preserved for crimes against women and children —
 * that is deliberate policy in the real portal, and removing it would remove
 * the reason many victims report at all.
 */

const KINDS: Record<
  string,
  { title: string; lede: string; first: string; anonymous: boolean }
> = {
  harassment: {
    title: "Someone is threatening or blackmailing you",
    lede: "You have not done anything wrong, and you are not in trouble.",
    first:
      "We ask the platform to take the content down and preserve the evidence, before anything else.",
    anonymous: true,
  },
  impersonation: {
    title: "Someone is pretending to be you",
    lede: "A fake profile, or your name being used to cheat other people.",
    first:
      "We ask the platform to suspend the impersonating account and preserve the evidence.",
    anonymous: false,
  },
  account: {
    title: "Your account was hacked",
    lede: "Email, social media, or banking access taken over.",
    first:
      "We start a session-revocation and recovery request with the provider straight away.",
    anonymous: false,
  },
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  const k = KINDS[kind];

  if (!k) {
    return (
      <>
        <TopBar back={{ href: "/", label: "Home" }} />
        <Shell>
          <Card>
            <p className="text-[18px] font-semibold text-ink">
              We don&apos;t have that page.
            </p>
            <Button href="/" className="mt-5">
              Start again
            </Button>
          </Card>
        </Shell>
      </>
    );
  }

  return (
    <>
      <TopBar back={{ href: "/", label: "Back" }} />
      <Shell>
        <h1 className="font-display text-[28px] font-bold leading-tight text-ink sm:text-[32px]">
          {k.title}
        </h1>
        <p className="mt-3 text-ink-soft">{k.lede}</p>

        <Card className="mt-6">
          <p className="text-[17px] font-semibold text-ink">
            What happens first
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">{k.first}</p>
          {k.anonymous ? (
            <p className="mt-4 rounded-xl border border-line bg-sunken p-4 text-[16px] text-ink-soft">
              <strong className="text-ink">You can report anonymously.</strong>{" "}
              You&apos;ll still get a code to track it and add to it later,
              without ever giving us your name.
            </p>
          ) : null}
        </Card>

        <Card className="mt-5 border-dashed">
          <p className="text-[17px] font-semibold text-ink">
            Not built for this round
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            This proof of concept focuses on the money path, where the failure
            is largest and most measurable: of roughly ₹52,969 crore reported
            stolen, about 2.18% has been returned to victims. The
            non-financial journeys follow the same principles — act first, show
            a running clock, name an owner.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/freeze">See the money flow</Button>
            <Link
              href="/"
              className="inline-flex min-h-[52px] items-center px-2 text-[17px] font-semibold text-primary hover:underline"
            >
              Back to start
            </Link>
          </div>
        </Card>
      </Shell>
    </>
  );
}
