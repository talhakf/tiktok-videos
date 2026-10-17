import { useId } from "react";
import { useCurrentFrame } from "remotion";
import { C, easeInOut, H, prog, W } from "../../theme";

// "Look here": the page dims (black at ~35%) except one rounded window, which glides from region to region.
// An SVG mask cuts the hole; no blur, no glow. Optional blue focus ring on the hole's edge.

export type SpotRegion = { x: number; y: number; w: number; h: number; at: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Dims everything except `regions[k]` (page px); glides 14 frames (ease-in-out) to each next region at its `at`. */
export const Spotlight: React.FC<{
  regions: SpotRegion[];
  until?: number;
  dim?: number;
  radius?: number;
  pad?: number; // grow every region by this much on each side
  ring?: boolean;
}> = ({ regions, until, dim = 0.35, radius = 24, pad = 0, ring = false }) => {
  const frame = useCurrentFrame();
  const id = `spot${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  if (!regions.length || frame < regions[0].at) return null;
  const out = until !== undefined ? prog(frame, until, 10) : 0;
  if (out >= 1) return null;
  const p = prog(frame, regions[0].at, 10);
  let { x, y, w, h } = regions[0];
  for (let k = 1; k < regions.length; k++) {
    const t = prog(frame, regions[k].at, 14, easeInOut);
    if (t <= 0) break;
    const r = regions[k];
    x = lerp(x, r.x, t);
    y = lerp(y, r.y, t);
    w = lerp(w, r.w, t);
    h = lerp(h, r.h, t);
  }
  x -= pad;
  y -= pad;
  w += pad * 2;
  h += pad * 2;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <defs>
        <mask id={id}>
          <rect width={W} height={H} fill="#fff" />
          <rect x={x} y={y} width={w} height={h} rx={radius} fill="#000" />
        </mask>
      </defs>
      <rect width={W} height={H} fill="#000" opacity={dim * p * (1 - out)} mask={`url(#${id})`} />
      {ring ? (
        <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} rx={radius + 6} fill="none" stroke={C.accent} strokeWidth={4} opacity={p * (1 - out)} />
      ) : null}
    </svg>
  );
};
