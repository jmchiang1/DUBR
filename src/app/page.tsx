"use client";

import { useState } from "react";
import Link from "next/link";
import { Trend } from "@/components/trend-chart";
import { ArrowUpIcon, ArrowDownIcon, ChevronIcon, PinIcon, PlusIcon } from "@/components/icons";
import {
  ME,
  MATCHES,
  TREND,
  DISCIPLINES,
  type Discipline,
  fmt,
  fmtDelta,
  levelFor,
  nextLevel,
  RELIABILITY_THRESHOLD,
} from "@/lib/dubr";

export default function Home() {
  const [disc, setDisc] = useState<Discipline>("singles");

  const rating = ME[disc];
  const rated = rating !== null;
  const level = rated ? levelFor(rating) : null;
  const next = rated ? nextLevel(rating) : null;
  const delta = TREND[TREND.length - 1] - TREND[TREND.length - 2];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ── PROFILE ───────────────────────────────────────────────────────
          Stacks on mobile; a grid item's default min-width:auto would otherwise
          let the stat block push the page wider than the viewport. */}
      <header className="rise flex flex-col gap-4 rounded-[14px] bg-surface px-4 py-4 sm:flex-row sm:items-center sm:gap-6 lg:px-6 lg:py-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatar.jpg"
            alt=""
            className="h-14 w-14 shrink-0 rounded-full object-cover object-[50%_22%] ring-2 ring-aqua lg:h-16 lg:w-16"
          />

          <div className="min-w-0">
            <h1 className="display truncate text-[20px] lg:text-[26px]">{ME.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-mute lg:text-[13px]">
              <span className="flex items-center gap-1">
                <PinIcon className="h-3.5 w-3.5 shrink-0" />
                {ME.location}
              </span>
              <span className="text-faint">·</span>
              <span className="tabular-nums">ID X22V02</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-6 border-t border-line pt-4 sm:border-0 sm:pt-0">
          <Social value="25" label="Following" />
          <Social value="6" label="Followers" />
        </div>
      </header>

      {/* ── RATING + STATISTICS ───────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* ── RATING ─────────────────────────────────────────────────────── */}
        <section
          className="rise flex min-w-0 flex-col overflow-hidden rounded-[14px] bg-surface"
          style={{ animationDelay: "60ms" }}
        >
          {/* Badminton has three disciplines and a player's rating in each is
              genuinely different — so this is a first-class control. */}
          <div className="flex divide-x divide-line border-b border-line">
            {DISCIPLINES.map((d) => {
              const active = d.id === disc;
              const val = ME[d.id];
              return (
                <button
                  key={d.id}
                  onClick={() => setDisc(d.id)}
                  aria-pressed={active}
                  className={`flex-1 px-4 py-3 text-left transition-colors ${
                    active ? "bg-elevated" : "hover:bg-elevated/50"
                  }`}
                >
                  <div className={`label ${active ? "!text-bone" : ""}`}>{d.label}</div>
                  <div
                    className={`mt-1.5 text-[14px] tabular-nums ${
                      active ? "text-bone" : "text-faint"
                    }`}
                  >
                    {fmt(val)}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-1 flex-col px-5 pt-5 pb-5 lg:px-6 lg:pt-6">
            <div className="label">Rating</div>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              {/* Aqua, and enormous. On this canvas the accent is legible, so
                  the one number that IS the product gets it. */}
              <div className="figure text-[64px] text-aqua lg:text-[96px]">{fmt(rating)}</div>

              {rated && (
                <span
                  className={`inline-flex items-center gap-1 rounded-[8px] px-2 py-1.5 text-[12px] font-semibold tabular-nums ${
                    delta >= 0 ? "bg-aqua text-on-aqua" : "bg-loss text-white"
                  }`}
                >
                  {delta >= 0 ? (
                    <ArrowUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3" />
                  )}
                  {fmtDelta(delta)}
                </span>
              )}
            </div>

            {rated ? (
              <>
                <div className="mt-2 text-[13px] text-mute">
                  <span className="font-semibold text-bone">{level!.name}</span>
                  {next && (
                    <>
                      {" · "}
                      <span className="tabular-nums">{(next.floor - rating).toFixed(3)}</span> to{" "}
                      {next.name}
                    </>
                  )}
                </div>

                {/* The trajectory fills whatever height is left, so this card and
                    the statistics card beside it end on the same line. */}
                <div className="mt-5 flex min-h-0 flex-1 flex-col">
                  <div className="label">Last {TREND.length} Matches</div>
                  <Trend
                    points={TREND}
                    interactive
                    delay={260}
                    className="mt-3 h-32 w-full flex-1 lg:min-h-[150px]"
                  />
                </div>
              </>
            ) : (
              /* Honest empty state. No fabricated 5.500 / "Advanced" badge. */
              <div className="mt-3 flex-1">
                <p className="max-w-sm text-[13px] leading-relaxed text-mute">
                  You have no {DISCIPLINES.find((d) => d.id === disc)!.label.toLowerCase()} rating
                  yet. Log {RELIABILITY_THRESHOLD} matches and DUBR can place you on the scale.
                </p>
                <Link
                  href="/log"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-aqua px-3.5 py-2 text-[13px] font-semibold text-on-aqua transition-opacity hover:opacity-90"
                >
                  <PlusIcon className="h-4 w-4" />
                  Log a match
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── STATISTICS ─────────────────────────────────────────────────── */}
        <section
          className="rise min-w-0 rounded-[14px] bg-surface px-5 py-5 lg:px-6 lg:py-6"
          style={{ animationDelay: "100ms" }}
        >
          <h2 className="display text-[20px] lg:text-[24px]">Statistics</h2>

          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6">
            <Stat label="Matches This Week" value="3" />
            <Stat label="Matches This Month" value="2" />
            {/* The Figma prints "5.932" for both Wins and Losses, and repeats
                Avg Opponent twice — placeholder text left in the mock. Wins and
                losses are counts, so they are counts here. */}
            <Stat label="Wins" value={String(ME.wins)} />
            <Stat label="Losses" value={String(ME.matches - ME.wins)} />
            <Stat label="Avg Opponent" value="5.61" />
            <Stat label="Best Win" value="5.932" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-6">
            <Stat label="Global Rank" value="31" sub="of 612 players" />
            <Stat
              label="Record"
              value={`${ME.wins}–${ME.matches - ME.wins}`}
              sub={`${Math.round((ME.wins / ME.matches) * 100)}% win rate`}
            />
          </div>
        </section>
      </div>

      {/* ── RECENT MATCHES ────────────────────────────────────────────────── */}
      <section
        className="rise overflow-hidden rounded-[14px] bg-surface"
        style={{ animationDelay: "140ms" }}
      >
        <div className="flex items-center justify-between px-5 py-4 lg:px-6 lg:py-5">
          <h2 className="display text-[15px] lg:text-[17px]">Recent Matches</h2>
          <Link
            href="/log"
            className="flex items-center gap-0.5 text-[12px] text-mute transition-colors hover:text-bone"
          >
            All matches
            <ChevronIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ul className="divide-y divide-line border-t border-line">
          {MATCHES.map((m) => (
            <li key={m.id}>
              <div className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-elevated/40 lg:px-6">
                <span
                  className={`display grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] ${
                    m.won ? "bg-aqua text-on-aqua" : "bg-elevated text-mute"
                  }`}
                >
                  {m.won ? "W" : "L"}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-bone">
                    {m.partner && <span className="text-mute">with {m.partner} · </span>}
                    vs {m.opponents.join(" / ")}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-faint">
                    <span className="tabular-nums">
                      {m.games.map((g) => `${g[0]}–${g[1]}`).join("  ")}
                    </span>
                    <span>·</span>
                    <span>{m.date}</span>
                  </div>
                </div>

                <span
                  className={`shrink-0 text-[12px] font-semibold tabular-nums ${
                    m.delta >= 0 ? "text-aqua" : "text-loss"
                  }`}
                >
                  {fmtDelta(m.delta)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Social({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="figure text-[22px] text-bone lg:text-[26px]">{value}</span>
      <span className="label">{label}</span>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <div className="label">{label}</div>
      <div className="figure mt-2 truncate text-[24px] text-bone">{value}</div>
      {sub && <div className="mt-1.5 text-[11px] text-faint">{sub}</div>}
    </div>
  );
}
