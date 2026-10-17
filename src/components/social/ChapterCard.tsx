import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TW, TX } from "../../layout";
import { C, easeDrawer, materialize, prog, sans, W } from "../../theme";

// Section title card for list videos: "1/5" (never zero-padded) + the section or tool name + one grey line.
// Enters from the right and leaves to the left like an iOS push, so back-to-back cards (`until` of one =
// `at` of the next) read as "next". `full`: a page-grey sheet covers the whole screen between beats and
// slides in over the previous beat; otherwise the text block sits at `x, y` on whatever is there.

const TRAVEL = 90; // text travel when not full-screen
const DUR = 14;

/**
 * One chapter title. `n` / `of` print as "n/of" with `n` in blue; `sub` is the grey line under the title.
 * Full-screen cards centre the block vertically around `y` (default: a little above the middle).
 */
export const ChapterCard: React.FC<{
  at: number;
  until?: number;
  title: string;
  n?: number;
  of?: number;
  sub?: string;
  full?: boolean;
  x?: number;
  y?: number;
  w?: number;
  size?: number; // title px
}> = ({ at, until, title, n, of, sub, full = false, x = TX, y, w = TW, size = 132 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, DUR, easeDrawer) : 0;
  if (out >= 1) return null;
  const p = prog(frame, at, DUR, easeDrawer);
  // text lags the sheet by 3 frames, so the card reads as one object arriving
  const t = prog(frame, at + (full ? 3 : 0), DUR);

  const block = (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y ?? (full ? 640 : 420),
        width: w,
        fontFamily: sans,
        ...materialize(t * (full ? 1 : 1 - out), 1, 10),
        translate: full ? `${(1 - t) * TRAVEL * 0.6}px 0px` : `${(1 - t) * TRAVEL - out * TRAVEL}px 0px`,
      }}
    >
      {n !== undefined ? (
        <div style={{ fontWeight: 600, fontSize: 64, letterSpacing: "-0.03em", color: C.mute, fontVariantNumeric: "tabular-nums", marginBottom: 18 }}>
          <span style={{ color: C.accent }}>{n}</span>
          {of !== undefined ? `/${of}` : null}
        </div>
      ) : null}
      <div style={{ fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: "-0.05em", color: C.ink }}>{title}</div>
      {sub ? (
        <div style={{ marginTop: 26, fontWeight: 600, fontSize: 44, lineHeight: 1.15, letterSpacing: "-0.025em", color: C.mute }}>{sub}</div>
      ) : null}
    </div>
  );

  if (!full) return block;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.paper,
        translate: `${(1 - p) * W - out * W * 0.3}px 0px`,
        opacity: 1 - out,
        // the leading edge casts a soft shadow only while the sheet moves
        boxShadow: p < 1 ? `-30px 0 60px rgba(0,0,0,${0.12 * (1 - p)})` : undefined,
      }}
    >
      {block}
    </AbsoluteFill>
  );
};
