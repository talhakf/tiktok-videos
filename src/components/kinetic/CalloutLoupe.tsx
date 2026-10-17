import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { Tone, toneColors } from "../dev/card";
import { alpha, CARD_SHADOW, lerp, presence } from "../diagram/Node";

/**
 * Magnified Command / Code Loupe card:
 * Shows a full command or URL string at the top (`sourceText`, `highlightRange`)
 * and projects trapezoidal connector lines down to a giant magnified inspection card
 * (`zoomText`, `title`, `bullets`, `zoomAt`).
 */
export const CalloutLoupe: React.FC<{
  sourceText: string;
  highlightRange: [number, number];
  zoomText: string;
  title: string;
  bullets: string[];
  zoomAt: number;
  label?: string;
  tone?: Tone;
  icon?: IconName;
  darkSource?: boolean;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  style?: React.CSSProperties;
}> = ({
  sourceText,
  highlightRange,
  zoomText,
  title,
  bullets,
  zoomAt,
  label,
  tone = "accent",
  icon = "search",
  darkSource = true,
  x = TX,
  y = TY,
  w = TW,
  h,
  at = 0,
  until,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;

  const zoomP = prog(frame, zoomAt, 14, easeOut);
  const tcDark = toneColors(tone, true);
  const tcLight = toneColors(tone, false);
  const tcSource = darkSource ? tcDark : tcLight;

  const [rawStart, rawEnd] = highlightRange;
  const startIdx = Math.max(0, Math.min(sourceText.length, rawStart));
  const endIdx = Math.max(startIdx, Math.min(sourceText.length, rawEnd));

  const beforeText = sourceText.slice(0, startIdx);
  const midText = sourceText.slice(startIdx, endIdx);
  const afterText = sourceText.slice(endIdx);

  // Fit sourceText cleanly inside the top bar
  const sourceFontSize = sourceText.length > 46 ? 22 : sourceText.length > 38 ? 24 : 26;
  const charW = sourceFontSize * 0.6;
  const textStartX = 68;

  const lensX1 = Math.max(36, Math.min(w - 80, Math.round(textStartX + beforeText.length * charW - 8)));
  const lensX2 = Math.max(
    lensX1 + 36,
    Math.min(w - 36, Math.round(textStartX + (beforeText.length + Math.max(1, midText.length)) * charW + 10)),
  );

  const sourceBarH = 112;
  const beamH = 74;
  const inspectTop = sourceBarH + beamH;
  const inspectH = 240 + bullets.length * 56;
  const totalH = h ?? inspectTop + inspectH;

  const cardLeftEdge = 34;
  const cardRightEdge = w - 34;
  const curLeftX = lerp(lensX1, cardLeftEdge, zoomP);
  const curRightX = lerp(lensX2, cardRightEdge, zoomP);
  const curBeamY = lerp(0, beamH, zoomP);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: totalH,
        ...materialize(p),
        ...style,
      }}
    >
      {/* 1. Top Command / URL Source Bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: sourceBarH,
          borderRadius: 24,
          background: darkSource ? TERM.bg : C.white,
          border: `1px solid ${darkSource ? "rgba(255,255,255,0.12)" : C.line}`,
          boxShadow: darkSource ? SHADOW_WINDOW : CARD_SHADOW,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          overflow: "hidden",
        }}
      >
        {/* Prompt glyph */}
        <div
          style={{
            width: 40,
            flexShrink: 0,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: sourceFontSize,
            color: darkSource ? TERM.dim : C.mute,
            userSelect: "none",
          }}
        >
          $
        </div>

        {/* Source text with inline Loupe highlight */}
        <div
          style={{
            fontFamily: mono,
            fontWeight: 500,
            fontSize: sourceFontSize,
            whiteSpace: "pre",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: darkSource ? TERM.fg : C.ink,
              opacity: lerp(1, 0.42, zoomP),
            }}
          >
            {beforeText}
          </span>

          <span
            style={{
              position: "relative",
              display: "inline-block",
              padding: "4px 8px",
              margin: "0 2px",
              borderRadius: 10,
              background: zoomP > 0 ? tcSource.bg : "transparent",
              border: `2.5px solid ${zoomP > 0 ? tcSource.edge : "transparent"}`,
              color: zoomP > 0.2 ? tcSource.fg : darkSource ? TERM.fg : C.ink,
              fontWeight: 700,
              scale: String(lerp(1, 1.03, zoomP)),
            }}
          >
            {midText}
          </span>

          <span
            style={{
              color: darkSource ? TERM.fg : C.ink,
              opacity: lerp(1, 0.42, zoomP),
            }}
          >
            {afterText}
          </span>
        </div>

        {label ? (
          <div
            style={{
              marginLeft: "auto",
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 19,
              color: darkSource ? TERM.dim : C.mute,
              paddingLeft: 16,
            }}
          >
            {label}
          </div>
        ) : null}
      </div>

      {/* 2. Trapezoidal Projection & Connector Lines */}
      {zoomP > 0.01 ? (
        <svg
          width={w}
          height={beamH + 8}
          viewBox={`0 0 ${w} ${beamH + 8}`}
          style={{
            position: "absolute",
            left: 0,
            top: sourceBarH - 4,
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          {/* Solid-alpha trapezoid beam (no gradients) */}
          <polygon
            points={`${lensX1},0 ${lensX2},0 ${curRightX},${curBeamY + 4} ${curLeftX},${curBeamY + 4}`}
            fill={alpha(tcLight.edge, 0.09 * zoomP)}
          />
          {/* Left & Right Connector Rays */}
          <line
            x1={lensX1}
            y1={0}
            x2={curLeftX}
            y2={curBeamY + 4}
            stroke={tcLight.edge}
            strokeWidth={2.5}
            strokeDasharray="6 6"
            strokeLinecap="round"
            opacity={zoomP}
          />
          <line
            x1={lensX2}
            y1={0}
            x2={curRightX}
            y2={curBeamY + 4}
            stroke={tcLight.edge}
            strokeWidth={2.5}
            strokeDasharray="6 6"
            strokeLinecap="round"
            opacity={zoomP}
          />
          {/* Anchor dots on the loupe corners */}
          <circle cx={lensX1} cy={0} r={4.5} fill={tcLight.edge} opacity={zoomP} />
          <circle cx={lensX2} cy={0} r={4.5} fill={tcLight.edge} opacity={zoomP} />
        </svg>
      ) : null}

      {/* 3. Giant Magnified Inspection Card */}
      {zoomP > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: inspectTop,
            width: w,
            height: inspectH,
            borderRadius: 28,
            background: C.white,
            border: `2.5px solid ${alpha(tcLight.edge, 0.55)}`,
            boxShadow: CARD_SHADOW,
            padding: "30px 38px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transformOrigin: `${Math.round((lensX1 + lensX2) / 2)}px -${beamH}px`,
            ...materialize(zoomP, 0.94, 8),
          }}
        >
          {/* Top row: Magnified Token Box + Loupe Badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 24px",
                borderRadius: 16,
                background: tcLight.bg,
                border: `2px solid ${tcLight.edge}`,
              }}
            >
              <Icon name={icon} size={34} color={tcLight.fg} weight={2.2} draw={zoomP} />
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 38,
                  letterSpacing: "-0.02em",
                  color: tcLight.fg,
                  whiteSpace: "nowrap",
                }}
              >
                {zoomText}
              </span>
            </div>

            <div
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                background: C.paper,
                fontFamily: mono,
                fontWeight: 600,
                fontSize: 20,
                color: C.mute,
                whiteSpace: "nowrap",
              }}
            >
              chars {startIdx}..{endIdx}
            </div>
          </div>

          {/* Inspection Title */}
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: "-0.025em",
              color: C.ink,
              lineHeight: 1.2,
              marginTop: 6,
            }}
          >
            {title}
          </div>

          {/* Staggered Bullets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
            {bullets.map((bText, i) => {
              const bp = prog(frame, zoomAt + 6 + i * 4, 10, easeOut);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    opacity: bp,
                    translate: `${(1 - bp) * 14}px 0px`,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      background: tcLight.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="arrowRight" size={18} color={tcLight.fg} weight={2.5} />
                  </div>
                  <span
                    style={{
                      fontFamily: sans,
                      fontWeight: 500,
                      fontSize: 25,
                      letterSpacing: "-0.01em",
                      color: C.ink,
                    }}
                  >
                    {bText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
