import { useCurrentFrame } from "remotion";
import { TX, TW } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type FlexJustify = "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
export type FlexAlign = "flex-start" | "center" | "flex-end";

export type FlexStateCue = {
  at: number;
  justify: FlexJustify;
  align?: FlexAlign;
  rule: string;
};

export type FlexChildItem = {
  label: string;
  sub?: string;
  w?: number;
  h?: number;
  tone?: "blue" | "green" | "amber";
};

const DEFAULT_ITEMS: FlexChildItem[] = [
  { label: "1", sub: "140×104", w: 148, h: 108, tone: "blue" },
  { label: "2", sub: "168×148", w: 172, h: 152, tone: "green" },
  { label: "3", sub: "140×120", w: 148, h: 120, tone: "amber" },
];

const computePositions = (
  items: FlexChildItem[],
  innerW: number,
  innerH: number,
  justify: FlexJustify,
  align: FlexAlign = "flex-start",
  baseGap = 20
) => {
  const widths = items.map((it) => it.w ?? 150);
  const heights = items.map((it) => it.h ?? 116);
  const n = items.length;
  const sumW = widths.reduce((a, b) => a + b, 0);
  const totalWithGap = sumW + baseGap * Math.max(0, n - 1);
  const freeW = Math.max(0, innerW - sumW);

  const xs: number[] = [];
  if (justify === "flex-start") {
    let cur = 0;
    for (let i = 0; i < n; i++) {
      xs.push(cur);
      cur += widths[i] + baseGap;
    }
  } else if (justify === "center") {
    let cur = (innerW - totalWithGap) / 2;
    for (let i = 0; i < n; i++) {
      xs.push(cur);
      cur += widths[i] + baseGap;
    }
  } else if (justify === "flex-end") {
    let cur = innerW - totalWithGap;
    for (let i = 0; i < n; i++) {
      xs.push(cur);
      cur += widths[i] + baseGap;
    }
  } else if (justify === "space-between") {
    const gap = n > 1 ? freeW / (n - 1) : 0;
    let cur = 0;
    for (let i = 0; i < n; i++) {
      xs.push(cur);
      cur += widths[i] + gap;
    }
  } else {
    // space-around
    const slot = n > 0 ? freeW / n : 0;
    let cur = slot / 2;
    for (let i = 0; i < n; i++) {
      xs.push(cur);
      cur += widths[i] + slot;
    }
  }

  return items.map((_, i) => {
    const w = widths[i];
    const h = heights[i];
    const y =
      align === "center"
        ? (innerH - h) / 2
        : align === "flex-end"
          ? innerH - h
          : 0;
    return { x: xs[i], y, w, h };
  });
};

const itemColors = (tone: FlexChildItem["tone"] = "blue") => {
  if (tone === "green") return { bg: tint(GREEN, 0.14), border: GREEN, fg: "#1E7E34" };
  if (tone === "amber") return { bg: tint(AMBER, 0.16), border: AMBER, fg: "#A05A00" };
  return { bg: BLUE_TINT, border: C.accent, fg: C.accent };
};

/**
 * CSS Flexbox interactive container card: shows a CSS rule header
 * (`justify-content: space-between; align-items: center;`) and child boxes inside a container
 * that smoothly glide to their new positions at each `states` cue.
 */
export const FlexPlayground: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  states: FlexStateCue[];
  items?: FlexChildItem[];
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
  states,
  items = DEFAULT_ITEMS,
  filename = "flexbox.css",
  right = "display: flex",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const sorted = [...states].sort((a, b) => a.at - b.at);
  let curIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (frame >= sorted[i].at) curIdx = i;
  }

  const fallback: FlexStateCue = {
    at,
    justify: "flex-start",
    align: "flex-start",
    rule: "justify-content: flex-start; align-items: flex-start;",
  };
  const curState = sorted[curIdx] ?? fallback;
  const prevState = curIdx > 0 ? sorted[curIdx - 1] : curState;
  const glide = curIdx > 0 ? prog(frame, curState.at, 14, easeInOut) : 1;

  const padX = 28;
  const containerTop = 122;
  const containerW = w - padX * 2;
  const containerH = 340;
  const innerPad = 26;
  const innerW = containerW - innerPad * 2;
  const innerH = containerH - innerPad * 2;

  const prevBoxes = computePositions(items, innerW, innerH, prevState.justify, prevState.align ?? "flex-start");
  const curBoxes = computePositions(items, innerW, innerH, curState.justify, curState.align ?? "flex-start");

  const bodyH = containerTop + containerH + 30;
  const cardH = h ?? (filename !== undefined ? TAB_H : 0) + bodyH;

  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} filename={filename} icon="panes" right={right} style={style}>
      {/* CSS rule header bar */}
      <div
        style={{
          position: "absolute",
          left: padX,
          right: padX,
          top: 22,
          height: 76,
          borderRadius: 18,
          background: "#F5F5F7",
          border: `1.5px solid ${C.line}`,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 22,
            color: C.ink,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ color: C.mute }}>.row {"{ "}</span>
          <span style={{ color: C.accent }}>{curState.rule}</span>
          <span style={{ color: C.mute }}>{" }"}</span>
        </div>

        <div
          style={{
            padding: "6px 14px",
            borderRadius: 10,
            background: BLUE_TINT,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: C.accent,
            flexShrink: 0,
          }}
        >
          {curState.justify}
        </div>
      </div>

      {/* Flex container */}
      <div
        style={{
          position: "absolute",
          left: padX,
          top: containerTop,
          width: containerW,
          height: containerH,
          borderRadius: 24,
          background: "#FAFAFC",
          border: `2.5px dashed rgba(0, 113, 227, 0.35)`,
          overflow: "hidden",
        }}
      >
        {/* Subtle cross-axis center line when align-items: center */}
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: containerH / 2,
            height: 0,
            borderTop: `1.5px dashed ${
              (curState.align ?? "flex-start") === "center" ? "rgba(0,113,227,0.32)" : "rgba(0,0,0,0.07)"
            }`,
          }}
        />

        {/* Axis badge */}
        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: 12,
            fontFamily: mono,
            fontWeight: 600,
            fontSize: 16,
            color: C.mute,
          }}
        >
          main axis → · align: {curState.align ?? "flex-start"}
        </div>

        {/* Flex items gliding inside inner box */}
        <div
          style={{
            position: "absolute",
            left: innerPad,
            top: innerPad,
            width: innerW,
            height: innerH,
          }}
        >
          {items.map((item, i) => {
            const a = prevBoxes[i];
            const b = curBoxes[i];
            const ix = lerp(a.x, b.x, glide);
            const iy = lerp(a.y, b.y, glide);
            const iw = lerp(a.w, b.w, glide);
            const ih = lerp(a.h, b.h, glide);
            const col = itemColors(item.tone);
            const itemEnter = prog(frame, at + 5 + i * 3, 10);

            return (
              <div
                key={item.label}
                style={{
                  position: "absolute",
                  left: ix,
                  top: iy,
                  width: iw,
                  height: ih,
                  borderRadius: 18,
                  background: col.bg,
                  border: `2.5px solid ${col.border}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  ...materialize(itemEnter),
                }}
              >
                <div
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: 32,
                    color: col.fg,
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </div>
                {item.sub ? (
                  <div
                    style={{
                      fontFamily: mono,
                      fontWeight: 600,
                      fontSize: 17,
                      color: C.mute,
                    }}
                  >
                    {item.sub}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </DevCard>
  );
};
