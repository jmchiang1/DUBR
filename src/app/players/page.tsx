"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PLAYERS, DISCIPLINES, fmt } from "@/lib/dubr";
import { SearchIcon, PinIcon } from "@/components/icons";

export default function Players() {
  const [q, setQ] = useState("");
  /** "Near my level" is the query that actually gets someone a game — the old
      app made you scroll a directory and guess. */
  const [nearMe, setNearMe] = useState(false);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PLAYERS.filter((p) => p.id !== "me")
      .filter((p) => !term || p.name.toLowerCase().includes(term))
      .filter((p) => {
        if (!nearMe) return true;
        const r = p.singles;
        return r !== null && Math.abs(r - 5.302) <= 0.35;
      });
  }, [q, nearMe]);

  return (
    <div className="stack">
      <header className="page-head rise">
        <h1 className="page-title display">Players</h1>
      </header>

      <div className="row rise" style={{ maxWidth: 520 }}>
        <div className="searchbar">
          <SearchIcon className="search__icon" />
          <input
            className="search__input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search players"
            aria-label="Search players"
          />
        </div>
        <button
          onClick={() => setNearMe((v) => !v)}
          aria-pressed={nearMe}
          className={`filter-btn ${nearMe ? "is-active" : ""}`}
        >
          Near my level
        </button>
      </div>

      {results.length === 0 ? (
        <p className="card empty">No players match “{q}”.</p>
      ) : (
        <ul className="grid-cards rise" style={{ animationDelay: "80ms" }}>
          {results.map((p) => (
            <li key={p.id}>
              <Link href={`/players/${p.id}`} className="card player-card">
                <span
                  className={`avatar-initials avatar-initials--lg ${
                    p.singles === null ? "is-provisional" : ""
                  }`}
                >
                  {p.initials}
                </span>

                <div className="player-card__body">
                  <div className="player-card__name">{p.name}</div>
                  <div className="player-card__meta">
                    <PinIcon />
                    <span>{p.club ?? p.location}</span>
                  </div>
                </div>

                {/* All three discipline ratings, always — a doubles specialist and
                    a singles specialist are different players. */}
                <div className="chips">
                  {DISCIPLINES.map((d) => {
                    const v = p[d.id];
                    return (
                      <div key={d.id} className="chip" title={`${d.label}: ${fmt(v)}`}>
                        <div className="label">{d.label.slice(0, 1)}</div>
                        <div className={`chip__value ${v === null ? "is-unrated" : ""}`}>
                          {v === null ? "NR" : v.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="footnote">
        Showing {results.length} of {PLAYERS.length - 1} players.{" "}
        {results.some((p) => p.singles === null) &&
          "Unrated players show NR until they have logged 5 matches."}
      </p>
    </div>
  );
}
