import { useCurrentFrame } from "remotion";
import { HEAD_Y, TW, TX } from "../layout";
import { C, materialize, prog, sans } from "../theme";

/**
 * Two-tone headline: an ink sentence, then a grey sentence (optionally later, at `bAt`).
 * Enters from the right and leaves to the left, like an iOS push. `at <= 0` = already on screen at frame 0
 * (hook titles: the payoff is visible from the first frame, no fade-up).
 */
export const Headline: React.FC<{
  a: string;
  b?: string;
  at?: number;
  until?: number;
  bAt?: number;
  size?: number;
  x?: number;
  y?: number;
  w?: number;
}> = ({ a, b, at = 0, until, bAt, size = 80, x = TX, y = HEAD_Y, w = TW }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = at <= 0 ? 1 : prog(frame, at, 12);
  const out = until !== undefined ? prog(frame, until - 8, 8) : 0;
  if (out >= 1) return null;
  const pb = bAt !== undefined ? prog(frame, bAt, 10) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: "-0.045em",
        color: C.ink,
        ...materialize(p * (1 - out), 1, 8),
        translate: `${(1 - p) * 60 - out * 60}px 0px`,
      }}
    >
      {a}
      {b ? (
        <>
          <br />
          <span style={{ color: C.mute, ...materialize(pb, 1, 8) }}>{b}</span>
        </>
      ) : null}
    </div>
  );
};
