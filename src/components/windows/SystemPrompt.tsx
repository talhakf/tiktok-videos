import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, materialize, prog, sans, SHADOW_WINDOW, W } from "../../theme";
import { presence } from "./MacWindow";

// macOS authorization dialog ("Terminal wants to use your keychain", Touch ID).

/**
 * macOS-style alert: icon (an Icons glyph, drawn on; with `tile` it sits white on a coloured app tile),
 * bold title, message, an optional password field whose dots fill in from `typeAt`, and two buttons
 * (grey cancel, blue confirm). At `pressAt` the `press`ed button darkens for 4 frames, then the dialog
 * leaves. Defaults: 620 wide, centred on the canvas at y 700.
 */
export const SystemPrompt: React.FC<{
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  title: string;
  message?: string;
  icon?: IconName;
  tile?: string;
  iconColor?: string;
  password?: boolean | string; // true or a placeholder
  typeAt?: number;
  dots?: number;
  cancel?: string;
  confirm?: string;
  pressAt?: number;
  press?: "confirm" | "cancel";
}> = ({
  at,
  until,
  x,
  y = 700,
  w = 620,
  title,
  message,
  icon = "lock",
  tile,
  iconColor,
  password,
  typeAt,
  dots = 10,
  cancel = "Cancel",
  confirm = "Allow",
  pressAt,
  press = "confirm",
}) => {
  const frame = useCurrentFrame();
  const leave = pressAt !== undefined ? Math.min(pressAt + 8, until ?? Infinity) : until;
  const p = presence(frame, at, leave, 10, 8);
  if (p === null) return null;
  const down = pressAt === undefined ? 0 : prog(frame, pressAt, 4);
  const n = typeAt === undefined || frame < typeAt ? 0 : Math.min(dots, Math.floor((frame - typeAt) / 2.2) + 1);
  const typing = typeAt !== undefined && frame >= typeAt && (pressAt === undefined || frame < pressAt);
  const draw = prog(frame, at + 3, 16);

  const button = (label: string, primary: boolean) => {
    const pressed = (press === "confirm") === primary ? down : 0;
    return (
      <div
        style={{
          flex: 1,
          height: 66,
          borderRadius: 16,
          background: primary ? interpolateColors(pressed, [0, 1], [C.accent, "#0058B0"]) : interpolateColors(pressed, [0, 1], [C.soft, "#CFCFD4"]),
          color: primary ? C.white : C.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 27,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: x ?? (W - w) / 2,
        top: y,
        width: w,
        padding: "44px 40px 36px",
        borderRadius: 32,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(24px) saturate(180%)",
        border: `1px solid ${C.line}`,
        boxShadow: SHADOW_WINDOW,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: sans,
        color: C.ink,
        textAlign: "center",
        ...materialize(p),
      }}
    >
      {tile ? (
        <div style={{ width: 96, height: 96, borderRadius: 22, background: tile, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={60} color={iconColor ?? C.white} weight={2} draw={draw} />
        </div>
      ) : (
        <Icon name={icon} size={92} color={iconColor ?? (icon === "fingerprint" ? C.accent : C.ink)} weight={1.6} draw={draw} />
      )}
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginTop: 26 }}>{title}</div>
      {message ? <div style={{ fontSize: 25, fontWeight: 500, lineHeight: 1.35, marginTop: 12, color: C.ink, opacity: 0.85 }}>{message}</div> : null}
      {password ? (
        <div
          style={{
            alignSelf: "stretch",
            height: 64,
            marginTop: 28,
            borderRadius: 14,
            background: C.white,
            border: `2px solid ${typing || n > 0 ? C.accent : C.line}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 20px",
          }}
        >
          {n === 0 ? (
            <span style={{ fontSize: 25, fontWeight: 500, color: C.mute }}>{typeof password === "string" ? password : "Password"}</span>
          ) : (
            Array.from({ length: n }, (_, i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: C.ink }} />)
          )}
          {typing ? <div style={{ width: 2.5, height: 30, background: C.accent }} /> : null}
        </div>
      ) : null}
      <div style={{ alignSelf: "stretch", display: "flex", gap: 14, marginTop: 30 }}>
        {button(cancel, false)}
        {button(confirm, true)}
      </div>
    </div>
  );
};
