"use client";

import { useState } from "react";
import Link from "next/link";
import { Trend } from "@/components/trend-chart";
import { ArrowUpIcon, ArrowDownIcon, ChevronIcon, PlusIcon, PinIcon } from "@/components/icons";
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
      {/* ── IDENTITY ──────────────────────────────────────────────────────
          DUPR leads its desktop home with who you are, then splits into
          Performance / Matches. Same spine here. */}
      {/* Stacks on mobile, single row on desktop. It must NOT flex-wrap: the
          stat blocks don't shrink, so wrapping pushed the whole page wider than
          the viewport and crushed the name to "JO…". */}
      <header className="rise flex flex-col gap-4 rounded-[14px] border border-line bg-surface px-4 py-4 lg:flex-row lg:items-center lg:gap-6 lg:px-6 lg:py-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-cobalt lg:h-16 lg:w-16">
            <span className="display text-[18px] text-white lg:text-[20px]">{ME.initials}</span>
          </div>

          <div className="min-w-0">
            <h1 className="display truncate text-[20px] lg:text-[26px]">{ME.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-mute lg:text-[13px]">
              <span className="flex items-center gap-1">
                <PinIcon className="h-3.5 w-3.5 shrink-0" />
                {ME.location}
              </span>
              <span className="text-faint">·</span>
              <span>{ME.club}</span>
              <span className="hidden text-faint sm:inline">·</span>
              <span className="hidden tabular-nums sm:inline">ID X22V02</span>
            </div>
          </div>
        </div>

        {/* Rank and record are facts about the player, so they belong to the
            identity header — not four floating tiles competing with the rating. */}
        <div className="flex shrink-0 items-center gap-8 border-t border-line pt-4 lg:border-0 lg:pt-0">
          <HeaderStat label="Global Rank" value="31" sub="of 612" />
          <HeaderStat
            label="Record"
            value={`${ME.wins}–${ME.matches - ME.wins}`}
            sub={`${Math.round((ME.wins / ME.matches) * 100)}% win rate`}
          />
        </div>
      </header>

      {/* ── THE SPLIT. Rating left, matches right — the two things the app is
             for, side by side on desktop, stacked on mobile. ─────────────── */}
      {/* min-w-0 on both columns is load-bearing: a grid item defaults to
          min-width:auto, so it refuses to shrink below its content's min-content
          width. Without it the big rating figure blows the column out to 505px
          inside a 350px viewport and the whole page scrolls sideways. */}
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        {/* ── RATING ─────────────────────────────────────────────────────── */}
        <section className="min-w-0 space-y-4 lg:col-span-7">
          <div
            className="rise overflow-hidden rounded-[14px] border border-line bg-surface"
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
                    className={`relative flex-1 px-3 py-2.5 text-left transition-colors lg:px-5 lg:py-3 ${
                      active ? "bg-elevated" : "hover:bg-elevated/60"
                    }`}
                  >
                    {/* Active discipline is marked with a tick, the same language
                        as the rail below it. */}
                    <span
                      className={`absolute inset-x-0 top-0 h-[2px] bg-cobalt transition-opacity ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className={`label ${active ? "!text-bone" : ""}`}>{d.label}</div>
                    <div
                      className={`mt-1.5 text-[13px] tabular-nums lg:text-[14px] ${
                        active ? "text-bone" : "text-faint"
                      }`}
                    >
                      {fmt(val)}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-5 pt-6 pb-5 lg:px-7 lg:pt-8 lg:pb-7">
              <div className="label">Current DUBR</div>

              <div className="mt-3 flex items-end gap-5">
                {/* The rating is set in cobalt — the only figure in the app that
                    gets the brand colour, because it is the one number that is
                    the product. */}
                <div className="figure text-[76px] text-cobalt lg:text-[96px]">{fmt(rating)}</div>

                {rated && (
                  <span
                    className={`mb-3 inline-flex items-center gap-1 rounded-[8px] px-1.5 py-1 text-[11px] font-semibold tabular-nums lg:mb-4 lg:text-[12px] ${
                      delta >= 0 ? "bg-aqua/25 text-aqua-ink" : "bg-loss/10 text-loss"
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
                  <div className="mt-3 text-[13px] text-mute lg:text-[14px]">
                    <span className="font-semibold text-bone">{level!.name}</span>
                    {next && (
                      <>
                        {" · "}
                        <span className="tabular-nums">{(next.floor - rating).toFixed(3)}</span> to{" "}
                        {next.name}
                      </>
                    )}
                  </div>

                  {/* The trajectory, hoverable: each point reports the rating and
                      what that match moved it by. The old sparkline beside the
                      figure is gone — it plotted this same series, unreadably. */}
                  <div className="mt-6 lg:mt-7">
                    <div className="flex items-center justify-between">
                      <div className="label">Last {TREND.length} Matches</div>
                      <div className="text-[11px] text-faint">Hover a point for the change</div>
                    </div>
                    <Trend points={TREND} interactive className="mt-3 h-32 w-full lg:h-40" />
                  </div>

                  {/* Reliability, stated plainly. The old app buried this, but it
                      is the difference between a rating you can enter a
                      tournament with and a guess. */}
                  <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                    <div className="label">Reliability</div>
                    <div className="flex items-center gap-2.5">
                      <div className="h-[5px] w-24 overflow-hidden rounded-full bg-elevated lg:w-40">
                        <div
                          className="h-full rounded-full bg-aqua"
                          style={{ width: `${ME.reliability * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[12px] font-semibold tabular-nums text-bone">
                        {Math.round(ME.reliability * 100)}%
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* Honest empty state. No fabricated 5.500 / "Advanced" badge. */
                <div className="mt-4">
                  <p className="max-w-sm text-[13px] leading-relaxed text-mute lg:text-[14px]">
                    You have no {DISCIPLINES.find((d) => d.id === disc)!.label.toLowerCase()} rating
                    yet. Log {RELIABILITY_THRESHOLD} matches and DUBR can place you on the scale.
                  </p>
                  <Link
                    href="/log"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-[8px] bg-aqua px-3.5 py-2 text-[13px] font-semibold text-on-aqua transition-opacity hover:opacity-90"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Log a match
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div
            className="rise grid grid-cols-3 divide-x divide-line rounded-[14px] border border-line bg-surface"
            style={{ animationDelay: "100ms" }}
          >
            <Stat label="This Month" value="2" sub="matches" />
            <Stat label="Avg Opponent" value="5.61" sub="last 5 matches" />
            <Stat label="Best Win" value="5.932" sub="Kevin Cheng" />
          </div>
        </section>

        {/* ── MATCHES ────────────────────────────────────────────────────── */}
        <section className="min-w-0 space-y-4 lg:col-span-5">
          <div
            className="rise overflow-hidden rounded-[14px] border border-line bg-surface"
            style={{ animationDelay: "140ms" }}
          >
            <div className="flex items-center justify-between px-4 py-3.5 lg:px-5">
              <h2 className="display text-[13px] lg:text-[15px]">Recent Form</h2>
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
                  <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated/60 lg:px-5 lg:py-3.5">
                    {/* W/L as a typographic mark, not a colored pill. */}
                    <span
                      className={`display grid h-7 w-7 shrink-0 place-items-center rounded-[8px] border text-[11px] ${
                        m.won
                          ? "border-aqua bg-aqua/25 text-aqua-ink"
                          : "border-line bg-elevated text-mute"
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
                        m.delta >= 0 ? "text-aqua-ink" : "text-loss"
                      }`}
                    >
                      {fmtDelta(m.delta)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ONE next action. Not a checklist of five. */}
          <Link
            href="/log"
            className="rise flex items-center justify-between rounded-[14px] border border-line bg-surface px-4 py-4 transition-colors hover:bg-elevated/60 lg:px-5"
            style={{ animationDelay: "180ms" }}
          >
            <div>
              <div className="text-[14px] font-semibold text-bone">Log a match</div>
              <div className="mt-0.5 text-[12px] text-mute">
                Both players&apos; ratings update the moment it&apos;s confirmed.
              </div>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-aqua text-on-aqua">
              <PlusIcon className="h-[18px] w-[18px]" />
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}

function HeaderStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="figure mt-1.5 text-[22px] text-bone lg:text-[26px]">{value}</div>
      <div className="mt-1 text-[11px] text-faint">{sub}</div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="px-4 py-3.5 lg:px-5">
      <div className="label">{label}</div>
      <div className="figure mt-2 text-[24px] text-bone">{value}</div>
      <div className="mt-1.5 text-[11px] text-faint">{sub}</div>
    </div>
  );
}
