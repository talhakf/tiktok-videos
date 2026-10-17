import { useCurrentFrame } from "remotion";
import { C, prog } from "../../theme";

// Marks a word in place: a blue highlighter behind it, a red strike through it (the word greys), or a blue underline,
// drawing left to right at `at`. Inherits the surrounding type, so it drops into any sentence. One line only.

const RED = "#FF3B30";

/** Highlight / strike / underline that draws on at `at` (over `dur` frames) and fades out at `until`. */
export const Marker: React.FC<{
  children: React.ReactNode;
  at: number;
  kind?: "highlight" | "strike" | "underline";
  dur?: number;
  color?: string;
  until?: number;
  x?: number; // with x / y it is placed on the page; otherwise inline
  y?: number;
  style?: React.CSSProperties; // type for the positioned version (font, size, color)
}> = ({ children, at, kind = "highlight", dur = 10, color, until, x, y, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  const c = color ?? (kind === "strike" ? RED : C.accent);
  const mark: React.CSSProperties =
    kind === "highlight"
      ? { left: "-0.07em", right: "-0.07em", top: "0.04em", bottom: "0.02em", borderRadius: "0.16em", background: `${c}38` }
      : kind === "strike"
        ? { left: "-0.06em", right: "-0.06em", top: "calc(50% - 0.02em)", height: "0.08em", borderRadius: "0.04em", background: c }
        : { left: 0, right: 0, bottom: "0.02em", height: "0.08em", borderRadius: "0.04em", background: c };
  const positioned = x !== undefined && y !== undefined;
  return (
    <span
      style={{
        position: positioned ? "absolute" : "relative",
        ...(positioned ? { left: x, top: y } : {}),
        display: "inline-block",
        whiteSpace: "pre",
        ...style,
      }}
    >
      {frame >= at && out < 1 ? (
        <span
          style={{
            position: "absolute",
            ...mark,
            clipPath: `inset(-10% ${(1 - p) * 100}% -10% 0%)`,
            opacity: 1 - out,
            zIndex: kind === "highlight" ? 0 : 2,
          }}
        />
      ) : null}
      <span style={{ position: "relative", zIndex: 1, opacity: kind === "strike" ? 1 - 0.45 * p * (1 - out) : 1 }}>{children}</span>
    </span>
  );
};
