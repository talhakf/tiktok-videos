import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { alpha, CARD_SHADOW, lerp, presence } from "../diagram/Node";

export type SliderKey = {
  at: number;
  value: number;
};

export type SliderSpec = {
  label: string;
  unit?: string;
  min: number;
  max: number;
  keys: SliderKey[];
  color?: string;
  decimals?: number;
  icon?: IconName;
};

/**
 * Evaluates a slider's value at `frame` by gliding smoothly (`easeInOut`, `dur` frames)
 * through each keyframe `{ at, value }`. Also returns `moving` (0→1) while actively gliding.
 */
const evalSlider = (frame: number, min: number, max: number, keys: SliderKey[], dur = 16) => {
  const sorted = [...keys].sort((a, b) => a.at - b.at);
  let val = sorted[0]?.value ?? min;
  let moving = 0;
  for (let i = 0; i < sorted.length; i++) {
    const k = sorted[i];
    if (frame < k.at) break;
    if (i === 0 && k.at <= 0) {
      val = k.value;
      continue;
    }
    const t = prog(frame, k.at, dur, easeInOut);
    val = lerp(val, k.value, t);
    if (t > 0 && t < 1) {
      moving = Math.sin(t * Math.PI);
      break;
    }
  }
  const clamped = Math.max(min, Math.min(max, val));
  const pct = max > min ? (clamped - min) / (max - min) : 0;
  return { value: clamped, pct, moving };
};

const formatSliderValue = (val: number, min: number, max: number, decimals?: number) => {
  if (decimals !== undefined) return val.toFixed(decimals);
  // Auto-detect decimal places if range is small (e.g. 0..1 or 0..2)
  if (max - min <= 2) return val.toFixed(2);
  if (max - min <= 10 && !Number.isInteger(val)) return val.toFixed(1);
  return String(Math.round(val));
};

/**
 * Interactive Apple-style parameter sliders card:
 * Each slider smoothly glides its thumb, filled track, and numeric readout across `keys`.
 */
export const SliderCard: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  title?: string;
  subtitle?: string;
  sliders: SliderSpec[];
  glideDur?: number;
}> = ({
  x = TX,
  y = TY,
  w = TW,
  h,
  at = 0,
  until,
  title,
  subtitle,
  sliders,
  glideDur = 16,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until, 10, 8);
  if (vis === null) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        padding: "34px 40px 38px",
        fontFamily: sans,
        color: C.ink,
        display: "flex",
        flexDirection: "column",
        gap: 28,
        ...materialize(vis),
      }}
    >
      {title ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 18,
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: alpha(C.accent, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="sliders" size={26} color={C.accent} weight={2.1} />
            </div>
            <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</span>
          </div>
          {subtitle ? (
            <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 500, color: C.mute }}>{subtitle}</span>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        {sliders.map((s) => {
          const col = s.color ?? C.accent;
          const { value, pct, moving } = evalSlider(frame, s.min, s.max, s.keys, glideDur);
          const numText = formatSliderValue(value, s.min, s.max, s.decimals);

          return (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Label + live numeric readout */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {s.icon ? <Icon name={s.icon} size={24} color={C.mute} weight={2} /> : null}
                  <span style={{ fontSize: 25, fontWeight: 600, letterSpacing: "-0.01em", color: C.ink }}>{s.label}</span>
                </div>
                <div
                  style={{
                    padding: "4px 14px",
                    borderRadius: 10,
                    background: moving > 0.05 ? alpha(col, 0.12) : C.paper,
                    fontFamily: mono,
                    fontSize: 24,
                    fontWeight: 700,
                    color: moving > 0.05 ? col : C.ink,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {numText}
                  {s.unit ? <span style={{ fontSize: 20, fontWeight: 500, color: C.mute, marginLeft: 3 }}>{s.unit}</span> : null}
                </div>
              </div>

              {/* Slider track + thumb */}
              <div style={{ position: "relative", height: 38, display: "flex", alignItems: "center" }}>
                {/* Background track */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 16,
                    borderRadius: 8,
                    background: C.soft,
                    overflow: "hidden",
                  }}
                >
                  {/* Filled track */}
                  <div
                    style={{
                      width: `${pct * 100}%`,
                      height: "100%",
                      borderRadius: 8,
                      background: col,
                    }}
                  />
                </div>

                {/* Gliding thumb */}
                <div
                  style={{
                    position: "absolute",
                    left: `${pct * 100}%`,
                    top: "50%",
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    background: C.white,
                    border: `2px solid ${moving > 0.05 ? col : "rgba(0,0,0,0.12)"}`,
                    boxShadow:
                      moving > 0.05
                        ? `0 6px 16px rgba(0,0,0,0.18), 0 0 0 5px ${alpha(col, 0.18 * moving)}`
                        : "0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)",
                    transform: `translate(-50%, -50%) scale(${1 + 0.08 * moving})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
