import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { AMBER } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type SortingStep = {
  at: number;
  values: number[];
  compare?: [number, number];
  swap?: [number, number];
  sorted?: number[];
  pivot?: number;
  note?: string;
  range?: [number, number];
};

/**
 * Matches each index in `curr` to the index it came from in `prev` so swapped bars
 * physically glide from their previous horizontal slot to their new slot.
 */
const resolveOrigins = (prev: number[], curr: number[], swap?: [number, number]): number[] => {
  const n = curr.length;
  const origins = Array.from({ length: n }, (_, i) => i);
  if (prev.length !== n) return origins;

  if (swap) {
    const [a, b] = swap;
    if (a >= 0 && a < n && b >= 0 && b < n) {
      if (prev[a] === curr[b] && prev[b] === curr[a] && prev[a] !== curr[a]) {
        origins[a] = b;
        origins[b] = a;
        return origins;
      }
    }
  }

  // General fallback matching when values permute across indices
  const used = new Array<boolean>(n).fill(false);
  for (let i = 0; i < n; i++) {
    if (curr[i] === prev[i]) {
      origins[i] = i;
      used[i] = true;
    }
  }
  for (let i = 0; i < n; i++) {
    if (curr[i] === prev[i]) continue;
    let found = i;
    for (let j = 0; j < n; j++) {
      if (!used[j] && prev[j] === curr[i]) {
        found = j;
        used[j] = true;
        break;
      }
    }
    origins[i] = found;
  }
  return origins;
};

/**
 * Animated array sorting & binary-search bar/tile visualizer.
 * Smoothly glides bars and array tiles between indices on swaps, colours active comparisons
 * in system blue / swaps in amber, highlights pivot elements, and locks sorted elements in green.
 */
