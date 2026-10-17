import { interpolateColors, useCurrentFrame } from "remotion";
import { TW, TX, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";
import { DevCard, focusTrack, mixTone, TAB_H, Tone, toneColors } from "../dev/card";
import { lerp, presence } from "../diagram/Node";

export type CacheTier = {
  name: string;
  latency: string;
  size: string;
  sub?: string;
  widthFrac?: number;
};

export type ActiveTierCue = {
  index: number;
  at: number;
  until?: number;
  tone?: Tone;
  label?: string;
};

const DEFAULT_TIERS: CacheTier[] = [
  { name: "L1 Cache", latency: "1 ns", size: "64 KB", sub: "per-core · ~4 cycles", widthFrac: 0.56 },
  { name: "L2 Cache", latency: "4 ns", size: "512 KB", sub: "per-core · ~14 cycles", widthFrac: 0.67 },
  { name: "L3 Cache", latency: "12 ns", size: "32 MB", sub: "shared die · ~42 cycles", widthFrac: 0.78 },
  { name: "Main RAM", latency: "80 ns", size: "16 GB", sub: "DDR5 DRAM · ~280 cycles", widthFrac: 0.89 },
  { name: "NVMe SSD", latency: "50,000 ns", size: "1 TB", sub: "PCIe flash · ~170,000 cycles", widthFrac: 1.0 },
];

/**
 * CPU/Storage latency & size pyramid/tiers (`L1 Cache · 1 ns · 64 KB` down to `NVMe SSD · 50,000 ns · 1 TB`),
 * with staggered entrance and `activeTier?: { index: number; at: number }[]`.
 */
export const CacheHierarchy: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  tiers?: CacheTier[];
  activeTier?: ActiveTierCue[];
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y = TY,
  w = TW,
  h: customH,
  at = 0,
  until,
  tiers = DEFAULT_TIERS,
  activeTier = [],
  filename = "memory-hierarchy",
  right = "latency vs capacity",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tabH = filename !== undefined ? TAB_H : 0;
  const rowH = 104;
  const rowGap = 14;
  const padX = 36;
  const topHeaderH = 56;
  const padBottom = 30;
  const h = customH ?? tabH + topHeaderH + tiers.length * rowH + (tiers.length - 1) * rowGap + padBottom;

  const maxW = w - padX * 2;
  const track = focusTrack(frame, activeTier, 10, 8);

  // Smooth active index if gliding between two cues
  const activePos = track
    ? track.prev
      ? lerp(track.prev.index, track.cur.index, track.t)
      : track.cur.index
    : -10;
  const activeToneColors = track
    ? track.prev
      ? mixTone(track.prev.tone ?? "accent", track.cur.tone ?? "accent", track.t, false)
      : toneColors(track.cur.tone ?? "accent", false)
    : toneColors("accent", false);

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="layers" right={right} style={style}>
      {/* Axis legend bar */}
      <div
        style={{
          position: "absolute",
          left: padX,
          right: padX,
          top: 14,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: mono,
          fontWeight: 500,
          fontSize: 18,
          color: C.mute,
        }}
      >
        <span>↑ faster · closer to CPU cores</span>
        <span>↓ larger capacity · higher latency</span>
      </div>

      {/* Pyramid tiers */}
      {tiers.map((tier, i) => {
        const enterP = prog(frame, at + 4 + i * 3, 10, easeOut);
        const frac = tier.widthFrac ?? 0.56 + (0.44 * i) / Math.max(1, tiers.length - 1);
        const tierW = Math.round(maxW * frac);
        const tierX = Math.round((w - tierW) / 2);
        const tierY = topHeaderH + i * (rowH + rowGap);

        const dist = track ? Math.min(1, Math.abs(activePos - i)) : 1;
        const wActive = track ? (1 - dist) * track.o : 0;

        const bg = interpolateColors(wActive, [0, 1], ["#F5F5F7", activeToneColors.bg]);
        const border = interpolateColors(wActive, [0, 1], [C.line, activeToneColors.edge]);
        const nameColor = interpolateColors(wActive, [0, 1], [C.ink, activeToneColors.fg]);

        return (
          <div
            key={tier.name}
            style={{
              position: "absolute",
              left: tierX,
              top: tierY,
              width: tierW,
              height: rowH,
              borderRadius: 20,
              background: bg,
              border: `2.5px solid ${border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              boxSizing: "border-box",
              ...materialize(enterP, 0.96, 6),
              scale: String((0.96 + 0.04 * enterP) * (1 + wActive * 0.015)),
            }}
          >
            {/* Left: Tier rank badge + Name + Sub */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: wActive > 0.4 ? activeToneColors.edge : "rgba(0,0,0,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 19,
                  color: wActive > 0.4 ? C.white : C.mute,
                  flexShrink: 0,
                }}
              >
                T{i + 1}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: 26,
                    letterSpacing: "-0.02em",
                    color: nameColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tier.name}
                </div>
                {tier.sub ? (
                  <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 16, color: C.mute, whiteSpace: "nowrap" }}>
                    {tier.sub}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right: Latency · Size pills + optional active cue label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {wActive > 0.5 && track?.cur.label ? (
                <div
                  style={{
                    padding: "5px 12px",
                    borderRadius: 9,
                    background: activeToneColors.edge,
                    color: C.white,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 17,
                    whiteSpace: "nowrap",
                  }}
                >
                  {track.cur.label}
                </div>
              ) : null}

              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: C.white,
                  border: `1.5px solid ${wActive > 0.4 ? activeToneColors.edge : C.line}`,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 21,
                  color: wActive > 0.4 ? activeToneColors.fg : C.ink,
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {tier.latency}
              </div>

              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.05)",
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 20,
                  color: C.mute,
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {tier.size}
              </div>
            </div>
          </div>
        );
      })}
    </DevCard>
  );
};
