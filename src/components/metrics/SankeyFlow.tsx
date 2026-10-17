import React from "react";
import { useCurrentFrame } from "remotion";
import { DevCard, Tone, toneColors } from "../dev/card";
import { alpha, lerp, presence } from "../diagram/Node";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type SankeySource = {
  label: string;
  total: string;
  sub?: string;
  icon?: IconName;
};

export type SankeyTarget = {
  label: string;
  value: string;
  share: number;
  tone?: Tone;
  sub?: string;
};

const DEFAULT_TONES: Tone[] = ["accent", "good", "warn", "bad"];

/**
 * Proportional Sankey flow-split diagram.
 * Shows a single left source block splitting via smooth cubic-Bézier ribbons of proportional
 * thickness into right-hand destination blocks.
 */
export const SankeyFlow: React.FC<{
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  title?: string;
  subtitle?: string;
  source: SankeySource;
  targets: SankeyTarget[];
  stagger?: number;
  dur?: number;
  focusIndex?: { index: number; at: number };
  dark?: boolean;
}> = ({
  at,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 560,
  title = "Cloud spend flow breakdown",
  subtitle = "monthly infrastructure bill → service category",
  source,
  targets,
  stagger = 5,
  dur = 20,
  focusIndex,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null || targets.length === 0) return null;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const hasHeader = Boolean(title || subtitle);
  const headerH = hasHeader ? 104 : 0;
  const bodyH = h - headerH;

  const padX = 34;
  const padY = 28;
  const srcW = 236;
  const dstW = 310;
  const srcX = padX;
  const dstX = w - padX - dstW;
  const ribbonX0 = srcX + srcW;
  const ribbonX1 = dstX;
  const ribbonSpanW = ribbonX1 - ribbonX0;

  const totalShare = targets.reduce((acc, t) => acc + Math.max(0.01, t.share), 0) || 1;
  const normShares = targets.map((t) => Math.max(0.01, t.share) / totalShare);

  // Source block geometry (centered vertically in bodyH)
  const availH = bodyH - padY * 2;
  const srcStackH = Math.min(availH * 0.72, 260);
  const srcCardH = Math.max(srcStackH + 36, 230);
  const srcCardY = (bodyH - srcCardH) / 2;
  const srcStackTop = (bodyH - srcStackH) / 2;

  // Destination cards geometry
  const n = targets.length;
  const dstGap = n > 4 ? 10 : 14;
  const dstCardH = (availH - dstGap * (n - 1)) / n;

  // Compute source stack slices and target connection bands
  let curSrcY = srcStackTop;
  const flows = targets.map((target, i) => {
    const share = normShares[i];
    const thickness = Math.max(10, share * srcStackH);
    const y0Top = curSrcY;
    const y0Bot = curSrcY + thickness;
    curSrcY = y0Bot;

    const cardTop = padY + i * (dstCardH + dstGap);
    const cardCenterY = cardTop + dstCardH / 2;
    const dstThickness = Math.max(12, Math.min(dstCardH - 16, thickness * 1.15));
    const y1Top = cardCenterY - dstThickness / 2;
    const y1Bot = cardCenterY + dstThickness / 2;

    const tone: Tone = target.tone ?? DEFAULT_TONES[i % DEFAULT_TONES.length];
    const colors = toneColors(tone, dark);

    const cx1 = ribbonX0 + ribbonSpanW * 0.46;
    const cx2 = ribbonX0 + ribbonSpanW * 0.54;
    const pathD = [
      `M ${ribbonX0} ${y0Top.toFixed(2)}`,
      `C ${cx1.toFixed(2)} ${y0Top.toFixed(2)}, ${cx2.toFixed(2)} ${y1Top.toFixed(2)}, ${ribbonX1} ${y1Top.toFixed(2)}`,
      `L ${ribbonX1} ${y1Bot.toFixed(2)}`,
      `C ${cx2.toFixed(2)} ${y1Bot.toFixed(2)}, ${cx1.toFixed(2)} ${y0Bot.toFixed(2)}, ${ribbonX0} ${y0Bot.toFixed(2)}`,
      "Z",
    ].join(" ");

    const centerCurveD = [
      `M ${ribbonX0} ${((y0Top + y0Bot) / 2).toFixed(2)}`,
      `C ${cx1.toFixed(2)} ${((y0Top + y0Bot) / 2).toFixed(2)}, ${cx2.toFixed(2)} ${cardCenterY.toFixed(2)}, ${ribbonX1} ${cardCenterY.toFixed(2)}`,
    ].join(" ");

    return {
      target,
      i,
      share,
      y0Top,
      y0Bot,
      y1Top,
      y1Bot,
      cardTop,
      tone,
      colors,
      pathD,
      centerCurveD,
    };
  });

  const srcP = prog(frame, at + 3, 12, easeOut);
  const focusP = focusIndex ? prog(frame, focusIndex.at, 12, easeInOut) : 0;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark}>
      {hasHeader ? (
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
            {title ? (
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
            ) : null}
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

          <div
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              background: dark ? "rgba(255,255,255,0.07)" : C.paper,
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 20,
              color: mute,
            }}
          >
            100% allocated
          </div>
        </div>
      ) : null}

      <div style={{ position: "relative", width: w, height: bodyH }}>
        {/* SVG Cubic-Bezier Sankey Ribbons */}
        <svg width={w} height={bodyH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            {flows.map((f) => {
              const rp = prog(frame, at + 7 + f.i * stagger, dur, easeInOut);
              return (
                <clipPath key={f.i} id={`sankey-clip-${at}-${f.i}`}>
                  <rect x={ribbonX0 - 2} y={0} width={(ribbonSpanW + 4) * rp} height={bodyH} />
                </clipPath>
              );
            })}
          </defs>

          {flows.map((f) => {
            const rp = prog(frame, at + 7 + f.i * stagger, dur, easeInOut);
            if (rp <= 0) return null;
            const isFocused = focusIndex && focusIndex.index === f.i;
            const dimFactor = focusIndex && !isFocused ? lerp(1, 0.35, focusP) : 1;
            const fillAlpha = isFocused ? lerp(0.24, 0.38, focusP) : dark ? 0.28 : 0.22;

            return (
              <g
                key={f.i}
                clipPath={`url(#sankey-clip-${at}-${f.i})`}
                opacity={dimFactor}
              >
                <path d={f.pathD} fill={alpha(f.colors.edge, fillAlpha)} />
                <path
                  d={f.centerCurveD}
                  fill="none"
                  stroke={alpha(f.colors.edge, dark ? 0.65 : 0.5)}
                  strokeWidth={2}
                />
              </g>
            );
          })}
        </svg>

        {/* Left Source Block */}
        <div
          style={{
            position: "absolute",
            left: srcX,
            top: srcCardY,
            width: srcW,
            height: srcCardH,
            borderRadius: 22,
            background: dark ? "#262629" : C.paper,
            border: `1.5px solid ${dark ? "rgba(255,255,255,0.10)" : C.line}`,
            padding: "24px 26px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            ...materialize(srcP, 0.95, 6),
          }}
        >
          {source.icon ? (
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: dark ? "rgba(100,168,255,0.16)" : "#EBF4FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 4,
              }}
            >
              <Icon name={source.icon} size={26} color={dark ? TERM.blue : C.accent} weight={2} />
            </div>
          ) : null}
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 22,
              color: mute,
              letterSpacing: "-0.01em",
            }}
          >
            {source.label}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 42,
              letterSpacing: "-0.035em",
              color: fg,
              lineHeight: 1.05,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {source.total}
          </div>
          {source.sub ? (
            <div
              style={{
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 18,
                color: mute,
                marginTop: 2,
              }}
            >
              {source.sub}
            </div>
          ) : null}
        </div>

        {/* Source right-edge stacked color bar */}
        {flows.map((f) => {
          const sliceH = f.y0Bot - f.y0Top;
          return (
            <div
              key={f.i}
              style={{
                position: "absolute",
                left: ribbonX0 - 8,
                top: f.y0Top,
                width: 8,
                height: Math.max(2, sliceH - 1.5),
                borderRadius: 4,
                background: f.colors.edge,
                opacity: srcP,
              }}
            />
          );
        })}

        {/* Right Destination Target Blocks */}
        {flows.map((f) => {
          const tp = prog(frame, at + 11 + f.i * stagger, 12, easeOut);
          if (tp <= 0) return null;
          const isFocused = focusIndex && focusIndex.index === f.i;
          const dimFactor = focusIndex && !isFocused ? lerp(1, 0.45, focusP) : 1;
          const pct = Math.round(f.share * 100);

          return (
            <div
              key={f.i}
              style={{
                position: "absolute",
                left: dstX,
                top: f.cardTop,
                width: dstW,
                height: dstCardH,
                borderRadius: 18,
                background: isFocused && focusP > 0.3 ? f.colors.bg : dark ? "#262629" : C.paper,
                border: `2px solid ${
                  isFocused && focusP > 0.3
                    ? f.colors.edge
                    : dark
                      ? "rgba(255,255,255,0.09)"
                      : "rgba(0,0,0,0.08)"
                }`,
                padding: "0 20px 0 22px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                overflow: "hidden",
                ...materialize(tp, 0.95, 5),
                opacity: tp * dimFactor,
              }}
            >
              {/* Left color bar matching ribbon */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 10,
                  bottom: 10,
                  width: 7,
                  borderRadius: "0 5px 5px 0",
                  background: f.colors.edge,
                }}
              />

              <div style={{ minWidth: 0, paddingRight: 10 }}>
                <div
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: 23,
                    letterSpacing: "-0.015em",
                    color: fg,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {f.target.label}
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 19,
                    color: mute,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {f.target.value}
                </div>
              </div>

              <div
                style={{
                  padding: "6px 13px",
                  borderRadius: 11,
                  background: f.colors.bg,
                  color: f.colors.fg,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 20,
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                {pct}%
              </div>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
