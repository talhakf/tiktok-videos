import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type OriginCheck = {
  expected: string;
  actual: string;
  at: number;
  ok: boolean;
};

/**
 * Public / Private keypair & Passkey / E2EE visualizer.
 * Supports `"encrypt"` mode (public key encrypts plaintext -> ciphertext, private key decrypts)
 * and `"sign"` mode (private key signs challenge -> signature, public key verifies, with optional `originCheck`).
 */
export const CryptoBox: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  mode?: "encrypt" | "sign";
  publicLabel?: string;
  privateLabel?: string;
  input: string;
  transformed: string;
  actionAt: number;
  verifyAt?: number;
  originCheck?: OriginCheck;
}> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  mode = "encrypt",
  publicLabel = "Public key (on server)",
  privateLabel = "Private key (never leaves laptop)",
  input,
  transformed,
  actionAt,
  verifyAt,
  originCheck,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const actP = prog(frame, actionAt, 12, easeInOut);
  const verP = verifyAt !== undefined ? prog(frame, verifyAt, 10, easeOut) : 0;
  const origP = originCheck !== undefined ? prog(frame, originCheck.at, 10, easeOut) : 0;
  const originFailed = Boolean(originCheck && !originCheck.ok && frame >= originCheck.at);

  // Determine active states for Private and Public key cards
  const privActive = mode === "sign" ? actP > 0 && !originFailed : verP > 0;
  const pubActive = mode === "encrypt" ? actP > 0 : verP > 0;

  const hasBottomBanner = verifyAt !== undefined || originCheck !== undefined;
  const bodyH = hasBottomBanner ? 386 : 306;
  const totalH = TAB_H + bodyH;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={totalH}
      p={vis}
      filename={mode === "encrypt" ? "Asymmetric encryption · E2EE" : "Asymmetric signature · Passkey"}
      icon={mode === "encrypt" ? "lock" : "fingerprint"}
      right={mode === "encrypt" ? "X25519 / RSA" : "Ed25519 / WebAuthn"}
    >
      <div style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Row 1: Keypair Cards */}
        <div style={{ display: "flex", gap: 18 }}>
          {/* Private Key Card */}
          <div
            style={{
              flex: 1,
              padding: "14px 18px",
              borderRadius: 18,
              background: originFailed ? "#FFF1F0" : privActive ? "#EEFAF1" : "#F5F5F7",
              border: `2px solid ${originFailed ? RED : privActive ? GREEN : C.line}`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              ...materialize(prog(frame, at + 2, 9)),
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: originFailed ? tint(RED, 0.14) : privActive ? tint(GREEN, 0.18) : C.white,
                border: `1px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="key" size={28} color={originFailed ? "#C9281E" : privActive ? "#248A3D" : C.ink} weight={2.1} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 15, color: "#248A3D" }}>PRIVATE</span>
                <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 15, color: C.mute }}>· secret</span>
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 19,
                  color: C.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {privateLabel}
              </div>
            </div>
          </div>

          {/* Public Key Card */}
          <div
            style={{
              flex: 1,
              padding: "14px 18px",
              borderRadius: 18,
              background: pubActive ? BLUE_TINT : "#F5F5F7",
              border: `2px solid ${pubActive ? C.accent : C.line}`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              ...materialize(prog(frame, at + 5, 9)),
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: pubActive ? tint(C.accent, 0.15) : C.white,
                border: `1px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="globe" size={28} color={pubActive ? C.accent : C.ink} weight={2.1} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 15, color: C.accent }}>PUBLIC</span>
                <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 15, color: C.mute }}>· shared</span>
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 19,
                  color: C.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {publicLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Input -> Crypto Transform -> Output */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, height: 108 }}>
          {/* Input Box */}
          <div
            style={{
              flex: 1,
              height: "100%",
              padding: "14px 18px",
              borderRadius: 16,
              background: "#FAFAFC",
              border: `1.5px solid ${C.line}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
              minWidth: 0,
              ...materialize(prog(frame, at + 7, 9)),
            }}
          >
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 16, color: C.mute }}>
              {mode === "encrypt" ? "Plaintext input" : "Server challenge"}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 21,
                color: C.ink,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {input}
            </div>
          </div>

          {/* Center Transform Gate */}
          <div
            style={{
              width: 170,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 999,
                background: originFailed ? "#FFF1F0" : actP > 0 ? BLUE_TINT : "#F2F2F4",
                border: `1.5px solid ${originFailed ? RED : actP > 0 ? C.accent : C.line}`,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 16,
                color: originFailed ? "#C9281E" : actP > 0 ? C.accent : C.mute,
                whiteSpace: "nowrap",
              }}
            >
              <Icon
                name={originFailed ? "cross" : mode === "encrypt" ? "lock" : "fingerprint"}
                size={19}
                color={originFailed ? "#C9281E" : actP > 0 ? C.accent : C.mute}
                weight={2.3}
              />
              <span>{originFailed ? "blocked" : mode === "encrypt" ? "encrypt()" : "sign()"}</span>
            </div>
            <Icon
              name="arrowRight"
              size={28}
              color={originFailed ? "#C9281E" : actP > 0 ? C.accent : C.mute}
              weight={2.2}
              draw={actP > 0 ? actP : 0.35}
            />
          </div>

          {/* Transformed Output Box */}
          <div
            style={{
              flex: 1,
              height: "100%",
              padding: "14px 18px",
              borderRadius: 16,
              background: originFailed ? "#FFF1F0" : actP > 0 ? "#F5F5F7" : "#FAFAFC",
              border: `1.5px solid ${originFailed ? RED : actP > 0 ? C.accent : C.line}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
              minWidth: 0,
              opacity: actP > 0 ? Math.max(0.35, actP) : 0.4,
            }}
          >
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 16, color: originFailed ? "#C9281E" : C.mute }}>
              {originFailed ? "Signature aborted" : mode === "encrypt" ? "Ciphertext on wire" : "Cryptographic signature"}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                color: originFailed ? "#C9281E" : actP > 0 ? C.accent : C.mute,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {originFailed ? "ERR_ORIGIN_MISMATCH" : actP > 0.2 ? transformed : "••••••••••••"}
            </div>
          </div>
        </div>

        {/* Row 3: Origin Check OR Verification Banner */}
        {originCheck && origP > 0 ? (
          <div
            style={{
              height: 64,
              padding: "0 20px",
              borderRadius: 16,
              background: originCheck.ok ? tint(GREEN, 0.14) : tint(RED, 0.12),
              border: `2px solid ${originCheck.ok ? tint(GREEN, 0.4) : RED}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              ...materialize(origP),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Icon
                name={originCheck.ok ? "shieldCheck" : "warning"}
                size={28}
                color={originCheck.ok ? "#248A3D" : "#C9281E"}
                weight={2.3}
              />
              <span
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 20,
                  color: originCheck.ok ? "#248A3D" : "#C9281E",
                }}
              >
                {originCheck.ok ? "Origin bound · Passkey signs" : "Phishing blocked · Origin mismatch"}
              </span>
            </div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 18,
                color: originCheck.ok ? "#248A3D" : "#C9281E",
              }}
            >
              {originCheck.actual} {originCheck.ok ? "===" : "!=="} {originCheck.expected}
            </div>
          </div>
        ) : verifyAt !== undefined && verP > 0 ? (
          <div
            style={{
              height: 64,
              padding: "0 20px",
              borderRadius: 16,
              background: tint(GREEN, 0.14),
              border: `2px solid ${tint(GREEN, 0.4)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              ...materialize(verP),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Icon name="shieldCheck" size={28} color="#248A3D" weight={2.3} />
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, color: "#248A3D" }}>
                {mode === "encrypt"
                  ? `Decrypted with private key → ${input}`
                  : "Signature verified with public key · 200 OK"}
              </span>
            </div>
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 17, color: "#248A3D" }}>
              {mode === "encrypt" ? "E2EE verified" : "zero shared secrets"}
            </span>
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
