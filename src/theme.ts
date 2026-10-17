import { Easing, interpolate, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Sudo the Raccoon design system: "Apple light" (style E).
// Apple page grey, near-black type with tight tracking, one system blue, macOS windows,
// frosted-glass callouts, product-shot shadows. No gradients, no glow, sentence case only.
// Motion (Apple fluid-interface talks + Emil Kowalski's animation rules): see the vault,
// SudoRaccoon/Playbook/Design system.md.

const sansFont = loadSans("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});
const monoFont = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });
export const sans = sansFont.fontFamily;
export const mono = monoFont.fontFamily;
// Resolves once both faces have loaded (document.fonts.ready can resolve earlier). Await it before measuring text.
export const fontsReady = () => Promise.all([sansFont.waitUntilDone(), monoFont.waitUntilDone()]);

export const C = {
  paper: "#F5F5F7", // page background (Apple grey)
  soft: "#E8E8ED",
  line: "rgba(0,0,0,0.12)",
  mute: "#6E6E73",
  ink: "#1D1D1F",
  accent: "#0071E3", // system blue: active word, focus rings, counters
  white: "#FFFFFF",
};

// Frosted glass callout (backdrop blur over whatever is behind it).
export const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.7)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
  borderRadius: 28,
};
export const SHADOW_WINDOW = "0 40px 80px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.08)";
export const SHADOW_OBJECT = "drop-shadow(0 24px 30px rgba(0,0,0,0.22))";

export const W = 1080;
export const H = 1920;
// 9:16 safe zones (universal): top ~120, bottom ~320, right ~120 kept clear.
export const SAFE = { top: 200, side: 120, bottom: 1600 };

// ---------------- motion tokens ----------------
export const UNIT = 9; // base timing unit in frames (0.3s @ 30fps)
export const easeOut = Easing.bezier(0.23, 1, 0.32, 1); // entering / exiting (Emil's strong ease-out)
export const easeInOut = Easing.bezier(0.77, 0, 0.175, 1); // moving / morphing on screen
export const easeDrawer = Easing.bezier(0.32, 0.72, 0, 1); // iOS sheet curve, panels sliding

/** 0→1 progress starting at `start` over `dur` frames, eased and clamped. */
export const prog = (frame: number, start: number, dur = UNIT * 2, easing = easeOut) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/**
 * Apple-style spring: `response` = seconds to reach the target, `damping` = damping ratio
 * (1 = critically damped, no overshoot; 0.8 = slight bounce, only for thrown/momentum things).
 */
export const appleSpring = (frame: number, fps: number, { response = 0.4, damping = 1 } = {}) => {
  const omega = (2 * Math.PI) / response;
  return spring({ frame, fps, config: { mass: 1, stiffness: omega * omega, damping: damping * 2 * omega } });
};

/** "Materialize" entrance: opacity + 0.95→1 scale + blur 8→0 (never from scale 0). */
export const materialize = (p: number, fromScale = 0.95, blur = 8): React.CSSProperties => ({
  opacity: p,
  scale: String(fromScale + (1 - fromScale) * p),
  filter: p < 1 ? `blur(${(1 - p) * blur}px)` : undefined,
});

// Terminal palette (dark macOS terminal on the light page).
export const TERM = {
  bg: "#1E1E1E",
  bar: "#2B2B2D",
  fg: "#F5F5F7",
  dim: "#8E8E93",
  blue: "#64A8FF",
  green: "#5AD27A",
  yellow: "#FFD15C",
  red: "#FF6961",
  purple: "#C79BFF",
  cyan: "#6ED3D0",
  orange: "#FFA45C",
};
