"use client";

import {
  AGE_CEIL,
  AGE_FLOOR,
  DAYS,
  DEFAULT_FILTERS,
  DISTANCE_MAX,
  RATING_CEIL,
  RATING_FLOOR,
  type Day,
  type Format,
  type Gender,
  type PlayerFilters,
} from "@/lib/dubr";

/**
 * The player filter.
 *
 * It replaced a single "Near my level" toggle, which answered one question with
 * one hard-coded number (±0.35 of MY singles rating) and could not answer any of
 * the others. "Who can I get a game with" is a query with clauses — how far, what
 * format, roughly what standard, and, above all, when are they free — and the
 * only useful directory is one that lets you say all of them.
 *
 * Nothing here narrows anything until you touch it: every control opens at "any".
 */

const GENDERS: { id: Gender | "any"; label: string }[] = [
  { id: "any", label: "Anybody" },
  { id: "man", label: "Men" },
  { id: "woman", label: "Women" },
];

const FORMATS: { id: Format; label: string }[] = [
  { id: "doubles", label: "Doubles" },
  { id: "singles", label: "Singles" },
];

export function Filters({
  value: f,
  onChange,
  active,
}: {
  value: PlayerFilters;
  onChange: (next: PlayerFilters) => void;
  /** How many clauses are currently narrowing the roster. */
  active: number;
}) {
  const set = <K extends keyof PlayerFilters>(key: K, v: PlayerFilters[K]) =>
    onChange({ ...f, [key]: v });

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  return (
    <div className="filters">
      <div className="filters__head">
        <h2 className="filters__title display">Filters</h2>
        <button
          className="filters__reset"
          onClick={() => onChange({ ...DEFAULT_FILTERS, q: f.q })}
          disabled={active === 0}
        >
          Reset
        </button>
      </div>

      {/* ── DISTANCE ─────────────────────────────────────────────────────── */}
      <fieldset className="filters__group">
        <legend className="label">Distance</legend>
        <input
          type="range"
          className="slider"
          min={0}
          max={DISTANCE_MAX}
          step={1}
          value={f.distance}
          onChange={(e) => set("distance", Number(e.target.value))}
          aria-label="Maximum distance in miles"
          aria-valuetext={f.distance === 0 ? "No limit" : `${f.distance} miles`}
          style={{ "--fill": `${(f.distance / DISTANCE_MAX) * 100}%` } as React.CSSProperties}
        />
        <div className="filters__ends">
          {/* Zero is NO LIMIT, not zero miles. A slider whose left end means
              "nobody" would be a slider you can break the page with. */}
          <span>{f.distance === 0 ? "No limit" : "0 mi"}</span>
          <span className="filters__value">
            {f.distance === 0 ? "Any distance" : `Within ${f.distance} mi`}
          </span>
        </div>
      </fieldset>

      {/* ── GENDER ───────────────────────────────────────────────────────── */}
      <fieldset className="filters__group">
        <legend className="label">Gender</legend>
        <div className="segmented" role="group" aria-label="Gender">
          {GENDERS.map((g) => (
            <button
              key={g.id}
              onClick={() => set("gender", g.id)}
              aria-pressed={f.gender === g.id}
              className={`segmented__btn ${f.gender === g.id ? "is-active" : ""}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* ── FORMAT ───────────────────────────────────────────────────────── */}
      <fieldset className="filters__group">
        <legend className="label">Type</legend>
        <div className="checks">
          {FORMATS.map((t) => (
            <label key={t.id} className="check">
              <input
                type="checkbox"
                checked={f.formats.includes(t.id)}
                onChange={() => set("formats", toggle(f.formats, t.id))}
              />
              <span className="check__box" aria-hidden="true" />
              {t.label}
            </label>
          ))}
        </div>
        {/* Deselecting both is a legal query with no answer. Say so, rather than
            silently showing the whole roster as though nothing were selected. */}
        {f.formats.length === 0 && (
          <p className="filters__warn">Pick at least one format, or nobody matches.</p>
        )}
      </fieldset>

      {/* ── RATING ───────────────────────────────────────────────────────── */}
      <fieldset className="filters__group">
        <legend className="label filters__legend">
          DUBR Rating
          <span className="filters__value">
            {f.rating[0].toFixed(1)} – {f.rating[1].toFixed(1)}
          </span>
        </legend>
        <DualRange
          min={RATING_FLOOR}
          max={RATING_CEIL}
          step={0.5}
          value={f.rating}
          onChange={(v) => set("rating", v)}
          label="DUBR rating"
          format={(v) => v.toFixed(1)}
        />
        <div className="filters__ticks" aria-hidden="true">
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </fieldset>

      {/* ── AGE ──────────────────────────────────────────────────────────── */}
      <fieldset className="filters__group">
        <legend className="label filters__legend">
          Age Range
          <span className="filters__value">
            {ageLabel(f.age[0], "lo")} – {ageLabel(f.age[1], "hi")}
          </span>
        </legend>
        <DualRange
          min={AGE_FLOOR}
          max={AGE_CEIL}
          step={1}
          value={f.age}
          onChange={(v) => set("age", v)}
          label="Age"
          format={(v) => String(v)}
        />
        <div className="filters__ends">
          <span>Under 19</span>
          <span>80+</span>
        </div>
      </fieldset>

      {/* ── AVAILABILITY ─────────────────────────────────────────────────
          The clause that actually produces a game. A 5.3 player ten minutes away
          is no use to you if they only play Sundays and you only play weeknights. */}
      <fieldset className="filters__group">
        <legend className="label">Free to play</legend>
        <div className="days">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => set("days", toggle(f.days, d as Day))}
              aria-pressed={f.days.includes(d)}
              className={`day ${f.days.includes(d) ? "is-active" : ""}`}
            >
              {d[0]}
              <span className="sr-only">{d}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* ── UNRATED ──────────────────────────────────────────────────────── */}
      <fieldset className="filters__group filters__group--last">
        <label className="check">
          <input
            type="checkbox"
            checked={f.includeUnrated}
            onChange={() => set("includeUnrated", !f.includeUnrated)}
          />
          <span className="check__box" aria-hidden="true" />
          Include unrated players
        </label>
        <p className="filters__note">
          A rating range cannot include someone who has no rating yet. This keeps
          them in.
        </p>
      </fieldset>
    </div>
  );
}

function ageLabel(v: number, end: "lo" | "hi") {
  if (end === "lo" && v === AGE_FLOOR) return "Under 19";
  if (end === "hi" && v === AGE_CEIL) return "80+";
  return String(v);
}

/**
 * Two thumbs on one track.
 *
 * Two stacked <input type="range">, because a native range is the only control
 * that a keyboard, a screen reader, and a touch screen all already understand —
 * a pair of divs with pointer handlers understands none of them. The inputs are
 * transparent and pointer-events:none; only their THUMBS take the pointer, which
 * is what lets you grab either one where they overlap.
 *
 * Each thumb is clamped against the other, so the range can never invert.
 */
function DualRange({
  min,
  max,
  step,
  value,
  onChange,
  label,
  format,
}: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  label: string;
  format: (v: number) => string;
}) {
  const [lo, hi] = value;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div
      className="range2"
      style={{ "--lo": `${pct(lo)}%`, "--hi": `${pct(hi)}%` } as React.CSSProperties}
    >
      <div className="range2__track" />
      <div className="range2__fill" />
      <input
        type="range"
        className="range2__input"
        min={min}
        max={max}
        step={step}
        value={lo}
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        aria-label={`Minimum ${label}`}
        aria-valuetext={format(lo)}
      />
      <input
        type="range"
        className="range2__input"
        min={min}
        max={max}
        step={step}
        value={hi}
        onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        aria-label={`Maximum ${label}`}
        aria-valuetext={format(hi)}
      />
    </div>
  );
}
