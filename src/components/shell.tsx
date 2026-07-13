"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  RankIcon,
  PlayersIcon,
  CalendarIcon,
  PlusIcon,
  SearchIcon,
} from "./icons";

/**
 * Layout is DESKTOP-FIRST and narrows to mobile.
 *
 * Desktop: a persistent left rail sitting directly ON the gradient — no panel
 * behind it. Only the active item gets a glass fill, so the nav reads as part
 * of the canvas rather than as a chrome slab bolted to the side.
 *
 * Mobile (< lg): the rail collapses to a bottom tab bar. The Figma only
 * specifies desktop, so the mobile bar is carried over from the previous build.
 */

const NAV = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/rankings", label: "Rankings", Icon: RankIcon },
  { href: "/players", label: "Players", Icon: PlayersIcon },
  { href: "/play", label: "Open Play", Icon: CalendarIcon },
];

type NavItem = {
  href: string;
  label: string;
  Icon: (p: { className?: string }) => React.JSX.Element;
  primary?: boolean;
};

const MOBILE_NAV: NavItem[] = [
  NAV[0],
  NAV[1],
  { href: "/log", label: "Log", Icon: PlusIcon, primary: true },
  NAV[2],
  NAV[3],
];

/** Solid white on the canvas — the mark is the one place the brand doesn't
    need the accent to assert itself. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`display leading-none tracking-[0.01em] text-bone ${className}`}>DUBR</span>
  );
}

/** The user's photo. A real face, per the Figma — initials were a placeholder. */
function Avatar({ size = 40 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-aqua"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/avatar.jpg"
        alt="Jonathan Chiang"
        width={size}
        height={size}
        /* The source is a 16:9 photo with the face above centre, so a plain
           object-center crop cuts the chin off. */
        className="h-full w-full object-cover object-[50%_22%]"
      />
    </span>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="min-h-dvh lg:flex lg:gap-[60px] lg:p-10">
      {/* ── DESKTOP RAIL ─────────────────────────────────────────────────── */}
      <aside className="sticky top-10 hidden h-[calc(100dvh-5rem)] w-[172px] shrink-0 flex-col lg:flex">
        <Link href="/" className="mb-10 block">
          <Wordmark className="text-[44px]" />
        </Link>

        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] transition-colors ${
                  active
                    ? "bg-surface font-semibold text-bone"
                    : "text-mute hover:bg-surface/50 hover:text-bone"
                }`}
              >
                <span
                  className={`absolute left-0 h-5 w-[3px] rounded-r-full bg-aqua transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* The primary action. Aqua, and the only aqua object in the rail. */}
        <Link
          href="/log"
          className="mt-6 flex items-center justify-center gap-2 rounded-[8px] bg-aqua py-2.5 text-[14px] font-semibold text-on-aqua transition-opacity hover:opacity-90"
        >
          <PlusIcon className="h-[18px] w-[18px]" />
          Log a match
        </Link>
      </aside>

      {/* ── MAIN COLUMN ──────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-md lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
          <div className="flex h-14 w-full items-center gap-4 px-5 lg:mb-8 lg:h-auto lg:px-0">
            <Link href="/" className="lg:hidden">
              <Wordmark className="text-[22px]" />
            </Link>

            <div className="hidden flex-1 items-center gap-2.5 rounded-[8px] bg-surface px-3 lg:flex lg:max-w-md">
              <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
              <input
                placeholder="Search players, clubs, events"
                aria-label="Search"
                className="w-full bg-transparent py-2.5 text-[13px] text-bone outline-none placeholder:text-faint"
              />
            </div>

            <Link href="/profile" aria-label="Profile" className="ml-auto">
              <Avatar size={40} />
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-5 pt-6 pb-28 lg:px-0 lg:pt-0 lg:pb-10">{children}</main>
      </div>

      {/* ── MOBILE TAB BAR ───────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/85 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-2xl items-stretch justify-between px-3">
          {MOBILE_NAV.map(({ href, label, Icon, primary }) => {
            const active = isActive(href);

            if (primary) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-1 flex-col items-center justify-center gap-1.5 pt-3 pb-[max(10px,env(safe-area-inset-bottom))]"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-aqua text-on-aqua transition-transform group-active:scale-95">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="label !text-[9px]">{label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="group relative flex flex-1 flex-col items-center justify-center gap-1.5 pt-3 pb-[max(10px,env(safe-area-inset-bottom))]"
              >
                <span
                  className={`absolute top-0 h-[2px] w-7 rounded-full transition-opacity ${
                    active ? "bg-aqua opacity-100" : "opacity-0"
                  }`}
                />
                <span className="grid h-8 w-8 place-items-center">
                  <Icon
                    className={`h-[19px] w-[19px] transition-colors ${
                      active ? "text-bone" : "text-faint group-hover:text-mute"
                    }`}
                  />
                </span>
                <span className={`label !text-[9px] ${active ? "!text-bone" : ""}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
