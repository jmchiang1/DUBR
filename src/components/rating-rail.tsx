"use client";

import { LEVELS, RATING_MIN, RATING_MAX, scalePos, levelFor } from "@/lib/dubr";

/**
 * The rating rail — the app's signature element.
 *
 * The old design used a rounded, gradient-filled progress bar, which framed the
 * rating as a game meter you fill up. A rating is not progress; it is a
 * measurement on a fixed scale. So this is drawn as an actual ruler: a hairline
 * axis, a minor tick every 0.25, a major tick at every level floor, and a
 * machined indicator sitting at the measured value.
 *
 * The confidence band is the honest part. A provisional rating is a range, not
 * a point, so the band widens as reliability drops — you can literally see the
 * system's uncertainty shrink as you log matches.
 *
 * Renders on a white card: cobalt marks the measured value, aqua tints the
 * uncertainty, and the scale itself stays neutral so it reads as substrate.
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
          className="absolute top-[29px] h-[5px] rounded-full bg-aqua/45"
          style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }}
        />

        {/* Ticks. Major ticks land on level floors. */}
        {minorTicks.map((v) => {
          const major = LEVELS.some((l) => Math.abs(l.floor - v) < 0.001);
          return (
            <div
              key={v}
              className={`absolute w-px ${
                major ? "top-[22px] h-[19px] bg-line-strong" : "top-[28px] h-[7px] bg-line"
              }`}
              style={{ left: `${scalePos(v) * 100}%` }}
            />
          );
        })}

        {/* The axis itself — hairline, spans the full measurable range. */}
        <div className="absolute top-[31px] right-0 left-0 h-px bg-line-strong" />

        {/* Indicator: a precision blade, not a pill. */}
        <div
          className="absolute top-[14px] z-10 -translate-x-1/2"
          style={{ left: `${pos * 100}%` }}
        >
          <div className="mx-auto h-[35px] w-[2px] bg-cobalt" />
          <div className="mx-auto -mt-[35px] h-[7px] w-[7px] rotate-45 border-t-2 border-l-2 border-cobalt bg-surface" />
        </div>

        {/* Scale labels are the NUMBERS, not the level names. Level names are
            long, they collide at this width, and the current one is already
            stated in prose above the rail. A ruler is labelled with its units. */}
        {[2, 3, 4, 5, 6, 7, 8].map((v) => {
          const current = Math.floor(rating) === v;
          return (
            <div
              key={v}
              className="absolute top-[45px] -translate-x-1/2"
              style={{ left: `${scalePos(v) * 100}%` }}
            >
              <span
                className={`text-[10px] tabular-nums ${current ? "text-bone" : "text-faint"}`}
              >
                {v}
              </span>
            </div>
          );
        })}

        {/* The level the player is in, named once, anchored to the indicator. */}
        <div
          className="absolute top-0 -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${pos * 100}%` }}
        >
          <span className="label !text-[9px] !text-cobalt">{level.name}</span>
        </div>
      </div>
    </div>
  );
}

/* The rating trajectory now lives in `trend-chart.tsx`, on Chart.js. The rail
   above stays hand-built: it is a measuring scale with a confidence band, not a
   plot of a series, and no chart library has that primitive. */
