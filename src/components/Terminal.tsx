import { useCurrentFrame } from "remotion";
import { C, materialize, mono, prog, SHADOW_WINDOW, TERM } from "../theme";

// A macOS terminal window that "types" commands and prints output, all frame-driven.
// Output lines cascade in (40ms stagger, ease-out), overflow scrolls smoothly, and a fresh
// window body materializes from a light blur instead of hard-swapping.

export type Seg = { t: string; c?: string; b?: boolean; icon?: "dir" | "file"; bg?: string; square?: boolean }; // square: no rounded bg (QR cells)
export type Line = string | Seg | Seg[];
export type Block = {
  at: number; // frame the command starts typing
  cmd?: string;
  typeFrames?: number; // default: ~1.4 frames per character, capped
  out?: Line[];
  outDelay?: number; // frames between typing finished and output
};

const Icon: React.FC<{ kind: "dir" | "file"; color: string }> = ({ kind, color }) => (
  <svg width="0.85em" height="0.85em" viewBox="0 0 16 16" style={{ marginRight: "0.45em", verticalAlign: "-0.08em" }}>
    {kind === "dir" ? (
      <path d="M1 3.5h5l1.5 1.5H15v8.5H1z" fill={color} />
    ) : (
      <path d="M3 1h7l3 3v11H3z M10 1v3h3" fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    )}
  </svg>
);

export const Segs: React.FC<{ line: Line }> = ({ line }) => {
  const segs: Seg[] = typeof line === "string" ? [{ t: line }] : Array.isArray(line) ? line : [line];
  return (
    <>
      {segs.map((s, i) => (
        <span key={i} style={{ color: s.c ?? TERM.fg, fontWeight: s.b ? 700 : 500, background: s.bg, borderRadius: s.bg && !s.square ? 4 : 0 }}>
          {s.icon ? <Icon kind={s.icon} color={s.c ?? TERM.fg} /> : null}
          {s.t}
        </span>
      ))}
    </>
  );
};

// The prompt every command line starts with. Default "~ $ " (4 columns); pass `prompt` for others,
// e.g. ">>> " (Python REPL) or "C:\\> " (Windows). Ring math needs its width: `promptCols`.
export type Prompt = React.ReactNode;
const DefaultPrompt: React.FC = () => (
  <>
    <span style={{ color: TERM.blue, fontWeight: 700 }}>~ </span>
    <span style={{ color: TERM.green, fontWeight: 700 }}>$ </span>
  </>
);
export const PROMPT_COLS = 4;

// ---------- line helpers (colored segments) ----------
export const dim = (t: string): Seg => ({ t, c: TERM.dim });
export const red = (t: string): Line => [{ t, c: TERM.red }];
export const green = (t: string): Line => [{ t, c: TERM.green, b: true }];
export const yellow = (t: string): Line => [{ t, c: TERM.yellow }];
export const file = (name: string): Seg => ({ t: name, c: TERM.fg, icon: "file" });
export const dir = (name: string): Seg => ({ t: name, c: TERM.blue, b: true, icon: "dir" });

// ---------- coordinates inside a terminal body ----------
/** Page x of character column `i` (monospace advance = 0.6 em). */
export const termColX = (tx: number, i: number, fontSize = 28) => tx + 28 + i * fontSize * 0.6;
/** Page y of body line `i` (60 title bar + 22 padding, line height 1.38 em). */
export const termLineY = (ty: number, i: number, fontSize = 28) => ty + 82 + i * fontSize * 1.38;
/**
 * Focus-ring box (for `Circle`) around `cols` characters from column `col`, on `rows` lines from `line`,
 * in a terminal at (tx, ty). Count the prompt: a command starts at column PROMPT_COLS.
 */
export const termRing = (tx: number, ty: number, fontSize: number, line: number, col: number, cols: number, rows = 1) => ({
  x: termColX(tx, col, fontSize) - 12,
  y: termLineY(ty, line, fontSize) - 6,
  w: cols * fontSize * 0.6 + 24,
  h: rows * fontSize * 1.38 + 12,
});

export const typeFramesFor = (cmd: string) => Math.min(30, Math.max(6, Math.round(cmd.length * 1.4)));
/** Window height in px for `rows` visible text lines (60 title bar + 44 vertical padding + breathing room). */
export const termH = (rows: number, fontSize = 28) => Math.ceil(rows * fontSize * 1.38 + 150);

type Row = { key: string; t: number; animate: boolean; node: React.ReactNode };

/**
 * The typing engine of `Terminal` without the window: commands type, output cascades in, overflow scrolls.
 * Used by `Terminal` and by the panes of `TmuxWindow`. `bodyH` = the visible height in px.
 */
