import React from "react";
import { useCurrentFrame } from "remotion";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, GLASS, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { CARD_SHADOW, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type BeforeAfterSliderProps = {
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  /** Optional header strip title at the top of the comparison card. */
  title?: string;
  /** Optional right-hand caption in the header strip. */
  subtitle?: string;
  /** Left-side content ("before" state), rendered across the full card width and clipped to [0, split]. */
  beforeNode: React.ReactNode;
  /** Right-side content ("after" state), rendered across the full card width and clipped to [split, 1]. */
  afterNode: React.ReactNode;
  /** Starting divider position in 0..1 (e.g. 0.85 shows mostly "before"). */
  initialSplit?: number;
  /** Target divider position in 0..1 (e.g. 0.15 reveals mostly "after"). */
  targetSplit?: number;
  /** Frame at which the vertical divider sweeps from `initialSplit` to `targetSplit`. */
  sweepAt?: number;
  /** Duration in frames of the curtain sweep (defaults to 32). */
  sweepDur?: number;
  /** Optional second sweep frame (e.g. settling to 0.50 side-by-side). */
  settleAt?: number;
  /** Optional second sweep split position (defaults to 0.5). */
  settleSplit?: number;
  /** Text for the top-left corner pill (defaults to "before"). */
  beforeLabel?: string;
  /** Text for the top-right corner pill (defaults to "after"). */
  afterLabel?: string;
  /** Optional extra mono metric inside the "before" pill (e.g. "1,420 ms"). */
  beforeMeta?: string;
  /** Optional extra mono metric inside the "after" pill (e.g. "18 ms"). */
  afterMeta?: string;
};

/**
 * Interactive split-curtain comparison card: overlays `beforeNode` and `afterNode` inside a `900px`
 * rounded card and sweeps a vertical divider handle (`clip-path: inset(...)`) from `initialSplit`
 * (e.g. `0.85`) to `targetSplit` (e.g. `0.15`) at `sweepAt`, with `"before"` and `"after"` corner pills.
 */
export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  at,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 540,
  dark = false,
  title,
  subtitle,
  beforeNode,
  afterNode,
  initialSplit = 0.85,
  targetSplit = 0.15,
  sweepAt,
  sweepDur = 32,
  settleAt,
  settleSplit = 0.5,
  beforeLabel = "before",
  afterLabel = "after",
  beforeMeta,
  afterMeta,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const sweepT = sweepAt !== undefined ? prog(frame, sweepAt, sweepDur, easeInOut) : 0;
  const midSplit = lerp(initialSplit, targetSplit, sweepT);
  const settleT = settleAt !== undefined ? prog(frame, settleAt, 24, easeInOut) : 0;
  const split = Math.max(0.04, Math.min(0.96, lerp(midSplit, settleSplit, settleT)));

  const leftPct = split * 100;
  const rightInsetPct = (1 - split) * 100;
  const dividerX = split * w;

  const headerH = title || subtitle ? 64 : 0;
  const stageH = h - headerH;

  // Fade corner pills gracefully if the curtain sweeps across them
  const beforePillOpacity = Math.max(0.2, Math.min(1, (split - 0.08) / 0.12));
  const afterPillOpacity = Math.max(0.2, Math.min(1, (0.92 - split) / 0.12));

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: dark ? TERM.bg : C.white,
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
            padding: "0 28px",
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
              color: dark ? TERM.fg : C.ink,
            }}
          >
            {title}
          </span>
          {subtitle ? (
            <span
              style={{
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 20,
                color: dark ? TERM.dim : C.mute,
              }}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Comparison Stage */}
      <div
        style={{
          position: "relative",
          width: w,
          height: stageH,
          overflow: "hidden",
        }}
      >
        {/* AFTER Layer (Right of curtain) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: w,
            height: stageH,
            clipPath: `inset(0 0 0 ${leftPct.toFixed(2)}%)`,
          }}
        >
          {afterNode}
        </div>

        {/* BEFORE Layer (Left of curtain) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: w,
            height: stageH,
            clipPath: `inset(0 ${rightInsetPct.toFixed(2)}% 0 0)`,
          }}
        >
          {beforeNode}
        </div>

        {/* Top-Left "before" Corner Pill */}
        <div
          style={{
            ...GLASS,
            position: "absolute",
            left: 24,
            top: 22,
            borderRadius: 999,
            padding: "8px 18px",
            background: dark ? "rgba(30,30,32,0.82)" : "rgba(255,255,255,0.86)",
            border: `1.5px solid ${tint(RED, 0.32)}`,
            boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: beforePillOpacity,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: RED,
            }}
          />
          <span
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 21,
              letterSpacing: "-0.01em",
              color: dark ? TERM.fg : C.ink,
            }}
          >
            {beforeLabel}
          </span>
          {beforeMeta ? (
            <span
              style={{
                fontFamily: mono,
                fontWeight: 600,
                fontSize: 19,
                color: RED,
                marginLeft: 2,
              }}
            >
              · {beforeMeta}
            </span>
          ) : null}
        </div>

        {/* Top-Right "after" Corner Pill */}
        <div
          style={{
            ...GLASS,
            position: "absolute",
            right: 24,
            top: 22,
            borderRadius: 999,
            padding: "8px 18px",
            background: dark ? "rgba(30,30,32,0.82)" : "rgba(255,255,255,0.86)",
            border: `1.5px solid ${tint(GREEN, 0.38)}`,
            boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: afterPillOpacity,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: GREEN,
            }}
          />
          <span
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 21,
              letterSpacing: "-0.01em",
              color: dark ? TERM.fg : C.ink,
            }}
          >
            {afterLabel}
          </span>
          {afterMeta ? (
            <span
              style={{
                fontFamily: mono,
                fontWeight: 600,
                fontSize: 19,
                color: dark ? TERM.green : "#248A3D",
                marginLeft: 2,
              }}
            >
              · {afterMeta}
            </span>
          ) : null}
        </div>

        {/* Vertical Split Curtain Line + Grab Handle */}
        <div
          style={{
            position: "absolute",
            left: dividerX,
            top: 0,
            bottom: 0,
            width: 0,
            pointerEvents: "none",
          }}
        >
          {/* Vertical Bar */}
          <div
            style={{
              position: "absolute",
              left: -2,
              top: 0,
              bottom: 0,
              width: 4,
              background: C.accent,
              boxShadow: "0 0 0 1.5px rgba(255,255,255,0.85), 0 4px 16px rgba(0,113,227,0.35)",
            }}
          />

          {/* Circular Grab Handle in the Vertical Center */}
          <div
            style={{
              position: "absolute",
              left: -30,
              top: stageH / 2 - 30,
              width: 60,
              height: 60,
              borderRadius: 30,
              background: C.white,
              border: `3px solid ${C.accent}`,
              boxShadow: "0 10px 26px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <path
                d="M9.5 7L4.5 12L9.5 17"
                stroke={C.accent}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.5 7L19.5 12L14.5 17"
                stroke={C.accent}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
