import { interpolate, useCurrentFrame } from "remotion";
import { C, easeInOut, materialize, prog, sans } from "../../theme";

// A macOS-style progress bar: label on the left, percent on the right, a rounded track with a blue fill.
// The fill glides (ease-in-out) between keyframes, so a download can crawl, pause and finish on cue.

/** Fill value (0..1) at `frame`: holds before the first key and after the last, eases between keys. */
const valueAt = (frame: number, keys: { at: number; value: number }[]) => {
  if (keys.length === 0) return 0;
  if (frame <= keys[0].at) return keys[0].value;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame < b.at) {
      return interpolate(frame, [a.at, b.at], [a.value, b.value], { easing: easeInOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    }
  }
  return keys[keys.length - 1].value;
};

/**
 * Progress bar that enters at `at`; `keys` drive the fill ({at, value 0..1}, eased between keys).
 * Shows `label` and the percent above the track (`percent={false}` hides it).
 */
export const ProgressBar: React.FC<{
  keys: { at: number; value: number }[];
  at: number;
  x: number;
  y: number;
  w?: number;
  label?: string;
  percent?: boolean;
  height?: number;
  fontSize?: number;
  until?: number;
}> = ({ keys, at, x, y, w = 900, label, percent = true, height = 18, fontSize = 38, until }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = prog(frame, at, 9);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  const v = Math.max(0, Math.min(1, valueAt(frame, keys)));
  const hasHead = label !== undefined || percent;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: sans, ...materialize(p * (1 - out), 0.97, 6) }}>
      {hasHead ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: fontSize * 0.45,
            fontSize,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          <span style={{ fontWeight: 600, color: C.ink }}>{label ?? ""}</span>
          {percent ? (
            <span style={{ fontWeight: 600, color: C.mute, fontVariantNumeric: "tabular-nums" }}>{Math.round(v * 100)}%</span>
          ) : null}
        </div>
      ) : null}
      <div style={{ position: "relative", width: w, height, borderRadius: height / 2, background: C.soft, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height, width: v * w, borderRadius: height / 2, background: C.accent }} />
      </div>
    </div>
  );
};
