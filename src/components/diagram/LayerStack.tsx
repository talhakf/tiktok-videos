import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, easeInOut, easeOut, materialize, prog, sans } from "../../theme";
import { BLUE_TINT } from "./Node";

// Vertical stack of layers that builds bottom-up (hardware, OS, runtime, app...). For "VM vs container",
// render two stacks side by side. A layer's label can be a list: the bar then splits into equal cells.

export type LayerTone = "white" | "soft" | "ink" | "blue" | "accent";
export type Layer = { label: string | string[]; icon?: IconName; at: number; tone?: LayerTone };
export type LayerBracket = { from: number; to: number; label: string; at: number; side?: "left" | "right" };

const TONES: Record<LayerTone, { bg: string; fg: string; border: string }> = {
  white: { bg: C.white, fg: C.ink, border: "rgba(0,0,0,0.10)" },
  soft: { bg: C.soft, fg: C.ink, border: "transparent" },
  ink: { bg: C.ink, fg: C.white, border: C.ink },
  blue: { bg: BLUE_TINT, fg: C.accent, border: C.accent },
  accent: { bg: C.accent, fg: C.white, border: C.accent },
};

/**
 * Layer stack at `x, y` (top-left of the whole stack), `w` wide. `layers` are listed bottom-up and each drops
 * in at its `at` (cells of a split layer 1.2 frames apart). `brackets` draw a thin bracket beside a range of
 * layers (indices bottom-up, inclusive) with a vertical label, e.g. "per app".
 */
export const LayerStack: React.FC<{
  x: number;
  y: number;
  w: number;
  layers: Layer[];
  layerH?: number;
  gap?: number;
  size?: number;
  until?: number;
  title?: string;
  titleAt?: number;
  brackets?: LayerBracket[];
}> = ({ x, y, w, layers, layerH = 88, gap = 10, size = 28, until, title, titleAt, brackets = [] }) => {
  const frame = useCurrentFrame();
  const first = Math.min(...layers.map((l) => l.at), titleAt ?? Infinity);
  if (frame < first) return null;
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  const total = layers.length * layerH + (layers.length - 1) * gap;
  const top = (i: number) => y + total - (i + 1) * layerH - i * gap; // i counts from the bottom
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      {title ? (
        <div
          style={{
            position: "absolute",
            left: x,
            width: w,
            top: y - 66,
            textAlign: "center",
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 38,
            letterSpacing: "-0.03em",
            color: C.ink,
            ...materialize(prog(frame, titleAt ?? first, 9)),
          }}
        >
          {title}
        </div>
      ) : null}
      {layers.map((l, i) => {
        const cells = Array.isArray(l.label) ? l.label : [l.label];
        const t = TONES[l.tone ?? "white"];
        const cw = (w - gap * (cells.length - 1)) / cells.length;
        return cells.map((label, k) => {
          const start = l.at + k * 1.2;
          const p = prog(frame, start, 10, easeOut);
          if (p <= 0) return null;
          return (
            <div
              key={`${i}-${k}`}
              style={{
                position: "absolute",
                left: x + k * (cw + gap),
                top: top(i),
                width: cw,
                height: layerH,
                borderRadius: 18,
                background: t.bg,
                border: `2.5px solid ${t.border}`,
                boxShadow: l.tone === "white" || !l.tone ? "0 6px 18px rgba(0,0,0,0.06)" : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "0 10px",
                fontFamily: sans,
                fontWeight: 600,
                fontSize: cells.length > 2 ? size * 0.82 : size,
                letterSpacing: "-0.02em",
                color: t.fg,
                whiteSpace: "nowrap",
                ...materialize(p),
                translate: `0px ${(1 - p) * -26}px`,
              }}
            >
              {l.icon && cells.length === 1 ? <Icon name={l.icon} size={size * 1.25} color={t.fg} draw={prog(frame, start + 3, 12)} /> : null}
              {label}
            </div>
          );
        });
      })}
      {brackets.map((b, j) => {
        const p = prog(frame, b.at, 12, easeInOut);
        if (p <= 0) return null;
        const left = (b.side ?? "right") === "left";
        const bx = left ? x - 22 : x + w + 22;
        const y0 = top(b.to) + 6;
        const y1 = top(b.from) + layerH - 6;
        const hook = left ? 10 : -10;
        return (
          <div key={j}>
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <path
                d={`M${bx + hook} ${y0} Q${bx} ${y0} ${bx} ${y0 + 10} V${y1 - 10} Q${bx} ${y1} ${bx + hook} ${y1}`}
                fill="none"
                stroke={C.mute}
                strokeWidth={2.5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - p}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                left: left ? bx - 20 : bx + 20,
                top: (y0 + y1) / 2,
                translate: "-50% -50%",
                rotate: left ? "-90deg" : "90deg",
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 24,
                letterSpacing: "-0.01em",
                color: C.mute,
                whiteSpace: "nowrap",
                opacity: prog(frame, b.at + 6, 9),
              }}
            >
              {b.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
