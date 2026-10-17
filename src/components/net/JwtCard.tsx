import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { DevCard, TAB_H } from "../dev/card";
import { GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

const DEFAULT_TOKEN: [string, string, string] = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "eyJzdWIiOiJzdWRvIiwicm9sZSI6ImJhbmRpdCJ9",
  "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
];

const COL_HEADER = "#E5484D";
const COL_PAYLOAD = "#8E4EC6";
const COL_SIG = "#248A3D";

/**
 * Visual JWT token splitter, decoder & signature verifier.
 * Displays the 3 color-coded base64url segments (Header, Payload, Signature),
 * decodes them at `decodeAt`, and optionally tampers with the payload at `tamper.at`
 * to flip verification from green "Signature verified · 200 OK" to red "Signature mismatch · 401 Unauthorized".
 */
export const JwtCard: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  token?: [string, string, string];
  headerJson: string;
  payloadJson: string;
  signatureLabel?: string;
  decodeAt?: number;
  tamper?: { at: number; payloadJson: string; note?: string };
}> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  token = DEFAULT_TOKEN,
  headerJson,
  payloadJson,
  signatureLabel = "HMACSHA256(header + payload, secret)",
  decodeAt,
  tamper,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const decStart = decodeAt ?? at + 10;
  const pHeader = prog(frame, decStart, 9, easeOut);
  const pPayload = prog(frame, decStart + 5, 9, easeOut);
  const pSig = prog(frame, decStart + 10, 9, easeOut);
  const pBanner = prog(frame, decStart + 14, 10, easeOut);

  const isTampered = tamper !== undefined && frame >= tamper.at;
  const tamperP = tamper !== undefined ? prog(frame, tamper.at, 10, easeInOut) : 0;
  const activePayload = tamper && tamperP >= 0.45 ? tamper.payloadJson : payloadJson;
  const payloadPulse = tamper !== undefined && frame >= tamper.at ? Math.sin(Math.PI * prog(frame, tamper.at, 12)) * 0.025 : 0;

  const bannerBg = interpolateColors(tamperP, [0, 1], [tint(GREEN, 0.14), tint(RED, 0.12)]);
  const bannerBorder = interpolateColors(tamperP, [0, 1], [tint(GREEN, 0.4), RED]);
  const bannerFg = interpolateColors(tamperP, [0, 1], ["#248A3D", "#C9281E"]);

  const bodyH = 540;
  const totalH = TAB_H + bodyH;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={totalH}
      p={vis}
      filename="Authorization: Bearer <jwt>"
      icon="key"
      right={isTampered ? "tampered" : "HS256 · JWT"}
    >
      <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Encoded Base64url Token Box */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 16,
            background: "#F5F5F7",
            border: `1.5px solid ${C.line}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 19,
            lineHeight: 1.45,
            wordBreak: "break-all",
          }}
        >
          <span style={{ color: COL_HEADER }}>{token[0]}</span>
          <span style={{ color: C.ink, padding: "0 2px" }}>.</span>
          <span
            style={{
              color: isTampered ? "#C9281E" : COL_PAYLOAD,
              background: isTampered ? tint(RED, 0.14) : undefined,
              borderRadius: 6,
              padding: isTampered ? "1px 4px" : 0,
            }}
          >
            {token[1]}
          </span>
          <span style={{ color: C.ink, padding: "0 2px" }}>.</span>
          <span style={{ color: COL_SIG }}>{token[2]}</span>
        </div>

        {/* 3 Decoded Segments */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* 1. Header Card */}
          <div
            style={{
              padding: "14px 20px",
              borderRadius: 16,
              background: "rgba(229,72,77,0.08)",
              border: `1.5px solid rgba(229,72,77,0.32)`,
              borderLeft: `6px solid ${COL_HEADER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 18,
              ...materialize(pHeader),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "rgba(229,72,77,0.15)",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 16,
                  color: COL_HEADER,
                }}
              >
                HEADER
              </span>
              <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 18, color: C.mute }}>algorithm & type</span>
            </div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                color: COL_HEADER,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {headerJson}
            </div>
          </div>

          {/* 2. Payload Card */}
          <div
            style={{
              padding: "14px 20px",
              borderRadius: 16,
              background: isTampered ? "rgba(255,59,48,0.09)" : "rgba(142,78,198,0.08)",
              border: `1.5px solid ${isTampered ? tint(RED, 0.45) : "rgba(142,78,198,0.32)"}`,
              borderLeft: `6px solid ${isTampered ? RED : COL_PAYLOAD}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 18,
              ...materialize(pPayload),
              scale: String(Number(materialize(pPayload).scale ?? 1) * (1 + payloadPulse)),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: isTampered ? tint(RED, 0.16) : "rgba(142,78,198,0.16)",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 16,
                  color: isTampered ? "#C9281E" : COL_PAYLOAD,
                }}
              >
                PAYLOAD
              </span>
              <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 18, color: isTampered ? "#C9281E" : C.mute }}>
                {isTampered ? (tamper?.note ?? "edited in DevTools!") : "claims & user data"}
              </span>
            </div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                color: isTampered ? "#C9281E" : COL_PAYLOAD,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activePayload}
            </div>
          </div>

          {/* 3. Signature Card */}
          <div
            style={{
              padding: "14px 20px",
              borderRadius: 16,
              background: "rgba(36,138,61,0.08)",
              border: `1.5px solid rgba(36,138,61,0.32)`,
              borderLeft: `6px solid ${COL_SIG}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 18,
              ...materialize(pSig),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "rgba(36,138,61,0.15)",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 16,
                  color: COL_SIG,
                }}
              >
                SIGNATURE
              </span>
              <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 18, color: C.mute }}>server secret HMAC</span>
            </div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 19,
                color: COL_SIG,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {signatureLabel}
            </div>
          </div>
        </div>

        {/* Bottom Verification Banner */}
        {pBanner > 0 ? (
          <div
            style={{
              height: 68,
              padding: "0 22px",
              borderRadius: 16,
              background: bannerBg,
              border: `2px solid ${bannerBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              ...materialize(pBanner),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Icon
                name={isTampered ? "crossCircle" : "shieldCheck"}
                size={30}
                color={bannerFg}
                weight={2.2}
                draw={isTampered ? prog(frame, tamper!.at + 1, 10) : prog(frame, decStart + 15, 10)}
              />
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, letterSpacing: "-0.01em", color: bannerFg }}>
                {isTampered ? "Signature mismatch · 401 Unauthorized" : "Signature verified · 200 OK"}
              </span>
            </div>
            <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 17, color: bannerFg }}>
              {isTampered ? "hash(payload) !== sig" : "HMAC matches"}
            </span>
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
