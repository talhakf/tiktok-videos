import { useCurrentFrame } from "remotion";
import { C, materialize, prog, sans } from "../../theme";

// Kinetic type: a sentence that materializes word by word (or letter by letter), each piece rising a little out of
// a blur, `gap` frames after the one before. For the big statement of a beat ("your password never leaves your laptop").
// Wraps like normal text inside `w`; `\n` breaks a line. Leaves all at once (fade + blur) at `until`.

/**
 * Sentence `text` entering from `at`, `by` word (default `gap` 2.4 frames = 80 ms) or char (1.2 = 40 ms).
 * `colors` = word index → colour (`{2: C.accent}` makes the third word blue), counting words across lines.
 */
export const TextIn: React.FC<{
  text: string;
  at: number;
  until?: number;
  by?: "word" | "char";
  gap?: number;
  dur?: number;
  x?: number;
  y?: number;
  w?: number;
  align?: "left" | "center";
  size?: number;
  weight?: number;
  color?: string;
  colors?: Record<number, string>;
  lineHeight?: number;
}> = ({ text, at, until, by = "word", gap, dur = 10, x, y, w, align = "left", size = 88, weight = 700, color = C.ink, colors = {}, lineHeight = 1.05 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  const step = gap ?? (by === "word" ? 2.4 : 1.2);
  const positioned = x !== undefined || y !== undefined;

  let piece = 0; // pieces entered so far (words or chars)
  let word = 0; // word index, for `colors`
  const lines = text.split("\n").map((line, li) => (
    <div key={li}>
      {line.split(/(\s+)/).map((tok, ti) => {
        if (tok === "") return null;
        if (/^\s+$/.test(tok)) return <span key={ti}>{tok}</span>;
        const tone = colors[word] ?? color;
        word += 1;
        const parts = by === "word" ? [tok] : Array.from(tok);
        // A word never breaks inside, even when it enters letter by letter.
        return (
          <span key={ti} style={{ display: "inline-block", whiteSpace: "pre", color: tone }}>
            {parts.map((ch, ci) => {
              const p = prog(frame, at + piece++ * step, dur);
              return (
                <span key={ci} style={{ display: "inline-block", ...materialize(p, 0.96, 8), translate: `0 ${(1 - p) * 0.22}em` }}>
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  ));

  return (
    <div
      style={{
        position: positioned ? "absolute" : "relative",
        ...(positioned ? { left: x ?? 0, top: y ?? 0 } : {}),
        width: w,
        textAlign: align,
        fontFamily: sans,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: "-0.045em",
        color,
        opacity: 1 - out,
        filter: out > 0 ? `blur(${out * 6}px)` : undefined,
      }}
    >
      {lines}
    </div>
  );
};
