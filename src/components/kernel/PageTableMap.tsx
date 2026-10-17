import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";

// Virtual Memory → Page Table / TLB → Physical RAM & Swap mapper:
// shows Virtual Pages (0x00..0x04) mapping through Page Table entries
// (Present: 1 → Physical RAM Frame, vs Present: 0 → Page Fault loading from Disk Swap at `faultAt`).

export type PageTableMapProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  lookupAt?: number;
  faultAt?: number;
  swapInAt?: number;
  filename?: string;
  right?: string;
};

type VPage = {
  vp: string;
  addr: string;
  region: string;
  pfn: number; // target physical frame index (0..4)
  faults?: boolean;
};

const VPAGES: VPage[] = [
  { vp: "0x00", addr: "0x0000", region: ".text (rx)", pfn: 2 },
  { vp: "0x01", addr: "0x1000", region: ".data (rw)", pfn: 0 },
  { vp: "0x02", addr: "0x2000", region: "heap (rw)", pfn: 3 },
  { vp: "0x03", addr: "0x3000", region: "mmap (cold)", pfn: 1, faults: true },
  { vp: "0x04", addr: "0x4000", region: "stack (rw)", pfn: 4 },
];

export const PageTableMap: React.FC<PageTableMapProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 900,
  at,
  until,
  lookupAt,
  faultAt,
  swapInAt,
  filename = "mmu-page-table",
  right = "4 KiB pages · CR3 / TLB",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tHit = lookupAt ?? at + 14;
  const tFault = faultAt ?? at + 40;
  const tSwap = swapInAt ?? at + 68;

  const isHitPhase = frame >= tHit && frame < tFault;
  const isFaultPhase = frame >= tFault && frame < tSwap;
  const isSwappedIn = frame >= tSwap;
  const swapAnim = prog(frame, tSwap - 8, 16, easeInOut);

  const badTone = toneColors("bad");
  const goodTone = toneColors("good");
  const warnTone = toneColors("warn");

  const col1X = 30;
  const col1W = 228;
  const col2X = 314;
  const col2W = 272;
  const col3X = 642;
  const col3W = 228;

  const rowTop = 182;
  const rowH = 82;
  const rowGap = 14;
  const rowY = (i: number) => rowTop + i * (rowH + rowGap) + rowH / 2;

  const ramTop = 182;
  const ramRowH = 66;
  const ramGap = 10;
  const ramY = (pfn: number) => ramTop + pfn * (ramRowH + ramGap) + ramRowH / 2;

  const swapBoxTop = 626;
  const swapCenterY = swapBoxTop + 92;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="layers" right={right}>
      {/* Top MMU / TLB Status Banner */}
      <div
        style={{
          margin: "22px 30px 0",
          height: 62,
          borderRadius: 18,
          background: isSwappedIn ? goodTone.bg : isFaultPhase ? badTone.bg : isHitPhase ? BLUE_TINT : "#F4F4F6",
          border: `2px solid ${isSwappedIn ? GREEN : isFaultPhase ? RED : isHitPhase ? C.accent : C.line}`,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Icon
            name={isSwappedIn ? "checkCircle" : isFaultPhase ? "warning" : "bolt"}
            size={26}
            color={isSwappedIn ? goodTone.fg : isFaultPhase ? RED : C.accent}
          />
          <span
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 22,
              color: isSwappedIn ? goodTone.fg : isFaultPhase ? badTone.fg : C.ink,
              letterSpacing: "-0.01em",
            }}
          >
            {isSwappedIn
              ? "page fault resolved · VP 0x03 loaded into PFN 0x01 (Present = 1)"
              : isFaultPhase
                ? "page fault (#PF)! VP 0x03 has Present = 0 · fetching from NVMe swap"
                : isHitPhase
                  ? "TLB hit · VP 0x02 translates to physical frame PFN 0x03 in ~1 ns"
                  : "MMU translates contiguous virtual pages → physical RAM frames"}
          </span>
        </div>
        <div
          style={{
            padding: "5px 14px",
            borderRadius: 10,
            background: C.white,
            border: `1px solid ${C.line}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: isSwappedIn ? goodTone.fg : isFaultPhase ? RED : C.accent,
          }}
        >
          {isSwappedIn ? "P: 1 · RAM ✓" : isFaultPhase ? "trap #14 (#PF)" : "TLB + PT"}
        </div>
      </div>

      {/* Column Headers */}
      <div style={{ position: "absolute", left: col1X, top: 108, width: col1W }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: C.ink }}>virtual memory</div>
        <div style={{ fontFamily: mono, fontSize: 17, color: C.mute }}>contiguous process view</div>
      </div>
      <div style={{ position: "absolute", left: col2X, top: 108, width: col2W }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: C.ink }}>page table (PTEs)</div>
        <div style={{ fontFamily: mono, fontSize: 17, color: C.mute }}>PFN + present bit (P)</div>
      </div>
      <div style={{ position: "absolute", left: col3X, top: 108, width: col3W }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: C.ink }}>physical RAM & swap</div>
        <div style={{ fontFamily: mono, fontSize: 17, color: C.mute }}>4 KiB frames + disk</div>
      </div>

      {/* SVG Connecting Wires: Virtual Pages → PTEs → Physical Frames / Swap */}
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {VPAGES.map((v, i) => {
          const y1 = rowY(i);
          const y2 = rowY(i);
          const yRam = ramY(v.pfn);
          const isTargetHit = i === 2 && isHitPhase;
          const isTargetFault = i === 3 && (isFaultPhase || isSwappedIn);

          const wireCol =
            i === 3
              ? isSwappedIn
                ? GREEN
                : isFaultPhase
                  ? RED
                  : AMBER
              : isTargetHit
                ? C.accent
                : "rgba(0,0,0,0.18)";
          const strokeW = isTargetHit || isTargetFault ? 3.5 : 2;

          const x1R = col1X + col1W;
          const x2L = col2X;
          const x2R = col2X + col2W;
          const x3L = col3X;

          const c1 = `M ${x1R} ${y1} C ${x1R + 28} ${y1}, ${x2L - 28} ${y2}, ${x2L} ${y2}`;
          const destY = i === 3 && !isSwappedIn ? swapCenterY : yRam;
          const c2 = `M ${x2R} ${y2} C ${x2R + 30} ${y2}, ${x3L - 30} ${destY}, ${x3L} ${destY}`;

          return (
            <g key={v.vp}>
              <path d={c1} fill="none" stroke={wireCol} strokeWidth={strokeW} />
              <path
                d={c2}
                fill="none"
                stroke={wireCol}
                strokeWidth={strokeW}
                strokeDasharray={i === 3 && !isSwappedIn ? "7 6" : undefined}
              />
            </g>
          );
        })}

        {/* Animated Swap-In Arrow from Disk Swap up to Physical Frame PFN 0x01 */}
        {swapAnim > 0 ? (
          <path
            d={`M ${col3X + col3W / 2} ${swapBoxTop} L ${col3X + col3W / 2} ${ramTop + 1 * (ramRowH + ramGap) + ramRowH}`}
            fill="none"
            stroke={GREEN}
            strokeWidth={4}
            strokeDasharray="8 6"
            opacity={swapAnim}
          />
        ) : null}
      </svg>

      {/* COLUMN 1: Virtual Pages (0x00..0x04) */}
      {VPAGES.map((v, i) => {
        const isHit = i === 2 && isHitPhase;
        const isFault = i === 3 && isFaultPhase;
        const isFixed = i === 3 && isSwappedIn;
        const borderCol = isFixed ? GREEN : isFault ? RED : isHit ? C.accent : C.line;
        const bgCol = isFixed ? goodTone.bg : isFault ? badTone.bg : isHit ? BLUE_TINT : "#F8F8FA";

        return (
          <div
            key={v.vp}
            style={{
              position: "absolute",
              left: col1X,
              top: rowTop + i * (rowH + rowGap),
              width: col1W,
              height: rowH,
              borderRadius: 16,
              background: bgCol,
              border: `2px solid ${borderCol}`,
              padding: "0 16px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              ...materialize(prog(frame, at + 3 + i * 2, 9)),
            }}
          >
            <div>
              <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 20, color: C.ink }}>
                VP {v.vp}
              </div>
              <div style={{ fontFamily: mono, fontSize: 16, color: C.mute }}>{v.region}</div>
            </div>
            <div
              style={{
                padding: "4px 8px",
                borderRadius: 8,
                background: C.white,
                border: `1px solid ${C.line}`,
                fontFamily: mono,
                fontWeight: 600,
                fontSize: 16,
                color: C.mute,
              }}
            >
              {v.addr}
            </div>
          </div>
        );
      })}

      {/* COLUMN 2: Page Table Entries (PTE 0..4) */}
      {VPAGES.map((v, i) => {
        const isHit = i === 2 && isHitPhase;
        const isFault = i === 3 && isFaultPhase;
        const isFixed = i === 3 && isSwappedIn;
        const presentBit = i === 3 ? (isSwappedIn ? 1 : 0) : 1;
        const borderCol = isFixed ? GREEN : isFault ? RED : isHit ? C.accent : C.line;
        const bgCol = isFixed ? goodTone.bg : isFault ? badTone.bg : isHit ? BLUE_TINT : C.white;

        return (
          <div
            key={v.vp}
            style={{
              position: "absolute",
              left: col2X,
              top: rowTop + i * (rowH + rowGap),
              width: col2W,
              height: rowH,
              borderRadius: 16,
              background: bgCol,
              border: `2px solid ${borderCol}`,
              boxShadow: CARD_SHADOW,
              padding: "0 16px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              ...materialize(prog(frame, at + 5 + i * 2, 9)),
            }}
          >
            <div>
              <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: C.ink }}>
                {presentBit ? `→ PFN 0x0${v.pfn}` : "→ swap #7"}
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 16,
                  color: presentBit ? goodTone.fg : isFault ? RED : warnTone.fg,
                }}
              >
                Present: {presentBit}
              </div>
            </div>

            <div
              style={{
                padding: "5px 12px",
                borderRadius: 10,
                background: presentBit ? goodTone.bg : isFault ? RED : warnTone.bg,
                color: presentBit ? goodTone.fg : isFault ? C.white : warnTone.fg,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {presentBit ? (isHit ? "TLB HIT" : "RAM") : isFault ? "#PF FAULT" : "DISK"}
            </div>
          </div>
        );
      })}

      {/* COLUMN 3 TOP: Physical RAM Frames (PFN 0x00..0x04) */}
      {[0, 1, 2, 3, 4].map((pfn) => {
        const mappedVp = VPAGES.find((v) => v.pfn === pfn)!;
        const isSwapTarget = pfn === 1;
        const occupied = !isSwapTarget || isSwappedIn;
        const isHit = pfn === 3 && isHitPhase;
        const isNewlySwapped = isSwapTarget && isSwappedIn;

        return (
          <div
            key={pfn}
            style={{
              position: "absolute",
              left: col3X,
              top: ramTop + pfn * (ramRowH + ramGap),
              width: col3W,
              height: ramRowH,
              borderRadius: 14,
              background: isNewlySwapped ? goodTone.bg : isHit ? BLUE_TINT : occupied ? "#F8F8FA" : C.white,
              border: `2px ${occupied ? "solid" : "dashed"} ${
                isNewlySwapped ? GREEN : isHit ? C.accent : occupied ? C.line : WIRE
              }`,
              padding: "0 14px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              ...materialize(prog(frame, at + 7 + pfn * 2, 9)),
            }}
          >
            <div>
              <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 18, color: C.ink }}>
                PFN 0x0{pfn}
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 15,
                  color: occupied ? (isNewlySwapped ? goodTone.fg : C.mute) : WIRE,
                }}
              >
                {occupied ? `VP ${mappedVp.vp} · ${mappedVp.region.split(" ")[0]}` : "free frame (4 KiB)"}
              </div>
            </div>
            <Icon
              name={occupied ? "ram" : "plus"}
              size={22}
              color={isNewlySwapped ? GREEN : isHit ? C.accent : occupied ? C.ink : WIRE}
            />
          </div>
        );
      })}

      {/* COLUMN 3 BOTTOM: Disk Swap Partition */}
      <div
        style={{
          position: "absolute",
          left: col3X,
          top: swapBoxTop,
          width: col3W,
          height: 162,
          borderRadius: 20,
          background: isFaultPhase ? badTone.bg : isSwappedIn ? goodTone.bg : warnTone.bg,
          border: `2.5px solid ${isFaultPhase ? RED : isSwappedIn ? GREEN : AMBER}`,
          padding: "16px 16px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="disk" size={24} color={isFaultPhase ? RED : isSwappedIn ? goodTone.fg : warnTone.fg} />
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, color: C.ink }}>NVMe swap</span>
          </div>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 15,
              color: isFaultPhase ? RED : isSwappedIn ? goodTone.fg : warnTone.fg,
            }}
          >
            {isSwappedIn ? "paged in ✓" : isFaultPhase ? "reading..." : "cold page"}
          </span>
        </div>

        <div
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            background: C.white,
            border: `1.5px solid ${C.line}`,
            fontFamily: mono,
            fontSize: 16,
            color: C.ink,
          }}
        >
          <div style={{ fontWeight: 700 }}>slot #7 · VP 0x03</div>
          <div style={{ color: C.mute, fontSize: 15, marginTop: 2 }}>
            {isSwappedIn ? "copied → PFN 0x01" : "4096 B on disk"}
          </div>
        </div>
      </div>

      {/* Travelling Page Packet during Swap-In */}
      {swapAnim > 0 && swapAnim < 1 ? (
        <div
          style={{
            position: "absolute",
            left: col3X + 34,
            top: lerp(swapBoxTop - 10, ramTop + 1 * (ramRowH + ramGap) + 12, swapAnim),
            padding: "6px 14px",
            borderRadius: 14,
            background: goodTone.bg,
            border: `2px solid ${GREEN}`,
            boxShadow: CARD_SHADOW,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 16,
            color: goodTone.fg,
          }}
        >
          4 KiB → PFN 0x01
        </div>
      ) : null}
    </DevCard>
  );
};
