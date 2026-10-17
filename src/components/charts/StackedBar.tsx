import { useCurrentFrame } from "remotion";
import { C, easeInOut, materialize, prog, sans } from "../../theme";
import { formatNumber } from "../data/NumberTicker";
import { presence } from "../diagram/Node";
import { seriesColor } from "./chart";

// One 100% bar split into labelled parts ("where your disk went"): the bar fills left to right, parts
// separated by a thin page-grey gap, shares written inside the parts that are wide enough, and a legend
// underneath with each part's value. Grey parts, the one the beat is about in blue.

export type Part = { label: string; value: number; highlight?: boolean; display?: string };

/**
 * Stacked bar at (x, y), `w` wide, bar `h` tall. The fill sweeps from `at + 4` over `dur` frames.
 * `title` / `total` sit above the bar (left / right). Legend rows show `display` or the value + `unit`.
 * `legend` false hides it (the shares inside the bar then carry the story).
 */
export const StackedBar: React.FC<{
  parts: Part[];
  at: number;
  x: number;
  y: number;
  w?: number;
  h?: number;
  until?: number;
  dur?: number;
  title?: string;
  total?: string;
  unit?: string;
  decimals?: number;
  legend?: boolean;
  fontSize?: number;
}> = ({ parts, at, x, y, w = 900, h = 96, until, dur = 30, title, total, unit, decimals = 0, legend = true, fontSize = 30 }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const sum = parts.reduce((s, pt) => s + pt.value, 0) || 1;
  const gapPx = 5;
  const usable = w - gapPx * (parts.length - 1);
  const sweep = prog(frame, at + 4, dur, easeInOut) * w;
  const headH = title || total ? fontSize * 2 : 0;
  const r = Math.min(18, h / 3);

  let grey = 0;
  let acc = 0;
  const segs = parts.map((pt, i) => {
    const sw = (pt.value / sum) * usable;
    const left = acc;
    acc += sw + gapPx;
    return { pt, i, left, sw, color: seriesColor(pt.highlight, pt.highlight ? 0 : grey++) };
  });
  const head: React.CSSProperties = { position: "absolute", top: 0, fontFamily: sans, fontSize, letterSpacing: "-0.02em", whiteSpace: "nowrap", opacity: prog(frame, at, 10) };

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: p }}>
      {title ? <div style={{ ...head, left: 0, fontWeight: 700, color: C.ink }}>{title}</div> : null}
      {total ? <div style={{ ...head, right: 0, fontWeight: 600, color: C.mute, fontVariantNumeric: "tabular-nums" }}>{total}</div> : null}
      <div style={{ position: "absolute", left: 0, top: headH, width: w, height: h }}>
        {segs.map(({ pt, i, left, sw, color }) => {
          const vis = Math.max(0, Math.min(sw, sweep - left));
          if (vis <= 0) return null;
          const first = i === 0;
          const last = i === parts.length - 1;
          const share = Math.round((pt.value / sum) * 100);
          const fits = sw >= fontSize * 3.4;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left,
                top: 0,
                width: vis,
                height: h,
                background: color,
                borderRadius: `${first ? r : 4}px ${last && vis >= sw ? r : 4}px ${last && vis >= sw ? r : 4}px ${first ? r : 4}px`,
                overflow: "hidden",
              }}
            >
              {fits ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: sw,
                    height: h,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                    color: pt.highlight ? C.white : C.ink,
                    opacity: prog(frame, at + 4 + dur * ((left + sw * 0.6) / w), 8),
                  }}
                >
                  {share}%
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {legend ? (
        <div style={{ position: "absolute", left: 0, top: headH + h + fontSize * 1.1, width: w }}>
          {segs.map(({ pt, i, color }) => {
            const lp = prog(frame, at + 8 + i * 4, 10);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: fontSize * 1.85,
                  fontFamily: sans,
                  fontSize,
                  letterSpacing: "-0.01em",
                  transformOrigin: "0% 50%",
                  ...materialize(lp, 0.95, 6),
                }}
              >
                <div style={{ width: fontSize * 0.8, height: fontSize * 0.8, borderRadius: fontSize * 0.22, background: color, flexShrink: 0, marginRight: fontSize * 0.55 }} />
                <div style={{ flex: 1, fontWeight: 600, color: pt.highlight ? C.ink : C.mute, whiteSpace: "nowrap" }}>{pt.label}</div>
                <div style={{ fontWeight: 700, color: pt.highlight ? C.accent : C.ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {pt.display ?? formatNumber(pt.value, decimals)}
                  {unit && !pt.display ? <span style={{ fontWeight: 600, color: C.mute }}> {unit}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
