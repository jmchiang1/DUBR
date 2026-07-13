"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, RankIcon, PlayersIcon, CalendarIcon, PlusIcon, SearchIcon } from "./icons";

/**
 * The app shell. Desktop-first: a persistent left rail that collapses to a
 * bottom tab bar below 1024px. All styling lives in styles/layout.css.
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

export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`display ${className}`}>DUBR</span>;
}

export function Avatar({ className = "avatar" }: { className?: string }) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src="/avatar.jpg" alt="Jonathan Chiang" className={className} />;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="app">
      <aside className="sidebar">
        <Link href="/" className="sidebar__brand display">
          DUBR
        </Link>

        <nav className="nav">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`nav__item ${active ? "is-active" : ""}`}
              >
                <Icon className="nav__icon" />
                {label}
              </Link>
            );
          })}
        </nav>

        <Link href="/log" className="btn btn--primary">
          <PlusIcon />
          Log a match
        </Link>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar__inner">
            <Link href="/" className="topbar__brand display">
              DUBR
            </Link>

            <div className="search">
              <SearchIcon className="search__icon" />
              <input
                className="search__input"
                placeholder="Search players, clubs, events"
                aria-label="Search"
              />
            </div>

            <Link href="/profile" aria-label="Profile" className="topbar__avatar">
              <Avatar />
            </Link>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>

      <nav className="tabbar">
        {MOBILE_NAV.map(({ href, label, Icon, primary }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active && !primary ? "page" : undefined}
              className={`tabbar__item ${primary ? "tabbar__item--primary" : ""} ${
                active && !primary ? "is-active" : ""
              }`}
            >
              <Icon className="tabbar__icon" />
              <span className="tabbar__label label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
