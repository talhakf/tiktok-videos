import { useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { AMBER, Tone, toneColors } from "../dev/card";
import { CARD_SHADOW, GREEN, lerp, presence, RED } from "../diagram/Node";
import { appleSpring, C, easeInOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";

export type SwipeListItem = {
  title: string;
  sub?: string;
  meta?: string;
  icon?: IconName;
  badge?: string;
  tone?: Tone;
};

export type SwipeRowCue = {
  index: number;
  at: number;
  actionLabel?: string;
  tone?: Tone;
  icon?: IconName;
  pressAt?: number;
};

const ROW_H = 112;
const HEADER_H = 74;

const actionFill = (tone: Tone = "bad") =>
  ({
    bad: RED,
    accent: C.accent,
    warn: AMBER,
    good: GREEN,
  })[tone];

/**
 * Mobile swipe-to-action list card: renders a list of items where `swipeRow`
 * smoothly slides row `index` left to reveal a red/blue action button (Delete / Block / Archive).
 */
export const SwipeActionList: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  at?: number;
  until?: number;
  title?: string;
  right?: string;
  items: SwipeListItem[];
  swipeRow?: SwipeRowCue;
  dark?: boolean;
}> = ({ x = TX, y = TY, w = TW, at = 0, until, title, right, items, swipeRow, dark = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vis = presence(frame, at, until, 10, 8);
  if (vis === null) return null;

  const hasHeader = title !== undefined;
  const totalH = (hasHeader ? HEADER_H : 0) + items.length * ROW_H;
  const fg = dark ? TERM.fg : C.ink;
  const subFg = dark ? TERM.dim : C.mute;
  const lineCol = dark ? "rgba(255,255,255,0.1)" : C.line;
  const cardBg = dark ? TERM.bg : C.white;

  const actionW = 228;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: totalH,
        borderRadius: 30,
        background: cardBg,
        border: `1.5px solid ${lineCol}`,
        boxShadow: dark ? SHADOW_WINDOW : CARD_SHADOW,
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {hasHeader ? (
        <div
          style={{
            height: HEADER_H,
            padding: "0 30px",
            background: dark ? TERM.bar : "#F6F6F8",
            borderBottom: `1px solid ${lineCol}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 25, fontWeight: 700, color: fg, letterSpacing: "-0.01em" }}>{title}</span>
          {right ? <span style={{ fontFamily: mono, fontSize: 21, fontWeight: 500, color: subFg }}>{right}</span> : null}
        </div>
      ) : null}

      <div style={{ position: "relative", width: w, height: items.length * ROW_H }}>
        {items.map((item, i) => {
          const isSwiped = swipeRow?.index === i && frame >= swipeRow.at;
          const swipeP = isSwiped ? prog(frame, swipeRow.at, 14, easeInOut) : 0;
          const swipeSpring = isSwiped ? appleSpring(frame - swipeRow.at, fps, { response: 0.42, damping: 0.94 }) : 0;
          const slideX = -lerp(0, actionW, Math.max(swipeP, swipeSpring));

          const actionTone = swipeRow?.tone ?? "bad";
          const actionBg = actionFill(actionTone);
          const actionLabel = swipeRow?.actionLabel ?? (actionTone === "bad" ? "Delete" : actionTone === "accent" ? "Archive" : "Block");
          const actionIcon: IconName =
            swipeRow?.icon ?? (actionLabel.toLowerCase().includes("block") ? "shield" : actionTone === "accent" ? "archive" : "trash");

          const pressP =
            swipeRow?.pressAt !== undefined && frame >= swipeRow.pressAt
              ? 1 - 0.06 * Math.sin(prog(frame, swipeRow.pressAt, 10) * Math.PI)
              : 1;

          const tc = toneColors(item.tone ?? "accent", dark);

          return (
            <div
              key={`${item.title}-${i}`}
              style={{
                position: "relative",
                width: w,
                height: ROW_H,
                overflow: "hidden",
                borderTop: i > 0 ? `1px solid ${lineCol}` : undefined,
              }}
            >
              {/* Revealed right-side action tray */}
              {isSwiped ? (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    width: actionW,
                    height: ROW_H,
                    background: actionBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    color: C.white,
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    scale: String(pressP),
                  }}
                >
                  <Icon name={actionIcon} size={30} color={C.white} weight={2.2} draw={prog(frame, swipeRow.at + 3, 10)} />
                  <span>{actionLabel}</span>
                </div>
              ) : null}

              {/* Sliding foreground row */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: cardBg,
                  padding: "0 30px",
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  translate: `${slideX}px 0px`,
                  boxShadow: swipeP > 0.05 ? "8px 0 24px rgba(0,0,0,0.08)" : undefined,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: tc.bg,
                    border: `1.5px solid ${tc.edge}`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={item.icon ?? "file"} size={34} color={tc.fg} weight={2} />
                </div>

                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        fontSize: 27,
                        fontWeight: 600,
                        letterSpacing: "-0.015em",
                        color: fg,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </span>
                    {item.badge ? (
                      <span
                        style={{
                          height: 28,
                          padding: "0 10px",
                          borderRadius: 8,
                          background: tc.bg,
                          color: tc.fg,
                          fontFamily: mono,
                          fontSize: 19,
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  {item.sub ? (
                    <div
                      style={{
                        fontSize: 23,
                        fontWeight: 500,
                        color: subFg,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.sub}
                    </div>
                  ) : null}
                </div>

                {item.meta ? (
                  <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 500, color: subFg, flexShrink: 0 }}>
                    {item.meta}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
