import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";

export type ChmodStep = {
  at: number;
  mode: string;
  label?: string;
  danger?: boolean;
};

const GROUPS: { title: string; sub: string; icon: IconName }[] = [
  { title: "Owner", sub: "you (u)", icon: "user" },
  { title: "Group", sub: "team (g)", icon: "users" },
  { title: "Others", sub: "world (o)", icon: "globe" },
];

const BITS: { name: string; sym: "r" | "w" | "x"; weight: 4 | 2 | 1 }[] = [
  { name: "read", sym: "r", weight: 4 },
  { name: "write", sym: "w", weight: 2 },
  { name: "execute", sym: "x", weight: 1 },
];

const parseOctal = (mode: string): [number, number, number] => {
  const clean = mode.replace(/[^0-7]/g, "").padStart(3, "0").slice(-3);
  return [
    parseInt(clean[0], 10) & 7,
    parseInt(clean[1], 10) & 7,
    parseInt(clean[2], 10) & 7,
  ];
};

const symForDigit = (d: number) =>
  `${d & 4 ? "r" : "-"}${d & 2 ? "w" : "-"}${d & 1 ? "x" : "-"}`;

/**
 * Interactive Linux permissions calculator (`chmod-permissions`).
 * Displays the symbolic permission string (`-rwxr-xr-x`), octal digits (`755`),
 * and the 3x3 binary weight matrix (`read = 4`, `write = 2`, `execute = 1`).
 */
