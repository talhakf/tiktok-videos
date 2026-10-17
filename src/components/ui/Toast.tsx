import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { appleSpring, C, materialize, prog, sans, W } from "../../theme";
import { GREEN } from "../diagram/Node";

// macOS notifications: frosted cards that slide in from the right edge at the top right and stack (the
// newest on top pushes the others down; a leaving one slides back out and the stack closes up). Plus a
// small dark Snackbar pill near the bottom ("Copied to clipboard").

export type ToastItem = {
  at: number;
  until?: number;
  app?: string;
  title: string;
  body?: string; // break lines with \n (no automatic wrapping)
  icon?: IconName;
  tint?: string;
  time?: string;
};

const PAD = 22;
const toastH = (t: ToastItem) => PAD * 2 + 30 + 6 + 36 + (t.body ? t.body.split("\n").length * 34 : 0);

/**
 * A stack of notifications, right-aligned to the content column (`x` = left edge, default TX + TW − w),
 * starting at `y`. Each slides in from the right at its `at` (critically damped spring) and out at `until`.
 * Newer toasts sit on top and push older ones down by their height + `gap`.
 */
export const Toasts: React.FC<{ toasts: ToastItem[]; x?: number; y?: number; w?: number; gap?: number }> = ({ toasts, x, y = 250, w = 680, gap = 16 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const left = x ?? TX + TW - w;
  const travel = W - left + 40;
  const state = toasts.map((t) => {
    const s = frame < t.at ? 0 : appleSpring(frame - t.at, fps, { response: 0.5 });
    const out = t.until !== undefined ? prog(frame, t.until, 10) : 0;
    return { s, out, h: toastH(t) };
  });
  return (
    <>
      {toasts.map((t, i) => {
        const { s, out, h } = state[i];
        if (frame < t.at || out >= 1) return null;
        // pushed down by every newer toast that is in (and not yet gone)
        let offset = 0;
        toasts.forEach((o, j) => {
          if (j === i || o.at <= t.at || frame < o.at) return;
          offset += (state[j].h + gap) * state[j].s * (1 - state[j].out);
        });
        return (
          <div
            key={`${t.title}${t.at}`}
            style={{
              position: "absolute",
              left,
              top: y + offset,
              width: w,
              height: h,
              padding: PAD,
              boxSizing: "border-box",
              borderRadius: 30,
              background: "rgba(246,246,248,0.86)",
              backdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.05)",
              display: "flex",
              gap: 20,
              fontFamily: sans,
              translate: `${((1 - s) + out) * travel}px 0px`,
              opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }) * (1 - out),
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 17,
                background: t.tint ?? C.accent,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={t.icon ?? "bell"} size={42} color={C.white} weight={2.1} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ height: 30, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, fontWeight: 500, color: C.mute }}>
                <span>{t.app ?? ""}</span>
                <span>{t.time ?? "now"}</span>
              </div>
              <div style={{ marginTop: 6, height: 36, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {t.title}
              </div>
              {t.body
                ? t.body.split("\n").map((line, k) => (
                    <div key={k} style={{ height: 34, fontSize: 27, fontWeight: 500, color: C.ink, opacity: 0.85, whiteSpace: "pre" }}>
                      {line}
                    </div>
                  ))
                : null}
            </div>
          </div>
        );
      })}
    </>
  );
};

/** One notification (a stack of one). Same props as a ToastItem plus the stack position. */
export const Toast: React.FC<ToastItem & { x?: number; y?: number; w?: number }> = ({ x, y, w, ...t }) => <Toasts toasts={[t]} x={x} y={y} w={w} />;

/**
 * Small dark pill centred on `x` (default the canvas centre) at `y`: an icon (green check by default)
 * and a short message. Rises 24 px and materializes at `at`, leaves at `until`.
 */
export const Snackbar: React.FC<{
  text: string;
  at: number;
  until?: number;
  x?: number;
  y?: number;
  icon?: IconName | null;
  iconColor?: string;
}> = ({ text, at, until, x = W / 2, y = 1200, icon = "check", iconColor = GREEN }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = prog(frame, at, 10);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: `-50% ${(1 - p) * 24}px`,
        height: 84,
        padding: "0 38px 0 30px",
        borderRadius: 42,
        background: "rgba(29,29,31,0.92)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 29,
        letterSpacing: "-0.01em",
        color: C.white,
        whiteSpace: "nowrap",
        ...materialize(p * (1 - out), 0.95, 6),
      }}
    >
      {icon ? <Icon name={icon} size={34} color={iconColor} weight={2.6} draw={prog(frame, at + 4, 10)} /> : null}
      {text}
    </div>
  );
};
