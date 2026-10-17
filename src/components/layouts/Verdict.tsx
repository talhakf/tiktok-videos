import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { appleSpring, C, prog, sans } from "../../theme";
import { GREEN, outP, RED } from "./Mark";

/**
 * Stamp-like verdict pill: "myth" (red cross), "fact" (green check) or a custom `label` + `icon` + `color`.
 * Stamps down with a slight spring (0.8) and settles at a small tilt (`rotate`, ≤ 4°). `size` ~0.5 = a corner badge
 * on another element (`origin` sets which corner it stamps from).
 */
export const Verdict: React.FC<{
  at: number;
  x: number;
  y: number;
  kind?: "myth" | "fact";
  label?: string;
  icon?: IconName;
  color?: string;
  until?: number;
  size?: number; // 1 = 52px label
  rotate?: number;
  origin?: string;
}> = ({ at, x, y, kind = "fact", label, icon, color, until, size = 1, rotate, origin = "50% 50%" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const myth = kind === "myth";
  const col = color ?? (myth ? RED : GREEN);
  const ic: IconName = icon ?? (myth ? "cross" : "check");
  const text = label ?? kind;
  const tilt = Math.max(-4, Math.min(4, rotate ?? (myth ? -3 : 3)));
  const s = appleSpring(frame - at, fps, { response: 0.35, damping: 0.8 });
  const fs = 52 * size;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: fs * 0.32,
        padding: `${fs * 0.22}px ${fs * 0.5}px ${fs * 0.22}px ${fs * 0.26}px`,
        borderRadius: fs,
        background: C.white,
        border: `${Math.max(2, 4 * size)}px solid ${col}`,
        boxShadow: "0 14px 30px rgba(0,0,0,0.12)",
        transformOrigin: origin,
        scale: String(interpolate(s, [0, 1], [1.18, 1])),
        rotate: `${tilt * Math.min(1.2, s)}deg`,
        opacity: Math.min(1, s * 2.2) * (1 - out),
        whiteSpace: "pre",
      }}
    >
      <div
        style={{
          width: fs * 1.15,
          height: fs * 1.15,
          borderRadius: fs,
          background: col,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={ic} size={fs * 0.72} color={C.white} weight={2.8} draw={prog(frame, at + 3, 9)} />
      </div>
      <span style={{ fontFamily: sans, fontWeight: 700, fontSize: fs, letterSpacing: "-0.03em", color: C.ink }}>{text}</span>
    </div>
  );
};
