import React from "react";
import { useCurrentFrame } from "remotion";
import { DevCard, TAB_H, Tone, toneColors } from "../dev/card";
import { presence } from "../diagram/Node";
import { TX } from "../../layout";
import { C, materialize, mono, prog, sans, TERM } from "../../theme";

export type HexHighlight = {
  from: number;
  to: number;
  at: number;
  until?: number;
  label?: string;
  tone?: Tone;
};

const parseByte = (b: number | string): { val: number; hex: string; ascii: string; printable: boolean } => {
  const val = typeof b === "number" ? b & 0xff : parseInt(b.replace(/^0x/i, ""), 16) & 0xff;
  const hex = val.toString(16).padStart(2, "0").toUpperCase();
  const printable = val >= 0x20 && val <= 0x7e;
  const ascii = printable ? String.fromCharCode(val) : ".";
  return { val, hex, ascii, printable };
};

/**
 * HexDump (`hexdump -C` / `xxd` view) with synchronized hex cell + ASCII column highlighting
 * and animated callout badges for magic bytes, headers, and binary payloads.
 */
export const HexDump: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  dark?: boolean;
  filename?: string;
  right?: React.ReactNode;
  bytes: (number | string)[];
  cols?: 8 | 16;
  startOffset?: number;
  highlights?: HexHighlight[];
  headerBadge?: { text: string; tone?: Tone; at?: number };
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  dark = true,
  filename = "hexdump -C",
  right,
  bytes,
  cols = 8,
  startOffset = 0,
  highlights = [],
  headerBadge,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const parsed = bytes.map(parseByte);
  const numRows = Math.max(1, Math.ceil(parsed.length / cols));
  const rowH = cols === 8 ? 58 : 46;
  const fontSize = cols === 8 ? 27 : 20;
  const hasFooterBadges = highlights.some((h) => h.label);
  const footerH = hasFooterBadges ? 68 : 0;
  const padY = 24;
  const cardH = (filename !== undefined ? TAB_H : 0) + padY * 2 + numRows * rowH + footerH;

  // Determine active highlight for a given byte index
  const highlightForByte = (idx: number) => {
    let active: { h: HexHighlight; w: number } | null = null;
    for (const h of highlights) {
      if (idx >= h.from && idx <= h.to) {
        const w = presence(frame, h.at, h.until, 8, 6);
        if (w !== null && w > 0) {
          active = { h, w };
        }
      }
    }
    return active;
  };

  const badgeVis = headerBadge ? presence(frame, headerBadge.at ?? at + 6, undefined, 8, 6) : null;
  const badgeColors = headerBadge ? toneColors(headerBadge.tone ?? "accent", dark) : null;

  const rightNode = (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {right ? <span>{right}</span> : null}
      {headerBadge && badgeVis !== null && badgeColors ? (
        <div
          style={{
            padding: "4px 14px",
            borderRadius: 999,
            background: badgeColors.bg,
            border: `1.5px solid ${badgeColors.edge}`,
            color: badgeColors.fg,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 20,
            ...materialize(badgeVis, 0.92, 4),
          }}
        >
          {headerBadge.text}
        </div>
      ) : null}
    </div>
  );

  const cellW = cols === 8 ? 48 : 29;
  const asciiCellW = cols === 8 ? 24 : 15;

  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} dark={dark} filename={filename} icon="terminal" right={rightNode} style={style}>
      <div style={{ padding: `${padY}px 28px`, display: "flex", flexDirection: "column" }}>
        {Array.from({ length: numRows }).map((_, rIdx) => {
          const rowStart = rIdx * cols;
          const rowEnter = prog(frame, at + 4 + rIdx * 3, 8);
          const offsetHex = (startOffset + rowStart).toString(16).padStart(8, "0");

          return (
            <div
              key={rIdx}
              style={{
                height: rowH,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: rowEnter,
                translate: `0px ${(1 - rowEnter) * 8}px`,
                fontFamily: mono,
                fontSize,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {/* Offset column */}
              <div
                style={{
                  color: dark ? TERM.dim : C.mute,
                  fontWeight: 500,
                  fontSize: cols === 8 ? 23 : 18,
                  width: cols === 8 ? 124 : 102,
                  flexShrink: 0,
                }}
              >
                {offsetHex}
              </div>

              {/* Hex bytes grid */}
              <div style={{ display: "flex", alignItems: "center", gap: cols === 8 ? 6 : 3 }}>
                {Array.from({ length: cols }).map((__, cIdx) => {
                  const bIdx = rowStart + cIdx;
                  const item = parsed[bIdx];
                  const midGap = cIdx === cols / 2 - 1 ? (cols === 8 ? 14 : 10) : 0;
                  if (!item) {
                    return <div key={cIdx} style={{ width: cellW, height: rowH - 10, marginRight: midGap }} />;
                  }
                  const hl = highlightForByte(bIdx);
                  const tc = hl ? toneColors(hl.h.tone ?? "accent", dark) : null;
                  const isStart = hl ? bIdx === hl.h.from || cIdx === 0 : false;
                  const isEnd = hl ? bIdx === hl.h.to || cIdx === cols - 1 : false;

                  return (
                    <div
                      key={cIdx}
                      style={{
                        width: cellW,
                        height: rowH - 12,
                        marginRight: midGap,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: `${isStart ? 10 : 4}px ${isEnd ? 10 : 4}px ${isEnd ? 10 : 4}px ${isStart ? 10 : 4}px`,
                        background: tc ? tc.bg : "transparent",
                        border: tc ? `2px solid ${tc.edge}` : "2px solid transparent",
                        color: tc ? tc.fg : item.val === 0 ? (dark ? TERM.dim : "#AEAEB2") : dark ? TERM.fg : C.ink,
                        fontWeight: tc ? 700 : 500,
                      }}
                    >
                      {item.hex}
                    </div>
                  );
                })}
              </div>

              {/* ASCII representation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  height: rowH - 12,
                  borderRadius: 12,
                  background: dark ? "rgba(255,255,255,0.04)" : "#F5F5F7",
                  border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
                }}
              >
                {Array.from({ length: cols }).map((__, cIdx) => {
                  const bIdx = rowStart + cIdx;
                  const item = parsed[bIdx];
                  if (!item) {
                    return <div key={cIdx} style={{ width: asciiCellW }} />;
                  }
                  const hl = highlightForByte(bIdx);
                  const tc = hl ? toneColors(hl.h.tone ?? "accent", dark) : null;
                  return (
                    <div
                      key={cIdx}
                      style={{
                        width: asciiCellW,
                        height: rowH - 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 6,
                        background: tc ? tc.bg : "transparent",
                        color: tc ? tc.fg : item.printable ? (dark ? TERM.fg : C.ink) : dark ? TERM.dim : "#C7C7CC",
                        fontWeight: tc ? 700 : 500,
                      }}
                    >
                      {item.ascii}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Highlight callout badges bar */}
        {hasFooterBadges ? (
          <div
            style={{
              height: footerH,
              display: "flex",
              alignItems: "center",
              gap: 16,
              paddingTop: 12,
              borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
              marginTop: 6,
            }}
          >
            {highlights.map((h, i) => {
              if (!h.label) return null;
              const vis = presence(frame, h.at, h.until, 8, 6);
              if (vis === null) return null;
              const tc = toneColors(h.tone ?? "accent", dark);
              const rangeStr =
                h.from === h.to
                  ? `0x${(startOffset + h.from).toString(16).padStart(2, "0")}`
                  : `0x${(startOffset + h.from).toString(16).padStart(2, "0")}..0x${(startOffset + h.to).toString(16).padStart(2, "0")}`;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 18px",
                    borderRadius: 12,
                    background: tc.bg,
                    border: `2px solid ${tc.edge}`,
                    ...materialize(vis, 0.94, 4),
                  }}
                >
                  <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: tc.fg }}>{rangeStr}</span>
                  <span style={{ color: dark ? TERM.dim : C.mute, fontSize: 20 }}>·</span>
                  <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 22, color: dark ? TERM.fg : C.ink, letterSpacing: "-0.01em" }}>
                    {h.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
