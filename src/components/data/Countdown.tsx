import { useCurrentFrame, useVideoConfig } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, materialize, prog, sans } from "../../theme";

// Quiz timer: a ring that empties over N seconds while the number in the middle swaps 3, 2, 1. When time is
// up the ring sweeps back in blue and a check draws. The ring empties linearly: it is a clock, not a UI move.

/** Countdown ring of `seconds` starting at `at` (top-left x / y, `size` px square), then a blue done state. */
export const Countdown: React.FC<{
  at: number;
  x: number;
  y: number;
  seconds?: number;
  size?: number;
  until?: number;
}> = ({ at, x, y, seconds = 3, size = 320, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const inP = prog(frame, at, 10);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;

  const total = seconds * fps;
  const t = frame - at;
  const doneAt = at + total;
  const left = Math.max(0, 1 - t / total);
  const done = prog(frame, doneAt, 12);
  const stroke = size * 0.05;
  const r = (size - stroke) / 2;
  const c = size / 2;

  // Numbers: each materializes on its second; the previous one blurs away over 6 frames.
  const nums: React.ReactNode[] = [];
  for (let k = 0; k < seconds; k++) {
    const start = at + k * fps;
    const end = start + fps;
    if (frame < start || frame >= end + 6) continue;
    const pIn = k === 0 ? 1 : prog(frame, start, 9);
    const pOut = prog(frame, end, 6);
    nums.push(
      <div
        key={k}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...materialize(pIn * (1 - pOut), pOut > 0 ? 1.04 : 0.95, 10),
        }}
      >
        {seconds - k}
      </div>,
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size * 0.44,
        lineHeight: 1,
        letterSpacing: "-0.045em",
        fontVariantNumeric: "tabular-nums",
        color: C.ink,
        ...materialize(inP * (1 - out)),
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", left: 0, top: 0, rotate: "-90deg" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={C.soft} strokeWidth={stroke} />
        {left > 0 ? (
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={C.ink}
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${left} 1`}
          />
        ) : null}
        {done > 0 ? (
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={C.accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${done} 1`}
          />
        ) : null}
      </svg>
      {nums}
      {done > 0 ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="check" size={size * 0.42} color={C.accent} weight={2.4} draw={prog(frame, doneAt + 3, 12)} />
        </div>
      ) : null}
    </div>
  );
};
