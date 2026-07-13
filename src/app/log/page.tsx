"use client";

import { useMemo, useState } from "react";
import { PLAYERS, DISCIPLINES, type Discipline, ME, fmtDelta } from "@/lib/dubr";
import { PlusIcon, ShuttleIcon } from "@/components/icons";

type Slot = string | null;

export default function LogMatch() {
  const [disc, setDisc] = useState<Discipline>("doubles");
  const [partner, setPartner] = useState<Slot>(null);
  const [opp1, setOpp1] = useState<Slot>(null);
  const [opp2, setOpp2] = useState<Slot>(null);
  const [games, setGames] = useState<[string, string][]>([
    ["", ""],
    ["", ""],
    ["", ""],
  ]);

  const isDoubles = disc !== "singles";

  const setGame = (i: number, side: 0 | 1, v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 2);
    setGames((g) => {
      const next = [...g] as [string, string][];
      next[i] = side === 0 ? [clean, next[i][1]] : [next[i][0], clean];
      return next;
    });
  };

  /** Games won by each side. Badminton: first to 21, win by 2, cap 30. */
  const tally = useMemo(() => {
    let us = 0;
    let them = 0;
    for (const [a, b] of games) {
      if (a === "" || b === "") continue;
      const x = Number(a);
      const y = Number(b);
      if (x === y) continue;
      if (x > y) us++;
      else them++;
    }
    return { us, them };
  }, [games]);

  const decided = tally.us >= 2 || tally.them >= 2;
  const won = tally.us > tally.them;

  /** Opponent strength drives the swing — that's the whole point of a rating
      system, so we show it live rather than making it a black box. */
  const oppRating = useMemo(() => {
    const rs = [opp1, opp2]
      .filter(Boolean)
      .map((id) => PLAYERS.find((p) => p.id === id))
      .map((p) => (p ? (p[disc] ?? p.singles ?? 5) : 5));
    if (rs.length === 0) return null;
    return rs.reduce((a, b) => a + b, 0) / rs.length;
  }, [opp1, opp2, disc]);

  const projected = useMemo(() => {
    if (!decided || oppRating === null) return null;
    const mine = ME[disc] ?? 5;
    // Beating someone above you is worth more; losing to someone below costs more.
    const gap = oppRating - mine;
    const base = 0.045;
    return won ? base + gap * 0.03 : -(base - gap * 0.03);
  }, [decided, oppRating, disc, won]);

  const opponents = PLAYERS.filter((p) => p.id !== "me");
  const complete = decided && opp1 !== null && (!isDoubles || (partner !== null && opp2 !== null));

  return (
    <div className="space-y-4 lg:space-y-6">
      <header className="rise">
        <h1 className="display canvas-fg text-[26px] lg:text-[32px]">Log a Match</h1>
        <p className="canvas-mute mt-1.5 text-[13px] lg:text-[14px]">
          Your opponent confirms it, then both ratings move.
        </p>
      </header>

      {/* Two columns on desktop: who played on the left, what happened on the
          right. On mobile it stacks into the same reading order. */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="space-y-4">
      {/* Discipline */}
      <section
        className="rise overflow-hidden rounded-[14px] border border-line bg-surface"
        style={{ animationDelay: "40ms" }}
      >
        <div className="flex divide-x divide-line">
          {DISCIPLINES.map((d) => {
            const active = d.id === disc;
            return (
              <button
                key={d.id}
                onClick={() => {
                  setDisc(d.id);
                  if (d.id === "singles") {
                    setPartner(null);
                    setOpp2(null);
                  }
                }}
                aria-pressed={active}
                className={`flex-1 py-3 text-[13px] transition-colors ${
                  active ? "bg-elevated text-bone" : "text-faint hover:text-mute"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Teams */}
      <section
        className="rise space-y-px overflow-hidden rounded-[14px] border border-line bg-surface"
        style={{ animationDelay: "80ms" }}
      >
        <div className="px-4 pt-3.5 pb-2">
          <div className="label">Your side</div>
        </div>
        <div className="flex items-center gap-3 px-4 pb-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-aqua/40 bg-aqua/10 text-[11px] font-semibold text-aqua-ink">
            {ME.initials}
          </div>
          <span className="flex-1 text-[13px] text-bone">{ME.name}</span>
          <span className="text-[12px] tabular-nums text-mute">
            {(ME[disc] ?? ME.singles)?.toFixed(3) ?? "NR"}
          </span>
        </div>

        {isDoubles && (
          <div className="border-t border-line px-4 py-3">
            <PlayerSelect
              value={partner}
              onChange={setPartner}
              options={opponents.filter((p) => p.id !== opp1 && p.id !== opp2)}
              placeholder="Add partner"
            />
          </div>
        )}

        <div className="border-t border-line px-4 pt-3.5 pb-2">
          <div className="label">Opponents</div>
        </div>
        <div className="space-y-2 px-4 pb-4">
          <PlayerSelect
            value={opp1}
            onChange={setOpp1}
            options={opponents.filter((p) => p.id !== partner && p.id !== opp2)}
            placeholder="Add opponent"
          />
          {isDoubles && (
            <PlayerSelect
              value={opp2}
              onChange={setOpp2}
              options={opponents.filter((p) => p.id !== partner && p.id !== opp1)}
              placeholder="Add opponent"
            />
          )}
        </div>
      </section>
        </div>

        <div className="space-y-4">
      {/* Score — badminton is best-of-three to 21, so the grid is three games,
          not the five-game pickleball grid DUPR uses. */}
      <section
        className="rise overflow-hidden rounded-[14px] border border-line bg-surface"
        style={{ animationDelay: "120ms" }}
      >
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="label">Score</div>
          <div className="text-[11px] text-faint">Best of 3 · to 21</div>
        </div>

        <div className="grid grid-cols-3 gap-px border-t border-line bg-line">
          {games.map((g, i) => {
            const settled = g[0] !== "" && g[1] !== "" && Number(g[0]) !== Number(g[1]);
            const winner = settled && Number(g[0]) > Number(g[1]);
            return (
              <div key={i} className="bg-surface px-3 py-3.5">
                <div className="label mb-2.5 text-center">Game {i + 1}</div>
                <div className="space-y-1.5">
                  <ScoreInput
                    value={g[0]}
                    onChange={(v) => setGame(i, 0, v)}
                    highlight={settled && winner}
                    aria-label={`Game ${i + 1}, your score`}
                  />
                  <ScoreInput
                    value={g[1]}
                    onChange={(v) => setGame(i, 1, v)}
                    highlight={settled && !winner}
                    aria-label={`Game ${i + 1}, opponent score`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Third game is only played if the match is split — say so rather than
            leaving an input that looks required. */}
        {tally.us + tally.them < 2 && (
          <p className="border-t border-line px-4 py-2.5 text-[11px] text-faint">
            Leave game 3 empty if the match ended in two.
          </p>
        )}
      </section>

      {/* ── Live rating impact. The single best reason to open this screen: you
             can see what the match is worth before you commit it. ───────────── */}
      <section
        className={`rise overflow-hidden rounded-[14px] border transition-colors ${
          projected !== null
            ? "border-cobalt-hi/40 bg-gradient-to-b from-cobalt to-cobalt-lo"
            : "border-line bg-surface"
        }`}
        style={{ animationDelay: "160ms" }}
      >
        {projected !== null ? (
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <div className="label !text-white/55">Projected DUBR</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="figure text-[30px] text-white">
                  {((ME[disc] ?? 5) + projected).toFixed(3)}
                </span>
                <span
                  className={`text-[13px] font-semibold tabular-nums ${
                    projected >= 0 ? "text-aqua-ink" : "text-loss"
                  }`}
                >
                  {fmtDelta(projected)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="label !text-white/55">Result</div>
              <div className="display mt-2 text-[17px] text-white">
                {won ? "Win" : "Loss"} {tally.us}–{tally.them}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-4">
            <ShuttleIcon className="h-5 w-5 shrink-0 text-faint" />
            <p className="text-[12px] leading-relaxed text-faint">
              Add your opponents and a score, and DUBR will show you exactly what this match
              moves before you submit it.
            </p>
          </div>
        )}
      </section>

      <button
        disabled={!complete}
        className="rise w-full rounded-[8px] bg-aqua py-3.5 text-[14px] font-semibold text-on-aqua transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-elevated disabled:text-faint"
        style={{ animationDelay: "200ms" }}
      >
        {complete ? "Submit for confirmation" : "Add players and a score"}
      </button>
        </div>
      </div>
    </div>
  );
}

function ScoreInput({
  value,
  onChange,
  highlight,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  highlight: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode="numeric"
      placeholder="–"
      className={`figure w-full rounded-[8px] border py-2.5 text-center text-[20px] outline-none transition-colors focus:border-aqua ${
        highlight
          ? "border-aqua/40 bg-aqua/10 text-aqua-ink"
          : "border-line bg-ink text-bone placeholder:text-faint"
      }`}
    />
  );
}

function PlayerSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: typeof PLAYERS;
  placeholder: string;
}) {
  const selected = PLAYERS.find((p) => p.id === value);

  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-line bg-ink px-3 py-2">
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[11px] font-semibold ${
          selected
            ? "border-line bg-elevated text-mute"
            : "border-dashed border-line text-faint"
        }`}
      >
        {selected ? selected.initials : <PlusIcon className="h-4 w-4" />}
      </div>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label={placeholder}
        className="flex-1 cursor-pointer appearance-none bg-transparent py-1 text-[13px] text-bone outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {selected && (
        <span className="shrink-0 text-[12px] tabular-nums text-mute">
          {selected.singles?.toFixed(3) ?? "NR"}
        </span>
      )}
    </div>
  );
}
