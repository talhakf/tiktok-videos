import { interpolateColors, useCurrentFrame } from "remotion";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type BitwiseOp = "AND" | "OR" | "XOR" | "NOT" | "SHL" | "SHR";

const POWERS_8 = [128, 64, 32, 16, 8, 4, 2, 1];

const clampByte = (n: number) => ((Math.round(n) % 256) + 256) % 256;
const toBin8 = (n: number) => clampByte(n).toString(2).padStart(8, "0");
const toHex2 = (n: number) => `0x${clampByte(n).toString(16).toUpperCase().padStart(2, "0")}`;

const OP_META: Record<BitwiseOp, { sym: string; name: string; rule: string }> = {
  AND: { sym: "&", name: "bitwise and", rule: "1 only when both bits are 1" },
  OR: { sym: "|", name: "bitwise or", rule: "1 when either bit is 1" },
  XOR: { sym: "^", name: "bitwise xor", rule: "1 when the two bits differ" },
  NOT: { sym: "~", name: "bitwise not", rule: "flips every bit (0 ↔ 1)" },
  SHL: { sym: "<<", name: "left shift", rule: "shifts bits left, fills 0 on right" },
  SHR: { sym: ">>", name: "right shift", rule: "shifts bits right, fills 0 on left" },
};

const computeResult = (op: BitwiseOp, a: number, b: number): number => {
  const ua = clampByte(a);
  const ub = clampByte(b);
  switch (op) {
    case "AND":
      return (ua & ub) & 0xff;
    case "OR":
      return (ua | ub) & 0xff;
    case "XOR":
      return (ua ^ ub) & 0xff;
    case "NOT":
      return ~ua & 0xff;
    case "SHL":
      return (ua << (ub & 7)) & 0xff;
    case "SHR":
      return (ua >>> (ub & 7)) & 0xff;
  }
};

/**
 * Bitwise operator visualizer (`op: "AND" | "OR" | "XOR" | "NOT" | "SHL" | "SHR"`).
 * Displays 8-bit operands `a` and `b` with decimal/hex labels, animates column-by-column
 * bit evaluation starting at `evalAt`, and highlights `1` bits in system blue `#0071E3`.
 */
