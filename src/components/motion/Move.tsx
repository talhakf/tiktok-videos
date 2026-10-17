import { useCurrentFrame } from "remotion";
import { easeInOut, prog } from "../../theme";
import { placeStyle } from "./place";

// The shared-element glide and the "nope" shake. `Move` lets something that is already on screen travel
// (ease-in-out) to new offsets / scales on cue instead of cutting: the terminal slides up to make room, a chip
// moves into a slot. `Shake` is the iOS wrong-password shake: a short damped side-to-side, once per cue.

export type MoveKey = { at: number; x?: number; y?: number; scale?: number; dur?: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Offset and scale at `frame`: starts at 0, 0, 1 and glides to each key in turn (a key keeps values it leaves out). */
export const moveAt = (frame: number, keys: MoveKey[], dur = 14) => {
  let m = { x: 0, y: 0, scale: 1 };
  for (const k of [...keys].sort((a, b) => a.at - b.at)) {
    if (frame < k.at) break;
    const t = prog(frame, k.at, k.dur ?? dur, easeInOut);
    m = { x: lerp(m.x, k.x ?? m.x, t), y: lerp(m.y, k.y ?? m.y, t), scale: lerp(m.scale, k.scale ?? m.scale, t) };
  }
  return m;
};

/**
 * Moves its children by `keys: {at, x, y, scale, dur}[]` (px offsets from where they are laid out, not page
 * positions). Full-canvas layer by default (page-positioned children; set `origin` to the thing's centre in page
 * px, e.g. "540px 700px", for scale keys); `x, y` or `inline` place it like `Enter`.
 */
export const Move: React.FC<{
  keys: MoveKey[];
  dur?: number;
  origin?: string;
  x?: number;
  y?: number;
  inline?: boolean;
  children: React.ReactNode;
}> = ({ keys, dur = 14, origin = "50% 50%", x, y, inline, children }) => {
  const frame = useCurrentFrame();
  const m = moveAt(frame, keys, dur);
  const still = m.x === 0 && m.y === 0 && m.scale === 1;
  return (
    <div
      style={{
        ...placeStyle({ x, y, inline }),
        transformOrigin: origin,
        translate: still ? undefined : `${m.x}px ${m.y}px`,
        scale: still ? undefined : String(m.scale),
      }}
    >
      {children}
    </div>
  );
};

/** Side offset of a shake started at each frame in `at`: `amp` px, 3 swings, damped out over `dur` frames. */
export const shakeX = (frame: number, at: number | number[], amp = 18, dur = 14) => {
  const starts = (Array.isArray(at) ? at : [at]).filter((a) => frame >= a && frame < a + dur);
  if (!starts.length) return 0;
  const t = (frame - Math.max(...starts)) / dur;
  return amp * Math.sin(t * Math.PI * 6) * (1 - t) * (1 - t);
};

/** Shakes its children once at each frame in `at` (wrong password, refused command). Placement like `Move`. */
export const Shake: React.FC<{
  at: number | number[];
  amp?: number;
  dur?: number;
  x?: number;
  y?: number;
  inline?: boolean;
  children: React.ReactNode;
}> = ({ at, amp = 18, dur = 14, x, y, inline, children }) => {
  const frame = useCurrentFrame();
  const dx = shakeX(frame, at, amp, dur);
  return <div style={{ ...placeStyle({ x, y, inline }), translate: dx ? `${dx}px 0px` : undefined }}>{children}</div>;
};
