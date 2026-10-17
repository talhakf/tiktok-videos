import { useCurrentFrame } from "remotion";
import { presence } from "../diagram/Node";
import { C, mono, prog, TERM } from "../../theme";
import { BandLabel, DevCard, focusTrack, mixTone, TAB_H, Tone } from "./card";
import { CodeLang, DARK_SYNTAX, LIGHT_SYNTAX, sliceTokens, tokenize, tokensLength } from "./syntax";

// The workhorse code card: a white (or dark) card with syntax-highlighted code, line numbers and an
// optional file tab. Lines enter staggered, groups of lines appear on cue (`reveal`) or type in (`type`),
// and a tinted band picks out lines (`highlight`) while the rest dims. The band glides from one
// highlight to the next. Use it for snippets, config files, scripts; EditorWindow is the vim / conflict one.

const LH = 1.55;
const PAD = 26;

/** Lines as the gutter numbers them: a single line, or an inclusive [from, to] range. */
export type LineRange = number | [number, number];
export type CodeHighlight = { lines: LineRange; at: number; until?: number; tone?: Tone; label?: string };
export type CodeReveal = { from: number; to?: number; at: number };
export type CodeType = { from: number; to?: number; at: number; cps?: number };

const range = (r: LineRange): [number, number] => (typeof r === "number" ? [r, r] : r);
const gutterW = (size: number, last: number, numbers: boolean) => (numbers ? 30 + String(last).length * size * 0.6 + 26 : 34);

/** Page y of the top of code line `line` (1-based, counting from the first line of `code`). */
export const codeLineY = (y: number, line: number, { size = 28, filename = false }: { size?: number; filename?: boolean } = {}) =>
  y + (filename ? TAB_H : 0) + PAD + (line - 1) * size * LH;
/** Page x of column `col` (1-based) in a code card at x with `lines` lines (sets the gutter width). */
export const codeColX = (x: number, col: number, { size = 28, lines = 9, startLine = 1, lineNumbers = true } = {}) =>
  x + gutterW(size, startLine + lines - 1, lineNumbers) + (col - 1) * size * 0.6;
/** Card height for `lines` lines (what CodeBlock uses when `h` is not set). */
export const codeBlockH = (lines: number, { size = 28, filename = false }: { size?: number; filename?: boolean } = {}) =>
  (filename ? TAB_H : 0) + PAD * 2 + lines * size * LH;

/**
 * Code card at (x, y), `w` wide (900 = the content column: about 45 columns at size 28, 52 at 24).
 * `code` is the snippet ("\n"-separated), coloured for `lang`. Lines enter `stagger` frames apart at `at`.
 * `reveal`: lines `from`–`to` stay hidden until `at` (then stagger in). `type` / `typeAt`: lines type in
 * character by character from `at` at `cps` characters per frame (indentation is instant), with a caret.
 * `highlight`: tinted band on `lines` from `at` to `until` (tone accent / bad / warn / good, optional
 * `label` pill); `dimOthers` fades the other lines while a band is up. Lines don't wrap: keep them short.
 */
