import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { AMBER } from "../dev/card";
import { alpha, CARD_SHADOW, GREEN, lerp, presence, RED } from "../diagram/Node";
import { pressDepth } from "../ui/shared";

// Realistic 48-bar voiceover waveform with speech phrases and natural breath gaps
const DEFAULT_WAVEFORM = [
  0.18, 0.42, 0.78, 0.92, 0.65, 0.84, 0.52, 0.34, 0.14, 0.12,
  0.48, 0.86, 0.96, 0.74, 0.88, 0.68, 0.45, 0.28, 0.15, 0.12,
  0.58, 0.91, 0.76, 0.84, 0.95, 0.62, 0.54, 0.79, 0.44, 0.16,
  0.14, 0.64, 0.88, 0.94, 0.72, 0.81, 0.56, 0.38, 0.18, 0.14,
  0.52, 0.85, 0.9, 0.77, 0.64, 0.42, 0.26, 0.16,
];

/**
 * Audio / Voice / Music waveform player & dB ducking card:
 * - Play/pause button that presses at `playAt`
 * - Track title, subtitle, live timecode, and `-14 LUFS` loudness badge
 * - Animated scrubhead sweeping across waveform bars from `playAt` over `playDur` frames
 * - Live dB meters showing voice level (`-6 dB`) and automatic background music ducking (`-12 dB → -24 dB`).
 */
