"use client";

import { useState } from "react";
import Link from "next/link";
import { RatingRail, Trend } from "@/components/rating-rail";
import { ArrowUpIcon, ArrowDownIcon, ChevronIcon, PlusIcon } from "@/components/icons";
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
    <div className="space-y-3">
      {/* ── HERO ───────────────────────────────────────────────────────────
          The single most important object in the app, and the only element on
          the screen that gets a cobalt fill. Everything else is a neutral
          surface, so this cannot be mistaken for "just another card". */}
      <section className="rise overflow-hidden rounded-[14px] border border-cobalt-hi/40 bg-gradient-to-b from-cobalt to-cobalt-lo">
        {/* Discipline switcher. Badminton has three disciplines and a player's
            rating in each is genuinely different — so this is a first-class
            control, not a tab buried on a profile page. */}
        <div className="flex border-b border-white/10">
          {DISCIPLINES.map((d) => {
            const active = d.id === disc;
            const val = ME[d.id];
            return (
              <button
                key={d.id}
                onClick={() => setDisc(d.id)}
                aria-pressed={active}
                className={`flex-1 border-r border-white/10 px-3 py-2.5 text-left transition-colors last:border-r-0 ${
                  active ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div className={`label !text-[9px] ${active ? "!text-white/80" : "!text-white/40"}`}>
                  {d.label}
                </div>
                <div
                  className={`mt-1.5 text-[13px] tabular-nums ${
                    active ? "text-white" : "text-white/45"
                  }`}
                >
                  {fmt(val)}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 pt-6 pb-5">
          <div className="label !text-white/55">Current DUBR</div>

          <div className="mt-3 flex items-end gap-4">
            <div className="figure text-[76px] text-white">{fmt(rating)}</div>

            {rated && (
              <div className="mb-2 flex flex-col gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 self-start rounded-[8px] px-1.5 py-1 text-[11px] font-semibold tabular-nums ${
                    delta >= 0 ? "bg-aqua/15 text-aqua-ink" : "bg-loss/15 text-loss"
                  }`}
                >
                  {delta >= 0 ? (
                    <ArrowUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3" />
                  )}
                  {fmtDelta(delta)}
                </span>
                <Trend points={TREND} className="h-6 w-20 opacity-90" />
              </div>
            )}
          </div>

          {rated ? (
            <>
              <div className="mt-2 text-[13px] text-white/70">
                <span className="text-white">{level!.name}</span>
                {next && (
                  <>
                    {" · "}
                    <span className="tabular-nums">{(next.floor - rating).toFixed(3)}</span> to{" "}
                    {next.name}
                  </>
                )}
              </div>

              <RatingRail rating={rating} reliability={ME.reliability} className="mt-6" />

              {/* Reliability, stated plainly. The old app buried this, but it is
                  the difference between a rating you can enter a tournament with
                  and a guess. */}
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5">
                <div className="label !text-white/50">Reliability</div>
                <div className="flex items-center gap-2.5">
                  <div className="h-[3px] w-24 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full bg-aqua" style={{ width: `${ME.reliability * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-[12px] tabular-nums text-white">
                    {Math.round(ME.reliability * 100)}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Honest empty state. No fabricated 5.500 / "Advanced" badge. */
            <div className="mt-4">
              <p className="max-w-sm text-[13px] leading-relaxed text-white/70">
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

      {/* ── STATS STRIP ───────────────────────────────────────────────────
          One divided row, not four floating cards. Same information, a fraction
          of the visual noise, and the numbers share a baseline. */}
      <section
        className="rise grid grid-cols-3 divide-x divide-line/60 rounded-[14px] border border-line/60 bg-surface"
        style={{ animationDelay: "60ms" }}
      >
        <Stat label="Global Rank" value="31" sub="of 612" />
        <Stat
          label="Record"
          value={`${ME.wins}–${ME.matches - ME.wins}`}
          sub={`${Math.round((ME.wins / ME.matches) * 100)}% win rate`}
        />
        <Stat label="This Month" value="2" sub="matches" />
      </section>

      {/* ── FORM ──────────────────────────────────────────────────────────
          The real feed. Every row answers "what did this do to my rating?" —
          the only question a rating app's home screen has to answer. */}
      <section
        className="rise overflow-hidden rounded-[14px] border border-line/60 bg-surface"
        style={{ animationDelay: "120ms" }}
      >
        <div className="flex items-center justify-between px-4 py-3.5">
          <h2 className="display text-[13px]">Recent Form</h2>
          <Link
            href="/log"
            className="flex items-center gap-0.5 text-[12px] text-mute transition-colors hover:text-bone"
          >
            All matches
            <ChevronIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ul className="divide-y divide-line/40 border-t border-line/40">
          {MATCHES.map((m) => (
            <li key={m.id}>
              <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated/40">
                {/* W/L as a typographic mark, not a colored pill. */}
                <span
                  className={`display grid h-7 w-7 shrink-0 place-items-center rounded-[8px] border text-[11px] ${
                    m.won
                      ? "border-aqua/30 bg-aqua/10 text-aqua-ink"
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
      </section>

      {/* ── ONE next action. Not a checklist of five. ────────────────────── */}
      <Link
        href="/log"
        className="rise flex items-center justify-between rounded-[14px] border border-line/60 bg-surface px-4 py-4 transition-colors hover:bg-elevated/50"
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
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="px-4 py-3.5">
      <div className="label">{label}</div>
      <div className="figure mt-2 text-[26px] text-bone">{value}</div>
      <div className="mt-1.5 text-[11px] text-faint">{sub}</div>
    </div>
  );
}
