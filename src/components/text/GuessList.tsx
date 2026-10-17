import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { formatNumber } from "../data/NumberTicker";
import { CARD_SHADOW, presence } from "../diagram/Node";
import { GREEN, Mark, RED } from "../layouts/Mark";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";

// A password guesser at work: guesses roll through a reel like a slot machine, each wrong one gets a red
// cross and slides up, the reel speeds up, and it locks on the hit with a green check. A counter in the
// header counts the tries (or up to `countTo`, e.g. a leaked list's 14 million). Dictionary and brute-force
// attacks, "guess the command", spell-checking.

/** Reel position (in guesses) at `frame`: linear at `rate` frames per guess, faster over time with `accel`. */
const reelPos = (frame: number, at: number, rate: number, accel: number) => {
  const t = Math.max(0, frame - at);
  return (t / rate) * (1 + (accel * t) / 30);
};

/**
 * Guess reel in a white card at (x, y). `hit` = index of the guess that works (default: the last one), or
 * -1 for none (the reel runs on). `rows` visible rows (odd), the current guess in the middle.
 */
export const GuessList: React.FC<{
  words: string[];
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  startAt?: number; // the reel starts rolling (default at + 8)
  rate?: number; // frames per guess at the start
  accel?: number; // 0 = steady; 0.5 = twice as fast after a second
  hit?: number;
  rows?: number;
  size?: number;
  title?: string; // header: what it guesses from ("rockyou.txt")
  icon?: IconName;
  countTo?: number; // the counter's final value (default: guesses made)
  countLabel?: string;
}> = ({
  words,
  x,
  y,
  w = 900,
  at,
  until,
  startAt,
  rate = 6,
  accel = 0.4,
  hit,
  rows = 5,
  size = 40,
  title,
  icon = "file",
  countTo,
  countLabel = "tries",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const start = startAt ?? at + 8;
  const target = hit ?? words.length - 1;
  const last = target < 0 ? words.length - 1 : target;

  const raw = reelPos(frame, start, rate, accel);
  const pos = Math.min(raw, last); // guesses passed (fractional)
  const done = target >= 0 && raw >= last;
  // Hit moment: the frame the reel reached the target (solve reelPos = last for t).
  const hitFrame = done ? start + (() => { let t = 0; while (reelPos(start + t, start, rate, accel) < last) t++; return t; })() : Infinity;
  const lock = done ? prog(frame, hitFrame, 10) : 0;

  const step = Math.floor(pos);
  const scroll = step + (pos >= last ? 0 : easeOut(Math.min(1, (pos - step) * 1.6))); // each guess snaps in
  const rh = size * 1.9;
  const mid = Math.floor(rows / 2);
  const headH = title ? size * 2.1 : 0;
  const current = Math.round(scroll);

  const tries = done ? last + 1 : Math.min(last + 1, step + 1);
  const count = countTo ? Math.round((countTo * tries) / (last + 1)) : tries;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: headH + rows * rh + 24,
        background: C.white,
        borderRadius: 30,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        overflow: "hidden",
        ...materialize(p),
      }}
    >
      {title ? (
        <div
          style={{
            height: headH,
            borderBottom: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 32px",
            fontFamily: sans,
            fontWeight: 600,
            fontSize: size * 0.72,
            color: C.ink,
          }}
        >
          <Icon name={icon} size={size * 0.9} color={C.mute} weight={2} />
          <span style={{ fontFamily: mono, fontWeight: 500 }}>{title}</span>
          <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>
            {formatNumber(frame < start ? 0 : count)} <span style={{ color: C.mute }}>{countLabel}</span>
          </span>
        </div>
      ) : null}

      {/* middle-row band where the current guess sits */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: headH + 12 + mid * rh,
          height: rh,
          borderRadius: 18,
          background: interpolateColors(lock, [0, 1], ["#EBF4FF", "#EEFAF1"]),
          border: `2px solid ${interpolateColors(lock, [0, 1], [C.accent, GREEN])}`,
        }}
      />

      <div style={{ position: "absolute", left: 0, top: headH + 12, width: w, height: rows * rh, overflow: "hidden" }}>
        {words.map((word, i) => {
          const off = i - scroll + mid; // row index in the window
          if (off < -1 || off > rows) return null;
          const isHit = done && i === last;
          const past = i < current || (i === current && !isHit && pos >= i + 0.6);
          const fadeEdge = Math.min(1, Math.min(off + 0.6, rows - 0.4 - off) / 1.2);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: off * rh,
                width: w,
                height: rh,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "0 44px",
                boxSizing: "border-box",
                opacity: Math.max(0, fadeEdge) * (i < current ? 0.5 : 1),
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: i === current ? 700 : 500,
                  fontSize: size,
                  color: isHit ? "#248A3D" : i === current ? C.ink : C.mute,
                  whiteSpace: "pre",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {word}
              </span>
              {isHit ? (
                <Mark kind="check" size={size * 1.1} color={GREEN} draw={prog(frame, hitFrame + 2, 10)} />
              ) : past ? (
                <Icon name="cross" size={size * 0.8} color={RED} weight={2.6} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
