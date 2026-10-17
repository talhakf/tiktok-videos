import { interpolateColors } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { CARD_SHADOW } from "../diagram/Node";
import { GREEN, RED } from "../layouts/Mark";
import { tint } from "../windows/MacWindow";
import { C, easeInOut, materialize, mono, prog, SHADOW_WINDOW, TERM } from "../../theme";

// Shared pieces of the dev cards (CodeBlock, DiffView, JsonTree, LogStream, StackTrace, ...):
// the white / dark card shell with an optional file tab, the tone colours, and the focus band that
// fades in on a line and glides from line to line on cue.

export const AMBER = "#FF9F0A";
export type Tone = "accent" | "bad" | "warn" | "good";

/** Band fill, band edge and text colour for each tone, on light and dark cards. */
export const toneColors = (tone: Tone, dark = false) => {
  if (dark) {
    const c = { accent: TERM.blue, bad: TERM.red, warn: TERM.yellow, good: TERM.green }[tone];
    return { bg: tint(c, 0.17), edge: c, fg: c };
  }
  return {
    accent: { bg: tint(C.accent, 0.09), edge: C.accent, fg: C.accent },
    bad: { bg: tint(RED, 0.1), edge: RED, fg: "#C9281E" },
    warn: { bg: "rgba(255,159,10,0.14)", edge: AMBER, fg: "#A05A00" },
    good: { bg: tint(GREEN, 0.13), edge: GREEN, fg: "#248A3D" },
  }[tone];
};

/** Height of the file tab strip on top of a card. */
export const TAB_H = 64;

/**
 * Card shell at (x, y): white (or `dark`, Terminal colours), radius 28, soft shadow, materializing with `p`.
 * `filename` adds a tab strip on top (file icon + name, an optional grey `right` text such as the language).
 */
export const DevCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
  dark?: boolean;
  filename?: string;
  icon?: IconName;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, p, dark, filename, icon = "fileCode", right, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 28,
      background: dark ? TERM.bg : C.white,
      border: `1px solid ${C.line}`,
      boxShadow: dark ? SHADOW_WINDOW : CARD_SHADOW,
      overflow: "hidden",
      fontVariantLigatures: "none", // JetBrains Mono would draw "==" and "=>" as one glyph
      ...materialize(p),
      ...style,
    }}
  >
    {filename !== undefined ? <FileTab name={filename} dark={dark} icon={icon} right={right} /> : null}
    <div style={{ position: "relative", height: h - (filename !== undefined ? TAB_H : 0) }}>{children}</div>
  </div>
);

/** Editor-style tab strip: a grey bar with one active tab (white / dark body colour) holding the file name. */
export const FileTab: React.FC<{ name: string; dark?: boolean; icon?: IconName; right?: React.ReactNode }> = ({ name, dark, icon = "fileCode", right }) => {
  const bar = dark ? TERM.bar : "#F2F2F4";
  const body = dark ? TERM.bg : C.white;
  const fg = dark ? TERM.fg : C.ink;
  return (
    <div style={{ height: TAB_H, background: bar, display: "flex", alignItems: "flex-end", padding: "0 18px", position: "relative" }}>
      <div
        style={{
          height: TAB_H - 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 24px 0 20px",
          background: body,
          borderRadius: "14px 14px 0 0",
          fontFamily: mono,
          fontWeight: 500,
          fontSize: 24,
          color: fg,
          whiteSpace: "nowrap",
        }}
      >
        <Icon name={icon} size={26} color={dark ? TERM.dim : C.mute} weight={2} />
        {name}
      </div>
      {right ? (
        <div style={{ position: "absolute", right: 28, top: 0, height: TAB_H, display: "flex", alignItems: "center", fontFamily: mono, fontSize: 24, color: dark ? TERM.dim : C.mute }}>
          {right}
        </div>
      ) : null}
    </div>
  );
};

/** A focus cue: anything with a start frame and an optional end frame. */
export type Cue = { at: number; until?: number };

/**
 * Where a focus band is at `frame`, from a list of cues. The latest started cue is `cur`; when the cue before
 * it was still on screen (no `until`, or `until` >= the new `at`), the band glides from `prev` to `cur`
 * (`t` 0→1, easeInOut over `glide` frames) instead of fading out and in. `o` = band opacity (fades in on the
 * first cue of a chain, out after `until`). Null when no band is visible.
 */
export const focusTrack = <T extends Cue>(frame: number, cues: T[], glide = 10, fade = 8) => {
  const list = [...cues].sort((a, b) => a.at - b.at);
  let i = -1;
  for (let k = 0; k < list.length; k++) if (list[k].at <= frame) i = k;
  if (i < 0) return null;
  const cur = list[i];
  const linked = (k: number) => k > 0 && (list[k - 1].until === undefined || list[k - 1].until! >= list[k].at);
  let start = i;
  while (linked(start)) start--;
  const fadeIn = prog(frame, list[start].at, fade);
  const fadeOut = cur.until !== undefined ? prog(frame, cur.until, fade) : 0;
  const o = fadeIn * (1 - fadeOut);
  if (frame >= (cur.until ?? Infinity) && o <= 0) return null;
  const prev = linked(i) ? list[i - 1] : null;
  const t = prev ? prog(frame, cur.at, glide, easeInOut) : 1;
  return { cur, prev, t, o };
};

/** Mixes two tones' colours for a band gliding between cues of different tones. */
export const mixTone = (a: Tone, b: Tone, t: number, dark = false) => {
  const A = toneColors(a, dark);
  const B = toneColors(b, dark);
  if (a === b) return B;
  const m = (x: string, y: string) => interpolateColors(t, [0, 1], [x, y]);
  return { bg: m(A.bg, B.bg), edge: m(A.edge, B.edge), fg: m(A.fg, B.fg) };
};

/** Small rounded label on the right end of a band ("bug here", "added"). */
export const BandLabel: React.FC<{ text: string; color: string; bg: string; size: number; lineH: number }> = ({ text, color, bg, size, lineH }) => (
  <div
    style={{
      position: "absolute",
      right: 18,
      top: (lineH - size * 1.5) / 2,
      height: size * 1.5,
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      borderRadius: 10,
      background: bg,
      color,
      fontFamily: mono,
      fontWeight: 700,
      fontSize: size,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);
