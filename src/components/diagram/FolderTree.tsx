import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { alpha, lerp } from "./Node";

// Folder tree map (Linux filesystem, a repo layout...). Rows are given as full paths in display order;
// depth and parents come from the paths. Names are mono, descriptions grey on the right.

export type TreeItem = { path: string; desc?: string; file?: boolean; collapsed?: boolean };

const parentOf = (p: string) => (p === "/" || !p.includes("/") ? null : p.slice(0, p.lastIndexOf("/")) || "/");
const depthOf = (p: string) => (p === "/" ? 0 : p.split("/").length - 1); // "/etc" 1, "app/src" 1
const nameOf = (p: string) => (p === "/" ? "/" : p.slice(p.lastIndexOf("/") + 1));

/**
 * Indented tree at `x, y` (top-left), `w` wide. Rows stagger in from `at` (`stagger` frames apart) with thin
 * connector lines drawing to each child. `desc` shows a grey note on the right at `descX`. A folder with
 * `collapsed` hides its children and shows "…". `highlight` walks a blue row highlight to each path at its
 * frame (path null hides it).
 */
export const FolderTree: React.FC<{
  x: number;
  y: number;
  items: TreeItem[];
  at: number;
  until?: number;
  stagger?: number;
  w?: number;
  rowH?: number;
  indent?: number;
  descX?: number;
  size?: number;
  highlight?: { path: string | null; at: number }[];
}> = ({ x, y, items, at, until, stagger = 2, w = 900, rowH = 64, indent = 52, descX = 380, size = 32, highlight = [] }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  const hidden = (p: string): boolean => {
    const par = parentOf(p);
    if (par === null) return false;
    const pi = items.find((it) => it.path === par);
    return Boolean(pi?.collapsed) || hidden(par);
  };
  const rows = items.filter((it) => !hidden(it.path));
  const icon = size * 1.1;
  const rowY = (i: number) => y + i * rowH + rowH / 2; // row centre
  const iconX = (it: TreeItem) => x + depthOf(it.path) * indent; // icon left edge

  // highlight: glide along the cues (row index as a float), fade in/out on null
  let hl = -1;
  let hlO = 0;
  for (const h of [...highlight].sort((a, b) => a.at - b.at)) {
    if (h.at > frame) break;
    const i = h.path === null ? -1 : rows.findIndex((r) => r.path === h.path);
    const p = prog(frame, h.at, 10, easeInOut);
    if (i < 0) hlO = lerp(hlO, 0, p);
    else if (hlO === 0 || hl < 0) {
      hl = i;
      hlO = prog(frame, h.at, 8);
    } else {
      hl = lerp(hl, i, p);
      hlO = lerp(hlO, 1, p);
    }
  }

  const lines = rows.map((it, i) => {
    const par = parentOf(it.path);
    const pi = rows.findIndex((r) => r.path === par);
    if (pi < 0) return null;
    let prev = -1;
    for (let j = i - 1; j > pi; j--) if (parentOf(rows[j].path) === par) { prev = j; break; }
    const vx = iconX(rows[pi]) + icon / 2;
    const y0 = prev >= 0 ? rowY(prev) : rowY(pi) + icon / 2 + 4;
    const y1 = rowY(i);
    const x1 = iconX(it) - 8;
    const r = 12;
    const d = `M${vx} ${y0} V${y1 - r} Q${vx} ${y1} ${vx + r} ${y1} H${x1}`;
    return { key: it.path, d, p: prog(frame, at + i * stagger, 10, easeInOut) };
  });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      {hl >= 0 && hlO > 0 ? (
        <div
          style={{
            position: "absolute",
            left: x - 18,
            top: y + hl * rowH + 4,
            width: w + 18,
            height: rowH - 8,
            borderRadius: 16,
            background: alpha(C.accent, 0.1),
            opacity: hlO,
          }}
        />
      ) : null}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {lines.map((l) =>
          l && l.p > 0 ? (
            <path key={l.key} d={l.d} fill="none" stroke="#C7C7CC" strokeWidth={2.5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - l.p} />
          ) : null,
        )}
      </svg>
      {rows.map((it, i) => {
        const p = prog(frame, at + i * stagger + 2, 9);
        if (p <= 0) return null;
        const near = hl >= 0 ? Math.max(0, 1 - Math.abs(hl - i)) * hlO : 0;
        const ink = interpolateColors(near, [0, 1], [C.ink, C.accent]);
        const iconCol = interpolateColors(near, [0, 1], [it.file ? C.mute : C.ink, C.accent]);
        return (
          <div key={it.path} style={{ ...materialize(p, 0.97, 6), transformOrigin: "left center" }}>
            <div
              style={{
                position: "absolute",
                left: iconX(it),
                top: rowY(i) - rowH / 2,
                height: rowH,
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontFamily: mono,
                fontWeight: 500,
                fontSize: size,
                color: ink,
                whiteSpace: "nowrap",
              }}
            >
              <Icon name={it.file ? "file" : "folder"} size={icon} color={iconCol} weight={1.9} draw={prog(frame, at + i * stagger, 12)} />
              <span>
                {nameOf(it.path)}
                {it.collapsed ? <span style={{ color: C.mute }}> …</span> : null}
              </span>
            </div>
            {it.desc ? (
              <div
                style={{
                  position: "absolute",
                  left: x + descX,
                  top: rowY(i) - rowH / 2,
                  height: rowH,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: sans,
                  fontWeight: 500,
                  fontSize: size * 0.82,
                  letterSpacing: "-0.01em",
                  color: interpolateColors(near, [0, 1], [C.mute, C.accent]),
                  whiteSpace: "nowrap",
                }}
              >
                {it.desc}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
