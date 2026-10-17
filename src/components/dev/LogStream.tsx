import { useCurrentFrame } from "remotion";
import { presence } from "../diagram/Node";
import { RED } from "../layouts/Mark";
import { tint } from "../windows/MacWindow";
import { C, easeInOut, mono, prog, TERM } from "../../theme";
import { AMBER, DevCard, focusTrack, mixTone, TAB_H, Tone } from "./card";

// A live log on a card: one row per line with a timestamp, a lowercase level chip (debug / info grey,
// warn amber, error red) and the message. Lines arrive at their own frames; once the card is full every
// new line pushes the others up smoothly. `focus` bands one line (it scrolls with the log) and dims the rest.

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogLine = { at: number; text: string; level?: LogLevel; time?: string };
export type LogFocus = { index: number; at: number; until?: number; tone?: Tone };

const chipColors = (level: LogLevel, dark?: boolean) => {
  if (dark) {
    if (level === "error") return { bg: tint(TERM.red, 0.2), fg: TERM.red };
    if (level === "warn") return { bg: tint(TERM.yellow, 0.18), fg: TERM.yellow };
    return { bg: "rgba(255,255,255,0.08)", fg: TERM.dim };
  }
  if (level === "error") return { bg: tint(RED, 0.12), fg: "#C9281E" };
  if (level === "warn") return { bg: tint(AMBER, 0.18), fg: "#A05A00" };
  return { bg: "#F2F2F4", fg: C.mute };
};

/**
 * Log card at (x, y), `w` × `h`. `lines` (in order) appear at their `at`; overflow scrolls (8 frames,
 * easeInOut per new line). `time` is optional (e.g. "03:07:12"). `focus`: band on line `index` (0-based in
 * `lines`); `dimOthers` fades the others. `filename` adds a tab ("server.log"). About 40 message
 * characters fit at size 24 in 900 px with a timestamp.
 */
export const LogStream: React.FC<{
  lines: LogLine[];
  x: number;
  y: number;
  w?: number;
  h: number;
  at: number;
  until?: number;
  focus?: LogFocus[];
  dimOthers?: boolean;
  dark?: boolean;
  filename?: string;
  right?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ lines, x, y, w = 900, h, at, until, focus = [], dimOthers = true, dark, filename, right, size = 24, style }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const rowH = Math.round(size * 1.95);
  const bodyH = h - (filename !== undefined ? TAB_H : 0);
  const maxRows = Math.max(1, Math.floor((bodyH - 24) / rowH));
  const PAD = (bodyH - maxRows * rowH) / 2; // rows sit centred in the body
  const ch = size * 0.6;
  const hasTime = lines.some((l) => l.time);
  const timeW = hasTime ? Math.max(...lines.map((l) => (l.time ?? "").length)) * ch + 18 : 0;
  const hasLevel = lines.some((l) => l.level);
  const chipW = hasLevel ? 5 * ch + 22 : 0;

  let scroll = 0;
  lines.forEach((l, i) => {
    if (i >= maxRows) scroll += prog(frame, l.at, 8, easeInOut);
  });

  const track = focusTrack(frame, focus);
  const rowTop = (i: number) => PAD + (i - scroll) * rowH;
  const bright = (i: number) => {
    if (!track || !dimOthers) return 1;
    const is = (c: LogFocus) => (c.index === i ? 1 : 0);
    const wIn = track.prev ? is(track.prev) + (is(track.cur) - is(track.prev)) * track.t : is(track.cur);
    return 1 - track.o * (1 - wIn) * 0.6;
  };
  let band: null | { top: number; colors: ReturnType<typeof mixTone>; o: number } = null;
  if (track && frame >= lines[track.cur.index]?.at) {
    const B = rowTop(track.cur.index);
    const A = track.prev ? rowTop(track.prev.index) : B;
    band = {
      top: A + (B - A) * track.t,
      colors: mixTone(track.prev?.tone ?? track.cur.tone ?? "accent", track.cur.tone ?? "accent", track.t, dark),
      o: track.o,
    };
  }

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon="file" right={right} style={style}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
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
        {lines.map((l, i) => {
          if (frame < l.at) return null;
          const e = prog(frame, l.at, 7);
          const top = rowTop(i);
          if (top + rowH < 0 || top > bodyH) return null;
          const chip = l.level ? chipColors(l.level, dark) : null;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 28,
                right: 24,
                top,
                height: rowH,
                display: "flex",
                alignItems: "center",
                fontFamily: mono,
                fontWeight: 500,
                fontSize: size,
                whiteSpace: "pre",
                opacity: e * bright(i) * Math.max(0, Math.min(1, (top - PAD + rowH) / rowH)) ** 2,
                translate: `0px ${(1 - e) * 10}px`,
              }}
            >
              {hasTime ? (
                <div style={{ width: timeW, flexShrink: 0, color: dark ? TERM.dim : C.mute, fontVariantNumeric: "tabular-nums" }}>{l.time ?? ""}</div>
              ) : null}
              {hasLevel ? (
                <div style={{ width: chipW, flexShrink: 0 }}>
                  {chip ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: chipW - 16,
                        height: size * 1.4,
                        borderRadius: 8,
                        background: chip.bg,
                        color: chip.fg,
                        fontWeight: 700,
                        fontSize: size * 0.9,
                      }}
                    >
                      {l.level}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", color: dark ? TERM.fg : C.ink }}>{l.text}</div>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
