import React from "react";
import { useCurrentFrame } from "remotion";
import { niceScale } from "../charts/chart";
import { DevCard, Tone, toneColors } from "../dev/card";
import { GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";
import { TW, TX, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type WaterfallStep = {
  label: string;
  delta: number;
  unit?: string;
  isTotal?: boolean;
  tone?: Tone;
};

const fmtSigned = (v: number, isTotal: boolean | undefined, unit: string, prefixUnit: boolean, decimals: number) => {
  const abs = Math.abs(v).toFixed(decimals);
  const sign = isTotal ? "" : v >= 0 ? "+" : "\u2212";
  if (!unit) return `${sign}${abs}`;
  return prefixUnit ? `${sign}${unit}${abs}` : `${sign}${abs} ${unit}`;
};

/**
 * Cumulative Bridge / Waterfall chart (for bundle size, cloud cost, MRR, or latency breakdown).
 * Shows floating step bars adding and subtracting to reach the final total bar, connected by dashed bridge wires.
 */
export const WaterfallBreakdown: React.FC<{
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  title?: string;
  subtitle?: string;
  steps: WaterfallStep[];
  unit?: string;
  prefixUnit?: boolean;
  decimals?: number;
  positiveIsGood?: boolean;
  stagger?: number;
  dur?: number;
  dark?: boolean;
}> = ({
  at,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 560,
  title = "Bundle size optimization waterfall",
  subtitle = "cumulative gzipped payload across build steps",
  steps,
  unit = "KB",
  prefixUnit = false,
  decimals = 0,
  positiveIsGood = false,
  stagger = 5,
  dur = 16,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null || steps.length === 0) return null;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const gridColor = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const axisColor = dark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.18)";

  // Compute cumulative start/end values for each step
  let running = 0;
  const computed = steps.map((step, i) => {
    if (step.isTotal) {
      const endVal = step.delta !== 0 ? step.delta : running;
      running = endVal;
      return {
        step,
        i,
        startVal: 0,
        endVal,
        displayDelta: endVal,
      };
    }
    const startVal = running;
    const endVal = running + step.delta;
    running = endVal;
    return {
      step,
      i,
      startVal,
      endVal,
      displayDelta: step.delta,
    };
  });

  const allVals = [0, ...computed.flatMap((c) => [c.startVal, c.endVal])];
  const scale = niceScale(Math.min(0, ...allVals), Math.max(1, ...allVals) * 1.08, 4);

  const headerH = 106;
  const padL = 112;
  const padR = 38;
  const padT = 48;
  const padB = 72;
  const plotW = w - padL - padR;
  const plotH = h - headerH - padT - padB;

  const yOf = (val: number) => {
    const t = (val - scale.min) / Math.max(1e-6, scale.max - scale.min);
    return padT + plotH * (1 - t);
  };

  const slot = plotW / computed.length;
  const barW = Math.min(88, Math.max(36, slot * 0.58));

  const greenC = dark ? TERM.green : GREEN;
  const redC = dark ? TERM.red : RED;
  const blueC = dark ? TERM.blue : C.accent;
  const baseTotalC = dark ? "#8E8E93" : "#6E6E73";

  const colorForStep = (c: (typeof computed)[number]) => {
    if (c.step.tone) return toneColors(c.step.tone, dark).edge;
    if (c.step.isTotal) {
      return c.i === computed.length - 1 ? blueC : baseTotalC;
    }
    const isGood = positiveIsGood ? c.step.delta >= 0 : c.step.delta < 0;
    return isGood ? greenC : redC;
  };

  // Summary badge on top right: net change from first step to final running total
  const initialVal = computed[0].endVal;
  const finalVal = computed[computed.length - 1].endVal;
  const netPct =
    initialVal > 0 ? Math.round(((finalVal - initialVal) / initialVal) * 100) : 0;
  const netSign = netPct > 0 ? "+" : netPct < 0 ? "\u2212" : "";

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

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: mono, fontSize: 18, color: mute }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: redC }} />
              {positiveIsGood ? "drop" : "added"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: greenC }} />
              {positiveIsGood ? "gain" : "saved"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: blueC }} />
              total
            </span>
          </div>

          {computed.length > 1 && initialVal > 0 ? (
            <div
              style={{
                padding: "7px 15px",
                borderRadius: 12,
                background:
                  (positiveIsGood ? netPct >= 0 : netPct <= 0)
                    ? toneColors("good", dark).bg
                    : toneColors("bad", dark).bg,
                color:
                  (positiveIsGood ? netPct >= 0 : netPct <= 0)
                    ? toneColors("good", dark).fg
                    : toneColors("bad", dark).fg,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 21,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {netSign}
              {Math.abs(netPct)}%
            </div>
          ) : null}
        </div>
      </div>

      {/* Plot area */}
      <div style={{ position: "relative", width: w, height: h - headerH }}>
        <svg width={w} height={h - headerH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* Horizontal gridlines */}
          {scale.ticks.map((tick) => {
            const ty = yOf(tick);
            const isZero = Math.abs(tick) < 1e-6;
            return (
              <line
                key={tick}
                x1={padL}
                x2={w - padR}
                y1={ty}
                y2={ty}
                stroke={isZero ? axisColor : gridColor}
                strokeWidth={isZero ? 2 : 1.5}
                strokeDasharray={isZero ? undefined : "6 6"}
              />
            );
          })}

          {/* Dashed horizontal connector bridges between adjacent steps */}
          {computed.map((c, i) => {
            if (i === 0) return null;
            const prev = computed[i - 1];
            const t = at + 6 + i * stagger;
            if (frame < t) return null;
            const wp = prog(frame, t - 2, 10, easeOut);
            const x1 = padL + (i - 1) * slot + slot / 2 + barW / 2;
            const x2 = padL + i * slot + slot / 2 - barW / 2;
            const bridgeY = yOf(prev.endVal);
            return (
              <line
                key={`bridge-${i}`}
                x1={x1}
                x2={lerp(x1, x2, wp)}
                y1={bridgeY}
                y2={bridgeY}
                stroke={WIRE}
                strokeWidth={2}
                strokeDasharray="5 5"
                opacity={wp * 0.85}
              />
            );
          })}

          {/* Step bars */}
          {computed.map((c, i) => {
            const t = at + 6 + i * stagger;
            if (frame < t) return null;
            const bp = prog(frame, t, dur, easeOut);
            const curEnd = lerp(c.startVal, c.endVal, bp);
            const yStart = yOf(c.startVal);
            const yEnd = yOf(curEnd);
            const topY = Math.min(yStart, yEnd);
            const barH = Math.max(6, Math.abs(yEnd - yStart));
            const cx = padL + i * slot + slot / 2;
            const barColor = colorForStep(c);

            return (
              <rect
                key={i}
                x={cx - barW / 2}
                y={topY}
                width={barW}
                height={barH}
                rx={8}
                fill={barColor}
                opacity={ prog(frame, t, 8, easeOut) }
              />
            );
          })}
        </svg>

        {/* Y-axis tick labels */}
        {scale.ticks.map((tick) => {
          const ty = yOf(tick);
          return (
            <div
              key={tick}
              style={{
                position: "absolute",
                left: 0,
                width: padL - 18,
                top: ty - 13,
                textAlign: "right",
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 20,
                color: mute,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {prefixUnit ? `${unit}${tick.toFixed(decimals)}` : `${tick.toFixed(decimals)} ${unit}`}
            </div>
          );
        })}

        {/* Floating step delta labels & X-axis step names */}
        {computed.map((c, i) => {
          const t = at + 6 + i * stagger;
          if (frame < t) return null;
          const bp = prog(frame, t, dur, easeOut);
          const lp = prog(frame, t, 10, easeOut);
          const curEnd = lerp(c.startVal, c.endVal, bp);
          const topVal = Math.max(c.startVal, curEnd);
          const topY = yOf(topVal);
          const cx = padL + i * slot + slot / 2;
          const barColor = colorForStep(c);
          const stepUnit = c.step.unit ?? unit;

          return (
            <React.Fragment key={i}>
              {/* Value / Delta label above bar */}
              <div
                style={{
                  position: "absolute",
                  left: cx,
                  top: topY - 10,
                  translate: "-50% -100%",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 21,
                  color: c.step.isTotal && i < computed.length - 1 ? fg : barColor,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                  ...materialize(lp, 0.95, 4),
                }}
              >
                {fmtSigned(c.displayDelta * bp, c.step.isTotal, stepUnit, prefixUnit, decimals)}
              </div>

              {/* X-axis label below baseline */}
              <div
                style={{
                  position: "absolute",
                  left: cx,
                  top: padT + plotH + 16,
                  translate: "-50% 0",
                  fontFamily: sans,
                  fontWeight: c.step.isTotal ? 700 : 600,
                  fontSize: 21,
                  letterSpacing: "-0.01em",
                  color: c.step.isTotal ? fg : mute,
                  whiteSpace: "nowrap",
                  ...materialize(lp, 0.95, 4),
                }}
              >
                {c.step.label}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </DevCard>
  );
};
