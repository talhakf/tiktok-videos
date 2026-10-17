import { Children } from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../../theme";
import { Dir, dirOffset, placeStyle, travel } from "./place";

// Give any content an entrance and an exit: `Enter` materializes its children at `at` (opacity, 0.95→1 scale,
// blur, optionally sliding in from a side) and lets them leave at `until` (fade + blur, sliding on past the other side).
// `Stagger` does the same to a list, one child after the other (`gap` frames apart; 1.2 frames = the house 40 ms).

type Motion = {
  at: number;
  until?: number;
  from?: Dir;
  dist?: number; // slide distance, px
  dur?: number; // enter frames
  exit?: number; // exit frames
  scale?: number; // start scale (never 0)
  blur?: number;
  origin?: string; // transform origin ("50% 50%"; page px like "540px 700px" for a full-canvas layer)
};

/**
 * Materializes `children` at `at` and removes them at `until`. Placement: `x, y` = a box at that page point;
 * `inline` = inline-block (inside text or a row); `block` = plain div (flex lists); none = full-canvas layer,
 * so children with their own page x, y stay where they are. `hold` keeps the box's space while hidden.
 */
export const Enter: React.FC<
  Motion & { x?: number; y?: number; inline?: boolean; block?: boolean; hold?: boolean; style?: React.CSSProperties; children: React.ReactNode }
> = ({ at, until, from = "none", dist = 40, dur = 10, exit = 8, scale = 0.95, blur = 8, origin = "50% 50%", x, y, inline, block, hold, style, children }) => {
  const frame = useCurrentFrame();
  const out = until !== undefined ? prog(frame, until, exit) : 0;
  const hidden = frame < at || out >= 1;
  if (hidden && !hold) return null;
  const base = { ...placeStyle({ x, y, inline, block }), transformOrigin: origin, ...style };
  // `hold`: keep the layout space while hidden, so a row or a centred list does not jump as children arrive.
  if (hidden) return <div style={{ ...base, visibility: "hidden" }}>{children}</div>;
  const p = prog(frame, at, dur);
  return <div style={{ ...base, ...travel(p, out, dirOffset(from, dist), scale, blur) }}>{children}</div>;
};

/**
 * Enters each child `gap` frames after the one before (and leaves the same way from `until`). `direction`
 * column / row = a flex list at `x, y` (`space` px between children, `align` cross-axis); layer = every child is
 * page-positioned and keeps its own x, y.
 */
export const Stagger: React.FC<
  Motion & {
    gap?: number;
    x?: number;
    y?: number;
    w?: number;
    direction?: "column" | "row" | "layer";
    space?: number;
    align?: "start" | "center" | "end";
    children: React.ReactNode;
  }
> = ({ gap = 1.2, x, y, w, direction = "column", space = 16, align = "start", children, at, until, ...motion }) => {
  const kids = Children.toArray(children);
  const items = kids.map((c, i) => (
    <Enter key={i} at={at + i * gap} until={until !== undefined ? until + i * gap : undefined} block={direction !== "layer"} hold={direction !== "layer"} {...motion}>
      {c}
    </Enter>
  ));
  if (direction === "layer") return <>{items}</>;
  return (
    <div
      style={{
        ...placeStyle({ x, y, block: x === undefined && y === undefined }),
        width: w,
        display: "flex",
        flexDirection: direction,
        gap: space,
        alignItems: align === "start" ? "flex-start" : align === "end" ? "flex-end" : "center",
      }}
    >
      {items}
    </div>
  );
};
