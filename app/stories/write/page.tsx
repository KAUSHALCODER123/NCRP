import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";

export default function WriteStoryPage() {
  return (
    <>
      <TopBar back={{ href: "/stories", label: "Fictional scenarios" }} />
      <Shell>
        <Chip tone="neutral">Prototype boundary</Chip>
        <h1 className="mt-4 font-display text-[30px] font-bold leading-tight text-ink sm:text-[36px]">
          Sahaay does not collect survivor stories
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">
          The scenarios on this site are fictional composites. This prototype
          has no moderation team, consent-withdrawal process, or secure system
          for publishing testimony, so accepting a real story here would be
          misleading and unsafe.
        </p>

        <Card className="mt-6">
          <p className="text-[18px] font-semibold text-ink">
            If you need to report a real incident
          </p>
          <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
            Do not enter personal details on Sahaay. Call <strong>1930</strong>
            for financial cyber fraud or use the official portal at
            cybercrime.gov.in.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="https://cybercrime.gov.in">Open official portal</Button>
            <Button href="/stories" variant="secondary">
              View fictional scenarios
            </Button>
          </div>
        </Card>

        <p className="mt-6 text-[15px] leading-relaxed text-ink-faint">
          Proof of concept only. Not affiliated with I4C, MHA, or the National
          Cyber Crime Reporting Portal. No real complaint is filed here.
        </p>
      </Shell>
    </>
  );
}
