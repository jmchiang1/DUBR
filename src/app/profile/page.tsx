import Link from "next/link";
import { Trend } from "@/components/rating-rail";
import { ChevronIcon, PinIcon, TrophyIcon } from "@/components/icons";
import { ME, TREND, DISCIPLINES, MATCHES, fmt, levelFor, fmtDelta } from "@/lib/dubr";

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
    <div className="space-y-3">
      {/* Identity. One card, and the rating card is NOT this card — the old
          design fused them, which made the profile shout as loudly as home. */}
      <section className="rise flex items-center gap-4 rounded-[14px] border border-line/60 bg-surface px-4 py-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line bg-elevated">
          <span className="display text-[17px] text-bone">{ME.initials}</span>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-semibold text-bone">{ME.name}</h1>
          <div className="mt-1 flex items-center gap-1 text-[12px] text-faint">
            <PinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {ME.location} · {ME.club}
            </span>
          </div>
        </div>

        <span className="label shrink-0 rounded-[8px] border border-line bg-elevated px-2 py-1.5 !text-mute">
          {level.name}
        </span>
      </section>

      {/* All three ratings at once. A badminton player is three numbers, not
          one — mixed being NR is information, not a gap to paper over. */}
      <section
        className="rise grid grid-cols-3 divide-x divide-line/60 rounded-[14px] border border-line/60 bg-surface"
        style={{ animationDelay: "40ms" }}
      >
        {DISCIPLINES.map((d) => {
          const v = ME[d.id];
          return (
            <div key={d.id} className="px-4 py-4">
              <div className="label">{d.label}</div>
              <div
                className={`figure mt-2.5 text-[24px] ${v === null ? "text-faint" : "text-bone"}`}
              >
                {fmt(v)}
              </div>
              <div className="mt-2 text-[10px] text-faint">
                {v === null ? "5 matches needed" : `${Math.round(ME.reliability * 100)}% reliable`}
              </div>
            </div>
          );
        })}
      </section>

      {/* 90-day trajectory. A real chart of a real number, not four invented
          "skill dimension" bars derived from nothing. */}
      <section
        className="rise rounded-[14px] border border-line/60 bg-surface px-4 py-4"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label">Last 90 Days</div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="figure text-[24px] text-bone">{fmt(ME.singles)}</span>
              <span
                className={`text-[13px] font-semibold tabular-nums ${
                  change >= 0 ? "text-aqua-ink" : "text-loss"
                }`}
              >
                {fmtDelta(change)}
              </span>
            </div>
          </div>
          <Trend points={TREND} className="h-12 w-36" />
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-line/50 border-t border-line/40 pt-3.5">
          <Mini label="Matches" value={String(ME.matches)} />
          <Mini label="Wins" value={String(ME.wins)} />
          <Mini label="Best Win" value="5.932" />
        </div>
      </section>

      {/* Achievements: earned only. The old design showed 8 locked hexagons and
          one earned, which is mostly a display of what you have not done. */}
      <section
        className="rise rounded-[14px] border border-line/60 bg-surface px-4 py-4"
        style={{ animationDelay: "120ms" }}
      >
        <div className="flex items-center justify-between">
          <div className="label">Milestones</div>
          <span className="text-[11px] text-faint">
            {MATCHES.length} of {ME.matches} shown
          </span>
        </div>

        <ul className="mt-3.5 space-y-2.5">
          <Milestone title="Reached Advanced" sub="Crossed 5.000 on Jun 14" />
          <Milestone title="Beat a higher-rated player" sub="Kevin Cheng · 5.932" />
        </ul>
      </section>

      <section
        className="rise overflow-hidden rounded-[14px] border border-line/60 bg-surface"
        style={{ animationDelay: "160ms" }}
      >
        <ul className="divide-y divide-line/40">
          {MENU.map((m) => (
            <li key={m.label}>
              <Link
                href={m.href}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-elevated/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-bone">{m.label}</div>
                  <div className="mt-0.5 truncate text-[11px] text-faint">{m.sub}</div>
                </div>
                <ChevronIcon className="h-4 w-4 shrink-0 text-faint" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <button className="rise w-full rounded-[8px] border border-line/60 bg-surface py-3 text-[13px] text-mute transition-colors hover:border-loss/40 hover:text-loss">
        Sign out
      </button>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 first:pl-0">
      <div className="label">{label}</div>
      <div className="mt-1.5 text-[15px] tabular-nums text-bone">{value}</div>
    </div>
  );
}

function Milestone({ title, sub }: { title: string; sub: string }) {
  return (
    <li className="flex items-center gap-3 rounded-[8px] border border-line/50 bg-elevated/50 px-3 py-2.5">
      <TrophyIcon className="h-4 w-4 shrink-0 text-aqua-ink" />
      <div className="min-w-0">
        <div className="text-[12px] text-bone">{title}</div>
        <div className="mt-0.5 truncate text-[11px] text-faint">{sub}</div>
      </div>
    </li>
  );
}
