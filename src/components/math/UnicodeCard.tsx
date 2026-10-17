import { useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type UnicodeItem = {
  char: string;
  name: string;
  codePoint: string;
  utf8Hex: string[];
  utf8Bits?: string;
  bytes: number;
  at?: number;
};

const hexByteToBits = (hex: string) =>
  (parseInt(hex.replace(/^0x/i, ""), 16) & 0xff).toString(2).padStart(8, "0");

const prefixLenForByte = (byteIdx: number, totalBytes: number) => {
  if (byteIdx > 0) return 2; // continuation byte "10xxxxxx"
  if (totalBytes === 1) return 1; // "0xxxxxxx"
  if (totalBytes === 2) return 3; // "110xxxxx"
  if (totalBytes === 3) return 4; // "1110xxxx"
  return 5; // "11110xxx"
};

const byteColor = (bytes: number) => {
  if (bytes === 1) return C.ink;
  if (bytes === 2) return GREEN;
  if (bytes === 3) return AMBER;
  return C.accent;
};

/**
 * Character / Emoji → Unicode Code Point → UTF-8 multi-byte encoding breakdown.
 * Shows glyph, character name, code point (e.g. U+0041, U+1F99D), UTF-8 hex bytes,
 * and UTF-8 prefix vs payload bit structure.
 */
export const UnicodeCard: React.FC<{
  items: UnicodeItem[];
  at?: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  filename?: string;
  icon?: IconName;
  showBits?: boolean;
}> = ({
  items,
  at = 0,
  until,
  x = TX,
  y = TY,
  w = TW,
  h,
  dark = false,
  filename = "utf8-encoding",
  icon = "code",
  showBits = true,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;

  const rowH = showBits ? 142 : 108;
  const gap = 14;
  const padY = 24;
  const headerH = 44;
  const computedH =
    (filename !== undefined ? TAB_H : 0) +
    padY * 2 +
    headerH +
    items.length * rowH +
    Math.max(0, items.length - 1) * gap;
  const totalH = h ?? computedH;
  const bodyH = totalH - (filename !== undefined ? TAB_H : 0);

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const borderCol = dark ? "rgba(255,255,255,0.1)" : C.line;
  const rowBg = dark ? "rgba(255,255,255,0.04)" : "#F7F7FA";

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={totalH}
      p={p}
      dark={dark}
      filename={filename}
      icon={icon}
      right="char → code point → utf-8"
    >
      <div
        style={{
          height: bodyH,
          padding: `${padY}px 28px`,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap,
        }}
      >
        {/* Column legend header */}
        <div
          style={{
            height: headerH - gap,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
            fontFamily: mono,
            fontWeight: 600,
            fontSize: 17,
            color: mute,
          }}
        >
          <span>glyph · character</span>
          <span>unicode code point</span>
          <span>utf-8 bytes (hex & binary prefix)</span>
        </div>

        {items.map((item, idx) => {
          const itemAt = item.at ?? at + 6 + idx * 12;
          const itemP = prog(frame, itemAt, 11, easeOut);
          const accentCol = byteColor(item.bytes);
          const isFourByte = item.bytes >= 4;

          const bitGroups = item.utf8Bits
            ? item.utf8Bits.trim().split(/\s+/)
            : item.utf8Hex.map(hexByteToBits);

          return (
            <div
              key={`${item.codePoint}-${idx}`}
              style={{
                height: rowH,
                padding: "14px 18px",
                borderRadius: 20,
                background: isFourByte ? (dark ? tint(C.accent, 0.14) : BLUE_TINT) : rowBg,
                border: `1.5px solid ${isFourByte ? C.accent : borderCol}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 18,
                ...materialize(itemP, 0.96, 6),
              }}
            >
              {/* 1. Character / Emoji tile */}
              <div
                style={{
                  width: 86,
                  height: rowH - 28,
                  borderRadius: 16,
                  background: dark ? TERM.bg : C.white,
                  border: `1.5px solid ${borderCol}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <div style={{ fontFamily: sans, fontSize: 42, lineHeight: 1 }}>{item.char}</div>
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 13,
                    color: accentCol === C.ink && dark ? TERM.fg : accentCol,
                    padding: "2px 7px",
                    borderRadius: 6,
                    background: tint(accentCol === C.ink ? "#6E6E73" : accentCol, 0.14),
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.bytes} {item.bytes === 1 ? "byte" : "bytes"}
                </div>
              </div>

              {/* 2. Character Name + Code Point */}
              <div
                style={{
                  width: 225,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: 21,
                    color: fg,
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 22,
                      color: C.accent,
                      padding: "4px 12px",
                      borderRadius: 10,
                      background: dark ? tint(C.accent, 0.18) : C.white,
                      border: `1px solid ${tint(C.accent, 0.35)}`,
                    }}
                  >
                    {item.codePoint}
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 20, color: mute }}>→</span>
                </div>
              </div>

              {/* 3. UTF-8 Multi-byte Hex + Binary Breakdown */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {/* Hex bytes row */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}>
                  {item.utf8Hex.map((hex, bIdx) => {
                    const byteP = prog(frame, itemAt + 4 + bIdx * 3, 9, easeOut);
                    return (
                      <div
                        key={bIdx}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 10,
                          background: dark ? TERM.bg : C.white,
                          border: `1.5px solid ${isFourByte ? C.accent : borderCol}`,
                          fontFamily: mono,
                          fontWeight: 700,
                          fontSize: 23,
                          color: fg,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          ...materialize(byteP, 0.9, 4),
                        }}
                      >
                        <span style={{ fontSize: 16, fontWeight: 500, color: mute }}>0x</span>
                        <span>{hex.toUpperCase()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Binary UTF-8 template prefix vs payload bits */}
                {showBits ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}>
                    {bitGroups.map((bits, bIdx) => {
                      const pLen = prefixLenForByte(bIdx, item.bytes);
                      const prefix = bits.slice(0, pLen);
                      const payload = bits.slice(pLen);
                      return (
                        <div
                          key={bIdx}
                          style={{
                            padding: "4px 9px",
                            borderRadius: 8,
                            background: dark ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.04)",
                            fontFamily: mono,
                            fontWeight: 600,
                            fontSize: 15,
                            letterSpacing: "0.02em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span style={{ color: AMBER, fontWeight: 700 }}>{prefix}</span>
                          <span style={{ color: C.accent }}>{payload}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
