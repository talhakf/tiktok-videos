import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { arcPath, polar } from "../charts/chart";
import { AMBER, DevCard, Tone, toneColors } from "../dev/card";
import { alpha, GREEN, lerp, presence, RED } from "../diagram/Node";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type GaugeSubMetric = {
  label: string;
  value: string;
  sub?: string;
  status?: "good" | "warn" | "bad";
};

const DEFAULT_METRICS: GaugeSubMetric[] = [
  { label: "FCP", value: "0.7 s", sub: "first paint", status: "good" },
  { label: "LCP", value: "1.2 s", sub: "largest paint", status: "good" },
  { label: "TBT", value: "30 ms", sub: "blocking time", status: "good" },
  { label: "CLS", value: "0.01", sub: "layout shift", status: "good" },
];

const scoreTone = (v: number): Tone => (v < 50 ? "bad" : v < 90 ? "warn" : "good");
const scoreStatusLabel = (v: number) => (v < 50 ? "poor" : v < 90 ? "needs work" : "fast");

/**
 * Lighthouse / Performance radial arc gauge card.
 * Renders a 240° SVG arc gauge (`value` 0..100, optional `fromValue` + `sweepAt`)
 * with color threshold zones (red <50, amber 50..89, green 90..100) and sub-metric pills (`FCP`, `LCP`, `TBT`, `CLS`).
 */
