"use client";

import { LEVELS, RATING_MIN, RATING_MAX, scalePos, levelFor } from "@/lib/dubr";

/**
 * The rating rail — the app's signature element.
 *
 * The old design used a rounded, gradient-filled progress bar, which framed the
 * rating as a game meter you fill up. A rating is not progress; it is a
 * measurement on a fixed scale. So this is drawn as an actual ruler: a hairline
 * axis, a minor tick every 0.25, a major labelled tick at every level floor,
 * and a machined indicator sitting at the measured value.
 *
 * The confidence band is the honest part. A provisional rating is a range, not
 * a point, so the band widens as reliability drops — you can literally see the
 * system's uncertainty shrink as you log matches.
 */
export function RatingRail({
  rating,
  reliability,
  className = "",
}: {
  rating: number;
  reliability: number;
  className?: string;
}) {
  const pos = scalePos(rating);
  const level = levelFor(rating);

  // Uncertainty in rating points: ±0.45 at zero reliability, ±0.05 at full.
  const margin = 0.45 - 0.4 * reliability;
  const lo = scalePos(rating - margin);
  const hi = scalePos(rating + margin);

  const minorTicks: number[] = [];
  for (let v = RATING_MIN; v <= RATING_MAX + 0.001; v += 0.25) minorTicks.push(v);

  return (
    <div className={className}>
      <div className="relative h-16 select-none">
        {/* Confidence band — the visible margin of error. */}
        <div
          className="absolute top-[30px] h-[3px] bg-aqua/20"
          style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }}
        />

        {/* Ticks. Major ticks land on level floors and get a label. */}
        {minorTicks.map((v) => {
          const major = LEVELS.some((l) => Math.abs(l.floor - v) < 0.001);
          return (
            <div
              key={v}
              className={`absolute w-px ${
                major ? "top-[22px] h-[19px] bg-line" : "top-[28px] h-[7px] bg-line/45"
              }`}
              style={{ left: `${scalePos(v) * 100}%` }}
            />
          );
        })}

        {/* The axis itself — hairline, spans the full measurable range. */}
        <div className="absolute top-[31px] left-0 right-0 h-px bg-line/70" />

        {/* Indicator: a precision blade, not a pill. */}
        <div
          className="absolute top-[14px] z-10 -translate-x-1/2"
          style={{ left: `${pos * 100}%` }}
        >
          <div className="mx-auto h-[35px] w-[2px] bg-aqua" />
          <div className="mx-auto -mt-[35px] h-[7px] w-[7px] rotate-45 border-t-2 border-l-2 border-aqua bg-ink" />
        </div>

        {/* Scale labels are the NUMBERS, not the level names. Level names are
            long, they collide at this width, and the current one is already
            stated in prose above the rail — so printing them here was both
            redundant and illegible. A ruler is labelled with its units. */}
        {[2, 3, 4, 5, 6, 7, 8].map((v) => {
          const current = Math.floor(rating) === v;
          return (
            <div
              key={v}
              className="absolute top-[45px] -translate-x-1/2"
              style={{ left: `${scalePos(v) * 100}%` }}
            >
              <span
                className={`text-[10px] tabular-nums ${
                  current ? "text-bone" : "text-white/35"
                }`}
              >
                {v}
              </span>
            </div>
          );
        })}

        {/* The level the player is currently in, named once, anchored to the
            indicator rather than to the axis. */}
        <div
          className="absolute top-[0px] -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${pos * 100}%` }}
        >
          <span className="label !text-[9px] !text-aqua-ink">{level.name}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Sparkline of the last N rating points. Deliberately unlabelled and small —
 * it is a texture that shows shape of form, not a chart to read values off.
 */
export function Trend({ points, className = "" }: { points: number[]; className?: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const w = 100;
  const h = 28;

  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const up = points[points.length - 1] >= points[0];
  const stroke = up ? "var(--color-aqua)" : "var(--color-loss)";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
