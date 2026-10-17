import { Icon } from "../../icons/Icons";
import { C, prog, sans } from "../../theme";

// Semantic colours: red = wrong, green = right. Everything else stays ink / grey / system blue.
export const RED = "#FF3B30";
export const GREEN = "#34C759";

/** Fade-out progress for an optional `until` (ease-out, 8 frames). 0 while on screen, 1 = gone. */
export const outP = (frame: number, until: number | undefined, dur = 8) => (until === undefined ? 0 : prog(frame, until, dur));

/**
 * Round marker with a check, a cross or a number: the shared bullet of lists, quizzes and comparisons.
 * `draw` 0→1 draws the glyph on; `filled` false = outline only (an unticked box).
 */
export const Mark: React.FC<{
  kind: "check" | "cross" | number;
  size?: number;
  color?: string;
  glyph?: string;
  draw?: number;
  filled?: boolean;
  style?: React.CSSProperties;
}> = ({ kind, size = 56, color = C.accent, glyph, draw = 1, filled = true, style }) => {
  const fg = glyph ?? (filled ? C.white : color);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: filled ? color : "transparent",
        border: filled ? undefined : `${Math.max(2, size * 0.05)}px solid ${color}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      {typeof kind === "number" ? (
        <span style={{ fontFamily: sans, fontWeight: 700, fontSize: size * 0.46, color: fg, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
          {kind}
        </span>
      ) : draw > 0 ? (
        <Icon name={kind} size={size * 0.6} color={fg} weight={2.8} draw={draw} />
      ) : null}
    </div>
  );
};
