import { useCurrentFrame } from "remotion";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type ColorStep = {
  at: number;
  hex: string;
  name?: string;
};

const parseHex = (hex: string) => {
  const clean = hex.replace(/^#/, "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const n = parseInt(full, 16) || 0;
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
};

const toHex2 = (v: number) =>
  Math.max(0, Math.min(255, Math.round(v)))
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");

/**
 * Hex Color (#0071E3) → RGB channels (R: 00 → 0, G: 71 → 113, B: E3 → 227) breakdown card
 * with live color swatch, base-16 nibble math, channel bars, and animated `steps`.
 */
export const ColorHexCard: React.FC<{
  hex?: string;
  name?: string;
  steps?: ColorStep[];
  at?: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  filename?: string;
  icon?: IconName;
}> = ({
  hex = "#0071E3",
  name = "system blue",
  steps = [],
  at = 0,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 540,
  dark = false,
  filename = "color.css",
  icon = "sliders",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;

  const timeline: ColorStep[] = [
    { at: -Infinity, hex, name },
    ...[...steps].sort((a, b) => a.at - b.at),
  ];

  let idx = 0;
  for (let i = 1; i < timeline.length; i++) {
    if (frame >= timeline[i].at) idx = i;
  }

  const cur = timeline[idx];
  const prev = idx > 0 ? timeline[idx - 1] : cur;
  const t = idx > 0 ? prog(frame, cur.at, 16, easeInOut) : 1;

  const c0 = parseHex(prev.hex);
  const c1 = parseHex(cur.hex);

  const r = Math.round(lerp(c0.r, c1.r, t));
  const g = Math.round(lerp(c0.g, c1.g, t));
  const b = Math.round(lerp(c0.b, c1.b, t));

  const rHex = toHex2(r);
  const gHex = toHex2(g);
  const bHex = toHex2(b);
  const liveHex = `#${rHex}${gHex}${bHex}`;
  const activeName = cur.name ?? name;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const borderCol = dark ? "rgba(255,255,255,0.1)" : C.line;
  const softBg = dark ? "rgba(255,255,255,0.04)" : "#F7F7FA";

  const channels = [
    {
      key: "R",
      label: "red channel",
      hex: rHex,
      val: r,
      color: RED,
      hi: (r >> 4) & 0xf,
      lo: r & 0xf,
    },
    {
      key: "G",
      label: "green channel",
      hex: gHex,
      val: g,
      color: GREEN,
      hi: (g >> 4) & 0xf,
      lo: g & 0xf,
    },
    {
      key: "B",
      label: "blue channel",
      hex: bHex,
      val: b,
      color: C.accent,
      hi: (b >> 4) & 0xf,
      lo: b & 0xf,
    },
  ];

  const bodyH = h - (filename !== undefined ? TAB_H : 0);

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon={icon}
      right={`rgb(${r}, ${g}, ${b})`}
    >
      <div
        style={{
          height: bodyH,
          padding: "26px 32px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Row: Live Swatch + Segmented Hex Pairs (# RR GG BB) */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 22 }}>
          {/* Live Swatch */}
          <div
            style={{
              width: 210,
              borderRadius: 22,
              background: liveHex,
              boxShadow: "inset 0 0 0 1.5px rgba(0,0,0,0.14), 0 10px 24px rgba(0,0,0,0.10)",
              padding: "16px 18px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                alignSelf: "flex-start",
                padding: "4px 10px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.86)",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 16,
                color: C.ink,
              }}
            >
              {liveHex}
            </div>
            {activeName ? (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "rgba(29,29,31,0.72)",
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 17,
                  color: C.white,
                }}
              >
                {activeName}
              </div>
            ) : null}
          </div>

          {/* Segmented Hex Breakdown (# RR GG BB) */}
          <div
            style={{
              flex: 1,
              padding: "16px 22px",
              borderRadius: 22,
              background: softBg,
              border: `1px solid ${borderCol}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 48,
                color: mute,
                paddingRight: 4,
              }}
            >
              #
            </div>

            {channels.map((ch) => (
              <div
                key={ch.key}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 16,
                  background: dark ? TERM.bg : C.white,
                  border: `2px solid ${tint(ch.color, 0.55)}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 15,
                      color: C.white,
                      background: ch.color,
                      padding: "2px 7px",
                      borderRadius: 6,
                    }}
                  >
                    {ch.key}
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 38,
                      color: fg,
                      letterSpacing: "0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {ch.hex}
                  </span>
                </div>
                <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 15, color: mute, whiteSpace: "nowrap" }}>
                  {ch.hi}×16 + {ch.lo} = <span style={{ color: ch.color, fontWeight: 700 }}>{ch.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: 3 RGB Channel Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {channels.map((ch, i) => {
            const rowEnter = prog(frame, at + 5 + i * 3, 10);
            const pct = Math.round((ch.val / 255) * 100);
            const barFillW = `${(ch.val / 255) * 100}%`;

            return (
              <div
                key={ch.key}
                style={{
                  padding: "14px 20px",
                  borderRadius: 16,
                  background: softBg,
                  border: `1px solid ${borderCol}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  ...materialize(rowEnter, 0.96, 5),
                }}
              >
                {/* R: 00 -> 0 badge */}
                <div
                  style={{
                    width: 210,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: tint(ch.color, 0.16),
                        border: `1.5px solid ${ch.color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 20,
                        color: ch.color,
                      }}
                    >
                      {ch.key}
                    </span>
                    <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 23, color: fg }}>
                      {ch.hex}
                    </span>
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 20, color: mute }}>→</span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 25,
                      color: ch.color,
                      minWidth: 52,
                      textAlign: "right",
                    }}
                  >
                    {ch.val}
                  </span>
                </div>

                {/* Progress bar track (0..255) */}
                <div
                  style={{
                    flex: 1,
                    height: 24,
                    borderRadius: 12,
                    background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: barFillW,
                      height: "100%",
                      borderRadius: 12,
                      background: ch.color,
                    }}
                  />
                </div>

                {/* Ratio / percentage */}
                <div
                  style={{
                    width: 150,
                    textAlign: "right",
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 18,
                    color: mute,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: fg }}>{ch.val}</span>/255 · {pct}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Step Presets Strip */}
        {steps.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 2 }}>
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 18, color: mute }}>color steps</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {timeline.map((s, sIdx) => {
                const isActive = sIdx === idx;
                return (
                  <div
                    key={`${s.hex}-${sIdx}`}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 10,
                      background: isActive ? (dark ? tint(C.accent, 0.18) : BLUE_TINT) : softBg,
                      border: `1.5px solid ${isActive ? C.accent : borderCol}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: mono,
                      fontWeight: 600,
                      fontSize: 16,
                      color: isActive ? C.accent : mute,
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        background: s.hex,
                        border: "1px solid rgba(0,0,0,0.2)",
                      }}
                    />
                    <span>{s.name ?? s.hex.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
