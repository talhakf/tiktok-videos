import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { fade } from "./NumberTicker";

// Big digital clock in UTC. It ticks once a second from `start`, and every character that changes rolls
// vertically (forward in time rolls up, backward rolls down). `jumpTo` sets a new time on a frame, e.g. the
// year-2038 wrap from 2038-01-19 03:14:07 to 1901-12-13 20:45:52, rolling the changed characters left to right.

export type ClockTime = Date | string | number; // Date, ISO string (UTC) or epoch ms

const toMs = (v: ClockTime) => (typeof v === "number" ? v : typeof v === "string" ? Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(v) ? v : `${v}Z`) : v.getTime());

const lines = (ms: number, format: "time" | "date" | "datetime" | "stacked") => {
  const iso = new Date(ms).toISOString(); // 2038-01-19T03:14:07.000Z
  const date = iso.slice(0, 10);
  const time = iso.slice(11, 19);
  return format === "time" ? [time] : format === "date" ? [date] : format === "datetime" ? [`${date} ${time}`] : [date, time];
};

const RollChar: React.FC<{ from: string; to: string; p: number; up: boolean }> = ({ from, to, p, up }) => {
  if (p >= 1 || from === to) return <span style={{ display: "inline-block", height: "1em" }}>{to}</span>;
  const s = up ? -1 : 1;
  const cell: React.CSSProperties = { position: "absolute", left: 0, top: 0 };
  return (
    <span style={{ position: "relative", display: "inline-block", height: "1em", overflow: "hidden" }}>
      <span style={{ visibility: "hidden" }}>{to}</span>
      <span style={{ ...cell, translate: `0px ${s * p}em`, opacity: fade(p) }}>{from}</span>
      <span style={{ ...cell, translate: `0px ${-s * (1 - p)}em`, opacity: fade(1 - p) }}>{to}</span>
    </span>
  );
};

/**
 * Digital clock / date showing UTC time from `start`, ticking each second from `at` (`tick={false}` freezes
 * it). `jumpTo` swaps to another time at its frame (optionally recoloring, e.g. red for a bug). `format`:
 * "time" (03:14:07), "date", "datetime" (one line) or "stacked" (date above time). `label` sits after the time.
 */
export const Clock: React.FC<{
  start: ClockTime;
  at: number;
  x: number;
  y: number;
  jumpTo?: { at: number; value: ClockTime; color?: string };
  format?: "time" | "date" | "datetime" | "stacked";
  tick?: boolean;
  size?: number;
  font?: "sans" | "mono";
  color?: string;
  label?: string;
  align?: "left" | "center";
  w?: number; // box width when centered
  until?: number;
}> = ({ start, at, x, y, jumpTo, format = "time", tick = true, size = 160, font = "sans", color = C.ink, label, align = "left", w = 900, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const inP = prog(frame, at, 10);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;

  const startMs = toMs(start);
  const msAt = (f: number) => {
    if (jumpTo && f >= jumpTo.at) return toMs(jumpTo.value) + (tick ? Math.floor((f - jumpTo.at) / fps) * 1000 : 0);
    return startMs + (tick ? Math.floor((Math.max(f, at) - at) / fps) * 1000 : 0);
  };
  const now = lines(msAt(frame), format);

  // Find, per character, the latest change in the last 45 frames (a roll still running).
  type Change = { e: number; from: string; up: boolean; jump: boolean };
  const changes: (Change | undefined)[][] = now.map((l) => [...l].map(() => undefined));
  for (let e = frame; e > Math.max(at, frame - 45); e--) {
    const a = msAt(e - 1);
    const b = msAt(e);
    if (a === b) continue;
    const prev = lines(a, format);
    const next = lines(b, format);
    now.forEach((l, li) => {
      [...l].forEach((ch, ci) => {
        const pc = prev[li]?.[ci] ?? ch;
        if (!changes[li][ci] && pc !== next[li]?.[ci]) {
          changes[li][ci] = { e, from: pc, up: b > a, jump: jumpTo !== undefined && e === jumpTo.at };
        }
      });
    });
  }

  // After a colored jump each character takes the new color as the left-to-right roll passes it.
  const tint = (p: number) => (jumpTo?.color ? interpolateColors(p, [0, 1], [color, jumpTo.color]) : color);
  let g = 0; // global char index, for the left-to-right stagger of a jump
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: align === "center" ? w : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: size * 0.12,
        fontFamily: font === "mono" ? mono : sans,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: font === "mono" ? "-0.02em" : "-0.045em",
        fontVariantNumeric: "tabular-nums",
        color,
        whiteSpace: "pre",
        ...materialize(inP * (1 - out)),
      }}
    >
      {now.map((l, li) => {
        const small = format === "stacked" && li === 0;
        const fs = small ? size * 0.5 : size;
        const isTimeLine = li === now.length - 1;
        return (
          <div key={li} style={{ display: "flex", alignItems: "flex-start", fontSize: fs }}>
            {[...l].map((ch, ci) => {
              const c = changes[li][ci];
              const gi = g++;
              let p = 1;
              if (c) {
                p = c.jump ? prog(frame, c.e + gi * 0.8, 14, easeInOut) : prog(frame, c.e, 8, easeOut);
              }
              return (
                <span key={ci} style={{ color: tint(c?.jump ? p : jumpTo ? prog(frame, jumpTo.at + gi * 0.8 + 7, 8) : 0) }}>
                  <RollChar from={c?.from ?? ch} to={ch} p={p} up={c?.up ?? true} />
                </span>
              );
            })}
            {label && isTimeLine ? (
              <span
                style={{
                  fontFamily: sans,
                  fontSize: "0.3em",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color: C.mute,
                  marginLeft: "0.5em",
                  marginTop: `${(0.865 * 0.7) / 0.3}em`,
                }}
              >
                {label}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
