import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, materialize, mono, prog, sans, SHADOW_WINDOW, W } from "../../theme";
import { alpha, GREEN, presence, RED } from "../diagram/Node";
import { pressDepth } from "../ui/shared";

export type PermissionKind = "microphone" | "camera" | "contacts" | "network" | "files" | "location";

const PERMISSION_META: Record<PermissionKind, { label: string; icon: IconName; badgeColor: string }> = {
  microphone: { label: "Microphone", icon: "waveform", badgeColor: "#FF9F0A" },
  camera: { label: "Camera", icon: "eye", badgeColor: "#34C759" },
  contacts: { label: "Contacts", icon: "users", badgeColor: "#0071E3" },
  network: { label: "Local Network", icon: "wifi", badgeColor: "#0071E3" },
  files: { label: "Desktop Folder", icon: "folder", badgeColor: "#0071E3" },
  location: { label: "Location", icon: "globe", badgeColor: "#0071E3" },
};

/**
 * macOS / iOS privacy permission dialog:
 * “snack-calc” would like to access your Microphone / Camera / Contacts / Network.
 * Shows app icon badge + permission badge, bold title, explanation text, and
 * `Don't Allow` / `Allow` buttons where `choice` ("deny" | "allow") presses at `pressAt`.
 */
export const PermissionPrompt: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  at?: number;
  until?: number;
  app: string;
  permission?: PermissionKind;
  permissionLabel?: string;
  appIcon?: IconName;
  appTile?: string;
  permissionIcon?: IconName;
  title?: string;
  explanation?: string;
  detail?: string;
  variant?: "mac" | "ios";
  choice?: "deny" | "allow";
  pressAt?: number;
  dismissOnPress?: boolean;
  denyLabel?: string;
  allowLabel?: string;
}> = ({
  x,
  y = 420,
  w,
  at = 0,
  until,
  app,
  permission = "microphone",
  permissionLabel,
  appIcon = "terminal",
  appTile = "#1D1D1F",
  permissionIcon,
  title,
  explanation,
  detail,
  variant = "mac",
  choice = "deny",
  pressAt,
  dismissOnPress = false,
  denyLabel = "Don’t allow",
  allowLabel = "Allow",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leave = dismissOnPress && pressAt !== undefined ? Math.min(pressAt + 10, until ?? Infinity) : until;
  const p = presence(frame, at, leave, 10, 8);
  if (p === null) return null;

  const meta = PERMISSION_META[permission];
  const permName = permissionLabel ?? meta.label;
  const permIcon = permissionIcon ?? meta.icon;
  const ios = variant === "ios";
  const width = w ?? (ios ? 620 : 680);
  const left = x ?? Math.round((W - width) / 2);

  const down = pressDepth(frame, fps, pressAt, 3);
  const decided = pressAt !== undefined && frame >= pressAt ? prog(frame, pressAt, 8) : 0;
  const draw = prog(frame, at + 2, 14);

  const heading = title ?? `“${app}” would like to access your ${permName}`;
  const bodyText =
    explanation ?? `Allowing access lets “${app}” use your ${permName.toLowerCase()} while the app is open.`;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: y,
        width,
        borderRadius: ios ? 36 : 32,
        background: ios ? "rgba(248,248,250,0.95)" : "rgba(255,255,255,0.94)",
        backdropFilter: "blur(24px) saturate(180%)",
        border: `1px solid ${C.line}`,
        boxShadow: SHADOW_WINDOW,
        fontFamily: sans,
        color: C.ink,
        textAlign: "center",
        overflow: "hidden",
        ...materialize(p),
      }}
    >
      <div
        style={{
          padding: ios ? "36px 38px 28px" : "40px 44px 34px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* App icon tile + overlapping privacy permission badge */}
        <div style={{ position: "relative", width: 116, height: 96, marginBottom: 22 }}>
          <div
            style={{
              position: "absolute",
              left: 4,
              top: 0,
              width: 88,
              height: 88,
              borderRadius: 22,
              background: appTile,
              boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={appIcon} size={50} color={C.white} weight={2} draw={draw} />
          </div>
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 52,
              height: 52,
              borderRadius: 26,
              background: meta.badgeColor,
              border: `4px solid ${C.white}`,
              boxShadow: "0 6px 14px rgba(0,0,0,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={permIcon} size={28} color={C.white} weight={2.2} draw={draw} />
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: ios ? 32 : 34,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.22,
            maxWidth: width - 80,
          }}
        >
          {heading}
        </div>

        {/* Explanation */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            lineHeight: 1.38,
            color: C.mute,
            marginTop: 12,
            maxWidth: width - 84,
          }}
        >
          {bodyText}
        </div>

        {/* Optional detail strip (e.g. binary path or privacy note) */}
        {detail ? (
          <div
            style={{
              marginTop: 18,
              padding: "10px 18px",
              borderRadius: 12,
              background: C.paper,
              border: `1px solid ${C.line}`,
              fontFamily: mono,
              fontSize: 20,
              fontWeight: 500,
              color: C.mute,
            }}
          >
            {detail}
          </div>
        ) : null}

        {/* macOS side-by-side pill buttons */}
        {!ios ? (
          <div style={{ alignSelf: "stretch", display: "flex", gap: 14, marginTop: 28 }}>
            {(["deny", "allow"] as const).map((kind) => {
              const isChosen = choice === kind;
              const d = isChosen ? down : 0;
              const lock = isChosen ? decided : 0;
              const isAllow = kind === "allow";
              const baseBg = isAllow ? C.accent : C.soft;
              const pressedBg = isAllow ? "#0058B0" : "#D4D4DA";
              const decidedOutline = isChosen && lock > 0 ? (isAllow ? GREEN : RED) : "transparent";
              return (
                <div
                  key={kind}
                  style={{
                    flex: 1,
                    height: 66,
                    borderRadius: 16,
                    background: interpolateColors(d, [0, 1], [baseBg, pressedBg]),
                    color: isAllow ? C.white : C.ink,
                    scale: String(1 - 0.035 * d),
                    boxShadow: lock > 0 ? `0 0 0 3px ${alpha(decidedOutline, lock * 0.75)}` : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    fontSize: 26,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {isChosen && lock > 0.5 ? (
                    <Icon name={isAllow ? "check" : "cross"} size={24} color={isAllow ? C.white : RED} weight={2.4} />
                  ) : null}
                  <span>{isAllow ? allowLabel : denyLabel}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* iOS hairline-separated bottom buttons */}
      {ios ? (
        <div style={{ display: "flex", borderTop: `1px solid ${C.line}` }}>
          {(["deny", "allow"] as const).map((kind, i) => {
            const isChosen = choice === kind;
            const d = isChosen ? down : 0;
            const lock = isChosen ? decided : 0;
            const isAllow = kind === "allow";
            return (
              <div
                key={kind}
                style={{
                  flex: 1,
                  height: 84,
                  borderLeft: i ? `1px solid ${C.line}` : undefined,
                  background:
                    d > 0
                      ? `rgba(0,113,227,${0.12 * d})`
                      : lock > 0
                        ? alpha(isAllow ? C.accent : RED, 0.08 * lock)
                        : "transparent",
                  scale: String(1 - 0.025 * d),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  fontSize: 28,
                  fontWeight: isAllow ? 700 : 600,
                  letterSpacing: "-0.01em",
                  color: isChosen && !isAllow && lock > 0 ? RED : C.accent,
                }}
              >
                {isChosen && lock > 0.5 ? (
                  <Icon name={isAllow ? "check" : "cross"} size={24} color={isAllow ? C.accent : RED} weight={2.4} />
                ) : null}
                <span>{isAllow ? allowLabel : denyLabel}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
