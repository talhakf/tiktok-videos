import { interpolateColors, useCurrentFrame } from "remotion";
import { CARD_SHADOW, presence, WIRE } from "../diagram/Node";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";

// A horizontal timeline: the axis draws on from the left, events drop onto it as dots with a label
// (alternating above and below so neighbours never collide), and a blue playhead glides between values
// on cue ("1970 → today → 2038", Python releases, the history of a command), its value in a pill under
// the labels. The event under the playhead turns blue. Leave ~200 px above and below the axis.

export type TimelineEvent = { value: number; label: string; sub?: string; at: number; side?: "up" | "down" };
export type PlayheadKey = { at: number; value: number; label?: string };

/**
 * Timeline at (x, y) = left end of the axis, `w` long. `min`/`max` = the value range (years, versions…).
 * `playhead` keys move the marker (its label defaults to the value), `ticks` = labelled values under the axis.
 */
export const Timeline: React.FC<{
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  min: number;
  max: number;
  events: TimelineEvent[];
  playhead?: PlayheadKey[];
  ticks?: number[];
  size?: number;
}> = ({ x, y, w = 900, at, until, min, max, events, playhead = [], ticks = [], size = 34 }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const px = (v: number) => ((v - min) / (max - min)) * w;
  const axis = prog(frame, at, 18, easeInOut);

  // Playhead: glide between consecutive keys.
  const keys = [...playhead].sort((a, b) => a.at - b.at).filter((k) => k.at <= frame);
  let ph: { v: number; label: string; o: number } | null = null;
  if (keys.length) {
    const cur = keys[keys.length - 1];
    const prev = keys.length > 1 ? keys[keys.length - 2] : cur;
    const t = keys.length > 1 ? prog(frame, cur.at, 16, easeInOut) : 1;
    ph = { v: prev.value + (cur.value - prev.value) * t, label: t > 0.5 ? (cur.label ?? String(cur.value)) : (prev.label ?? String(prev.value)), o: prog(frame, keys[0].at, 8) };
  }
  const near = (v: number) => (ph ? Math.max(0, 1 - Math.abs(px(ph.v) - px(v)) / 30) : 0);

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 0, ...materialize(p, 0.98) }}>
      {/* axis */}
      <div style={{ position: "absolute", left: 0, top: -3, width: w * axis, height: 6, borderRadius: 3, background: "#D2D2D7" }} />
      {ticks.map((t) => (
        <div
          key={t}
          style={{
            position: "absolute",
            left: px(t) - 60,
            top: 22,
            width: 120,
            textAlign: "center",
            fontFamily: mono,
            fontWeight: 500,
            fontSize: size * 0.62,
            color: C.mute,
            opacity: prog(frame, at + (px(t) / w) * 18, 8),
          }}
        >
          {t}
        </div>
      ))}

      {events.map((e, i) => {
        if (frame < e.at) return null;
        const ep = prog(frame, e.at, 10);
        const up = (e.side ?? (i % 2 === 0 ? "up" : "down")) === "up";
        const hot = near(e.value);
        const ink = interpolateColors(hot, [0, 1], [C.ink, C.accent]);
        const stem = size * 1.6;
        return (
          <div key={i} style={{ position: "absolute", left: px(e.value), top: 0, opacity: ep }}>
            <div
              style={{
                position: "absolute",
                left: -13,
                top: -13,
                width: 26,
                height: 26,
                borderRadius: 13,
                background: interpolateColors(hot, [0, 1], [C.white, C.accent]),
                border: `5px solid ${ink}`,
                boxSizing: "border-box",
                scale: String(0.6 + 0.4 * ep),
              }}
            />
            <div style={{ position: "absolute", left: -1.5, top: up ? -stem : 13, width: 3, height: (stem - 13) * ep, background: WIRE, opacity: 0.5 }} />
            <div
              style={{
                position: "absolute",
                left: -170,
                width: 340,
                top: up ? -stem - size * (e.sub ? 2.5 : 1.4) : stem + 4,
                textAlign: "center",
                translate: `0px ${(1 - ep) * (up ? 10 : -10)}px`,
              }}
            >
              <div style={{ fontFamily: sans, fontWeight: 700, fontSize: size, letterSpacing: "-0.02em", color: ink, whiteSpace: "pre" }}>{e.label}</div>
              {e.sub ? <div style={{ fontFamily: sans, fontWeight: 600, fontSize: size * 0.66, color: C.mute, whiteSpace: "pre", marginTop: 4 }}>{e.sub}</div> : null}
            </div>
          </div>
        );
      })}

      {ph ? (
        <div style={{ position: "absolute", left: px(ph.v), top: 0, opacity: ph.o }}>
          <div style={{ position: "absolute", left: -2, top: -40, width: 4, height: size * 4.4 + 40, borderRadius: 2, background: C.accent }} />
          <div
            style={{
              position: "absolute",
              left: -80,
              width: 160,
              top: size * 4.4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                padding: "8px 18px",
                background: C.accent,
                color: C.white,
                borderRadius: 14,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: size * 0.7,
                boxShadow: CARD_SHADOW,
                whiteSpace: "pre",
              }}
            >
              {ph.label}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
