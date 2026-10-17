import { useCurrentFrame } from "remotion";
import { C, materialize, mono, prog, SHADOW_WINDOW, TERM } from "../../theme";
import { presence, tint, TrafficLights } from "./MacWindow";

// A dark code editor in the Terminal's palette: line numbers, typed lines, coloured bands
// (e.g. merge-conflict "ours" / "theirs"), a block cursor and a vim-like status line.

export type CodeSeg = { t: string; c?: string; b?: boolean };
type Code = string | CodeSeg | CodeSeg[];
/** A line: plain text, one segment, segments, or `{ code, at?, typeAt?, typeFrames? }` for timed lines. */
export type CodeLine = Code | { code: Code; at?: number; typeAt?: number; typeFrames?: number };

const BAR = 60;
const PAD = 22;
const LH = 1.5;

const segsOf = (c: Code): CodeSeg[] => (typeof c === "string" ? [{ t: c }] : Array.isArray(c) ? c : [c]);
const isTimed = (l: CodeLine): l is { code: Code; at?: number; typeAt?: number; typeFrames?: number } =>
  typeof l === "object" && !Array.isArray(l) && "code" in l;

/** Page y of the top of editor line `line` (1-based, as numbered in the gutter). */
export const editorLineY = (y: number, line: number, fontSize = 26) => y + BAR + PAD + (line - 1) * fontSize * LH;
/** Page x of column `col` (1-based) in an editor at x, with `lineCount` lines (sets the gutter width). */
export const editorColX = (x: number, col: number, fontSize = 26, lineCount = 9) =>
  x + gutterW(fontSize, lineCount) + (col - 1) * fontSize * 0.6;
const gutterW = (fs: number, n: number) => 24 + String(n).length * fs * 0.6 + 26;

/**
 * Dark code editor window (title bar like the Terminal). `lines` render with a line-number gutter; timed
 * lines appear at `at` or type in from `typeAt`. `bands` tint whole lines `from`–`to` (1-based, inclusive)
 * with a colour strip and an optional label on the right. `cursor`: block cursor positions over time
 * (`line`, `col` 1-based; `bar` = thin insert caret); while a line types, the cursor follows it.
 * `status`: bottom line text over time (e.g. "-- insert --"), `statusRight` e.g. "main.py  12:4".
 */
