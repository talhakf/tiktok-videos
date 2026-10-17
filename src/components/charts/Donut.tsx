import { useCurrentFrame } from "remotion";
import { C, easeInOut, easeOut, materialize, prog, sans } from "../../theme";
import { formatNumber } from "../data/NumberTicker";
import { presence } from "../diagram/Node";
import { arcPath, polar, seriesColor } from "./chart";

// Donut chart: the ring sweeps in clockwise from 12 o'clock, segments split by a thin page-grey gap, a big
// number counting up in the middle and a legend with each share. Grey segments, the one that matters in
// blue; it can pull out of the ring on cue.

export type Slice = { label: string; value: number; highlight?: boolean; display?: string };

/**
 * Donut at (x, y) (top-left of the ring), `size` = ring diameter. The sweep starts at `at + 4` and takes
 * `dur` frames. `center` = number in the hole (counts up with the sweep) + a label under it. `pullAt` pulls
 * the highlighted segment out by `pull` px. `legend` sits right of the ring (default), below it, or nowhere;
 * shares are rounded percentages unless a slice has `display`.
 */
export const Donut: React.FC<{
  slices: Slice[];
  at: number;
  x: number;
  y: number;
  size?: number;
  thickness?: number;
  until?: number;
  dur?: number;
  center?: { value?: number; display?: string; label?: string; unit?: string; decimals?: number };
  pullAt?: number;
  pull?: number;
  legend?: "right" | "below" | "none";
  legendW?: number;
  fontSize?: number;
}> = ({ slices, at, x, y, size = 480, thickness, until, dur = 32, center, pullAt, pull = 22, legend = "right", legendW = 380, fontSize = 30 }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const th = thickness ?? size * 0.17;
  const r = size / 2 - th / 2 - pull; // keep room for the pulled segment inside the box
  const cx = size / 2;
  const cy = size / 2;
  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;
  const gapT = 5 / (2 * Math.PI * r); // 5 px page-grey gap between segments
  const sweep = prog(frame, at + 4, dur, easeInOut);
  const pullP = pullAt !== undefined ? prog(frame, pullAt, 14, easeInOut) : 0;

  let grey = 0;
  let acc = 0;
  const segs = slices.map((sl, i) => {
    const t0 = acc / total;
    acc += sl.value;
    const t1 = acc / total;
    return { sl, i, t0, t1, color: seriesColor(sl.highlight, sl.highlight ? 0 : grey++) };
  });

  const cp = prog(frame, at + 4, dur, easeOut);
  const pct = (v: number) => `${Math.round((v / total) * 100)}%`;
  const legendX = legend === "right" ? size + 50 : 0;
  const legendY = legend === "right" ? size / 2 - (slices.length * fontSize * 1.9) / 2 : size + 40;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size, opacity: p }}>
      <svg width={size} height={size} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {segs.map(({ sl, i, t0, t1, color }) => {
          const a = t0 + (slices.length > 1 ? gapT / 2 : 0);
          const b = Math.min(t1 - (slices.length > 1 ? gapT / 2 : 0), sweep);
          if (b <= a) return null;
          const off = sl.highlight ? polar(0, 0, pull * pullP, (t0 + t1) / 2) : { x: 0, y: 0 };
          // A full single ring needs two arcs (one SVG arc cannot close a circle).
          const d = b - a >= 0.999 ? `${arcPath(cx, cy, r, 0, 0.5)} ${arcPath(cx, cy, r, 0.5, 0.9999)}` : arcPath(cx, cy, r, a, b);
          return <path key={i} d={d} stroke={color} strokeWidth={th} fill="none" transform={`translate(${off.x} ${off.y})`} />;
        })}
      </svg>
      {center ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size,
            height: size,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: sans,
            textAlign: "center",
            ...materialize(prog(frame, at + 6, 10), 0.95, 6),
          }}
        >
          <div style={{ fontSize: size * 0.17, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1, color: C.ink, fontVariantNumeric: "tabular-nums" }}>
            {center.display && cp >= 1 ? center.display : formatNumber((center.value ?? total) * cp, center.decimals ?? 0)}
            {center.unit ? <span style={{ fontSize: size * 0.07, fontWeight: 600, color: C.mute, letterSpacing: "-0.01em" }}> {center.unit}</span> : null}
          </div>
          {center.label ? (
            <div style={{ marginTop: size * 0.025, fontSize: Math.max(24, size * 0.055), fontWeight: 600, color: C.mute, letterSpacing: "-0.01em" }}>{center.label}</div>
          ) : null}
        </div>
      ) : null}
      {legend !== "none" ? (
        <div style={{ position: "absolute", left: legendX, top: legendY, width: legendW }}>
          {segs.map(({ sl, i, color }) => {
            const lp = prog(frame, at + 10 + i * 4, 10);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: fontSize * 1.9,
                  fontFamily: sans,
                  fontSize,
                  letterSpacing: "-0.01em",
                  transformOrigin: "0% 50%",
                  ...materialize(lp, 0.95, 6),
                }}
              >
                <div style={{ width: fontSize * 0.8, height: fontSize * 0.8, borderRadius: fontSize * 0.22, background: color, flexShrink: 0, marginRight: fontSize * 0.55 }} />
                <div style={{ flex: 1, fontWeight: 600, color: sl.highlight ? C.ink : C.mute, whiteSpace: "nowrap" }}>{sl.label}</div>
                <div style={{ fontWeight: 700, color: sl.highlight ? C.accent : C.ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {sl.display ?? pct(sl.value)}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
