import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { GREEN, lerp, presence } from "../diagram/Node";
import { TX } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";

export type LzToken =
  | { kind: "lit"; text: string }
  | { kind: "ref"; back: number; len: number; preview?: string };

/**
 * Lossless LZ77 / DEFLATE compression visualizer (`how-zip-works`).
 * Shows raw repeated text transforming at `compressAt` into literal chips + blue `[<- back D, copy L]`
 * pointer chips, paired with an animated before -> after byte size reduction bar.
 */
export const LzTokens: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  tokens: LzToken[];
  compressAt: number;
  beforeBytes: number;
  afterBytes: number;
  title?: string;
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  tokens,
  compressAt,
  beforeBytes,
  afterBytes,
  title = "DEFLATE · LZ77 sliding window",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const rawEnter = prog(frame, at + 4, 10);
  const compP = prog(frame, compressAt, 14, easeInOut);
  const isCompressed = frame >= compressAt;

  const accentColors = toneColors("accent", false);
  const goodColors = toneColors("good", false);
  const warnColors = toneColors("warn", false);

  const curBytes = Math.round(lerp(beforeBytes, afterBytes, compP));
  const savedPct = ((1 - afterBytes / Math.max(1, beforeBytes)) * 100).toFixed(1);
  const ratioBarPct = lerp(100, Math.max(4, (afterBytes / Math.max(1, beforeBytes)) * 100), compP);

  const cardH = TAB_H + 528;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      filename={title}
      icon="box"
      right={isCompressed ? `${savedPct}% smaller` : `${beforeBytes.toLocaleString()} B raw`}
      style={style}
    >
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* 1. Raw Uncompressed Byte Stream */}
        <div
          style={{
            borderRadius: 20,
            background: "#F5F5F7",
            border: `1.5px solid ${C.line}`,
            padding: "16px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            ...materialize(rawEnter, 0.96, 6),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.mute }}>
              1 · raw uncompressed stream
            </span>
            <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 19, color: C.mute }}>
              {beforeBytes.toLocaleString()} B
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            {tokens.map((tk, i) => {
              if (tk.kind === "lit") {
                return (
                  <div
                    key={i}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      background: C.white,
                      border: `2px solid ${C.ink}`,
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 24,
                      color: C.ink,
                      whiteSpace: "pre",
                    }}
                  >
                    {tk.text}
                  </div>
                );
              }
              const previewText = tk.preview ?? "snack ".repeat(Math.max(1, Math.round(tk.len / 6))).trim();
              return (
                <div
                  key={i}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 12,
                    background: isCompressed ? warnColors.bg : C.white,
                    border: `2px ${isCompressed ? "dashed" : "solid"} ${isCompressed ? warnColors.edge : C.line}`,
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 24,
                    color: isCompressed ? warnColors.fg : C.ink,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    whiteSpace: "pre",
                  }}
                >
                  <span style={{ textDecoration: isCompressed ? "line-through" : "none" }}>{previewText}</span>
                  {isCompressed ? (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: C.white,
                        fontFamily: sans,
                        fontWeight: 700,
                        fontSize: 16,
                        color: warnColors.fg,
                      }}
                    >
                      repeat ({tk.len} B)
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. LZ77 Tokenized Output Stream (Literals + Back-references) */}
        <div
          style={{
            borderRadius: 20,
            background: isCompressed ? "#F8FBFF" : "#F5F5F7",
            border: `2px solid ${isCompressed ? C.accent : C.line}`,
            padding: "16px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            ...materialize(isCompressed ? prog(frame, compressAt, 10) : 0.45, 0.96, 5),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="refresh" size={24} color={C.accent} />
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.ink }}>
                2 · LZ77 token stream (literal bytes + sliding-window pointers)
              </span>
            </div>
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: C.accent }}>
              [distance, length]
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            {tokens.map((tk, i) => {
              const tkEnter = isCompressed ? prog(frame, compressAt + 2 + i * 4, 9) : 1;
              if (tk.kind === "lit") {
                return (
                  <div
                    key={i}
                    style={{
                      height: 62,
                      padding: "0 18px",
                      borderRadius: 14,
                      background: C.white,
                      border: `2px solid ${C.line}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      ...materialize(tkEnter, 0.94, 4),
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "#F2F2F4",
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 16,
                        color: C.mute,
                      }}
                    >
                      lit
                    </span>
                    <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 25, color: C.ink, whiteSpace: "pre" }}>
                      {JSON.stringify(tk.text)}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  style={{
                    height: 62,
                    padding: "0 20px",
                    borderRadius: 14,
                    background: accentColors.bg,
                    border: `2.5px solid ${C.accent}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "0 6px 16px rgba(0,113,227,0.12)",
                    ...materialize(tkEnter, 0.92, 4),
                  }}
                >
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      background: C.accent,
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 17,
                      color: C.white,
                    }}
                  >
                    ptr
                  </span>
                  <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 24, color: C.accent }}>
                    [← back {tk.back}, copy {tk.len}]
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Before -> After Byte Size Bar */}
        <div
          style={{
            borderRadius: 20,
            background: C.white,
            border: `2px solid ${isCompressed ? GREEN : C.line}`,
            padding: "16px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: mono, fontWeight: 700, fontSize: 25 }}>
              <span style={{ color: C.mute }}>{beforeBytes.toLocaleString()} B</span>
              <span style={{ color: C.mute }}>→</span>
              <span style={{ color: isCompressed ? goodColors.fg : C.ink, fontVariantNumeric: "tabular-nums" }}>
                {curBytes.toLocaleString()} B
              </span>
            </div>

            {isCompressed ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 16px",
                  borderRadius: 999,
                  background: goodColors.bg,
                  border: `2px solid ${GREEN}`,
                  color: goodColors.fg,
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 21,
                  ...materialize(compP, 0.9, 4),
                }}
              >
                <Icon name="check" size={22} color={goodColors.fg} weight={2.4} />
                <span>{savedPct}% smaller</span>
              </div>
            ) : (
              <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 20, color: C.mute }}>
                uncompressed payload
              </span>
            )}
          </div>

          {/* Animated Compression Ratio Track */}
          <div
            style={{
              height: 24,
              borderRadius: 12,
              background: "#F2F2F4",
              overflow: "hidden",
              padding: 3,
              border: `1px solid ${C.line}`,
            }}
          >
            <div
              style={{
                width: `${ratioBarPct}%`,
                height: "100%",
                borderRadius: 9,
                background: isCompressed ? GREEN : C.accent,
              }}
            />
          </div>
        </div>
      </div>
    </DevCard>
  );
};
