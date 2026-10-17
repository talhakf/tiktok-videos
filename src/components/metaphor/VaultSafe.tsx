import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, GLASS, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { alpha, BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type VaultSafeProps = {
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  /** Primary protected item label inside the vault (e.g. "/etc/shadow" or "PROD_DB_KEY"). */
  secretLabel: string;
  /** Secondary detail line (e.g. "-rw------- 1 root wheel" or "AES-256-GCM"). */
  secretSub?: string;
  /** Optional preview snippet inside the protected card. */
  secretValue?: string;
  secretIcon?: IconName;
  /** Owner badge text (e.g. "root (uid 0)"). */
  ownerLabel: string;
  /** Optional chmod / policy pill (e.g. "chmod 0600"). */
  modeLabel?: string;
  /** Whether the vault starts in the locked state before any cues fire. */
  initialLocked?: boolean;
  /** Frame at which the vault wheel rotates and locks the shackle. */
  lockAt?: number;
  /** Frame at which the vault unlocks and reveals the protected item. */
  unlockAt?: number;
  /** Frame at which an unauthorized access attempt triggers a red shake + "Permission denied" ring. */
  denyAt?: number;
  /** Custom message for the deny alert (defaults to "Permission denied"). */
  denyLabel?: string;
  /** Optional actor command shown during the deny attempt (e.g. "cat /etc/shadow"). */
  denyCmd?: string;
};

/**
 * Physical safe / padlock / glass vault card: shows a secret item protected inside (`secretLabel`, `ownerLabel`),
 * an animated SVG shackle & spoke wheel that locks at `lockAt` and unlocks at `unlockAt`, and an optional
 * `denyAt` cue where an unauthorized attempt triggers a red shake, error ring, and "Permission denied" banner.
 */
export const VaultSafe: React.FC<VaultSafeProps> = ({
  at,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 560,
  dark = false,
  secretLabel,
  secretSub = "-rw-------  1 root  root",
  secretValue = "sha512$9f8e2a01c4b7...d83e19a0",
  secretIcon = "key",
  ownerLabel,
  modeLabel = "0600",
  initialLocked,
  lockAt,
  unlockAt,
  denyAt,
  denyLabel = "Permission denied",
  denyCmd = "$ cat /etc/shadow → EACCES",
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  // Determine lock progress (0 = unlocked, 1 = locked)
  const startLocked =
    initialLocked !== undefined
      ? initialLocked
      : lockAt !== undefined && (unlockAt === undefined || lockAt <= unlockAt)
        ? false
        : true;

  type LockEvent = { frame: number; target: number };
  const events: LockEvent[] = [];
  if (lockAt !== undefined) events.push({ frame: lockAt, target: 1 });
  if (unlockAt !== undefined) events.push({ frame: unlockAt, target: 0 });
  events.sort((a, b) => a.frame - b.frame);

  let fromLock = startLocked ? 1 : 0;
  let toLock = fromLock;
  let lastEventFrame: number | null = null;
  for (const ev of events) {
    if (frame >= ev.frame) {
      fromLock = toLock;
      toLock = ev.target;
      lastEventFrame = ev.frame;
    }
  }
  const eventT = lastEventFrame === null ? 1 : prog(frame, lastEventFrame, 18, easeInOut);
  const lockP = lerp(fromLock, toLock, eventT);

  // Deny cue envelope: active from denyAt, fades out when unlockAt arrives or after 34 frames
  const denyEnd =
    denyAt !== undefined
      ? unlockAt !== undefined && unlockAt > denyAt
        ? Math.min(denyAt + 34, unlockAt - 2)
        : denyAt + 34
      : 0;
  const denyIn = denyAt !== undefined ? prog(frame, denyAt, 6, easeOut) : 0;
  const denyOut = denyAt !== undefined ? prog(frame, denyEnd, 8, easeOut) : 0;
  const denyP = denyAt !== undefined && frame >= denyAt ? denyIn * (1 - denyOut) : 0;

  // Damped horizontal shake during the first 18 frames of denyAt
  const shakeElapsed = denyAt !== undefined ? frame - denyAt : -1;
  const shakeDecay = shakeElapsed >= 0 && shakeElapsed <= 18 ? 1 - shakeElapsed / 18 : 0;
  const shakeX = shakeDecay > 0 ? Math.sin(shakeElapsed * 1.45) * 14 * shakeDecay : 0;
  const wheelJiggle = shakeDecay > 0 ? Math.sin(shakeElapsed * 1.8) * 11 * shakeDecay : 0;

  // Granted cue when unlockAt triggers
  const unlockedNow = unlockAt !== undefined && frame >= unlockAt && toLock === 0;
  const grantP = unlockedNow ? prog(frame, unlockAt, 12, easeOut) : 0;

  const bg = dark ? TERM.bg : C.white;
  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const borderCol =
    denyP > 0.01
      ? interpolateColors(denyP, [0, 1], [C.line, RED])
      : grantP > 0.01
        ? interpolateColors(grantP, [0, 1], [C.line, GREEN])
        : C.line;

  const statusColor =
    denyP > 0.1 ? RED : grantP > 0.1 ? GREEN : lockP > 0.5 ? C.accent : "#FF9F0A";
  const statusText =
    denyP > 0.1
      ? "Access blocked"
      : grantP > 0.1
        ? "Vault unlocked"
        : lockP > 0.5
          ? "Vault locked"
          : "Unlocked";

  const wheelAngle = lockP * 180 + wheelJiggle;
  const shackleLift = (1 - lockP) * 28; // 0 when locked, lifted 28px when unlocked
  const wheelAccent =
    denyP > 0.05
      ? interpolateColors(denyP, [0, 1], [C.accent, RED])
      : grantP > 0.05
        ? interpolateColors(grantP, [0, 1], [C.accent, GREEN])
        : interpolateColors(lockP, [0, 1], [ WIRE_COLOR, C.accent ]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        ...materialize(vis),
        transform: shakeX !== 0 ? `translateX(${shakeX}px)` : undefined,
      }}
    >
      {/* Outer red deny lock-on ring */}
      {denyP > 0.01 ? (
        <div
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: 40,
            border: `4px solid ${RED}`,
            opacity: denyP,
            scale: String(1.04 - 0.04 * denyIn),
            pointerEvents: "none",
          }}
        />
      ) : null}

      {/* Main Card Shell */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          background: bg,
          border: `2px solid ${borderCol}`,
          boxShadow: dark ? SHADOW_WINDOW : CARD_SHADOW,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            height: 76,
            padding: "0 32px",
            borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
            background: dark ? TERM.bar : "#F8F8FA",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: Live Lock Status Pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 18px",
                borderRadius: 999,
                background: tint(statusColor, dark ? 0.2 : 0.11),
                border: `1.5px solid ${tint(statusColor, 0.35)}`,
              }}
            >
              <Icon
                name={denyP > 0.2 ? "warning" : lockP > 0.5 ? "lock" : "unlock"}
                size={24}
                color={statusColor}
                weight={2.2}
              />
              <span
                style={{
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 22,
                  letterSpacing: "-0.01em",
                  color: statusColor,
                }}
              >
                {statusText}
              </span>
            </div>

            {modeLabel ? (
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: dark ? "rgba(255,255,255,0.07)" : C.soft,
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 20,
                  color: mute,
                }}
              >
                {modeLabel}
              </div>
            ) : null}
          </div>

          {/* Right: Owner Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 18px",
              borderRadius: 12,
              background: dark ? "rgba(255,255,255,0.06)" : C.white,
              border: `1px solid ${C.line}`,
            }}
          >
            <Icon name="shield" size={24} color={C.accent} weight={2} />
            <span
              style={{
                fontFamily: mono,
                fontWeight: 600,
                fontSize: 21,
                color: fg,
              }}
            >
              {ownerLabel}
            </span>
          </div>
        </div>

        {/* Center Body: Left = Vault Mechanism, Right = Protected Glass Chamber */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: "24px 36px",
            gap: 36,
            position: "relative",
          }}
        >
          {/* Left: Physical SVG Padlock Shackle + Vault Door Wheel */}
          <div
            style={{
              width: 310,
              height: 340,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <svg width={300} height={330} viewBox="0 0 300 330" style={{ overflow: "visible" }}>
              {/* Padlock U-Shackle at top */}
              <g transform={`translate(0, ${-shackleLift})`}>
                {/* Outer shackle arch */}
                <path
                  d="M 96 132 V 74 A 54 54 0 0 1 204 74 V 112"
                  fill="none"
                  stroke={dark ? "#58585E" : "#C7C7CC"}
                  strokeWidth={22}
                  strokeLinecap="round"
                />
                {/* Inner shackle highlight stroke */}
                <path
                  d="M 96 132 V 74 A 54 54 0 0 1 204 74 V 112"
                  fill="none"
                  stroke={wheelAccent}
                  strokeWidth={6}
                  strokeLinecap="round"
                  opacity={0.45 + 0.55 * lockP}
                />
              </g>

              {/* Locking Bolts around the Vault Door */}
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const innerR = 88;
                const ext = 18 * lockP;
                const x1 = 150 + Math.cos(rad) * innerR;
                const y1 = 198 + Math.sin(rad) * innerR;
                const x2 = 150 + Math.cos(rad) * (innerR + ext);
                const y2 = 198 + Math.sin(rad) * (innerR + ext);
                return (
                  <line
                    key={deg}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={wheelAccent}
                    strokeWidth={10}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Vault Door Outer Bezel */}
              <circle
                cx={150}
                cy={198}
                r={102}
                fill={dark ? "#28282B" : "#F2F2F7"}
                stroke={wheelAccent}
                strokeWidth={5}
              />

              {/* Inner Precision Dial Ring */}
              <circle
                cx={150}
                cy={198}
                r={80}
                fill={dark ? "#1E1E20" : C.white}
                stroke={dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)"}
                strokeWidth={2.5}
              />

              {/* Dial Tick Marks (12 ticks) */}
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                const r1 = 68;
                const r2 = i % 3 === 0 ? 77 : 73;
                return (
                  <line
                    key={i}
                    x1={150 + Math.cos(a) * r1}
                    y1={198 + Math.sin(a) * r1}
                    x2={150 + Math.cos(a) * r2}
                    y2={198 + Math.sin(a) * r2}
                    stroke={dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)"}
                    strokeWidth={i % 3 === 0 ? 3 : 2}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Rotating 3-Spoke Vault Wheel */}
              <g transform={`translate(150, 198) rotate(${wheelAngle})`}>
                {[0, 120, 240].map((deg) => (
                  <g key={deg} transform={`rotate(${deg})`}>
                    <line
                      x1={0}
                      y1={0}
                      x2={0}
                      y2={-56}
                      stroke={wheelAccent}
                      strokeWidth={9}
                      strokeLinecap="round"
                    />
                    <circle cx={0} cy={-56} r={9} fill={wheelAccent} />
                  </g>
                ))}
                {/* Wheel Rim */}
                <circle
                  cx={0}
                  cy={0}
                  r={42}
                  fill="none"
                  stroke={wheelAccent}
                  strokeWidth={6}
                />
                {/* Center Hub */}
                <circle
                  cx={0}
                  cy={0}
                  r={18}
                  fill={wheelAccent}
                />
                <circle cx={0} cy={0} r={6} fill={C.white} />
              </g>
            </svg>
          </div>

          {/* Right: Protected Glass Vault Chamber */}
          <div
            style={{
              flex: 1,
              height: 320,
              borderRadius: 24,
              background: dark ? "rgba(255,255,255,0.04)" : "#F7F7FA",
              border: `2px solid ${
                denyP > 0.1
                  ? alpha(RED, 0.45)
                  : lockP > 0.5
                    ? alpha(C.accent, 0.3)
                    : C.line
              }`,
              padding: "28px 30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top label row inside chamber */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 19,
                  color: mute,
                  letterSpacing: "0.02em",
                }}
              >
                PROTECTED RESOURCE
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 19,
                  color: lockP > 0.5 ? C.accent : GREEN,
                }}
              >
                {lockP > 0.5 ? "SEALED" : "READABLE"}
              </span>
            </div>

            {/* Protected Secret Item Card */}
            <div
              style={{
                borderRadius: 20,
                background: dark ? "#262629" : C.white,
                border: `1.5px solid ${C.line}`,
                boxShadow: CARD_SHADOW,
                padding: "22px 24px",
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: lockP > 0.5 ? BLUE_TINT : tint(GREEN, 0.14),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon
                  name={secretIcon}
                  size={34}
                  color={lockP > 0.5 ? C.accent : GREEN}
                  weight={2}
                />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 28,
                    color: fg,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {secretLabel}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: mono,
                    fontWeight: 500,
                    fontSize: 20,
                    color: mute,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {secretSub}
                </div>
              </div>
            </div>

            {/* Secret Payload Preview Row (veiled when locked, clear when unlocked) */}
            <div
              style={{
                borderRadius: 14,
                background: dark ? "rgba(0,0,0,0.35)" : C.soft,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 500,
                  fontSize: 20,
                  color: fg,
                  filter: lockP > 0.05 ? `blur(${lockP * 6}px)` : undefined,
                  opacity: 1 - lockP * 0.45,
                }}
              >
                {secretValue}
              </span>

              {/* Frosted Shield Shutter Overlay when Locked */}
              {lockP > 0.02 ? (
                <div
                  style={{
                    ...GLASS,
                    position: "absolute",
                    inset: 0,
                    borderRadius: 14,
                    background: dark
                      ? `rgba(30,30,32,${0.78 * lockP})`
                      : `rgba(255,255,255,${0.76 * lockP})`,
                    backdropFilter: `blur(${Math.round(lockP * 10)}px)`,
                    boxShadow: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    opacity: lockP,
                  }}
                >
                  <Icon name="lock" size={22} color={C.accent} weight={2.2} />
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 600,
                      fontSize: 19,
                      color: C.accent,
                    }}
                  >
                    encrypted · {ownerLabel}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Bottom Alert / Status Strip */}
        <div
          style={{
            height: 82,
            padding: "0 36px",
            borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
            background:
              denyP > 0.05
                ? tint(RED, dark ? 0.22 : 0.1)
                : grantP > 0.05
                  ? tint(GREEN, dark ? 0.2 : 0.1)
                  : dark
                    ? "rgba(255,255,255,0.02)"
                    : "#FAFAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {denyP > 0.05 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                opacity: denyP,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Icon name="crossCircle" size={30} color={RED} weight={2.2} />
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: 26,
                    color: RED,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {denyLabel}
                </span>
              </div>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 22,
                  color: dark ? "#FF8A84" : "#C9281E",
                }}
              >
                {denyCmd}
              </span>
            </div>
          ) : grantP > 0.05 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                opacity: grantP,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Icon name="checkCircle" size={30} color={GREEN} weight={2.2} />
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: 26,
                    color: dark ? TERM.green : "#248A3D",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Access granted · sudo verified
                </span>
              </div>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 22,
                  color: dark ? TERM.green : "#248A3D",
                }}
              >
                uid=0(root) · read ok
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 23, color: mute }}>
                {lockP > 0.5
                  ? "Only the owner or sudo can unseal this descriptor"
                  : "Descriptor open for authorized process read"}
              </span>
              <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 21, color: C.accent }}>
                {secretLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WIRE_COLOR = "#86868B";
