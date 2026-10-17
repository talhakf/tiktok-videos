import { AbsoluteFill, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, materialize, prog, sans, SHADOW_WINDOW, W } from "../../theme";
import { presence, RED } from "../diagram/Node";
import { pressDepth } from "./shared";

// Alerts: "Are you sure you want to delete …?". Two looks: `mac` (a centred card with an icon and
// filled buttons side by side, like SystemPrompt without the password field) and `ios` (the rounded
// alert with hairline-separated text buttons). A button presses on cue (scale 0.97, darker), then the
// alert closes. Destructive buttons are red. For the keychain / password dialog use SystemPrompt.

export type AlertButton = { label: string; kind?: "default" | "cancel" | "destructive" };

const FILL = {
  default: [C.accent, "#0058B0", C.white],
  cancel: [C.soft, "#CFCFD4", C.ink],
  destructive: [RED, "#C9281F", C.white],
} as const;

/**
 * Alert at y (centred on the canvas unless `x`). `buttons` 1–2 (default Cancel + OK); `press` = index of
 * the button pressed at `pressAt` (default the last one), the alert leaves 8 frames later. `icon` is an
 * Icons glyph (drawn on; with `tile` it sits white on a coloured tile). `dim` darkens the page behind it.
 */
export const AlertDialog: React.FC<{
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  variant?: "mac" | "ios";
  title: string;
  message?: string;
  icon?: IconName;
  tile?: string;
  iconColor?: string;
  buttons?: AlertButton[];
  pressAt?: number;
  press?: number;
  dim?: boolean;
}> = ({ at, until, x, y = 700, w, variant = "mac", title, message, icon, tile, iconColor, buttons, pressAt, press, dim }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leave = pressAt !== undefined ? Math.min(pressAt + 8, until ?? Infinity) : until;
  const p = presence(frame, at, leave, 10, 8);
  if (p === null) return null;
  const ios = variant === "ios";
  const width = w ?? (ios ? 600 : 640);
  const btns = buttons ?? [{ label: "Cancel", kind: "cancel" }, { label: "OK" }];
  const pressed = press ?? btns.length - 1;
  const down = pressDepth(frame, fps, pressAt, 2);
  const draw = prog(frame, at + 3, 16);

  const iconEl = !icon ? null : tile ? (
    <div style={{ width: 100, height: 100, borderRadius: 24, background: tile, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 26 }}>
      <Icon name={icon} size={60} color={iconColor ?? C.white} weight={2} draw={draw} />
    </div>
  ) : (
    <div style={{ marginBottom: 24 }}>
      <Icon name={icon} size={92} color={iconColor ?? C.ink} weight={1.6} draw={draw} />
    </div>
  );

  const text = (
    <>
      {iconEl}
      <div style={{ fontSize: ios ? 34 : 35, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{title}</div>
      {message ? <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.35, marginTop: 12, opacity: 0.85 }}>{message}</div> : null}
    </>
  );

  const card: React.CSSProperties = {
    position: "absolute",
    left: x ?? (W - width) / 2,
    top: y,
    width,
    borderRadius: ios ? 36 : 32,
    background: ios ? "rgba(242,242,247,0.92)" : "rgba(255,255,255,0.92)",
    backdropFilter: "blur(24px) saturate(180%)",
    border: `1px solid ${C.line}`,
    boxShadow: SHADOW_WINDOW,
    fontFamily: sans,
    color: C.ink,
    textAlign: "center",
    overflow: "hidden",
    ...materialize(p),
  };

  return (
    <>
      {dim ? <AbsoluteFill style={{ background: "rgba(0,0,0,0.18)", opacity: p }} /> : null}
      {ios ? (
        <div style={card}>
          <div style={{ padding: "40px 36px 34px", display: "flex", flexDirection: "column", alignItems: "center" }}>{text}</div>
          <div style={{ display: "flex", borderTop: `1px solid ${C.line}` }}>
            {btns.map((b, i) => {
              const d = i === pressed ? down : 0;
              return (
                <div
                  key={b.label}
                  style={{
                    flex: 1,
                    height: 92,
                    borderLeft: i ? `1px solid ${C.line}` : undefined,
                    background: `rgba(0,0,0,${0.08 * d})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 31,
                    fontWeight: b.kind === "cancel" ? 600 : 500,
                    letterSpacing: "-0.01em",
                    color: b.kind === "destructive" ? RED : C.accent,
                  }}
                >
                  {b.label}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ ...card, padding: "44px 40px 36px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {text}
          <div style={{ alignSelf: "stretch", display: "flex", gap: 14, marginTop: 32 }}>
            {btns.map((b, i) => {
              const d = i === pressed ? down : 0;
              const [bg, dark, fg] = FILL[b.kind ?? "default"];
              return (
                <div
                  key={b.label}
                  style={{
                    flex: 1,
                    height: 68,
                    borderRadius: 16,
                    background: interpolateColors(d, [0, 1], [bg, dark]),
                    color: fg,
                    scale: String(1 - 0.03 * d),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {b.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
