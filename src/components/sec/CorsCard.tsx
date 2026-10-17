import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export const CORS_CARD_H = 680;

/**
 * Browser CORS (Cross-Origin Resource Sharing) & Preflight `OPTIONS` visualizer:
 * shows Origin `https://app.dev` calling `https://api.bank.com`, animating the browser
 * blocking the response in red (`No Access-Control-Allow-Origin`) until `allowAt`
 * adds the matching CORS header (`Access-Control-Allow-Origin: https://app.dev`) in green.
 */
export const CorsCard: React.FC<{
  origin?: string;
  target?: string;
  method?: string;
  path?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  blockAt?: number;
  allowAt?: number;
  dark?: boolean;
  filename?: string;
}> = ({
  origin = "https://app.dev",
  target = "https://api.bank.com",
  method = "POST",
  path = "/v1/transfer",
  x = TX,
  y = TY,
  w = TW,
  h = CORS_CARD_H,
  at,
  until,
  blockAt,
  allowAt,
  dark = false,
  filename = "cors-preflight.http",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const blkStart = blockAt ?? at + 16;
  const blkIn = prog(frame, blkStart, 10, easeOut);
  const allowP = allowAt !== undefined ? prog(frame, allowAt, 14, easeInOut) : 0;
  const isAllowed = allowP > 0.5;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const lineCol = dark ? "rgba(255,255,255,0.09)" : C.line;

  const badLook = toneColors("bad", dark);
  const goodLook = toneColors("good", dark);
  const accentLook = toneColors("accent", dark);

  const mixBg = interpolateColors(allowP, [0, 1], [badLook.bg, goodLook.bg]);
  const mixEdge = interpolateColors(allowP, [0, 1], [badLook.edge, goodLook.edge]);
  const mixFg = interpolateColors(allowP, [0, 1], [badLook.fg, goodLook.fg]);

  // Request / response dot progress across the bridge
  const reqSend = prog(frame, at + 4, 12, easeInOut);
  const resReturn = prog(frame, blkStart - 8, 10, easeInOut);

  const rightStatus = (
    <div
      style={{
        height: 38,
        padding: "0 14px",
        borderRadius: 10,
        background: frame >= blkStart ? mixBg : accentLook.bg,
        border: `1.5px solid ${frame >= blkStart ? mixEdge : accentLook.edge}`,
        color: frame >= blkStart ? mixFg : accentLook.fg,
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: mono,
        fontWeight: 700,
        fontSize: 19,
      }}
    >
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: 5,
          background: frame < blkStart ? C.accent : isAllowed ? GREEN : RED,
        }}
      />
      {frame < blkStart ? "preflight OPTIONS" : isAllowed ? "CORS allowed" : "CORS blocked"}
    </div>
  );

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="globe"
      right={rightStatus}
    >
      <div
        style={{
          height: h - TAB_H,
          padding: "22px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* 1. Cross-Origin Endpoints & Preflight Wire */}
        <div
          style={{
            height: 138,
            borderRadius: 20,
            background: dark ? "rgba(255,255,255,0.03)" : "#F7F7FA",
            border: `1px solid ${lineCol}`,
            padding: "0 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
          }}
        >
          {/* Origin Box */}
          <div
            style={{
              width: 265,
              height: 102,
              borderRadius: 16,
              background: dark ? TERM.bg : C.white,
              border: `2px solid ${C.accent}`,
              padding: "0 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxSizing: "border-box",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: dark ? tint(TERM.blue, 0.2) : BLUE_TINT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="laptop" size={28} color={dark ? TERM.blue : C.accent} weight={2.1} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 17, color: mute }}>
                Web origin
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 21,
                  color: fg,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {origin.replace("https://", "")}
              </div>
            </div>
          </div>

          {/* Center Wire & CORS Shield Gate */}
          <div
            style={{
              flex: 1,
              height: 102,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 16,
              position: "relative",
            }}
          >
            {/* Top Wire: Request */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 17,
                  color: dark ? TERM.blue : C.accent,
                }}
              >
                <span>OPTIONS + {method} {path}</span>
                <span>→</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: dark ? "rgba(255,255,255,0.12)" : "#D2D2D7", position: "relative" }}>
                <div
                  style={{
                    width: `${Math.round(reqSend * 100)}%`,
                    height: "100%",
                    borderRadius: 2,
                    background: C.accent,
                  }}
                />
              </div>
            </div>

            {/* Bottom Wire: Response + Browser Gate */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ height: 4, borderRadius: 2, background: dark ? "rgba(255,255,255,0.12)" : "#D2D2D7", position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    width: `${Math.round(resReturn * 100)}%`,
                    height: "100%",
                    borderRadius: 2,
                    background: frame >= blkStart ? (isAllowed ? GREEN : RED) : C.accent,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 17,
                  color: frame >= blkStart ? mixFg : mute,
                }}
              >
                <span>{isAllowed ? "← 200 OK (CORS verified)" : "✕ blocked at browser gate"}</span>
                <span>200 OK</span>
              </div>
            </div>
          </div>

          {/* Target API Box */}
          <div
            style={{
              width: 265,
              height: 102,
              borderRadius: 16,
              background: dark ? TERM.bg : C.white,
              border: `2px solid ${frame >= blkStart ? mixEdge : lineCol}`,
              padding: "0 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxSizing: "border-box",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: frame >= blkStart ? mixBg : dark ? "rgba(255,255,255,0.06)" : "#EFEFF4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="server" size={26} color={frame >= blkStart ? mixFg : fg} weight={2.1} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 17, color: mute }}>
                Cross-origin API
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 21,
                  color: fg,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {target.replace("https://", "")}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Request & Response Headers Split View */}
        <div style={{ display: "flex", gap: 18, height: 268 }}>
          {/* Left: Browser Request Headers */}
          <div
            style={{
              flex: 1,
              borderRadius: 18,
              background: dark ? "rgba(255,255,255,0.03)" : "#F7F7FA",
              border: `1px solid ${lineCol}`,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 19, color: fg }}>
                Browser request headers
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 17,
                  color: C.accent,
                  background: dark ? tint(TERM.blue, 0.2) : BLUE_TINT,
                  padding: "3px 10px",
                  borderRadius: 7,
                }}
              >
                OPTIONS {path}
              </span>
            </div>

            <div
              style={{
                fontFamily: mono,
                fontSize: 18,
                lineHeight: 1.65,
                color: fg,
                background: dark ? TERM.bg : C.white,
                border: `1px solid ${lineCol}`,
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div>
                <span style={{ color: mute }}>Host: </span>
                <span>{target.replace("https://", "")}</span>
              </div>
              <div
                style={{
                  background: dark ? tint(TERM.blue, 0.16) : BLUE_TINT,
                  padding: "0 6px",
                  margin: "2px -6px",
                  borderRadius: 6,
                  fontWeight: 700,
                }}
              >
                <span style={{ color: dark ? TERM.blue : C.accent }}>Origin: </span>
                <span style={{ color: dark ? TERM.blue : C.accent }}>{origin}</span>
              </div>
              <div>
                <span style={{ color: mute }}>Access-Control-Request-Method: </span>
                <span style={{ fontWeight: 700 }}>{method}</span>
              </div>
              <div>
                <span style={{ color: mute }}>Access-Control-Request-Headers: </span>
                <span>authorization</span>
              </div>
            </div>
          </div>

          {/* Right: Server Response Headers */}
          <div
            style={{
              flex: 1,
              borderRadius: 18,
              background: dark ? "rgba(255,255,255,0.03)" : "#F7F7FA",
              border: `1.5px solid ${frame >= blkStart ? mixEdge : lineCol}`,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 19, color: fg }}>
                Server response headers
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 17,
                  color: frame >= blkStart ? mixFg : mute,
                  background: frame >= blkStart ? mixBg : "#EFEFF4",
                  padding: "3px 10px",
                  borderRadius: 7,
                }}
              >
                HTTP/1.1 200 OK
              </span>
            </div>

            <div
              style={{
                fontFamily: mono,
                fontSize: 18,
                lineHeight: 1.65,
                color: fg,
                background: dark ? TERM.bg : C.white,
                border: `1px solid ${lineCol}`,
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div>
                <span style={{ color: mute }}>Content-Type: </span>
                <span>application/json</span>
              </div>

              {isAllowed ? (
                <>
                  <div
                    style={{
                      background: goodLook.bg,
                      border: `1px solid ${goodLook.edge}`,
                      padding: "1px 8px",
                      margin: "3px -6px",
                      borderRadius: 7,
                      fontWeight: 700,
                      color: goodLook.fg,
                      ...materialize(allowP),
                    }}
                  >
                    Access-Control-Allow-Origin: {origin}
                  </div>
                  <div style={{ color: goodLook.fg, fontWeight: 600 }}>
                    Access-Control-Allow-Methods: {method}, OPTIONS
                  </div>
                  <div style={{ color: goodLook.fg, fontWeight: 600 }}>
                    Access-Control-Allow-Headers: authorization
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      background: badLook.bg,
                      border: `1.5px dashed ${badLook.edge}`,
                      padding: "2px 8px",
                      margin: "4px -6px",
                      borderRadius: 7,
                      fontWeight: 700,
                      color: badLook.fg,
                    }}
                  >
                    Access-Control-Allow-Origin: (missing)
                  </div>
                  <div style={{ color: mute }}>
                    Server omitted CORS header for {origin}
                  </div>
                  <div style={{ color: mute }}>
                    Same-Origin Policy blocks JS access
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3. Browser Console / CORS Policy Verdict Banner */}
        <div
          style={{
            borderRadius: 18,
            background: mixBg,
            border: `2px solid ${mixEdge}`,
            padding: "16px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            ...materialize(blkIn),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: isAllowed ? GREEN : RED,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={isAllowed ? "check" : "cross"} size={24} color={C.white} weight={2.5} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 22,
                  color: mixFg,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isAllowed
                  ? `Access-Control-Allow-Origin matches ${origin}`
                  : "Blocked by CORS policy: No 'Access-Control-Allow-Origin' header"}
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 500,
                  fontSize: 18,
                  color: mute,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isAllowed
                  ? `Preflight OPTIONS + ${method} ${path} succeeded · response unlocked`
                  : `Origin '${origin}' is not allowed to read ${target}${path}`}
              </div>
            </div>
          </div>

          <div
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 20,
              background: isAllowed ? GREEN : RED,
              color: C.white,
              display: "flex",
              alignItems: "center",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 19,
              flexShrink: 0,
            }}
          >
            {isAllowed ? "200 ALLOWED" : "CORS ERROR"}
          </div>
        </div>
      </div>
    </DevCard>
  );
};
