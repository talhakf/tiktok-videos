// Shared bits of the motion wrappers (Enter, Swap, Wipe, Move, Shake): where the wrapper sits and which way
// things travel. A wrapper is placed one of three ways:
// - `x, y` given: absolutely at that page point, children flow inside it (a card, a sentence);
// - `inline`: an inline-block inside text or a flex row;
// - neither: a full-canvas layer, so page-positioned children (Terminal, Note, StatBadge) keep their x, y.

export type Dir = "right" | "left" | "below" | "above" | "none";

export type Place = { x?: number; y?: number; inline?: boolean; block?: boolean };

/** Base style of a wrapper for its placement (see the header). `block` = a plain relative div (flex lists). */
export const placeStyle = ({ x, y, inline, block }: Place): React.CSSProperties =>
  x !== undefined || y !== undefined
    ? { position: "absolute", left: x ?? 0, top: y ?? 0 }
    : inline
      ? { display: "inline-block", position: "relative" }
      : block
        ? { position: "relative" }
        : { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 };

/** Where something starts when it comes in `from` a side, `dist` px away (it leaves the opposite way). */
export const dirOffset = (from: Dir, dist: number) => {
  switch (from) {
    case "right":
      return { x: dist, y: 0 };
    case "left":
      return { x: -dist, y: 0 };
    case "below":
      return { x: 0, y: dist };
    case "above":
      return { x: 0, y: -dist };
    default:
      return { x: 0, y: 0 };
  }
};

/**
 * Style of something coming in (`p` 0→1) and going out (`out` 0→1): opacity, `fromScale`→1, blur, and a slide
 * that arrives from `off` and leaves past the other side (60% of the distance), like an iOS push.
 */
export const travel = (p: number, out: number, off: { x: number; y: number }, fromScale = 0.95, blur = 8): React.CSSProperties => {
  const b = (1 - p) * blur + out * blur * 0.75;
  const dx = off.x * (1 - p) - off.x * 0.6 * out;
  const dy = off.y * (1 - p) - off.y * 0.6 * out;
  return {
    opacity: p * (1 - out),
    scale: String(fromScale + (1 - fromScale) * p),
    filter: b > 0.01 ? `blur(${b}px)` : undefined,
    translate: dx || dy ? `${dx}px ${dy}px` : undefined,
  };
};
