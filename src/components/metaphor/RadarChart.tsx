import React from "react";
import { useCurrentFrame } from "remotion";
import { TW, TX, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { alpha, CARD_SHADOW, lerp, presence, WIRE } from "../diagram/Node";

export type RadarSeries = {
  label: string;
  values: number[];
  highlight?: boolean;
  at?: number;
};

export type RadarChartProps = {
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  /** Optional card header title. */
  title?: string;
  /** Optional subtitle in header. */
  subtitle?: string;
  /** 5 or 6 axis labels placed around the perimeter of the spider polygon. */
  axes: string[];
  /** 1 or 2 data series with values in 0..1 that expand smoothly from the center. */
  series: RadarSeries[];
  /** Number of concentric polygon rings (defaults to 4). */
  rings?: number;
};

/**
 * 5- or 6-axis Spider / Radar polygon chart: draws concentric polygon grid rings, axis labels,
 * and 1 or 2 data polygons that expand smoothly from the center.
 */
export const RadarChart: React.FC<RadarChartProps> = ({
  at,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 620,
  dark = false,
  title = "Capability radar",
  subtitle,
  axes,
  series,
  rings = 4,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const n = Math.max(3, axes.length);
  const headerH = 74;
  const stageH = h - headerH;
  const cx = w / 2;
  const cy = stageH / 2 + 6;
  const R = Math.min(w * 0.27, stageH * 0.37);

  const gridP = prog(frame, at + 2, 14, easeOut);
  const bg = dark ? TERM.bg : C.white;
  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;

  const angleFor = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const ptAt = (i: number, radius: number) => {
    const a = angleFor(i);
    return {
      x: cx + Math.cos(a) * radius,
      y: cy + Math.sin(a) * radius,
    };
  };

  // Auto-normalize series values if passed in 0..100 instead of 0..1
  const normalizeVals = (vals: number[]) => {
    const maxV = Math.max(...vals, 1);
    const div = maxV > 1.001 ? 100 : 1;
    return Array.from({ length: n }, (_, i) =>
      Math.max(0, Math.min(1, (vals[i] ?? 0) / div))
    );
  };

  // Determine whether a series is highlighted (if only 1 series, default to highlighted)
  const isSeriesHighlighted = (s: RadarSeries, idx: number) =>
    s.highlight !== undefined
      ? s.highlight
      : series.length === 1 || idx === series.length - 1;

  // Render non-highlighted polygons first so the highlighted polygon sits on top
  const orderedSeries = series
    .map((s, idx) => ({
      s,
      idx,
      hi: isSeriesHighlighted(s, idx),
      norm: normalizeVals(s.values),
    }))
    .sort((a, b) => Number(a.hi) - Number(b.hi));

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: bg,
        border: `1px solid ${C.line}`,
        boxShadow: dark ? SHADOW_WINDOW : CARD_SHADOW,
        overflow: "hidden",
        ...materialize(vis),
      }}
    >
      {/* Top Header + Series Legend */}
      <div
        style={{
          height: headerH,
          padding: "0 32px",
          background: dark ? TERM.bar : "#F5F5F7",
          borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: " baseline", gap: 14 }}>
          <span
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: "-0.01em",
              color: fg,
            }}
          >
            {title}
          </span>
          {subtitle ? (
            <span
              style={{
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 19,
                color: mute,
              }}
            >
              {subtitle}
            </span>
          ) : null}
        </div>

        {/* Series Legend Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {series.map((s, idx) => {
            const hi = isSeriesHighlighted(s, idx);
            const color = hi ? C.accent : WIRE;
            const sAt = s.at ?? at + 8 + idx * 14;
            const lp = prog(frame, sAt, 12, easeOut);
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 16px",
                  borderRadius: 999,
                  background: hi
                    ? alpha(C.accent, dark ? 0.2 : 0.1)
                    : dark
                      ? "rgba(255,255,255,0.06)"
                      : C.white,
                  border: `1.5px solid ${hi ? alpha(C.accent, 0.4) : C.line}`,
                  opacity: lp,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    background: color,
                  }}
                />
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: 20,
                    color: hi ? (dark ? TERM.blue : C.accent) : fg,
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Radar Stage */}
      <div
        style={{
          position: "relative",
          width: w,
          height: stageH,
        }}
      >
        <svg
          width={w}
          height={stageH}
          viewBox={`0 0 ${w} ${stageH}`}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {/* Concentric Polygon Grid Rings */}
          {Array.from({ length: rings }, (_, rIdx) => {
            const frac = ((rIdx + 1) / rings) * gridP;
            const rad = R * frac;
            const pts = Array.from({ length: n }, (__, i) => {
              const p = ptAt(i, rad);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            }).join(" ");
            const isOuter = rIdx === rings - 1;
            return (
              <polygon
                key={rIdx}
                points={pts}
                fill={
                  rIdx % 2 === 1
                    ? dark
                      ? "rgba(255,255,255,0.015)"
                      : "rgba(0,0,0,0.015)"
                    : "none"
                }
                stroke={
                  isOuter
                    ? dark
                      ? "rgba(255,255,255,0.22)"
                      : "rgba(0,0,0,0.16)"
                    : dark
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(0,0,0,0.08)"
                }
                strokeWidth={isOuter ? 2 : 1.5}
              />
            );
          })}

          {/* Radial Axis Spokes */}
          {axes.map((_, i) => {
            const outer = ptAt(i, R * gridP);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke={dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)"}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Data Series Polygons Expanding from Center */}
          {orderedSeries.map(({ s, idx, hi, norm }) => {
            const sAt = s.at ?? at + 8 + idx * 14;
            const ep = prog(frame, sAt, 22, easeOut);
            if (ep <= 0) return null;

            const strokeCol = hi ? C.accent : WIRE;
            const fillCol = hi
              ? alpha(C.accent, dark ? 0.28 : 0.2)
              : alpha(WIRE, dark ? 0.22 : 0.15);

            const coords = norm.map((v, i) => {
              const r = R * Math.max(0.04, v) * ep;
              return ptAt(i, r);
            });
            const polyPoints = coords
              .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
              .join(" ");

            return (
              <g key={idx} opacity={ Math.min(1, ep * 1.4) }>
                <polygon
                  points={polyPoints}
                  fill={fillCol}
                  stroke={strokeCol}
                  strokeWidth={hi ? 4 : 2.8}
                  strokeLinejoin="round"
                />
                {coords.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={hi ? 7 : 5.5}
                    fill={hi ? C.accent : C.white}
                    stroke={strokeCol}
                    strokeWidth={hi ? 2.5 : 2.5}
                  />
                ))}
              </g>
            );
          })}

          {/* Center Pivot Dot */}
          <circle
            cx={cx}
            cy={cy}
            r={4}
            fill={dark ? TERM.dim : C.mute}
            opacity={gridP}
          />
        </svg>

        {/* Perimeter Axis Labels + Score Badges */}
        {axes.map((axis, i) => {
          const a = angleFor(i);
          const cos = Math.cos(a);
          const sin = Math.sin(a);
          const labelDist = R + 44;
          const lx = cx + cos * labelDist;
          const ly = cy + sin * labelDist;

          const lp = prog(frame, at + 5 + i * 2, 12, easeOut);
          const align: "left" | "right" | "center" =
            cos > 0.28 ? "left" : cos < -0.28 ? "right" : "center";
          const txPct = align === "left" ? "0%" : align === "right" ? "-100%" : "-50%";
          const tyPct = sin < -0.5 ? "-85%" : sin > 0.5 ? "-15%" : "-50%";

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: lx,
                top: ly,
                transform: `translate(${txPct}, ${tyPct})`,
                display: "flex",
                flexDirection: "column",
                alignItems:
                  align === "left"
                    ? "flex-start"
                    : align === "right"
                      ? "flex-end"
                      : "center",
                gap: 4,
                opacity: lp,
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 23,
                  letterSpacing: "-0.02em",
                  color: fg,
                  whiteSpace: "nowrap",
                }}
              >
                {axis}
              </span>

              {/* Series Values for this Axis */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {series.map((s, sIdx) => {
                  const hi = isSeriesHighlighted(s, sIdx);
                  const sAt = s.at ?? at + 8 + sIdx * 14;
                  const ep = prog(frame, sAt, 22, easeOut);
                  const norm = normalizeVals(s.values)[i];
                  const valPct = Math.round(lerp(0, norm * 100, ep));
                  return (
                    <span
                      key={sIdx}
                      style={{
                        padding: "2px 9px",
                        borderRadius: 7,
                        background: hi
                          ? alpha(C.accent, dark ? 0.24 : 0.12)
                          : dark
                            ? "rgba(255,255,255,0.08)"
                            : C.soft,
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 17,
                        color: hi ? (dark ? TERM.blue : C.accent) : mute,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {valPct}%
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
