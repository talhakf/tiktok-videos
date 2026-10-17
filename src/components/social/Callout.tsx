import { useCurrentFrame } from "remotion";
import { C, GLASS, H, materialize, mono, prog, sans, W } from "../../theme";
import { presence } from "../diagram/Node";

// A label with a leader line pointing at one spot of a screenshot, terminal or diagram: the target dot lands
// first (the eye goes there), the line draws from the target to the label, then the frosted label materializes.
// Unlike `Note` (no line) and `Annotate` (brackets under text). The line is a full-canvas SVG layer,
// so render the Callout after the thing it points at.

export type CalloutSide = "left" | "right" | "top" | "bottom";

/**
 * Callout from the label anchor (`x, y`) to the target (`x2, y2`), both in page px.
 * The label sits on `side` of its anchor (default: away from the target), so no measuring is needed.
 * `kind` "elbow" turns once (`route` "hv" = horizontal from the label first, "vh" = vertical first).
 */
export const Callout: React.FC<{
  at: number;
  until?: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  text: string;
  kind?: "straight" | "elbow";
  route?: "hv" | "vh";
  side?: CalloutSide;
  font?: "sans" | "mono";
  size?: number;
  color?: string; // line + dot
}> = ({ at, until, x, y, x2, y2, text, kind = "straight", route = "hv", side, font = "sans", size = 36, color = C.accent }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until, 8, 8);
  if (vis === null) return null;
  const dot = prog(frame, at, 8);
  const draw = prog(frame, at + 4, 12);
  const label = prog(frame, at + 10, 9);

  // path from the target back to the label anchor
  const d =
    kind === "straight"
      ? `M ${x2} ${y2} L ${x} ${y}`
      : route === "hv"
        ? `M ${x2} ${y2} L ${x2} ${y} L ${x} ${y}` // label leaves horizontally, then turns down/up to the target
        : `M ${x2} ${y2} L ${x} ${y2} L ${x} ${y}`;

  // label side: away from the direction the line leaves the label
  const dx = (kind === "elbow" && route === "vh" ? 0 : x2 - x) || 0;
  const dy = (kind === "elbow" && route === "hv" ? 0 : y2 - y) || 0;
  const auto: CalloutSide = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "left" : "right") : dy > 0 ? "top" : "bottom";
  const s = side ?? auto;
  const GAP = 6;
  const place: Record<CalloutSide, { translate: string; origin: string }> = {
    left: { translate: `calc(-100% - ${GAP}px) -50%`, origin: "100% 50%" },
    right: { translate: `${GAP}px -50%`, origin: "0% 50%" },
    top: { translate: `-50% calc(-100% - ${GAP}px)`, origin: "50% 100%" },
    bottom: { translate: `-50% ${GAP}px`, origin: "50% 0%" },
  };

  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none", opacity: vis }}>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          opacity={draw > 0 ? 1 : 0}
        />
        <circle cx={x2} cy={y2} r={22 - 6 * dot} fill={color} opacity={0.18 * dot} />
        <circle cx={x2} cy={y2} r={9 + (1 - dot) * 4} fill={color} stroke={C.white} strokeWidth={4} opacity={dot} />
      </svg>
      {label > 0 ? (
        <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              translate: place[s].translate,
              transformOrigin: place[s].origin,
              padding: "16px 28px",
              ...GLASS,
              borderRadius: 24,
              fontFamily: font === "mono" ? mono : sans,
              fontWeight: font === "mono" ? 500 : 600,
              fontSize: size,
              lineHeight: 1.2,
              letterSpacing: font === "mono" ? 0 : "-0.015em",
              color: C.ink,
              whiteSpace: "pre",
              ...materialize(label * vis, 0.94, 10),
            }}
          >
            {text}
          </div>
        </div>
      ) : null}
    </>
  );
};
