import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

const toArray = (v?: number | number[]): number[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

/**
 * Process virtual memory address space diagram (`0xFFFF...` to `0x0000...`):
 * shows `Stack ↓` (growing down as stack frames push at `pushStackAt`), free gap,
 * `Heap ↑` (growing up as allocations occur at `allocHeapAt`), `.data / .bss`, and `.text (code)` —
 * plus an optional `overflowAt` cue showing a stack overflow or buffer overflow crossing a boundary in red.
 */
export const MemoryLayout: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  pushStackAt?: number | number[];
  stackFrames?: string[];
  allocHeapAt?: number | number[];
  heapBlocks?: string[];
  overflowAt?: number;
  overflowLabel?: string;
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 740,
  at = 0,
  until,
  pushStackAt,
  stackFrames = ["main() · 64 B", "parse_req(buf) · 256 B", "recurse(n+1) · 512 B"],
  allocHeapAt,
  heapBlocks = ["malloc(4 KB) · user_t", "realloc(16 KB) · arena"],
  overflowAt,
  overflowLabel = "SIGSEGV · stack overflow into guard page",
  filename = "/proc/self/maps",
  right = "64-bit virtual memory",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const pushCues = toArray(pushStackAt);
  const allocCues = toArray(allocHeapAt);

  // Smooth growth progress (0 .. pushCues.length) for Stack
  let stackGrowth = 0;
  for (const cue of pushCues) {
    stackGrowth += prog(frame, cue, 14, easeInOut);
  }

  // Smooth growth progress (0 .. allocCues.length) for Heap
  let heapGrowth = 0;
  for (const cue of allocCues) {
    heapGrowth += prog(frame, cue, 14, easeInOut);
  }

  const ovP = overflowAt !== undefined ? prog(frame, overflowAt, 14, easeOut) : 0;

  const tabH = filename !== undefined ? TAB_H : 0;
  const bodyH = h - tabH;
  const padX = 32;
  const padY = 26;
  const addrW = 205;
  const colX = padX + addrW + 16;
  const colW = w - colX - padX;
  const totalMapH = bodyH - padY * 2;

  // Segment heights inside totalMapH
  const textH = 74;
  const dataH = 74;
  const baseStackH = 100;
  const extraStackPerPush = 46;
  const stackH = baseStackH + stackGrowth * extraStackPerPush + ovP * 38;

  const baseHeapH = 92;
  const extraHeapPerAlloc = 44;
  const heapH = baseHeapH + heapGrowth * extraHeapPerAlloc;

  const stackTop = padY;
  const textTop = padY + totalMapH - textH;
  const dataTop = textTop - 10 - dataH;
  const heapBottom = dataTop - 10;
  const heapTop = heapBottom - heapH;
  const freeTop = stackTop + stackH + 8;
  const freeH = Math.max(44, heapTop - 8 - freeTop);

  const stackBg = interpolateColors(ovP, [0, 1], [BLUE_TINT, "#FFF1F0"]);
  const stackBorder = interpolateColors(ovP, [0, 1], [C.accent, RED]);
  const stackColor = interpolateColors(ovP, [0, 1], [C.accent, "#C9281E"]);

  const addrRow = (topY: number, hex: string, note?: string, isRed = false) => (
    <div
      key={hex}
      style={{
        position: "absolute",
        left: padX,
        top: topY - 12,
        width: addrW,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        paddingRight: 8,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 19,
          color: isRed ? RED : C.ink,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {hex}
      </span>
      {note ? (
        <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 15, color: isRed ? RED : C.mute }}>
          {note}
        </span>
      ) : null}
    </div>
  );

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="ram" right={right} style={style}>
      {/* Address labels on left */}
      {addrRow(stackTop + 8, "0x7FFF_FFFF_F000", "high addr")}
      {addrRow(stackTop + stackH - 12, ovP > 0.3 ? "0x7FFF_FFFE_0000!" : "0x7FFF_FFFF_D800", "RSP ↓", ovP > 0.3)}
      {addrRow(heapTop + 8, "0x0000_5555_9000", "brk ↑")}
      {addrRow(dataTop + 12, "0x0000_0060_2000", "rw-p")}
      {addrRow(textTop + 12, "0x0000_0040_1000", "r-xp")}
      {addrRow(textTop + textH - 12, "0x0000_0000_0000", "low addr")}

      {/* 1. STACK ↓ (grows downward) */}
      <div
        style={{
          position: "absolute",
          left: colX,
          top: stackTop,
          width: colW,
          height: stackH,
          borderRadius: 18,
          background: stackBg,
          border: `2.5px solid ${stackBorder}`,
          padding: "14px 20px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          ...materialize(prog(frame, at + 2, 10)),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 25, color: stackColor, letterSpacing: "-0.02em" }}>
              Stack ↓
            </span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 8,
                background: tint(ovP > 0.5 ? RED : C.accent, 0.14),
                fontFamily: mono,
                fontWeight: 600,
                fontSize: 17,
                color: stackColor,
              }}
            >
              LIFO frames · grows down
            </span>
          </div>
          <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 18, color: stackColor }}>
            {1 + pushCues.filter((c) => frame >= c).length} frame(s)
          </span>
        </div>

        {/* Stack frame pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {stackFrames.slice(0, 1 + pushCues.length).map((label, idx) => {
            const cueAt = idx === 0 ? at + 4 : pushCues[idx - 1];
            if (frame < cueAt) return null;
            const fp = prog(frame, cueAt, 10, easeOut);
            return (
              <div
                key={label}
                style={{
                  height: 34,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.78)",
                  border: `1px solid ${tint(ovP > 0.5 ? RED : C.accent, 0.28)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  fontFamily: mono,
                  fontSize: 18,
                  fontWeight: 600,
                  color: C.ink,
                  opacity: fp,
                  translate: `0px ${(1 - fp) * -8}px`,
                }}
              >
                <span>{label}</span>
                <span style={{ color: stackColor, fontSize: 16 }}>frame #{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. FREE / UNMAPPED GAP (plus red overflow breach when overflowAt fires) */}
      <div
        style={{
          position: "absolute",
          left: colX,
          top: freeTop,
          width: colW,
          height: freeH,
          borderRadius: 16,
          background: ovP > 0 ? interpolateColors(ovP, [0, 1], ["#F5F5F7", "#FFF1F0"]) : "#F5F5F7",
          border: `2px dashed ${ovP > 0 ? interpolateColors(ovP, [0, 1], ["rgba(0,0,0,0.16)", RED]) : "rgba(0,0,0,0.16)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          boxSizing: "border-box",
        }}
      >
        {ovP > 0.05 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 18px",
              borderRadius: 12,
              background: RED,
              color: C.white,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 20,
              ...materialize(ovP, 0.9, 4),
            }}
          >
            <Icon name="warning" size={24} color={C.white} weight={2.2} />
            {overflowLabel}
          </div>
        ) : (
          <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 19, color: C.mute }}>
            ↓ unmapped guard & free virtual address space ↑
          </span>
        )}
      </div>

      {/* 3. HEAP ↑ (grows upward) */}
      <div
        style={{
          position: "absolute",
          left: colX,
          top: heapTop,
          width: colW,
          height: heapH,
          borderRadius: 18,
          background: "#EEFAF1",
          border: `2.5px solid ${GREEN}`,
          padding: "12px 20px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          ...materialize(prog(frame, at + 5, 10)),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {heapBlocks.slice(0, 1 + allocCues.length).map((block, idx) => {
            const cueAt = idx === 0 ? at + 7 : allocCues[idx - 1];
            if (frame < cueAt) return null;
            const hp = prog(frame, cueAt, 10, easeOut);
            return (
              <div
                key={block}
                style={{
                  height: 32,
                  borderRadius: 9,
                  background: "rgba(255,255,255,0.82)",
                  border: `1px solid ${tint(GREEN, 0.35)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  fontFamily: mono,
                  fontSize: 17,
                  fontWeight: 600,
                  color: C.ink,
                  opacity: hp,
                  translate: `0px ${(1 - hp) * 8}px`,
                }}
              >
                <span>{block}</span>
                <span style={{ color: "#248A3D", fontSize: 15 }}>allocated</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 24, color: "#248A3D", letterSpacing: "-0.02em" }}>
              Heap ↑
            </span>
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 8,
                background: tint(GREEN, 0.16),
                fontFamily: mono,
                fontWeight: 600,
                fontSize: 17,
                color: "#248A3D",
              }}
            >
              malloc / new · grows up
            </span>
          </div>
          <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 18, color: "#248A3D" }}>
            dynamic
          </span>
        </div>
      </div>

      {/* 4. .data / .bss */}
      <div
        style={{
          position: "absolute",
          left: colX,
          top: dataTop,
          width: colW,
          height: dataH,
          borderRadius: 16,
          background: "rgba(255,159,10,0.12)",
          border: `2px solid ${AMBER}`,
          padding: "0 20px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          ...materialize(prog(frame, at + 8, 10)),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 23, color: "#A05A00" }}>
            .data / .bss
          </span>
          <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 20, color: C.mute }}>
            global & static variables
          </span>
        </div>
        <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 18, color: "#A05A00" }}>
          read / write
        </span>
      </div>

      {/* 5. .text (code) */}
      <div
        style={{
          position: "absolute",
          left: colX,
          top: textTop,
          width: colW,
          height: textH,
          borderRadius: 16,
          background: "#F2F2F7",
          border: `2px solid rgba(0,0,0,0.18)`,
          padding: "0 20px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          ...materialize(prog(frame, at + 10, 10)),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 23, color: C.ink }}>
            .text (code)
          </span>
          <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 20, color: C.mute }}>
            compiled machine instructions
          </span>
        </div>
        <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 18, color: C.mute }}>
          read-only (r-x)
        </span>
      </div>
    </DevCard>
  );
};
