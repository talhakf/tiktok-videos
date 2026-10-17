import { useCurrentFrame } from "remotion";
import { C, mono, prog, sans } from "../../theme";

// Big text that types itself in, character by character, behind a blue caret; it can backspace itself away
// (`deleteAt`) and type something else (`retype`): "rm -rf" → deleted → "trash". The caret is solid while
// typing and blinks like the terminal cursor (15 on, 15 off) while it waits. Mono for commands, sans for words.

/** Characters of a `len`-character string typed by `frame`: the first lands at `at`, then one every `speed` frames. */
export const typedCount = (frame: number, at: number, len: number, speed: number) =>
  frame < at ? 0 : Math.min(len, Math.floor((frame - at) / speed) + 1);

/**
 * Types `text` from `at` (`speed` frames per character), backspaces it from `deleteAt` (`deleteSpeed` per
 * character), then types `retype` from `retypeAt` (default: 6 frames after the last backspace) in `retypeColor`.
 * `caret` blink / typing (only while it types) / none. Placed at `x, y` (`w` + `align` to centre), else inline.
 */
export const Typewriter: React.FC<{
  text: string;
  at: number;
  until?: number;
  speed?: number;
  deleteAt?: number;
  deleteSpeed?: number;
  retype?: string;
  retypeAt?: number;
  retypeColor?: string;
  x?: number;
  y?: number;
  w?: number;
  align?: "left" | "center";
  size?: number;
  font?: "sans" | "mono";
  weight?: number;
  color?: string;
  caret?: "blink" | "typing" | "none";
  caretColor?: string;
}> = ({
  text,
  at,
  until,
  speed = 2.5,
  deleteAt,
  deleteSpeed = 1.5,
  retype,
  retypeAt,
  retypeColor,
  x,
  y,
  w,
  align = "left",
  size = 110,
  font = "sans",
  weight = 700,
  color = C.ink,
  caret = "blink",
  caretColor = C.accent,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;

  const a = Array.from(text);
  const b = Array.from(retype ?? "");
  const typeEnd = at + (a.length - 1) * speed;
  const delEnd = deleteAt !== undefined ? deleteAt + (a.length - 1) * deleteSpeed : undefined;
  const reAt = retype !== undefined && delEnd !== undefined ? (retypeAt ?? delEnd + 6) : undefined;
  const reEnd = reAt !== undefined ? reAt + (b.length - 1) * speed : undefined;

  let shown: string;
  let tone = color;
  let busy: boolean; // typing or deleting this frame (solid caret)
  let last: number; // when it last changed (the blink restarts from there)
  if (reAt !== undefined && reEnd !== undefined && frame >= reAt) {
    shown = b.slice(0, typedCount(frame, reAt, b.length, speed)).join("");
    tone = retypeColor ?? color;
    busy = frame <= reEnd + 1;
    last = reEnd;
  } else if (deleteAt !== undefined && delEnd !== undefined && frame >= deleteAt) {
    const typed = typedCount(frame, at, a.length, speed);
    shown = a.slice(0, Math.max(0, typed - typedCount(frame, deleteAt, a.length, deleteSpeed))).join("");
    busy = frame <= delEnd + 1 || reAt !== undefined;
    last = delEnd;
  } else {
    shown = a.slice(0, typedCount(frame, at, a.length, speed)).join("");
    busy = frame <= typeEnd + 1;
    last = typeEnd;
  }
  const blinkOn = Math.floor((frame - last) / 15) % 2 === 0;
  const caretOn = caret === "blink" ? busy || blinkOn : caret === "typing" ? frame <= last + 8 : false;
  const positioned = x !== undefined || y !== undefined;

  return (
    <div
      style={{
        position: positioned ? "absolute" : "relative",
        ...(positioned ? { left: x ?? 0, top: y ?? 0 } : { display: "inline-block" }),
        width: w,
        textAlign: align,
        fontFamily: font === "mono" ? mono : sans,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: font === "mono" ? "-0.02em" : "-0.045em",
        color: tone,
        whiteSpace: "pre",
        opacity: 1 - out,
        filter: out > 0 ? `blur(${out * 6}px)` : undefined,
      }}
    >
      {shown}
      <span
        style={{
          display: "inline-block",
          width: Math.max(4, size * 0.07),
          height: "0.92em",
          marginLeft: shown ? "0.06em" : 0,
          verticalAlign: "-0.12em",
          borderRadius: size * 0.02,
          background: caretColor,
          opacity: caretOn ? prog(frame, at, 4) : 0,
        }}
      />
    </div>
  );
};
