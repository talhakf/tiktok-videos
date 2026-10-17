import { interpolateColors, useCurrentFrame } from "remotion";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { CARD_SHADOW, lerp, presence, RED } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { tint } from "../windows/MacWindow";

export type FlameSpan = {
  level: number;
  start: number; // 0..1
  width: number; // 0..1
  fn: string;
  selfMs?: string;
  hotspot?: boolean;
};

/**
 * CPU Profiling Flame Graph card: renders stacked horizontal call-stack spans (`start` and `width` in `0..1`),
 * and at `hotspotAt` highlights the wide CPU bottleneck bar in red/amber with a callout pill.
 */
export const FlameGraph: React.FC<{
  frames: FlameSpan[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  hotspotAt?: number;
  hotspotLabel?: string;
  totalMs?: number;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  frames,
  x = TX,
  y = TY,
  w = TW,
  h,
  at,
  until,
  hotspotAt,
  hotspotLabel = "78% of CPU time",
  totalMs = 240,
  filename = "cpu-profile.cpuprofile",
  right = "sampling · 1,000 Hz",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const maxLevel = Math.max(0, ...frames.map((f) => f.level));
  const rulerH = 48;
  const rowH = 54;
  const rowGap = 10;
  const padX = 32;
  const topPad = rulerH + 18;
  const bottomArea = hotspotAt !== undefined ? 86 : 36;
  const bodyH = topPad + (maxLevel + 1) * (rowH + rowGap) + bottomArea;
  const cardH = h ?? (filename !== undefined ? TAB_H : 0) + bodyH;
  const innerW = w - padX * 2;

  const hotP = hotspotAt !== undefined ? prog(frame, hotspotAt, 12, easeInOut) : 0;
  const pillP = hotspotAt !== undefined ? prog(frame, hotspotAt + 4, 10, easeOut) : 0;

  const hotSpan = frames.find((f) => f.hotspot) ?? frames[frames.length - 1];
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  const badTone = toneColors("bad", dark);
  const warnTone = toneColors("warn", dark);
  const accentTone = toneColors("accent", dark);

  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} dark={dark} filename={filename} icon="flame" right={right} style={style}>
      {/* Time ruler header */}
      <div
        style={{
          position: "absolute",
          left: padX,
          right: padX,
          top: 0,
          height: rulerH,
          borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.1)" : C.line}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        {ticks.map((t, i) => {
          const tx = t * innerW;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: tx,
                top: 12,
                transform: i === ticks.length - 1 ? "translateX(-100%)" : i > 0 ? "translateX(-50%)" : undefined,
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 20,
                color: dark ? TERM.dim : C.mute,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {Math.round(t * totalMs)} ms
            </div>
          );
        })}
      </div>

      {/* Vertical grid hairlines */}
      {ticks.slice(1, -1).map((t, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: padX + t * innerW,
            top: rulerH,
            bottom: 24,
            width: 1,
            background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          }}
        />
      ))}

      {/* Flame graph spans */}
      {frames.map((sp, i) => {
        const enter = prog(frame, at + 5 + sp.level * 4 + sp.start * 6, 12, easeOut);
        const sx = padX + sp.start * innerW;
        const sw = Math.max(44, sp.width * innerW * enter);
        const sy = topPad + sp.level * (rowH + rowGap);
        const isHot = !!sp.hotspot;

        const baseBg = dark ? "#2B2B2E" : sp.level === 0 ? "#EFEFF4" : accentTone.bg;
        const baseEdge = dark ? "rgba(255,255,255,0.16)" : sp.level === 0 ? "rgba(0,0,0,0.14)" : tint(C.accent, 0.35);
        const baseFg = dark ? TERM.fg : C.ink;

        const hotBg = isHot ? interpolateColors(hotP, [0, 1], [baseBg, badTone.bg]) : baseBg;
        const hotEdge = isHot ? interpolateColors(hotP, [0, 1], [baseEdge, RED]) : baseEdge;
        const hotFg = isHot ? interpolateColors(hotP, [0, 1], [baseFg, badTone.fg]) : baseFg;

        const dimOpacity = isHot ? 1 : lerp(1, 0.48, hotP);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: sx,
              top: sy,
              width: sw,
              height: rowH,
              borderRadius: 12,
              background: hotBg,
              border: `${isHot && hotP > 0.1 ? 2.5 : 1.5}px solid ${hotEdge}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              overflow: "hidden",
              opacity: enter * dimOpacity,
              fontFamily: mono,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              {isHot && hotP > 0.2 ? (
                <Icon name="flame" size={22} color={RED} weight={2.2} style={{ flexShrink: 0, opacity: hotP }} />
              ) : null}
              <span
                style={{
                  fontWeight: isHot ? 700 : 500,
                  fontSize: 22,
                  color: hotFg,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {sp.fn}
              </span>
            </div>
            {sp.selfMs && sw > 170 ? (
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 19,
                  color: isHot && hotP > 0.3 ? badTone.fg : dark ? TERM.dim : C.mute,
                  marginLeft: 10,
                  flexShrink: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {sp.selfMs}
              </span>
            ) : null}
          </div>
        );
      })}

      {/* Hotspot callout pill */}
      {hotSpan && pillP > 0 ? (
        <div
          style={{
            position: "absolute",
            left: padX + (hotSpan.start + hotSpan.width / 2) * innerW,
            top: topPad + (hotSpan.level + 1) * (rowH + rowGap) + 4,
            translate: "-50% 0",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 20px",
            borderRadius: 999,
            background: dark ? "#2C1B1B" : C.white,
            border: `2px solid ${RED}`,
            boxShadow: CARD_SHADOW,
            fontFamily: sans,
            whiteSpace: "nowrap",
            ...materialize(pillP, 0.95, 6),
          }}
        >
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 8,
              background: warnTone.bg,
              color: warnTone.fg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 19,
            }}
          >
            bottleneck
          </span>
          <span style={{ fontWeight: 700, fontSize: 23, color: dark ? TERM.fg : C.ink, letterSpacing: "-0.02em" }}>
            {hotspotLabel}
          </span>
          <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 20, color: RED }}>
            {hotSpan.fn}
          </span>
        </div>
      ) : null}
    </DevCard>
  );
};
