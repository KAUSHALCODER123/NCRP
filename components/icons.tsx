/**
 * Icons.
 *
 * One family, one grid, one weight. Every glyph is 24×24, stroked at 1.75
 * with round joins, and inherits currentColor — so an icon can never drift
 * out of step with the text beside it or break in dark mode.
 *
 * Emoji were doing this job before. They render differently on every
 * platform, ignore the theme, and read as informal on a service people
 * reach for on the worst day of their year.
 */

type Props = { className?: string; title?: string };

function Svg({
  children,
  className = "h-5 w-5",
  title,
}: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const IconShield = (p: Props) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5.5c0 4.4 2.9 8.2 7 9.5 4.1-1.3 7-5.1 7-9.5V6Z" />
    <path d="m9.2 12 2 2 3.6-4" />
  </Svg>
);

export const IconRupee = (p: Props) => (
  <Svg {...p}>
    <path d="M7 4h10M7 8h10M7 12h4.5a4 4 0 0 0 0-8" />
    <path d="M7 12h3l6.5 8" />
  </Svg>
);

export const IconPhone = (p: Props) => (
  <Svg {...p}>
    <path d="M6.4 3.6h3.1l1.5 3.9-2 1.3a12 12 0 0 0 5.4 5.4l1.3-2 3.9 1.5v3.1a1.7 1.7 0 0 1-1.9 1.7A15.8 15.8 0 0 1 4.7 5.5a1.7 1.7 0 0 1 1.7-1.9Z" />
  </Svg>
);

export const IconSearch = (p: Props) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Svg>
);

export const IconAlert = (p: Props) => (
  <Svg {...p}>
    <path d="M12 4.5 2.8 20h18.4Z" />
    <path d="M12 10v4.2M12 17.3h.01" />
  </Svg>
);

export const IconCheck = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.5 12 2.4 2.4 4.6-5" />
  </Svg>
);

export const IconClock = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.4V12l3 1.8" />
  </Svg>
);

export const IconLock = (p: Props) => (
  <Svg {...p}>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Svg>
);

export const IconUser = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
  </Svg>
);

export const IconMask = (p: Props) => (
  <Svg {...p}>
    <path d="M3.5 7.5c3-1.3 14-1.3 17 0 .4 4.6-1.2 8.6-4 10.3-1.4.9-2.5-.6-4.5-.6s-3.1 1.5-4.5.6c-2.8-1.7-4.4-5.7-4-10.3Z" />
    <path d="M8.5 11.5h1.5M14 11.5h1.5" />
  </Svg>
);

export const IconDoc = (p: Props) => (
  <Svg {...p}>
    <path d="M6 3.5h7.5L18 8v12.5H6Z" />
    <path d="M13.5 3.5V8H18M9 12.5h6M9 16h4" />
  </Svg>
);

export const IconCard = (p: Props) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
    <path d="M3.5 9.5h17M7 14.5h3.5" />
  </Svg>
);

export const IconTransfer = (p: Props) => (
  <Svg {...p}>
    <path d="M4 8h15M15.5 4.5 19 8l-3.5 3.5" />
    <path d="M20 16H5M8.5 12.5 5 16l3.5 3.5" />
  </Svg>
);

export const IconBook = (p: Props) => (
  <Svg {...p}>
    <path d="M4.5 5a2 2 0 0 1 2-2H19v15.5H6.5a2 2 0 0 0-2 2Z" />
    <path d="M4.5 20.5h14.5" />
  </Svg>
);

export const IconArrow = (p: Props) => (
  <Svg {...p}>
    <path d="M4.5 12h14M13.5 7l5 5-5 5" />
  </Svg>
);

export const IconExit = (p: Props) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
