"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trend } from "@/components/trend-chart";
import { MatchCard } from "@/components/match-card";
import { Avatar } from "@/components/shell";
import { ArrowUpIcon, ArrowDownIcon, ChevronIcon, PinIcon, PlusIcon } from "@/components/icons";
import {
  ME,
  MATCHES,
  TREND,
  DISCIPLINES,
  RANGES,
  axisTicks,
  historyFor,
  type Discipline,
  type Range,
  fmt,
  fmtDelta,
  levelFor,
  nextLevel,
  RELIABILITY_THRESHOLD,
} from "@/lib/dubr";

export default function Home() {
  const [disc, setDisc] = useState<Discipline>("singles");
  const [range, setRange] = useState<Range>("year");

  /* Memoized, and not as a micro-optimization: react-chartjs-2 keys its update
     effect on the IDENTITY of the arrays it is handed, so a fresh slice on every
     render would call chart.update() and restart the draw animation mid-flight —
     switching discipline would jolt the line. */
  const span = useMemo(() => historyFor(range), [range]);
  const series = useMemo(() => span.map((p) => p.rating), [span]);
  const ticks = useMemo(() => axisTicks(span, range), [span, range]);

  const rating = ME[disc];
  const rated = rating !== null;
  const level = rated ? levelFor(rating) : null;
  const next = rated ? nextLevel(rating) : null;
  const delta = TREND[TREND.length - 1] - TREND[TREND.length - 2];

  return (
    <div className="stack">
      {/* ── PROFILE ─────────────────────────────────────────────────────── */}
      <header className="card profile rise">
        <div className="profile__id">
          <Avatar className="avatar avatar--lg" />

          <div style={{ minWidth: 0 }}>
            <h1 className="profile__name display">{ME.name}</h1>
            <div className="profile__meta">
              <PinIcon />
              <span>{ME.location}</span>
              <span className="text-faint">·</span>
              <span>ID X22V02</span>
            </div>
          </div>
        </div>

        <div className="profile__social">
          <Social value="25" label="Following" />
          <Social value="6" label="Followers" />
        </div>
      </header>

      {/* ── RATING + STATISTICS ─────────────────────────────────────────── */}
      <div className="split">
        <section className="card rating-card rise" style={{ animationDelay: "60ms" }}>
          {/* Badminton has three disciplines and a player's rating in each is
              genuinely different — so this is a first-class control. */}
          <div className="disciplines">
            {DISCIPLINES.map((d) => {
              const active = d.id === disc;
              return (
                <button
                  key={d.id}
                  onClick={() => setDisc(d.id)}
                  aria-pressed={active}
                  className={`discipline ${active ? "is-active" : ""}`}
                >
                  <div className="label">{d.label}</div>
                  <div className="discipline__value">{fmt(ME[d.id])}</div>
                </button>
              );
            })}
          </div>

          <div className="rating">
            <div className="label">Rating</div>

            <div className="rating__row">
              <div className="rating__figure figure">{fmt(rating)}</div>

              {rated && (
                <span className={`delta ${delta >= 0 ? "is-up" : "is-down"}`}>
                  {delta >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  {fmtDelta(delta)}
                </span>
              )}
            </div>

            {rated ? (
              <>
                <div className="rating__level">
                  <strong>{level!.name}</strong>
                  {next && ` · ${(next.floor - rating).toFixed(3)} to ${next.name}`}
                </div>

                {/* The trajectory fills the remaining height, so this card and
                    the statistics card beside it end on the same line. The chart
                    draws its own month strip along the bottom; the range control
                    sits directly under it, because the two are one instrument —
                    the pill says what span the months are counting. */}
                <div className="chart">
                  <div className="label">Rating Trajectory</div>
                  <Trend
                    points={series}
                    ticks={ticks}
                    interactive
                    delay={260}
                    className="chart__canvas"
                  />
                  <div className="chart__foot">
                    <span className="chart__span">
                      {series.length} {series.length === 1 ? "match" : "matches"}
                    </span>
                    <div className="range" role="group" aria-label="Chart range">
                      {RANGES.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setRange(r.id)}
                          aria-pressed={range === r.id}
                          aria-label={r.name}
                          className={`range__btn ${range === r.id ? "is-active" : ""}`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Honest empty state. No fabricated 5.500 / "Advanced" badge. */
              <div className="rating__empty">
                You have no {DISCIPLINES.find((d) => d.id === disc)!.label.toLowerCase()} rating
                yet. Log {RELIABILITY_THRESHOLD} matches and DUBR can place you on the scale.
                <Link href="/log" className="btn btn--primary">
                  <PlusIcon />
                  Log a match
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="card card--pad rise" style={{ animationDelay: "100ms" }}>
          <h2 className="display" style={{ fontSize: 24 }}>
            Statistics
          </h2>

          <div className="stat-grid" style={{ marginTop: 24 }}>
            <Stat label="Matches This Week" value="3" />
            <Stat label="Matches This Month" value="2" />
            <Stat label="Wins" value={String(ME.wins)} />
            <Stat label="Losses" value={String(ME.matches - ME.wins)} />
            <Stat label="Avg Opponent" value="5.61" />
            <Stat label="Best Win" value="5.932" />
          </div>

          <div className="stat-grid stat-grid--divided">
            <Stat label="Global Rank" value="31" sub="of 612 players" />
            <Stat
              label="Record"
              value={`${ME.wins}–${ME.matches - ME.wins}`}
              sub={`${Math.round((ME.wins / ME.matches) * 100)}% win rate`}
            />
          </div>
        </section>
      </div>

      {/* ── RECENT MATCHES ──────────────────────────────────────────────── */}
      <section className="rise" style={{ animationDelay: "140ms" }}>
        <div className="row row--between" style={{ marginBottom: 12, padding: "0 4px" }}>
          <h2 className="card__title display">Recent Matches</h2>
          <Link href="/log" className="card__link">
            All matches
            <ChevronIcon />
          </Link>
        </div>

        <div className="grid-cards">
          {MATCHES.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Social({ value, label }: { value: string; label: string }) {
  return (
    <div className="social">
      <span className="social__value figure">{value}</span>
      <span className="label">{label}</span>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="stat__value figure">{value}</div>
      {sub && <div className="stat__sub">{sub}</div>}
    </div>
  );
}
