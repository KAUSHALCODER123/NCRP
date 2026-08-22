"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button, Card, Chip, Shell, TopBar } from "@/components/ui";
import { formatPaise } from "@/lib/money";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-now";
import { useT } from "@/lib/i18n";
import { personaByEmail } from "@/lib/mock/personas";

export default function DashboardPage() {
  // Reads client-stored data; SSR cannot be correct for it.
  const t = useT();
  const hydrated = useHydrated();
  const email = useStore((s) => s.currentEmail);
  /*
   * Select the raw arrays — their identity is stable — and derive here.
   * Filtering inside the selector returns a fresh array on every read, which
   * breaks useSyncExternalStore's requirement that a snapshot be cached.
   */
  const allCases = useStore((s) => s.cases);
  const allLiens = useStore((s) => s.liens);
  const logout = useStore((s) => s.logout);

  const cases = useMemo(
    () => (email ? allCases.filter((c) => c.ownerEmail === email) : []),
    [allCases, email],
  );
  const liens = useMemo(
    () => (email ? allLiens.filter((l) => l.ownerEmail === email) : []),
    [allLiens, email],
  );

  const persona = email ? personaByEmail(email) : null;

  if (!hydrated) {
    return (
      <Shell>
        <div className="animate-pulse space-y-4" aria-hidden="true">
          <div className="h-9 w-56 rounded bg-sunken" />
          <div className="h-24 rounded-card bg-sunken" />
          <div className="h-24 rounded-card bg-sunken" />
        </div>
        <p className="sr-only">Loading your cases…</p>
      </Shell>
    );
  }

  if (!email) {
    return (
      <>
        <TopBar />
        <Shell>
          <h1 className="font-display text-[30px] font-bold text-ink">
            {t("db.yourCases")}
          </h1>
          <Card className="mt-6">
            <p className="text-[18px] font-semibold text-ink">
              {t("db.notSignedIn")}
            </p>
            <Button href="/login" className="mt-5">
              {t("db.pickLogin")}
            </Button>
          </Card>
        </Shell>
      </>
    );
  }

  return (
    <>
      <TopBar back={{ href: "/", label: "Home" }} />
      <Shell>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-bold leading-tight text-ink sm:text-[32px]">
              {persona?.name ?? email}
            </h1>
            <p className="data mt-1 text-[16px] text-ink-faint">{email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-[16px] font-semibold text-primary hover:underline"
          >
            {t("db.signOut")}
          </button>
        </div>

        {liens.length > 0 ? (
          <>
            <h2 className="mt-8 text-[20px] font-bold text-ink">
              {t("db.holds")}
            </h2>
            <div className="mt-3 space-y-3">
              {liens.map((l) => (
                <Link
                  key={l.id}
                  href={`/lien/${l.id}`}
                  className="block rounded-card border border-pending/30 bg-pending-soft p-5 transition-colors hover:bg-pending-soft/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[19px] font-semibold text-ink">
                      {formatPaise(l.amountPaise)} on hold
                    </span>
                    <Chip tone={l.liftedAt ? "held" : "pending"}>
                      {l.liftedAt ? t("db.lifted") : t("db.actionAvailable")}
                    </Chip>
                  </div>
                  <p className="mt-1 text-[16px] text-ink-soft">
                    {formatPaise(l.balancePaise)} of your balance is unaffected
                    and fully usable.
                  </p>
                  <p className="data mt-2 text-[15px] text-ink-faint">
                    {l.accountMask} · {l.institutionName}
                  </p>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        <h2 className="mt-8 text-[20px] font-bold text-ink">{t("db.yourCases")}</h2>
        {cases.length === 0 ? (
          <Card className="mt-3">
            <p className="text-[17px] text-ink-soft">
{t("db.nothingFiled")}
            </p>
            <Button href="/freeze" className="mt-4">
              {t("db.fileReport")}
            </Button>
          </Card>
        ) : (
          <div className="mt-3 space-y-3">
            {cases.map((c) => {
              const held = c.freezes.reduce((a, f) => a + f.heldPaise, 0);
              return (
                <Link
                  key={c.id}
                  href={`/case/${c.id}`}
                  className="block rounded-card border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-sunken"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="data text-[16px] font-semibold text-ink-soft">
                      {c.id}
                    </span>
                    <Chip tone={c.status === "closed" ? "held" : "primary"}>
                      {c.status === "closed" ? t("db.moneyReturned") : t("db.active")}
                    </Chip>
                  </div>
                  <p className="mt-2 text-[19px] font-semibold text-ink">
                    {formatPaise(c.transaction?.amountPaise ?? 0)} reported
                  </p>
                  <p className="mt-0.5 text-[16px] text-ink-soft">
                    {c.restoration.creditedPaise > 0
                      ? `${formatPaise(c.restoration.creditedPaise)} credited back to you`
                      : `${formatPaise(held)} held · ${c.assignedOwner ?? t("db.awaitingAssignment")}`}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </Shell>
    </>
  );
}
