import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { alpha, BLUE_TINT, CARD_SHADOW, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type FunnelStage = {
  label: string;
  cmd?: string;
  count: string;
  pct: number;
  at?: number;
  highlight?: boolean;
};

export type FunnelStagesProps = {
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  /** Optional header title (e.g. "Unix pipeline filter" or "Packet firewall funnel"). */
  title?: string;
  /** Optional right-side header caption (e.g. "find | grep | awk"). */
  subtitle?: string;
  /** Funnel stages from widest input at index 0 down to the narrowed output. */
  stages: FunnelStage[];
};

const GREY_SHADES_LIGHT = ["#E4E4EA", "#D4D4DC", "#C2C2CC", "#AEAEB8", "#9898A4"];
const GREY_SHADES_DARK = ["#343438", "#3E3E44", "#484850", "#52525C", "#5E5E6A"];

/**
 * Multi-stage filter funnel diagram (for `find | grep | awk`, firewall packet filtering, or SQL `WHERE` filtering):
 * each stage trapezoid narrows progressively from the full input down to the final filtered output.
 */
export const FunnelStages: React.FC<FunnelStagesProps> = ({
  at,
  until,
  x = TX,
  y = TY,
  w = TW,
  h,
  dark = false,
  title = "Filter funnel",
  subtitle,
  stages,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const headerH = title || subtitle ? 68 : 0;
  const rowH = 104;
  const rowGap = 10;
  const padY = 28;
  const bodyH = stages.length * rowH + Math.max(0, stages.length - 1) * rowGap + padY * 2;
  const totalH = h ?? headerH + bodyH;

  // Normalize pct whether caller passes 0..1 or 0..100
  const maxRaw = Math.max(...stages.map((s) => s.pct), 1);
  const scale = maxRaw > 1.001 ? 100 : 1;
  const norms = stages.map((s) => Math.max(0, Math.min(1, s.pct / scale)));

  // Visual width mapping so small percentages (e.g. 1%) still render a clear 68px spout
  const maxFunnelW = 330;
  const minFunnelW = 68;
  const visualW = (norm: number) =>
    minFunnelW + (maxFunnelW - minFunnelW) * Math.pow(norm, 0.52);

  const botWidths = norms.map((n) => visualW(n));
  const topWidths = norms.map((n, i) => (i === 0 ? visualW(n) : botWidths[i - 1]));

  const bg = dark ? TERM.bg : C.white;
  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: totalH,
        borderRadius: 28,
        background: bg,
        border: `1px solid ${C.line}`,
        boxShadow: dark ? SHADOW_WINDOW : CARD_SHADOW,
        overflow: "hidden",
        ...materialize(vis),
      }}
    >
      {/* Header Bar */}
      {headerH > 0 ? (
        <div
          style={{
            height: headerH,
            padding: "0 30px",
            background: dark ? TERM.bar : "#F5F5F7",
            borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="filter" size={26} color={C.accent} weight={2.1} />
            <span
              style={{
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 23,
                letterSpacing: "-0.01em",
                color: fg,
              }}
            >
              {title}
            </span>
          </div>
          {subtitle ? (
            <span
              style={{
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 20,
                color: mute,
              }}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Funnel Rows Container */}
      <div
        style={{
          position: "relative",
          padding: `${padY}px 30px`,
          display: "flex",
          flexDirection: "column",
          gap: rowGap,
        }}
      >
        {stages.map((st, i) => {
          const stAt = st.at ?? at + 4 + i * 12;
          const sp = prog(frame, stAt, 16, easeOut);
          if (sp <= 0) return null;

          const topW = topWidths[i];
          const targetBotW = botWidths[i];
          const curBotW = lerp(topW, targetBotW, sp);
          const curH = rowH * sp;

          const isHi = Boolean(st.highlight);
          const shades = dark ? GREY_SHADES_DARK : GREY_SHADES_LIGHT;
          const trapFill = isHi
            ? C.accent
            : shades[Math.min(i, shades.length - 1)];
          const trapStroke = isHi
            ? C.accent
            : dark
              ? "rgba(255,255,255,0.14)"
              : "rgba(0,0,0,0.10)";

          const cx = maxFunnelW / 2;
          const x1Top = cx - topW / 2;
          const x2Top = cx + topW / 2;
          const x1Bot = cx - curBotW / 2;
          const x2Bot = cx + curBotW / 2;
          const r = 8;

          // Rounded trapezoid SVG path
          const d = [
            `M ${x1Top + r} 0`,
            `L ${x2Top - r} 0`,
            `Q ${x2Top} 0 ${x2Top} ${r}`,
            `L ${x2Bot} ${Math.max(r, curH - r)}`,
            `Q ${x2Bot} ${curH} ${x2Bot - r} ${curH}`,
            `L ${x1Bot + r} ${curH}`,
            `Q ${x1Bot} ${curH} ${x1Bot} ${Math.max(r, curH - r)}`,
            `L ${x1Top} ${r}`,
            `Q ${x1Top} 0 ${x1Top + r} 0`,
            "Z",
          ].join(" ");

          const pctVal = norms[i] * 100;
          const pctStr =
            pctVal >= 10 || Number.isInteger(Math.round(pctVal * 10) / 10)
              ? `${Math.round(pctVal)}%`
              : `${pctVal.toFixed(1)}%`;

          return (
            <div
              key={i}
              style={{
                height: rowH,
                display: "flex",
                alignItems: "center",
                gap: 22,
                position: "relative",
                borderRadius: 18,
                background: isHi
                  ? dark
                    ? tint(C.accent, 0.14)
                    : alpha(BLUE_TINT, 0.65)
                  : "transparent",
                padding: "0 12px",
                ...materialize(sp, 0.97, 5),
              }}
            >
              {/* Left Column: Stage Number + Label + Command Pill */}
              <div
                style={{
                  width: 280,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      background: isHi
                        ? C.accent
                        : dark
                          ? "rgba(255,255,255,0.1)"
                          : C.soft,
                      color: isHi ? C.white : mute,
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{
                      fontFamily: sans,
                      fontWeight: 700,
                      fontSize: 24,
                      letterSpacing: "-0.02em",
                      color: isHi ? (dark ? TERM.blue : C.accent) : fg,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {st.label}
                  </span>
                </div>

                {st.cmd ? (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      padding: "4px 12px",
                      borderRadius: 9,
                      background: dark ? "rgba(255,255,255,0.07)" : "#F2F2F6",
                      border: `1px solid ${
                        isHi ? tint(C.accent, 0.35) : C.line
                      }`,
                      fontFamily: mono,
                      fontWeight: 500,
                      fontSize: 18,
                      color: isHi ? (dark ? TERM.blue : C.accent) : mute,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {st.cmd}
                  </div>
                ) : null}
              </div>

              {/* Center Column: Narrowing SVG Trapezoid */}
              <div
                style={{
                  width: maxFunnelW,
                  height: rowH,
                  position: "relative",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width={maxFunnelW}
                  height={rowH}
                  viewBox={`0 0 ${maxFunnelW} ${rowH}`}
                  style={{ overflow: "visible" }}
                >
                  <path
                    d={d}
                    fill={trapFill}
                    stroke={trapStroke}
                    strokeWidth={1.5}
                  />
                  {/* Center flow guide line */}
                  <line
                    x1={cx}
                    y1={10}
                    x2={cx}
                    y2={Math.max(10, curH - 10)}
                    stroke={
                      isHi
                        ? "rgba(255,255,255,0.45)"
                        : dark
                          ? "rgba(255,255,255,0.16)"
                          : "rgba(0,0,0,0.12)"
                    }
                    strokeWidth={2}
                    strokeDasharray="4 5"
                  />
                </svg>

                {/* Share Badge inside the Trapezoid */}
                <span
                  style={{
                    position: "absolute",
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 20,
                    color: isHi ? C.white : fg,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {pctStr}
                </span>
              </div>

              {/* Right Column: Surviving Count + Output Tag */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 26,
                    letterSpacing: "-0.02em",
                    color: isHi ? (dark ? TERM.blue : C.accent) : fg,
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {st.count}
                </span>
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: 500,
                    fontSize: 18,
                    color: isHi ? (dark ? TERM.blue : C.accent) : mute,
                  }}
                >
                  {isHi ? "final output" : i === 0 ? "total input" : "remaining"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
