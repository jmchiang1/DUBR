/**
 * One drawn icon set, one stroke weight. The previous design used emoji as UI
 * chrome (📊 🏆 🥇), which is the loudest possible tell that nobody drew it.
 */
type P = { className?: string };

const base = "none";
const S = ({ children, className }: P & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill={base}
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "icon"}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const HomeIcon = (p: P) => (
  <S {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.5V21h13V9.5" />
  </S>
);

export const RankIcon = (p: P) => (
  <S {...p}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </S>
);

/** Shuttlecock — the one piece of sport-specific iconography in the set. */
export const ShuttleIcon = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="17.5" r="3.4" />
    <path d="M9.4 15.3 6 5" />
    <path d="M14.6 15.3 18 5" />
    <path d="M12 14.1V4" />
    <path d="M6 5c2-1.6 4-2.4 6-2.4S16 3.4 18 5" />
  </S>
);

export const PlayersIcon = (p: P) => (
  <S {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.2 2.7-5.4 6-5.4s6 2.2 6 5.4" />
    <path d="M16 5.3a3.2 3.2 0 0 1 0 5.9" />
    <path d="M18 14.9c2 .8 3.4 2.6 3.4 5.1" />
  </S>
);

export const CalendarIcon = (p: P) => (
  <S {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </S>
);

export const PlusIcon = (p: P) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);

export const ChevronIcon = (p: P) => (
  <S {...p}>
    <path d="m9 5 7 7-7 7" />
  </S>
);

export const ArrowUpIcon = (p: P) => (
  <S {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </S>
);

export const ArrowDownIcon = (p: P) => (
  <S {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </S>
);

export const SearchIcon = (p: P) => (
  <S {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </S>
);

export const BellIcon = (p: P) => (
  <S {...p}>
    <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
    <path d="M10.5 20a2 2 0 0 0 3 0" />
  </S>
);

export const PinIcon = (p: P) => (
  <S {...p}>
    <path d="M12 21s6.5-5.8 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.2 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.4" />
  </S>
);

export const MessageIcon = (p: P) => (
  <S {...p}>
    <path d="M20.5 12a7.5 7.5 0 0 1-10.9 6.7L4 20l1.4-4.4A7.5 7.5 0 1 1 20.5 12Z" />
  </S>
);

/** The composer's submit. A paper plane at 19px is mush, so this is an arrow. */
export const SendIcon = (p: P) => (
  <S {...p}>
    <path d="M12 19V5" />
    <path d="m5.5 11.5 6.5-6.5 6.5 6.5" />
  </S>
);

export const CloseIcon = (p: P) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </S>
);

/** Sliders, not a funnel: the panel behind this button is mostly ranges. */
export const FilterIcon = (p: P) => (
  <S {...p}>
    <path d="M4 7h10M18 7h2" />
    <path d="M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2.2" />
    <circle cx="8" cy="17" r="2.2" />
  </S>
);

export const PencilIcon = (p: P) => (
  <S {...p}>
    <path d="M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m14.5 5.5 4 4" />
  </S>
);

export const TrophyIcon = (p: P) => (
  <S {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4v1.5A3.5 3.5 0 0 0 7 11" />
    <path d="M17 6h3v1.5A3.5 3.5 0 0 1 17 11" />
    <path d="M12 14v3M9 20h6M10 17h4v3h-4z" />
  </S>
);
