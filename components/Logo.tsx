import clsx from "clsx";

/**
 * The Sahaay mark.
 *
 * It is the money trail, shrunk to a monogram: an open node, a solid line,
 * and a filled node where the money stops. That is the product's entire
 * argument — intercept along the line — carried inside a shield for the
 * institutional register the subject demands.
 *
 * Deliberately not a rupee glyph in a circle, and deliberately not the State
 * Emblem: this is a student project, and a mark that borrows government
 * insignia is the same shape as the phishing sites the product exists to
 * fight.
 *
 * Legible down to 20px, where the interior reads as a dot-and-line and the
 * shield carries the recognition.
 */
export function Logo({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={clsx("shrink-0", className)}
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M16 2.6 6.3 6.9v8.4c0 6.6 4.1 12.3 9.7 14.1 5.6-1.8 9.7-7.5 9.7-14.1V6.9Z"
        fill="currentColor"
      />
      {/* The trail: money enters open, and is held. */}
      <circle
        cx="11.4"
        cy="16"
        r="2"
        stroke="var(--color-surface)"
        strokeWidth="1.6"
      />
      <path
        d="M13.9 16h3.4"
        stroke="var(--color-surface)"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <circle cx="20.4" cy="16" r="2.7" fill="var(--color-surface)" />
    </svg>
  );
}

export function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo className="h-9 w-9 text-primary" />
      <span className="leading-none">
        <span className="block font-display text-[21px] font-bold tracking-tight text-ink">
          Sahaay
        </span>
        {!compact ? (
          <span className="mt-0.5 hidden text-[12.5px] leading-tight text-ink-faint xs:block">
            Cyber crime reporting
          </span>
        ) : null}
      </span>
    </span>
  );
}
