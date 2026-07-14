"use client";

import { useMemo, useState } from "react";
import { PinIcon, CalendarIcon } from "@/components/icons";
import { ME } from "@/lib/dubr";
import {
  EVENTS,
  KINDS,
  KIND_LABEL,
  eligible,
  fmtBand,
  fmtFee,
  fmtDistance,
  type BadmintonEvent,
  type EventKind,
} from "@/lib/events";

type Filter = EventKind | "all";

export default function Events() {
  const [kind, setKind] = useState<Filter>("all");
  /** Off by default. The whole point of a universal rating is that an event in
      Milpitas counts the same as one down the road — hiding the far ones by
      default would quietly argue against the product. */
  const [nearby, setNearby] = useState(false);
  const [qualifyOnly, setQualifyOnly] = useState(false);

  const results = useMemo(
    () =>
      EVENTS.filter((e) => kind === "all" || e.kind === kind)
        .filter((e) => !nearby || e.distance <= 50)
        .filter((e) => !qualifyOnly || eligible(e, ME.singles))
        .sort((a, b) => a.distance - b.distance),
    [kind, nearby, qualifyOnly],
  );

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

      <div className="tabs rise" style={{ animationDelay: "40ms" }}>
        <button
          onClick={() => setKind("all")}
          aria-pressed={kind === "all"}
          className={`tab ${kind === "all" ? "is-active" : ""}`}
        >
          All
        </button>
        {KINDS.map((k) => (
          <button
            key={k.id}
            onClick={() => setKind(k.id)}
            aria-pressed={kind === k.id}
            className={`tab ${kind === k.id ? "is-active" : ""}`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="row rise" style={{ animationDelay: "60ms" }}>
        <button
          onClick={() => setNearby((v) => !v)}
          aria-pressed={nearby}
          className={`filter-btn ${nearby ? "is-active" : ""}`}
        >
          Within 50 mi
        </button>
        <button
          onClick={() => setQualifyOnly((v) => !v)}
          aria-pressed={qualifyOnly}
          className={`filter-btn ${qualifyOnly ? "is-active" : ""}`}
        >
          I qualify
        </button>
      </div>

      {results.length === 0 ? (
        <p className="card empty">No events match those filters.</p>
      ) : (
        <ul className="grid-cards grid-cards--three rise" style={{ animationDelay: "80ms" }}>
          {results.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </ul>
      )}

      <p className="footnote">
        Showing {results.length} of {EVENTS.length} events, hosted by {hosts} independent venues.
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
