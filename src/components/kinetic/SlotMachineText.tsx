import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { Tone, toneColors } from "../dev/card";
import { CARD_SHADOW, lerp, presence } from "../diagram/Node";

export type SlotWord = {
  text: string;
  at: number;
  tone?: Tone;
  sub?: string;
  icon?: IconName;
};

/**
 * Vertical rolling word-wheel / slot-machine headline card.
 * Displays `prefix` + a bordered vertical window cycling smoothly through `words` + `suffix`.
 */
export const SlotMachineText: React.FC<{
  prefix?: string;
  words: SlotWord[];
  suffix?: string;
  label?: string;
  sub?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  size?: number;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  prefix = "",
  words,
  suffix = "",
  label,
  sub,
  x = TX,
  y = TY,
  w = TW,
  h,
  at = 0,
  until,
  size = 44,
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null || words.length === 0) return null;

  const sorted = [...words].sort((a, b) => a.at - b.at);

  // Continuous wheel index (0 -> 1 -> 2 ...) driven by easeInOut glides
  let wheelPos = 0;
  let prevIdx = 0;
  let curIdx = 0;
  let glideT = 1;

  for (let i = 1; i < sorted.length; i++) {
    if (frame >= sorted[i].at) {
      const stepP = prog(frame, sorted[i].at, 12, easeInOut);
      wheelPos = i - 1 + stepP;
      prevIdx = i - 1;
      curIdx = i;
      glideT = stepP;
    }
  }

  const prevTone: Tone = sorted[prevIdx]?.tone ?? "accent";
  const curTone: Tone = sorted[curIdx]?.tone ?? "accent";
  const A = toneColors(prevTone, dark);
  const B = toneColors(curTone, dark);
  const mix = (a: string, b: string) => (prevTone === curTone ? b : interpolateColors(glideT, [0, 1], [a, b]));
  const slotBg = mix(A.bg, B.bg);
  const slotEdge = mix(A.edge, B.edge);
  const slotFg = mix(A.fg, B.fg);

  const slotH = Math.round(size * 1.62);
  const longestChars = Math.max(...sorted.map((wItem) => wItem.text.length), 6);
  const hasIcons = sorted.some((wItem) => wItem.icon !== undefined);
  const slotW = Math.min(w - 96, Math.round(longestChars * size * 0.58 + (hasIcons ? size * 0.9 + 24 : 0) + 56));

  const activeWord = glideT > 0.5 ? sorted[curIdx] : sorted[prevIdx];
  const captionText = activeWord?.sub ?? sub;
  const cardH = h ?? (label ? 276 : captionText ? 240 : 196);

  const bg = dark ? TERM.bg : C.white;
  const fg = dark ? TERM.fg : C.ink;
  const muteColor = dark ? TERM.dim : C.mute;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: cardH,
        borderRadius: 28,
        background: bg,
        border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : C.line}`,
        boxShadow: CARD_SHADOW,
        padding: "28px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        ...materialize(p),
        ...style,
      }}
    >
      {/* Top bar: optional mono label + mechanical reel position dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            fontFamily: mono,
            fontWeight: 600,
            fontSize: 22,
            color: muteColor,
            letterSpacing: "0.02em",
          }}
        >
          {label ?? "Headline reel"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {sorted.map((item, idx) => {
            const dist = Math.abs(wheelPos - idx);
            const active = Math.max(0, 1 - dist);
            const itemColors = toneColors(item.tone ?? "accent", dark);
            return (
              <div
                key={idx}
                style={{
                  width: lerp(10, 28, active),
                  height: 10,
                  borderRadius: 5,
                  background: active > 0.5 ? itemColors.edge : dark ? "rgba(255,255,255,0.16)" : C.soft,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Main row: prefix + bordered vertical rolling window + suffix */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          fontFamily: sans,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: "-0.03em",
          color: fg,
          lineHeight: 1.15,
        }}
      >
        {prefix ? <span style={{ whiteSpace: "pre" }}>{prefix.trimEnd()}</span> : null}

        {/* Bordered slot-machine window */}
        <div
          style={{
            position: "relative",
            width: slotW,
            height: slotH,
            borderRadius: 18,
            background: slotBg,
            border: `2.5px solid ${slotEdge}`,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Left & right mechanical drum tick marks */}
          <div
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              width: 4,
              height: 18,
              borderRadius: 2,
              background: slotEdge,
              translate: "0 -50%",
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              width: 4,
              height: 18,
              borderRadius: 2,
              background: slotEdge,
              translate: "0 -50%",
              opacity: 0.55,
            }}
          />

          {/* Rolling vertical strip */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: sorted.length * slotH,
              translate: `0px ${-wheelPos * slotH}px`,
            }}
          >
            {sorted.map((item, idx) => {
              const dist = Math.abs(wheelPos - idx);
              const itemOpacity = Math.max(0.15, 1 - dist * 0.75);
              const itemScale = lerp(0.92, 1, Math.max(0, 1 - dist));
              return (
                <div
                  key={idx}
                  style={{
                    height: slotH,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    padding: "0 24px",
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: Math.round(size * 0.88),
                    letterSpacing: "-0.02em",
                    color: slotFg,
                    whiteSpace: "nowrap",
                    opacity: itemOpacity,
                    scale: String(itemScale),
                  }}
                >
                  {item.icon ? <Icon name={item.icon} size={Math.round(size * 0.72)} color={slotFg} weight={2.2} /> : null}
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {suffix ? <span style={{ whiteSpace: "pre" }}>{suffix}</span> : null}
      </div>

      {/* Bottom subtitle / status line */}
      {captionText ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontWeight: 500,
            fontSize: 22,
            color: muteColor,
            opacity: prog(frame, activeWord.at, 8, easeOut),
          }}
        >
          <span>{captionText}</span>
          <span style={{ color: slotFg, fontWeight: 700 }}>
            {curIdx + 1}/{sorted.length}
          </span>
        </div>
      ) : null}
    </div>
  );
};
