import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX } from "../../layout";
import { C, materialize, mono, prog, sans } from "../../theme";

/**
 * IEEE 754 floating-point visualizer (`float-math-bug`).
 * Shows decimal -> infinite repeating binary fraction -> 64-bit register with bit-52 chop line -> 0.30000000000000004 sum.
 */
export const FloatLayout: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  label?: string;
  binaryRibbon?: string;
  repeatChunk?: string;
  chopAt?: number;
  sumAt?: number;
  storedA?: string;
  storedB?: string;
  result?: string;
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  label = "0.1",
  binaryRibbon,
  repeatChunk = "0011",
  chopAt,
  sumAt,
  storedA = "0.10000000000000000555",
  storedB = "0.20000000000000001110",
  result = "0.30000000000000004",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const r1Enter = prog(frame, at + 4, 10);
  const r2Enter = prog(frame, at + 10, 10);
  const chopP = chopAt !== undefined ? prog(frame, chopAt, 10) : 0;
  const isChopped = chopP > 0.01;
  const sumTrigger = sumAt ?? (chopAt !== undefined ? chopAt + 16 : at + 22);
  const sumP = prog(frame, sumTrigger, 10);

  const badColors = toneColors("bad", false);
  const accentColors = toneColors("accent", false);
  const goodColors = toneColors("good", false);
  const warnColors = toneColors("warn", false);

  const cardH = TAB_H + 546;

  // Split result so trailing discrepancy digit(s) can be ringed in red
  const resultMain = result.length > 1 ? result.slice(0, -1) : result;
  const resultTail = result.length > 1 ? result.slice(-1) : "";

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      filename="IEEE 754 · float64 (double)"
      icon="chip"
      right="1 + 11 + 52 = 64 bits"
      style={style}
    >
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* 1. Infinite Binary Fraction Ribbon */}
        <div
          style={{
            borderRadius: 20,
            background: "#F5F5F7",
            border: `1.5px solid ${C.line}`,
            padding: "16px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            ...materialize(r1Enter, 0.96, 6),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.mute }}>
              1 · decimal to binary fraction (base 2)
            </span>
            <span
              style={{
                padding: "3px 12px",
                borderRadius: 999,
                background: accentColors.bg,
                border: `1.5px solid ${C.accent}`,
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 18,
                color: C.accent,
              }}
            >
              repeats {repeatChunk} forever (like 1/3 = 0.333...)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                padding: "6px 16px",
                borderRadius: 12,
                background: C.white,
                border: `2px solid ${C.ink}`,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 28,
                color: C.ink,
              }}
            >
              {label}
            </div>
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 26, color: C.mute }}>=</span>

            {binaryRibbon ? (
              <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 25, color: C.ink }}>
                {binaryRibbon}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: mono, fontWeight: 700, fontSize: 25 }}>
                <span style={{ color: C.ink }}>0.0</span>
                {[0, 1, 2, 3, 4].map((idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "4px 9px",
                      borderRadius: 8,
                      background: idx % 2 === 0 ? accentColors.bg : C.white,
                      border: `1.5px solid ${C.accent}`,
                      color: C.accent,
                    }}
                  >
                    {repeatChunk}
                  </span>
                ))}
                <span style={{ color: C.mute }}>...₂</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. 64-Bit Register Breakdown + Chop Line at bit 52 */}
        <div
          style={{
            borderRadius: 20,
            background: C.white,
            border: `2px solid ${isChopped ? RED : C.line}`,
            padding: "16px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "relative",
            ...materialize(r2Enter, 0.96, 6),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.mute }}>
              2 · 64-bit hardware register layout
            </span>
            {isChopped ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "3px 14px",
                  borderRadius: 999,
                  background: badColors.bg,
                  border: `1.5px solid ${RED}`,
                  color: badColors.fg,
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 19,
                  ...materialize(chopP, 0.9, 4),
                }}
              >
                <Icon name="warning" size={20} color={RED} />
                <span>cut off after 52 mantissa bits · rounds up!</span>
              </div>
            ) : (
              <span style={{ fontFamily: mono, fontSize: 19, color: C.mute }}>finite 52-bit fraction</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 10, height: 92 }}>
            {/* Sign (1b) */}
            <div
              style={{
                width: 96,
                borderRadius: 14,
                background: accentColors.bg,
                border: `2px solid ${C.accent}`,
                padding: "8px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 17, color: C.accent }}>sign (1b)</span>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 28, color: C.ink }}>0</span>
              <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>+pos</span>
            </div>

            {/* Exponent (11b) */}
            <div
              style={{
                width: 210,
                borderRadius: 14,
                background: goodColors.bg,
                border: `2px solid ${GREEN}`,
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 17, color: goodColors.fg }}>exponent (11b)</span>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>01111111011</span>
              <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>2⁻⁴ (1019)</span>
            </div>

            {/* Mantissa (52b) + Chopped Tail */}
            <div style={{ flex: 1, display: "flex", alignItems: "stretch", position: "relative" }}>
              <div
                style={{
                  flex: 1,
                  borderRadius: isChopped ? "14px 4px 4px 14px" : 14,
                  background: warnColors.bg,
                  border: `2px solid ${AMBER}`,
                  padding: "8px 14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 17, color: warnColors.fg }}>
                    mantissa (52b)
                  </span>
                  <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 16, color: warnColors.fg }}>
                    bit 52 ↓
                  </span>
                </div>
                <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 22, color: C.ink, letterSpacing: "0.02em" }}>
                  1001100110...1001<span style={{ color: isChopped ? RED : C.ink, textDecoration: isChopped ? "underline" : "none" }}>1010</span>
                </div>
                <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>
                  {isChopped ? "rounded up (...1001 → ...1010)" : "52 bits fit in register"}
                </span>
              </div>

              {/* Red Chop Line */}
              {isChopped ? (
                <div
                  style={{
                    width: 6,
                    margin: "-8px 4px",
                    borderRadius: 3,
                    background: RED,
                    boxShadow: "0 0 0 3px rgba(255,59,48,0.2)",
                    transformOrigin: "50% 0%",
                    scale: `1 ${chopP}`,
                  }}
                />
              ) : null}

              {/* Discarded infinite bits */}
              <div
                style={{
                  width: 132,
                  borderRadius: isChopped ? "4px 14px 14px 4px" : 14,
                  marginLeft: isChopped ? 0 : 6,
                  background: isChopped ? badColors.bg : "#F5F5F7",
                  border: `2px dashed ${isChopped ? RED : C.line}`,
                  padding: "8px 10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: isChopped ? 0.85 : 0.6,
                  translate: `${chopP * 4}px 0px`,
                }}
              >
                <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 16, color: isChopped ? badColors.fg : C.mute }}>
                  {isChopped ? "lost bits" : "overflow"}
                </span>
                <span
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 20,
                    color: isChopped ? RED : C.mute,
                    textDecoration: isChopped ? "line-through" : "none",
                  }}
                >
                  011001...
                </span>
                <span style={{ fontFamily: mono, fontSize: 14, color: isChopped ? badColors.fg : C.mute }}>
                  chopped
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Stored Decimal Values & Addition Discrepancy */}
        <div
          style={{
            borderRadius: 20,
            background: "#F5F5F7",
            border: `2px solid ${sumP > 0.5 ? C.accent : C.line}`,
            padding: "14px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            ...materialize(sumP, 0.95, 6),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: mono, fontSize: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: C.mute }}>0.1 stored =</span>
              <span style={{ fontWeight: 700, color: C.ink }}>
                {storedA.slice(0, 19)}
                <span style={{ color: RED }}>{storedA.slice(19)}</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: C.mute }}>0.2 stored =</span>
              <span style={{ fontWeight: 700, color: C.ink }}>
                {storedB.slice(0, 19)}
                <span style={{ color: RED }}>{storedB.slice(19)}</span>
              </span>
            </div>
          </div>

          <div
            style={{
              height: 62,
              borderRadius: 14,
              background: C.white,
              border: `2px solid ${C.line}`,
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 26, color: C.mute }}>
              0.1 + 0.2 ===
            </span>

            <div style={{ display: "flex", alignItems: "center", fontFamily: mono, fontWeight: 700, fontSize: 28 }}>
              <span style={{ color: C.ink }}>{resultMain}</span>
              {resultTail ? (
                <span
                  style={{
                    marginLeft: 3,
                    padding: "2px 10px",
                    borderRadius: 10,
                    background: tint(RED, 0.14),
                    border: `2.5px solid ${RED}`,
                    color: RED,
                  }}
                >
                  {resultTail}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </DevCard>
  );
};
