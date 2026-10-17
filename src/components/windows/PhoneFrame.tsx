import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { appleSpring, C, materialize, prog, sans, SHADOW_WINDOW } from "../../theme";
import { presence } from "./MacWindow";

// A generic modern phone (no brand) and an iOS-style notification banner.

const StatusGlyphs: React.FC<{ s: number; color: string }> = ({ s, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7 * s }}>
    <svg width={20 * s} height={13 * s} viewBox="0 0 20 13">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 5.3} y={9 - i * 3} width={3.6} height={4 + i * 3} rx={1} fill={color} />
      ))}
    </svg>
    <svg width={19 * s} height={14 * s} viewBox="0 0 19 14">
      <path d="M9.5 13.2 L6.6 10.1 a4.2 4.2 0 0 1 5.8 0 Z" fill={color} />
      <path d="M4.4 7.9 a7.4 7.4 0 0 1 10.2 0" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M1.6 4.9 a11.4 11.4 0 0 1 15.8 0" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </svg>
    <svg width={29 * s} height={14 * s} viewBox="0 0 29 14">
      <rect x={0.75} y={0.75} width={24} height={12.5} rx={3.8} stroke={color} strokeOpacity={0.4} strokeWidth={1.5} fill="none" />
      <rect x={2.6} y={2.6} width={18} height={8.8} rx={2.2} fill={color} />
      <path d="M26.6 5 v4 a2 2 0 0 0 0-4z" fill={color} fillOpacity={0.45} />
    </svg>
  </div>
);

/**
 * Phone mockup (no brand): thin dark bezel, rounded 64 corners (at 420 wide), pill camera cutout,
 * status bar with "9:41", signal, wifi and battery, home indicator. Children are laid out inside the
 * screen (absolute positions are screen-relative; the status bar is 54 px tall at the default width).
 * `dark` = light status bar text for a dark screen. Everything scales with `w`.
 */
export const PhoneFrame: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  children?: React.ReactNode;
  screen?: string;
  dark?: boolean;
  time?: string;
  style?: React.CSSProperties;
}> = ({ x, y, w = 420, h, at = 0, until, children, screen, dark, time = "9:41", style }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;
  const s = w / 420;
  const ph = h ?? w * 2.08;
  const bezel = 11 * s;
  const fg = dark ? "#FFFFFF" : C.ink;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: ph,
        borderRadius: 64 * s,
        background: "#1D1D1F",
        padding: bezel,
        boxShadow: `0 0 0 ${3 * s}px #D1D1D6, ${SHADOW_WINDOW}`,
        ...materialize(p),
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 64 * s - bezel,
          background: screen ?? (dark ? "#000000" : C.white),
          overflow: "hidden",
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 54 * s,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${4 * s}px ${34 * s}px 0 ${42 * s}px`,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 19 * s,
            color: fg,
            pointerEvents: "none",
          }}
        >
          <span>{time}</span>
          <StatusGlyphs s={s} color={fg} />
        </div>
        <div style={{ position: "absolute", left: "50%", top: 12 * s, width: 112 * s, height: 33 * s, marginLeft: -56 * s, borderRadius: 17 * s, background: "#000" }} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 9 * s,
            width: 136 * s,
            height: 5 * s,
            marginLeft: -68 * s,
            borderRadius: 3 * s,
            background: fg,
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
};

/**
 * iOS-style notification banner: glass card with an app tile (an Icons glyph on `tint`), app name and
 * "now", a bold title and a body line. Slides down from above its container's top edge at `at`
 * (critically damped spring) and back up at `until`. Fonts scale with `w` (380 fits the default phone;
 * place it at x 10, y 58 inside a PhoneFrame).
 */
export const NotificationBanner: React.FC<{
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  app: string;
  title: string;
  body?: string;
  icon?: IconName;
  tint?: string;
  time?: string;
}> = ({ x, y, w = 380, at, until, app, title, body, icon = "bell", tint = C.accent, time = "now" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const k = w / 380;
  const sIn = appleSpring(frame - at, fps, { response: 0.5 });
  const out = until !== undefined ? prog(frame, until, 9) : 0;
  if (out >= 1) return null;
  const lift = y + 150 * k;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        padding: 14 * k,
        borderRadius: 26 * k,
        background: "rgba(246,246,248,0.84)",
        backdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
        display: "flex",
        gap: 12 * k,
        alignItems: "center",
        fontFamily: sans,
        translate: `0px ${-(1 - sIn + out) * lift}px`,
        opacity: interpolate(sIn, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }) * (1 - out),
      }}
    >
      <div
        style={{
          width: 46 * k,
          height: 46 * k,
          borderRadius: 11 * k,
          background: tint,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "flex-start",
          marginTop: 2 * k,
        }}
      >
        <Icon name={icon} size={28 * k} color={C.white} weight={2.1} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 * k, fontWeight: 500, color: C.mute, marginBottom: 1 * k }}>
          <span>{app}</span>
          <span>{time}</span>
        </div>
        <div style={{ fontSize: 17 * k, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em", lineHeight: 1.25 }}>{title}</div>
        {body ? <div style={{ fontSize: 16 * k, fontWeight: 500, color: C.ink, lineHeight: 1.3, marginTop: 1 * k }}>{body}</div> : null}
      </div>
    </div>
  );
};
