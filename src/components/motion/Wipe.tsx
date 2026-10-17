import { useCurrentFrame } from "remotion";
import { prog } from "../../theme";
import { placeStyle } from "./place";

// Reveal anything with a clean mask edge: left → right, top → bottom (and the reverse), or a circle growing from a
// point (an icon, a button). It leaves the same way it came: the edge keeps moving and hides it again.
// Hard edge, no feather, no glow. The mask bleeds `bleed` px past the box so window shadows are not cut,
// and it is dropped once the reveal is done.

export type WipeKind = "left" | "right" | "top" | "bottom" | "circle";

/** A moving inset edge: t 0 = the edge at its own side (bled out), 1 = across the whole box. */
const edge = (t: number, bleed: number) => `calc(${t} * (100% + ${bleed * 2}px) - ${bleed}px)`;

/** CSS clip-path for a wipe that is `p` revealed and `q` wiped away again. */
export const wipeClip = (kind: WipeKind, p: number, q: number, at: { x: string; y: string }, bleed = 60) => {
  if (kind === "circle") return `circle(${Math.max(0, p - q) * 150}% at ${at.x} ${at.y})`;
  const b = `-${bleed}px`;
  const hide = edge(1 - p, bleed); // the side the reveal moves towards
  const gone = edge(q, bleed); // the side it leaves from
  // inset(top right bottom left)
  if (kind === "left") return `inset(${b} ${hide} ${b} ${gone})`;
  if (kind === "right") return `inset(${b} ${gone} ${b} ${hide})`;
  if (kind === "top") return `inset(${gone} ${b} ${hide} ${b})`;
  return `inset(${hide} ${b} ${gone} ${b})`;
};

/**
 * Reveals `children` with a wipe from `at` over `dur` frames (`kind` left = starts at the left edge; circle grows
 * from `cx, cy`, px or %, relative to the box / page) and wipes them away from `until`. Placement like `Enter`:
 * `x, y` = box at that point, `inline`, or none = full-canvas layer for page-positioned children.
 */
export const Wipe: React.FC<{
  at: number;
  dur?: number;
  until?: number;
  outDur?: number;
  kind?: WipeKind;
  cx?: number | string;
  cy?: number | string;
  bleed?: number;
  x?: number;
  y?: number;
  inline?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, dur = 18, until, outDur, kind = "left", cx = "50%", cy = "50%", bleed = 60, x, y, inline, style, children }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const q = until !== undefined ? prog(frame, until, outDur ?? Math.round(dur * 0.8)) : 0;
  if (q >= 1) return null;
  const p = prog(frame, at, dur);
  const px = (v: number | string) => (typeof v === "number" ? `${v}px` : v);
  const clip = p >= 1 && q <= 0 ? undefined : wipeClip(kind, p, q, { x: px(cx), y: px(cy) }, bleed);
  return <div style={{ ...placeStyle({ x, y, inline }), ...style, clipPath: clip }}>{children}</div>;
};
