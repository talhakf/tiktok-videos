import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, materialize, mono, prog, sans } from "../../theme";
import { CARD_SHADOW, presence } from "../diagram/Node";

// Loading states: the macOS activity spinner (12 spokes, the dark one steps round once a second, a
// functional motion so it runs from the frame) and grey skeleton bars that resolve into the real content.

/**
 * macOS spinner, `size` px. Inline (inside a Button, a row) when `x, y` are left out, else placed at (x, y)
 * with its own `at` / `until`. `start` sets the phase so two spinners can differ.
 */
export const Spinner: React.FC<{ size?: number; color?: string; x?: number; y?: number; at?: number; until?: number; start?: number }> = ({
  size = 56,
  color = C.mute,
  x,
  y,
  at = 0,
  until,
  start = 0,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until, 8, 6);
  if (vis === null) return null;
  const head = Math.floor((frame - at + start) / 2.5) % 12; // 12 steps a second at 30 fps
  const svg = (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      {Array.from({ length: 12 }, (_, i) => {
        const age = (head - i + 12) % 12; // 0 = the head
        return (
          <line
            key={i}
            x1={12}
            y1={2.6}
            x2={12}
            y2={7}
            stroke={color}
            strokeWidth={2.1}
            strokeLinecap="round"
            opacity={1 - (age / 12) * 0.82}
            transform={`rotate(${i * 30} 12 12)`}
          />
        );
      })}
    </svg>
  );
  if (x === undefined || y === undefined) return <div style={{ opacity: vis }}>{svg}</div>;
  return <div style={{ position: "absolute", left: x, top: y, ...materialize(vis) }}>{svg}</div>;
};

export type SkeletonRow = {
  w: number; // bar width as a fraction of the content width (0–1)
  text?: string; // what the bar resolves into
  size?: number;
  weight?: number;
  color?: string;
  mono?: boolean;
};

/**
 * Skeleton card at (x, y): an optional round avatar and grey bars (one per row, `w` = fraction of the width)
 * that pulse softly while loading, then from `resolveAt` turn into their `text` one by one (40 ms stagger,
 * the bar fades as the text materializes). `avatar` = an Icons glyph on a blue tile after resolving.
 * `card` false = bars straight on the page.
 */
export const Skeleton: React.FC<{
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  rows: SkeletonRow[];
  avatar?: IconName;
  avatarTint?: string;
  resolveAt?: number;
  card?: boolean;
}> = ({ x, y, w = 900, at, until, rows, avatar, avatarTint = C.accent, resolveAt, card = true }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const pulse = 0.75 + 0.25 * Math.cos(((frame - at) / 36) * 2 * Math.PI); // 1.2 s breathing while loading
  const step = (i: number) => (resolveAt === undefined ? 0 : prog(frame, resolveAt + i * 1.2, 9));
  const av = 96;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        boxSizing: "border-box",
        padding: card ? 36 : 0,
        borderRadius: 30,
        background: card ? C.white : undefined,
        border: card ? `1px solid ${C.line}` : undefined,
        boxShadow: card ? CARD_SHADOW : undefined,
        display: "flex",
        gap: 28,
        alignItems: "flex-start",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {avatar ? (
        <div style={{ position: "relative", width: av, height: av, flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: av / 2, background: C.soft, opacity: (1 - step(0)) * pulse }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: av / 2,
              background: avatarTint,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...materialize(step(0)),
            }}
          >
            <Icon name={avatar} size={52} color={C.white} weight={2} />
          </div>
        </div>
      ) : null}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        {rows.map((r, i) => {
          const size = r.size ?? 30;
          const p = step(i + (avatar ? 1 : 0));
          return (
            <div key={i} style={{ position: "relative", height: size * 1.3 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: size * 0.22,
                  width: `${r.w * 100}%`,
                  height: size * 0.86,
                  borderRadius: 10,
                  background: C.soft,
                  opacity: (1 - p) * pulse,
                }}
              />
              {r.text && p > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    lineHeight: `${size * 1.3}px`,
                    fontFamily: r.mono ? mono : sans,
                    fontSize: size,
                    fontWeight: r.weight ?? (i === 0 ? 700 : 500),
                    letterSpacing: r.mono ? 0 : "-0.02em",
                    color: r.color ?? (i === 0 ? C.ink : C.mute),
                    whiteSpace: "nowrap",
                    transformOrigin: "0 50%",
                    ...materialize(p, 0.97, 6),
                  }}
                >
                  {r.text}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