export const CodeBlock: React.FC<{
  code: string;
  lang?: CodeLang;
  x: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  dark?: boolean;
  filename?: string;
  right?: string; // grey text on the right of the tab, e.g. the language
  lineNumbers?: boolean;
  startLine?: number; // number of the first line in the gutter
  size?: number;
  stagger?: number;
  reveal?: CodeReveal[];
  type?: CodeType[];
  typeAt?: number; // shorthand: type the whole snippet from this frame
  cps?: number;
  highlight?: CodeHighlight[];
  dimOthers?: boolean;
  caret?: boolean;
  style?: React.CSSProperties;
}> = ({
  code,
  lang = "text",
  x,
  y,
  w = 900,
  h,
  at,
  until,
  dark,
  filename,
  right,
  lineNumbers = true,
  startLine = 1,
  size = 28,
  stagger = 1.2,
  reveal = [],
  type,
  typeAt,
  cps = 2,
  highlight = [],
  dimOthers = true,
  caret = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const pal = dark ? DARK_SYNTAX : LIGHT_SYNTAX;
  const lines = tokenize(code, lang);
  const n = lines.length;
  const lh = size * LH;
  const gw = gutterW(size, startLine + n - 1, lineNumbers);
  const cardH = h ?? codeBlockH(n, { size, filename: filename !== undefined });
  const types = type ?? (typeAt !== undefined ? [{ from: 1, to: n, at: typeAt, cps }] : []);

  // When each line starts, and how many characters it shows now.
  const timing = lines.map(() => ({ start: at + 6, typed: null as null | { from: number; cps: number } }));
  lines.forEach((_, i) => (timing[i].start = at + 6 + i * stagger));
  for (const r of reveal) {
    const [a, b] = [r.from, r.to ?? r.from];
    for (let l = a; l <= Math.min(b, n); l++) timing[l - 1].start = r.at + (l - a) * stagger;
  }
  for (const t of types) {
    const speed = t.cps ?? cps;
    let clock = t.at;
    for (let l = t.from; l <= Math.min(t.to ?? n, n); l++) {
      const tokens = lines[l - 1];
      const indent = (tokens.map((k) => k.t).join("").match(/^\s*/) ?? [""])[0].length;
      timing[l - 1] = { start: clock, typed: { from: indent, cps: speed } };
      const len = tokensLength(tokens) - indent;
      clock += Math.ceil(len / speed) + (len ? 3 : 1); // short beat at each line end
    }
  }
  let caretAt: { line: number; col: number } | null = null;
  const rows = lines.map((tokens, i) => {
    const tm = timing[i];
    if (frame < tm.start) return null;
    const len = tokensLength(tokens);
    if (tm.typed) {
      const shown = Math.min(len, tm.typed.from + Math.floor((frame - tm.start) * tm.typed.cps));
      if (shown < len || frame < tm.start + Math.ceil((len - tm.typed.from) / tm.typed.cps) + 3) caretAt = { line: i, col: shown };
      return { tokens: sliceTokens(tokens, shown), fade: 1 };
    }
    return { tokens, fade: prog(frame, tm.start, 7) };
  });
  // the caret stays only on the line being typed (the latest one)
  const typingLine = caretAt as { line: number; col: number } | null;

  // Highlight band (glides between consecutive cues) and the weight that keeps lines bright.
  const track = focusTrack(frame, highlight);
  let band: null | { top: number; height: number; colors: ReturnType<typeof mixTone>; label?: string; o: number } = null;
  const bright = (line: number) => {
    if (!track || !dimOthers) return 1;
    const inside = (c: CodeHighlight) => {
      const [a, b] = range(c.lines);
      return line >= a && line <= b ? 1 : 0;
    };
    const wIn = track.prev ? inside(track.prev) + (inside(track.cur) - inside(track.prev)) * track.t : inside(track.cur);
    return 1 - track.o * (1 - wIn) * 0.6;
  };
  if (track) {
    const box = (c: CodeHighlight) => {
      const [a, b] = range(c.lines);
      return { top: PAD + (a - 1) * lh, height: (b - a + 1) * lh };
    };
    const B = box(track.cur);
    const A = track.prev ? box(track.prev) : B;
    const l = (u: number, v: number) => u + (v - u) * track.t;
    band = {
      top: l(A.top, B.top),
      height: l(A.height, B.height),
      colors: mixTone(track.prev?.tone ?? track.cur.tone ?? "accent", track.cur.tone ?? "accent", track.t, dark),
      label: track.t > 0.5 ? track.cur.label : track.prev?.label,
      o: track.o,
    };
  }
  const blinkOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} dark={dark} filename={filename} right={right} style={style}>
      {band ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: band.top,
            height: band.height,
            background: band.colors.bg,
            borderLeft: `5px solid ${band.colors.edge}`,
            opacity: band.o,
          }}
        >
          {band.label ? <BandLabel text={band.label} color={band.colors.fg} bg={band.colors.bg} size={size * 0.78} lineH={lh} /> : null}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: PAD, fontFamily: mono, fontWeight: 500, fontSize: size, lineHeight: LH }}>
        {lines.map((_, i) => {
          const r = rows[i];
          const o = bright(i + 1);
          return (
            <div key={i} style={{ height: lh, display: "flex", whiteSpace: "pre" }}>
              {lineNumbers ? (
                <div
                  style={{
                    width: gw - 26,
                    flexShrink: 0,
                    textAlign: "right",
                    color: dark ? TERM.dim : "#AEAEB2",
                    opacity: (r ? r.fade : 0) * o,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {startLine + i}
                </div>
              ) : null}
              <div
                style={{
                  marginLeft: lineNumbers ? 26 : gw,
                  opacity: (r?.fade ?? 0) * o,
                  translate: `0px ${(1 - (r?.fade ?? 1)) * 8}px`,
                  position: "relative",
                }}
              >
                {r?.tokens.map((tk, k) => (
                  <span key={k} style={{ color: pal[tk.k] }}>
                    {tk.t}
                  </span>
                ))}
                {caret && typingLine && typingLine.line === i ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: 3,
                      height: size * 1.1,
                      verticalAlign: "middle",
                      marginTop: -size * 0.1,
                      background: dark ? TERM.fg : C.accent,
                      opacity: frame - timing[i].start < 2 || blinkOn || tokensLength(r?.tokens ?? []) < tokensLength(lines[i]) ? 1 : 0,
                    }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
