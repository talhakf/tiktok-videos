import { interpolateColors, useCurrentFrame } from "remotion";
import { TW, TX } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { outP } from "./Mark";

// Progress through numbered steps: done = filled blue with a white number, current = blue ring (it glides
// from step to step), future = grey outline. Optional "3/5" counter to the right.

/** Numbered step squares 1..n. `steps[k]` = frame step k + 1 becomes current (steps[0] is usually `at`). */
export const StepDots: React.FC<{
  n: number;
  steps: number[];
  at?: number;
  until?: number;
  x?: number; // default: centred in the content column
  y: number;
  size?: number;
  gap?: number;
  label?: boolean; // "3/5" counter after the squares
}> = ({ n, steps, at, until, x, y, size = 76, gap = 20, label = false }) => {
  const frame = useCurrentFrame();
  const start = at ?? steps[0] ?? 0;
  if (frame < start) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const labelW = label ? 150 : 0;
  const total = n * size + (n - 1) * gap + labelW;
  const left = x ?? TX + (TW - total) / 2;
  // continuous current index: glides 12 frames (ease-in-out) to each new step
  let cur = 0;
  for (let k = 1; k < steps.length; k++) cur += prog(frame, steps[k], 12, easeInOut);
  const ringIn = prog(frame, steps[0] ?? start, 8);
  const r = size * 0.26;

  return (
    <div style={{ position: "absolute", left, top: y, width: total, height: size, opacity: 1 - out }}>
      {Array.from({ length: n }, (_, i) => {
        const p = prog(frame, start + i * 2, 9);
        const done = i + 1 < steps.length ? prog(frame, steps[i + 1], 10) : 0;
        const near = Math.max(0, 1 - Math.abs(cur - i)) * ringIn;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * (size + gap),
              top: 0,
              width: size,
              height: size,
              borderRadius: r,
              boxSizing: "border-box",
              border: `3px solid ${interpolateColors(done, [0, 1], ["#C7C7CC", C.accent])}`,
              background: interpolateColors(done, [0, 1], [C.white, C.accent]),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: sans,
              fontWeight: 700,
              fontSize: size * 0.42,
              fontVariantNumeric: "tabular-nums",
              color: done > 0 ? interpolateColors(done, [0, 1], [C.accent, C.white]) : interpolateColors(near, [0, 1], [C.mute, C.accent]),
              ...materialize(p, 0.9, 6),
            }}
          >
            {i + 1}
          </div>
        );
      })}
      {/* the current-step ring glides between squares */}
      <div
        style={{
          position: "absolute",
          left: cur * (size + gap) - 8,
          top: -8,
          width: size + 16,
          height: size + 16,
          borderRadius: r + 8,
          boxSizing: "border-box",
          border: `4px solid ${C.accent}`,
          opacity: ringIn,
          scale: String(1.06 - 0.06 * ringIn),
        }}
      />
      {label ? (
        <div style={{ position: "absolute", left: n * (size + gap) + 10, top: 0, height: size, width: labelW - 10 }}>
          {Array.from({ length: Math.max(1, steps.length) }, (_, k) => {
            const o = Math.max(0, 1 - Math.abs(cur - k) * 2);
            if (o <= 0) return null;
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: mono,
                  fontWeight: 500,
                  fontSize: size * 0.48,
                  color: C.mute,
                  opacity: o * ringIn,
                  translate: `0px ${(k - cur) * 16}px`,
                }}
              >
                {k + 1}/{n}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