export const GaugeSpeedometer: React.FC<{
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  title?: string;
  subtitle?: string;
  value: number;
  fromValue?: number;
  sweepAt?: number;
  sweepDur?: number;
  label?: string;
  metrics?: GaugeSubMetric[];
  dark?: boolean;
}> = ({
  at,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 590,
  title = "Lighthouse performance",
  subtitle = "Core Web Vitals · production build",
  value,
  fromValue = 0,
  sweepAt,
  sweepDur = 28,
  label = "performance score",
  metrics = DEFAULT_METRICS,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;

  // Animated score value
  const enterSweep = prog(frame, at + 4, sweepAt !== undefined ? 18 : sweepDur, easeOut);
  const secondSweep = sweepAt !== undefined ? prog(frame, sweepAt, sweepDur, easeInOut) : 0;
  const initialTarget = sweepAt !== undefined ? fromValue : value;
  const baseVal = lerp(sweepAt !== undefined ? 0 : fromValue, initialTarget, enterSweep);
  const curVal = Math.max(0, Math.min(100, sweepAt !== undefined ? lerp(baseVal, value, secondSweep) : baseVal));

  const redC = dark ? TERM.red : RED;
  const amberC = dark ? TERM.yellow : AMBER;
  const greenC = dark ? TERM.green : GREEN;

  // Smooth color transition across the 48..52 and 88..92 threshold boundaries
  const activeColor =
    curVal < 48
      ? redC
      : curVal < 52
        ? interpolateColors(curVal, [48, 52], [redC, amberC])
        : curVal < 88
          ? amberC
          : curVal < 92
            ? interpolateColors(curVal, [88, 92], [amberC, greenC])
            : greenC;

  const curTone = scoreTone(curVal);
  const curToneColors = toneColors(curTone, dark);

  const headerH = 104;
  const bodyH = h - headerH;
  const pillRowH = 114;
  const gaugeAreaH = bodyH - pillRowH - 24;

  const cx = w / 2;
  const cy = gaugeAreaH * 0.62;
  const r = Math.min(156, gaugeAreaH * 0.48);
  const outerR = r + 20;
  const strokeW = 24;

  // 240 degree arc from -120 deg (-1/3 turn) to +120 deg (+1/3 turn)
  const T_START = -1 / 3;
  const T_SPAN = 2 / 3;
  const tOf = (s: number) => T_START + (Math.max(0, Math.min(100, s)) / 100) * T_SPAN;

  const curT = tOf(curVal);
  const tip = polar(cx, cy, r, curT);

  const statusColorFor = (st: "good" | "warn" | "bad" = "good") =>
    st === "good" ? greenC : st === "warn" ? amberC : redC;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark}>
      {/* Header */}
      <div
        style={{
          height: headerH,
          padding: "0 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: "-0.025em",
              color: fg,
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                marginTop: 4,
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 20,
                color: mute,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Threshold zone legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: mono,
            fontWeight: 600,
            fontSize: 18,
            color: mute,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: redC }} />
            0–49
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: amberC }} />
            50–89
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: greenC }} />
            90–100
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ position: "relative", width: w, height: bodyH }}>
        <svg width={w} height={gaugeAreaH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {/* Outer threshold zone band: 0..49 (red), 50..89 (amber), 90..100 (green) */}
          <path
            d={arcPath(cx, cy, outerR, tOf(0), tOf(48.5))}
            stroke={alpha(redC, dark ? 0.35 : 0.28)}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={arcPath(cx, cy, outerR, tOf(50.5), tOf(88.5))}
            stroke={alpha(amberC, dark ? 0.38 : 0.32)}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={arcPath(cx, cy, outerR, tOf(90.5), tOf(100))}
            stroke={alpha(greenC, dark ? 0.42 : 0.35)}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
          />

          {/* Main gauge track */}
          <path
            d={arcPath(cx, cy, r, T_START, T_START + T_SPAN)}
            stroke={dark ? "rgba(255,255,255,0.09)" : "#E5E5EA"}
            strokeWidth={strokeW}
            strokeLinecap="round"
            fill="none"
          />

          {/* Active score sweep arc */}
          {curVal > 0.3 ? (
            <path
              d={arcPath(cx, cy, r, T_START, curT)}
              stroke={activeColor}
              strokeWidth={strokeW}
              strokeLinecap="round"
              fill="none"
            />
          ) : null}

          {/* Score tip indicator dot */}
          <circle
            cx={tip.x}
            cy={tip.y}
            r={strokeW * 0.36}
            fill={dark ? TERM.bg : C.white}
            stroke={activeColor}
            strokeWidth={5}
          />

          {/* Scale tick labels at 0, 50, 90, 100 */}
          {[0, 50, 90, 100].map((tick) => {
            const labelPt = polar(cx, cy, outerR + 24, tOf(tick));
            return (
              <text
                key={tick}
                x={labelPt.x}
                y={labelPt.y + 6}
                textAnchor="middle"
                fill={mute}
                style={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 18,
                }}
              >
                {tick}
              </text>
            );
          })}
        </svg>

        {/* Center score readout */}
        <div
          style={{
            position: "absolute",
            left: cx,
            top: cy - 10,
            translate: "-50% -50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 88,
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
              color: activeColor,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(curVal)}
          </div>
          <div
            style={{
              marginTop: 10,
              padding: "5px 16px",
              borderRadius: 99,
              background: curToneColors.bg,
              color: curToneColors.fg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 19,
            }}
          >
            {scoreStatusLabel(curVal)}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 21,
              color: mute,
              letterSpacing: "-0.01em",
            }}
          >
            {label}
          </div>
        </div>

        {/* Sub-metric pills row (FCP, LCP, TBT, CLS) */}
        <div
          style={{
            position: "absolute",
            left: 34,
            right: 34,
            bottom: 24,
            height: pillRowH,
            display: "grid",
            gridTemplateColumns: `repeat(${metrics.length}, 1fr)`,
            gap: 14,
          }}
        >
          {metrics.map((m, i) => {
            const mp = prog(frame, at + 10 + i * 3, 12, easeOut);
            const stColor = statusColorFor(m.status);
            return (
              <div
                key={m.label}
                style={{
                  borderRadius: 18,
                  background: dark ? "#262629" : C.paper,
                  border: `1.5px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  ...materialize(mp, 0.95, 5),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 20,
                      color: mute,
                    }}
                  >
                    {m.label}
                  </span>
                  <span
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 6,
                      background: stColor,
                    }}
                  />
                </div>

                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 28,
                    color: fg,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {m.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DevCard>
  );
};
