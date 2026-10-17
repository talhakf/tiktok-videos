import { useId } from "react";
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { alpha, presence, Pt, WIRE } from "./Node";

// Connectors: arrows that draw on, packets that travel along them, and the VPN tunnel band.
// All three share one path builder (`arrowPath`), so a packet rides exactly the line it belongs to.
// Coordinates are page px; every piece renders a full-canvas SVG layer, so stack them in paint order.

export type ArrowKind = "straight" | "elbow" | "curve";
export type ElbowRoute = "hv" | "vh" | "hvh" | "vhv";
export type PathSpec = { from: Pt; to: Pt; kind?: ArrowKind; bend?: number; route?: ElbowRoute; radius?: number };

/** Point at `l` px along path `d` (origin if the path is empty). */
export const pointAt = (d: string, l: number): Pt => getPointAtLength(d, l) ?? { x: 0, y: 0 };

const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);

// Polyline with rounded corners (quadratic, radius clamped to half of each segment).
const rounded = (pts: Pt[], r: number) => {
  const clean = pts.filter((p, i) => i === 0 || dist(p, pts[i - 1]) > 0.5);
  const keep = clean.filter((p, i) => {
    if (i === 0 || i === clean.length - 1) return true;
    const a = clean[i - 1];
    const b = clean[i + 1];
    return Math.abs((p.x - a.x) * (b.y - p.y) - (p.y - a.y) * (b.x - p.x)) > 0.5; // drop collinear points
  });
  let d = `M${keep[0].x} ${keep[0].y}`;
  for (let i = 1; i < keep.length - 1; i++) {
    const [a, p, b] = [keep[i - 1], keep[i], keep[i + 1]];
    const k = Math.min(r, dist(a, p) / 2, dist(p, b) / 2);
    const u1 = { x: (p.x - a.x) / dist(a, p), y: (p.y - a.y) / dist(a, p) };
    const u2 = { x: (b.x - p.x) / dist(p, b), y: (b.y - p.y) / dist(p, b) };
    d += ` L${p.x - u1.x * k} ${p.y - u1.y * k} Q${p.x} ${p.y} ${p.x + u2.x * k} ${p.y + u2.y * k}`;
  }
  const last = keep[keep.length - 1];
  return `${d} L${last.x} ${last.y}`;
};

/**
 * SVG path between two points. "straight"; "elbow" (orthogonal, rounded corners; `route` picks the turns,
 * default hvh when the gap is wider than tall, else vhv); "curve" (cubic, `bend` px to the left of travel).
 */
export const arrowPath = ({ from, to, kind = "straight", bend = 80, route, radius = 28 }: PathSpec) => {
  if (kind === "straight") return `M${from.x} ${from.y} L${to.x} ${to.y}`;
  if (kind === "curve") {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const n = { x: dy / len, y: -dx / len };
    const c1 = { x: from.x + dx * 0.25 + n.x * bend, y: from.y + dy * 0.25 + n.y * bend };
    const c2 = { x: from.x + dx * 0.75 + n.x * bend, y: from.y + dy * 0.75 + n.y * bend };
    return `M${from.x} ${from.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y}`;
  }
  const r = route ?? (Math.abs(to.x - from.x) >= Math.abs(to.y - from.y) ? "hvh" : "vhv");
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const mids: Record<ElbowRoute, Pt[]> = {
    hv: [{ x: to.x, y: from.y }],
    vh: [{ x: from.x, y: to.y }],
    hvh: [
      { x: mx, y: from.y },
      { x: mx, y: to.y },
    ],
    vhv: [
      { x: from.x, y: my },
      { x: to.x, y: my },
    ],
  };
  return rounded([from, ...mids[r], to], radius);
};

/** Stroke-dash props that show only the stretch [a, b] of a path of length `len` (optionally dashed). */
const span = (a: number, b: number, len: number, dash?: [number, number]) => {
  const vis = Math.max(0, b - a);
  if (!dash) return { strokeDasharray: `${vis} ${len * 3}`, strokeDashoffset: -a };
  const parts: number[] = [];
  let acc = 0;
  while (acc < vis) {
    const on = Math.min(dash[0], vis - acc);
    parts.push(on, dash[1]);
    acc += on + dash[1];
  }
  parts[parts.length - 1] = len * 3;
  return { strokeDasharray: parts.join(" "), strokeDashoffset: -a };
};

