import { useCurrentFrame } from "remotion";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { alpha, BLUE_TINT, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";

// Analog-to-Digital PCM Audio Sampling (44.1 kHz · 16-bit) card:
// draws a smooth continuous sine wave and overlays vertical sample stems +
// quantized digital stair-steps at `sampleAt`.

export type AudioSamplerCardProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  sampleAt?: number;
  quantizeAt?: number;
  sampleRate?: string;
  bitDepth?: string;
  samplesCount?: number;
  quantLevels?: number;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
};

// Continuous analog waveform function in [-1, 1] for normalized x in [0, 1]
const analogWave = (u: number) => {
  const rad = u * Math.PI * 2.2;
  return Math.max(-0.96, Math.min(0.96, 0.78 * Math.sin(rad) + 0.24 * Math.sin(rad * 2.0 + 0.35)));
};

export const AudioSamplerCard: React.FC<AudioSamplerCardProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 680,
  at,
  until,
  sampleAt,
  quantizeAt,
  sampleRate = "44.1 kHz",
  bitDepth = "16-bit PCM",
  samplesCount = 20,
  quantLevels = 8,
  filename = "adc-pcm-sampler.wav",
  right = "44.1 kHz · 16-bit",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const pad = 28;
  const sAt = sampleAt ?? at + 22;
  const qAt = quantizeAt ?? sAt + 14;

  const analogP = prog(frame, at + 4, 20, easeInOut);
  const sampleP = prog(frame, sAt, 18, easeInOut);
  const quantP = prog(frame, qAt, 18, easeInOut);

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const cardBg = dark ? "#262629" : "#F5F5F7";
  const plotBg = dark ? "#18181A" : C.white;
  const borderCol = dark ? "rgba(255,255,255,0.10)" : C.line;

  const accentTone = toneColors("accent", dark);
  const goodTone = toneColors("good", dark);
  const warnTone = toneColors("warn", dark);

  // Stage header bar
  const topY = 18;
  const topH = 56;

  // Main waveform oscilloscope box
  const plotTop = topY + topH + 14;
  const plotW = w - pad * 2;
  const plotH = 356;

  // Inner plot coordinates
  const px0 = 104;
  const px1 = plotW - 28;
  const py0 = 26;
  const py1 = plotH - 38;
  const midY = (py0 + py1) / 2;
  const ampH = (py1 - py0) / 2;

  const xAt = (u: number) => px0 + u * (px1 - px0);
  const yAt = (val: number) => midY - val * ampH;

  // Quantize a continuous value in [-1, 1] to `quantLevels` discrete steps
  const quantize = (val: number) => Math.round(val * (quantLevels / 2)) / (quantLevels / 2);

  // Build smooth continuous SVG path up to analogP
  const analogPts: string[] = [];
  const curveSteps = 140;
  const maxStep = Math.max(1, Math.round(curveSteps * analogP));
  for (let i = 0; i <= maxStep; i++) {
    const u = i / curveSteps;
    const vx = xAt(u);
    const vy = yAt(analogWave(u));
    analogPts.push(`${i === 0 ? "M" : "L"} ${vx.toFixed(1)} ${vy.toFixed(1)}`);
  }

  // Discrete sample points
  const samples = Array.from({ length: samplesCount + 1 }).map((_, i) => {
    const u = i / samplesCount;
    const raw = analogWave(u);
    const q = quantize(raw);
    const pcm16 = Math.max(-32768, Math.min(32767, Math.round(q * 32767)));
    const unsigned16 = pcm16 < 0 ? 65536 + pcm16 : pcm16;
    const hex = `0x${unsigned16.toString(16).toUpperCase().padStart(4, "0")}`;
    return { i, u, raw, q, pcm16, hex, sx: xAt(u), sy: yAt(q), rawY: yAt(raw) };
  });

  // Build quantized digital stair-step path (Zero-Order Hold)
  const stairPts: string[] = [];
  const visibleStairs = Math.floor(samples.length * quantP);
  for (let i = 0; i < visibleStairs; i++) {
    const cur = samples[i];
    const next = samples[Math.min(samples.length - 1, i + 1)];
    if (i === 0) {
      stairPts.push(`M ${cur.sx.toFixed(1)} ${cur.sy.toFixed(1)}`);
    }
    stairPts.push(`H ${next.sx.toFixed(1)}`);
    if (i + 1 < visibleStairs) {
      stairPts.push(`V ${next.sy.toFixed(1)}`);
    }
  }

  // Bottom PCM Sample Buffer Strip
  const bufTop = plotTop + plotH + 14;
  const bufH = h - (filename !== undefined ? TAB_H : 0) - bufTop - 20;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon="waveform" right={right} style={style}>
      {/* TOP: 3-Stage ADC Pipeline Bar */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: topY,
          height: topH,
          borderRadius: 16,
          background: cardBg,
          border: `1px solid ${borderCol}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          opacity: prog(frame, at + 2, 10),
        }}
      >
        {[
          { step: "1. Analog V(t)", sub: "continuous wave", active: true, tone: accentTone, col: fg },
          {
            step: `2. Sample @ ${sampleRate}`,
            sub: "Δt = 22.7 µs stems",
            active: sampleP > 0.05,
            tone: accentTone,
            col: C.accent,
          },
          {
            step: `3. Quantize @ ${bitDepth}`,
            sub: "65,536 stair levels",
            active: quantP > 0.05,
            tone: goodTone,
            col: GREEN,
          },
        ].map((st, idx) => (
          <div
            key={st.step}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: st.active ? 1 : 0.45,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: st.active ? st.col : mute,
              }}
            />
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 19, color: fg }}>{st.step}</span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 6,
                background: st.active ? st.tone.bg : tint(C.ink, 0.05),
                color: st.active ? st.tone.fg : mute,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {st.sub}
            </span>
            {idx < 2 ? (
              <span style={{ fontFamily: mono, fontSize: 18, color: mute, marginLeft: 6 }}>→</span>
            ) : null}
          </div>
        ))}
      </div>

      {/* CENTER: Oscilloscope Waveform + Stems + Quantized Stair-Steps */}
      <div
        style={{
          position: "absolute",
          left: pad,
          top: plotTop,
          width: plotW,
          height: plotH,
          borderRadius: 20,
          background: plotBg,
          border: `1.5px solid ${quantP > 0.3 ? GREEN : sampleP > 0.3 ? C.accent : borderCol}`,
          overflow: "hidden",
          ...materialize(prog(frame, at + 4, 12), 0.97, 5),
        }}
      >
        <svg width={plotW} height={plotH} style={{ display: "block" }}>
          {/* Horizontal 16-bit Quantization Gridlines */}
          {Array.from({ length: quantLevels + 1 }).map((_, qIdx) => {
            const qVal = 1 - (qIdx / quantLevels) * 2;
            const gy = yAt(qVal);
            const isZero = Math.abs(qVal) < 0.001;
            return (
              <line
                key={qIdx}
                x1={px0}
                y1={gy}
                x2={px1}
                y2={gy}
                stroke={isZero ? (dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.24)") : borderCol}
                strokeWidth={isZero ? 2 : 1}
                strokeDasharray={isZero ? undefined : "4 4"}
                opacity={isZero ? 1 : lerp(0.35, 1, sampleP)}
              />
            );
          })}

          {/* Layer 1: Continuous Analog Sine Wave */}
          <path
            d={analogPts.join(" ")}
            fill="none"
            stroke={sampleP > 0.2 ? alpha(fg, 0.38) : fg}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Layer 2: Vertical Sample Stems (Lollipop Stems) at sampleAt */}
          {sampleP > 0
            ? samples.map((s) => {
                const stemAppear = prog(frame, sAt + s.i * 0.6, 10);
                if (stemAppear <= 0) return null;
                const curY = lerp(midY, s.sy, stemAppear);
                return (
                  <g key={s.i} opacity={stemAppear}>
                    <line
                      x1={s.sx}
                      y1={midY}
                      x2={s.sx}
                      y2={curY}
                      stroke={C.accent}
                      strokeWidth={2.5}
                    />
                    <circle
                      cx={s.sx}
                      cy={curY}
                      r={5.5}
                      fill={C.accent}
                      stroke={C.white}
                      strokeWidth={2}
                    />
                  </g>
                );
              })
            : null}

          {/* Layer 3: Quantized Digital Stair-Step (Zero-Order Hold) at quantizeAt */}
          {quantP > 0 && stairPts.length > 1 ? (
            <path
              d={stairPts.join(" ")}
              fill="none"
              stroke={GREEN}
              strokeWidth={3.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={quantP}
            />
          ) : null}
        </svg>

        {/* Y-Axis 16-bit Signed PCM Level Labels */}
        {[
          { v: 1, label: "+32767" },
          { v: 0.5, label: "+16384" },
          { v: 0, label: "0" },
          { v: -0.5, label: "-16384" },
          { v: -1, label: "-32768" },
        ].map((tk) => (
          <div
            key={tk.label}
            style={{
              position: "absolute",
              left: 14,
              top: yAt(tk.v) - 10,
              width: px0 - 24,
              textAlign: "right",
              fontFamily: mono,
              fontWeight: tk.v === 0 ? 700 : 500,
              fontSize: 15,
              color: tk.v === 0 ? fg : mute,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {tk.label}
          </div>
        ))}

        {/* X-Axis Sample Index Labels */}
        {[0, 4, 8, 12, 16, 20].map((nIdx) => (
          <div
            key={nIdx}
            style={{
              position: "absolute",
              left: xAt(nIdx / samplesCount),
              bottom: 8,
              translate: "-50% 0",
              fontFamily: mono,
              fontSize: 14,
              color: mute,
            }}
          >
            n[{nIdx}]
          </div>
        ))}

        {/* Top-Right Nyquist / Quantization Callout Badge */}
        {sampleP > 0.3 ? (
          <div
            style={{
              position: "absolute",
              right: 16,
              top: 14,
              padding: "6px 12px",
              borderRadius: 10,
              background: quantP > 0.3 ? goodTone.bg : BLUE_TINT,
              border: `1px solid ${quantP > 0.3 ? GREEN : C.accent}`,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 15,
              color: quantP > 0.3 ? goodTone.fg : C.accent,
              ...materialize(sampleP, 0.94, 4),
            }}
          >
            {quantP > 0.3 ? "PCM stair-step · ε = quantization error" : `Nyquist ≤ 22.05 kHz (${sampleRate})`}
          </div>
        ) : null}
      </div>

      {/* BOTTOM: 16-bit Signed PCM Byte Stream Buffer */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: bufTop,
          height: bufH,
          borderRadius: 18,
          background: cardBg,
          border: `1.5px solid ${borderCol}`,
          padding: "12px 18px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...materialize(prog(frame, at + 12, 12), 0.97, 5),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 19, color: fg }}>
            Quantized 16-bit PCM sample buffer (signed int16)
          </span>
          <span style={{ fontFamily: mono, fontSize: 15, color: warnTone.fg, fontWeight: 700 }}>
            44,100 samples/s × 2 bytes = 88.2 KB/s per channel
          </span>
        </div>

        {/* 8 Sample Cells */}
        <div style={{ display: "flex", gap: 10 }}>
          {samples.slice(1, 9).map((s, idx) => {
            const active = sampleP > idx / 9;
            return (
              <div
                key={s.i}
                style={{
                  flex: 1,
                  padding: "8px 6px",
                  borderRadius: 12,
                  background: active ? (dark ? tint(C.accent, 0.16) : C.white) : plotBg,
                  border: `1.5px solid ${active ? C.accent : borderCol}`,
                  textAlign: "center",
                  opacity: active ? 1 : 0.45,
                }}
              >
                <div style={{ fontFamily: mono, fontSize: 13, color: mute }}>n[{s.i}]</div>
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 16,
                    color: active ? C.accent : fg,
                    marginTop: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.pcm16 >= 0 ? `+${s.pcm16}` : s.pcm16}
                </div>
                <div style={{ fontFamily: mono, fontSize: 13, color: quantP > 0.3 ? goodTone.fg : mute, marginTop: 2 }}>
                  {s.hex}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DevCard>
  );
};
