import { interpolateColors, useCurrentFrame } from "remotion";
import { C, materialize, sans } from "../../theme";
import { presence } from "../diagram/Node";
import { glide, IndexCue, under } from "./shared";

// Switching between views: the iOS segmented control (a white pill glides over a grey track) and plain
// Tabs (a blue underline glides, the chosen label turns ink). "Wi-Fi vs Ethernet", "light / dark / auto".

/**
 * iOS segmented control at (x, y), `w` × `h`, equal segments. Starts on `initial`, the pill glides
 * (easeInOut 10 frames) to each `select` cue. Hairlines between segments hide next to the pill.
 */
export const SegmentedControl: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  segments: string[];
  initial?: number;
  select?: IndexCue[];
  size?: number;
}> = ({ x, y, w = 900, h = 88, at, until, segments, initial = 0, select = [], size = 30 }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const pad = 5;
  const sw = (w - pad * 2) / segments.length;
  const s = glide(frame, initial, select);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 22,
        background: "#E3E3E8",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {segments.slice(1).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: pad + sw * (i + 1) - 0.5,
            top: h * 0.28,
            height: h * 0.44,
            width: 1.5,
            background: "rgba(0,0,0,0.14)",
            opacity: 1 - Math.max(under(s, i), under(s, i + 1)),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: pad + s * sw,
          top: pad,
          width: sw,
          height: h - pad * 2,
          borderRadius: 18,
          background: C.white,
          border: "0.5px solid rgba(0,0,0,0.04)",
          boxShadow: "0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)",
        }}
      />
      {segments.map((label, i) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: pad + i * sw,
            top: 0,
            width: sw,
            height: h,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: C.ink,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

/**
 * Text tabs at (x, y), `w` wide, equal widths, over a hairline. The blue underline glides to each `select`
 * cue; the chosen label is ink, the others grey.
 */
export const Tabs: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  tabs: string[];
  initial?: number;
  select?: IndexCue[];
  size?: number;
  color?: string;
}> = ({ x, y, w = 900, h = 84, at, until, tabs, initial = 0, select = [], size = 32, color = C.accent }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const tw = w / tabs.length;
  const s = glide(frame, initial, select);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, fontFamily: sans, borderBottom: `1.5px solid ${C.line}`, ...materialize(vis) }}>
      {tabs.map((label, i) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: i * tw,
            top: 0,
            width: tw,
            height: h,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: interpolateColors(under(s, i), [0, 1], [C.mute, C.ink]),
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ))}
      <div style={{ position: "absolute", left: s * tw + tw * 0.2, bottom: -2.5, width: tw * 0.6, height: 5, borderRadius: 3, background: color }} />
    </div>
  );
};
