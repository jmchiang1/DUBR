"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

/* Tree-shaken registration: line + linear scale + the two optional plugins we
   actually use. Registering `Chart.register(...registerables)` would pull in
   every controller (bar, pie, radar, polar) for a chart that is one line. */
Chart.register(LineController, LineElement, PointElement, LinearScale, Filler, Tooltip);

/** Colors live in CSS, not here — read them off the document so a theme flip
    (`[data-theme="dark"]`) repaints the canvas, which cannot inherit CSS. */
type Palette = { gain: string; loss: string; surface: string; ink: string; faint: string };

/* `surface` and `ink` here are the TOOLTIP's fill and text, not the app's card
   tokens — the app's --surface is a translucent white that would be invisible as
   tooltip text, and --bone is white, which would make the tooltip a white box.
   The tooltip is drawn on the dark canvas colour with white text instead. */
const LIGHT: Palette = {
  gain: "#00e5c0",
  loss: "#ff3d5a",
  surface: "#ffffff",
  ink: "#000c43",
  faint: "rgba(255,255,255,0.5)",
};

function readPalette(): Palette {
  /* Rendered on the server, and again on the client to hydrate: no document to
     read either time. The canvas is painted from an effect, so the fallback is
     never what gets drawn — it only has to be a valid Palette. */
  if (typeof document === "undefined") return LIGHT;
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    gain: v("--aqua", LIGHT.gain),
    loss: v("--loss", LIGHT.loss),
    surface: LIGHT.surface,
    ink: v("--ink", LIGHT.ink),
    faint: v("--faint", LIGHT.faint),
  };
}

/* The palette and the motion preference are read SYNCHRONOUSLY on the first
   client render, not in an effect. An effect that calls setState lands one render
   after mount — which is exactly when the intro animation is running — and every
   render hands react-chartjs-2 fresh `options`, which makes it call chart.update()
   and re-tween the line mid-flight. The subscriptions below only fire on an actual
   theme or preference CHANGE, which is rare and worth a redraw. */
