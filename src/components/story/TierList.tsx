import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER } from "../dev/card";
import { CARD_SHADOW, GREEN, RED } from "../diagram/Node";
import { outP } from "../layouts/Mark";
import { tint } from "../windows/MacWindow";

// S / A / B / C / F tier list board:
// 5 rows with color-coded tier badges on the left, where tool/command chips pop and glide
// into their tier slots on cue.

export type Tier = "S" | "A" | "B" | "C" | "F";

export type TierItem = {
  label: string;
  tier: Tier;
  at: number;
  mono?: boolean;
  icon?: IconName;
};

const TIERS: { tier: Tier; color: string; sub: string }[] = [
  { tier: "S", color: C.accent, sub: "essential" },
  { tier: "A", color: GREEN, sub: "great" },
  { tier: "B", color: AMBER, sub: "solid" },
  { tier: "C", color: "#8E8E93", sub: "situational" },
  { tier: "F", color: RED, sub: "avoid" },
];

export const TierList: React.FC<{
  at?: number;
  until?: number;
  items: TierItem[];
  title?: string;
  x?: number;
  y?: number;
  w?: number;
  rowH?: number;
  gap?: number;
}> = ({ at = 0, until, items, title, x = TX, y = TY, w = TW, rowH = 128, gap = 16 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;

  const boardP = prog(frame, at, 10);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        fontFamily: sans,
        ...materialize(boardP * (1 - out), 0.95, 8),
      }}
    >
      {title ? (
        <div
          style={{
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: "-0.03em",
            color: C.ink,
            marginBottom: 20,
          }}
        >
          {title}
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {TIERS.map(({ tier, color }, rowIdx) => {
          const rowP = prog(frame, at + rowIdx * 2, 10);
          const rowItems = items.filter((it) => it.tier === tier);
          // Highlight the row border subtly when a chip just landed in this tier
          const latestAt = rowItems.reduce((acc, it) => (frame >= it.at ? Math.max(acc, it.at) : acc), -1);
          const pulse = latestAt >= 0 ? 1 - prog(frame, latestAt, 18, easeInOut) : 0;

          return (
            <div
              key={tier}
              style={{
                height: rowH,
                borderRadius: 28,
                background: C.white,
                boxShadow: CARD_SHADOW,
                border: `${1.5 + pulse * 1.5}px solid ${pulse > 0.05 ? tint(color, 0.55) : "rgba(0,0,0,0.07)"}`,
                display: "flex",
                alignItems: "center",
                padding: "0 20px 0 14px",
                gap: 18,
                boxSizing: "border-box",
                ...materialize(rowP, 0.96, 6),
                translate: `0px ${(1 - rowP) * 16}px`,
              }}
            >
              {/* Tier badge */}
              <div
                style={{
                  width: rowH - 28,
                  height: rowH - 28,
                  borderRadius: 20,
                  background: color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.08)`,
                }}
              >
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: 52,
                    letterSpacing: "-0.03em",
                    color: C.white,
                    lineHeight: 1,
                  }}
                >
                  {tier}
                </span>
              </div>

              {/* Tier slot items */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                {rowItems.map((it, idx) => {
                  if (frame < it.at) return null;
                  const ip = prog(frame, it.at, 10);
                  const glide = prog(frame, it.at, 12, easeInOut);
                  return (
                    <div
                      key={`${it.label}-${idx}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 12,
                        height: rowH - 36,
                        padding: "0 24px",
                        borderRadius: 18,
                        background: tint(color, 0.1),
                        border: `2px solid ${tint(color, 0.32)}`,
                        boxSizing: "border-box",
                        flexShrink: 0,
                        ...materialize(ip, 0.95, 6),
                        translate: `${(1 - glide) * 38}px 0px`,
                      }}
                    >
                      {it.icon ? (
                        <Icon
                          name={it.icon}
                          size={32}
                          color={color}
                          weight={2.2}
                          draw={prog(frame, it.at + 2, 10)}
                        />
                      ) : null}
                      <span
                        style={{
                          fontFamily: it.mono ? mono : sans,
                          fontWeight: 700,
                          fontSize: it.mono ? 30 : 32,
                          letterSpacing: it.mono ? "-0.01em" : "-0.02em",
                          color: C.ink,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {it.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
