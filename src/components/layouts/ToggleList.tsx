import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { CARD_SHADOW, presence } from "../diagram/Node";
import { GREEN } from "./Mark";
import { C, easeInOut, materialize, prog, sans } from "../../theme";

// iOS Settings switches: a white grouped card with one row per setting (icon, label, grey sub-line) and a
// switch that flips on cue (the knob glides, the track fills green). "Turn this off", privacy settings,
// git config options, "incognito on".

/** iOS switch, `p` 0 = off, 1 = on. 102×62 at scale 1. */
export const Switch: React.FC<{ p: number; scale?: number; color?: string }> = ({ p, scale = 1, color = GREEN }) => (
  <div
    style={{
      width: 102 * scale,
      height: 62 * scale,
      borderRadius: 31 * scale,
      background: interpolateColors(p, [0, 1], ["#E9E9EA", color]),
      position: "relative",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 4 * scale,
        left: (4 + p * 40) * scale,
        width: 54 * scale,
        height: 54 * scale,
        borderRadius: 27 * scale,
        background: C.white,
        boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)",
      }}
    />
  </div>
);

export type ToggleRow = { label: string; sub?: string; icon?: IconName; on?: boolean; flips?: number[]; at?: number };

/** Settings card at (x, y). Each row starts `on` or off and flips at every frame in `flips` (glide 8 frames). */
export const ToggleList: React.FC<{
  rows: ToggleRow[];
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  title?: string;
  size?: number;
  rowH?: number;
  color?: string;
}> = ({ rows, x, y, w = 900, at, until, title, size = 38, rowH = 128, color }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, ...materialize(p) }}>
      {title ? (
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: size * 0.64, color: C.mute, padding: "0 0 14px 34px" }}>{title}</div>
      ) : null}
      <div style={{ background: C.white, borderRadius: 30, border: `1px solid ${C.line}`, boxShadow: CARD_SHADOW, overflow: "hidden" }}>
        {rows.map((r, i) => {
          const rp = prog(frame, r.at ?? at + 4 + i * 4, 8);
          let s = r.on ? 1 : 0;
          for (const f of [...(r.flips ?? [])].sort((a, b) => a - b)) {
            if (frame < f) break;
            const target = s > 0.5 ? 0 : 1;
            const t = prog(frame, f, 8, easeInOut);
            s = s + (target - s) * t;
            if (t < 1) break;
          }
          return (
            <div
              key={i}
              style={{
                height: rowH,
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "0 34px",
                borderTop: i ? `1px solid ${C.line}` : undefined,
                opacity: rp,
              }}
            >
              {r.icon ? <Icon name={r.icon} size={size * 1.25} color={C.ink} weight={2} draw={prog(frame, (r.at ?? at + 4 + i * 4) + 2, 12)} /> : null}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: sans, fontWeight: 600, fontSize: size, color: C.ink, letterSpacing: "-0.01em", whiteSpace: "pre" }}>{r.label}</div>
                {r.sub ? <div style={{ fontFamily: sans, fontWeight: 500, fontSize: size * 0.62, color: C.mute, marginTop: 4, whiteSpace: "pre" }}>{r.sub}</div> : null}
              </div>
              <Switch p={s} color={color} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
