import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BAND, TX } from "../../layout";
import { appleSpring, C, easeInOut, GLASS, materialize, mono, prog } from "../../theme";
import { TrashCan } from "../Doodles";

// Things going into the bin and coming back out. Glass mono chips stack up, then glide one by one into a
// TrashCan (shrinking, fading only at the mouth); `FromTrash` is the reverse: chips pop out of the can and
// land in a list. The can's mouth: centre x canX + 93, lid top canY + 19.

/** Frosted-glass mono chip (a command, a file, a flag). Plain block: position it yourself. */
export const GlassChip: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 32, style }) => (
  <div
    style={{
      padding: `${size * 0.38}px ${size * 0.75}px`,
      ...GLASS,
      borderRadius: size * 0.62,
      fontFamily: mono,
      fontWeight: 500,
      fontSize: size,
      color: C.ink,
      whiteSpace: "pre",
      ...style,
    }}
  >
    {children}
  </div>
);

const mouth = (canX: number, canY: number) => ({ mx: canX + 93, my: canY + 19 });

/**
 * Chips appear stacked at (x, y) from `at`, then each glides into the trash can at its `drop` frame
 * (a number = the first drop, the rest follow every `dropStagger` frames). The can rises in at `canAt`.
 */
export const ChipDrop: React.FC<{
  items: string[];
  at: number;
  drop: number | number[];
  x?: number;
  y?: number;
  rowGap?: number;
  stagger?: number;
  dropStagger?: number;
  canX?: number;
  canY?: number;
  canAt?: number;
  showCan?: boolean;
  size?: number;
}> = ({ items, at, drop, x = TX + 30, y = BAND, rowGap = 78, stagger = 3, dropStagger = 4, canX = TX + 620, canY = BAND, canAt, showCan = true, size = 32 }) => {
  const frame = useCurrentFrame();
  const { mx, my } = mouth(canX, canY);
  return (
    <>
      {showCan ? <TrashCan at={canAt ?? at} x={canX} y={canY} /> : null}
      {items.map((label, i) => {
        const a = at + i * stagger;
        if (frame < a) return null;
        const dropAt = Array.isArray(drop) ? drop[i] ?? drop[drop.length - 1] + (i - drop.length + 1) * dropStagger : drop + i * dropStagger;
        const p = prog(frame, a, 9);
        const d = prog(frame, dropAt, 14, easeInOut);
        const fade = prog(frame, dropAt + 9, 5);
        if (fade >= 1) return null;
        const x0 = x;
        const y0 = y + i * rowGap;
        // aim the chip's centre (not its corner) at the mouth: anchor slides from top-left to centre
        const left = interpolate(d, [0, 1], [x0, mx]);
        const top = interpolate(d, [0, 1], [y0, my - 6]) - Math.sin(Math.PI * d) * 70;
        return (
          <div
            key={label + i}
            style={{
              position: "absolute",
              left,
              top,
              translate: `${-50 * d}% ${-50 * d}%`,
              ...materialize(p, 0.94, 10),
              scale: String((0.94 + 0.06 * p) * (1 - 0.55 * d)),
              opacity: p * (1 - fade),
            }}
          >
            <GlassChip size={size}>{label}</GlassChip>
          </div>
        );
      })}
    </>
  );
};

/**
 * The reverse of ChipDrop: each item pops up out of the can at its `at` (thrown: spring 0.8) and lands in a list
 * at (x, y + i * rowGap). Pass `showCan={false}` to reuse the can from a ChipDrop.
 */
export const FromTrash: React.FC<{
  items: { label: string; at: number }[];
  x?: number;
  y?: number;
  rowGap?: number;
  canX?: number;
  canY?: number;
  canAt?: number;
  showCan?: boolean;
  until?: number;
  size?: number;
}> = ({ items, x = TX + 30, y = BAND, rowGap = 78, canX = TX + 620, canY = BAND, canAt, showCan = true, until, size = 32 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { mx, my } = mouth(canX, canY);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  return (
    <>
      {showCan && items.length ? <TrashCan at={canAt ?? items[0].at - 10} x={canX} y={canY} /> : null}
      {items.map((it, i) => {
        if (frame < it.at) return null;
        const s = appleSpring(frame - it.at, fps, { response: 0.55, damping: 0.8 });
        const t = Math.min(1, s);
        const left = interpolate(s, [0, 1], [mx, x]);
        const top = interpolate(s, [0, 1], [my - 10, y + i * rowGap]) - Math.sin(Math.PI * t) * 120;
        return (
          <div
            key={it.label + i}
            style={{
              position: "absolute",
              left,
              top,
              translate: `${-50 * (1 - t)}% ${-50 * (1 - t)}%`,
              scale: String(0.5 + 0.5 * t),
              rotate: `${(1 - t) * -8}deg`,
              opacity: Math.min(1, s * 3) * (1 - out),
            }}
          >
            <GlassChip size={size}>{it.label}</GlassChip>
          </div>
        );
      })}
    </>
  );
};
