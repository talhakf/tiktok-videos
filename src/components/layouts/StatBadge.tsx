import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { appleSpring, C, easeOut, GLASS, prog, sans } from "../../theme";
import { outP } from "./Mark";

// A small frosted pill with an icon, a value and a grey label: "552K stars", "v2.56", "3.15 · 9 Oct 2026".
// Optional count-up of the number (ease-out, so it slows into the final value).

export type CountUp = { to: number; from?: number; dur?: number; decimals?: number; prefix?: string; suffix?: string };

/** Count-up text for a number: `from` → `to` over `dur` frames from `at`, ease-out. */
export const countText = (frame: number, at: number, c: CountUp) => {
  const t = interpolate(frame, [at, at + (c.dur ?? 24)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
  const v = (c.from ?? 0) + (c.to - (c.from ?? 0)) * t;
  return `${c.prefix ?? ""}${v.toFixed(c.decimals ?? 0)}${c.suffix ?? ""}`;
};

/** Stat pill (icon + value + label) that pops in at `at`; `count` counts the value up instead of a fixed `value`. */
export const StatBadge: React.FC<{
  at: number;
  x: number;
  y: number;
  value?: string;
  count?: CountUp;
  countAt?: number; // default: at + 4
  label?: string;
  icon?: IconName;
  iconColor?: string;
  until?: number;
  size?: number; // value font size
}> = ({ at, x, y, value, count, countAt, label, icon, iconColor = C.accent, until, size = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const s = appleSpring(frame - at, fps, { response: 0.35 });
  const v = count ? countText(frame, countAt ?? at + 4, count) : value;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: size * 0.32,
        padding: `${size * 0.36}px ${size * 0.7}px ${size * 0.36}px ${size * 0.5}px`,
        ...GLASS,
        borderRadius: size * 1.2,
        fontFamily: sans,
        fontSize: size,
        letterSpacing: "-0.02em",
        whiteSpace: "pre",
        opacity: Math.min(1, s * 1.6) * (1 - out),
        scale: String(interpolate(s, [0, 1], [0.9, 1])),
        filter: s < 0.9 ? `blur(${(1 - s / 0.9) * 6}px)` : undefined,
      }}
    >
      {icon ? <Icon name={icon} size={size * 1.05} color={iconColor} weight={2} draw={prog(frame, at + 2, 12)} /> : null}
      {v !== undefined ? <span style={{ fontWeight: 700, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{v}</span> : null}
      {label ? <span style={{ fontWeight: 600, color: C.mute }}>{label}</span> : null}
    </div>
  );
};
