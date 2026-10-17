import { useCurrentFrame } from "remotion";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";
import { formatNumber } from "./NumberTicker";

// Horizontal bar chart in the Apple keynote style: label column on the left, bars grow from the left edge
// one after another, the value rides on the end of each bar. Grey bars, the highlighted one in blue.

export type BarRow = { label: string; value: number; display?: string; at?: number; highlight?: boolean };

const BAR_GREY = "#D2D2D7";

/**
 * Bar chart. Rows enter at their own `at`, or `stagger` frames apart from `at`. `log` puts values on a log
 * scale (for "2 weeks" next to "132 years"); `min` sets the log floor (default: smallest value / 10).
 * `display` replaces the formatted number at the bar end.
 */
export const BarCompare: React.FC<{
  rows: BarRow[];
  at: number;
  x: number;
  y: number;
  w?: number;
  until?: number;
  log?: boolean;
  max?: number;
  min?: number;
  labelW?: number;
  valueW?: number; // room kept right of the longest bar for its value
  labelFont?: "mono" | "sans";
  fontSize?: number;
  barH?: number;
  gap?: number;
  stagger?: number;
  dur?: number;
}> = ({
  rows,
  at,
  x,
  y,
  w = 900,
  until,
  log,
  max,
  min,
  labelW = 220,
  valueW = 230,
  labelFont = "sans",
  fontSize = 38,
  barH = 60,
  gap = 30,
  stagger = 5,
  dur = 22,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;

  const hi = max ?? Math.max(...rows.map((r) => r.value));
  const lo = min ?? Math.min(...rows.map((r) => r.value)) / 10;
  const frac = (v: number) => {
    const f = log ? (Math.log10(Math.max(v, lo)) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) : v / hi;
    return Math.max(0, Math.min(1, f));
  };
  const trackW = w - labelW - valueW;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: rows.length * (barH + gap) - gap, opacity: 1 - out }}>
      {rows.map((r, i) => {
        const t = r.at ?? at + i * stagger;
        if (frame < t) return null;
        const lp = prog(frame, t, 9);
        const g = prog(frame, t + 2, dur, easeOut);
        const barW = Math.max(barH * 0.3, frac(r.value) * trackW) * g;
        const vp = prog(frame, t + 6, 10);
        const top = i * (barH + gap);
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top,
                width: labelW - 24,
                height: barH,
                display: "flex",
                alignItems: "center",
                fontFamily: labelFont === "mono" ? mono : sans,
                fontWeight: labelFont === "mono" ? 500 : 600,
                fontSize: labelFont === "mono" ? fontSize * 0.9 : fontSize,
                letterSpacing: labelFont === "mono" ? 0 : "-0.01em",
                color: r.highlight ? C.ink : C.mute,
                whiteSpace: "nowrap",
                transformOrigin: "0% 50%",
                ...materialize(lp, 0.95, 6),
              }}
            >
              {r.label}
            </div>
            <div
              style={{
                position: "absolute",
                left: labelW,
                top,
                width: barW,
                height: barH,
                borderRadius: Math.min(12, barH / 4),
                background: r.highlight ? C.accent : BAR_GREY,
                opacity: lp,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: labelW + barW + 18,
                top,
                height: barH,
                display: "flex",
                alignItems: "center",
                fontFamily: sans,
                fontWeight: 700,
                fontSize,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
                color: r.highlight ? C.accent : C.ink,
                whiteSpace: "nowrap",
                ...materialize(vp, 0.95, 6),
                transformOrigin: "0% 50%",
              }}
            >
              {r.display ?? formatNumber(r.value)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
