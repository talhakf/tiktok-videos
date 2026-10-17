import { interpolateColors, useCurrentFrame } from "remotion";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type BaseValueStep = {
  at: number;
  num: number;
  label?: string;
};

const POWERS_8 = [128, 64, 32, 16, 8, 4, 2, 1];
const EXP_8 = ["2⁷", "2⁶", "2⁵", "2⁴", "2³", "2²", "2¹", "2⁰"];

const clampByte = (n: number) => ((Math.round(n) % 256) + 256) % 256;
const toBin8 = (n: number) => clampByte(n).toString(2).padStart(8, "0");
const toHex2 = (n: number) => clampByte(n).toString(16).toUpperCase().padStart(2, "0");
const toOct3 = (n: number) => clampByte(n).toString(8).padStart(3, "0");

/**
 * Synchronized number base converter (Decimal, Binary, Hexadecimal, Octal).
 * Shows place-value powers (128..1 and 16¹, 16⁰) and animates transitions across `values`
 * so all 4 bases update in lockstep.
 */
export const BaseConverter: React.FC<{
  values: BaseValueStep[];
  at?: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  filename?: string;
  icon?: IconName;
  stagger?: number;
}> = ({
  values,
  at = 0,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 620,
  dark = false,
  filename = "base-converter",
  icon = "binary",
  stagger = 0.7,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;

  const sorted = values.length > 0 ? [...values].sort((a, b) => a.at - b.at) : [{ at: 0, num: 42, label: "answer" }];

  // Determine active step for decimal / hex / octal readouts
  let activeIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (frame >= sorted[i].at) activeIdx = i;
  }
  const curStep = sorted[activeIdx];
  const prevStep = activeIdx > 0 ? sorted[activeIdx - 1] : curStep;
  const stepT = activeIdx > 0 ? prog(frame, curStep.at, 12, easeInOut) : 1;
  const pulse = activeIdx > 0 ? 1 - prog(frame, curStep.at, 18, easeOut) : 0;

  const displayNum = clampByte(Math.round(prevStep.num + (curStep.num - prevStep.num) * stepT));
  const targetNum = clampByte(curStep.num);
  const binTarget = toBin8(targetNum);
  const hexStr = toHex2(targetNum);
  const octStr = toOct3(targetNum);

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const accent = dark ? TERM.blue : C.accent;
  const softBg = dark ? "rgba(255,255,255,0.05)" : "#F7F7FA";
  const borderCol = dark ? "rgba(255,255,255,0.1)" : C.line;

  const hiNibble = (targetNum >> 4) & 0xf;
  const loNibble = targetNum & 0xf;
  const activePowers = POWERS_8.filter((_, i) => binTarget[i] === "1");

  const bodyH = h - (filename !== undefined ? TAB_H : 0);

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon={icon}
      right={curStep.label ? curStep.label : `uint8 · ${targetNum}`}
    >
      <div
        style={{
          height: bodyH,
          padding: "26px 32px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top 4-base synchronized readout grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            {
              key: "dec",
              name: "decimal",
              base: "base 10",
              prefix: "",
              val: String(displayNum),
              sub: "10² · 10¹ · 10⁰",
              primary: true,
            },
            {
              key: "bin",
              name: "binary",
              base: "base 2",
              prefix: "0b",
              val: `${binTarget.slice(0, 4)} ${binTarget.slice(4)}`,
              sub: "8 bits (1 byte)",
              primary: false,
            },
            {
              key: "hex",
              name: "hexadecimal",
              base: "base 16",
              prefix: "0x",
              val: hexStr,
              sub: `${hiNibble}×16¹ + ${loNibble}×16⁰`,
              primary: false,
            },
            {
              key: "oct",
              name: "octal",
              base: "base 8",
              prefix: "0o",
              val: octStr,
              sub: `${octStr[0]}×64 + ${octStr[1]}×8 + ${octStr[2]}×1`,
              primary: false,
            },
          ].map((b, idx) => {
            const cardEnter = prog(frame, at + 2 + idx * 2, 10);
            const activeBg = b.primary
              ? dark
                ? tint(TERM.blue, 0.16)
                : BLUE_TINT
              : interpolateColors(pulse, [0, 1], [softBg, dark ? tint(TERM.blue, 0.14) : BLUE_TINT]);
            return (
              <div
                key={b.key}
                style={{
                  padding: "16px 18px",
                  borderRadius: 18,
                  background: activeBg,
                  border: `1.5px solid ${b.primary ? accent : borderCol}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  ...materialize(cardEnter, 0.96, 5),
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 19, color: b.primary ? accent : mute }}>
                    {b.name}
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 600,
                      fontSize: 15,
                      color: b.primary ? accent : mute,
                      padding: "2px 8px",
                      borderRadius: 8,
                      background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                    }}
                  >
                    {b.base}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: b.key === "bin" ? 23 : 32,
                    color: fg,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.prefix ? <span style={{ color: mute, fontWeight: 500 }}>{b.prefix}</span> : null}
                  {b.val}
                </div>
                <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 16, color: mute, whiteSpace: "nowrap" }}>
                  {b.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle section: Place-value powers (128, 64, 32, 16, 8, 4, 2, 1) & 8 bit cells */}
        <div
          style={{
            padding: "20px 22px",
            borderRadius: 20,
            background: softBg,
            border: `1px solid ${borderCol}`,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 20, color: mute }}>
              place-value powers (base 2 & base 16 nibbles)
            </span>
            {curStep.label ? (
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 18,
                  color: accent,
                  padding: "4px 12px",
                  borderRadius: 10,
                  background: dark ? tint(TERM.blue, 0.16) : BLUE_TINT,
                }}
              >
                {curStep.label}
              </span>
            ) : null}
          </div>

          {/* 8 bit columns with place value header (128..1) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
            {POWERS_8.map((pow, i) => {
              const delay = (7 - i) * stagger;
              let stepIdx = 0;
              for (let s = 1; s < sorted.length; s++) {
                if (frame >= sorted[s].at + delay) stepIdx = s;
              }
              let changedAt = -Infinity;
              for (let s = stepIdx; s >= 1; s--) {
                const bCur = toBin8(sorted[s].num)[i];
                const bPrev = toBin8(sorted[s - 1].num)[i];
                if (bCur !== bPrev) {
                  changedAt = sorted[s].at + delay;
                  break;
                }
              }
              const bit = toBin8(sorted[stepIdx].num)[i];
              const isOne = bit === "1";
              const flash = changedAt > -Infinity ? 1 - prog(frame, changedAt, 16) : 0;
              const swap = changedAt > -Infinity ? prog(frame, changedAt, 7) : 1;
              const colEnter = prog(frame, at + 4 + i * 0.8, 9);

              const settleBg = isOne ? (dark ? tint(TERM.blue, 0.22) : BLUE_TINT) : dark ? TERM.bg : C.white;
              const cellBg = interpolateColors(flash, [0, 1], [settleBg, C.accent]);
              const hotText = flash > 0.45;

              return (
                <div
                  key={pow}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    ...materialize(colEnter, 0.94, 5),
                  }}
                >
                  {/* Power of 2 label: 2^7 = 128 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 15, color: mute }}>{EXP_8[i]}</span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 20,
                        color: isOne ? accent : mute,
                        opacity: isOne ? 1 : 0.45,
                      }}
                    >
                      {pow}
                    </span>
                  </div>

                  {/* Bit cell */}
                  <div
                    style={{
                      width: "100%",
                      height: 68,
                      borderRadius: 14,
                      background: cellBg,
                      border: `2px solid ${isOne ? accent : borderCol}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 34,
                      color: hotText ? C.white : isOne ? accent : mute,
                    }}
                  >
                    <span style={{ ...materialize(swap, 0.85, 4) }}>{bit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hexadecimal nibble grouping (16^1 upper nibble, 16^0 lower nibble) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 2 }}>
            {[
              {
                title: "upper nibble · 16¹ (×16)",
                bits: binTarget.slice(0, 4),
                hex: hexStr[0],
                dec: hiNibble,
                weight: `${hiNibble} × 16 = ${hiNibble * 16}`,
              },
              {
                title: "lower nibble · 16⁰ (×1)",
                bits: binTarget.slice(4, 8),
                hex: hexStr[1],
                dec: loNibble,
                weight: `${loNibble} × 1 = ${loNibble}`,
              },
            ].map((nib) => (
              <div
                key={nib.title}
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: dark ? TERM.bg : C.white,
                  border: `1px solid ${borderCol}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 16, color: mute }}>{nib.title}</span>
                  <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 18, color: fg }}>
                    {nib.bits}₂ = <span style={{ color: accent, fontWeight: 700 }}>0x{nib.hex}</span>
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 19,
                    color: accent,
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: dark ? tint(TERM.blue, 0.14) : BLUE_TINT,
                  }}
                >
                  {nib.weight}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: Active place-value sum equation */}
        <div
          style={{
            padding: "12px 20px",
            borderRadius: 14,
            background: dark ? tint(TERM.blue, 0.12) : BLUE_TINT,
            border: `1px solid ${tint(C.accent, 0.25)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: fg, fontWeight: 600, overflow: "hidden", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 19, color: mute }}>sum of 1-bits:</span>
            <span>{activePowers.length > 0 ? activePowers.join(" + ") : "0"}</span>
          </div>
          <div style={{ fontWeight: 700, color: accent, fontSize: 24, whiteSpace: "nowrap" }}>
            = {targetNum}₁₀ · 0x{hexStr} · 0o{octStr}
          </div>
        </div>
      </div>
    </DevCard>
  );
};
