import { interpolateColors, useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { alpha, BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";

// 24 fps vs 30 fps vs 60 fps vs 120 fps motion & frame-time budget (16.67 ms vs 8.33 ms) comparator:
// animates pucks racing across 4 horizontal tracks at their respective sample rates, plus a
// frame-budget bar showing what happens when a frame takes 22 ms ("Dropped frame / Jank!").

export type FrameRateCompareProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  runAt?: number;
  runDur?: number;
  jankAt?: number;
  rates?: number[];
  normalMs?: number;
  jankMs?: number;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
};

const RATE_META: Record<number, { tag: string; steps: number; highlight?: boolean }> = {
  24: { tag: "cinema · choppy", steps: 7 },
  30: { tag: "broadcast · standard", steps: 10 },
  60: { tag: "smooth UI · 16.67 ms", steps: 20 },
  120: { tag: "ProMotion · 8.33 ms", steps: 40, highlight: true },
};

export const FrameRateCompare: React.FC<FrameRateCompareProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 700,
  at,
  until,
  runAt,
  runDur = 56,
  jankAt,
  rates = [24, 30, 60, 120],
  normalMs = 11.4,
  jankMs = 22.0,
  filename = "frame-pacing.trace",
  right = "16.67 ms vs 8.33 ms",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const pad = 28;
  const start = runAt ?? at + 8;
  const jankTrigger = jankAt ?? at + 44;

  // Sweep progress across the tracks (repeats smoothly if held long, or sweeps 0 -> 1 over runDur)
  const elapsed = Math.max(0, frame - start);
  const cycle = runDur + 18;
  const rawSweep = prog(elapsed % cycle, 0, runDur, easeInOut);

  // Frame-budget bar transition from healthy (11.4 ms) to jank spike (22.0 ms)
  const jankP = prog(frame, jankTrigger, 14, easeInOut);
  const currentMs = lerp(normalMs, jankMs, jankP);
  const maxScaleMs = 25;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const trackBg = dark ? "#262629" : "#F5F5F7";
  const borderCol = dark ? "rgba(255,255,255,0.10)" : C.line;

  const badTone = toneColors("bad", dark);
  const goodTone = toneColors("good", dark);
  const accentTone = toneColors("accent", dark);

  const rowH = 82;
  const rowGap = 12;
  const tracksTop = 22;
  const labelW = 176;
  const badgeW = 148;
  const laneW = w - pad * 2 - labelW - badgeW - 36;
  const puckR = 16;

  const budgetTop = tracksTop + rates.length * (rowH + rowGap) + 14;
  const budgetH = h - (filename !== undefined ? TAB_H : 0) - budgetTop - 22;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon="clock" right={right} style={style}>
      {/* 4 Horizontal Motion Tracks */}
      {rates.map((fpsRate, idx) => {
        const rowEnter = prog(frame, at + 4 + idx * 3, 10);
        const meta = RATE_META[fpsRate] ?? {
          tag: `${(1000 / fpsRate).toFixed(2)} ms`,
          steps: Math.max(6, Math.round(fpsRate / 3)),
          highlight: fpsRate >= 120,
        };
        const intervalMs = 1000 / fpsRate;
        const steps = meta.steps;
        // Quantize progress to discrete steps for lower frame rates
        const qProgress = fpsRate >= 120 ? rawSweep : Math.floor(rawSweep * steps) / steps;
        const travelW = laneW - puckR * 2 - 24;
        const puckX = 12 + puckR + qProgress * travelW;
        const isHi = !!meta.highlight;

        return (
          <div
            key={fpsRate}
            style={{
              position: "absolute",
              left: pad,
              right: pad,
              top: tracksTop + idx * (rowH + rowGap),
              height: rowH,
              borderRadius: 18,
              background: isHi ? (dark ? tint(C.accent, 0.14) : BLUE_TINT) : trackBg,
              border: `1.5px solid ${isHi ? C.accent : borderCol}`,
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              gap: 18,
              boxSizing: "border-box",
              ...materialize(rowEnter, 0.97, 4),
            }}
          >
            {/* Left FPS & ms budget label */}
            <div style={{ width: labelW, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 26,
                    color: isHi ? C.accent : fg,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fpsRate} fps
                </span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 16, color: mute, marginTop: 2 }}>
                {intervalMs.toFixed(intervalMs < 10 ? 2 : 1)} ms / frame
              </div>
            </div>

            {/* Center Sampled Motion Track */}
            <div
              style={{
                position: "relative",
                width: laneW,
                height: 48,
                borderRadius: 12,
                background: dark ? "#18181A" : C.white,
                border: `1px solid ${borderCol}`,
                overflow: "hidden",
              }}
            >
              <svg width={laneW} height={48} style={{ display: "block" }}>
                {/* Sample tick marks and ghost trail snapshots */}
                {Array.from({ length: steps + 1 }).map((_, sIdx) => {
                  const u = sIdx / steps;
                  const sx = 12 + puckR + u * travelW;
                  const passed = u <= qProgress + 0.001;
                  const dist = qProgress - u;
                  const ghostAlpha = passed && dist > 0.005 ? Math.max(0.12, 0.48 - dist * 0.65) : 0;
                  return (
                    <g key={sIdx}>
                      <line
                        x1={sx}
                        y1={36}
                        x2={sx}
                        y2={44}
                        stroke={isHi ? alpha(C.accent, 0.4) : dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.15)"}
                        strokeWidth={1.5}
                      />
                      {ghostAlpha > 0 ? (
                        <circle
                          cx={sx}
                          cy={22}
                          r={puckR * 0.68}
                          fill={isHi ? C.accent : mute}
                          opacity={ghostAlpha}
                        />
                      ) : null}
                    </g>
                  );
                })}

                {/* Active Moving Puck */}
                <circle
                  cx={puckX}
                  cy={22}
                  r={puckR}
                  fill={isHi ? C.accent : dark ? TERM.fg : C.ink}
                  stroke={C.white}
                  strokeWidth={3}
                />
              </svg>
            </div>

            {/* Right Smoothness Badge */}
            <div
              style={{
                width: badgeW,
                flexShrink: 0,
                textAlign: "right",
                fontFamily: mono,
                fontSize: 16,
                fontWeight: 700,
                color: isHi ? C.accent : fpsRate >= 60 ? goodTone.fg : mute,
              }}
            >
              <div>{fpsRate >= 120 ? "ultra fluid" : fpsRate >= 60 ? "smooth 60 Hz" : fpsRate === 30 ? "30 Hz step" : "judder / blur"}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: mute, marginTop: 2 }}>{steps} samples</div>
            </div>
          </div>
        );
      })}

      {/* Bottom Section: Frame-Time Budget Comparator (16.67 ms vs 8.33 ms + 22 ms Jank!) */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: budgetTop,
          height: budgetH,
          borderRadius: 20,
          background: jankP > 0.5 ? (dark ? tint(RED, 0.12) : "#FFF6F5") : trackBg,
          border: `1.5px solid ${jankP > 0.4 ? RED : borderCol}`,
          padding: "16px 22px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...materialize(prog(frame, at + 14, 12), 0.97, 5),
        }}
      >
        {/* Top Row: Budget Title + Live Status Pill */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: fg, letterSpacing: "-0.02em" }}>
              Frame-time budget
            </span>
            <span style={{ fontFamily: mono, fontSize: 17, color: mute }}>
              (60 fps = 16.67 ms · 120 fps = 8.33 ms)
            </span>
          </div>

          <div
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              background: jankP > 0.35 ? badTone.bg : goodTone.bg,
              border: `1px solid ${jankP > 0.35 ? badTone.edge : goodTone.edge}`,
              color: jankP > 0.35 ? badTone.fg : goodTone.fg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 18,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {currentMs.toFixed(1)} ms · {jankP > 0.35 ? "Dropped frame / Jank!" : "Within 16.67 ms VSync"}
          </div>
        </div>

        {/* Middle Bar: 0 ms -> 25 ms timeline with 8.33 ms and 16.67 ms deadline markers */}
        {(() => {
          const barW = w - pad * 2 - 44;
          const x8 = (8.33 / maxScaleMs) * barW;
          const x16 = (16.67 / maxScaleMs) * barW;
          const curW = Math.min(1, currentMs / maxScaleMs) * barW;
          const safeW = Math.min(curW, x16);
          const overW = Math.max(0, curW - x16);
          const barColor = interpolateColors(jankP, [0, 0.4, 1], [GREEN, AMBER, RED]);

          return (
            <div style={{ position: "relative", width: barW, height: 64, marginTop: 4 }}>
              {/* Background Bar Track */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 14,
                  height: 30,
                  borderRadius: 10,
                  background: dark ? "#18181A" : C.white,
                  border: `1px solid ${borderCol}`,
                  overflow: "hidden",
                }}
              >
                {/* Portion within 16.67ms */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: safeW,
                    background: jankP > 0.5 ? AMBER : C.accent,
                  }}
                />
                {/* Overflow past 16.67ms VSync deadline */}
                {overW > 0 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: x16,
                      top: 0,
                      bottom: 0,
                      width: overW,
                      background: barColor,
                    }}
                  />
                ) : null}
              </div>

              {/* 8.33 ms (120 fps) deadline marker */}
              <div
                style={{
                  position: "absolute",
                  left: x8,
                  top: 6,
                  height: 46,
                  borderLeft: `2px dashed ${C.accent}`,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 6,
                    top: -6,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 15,
                    color: C.accent,
                    whiteSpace: "nowrap",
                  }}
                >
                  8.33 ms (120 Hz)
                </span>
              </div>

              {/* 16.67 ms (60 fps VSync) deadline marker */}
              <div
                style={{
                  position: "absolute",
                  left: x16,
                  top: 6,
                  height: 46,
                  borderLeft: `3px solid ${RED}`,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 8,
                    top: -6,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 15,
                    color: RED,
                    whiteSpace: "nowrap",
                  }}
                >
                  16.67 ms VSync (60 Hz)
                </span>
              </div>

              {/* Bottom legend labels */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -6,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: mono,
                  fontSize: 15,
                  color: mute,
                }}
              >
                <span>0 ms (frame start)</span>
                <span style={{ color: jankP > 0.35 ? badTone.fg : accentTone.fg, fontWeight: 700 }}>
                  {jankP > 0.35
                    ? `22.0 ms render (+5.33 ms over VSync → missed refresh!)`
                    : `JS + layout + composite = ${currentMs.toFixed(1)} ms`}
                </span>
                <span>25 ms</span>
              </div>
            </div>
          );
        })()}
      </div>
    </DevCard>
  );
};
