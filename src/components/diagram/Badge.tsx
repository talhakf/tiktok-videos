import { interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { appleSpring, C, easeInOut, prog } from "../../theme";
import { GREEN, RED } from "./Node";

// Round icon badge that pops onto a node corner (use `anchors(node).tr` etc. for x, y).

export type BadgeTone = "blue" | "red" | "green" | "grey" | "ink";
const TONES: Record<BadgeTone, string> = { blue: C.accent, red: RED, green: GREEN, grey: "#8E8E93", ink: C.ink };
export type BadgeCue = { at: number; icon?: IconName; tone?: BadgeTone };

/**
 * Small filled circle with a white icon (eye, eyeOff, lock, check, cross, warning...), centred on `x, y`.
 * Pops in with a slight spring (0.8, it is "thrown on"); the icon draws itself. `changes` swaps the icon and/or
 * tone later (e.g. eye → eyeOff when the VPN comes on): the colour crossfades and the new icon draws in.
 */
export const Badge: React.FC<{
  x: number;
  y: number;
  icon: IconName;
  tone?: BadgeTone;
  at: number;
  until?: number;
  size?: number;
  changes?: BadgeCue[];
}> = ({ x, y, icon, tone = "blue", at, until, size = 60, changes = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, 7) : 0;
  if (out >= 1) return null;
  const s = appleSpring(frame - at, fps, { response: 0.38, damping: 0.8 });
  // walk the cues: previous and current look, plus the swap progress
  let prev = { icon, tone };
  let cur = { icon, tone };
  let swapAt: number | null = null;
  for (const c of [...changes].sort((a, b) => a.at - b.at)) {
    if (c.at > frame) break;
    prev = cur;
    cur = { icon: c.icon ?? cur.icon, tone: c.tone ?? cur.tone };
    swapAt = c.at;
  }
  const p = swapAt === null ? 1 : prog(frame, swapAt, 10, easeInOut);
  const bg = interpolateColors(p, [0, 1], [TONES[prev.tone], TONES[cur.tone]]);
  const tick = swapAt === null ? 0 : Math.sin(Math.PI * p) * 0.08; // tiny squeeze while it swaps
  const iconSize = size * 0.56;
  const draw = swapAt === null ? prog(frame, at + 3, 10) : p;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: bg,
        border: `4px solid ${C.white}`,
        boxShadow: "0 6px 16px rgba(0,0,0,0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: Math.min(1, s * 1.8) * (1 - out),
        scale: String(interpolate(s, [0, 1], [0.6, 1]) * (1 - tick) * (1 - out * 0.1)),
      }}
    >
      {swapAt !== null && p < 1 && prev.icon !== cur.icon ? (
        <Icon name={prev.icon} size={iconSize} color={C.white} weight={2.4} style={{ position: "absolute", opacity: 1 - p, filter: `blur(${p * 4}px)` }} />
      ) : null}
      <Icon name={cur.icon} size={iconSize} color={C.white} weight={2.4} draw={prev.icon !== cur.icon || swapAt === null ? draw : 1} />
    </div>
  );
};
