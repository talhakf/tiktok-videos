import { useCurrentFrame } from "remotion";
import { prog } from "../../theme";
import { dirOffset, placeStyle, travel } from "./place";

// One thing at a time in the same place: each item replaces the one before at its frame. The outgoing one
// blurs and fades out (sliding away), the incoming one materializes a couple of frames later, so a blur bridges
// the swap. The next item enters from the right by default (the design rule for "next"), or from below, or in place.

export type SwapItem = { at: number; node: React.ReactNode };

/**
 * Shows `items[k].node` from `items[k].at` until the next item (or `until`). With `x, y` the items stack at that
 * point (`w` wide, `align` start / center / end); without, each item is a full-canvas layer for page-positioned
 * children. `dist` = slide distance, `enter` / `exit` = frames, `origin` = scale origin.
 */
export const Swap: React.FC<{
  items: SwapItem[];
  until?: number;
  from?: "right" | "below" | "none";
  dist?: number;
  enter?: number;
  exit?: number;
  x?: number;
  y?: number;
  w?: number;
  align?: "start" | "center" | "end";
  origin?: string;
}> = ({ items, until, from = "right", dist = 70, enter = 11, exit = 8, x, y, w, align = "start", origin = "50% 50%" }) => {
  const frame = useCurrentFrame();
  const list = [...items].sort((a, b) => a.at - b.at);
  const off = dirOffset(from, dist);
  const positioned = x !== undefined || y !== undefined;
  const shown = list.map((it, i) => {
    if (frame < it.at) return null;
    const next = i + 1 < list.length ? list[i + 1].at : until;
    const out = next !== undefined ? prog(frame, next, exit) : 0;
    if (out >= 1) return null;
    const p = prog(frame, it.at + (i > 0 ? 2 : 0), enter);
    const look = travel(p, out, off, from === "none" ? 0.96 : 0.97);
    return (
      <div
        key={i}
        style={
          positioned
            ? { gridArea: "1 / 1", justifySelf: align, transformOrigin: origin, ...look }
            : { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, transformOrigin: origin, ...look }
        }
      >
        {it.node}
      </div>
    );
  });
  if (shown.every((s) => s === null)) return null;
  return positioned ? <div style={{ ...placeStyle({ x, y }), width: w, display: "grid" }}>{shown}</div> : <>{shown}</>;
};