export const EditorWindow: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  lines: CodeLine[];
  title?: string;
  at?: number;
  until?: number;
  fontSize?: number;
  bands?: { from: number; to: number; color: string; label?: string; at: number; until?: number }[];
  cursor?: { line: number; col: number; at: number; bar?: boolean }[];
  status?: { t: string; at: number }[] | string;
  statusRight?: string;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, lines, title = "untitled", at = 0, until, fontSize = 26, bands = [], cursor = [], status, statusRight, style }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;
  const fs = fontSize;
  const lh = fs * LH;
  const gw = gutterW(fs, lines.length);
  const cw = fs * 0.6;
  const statusH = status !== undefined || statusRight ? 50 : 0;
  const blinkOn = Math.floor(frame / 15) % 2 === 0;

  // Visible text of every line at this frame, and the cursor a typing line forces.
  let typingCursor: { line: number; col: number } | null = null;
  const rows = lines.map((l, i) => {
    const segs = segsOf(isTimed(l) ? l.code : l);
    const len = segs.reduce((a, s) => a + s.t.length, 0);
    const appear = isTimed(l) ? (l.at ?? l.typeAt ?? at) : at;
    if (frame < appear) return null;
    let n = len;
    if (isTimed(l) && l.typeAt !== undefined) {
      const tf = l.typeFrames ?? Math.min(40, Math.max(6, Math.round(len * 1.2)));
      n = Math.max(0, Math.min(len, Math.floor(((frame - l.typeAt) / tf) * len)));
      if (frame >= l.typeAt && frame < l.typeAt + tf + 2) typingCursor = { line: i + 1, col: n + 1 };
    }
    const out: CodeSeg[] = [];
    let left = n;
    for (const s of segs) {
      if (left <= 0) break;
      out.push({ ...s, t: s.t.slice(0, left) });
      left -= s.t.length;
    }
    const fade = isTimed(l) && l.at !== undefined && l.typeAt === undefined ? prog(frame, l.at, 6) : 1;
    return { segs: out, fade };
  });

  const cur = typingCursor ?? cursor.filter((c) => frame >= c.at).pop() ?? null;
  const curBar = !typingCursor && cursor.filter((c) => frame >= c.at).pop()?.bar;
  const lastMove = Math.max(-1e9, ...cursor.filter((c) => frame >= c.at).map((c) => c.at));
  const curOn = typingCursor !== null || frame - lastMove < 20 || blinkOn;
  const statusText = typeof status === "string" ? status : status?.filter((s) => frame >= s.at).pop()?.t ?? "";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 26,
        background: TERM.bg,
        border: `1px solid ${C.line}`,
        boxShadow: SHADOW_WINDOW,
        overflow: "hidden",
        ...materialize(p),
        ...style,
      }}
    >
      <div style={{ height: BAR, background: TERM.bar, display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
        <TrafficLights />
        <div style={{ flex: 1, textAlign: "center", marginRight: 78, fontFamily: mono, fontSize: 22, color: TERM.dim }}>{title}</div>
      </div>
      <div style={{ position: "relative", height: h - BAR - statusH, overflow: "hidden", fontFamily: mono, fontSize: fs, lineHeight: LH }}>
        {bands.map((b, i) => {
          const bp = frame < b.at ? 0 : prog(frame, b.at, 8) * (1 - (b.until !== undefined ? prog(frame, b.until, 6) : 0));
          if (bp <= 0) return null;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: PAD + (b.from - 1) * lh,
                height: (b.to - b.from + 1) * lh,
                background: tint(b.color, 0.16),
                borderLeft: `5px solid ${b.color}`,
                opacity: bp,
              }}
            >
              {b.label ? (
                <div
                  style={{
                    position: "absolute",
                    right: 18,
                    top: (lh - fs * 0.8 * 1.6) / 2,
                    padding: "0 12px",
                    borderRadius: 8,
                    background: tint(b.color, 0.22),
                    color: b.color,
                    fontSize: fs * 0.8,
                    lineHeight: 1.6,
                    fontWeight: 700,
                  }}
                >
                  {b.label}
                </div>
              ) : null}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, top: PAD, right: 0 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ height: lh, display: "flex", whiteSpace: "pre" }}>
              <div style={{ width: gw - 26, flexShrink: 0, textAlign: "right", color: TERM.dim, opacity: r ? 0.7 : 0.35 }}>{r || i === 0 ? i + 1 : ""}</div>
              <div style={{ marginLeft: 26, opacity: r?.fade ?? 0, translate: `0px ${(1 - (r?.fade ?? 1)) * 6}px` }}>
                {r?.segs.map((s, k) => (
                  <span key={k} style={{ color: s.c ?? TERM.fg, fontWeight: s.b ? 700 : 500 }}>
                    {s.t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {cur ? (
          <div
            style={{
              position: "absolute",
              left: gw + (cur.col - 1) * cw,
              top: PAD + (cur.line - 1) * lh + fs * 0.12,
              width: curBar ? 3 : cw,
              height: lh - fs * 0.24,
              background: TERM.fg,
              opacity: curOn ? (curBar ? 1 : 0.75) : 0,
            }}
          />
        ) : null}
      </div>
      {statusH ? (
        <div
          style={{
            height: statusH,
            background: TERM.bar,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            fontFamily: mono,
            fontSize: 22,
          }}
        >
          <span style={{ color: TERM.fg, fontWeight: 700 }}>{statusText}</span>
          <span style={{ color: TERM.dim }}>{statusRight}</span>
        </div>
      ) : null}
    </div>
  );
};
