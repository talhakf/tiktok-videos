import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, easeInOut, easeOut, materialize, mono, prog } from "../../theme";
import { presence } from "./Node";

// Cells that fill one by one (queue slots, partitions, cache lines) and a pipe where messages slide in
// and pile up at the far end. Labels are mono.

export type CellFill = { index?: number; cell?: [number, number]; at: number; until?: number; color?: string; label?: string };

/**
 * rows × cols grid at `x, y` (top-left). Empty cells stagger in from `at` (40ms apart). Each fill colours a
 * cell (`index` row-major, or `cell: [row, col]`) at its `at` and clears it at `until`. Default fill is blue
 * with a white label. Optional `rowLabels` sit to the left of each row (grey mono).
 */
export const CellGrid: React.FC<{
  x: number;
  y: number;
  rows: number;
  cols: number;
  at: number;
  until?: number;
  fills?: CellFill[];
  cell?: number;
  gap?: number;
  rowLabels?: string[];
}> = ({ x, y, rows, cols, at, until, fills = [], cell = 84, gap = 12, rowLabels }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const vis = presence(frame, at, until, 1);
  if (vis === null) return null;
  const pos = (r: number, c: number) => ({ left: x + c * (cell + gap), top: y + r * (cell + gap) });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: vis }}>
      {rowLabels?.map((l, r) => (
        <div
          key={`l${r}`}
          style={{
            position: "absolute",
            right: width - x + 20,
            top: pos(r, 0).top,
            height: cell,
            display: "flex",
            alignItems: "center",
            fontFamily: mono,
            fontWeight: 500,
            fontSize: 22,
            color: C.mute,
            whiteSpace: "nowrap",
            opacity: prog(frame, at + r * 3, 9),
          }}
        >
          {l}
        </div>
      ))}
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const p = prog(frame, at + i * 1.2, 9);
        if (p <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos(r, c),
              width: cell,
              height: cell,
              borderRadius: 16,
              background: C.white,
              border: "2px solid rgba(0,0,0,0.08)",
              ...materialize(p),
            }}
          />
        );
      })}
      {fills.map((f, j) => {
        const i = f.index ?? (f.cell ? f.cell[0] * cols + f.cell[1] : j);
        const p = presence(frame, f.at, f.until, 8, 8);
        if (p === null) return null;
        const color = f.color ?? C.accent;
        return (
          <div
            key={`f${j}`}
            style={{
              position: "absolute",
              ...pos(Math.floor(i / cols), i % cols),
              width: cell,
              height: cell,
              borderRadius: 16,
              background: color,
              border: `2px solid ${color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: cell * 0.3,
              color: color === C.white ? C.ink : C.white,
              ...materialize(p, 0.86, 6),
            }}
          >
            {f.label}
          </div>
        );
      })}
    </div>
  );
};

export type PipeItem = { label: string; at: number; out?: number; color?: string };

/**
 * Horizontal tube at `x, y` (top-left), `w` wide. Each item slides in from the left end at `at` and settles
 * against the right end or the item before it; `out` sends it out of the right end, and the queue behind it
 * shuffles up (easeInOut). Optional grey mono `label` under the tube.
 */
export const Pipe: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  at: number;
  until?: number;
  items: PipeItem[];
  block?: number;
  gap?: number;
  travel?: number;
  label?: string;
}> = ({ x, y, w, h = 104, at, until, items, block = 120, gap = 10, travel = 20, label }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const pad = 12;
  const inner = w - 6;
  const slotX = (s: number) => inner - pad - (s + 1) * block - s * gap;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...materialize(vis) }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: h / 2,
          background: C.white,
          border: "3px solid rgba(0,0,0,0.10)",
          boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {items.map((it, i) => {
          if (frame < it.at) return null;
          // slot = items ahead of me still in the tube (smoothly shrinking as they leave)
          const ahead = items.slice(0, i).reduce((n, o) => n + (frame < o.at ? 0 : 1 - (o.out !== undefined ? prog(frame, o.out, 12, easeInOut) : 0)), 0);
          const target = slotX(ahead);
          const inP = prog(frame, it.at, travel, easeOut);
          const outP = it.out !== undefined ? prog(frame, it.out, 12, easeOut) : 0;
          if (outP >= 1) return null;
          const left = -block + (target + block) * inP + outP * (inner - target + 10);
          const color = it.color ?? C.accent;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left,
                top: pad,
                width: block,
                height: h - 6 - pad * 2,
                borderRadius: 16,
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 24,
                color: C.white,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
              }}
            >
              {it.label}
            </div>
          );
        })}
      </div>
      {label ? (
        <div style={{ position: "absolute", top: h + 14, left: 0, right: 0, textAlign: "center", fontFamily: mono, fontWeight: 500, fontSize: 22, color: C.mute }}>
          {label}
        </div>
      ) : null}
    </div>
  );
};