export const TermLines: React.FC<{ blocks: Block[]; fontSize?: number; bodyH: number; prompt?: Prompt; cursor?: boolean }> = ({
  blocks,
  fontSize = 28,
  bodyH,
  prompt,
  cursor: showCursors = true,
}) => {
  const frame = useCurrentFrame();
  const lineH = fontSize * 1.38;
  const maxLines = Math.floor(bodyH / lineH);
  const blinkOn = Math.floor(frame / 15) % 2 === 0;
  const cursor = (on: boolean) => (showCursors ? <span style={{ background: on ? TERM.fg : "transparent" }}> </span> : null);
  const promptNode =
    prompt === undefined ? <DefaultPrompt /> : typeof prompt === "string" ? <span style={{ color: TERM.green, fontWeight: 700 }}>{prompt}</span> : prompt;
  // Build every row with the frame it appears on (rows in the future are skipped).
  const rows: Row[] = [];
  const visible = blocks.filter((b) => frame >= b.at);
  visible.forEach((b, bi) => {
    const isLast = bi === visible.length - 1;
    if (b.cmd !== undefined) {
      const tf = b.typeFrames ?? typeFramesFor(b.cmd);
      const n = Math.min(b.cmd.length, Math.floor(((frame - b.at) / tf) * b.cmd.length));
      const typing = n < b.cmd.length;
      const outStart = b.at + tf + (b.outDelay ?? 4);
      const showCursor = isLast && (typing || !b.out || frame < outStart);
      rows.push({
        key: `c${bi}`,
        t: b.at,
        animate: false,
        node: (
          <>
            {promptNode}
            <span style={{ color: TERM.fg }}>{b.cmd.slice(0, n)}</span>
            {showCursor ? cursor(typing || blinkOn) : null}
          </>
        ),
      });
      if (b.out) {
        b.out.forEach((l, li) => {
          const t = outStart + li * 1.2;
          if (frame >= t) rows.push({ key: `o${bi}-${li}`, t, animate: true, node: <Segs line={l} /> });
        });
        const pt = outStart + b.out.length * 1.2;
        if (isLast && frame >= pt) {
          rows.push({ key: `p${bi}`, t: pt, animate: false, node: <>{promptNode}{cursor(blinkOn)}</> });
        }
      }
    } else if (b.out) {
      b.out.forEach((l, li) => {
        const t = b.at + li * 1.2;
        if (frame >= t) rows.push({ key: `o${bi}-${li}`, t, animate: true, node: <Segs line={l} /> });
      });
    }
  });
  if (blocks.length && visible.length === 0) {
    rows.push({ key: "idle", t: -1e9, animate: false, node: <>{promptNode}{cursor(blinkOn)}</> });
  }

  // Smooth scroll: every row past the visible height pushes the content up over 6 frames.
  let scroll = 0;
  rows.forEach((r, i) => {
    if (i >= maxLines) scroll += prog(frame, r.t, 6);
  });


  return (
    <div style={{ translate: `0px ${-scroll * lineH}px` }}>
      {rows.map((r) => {
        const p = r.animate ? prog(frame, r.t, 5) : 1;
        return (
          <div key={r.key} style={{ whiteSpace: "pre", minHeight: "1.38em", opacity: p, translate: `0px ${(1 - p) * 8}px` }}>
            {r.node}
          </div>
        );
      })}
    </div>
  );
};

export const Terminal: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  blocks?: Block[];
  fontSize?: number;
  enterAt?: number; // body materializes from blur at this frame
  at?: number; // whole window materializes in at this frame
  until?: number; // whole window materializes out at this frame
  children?: React.ReactNode; // custom body (e.g. a TUI) instead of blocks
  style?: React.CSSProperties;
  prompt?: Prompt; // replaces "~ $ " (string or colored node)
}> = ({ x, y, w, h, title = "sudo@laptop: ~", blocks = [], fontSize = 28, enterAt, at, until, children, style, prompt }) => {
  const frame = useCurrentFrame();
  if (at !== undefined && frame < at) return null;
  const winIn = at !== undefined && at > 0 ? prog(frame, at, 9) : 1;
  const winOut = until !== undefined ? prog(frame, until, 7) : 0;
  if (winOut >= 1) return null;
  const winStyle = at !== undefined || until !== undefined ? materialize(winIn * (1 - winOut)) : undefined;
  const bodyH = h - 60 - 44;
  const enter = enterAt !== undefined ? prog(frame, enterAt, 8) : 1;

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
        ...winStyle,
        ...style,
      }}
    >
      <div style={{ height: 60, background: TERM.bar, display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
        ))}
        <div style={{ flex: 1, textAlign: "center", marginRight: 78, fontFamily: mono, fontSize: 22, color: TERM.dim }}>{title}</div>
      </div>
      <div
        style={{
          padding: "22px 28px",
          height: bodyH,
          overflow: "hidden",
          fontFamily: mono,
          fontSize,
          lineHeight: 1.38,
          color: TERM.fg,
          ...materialize(enter, 1, 6),
        }}
      >
        {children ?? <TermLines blocks={blocks} fontSize={fontSize} bodyH={bodyH} prompt={prompt} />}
      </div>
    </div>
  );
};
