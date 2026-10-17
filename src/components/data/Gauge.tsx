import { useCurrentFrame } from "remotion";
import { presence } from "../diagram/Node";
import { formatNumber } from "./NumberTicker";
import { C, easeInOut, materialize, prog, sans } from "../../theme";

// A half-circle dial (speed test, CPU load, password strength): a grey track, a blue arc and needle that
// glide to each value on cue, the number counting along in the middle, unit and label underneath.

export type GaugeKey = { at: number; value: number; color?: string };

const polar = (cx: number, cy: number, r: number, t: number) => {
  const a = Math.PI * (1 - t); // t 0 = left, 1 = right
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
};
const arc = (cx: number, cy: number, r: number, t0: number, t1: number) => {
  const a = polar(cx, cy, r, t0);
  const b = polar(cx, cy, r, t1);
  return `M${a.x} ${a.y} A${r} ${r} 0 0 1 ${b.x} ${b.y}`;
};

/** Value at `frame`: starts at `from`, glides (easeInOut, `dur` frames) to each key in turn. */
const gaugeValue = (frame: number, keys: GaugeKey[], from: number, dur: number) => {
  let v = from;
  let color: string | undefined;
  for (const k of [...keys].sort((a, b) => a.at - b.at)) {
    if (frame < k.at) break;
    v = v + (k.value - v) * prog(frame, k.at, dur, easeInOut);
    color = k.color ?? color;
  }
  return { v, color };
};

/**
 * Dial at (x, y) (top-left of its box), `size` = width. `max` = full scale, `ticks` = labelled steps.
 * `decimals` for the number, `unit` under it ("Mbps"), `label` under that ("download").
 */
export const Gauge: React.FC<{
  x: number;
  y: number;
  size?: number;
  at: number;
  until?: number;
  keys: GaugeKey[];
  max: number;
  from?: number;
  dur?: number;
  ticks?: number[];
  unit?: string;
  label?: string;
  decimals?: number;
  color?: string;
}> = ({ x, y, size = 640, at, until, keys, max, from = 0, dur = 26, ticks, unit, label, decimals = 0, color = C.accent }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const stroke = size * 0.07;
  const r = size / 2 - stroke;
  const cx = size / 2;
  const cy = size / 2;
  const { v, color: keyColor } = gaugeValue(frame, keys, from, dur);
  const t = Math.max(0, Math.min(1, v / max));
  const tip = polar(cx, cy, r - stroke * 1.3, t);
  const col = keyColor ?? color;
  const track = prog(frame, at, 14);

  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size * 0.5 + size * 0.36, ...materialize(p) }}>
      <svg width={size} height={size * 0.55} viewBox={`0 0 ${size} ${size * 0.55}`} style={{ overflow: "visible" }}>
        <path d={arc(cx, cy, r, 0, 1)} stroke="#E5E5EA" strokeWidth={stroke} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - track} />
        {t > 0.002 ? <path d={arc(cx, cy, r, 0, t)} stroke={col} strokeWidth={stroke} strokeLinecap="round" fill="none" /> : null}
        {(ticks ?? []).map((tk) => {
          const tt = tk / max;
          const a = polar(cx, cy, r - stroke * 1.0, tt);
          const b = polar(cx, cy, r - stroke * 1.5, tt);
          const lp = polar(cx, cy, r - stroke * 2.4, tt);
          return (
            <g key={tk} opacity={track}>
              <path d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke="#AEAEB2" strokeWidth={3} strokeLinecap="round" />
              <text x={lp.x} y={lp.y + size * 0.012} textAnchor="middle" dominantBaseline="middle" fontFamily={sans} fontWeight={600} fontSize={size * 0.04} fill={C.mute}>
                {tk}
              </text>
            </g>
          );
        })}
        <path d={`M${cx} ${cy} L${tip.x} ${tip.y}`} stroke={C.ink} strokeWidth={size * 0.014} strokeLinecap="round" opacity={track} />
        <circle cx={cx} cy={cy} r={size * 0.028} fill={C.ink} opacity={track} />
      </svg>
      <div style={{ position: "absolute", left: 0, top: size * 0.56, width: size, textAlign: "center", fontFamily: sans, letterSpacing: "-0.03em" }}>
        <div style={{ fontWeight: 700, fontSize: size * 0.16, color: C.ink, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
          {formatNumber(v, decimals)}
          {unit ? <span style={{ fontSize: size * 0.06, fontWeight: 600, color: C.mute, letterSpacing: "-0.01em" }}> {unit}</span> : null}
        </div>
        {label ? <div style={{ marginTop: size * 0.02, fontWeight: 600, fontSize: size * 0.05, color: C.mute, letterSpacing: "-0.01em" }}>{label}</div> : null}
      </div>
    </div>
  );
};