export const BitwiseCard: React.FC<{
  op: BitwiseOp;
  a: number;
  b?: number;
  at?: number;
  evalAt?: number;
  stagger?: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  filename?: string;
  icon?: IconName;
  label?: string;
}> = ({
  op,
  a,
  b = op === "SHL" || op === "SHR" ? 2 : 0,
  at = 0,
  evalAt,
  stagger = 3,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 510,
  dark = false,
  filename,
  icon = "binary",
  label,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;

  const startEval = evalAt ?? at + 16;
  const ua = clampByte(a);
  const ub = clampByte(b);
  const res = computeResult(op, ua, ub);

  const bitsA = toBin8(ua);
  const bitsB = toBin8(ub);
  const bitsRes = toBin8(res);

  const meta = OP_META[op];
  const isShift = op === "SHL" || op === "SHR";
  const isUnary = op === "NOT";
  const shiftAmt = ub & 7;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const borderCol = dark ? "rgba(255,255,255,0.1)" : C.line;
  const softBg = dark ? "rgba(255,255,255,0.04)" : "#F7F7FA";

  const exprText = isUnary
    ? `${meta.sym}${ua}`
    : isShift
    ? `${ua} ${meta.sym} ${shiftAmt}`
    : `${ua} ${meta.sym} ${ub}`;

  const doneEvalAt = startEval + 8 * stagger + 6;
  const doneP = prog(frame, doneEvalAt - 6, 10, easeOut);

  const bodyH = h - (filename !== undefined ? TAB_H : 0);
  const labelColW = 215;

  const renderBitCell = (
    bit: string,
    colIdx: number,
    isResultRow = false,
    colEvalP = 1,
    colFlash = 0
  ) => {
    const isOne = bit === "1";
    const baseBg = isOne
      ? isResultRow
        ? C.accent
        : dark
        ? tint(C.accent, 0.22)
        : BLUE_TINT
      : dark
      ? TERM.bg
      : C.white;

    const bg = isResultRow
      ? interpolateColors(colFlash, [0, 1], [baseBg, C.accent])
      : interpolateColors(colFlash * 0.45, [0, 1], [baseBg, BLUE_TINT]);

    const borderColor = isOne
      ? C.accent
      : colFlash > 0.2
      ? tint(C.accent, 0.55)
      : borderCol;

    const textColor = isOne
      ? isResultRow
        ? C.white
        : C.accent
      : dark
      ? "rgba(255,255,255,0.34)"
      : "#AEAEB2";

    return (
      <div
        key={colIdx}
        style={{
          height: 68,
          borderRadius: 14,
          background: bg,
          border: `2px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 33,
          color: textColor,
          boxSizing: "border-box",
          ...(isResultRow ? materialize(colEvalP, 0.88, 6) : {}),
        }}
      >
        {bit}
      </div>
    );
  };

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
      right={`${meta.name} · ${exprText}`}
    >
      <div
        style={{
          height: bodyH,
          padding: "24px 30px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top rule header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                padding: "6px 16px",
                borderRadius: 12,
                background: C.accent,
                color: C.white,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              {op} ({meta.sym})
            </div>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 24, color: fg, letterSpacing: "-0.01em" }}>
              {label ?? meta.rule}
            </div>
          </div>

          <div
            style={{
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 20,
              color: C.accent,
              padding: "6px 14px",
              borderRadius: 10,
              background: dark ? tint(C.accent, 0.16) : BLUE_TINT,
            }}
          >
            {exprText} = {res} ({toHex2(res)})
          </div>
        </div>

        {/* Bit columns header (128 .. 1) */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: labelColW,
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 17,
              color: mute,
              paddingLeft: 8,
            }}
          >
            operand · dec / hex
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
            {POWERS_8.map((pow, i) => {
              // Column evaluation order: right-to-left (LSB bit 0 at index 7 first) or left-to-right for shifts
              const order = op === "SHR" ? i : 7 - i;
              const colStart = startEval + order * stagger;
              const colFlash = frame >= colStart ? 1 - prog(frame, colStart, 14, easeOut) : 0;
              return (
                <div
                  key={pow}
                  style={{
                    textAlign: "center",
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 16,
                    color: colFlash > 0.25 ? C.accent : mute,
                    padding: "3px 0",
                    borderRadius: 8,
                    background: colFlash > 0.2 ? (dark ? tint(C.accent, 0.18) : BLUE_TINT) : "transparent",
                  }}
                >
                  {pow}
                </div>
              );
            })}
          </div>
        </div>

        {/* Row A */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: labelColW,
              padding: "10px 14px",
              borderRadius: 14,
              background: softBg,
              border: `1px solid ${borderCol}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 26, color: fg }}>a</span>
            <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 19, color: mute }}>
              {ua} · <span style={{ color: fg }}>{toHex2(ua)}</span>
            </span>
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
            {[...bitsA].map((bit, i) => {
              const order = op === "SHR" ? i : 7 - i;
              const colStart = startEval + order * stagger;
              const colFlash = frame >= colStart ? 1 - prog(frame, colStart, 14, easeOut) : 0;
              return renderBitCell(bit, i, false, 1, colFlash);
            })}
          </div>
        </div>

        {/* Row B or operator action row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: labelColW,
              padding: "10px 14px",
              borderRadius: 14,
              background: softBg,
              border: `1px solid ${borderCol}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 24, color: C.accent }}>
              {meta.sym} {isUnary ? "a" : "b"}
            </span>
            <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 19, color: mute }}>
              {isUnary ? "invert" : isShift ? `by ${shiftAmt}` : `${ub} · ${toHex2(ub)}`}
            </span>
          </div>

          {isUnary || isShift ? (
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
              {POWERS_8.map((_, i) => {
                const order = op === "SHR" ? i : 7 - i;
                const colStart = startEval + order * stagger;
                const colFlash = frame >= colStart ? 1 - prog(frame, colStart, 14, easeOut) : 0;
                const helperText = isUnary
                  ? "↕"
                  : op === "SHL"
                  ? i >= 8 - shiftAmt
                    ? "0"
                    : `←${shiftAmt}`
                  : i < shiftAmt
                  ? "0"
                  : `→${shiftAmt}`;
                const isZeroFill = isShift && helperText === "0";
                return (
                  <div
                    key={i}
                    style={{
                      height: 68,
                      borderRadius: 14,
                      background: colFlash > 0.2 ? (dark ? tint(C.accent, 0.16) : BLUE_TINT) : softBg,
                      border: `1.5px dashed ${colFlash > 0.2 ? C.accent : borderCol}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: mono,
                      fontWeight: 600,
                      fontSize: 22,
                      color: isZeroFill ? mute : C.accent,
                    }}
                  >
                    {helperText}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
              {[...bitsB].map((bit, i) => {
                const order = 7 - i;
                const colStart = startEval + order * stagger;
                const colFlash = frame >= colStart ? 1 - prog(frame, colStart, 14, easeOut) : 0;
                return renderBitCell(bit, i, false, 1, colFlash);
              })}
            </div>
          )}
        </div>

        {/* Horizontal operator divider bar */}
        <div style={{ height: 2, background: borderCol, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 2,
              width: `${prog(frame, startEval, 8 * stagger + 6, easeOut) * 100}%`,
              background: C.accent,
            }}
          />
        </div>

        {/* Result Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: labelColW,
              padding: "10px 14px",
              borderRadius: 14,
              background: doneP > 0.1 ? (dark ? tint(C.accent, 0.18) : BLUE_TINT) : softBg,
              border: `2px solid ${doneP > 0.1 ? C.accent : borderCol}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 24, color: C.accent }}>=</span>
            <span
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                color: fg,
                opacity: 0.35 + 0.65 * doneP,
              }}
            >
              {res} · <span style={{ color: C.accent }}>{toHex2(res)}</span>
            </span>
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
            {[...bitsRes].map((bit, i) => {
              const order = op === "SHR" ? i : 7 - i;
              const colStart = startEval + order * stagger;
              const colEvalP = prog(frame, colStart, 9, easeOut);
              const colFlash = frame >= colStart ? 1 - prog(frame, colStart, 16, easeOut) : 0;
              return renderBitCell(bit, i, true, colEvalP, colFlash);
            })}
          </div>
        </div>
      </div>
    </DevCard>
  );
};
