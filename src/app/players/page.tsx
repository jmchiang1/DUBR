"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ROSTER,
  DISCIPLINES,
  DEFAULT_FILTERS,
  activeFilterCount,
  filterRoster,
  fmt,
  type PlayerFilters,
} from "@/lib/dubr";
import { Filters } from "@/components/player-filters";
import { SearchIcon, PinIcon } from "@/components/icons";

export default function Players() {
  const [filters, setFilters] = useState<PlayerFilters>(DEFAULT_FILTERS);
  /* The panel is a column on desktop and a sheet on mobile, where it starts
     closed — the results are what you came for, not the controls. */
  const [open, setOpen] = useState(false);

  const results = useMemo(() => filterRoster(filters), [filters]);
  const active = activeFilterCount(filters);

  return (
    <div className="stack">
      <header className="page-head rise">
        <h1 className="page-title display">Players</h1>
      </header>

      <div className="row rise">
        <div className="searchbar">
          <SearchIcon className="search__icon" />
          <input
            className="search__input"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Search players"
            aria-label="Search players"
          />
        </div>

        {/* Mobile only: the panel is always on screen from 1024px up. */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`filter-btn filters__toggle ${active ? "is-active" : ""}`}
        >
          Filters
          {active > 0 && <span className="filter-btn__count">{active}</span>}
        </button>
      </div>

      <div className={`directory ${open ? "is-open" : ""}`}>
        <aside className="card directory__panel rise" style={{ animationDelay: "40ms" }}>
          <Filters value={filters} onChange={setFilters} active={active} />
        </aside>

        <div className="directory__results">
          {results.length === 0 ? (
            <p className="card empty">
              No players match. {active > 0 && "Try widening a filter."}
            </p>
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
                        {/* Distance, not just the club name: it is the thing the
                            filter above is now asking about, so it is the thing
                            the row has to be able to answer for. */}
                        <span>
                          {p.club ?? p.location} · {p.distance} mi
                        </span>
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
            Showing {results.length} of {ROSTER.length - 1} players.{" "}
            {results.some((p) => p.singles === null) &&
              "Unrated players show NR until they have logged 5 matches."}
          </p>
        </div>
      </div>
    </div>
  );
}
