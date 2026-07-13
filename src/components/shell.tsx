"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  RankIcon,
  PlayersIcon,
  CalendarIcon,
  PlusIcon,
  BellIcon,
  ShuttleIcon,
  SearchIcon,
} from "./icons";

/**
 * Layout is DESKTOP-FIRST and narrows to mobile, not the other way round.
 *
 * Desktop: a persistent left rail (the DUPR pattern) — navigation is always
 * visible, costs no vertical space, and leaves the full width for a real
 * multi-column content grid.
 *
 * Mobile (< lg): the rail collapses to a bottom tab bar. "Log" is the primary
 * action and is the only aqua item, so it reads as primary through contrast
 * rather than through a glow.
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

/** Bottom bar carries Log in the middle; the rail carries it as a button. */
const MOBILE_NAV: NavItem[] = [
  NAV[0],
  NAV[1],
  { href: "/log", label: "Log", Icon: PlusIcon, primary: true },
  NAV[2],
  NAV[3],
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`display text-[19px] leading-none tracking-[0.02em] ${className}`}>
      D<span className="text-cobalt">U</span>BR
    </span>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="min-h-dvh lg:flex">
      {/* ── DESKTOP RAIL ─────────────────────────────────────────────────── */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
        <Link href="/" className="flex items-center gap-2 px-2">
          <ShuttleIcon className="h-5 w-5 text-cobalt" />
          <Wordmark className="!text-[22px]" />
        </Link>

        <nav className="mt-8 flex flex-col gap-0.5">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] transition-colors ${
                  active
                    ? "bg-elevated font-semibold text-bone"
                    : "text-mute hover:bg-elevated/60 hover:text-bone"
                }`}
              >
                {/* Active marker is a tick — the same language as the rating rail. */}
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

        {/* The primary action lives at the top of the rail's dead space, not in
            a floating glowing circle. */}
        <Link
          href="/log"
          className="mt-5 flex items-center justify-center gap-2 rounded-[8px] bg-aqua py-2.5 text-[14px] font-semibold text-on-aqua transition-opacity hover:opacity-90"
        >
          <PlusIcon className="h-[18px] w-[18px]" />
          Log a match
        </Link>

        <div className="mt-auto">
          <Link
            href="/profile"
            className={`flex items-center gap-3 rounded-[8px] border border-line p-2.5 transition-colors ${
              isActive("/profile") ? "bg-elevated" : "hover:bg-elevated/60"
            }`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cobalt text-[12px] font-semibold text-white">
              JC
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-bone">
                Jonathan Chiang
              </span>
              <span className="block text-[11px] tabular-nums text-faint">5.302 · Advanced</span>
            </span>
          </Link>
        </div>
      </aside>

      {/* ── MAIN COLUMN ──────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar. On desktop it becomes a utility strip (search + alerts);
            on mobile it carries the wordmark, since the rail is hidden. */}
        {/* The top bar sits ON the gradient, so it is transparent and its
            controls float as their own white objects. A translucent full-width
            white bar over cobalt just reads as a washed-out lavender smear. On
            mobile it gets a solid surface, since content scrolls under it. */}
        <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-5 lg:h-20 lg:px-8">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <ShuttleIcon className="h-[18px] w-[18px] text-cobalt" />
              <Wordmark />
            </Link>

            {/* Desktop search — the rail freed up the horizontal room for it. */}
            <div className="hidden flex-1 items-center gap-2.5 rounded-[8px] border border-line bg-surface px-3 shadow-sm lg:flex lg:max-w-sm">
              <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
              <input
                placeholder="Search players, clubs, events"
                aria-label="Search"
                className="w-full bg-transparent py-2.5 text-[13px] text-bone outline-none placeholder:text-faint"
              />
            </div>

            <div className="ml-auto flex items-center gap-1">
              <button
                className="grid h-9 w-9 place-items-center rounded-[8px] text-mute transition-colors hover:bg-elevated hover:text-bone lg:h-10 lg:w-10 lg:rounded-full lg:bg-surface lg:text-cobalt lg:shadow-sm lg:hover:bg-surface"
                aria-label="Notifications"
              >
                <BellIcon className="h-[18px] w-[18px]" />
              </button>
              <Link
                href="/profile"
                aria-label="Profile"
                className="grid h-9 w-9 place-items-center rounded-full bg-cobalt text-[11px] font-semibold text-white lg:hidden"
              >
                JC
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-6 pb-28 lg:px-8 lg:pt-8 lg:pb-16">
          {children}
        </main>
      </div>

      {/* ── MOBILE TAB BAR ───────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/92 backdrop-blur-md lg:hidden">
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
