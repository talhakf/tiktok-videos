import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { DevCard, Tone, toneColors } from "../dev/card";
import { CARD_SHADOW, GREEN, lerp, presence, RED } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type HeatmapHighlight = {
  row: number;
  col: number;
  label: string;
  at: number;
  tone?: Tone;
};

const PALETTES = {
  blue: {
    light: ["#F2F6FC", "#CFE4FB", "#8BC0F6", "#3991EC", C.accent],
    dark: ["#252B34", "#1F3B5C", "#1B558E", "#126BC4", TERM.blue],
  },
  green: {
    light: ["#F1FAF3", "#C7EED0", "#82DDA0", "#46C96E", GREEN],
    dark: ["#232F26", "#23492D", "#256C38", "#2B9648", TERM.green],
  },
  red: {
    light: ["#FFF3F2", "#FFD1CE", "#FFA099", "#FF6B61", RED],
    dark: ["#342424", "#582726", "#872B28", "#C2332D", TERM.red],
  },
};

const samplePalette = (stops: string[], v: number) => {
  const clamped = Math.max(0, Math.min(1, v));
  return interpolateColors(clamped, [0, 0.25, 0.5, 0.75, 1], stops);
};

/**
 * 2D Heatmap matrix card (for retention cohorts, server latency heatmaps, or activity matrices).
 * Renders labelled rows and columns with color-intensity cells (`0..1`) that cascade in,
 * plus an optional `highlightCell` callout.
 */
