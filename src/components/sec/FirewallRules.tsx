import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER, DevCard, TAB_H, Tone, toneColors } from "../dev/card";
import { GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type FirewallAction = "ALLOW" | "DENY" | "RATE_LIMIT";

export type FirewallRule = {
  priority: number;
  action: FirewallAction;
  proto: string;
  port: string;
  src: string;
  note?: string;
};

export type FirewallPacket = {
  label: string;
  matchIndex: number;
  at: number;
  stepDur?: number;
};

const PACKET_BAR_H = 88;
const HEAD_H = 54;
const ROW_H = 68;
const PAD_B = 18;

/** Total height of a FirewallRules card so callers can stack elements below it cleanly. */
export const firewallRulesH = (
  ruleCount: number,
  { hasPacket = true, hasTab = true }: { hasPacket?: boolean; hasTab?: boolean } = {},
) => (hasTab ? TAB_H : 0) + (hasPacket ? PACKET_BAR_H : 0) + HEAD_H + ruleCount * ROW_H + PAD_B;

const actionChipLook = (action: FirewallAction, dark = false) => {
  if (action === "ALLOW") return toneColors("good", dark);
  if (action === "DENY") return toneColors("bad", dark);
  return toneColors("warn", dark);
};

/**
 * Firewall / WAF / `ufw` / `iptables` rule evaluation table.
 * Displays ordered rules and tests an incoming packet by stepping down row-by-row
 * until it hits `matchIndex` and flashes green `ALLOWED` or red `DROPPED`.
 */
export const FirewallRules: React.FC<{
  rules: FirewallRule[];
  packet?: FirewallPacket;
  x?: number;
  y?: number;
  w?: number;
  at: number;
  until?: number;
  dark?: boolean;
  filename?: string;
  icon?: IconName;
  right?: React.ReactNode;
}> = ({
  rules,
  packet,
  x = TX,
  y = TY,
  w = TW,
  at,
  until,
  dark = false,
  filename = "ufw-rules.conf",
  icon = "shield",
  right = "inbound filter",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const hasPacket = Boolean(packet);
  const h = firewallRulesH(rules.length, { hasPacket, hasTab: filename !== undefined });
  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const lineCol = dark ? "rgba(255,255,255,0.09)" : C.line;

  // Packet stepping state
  const stepDur = packet?.stepDur ?? 13;
  const matchIdx = packet ? Math.max(0, Math.min(rules.length - 1, packet.matchIndex)) : -1;
  const started = packet ? frame >= packet.at : false;
  const pktIn = packet ? prog(frame, packet.at, 9, easeOut) : 0;

  let activeIdx = 0;
  let bandRow = 0;
  if (packet && started) {
    const rawStep = Math.floor((frame - packet.at) / stepDur);
    activeIdx = Math.max(0, Math.min(matchIdx, rawStep));
    if (activeIdx > 0) {
      const glide = prog(frame, packet.at + activeIdx * stepDur, Math.min(8, stepDur - 2), easeInOut);
      bandRow = activeIdx - 1 + glide;
    }
  }

  const matchAt = packet ? packet.at + matchIdx * stepDur + 5 : Infinity;
  const matched = started && frame >= matchAt;
  const matchP = packet ? prog(frame, matchAt, 10, easeOut) : 0;
  const matchedRule = matchIdx >= 0 ? rules[matchIdx] : undefined;
  const isAllowed = matchedRule?.action === "ALLOW";
  const finalTone: Tone = isAllowed ? "good" : "bad";
  const verdictText = isAllowed ? "ALLOWED" : "DROPPED";

  // Gliding band colors (blue while stepping -> green ALLOWED or red DROPPED at matchAt)
  const stepTone = toneColors("accent", dark);
  const doneTone = toneColors(finalTone, dark);
  const bandBg = interpolateColors(matchP, [0, 1], [stepTone.bg, doneTone.bg]);
  const bandEdge = interpolateColors(matchP, [0, 1], [stepTone.edge, doneTone.edge]);
  const bandFg = interpolateColors(matchP, [0, 1], [stepTone.fg, doneTone.fg]);

  const rowsTop = (hasPacket ? PACKET_BAR_H : 0) + HEAD_H;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon={icon} right={right}>
      {/* Incoming Packet Header Bar */}
      {packet ? (
        <div
          style={{
            height: PACKET_BAR_H,
            padding: "0 28px",
            borderBottom: `1px solid ${lineCol}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: dark ? "rgba(255,255,255,0.03)" : "#FAFAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: matched ? doneTone.bg : tint(C.accent, dark ? 0.2 : 0.11),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon
                name={matched ? (isAllowed ? "shieldCheck" : "crossCircle") : "globe"}
                size={26}
                color={matched ? doneTone.fg : dark ? TERM.blue : C.accent}
                weight={2.1}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 18, color: mute, letterSpacing: "-0.01em" }}>
                Incoming packet
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 23,
                  color: fg,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {packet.label}
              </div>
            </div>
          </div>

          {/* Live Evaluation / Final Verdict Badge */}
          {started ? (
            <div
              style={{
                height: 48,
                padding: "0 20px",
                borderRadius: 24,
                background: bandBg,
                border: `2px solid ${bandEdge}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 22,
                color: bandFg,
                flexShrink: 0,
                ...materialize(pktIn),
              }}
            >
              <Icon
                name={matched ? (isAllowed ? "check" : "cross") : "search"}
                size={22}
                color={bandFg}
                weight={2.4}
              />
              {matched
                ? `${verdictText} · rule #${matchedRule?.priority ?? matchIdx + 1}`
                : `testing #${rules[activeIdx]?.priority ?? activeIdx + 1}`}
            </div>
          ) : (
            <div
              style={{
                height: 42,
                padding: "0 16px",
                borderRadius: 21,
                background: dark ? "rgba(255,255,255,0.06)" : "#EFEFF4",
                display: "flex",
                alignItems: "center",
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 20,
                color: mute,
              }}
            >
              queued
            </div>
          )}
        </div>
      ) : null}

      {/* Column Headers */}
      <div
        style={{
          height: HEAD_H,
          padding: "0 28px",
          borderBottom: `1px solid ${lineCol}`,
          display: "flex",
          alignItems: "center",
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 19,
          color: mute,
        }}
      >
        <div style={{ width: 86 }}>#</div>
        <div style={{ width: 170 }}> Action</div>
        <div style={{ width: 105 }}>Proto</div>
        <div style={{ width: 120 }}>Port</div>
        <div style={{ width: 225 }}>Source</div>
        <div style={{ flex: 1, textAlign: "right" }}>Evaluation</div>
      </div>

      {/* Gliding Active Evaluation Band */}
      {packet && started ? (
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: rowsTop + bandRow * ROW_H + 4,
            height: ROW_H - 8,
            borderRadius: 16,
            background: bandBg,
            borderLeft: `6px solid ${bandEdge}`,
            opacity: pktIn,
            pointerEvents: "none",
          }}
        />
      ) : null}

      {/* Rule Rows */}
      <div style={{ position: "relative" }}>
        {rules.map((rule, i) => {
          const rowIn = prog(frame, at + 4 + i * 3, 9, easeOut);
          const isChecked = started && i < activeIdx;
          const isCurrent = started && i === activeIdx;
          const isMatchRow = matched && i === matchIdx;
          const isSkipped = matched && i > matchIdx;

          const rowOpacity = rowIn * (isSkipped ? lerp(1, 0.35, matchP) : isChecked ? 0.62 : 1);
          const chip = actionChipLook(rule.action, dark);

          return (
            <div
              key={`${rule.priority}-${i}`}
              style={{
                height: ROW_H,
                padding: "0 28px",
                display: "flex",
                alignItems: "center",
                fontFamily: mono,
                fontSize: 23,
                color: fg,
                opacity: rowOpacity,
                borderBottom: i < rules.length - 1 ? `1px solid ${lineCol}` : undefined,
              }}
            >
              {/* Priority */}
              <div style={{ width: 86, fontWeight: 700, color: isCurrent ? bandFg : mute }}>
                {String(rule.priority).padStart(2, "0")}
              </div>

              {/* Action Pill */}
              <div style={{ width: 170, display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    height: 40,
                    padding: "0 14px",
                    borderRadius: 10,
                    background: chip.bg,
                    border: `1.5px solid ${chip.edge}`,
                    color: chip.fg,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      background: rule.action === "ALLOW" ? GREEN : rule.action === "DENY" ? RED : AMBER,
                    }}
                  />
                  {rule.action}
                </div>
              </div>

              {/* Protocol */}
              <div style={{ width: 105, fontWeight: 500, color: fg }}>{rule.proto}</div>

              {/* Port */}
              <div style={{ width: 120, fontWeight: 700, color: dark ? TERM.blue : C.accent }}>{rule.port}</div>

              {/* Source */}
              <div
                style={{
                  width: 225,
                  fontWeight: 500,
                  color: fg,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {rule.src}
              </div>

              {/* Right Column: Note or Step Evaluation Verdict */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                {isMatchRow ? (
                  <div
                    style={{
                      height: 42,
                      padding: "0 16px",
                      borderRadius: 12,
                      background: isAllowed ? GREEN : RED,
                      color: C.white,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontWeight: 700,
                      fontSize: 20,
                      ...materialize(matchP),
                    }}
                  >
                    <Icon name={isAllowed ? "check" : "cross"} size={20} color={C.white} weight={2.6} />
                    {verdictText}
                  </div>
                ) : isCurrent ? (
                  <div
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 20,
                      color: dark ? TERM.blue : C.accent,
                    }}
                  >
                    comparing...
                  </div>
                ) : isChecked ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: mono,
                      fontWeight: 500,
                      fontSize: 19,
                      color: mute,
                    }}
                  >
                    no match
                  </div>
                ) : (
                  <div
                    style={{
                      fontFamily: sans,
                      fontWeight: 500,
                      fontSize: 20,
                      color: mute,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {rule.note ?? ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
