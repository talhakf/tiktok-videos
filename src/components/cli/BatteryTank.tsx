import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export const BatteryTank: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  reportedPct?: number;
  designWh: number;
  fullChargeWh: number;
  cycles: number;
  revealAt: number;
}> = ({ x = TX, y, w = 900, at, until, reportedPct = 100, designWh, fullChargeWh, cycles, revealAt }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const h = TAB_H + 412;
  const padX = 32;
  const innerW = w - padX * 2;

  const realRatio = Math.max(0, Math.min(1, fullChargeWh / designWh));
  const realPct = Math.round(realRatio * 100);
  const lostPct = Math.max(0, 100 - realPct);
  const lostWh = Math.max(0, designWh - fullChargeWh);

  const revP = prog(frame, revealAt, 22, easeInOut);
  const shownPct = Math.round(lerp(reportedPct, realPct, revP));
  const greenFillPct = lerp(reportedPct, realPct, revP);
  const lostZonePct = lerp(0, lostPct, revP);

  const pctColor = interpolateColors(revP, [0, 0.6, 1], [GREEN, AMBER, RED]);
  const barFillColor = interpolateColors(revP, [0, 1], [GREEN, "#28B44B"]);

  const tankW = innerW - 22; // leave 22px for positive battery terminal nub on right
  const tankH = 138;
  const tankTop = 112;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      filename="battery health — design vs full charge"
      icon="bolt"
      right={`${cycles} cycles`}
    >
      {/* Top comparison header: OS menu bar claim vs Real capacity */}
      <div
        style={{
          position: "absolute",
          left: padX,
          top: 22,
          width: innerW,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 20px",
            borderRadius: 16,
            background: "#F5F5F7",
            border: `1.5px solid ${C.line}`,
          }}
        >
          <Icon name="bolt" size={26} color={GREEN} weight={2.2} />
          <div>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 19, color: C.ink }}>
              OS menu bar claims:{" "}
              <span style={{ fontFamily: mono, fontWeight: 700, color: "#248A3D" }}>{reportedPct}% Charged</span>
            </div>
            <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 15, color: C.mute }}>
              {revP > 0.3 ? "100% of current shrunk limit — not factory design!" : "looks healthy on the status bar"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 16, color: C.mute }}>
              {revP > 0.2 ? "real capacity" : "reported"}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 48,
                color: pctColor,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {shownPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Physical Battery Tank */}
      <div
        style={{
          position: "absolute",
          left: padX,
          top: tankTop,
          width: tankW,
          height: tankH,
          borderRadius: 26,
          background: "#F5F5F7",
          border: `3.5px solid ${C.ink}`,
          padding: 8,
          overflow: "hidden",
          display: "flex",
        }}
      >
        {/* Usable Full Charge bar (peels back from 100% to 76%) */}
        <div
          style={{
            width: `${greenFillPct}%`,
            height: "100%",
            borderRadius: revP > 0.05 ? "16px 6px 6px 16px" : 16,
            background: barFillColor,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 24px",
            color: C.white,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            {revP > 0.35 ? `${shownPct}% usable capacity` : `${reportedPct}% charged`}
          </div>
          <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 19, opacity: 0.92, whiteSpace: "nowrap" }}>
            {revP > 0.35 ? `${fullChargeWh.toFixed(1)} Wh actual max` : `${designWh.toFixed(1)} Wh factory spec`}
          </div>
        </div>

        {/* Degraded / permanently lost capacity zone with SVG diagonal hazard stripes (no CSS gradients) */}
        {lostZonePct > 0.5 ? (
          <div
            style={{
              width: `${lostZonePct}%`,
              height: "100%",
              marginLeft: 6,
              borderRadius: "6px 16px 16px 6px",
              background: "#FFF1F0",
              border: `2.5px dashed ${RED}`,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 240 130"
              preserveAspectRatio="none"
              style={{ position: "absolute", inset: 0, opacity: 0.22 }}
            >
              {Array.from({ length: 18 }).map((_, i) => {
                const xOff = i * 24 - 100;
                return (
                  <line
                    key={i}
                    x1={xOff}
                    y1={140}
                    x2={xOff + 130}
                    y2={-10}
                    stroke={i % 2 === 0 ? RED : AMBER}
                    strokeWidth={6}
                  />
                );
              })}
            </svg>

            {revP > 0.45 ? (
              <div
                style={{
                  position: "relative",
                  textAlign: "center",
                  padding: "4px 10px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.88)",
                }}
              >
                <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: "#C9281E", whiteSpace: "nowrap" }}>
                  −{lostPct}% lost
                </div>
                <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 15, color: "#A05A00", whiteSpace: "nowrap" }}>
                  −{lostWh.toFixed(1)} Wh degraded
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Battery positive terminal cap on the right edge */}
      <div
        style={{
          position: "absolute",
          left: padX + tankW + 4,
          top: tankTop + (tankH - 52) / 2,
          width: 14,
          height: 52,
          borderRadius: "0 10px 10px 0",
          background: C.ink,
        }}
      />

      {/* Bottom 3 hardware telemetry cards */}
      {[
        {
          label: "Design capacity",
          val: `${designWh.toFixed(1)} Wh`,
          sub: "100% factory spec",
          tone: "idle",
        },
        {
          label: "Full charge max",
          val: `${fullChargeWh.toFixed(1)} Wh`,
          sub: `${realPct}% of design (${lostWh.toFixed(1)} Wh lost)`,
          tone: revP > 0.3 ? "warn" : "idle",
        },
        {
          label: "Cycle count",
          val: `${cycles} cycles`,
          sub: cycles >= 500 ? "chemical wear active" : "normal wear",
          tone: revP > 0.3 && cycles >= 500 ? "bad" : "idle",
        },
      ].map((m, i) => {
        const cardW = (innerW - 16 * 2) / 3;
        const enterP = prog(frame, at + 8 + i * 3, 10, easeOut);
        const isWarn = m.tone === "warn";
        const isBad = m.tone === "bad";
        const bg = isBad ? "#FFF1F0" : isWarn ? tint(AMBER, 0.14) : "#F5F5F7";
        const border = isBad ? RED : isWarn ? AMBER : C.line;
        const valColor = isBad ? "#C9281E" : isWarn ? "#A05A00" : C.ink;

        return (
          <div
            key={m.label}
            style={{
              position: "absolute",
              left: padX + i * (cardW + 16),
              top: 276,
              width: cardW,
              height: 112,
              borderRadius: 18,
              background: bg,
              border: `2px solid ${border}`,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              ...materialize(enterP),
            }}
          >
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 17, color: C.mute }}>{m.label}</div>
            <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 28, color: valColor }}>{m.val}</div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 14,
                color: isBad || isWarn ? valColor : C.mute,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {m.sub}
            </div>
          </div>
        );
      })}
    </DevCard>
  );
};
