import { interpolateColors, useCurrentFrame } from "remotion";
import { C, easeInOut, easeOut, mono, prog, sans, TERM } from "../../theme";
import { TX, TW, TY } from "../../layout";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type CpuStep = {
  at: number;
  inst: string;
  stage: number; // 0 = Fetch, 1 = Decode, 2 = Execute, 3 = Memory, 4 = Write
  regs: Record<string, string>;
  note?: string;
};

const DEFAULT_STAGES = ["Fetch", "Decode", "Execute", "Memory", "Write"];
const DEFAULT_REGS = ["RAX", "RBX", "RSP", "RIP"];
const DEFAULT_INIT_REGS: Record<string, string> = {
  RAX: "0x00000000",
  RBX: "0x00000000",
  RSP: "0x7FFF0040",
  RIP: "0x00401000",
};

/**
 * CPU instruction pipeline (`Fetch → Decode → Execute → Memory → Write`) & live Register file (`RAX`, `RBX`, `RSP`, `RIP`).
 * Animates instructions stepping through stages while changed register cells flash system blue.
 */
export const CpuPipeline: React.FC<{
  steps: CpuStep[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  stages?: string[];
  registers?: string[];
  initialRegs?: Record<string, string>;
  dark?: boolean;
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  steps,
  x = TX,
  y = TY,
  w = TW,
  h: customH,
  at = 0,
  until,
  stages = DEFAULT_STAGES,
  registers = DEFAULT_REGS,
  initialRegs = DEFAULT_INIT_REGS,
  dark = false,
  filename = "cpu-core-0",
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const sorted = [...steps].sort((a, b) => a.at - b.at);
  let curIdx = -1;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].at <= frame) curIdx = i;
  }

  const cur = curIdx >= 0 ? sorted[curIdx] : null;
  const prev = curIdx > 0 ? sorted[curIdx - 1] : null;
  const stepP = cur ? prog(frame, cur.at, 10, easeInOut) : 0;

  // Compute register values and when each register last changed up to `frame`.
  const regVal: Record<string, string> = { ...initialRegs };
  const regChangedAt: Record<string, number> = {};
  const regPrevVal: Record<string, string> = { ...initialRegs };

  for (let i = 0; i <= curIdx; i++) {
    const s = sorted[i];
    for (const r of registers) {
      if (s.regs[r] !== undefined && s.regs[r] !== regVal[r]) {
        regPrevVal[r] = regVal[r];
        regVal[r] = s.regs[r];
        regChangedAt[r] = s.at;
      }
    }
  }

  const tabH = filename !== undefined ? TAB_H : 0;
  const regRows = Math.ceil(registers.length / 2);
  const bodyH = 440 + (regRows - 2) * 96;
  const h = customH ?? tabH + bodyH;

  const padX = 32;
  const stageGap = 14;
  const stageW = (w - padX * 2 - stageGap * (stages.length - 1)) / stages.length;
  const stageY = 86;
  const stageH = 128;

  // Smooth stage index for the gliding instruction indicator
  const activeStage =
    cur && prev && cur.inst === prev.inst
      ? lerp(prev.stage, cur.stage, stepP)
      : cur
        ? cur.stage
        : -1;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const subBg = dark ? "#262629" : "#F5F5F7";

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="cpu"
      right={right ?? (cur ? `cycle ${curIdx + 1}` : "idle")}
      style={style}
    >
      {/* Top header: active instruction banner */}
      <div
        style={{
          position: "absolute",
          left: padX,
          right: padX,
          top: 22,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 22,
              color: mute,
              letterSpacing: "-0.01em",
            }}
          >
            Instruction pipeline
          </span>
          {cur ? (
            <div
              style={{
                padding: "4px 14px",
                borderRadius: 10,
                background: dark ? tint(TERM.blue, 0.18) : BLUE_TINT,
                border: `1.5px solid ${dark ? TERM.blue : C.accent}`,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 21,
                color: dark ? TERM.blue : C.accent,
              }}
            >
              {cur.inst}
            </div>
          ) : null}
        </div>
        <div
          style={{
            fontFamily: mono,
            fontWeight: 500,
            fontSize: 20,
            color: mute,
          }}
        >
          {cur?.note ?? (cur ? `stage ${cur.stage + 1}/${stages.length} · ${stages[cur.stage]}` : "waiting")}
        </div>
      </div>

      {/* Pipeline stage boxes + connectors */}
      {stages.map((label, i) => {
        const enterP = prog(frame, at + 4 + i * 2, 10, easeOut);
        const sx = padX + i * (stageW + stageGap);
        const dist = activeStage >= 0 ? Math.min(1, Math.abs(activeStage - i)) : 1;
        const activeWeight = 1 - dist;
        const isPast = cur ? i < cur.stage : false;

        const boxBg = interpolateColors(
          activeWeight,
          [0, 1],
          [subBg, dark ? tint(TERM.blue, 0.2) : BLUE_TINT]
        );
        const boxBorder = interpolateColors(
          activeWeight,
          [0, 1],
          [
            isPast ? (dark ? "rgba(100,168,255,0.35)" : "rgba(0,113,227,0.3)") : C.line,
            dark ? TERM.blue : C.accent,
          ]
        );
        const titleColor = interpolateColors(
          activeWeight,
          [0, 1],
          [isPast ? fg : mute, dark ? TERM.blue : C.accent]
        );

        return (
          <div key={label}>
            <div
              style={{
                position: "absolute",
                left: sx,
                top: stageY,
                width: stageW,
                height: stageH,
                borderRadius: 18,
                background: boxBg,
                border: `2.5px solid ${boxBorder}`,
                display: "flex",
                flexDirection: "column",
                 justifyContent: "space-between",
                padding: "14px 14px",
                boxSizing: "border-box",
                opacity: enterP,
                translate: `0px ${(1 - enterP) * 10}px`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 17,
                    color: activeWeight > 0.5 ? (dark ? TERM.blue : C.accent) : mute,
                  }}
                >
                  S{i + 1}
                </span>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    background:
                      activeWeight > 0.5
                        ? dark
                          ? TERM.blue
                          : C.accent
                        : isPast
                          ? "#34C759"
                          : "rgba(0,0,0,0.14)",
                  }}
                />
              </div>

              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: "-0.02em",
                  color: titleColor,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>

              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 500,
                  fontSize: 16,
                  color: activeWeight > 0.4 ? fg : mute,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {activeWeight > 0.4 && cur ? cur.inst : isPast ? "done" : "—"}
              </div>
            </div>

            {/* Arrow connector to next stage */}
            {i < stages.length - 1 ? (
              <svg
                width={stageGap}
                height={24}
                viewBox={`0 0 ${stageGap} 24`}
                style={{
                  position: "absolute",
                  left: sx + stageW,
                  top: stageY + stageH / 2 - 12,
                  opacity: enterP,
                  overflow: "visible",
                }}
              >
                <path
                  d={`M 2 12 H ${stageGap - 3} M ${stageGap - 7} 7 L ${stageGap - 2} 12 L ${stageGap - 7} 17`}
                  fill="none"
                  stroke={isPast ? C.accent : "rgba(0,0,0,0.22)"}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </div>
        );
      })}

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          left: padX,
          right: padX,
          top: stageY + stageH + 24,
          height: 1,
          background: C.line,
        }}
      />

      {/* Register file section header */}
      <div
        style={{
          position: "absolute",
          left: padX,
          right: padX,
          top: stageY + stageH + 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 22,
            color: mute,
            letterSpacing: "-0.01em",
          }}
        >
          Register file (64-bit)
        </span>
        <span style={{ fontFamily: mono, fontSize: 19, color: mute }}>
          blue flash = modified on cycle
        </span>
      </div>

      {/* 2x2 Register grid */}
      {registers.map((reg, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const gapX = 20;
        const gapY = 16;
        const cellW = (w - padX * 2 - gapX) / 2;
        const cellH = 72;
        const cellX = padX + col * (cellW + gapX);
        const cellY = stageY + stageH + 78 + row * (cellH + gapY);

        const changedAt = regChangedAt[reg];
        const hasChanged = changedAt !== undefined && frame >= changedAt;
        // Flash intensity peaks right at changedAt and settles over 22 frames
        const flashDecay = hasChanged ? 1 - prog(frame, changedAt, 22, easeOut) : 0;
        const changedOnCurrentStep = cur !== null && changedAt === cur.at;
        const highlight = Math.max(flashDecay, changedOnCurrentStep ? 0.65 : 0);

        const cellBg = interpolateColors(
          highlight,
          [0, 0.65, 1],
          [
            subBg,
            dark ? tint(TERM.blue, 0.18) : BLUE_TINT,
            dark ? tint(TERM.blue, 0.34) : "#D2E7FF",
          ]
        );
        const cellBorder = interpolateColors(
          highlight,
          [0, 1],
          [C.line, dark ? TERM.blue : C.accent]
        );
        const valColor = interpolateColors(
          highlight,
          [0, 1],
          [fg, dark ? TERM.blue : C.accent]
        );

        const enterP = prog(frame, at + 8 + i * 2, 10, easeOut);

        return (
          <div
            key={reg}
            style={{
              position: "absolute",
              left: cellX,
              top: cellY,
              width: cellW,
              height: cellH,
              borderRadius: 16,
              background: cellBg,
              border: `2px solid ${cellBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              boxSizing: "border-box",
              opacity: enterP,
              scale: String(1 + flashDecay * 0.018),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  padding: "5px 12px",
                  borderRadius: 9,
                  background: highlight > 0.2 ? (dark ? TERM.blue : C.accent) : "rgba(0,0,0,0.07)",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 22,
                  color: highlight > 0.2 ? C.white : fg,
                }}
              >
                {reg}
              </div>
              {changedOnCurrentStep ? (
                <span
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 16,
                    color: dark ? TERM.blue : C.accent,
                    opacity: prog(frame, changedAt, 6),
                  }}
                >
                  ← write
                </span>
              ) : null}
            </div>

            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 25,
                color: valColor,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {regVal[reg] ?? "0x00000000"}
            </div>
          </div>
        );
      })}
    </DevCard>
  );
};
