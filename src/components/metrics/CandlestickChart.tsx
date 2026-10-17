import React from "react";
import { useCurrentFrame } from "remotion";
import { DevCard, Tone, toneColors } from "../dev/card";
import { alpha, GREEN, lerp, presence, RED } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { niceScale } from "../charts/chart";

export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  label?: string;
};

export type CandleEventCallout = {
  index: number;
  label: string;
  sub?: string;
  at: number;
  tone?: Tone;
};

const fmtVal = (v: number, unit = "", prefixUnit = false, decimals = 0) => {
  const num = v.toFixed(decimals);
  if (!unit) return num;
  return prefixUnit ? `${unit}${num}` : `${num} ${unit}`;
};

/**
 * Financial / Latency OHLC Candlestick chart card.
 * Renders green/red candlesticks cascading left-to-right, plus an optional `eventCallout`
 * pinpointing a flash crash or latency spike.
 */
export const CandlestickChart: React.FC<{
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  title?: string;
  subtitle?: string;
  rightBadge?: string;
  candles: Candle[];
  unit?: string;
  prefixUnit?: boolean;
  decimals?: number;
  invertColors?: boolean;
  stagger?: number;
  dur?: number;
  eventCallout?: CandleEventCallout;
  dark?: boolean;
}> = ({
  at,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 560,
  title = "p99 latency · OHLC",
  subtitle = "10-second windows · edge gateway",
  rightBadge,
  candles,
  unit = "ms",
  prefixUnit = false,
  decimals = 0,
  invertColors = false,
  stagger = 3,
  dur = 14,
  eventCallout,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null || candles.length === 0) return null;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const gridColor = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const axisColor = dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.16)";

  const rawMin = Math.min(...candles.map((c) => c.low));
  const rawMax = Math.max(...candles.map((c) => c.high));
  const scale = niceScale(rawMin, rawMax, 4);

  const headerH = 108;
  const padL = 116;
  const padR = 40;
  const padT = 28;
  const padB = 64;
  const plotW = w - padL - padR;
  const plotH = h - headerH - padT - padB;

  const yOf = (val: number) => {
    const t = (val - scale.min) / Math.max(1e-6, scale.max - scale.min);
    return padT + plotH * (1 - t);
  };

  const slot = plotW / candles.length;
  const bodyW = Math.min(38, Math.max(14, slot * 0.56));

  const bullColor = dark ? TERM.green : GREEN;
  const bearColor = dark ? TERM.red : RED;

  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const netDelta = lastCandle.close - firstCandle.open;
  const netSign = netDelta >= 0 ? "+" : "\u2212";
  const badgeText =
    rightBadge ?? `${netSign}${fmtVal(Math.abs(netDelta), unit, prefixUnit, decimals)}`;

  const calloutP = eventCallout ? prog(frame, eventCallout.at, 12, easeOut) : 0;
  const calloutIndex = eventCallout ? Math.max(0, Math.min(candles.length - 1, eventCallout.index)) : 0;
  const calloutCandle = candles[calloutIndex];
  const calloutX = padL + calloutIndex * slot + slot / 2;
  // Anchor callout to high if spike up, or low if flash crash down
  const isCrashDown =
    calloutCandle &&
    Math.abs(calloutCandle.low - rawMin) < Math.abs(rawMax - calloutCandle.high) &&
    calloutCandle.close < calloutCandle.open;
  const calloutAnchorY = calloutCandle
    ? yOf(isCrashDown ? calloutCandle.low : calloutCandle.high)
    : padT;
  const calloutTone: Tone = eventCallout?.tone ?? "bad";
  const calloutColors = toneColors(calloutTone, dark);

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark}>
      {/* Header bar */}
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

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Legend pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: mono, fontSize: 19, color: mute }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: invertColors ? bearColor : bullColor }} />
              {invertColors ? "spike" : "up"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: invertColors ? bullColor : bearColor }} />
              {invertColors ? "drop" : "down"}
            </span>
          </div>

          <div
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              background: dark ? "rgba(255,255,255,0.07)" : C.paper,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 22,
              color: fg,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {badgeText}
          </div>
        </div>
      </div>

      {/* Plot container */}
      <div style={{ position: "relative", width: w, height: h - headerH }}>
        <svg width={w} height={h - headerH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* Horizontal gridlines */}
          {scale.ticks.map((tick, idx) => {
            const ty = yOf(tick);
            const isBase = idx === 0;
            return (
              <line
                key={tick}
                x1={padL}
                x2={w - padR}
                y1={ty}
                y2={ty}
                stroke={isBase ? axisColor : gridColor}
                strokeWidth={isBase ? 2 : 1.5}
                strokeDasharray={isBase ? undefined : "6 6"}
              />
            );
          })}

          {/* Event callout vertical guide line */}
          {eventCallout && calloutP > 0 ? (
            <g opacity={calloutP}>
              <line
                x1={calloutX}
                x2={calloutX}
                y1={padT}
                y2={padT + plotH}
                stroke={calloutColors.edge}
                strokeWidth={2.5}
                strokeDasharray="6 6"
              />
              <circle
                cx={calloutX}
                cy={calloutAnchorY}
                r={lerp(18, 9, calloutP)}
                fill={alpha(calloutColors.edge, 0.18)}
                stroke={calloutColors.edge}
                strokeWidth={3}
              />
            </g>
          ) : null}

          {/* Candlesticks */}
          {candles.map((c, i) => {
            const t = at + 5 + i * stagger;
            if (frame < t) return null;
            const cp = prog(frame, t, dur, easeOut);
            const cx = padL + i * slot + slot / 2;

            const isUp = c.close >= c.open;
            const color = (invertColors ? !isUp : isUp) ? bullColor : bearColor;

            const midVal = (c.open + c.close) / 2;
            const curHigh = lerp(midVal, c.high, cp);
            const curLow = lerp(midVal, c.low, cp);
            const curOpen = lerp(midVal, c.open, cp);
            const curClose = lerp(midVal, c.close, cp);

            const highY = yOf(curHigh);
            const lowY = yOf(curLow);
            const topY = yOf(Math.max(curOpen, curClose));
            const botY = yOf(Math.min(curOpen, curClose));
            const boxH = Math.max(6, botY - topY);

            const isTarget = eventCallout && eventCallout.index === i && calloutP > 0;

            return (
              <g key={i} opacity={cp}>
                {/* Highlight halo behind event candle */}
                {isTarget ? (
                  <rect
                    x={cx - bodyW / 2 - 7}
                    y={topY - 7}
                    width={bodyW + 14}
                    height={boxH + 14}
                    rx={10}
                    fill={calloutColors.bg}
                    stroke={calloutColors.edge}
                    strokeWidth={2.5}
                    opacity={calloutP}
                  />
                ) : null}

                {/* High-Low Wick */}
                <line
                  x1={cx}
                  x2={cx}
                  y1={highY}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={3.2}
                  strokeLinecap="round"
                />

                {/* Open-Close Body */}
                <rect
                  x={cx - bodyW / 2}
                  y={topY}
                  width={bodyW}
                  height={boxH}
                  rx={5}
                  fill={color}
                />
              </g>
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
              {fmtVal(tick, unit, prefixUnit, decimals)}
            </div>
          );
        })}

        {/* X-axis candle labels */}
        {candles.map((c, i) => {
          if (!c.label) return null;
          const t = at + 5 + i * stagger;
          if (frame < t) return null;
          const lp = prog(frame, t, 10, easeOut);
          const cx = padL + i * slot + slot / 2;
          const isTarget = eventCallout && eventCallout.index === i && calloutP > 0.5;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: cx,
                top: padT + plotH + 16,
                translate: "-50% 0",
                fontFamily: mono,
                fontWeight: isTarget ? 700 : 500,
                fontSize: 20,
                color: isTarget ? calloutColors.fg : mute,
                whiteSpace: "nowrap",
                ...materialize(lp, 0.95, 4),
              }}
            >
              {c.label}
            </div>
          );
        })}

        {/* Event callout floating pill */}
        {eventCallout && calloutP > 0 ? (
          <div
            style={{
              position: "absolute",
              left: Math.min(w - 290, Math.max(padL + 12, calloutX - 130)),
              top: Math.max(14, Math.min(padT + plotH - 92, calloutAnchorY + (isCrashDown ? -86 : 18))),
              padding: "10px 18px",
              borderRadius: 16,
              background: dark ? "#2B2B2D" : C.white,
              border: `2px solid ${calloutColors.edge}`,
              boxShadow: "0 14px 28px rgba(0,0,0,0.14)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              whiteSpace: "nowrap",
              ...materialize(calloutP, 0.95, 6),
            }}
          >
            <Icon name="warning" size={26} color={calloutColors.fg} weight={2.2} />
            <div>
              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: "-0.015em",
                  color: fg,
                  lineHeight: 1.15,
                }}
              >
                {eventCallout.label}
              </div>
              {eventCallout.sub ? (
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 18,
                    color: calloutColors.fg,
                    lineHeight: 1.2,
                  }}
                >
                  {eventCallout.sub}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