export const AudioTrackCard: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  title?: string;
  subtitle?: string;
  lufs?: string;
  icon?: IconName;
  playAt?: number;
  playDur?: number;
  bars?: number[];
  showDucking?: boolean;
  voiceLabel?: string;
  musicLabel?: string;
  dark?: boolean;
}> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 460,
  at = 0,
  until,
  title = "voiceover-take3.wav",
  subtitle = "48 kHz · 24-bit · normalized",
  lufs = "-14.0 LUFS",
  icon = "waveform",
  playAt,
  playDur = 72,
  bars = DEFAULT_WAVEFORM,
  showDucking = true,
  voiceLabel = "Voiceover",
  musicLabel = "Background music (auto-duck)",
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vis = presence(frame, at, until, 10, 8);
  if (vis === null) return null;

  const startPlay = playAt ?? at + 14;
  const isPlaying = frame >= startPlay && frame < startPlay + playDur;
  const playFinished = frame >= startPlay + playDur;
  const playDown = pressDepth(frame, fps, startPlay, 2);

  // Linear/lightly eased scrubhead progress across the waveform
  const scrubP = prog(frame, startPlay, playDur, (t) => t);
  const currentBarIdx = Math.min(bars.length - 1, Math.floor(scrubP * bars.length));
  const currentAmp = isPlaying ? bars[currentBarIdx] : playFinished ? 0.15 : 0.12;

  // Voice is speaking when current waveform bar amplitude > 0.25 while playing
  const speakingRaw = isPlaying && currentAmp > 0.25 ? 1 : 0;
  // Smooth envelope for voice & ducking transitions
  const duckEnv = isPlaying
    ? prog(frame, startPlay + 2, 8, easeOut) * (currentAmp > 0.22 ? 1 : 0.45)
    : 0;

  // Live dB numbers
  const voiceDb = isPlaying ? Math.round(lerp(-34, -5, currentAmp)) : -48;
  const musicDb = Math.round(lerp(-11, -24, duckEnv));
  const voiceMeterFill = isPlaying ? lerp(0.12, 0.88, currentAmp) : 0.04;
  const musicMeterFill = lerp(0.68, 0.34, duckEnv);

  const bg = dark ? TERM.bg : C.white;
  const fg = dark ? TERM.fg : C.ink;
  const muteCol = dark ? TERM.dim : C.mute;
  const softCol = dark ? "#2C2C2E" : C.soft;
  const subCardBg = dark ? "#262628" : C.paper;

  const totalSec = 18;
  const curSec = Math.floor(scrubP * totalSec);
  const curMs = Math.floor(((scrubP * totalSec) % 1) * 10);
  const timeStr = `00:${String(curSec).padStart(2, "0")}.${curMs}`;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: bg,
        border: `1px solid ${C.line}`,
        boxShadow: dark ? SHADOW_WINDOW : CARD_SHADOW,
        padding: "28px 34px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: sans,
        color: fg,
        overflow: "hidden",
        ...materialize(vis),
      }}
    >
      {/* Top Row: Play/Pause button + Title + LUFS badge & timecode */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Play / Pause Button */}
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              background: interpolateColors(playDown, [0, 1], [C.accent, "#0058B0"]),
              scale: String(1 - 0.06 * playDown),
              boxShadow: "0 8px 20px rgba(0,113,227,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name={isPlaying ? "pause" : "play"} size={32} color={C.white} weight={2.4} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name={icon} size={24} color={C.accent} weight={2.2} />
              <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 500, color: muteCol }}>{subtitle}</span>
          </div>
        </div>

        {/* Right: Timecode + Target LUFS Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              background: subCardBg,
              border: `1px solid ${C.line}`,
              fontFamily: mono,
              fontSize: 22,
              fontWeight: 600,
              color: fg,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {timeStr}
          </div>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              background: alpha(GREEN, 0.14),
              border: `1.5px solid ${GREEN}`,
              fontFamily: mono,
              fontSize: 21,
              fontWeight: 700,
              color: dark ? TERM.green : "#248A3D",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {lufs}
          </div>
        </div>
      </div>

      {/* Middle Row: Waveform + sweeping scrubhead */}
      <div
        style={{
          position: "relative",
          height: showDucking ? 148 : 220,
          borderRadius: 20,
          background: subCardBg,
          border: `1px solid ${C.line}`,
          padding: "0 26px",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Center zero-crossing reference line */}
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: "50%",
            height: 1,
            background: C.line,
          }}
        />

        {/* Waveform bars */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "78%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
          }}
        >
          {bars.map((amp, i) => {
            const barPos = (i + 0.5) / bars.length;
            const passed = scrubP >= barPos;
            const dist = Math.abs(scrubP - barPos);
            const activePulse = isPlaying && dist < 0.045 ? 1 + (0.045 - dist) * 2.2 : 1;
            const barH = Math.max(12, Math.min(100, Math.round(amp * activePulse * 100)));
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${barH}%`,
                  borderRadius: 99,
                  background: passed ? C.accent : softCol,
                  opacity: passed ? 1 : 0.85,
                }}
              />
            );
          })}

          {/* Sweeping Scrubhead */}
          <div
            style={{
              position: "absolute",
              left: `${scrubP * 100}%`,
              top: -10,
              bottom: -10,
              width: 3,
              background: RED,
              transform: "translateX(-50%)",
              boxShadow: "0 0 8px rgba(255,59,48,0.35)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -2,
                left: "50%",
                width: 15,
                height: 15,
                borderRadius: 5,
                background: RED,
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Live dB Meter & Voice vs Music Ducking */}
      {showDucking ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "16px 22px",
            borderRadius: 18,
            background: subCardBg,
            border: `1px solid ${C.line}`,
          }}
        >
          {/* Voiceover dB row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 250, display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: speakingRaw ? GREEN : muteCol,
                }}
              />
              <span style={{ fontSize: 20, fontWeight: 600, color: fg }}>{voiceLabel}</span>
            </div>
            <div style={{ flex: 1, height: 16, borderRadius: 8, background: softCol, overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  width: `${Math.round(voiceMeterFill * 100)}%`,
                  height: "100%",
                  borderRadius: 8,
                  background: currentAmp > 0.88 ? AMBER : GREEN,
                }}
              />
              {/* -14 LUFS target tick */}
              <div style={{ position: "absolute", left: "72%", top: 0, bottom: 0, width: 2, background: C.ink, opacity: 0.35 }} />
            </div>
            <div
              style={{
                width: 110,
                textAlign: "right",
                fontFamily: mono,
                fontSize: 20,
                fontWeight: 700,
                color: isPlaying ? (dark ? TERM.green : "#248A3D") : muteCol,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {voiceDb} dB
            </div>
          </div>

          {/* Background Music Auto-Ducking dB row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 250, display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: duckEnv > 0.3 ? AMBER : C.accent,
                }}
              />
              <span style={{ fontSize: 19, fontWeight: 600, color: muteCol, whiteSpace: "nowrap" }}>{musicLabel}</span>
            </div>
            <div style={{ flex: 1, height: 16, borderRadius: 8, background: softCol, overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  width: `${Math.round(musicMeterFill * 100)}%`,
                  height: "100%",
                  borderRadius: 8,
                  background: interpolateColors(duckEnv, [0, 1], [C.accent, AMBER]),
                }}
              />
            </div>
            <div
              style={{
                width: 110,
                textAlign: "right",
                fontFamily: mono,
                fontSize: 20,
                fontWeight: 700,
                color: duckEnv > 0.3 ? "#A05A00" : C.accent,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {musicDb} dB
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
