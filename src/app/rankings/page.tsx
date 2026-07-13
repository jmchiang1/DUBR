"use client";

import { useState } from "react";
import { DISCIPLINES, type Discipline, leaderboard, provisional, fmt } from "@/lib/dubr";

export default function Rankings() {
  const [disc, setDisc] = useState<Discipline>("singles");

  const rated = leaderboard(disc);
  const unrated = provisional(disc);

  const top = rated[0][disc] as number;
  const avg = rated.reduce((s, p) => s + (p[disc] as number), 0) / rated.length;
  const totalMatches = [...rated, ...unrated].reduce((s, p) => s + p.matches, 0);

  return (
    <div className="space-y-3">
      <header className="rise">
        <h1 className="display text-[26px]">Rankings</h1>
        <p className="mt-1.5 text-[13px] text-mute">
          Every rated player, ordered by DUBR. Updated after each confirmed match.
        </p>
      </header>

      {/* Discipline selector — a segmented rule, not a pill row. */}
      <div
        className="rise flex gap-6 border-b border-line/60"
        style={{ animationDelay: "40ms" }}
      >
        {DISCIPLINES.map((d) => {
          const active = d.id === disc;
          return (
            <button
              key={d.id}
              onClick={() => setDisc(d.id)}
              aria-pressed={active}
              className={`relative -mb-px pb-2.5 text-[13px] transition-colors ${
                active ? "text-bone" : "text-faint hover:text-mute"
              }`}
            >
              {d.label}
              <span
                className={`absolute inset-x-0 bottom-0 h-[2px] transition-opacity ${
                  active ? "bg-aqua opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Summary — the three facts that frame the board. */}
      <section
        className="rise grid grid-cols-3 divide-x divide-line/60 rounded-[14px] border border-line/60 bg-surface"
        style={{ animationDelay: "80ms" }}
      >
        <Stat label="Top DUBR" value={top.toFixed(3)} />
        <Stat label="Average" value={avg.toFixed(3)} />
        <Stat label="Matches" value={String(totalMatches)} />
      </section>

      {/* ── The board. Rank is set in the display face at a fixed width so the
             column stays true; no medal emoji, no per-row card. Rows are rows. */}
      <section
        className="rise overflow-hidden rounded-[14px] border border-line/60 bg-surface"
        style={{ animationDelay: "120ms" }}
      >
        <div className="flex items-center gap-2.5 border-b border-line/50 px-3 py-2.5">
          <div className="label w-5">#</div>
          <div className="label flex-1 pl-[42px]">Player</div>
          <div className="label w-9 text-right">Rel.</div>
          <div className="label w-[52px] text-right">DUBR</div>
        </div>

        <ul className="divide-y divide-line/40">
          {rated.map((p, i) => {
            const me = p.id === "me";
            return (
              <li
                key={p.id}
                className={`flex items-center gap-2.5 px-3 py-3 transition-colors ${
                  me ? "bg-cobalt/25" : "hover:bg-elevated/40"
                }`}
              >
                <div
                  className={`figure w-5 shrink-0 text-[15px] ${
                    i < 3 ? "text-bone" : "text-faint"
                  }`}
                >
                  {i + 1}
                </div>

                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-elevated text-[11px] font-semibold text-mute">
                  {p.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[13px] text-bone">{p.name}</span>
                    {me && (
                      <span className="label shrink-0 rounded-[4px] bg-aqua px-1 py-0.5 !text-[8px] !text-on-aqua">
                        You
                      </span>
                    )}
                  </div>
                  {/* Club is deliberately NOT here — on a 390px row it pushed the
                      name and the record into ellipses, and neither the name nor
                      the record can afford to be unreadable on a ranking board. */}
                  <div className="mt-0.5 truncate text-[11px] text-faint">
                    {p.matches} matches · {Math.round((p.wins / p.matches) * 100)}% W
                  </div>
                </div>

                {/* Reliability as a 4-segment gauge — reads at a glance, and
                    makes a thinly-tested rating visibly thinner. */}
                <div className="flex w-9 shrink-0 justify-end gap-[2px]">
                  {[0, 1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`h-3 w-[3px] rounded-full ${
                        p.reliability > s * 0.25 ? "bg-aqua" : "bg-line"
                      }`}
                    />
                  ))}
                </div>

                <div className="figure w-[52px] shrink-0 text-right text-[16px] text-bone">
                  {fmt(p[disc])}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── PROVISIONAL. Separated out, below the fold, honestly labelled.
             The old board padded itself out by listing these players at a
             default 5.500 with an "Advanced" badge and 0% reliability, which
             made every real rating above them look invented too. */}
      {unrated.length > 0 && (
        <section
          className="rise overflow-hidden rounded-[14px] border border-line/60 bg-surface"
          style={{ animationDelay: "160ms" }}
        >
          <div className="border-b border-line/50 px-4 py-3">
            <h2 className="display text-[12px] text-mute">Provisional</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-faint">
              Not enough matches to place on the scale. These players are unrated — they are not
              ranked, and they are not assigned a default.
            </p>
          </div>

          <ul className="divide-y divide-line/40">
            {unrated.map((p) => (
              <li key={p.id} className="flex items-center gap-2.5 px-3 py-3">
                <div className="w-5 shrink-0" />
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dashed border-line bg-ink text-[11px] font-semibold text-faint">
                  {p.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-mute">{p.name}</div>
                  <div className="mt-0.5 text-[11px] text-faint">
                    {p.matches} of 5 matches logged
                  </div>
                </div>
                <div className="figure w-[52px] shrink-0 text-right text-[15px] text-faint">NR</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3.5">
      <div className="label">{label}</div>
      <div className="figure mt-2 text-[20px] text-bone">{value}</div>
    </div>
  );
}
