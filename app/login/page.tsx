"use client";

import { useRouter } from "next/navigation";
import { Card, Chip, Shell, TopBar } from "@/components/ui";
import { DEMO_PASSWORD, PERSONAS } from "@/lib/mock/personas";
import { useStore } from "@/lib/store";

/**
 * Credentials are printed here as well as in the submission form.
 * A judge who cannot log in scores zero.
 */
export default function LoginPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);

  function enter(email: string) {
    login(email);
    router.push("/dashboard");
  }

  return (
    <>
      <TopBar back={{ href: "/", label: "Home" }} />
      <Shell>
        <h1 className="text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          Demo logins
        </h1>
        <p className="mt-3 text-ink-soft">
          Tap any card to sign in — no password needed here. For the record,
          it&apos;s{" "}
          <code className="rounded bg-sunken px-1.5 py-0.5 text-[16px] font-semibold text-ink">
            {DEMO_PASSWORD}
          </code>
          .
        </p>

        <div className="mt-6 space-y-3">
          {PERSONAS.map((p) => (
            <button
              key={p.email}
              type="button"
              onClick={() => enter(p.email)}
              className="w-full rounded-card border border-line bg-surface p-5 text-left transition-colors hover:border-line-strong hover:bg-sunken"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[20px] font-semibold text-ink">
                  {p.name}
                </span>
                <Chip tone={p.role === "merchant" ? "pending" : "primary"}>
                  {p.demonstrates}
                </Chip>
              </div>
              <p className="mt-1 text-[16px] text-ink-soft">{p.blurb}</p>
              <p className="tnum mt-2 text-[15px] font-medium text-ink-faint">
                {p.email}
              </p>
            </button>
          ))}
        </div>

        <Card className="mt-6">
          <p className="text-[17px] font-semibold text-ink">
            Short on time? Start with Suresh.
          </p>
          <p className="mt-1 text-[16px] text-ink-soft">
            He did nothing wrong and is the person the current system harms
            invisibly. It&apos;s the part of this project you won&apos;t have
            seen elsewhere.
          </p>
        </Card>
      </Shell>
    </>
  );
}
