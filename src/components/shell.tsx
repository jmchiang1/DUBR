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
} from "./icons";

const NAV = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/rankings", label: "Rankings", Icon: RankIcon },
  { href: "/log", label: "Log", Icon: PlusIcon, primary: true },
  { href: "/players", label: "Players", Icon: PlayersIcon },
  { href: "/play", label: "Open Play", Icon: CalendarIcon },
];

/** DUBR wordmark. Aqua carries only the "U" — the rating, the thing measured. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`display text-[19px] leading-none tracking-[0.02em] ${className}`}>
      D<span className="text-aqua">U</span>BR
    </span>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="substrate min-h-dvh">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-line/50 bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5 lg:max-w-5xl">
          <Link href="/" className="flex items-center gap-2">
            <ShuttleIcon className="h-[18px] w-[18px] text-mute" />
            <Wordmark />
          </Link>

          <div className="flex items-center gap-1">
            <button
              className="grid h-9 w-9 place-items-center rounded-[8px] text-mute transition-colors hover:bg-elevated hover:text-bone"
              aria-label="Notifications"
            >
              <BellIcon className="h-[18px] w-[18px]" />
            </button>
            <Link
              href="/profile"
              aria-label="Profile"
              className={`grid h-9 w-9 place-items-center rounded-full border text-[11px] font-semibold transition-colors ${
                isActive("/profile")
                  ? "border-aqua/60 bg-aqua/10 text-aqua-ink"
                  : "border-line bg-elevated text-mute hover:text-bone"
              }`}
            >
              JC
            </Link>
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-5 pt-6 pb-32 lg:max-w-5xl">{children}</main>

      {/* ── Bottom nav. No glowing FAB. "Log" is the primary action and is the
             only aqua item, so it reads as primary through contrast, not glow. */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/50 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-stretch justify-between px-3 lg:max-w-5xl">
          {NAV.map(({ href, label, Icon, primary }) => {
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
                  <span className="label !text-[9px] !text-mute">{label}</span>
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
                {/* Active state is a hairline rule at the top edge — the same
                    tick-mark language as the rating rail. */}
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
