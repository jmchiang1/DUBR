"use client";

import { useMemo, useState } from "react";
import { PinIcon, CalendarIcon, SearchIcon } from "@/components/icons";
import { FilterMenu } from "@/components/filter-menu";
import { EventFilterPanel } from "@/components/event-filters";
import { ME } from "@/lib/dubr";
import {
  EVENTS,
  KIND_LABEL,
  DEFAULT_EVENT_FILTERS,
  activeEventFilterCount,
  filterEvents,
  eligible,
  fmtBand,
  fmtFee,
  fmtDistance,
  type BadmintonEvent,
  type EventFilters,
} from "@/lib/events";

export default function Events() {
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_EVENT_FILTERS);

  const results = useMemo(() => filterEvents(filters, ME.singles), [filters]);
  const active = activeEventFilterCount(filters);
  const hosts = new Set(EVENTS.map((e) => e.host)).size;

  return (
    <div className="stack">
      <header className="page-head rise">
        <h1 className="page-title display">Events</h1>
        <p className="page-sub">
          Any venue can run a rated event. A DUBR earned in Queens is worth exactly what it is
          worth in Milpitas — that is the whole point of one scale.
        </p>
      </header>

      {/* Search and Filter on one row — the same control as /players, because a
          filter that behaves differently on two pages of one app is two things
          to learn instead of one. */}
      <div className="toolbar rise">
        <div className="searchbar">
          <SearchIcon className="search__icon" />
          <input
            className="search__input"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Search events, hosts, cities"
            aria-label="Search events"
          />
        </div>

        <FilterMenu
          active={active}
          onReset={() => setFilters({ ...DEFAULT_EVENT_FILTERS, q: filters.q })}
        >
          <EventFilterPanel value={filters} onChange={setFilters} />
        </FilterMenu>
      </div>

      {results.length === 0 ? (
        <p className="card empty">
          No events match. {active > 0 && "Try widening a filter."}
        </p>
      ) : (
        <ul className="grid-cards grid-cards--three rise" style={{ animationDelay: "80ms" }}>
          {results.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </ul>
      )}

      <p className="footnote">
        {results.length} of {EVENTS.length} events, hosted by {hosts} independent venues
        {active > 0 && ` · ${active} ${active === 1 ? "filter" : "filters"} applied`}
      </p>
    </div>
  );
}

function EventCard({ event: e }: { event: BadmintonEvent }) {
  const full = e.spots === 0;
  const qualifies = eligible(e, ME.singles);

  return (
    <li className="card event">
      <div className="event__top">
        <span className={`event__kind is-${e.kind}`}>{KIND_LABEL[e.kind]}</span>

        {/* An event that does not move your rating has to say so. A player who
            assumes a clinic counted, and finds out later that it did not, was
            misled by the silence. */}
        {!e.rated && <span className="event__unrated">Unrated</span>}
      </div>

      <h3 className="event__name">{e.name}</h3>

      {/* The host is named, and named prominently. Every one of these is an
          independent venue — that is the argument this page is making. */}
      <div className="event__host">{e.host}</div>

      <div className="event__meta">
        <PinIcon />
        <span>{e.city}</span>
        <span className="text-faint">·</span>
        <span>{fmtDistance(e.distance)}</span>
      </div>

      <div className="event__meta">
        <CalendarIcon />
        <span>{e.when}</span>
      </div>

      <div className="event__facts">
        <Fact label="DUBR" value={fmtBand(e.band)} warn={!qualifies} />
        <Fact label="Format" value={e.formats.join(" · ")} />
        <Fact label="Entry" value={fmtFee(e.fee)} />
      </div>

      <div className="event__foot">
        <span className={`event__spots ${full ? "is-full" : ""}`}>
          {full ? "Full" : `${e.spots} of ${e.capacity} left`}
        </span>

        <button
          disabled={full || !qualifies}
          className="btn btn--primary btn--sm"
          title={!qualifies ? "Your rating is outside this event's band" : undefined}
        >
          {full ? "Join waitlist" : qualifies ? "Register" : "Outside band"}
        </button>
      </div>
    </li>
  );
}

function Fact({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="event__fact">
      <div className="label">{label}</div>
      <div className={`event__fact-value ${warn ? "is-warn" : ""}`}>{value}</div>
    </div>
  );
}
