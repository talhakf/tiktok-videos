import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../icons/Icons";
import { appleSpring, C, easeInOut, GLASS, materialize, mono, prog, sans, SHADOW_OBJECT, UNIT } from "../theme";

// Overlay pieces in the Apple style: product-shot stickers, keyboard keys, focus rings,
// frosted-glass callouts and an iMessage-style bubble. Entrances never start from scale 0;
// exits leave along the path they came in on.

/** Cut-out photo shown like a product shot. Lands with a slight spring (it is "thrown in"). */
export const Sticker: React.FC<{
  src: string;
  at: number;
  until?: number;
  x: number;
  y: number;
  w: number;
  rotate?: number;
  flip?: boolean;
  shadow?: boolean; // off when clipped (a clipped shadow shows as a box)
  fadeBottom?: number; // px: softly fade a straight-cut bottom edge
  from?: "pop" | "below" | "right" | "top"; // "below": rises from behind an edge (use with a clip); "right" / "top": slides in from that screen edge
}> = ({ src, at, until, x, y, w, rotate = 0, flip, shadow = true, fadeBottom, from = "pop" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = appleSpring(frame - at, fps, { response: 0.45, damping: 0.8 });
  const out = until !== undefined ? prog(frame, until, UNIT, easeInOut) : 0;
  if (out >= 1) return null;
  const rise = from === "below" ? w * 0.75 : from === "top" ? -(y + w * 1.5) : 60; // "top": from above the frame
  const sc = from === "pop" ? interpolate(s, [0, 1], [0.92, 1]) : 1;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        rotate: `${rotate}deg`,
        scale: `${(flip ? -1 : 1) * sc} ${sc}`,
        translate:
          from === "right" ? `${(1 - s) * w + out * w}px 0px` : `0px ${(1 - s) * rise + out * rise}px`,
        opacity: from === "pop" ? Math.min(1, s * 1.6) * (1 - out) : 1,
        transformOrigin: from === "top" ? "50% 0%" : "50% 100%",
        filter: shadow ? SHADOW_OBJECT : undefined,
        maskImage: fadeBottom ? `linear-gradient(to bottom, black calc(100% - ${fadeBottom}px), transparent)` : undefined,
      }}
    />
  );
};

