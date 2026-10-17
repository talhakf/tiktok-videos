import { useCurrentFrame, useVideoConfig } from "remotion";
import { appleSpring, C, easeInOut, prog } from "../../theme";
import { presence } from "./MacWindow";

// The macOS arrow cursor: glides between points and clicks with a small ripple.

/** Filled black arrow with a white outline, tip at (0, 0) of a 24-unit grid. */
const ARROW = "M0 0 L0 17.2 L4.3 13.2 L7.2 19.8 L10 18.6 L7.1 12.1 L12.8 12.1 Z";

/**
 * macOS mouse pointer. `path`: points in page px; the pointer appears at the first point at its `at`,
 * then each later point starts a glide there at its `at` (easeInOut, `dur` frames, default 18).
 * `clicks`: frames of a click (4-frame press, spring back, a blue ring ripples out from the tip).
 * `size` = arrow height in px.
 */
export const Pointer: React.FC<{
  path: { x: number; y: number; at: number; dur?: number }[];
  clicks?: number[];
  until?: number;
  size?: number;
  ripple?: string;
}> = ({ path, clicks = [], until, size = 52, ripple = C.accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = presence(frame, path[0].at, until, 6, 6);
  if (p === null) return null;

  let px = path[0].x;
  let py = path[0].y;
  for (let i = 1; i < path.length; i++) {
    const pt = path[i];
    if (frame < pt.at) break;
    const g = prog(frame, pt.at, pt.dur ?? 18, easeInOut);
    px = path[i - 1].x + (pt.x - path[i - 1].x) * g;
    py = path[i - 1].y + (pt.y - path[i - 1].y) * g;
  }

  // Latest click drives the press; every click within 16 frames draws a ripple.
  const last = clicks.filter((c) => frame >= c).pop();
  const press = last === undefined ? 0 : frame < last + 4 ? prog(frame, last, 4) : 1 - appleSpring(frame - last - 4, fps, { response: 0.25 });
  const k = size / 20;

  return (
    <>
      {clicks
        .filter((c) => frame >= c && frame < c + 18)
        .map((c) => {
          const r = prog(frame, c, 16);
          const rad = 10 + 34 * r;
          return (
            <div
              key={c}
              style={{
                position: "absolute",
                left: px - rad,
                top: py - rad,
                width: rad * 2,
                height: rad * 2,
                borderRadius: rad,
                border: `3px solid ${ripple}`,
                opacity: 0.7 * (1 - r) * p,
              }}
            />
          );
        })}
      <svg
        width={15 * k}
        height={22 * k}
        viewBox="-1.5 -1.5 15 22"
        style={{
          position: "absolute",
          left: px - 1.5 * k,
          top: py - 1.5 * k,
          overflow: "visible",
          opacity: p,
          scale: String(1 - 0.12 * press),
          transformOrigin: `${1.5 * k}px ${1.5 * k}px`,
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.28))",
        }}
      >
        <path d={ARROW} fill="#000" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" paintOrder="stroke" />
      </svg>
    </>
  );
};
