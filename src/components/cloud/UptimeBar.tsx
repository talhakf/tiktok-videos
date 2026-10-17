import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type UptimeStatus = "operational" | "degraded" | "down";

export type UptimeIncident = {
  index: number;
  label: string;
  at: number;
  severity?: "down" | "degraded";
};

/**
 * Service status & 45-bar heartbeat monitor (Uptime Kuma / status page style).
 * Renders service name, `uptimePct`, `status` ("operational" | "degraded" | "down"),
 * and 45 vertical heartbeat bars that cascade in green with optional red/amber incident bars.
 */
export const UptimeBar: React.FC<{
  service?: string;
  name?: string;
  uptimePct?: string;
  status?: UptimeStatus;
  incidents?: UptimeIncident[];
  bars?: number;
  latency?: string;
  x: number;
  y: number;
  w?: number;
  at?: number;
  until?: number;
  filename?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  service,
  name,
  uptimePct = "99.98%",
  status = "operational",
  incidents = [],
  bars = 45,
  latency = "18 ms",
  x,
  y,
  w = 900,
  at = 0,
  until,
  filename,
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const serviceName = service ?? name ?? "api.sudo.sh";

  // Find latest active incident at current frame
  const activeIncidents = incidents
    .filter((inc) => frame >= inc.at)
    .sort((a, b) => a.at - b.at);
  const latestInc = activeIncidents.length > 0 ? activeIncidents[activeIncidents.length - 1] : null;

  // Effective status reflects explicit `status`, or degrades when an incident triggers
  const effectiveStatus: UptimeStatus =
    status !== "operational"
      ? status
      : latestInc
        ? latestInc.severity === "degraded"
          ? "degraded"
          : "down"
        : "operational";

  const statusMeta = {
    operational: {
      label: "Operational",
      color: "#248A3D",
      dot: GREEN,
      bg: tint(GREEN, 0.15),
      icon: "checkCircle" as const,
    },
    degraded: {
      label: "Degraded performance",
      color: "#A05A00",
      dot: AMBER,
      bg: tint(AMBER, 0.16),
      icon: "warning" as const,
    },
    down: {
      label: "Outage detected",
      color: "#C9281E",
      dot: RED,
      bg: tint(RED, 0.15),
      icon: "crossCircle" as const,
    },
  }[effectiveStatus];

  const hasIncSlot = incidents.length > 0;
  const bodyH = hasIncSlot ? 286 : 228;
  const h = (filename ? TAB_H : 0) + bodyH;

  const incidentByIndex = new Map<number, UptimeIncident>();
  for (const inc of incidents) {
    incidentByIndex.set(inc.index, inc);
  }

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="waveform"
      right={filename ? `${uptimePct} uptime` : undefined}
      style={style}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "26px 34px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top header: Service name + latency on left, Status badge + uptimePct on right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: statusMeta.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={statusMeta.icon} size={26} color={statusMeta.dot} weight={2.2} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: 28,
                    letterSpacing: "-0.02em",
                    color: dark ? TERM.fg : C.ink,
                  }}
                >
                  {serviceName}
                </span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 8,
                    background: dark ? "rgba(255,255,255,0.08)" : "#F2F2F7",
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 17,
                    color: dark ? TERM.dim : C.mute,
                  }}
                >
                  {latency}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "7px 16px",
                borderRadius: 999,
                background: statusMeta.bg,
                color: statusMeta.color,
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 20,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: statusMeta.dot,
                }}
              />
              {statusMeta.label}
            </div>

            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 26,
                color: statusMeta.color,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {uptimePct}
            </div>
          </div>
        </div>

        {/* 45 vertical heartbeat bars */}
        <div
          style={{
            height: 86,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
            padding: "6px 0",
          }}
        >
          {Array.from({ length: bars }).map((_, i) => {
            const cascadeP = prog(frame, at + 4 + i * 0.45, 9, easeOut);
            const inc = incidentByIndex.get(i);
            const incP = inc !== undefined ? prog(frame, inc.at, 8, easeOut) : 0;

            const isDegradedBar =
              inc?.severity === "degraded" ||
              (inc !== undefined && status === "degraded" && inc.severity === undefined);
            const incTargetColor = isDegradedBar ? AMBER : RED;
            const barColor = interpolateColors(incP, [0, 1], [GREEN, incTargetColor]);

            const barH = lerp(64, 78, incP);

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: barH,
                  borderRadius: 5,
                  background: barColor,
                  opacity: cascadeP,
                  scale: `1 ${lerp(0.25, 1, cascadeP)}`,
                  boxShadow:
                    incP > 0.4
                      ? `0 0 0 2px ${tint(incTargetColor, 0.28)}`
                      : undefined,
                }}
              />
            );
          })}
        </div>

        {/* Footer legend + active incident callout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: hasIncSlot ? 54 : 28,
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 18,
              color: dark ? TERM.dim : C.mute,
            }}
          >
            45 checks ago
          </span>

          {latestInc ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 18px",
                borderRadius: 12,
                background:
                  latestInc.severity === "degraded" || status === "degraded"
                    ? tint(AMBER, 0.16)
                    : "#FFF1F0",
                border: `1.5px solid ${
                  latestInc.severity === "degraded" || status === "degraded" ? AMBER : RED
                }`,
                color:
                  latestInc.severity === "degraded" || status === "degraded"
                    ? "#A05A00"
                    : "#C9281E",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 19,
                ...materialize(prog(frame, latestInc.at, 9, easeOut), 0.94, 5),
              }}
            >
              <Icon
                name="warning"
                size={21}
                color={
                  latestInc.severity === "degraded" || status === "degraded" ? AMBER : RED
                }
                weight={2.3}
              />
              <span>
                Bar #{latestInc.index + 1} · {latestInc.label}
              </span>
            </div>
          ) : (
            <span
              style={{
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 18,
                color: dark ? TERM.dim : C.mute,
              }}
            >
              Heartbeat interval: 60s
            </span>
          )}

          <span
            style={{
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 18,
              color: dark ? TERM.dim : C.mute,
            }}
          >
            Now
          </span>
        </div>
      </div>
    </DevCard>
  );
};
