import { useCurrentFrame } from "remotion";
import { presence } from "../diagram/Node";
import { Mark, RED } from "../layouts/Mark";
import { C, mono, prog } from "../../theme";
import { DevCard, focusTrack, mixTone, TAB_H, Tone } from "./card";

// An error and its stack on a white card: the error name in red with its message, then one row per stack
// frame (function on top, file:line below in grey), library frames faded. A band focuses one frame
// ("this is your code") and glides to another. `format` "js" reads "at fn" / "src/a.js:12:18",
// "python" reads "in fn" / `File "app.py", line 12` (the frames as Python prints them, oldest first).

export type StackFrame = { fn?: string; file: string; line?: number; col?: number; lib?: boolean };
export type StackFocus = { index: number; at: number; until?: number; tone?: Tone };

const location = (f: StackFrame, format: "js" | "python") =>
  format === "python"
    ? `File "${f.file}"${f.line !== undefined ? `, line ${f.line}` : ""}`
    : `${f.file}${f.line !== undefined ? `:${f.line}` : ""}${f.col !== undefined ? `:${f.col}` : ""}`;

/**
 * Stack trace card at (x, y), `w` wide. `error` ("TypeError") and `message` (line breaks only at "\n")
 * show first, then `frames` enter `stagger` frames apart. `focus`: band on frame `index` (0-based).
 */
export const StackTrace: React.FC<{
  error: string;
  message: string;
  frames: StackFrame[];
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  format?: "js" | "python";
  focus?: StackFocus[];
  dimOthers?: boolean;
  stagger?: number;
  size?: number;
  filename?: string;
  right?: string;
  style?: React.CSSProperties;
}> = ({ error, message, frames, x, y, w = 900, at, until, format = "js", focus = [], dimOthers = true, stagger = 3, size = 26, filename, right, style }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const msgLines = message.split("\n");
  const headH = 34 + size * 1.5 + msgLines.length * size * 1.45 + 24;
  const rowH = Math.round(size * 1.5 + 24 * 1.4 + 22);
  const h = (filename !== undefined ? TAB_H : 0) + headH + frames.length * rowH + 26;

  const track = focusTrack(frame, focus);
  const rowTop = (i: number) => headH + i * rowH;
  const bright = (i: number) => {
    if (!track || !dimOthers) return 1;
    const is = (c: StackFocus) => (c.index === i ? 1 : 0);
    const wIn = track.prev ? is(track.prev) + (is(track.cur) - is(track.prev)) * track.t : is(track.cur);
    return 1 - track.o * (1 - wIn) * 0.55;
  };
  const band = track
    ? {
        top: rowTop(track.prev?.index ?? track.cur.index) + (rowTop(track.cur.index) - rowTop(track.prev?.index ?? track.cur.index)) * track.t,
        colors: mixTone(track.prev?.tone ?? track.cur.tone ?? "accent", track.cur.tone ?? "accent", track.t),
        o: track.o,
      }
    : null;
  const hp = prog(frame, at + 4, 8);

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="bug" right={right} style={style}>
      <div style={{ position: "absolute", left: 36, right: 36, top: 34, opacity: hp, fontFamily: mono, fontWeight: 500 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, height: size * 1.5 }}>
          <Mark kind="cross" size={size * 1.25} color={RED} draw={prog(frame, at + 6, 10)} />
          <span style={{ fontWeight: 700, fontSize: size + 2, color: "#C9281E" }}>{error}</span>
        </div>
        {msgLines.map((l, i) => (
          <div key={i} style={{ fontSize: size, lineHeight: 1.45, color: C.ink, whiteSpace: "pre" }}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: headH - 1, height: 1, background: C.line, opacity: hp }} />
      {band ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: band.top,
            height: rowH,
            background: band.colors.bg,
            borderLeft: `5px solid ${band.colors.edge}`,
            opacity: band.o,
          }}
        />
      ) : null}
      {frames.map((f, i) => {
        const e = prog(frame, at + 10 + i * stagger, 8);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 36,
              right: 36,
              top: rowTop(i),
              height: rowH,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 2,
              fontFamily: mono,
              fontWeight: 500,
              whiteSpace: "pre",
              opacity: e * bright(i) * (f.lib ? 0.5 : 1),
              translate: `${(1 - e) * 16}px 0px`,
            }}
          >
            <div style={{ fontSize: size, color: C.ink, overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ color: C.mute }}>{format === "python" ? "in " : "at "}</span>
              {f.fn ?? (format === "python" ? "<module>" : "<anonymous>")}
            </div>
            <div style={{ fontSize: 24, color: C.mute, overflow: "hidden", textOverflow: "ellipsis" }}>{location(f, format)}</div>
          </div>
        );
      })}
    </DevCard>
  );
};
