import { interpolateColors, useCurrentFrame } from "remotion";
import { C, easeInOut, materialize, mono, prog, SHADOW_WINDOW, TERM } from "../../theme";
import { Block, Prompt, TermLines } from "../Terminal";

// A dark terminal window running tmux: panes split in half on cue (the old pane shrinks while the new one
// grows in), the active pane gets tmux's green border, a green status bar sits at the bottom, and `detachAt`
// folds everything away to "[detached (from session …)]" (attach brings it back with `attachAt`).

export type TmuxPane = {
  id: string;
  blocks?: Block[]; // typed commands + output, same as Terminal
  split?: { of: string; dir: "right" | "down"; at: number }; // "%" = right, '"' = down. The first pane has none.
};
type Rect = { x: number; y: number; w: number; h: number };

const BAR = 60; // title bar
const STATUS = 46; // tmux status line
const GAP = 3; // pane separator
const TMUX_GREEN = "#5AD27A";

/** Pane rectangles at `frame` (0..1 units of the body), replaying every split that has started. */
export const tmuxLayout = (frame: number, panes: TmuxPane[]): Record<string, Rect> => {
  const r: Record<string, Rect> = {};
  for (const p of panes) {
    if (!p.split) {
      r[p.id] = { x: 0, y: 0, w: 1, h: 1 };
      continue;
    }
    const parent = r[p.split.of];
    if (!parent || frame < p.split.at) continue;
    const t = prog(frame, p.split.at, 12, easeInOut);
    if (p.split.dir === "right") {
      const half = parent.w * (1 - t / 2);
      r[p.id] = { x: parent.x + half, y: parent.y, w: parent.w - half, h: parent.h };
      r[p.split.of] = { ...parent, w: half };
    } else {
      const half = parent.h * (1 - t / 2);
      r[p.id] = { x: parent.x, y: parent.y + half, w: parent.w, h: parent.h - half };
      r[p.split.of] = { ...parent, h: half };
    }
  }
  return r;
};

/**
 * tmux in a terminal window. `focus` moves the green active border (default: the newest pane), `windows`
 * are the status-bar tabs, `detachAt` / `attachAt` hide and bring back the panes.
 */
export const TmuxWindow: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  panes: TmuxPane[];
  at?: number;
  until?: number;
  focus?: { pane: string; at: number }[];
  session?: string;
  windows?: string[];
  fontSize?: number;
  title?: string;
  prompt?: Prompt;
  detachAt?: number;
  attachAt?: number;
  right?: string; // right side of the status bar (tmux default: pane title, time, date)
}> = ({
  x,
  y,
  w,
  h,
  panes,
  at = 0,
  until,
  focus = [],
  session = "raccoon",
  windows = ["zsh"],
  fontSize = 24,
  title,
  prompt,
  detachAt,
  attachAt,
  right = '"laptop" 03:07 11-Oct-26',
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  const enter = prog(frame, at, 10) * (1 - out);

  const layout = tmuxLayout(frame, panes);
  const bodyW = w;
  const bodyH = h - BAR - STATUS;

  // Active pane: last focus cue, else the newest split that has started.
  const started = panes.filter((p) => layout[p.id]);
  const cue = [...focus].sort((a, b) => a.at - b.at).filter((f) => f.at <= frame).pop();
  const lastSplit = [...started].filter((p) => p.split).sort((a, b) => a.split!.at - b.split!.at).pop();
  const active = cue && (!lastSplit || cue.at >= lastSplit.split!.at) ? cue.pane : (lastSplit?.id ?? panes[0].id);

  // Detached: the panes blur out, a single line remains; attaching reverses it.
  const det = detachAt !== undefined ? prog(frame, detachAt, 10) * (attachAt !== undefined ? 1 - prog(frame, attachAt, 10) : 1) : 0;
  const winTitle = title ?? (det > 0.5 ? "sudo@laptop: ~" : `tmux · ${session}`);

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
        ...materialize(enter),
      }}
    >
      <div style={{ height: BAR, background: TERM.bar, display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
        ))}
        <div style={{ flex: 1, textAlign: "center", marginRight: 78, fontFamily: mono, fontSize: 22, color: TERM.dim }}>{winTitle}</div>
      </div>

      <div style={{ position: "relative", height: bodyH, opacity: 1 - det, filter: det > 0 ? `blur(${det * 8}px)` : undefined }}>
        {started.map((p) => {
          const r = layout[p.id];
          const isNew = p.split ? prog(frame, p.split.at + 4, 8) : 1;
          const on = active === p.id ? prog(frame, Math.max(cue?.at ?? 0, p.split?.at ?? 0), 6) : 0;
          const px = r.x * bodyW + (r.x > 0 ? GAP : 0);
          const py = r.y * bodyH + (r.y > 0 ? GAP : 0);
          const pw = r.w * bodyW - (r.x > 0 ? GAP : 0);
          const ph = r.h * bodyH - (r.y > 0 ? GAP : 0);
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: px,
                top: py,
                width: pw,
                height: ph,
                boxSizing: "border-box",
                border: `2px solid ${interpolateColors(on, [0, 1], ["#3A3A3C", TMUX_GREEN])}`,
                overflow: "hidden",
                padding: "14px 18px",
                fontFamily: mono,
                fontSize,
                lineHeight: 1.38,
                color: TERM.fg,
              }}
            >
              <div style={{ opacity: isNew }}>
                <TermLines blocks={p.blocks ?? []} fontSize={fontSize} bodyH={ph - 28} prompt={prompt} cursor={active === p.id} />
              </div>
            </div>
          );
        })}
      </div>

      {det > 0 ? (
        <div style={{ position: "absolute", left: 28, top: BAR + 22, fontFamily: mono, fontSize, color: TERM.fg, opacity: det, whiteSpace: "pre" }}>
          [detached (from session {session})]
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: w,
          height: STATUS,
          background: TMUX_GREEN,
          opacity: 1 - det,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "0 18px",
          fontFamily: mono,
          fontSize: 22,
          fontWeight: 500,
          color: "#0B0B0C",
          whiteSpace: "pre",
        }}
      >
        <span>[{session}]</span>
        {windows.map((name, i) => (
          <span key={name}>
            {i}:{name}
            {i === windows.length - 1 ? "*" : "-"}
          </span>
        ))}
        <span style={{ marginLeft: "auto" }}>{right}</span>
      </div>
    </div>
  );
};