export const CohortHeatmap: React.FC<{
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  title?: string;
  subtitle?: string;
  rowLabels: string[];
  colLabels: string[];
  cells: (number | null)[][];
  formatCell?: "percent" | "ms" | "decimal" | "none" | ((v: number) => string);
  showValues?: boolean;
  palette?: "blue" | "green" | "red";
  stagger?: number;
  dur?: number;
  highlightCell?: HeatmapHighlight;
  dark?: boolean;
}> = ({
  at,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 560,
  title = "Weekly user retention cohorts",
  subtitle = "% of signups still active after N weeks",
  rowLabels,
  colLabels,
  cells,
  formatCell = "percent",
  showValues = true,
  palette = "blue",
  stagger = 1.6,
  dur = 12,
  highlightCell,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const stops = PALETTES[palette][dark ? "dark" : "light"];

  const headerH = 106;
  const padL = 176;
  const padR = 36;
  const colHeadH = 52;
  const padB = 34;

  const numRows = Math.max(1, rowLabels.length);
  const numCols = Math.max(1, colLabels.length);
  const gridW = w - padL - padR;
  const gridH = h - headerH - colHeadH - padB;
  const gap = 8;
  const cellW = (gridW - gap * (numCols - 1)) / numCols;
  const cellH = (gridH - gap * (numRows - 1)) / numRows;

  const hp = highlightCell ? prog(frame, highlightCell.at, 12, easeInOut) : 0;
  const hTone: Tone = highlightCell?.tone ?? (palette === "red" ? "bad" : "accent");
  const hColors = toneColors(hTone, dark);

  const renderValue = (v: number) => {
    if (!showValues || formatCell === "none") return null;
    if (typeof formatCell === "function") return formatCell(v);
    if (formatCell === "ms") return `${Math.round(v * 200)}ms`;
    if (formatCell === "decimal") return v.toFixed(2);
    return `${Math.round(v * 100)}%`;
  };

  const targetLeft = highlightCell ? padL + highlightCell.col * (cellW + gap) : 0;
  const targetTop = highlightCell ? colHeadH + highlightCell.row * (cellH + gap) : 0;

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

        {/* 5-step intensity scale legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontFamily: mono,
            fontWeight: 500,
            fontSize: 19,
            color: mute,
          }}
        >
          <span style={{ marginRight: 4 }}>low</span>
          {[0, 0.25, 0.5, 0.75, 1].map((step) => (
            <div
              key={step}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: samplePalette(stops, step),
                border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
              }}
            />
          ))}
          <span style={{ marginLeft: 4 }}>high</span>
        </div>
      </div>

      {/* Matrix body */}
      <div style={{ position: "relative", width: w, height: h - headerH }}>
        {/* Column headers */}
        {colLabels.map((colLabel, c) => {
          const cx = padL + c * (cellW + gap) + cellW / 2;
          const cp = prog(frame, at + 4 + c * 1.2, 10, easeOut);
          const isHCol = highlightCell && highlightCell.col === c && hp > 0.5;
          return (
            <div
              key={c}
              style={{
                position: "absolute",
                left: cx,
                top: colHeadH / 2 + 2,
                translate: "-50% -50%",
                fontFamily: mono,
                fontWeight: isHCol ? 700 : 600,
                fontSize: 20,
                color: isHCol ? hColors.fg : mute,
                whiteSpace: "nowrap",
                opacity: cp,
              }}
            >
              {colLabel}
            </div>
          );
        })}

        {/* Row labels */}
        {rowLabels.map((rowLabel, r) => {
          const ry = colHeadH + r * (cellH + gap) + cellH / 2;
          const rp = prog(frame, at + 4 + r * 1.5, 10, easeOut);
          const isHRow = highlightCell && highlightCell.row === r && hp > 0.5;
          return (
            <div
              key={r}
              style={{
                position: "absolute",
                left: 32,
                width: padL - 48,
                top: ry,
                translate: "0 -50%",
                fontFamily: mono,
                fontWeight: isHRow ? 700 : 600,
                fontSize: 21,
                color: isHRow ? hColors.fg : fg,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                opacity: rp,
              }}
            >
              {rowLabel}
            </div>
          );
        })}

        {/* Heatmap cells */}
        {rowLabels.map((_, r) =>
          colLabels.map((__, c) => {
            const v = cells[r]?.[c] ?? null;
            const t = at + 6 + (r * 1.6 + c) * stagger;
            if (frame < t) return null;
            const cp = prog(frame, t, dur, easeOut);
            const left = padL + c * (cellW + gap);
            const top = colHeadH + r * (cellH + gap);
            const isTarget =
              highlightCell !== undefined && highlightCell.row === r && highlightCell.col === c;
            const dimFactor = highlightCell && !isTarget ? lerp(1, 0.42, hp) : 1;

            if (v === null) {
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width: cellW,
                    height: cellH,
                    borderRadius: 12,
                    background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)",
                    border: `1px dashed ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    opacity: cp * dimFactor,
                  }}
                />
              );
            }

            const clamped = Math.max(0, Math.min(1, v));
            const bg = samplePalette(stops, clamped);
            const textLight = dark ? clamped > 0.35 : clamped >= 0.54;
            const valText = renderValue(clamped);

            return (
              <div
                key={`${r}-${c}`}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: cellW,
                  height: cellH,
                  borderRadius: 12,
                  background: bg,
                  boxSizing: "border-box",
                  border:
                    isTarget && hp > 0
                      ? `3.5px solid ${dark ? C.white : C.ink}`
                      : `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"}`,
                  boxShadow:
                    isTarget && hp > 0 ? "0 10px 24px rgba(0,0,0,0.18)" : undefined,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: Math.min(22, Math.max(16, cellH * 0.38)),
                  color: textLight ? C.white : fg,
                  fontVariantNumeric: "tabular-nums",
                  ...materialize(cp, 0.92, 4),
                  opacity: cp * dimFactor,
                  zIndex: isTarget ? 2 : 1,
                }}
              >
                {valText}
              </div>
            );
          }),
        )}

        {/* Highlight callout pill */}
        {highlightCell && hp > 0 ? (
          <div
            style={{
              position: "absolute",
              left: Math.min(
                w - 310,
                Math.max(padL, targetLeft + cellW / 2 - 120),
              ),
              top:
                highlightCell.row >= 2
                  ? Math.max(8, targetTop - 58)
                  : Math.min(h - headerH - 64, targetTop + cellH + 12),
              padding: "10px 18px",
              borderRadius: 14,
              background: dark ? "#2B2B2D" : C.white,
              border: `2px solid ${hColors.edge}`,
              boxShadow: CARD_SHADOW,
              display: "flex",
              alignItems: "center",
              gap: 10,
              whiteSpace: "nowrap",
              zIndex: 5,
              ...materialize(hp, 0.95, 6),
            }}
          >
            <Icon name="sparkle" size={24} color={hColors.fg} weight={2.2} />
            <span
              style={{
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "-0.015em",
                color: fg,
              }}
            >
              {highlightCell.label}
            </span>
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
