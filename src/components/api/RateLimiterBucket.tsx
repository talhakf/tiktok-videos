import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type BucketRequestSpec = {
  id: string;
  path: string;
  atOffset: number;
  allowed: boolean;
  tokensAfter: number;
};

const DEFAULT_REQUESTS: BucketRequestSpec[] = [
  { id: "req #1", path: "POST /v1/charge", atOffset: 8, allowed: true, tokensAfter: 3 },
  { id: "req #2", path: "POST /v1/charge", atOffset: 18, allowed: true, tokensAfter: 2 },
  { id: "req #3", path: "GET /v1/balance", atOffset: 28, allowed: true, tokensAfter: 1 },
  { id: "req #4", path: "POST /v1/refund", atOffset: 38, allowed: true, tokensAfter: 0 },
  { id: "req #5", path: "POST /v1/charge (burst)", atOffset: 50, allowed: false, tokensAfter: 0 },
  { id: "req #6", path: "POST /v1/charge (burst)", atOffset: 62, allowed: false, tokensAfter: 0 },
];

/**
 * Token Bucket API Rate Limiter visualizer:
 * Renders a visual bucket holding `capacity: number` token pucks, refilling at `refillRate`,
 * draining tokens as incoming requests arrive (`200 OK` in green), and rejecting burst requests
 * when empty (`429 Too Many Requests` in red).
 */
