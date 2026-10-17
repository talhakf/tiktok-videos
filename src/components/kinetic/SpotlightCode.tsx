import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { DevCard, focusTrack, mixTone, TAB_H, Tone } from "../dev/card";
import { CodeLang, DARK_SYNTAX, LIGHT_SYNTAX, tokenize } from "../dev/syntax";
import { lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type SpotlightCue = {
  fromLine: number;
  toLine: number;
  at: number;
  until?: number;
  note: string;
  tone?: Tone;
  icon?: IconName;
};

const LH = 1.58;
const PAD_Y = 26;

const toneDefaultIcon = (tone: Tone): IconName =>
  tone === "bad" ? "bug" : tone === "warn" ? "warning" : tone === "good" ? "checkCircle" : "info";

/**
 * Code focus & dim-mask inspector card: renders an 8-12 line dark (or light) code card where a
 * bright spotlight window smoothly glides between line ranges (`focus`), dimming all other lines
 * to `0.25` opacity and displaying an inline annotation badge.
 */
export const SpotlightCode: React.FC<{
  code: string | string[];
  focus: SpotlightCue[];
  lang?: CodeLang;
  filename?: string;
  right?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  dark?: boolean;
  size?: number;
  startLine?: number;
  dimOpacity?: number;
  style?: React.CSSProperties;
}> = ({
  code,
  focus,
  lang = "ts",
  filename = "inspector.ts",
  right,
  x = TX,
  y = TY,
  w = TW,
  h,
  at = 0,
  until,
  dark = true,
  size = 25,
  startLine = 1,
  dimOpacity = 0.25,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;

  const rawCode = Array.isArray(code) ? code.join("\n") : code;
  const tokenLines = tokenize(rawCode, lang);
  const n = tokenLines.length;
  const lh = size * LH;
  const pal = dark ? DARK_SYNTAX : LIGHT_SYNTAX;
  const cardH = h ?? (filename !== undefined ? TAB_H : 0) + PAD_Y * 2 + n * lh;
  const gutterW = 30 + String(startLine + n - 1).length * size * 0.6 + 24;

  const track = focusTrack(frame, focus, 12, 8);

  const inCue = (lineNum: number, cue: SpotlightCue) => {
    const lo = Math.min(cue.fromLine, cue.toLine);
    const hi = Math.max(cue.fromLine, cue.toLine);
    return lineNum >= lo && lineNum <= hi ? 1 : 0;
  };

  // Opacity for line `lineNum` (1-based): 1.0 inside spotlight, 0.25 outside when spotlight is active.
  const lineOpacity = (lineNum: number) => {
    if (!track) return 1;
    const wCur = inCue(lineNum, track.cur);
    const wPrev = track.prev ? inCue(lineNum, track.prev) : wCur;
    const wSpot = lerp(wPrev, wCur, track.t);
    const target = lerp(dimOpacity, 1, wSpot);
    return lerp(1, target, track.o);
  };

  let spotlight: null | {
    top: number;
    height: number;
    colors: ReturnType<typeof mixTone>;
    activeCue: SpotlightCue;
    badgeP: number;
    o: number;
  } = null;

  if (track) {
    const box = (cue: SpotlightCue) => {
      const lo = Math.min(cue.fromLine, cue.toLine);
      const hi = Math.max(cue.fromLine, cue.toLine);
      return {
        top: PAD_Y + (lo - 1) * lh - 4,
        height: (hi - lo + 1) * lh + 8,
      };
    };
    const B = box(track.cur);
    const A = track.prev ? box(track.prev) : B;
    const prevTone = track.prev?.tone ?? track.cur.tone ?? "accent";
    const curTone = track.cur.tone ?? "accent";
    const activeCue = track.t >= 0.45 || !track.prev ? track.cur : track.prev;
    const badgeP = prog(frame, activeCue.at + 3, 9, easeOut);

    spotlight = {
      top: lerp(A.top, B.top, track.t),
      height: lerp(A.height, B.height, track.t),
      colors: mixTone(prevTone, curTone, track.t, dark),
      activeCue,
      badgeP,
      o: track.o,
    };
  }

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      dark={dark}
      filename={filename}
      right={right ?? lang}
      style={style}
    >
      {/* Gliding Spotlight Window */}
      {spotlight ? (
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: spotlight.top,
            height: spotlight.height,
            borderRadius: 16,
            background: spotlight.colors.bg,
            border: `2px solid ${spotlight.colors.edge}`,
            boxShadow: dark ? "0 10px 28px rgba(0,0,0,0.35)" : "0 8px 22px rgba(0,0,0,0.08)",
            opacity: spotlight.o,
            pointerEvents: "none",
          }}
        >
          {/* Left accent bar inside the spotlight frame */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 8,
              bottom: 8,
              width: 5,
              borderRadius: 3,
              background: spotlight.colors.edge,
            }}
          />

          {/* Inline annotation badge on the right */}
          {spotlight.activeCue.note ? (
            <div
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                translate: "0 -50%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 16px",
                borderRadius: 12,
                background: dark ? tint(spotlight.colors.edge, 0.24) : C.white,
                border: `1.5px solid ${spotlight.colors.edge}`,
                color: spotlight.colors.fg,
                fontFamily: sans,
                fontWeight: 600,
                fontSize: Math.round(size * 0.82),
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                ...materialize(spotlight.badgeP, 0.94, 4),
              }}
            >
              <Icon
                name={spotlight.activeCue.icon ?? toneDefaultIcon(spotlight.activeCue.tone ?? "accent")}
                size={Math.round(size * 0.9)}
                color={spotlight.colors.fg}
                weight={2.2}
                draw={spotlight.badgeP}
              />
              <span>{spotlight.activeCue.note}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Code Lines */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: PAD_Y,
          fontFamily: mono,
          fontWeight: 500,
          fontSize: size,
          lineHeight: LH,
        }}
      >
        {tokenLines.map((tokens, i) => {
          const lineEnter = prog(frame, at + 4 + i * 1.1, 7, easeOut);
          const dimW = lineOpacity(i + 1);
          const finalOpacity = lineEnter * dimW;
          return (
            <div
              key={i}
              style={{
                height: lh,
                display: "flex",
                alignItems: "center",
                whiteSpace: "pre",
                opacity: finalOpacity,
                translate: `0px ${(1 - lineEnter) * 6}px`,
              }}
            >
              <div
                style={{
                  width: gutterW - 22,
                  flexShrink: 0,
                  textAlign: "right",
                  color: dark ? TERM.dim : "#AEAEB2",
                  fontVariantNumeric: "tabular-nums",
                  userSelect: "none",
                }}
              >
                {startLine + i}
              </div>
              <div style={{ marginLeft: 22 }}>
                {tokens.map((tk, k) => (
                  <span key={k} style={{ color: pal[tk.k] }}>
                    {tk.t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
