"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  RankIcon,
  PlayersIcon,
  CalendarIcon,
  MessageIcon,
  PlusIcon,
  SearchIcon,
} from "./icons";
import { useMessages } from "./messages-store";
import { useProfile } from "./profile-store";

/**
 * The app shell. Desktop-first: a persistent left rail that collapses to a
 * bottom tab bar below 1024px. All styling lives in styles/layout.css.
 */

type NavItem = {
  href: string;
  label: string;
  Icon: (p: { className?: string }) => React.JSX.Element;
  primary?: boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/rankings", label: "Rankings", Icon: RankIcon },
  { href: "/players", label: "Players", Icon: PlayersIcon },
  { href: "/play", label: "Open Play", Icon: CalendarIcon },
  { href: "/messages", label: "Messages", Icon: MessageIcon },
];

/* The tab bar drops Players rather than grow to six items: at 375px a sixth tab
   puts every label under 60px and they start truncating. Players is the one you
   reach through search and through a match card anyway — Messages is the one
   with something WAITING in it, which is what a tab bar is for. */
const MOBILE_NAV: NavItem[] = [
  NAV[0],
  NAV[1],
  { href: "/log", label: "Log", Icon: PlusIcon, primary: true },
  NAV[3],
  NAV[4],
];

export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`display ${className}`}>DUBR</span>;
}

/** Reads the profile store, so changing your photo on /profile changes it in the
    rail and on every match card at the same moment. An avatar that only updates
    on the page you edited it is a bug you notice immediately. */
export function Avatar({ className = "avatar" }: { className?: string }) {
  const { profile } = useProfile();
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src={profile.avatar} alt={profile.name} className={className} />;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  /**
   * A nav item is active on its own route and anything BELOW it — /play lights up
   * for /play/tuesday-lic. It must match on the path SEGMENT, not the string: a
   * bare `startsWith("/play")` also matches "/players", which lit Open Play up
   * every time you were on the Players page.
   */
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
  /* Read from the same store /messages writes to, so the badge cannot go on
     claiming unread messages you are in the middle of reading. */
  const { unread } = useMessages();

  return (
    <div className="app">
      <aside className="sidebar">
        <Link href="/" className="sidebar__brand display">
          DUBR
        </Link>

        <nav className="nav">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            const badge = href === "/messages" && unread > 0 ? unread : 0;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`nav__item ${active ? "is-active" : ""}`}
              >
                <Icon className="nav__icon" />
                {label}
                {badge > 0 && (
                  <span className="nav__badge" aria-label={`${badge} unread`}>
                    {badge}
                  </span>
                )}
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
          const badge = href === "/messages" && unread > 0;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active && !primary ? "page" : undefined}
              className={`tabbar__item ${primary ? "tabbar__item--primary" : ""} ${
                active && !primary ? "is-active" : ""
              }`}
            >
              <span className="tabbar__slot">
                <Icon className="tabbar__icon" />
                {/* A count is unreadable at 9px on a tab bar, so this is a dot.
                    The rail, which has the room, prints the number. */}
                {badge && <span className="tabbar__dot" aria-label={`${unread} unread`} />}
              </span>
              <span className="tabbar__label label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
