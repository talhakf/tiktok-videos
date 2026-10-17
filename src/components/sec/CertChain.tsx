import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type CertNode = {
  tier: string;
  subject: string;
  issuer: string;
  expires: string;
  algo: string;
};

export const DEFAULT_CERTS: CertNode[] = [
  {
    tier: "Root CA",
    subject: "ISRG Root X1",
    issuer: "Self-signed (OS Trust Store)",
    expires: "2035-06-04",
    algo: "RSA-4096 · SHA-256",
  },
  {
    tier: "Intermediate CA",
    subject: "Let's Encrypt R3",
    issuer: "ISRG Root X1",
    expires: "2027-09-15",
    algo: "RSA-2048 · SHA-256",
  },
  {
    tier: "Leaf Certificate",
    subject: "*.example.com",
    issuer: "Let's Encrypt R3",
    expires: "2026-12-30",
    algo: "ECDSA P-256 · TLS 1.3",
  },
];

export const CERT_CHAIN_H = 770;

/**
 * TLS X.509 Certificate Chain of Trust (`Root CA` → `Intermediate CA` → `Leaf Certificate *.example.com`):
 * animates cryptographic signature verification links down the chain and supports an optional
 * `tamperAt` cue showing a self-signed or expired certificate triggering `ERR_CERT_AUTHORITY_INVALID`.
 */
