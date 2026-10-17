import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { alpha, BLUE_TINT, CARD_SHADOW, lerp, presence } from "../diagram/Node";

export type VennDiagramProps = {
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  /** Optional card header title. */
  title?: string;
  /** Optional right-side header subtitle. */
  subtitle?: string;
  /** Left circle heading. */
  leftTitle: string;
  /** Bullet / pill items exclusive to the left circle. */
  leftItems: string[];
  /** Right circle heading. */
  rightTitle: string;
  /** Bullet / pill items exclusive to the right circle. */
  rightItems: string[];
  /** Heading inside the center intersection lens. */
  centerTitle: string;
  /** Items shared inside the center intersection lens. */
  centerItems: string[];
  /** Frame at which the center overlap lens lights up in system blue (#0071E3). */
  overlapAt?: number;
};

/**
 * 2-circle Venn diagram card: left circle (`leftTitle`, `leftItems`), right circle (`rightTitle`, `rightItems`),
 * and center overlap lens (`centerTitle`, `centerItems`) that lights up in system blue at `overlapAt`.
 */
export const VennDiagram: React.FC<VennDiagramProps> = ({
  at,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 590,
  dark = false,
  title = "Shared intersection",
  subtitle,
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
  centerTitle,
  centerItems,
  overlapAt,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const headerH = title || subtitle ? 68 : 0;
  const stageH = h - headerH;
  const cx = w / 2;
  const cy = stageH / 2 + 6;
  const R = 232;

  // Circles glide together on entrance
  const glideP = prog(frame, at + 2, 18, easeInOut);
  const dx = lerp(182, 130, glideP);
  const lx = cx - dx;
  const rx = cx + dx;

  // Vesica piscis lens intersection geometry
  const halfLensH = Math.sqrt(Math.max(0, R * R - dx * dx));
  const yTop = cy - halfLensH;
  const yBot = cy + halfLensH;
  const lensPath = `M ${cx} ${yTop} A ${R} ${R} 0 0 1 ${cx} ${yBot} A ${R} ${R} 0 0 1 ${cx} ${yTop} Z`;

  const ovFrame = overlapAt ?? at + 26;
  const overlapP = prog(frame, ovFrame, 16, easeOut);

  const bg = dark ? TERM.bg : C.white;
  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;

  const circleFill = dark ? "rgba(255,255,255,0.04)" : "#F4F4F8";
  const circleStroke = dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.13)";

  const lensIdleFill = dark ? "rgba(255,255,255,0.06)" : "#EAEAEF";
  const lensActiveFill = dark ? alpha(C.accent, 0.28) : BLUE_TINT;
  const lensFill = interpolateColors(overlapP, [0, 1], [lensIdleFill, lensActiveFill]);
  const lensStroke = interpolateColors(
    overlapP,
    [0, 1],
    [circleStroke, C.accent]
  );

  // Centres of the left crescent and right crescent
  const leftColX = cx - dx - 96;
  const rightColX = cx + dx + 96;

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
      {/* Optional Header Bar */}
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
          <span
            style={{
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 20,
              color: overlapP > 0.3 ? C.accent : mute,
            }}
          >
            {subtitle ?? `${leftTitle} ∩ ${rightTitle}`}
          </span>
        </div>
      ) : null}

      {/* Venn Diagram Stage */}
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
          {/* Left Circle */}
          <circle
            cx={lx}
            cy={cy}
            r={R}
            fill={circleFill}
            stroke={circleStroke}
            strokeWidth={2.5}
          />

          {/* Right Circle */}
          <circle
            cx={rx}
            cy={cy}
            r={R}
            fill={circleFill}
            stroke={circleStroke}
            strokeWidth={2.5}
          />

          {/* Center Intersection Lens */}
          <path
            d={lensPath}
            fill={lensFill}
            stroke={lensStroke}
            strokeWidth={lerp(2, 4, overlapP)}
            strokeLinejoin="round"
          />
        </svg>

        {/* Left Crescent Column */}
        <div
          style={{
            position: "absolute",
            left: leftColX - 105,
            top: cy - 135,
            width: 210,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "-0.02em",
              color: fg,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {leftTitle}
          </div>
          {leftItems.map((item, i) => {
            const ip = prog(frame, at + 8 + i * 4, 12, easeOut);
            return (
              <div
                key={i}
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: dark ? "rgba(255,255,255,0.07)" : C.white,
                  border: `1px solid ${C.line}`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 19,
                  color: mute,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  ...materialize(ip, 0.95, 4),
                }}
              >
                {item}
              </div>
            );
          })}
        </div>

        {/* Right Crescent Column */}
        <div
          style={{
            position: "absolute",
            left: rightColX - 105,
            top: cy - 135,
            width: 210,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "-0.02em",
              color: fg,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {rightTitle}
          </div>
          {rightItems.map((item, i) => {
            const ip = prog(frame, at + 10 + i * 4, 12, easeOut);
            return (
              <div
                key={i}
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: dark ? "rgba(255,255,255,0.07)" : C.white,
                  border: `1px solid ${C.line}`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 19,
                  color: mute,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  ...materialize(ip, 0.95, 4),
                }}
              >
                {item}
              </div>
            );
          })}
        </div>

        {/* Center Overlap Lens Column */}
        <div
          style={{
            position: "absolute",
            left: cx - 94,
            top: cy - 135,
            width: 188,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Center Lens Title Pill */}
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 999,
              background: interpolateColors(
                overlapP,
                [0, 1],
                [dark ? "rgba(255,255,255,0.1)" : C.soft, C.accent]
              ),
              color: interpolateColors(overlapP, [0, 1], [fg, C.white]),
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "-0.01em",
              textAlign: "center",
              whiteSpace: "nowrap",
              marginBottom: 4,
              boxShadow:
                overlapP > 0.2
                  ? `0 6px 16px ${alpha(C.accent, 0.28 * overlapP)}`
                  : "none",
            }}
          >
            {centerTitle}
          </div>

          {centerItems.map((item, i) => {
            const itemP = prog(frame, ovFrame + 3 + i * 4, 12, easeOut);
            const idleP = prog(frame, at + 14 + i * 4, 12, easeOut);
            const showP = Math.max(idleP * 0.65, itemP);
            return (
              <div
                key={i}
                style={{
                  padding: "8px 14px",
                  borderRadius: 12,
                  background: dark ? "#1E2838" : C.white,
                  border: `1.5px solid ${interpolateColors(
                    overlapP,
                    [0, 1],
                    [C.line, alpha(C.accent, 0.55)]
                  )}`,
                  boxShadow:
                    overlapP > 0.2
                      ? `0 4px 12px ${alpha(C.accent, 0.14 * overlapP)}`
                      : "none",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 19,
                  color: interpolateColors(
                    overlapP,
                    [0, 1],
                    [mute, dark ? TERM.blue : C.accent]
                  ),
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  ...materialize(showP, 0.94, 4),
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
