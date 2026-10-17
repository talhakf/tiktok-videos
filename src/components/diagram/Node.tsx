import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, easeInOut, GLASS, materialize, mono, prog, sans } from "../../theme";

// Diagram building blocks in the Apple style (ByteByteGo-style system diagrams, redone light):
// white cards on the page grey, one blue for "this is the active part", red / green only for wrong / right.
// Nodes are placed by their centre (`x, y`), so rows and columns line up whatever their width.
// Everything here is shared by the other diagram files (Arrow, Badge, GitGraph, ...).

export type Pt = { x: number; y: number };
export type NodeState = "idle" | "active" | "dim" | "error" | "ok";
export type StateCue = { at: number; state: NodeState };
export type NodeShape = "box" | "pill" | "circle";

export const RED = "#FF3B30";
export const GREEN = "#34C759";
export const WIRE = "#86868B"; // default connector grey
export const BLUE_TINT = "#EBF4FF"; // light blue fill for the active thing (solid, never a gradient)
export const CARD_SHADOW = "0 12px 32px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.05)";

/** "#0071E3" + 0.2 → "rgba(0,113,227,0.2)". */
export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Visibility 0→1→0 from `at` (enter) to `until` (exit), or null when the thing should not render. */
export const presence = (frame: number, at: number, until?: number, enter = 10, exit = 8) => {
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, exit) : 0;
  if (out >= 1) return null;
  return prog(frame, at, enter) * (1 - out);
};

const LOOKS: Record<NodeState, { border: string; bg: string; icon: string; opacity: number; err: number }> = {
  idle: { border: "rgba(0,0,0,0.10)", bg: C.white, icon: C.ink, opacity: 1, err: 0 },
  active: { border: C.accent, bg: BLUE_TINT, icon: C.accent, opacity: 1, err: 0 },
  dim: { border: "rgba(0,0,0,0.08)", bg: C.white, icon: C.ink, opacity: 0.35, err: 0 },
  error: { border: RED, bg: "#FFF1F0", icon: RED, opacity: 1, err: 1 },
  ok: { border: GREEN, bg: "#EEFAF1", icon: "#248A3D", opacity: 1, err: 0 },
};

/**
 * The look of a node at `frame`: starts as `initial`, then crossfades (8 frames, easeInOut) to each cue's state.
 * `err` is the weight of the red "problem" ring, `errP` its lock-on progress.
 */
export const stateLook = (frame: number, initial: NodeState = "idle", cues: StateCue[] = [], dur = 8) => {
  let from = initial;
  let to = initial;
  let start: number | null = null;
  for (const c of [...cues].sort((a, b) => a.at - b.at)) {
    if (c.at > frame) break;
    from = to;
    to = c.state;
    start = c.at;
  }
  const p = start === null ? 1 : prog(frame, start, dur, easeInOut);
  const A = LOOKS[from];
  const B = LOOKS[to];
  const mix = (a: string, b: string) => interpolateColors(p, [0, 1], [a, b]);
  return {
    border: mix(A.border, B.border),
    bg: mix(A.bg, B.bg),
    icon: mix(A.icon, B.icon),
    opacity: lerp(A.opacity, B.opacity, p),
    err: lerp(A.err, B.err, p),
    errP: to === "error" ? p : 1,
    state: to,
  };
};

export type NodeBox = { x: number; y: number; w?: number; h?: number; shape?: NodeShape; icon?: IconName; iconPos?: "top" | "left" };

/** Width and height a Node / Database will use (the same defaults the components use). */
export const nodeSize = (n: NodeBox) => {
  if (n.shape === "circle") {
    const d = n.w ?? n.h ?? 150;
    return { w: d, h: d };
  }
  const w = n.w ?? 260;
  const h = n.h ?? (n.shape === "pill" ? 96 : n.icon && n.iconPos !== "left" ? 190 : 120);
  return { w, h };
};

/** Connection points of a node: side centres, centre and corners (corners sit on the curve for circles). */
export const anchors = (n: NodeBox) => {
  const { w, h } = nodeSize(n);
  const { x, y } = n;
  const round = n.shape === "circle" ? 0.707 : n.shape === "pill" ? 0.82 : 0.94;
  const cx = (w / 2) * round;
  const cy = (h / 2) * (n.shape === "circle" ? 0.707 : 0.94);
  return {
    center: { x, y },
    top: { x, y: y - h / 2 },
    bottom: { x, y: y + h / 2 },
    left: { x: x - w / 2, y },
    right: { x: x + w / 2, y },
    tl: { x: x - cx, y: y - cy },
    tr: { x: x + cx, y: y - cy },
    bl: { x: x - cx, y: y + cy },
    br: { x: x + cx, y: y + cy },
  };
};