export const SortingBars: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  values: number[];
  steps: SortingStep[];
  title?: string;
  mode?: "bars" | "tiles";
  dark?: boolean;
}> = ({
  x = TX,
  y,
  w = TW,
  h = 560,
  at,
  until,
  values,
  steps,
  title = "array sorting",
  mode = "bars",
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const sortedSteps = [...steps].sort((a, b) => a.at - b.at);
  let stepIdx = -1;
  for (let i = 0; i < sortedSteps.length; i++) {
    if (sortedSteps[i].at <= frame) stepIdx = i;
  }

  const curStep = stepIdx >= 0 ? sortedSteps[stepIdx] : null;
  const prevValues = stepIdx > 0 ? sortedSteps[stepIdx - 1].values : values;
  const curValues = curStep ? curStep.values : values;
  const glideP = curStep ? prog(frame, curStep.at, 14, easeInOut) : 1;
  const origins = curStep ? resolveOrigins(prevValues, curValues, curStep.swap) : curValues.map((_, i) => i);

  const count = Math.max(1, curValues.length);
  const maxVal = Math.max(1, ...values, ...curValues);

  const headerH = 74;
  const padX = 44;
  const innerW = w - padX * 2;
  const gap = count > 8 ? 12 : 16;
  const colW = (innerW - gap * (count - 1)) / count;
  const slotX = (idx: number) => padX + idx * (colW + gap);

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const cardBg = dark ? TERM.bg : C.white;
  const barBg = dark ? TERM.bar : "#FAFAFC";

  const isTilesOnly = mode === "tiles";
  const tileH = isTilesOnly ? Math.min(116, colW * 1.05) : 68;
  const tileY = isTilesOnly ? headerH + (h - headerH - tileH - 36) / 2 : h - tileH - 52;
  const barsBottomY = tileY - 22;
  const barsTopY = headerH + 62;
  const maxBarH = Math.max(80, barsBottomY - barsTopY);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: cardBg,
        border: `1px solid ${C.line}`,
        boxShadow: dark ? SHADOW_WINDOW : CARD_SHADOW,
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {/* Header strip */}
      <div
        style={{
          height: headerH,
          padding: "0 32px",
          background: barBg,
          borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: dark ? tint(TERM.blue, 0.18) : BLUE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={isTilesOnly ? "search" : "sliders"} size={21} color={dark ? TERM.blue : C.accent} weight={2.2} />
          </div>
          <span style={{ fontFamily: mono, fontSize: 23, fontWeight: 600, color: fg }}>{title}</span>
        </div>

        {/* Active step note pill + legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {curStep?.note ? (
            <div
              style={{
                padding: "7px 16px",
                borderRadius: 999,
                background: curStep.swap
                  ? tint(AMBER, 0.16)
                  : curStep.sorted && curStep.sorted.length === count
                    ? "#EEFAF1"
                    : dark
                      ? tint(TERM.blue, 0.18)
                      : BLUE_TINT,
                border: `1.5px solid ${
                  curStep.swap
                    ? AMBER
                    : curStep.sorted && curStep.sorted.length === count
                      ? GREEN
                      : dark
                        ? TERM.blue
                        : C.accent
                }`,
                fontFamily: mono,
                fontSize: 20,
                fontWeight: 700,
                color: curStep.swap
                  ? dark
                    ? TERM.yellow
                    : "#A05A00"
                  : curStep.sorted && curStep.sorted.length === count
                    ? "#248A3D"
                    : dark
                      ? TERM.blue
                      : C.accent,
                ...materialize(prog(frame, curStep.at, 8, easeOut)),
              }}
            >
              {curStep.note}
            </div>
          ) : (
            <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 500, color: mute }}>
              n = {count} elements
            </div>
          )}
        </div>
      </div>

      {/* Static index numbers along the bottom */}
      {Array.from({ length: count }, (_, idx) => {
        const inRange = !curStep?.range || (idx >= curStep.range[0] && idx <= curStep.range[1]);
        return (
          <div
            key={`idx-${idx}`}
            style={{
              position: "absolute",
              left: slotX(idx),
              top: tileY + tileH + 10,
              width: colW,
              textAlign: "center",
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 600,
              color: mute,
              opacity: inRange ? 0.75 : 0.3,
            }}
          >
            [{idx}]
          </div>
        );
      })}

      {/* Animated bars & tiles */}
      {curValues.map((val, idx) => {
        const fromIdx = origins[idx] ?? idx;
        const curX = lerp(slotX(fromIdx), slotX(idx), glideP);
        const isMoving = fromIdx !== idx;
        const arcY = isMoving ? Math.sin(glideP * Math.PI) * (idx < fromIdx ? -18 : 14) : 0;

        const isSorted = curStep?.sorted?.includes(idx) ?? false;
        const isSwap = curStep?.swap ? curStep.swap[0] === idx || curStep.swap[1] === idx : false;
        const isCompare = curStep?.compare ? curStep.compare[0] === idx || curStep.compare[1] === idx : false;
        const isPivot = curStep?.pivot === idx;
        const inRange = !curStep?.range || (idx >= curStep.range[0] && idx <= curStep.range[1]);

        const stateP = curStep ? prog(frame, curStep.at, 9, easeOut) : 1;

        let barColor = dark ? "#3A3A3C" : "#E5E5EA";
        let tileBg = dark ? "#2C2C2E" : "#F5F5F7";
        let tileBorder = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
        let textColor = fg;

        if (isSorted) {
          barColor = interpolateColors(stateP, [0, 1], [C.accent, GREEN]);
          tileBg = dark ? tint(GREEN, 0.2) : "#EEFAF1";
          tileBorder = GREEN;
          textColor = dark ? TERM.green : "#248A3D";
        } else if (isSwap) {
          barColor = interpolateColors(stateP, [0, 1], [C.accent, AMBER]);
          tileBg = tint(AMBER, dark ? 0.22 : 0.14);
          tileBorder = AMBER;
          textColor = dark ? TERM.yellow : "#A05A00";
        } else if (isCompare) {
          barColor = dark ? TERM.blue : C.accent;
          tileBg = dark ? tint(TERM.blue, 0.22) : BLUE_TINT;
          tileBorder = dark ? TERM.blue : C.accent;
          textColor = dark ? TERM.blue : C.accent;
        } else if (isPivot) {
          barColor = dark ? TERM.orange : AMBER;
          tileBg = tint(AMBER, 0.12);
          tileBorder = AMBER;
          textColor = dark ? TERM.yellow : "#A05A00";
        }

        const enterP = prog(frame, at + 2 + idx * 1.5, 10, easeOut);
        const dimAlpha = inRange ? 1 : 0.28;
        const barH = Math.max(36, (val / maxVal) * maxBarH);
        const barTop = barsBottomY - barH;

        const badgeText = isPivot ? "pivot" : isSwap ? "swap" : isCompare ? (isTilesOnly ? "mid" : "cmp") : null;

        return (
          <div
            key={`col-${idx}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: w,
              height: h,
              pointerEvents: "none",
              zIndex: isMoving || isSwap || isCompare ? 5 : 1,
              ...materialize(enterP),
              opacity: enterP * dimAlpha,
            }}
          >
            {/* Vertical bar (when mode === "bars") */}
            {!isTilesOnly ? (
              <div
                style={{
                  position: "absolute",
                  left: curX,
                  top: barTop + arcY * 0.4,
                  width: colW,
                  height: barH,
                  borderRadius: "14px 14px 8px 8px",
                  background: barColor,
                  border: `2px solid ${isSorted || isSwap || isCompare || isPivot ? tileBorder : "transparent"}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingTop: 10,
                  boxSizing: "border-box",
                }}
              >
                {barH >= 54 ? (
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 20,
                      fontWeight: 700,
                      color: isSorted || isSwap || isCompare || isPivot ? C.white : fg,
                    }}
                  >
                    {val}
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Floating status badge above bar or tile */}
            {badgeText ? (
              <div
                style={{
                  position: "absolute",
                  left: curX + colW / 2,
                  top: (isTilesOnly ? tileY : barTop) - 38 + arcY * 0.4,
                  translate: "-50% 0",
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: tileBg,
                  border: `1.5px solid ${tileBorder}`,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: textColor,
                  whiteSpace: "nowrap",
                  ...materialize(stateP),
                }}
              >
                {badgeText}
              </div>
            ) : null}

            {/* Array value tile */}
            <div
              style={{
                position: "absolute",
                left: curX,
                top: tileY + arcY,
                width: colW,
                height: tileH,
                borderRadius: isTilesOnly ? 20 : 14,
                background: tileBg,
                border: `2.5px solid ${tileBorder}`,
                boxShadow: isMoving ? "0 12px 24px rgba(0,0,0,0.12)" : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontSize: isTilesOnly ? 30 : 23,
                fontWeight: 700,
                color: textColor,
              }}
            >
              {val}
            </div>
          </div>
        );
      })}
    </div>
  );
};