const Layer: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity }}>
      {children}
    </svg>
  );
};

const Head: React.FC<{ d: string; at: number; flip?: boolean; size: number; color: string; p: number }> = ({ d, at, flip, size, color, p }) => {
  const tip = pointAt(d, at);
  const t = getTangentAtLength(d, at) ?? { x: 1, y: 0 };
  const ang = (Math.atan2(t.y, t.x) * 180) / Math.PI + (flip ? 180 : 0);
  const hw = size * 0.56;
  return (
    <g transform={`translate(${tip.x} ${tip.y}) rotate(${ang}) scale(${0.6 + 0.4 * p})`} opacity={p}>
      <path d={`M0 0 L${-size} ${-hw} L${-size} ${hw} Z`} fill={color} stroke={color} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
};

/** Small white chip centred on a point (arrow labels, tunnel label). */
const Chip: React.FC<{ x: number; y: number; p: number; color: string; mono?: boolean; icon?: IconName; children: React.ReactNode }> = ({
  x,
  y,
  p,
  color,
  mono: useMono,
  icon,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      translate: "-50% -50%",
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: icon ? "7px 16px 7px 12px" : "7px 16px",
      borderRadius: 999,
      background: C.white,
      border: `1.5px solid ${C.line}`,
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      fontFamily: useMono ? mono : sans,
      fontWeight: useMono ? 500 : 600,
      fontSize: useMono ? 22 : 24,
      letterSpacing: useMono ? 0 : "-0.01em",
      color,
      whiteSpace: "nowrap",
      ...materialize(p),
    }}
  >
    {icon ? <Icon name={icon} size={26} color={color} weight={2.2} /> : null}
    {children}
  </div>
);

/**
 * Connector between two points that draws on from `at` over `dur` frames; the arrowhead materializes at the end.
 * `kind`: straight / elbow / curve (see arrowPath). `both`: heads at both ends. `dashed` for optional or
 * encrypted links. `active`: true, or the frame it turns blue. `label`: chip at the midpoint (`labelMono` for code).
 */
export const Arrow: React.FC<
  PathSpec & {
    at: number;
    dur?: number;
    until?: number;
    dashed?: boolean;
    both?: boolean;
    head?: boolean;
    label?: string;
    labelMono?: boolean;
    active?: boolean | number;
    color?: string;
    width?: number;
  }
> = ({ at, dur = 14, until, dashed, both, head = true, label, labelMono, active, color = WIRE, width = 4, ...spec }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until, 1);
  if (vis === null) return null;
  const d = arrowPath(spec);
  const len = getLength(d);
  const draw = prog(frame, at, dur, easeInOut);
  const act = active === true ? 1 : typeof active === "number" ? prog(frame, active, 8) : 0;
  const col = interpolateColors(act, [0, 1], [color, C.accent]);
  const hs = 10 + width * 2.5;
  const trimEnd = head ? hs * 0.7 : 0;
  const trimStart = head && both ? hs * 0.7 : 0;
  const end = trimStart + draw * (len - trimEnd - trimStart);
  const headP = prog(frame, at + dur * 0.8, 7);
  const mid = pointAt(d, len / 2);
  const labelP = prog(frame, at + dur * 0.45, 9);
  return (
    <>
      <Layer opacity={vis}>
        {draw > 0 ? (
          <path
            d={d}
            fill="none"
            stroke={col}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...span(trimStart, end, len, dashed ? [width * 3.5, width * 3] : undefined)}
          />
        ) : null}
        {head && headP > 0 ? <Head d={d} at={len} size={hs} color={col} p={headP} /> : null}
        {head && both && headP > 0 ? <Head d={d} at={0} flip size={hs} color={col} p={headP} /> : null}
      </Layer>
      {label && labelP > 0 ? (
        <Chip x={mid.x} y={mid.y} p={labelP * vis} color={act > 0.5 ? C.accent : C.mute} mono={labelMono}>
          {label}
        </Chip>
      ) : null}
    </>
  );
};

/**
 * Something travelling along a path (use `arrowPath` with the arrow's own spec): a blue dot, or a chip with a
 * `label` (mono, e.g. "GET /") and/or an `icon`. Moves `at`→`at + dur` with easeInOut, fades at both ends.
 * `loop` sends it that many times, one every `every` frames. `trail` leaves a short faint line behind it.
 */
