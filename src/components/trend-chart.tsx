"use client";

import { useEffect, useState } from "react";
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
type Palette = { gain: string; loss: string; surface: string; ink: string; line: string };

const LIGHT: Palette = {
  gain: "#00806b",
  loss: "#c2410c",
  surface: "#ffffff",
  ink: "#18181b",
  line: "#e2e2e5",
};

function usePalette(): Palette {
  const [palette, setPalette] = useState<Palette>(LIGHT);

  useEffect(() => {
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const v = (name: string, fallback: string) =>
        s.getPropertyValue(name).trim() || fallback;
      setPalette({
        gain: v("--aqua-ink", LIGHT.gain),
        loss: v("--loss", LIGHT.loss),
        surface: v("--surface", LIGHT.surface),
        ink: v("--bone", LIGHT.ink),
        line: v("--line", LIGHT.line),
      });
    };
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return palette;
}

/** rgba() from a hex, so the area fill can be the line color at low alpha
    without adding a color library for one operation. */
function alpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

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
 */
export function Trend({
  points,
  className = "",
  interactive = false,
}: {
  points: number[];
  className?: string;
  interactive?: boolean;
}) {
  const palette = usePalette();
  const up = points[points.length - 1] >= points[0];
  const color = up ? palette.gain : palette.loss;

  /* Chart.js autoscales to the data, which for a rating that moves in hundredths
     would amplify noise into cliffs. Pad the domain so the slope stays honest. */
  const min = Math.min(...points);
  const max = Math.max(...points);
  const pad = (max - min || 0.1) * 0.35;

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    /* The sparkline is decorative; the interactive one is the accessible object. */
    events: interactive ? undefined : [],
    layout: { padding: interactive ? 2 : 1 },
    scales: {
      x: { display: false, type: "linear" },
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

  return (
    <div className={className} aria-hidden={!interactive}>
      <Line
        options={options}
        data={{
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
        }}
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
