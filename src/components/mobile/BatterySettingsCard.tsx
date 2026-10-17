import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { AMBER, toneColors } from "../dev/card";
import { CARD_SHADOW, GREEN, lerp, presence, RED } from "../diagram/Node";

export type BatteryAppItem = {
  name: string;
  pct: number;
  sub: string;
  icon?: IconName;
  suspicious?: boolean;
};

const DEFAULT_BARS = [
  0.18, 0.14, 0.78, 0.92, 0.86, 0.74, 0.22, 0.35, 0.48, 0.52, 0.44, 0.38,
  0.56, 0.62, 0.49, 0.42, 0.58, 0.66, 0.72, 0.54, 0.38, 0.28, 0.22, 0.16,
];

/**
 * iOS / Android Battery & Background Activity inspector card:
 * shows 24-hour activity bars and per-app battery drain rows, highlighting
 * a background data-harvester app in red/amber.
 */
export const BatterySettingsCard: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  at?: number;
  until?: number;
  title?: string;
  level?: number;
  bars?: number[];
  spikeHours?: [number, number];
  highlightAt?: number;
  apps: BatteryAppItem[];
  dark?: boolean;
}> = ({
  x = TX,
  y = TY,
  w = TW,
  at = 0,
  until,
  title = "Battery & background activity",
  level = 42,
  bars = DEFAULT_BARS,
  spikeHours = [2, 5],
  highlightAt,
  apps,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until, 10, 8);
  if (vis === null) return null;

  const alertCue = highlightAt ?? at + 18;
  const alertP = prog(frame, alertCue, 12, easeInOut);

  const fg = dark ? TERM.fg : C.ink;
  const subFg = dark ? TERM.dim : C.mute;
  const lineCol = dark ? "rgba(255,255,255,0.1)" : C.line;
  const cardBg = dark ? TERM.bg : C.white;

  const rowH = 104;
  const chartSectionH = 278;
  const totalH = chartSectionH + apps.length * rowH + 24;

  const badTone = toneColors("bad", dark);
  const warnTone = toneColors("warn", dark);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: totalH,
        borderRadius: 32,
        background: cardBg,
        border: `1.5px solid ${lineCol}`,
        boxShadow: dark ? SHADOW_WINDOW : CARD_SHADOW,
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {/* Top 24-hour Battery & Activity Chart Header */}
      <div
        style={{
          height: chartSectionH,
          padding: "24px 32px 20px",
          boxSizing: "border-box",
          borderBottom: `1px solid ${lineCol}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Icon name="batteryLow" size={34} color={level < 50 ? AMBER : GREEN} weight={2.1} />
            <span style={{ fontSize: 27, fontWeight: 700, color: fg, letterSpacing: "-0.015em" }}>{title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {alertP > 0.05 ? (
              <span
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 10,
                  background: warnTone.bg,
                  border: `1px solid ${warnTone.edge}`,
                  color: warnTone.fg,
                  fontFamily: mono,
                  fontSize: 19,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  opacity: alertP,
                }}
              >
                3am wake spike
              </span>
            ) : null}
            <span style={{ fontFamily: mono, fontSize: 25, fontWeight: 700, color: fg }}>{level}%</span>
          </div>
        </div>

        {/* 24-hour vertical activity bars */}
        <div style={{ position: "relative", height: 124, display: "flex", alignItems: "flex-end", gap: 10, paddingTop: 12 }}>
          {bars.slice(0, 24).map((v, idx) => {
            const barGrow = prog(frame, at + 4 + idx * 0.45, 12);
            const isSpike = idx >= spikeHours[0] && idx <= spikeHours[1];
            const barColor = isSpike
              ? interpolateColors(alertP, [0, 1], [C.accent, RED])
              : C.accent;
            const hPx = Math.max(10, Math.round(v * 108 * barGrow));

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: hPx,
                    borderRadius: 6,
                    background: barColor,
                    opacity: isSpike ? lerp(0.85, 1, alertP) : 0.72,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Time axis labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 19,
            fontWeight: 500,
            color: subFg,
          }}
        >
          <span>00:00</span>
          <span style={{ color: alertP > 0.3 ? badTone.fg : subFg, fontWeight: alertP > 0.3 ? 700 : 500 }}>
            03:00 background
          </span>
          <span>12:00</span>
          <span>18:00</span>
          <span>now</span>
        </div>
      </div>

      {/* Per-App Battery Usage Rows */}
      <div style={{ padding: "12px 0" }}>
        {apps.map((app, i) => {
          const rowGrow = prog(frame, at + 8 + i * 3, 14);
          const isSuspicious = Boolean(app.suspicious);
          const hi = isSuspicious ? alertP : 0;

          const rowBg = isSuspicious
            ? interpolateColors(hi, [0, 1], ["rgba(255,59,48,0)", badTone.bg])
            : "transparent";
          const iconBg = isSuspicious
            ? interpolateColors(hi, [0, 1], [dark ? "#2C2C2E" : C.paper, badTone.bg])
            : dark
              ? "#2C2C2E"
              : C.paper;
          const iconBorder = isSuspicious
            ? interpolateColors(hi, [0, 1], [lineCol, badTone.edge])
            : lineCol;
          const iconColor = isSuspicious
            ? interpolateColors(hi, [0, 1], [fg, badTone.fg])
            : C.accent;
          const pctVal = Math.round(app.pct * rowGrow);

          return (
            <div
              key={app.name}
              style={{
                position: "relative",
                height: rowH,
                padding: "0 32px",
                background: rowBg,
                display: "flex",
                alignItems: "center",
                gap: 22,
                borderTop: i > 0 ? `1px solid ${lineCol}` : undefined,
              }}
            >
              {/* Left accent bar when suspicious */}
              {isSuspicious && hi > 0.01 ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 10,
                    bottom: 10,
                    width: 6,
                    borderRadius: "0 4px 4px 0",
                    background: RED,
                    opacity: hi,
                  }}
                />
              ) : null}

              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 17,
                  background: iconBg,
                  border: `1.5px solid ${iconBorder}`,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={app.icon ?? "phone"} size={32} color={iconColor} weight={2} />
              </div>

              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
                        letterSpacing: "-0.015em",
                        color: isSuspicious ? interpolateColors(hi, [0, 1], [fg, badTone.fg]) : fg,
                      }}
                    >
                      {app.name}
                    </span>
                    {isSuspicious && hi > 0.1 ? (
                      <span
                        style={{
                          height: 26,
                          padding: "0 10px",
                          borderRadius: 8,
                          background: warnTone.bg,
                          border: `1px solid ${AMBER}`,
                          color: warnTone.fg,
                          fontFamily: mono,
                          fontSize: 18,
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          opacity: hi,
                        }}
                      >
                        harvester
                      </span>
                    ) : null}
                  </div>

                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 25,
                      fontWeight: 700,
                      color: isSuspicious ? interpolateColors(hi, [0, 1], [fg, badTone.fg]) : fg,
                    }}
                  >
                    {pctVal}%
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      color: isSuspicious ? interpolateColors(hi, [0, 1], [subFg, badTone.fg]) : subFg,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {app.sub}
                  </span>

                  {/* Mini proportional drain bar */}
                  <div
                    style={{
                      width: 200,
                      height: 10,
                      borderRadius: 5,
                      background: dark ? "#2C2C2E" : C.soft,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, app.pct * rowGrow)}%`,
                        height: "100%",
                        borderRadius: 5,
                        background: isSuspicious ? interpolateColors(hi, [0, 1], [ AMBER, RED ]) : C.accent,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
