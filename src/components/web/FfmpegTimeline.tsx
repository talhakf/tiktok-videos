import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type FfmpegTimelineProps = {
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  inputName: string;
  inputSize?: string;
  duration?: number;
  trim?: { start: number; end: number; at: number };
  muteAudioAt?: number;
  output?: { name: string; size: string; at: number; badge?: string };
};

const fmtTime = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

// Deterministic waveform heights (0..1) across 40 bars
const WAVE_BARS = [
  0.32, 0.58, 0.76, 0.44, 0.88, 0.65, 0.41, 0.92, 0.74, 0.52,
  0.38, 0.79, 0.95, 0.68, 0.47, 0.83, 0.61, 0.35, 0.72, 0.89,
  0.54, 0.77, 0.91, 0.63, 0.42, 0.85, 0.59, 0.71, 0.94, 0.49,
  0.66, 0.81, 0.53, 0.39, 0.75, 0.87, 0.62, 0.45, 0.57, 0.34,
];

/**
 * Video/audio stream & trim timeline card for ffmpeg workflows.
 * Animates `-ss` / `-to` trim handles, `-an` audio track stripping, and compressed output badge.
 */
export const FfmpegTimeline: React.FC<FfmpegTimelineProps> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  inputName,
  inputSize,
  duration = 60,
  trim,
  muteAudioAt,
  output,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const trimP = trim ? prog(frame, trim.at, 16, easeInOut) : 0;
  const startRatio = trim ? lerp(0, Math.max(0, Math.min(1, trim.start / duration)), trimP) : 0;
  const endRatio = trim ? lerp(1, Math.max(0, Math.min(1, trim.end / duration)), trimP) : 1;

  const muteP = muteAudioAt !== undefined ? prog(frame, muteAudioAt, 12, easeOut) : 0;
  const outP = output ? prog(frame, output.at, 12, easeOut) : 0;

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        borderRadius: 28,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        padding: "28px 34px",
        fontFamily: sans,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        ...materialize(vis),
      }}
    >
      {/* Header: input file + original size + duration */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Icon name="tape" size={30} color={C.accent} draw={prog(frame, at + 2, 12)} />
        <span style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: C.ink }}>{inputName}</span>
        {inputSize ? (
          <span
            style={{
              fontFamily: mono,
              fontSize: 22,
              fontWeight: 600,
              padding: "4px 14px",
              borderRadius: 999,
              background: C.soft,
              color: C.mute,
            }}
          >
            {inputSize}
          </span>
        ) : null}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="clock" size={22} color={C.mute} />
          <span style={{ fontFamily: mono, fontSize: 23, fontWeight: 600, color: C.mute }}>{fmtTime(duration)}</span>
        </div>
      </div>

      {/* Timecode ruler + trim flags */}
      <div style={{ position: "relative", height: 34, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {ticks.map((t) => (
          <span key={t} style={{ fontFamily: mono, fontSize: 20, fontWeight: 500, color: C.mute }}>
            {fmtTime(t * duration)}
          </span>
        ))}
        {trim && trimP > 0 ? (
          <>
            <div
              style={{
                position: "absolute",
                left: `${startRatio * 100}%`,
                top: -2,
                transform: "translateX(-50%)",
                padding: "3px 12px",
                borderRadius: 8,
                background: C.accent,
                color: C.white,
                fontFamily: mono,
                fontSize: 19,
                fontWeight: 700,
                whiteSpace: "nowrap",
                opacity: trimP,
              }}
            >
              -ss {fmtTime(trim.start)}
            </div>
            <div
              style={{
                position: "absolute",
                left: `${endRatio * 100}%`,
                top: -2,
                transform: "translateX(-50%)",
                padding: "3px 12px",
                borderRadius: 8,
                background: C.accent,
                color: C.white,
                fontFamily: mono,
                fontSize: 19,
                fontWeight: 700,
                whiteSpace: "nowrap",
                opacity: trimP,
              }}
            >
              -to {fmtTime(trim.end)}
            </div>
          </>
        ) : null}
      </div>

      {/* Timeline tracks container */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Video track (v:0) */}
        <div
          style={{
            position: "relative",
            height: 86,
            borderRadius: 18,
            background: BLUE_TINT,
            border: `2px solid ${tint(C.accent, 0.35)}`,
            overflow: "hidden",
            display: "flex",
            alignItems: " stretch",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderRight: i < 7 ? `1px solid ${tint(C.accent, 0.18)}` : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i === 0 ? (
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.accent,
                    background: "rgba(255,255,255,0.85)",
                    padding: "4px 10px",
                    borderRadius: 8,
                  }}
                >
                  v:0
                </span>
              ) : null}
            </div>
          ))}

          {/* Left & right dimmed cut regions on video */}
          {trimP > 0 ? (
            <>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${startRatio * 100}%`,
                  background: "rgba(29,29,31,0.55)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${endRatio * 100}%`,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  background: "rgba(29,29,31,0.55)",
                }}
              />
            </>
          ) : null}
        </div>

        {/* Audio waveform track (a:0) */}
        <div
          style={{
            position: "relative",
            height: 76,
            borderRadius: 18,
            background: muteP > 0 ? tint(RED, 0.08 * muteP) : C.paper,
            border: `2px solid ${muteP > 0 ? tint(RED, 0.55 * muteP) : C.line}`,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, zIndex: 1 }}>
            <Icon name="speaker" size={24} color={muteP > 0.5 ? RED : C.mute} />
            <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: muteP > 0.5 ? RED : C.mute }}>a:0</span>
          </div>

          <div style={{ flex: 1, height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 5 }}>
            {WAVE_BARS.map((h, i) => {
              const pos = (i + 0.5) / WAVE_BARS.length;
              const inTrim = pos >= startRatio && pos <= endRatio;
              const barH = Math.max(4, Math.round(lerp(h * 46, 4, muteP)));
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: barH,
                    borderRadius: 3,
                    background: muteP > 0.5 ? tint(RED, 0.45) : inTrim ? C.accent : C.mute,
                    opacity: inTrim ? 1 - 0.45 * muteP : 0.25,
                  }}
                />
              );
            })}
          </div>

          {/* Muted badge overlay for -an */}
          {muteP > 0 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...materialize(muteP, 0.94, 4),
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 20px",
                  borderRadius: 999,
                  background: C.white,
                  border: `2px solid ${RED}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <Icon name="cross" size={22} color={RED} />
                <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: RED }}>-an · audio stripped</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Active trim bracket spanning both tracks */}
        {trim && trimP > 0 ? (
          <div
            style={{
              position: "absolute",
              left: `${startRatio * 100}%`,
              width: `${Math.max(0, endRatio - startRatio) * 100}%`,
              top: -4,
              bottom: -4,
              borderRadius: 20,
              border: `4px solid ${AMBER}`,
              pointerEvents: "none",
              opacity: trimP,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 12,
                height: 44,
                borderRadius: 6,
                background: AMBER,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 12,
                height: 44,
                borderRadius: 6,
                background: AMBER,
              }}
            />
          </div>
        ) : null}
      </div>

      {/* Output result pill */}
      {output && outP > 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 22px",
            borderRadius: 20,
            background: tint(GREEN, 0.1),
            border: `1.5px solid ${tint(GREEN, 0.4)}`,
            ...materialize(outP, 0.96, 5),
          }}
        >
          <Icon name="checkCircle" size={28} color="#248A3D" draw={prog(frame, output.at + 2, 12)} />
          <span style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: C.ink }}>{output.name}</span>
          <span style={{ fontFamily: mono, fontSize: 25, fontWeight: 700, color: "#248A3D" }}>· {output.size}</span>
          {output.badge ? (
            <span
              style={{
                marginLeft: "auto",
                fontFamily: mono,
                fontSize: 22,
                fontWeight: 700,
                padding: "5px 16px",
                borderRadius: 999,
                background: tint(GREEN, 0.2),
                color: "#248A3D",
              }}
            >
              {output.badge}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
