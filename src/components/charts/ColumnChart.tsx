import { interpolateColors, useCurrentFrame } from "remotion";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { formatNumber } from "../data/NumberTicker";
import { presence } from "../diagram/Node";
import { AXIS, BAR_GREY } from "./chart";

// Vertical columns growing up from one baseline, one after another, the value counting up on each cap and
// the label underneath. Grey columns, the one the beat is about in blue (from the start, or turning blue
// on a `focus` cue).

export type Column = { label: string; value: number; display?: string; highlight?: boolean; at?: number };

/**
 * Column chart at (x, y), `w` × `h` including labels. Columns enter at their own `at`, or `stagger` frames
 * apart from `at`, and grow over `dur` frames. `max` sets full height (default: the biggest value).
 * `focus` turns column `index` blue at `at` (the others stay grey). Column width is capped at `colW`.
 */
export const ColumnChart: React.FC<{
  columns: Column[];
  at: number;
  x: number;
  y: number;
  w?: number;
  h?: number;
  until?: number;
  max?: number;
  stagger?: number;
  dur?: number;
  colW?: number;
  decimals?: number;
  unit?: string;
  focus?: { index: number; at: number };
  labelFont?: "sans" | "mono";
  fontSize?: number;
}> = ({
  columns,
  at,
  x,
  y,
  w = 900,
  h = 600,
  until,
  max,
  stagger = 4,
  dur = 22,
  colW = 120,
  decimals = 0,
  unit,
  focus,
  labelFont = "sans",
  fontSize = 28,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const hi = max ?? Math.max(...columns.map((c) => c.value));
  const valueH = fontSize * 1.9; // room above the tallest column for its value
  const labelH = fontSize * 2;
  const base = h - labelH;
  const plotH = base - valueH;
  const slot = w / columns.length;
  const cw = Math.min(colW, slot * 0.62);
  const baseP = prog(frame, at, 14);

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: p }}>
      <div style={{ position: "absolute", left: 0, top: base, width: w * baseP, height: 2, background: AXIS }} />
      {columns.map((c, i) => {
        const t = c.at ?? at + 4 + i * stagger;
        if (frame < t) return null;
        const lp = prog(frame, t, 9);
        const g = prog(frame, t, dur, easeOut);
        const colH = Math.max(6, (Math.max(0, c.value) / hi) * plotH) * g;
        const blue = c.highlight ? 1 : focus && focus.index === i ? prog(frame, focus.at, 10, easeInOut) : 0;
        const cx = slot * i + slot / 2;
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: cx - cw / 2,
                top: base - colH,
                width: cw,
                height: colH,
                borderRadius: `${Math.min(14, cw / 5)}px ${Math.min(14, cw / 5)}px 0 0`,
                background: interpolateColors(blue, [0, 1], [BAR_GREY, C.accent]),
                opacity: lp,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: cx,
                top: base - colH - fontSize * 0.5,
                translate: "-50% -100%",
                fontFamily: sans,
                fontWeight: 700,
                fontSize: fontSize * 1.3,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
                lineHeight: 1,
                color: interpolateColors(blue, [0, 1], [C.ink, C.accent]),
                opacity: lp,
              }}
            >
              {g >= 1 && c.display ? c.display : formatNumber(c.value * g, decimals)}
              {unit && !(g >= 1 && c.display) ? <span style={{ fontSize: fontSize * 0.75, fontWeight: 600, color: C.mute }}> {unit}</span> : null}
            </div>
            <div
              style={{
                position: "absolute",
                left: cx,
                top: base + fontSize * 0.55,
                translate: "-50% 0",
                fontFamily: labelFont === "mono" ? mono : sans,
                fontWeight: labelFont === "mono" ? 500 : 600,
                fontSize: labelFont === "mono" ? fontSize * 0.92 : fontSize,
                letterSpacing: labelFont === "mono" ? 0 : "-0.01em",
                whiteSpace: "nowrap",
                lineHeight: 1.1,
                color: blue > 0.5 ? C.ink : C.mute,
                ...materialize(lp, 0.95, 6),
              }}
            >
              {c.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
