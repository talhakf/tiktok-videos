import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, materialize, mono, prog, sans } from "../../theme";

// Masked text (a password) that reveals itself character by character, left to right. Each character
// materializes over its bullet; `scramble` shows a few look-random characters first. The randomness is a
// hash of the character index and the frame, so every render is identical.

const GLYPHS = "abcdefghijkmnopqrstuvwxyz0123456789#$%&*+?@";
const hash = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) % GLYPHS.length;
};

/**
 * Bullets (•) for each character of `text`, revealing the real text from `revealAt` (one char every
 * `stagger` frames). Without x / y it renders inline. `field` wraps it in a password field with an eye
 * icon that opens on reveal; `label` sets the field's caption.
 */
export const SecretText: React.FC<{
  text: string;
  at: number;
  revealAt: number;
  x?: number;
  y?: number;
  w?: number; // field width
  size?: number;
  stagger?: number;
  scramble?: boolean;
  field?: boolean;
  label?: string;
  color?: string;
  until?: number;
}> = ({ text, at, revealAt, x, y, w = 900, size = 56, stagger = 1.6, scramble, field, label, color = C.ink, until }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const inP = prog(frame, at, 9);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  const positioned = x !== undefined && y !== undefined;
  const scrambleFrames = scramble ? 8 : 0;

  const chars = [...text].map((ch, i) => {
    const t = revealAt + i * stagger;
    const bulletOut = prog(frame, t, 5);
    const real = prog(frame, t + scrambleFrames, 8);
    const scrambling = scramble && frame >= t && frame < t + scrambleFrames;
    const fake = GLYPHS[hash(i, Math.floor(frame / 2))];
    const cell: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: "0.6em", textAlign: "center" };
    return (
      <span key={i} style={{ position: "relative", display: "inline-block", width: "0.6em" }}>
        <span style={{ visibility: "hidden" }}>{ch === " " ? " " : ch}</span>
        {bulletOut < 1 ? <span style={{ ...cell, ...materialize(1 - bulletOut, 0.8, 4) }}>•</span> : null}
        {scrambling ? <span style={{ ...cell, color: C.mute }}>{fake}</span> : null}
        {real > 0 ? <span style={{ ...cell, ...materialize(real, 0.9, 6) }}>{ch}</span> : null}
      </span>
    );
  });

  const textNode = (
    <span style={{ fontFamily: mono, fontWeight: 500, fontSize: size, lineHeight: 1.2, color, whiteSpace: "pre" }}>{chars}</span>
  );
  if (!field) {
    return (
      <span style={{ ...(positioned ? { position: "absolute", left: x, top: y } : {}), display: "inline-block", ...materialize(inP * (1 - out)) }}>
        {textNode}
      </span>
    );
  }
  const open = prog(frame, revealAt - 4, 8);
  return (
    <div style={{ ...(positioned ? { position: "absolute", left: x, top: y } : {}), width: w, ...materialize(inP * (1 - out), 0.97, 8) }}>
      {label ? (
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: size * 0.55, color: C.mute, marginBottom: 14, marginLeft: 6 }}>{label}</div>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${size * 0.42}px ${size * 0.6}px`,
          background: C.white,
          border: `1px solid ${C.line}`,
          borderRadius: 20,
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
        }}
      >
        {textNode}
        <span style={{ position: "relative", width: size * 0.9, height: size * 0.9 }}>
          <span style={{ position: "absolute", inset: 0, opacity: 1 - open }}>
            <Icon name="eyeOff" size={size * 0.9} color={C.mute} />
          </span>
          {open > 0 ? (
            <span style={{ position: "absolute", inset: 0, ...materialize(open, 0.9, 4) }}>
              <Icon name="eye" size={size * 0.9} color={C.accent} />
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
};
