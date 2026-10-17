import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TW, TX } from "../../layout";
import { appleSpring, C, easeOut, prog, sans } from "../../theme";
import { CARD_SHADOW } from "../diagram/Node";
import { outP } from "../layouts/Mark";

// Punchline beats. `PunchWord`: one huge word slams in (from slightly larger and blurred, settling to 1 in
// ~6 frames, no bounce) and blurs away on exit. `Reaction`: a small white disc with "?", "!" or "+1" that pops
// beside a raccoon or an element (a thrown thing: spring 0.8) with one blue ring that ripples out once;
// `float` lets it drift up and fade like a counter tick. No emoji: plain glyphs only. (Right / wrong = `Verdict`.)

/**
 * One huge word centred in the column (`x`, `w`) with its top at `y`. `b` = an optional second word in grey
 * on the next line, landing 6 frames later.
 */
export const PunchWord: React.FC<{
  text: string;
  at: number;
  until?: number;
  b?: string;
  y?: number;
  x?: number;
  w?: number;
  size?: number;
  color?: string;
  align?: "center" | "left";
}> = ({ text, at, until, b, y = 640, x = TX, w = TW, size = 240, color = C.ink, align = "center" }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  const word = (start: number, t: string, col: string, fs: number) => {
    const p = prog(frame, start, 7, easeOut);
    if (frame < start) return <div style={{ height: fs * 0.95 }} />;
    return (
      <div
        style={{
          fontWeight: 700,
          fontSize: fs,
          lineHeight: 0.95,
          letterSpacing: "-0.055em",
          color: col,
          whiteSpace: "pre",
          opacity: Math.min(1, p * 2.5) * (1 - out),
          scale: String(interpolate(p, [0, 1], [1.32, 1]) * (1 + out * 0.06)),
          filter: p < 1 || out > 0 ? `blur(${(1 - p) * 18 + out * 12}px)` : undefined,
        }}
      >
        {t}
      </div>
    );
  };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        fontFamily: sans,
      }}
    >
      {word(at, text, color, size)}
      {b ? word(at + 6, b, C.mute, size * 0.62) : null}
    </div>
  );
};

/**
 * Reaction disc centred at `x, y`: `glyph` "?" / "!" / "+1" / any short text. `color` tints the glyph and
 * the ripple (blue default; red / green only for wrong / right). `float` = rises 70 px and fades by `at + 24`.
 */
export const Reaction: React.FC<{
  at: number;
  x: number;
  y: number;
  glyph?: string;
  until?: number;
  size?: number; // disc diameter
  color?: string;
  float?: boolean;
  ripple?: boolean;
}> = ({ at, x, y, glyph = "?", until, size = 140, color = C.accent, float = false, ripple = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const out = float ? prog(frame, at + 14, 10) : outP(frame, until);
  if (out >= 1) return null;
  const s = appleSpring(frame - at, fps, { response: 0.35, damping: 0.8 });
  const rp = prog(frame, at + 2, 16);
  const rise = float ? prog(frame, at, 24) * 70 : 0;
  const fs = size * (glyph.length > 1 ? 0.42 : 0.58);
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2 - rise, width: size, height: size }}>
      {ripple && rp < 1 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: size / 2,
            border: `4px solid ${color}`,
            scale: String(1 + rp * 0.55),
            opacity: (1 - rp) * 0.6,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: size / 2,
          background: C.white,
          boxShadow: CARD_SHADOW,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: sans,
          fontWeight: 700,
          fontSize: fs,
          letterSpacing: "-0.04em",
          color,
          scale: String(interpolate(s, [0, 1], [0.7, 1])),
          opacity: Math.min(1, s * 2) * (1 - out),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {glyph}
      </div>
    </div>
  );
};
