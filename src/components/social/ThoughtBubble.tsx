import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { appleSpring, C, GLASS, prog, sans } from "../../theme";
import { outP } from "../layouts/Mark";

// The raccoon's thought: a soft rounded bubble with three small circles trailing toward the thinker
// (`tx, ty`, e.g. just above the raccoon's head). Clean Apple style: frosted glass or a solid iOS grey, no
// cartoon cloud. The dots appear from the thinker outward (3 frames apart), then the bubble grows out of them.
// Text breaks only at "\n" so the bubble's size is known without measuring.

/**
 * Thought bubble at `x, y` (top-left), `w` wide; its height follows the line count. `tone` "glass" (over
 * busy backgrounds) or "grey" (on the plain page). The trail starts at the bubble edge nearest the thinker.
 */
export const ThoughtBubble: React.FC<{
  at: number;
  until?: number;
  x: number;
  y: number;
  tx: number; // thinker point (the trail ends here)
  ty: number;
  text: string;
  w?: number;
  size?: number;
  tone?: "glass" | "grey";
  align?: "left" | "center";
}> = ({ at, until, x, y, tx, ty, text, w = 560, size = 42, tone = "glass", align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const lines = text.split("\n").length;
  const padY = size * 0.7;
  const h = Math.round(lines * size * 1.22 + padY * 2);
  const r = Math.min(h / 2, 64);
  const look: React.CSSProperties = tone === "glass" ? { ...GLASS, borderRadius: r } : { background: "#E9E9EB", borderRadius: r };

  // trail: from the thinker toward the nearest point on the bubble's edge
  const ex = Math.max(x + r, Math.min(x + w - r, tx));
  const ey = ty > y + h / 2 ? y + h : y;
  const dist = Math.hypot(ex - tx, ey - ty);
  const DOTS = [12, 19, 28]; // radii, thinker → bubble
  // spread evenly: equal gaps between the thinker, each dot and the bubble edge
  const gap = Math.max(6, (dist - 2 * DOTS.reduce((a, b) => a + b, 0)) / DOTS.length);
  let along = 0;
  const dots = DOTS.map((rad, i) => {
    along += (i === 0 ? 0 : DOTS[i - 1] + gap) + rad;
    const f = dist > 0 ? along / dist : 0;
    return { cx: tx + (ex - tx) * f, cy: ty + (ey - ty) * f, rad, p: prog(frame, at + i * 3, 8) };
  });

  const s = appleSpring(frame - (at + 6), fps, { response: 0.4, damping: 0.8 });
  const bp = frame < at + 6 ? 0 : s;
  const ox = ((Math.max(x, Math.min(x + w, tx)) - x) / w) * 100;
  const oy = ty > y + h / 2 ? 100 : 0;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: 1 - out }}>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.cx - d.rad,
            top: d.cy - d.rad,
            width: d.rad * 2,
            height: d.rad * 2,
            ...look,
            borderRadius: d.rad,
            boxShadow: tone === "glass" ? "0 8px 18px rgba(0,0,0,0.12)" : undefined,
            opacity: d.p,
            scale: String(0.7 + 0.3 * d.p),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          boxSizing: "border-box",
          padding: `${padY}px ${size * 0.9}px`,
          ...look,
          display: "flex",
          alignItems: "center",
          justifyContent: align === "center" ? "center" : "flex-start",
          textAlign: align,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.22,
          letterSpacing: "-0.02em",
          color: C.ink,
          whiteSpace: "pre",
          transformOrigin: `${ox}% ${oy}%`,
          scale: String(interpolate(bp, [0, 1], [0.88, 1])),
          opacity: Math.min(1, bp * 1.8),
          filter: bp < 1 ? `blur(${Math.max(0, 1 - bp) * 8}px)` : undefined,
        }}
      >
        {text}
      </div>
    </div>
  );
};
