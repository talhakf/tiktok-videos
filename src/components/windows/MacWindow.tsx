import { useCurrentFrame } from "remotion";
import { C, materialize, prog, sans, SHADOW_WINDOW } from "../../theme";

// Light macOS window chrome, the base for the browser, Finder and dialog mockups.
// The dark Terminal (and the dark EditorWindow) keep their own chrome.

export const LIGHTS = ["#FF5F57", "#FEBC2E", "#28C840"];

/**
 * Visibility of a timed element: null before `at` and after it has left, else 0→1 while entering
 * (`enter` frames) and 1→0 while leaving from `until` (`exit` frames). Both ease out.
 */
export const presence = (frame: number, at: number, until?: number, enter = 9, exit = 7): number | null => {
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, exit) : 0;
  if (out >= 1) return null;
  return prog(frame, at, enter) * (1 - out);
};

/** "#RRGGBB" + alpha → rgba(). Used for tints of the semantic colours. */
export const tint = (hex: string, a: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** The three window buttons (close, minimise, zoom). 78 px wide at the default size. */
export const TrafficLights: React.FC<{ size?: number; gap?: number }> = ({ size = 18, gap = 12 }) => (
  <div style={{ display: "flex", gap, flexShrink: 0 }}>
    {LIGHTS.map((c) => (
      <div key={c} style={{ width: size, height: size, borderRadius: size / 2, background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)" }} />
    ))}
  </div>
);

/** Back / forward chevrons for a unified toolbar (Safari, Finder). */
export const NavChevrons: React.FC<{ color?: string; size?: number }> = ({ color = C.mute, size = 26 }) => (
  <div style={{ display: "flex", gap: size * 0.7, flexShrink: 0 }}>
    {["M15 5l-7 7 7 7", "M9 5l7 7-7 7"].map((d, i) => (
      <svg key={d} width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ opacity: i ? 0.45 : 1 }}>
        <path d={d} stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ))}
  </div>
);

/**
 * Light macOS window: white body, grey title bar with traffic lights and a centred title, rounded 26,
 * soft window shadow. Materializes in at `at`, leaves at `until`. `toolbar` replaces the title with a
 * unified toolbar (anything laid out to the right of the lights). Children fill the body (position: relative).
 */
export const MacWindow: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  at?: number;
  until?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  toolbar?: React.ReactNode;
  barHeight?: number;
  barColor?: string;
  dark?: boolean; // dark title bar (used by the private browser)
  origin?: string; // transform origin of the entrance
}> = ({ x, y, w, h, title, at = 0, until, children, style, bodyStyle, toolbar, barHeight = 64, barColor, dark, origin = "50% 50%" }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 26,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: SHADOW_WINDOW,
        overflow: "hidden",
        transformOrigin: origin,
        ...materialize(p),
        ...style,
      }}
    >
      <div
        style={{
          height: barHeight,
          background: barColor ?? (dark ? "#2B2B2D" : "#F2F2F4"),
          borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 24,
          position: "relative",
        }}
      >
        <TrafficLights />
        {toolbar ?? (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              marginRight: 102,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: "-0.01em",
              color: dark ? "#F5F5F7" : C.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
        )}
      </div>
      <div style={{ position: "relative", height: h - barHeight - 1, overflow: "hidden", ...bodyStyle }}>{children}</div>
    </div>
  );
};
