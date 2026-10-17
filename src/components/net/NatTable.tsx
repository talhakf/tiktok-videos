import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";
import { DevCard, TAB_H } from "../dev/card";
import { GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type NatEntryStatus = "ok" | "blocked" | "active";

export type NatEntry = {
  left: string;
  right: string;
  sub?: string;
  status?: NatEntryStatus;
  at: number;
};

const statusStyle = (status: NatEntryStatus, mode: "nat" | "sinkhole"): {
  bg: string;
  fg: string;
  border: string;
  icon: IconName;
  label: string;
} => {
  if (status === "blocked") {
    return {
      bg: tint(RED, 0.12),
      fg: "#C9281E",
      border: tint(RED, 0.35),
      icon: "cross",
      label: "blocked",
    };
  }
  if (status === "active") {
    return {
      bg: "#EBF4FF",
      fg: C.accent,
      border: tint(C.accent, 0.35),
      icon: "bolt",
      label: mode === "sinkhole" ? "cached" : "translated",
    };
  }
  return {
    bg: tint(GREEN, 0.14),
    fg: "#248A3D",
    border: tint(GREEN, 0.35),
    icon: "check",
    label: mode === "sinkhole" ? "allowed" : "forwarded",
  };
};

/**
 * Router middlebox / NAT translation / DNS Sinkhole card.
 * Supports `"nat"` mode (LAN private IP:port → WAN public IP:port) and `"sinkhole"` mode
 * (domain query → resolved IP or 0.0.0.0 sinkhole block).
 */
export const NatTable: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  title?: string;
  mode?: "nat" | "sinkhole";
  entries: NatEntry[];
}> = ({ x = TX, y, w = 900, at, until, title, mode = "nat", entries }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const resolvedTitle = title ?? (mode === "sinkhole" ? "Pi-hole DNS sinkhole" : "Router NAT table · 203.0.113.7");
  const headerH = 46;
  const rowH = 74;
  const padBottom = 14;
  const bodyH = headerH + entries.length * rowH + padBottom;
  const totalH = TAB_H + bodyH;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={totalH}
      p={vis}
      filename={resolvedTitle}
      icon={mode === "sinkhole" ? "shield" : "router"}
      right={mode === "sinkhole" ? "DNS :53" : "LAN ↔ WAN"}
    >
      {/* Column Header Bar */}
      <div
        style={{
          height: headerH,
          background: "#FAFAFC",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 17,
          color: C.mute,
        }}
      >
        <div style={{ width: 320 }}>{mode === "sinkhole" ? "Queried domain" : "LAN private (inside)"}</div>
        <div style={{ width: 64 }} />
        <div style={{ flex: 1 }}>{mode === "sinkhole" ? "Resolved target" : "WAN public (outside)"}</div>
        <div style={{ width: 156, textAlign: "right" }}>{mode === "sinkhole" ? "Policy" : "State"}</div>
      </div>

      {/* Table Rows */}
      <div style={{ position: "relative" }}>
        {entries.map((entry, i) => {
          if (frame < entry.at) return null;
          const ep = prog(frame, entry.at, 10, easeOut);
          const st = entry.status ?? "ok";
          const look = statusStyle(st, mode);
          const isBlocked = st === "blocked";

          return (
            <div
              key={i}
              style={{
                height: rowH,
                display: "flex",
                alignItems: "center",
                padding: "0 28px",
                borderBottom: i < entries.length - 1 ? `1px solid rgba(0,0,0,0.06)` : undefined,
                background: isBlocked ? "rgba(255,59,48,0.04)" : undefined,
                ...materialize(ep),
                translate: `0px ${(1 - ep) * 10}px`,
              }}
            >
              {/* Left (Source / Domain) */}
              <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 2, paddingRight: 12 }}>
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 21,
                    color: C.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.left}
                </div>
                {entry.sub ? (
                  <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 16, color: C.mute }}>
                    {entry.sub}
                  </div>
                ) : null}
              </div>

              {/* Animated Arrow */}
              <div style={{ width: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon
                  name="arrowRight"
                  size={28}
                  color={look.fg}
                  weight={2.2}
                  draw={prog(frame, entry.at + 2, 10)}
                />
              </div>

              {/* Right (Translated IP:port / Sinkhole IP) */}
              <div
                style={{
                  flex: 1,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 21,
                  color: isBlocked ? "#C9281E" : st === "active" ? C.accent : C.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.right}
              </div>

              {/* Status Pill */}
              <div style={{ width: 156, display: "flex", justifyContent: "flex-end" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: look.bg,
                    border: `1.5px solid ${look.border}`,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 17,
                    color: look.fg,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon name={look.icon} size={18} color={look.fg} weight={2.5} />
                  <span>{look.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
