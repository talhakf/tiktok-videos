import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";

const popcount4 = (n: number) => {
  let c = 0;
  let v = n & 0xf;
  while (v) {
    c += v & 1;
    v >>= 1;
  }
  return c;
};

const countChangedBits = (a: string, b: string): number => {
  const len = Math.min(a.length, b.length);
  let total = 0;
  for (let i = 0; i < len; i++) {
    const na = parseInt(a[i], 16);
    const nb = parseInt(b[i], 16);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) {
      total += popcount4(na ^ nb);
    }
  }
  return total;
};

/**
 * Cryptographic hash avalanche comparator (`hash-sha256-verify`).
 * Compares two nearly identical inputs (`"snacks"` vs `"snackS"`), highlights every
 * changed hex character across their 64-character SHA-256 digests, and animates the bit-flip counter.
 */
export const AvalancheGrid: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  algo?: string;
  inputA: string;
  inputB: string;
  hashA: string;
  hashB: string;
  diffAt?: number;
  bitsFlipped?: number;
  totalBits?: number;
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  algo = "SHA-256",
  inputA,
  inputB,
  hashA,
  hashB,
  diffAt,
  bitsFlipped,
  totalBits = 256,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const rowAEnter = prog(frame, at + 4, 10);
  const rowBEnter = prog(frame, at + 10, 10);
  const diffTrigger = diffAt ?? at + 18;
  const diffP = prog(frame, diffTrigger, 14, easeOut);
  const showDiff = frame >= diffTrigger;

  const actualFlipped = bitsFlipped ?? countChangedBits(hashA, hashB);
  const animatedBits = Math.round(lerp(0, actualFlipped, diffP));
  const pct = ((animatedBits / totalBits) * 100).toFixed(1);

  const cleanA = hashA.replace(/\s+/g, "").toLowerCase();
  const cleanB = hashB.replace(/\s+/g, "").toLowerCase();
  const rowLen = 32;
  const rowsA = [cleanA.slice(0, rowLen), cleanA.slice(rowLen, rowLen * 2)].filter(Boolean);
  const rowsB = [cleanB.slice(0, rowLen), cleanB.slice(rowLen, rowLen * 2)].filter(Boolean);

  let changedNibbles = 0;
  for (let i = 0; i < Math.min(cleanA.length, cleanB.length); i++) {
    if (cleanA[i] !== cleanB[i]) changedNibbles++;
  }

  const accentColors = toneColors("accent", false);
  const badColors = toneColors("bad", false);

  const cardH = TAB_H + 536;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      filename={`${algo} · avalanche effect`}
      icon="shield"
      right={`${totalBits}-bit digest · 64 hex chars`}
      style={style}
    >
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Digest Card A */}
        <div
          style={{
            borderRadius: 20,
            background: "#F5F5F7",
            border: `1.5px solid ${C.line}`,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            ...materialize(rowAEnter, 0.96, 6),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.mute }}>input A</span>
              <div
                style={{
                  padding: "4px 14px",
                  borderRadius: 10,
                  background: C.white,
                  border: `1.5px solid ${C.line}`,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 24,
                  color: C.ink,
                  display: "flex",
                }}
              >
                <span>&quot;</span>
                {inputA.split("").map((ch, idx) => (
                  <span key={idx}>{ch}</span>
                ))}
                <span>&quot;</span>
              </div>
            </div>
            <span style={{ fontFamily: mono, fontSize: 18, color: C.mute }}>original digest</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rowsA.map((rStr, rIdx) => (
              <div key={rIdx} style={{ display: "flex", justifyContent: "space-between" }}>
                {rStr.split("").map((ch, cIdx) => (
                  <div
                    key={cIdx}
                    style={{
                      width: 23,
                      height: 32,
                      borderRadius: 6,
                      background: C.white,
                      border: `1px solid ${C.line}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: mono,
                      fontWeight: 600,
                      fontSize: 19,
                      color: C.ink,
                    }}
                  >
                    {ch}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Digest Card B (with character diff highlight) */}
        <div
          style={{
            borderRadius: 20,
            background: showDiff ? "#F8FBFF" : "#F5F5F7",
            border: `2px solid ${showDiff ? C.accent : C.line}`,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            ...materialize(rowBEnter, 0.96, 6),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.mute }}>input B</span>
              <div
                style={{
                  padding: "4px 14px",
                  borderRadius: 10,
                  background: C.white,
                  border: `1.5px solid ${RED}`,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 24,
                  color: C.ink,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span>&quot;</span>
                {inputB.split("").map((ch, idx) => {
                  const isDiffChar = inputA[idx] !== ch;
                  return (
                    <span
                      key={idx}
                      style={{
                        padding: isDiffChar ? "0 6px" : 0,
                        margin: isDiffChar ? "0 2px" : 0,
                        borderRadius: 6,
                        background: isDiffChar ? badColors.bg : "transparent",
                        color: isDiffChar ? RED : C.ink,
                        border: isDiffChar ? `1.5px solid ${RED}` : "none",
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
                <span>&quot;</span>
              </div>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 8,
                  background: badColors.bg,
                  color: badColors.fg,
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                1 char changed
              </span>
            </div>

            {showDiff ? (
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: C.accent }}>
                {changedNibbles} / {cleanB.length} hex chars changed
              </span>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rowsB.map((rStr, rIdx) => (
              <div key={rIdx} style={{ display: "flex", justifyContent: "space-between" }}>
                {rStr.split("").map((ch, cIdx) => {
                  const gIdx = rIdx * rowLen + cIdx;
                  const changed = cleanA[gIdx] !== ch;
                  const cellReveal = showDiff ? prog(frame, diffTrigger + gIdx * 0.15, 6) : 0;
                  const activeDiff = changed && cellReveal > 0.1;

                  return (
                    <div
                      key={cIdx}
                      style={{
                        width: 23,
                        height: 32,
                        borderRadius: 6,
                        background: activeDiff ? tint(C.accent, 0.16) : C.white,
                        border: `${activeDiff ? 1.8 : 1}px solid ${activeDiff ? C.accent : C.line}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: mono,
                        fontWeight: activeDiff ? 700 : 500,
                        fontSize: 19,
                        color: activeDiff ? C.accent : C.mute,
                      }}
                    >
                      {ch}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Avalanche Bit-Flip Counter & 64-Bit Sample Ribbon */}
        <div
          style={{
            height: 92,
            borderRadius: 20,
            background: showDiff ? accentColors.bg : "#F5F5F7",
            border: `2px solid ${showDiff ? C.accent : C.line}`,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...materialize(showDiff ? prog(frame, diffTrigger, 10) : 0.4, 0.96, 4),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="bolt" size={26} color={C.accent} />
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 23, color: C.ink, letterSpacing: "-0.01em" }}>
                avalanche effect · bit-flip distribution
              </span>
            </div>
            {/* Mini 64-cell binary XOR strip */}
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: 48 }).map((_, bIdx) => {
                const nibIdx = Math.floor(bIdx / 3);
                const bitMask = 1 << (bIdx % 3);
                const na = parseInt(cleanA[nibIdx] ?? "0", 16) || 0;
                const nb = parseInt(cleanB[nibIdx] ?? "0", 16) || 0;
                const flipped = ((na ^ nb) & bitMask) !== 0;
                return (
                  <div
                    key={bIdx}
                    style={{
                      width: 6,
                      height: 16,
                      borderRadius: 2,
                      background: showDiff && flipped ? C.accent : "rgba(0,0,0,0.12)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Prominent Counter Pill */}
          <div
            style={{
              padding: "12px 22px",
              borderRadius: 16,
              background: C.accent,
              color: C.white,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 25,
              fontVariantNumeric: "tabular-nums",
              boxShadow: "0 8px 20px rgba(0,113,227,0.24)",
            }}
          >
            {animatedBits} / {totalBits} bits flipped ({pct}%)
          </div>
        </div>
      </div>
    </DevCard>
  );
};
