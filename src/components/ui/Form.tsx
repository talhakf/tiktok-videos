import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { alpha, GREEN, presence, RED } from "../diagram/Node";
import { Spinner } from "./Loading";
import { pressDepth, typedCount, typedEnd } from "./shared";

// Form pieces: a labelled text field that types its value (or dots for a password), focuses with a blue
// ring, and turns red with a message and a short shake (wrong password) or shows a green check (valid);
// and a Button that presses on cue (scale 0.97, darker), can spin while loading and end in a done state.

export type FieldState = { at: number; kind: "error" | "ok"; message?: string };

/**
 * Text field at (x, y), `w` wide, with an optional grey `label` above. Types `value` from `typeAt`
 * (`fpc` frames per character); `mask` shows dots instead. Focused (blue border + ring) from `focusAt`
 * (default `typeAt`) until `blurAt` or the first `states` cue. `states`: error = red border, red message,
 * shake; ok = green check in the field (+ green message). Height 92 + label 40 + message 44.
 */
export const TextField: React.FC<{
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  label?: string;
  placeholder?: string;
  value?: string;
  typeAt?: number;
  fpc?: number;
  mask?: boolean;
  monoValue?: boolean;
  icon?: IconName;
  focusAt?: number;
  blurAt?: number;
  states?: FieldState[];
}> = ({ x, y, w = 900, at, until, label, placeholder, value = "", typeAt, fpc = 3, mask, monoValue, icon, focusAt, blurAt, states = [] }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const n = typeAt === undefined ? value.length : typedCount(frame, value.length, typeAt, fpc);
  const cues = [...states].sort((a, b) => a.at - b.at);
  const cur = [...cues].reverse().find((c) => frame >= c.at);
  const fAt = focusAt ?? typeAt;
  const bAt = blurAt ?? cues[0]?.at;
  const focus = fAt === undefined ? 0 : prog(frame, fAt, 6) * (1 - (bAt !== undefined ? prog(frame, bAt, 6) : 0));
  const sp = cur ? prog(frame, cur.at, 8, easeInOut) : 0;
  const tone = cur?.kind === "error" ? RED : GREEN;
  const border = cur?.kind === "error" ? interpolateColors(sp, [0, 1], [C.line, RED]) : interpolateColors(focus, [0, 1], [C.line, C.accent]);
  const shake = cur?.kind === "error" && frame < cur.at + 14 ? Math.sin((frame - cur.at) * 1.9) * 14 * (1 - (frame - cur.at) / 14) : 0;
  const typing = typeAt !== undefined && frame >= typeAt && frame <= typedEnd(value.length, typeAt, fpc) + 8 && focus > 0.5;
  const size = 34;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: sans, ...materialize(vis) }}>
      {label ? <div style={{ height: 40, fontSize: 26, fontWeight: 600, color: C.mute, paddingLeft: 6 }}>{label}</div> : null}
      <div
        style={{
          height: 92,
          borderRadius: 18,
          background: C.white,
          border: `2px solid ${border}`,
          boxShadow: `0 0 0 ${5 * Math.max(focus, cur?.kind === "error" ? sp : 0)}px ${alpha(cur?.kind === "error" ? RED : C.accent, 0.18)}`,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 26px",
          translate: `${shake}px 0px`,
        }}
      >
        {icon ? <Icon name={icon} size={36} color={C.mute} weight={2} /> : null}
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          {n === 0 && placeholder && !typing ? <span style={{ fontSize: size, fontWeight: 500, color: "#AEAEB2", whiteSpace: "pre" }}>{placeholder}</span> : null}
          {mask ? (
            Array.from({ length: n }, (_, i) => <div key={i} style={{ width: 15, height: 15, borderRadius: 8, background: C.ink, flexShrink: 0 }} />)
          ) : n > 0 ? (
            <span style={{ fontFamily: monoValue ? mono : sans, fontSize: monoValue ? size * 0.9 : size, fontWeight: 500, letterSpacing: monoValue ? 0 : "-0.01em", color: C.ink, whiteSpace: "pre" }}>
              {value.slice(0, n)}
            </span>
          ) : null}
          {typing ? <div style={{ width: 3, height: 42, marginLeft: mask ? 0 : -8, background: C.accent, flexShrink: 0 }} /> : null}
        </div>
        {cur ? (
          <div style={{ ...materialize(sp, 0.9, 4) }}>
            <Icon name={cur.kind === "error" ? "crossCircle" : "checkCircle"} size={40} color={tone} weight={2.2} draw={prog(frame, cur.at + 2, 10)} />
          </div>
        ) : null}
      </div>
      {cur?.message ? (
        <div style={{ height: 44, display: "flex", alignItems: "flex-end", paddingLeft: 6, fontSize: 25, fontWeight: 600, color: cur.kind === "error" ? RED : "#248A3D", ...materialize(sp, 0.98, 4) }}>
          {cur.message}
        </div>
      ) : null}
    </div>
  );
};