/** Red ring that locks onto a node in the error state (from slightly larger, like Doodles' Circle). */
const ErrorRing: React.FC<{ weight: number; p: number; radius: number }> = ({ weight, p, radius }) =>
  weight > 0 ? (
    <div
      style={{
        position: "absolute",
        inset: -13,
        borderRadius: radius + 13,
        border: `4px solid ${RED}`,
        opacity: weight,
        scale: String(1.08 - 0.08 * p),
      }}
    />
  ) : null;

/**
 * Diagram box. `x, y` is its centre. Shapes: "box" (radius 24), "pill", "circle" (label sits under the circle).
 * Optional icon on top (default) or left, a sub label (grey, `subMono` for paths and ports), `glass` for frosted.
 * `state` is the starting look, `states` switches it over time: active (blue), dim, error (red ring), ok (green).
 */
export const Node: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  subMono?: boolean;
  icon?: IconName;
  iconPos?: "top" | "left";
  shape?: NodeShape;
  glass?: boolean;
  at: number;
  until?: number;
  state?: NodeState;
  states?: StateCue[];
  size?: number;
}> = (props) => {
  const { x, y, label, sub, subMono, icon, iconPos = "top", shape = "box", glass, at, until, state, states, size = 34 } = props;
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const { w, h } = nodeSize(props);
  const look = stateLook(frame, state, states);
  const radius = shape === "box" ? 24 : Math.min(w, h) / 2;
  const circle = shape === "circle";
  const iconSize = circle ? Math.round(w * 0.42) : iconPos === "left" ? 52 : 60;
  const draw = prog(frame, at + 3, 14);
  const text = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: iconPos === "left" && !circle ? "flex-start" : "center", gap: 4 }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.02em", color: C.ink, lineHeight: 1.1, whiteSpace: "nowrap" }}>
        {label}
      </div>
      {sub ? (
        <div
          style={{
            fontFamily: subMono ? mono : sans,
            fontWeight: 500,
            fontSize: subMono ? size * 0.64 : size * 0.7,
            color: C.mute,
            letterSpacing: subMono ? 0 : "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        ...materialize(vis),
        opacity: vis * look.opacity,
      }}
    >
      <ErrorRing weight={look.err} p={look.errP} radius={radius} />
      <div
        style={{
          ...(glass ? GLASS : { boxShadow: CARD_SHADOW }),
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background: glass && look.state === "idle" ? GLASS.background : look.bg,
          border: `3px solid ${look.border}`,
          display: "flex",
          flexDirection: iconPos === "left" && !circle ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: iconPos === "left" ? 22 : 12,
          padding: "0 24px",
        }}
      >
        {icon ? <Icon name={icon} size={iconSize} color={look.icon} draw={draw} /> : null}
        {circle ? null : text}
      </div>
      {circle ? (
        <div style={{ position: "absolute", top: h + 16, left: "50%", translate: "-50% 0" }}>{text}</div>
      ) : null}
    </div>
  );
};

/** Database cylinder (SVG), placed by its centre like Node, with the same states. Label sits in the body. */
export const Database: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  at: number;
  until?: number;
  state?: NodeState;
  states?: StateCue[];
  size?: number;
}> = ({ x, y, w = 200, h = 220, label, sub, at, until, state, states, size = 32 }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const look = stateLook(frame, state, states);
  const ry = w * 0.13;
  const rx = w / 2;
  const body = `M0 ${ry} V${h - ry} A${rx} ${ry} 0 0 0 ${w} ${h - ry} V${ry}`;
  const band = `M0 ${ry * 2.4} A${rx} ${ry} 0 0 0 ${w} ${ry * 2.4}`;
  const draw = prog(frame, at + 3, 14);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, ...materialize(vis), opacity: vis * look.opacity }}>
      <ErrorRing weight={look.err} p={look.errP} radius={28} />
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ position: "absolute", inset: 0, overflow: "visible", filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.08))" }}
      >
        <path d={`${body} Z`} fill={look.bg} />
        <ellipse cx={rx} cy={ry} rx={rx} ry={ry} fill={look.bg} />
        <g fill="none" stroke={look.border} strokeWidth={3} strokeLinecap="round">
          <path d={body} />
          <ellipse cx={rx} cy={ry} rx={rx} ry={ry} />
          <path d={band} stroke={look.state === "idle" ? "rgba(0,0,0,0.08)" : look.border} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ry * 2.4,
          bottom: ry,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.02em", color: C.ink }}>{label}</div>
        {sub ? <div style={{ fontFamily: mono, fontWeight: 500, fontSize: size * 0.66, color: C.mute }}>{sub}</div> : null}
      </div>
    </div>
  );
};