export const ChmodCalc: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  mode: string;
  isDir?: boolean;
  targetName?: string;
  steps?: ChmodStep[];
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  mode,
  isDir = false,
  targetName = "deploy.sh",
  steps = [],
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  // Determine current and previous step for smooth transitions
  const sorted = [...steps].sort((a, b) => a.at - b.at);
  let curMode = mode;
  let prevMode = mode;
  let stepStart: number | null = null;
  let curStep: ChmodStep | null = null;

  for (const s of sorted) {
    if (s.at <= frame) {
      prevMode = curMode;
      curMode = s.mode;
      stepStart = s.at;
      curStep = s;
    }
  }

  const morphT = stepStart !== null ? prog(frame, stepStart, 9, easeInOut) : 1;
  const digits = parseOctal(curMode);
  const prevDigits = parseOctal(prevMode);

  const isDanger = Boolean(curStep?.danger || curMode === "777" || (digits[2] & 2) !== 0);
  const badColors = toneColors("bad", false);
  const accentColors = toneColors("accent", false);

  const groupColors = (gIdx: number) => {
    if (gIdx === 0) return { fg: C.accent, edge: C.accent, bg: tint(C.accent, 0.09) };
    if (gIdx === 1) return { fg: "#248A3D", edge: GREEN, bg: tint(GREEN, 0.11) };
    if (isDanger) return { fg: "#C9281E", edge: RED, bg: tint(RED, 0.11) };
    return { fg: "#A05A00", edge: AMBER, bg: "rgba(255,159,10,0.12)" };
  };

  const cardH = TAB_H + 544;
  const cmdString = `chmod ${curMode} ${targetName}`;

  const rightHeader = (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {isDanger ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 14px",
            borderRadius: 999,
            background: badColors.bg,
            border: `1.5px solid ${RED}`,
            color: badColors.fg,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 19,
            ...materialize(morphT, 0.9, 4),
          }}
        >
          <Icon name="warning" size={20} color={RED} />
          <span>{curStep?.label ?? "world-writable!"}</span>
        </div>
      ) : curStep?.label ? (
        <div
          style={{
            padding: "4px 14px",
            borderRadius: 999,
            background: accentColors.bg,
            border: `1.5px solid ${C.accent}`,
            color: C.accent,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 19,
            ...materialize(morphT, 0.92, 4),
          }}
        >
          {curStep.label}
        </div>
      ) : (
        <span>octal = 4 + 2 + 1</span>
      )}
    </div>
  );

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      filename={cmdString}
      icon={isDanger ? "unlock" : "lock"}
      right={rightHeader}
      style={style}
    >
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Top Summary Bar: Symbolic String (-rwxr-xr-x) + Octal Digits (7 5 5) */}
        <div
          style={{
            height: 102,
            borderRadius: 22,
            background: "#F5F5F7",
            border: `1.5px solid ${isDanger ? RED : C.line}`,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Symbolic breakdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 58,
                borderRadius: 12,
                background: C.white,
                border: `1.5px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 28,
                color: C.mute,
              }}
            >
              {isDir ? "d" : "-"}
            </div>

            {digits.map((d, gIdx) => {
              const gc = groupColors(gIdx);
              const sym = symForDigit(d);
              return (
                <div
                  key={gIdx}
                  style={{
                    height: 58,
                    padding: "0 16px",
                    borderRadius: 14,
                    background: gc.bg,
                    border: `2px solid ${gc.edge}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 28,
                  }}
                >
                  {sym.split("").map((ch, cIdx) => (
                    <span
                      key={cIdx}
                      style={{
                        color: ch === "-" ? "#AEAEB2" : gc.fg,
                        width: 20,
                        textAlign: "center",
                      }}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* 3 Big Octal Digits */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, color: C.mute, marginRight: 4 }}>
              octal
            </span>
            {digits.map((d, gIdx) => {
              const gc = groupColors(gIdx);
              const changed = prevDigits[gIdx] !== d;
              const slideY = changed ? (1 - morphT) * -10 : 0;
              return (
                <div
                  key={gIdx}
                  style={{
                    width: 66,
                    height: 68,
                    borderRadius: 16,
                    background: C.white,
                    border: `2.5px solid ${gc.edge}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 38,
                    color: gc.fg,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <span style={{ translate: `0px ${slideY}px` }}>{d}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 Columns: Owner (you), Group (team), Others (world) */}
        <div style={{ display: "flex", gap: 18 }}>
          {GROUPS.map((g, gIdx) => {
            const colEnter = prog(frame, at + 6 + gIdx * 4, 10);
            const d = digits[gIdx];
            const prevD = prevDigits[gIdx];
            const gc = groupColors(gIdx);

            return (
              <div
                key={gIdx}
                style={{
                  flex: 1,
                  borderRadius: 22,
                  background: C.white,
                  border: `2px solid ${gIdx === 2 && isDanger ? RED : C.line}`,
                  padding: "18px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  ...materialize(colEnter, 0.95, 6),
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: 10,
                    borderBottom: `1px solid ${C.line}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: gc.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name={g.icon} size={24} color={gc.fg} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 23, color: C.ink, lineHeight: 1.1 }}>
                        {g.title}
                      </span>
                      <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 17, color: C.mute }}>
                        {g.sub}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: gc.bg,
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 20,
                      color: gc.fg,
                    }}
                  >
                    {symForDigit(d)}
                  </span>
                </div>

                {/* 3 Bit Rows: read = 4, write = 2, execute = 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {BITS.map((bit) => {
                    const onNow = (d & bit.weight) !== 0 ? 1 : 0;
                    const onPrev = (prevD & bit.weight) !== 0 ? 1 : 0;
                    const bitP = lerp(onPrev, onNow, morphT);
                    const isOn = onNow === 1;

                    return (
                      <div
                        key={bit.sym}
                        style={{
                          height: 60,
                          borderRadius: 14,
                          background: isOn ? gc.bg : "#F5F5F7",
                          border: `2px solid ${isOn ? gc.edge : "transparent"}`,
                          padding: "0 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {/* Toggle Switch */}
                          <div
                            style={{
                              width: 44,
                              height: 26,
                              borderRadius: 13,
                              background: isOn ? gc.edge : "#D1D1D6",
                              padding: 3,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                background: C.white,
                                translate: `${bitP * 18}px 0px`,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontFamily: sans,
                              fontWeight: 600,
                              fontSize: 21,
                              color: isOn ? C.ink : C.mute,
                            }}
                          >
                            {bit.name}
                          </span>
                        </div>

                        <div
                          style={{
                            fontFamily: mono,
                            fontWeight: 700,
                            fontSize: 22,
                            color: isOn ? gc.fg : "#AEAEB2",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {isOn ? `+${bit.weight}` : "0"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Sum Row: 4 + 2 + 1 = 7 */}
                <div
                  style={{
                    height: 52,
                    borderRadius: 14,
                    background: "#F5F5F7",
                    padding: "0 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: mono,
                    fontSize: 20,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <span style={{ color: C.mute, fontWeight: 500 }}>
                    {d & 4 ? "4" : "0"} + {d & 2 ? "2" : "0"} + {d & 1 ? "1" : "0"}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 25, color: gc.fg }}>= {d}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DevCard>
  );
};
