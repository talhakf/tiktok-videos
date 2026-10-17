import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED } from "../diagram/Node";

export type StepStatus = "done" | "active" | "error";

export type ProgressStep = {
  label: string;
  sub?: string;
  at: number;
  status?: StepStatus;
};

type ResolvedState = "pending" | StepStatus;

const resolveStepState = (steps: ProgressStep[], idx: number, frame: number): { state: ResolvedState; morphP: number } => {
  const step = steps[idx];
  if (frame < step.at) {
    return { state: "pending", morphP: 0 };
  }
  const next = steps[idx + 1];
  const targetStatus: StepStatus = step.status ?? "done";

  // If a subsequent step has already started and this step wasn't an error, it is completed ("done")
  if (next && frame >= next.at && targetStatus !== "error") {
    return { state: "done", morphP: prog(frame, step.at, 10, easeOut) };
  }

  return {
    state: targetStatus,
    morphP: prog(frame, step.at, 10, easeOut),
  };
};

const StepNodeBadge: React.FC<{
  index: number;
  state: ResolvedState;
  morphP: number;
  size?: number;
  dark?: boolean;
}> = ({ index, state, morphP, size = 56, dark = false }) => {
  const isPending = state === "pending";
  const bg =
    state === "done"
      ? dark
        ? "rgba(52,199,89,0.2)"
        : "#EEFAF1"
      : state === "error"
        ? dark
          ? "rgba(255,59,48,0.22)"
          : "#FFF1F0"
        : state === "active"
          ? dark
            ? "rgba(0,113,227,0.25)"
            : BLUE_TINT
          : dark
            ? "#2B2B2D"
            : C.paper;

  const border =
    state === "done"
      ? GREEN
      : state === "error"
        ? RED
        : state === "active"
          ? C.accent
          : dark
            ? "rgba(255,255,255,0.16)"
            : "rgba(0,0,0,0.14)";

  const fg =
    state === "done"
      ? GREEN
      : state === "error"
        ? RED
        : state === "active"
          ? C.accent
          : dark
            ? TERM.dim
            : C.mute;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Active or error outer pulse ring */}
      {(state === "active" || state === "error") && morphP > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: -7,
            borderRadius: (size + 14) / 2,
            border: `2.5px solid ${state === "error" ? RED : C.accent}`,
            opacity: 0.35 * morphP,
            scale: String(lerp(1.12, 1, morphP)),
          }}
        />
      ) : null}

      <div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          background: bg,
          border: `3px solid ${border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(isPending ? 1 : lerp(0.9, 1, morphP)),
        }}
      >
        {isPending ? (
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: Math.round(size * 0.42),
              color: fg,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {index + 1}
          </span>
        ) : state === "done" ? (
          <Icon name="check" size={Math.round(size * 0.56)} color={fg} weight={2.6} draw={morphP} />
        ) : state === "error" ? (
          <Icon name="cross" size={Math.round(size * 0.52)} color={fg} weight={2.6} draw={morphP} />
        ) : (
          <Icon name="bolt" size={Math.round(size * 0.52)} color={fg} weight={2.3} draw={morphP} />
        )}
      </div>
    </div>
  );
};

/**
 * Multi-step horizontal/vertical process tracker card.
 * Animates progress bars filling between nodes and status icons morphing on cue.
 */
export const StepProgressBar: React.FC<{
  steps: ProgressStep[];
  dir?: "horizontal" | "vertical" | "row" | "column";
  title?: string;
  right?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  steps,
  dir = "horizontal",
  title,
  right,
  x = TX,
  y = TY,
  w = TW,
  h,
  at = 0,
  until,
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null || steps.length === 0) return null;

  const isHorizontal = dir === "horizontal" || dir === "row";
  const resolved = steps.map((_, i) => resolveStepState(steps, i, frame));

  // Count completed or active steps for the top header badge
  const reachedCount = resolved.filter((r) => r.state !== "pending").length;
  const hasError = resolved.some((r) => r.state === "error");
  const allDone = resolved.every((r) => r.state === "done");

  const cardBg = dark ? TERM.bg : C.white;
  const inkColor = dark ? TERM.fg : C.ink;
  const muteColor = dark ? TERM.dim : C.mute;
  const trackBg = dark ? "rgba(255,255,255,0.12)" : "#E8E8ED";

  // Segment fill progress between node i and node i + 1
  const segmentFill = (i: number) => {
    const cur = steps[i];
    const next = steps[i + 1];
    if (!next || frame < cur.at) return { fillP: 0, color: C.accent };
    const dur = Math.max(8, next.at - cur.at);
    const fillP = prog(frame, cur.at, dur, easeInOut);
    const nextState = resolved[i + 1].state;
    const targetColor = nextState === "error" ? RED : nextState === "done" || resolved[i].state === "done" ? GREEN : C.accent;
    const color = fillP >= 1 ? targetColor : interpolateColors(fillP, [0, 1], [C.accent, targetColor]);
    return { fillP, color };
  };

  if (isHorizontal) {
    const nodeSize = 58;
    const hasHeader = title !== undefined || right !== undefined;
    const cardH = h ?? (hasHeader ? 290 : 236);
    const topOffset = hasHeader ? 98 : 42;
    const colW = (w - 64) / steps.length;

    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: cardH,
          borderRadius: 28,
          background: cardBg,
          border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : C.line}`,
          boxShadow: CARD_SHADOW,
          padding: "28px 32px",
          overflow: "hidden",
          ...materialize(p),
          ...style,
        }}
      >
        {hasHeader ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em", color: inkColor }}>
              {title}
            </span>
            <span
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 21,
                color: hasError ? RED : allDone ? GREEN : C.accent,
                padding: "5px 14px",
                borderRadius: 10,
                background: dark ? "rgba(255,255,255,0.08)" : C.paper,
              }}
            >
              {right ?? (hasError ? "Failed" : allDone ? "Complete" : `Step ${Math.max(1, reachedCount)} of ${steps.length}`)}
            </span>
          </div>
        ) : null}

        {/* Horizontal Progress Bars between nodes */}
        {steps.slice(0, -1).map((_, i) => {
          const xStart = 32 + colW * i + colW / 2 + nodeSize / 2 + 10;
          const barLen = Math.max(12, colW - nodeSize - 20);
          const { fillP, color } = segmentFill(i);
          return (
            <div
              key={`bar-${i}`}
              style={{
                position: "absolute",
                left: xStart,
                top: topOffset + nodeSize / 2 - 3,
                width: barLen,
                height: 6,
                borderRadius: 3,
                background: trackBg,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: barLen * fillP,
                  height: "100%",
                  borderRadius: 3,
                  background: color,
                }}
              />
            </div>
          );
        })}

        {/* Step Nodes & Labels */}
        {steps.map((step, i) => {
          const { state, morphP } = resolved[i];
          const nodeEnter = prog(frame, at + 4 + i * 3, 8, easeOut);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 32 + colW * i,
                top: topOffset,
                width: colW,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                opacity: nodeEnter,
                translate: `0px ${(1 - nodeEnter) * 10}px`,
              }}
            >
              <StepNodeBadge index={i} state={state} morphP={morphP} size={nodeSize} dark={dark} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: 25,
                    letterSpacing: "-0.02em",
                    color: state === "pending" ? muteColor : inkColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  {step.label}
                </span>
                {step.sub ? (
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 500,
                      fontSize: 20,
                      color: state === "error" ? RED : state === "active" ? C.accent : muteColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.sub}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical layout
  const nodeSize = 52;
  const rowH = 104;
  const hasHeader = title !== undefined || right !== undefined;
  const headerH = hasHeader ? 68 : 0;
  const cardH = h ?? headerH + 36 + steps.length * rowH;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: cardH,
        borderRadius: 28,
        background: cardBg,
        border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : C.line}`,
        boxShadow: CARD_SHADOW,
        padding: "24px 36px",
        overflow: "hidden",
        ...materialize(p),
        ...style,
      }}
    >
      {hasHeader ? (
        <div
          style={{
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
            paddingBottom: 14,
          }}
        >
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", color: inkColor }}>
            {title}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 20,
              color: hasError ? RED : allDone ? GREEN : C.accent,
            }}
          >
            {right ?? `${reachedCount}/${steps.length} steps`}
          </span>
        </div>
      ) : null}

      {/* Vertical Progress Bars between nodes */}
      {steps.slice(0, -1).map((_, i) => {
        const yStart = headerH + 18 + i * rowH + rowH / 2 + nodeSize / 2 + 6;
        const barLen = Math.max(10, rowH - nodeSize - 12);
        const { fillP, color } = segmentFill(i);
        return (
          <div
            key={`vbar-${i}`}
            style={{
              position: "absolute",
              left: 36 + nodeSize / 2 - 3,
              top: yStart,
              width: 6,
              height: barLen,
              borderRadius: 3,
              background: trackBg,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                height: barLen * fillP,
                borderRadius: 3,
                background: color,
              }}
            />
          </div>
        );
      })}

      {/* Vertical Step Rows */}
      {steps.map((step, i) => {
        const { state, morphP } = resolved[i];
        const rowEnter = prog(frame, at + 4 + i * 3, 8, easeOut);
        const statusBadgeText =
          state === "done" ? "DONE" : state === "error" ? "ERROR" : state === "active" ? "ACTIVE" : "WAITING";
        const statusColor =
          state === "done" ? GREEN : state === "error" ? RED : state === "active" ? C.accent : muteColor;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 36,
              right: 36,
              top: headerH + 18 + i * rowH,
              height: rowH,
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity: rowEnter,
              translate: `${(1 - rowEnter) * 14}px 0px`,
            }}
          >
            <StepNodeBadge index={i} state={state} morphP={morphP} size={nodeSize} dark={dark} />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 28,
                  letterSpacing: "-0.02em",
                  color: state === "pending" ? muteColor : inkColor,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
              {step.sub ? (
                <span
                  style={{
                    fontFamily: mono,
                    fontWeight: 500,
                    fontSize: 21,
                    color: muteColor,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {step.sub}
                </span>
              ) : null}
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                background:
                  state === "done"
                    ? "#EEFAF1"
                    : state === "error"
                      ? "#FFF1F0"
                      : state === "active"
                        ? BLUE_TINT
                        : dark
                          ? "rgba(255,255,255,0.06)"
                          : C.paper,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 19,
                color: statusColor,
                whiteSpace: "nowrap",
              }}
            >
              {statusBadgeText}
            </div>
          </div>
        );
      })}
    </div>
  );
};
