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
    <div className="stack--tight stack">
      <header className="page-head rise">
        <h1 className="page-title display">Rankings</h1>
        <p className="page-sub">
          Every rated player, ordered by DUBR. Updated after each confirmed match.
        </p>
      </header>

      <div className="tabs rise" style={{ animationDelay: "40ms" }}>
        {DISCIPLINES.map((d) => (
          <button
            key={d.id}
            onClick={() => setDisc(d.id)}
            aria-pressed={d.id === disc}
            className={`tab ${d.id === disc ? "is-active" : ""}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <section
        className="card card--pad rise"
        style={{ animationDelay: "80ms", display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}
      >
        <Summary label="Top DUBR" value={top.toFixed(3)} />
        <Summary label="Average" value={avg.toFixed(3)} />
        <Summary label="Matches" value={String(totalMatches)} />
      </section>

      {/* The board. Rows are rows — no medal emoji, no card per player. */}
      <section className="card rise" style={{ animationDelay: "120ms", overflow: "hidden" }}>
        <div className="board__head">
          <div className="label board__rank">#</div>
          <div className="label board__player" style={{ paddingLeft: 42 }}>
            Player
          </div>
          <div className="label board__club">Club</div>
          <div className="label board__record">Record</div>
          <div className="label rel">Rel.</div>
          <div className="label board__rating">DUBR</div>
        </div>

        <ul>
          {rated.map((p, i) => {
            const me = p.id === "me";
            return (
              <li key={p.id} className={`board__row ${me ? "is-me" : ""}`}>
                <div className={`board__rank figure ${i < 3 ? "is-top" : ""}`}>{i + 1}</div>

                <span className="avatar-initials avatar-initials--lg">{p.initials}</span>

                <div className="board__player">
                  <div className="board__name">
                    <span>{p.name}</span>
                    {me && <span className="badge-you label">You</span>}
                  </div>
                  <div className="board__sub">
                    {p.matches} matches · {Math.round((p.wins / p.matches) * 100)}% W
                  </div>
                </div>

                <div className="board__club">{p.club ?? "—"}</div>
                <div className="board__record">
                  {p.wins}–{p.matches - p.wins}
                </div>

                {/* Reliability: a thinly-tested rating looks visibly thinner. */}
                <div className="rel">
                  {[0, 1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`rel__seg ${p.reliability > s * 0.25 ? "is-on" : ""}`}
                    />
                  ))}
                </div>

                <div className="board__rating figure">{fmt(p[disc])}</div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Provisional players are separated and honestly labelled. The old board
          listed them at a default 5.500 / "Advanced" with 0% reliability, which
          made every real rating above them look invented too. */}
      {unrated.length > 0 && (
        <section className="card rise" style={{ animationDelay: "160ms", overflow: "hidden" }}>
          <div className="provisional__head">
            <h2 className="display text-mute" style={{ fontSize: 12 }}>
              Provisional
            </h2>
            <p className="provisional__note">
              Not enough matches to place on the scale. These players are unrated — they are not
              ranked, and they are not assigned a default.
            </p>
          </div>

          <ul>
            {unrated.map((p) => (
              <li key={p.id} className="board__row">
                <div className="board__rank" />
                <span className="avatar-initials avatar-initials--lg is-provisional">
                  {p.initials}
                </span>
                <div className="board__player">
                  <div className="board__name text-mute">
                    <span>{p.name}</span>
                  </div>
                  <div className="board__sub">{p.matches} of 5 matches logged</div>
                </div>
                <div className="board__club" />
                <div className="board__record" />
                <div className="rel" />
                <div className="board__rating figure is-unrated">NR</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="stat__value figure" style={{ fontSize: 20 }}>
        {value}
      </div>
    </div>
  );
}