const KINDS = {
  primary: { bg: C.accent, dark: "#0058B0", fg: C.white },
  secondary: { bg: C.soft, dark: "#CFCFD4", fg: C.ink },
  destructive: { bg: RED, dark: "#C9281F", fg: C.white },
} as const;

/**
 * Button at (x, y): `w` wide (default fits the label) and `h` tall. Presses at `pressAt` (down 4 frames,
 * scale 0.97 + darker, spring back). From `loadAt` the label swaps for a white Spinner (+ `loadingLabel`);
 * at `doneAt` it turns green with a check and `doneLabel`. Swaps cross-blur over 8 frames.
 */
export const Button: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  label: string;
  kind?: "primary" | "secondary" | "destructive";
  icon?: IconName;
  pressAt?: number;
  loadAt?: number;
  loadingLabel?: string;
  doneAt?: number;
  doneLabel?: string;
  size?: number;
}> = ({ x, y, w, h = 96, at, until, label, kind = "primary", icon, pressAt, loadAt, loadingLabel, doneAt, doneLabel, size = 32 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const k = KINDS[kind];
  const down = pressDepth(frame, fps, pressAt);
  const load = loadAt === undefined ? 0 : prog(frame, loadAt, 8);
  const done = doneAt === undefined ? 0 : prog(frame, doneAt, 8);
  const bg = interpolateColors(done, [0, 1], [interpolateColors(down, [0, 1], [k.bg, k.dark]), GREEN]);
  const fg = interpolateColors(done, [0, 1], [k.fg, C.white]);
  const layer = (p: number, content: React.ReactNode) =>
    p > 0 ? (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, ...materialize(p, 0.95, 6) }}>
        {content}
      </div>
    ) : null;
  const text = (s: string) => <span style={{ whiteSpace: "nowrap" }}>{s}</span>;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        padding: w === undefined ? "0 52px" : undefined,
        boxSizing: "border-box",
        borderRadius: 22,
        background: bg,
        color: fg,
        fontFamily: sans,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "-0.01em",
        ...materialize(vis),
        scale: String((0.95 + 0.05 * vis) * (1 - 0.03 * down)),
      }}
    >
      {/* sizer keeps the auto width of the widest state */}
      <div style={{ visibility: "hidden", height: h, display: "flex", alignItems: "center", gap: 16 }}>
        {icon ? <Icon name={icon} size={size * 1.15} /> : null}
        {text(label)}
      </div>
      {layer(
        1 - Math.max(load, done),
        <>
          {icon ? <Icon name={icon} size={size * 1.15} color={fg} weight={2.2} /> : null}
          {text(label)}
        </>,
      )}
      {layer(
        load * (1 - done),
        <>
          <Spinner size={size * 1.2} color={k.fg} at={loadAt ?? 0} />
          {loadingLabel ? text(loadingLabel) : null}
        </>,
      )}
      {layer(
        done,
        <>
          <Icon name="check" size={size * 1.1} color={C.white} weight={2.8} draw={prog(frame, (doneAt ?? 0) + 2, 10)} />
          {text(doneLabel ?? label)}
        </>,
      )}
    </div>
  );
};
