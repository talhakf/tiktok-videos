import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { Tone, toneColors } from "../dev/card";
import { CARD_SHADOW, lerp, presence } from "../diagram/Node";

const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-:/#_*$";

/**
 * Mechanical departure-board / cipher character flip display.
 * Renders a row of character tiles (`target`, `flipAt`, `sub`) that cycle through
 * characters before locking into the target string left-to-right.
 */
export const SplitFlapBoard: React.FC<{
  target: string;
  flipAt: number;
  sub?: string;
  label?: string;
  initial?: string;
  tone?: Tone;
  icon?: IconName;
  stagger?: number;
  spinFrames?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  target,
  flipAt,
  sub,
  label = "Departure / status board",
  initial,
  tone = "good",
  icon = "terminal",
  stagger = 2.4,
  spinFrames = 14,
  x = TX,
  y = TY,
  w = TW,
  h,
  at = 0,
  until,
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;

  const chars = target.split("");
  const count = Math.max(1, chars.length);
  const padX = 36;
  const innerW = w - padX * 2;
  const gap = count > 14 ? 6 : count > 11 ? 8 : 10;
  const tileW = Math.min(68, Math.floor((innerW - (count - 1) * gap) / count));
  const tileH = Math.round(tileW * 1.34);
  const fontSize = Math.round(tileW * 0.64);

  const lastLockAt = flipAt + spinFrames + (count - 1) * stagger;
  const allLocked = frame >= lastLockAt;
  const tc = toneColors(tone, true);
  const lightTc = toneColors(tone, dark);

  const cardH = h ?? (sub ? tileH + 158 : tileH + 116);
  const cardBg = dark ? TERM.bg : C.white;
  const muteColor = dark ? TERM.dim : C.mute;

  // How many characters have locked so far
  let lockedCount = 0;
  for (let i = 0; i < count; i++) {
    if (frame >= flipAt + spinFrames + i * stagger) lockedCount++;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: cardH,
        borderRadius: 28,
        background: cardBg,
        border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : C.line}`,
        boxShadow: CARD_SHADOW,
        padding: `26px ${padX}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        ...materialize(p),
        ...style,
      }}
    >
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name={icon} size={24} color={muteColor} weight={2} />
          <span
            style={{
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 21,
              color: muteColor,
            }}
          >
            {label}
          </span>
        </div>

        {/* Lock status pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 14px",
            borderRadius: 10,
            background: allLocked ? lightTc.bg : dark ? "rgba(255,255,255,0.08)" : C.paper,
            color: allLocked ? lightTc.fg : muteColor,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 19,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: allLocked ? lightTc.edge : frame >= flipAt ? C.accent : muteColor,
            }}
          />
          <span>{allLocked ? "LOCKED" : frame >= flipAt ? `DECODING ${lockedCount}/${count}` : "STANDBY"}</span>
        </div>
      </div>

      {/* Mechanical Split-Flap Tile Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap,
          height: tileH,
        }}
      >
        {chars.map((targetChar, i) => {
          const tileStart = flipAt + i * (stagger * 0.45);
          const lockAt = flipAt + spinFrames + i * stagger;
          const isSpace = targetChar === " ";
          const isLocked = frame >= lockAt;
          const isSpinning = frame >= tileStart && !isLocked;

          let displayChar = initial?.[i] ?? (isSpace ? " " : FLAP_CHARS[(i * 7 + 3) % FLAP_CHARS.length]);
          if (isLocked) {
            displayChar = targetChar;
          } else if (isSpinning) {
            const cycleIdx = Math.floor((frame - tileStart) * 0.65 + i * 5) % FLAP_CHARS.length;
            displayChar = FLAP_CHARS[cycleIdx];
          }

          const lockSettle = isLocked ? prog(frame, lockAt, 8, easeOut) : 0;
          // Subtle vertical flap fold while spinning
          const flapFold = isSpinning ? (Math.floor(frame + i) % 2 === 0 ? 0.9 : 1.0) : lerp(0.92, 1, lockSettle || 1);
          const flashWeight = isLocked ? Math.max(0, 1 - lockSettle) : 0;

          return (
            <div
              key={i}
              style={{
                position: "relative",
                width: tileW,
                height: tileH,
                borderRadius: 12,
                background: isSpace && isLocked ? (dark ? "#252528" : "#ECECEF") : "#1C1C1E",
                border: `2px solid ${
                  flashWeight > 0.15
                    ? tc.edge
                    : isSpinning
                      ? C.accent
                      : isLocked && !isSpace
                        ? "rgba(255,255,255,0.16)"
                        : "rgba(0,0,0,0.22)"
                }`,
                boxShadow:
                  isSpace && isLocked
                    ? "none"
                    : "0 6px 14px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                scale: `1 ${flapFold}`,
              }}
            >
              {/* Top half subtle highlight */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: "50%",
                  background: "rgba(255,255,255,0.03)",
                  pointerEvents: "none",
                }}
              />

              {/* Character Glyph */}
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize,
                  color:
                    flashWeight > 0.2
                      ? tc.fg
                      : isSpinning
                        ? TERM.blue
                        : isLocked
                          ? TERM.fg
                          : TERM.dim,
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {displayChar}
              </span>

              {/* Split-flap horizontal center seam + left/right hinge notches */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  height: 2,
                  marginTop: -1,
                  background: "rgba(0,0,0,0.65)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  width: 4,
                  height: 8,
                  marginTop: -4,
                  borderRadius: "0 2px 2px 0",
                  background: "#0E0E10",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  width: 4,
                  height: 8,
                  marginTop: -4,
                  borderRadius: "2px 0 0 2px",
                  background: "#0E0E10",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Optional subtitle / metadata line */}
      {sub ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 23,
            color: muteColor,
          }}
        >
          <span>{sub}</span>
          {allLocked ? (
            <span
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                color: lightTc.fg,
                opacity: prog(frame, lastLockAt, 8, easeOut),
              }}
            >
              ✓ verified
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
