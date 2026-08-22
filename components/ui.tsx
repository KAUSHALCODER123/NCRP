import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";

type Tone = "neutral" | "held" | "pending" | "breach" | "primary";

const TONE_CHIP: Record<Tone, string> = {
  neutral: "bg-sunken text-ink-soft border-line",
  held: "bg-held-soft text-held border-held/25",
  pending: "bg-pending-soft text-pending border-pending/25",
  breach: "bg-breach-soft text-breach border-breach/25",
  primary: "bg-primary-soft text-primary border-primary/20",
};

export function Chip({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[15px] font-semibold",
        TONE_CHIP[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-card border border-line bg-surface p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  href,
  variant = "primary",
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "press inline-flex min-h-[54px] items-center justify-center gap-2 rounded-lg px-6 text-[17px] font-semibold disabled:opacity-45 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "border border-line-strong bg-surface text-ink hover:bg-sunken",
    ghost: "text-primary hover:bg-primary-soft",
  };
  const cls = clsx(base, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function PageHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
}) {
  return (
    <header className="mb-7">
      {eyebrow ? (
        <p className="mb-2 text-[15px] font-semibold uppercase tracking-wide text-ink-faint">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-[30px] font-bold leading-tight text-ink sm:text-[36px]">
        {title}
      </h1>
      {sub ? <p className="mt-3 max-w-2xl text-ink-soft">{sub}</p> : null}
    </header>
  );
}

export function Shell({
  children,
  width = "md",
}: {
  children: ReactNode;
  width?: "md" | "lg";
}) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-5 py-8 sm:py-10",
        width === "md" ? "max-w-3xl" : "max-w-5xl",
      )}
    >
      {children}
    </div>
  );
}

export function TopBar({ back }: { back?: { href: string; label: string } }) {
  // The site header is global now; this is just an in-page back affordance.
  if (!back) return null;
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-6">
      <Link
        href={back.href}
        className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary hover:underline"
      >
        <span aria-hidden="true">←</span> {back.label}
      </Link>
    </div>
  );
}

export function ShieldMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={clsx("h-6 w-6 text-primary", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.6 4.6 5.8v5.4c0 4.6 3.1 8.5 7.4 10.2 4.3-1.7 7.4-5.6 7.4-10.2V5.8Z" />
      <path d="m8.9 11.8 2.2 2.3 4-4.4" />
    </svg>
  );
}

export function Stat({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  tone?: Tone;
  hint?: string;
}) {
  const color =
    tone === "held"
      ? "text-held"
      : tone === "pending"
        ? "text-pending"
        : tone === "breach"
          ? "text-breach"
          : "text-ink";
  return (
    <div>
      <p className="text-[15px] font-medium text-ink-faint">{label}</p>
      <p className={clsx("data text-[28px] font-semibold leading-tight", color)}>
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[15px] text-ink-faint">{hint}</p> : null}
    </div>
  );
}