/** A Magic-Keyboard-style key that materializes in and gets pressed at `press`. */
export const KeyCap: React.FC<{ label: string; at: number; press?: number; x: number; y: number; until?: number }> = ({
  label,
  at,
  press,
  x,
  y,
  until,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const p = prog(frame, at, 8);
  const out = until !== undefined ? prog(frame, until, UNIT) : 0;
  if (out >= 1) return null;
  // press: fast down (4 frames ≈ 130ms), spring back up
  const down = press === undefined || frame < press ? 0 : frame < press + 4 ? prog(frame, press, 4) : 1 - appleSpring(frame - press - 4, fps, { response: 0.3 });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        minWidth: 120,
        height: 120,
        padding: "0 30px",
        borderRadius: 22,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: `0 ${4 - down * 3}px 0 rgba(0,0,0,0.10), 0 ${14 - down * 8}px 28px rgba(0,0,0,0.10)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 50,
        color: C.ink,
        ...materialize(p * (1 - out)),
        translate: `0px ${down * 4}px`,
      }}
    >
      <span style={{ scale: String(1 - down * 0.05) }}>{label}</span>
    </div>
  );
};

/** Focus ring (rounded highlight) around a region, in page coordinates. Locks on from slightly larger. */
export const Circle: React.FC<{ at: number; x: number; y: number; w: number; h: number; until?: number; color?: string }> = ({
  at,
  x,
  y,
  w,
  h,
  until,
  color = C.accent,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = prog(frame, at, 8);
  const out = until !== undefined ? prog(frame, until, 6) : 0;
  if (out >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 16,
        border: `4px solid ${color}`,
        background: `${color}24`,
        opacity: p * (1 - out),
        scale: String(1.08 - 0.08 * p),
      }}
    />
  );
};

/** Frosted-glass callout. Materializes from its anchor side (`origin`). */
export const Note: React.FC<{
  at: number;
  until?: number;
  x: number;
  y: number;
  origin?: string;
  children: React.ReactNode;
  font?: "mono" | "sans";
  size?: number;
  icon?: IconName;
  tint?: string;
}> = ({ at, until, x, y, origin = "left center", children, font = "sans", size = 40, icon, tint = C.accent }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = prog(frame, at, 9);
  const out = until !== undefined ? prog(frame, until, 7) : 0;
  if (out >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        padding: "22px 34px",
        ...GLASS,
        fontFamily: font === "mono" ? mono : sans,
        fontWeight: font === "mono" ? 500 : 600,
        fontSize: size,
        lineHeight: 1.25,
        letterSpacing: font === "mono" ? 0 : "-0.01em",
        color: C.ink,
        whiteSpace: "pre",
        transformOrigin: origin,
        ...materialize(p * (1 - out), 0.94, 10),
      }}
    >
      {icon ? (
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Icon name={icon} size={size * 1.25} color={tint} weight={2.2} draw={prog(frame, at + 2, 14)} />
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

/** Frosted-glass callout with a line icon that draws itself on in sync with the entrance. */
export const IconNote: React.FC<{
  icon: IconName;
  at: number;
  until?: number;
  x?: number;
  y: number;
  origin?: string;
  font?: "mono" | "sans";
  size?: number;
  tint?: string;
  children: React.ReactNode;
}> = ({ icon, at, until, x = 90, y, origin, font, size = 34, tint = C.accent, children }) => (
  <Note at={at} until={until} x={x} y={y} origin={origin} font={font} size={size} icon={icon} tint={tint}>
    {children}
  </Note>
);

/**
 * iMessage-style bubble. Default: the blue one with its tail at the bottom-left (Raccoon asks the viewer).
 * `incoming`: the grey bubble someone else sends (tail bottom-left); `mine`: blue with the tail bottom-right,
 * for a two-person chat. Springs in from the tail.
 */
export const Bubble: React.FC<{ at: number; x: number; y: number; children: React.ReactNode; until?: number; incoming?: boolean; mine?: boolean; size?: number }> = ({
  at,
  x,
  y,
  children,
  until,
  incoming,
  mine,
  size = 52,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = appleSpring(frame - at, fps, { response: 0.4, damping: 0.8 });
  const out = until !== undefined ? prog(frame, until, 7) : 0;
  if (out >= 1) return null;
  const bg = incoming ? "#E9E9EB" : C.accent;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transformOrigin: mine ? "100% 100%" : "0% 100%",
        scale: String(interpolate(s, [0, 1], [0.9, 1])),
        opacity: Math.min(1, s * 1.8) * (1 - out),
      }}
    >
      <div
        style={{
          position: "relative",
          padding: `${size * 0.46}px ${size * 0.73}px`,
          background: bg,
          borderRadius: size * 0.88,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: incoming ? C.ink : C.white,
          whiteSpace: "pre",
        }}
      >
        {children}
        <svg
          width={44}
          height={40}
          viewBox="0 0 44 40"
          style={{ position: "absolute", bottom: -2, ...(mine ? { right: -10, scale: "-1 1" } : { left: -10 }) }}
        >
          <path d="M30 0 C30 18 22 32 0 38 C22 40 38 34 44 22 Z" fill={bg} />
        </svg>
      </div>
    </div>
  );
};

/** Grey macOS-style trash can that rises in at `at`. Lid top sits at y + 19. */
export const TrashCan: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, UNIT * 2);
  if (frame < at) return null;
  return (
    <svg width={187} height={196} viewBox="0 0 220 230" style={{ position: "absolute", left: x, top: y, opacity: p, translate: `0px ${(1 - p) * 30}px`, filter: "drop-shadow(0 16px 20px rgba(0,0,0,0.15))" }}>
      <rect x={30} y={40} width={160} height={180} rx={22} fill="#AEAEB2" />
      {[70, 110, 150].map((lx) => (
        <line key={lx} x1={lx} y1={72} x2={lx} y2={192} stroke="#8E8E93" strokeWidth={6} strokeLinecap="round" />
      ))}
      <rect x={14} y={22} width={192} height={26} rx={13} fill="#C7C7CC" />
    </svg>
  );
};
