import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

/**
 * Polling vs Webhook Push comparison card:
 * Top shows noisy repeated polling (`GET /status → 200 pending` × 5 in amber/red),
 * while bottom shows event-driven Webhook (`POST /webhooks/stripe · HMAC verified → 200 OK`)
 * firing once when the event actually happens.
 */
export const WebhookFlow: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  pollAt?: number;
  webhookAt?: number;
  pollPath?: string;
  pollResponse?: string;
  pollCount?: number;
  webhookPath?: string;
  eventName?: string;
}> = ({
  x = TX,
  y,
  w = TW,
  h = 860,
  at,
  until,
  pollAt,
  webhookAt,
  pollPath = "GET /status",
  pollResponse = "200 pending",
  pollCount = 5,
  webhookPath = "POST /webhooks/stripe",
  eventName = "payment_intent.succeeded",
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const badTone = toneColors("bad");
  const warnTone = toneColors("warn");
  const goodTone = toneColors("good");

  const pStart = pollAt ?? at + 6;
  const wStart = webhookAt ?? at + 46;

  const webhookCardP = prog(frame, wStart - 6, 10, easeOut);
  const eventTriggerP = prog(frame, wStart, 8, easeOut);
  const pushFlightP = prog(frame, wStart + 4, 14, easeInOut);
  const hmacVerifiedP = prog(frame, wStart + 16, 10, easeOut);

  const polls = Array.from({ length: pollCount }, (_, i) => {
    const startF = pStart + i * 7;
    const p = prog(frame, startF, 8, easeOut);
    const isRed = i >= 3; // escalates from amber to red noise
    return { index: i + 1, timeLabel: `t=${i + 1}s`, p, isRed };
  });

  const activePollCount = polls.filter((p) => p.p > 0.2).length;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          height: 74,
          padding: "0 30px",
          borderBottom: `1px solid ${C.line}`,
          background: "#FAFAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: hmacVerifiedP > 0.2 ? goodTone.bg : warnTone.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={hmacVerifiedP > 0.2 ? "bell" : "refresh"}
              size={22}
              color={hmacVerifiedP > 0.2 ? goodTone.fg : warnTone.fg}
              weight={2.1}
            />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
            HTTP polling vs Webhook push
          </div>
        </div>

        <div
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: hmacVerifiedP > 0.2 ? goodTone.bg : badTone.bg,
            border: `1.5px solid ${hmacVerifiedP > 0.2 ? GREEN : RED}`,
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 700,
            color: hmacVerifiedP > 0.2 ? goodTone.fg : badTone.fg,
          }}
        >
          {hmacVerifiedP > 0.2 ? "Event-driven · 1 push" : `${activePollCount}/${pollCount} empty polls`}
        </div>
      </div>

      <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* TOP PANE: Noisy Repeated Polling */}
        <div
          style={{
            borderRadius: 22,
            background: "#FAFAFC",
            border: `1.5px solid ${tint(RED, 0.28)}`,
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: warnTone.bg,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: warnTone.fg,
                }}
              >
                POLLING
              </span>
              <span style={{ fontSize: 20, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>
                Are you done yet? (repeated every 1s)
              </span>
            </div>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                background: badTone.bg,
                fontFamily: mono,
                fontSize: 16,
                fontWeight: 700,
                color: badTone.fg,
              }}
            >
              {pollCount}× wasted round-trips
            </span>
          </div>

          {/* 5 Polling Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {polls.map((poll) => {
              const rowTone = poll.isRed ? badTone : warnTone;
              const edgeColor = poll.isRed ? RED : AMBER;
              return (
                <div
                  key={poll.index}
                  style={{
                    height: 50,
                    padding: "0 16px",
                    borderRadius: 13,
                    background: rowTone.bg,
                    border: `1.5px solid ${tint(edgeColor, 0.4)}`,
                    borderLeft: `6px solid ${edgeColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    ...materialize(poll.p),
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 15,
                        fontWeight: 700,
                        color: rowTone.fg,
                        width: 48,
                      }}
                    >
                      {poll.timeLabel}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: C.white,
                        fontFamily: mono,
                        fontSize: 15,
                        fontWeight: 700,
                        color: C.ink,
                      }}
                    >
                      #{poll.index}
                    </span>
                    <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.ink }}>
                      {pollPath} →{" "}
                      <span style={{ color: rowTone.fg }}>{pollResponse}</span>
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon
                      name={poll.isRed ? "warning" : "clock"}
                      size={18}
                      color={rowTone.fg}
                      weight={2.2}
                    />
                    <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: rowTone.fg }}>
                      {poll.isRed ? "wasted CPU + rate limit" : "no change · still waiting"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM PANE: Event-Driven Webhook Push */}
        <div
          style={{
            borderRadius: 22,
            background: "#F5FBF7",
            border: `2px solid ${GREEN}`,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            ...materialize(webhookCardP),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: goodTone.bg,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: goodTone.fg,
                }}
              >
                WEBHOOK PUSH
              </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>
                Don&apos;t call us — we&apos;ll POST to you when it happens
              </span>
            </div>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                background: goodTone.bg,
                border: `1.5px solid ${GREEN}`,
                fontFamily: mono,
                fontSize: 16,
                fontWeight: 700,
                color: goodTone.fg,
              }}
            >
              1 request · 0 wasted polls
            </span>
          </div>

          {/* Visual Push Diagram: Stripe Provider -> Your Webhook Endpoint */}
          <div style={{ display: "grid", gridTemplateColumns: "230px 1fr 230px", alignItems: "center", gap: 14 }}>
            {/* Provider Node */}
            <div
              style={{
                borderRadius: 18,
                background: C.white,
                border: `2px solid ${eventTriggerP > 0 ? C.accent : C.line}`,
                boxShadow: CARD_SHADOW,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="bolt" size={22} color={C.accent} weight={2.2} />
                <span style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>Stripe API</span>
              </div>
              <div
                style={{
                  padding: "4px 8px",
                  borderRadius: 8,
                  background: BLUE_TINT,
                  fontFamily: mono,
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: C.accent,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {eventName}
              </div>
            </div>

            {/* Center Wire + Single Webhook Request Pill */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: C.white,
                  border: `1.5px solid ${GREEN}`,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.ink,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                {webhookPath} · HMAC verified → <span style={{ color: goodTone.fg }}>200 OK</span>
              </div>

              <svg width={320} height={28} style={{ overflow: "visible" }}>
                <line
                  x1={10}
                  y1={14}
                  x2={308}
                  y2={14}
                  stroke={pushFlightP > 0 ? GREEN : WIRE}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                />
                <path
                  d="M298 6 L308 14 L298 22"
                  fill="none"
                  stroke={pushFlightP > 0 ? GREEN : WIRE}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {pushFlightP > 0 && pushFlightP < 1 ? (
                  <circle cx={lerp(14, 304, pushFlightP)} cy={14} r={8.5} fill={GREEN} />
                ) : null}
              </svg>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: goodTone.fg,
                  ...materialize(Math.max(0.2, hmacVerifiedP)),
                }}
              >
                <Icon name="shieldCheck" size={18} color={goodTone.fg} weight={2.2} />
                Stripe-Signature: HMAC-SHA256 verified
              </div>
            </div>

            {/* Receiver Node */}
            <div
              style={{
                borderRadius: 18,
                background: C.white,
                border: `2px solid ${hmacVerifiedP > 0.2 ? GREEN : C.line}`,
                boxShadow: CARD_SHADOW,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="server" size={22} color={hmacVerifiedP > 0.2 ? goodTone.fg : C.ink} weight={2.1} />
                <span style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>Your Server</span>
              </div>
              <div
                style={{
                  padding: "4px 8px",
                  borderRadius: 8,
                  background: hmacVerifiedP > 0.2 ? goodTone.bg : "#F2F2F4",
                  fontFamily: mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: hmacVerifiedP > 0.2 ? goodTone.fg : C.mute,
                }}
              >
                {hmacVerifiedP > 0.2 ? "200 OK · fulfilled" : "listening on :443"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
