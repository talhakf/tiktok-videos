import { C } from "../../theme";

// Shared chart helpers: the chart greys and blues, nice axis steps, a seeded random source and the
// left-to-right line reveal every line chart uses. Charts follow the house rule: grey for everything,
// system blue for the one thing the beat is about, red / green only for wrong / right.

export type Pt = { x: number; y: number };

/** Bar / column grey (the same as BarCompare) and the faint track under fills. */
export const BAR_GREY = "#D2D2D7";
export const TRACK = "#E5E5EA";
/** Gridlines and the baseline. */
export const GRID = "rgba(0,0,0,0.07)";
export const AXIS = "rgba(0,0,0,0.18)";
/** Non-highlighted series / segments, dark to light. Neighbours stay apart, blue stays the loudest. */
export const GREYS = ["#8E8E93", "#AEAEB2", "#C7C7CC", "#DCDCE0"];
/** Sequential blue (heat grids): empty, then four solid steps of system blue mixed with white. */
export const BLUES = [TRACK, "#BFDBF8", "#80B8F1", "#4094EA", C.accent];

/** Colour of a series / segment: blue when highlighted, else the next grey in order. */
export const seriesColor = (highlight: boolean | undefined, greyIndex: number) =>
  highlight ? C.accent : GREYS[Math.min(greyIndex, GREYS.length - 1)];

/** Round step for about `count` gridlines over `range` (1, 2, 2.5, 5 × 10ⁿ). */
export const niceStep = (range: number, count = 4) => {
  const raw = Math.max(range, 1e-9) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
};

/** Axis from `lo` to `hi` widened to round numbers, with the tick values in between. */
export const niceScale = (lo: number, hi: number, count = 4) => {
  const step = niceStep(hi - lo, count);
  const min = Math.floor(lo / step + 1e-9) * step;
  const max = Math.ceil(hi / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = min; v <= max + step * 1e-6; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return { min, max: max > min ? max : min + step, step, ticks };
};

/** Deterministic random numbers in [0, 1) (mulberry32). Same seed, same chart, every render. */
export const seeded = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * The part of a polyline left of `xEnd` (points sorted by x): its SVG path and the tip point,
 * so a line can draw on left to right with a dot riding its end. Null when nothing is drawn yet.
 */
export const lineUpTo = (pts: Pt[], xEnd: number) => {
  if (pts.length === 0 || xEnd < pts[0].x) return null;
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (b.x <= xEnd) {
      out.push(b);
      continue;
    }
    const f = (xEnd - a.x) / (b.x - a.x);
    out.push({ x: xEnd, y: a.y + (b.y - a.y) * f });
    break;
  }
  return { d: out.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" "), tip: out[out.length - 1] };
};

/** Value of `values` at a fractional index (linear between points, clamped to the ends). */
export const valueAt = (values: number[], fi: number) => {
  const i = Math.max(0, Math.min(values.length - 1, fi));
  const a = Math.floor(i);
  const b = Math.min(values.length - 1, a + 1);
  return values[a] + (values[b] - values[a]) * (i - a);
};

/** Point on a circle, `t` 0→1 clockwise from 12 o'clock. */
export const polar = (cx: number, cy: number, r: number, t: number): Pt => {
  const a = t * Math.PI * 2 - Math.PI / 2;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

/** Clockwise SVG arc on radius `r` from `t0` to `t1` (fractions of a turn). */
export const arcPath = (cx: number, cy: number, r: number, t0: number, t1: number) => {
  const a = polar(cx, cy, r, t0);
  const b = polar(cx, cy, r, t1);
  const large = t1 - t0 > 0.5 ? 1 : 0;
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)} A${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
};