export const RateLimiterBucket: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  capacity?: number;
  refillRate?: string;
  requests?: BucketRequestSpec[];
  refillAtOffset?: number;
}> = ({
  x = TX,
  y,
  w = TW,
  h = 840,
  at,
  until,
  capacity = 4,
  refillRate = "+1 token / sec",
  requests = DEFAULT_REQUESTS,
  refillAtOffset = 82,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const goodTone = toneColors("good");
  const badTone = toneColors("bad");
  const warnTone = toneColors("warn");

  // Compute current token count based on elapsed requests and optional refill tick
  let currentTokens = capacity;
  let isthrottled = false;
  for (const r of requests) {
    if (frame >= at + r.atOffset) {
      currentTokens = r.tokensAfter;
      if (!r.allowed) isthrottled = true;
    }
  }
  const refilled = frame >= at + refillAtOffset;
  if (refilled) {
    currentTokens = Math.min(capacity, currentTokens + 1);
    isthrottled = false;
  }

  const refillDropP = prog(frame, at + refillAtOffset - 8, 10, easeInOut);

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
              background: isthrottled ? badTone.bg : BLUE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={isthrottled ? "shield" : "filter"}
              size={22}
              color={isthrottled ? badTone.fg : C.accent}
              weight={2.1}
            />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
            Token bucket rate limiter
          </div>
        </div>

        {/* Status Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            background: isthrottled ? badTone.bg : goodTone.bg,
            border: `1.5px solid ${isthrottled ? RED : GREEN}`,
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 700,
            color: isthrottled ? badTone.fg : goodTone.fg,
          }}
        >
          <Icon
            name={isthrottled ? "crossCircle" : "checkCircle"}
            size={19}
            color={isthrottled ? badTone.fg : goodTone.fg}
            weight={2.3}
          />
          {isthrottled ? "429 Too Many Requests" : `Bucket: ${currentTokens}/${capacity} tokens`}
        </div>
      </div>

      {/* Main Two-Column Stage */}
      <div
        style={{
          padding: "24px 28px",
          display: "grid",
          gridTemplateColumns: "330px 1fr",
          gap: 24,
          height: h - 74,
          boxSizing: "border-box",
        }}
      >
        {/* LEFT COLUMN: Visual Token Bucket */}
        <div
          style={{
            borderRadius: 24,
            background: "#FAFAFC",
            border: `2px solid ${isthrottled ? RED : C.line}`,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Refill Nozzle Banner */}
          <div
            style={{
              borderRadius: 14,
              background: BLUE_TINT,
              border: `1.5px solid ${tint(C.accent, 0.35)}`,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="clock" size={18} color={C.accent} weight={2.2} />
              <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: C.accent }}>
                Refill rate
              </span>
            </div>
            <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: C.ink }}>
              {refillRate}
            </span>
          </div>

          {/* Animated Refill Drop + U-Shaped Bucket */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div
              style={{
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontSize: 14,
                fontWeight: 700,
                color: refilled ? goodTone.fg : C.mute,
              }}
            >
              {refillDropP > 0 && refillDropP < 1
                ? "↓ dropping +1 token..."
                : refilled
                  ? "✓ +1 token refilled!"
                  : "steady drip into bucket"}
            </div>

            {/* Visual Bucket Shell */}
            <div
              style={{
                width: "100%",
                padding: "18px 18px",
                borderRadius: "14px 14px 28px 28px",
                background: isthrottled ? "#FFF5F5" : C.white,
                borderLeft: `5px solid ${isthrottled ? RED : C.accent}`,
                borderRight: `5px solid ${isthrottled ? RED : C.accent}`,
                borderBottom: `7px solid ${isthrottled ? RED : C.accent}`,
                borderTop: `2px dashed ${C.line}`,
                boxShadow: CARD_SHADOW,
                display: "flex",
                flexDirection: "column-reverse",
                gap: 10,
              }}
            >
              {Array.from({ length: capacity }, (_, slotIdx) => {
                const hasToken = slotIdx < currentTokens;
                return (
                  <div
                    key={slotIdx}
                    style={{
                      height: 58,
                      borderRadius: 16,
                      background: hasToken
                        ? interpolateColors(
                            slotIdx / Math.max(1, capacity - 1),
                            [0, 1],
                            ["#0071E3", "#248A3D"],
                          )
                        : "#F2F2F4",
                      border: hasToken
                        ? "2px solid rgba(255,255,255,0.35)"
                        : `2px dashed rgba(0,0,0,0.16)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 18px",
                      color: hasToken ? C.white : C.mute,
                      fontFamily: mono,
                      fontSize: 17,
                      fontWeight: 700,
                      boxShadow: hasToken ? "0 6px 14px rgba(0,113,227,0.2)" : undefined,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 999,
                          background: hasToken ? C.white : "rgba(0,0,0,0.18)",
                        }}
                      />
                      <span>TOKEN #{slotIdx + 1}</span>
                    </div>
                    <span style={{ fontSize: 14, opacity: 0.9 }}>
                      {hasToken ? "READY" : "DRAINED"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HTTP Rate-Limit Response Headers Box */}
          <div
            style={{
              borderRadius: 16,
              background: C.white,
              border: `1.5px solid ${C.line}`,
              padding: "12px 16px",
              fontFamily: mono,
              fontSize: 14.5,
              lineHeight: 1.55,
              color: C.ink,
            }}
          >
            <div style={{ color: C.mute, fontSize: 13 }}>HTTP response headers</div>
            <div>
              X-RateLimit-Limit: <span style={{ fontWeight: 700 }}>{capacity}</span>
            </div>
            <div>
              X-RateLimit-Remaining:{" "}
              <span
                style={{
                  fontWeight: 700,
                  color: currentTokens === 0 ? badTone.fg : goodTone.fg,
                }}
              >
                {currentTokens}
              </span>
            </div>
            {isthrottled ? (
              <div style={{ color: badTone.fg, fontWeight: 700 }}>Retry-After: 1s</div>
            ) : (
              <div style={{ color: goodTone.fg, fontWeight: 700 }}>Status: 200 OK</div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Incoming API Requests Stream */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>
              Incoming request burst
            </span>
            <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 600, color: C.mute }}>
              1 request = 1 token
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {requests.map((req) => {
              const reqP = prog(frame, at + req.atOffset, 9, easeOut);
              const tone = req.allowed ? goodTone : badTone;
              const edge = req.allowed ? GREEN : RED;
              return (
                <div
                  key={req.id}
                  style={{
                    height: 82,
                    borderRadius: 18,
                    background: req.allowed ? C.white : badTone.bg,
                    border: `2px solid ${req.allowed ? tint(GREEN, 0.45) : RED}`,
                    borderLeft: `7px solid ${edge}`,
                    padding: "0 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                    ...materialize(reqP),
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: req.allowed ? BLUE_TINT : C.white,
                          fontFamily: mono,
                          fontSize: 14,
                          fontWeight: 700,
                          color: req.allowed ? C.accent : badTone.fg,
                        }}
                      >
                        {req.id}
                      </span>
                      <span style={{ fontFamily: mono, fontSize: 17, fontWeight: 700, color: C.ink }}>
                        {req.path}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 14,
                        color: req.allowed ? C.mute : badTone.fg,
                        fontWeight: req.allowed ? 500 : 700,
                      }}
                    >
                      {req.allowed
                        ? `consumed 1 token → ${req.tokensAfter}/${capacity} left`
                        : "bucket empty (0/4) → rejected immediately"}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "7px 14px",
                      borderRadius: 999,
                      background: req.allowed ? goodTone.bg : C.white,
                      border: `1.5px solid ${edge}`,
                      fontFamily: mono,
                      fontSize: 15.5,
                      fontWeight: 700,
                      color: tone.fg,
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      name={req.allowed ? "check" : "cross"}
                      size={17}
                      color={tone.fg}
                      weight={2.5}
                    />
                    {req.allowed ? "200 OK" : "429 Too Many Requests"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Footer Note */}
          <div
            style={{
              borderRadius: 14,
              background: warnTone.bg,
              border: `1.5px solid ${tint(AMBER, 0.4)}`,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: mono,
              fontSize: 15,
              fontWeight: 700,
              color: warnTone.fg,
            }}
          >
            <span>Burst capacity = {capacity} requests</span>
            <span>Sustained rate = {refillRate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
