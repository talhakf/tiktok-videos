import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { appleSpring, C, easeInOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { BLUE_TINT, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type BottomSheetRow = {
  label: string;
  value: string;
  mono?: boolean;
  icon?: IconName;
};

/**
 * iOS-style slide-up Bottom Sheet & Passkey / Biometric confirmation sheet:
 * renders a rounded sheet with a top grabber pill, title/subtitle, detail rows,
 * and an animated biometric/passkey verification ring (`confirmAt`) that morphs
 * into a green checkmark ("Verified with Passkey").
 */
export const BottomSheetModal: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  title: string;
  subtitle?: string;
  icon?: IconName;
  rows?: BottomSheetRow[];
  confirmAt?: number;
  pendingLabel?: string;
  confirmLabel?: string;
  dark?: boolean;
}> = ({
  x = TX,
  y = TY,
  w = TW,
  h,
  at = 0,
  until,
  title,
  subtitle,
  icon = "fingerprint",
  rows = [],
  confirmAt,
  pendingLabel = "Confirm with Passkey",
  confirmLabel = "Verified with Passkey",
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vis = presence(frame, at, until, 10, 8);
  if (vis === null) return null;

  const slideS = appleSpring(Math.max(0, frame - at), fps, { response: 0.48, damping: 0.96 });
  const sheetH = h ?? 360 + rows.length * 76;

  // Verification progress: sweeps ring before confirmAt, then morphs into green check at confirmAt
  const scanStart = at + 8;
  const scanDur = confirmAt !== undefined ? Math.max(12, confirmAt - scanStart) : 28;
  const ringSweep = prog(frame, scanStart, scanDur, easeInOut);
  const doneP = confirmAt !== undefined ? prog(frame, confirmAt, 12, easeInOut) : 0;
  const checkDraw = confirmAt !== undefined ? prog(frame, confirmAt + 2, 12) : 0;

  const ringColor = interpolateColors(doneP, [0, 1], [C.accent, GREEN]);
  const ringFill = interpolateColors(
    doneP,
    [0, 1],
    [dark ? tint(TERM.blue, 0.16) : BLUE_TINT, dark ? tint(TERM.green, 0.18) : tint(GREEN, 0.14)],
  );

  const fg = dark ? TERM.fg : C.ink;
  const subFg = dark ? TERM.dim : C.mute;
  const lineCol = dark ? "rgba(255,255,255,0.1)" : C.line;
  const rowBg = dark ? "#262629" : C.paper;

  const R = 48;
  const CIRC = 2 * Math.PI * R;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + lerp(44, 0, slideS),
        width: w,
        height: sheetH,
        borderRadius: 38,
        background: dark ? TERM.bg : C.white,
        border: `1.5px solid ${lineCol}`,
        boxShadow: SHADOW_WINDOW,
        padding: "20px 40px 36px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: sans,
        overflow: "hidden",
        ...materialize(vis),
      }}
    >
      {/* Top grabber pill + header */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 68,
            height: 8,
            borderRadius: 4,
            background: dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.16)",
            marginBottom: 22,
          }}
        />
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: fg,
            lineHeight: 1.15,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 24,
              fontWeight: 500,
              color: subFg,
              textAlign: "center",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Detail rows card */}
      {rows.length > 0 ? (
        <div
          style={{
            width: "100%",
            borderRadius: 24,
            background: rowBg,
            border: `1px solid ${lineCol}`,
            overflow: "hidden",
            marginTop: 18,
            marginBottom: 18,
          }}
        >
          {rows.map((r, i) => (
            <div
              key={r.label}
              style={{
                height: 74,
                padding: "0 26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: i > 0 ? `1px solid ${lineCol}` : undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 25, fontWeight: 500, color: subFg }}>
                {r.icon ? <Icon name={r.icon} size={28} color={subFg} weight={1.9} /> : null}
                <span>{r.label}</span>
              </div>
              <div
                style={{
                  fontFamily: r.mono ? mono : sans,
                  fontSize: r.mono ? 24 : 26,
                  fontWeight: 600,
                  color: fg,
                  letterSpacing: r.mono ? 0 : "-0.01em",
                }}
              >
                {r.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Biometric / Passkey verification ring & status */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", width: 112, height: 112, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={112} height={112} viewBox="0 0 112 112" style={{ position: "absolute", inset: 0, rotate: "-90deg" }}>
            <circle cx={56} cy={56} r={R} fill={ringFill} stroke={dark ? "rgba(255,255,255,0.12)" : C.soft} strokeWidth={5} />
            <circle
              cx={56}
              cy={56}
              r={R}
              fill="none"
              stroke={ringColor}
              strokeWidth={5.5}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - Math.max(0.15, ringSweep))}
            />
          </svg>
          {doneP < 1 ? (
            <div style={{ position: "absolute", opacity: 1 - doneP, scale: String(1 - doneP * 0.15) }}>
              <Icon name={icon} size={50} color={C.accent} weight={2} draw={prog(frame, at + 4, 14)} />
            </div>
          ) : null}
          {doneP > 0 ? (
            <div style={{ position: "absolute", opacity: doneP, scale: String(0.92 + 0.08 * doneP) }}>
              <Icon name="check" size={52} color={GREEN} weight={2.8} draw={checkDraw} />
            </div>
          ) : null}
        </div>

        <div
          style={{
            fontSize: 25,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: interpolateColors(doneP, [0, 1], [subFg, dark ? TERM.green : "#248A3D"]),
          }}
        >
          {doneP >= 0.5 ? confirmLabel : pendingLabel}
        </div>
      </div>
    </div>
  );
};
