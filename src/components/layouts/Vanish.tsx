import { interpolate, useCurrentFrame } from "remotion";
import { C, easeInOut, materialize, mono, prog } from "../../theme";
import { GlassChip } from "./ChipDrop";

// Gone for good: a small dark point (e.g. /dev/null) appears first, then a chip or a line of text glides
// into it, shrinking and turning slightly, and disappears. The point gives a tiny "gulp" as it swallows.

/**
 * A chip (or any `children`) at (x, y) sucked into a dark point at (holeX, holeY) at `suck`.
 * The point and its label appear at `at`; the item appears at `itemAt` (default `at`).
 */
export const Vanish: React.FC<{
  at: number;
  suck: number;
  x: number;
  y: number;
  holeX: number;
  holeY: number;
  text?: string;
  children?: React.ReactNode;
  itemAt?: number;
  label?: string;
  until?: number; // the point leaves
  size?: number;
  dur?: number;
}> = ({ at, suck, x, y, holeX, holeY, text, children, itemAt, label = "/dev/null", until, size = 34, dur = 18 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const hp = prog(frame, at, 9);
  const hout = until !== undefined ? prog(frame, until, 8) : 0;
  const d = prog(frame, suck, dur, easeInOut);
  const gulp = prog(frame, suck + dur - 4, 4) - prog(frame, suck + dur, 8);
  const ia = itemAt ?? at;
  const ip = prog(frame, ia, 9);
  const gone = prog(frame, suck + dur * 0.6, dur * 0.4);
  const R = 22;
  return (
    <>
      {hout < 1 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: holeX - R * 2,
              top: holeY - R * 2,
              width: R * 4,
              height: R * 4,
              borderRadius: R * 2,
              border: "2px solid rgba(0,0,0,0.08)",
              boxSizing: "border-box",
              ...materialize(hp * (1 - hout), 0.7, 0),
              scale: String((0.7 + 0.3 * hp) * (1 + 0.12 * gulp)),
            }}
          />
          <div
            style={{
              position: "absolute",
              left: holeX - R,
              top: holeY - R,
              width: R * 2,
              height: R * 2,
              borderRadius: R,
              background: "#000",
              ...materialize(hp * (1 - hout), 0.6, 4),
              scale: String((0.6 + 0.4 * hp) * (1 + 0.25 * gulp)),
            }}
          />
          <div
            style={{
              position: "absolute",
              left: holeX - 200,
              top: holeY + R * 2 + 14,
              width: 400,
              textAlign: "center",
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 30,
              color: C.mute,
              opacity: prog(frame, at + 4, 9) * (1 - hout),
            }}
          >
            {label}
          </div>
        </>
      ) : null}
      {frame >= ia && gone < 1 ? (
        <div
          style={{
            position: "absolute",
            left: interpolate(d, [0, 1], [x, holeX]),
            top: interpolate(d, [0, 1], [y, holeY]),
            translate: `${-50 * d}% ${-50 * d}%`,
            ...materialize(ip, 0.94, 8),
            scale: String((0.94 + 0.06 * ip) * (1 - 0.94 * d)),
            rotate: `${-22 * d}deg`,
            opacity: ip * (1 - gone),
          }}
        >
          {children ?? <GlassChip size={size}>{text}</GlassChip>}
        </div>
      ) : null}
    </>
  );
};
