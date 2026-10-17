import { useCurrentFrame } from "remotion";
import { C, easeInOut, prog } from "../../theme";
import { lineUpTo } from "./chart";

// Tiny trend line for inside a card, pill or table cell: no axis, no labels, draws on left to right with a
// dot riding its end. Blue by default; pass `color` (grey for "the others", red / green for bad / good).

/**
 * Sparkline `w` × `h`. Without x / y it renders inline (put it in a flex row); with them it is placed on
 * the page. Draws from `at` over `dur` frames; `min` / `max` fix the vertical range (default: the data).
 * `baseline` draws a faint line at `min` (or at 0 when the data crosses it).
 */
export const Sparkline: React.FC<{
  values: number[];
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dur?: number;
  color?: string;
  stroke?: number;
  dot?: boolean;
  min?: number;
  max?: number;
  baseline?: boolean;
  style?: React.CSSProperties;
}> = ({ values, at, until, x, y, w = 200, h = 64, dur = 24, color = C.accent, stroke = 4, dot = true, min, max, baseline, style }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;

  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const r = dot ? stroke * 1.6 : stroke / 2;
  const pad = r + 2; // the dot never clips at the edges
  const xAt = (i: number) => pad + (values.length > 1 ? i / (values.length - 1) : 0) * (w - pad * 2);
  const yAt = (v: number) => h - pad - ((v - lo) / (hi - lo || 1)) * (h - pad * 2);
  const pts = values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const t = prog(frame, at, dur, easeInOut);
  const part = lineUpTo(pts, pad + t * (w - pad * 2));
  const baseY = yAt(lo < 0 && hi > 0 ? 0 : lo);
  const positioned = x !== undefined && y !== undefined;

  return (
    <svg
      width={w}
      height={h}
      style={{
        ...(positioned ? { position: "absolute", left: x, top: y } : { display: "block", flexShrink: 0 }),
        overflow: "visible",
        opacity: prog(frame, at, 6) * (1 - out),
        ...style,
      }}
    >
      {baseline ? <line x1={pad} x2={w - pad} y1={baseY} y2={baseY} stroke="rgba(0,0,0,0.10)" strokeWidth={2} /> : null}
      {part ? <path d={part.d} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
      {part && dot ? <circle cx={part.tip.x} cy={part.tip.y} r={r} fill={color} stroke={C.white} strokeWidth={stroke * 0.6} /> : null}
    </svg>
  );
};
