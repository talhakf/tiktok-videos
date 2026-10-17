import { useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { appleSpring, C, materialize, mono, prog, sans } from "../../theme";
import { Tone, toneColors } from "../dev/card";
import { CARD_SHADOW, lerp, presence } from "../diagram/Node";

export type PushNotificationItem = {
  app: string;
  time: string;
  title: string;
  body: string;
  icon?: IconName;
  tone?: Tone;
  at: number;
  until?: number;
};

const CARD_H = 148;

/**
 * iOS / macOS stacked push notification banners that spring down from the top
 * and stack cleanly with subtle depth.
 */
export const PushNotificationStack: React.FC<{
  items: PushNotificationItem[];
  x?: number;
  y?: number;
  w?: number;
  gap?: number;
  at?: number;
  until?: number;
}> = ({ items, x = TX, y = TY, w = TW, gap = 16, at = 0, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const groupVis = presence(frame, at, until);
  if (groupVis === null) return null;

  const states = items.map((item) => {
    const enterP = prog(frame, item.at, 10);
    const s = frame < item.at ? 0 : appleSpring(frame - item.at, fps, { response: 0.44, damping: 0.92 });
    const out = item.until !== undefined ? prog(frame, item.until, 8) : 0;
    const vis = enterP * (1 - out);
    return { enterP, s, out, vis };
  });

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, ...materialize(groupVis) }}>
      {items.map((item, i) => {
        const st = states[i];
        if (frame < item.at || st.out >= 1) return null;

        // Count how many newer notifications have arrived after this one
        let offset = 0;
        let depth = 0;
        items.forEach((other, j) => {
          if (j === i || other.at <= item.at || frame < other.at) return;
          const activeWeight = states[j].s * (1 - states[j].out);
          offset += (CARD_H + gap) * activeWeight;
          depth += activeWeight;
        });

        const tc = toneColors(item.tone ?? "accent");
        const dropY = lerp(-56, 0, st.s) + offset;
        const depthScale = Math.max(0.94, 1 - depth * 0.016);
        const iconDraw = prog(frame, item.at + 2, 12);

        return (
          <div
            key={`${item.app}-${item.title}-${item.at}`}
            style={{
              position: "absolute",
              left: 0,
              top: dropY,
              width: w,
              height: CARD_H,
              borderRadius: 30,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px) saturate(180%)",
              border: `1.5px solid ${item.tone === "bad" || item.tone === "warn" ? tc.edge : C.line}`,
              boxShadow: CARD_SHADOW,
              padding: "22px 28px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              gap: 22,
              fontFamily: sans,
              transformOrigin: "50% 0%",
              zIndex: 100 - Math.round(depth * 10),
              ...materialize(st.vis),
              scale: String((0.95 + 0.05 * st.vis) * depthScale),
            }}
          >
            {/* App squircle icon */}
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                background: tc.bg,
                border: `1.5px solid ${tc.edge}`,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={item.icon ?? "bell"} size={40} color={tc.fg} weight={2} draw={iconDraw} />
            </div>

            {/* Notification content */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 600, color: C.mute, letterSpacing: "-0.01em" }}>
                    {item.app}
                  </span>
                  {item.tone && item.tone !== "accent" ? (
                    <span
                      style={{
                        height: 26,
                        padding: "0 10px",
                        borderRadius: 8,
                        background: tc.bg,
                        color: tc.fg,
                        fontFamily: mono,
                        fontSize: 18,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {item.tone === "bad" ? "alert" : item.tone === "warn" ? "warning" : "verified"}
                    </span>
                  ) : null}
                </div>
                <span style={{ fontFamily: mono, fontSize: 21, fontWeight: 500, color: C.mute }}>{item.time}</span>
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: C.ink,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: C.mute,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.25,
                }}
              >
                {item.body}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