export const Packet: React.FC<{
  path: string;
  at: number;
  dur?: number;
  label?: string;
  icon?: IconName;
  color?: string;
  trail?: boolean | number;
  loop?: number;
  every?: number;
  reverse?: boolean;
}> = ({ path, at, dur = 24, label, icon, color = C.accent, trail, loop = 1, every, reverse }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const gap = every ?? dur + 8;
  const len = getLength(path);
  const runs = Array.from({ length: loop }, (_, i) => at + i * gap).filter((t0) => frame >= t0 && frame <= t0 + dur);
  if (runs.length === 0) return null;
  const trailLen = trail === true ? 120 : typeof trail === "number" ? trail : 0;
  return (
    <>
      {runs.map((t0) => {
        const p = interpolate(frame, [t0, t0 + dur], [0, 1], { easing: easeInOut });
        const s = (reverse ? 1 - p : p) * len;
        const pos = pointAt(path, s);
        const o = Math.min(prog(frame, t0, 4), 1 - prog(frame, t0 + dur - 4, 4));
        const tail = reverse ? [s, Math.min(len, s + trailLen)] : [Math.max(0, s - trailLen), s];
        const chip = label || icon;
        return (
          <div key={t0}>
            {trailLen > 0 ? (
              <Layer opacity={o * 0.3}>
                <path d={path} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" {...span(tail[0], tail[1], len)} />
              </Layer>
            ) : null}
            <div
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                translate: "-50% -50%",
                opacity: o,
                display: "flex",
                alignItems: "center",
                gap: 8,
                ...(chip
                  ? {
                      padding: label ? (icon ? "8px 18px 8px 12px" : "8px 18px") : 10,
                      borderRadius: 999,
                      background: color,
                      border: `3px solid ${C.white}`,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.16)",
                    }
                  : {
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      background: color,
                      border: `4px solid ${C.white}`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                    }),
              }}
            >
              {icon ? <Icon name={icon} size={28} color={C.white} weight={2.2} /> : null}
              {label ? <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 22, color: C.white, whiteSpace: "nowrap" }}>{label}</span> : null}
            </div>
          </div>
        );
      })}
    </>
  );
};

/**
 * VPN tunnel: a wide translucent tube (flat tint + thin outline, no gradient) that draws on along a path,
 * painted behind the arrows and packets it carries. Optional chip with a lock icon and `label`, placed at
 * `chipAt` (0..1 along the path), `chipDy` px above (negative) or below it.
 */
export const Tunnel: React.FC<{
  path: string;
  at: number;
  dur?: number;
  until?: number;
  width?: number;
  color?: string;
  label?: string;
  lock?: boolean;
  chipAt?: number;
  chipDy?: number;
}> = ({ path, at, dur = 18, until, width = 110, color = C.accent, label, lock = true, chipAt = 0.5, chipDy }) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, "");
  const vis = presence(frame, at, until, 1);
  if (vis === null) return null;
  const len = getLength(path);
  const draw = prog(frame, at, dur, easeOut);
  const dash = span(0, draw * len, len);
  const pt = pointAt(path, len * chipAt);
  const chipP = prog(frame, at + dur * Math.max(0.3, chipAt), 9);
  return (
    <>
      <Layer opacity={vis}>
        <mask id={`tube-${id}`} maskUnits="userSpaceOnUse">
          <path d={path} fill="none" stroke="#fff" strokeWidth={width} strokeLinecap="round" {...dash} />
          <path d={path} fill="none" stroke="#000" strokeWidth={width - 6} strokeLinecap="round" {...dash} />
        </mask>
        <path d={path} fill="none" stroke={alpha(color, 0.1)} strokeWidth={width} strokeLinecap="round" {...dash} />
        <rect x={-5000} y={-5000} width={10000} height={10000} fill={alpha(color, 0.45)} mask={`url(#tube-${id})`} />
      </Layer>
      {(label || lock) && chipP > 0 ? (
        <Chip x={pt.x} y={pt.y + (chipDy ?? -(width / 2 + 34))} p={chipP * vis} color={color} icon={lock ? "lock" : undefined}>
          {label}
        </Chip>
      ) : null}
    </>
  );
};
