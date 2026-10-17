import { useCurrentFrame } from "remotion";
import { CARD_SHADOW, presence } from "../diagram/Node";
import { GREEN, RED } from "../layouts/Mark";
import { tint } from "../windows/MacWindow";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";

// A clean data table on a white card: bold header, rows entering one by one, cells that can be tinted
// red / amber / green (the Hive Systems crack-time grid), and a blue focus box that glides from cell to
// cell or row to row on cue. Ports and what uses them, flags and what they do, OS vs command.

export type CellTone = "bad" | "warn" | "good" | "accent";
export type Cell = string | { t: string; tone?: CellTone; mono?: boolean; b?: boolean };
export type TableFocus = { at: number; row: number; col?: number; cols?: number }; // col omitted = whole row

const TONES: Record<CellTone, { bg: string; fg: string }> = {
  bad: { bg: tint(RED, 0.14), fg: "#C9281E" },
  warn: { bg: "rgba(255,159,10,0.18)", fg: "#A05A00" },
  good: { bg: tint(GREEN, 0.16), fg: "#248A3D" },
  accent: { bg: "#EBF4FF", fg: C.accent },
};

/**
 * Table at (x, y), `w` wide. `widths` are column fractions (default equal). Rows enter `stagger` frames
 * apart after the header (or at `rowAt[i]`). `focus` cues move the ring; the last one stays until `until`.
 */
export const DataTable: React.FC<{
  header: string[];
  rows: Cell[][];
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  widths?: number[];
  rowAt?: number[];
  stagger?: number;
  rowH?: number;
  size?: number;
  monoCols?: number[]; // columns set in mono (commands, numbers)
  focus?: TableFocus[];
  align?: ("left" | "center" | "right")[];
}> = ({ header, rows, x, y, w = 900, at, until, widths, rowAt, stagger = 4, rowH = 84, size = 32, monoCols = [], focus = [], align }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const n = header.length;
  const fr = widths ?? header.map(() => 1 / n);
  const sum = fr.reduce((a, b) => a + b, 0);
  const colW = fr.map((f) => (f / sum) * w);
  const colX = colW.map((_, i) => colW.slice(0, i).reduce((a, b) => a + b, 0));
  const headH = rowH * 0.9;

  // Focus ring: interpolate between consecutive cues (easeInOut glide), fade in on the first.
  const cues = [...focus].sort((a, b) => a.at - b.at).filter((f) => f.at <= frame);
  const boxOf = (f: TableFocus) => {
    const c0 = f.col ?? 0;
    const c1 = f.col === undefined ? n - 1 : c0 + (f.cols ?? 1) - 1;
    return { x: colX[c0], y: headH + f.row * rowH, w: colX[c1] + colW[c1] - colX[c0], h: rowH };
  };
  let ring: { x: number; y: number; w: number; h: number; o: number } | null = null;
  if (cues.length) {
    const cur = boxOf(cues[cues.length - 1]);
    const t = cues.length > 1 ? prog(frame, cues[cues.length - 1].at, 10, easeInOut) : 1;
    const prev = cues.length > 1 ? boxOf(cues[cues.length - 2]) : cur;
    const l = (a: number, b: number) => a + (b - a) * t;
    ring = { x: l(prev.x, cur.x), y: l(prev.y, cur.y), w: l(prev.w, cur.w), h: l(prev.h, cur.h), o: prog(frame, cues[0].at, 8) };
  }

  const cellStyle = (ci: number): React.CSSProperties => ({
    position: "absolute",
    left: colX[ci],
    width: colW[ci],
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: align?.[ci] === "right" ? "flex-end" : align?.[ci] === "center" ? "center" : "flex-start",
    padding: "0 24px",
    boxSizing: "border-box",
    whiteSpace: "pre",
    overflow: "hidden",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: headH + rows.length * rowH,
        background: C.white,
        borderRadius: 28,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        overflow: "hidden",
        ...materialize(p),
      }}
    >
      <div style={{ position: "relative", height: headH, background: "#F2F2F4", borderBottom: `1px solid ${C.line}` }}>
        {header.map((h, ci) => (
          <div key={ci} style={{ ...cellStyle(ci), fontFamily: sans, fontWeight: 700, fontSize: size * 0.8, color: C.mute, letterSpacing: "-0.01em" }}>
            {h}
          </div>
        ))}
      </div>
      {rows.map((row, ri) => {
        const rp = prog(frame, rowAt?.[ri] ?? at + 6 + ri * stagger, 8);
        return (
          <div
            key={ri}
            style={{
              position: "absolute",
              left: 0,
              top: headH + ri * rowH,
              width: w,
              height: rowH,
              borderTop: ri ? `1px solid ${C.line}` : undefined,
              opacity: rp,
              translate: `${(1 - rp) * 24}px 0px`,
            }}
          >
            {row.map((cell, ci) => {
              const c = typeof cell === "string" ? { t: cell } : cell;
              const tone = c.tone ? TONES[c.tone] : null;
              const isMono = c.mono ?? monoCols.includes(ci);
              return (
                <div
                  key={ci}
                  style={{
                    ...cellStyle(ci),
                    background: tone?.bg,
                    fontFamily: isMono ? mono : sans,
                    fontWeight: c.b || tone ? 700 : isMono ? 500 : 600,
                    fontSize: isMono ? size * 0.92 : size,
                    letterSpacing: isMono ? undefined : "-0.01em",
                    color: tone?.fg ?? C.ink,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {c.t}
                </div>
              );
            })}
          </div>
        );
      })}
      {ring ? (
        <div
          style={{
            position: "absolute",
            left: ring.x + 4,
            top: ring.y + 4,
            width: ring.w - 8,
            height: ring.h - 8,
            border: `4px solid ${C.accent}`,
            borderRadius: 16,
            boxSizing: "border-box",
            opacity: ring.o,
          }}
        />
      ) : null}
    </div>
  );
};
