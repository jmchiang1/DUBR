import Link from "next/link";
import { Trend } from "@/components/trend-chart";
import { Avatar } from "@/components/shell";
import { ChevronIcon, PinIcon, TrophyIcon } from "@/components/icons";
import { ME, TREND, DISCIPLINES, fmt, levelFor, fmtDelta } from "@/lib/dubr";

const MENU = [
  { label: "Rating history", sub: "Every match, every delta", href: "/log" },
  { label: "How DUBR works", sub: "What moves your number, and why", href: "#" },
  { label: "Clubs", sub: "Kotofit LIC", href: "#" },
  { label: "Settings", sub: "Name, disciplines, availability", href: "#" },
];

export default function Profile() {
  const level = levelFor(ME.singles!);
  const change = TREND[TREND.length - 1] - TREND[0];

  return (
    <div className="stack">
      <header className="card profile rise">
        <div className="profile__id">
          <Avatar className="avatar avatar--lg" />
          <div style={{ minWidth: 0 }}>
            <h1 className="profile__name display">{ME.name}</h1>
            <div className="profile__meta">
              <PinIcon />
              <span>
                {ME.location} · {ME.club}
              </span>
            </div>
          </div>
        </div>

        <div className="profile__social">
          <span className="session__spots">{level.name}</span>
        </div>
      </header>

      <div className="split">
        {/* All three ratings at once. A badminton player is three numbers, not
            one — mixed reading NR is information, not a gap to paper over. */}
        <section className="card card--pad rise" style={{ animationDelay: "40ms" }}>
          <div className="label">Ratings</div>
          <div
            className="stat-grid"
            style={{ marginTop: 16, gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}
          >
            {DISCIPLINES.map((d) => {
              const v = ME[d.id];
              return (
                <div key={d.id}>
                  <div className="label">{d.label}</div>
                  <div className={`stat__value figure ${v === null ? "text-faint" : ""}`}>
                    {fmt(v)}
                  </div>
                  <div className="stat__sub">
                    {v === null
                      ? "5 matches needed"
                      : `${Math.round(ME.reliability * 100)}% reliable`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* A real chart of a real number — not four invented "skill dimension"
            bars derived from nothing. */}
        <section className="card card--pad rise" style={{ animationDelay: "80ms" }}>
          <div className="row row--between">
            <div>
              <div className="label">Last 90 Days</div>
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <span className="stat__value figure" style={{ marginTop: 0 }}>
                  {fmt(ME.singles)}
                </span>
                <span className={`delta delta--bare ${change >= 0 ? "is-up" : "is-down"}`}>
                  {fmtDelta(change)}
                </span>
              </div>
            </div>
            <Trend points={TREND} className="profile__spark" />
          </div>

          <div
            className="stat-grid stat-grid--divided"
            style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}
          >
            <Mini label="Matches" value={String(ME.matches)} />
            <Mini label="Wins" value={String(ME.wins)} />
            <Mini label="Best Win" value="5.932" />
          </div>
        </section>
      </div>

      {/* Earned milestones only. The old design showed eight locked hexagons and
          one earned, which is mostly a display of what you have not done. */}
      <section className="card card--pad rise" style={{ animationDelay: "120ms" }}>
        <div className="label">Milestones</div>
        <ul className="grid-cards" style={{ marginTop: 14 }}>
          <Milestone title="Reached Advanced" sub="Crossed 5.000 on Jun 14" />
          <Milestone title="Beat a higher-rated player" sub="Kevin Cheng · 5.932" />
        </ul>
      </section>

      <section className="card rise" style={{ animationDelay: "160ms", overflow: "hidden" }}>
        <ul>
          {MENU.map((m) => (
            <li key={m.label}>
              <Link href={m.href} className="menu__item">
                <div className="menu__body">
                  <div className="menu__label">{m.label}</div>
                  <div className="menu__sub">{m.sub}</div>
                </div>
                <ChevronIcon />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <button className="btn btn--ghost btn--block">Sign out</button>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="fact__value figure">{value}</div>
    </div>
  );
}

function Milestone({ title, sub }: { title: string; sub: string }) {
  return (
    <li className="milestone">
      <TrophyIcon />
      <div style={{ minWidth: 0 }}>
        <div className="menu__label">{title}</div>
        <div className="menu__sub">{sub}</div>
      </div>
    </li>
  );
}
