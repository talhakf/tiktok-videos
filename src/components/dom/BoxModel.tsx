import { interpolateColors, useCurrentFrame } from "remotion";
import { TX, TW } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

/**
 * CSS Box Model & `box-sizing` visualizer: concentric labelled rectangles
 * (`margin` amber tint, `border` dark border, `padding` green tint, `content` blue tint)
 * with pixel dimensions and a `borderBoxAt` cue that switches from
 * `content-box (total: 348px)` to `border-box (total: 300px)`.
 */
export const BoxModel: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  widthPx?: number;
  heightPx?: number;
  paddingPx?: number;
  borderPx?: number;
  marginPx?: number;
  borderBoxAt?: number;
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y,
  w = TW,
  h,
  at,
  until,
  widthPx = 300,
  heightPx = 160,
  paddingPx = 20,
  borderPx = 4,
  marginPx = 24,
  borderBoxAt,
  filename = "box-model.css",
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const t = borderBoxAt !== undefined ? prog(frame, borderBoxAt, 16, easeInOut) : 0;
  const isBorderBox = t >= 0.5;

  const extraW = (paddingPx + borderPx) * 2;
  const extraH = (paddingPx + borderPx) * 2;

  const contentBoxTotalW = widthPx + extraW; // 300 + 48 = 348
  const borderBoxTotalW = widthPx; // 300

  const renderedTotalW = Math.round(lerp(contentBoxTotalW, borderBoxTotalW, t));
  const innerContentW = Math.round(lerp(widthPx, widthPx - extraW, t));
  const innerContentH = Math.round(lerp(heightPx, heightPx - extraH, t));

  // Visual box dimensions on canvas (scaled so concentric labels are roomy and legible)
  const marginBand = 48;
  const borderBand = 38;
  const paddingBand = 48;

  const visContentW = lerp(370, 290, t);
  const visContentH = lerp(136, 108, t);

  const visPaddingW = visContentW + paddingBand * 2;
  const visPaddingH = visContentH + paddingBand * 2;

  const visBorderW = visPaddingW + borderBand * 2;
  const visBorderH = visPaddingH + borderBand * 2;

  const visMarginW = visBorderW + marginBand * 2;
  const visMarginH = visBorderH + marginBand * 2;

  const bodyH = 596;
  const cardH = h ?? (filename !== undefined ? TAB_H : 0) + bodyH;
  const cx = w / 2;
  const cy = 294;

  const pillBg = interpolateColors(t, [0, 1], [tint(AMBER, 0.16), BLUE_TINT]);
  const pillBorder = interpolateColors(t, [0, 1], [AMBER, C.accent]);
  const pillFg = interpolateColors(t, [0, 1], ["#A05A00", C.accent]);

  const modeLabel = isBorderBox
    ? `border-box (total: ${renderedTotalW}px)`
    : `content-box (total: ${renderedTotalW}px)`;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      filename={filename}
      icon="layers"
      right={right ?? `width: ${widthPx}px`}
      style={style}
    >
      {/* Top CSS rule & mode banner */}
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 20,
          height: 62,
          borderRadius: 16,
          background: "#F5F5F7",
          border: `1px solid ${C.line}`,
          padding: "0 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 22, color: C.ink }}>
          <span style={{ color: C.mute }}>.card {"{ "}</span>
          <span>width: {widthPx}px; padding: {paddingPx}px; border: {borderPx}px;</span>
          <span style={{ color: C.mute }}>{" }"}</span>
        </div>
        <div
          style={{
            padding: "7px 16px",
            borderRadius: 12,
            background: pillBg,
            border: `2px solid ${pillBorder}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 20,
            color: pillFg,
            whiteSpace: "nowrap",
          }}
        >
          {modeLabel}
        </div>
      </div>

      {/* 1. Margin rectangle (amber tint) */}
      <div
        style={{
          position: "absolute",
          left: cx - visMarginW / 2,
          top: cy - visMarginH / 2,
          width: visMarginW,
          height: visMarginH,
          borderRadius: 24,
          background: tint(AMBER, 0.14),
          border: `2.5px dashed ${AMBER}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 10,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: "#A05A00",
          }}
        >
          margin
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 10,
            translate: "-50% 0",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: "#A05A00",
          }}
        >
          {marginPx}px
        </div>
        <div
          style={{
            position: "absolute",
            right: 16,
            bottom: 10,
            fontFamily: mono,
            fontWeight: 600,
            fontSize: 17,
            color: "#A05A00",
          }}
        >
          outer: {renderedTotalW + marginPx * 2}px
        </div>
      </div>

      {/* 2. Border rectangle (dark border) */}
      <div
        style={{
          position: "absolute",
          left: cx - visBorderW / 2,
          top: cy - visBorderH / 2,
          width: visBorderW,
          height: visBorderH,
          borderRadius: 18,
          background: "#E5E5EA",
          border: `3.5px solid ${C.ink}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 6,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 17,
            color: C.ink,
          }}
        >
          border
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 6,
            translate: "-50% 0",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 17,
            color: C.ink,
          }}
        >
          {borderPx}px solid
        </div>
      </div>

      {/* 3. Padding rectangle (green tint) */}
      <div
        style={{
          position: "absolute",
          left: cx - visPaddingW / 2,
          top: cy - visPaddingH / 2,
          width: visPaddingW,
          height: visPaddingH,
          borderRadius: 14,
          background: "#E8F8EE",
          border: `2.5px dashed ${GREEN}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 10,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: "#1E7E34",
          }}
        >
          padding
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 10,
            translate: "-50% 0",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: "#1E7E34",
          }}
        >
          {paddingPx}px
        </div>
      </div>

      {/* 4. Content rectangle (blue tint) */}
      <div
        style={{
          position: "absolute",
          left: cx - visContentW / 2,
          top: cy - visContentH / 2,
          width: visContentW,
          height: visContentH,
          borderRadius: 10,
          background: BLUE_TINT,
          border: `2.5px solid ${C.accent}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: C.accent, letterSpacing: "-0.01em" }}>
          content
        </div>
        <div
          style={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 25,
            color: C.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {innerContentW} × {innerContentH} px
        </div>
      </div>

      {/* Bottom caliper / total rendered box math */}
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          bottom: 22,
          height: 68,
          borderRadius: 16,
          background: "#F5F5F7",
          border: `1px solid ${C.line}`,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          ...materialize(prog(frame, at + 6, 10)),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: mono, fontSize: 21, fontWeight: 600 }}>
          <span style={{ color: C.mute }}>box-sizing:</span>
          <span style={{ color: pillFg, fontWeight: 700 }}>{isBorderBox ? "border-box" : "content-box"}</span>
        </div>

        <div
          style={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 21,
            color: C.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ color: C.accent }}>{innerContentW}px</span>
          <span style={{ color: C.mute }}> + </span>
          <span style={{ color: "#1E7E34" }}>{paddingPx * 2}px pad</span>
          <span style={{ color: C.mute }}> + </span>
          <span style={{ color: C.ink }}>{borderPx * 2}px border</span>
          <span style={{ color: C.mute }}> = </span>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 8,
              background: pillBg,
              color: pillFg,
            }}
          >
            total: {renderedTotalW}px
          </span>
        </div>
      </div>
    </DevCard>
  );
};