function usePalette(): Palette {
  const [palette, setPalette] = useState<Palette>(readPalette);

  useEffect(() => {
    const observer = new MutationObserver(() => setPalette(readPalette()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return palette;
}

/** The canvas cannot inherit the `prefers-reduced-motion` rule in globals.css —
    CSS does not reach inside it — so the chart has to ask for itself. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/**
 * The context Chart.js hands to a per-element animation callback. It ships
 * `ScriptableContext` for scales and elements, but the ANIMATION context is a
 * different object it does not export a type for — it carries `index`/`type`
 * (not `dataIndex`), and it is the same mutable object across frames, which is
 * what lets the draw below latch a `started` flag onto it.
 */
type DrawContext = {
  type: string;
  index: number;
  datasetIndex: number;
  chart: Chart;
  xStarted?: boolean;
  yStarted?: boolean;
};

type Animations = {
  x: {
    type: "number";
    easing: "linear";
    duration: number;
    from: number;
    delay: (ctx: DrawContext) => number;
  };
  y: {
    type: "number";
    easing: "easeOutQuart";
    duration: number;
    from: (ctx: DrawContext) => number;
    delay: (ctx: DrawContext) => number;
  };
};

/** rgba() from a hex, so the area fill can be the line color at low alpha
    without adding a color library for one operation. */
function alpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export type Tick = { index: number; label: string };

/**
 * The rating trajectory, drawn with Chart.js.
 *
 * ONE series, so there is no legend — the card's own label names it. The line is
 * aqua when form is up and rust when it is down: that is polarity, not identity,
 * so it is the only color decision the chart makes.
 *
 * Two registers, and they are genuinely different objects:
 *
 * - `interactive={false}` (default) — a sparkline. A texture showing the SHAPE of
 *   form beside a number that already states the value. No axes, no points, no
 *   tooltip; there is nothing here to read a value off, by design.
 * - `interactive` — a real chart you can query. Hidden points become hover targets
 *   with a crosshair and a tooltip, and the fill is retained.
 *
 * Everything handed to <Line> is memoized. react-chartjs-2 keys its update effect
 * on the IDENTITY of `options` and `data`, so a fresh object literal per render
 * would call chart.update() on every render — restarting the draw animation from
 * whatever frame it had reached. `points` and `ticks` must therefore be stable
 * across renders too; the caller memoizes them.
 */
export function Trend({
  points,
  className = "",
  interactive = false,
  delay = 0,
  ticks,
}: {
  points: number[];
  className?: string;
  interactive?: boolean;
  /** Hold the draw until the card it lives on has finished its `.rise`. */
  delay?: number;
  /** Labelled positions along the x axis. Omitted (the sparkline) ⇒ no axis. */
  ticks?: Tick[];
}) {
  const palette = usePalette();
  const reducedMotion = useReducedMotion();
  const up = points[points.length - 1] >= points[0];
  const color = up ? palette.gain : palette.loss;

  const options = useMemo<ChartOptions<"line">>(() => {
    /* Chart.js autoscales to the data, which for a rating that moves in hundredths
       would amplify noise into cliffs. Pad the domain so the slope stays honest. */
    const min = Math.min(...points);
    const max = Math.max(...points);
    const pad = (max - min || 0.1) * 0.35;

    /* The line DRAWS ITSELF, left to right, one match at a time — the chart is a
       history, so it is built in the order the history happened. Chart.js's default
       line animation instead lifts every point from the baseline at once, which at
       sparkline size reads as a flicker rather than as motion.

       Each point animates its own x and y, offset by its index, so the leading edge
       advances across the canvas and the fill sweeps in beneath it. `from: NaN` on x
       is the mechanism: a point with no x yet is not drawn at all, so the line has a
       genuine end rather than being revealed under a mask.

       A year of matches is ~90 points, at which the per-point step would fall under
       a frame and the stagger would degenerate into a wipe; the floor keeps each
       point's own arrival visible, at the cost of a longer total draw. */
    const step = Math.max(620 / Math.max(points.length - 1, 1), 12);

    const previousY = (ctx: DrawContext) =>
      ctx.index === 0
        ? ctx.chart.scales.y.getPixelForValue(points[0])
        : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(["y"], true).y;

    /* The `started` flags latch per element: Chart.js re-evaluates `delay` on every
       update, so without the latch each point would keep re-queuing its own delay and
       the line would never finish arriving. */
    const draw: Animations = {
      x: {
        type: "number",
        easing: "linear",
        duration: step,
        from: NaN,
        delay: (ctx) => {
          if (ctx.type !== "data" || ctx.xStarted) return 0;
          ctx.xStarted = true;
          return delay + ctx.index * step;
        },
      },
      y: {
        type: "number",
        easing: "easeOutQuart",
        duration: step * 1.6,
        from: previousY,
        delay: (ctx) => {
          if (ctx.type !== "data" || ctx.yStarted) return 0;
          ctx.yStarted = true;
          return delay + ctx.index * step;
        },
      },
    };

    const label = new Map(ticks?.map((t) => [t.index, t.label]));

    return {
      responsive: true,
      maintainAspectRatio: false,
      /* Reduced motion means NO motion: the finished chart, drawn in one frame. */
      animation: reducedMotion ? false : undefined,
      /* Cast through `unknown`: Chart.js types `animations` callbacks against
         ScriptableContext, but at runtime it passes the animation context typed as
         DrawContext above. The shapes are irreconcilable in TS; the runtime is right. */
      animations: reducedMotion
        ? {}
        : (draw as unknown as ChartOptions<"line">["animations"]),
      /* Hovering must NOT re-run the draw above. `animations.x`/`.y` are per-property
         and outrank a transition's plain `animation.duration`, so without pinning them
         to zero here every mousemove would re-tween x from NaN — the line blinking out
         and redrawing itself under the cursor. The point's own grow-on-hover is what
         the 150ms is for. */
      transitions: {
        active: {
          animation: { duration: 150 },
          animations: { x: { duration: 0 }, y: { duration: 0 } },
        },
      },
      /* The sparkline is decorative; the interactive one is the accessible object. */
      events: interactive ? undefined : [],
      layout: { padding: interactive ? 2 : 1 },
      scales: {
        x: {
          type: "linear",
          display: !!ticks,
          min: 0,
          max: points.length - 1,
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: palette.faint,
            font: { family: "Inter, system-ui, sans-serif", size: 11 },
            autoSkip: false,
            maxRotation: 0,
            padding: 6,
            callback: (value) => label.get(Number(value)) ?? "",
          },
          /* Chart.js would otherwise pick its own round-number ticks along an axis
             whose unit is "match number", which means nothing to anyone. The ticks
             are the ones the caller asked for, and only those. */
          afterBuildTicks: (axis) => {
            axis.ticks = (ticks ?? []).map((t) => ({ value: t.index }));
          },
        },
        y: { display: false, min: min - pad, max: max + pad },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: interactive,
          displayColors: false,
          backgroundColor: palette.ink,
          titleColor: palette.surface,
          bodyColor: palette.surface,
          bodyFont: { family: "Inter, system-ui, sans-serif", size: 12, weight: 600 },
          padding: 8,
          caretSize: 4,
          callbacks: {
            title: () => "",
            /* The rating AND what the match moved it by. The delta is the reason
               anyone hovers a rating chart — "5.302" alone is already printed in
               48pt above the chart, so repeating it is the only useless thing the
               tooltip could say. The first point has no predecessor, so it is
               labelled as the starting position rather than a change of +0.000. */
            label: (item) => {
              const i = item.dataIndex;
              const v = item.parsed.y as number;
              if (i === 0) return [v.toFixed(3), "starting rating"];
              const d = v - points[i - 1];
              const sign = d > 0 ? "+" : d < 0 ? "−" : "±";
              return [v.toFixed(3), `${sign}${Math.abs(d).toFixed(3)} this match`];
            },
          },
        },
      },
      interaction: { mode: "index", intersect: false },
      elements: {
        line: { borderWidth: 2, tension: 0.25, borderCapStyle: "round" },
        point: { radius: 0, hoverRadius: 4, hitRadius: 12 },
      },
    };
  }, [points, ticks, interactive, delay, reducedMotion, palette]);

  const data = useMemo(
    () => ({
      labels: points.map((_, i) => i),
      datasets: [
        {
          data: points,
          borderColor: color,
          backgroundColor: alpha(color, 0.12),
          fill: true,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: palette.surface,
          pointHoverBorderWidth: 2,
        },
      ],
    }),
    [points, color, palette.surface],
  );

  return (
    <div className={className} aria-hidden={!interactive}>
      <Line
        options={options}
        data={data}
        /* A canvas is opaque to a screen reader, so the accessible chart carries
           its own text alternative. The sparkline is aria-hidden above. */
        aria-label={
          interactive
            ? `Rating trajectory: ${points.length} points, ${points[0].toFixed(
                3,
              )} to ${points[points.length - 1].toFixed(3)}.`
            : undefined
        }
        role={interactive ? "img" : undefined}
      />
    </div>
  );
}

/** Crosshair. Chart.js has no built-in vertical rule on hover, and a trajectory
    read against a fill needs one to anchor the eye to the point being read. */
Chart.register({
  id: "dubr-crosshair",
  afterDatasetsDraw(chart) {
    const active = chart.getActiveElements();
    if (!active.length) return;
    const { ctx, chartArea } = chart;
    const x = active[0].element.x;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(128, 128, 140, 0.45)";
    ctx.stroke();
    ctx.restore();
  },
});
