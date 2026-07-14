"use client";

import { useMemo, useState } from "react";
import { ROSTER, DISCIPLINES, type Discipline, ME, fmtDelta } from "@/lib/dubr";
import { PlusIcon, ShuttleIcon } from "@/components/icons";
import { Avatar } from "@/components/shell";

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

  /** Opponent strength drives the swing — that is the whole point of a rating
      system, so it is shown live rather than hidden in a black box. */
  const oppRating = useMemo(() => {
    const rs = [opp1, opp2]
      .filter(Boolean)
      .map((id) => ROSTER.find((p) => p.id === id))
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

  const opponents = ROSTER.filter((p) => p.id !== "me");
  const complete = decided && opp1 !== null && (!isDoubles || (partner !== null && opp2 !== null));

  return (
    <div className="stack">
      <header className="page-head rise">
        <h1 className="page-title display">Log a Match</h1>
        <p className="page-sub">Your opponent confirms it, then both ratings move.</p>
      </header>

      {/* Who played on the left, what happened on the right. */}
      <div className="split">
        <div className="stack--tight stack">
          <section className="card rise" style={{ animationDelay: "40ms", overflow: "hidden" }}>
            <div className="disciplines">
              {DISCIPLINES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDisc(d.id);
                    if (d.id === "singles") {
                      setPartner(null);
                      setOpp2(null);
                    }
                  }}
                  aria-pressed={d.id === disc}
                  className={`discipline ${d.id === disc ? "is-active" : ""}`}
                  style={{ textAlign: "center", padding: 12 }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </section>

          <section className="card rise" style={{ animationDelay: "80ms" }}>
            <div className="form-section">
              <div className="label form-section__label">Your side</div>
              <div className="player" style={{ padding: "4px 0" }}>
                <Avatar className="avatar avatar--sm" />
                <span className="player__name is-me" style={{ flex: 1 }}>
                  {ME.name}
                </span>
                <span className="field__rating">
                  {(ME[disc] ?? ME.singles)?.toFixed(3) ?? "NR"}
                </span>
              </div>

              {isDoubles && (
                <div style={{ marginTop: 12 }}>
                  <PlayerSelect
                    value={partner}
                    onChange={setPartner}
                    options={opponents.filter((p) => p.id !== opp1 && p.id !== opp2)}
                    placeholder="Add partner"
                  />
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="label form-section__label">Opponents</div>
              <div className="stack--tight" style={{ display: "flex", flexDirection: "column" }}>
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
            </div>
          </section>
        </div>

        <div className="stack--tight stack">
          <section className="card rise" style={{ animationDelay: "120ms", overflow: "hidden" }}>
            <div className="card__head">
              <div className="label">Score</div>
              <div className="footnote">Best of 3 · to 21</div>
            </div>

            <div className="score-grid">
              {games.map((g, i) => {
                const settled = g[0] !== "" && g[1] !== "" && Number(g[0]) !== Number(g[1]);
                const winner = settled && Number(g[0]) > Number(g[1]);
                return (
                  <div key={i} className="score-cell">
                    <div className="label score-cell__label">Game {i + 1}</div>
                    <ScoreInput
                      value={g[0]}
                      onChange={(v) => setGame(i, 0, v)}
                      winner={settled && winner}
                      aria-label={`Game ${i + 1}, your score`}
                    />
                    <ScoreInput
                      value={g[1]}
                      onChange={(v) => setGame(i, 1, v)}
                      winner={settled && !winner}
                      aria-label={`Game ${i + 1}, opponent score`}
                    />
                  </div>
                );
              })}
            </div>

            {/* The third game is only played if the match is split — say so
                rather than leaving an input that looks required. */}
            {tally.us + tally.them < 2 && (
              <p className="hint">Leave game 3 empty if the match ended in two.</p>
            )}
          </section>

          {/* The best reason to open this screen: see what the match is worth
              before you commit it. */}
          <section className="card rise" style={{ animationDelay: "160ms" }}>
            {projected !== null ? (
              <div className="projection">
                <div>
                  <div className="label">Projected DUBR</div>
                  <div className="projection__figure figure text-aqua">
                    {((ME[disc] ?? 5) + projected).toFixed(3)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="label">Result</div>
                  <div className="display" style={{ marginTop: 8, fontSize: 17 }}>
                    {won ? "Win" : "Loss"} {tally.us}–{tally.them}
                  </div>
                  <div
                    className={`delta delta--bare ${projected >= 0 ? "is-up" : "is-down"}`}
                    style={{ marginTop: 4 }}
                  >
                    {fmtDelta(projected)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="projection__empty">
                <ShuttleIcon />
                <p>
                  Add your opponents and a score, and DUBR will show you exactly what this match
                  moves before you submit it.
                </p>
              </div>
            )}
          </section>

          <button disabled={!complete} className="btn btn--primary btn--block rise">
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
  winner,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  winner: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode="numeric"
      placeholder="–"
      className={`score-input figure ${winner ? "is-winner" : ""}`}
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
  options: typeof ROSTER;
  placeholder: string;
}) {
  const selected = ROSTER.find((p) => p.id === value);

  return (
    <div className="field">
      {selected ? (
        <span className="avatar-initials">{selected.initials}</span>
      ) : (
        <span className="avatar-initials is-provisional">
          <PlusIcon />
        </span>
      )}

      <select
        className="field__select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label={placeholder}
      >
        <option value="">{placeholder}</option>
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {selected && (
        <span className="field__rating">{selected.singles?.toFixed(3) ?? "NR"}</span>
      )}
    </div>
  );
}
