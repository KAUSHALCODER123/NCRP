import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";

/**
 * There is no national public officer-code system in India. A demo that ever
 * returns "verified" would publish the answer a fraudster needs, so this page
 * is deliberately incapable of authenticating anybody.
 */
export default function VerifyOfficerPage() {
  return (
    <>
      <TopBar back={{ href: "/", label: "Home" }} />
      <Shell>
        <Chip tone="breach">Safety warning</Chip>
        <h1 className="mt-4 font-display text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          Do not trust an officer code from a website
        </h1>
        <p className="mt-3 text-[18px] leading-relaxed text-ink-soft">
          India does not have a national public code that proves a caller is a
          police officer. Sahaay cannot verify an officer, and will never return
          a positive result for a code.
        </p>

        <Card className="mt-6 border-critical-border bg-critical-soft">
          <p className="text-[20px] font-bold text-ink">
            Hang up. Find the station number yourself. Call back.
          </p>
          <ol className="mt-4 space-y-3 text-[17px] leading-relaxed text-ink-soft">
            <li><strong className="text-ink">1.</strong> End the call or video call.</li>
            <li><strong className="text-ink">2.</strong> Find the police station through an official government directory—never use a number the caller sent you.</li>
            <li><strong className="text-ink">3.</strong> Call that published number and ask whether the officer and case exist.</li>
          </ol>
        </Card>

        <Card className="mt-5">
          <p className="text-[18px] font-semibold text-ink">
            There is no such thing as a digital arrest
          </p>
          <p className="mt-2 text-[17px] leading-relaxed text-ink-soft">
            Police do not arrest you over a video call. A real officer will not
            demand money, an OTP, a password, screen sharing, or secrecy from
            your family.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/freeze">I already paid</Button>
            <Button href="/scam-check" variant="secondary">
              Check the warning signs
            </Button>
          </div>
        </Card>

        <p className="mt-6 rounded-card border border-line bg-sunken p-4 text-[15px] leading-relaxed text-ink-soft">
          This is a student proof of concept, not a government verification
          service. For a real cybercrime, call 1930 or use cybercrime.gov.in.
        </p>
      </Shell>
    </>
  );
}
