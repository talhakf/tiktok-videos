import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { presence } from "../diagram/Node";
import { C, GLASS, materialize, prog } from "../../theme";

// Audio bars that move only while something is speaking (`say "trash night"`, a voice note, a podcast):
// rounded blue bars driven by smooth pseudo-random motion inside each `speak` window, resting flat as
// dots outside them (no idle motion). Optional glass pill with a speaker icon.

/** Smooth 0..1 level for bar `i` at `frame` (three sines with per-bar phases, deterministic). */
const level = (i: number, frame: number) => {
  const f = frame / 30;
  const v = Math.sin(f * 9.1 + i * 1.7) * 0.45 + Math.sin(f * 15.3 + i * 0.9 + 2) * 0.35 + Math.sin(f * 4.2 + i * 2.6) * 0.2;
  const shape = 0.55 + 0.45 * Math.sin((i + 1) * 0.55); // fixed per-bar spread so it never looks uniform
  return Math.max(0.08, Math.min(1, (v * 0.5 + 0.5) * shape + 0.12));
};

/**
 * Waveform at (x, y). `speak`: [from, to) frame windows where it moves (attack/release ~4 frames).
 * `bars` count, `h` max bar height, `pill` wraps it in frosted glass with a speaker icon.
 */
export const Waveform: React.FC<{
  x: number;
  y: number;
  at: number;
  until?: number;
  speak: [number, number][];
  bars?: number;
  h?: number;
  barW?: number;
  gap?: number;
  color?: string;
  pill?: boolean;
}> = ({ x, y, at, until, speak, bars = 28, h = 120, barW = 12, gap = 9, color = C.accent, pill }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const env = speak.reduce((m, [a, b]) => Math.max(m, prog(frame, a, 4) * (1 - prog(frame, b, 6))), 0);
  const width = bars * barW + (bars - 1) * gap;
  const wave = (
    <div style={{ display: "flex", alignItems: "center", gap, height: h, width }}>
      {Array.from({ length: bars }, (_, i) => {
        // bars near the ends move less, like a voice-memo waveform
        const edge = Math.sin(((i + 0.5) / bars) * Math.PI) ** 0.6;
        const hh = barW + (h - barW) * level(i, frame) * edge * env;
        return <div key={i} style={{ width: barW, height: hh, borderRadius: barW, background: color, opacity: 0.55 + 0.45 * env }} />;
      })}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: x, top: y, ...materialize(p) }}>
      {pill ? (
        <div style={{ ...GLASS, borderRadius: h, display: "flex", alignItems: "center", gap: 28, padding: `${h * 0.2}px ${h * 0.45}px ${h * 0.2}px ${h * 0.35}px` }}>
          <Icon name="speaker" size={h * 0.55} color={C.ink} weight={2} draw={prog(frame, at + 2, 12)} />
          {wave}
        </div>
      ) : (
        wave
      )}
    </div>
  );
};