export const CertChain: React.FC<{
  certs?: CertNode[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  verifyAt?: number;
  tamperAt?: number;
  tamperMode?: "self-signed" | "expired";
  errorCode?: string;
  dark?: boolean;
  filename?: string;
}> = ({
  certs = DEFAULT_CERTS,
  x = TX,
  y = TY,
  w = TW,
  h = CERT_CHAIN_H,
  at,
  until,
  verifyAt,
  tamperAt,
  tamperMode = "self-signed",
  errorCode = "ERR_CERT_AUTHORITY_INVALID",
  dark = false,
  filename = "tls-cert-chain.pem",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const vStart = verifyAt ?? at + 10;
  const tamP = tamperAt !== undefined ? prog(frame, tamperAt, 12, easeInOut) : 0;
  const isTampered = tamP > 0.5;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const lineCol = dark ? "rgba(255,255,255,0.09)" : C.line;

  const goodLook = toneColors("good", dark);
  const badLook = toneColors("bad", dark);
  const accentLook = toneColors("accent", dark);

  // Sequential verification progress down the 3-tier chain
  const nodeVerifyP = [
    prog(frame, vStart, 9, easeOut),
    prog(frame, vStart + 12, 9, easeOut),
    prog(frame, vStart + 24, 9, easeOut),
  ];
  const linkVerifyP = [
    prog(frame, vStart + 5, 9, easeInOut),
    prog(frame, vStart + 17, 9, easeInOut),
  ];

  const chainComplete = nodeVerifyP[2] > 0.5;

  const headerPillBg = isTampered
    ? badLook.bg
    : chainComplete
      ? goodLook.bg
      : accentLook.bg;
  const headerPillEdge = isTampered
    ? badLook.edge
    : chainComplete
      ? goodLook.edge
      : accentLook.edge;
  const headerPillFg = isTampered
    ? badLook.fg
    : chainComplete
      ? goodLook.fg
      : accentLook.fg;

  const rightBadge = (
    <div
      style={{
        height: 38,
        padding: "0 14px",
        borderRadius: 10,
        background: headerPillBg,
        border: `1.5px solid ${headerPillEdge}`,
        color: headerPillFg,
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: mono,
        fontWeight: 700,
        fontSize: 18,
      }}
    >
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: 5,
          background: isTampered ? RED : chainComplete ? GREEN : C.accent,
        }}
      />
      {isTampered ? "chain broken" : chainComplete ? "X.509 verified" : "verifying chain..."}
    </div>
  );

  const tierIcons: IconName[] = ["shieldCheck", "key", isTampered ? "unlock" : "lock"];

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon={isTampered ? "warning" : "lock"}
      right={rightBadge}
    >
      <div
        style={{
          height: h - TAB_H,
          padding: "20px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* Certificate Chain Nodes & Cryptographic Signature Links */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {certs.slice(0, 3).map((cert, i) => {
            const nodeIn = prog(frame, at + i * 4, 9, easeOut);
            const vP = nodeVerifyP[i] ?? 0;
            const isLeaf = i === 2;
            const leafTamP = isLeaf ? tamP : 0;

            // Interpolate node border & badge colors: idle -> verified green -> (leaf tampered red)
            const verifiedBg = interpolateColors(leafTamP, [0, 1], [goodLook.bg, badLook.bg]);
            const verifiedEdge = interpolateColors(leafTamP, [0, 1], [goodLook.edge, badLook.edge]);
            const verifiedFg = interpolateColors(leafTamP, [0, 1], [goodLook.fg, badLook.fg]);

            const cardBorder = vP > 0
              ? interpolateColors(vP, [0, 1], [lineCol, verifiedEdge])
              : lineCol;

            const shownIssuer =
              isLeaf && isTampered && tamperMode === "self-signed"
                ? `${cert.subject} (SELF-SIGNED)`
                : cert.issuer;
            const shownExpires =
              isLeaf && isTampered && tamperMode === "expired"
                ? "2023-11-01 (EXPIRED)"
                : cert.expires;

            const linkP = i < 2 ? linkVerifyP[i] : 0;
            const isBrokenLink = i === 1 && isTampered;

            return (
              <div key={`${cert.tier}-${i}`} style={{ display: "flex", flexDirection: "column" }}>
                {/* Certificate Node Box */}
                <div
                  style={{
                    height: 132,
                    borderRadius: 18,
                    background:
                      isLeaf && isTampered
                        ? tint(RED, dark ? 0.1 : 0.05)
                        : dark
                          ? "rgba(255,255,255,0.03)"
                          : "#F7F7FA",
                    border: `2px solid ${cardBorder}`,
                    padding: "14px 20px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    ...materialize(nodeIn),
                  }}
                >
                  {/* Top Row: Tier Icon + Subject CN + Status Badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 13,
                          background:
                            vP > 0.5
                              ? isLeaf && isTampered
                                ? RED
                                : GREEN
                              : dark
                                ? tint(TERM.blue, 0.2)
                                : BLUE_TINT,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          name={tierIcons[i] ?? "lock"}
                          size={25}
                          color={vP > 0.5 ? C.white : dark ? TERM.blue : C.accent}
                          weight={2.2}
                        />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            style={{
                              fontFamily: sans,
                              fontWeight: 700,
                              fontSize: 17,
                              color: mute,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {cert.tier}
                          </span>
                          <span style={{ color: lineCol }}>•</span>
                          <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 17, color: mute }}>
                            {cert.algo}
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: mono,
                            fontWeight: 700,
                            fontSize: 24,
                            color: isLeaf && isTampered ? badLook.fg : fg,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          CN = {cert.subject}
                        </div>
                      </div>
                    </div>

                    {/* Verification Pill */}
                    <div
                      style={{
                        height: 38,
                        padding: "0 14px",
                        borderRadius: 10,
                        background: vP > 0 ? verifiedBg : dark ? "rgba(255,255,255,0.06)" : "#EFEFF4",
                        border: vP > 0 ? `1.5px solid ${verifiedEdge}` : undefined,
                        color: vP > 0 ? verifiedFg : mute,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        name={
                          isLeaf && isTampered
                            ? "cross"
                            : vP > 0.5
                              ? "check"
                              : "clock"
                        }
                        size={18}
                        color={vP > 0 ? verifiedFg : mute}
                        weight={2.4}
                      />
                      {isLeaf && isTampered
                        ? tamperMode === "self-signed"
                          ? "SELF-SIGNED"
                          : "EXPIRED"
                        : i === 0
                          ? "TRUST ANCHOR"
                          : vP > 0.5
                            ? "VERIFIED"
                            : "PENDING"}
                    </div>
                  </div>

                  {/* Bottom Row: Issuer & Validity */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: mono,
                      fontSize: 18,
                      paddingLeft: 60,
                    }}
                  >
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <span style={{ color: mute }}>Issuer: </span>
                      <span
                        style={{
                          color: isLeaf && isTampered && tamperMode === "self-signed" ? badLook.fg : fg,
                          fontWeight: isLeaf && isTampered ? 700 : 500,
                        }}
                      >
                        {shownIssuer}
                      </span>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <span style={{ color: mute }}>Valid until: </span>
                      <span
                        style={{
                          color: isLeaf && isTampered && tamperMode === "expired" ? badLook.fg : fg,
                          fontWeight: 600,
                        }}
                      >
                        {shownExpires}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Signature Link Connector between Tier i and Tier i+1 */}
                {i < 2 ? (
                  <div
                    style={{
                      height: 58,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 41,
                      gap: 18,
                      position: "relative",
                    }}
                  >
                    {/* Vertical Wire */}
                    <div
                      style={{
                        width: 4,
                        height: "100%",
                        background: dark ? "rgba(255,255,255,0.12)" : "#D2D2D7",
                        position: "relative",
                        borderRadius: 2,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: `${Math.round(linkP * 100)}%`,
                          background: isBrokenLink ? RED : GREEN,
                          borderRadius: 2,
                        }}
                      />
                    </div>

                    {/* Signature Verification Pill */}
                    <div
                      style={{
                        height: 38,
                        padding: "0 16px",
                        borderRadius: 19,
                        background: isBrokenLink
                          ? badLook.bg
                          : linkP > 0.3
                            ? goodLook.bg
                            : dark
                              ? "rgba(255,255,255,0.05)"
                              : "#F2F2F7",
                        border: `1.5px solid ${
                          isBrokenLink
                            ? badLook.edge
                            : linkP > 0.3
                              ? goodLook.edge
                              : lineCol
                        }`,
                        color: isBrokenLink ? badLook.fg : linkP > 0.3 ? goodLook.fg : mute,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      <Icon
                        name={isBrokenLink ? "crossCircle" : linkP > 0.3 ? "checkCircle" : "key"}
                        size={20}
                        color={isBrokenLink ? badLook.fg : linkP > 0.3 ? goodLook.fg : mute}
                        weight={2.2}
                      />
                      {isBrokenLink
                        ? "Signature invalid — leaf not signed by Let's Encrypt R3"
                        : i === 0
                          ? "Signed by Root CA private key · signature valid"
                          : "Signed by Intermediate CA private key · signature valid"}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Bottom TLS Handshake / Trust Store Verdict Banner */}
        <div
          style={{
            borderRadius: 18,
            background: isTampered ? badLook.bg : chainComplete ? goodLook.bg : accentLook.bg,
            border: `2px solid ${isTampered ? badLook.edge : chainComplete ? goodLook.edge : accentLook.edge}`,
            padding: "16px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: isTampered ? RED : chainComplete ? GREEN : C.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon
                name={isTampered ? "warning" : chainComplete ? "lock" : "shield"}
                size={24}
                color={C.white}
                weight={2.4}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 22,
                  color: isTampered ? badLook.fg : chainComplete ? goodLook.fg : accentLook.fg,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isTampered
                  ? errorCode
                  : chainComplete
                    ? "TLS 1.3 handshake trusted — chain anchored in Root CA"
                    : "Verifying X.509 certificate chain..."}
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 500,
                  fontSize: 18,
                  color: mute,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isTampered
                  ? "Browser aborted connection: certificate authority is untrusted or self-signed"
                  : "Root CA → Intermediate CA → *.example.com cryptographic signatures match"}
              </div>
            </div>
          </div>

          <div
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 20,
              background: isTampered ? RED : chainComplete ? GREEN : C.accent,
              color: C.white,
              display: "flex",
              alignItems: "center",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {isTampered ? "ABORTED" : chainComplete ? "TRUSTED" : "CHECKING"}
          </div>
        </div>
      </div>
    </DevCard>
  );
};
