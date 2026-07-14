"use client";

import {
  EVENT_DISTANCE_MAX,
  KINDS,
  type EventFilters,
  type EventKind,
} from "@/lib/events";

/**
 * The event filter. Lives inside the shared <FilterMenu>, so it supplies no
 * heading and no Reset — the panel owns both.
 *
 * Nothing here narrows anything until you touch it: every control opens at "any".
 */

const FORMATS = ["Singles", "Doubles", "Mixed"];

export function EventFilterPanel({
  value: f,
  onChange,
}: {
  value: EventFilters;
  onChange: (next: EventFilters) => void;
}) {
  const set = <K extends keyof EventFilters>(key: K, v: EventFilters[K]) =>
    onChange({ ...f, [key]: v });

  const toggleFormat = (name: string) => {
    const id = name.toLowerCase();
    set("formats", f.formats.includes(id) ? f.formats.filter((x) => x !== id) : [...f.formats, id]);
  };

  return (
    <div className="filters">
      {/* ── KIND ─────────────────────────────────────────────────────────── */}
      <fieldset className="filters__group">
        <legend className="label">Kind</legend>
        <div className="chip-row">
          {[{ id: "all" as const, label: "All" }, ...KINDS].map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => set("kind", k.id as EventKind | "all")}
              aria-pressed={f.kind === k.id}
              className={`pill ${f.kind === k.id ? "is-active" : ""}`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* ── DISTANCE ─────────────────────────────────────────────────────
          The ceiling is 3000 miles, not 50: a rating that travels is the whole
          product, so the control has to be able to express "anywhere in the
          country" rather than quietly capping you at a local radius. */}
      <fieldset className="filters__group">
        <legend className="label">Distance</legend>
        <input
          type="range"
          className="slider"
          min={0}
          max={EVENT_DISTANCE_MAX}
          step={25}
          value={f.distance}
          onChange={(e) => set("distance", Number(e.target.value))}
          aria-label="Maximum distance in miles"
          aria-valuetext={f.distance === 0 ? "No limit" : `${f.distance} miles`}
          style={
            { "--fill": `${(f.distance / EVENT_DISTANCE_MAX) * 100}%` } as React.CSSProperties
          }
        />
        <div className="filters__ends">
          {/* Zero is NO LIMIT, not zero miles. A slider whose left end means
              "nowhere" would be a slider you can break the page with. */}
          <span>{f.distance === 0 ? "No limit" : "0 mi"}</span>
          <span className="filters__value">
            {f.distance === 0 ? "Anywhere" : `Within ${f.distance.toLocaleString()} mi`}
          </span>
        </div>
      </fieldset>

      {/* ── FORMAT ───────────────────────────────────────────────────────── */}
      <fieldset className="filters__group">
        <legend className="label">Format</legend>
        <div className="checks">
          {FORMATS.map((name) => (
            <label key={name} className="check">
              <input
                type="checkbox"
                checked={f.formats.includes(name.toLowerCase())}
                onChange={() => toggleFormat(name)}
              />
              <span className="check__box" aria-hidden="true" />
              {name}
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── THE REST ─────────────────────────────────────────────────────── */}
      <fieldset className="filters__group filters__group--last">
        <legend className="label">Only show</legend>
        <div className="checks checks--stack">
          <label className="check">
            <input
              type="checkbox"
              checked={f.qualifyOnly}
              onChange={() => set("qualifyOnly", !f.qualifyOnly)}
            />
            <span className="check__box" aria-hidden="true" />
            Events I qualify for
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={f.ratedOnly}
              onChange={() => set("ratedOnly", !f.ratedOnly)}
            />
            <span className="check__box" aria-hidden="true" />
            Events that move my rating
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={f.freeOnly}
              onChange={() => set("freeOnly", !f.freeOnly)}
            />
            <span className="check__box" aria-hidden="true" />
            Free entry
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={f.hideFull}
              onChange={() => set("hideFull", !f.hideFull)}
            />
            <span className="check__box" aria-hidden="true" />
            Events with spots left
          </label>
        </div>
        <p className="filters__note">
          A clinic is coaching, not competition — “moves my rating” hides those.
        </p>
      </fieldset>
    </div>
  );
}
