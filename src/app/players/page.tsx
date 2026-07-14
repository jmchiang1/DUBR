"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DISCIPLINES,
  DEFAULT_FILTERS,
  activeFilterCount,
  filterRoster,
  fmt,
  type PlayerFilters,
} from "@/lib/dubr";
import { Filters } from "@/components/player-filters";
import { FilterMenu } from "@/components/filter-menu";
import { SearchIcon, PinIcon } from "@/components/icons";

export default function Players() {
  const [filters, setFilters] = useState<PlayerFilters>(DEFAULT_FILTERS);

  const results = useMemo(() => filterRoster(filters), [filters]);
  const active = activeFilterCount(filters);

  return (
    <div className="stack">
      <header className="page-head rise">
        <h1 className="page-title display">Players</h1>
      </header>

      {/* Search and Filter on ONE row. The filters used to be a column pinned
          beside the results, which spent a third of the page on controls that
          sit idle most of the time — the results are what you came for. */}
      <div className="toolbar rise">
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

        <FilterMenu
          active={active}
          /* Reset clears the CLAUSES but keeps what you typed. The search box is
             out here on the toolbar, so wiping it from inside a panel you cannot
             see it from would just look like the app losing your query. */
          onReset={() => setFilters({ ...DEFAULT_FILTERS, q: filters.q })}
        >
          <Filters value={filters} onChange={setFilters} active={active} />
        </FilterMenu>
      </div>

      {results.length === 0 ? (
        <p className="card empty">No players match. {active > 0 && "Try widening a filter."}</p>
      ) : (
        /* One column, always. Two side by side turned a directory you SCAN into
           a grid you have to read in a zigzag. */
        <ul className="player-list rise" style={{ animationDelay: "80ms" }}>
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
                    {/* Where they are and how far that is — the two things the
                        filter actually asks about, so the two things the row has
                        to be able to answer for. */}
                    <span>
                      {p.location} · {p.distance} mi
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
        {results.length} {results.length === 1 ? "player" : "players"}
        {active > 0 && ` · ${active} ${active === 1 ? "filter" : "filters"} applied`}
      </p>
    </div>
  );
}
