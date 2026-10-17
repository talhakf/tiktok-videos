import { useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { alpha, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";

// Video compression GOP (I-frame, P-frame, B-frame) strip (H.264 / HEVC / AV1):
// shows a full keyframe I (420 KB) followed by tiny motion-delta frames P (18 KB) and B (6 KB),
// with a `dropIframeAt` cue showing how losing an I-frame causes motion vectors to smear (datamoshing).

export type GopFrame = {
  type: "I" | "P" | "B";
  index: number;
  sizeKb: number;
};

export type VideoCodecFramesProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  dropIframeAt?: number;
  gop?: GopFrame[];
  codec?: string;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
};

const DEFAULT_GOP: GopFrame[] = [
  { type: "I", index: 0, sizeKb: 420 },
  { type: "B", index: 1, sizeKb: 6 },
  { type: "B", index: 2, sizeKb: 6 },
  { type: "P", index: 3, sizeKb: 18 },
  { type: "B", index: 4, sizeKb: 6 },
  { type: "B", index: 5, sizeKb: 5 },
  { type: "P", index: 6, sizeKb: 16 },
];

export const VideoCodecFrames: React.FC<VideoCodecFramesProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 700,
  at,
  until,
  dropIframeAt,
  gop = DEFAULT_GOP,
  codec = "H.264 / HEVC / AV1",
  filename = "gop-stream.mp4",
  right,
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const pad = 28;
  const dropP = dropIframeAt !== undefined ? prog(frame, dropIframeAt, 14, easeInOut) : 0;
  const isDropped = dropP > 0.25;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const cardBg = dark ? "#262629" : "#F5F5F7";
  const innerBg = dark ? "#18181A" : C.white;
  const borderCol = dark ? "rgba(255,255,255,0.10)" : C.line;

  const badTone = toneColors("bad", dark);
  const warnTone = toneColors("warn", dark);
  const goodTone = toneColors("good", dark);
  const accentTone = toneColors("accent", dark);

  // Top section: GOP Strip
  const gopTop = 20;
  const gopH = 290;
  const n = gop.length;
  const slotGap = 12;
  const innerW = w - pad * 2 - 36;
  const slotW = (innerW - slotGap * (n - 1)) / n;
  const slotX = (i: number) => 18 + i * (slotW + slotGap) + slotW / 2;

  // Bottom section: Decoded Preview + Frame-Type Breakdown
  const botTop = gopTop + gopH + 18;
  const botH = h - (filename !== undefined ? TAB_H : 0) - botTop - 22;
  const previewW = 420;
  const legendW = w - pad * 2 - previewW - 20;

  const typeColor = (t: "I" | "P" | "B", idx: number) => {
    if (idx === 0 && isDropped) return RED;
    if (t === "I") return C.accent;
    if (t === "P") return AMBER;
    return GREEN;
  };

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="film"
      right={right ?? codec}
      style={style}
    >
      {/* TOP: GOP Strip Container */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: gopTop,
          height: gopH,
          borderRadius: 20,
          background: cardBg,
          border: `1.5px solid ${isDropped ? alpha(RED, 0.5) : borderCol}`,
          padding: "14px 18px",
          boxSizing: "border-box",
          ...materialize(prog(frame, at + 2, 12), 0.97, 5),
        }}
      >
        {/* Strip Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: fg, letterSpacing: "-0.02em" }}>
              Group of Pictures (GOP)
            </span>
            <span style={{ fontFamily: mono, fontSize: 16, color: mute }}>
              I = keyframe · P = forward delta · B = bi-directional delta
            </span>
          </div>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 8,
              background: isDropped ? badTone.bg : accentTone.bg,
              color: isDropped ? badTone.fg : accentTone.fg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {isDropped ? "I₀ LOST → reference broken!" : "96% compression"}
          </span>
        </div>

        {/* Prediction Dependency Arcs SVG */}
        <svg
          width={w - pad * 2}
          height={46}
          style={{ position: "absolute", left: 0, top: 44, overflow: "visible" }}
        >
          {[
            { from: 0, to: 3, h: 32, broken: isDropped },
            { from: 0, to: 1, h: 18, broken: isDropped },
            { from: 3, to: 1, h: 16, broken: false },
            { from: 3, to: 2, h: 16, broken: false },
            { from: 3, to: 6, h: 30, broken: false },
            { from: 3, to: 4, h: 16, broken: false },
            { from: 6, to: 5, h: 16, broken: false },
          ].map((arc, aIdx) => {
            const x1 = slotX(arc.from);
            const x2 = slotX(arc.to);
            const mx = (x1 + x2) / 2;
            const yBase = 42;
            const draw = prog(frame, at + 10 + aIdx * 2, 12);
            const stroke = arc.broken ? RED : arc.to === 3 || arc.to === 6 ? AMBER : GREEN;
            return (
              <path
                key={aIdx}
                d={`M ${x1} ${yBase} Q ${mx} ${yBase - arc.h} ${x2} ${yBase}`}
                fill="none"
                stroke={stroke}
                strokeWidth={2.2}
                strokeDasharray={arc.broken ? "5 4" : undefined}
                opacity={draw * 0.85}
              />
            );
          })}
        </svg>

        {/* 7 GOP Frame Cards */}
        {gop.map((f, idx) => {
          const itemEnter = prog(frame, at + 4 + idx * 2, 10);
          const col = typeColor(f.type, idx);
          const droppedI = idx === 0 && isDropped;
          const smeared = idx > 0 && isDropped;
          const barFrac = Math.max(0.09, Math.min(1, f.sizeKb / 420));

          return (
            <div
              key={f.index}
              style={{
                position: "absolute",
                left: 18 + idx * (slotW + slotGap),
                top: 88,
                width: slotW,
                height: 184,
                borderRadius: 14,
                background: droppedI ? (dark ? tint(RED, 0.18) : "#FFF1F0") : innerBg,
                border: `2px solid ${col}`,
                padding: "8px 8px 10px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                ...materialize(itemEnter, 0.94, 4),
              }}
            >
              {/* Frame Type Header Badge */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: tint(col, 0.16),
                    color: col,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {f.type}
                  <sub style={{ fontSize: 12 }}>{f.index}</sub>
                </span>
                <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: droppedI ? RED : mute }}>
                  {droppedI ? "ERR" : f.type === "I" ? "FULL" : "ΔMV"}
                </span>
              </div>

              {/* Miniature Visual Representation (Full image for I vs Δ vectors for P/B) */}
              <div
                style={{
                  width: "100%",
                  height: 68,
                  borderRadius: 8,
                  background: f.type === "I" && !droppedI ? tint(C.accent, 0.14) : dark ? "#222225" : "#F2F2F6",
                  border: `1px solid ${borderCol}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {droppedI ? (
                  <svg width={slotW - 20} height={68} viewBox="0 0 80 68">
                    <line x1={18} y1={14} x2={62} y2={54} stroke={RED} strokeWidth={4} strokeLinecap="round" />
                    <line x1={62} y1={14} x2={18} y2={54} stroke={RED} strokeWidth={4} strokeLinecap="round" />
                  </svg>
                ) : f.type === "I" ? (
                  <svg width={slotW - 20} height={68} viewBox="0 0 80 68">
                    {/* Full scene miniature */}
                    <rect x={0} y={44} width={80} height={24} fill={alpha(C.accent, 0.28)} />
                    <circle cx={28} cy={28} r={13} fill={C.accent} />
                    <rect x={48} y={20} width={20} height={24} rx={4} fill={alpha(C.ink, 0.55)} />
                  </svg>
                ) : (
                  <svg width={slotW - 20} height={68} viewBox="0 0 80 68">
                    {/* Motion delta vectors */}
                    <line x1={18} y1={28} x2={38} y2={28} stroke={smeared ? RED : col} strokeWidth={2.5} strokeLinecap="round" />
                    <polyline points="33,23 39,28 33,33" fill="none" stroke={smeared ? RED : col} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    <line x1={44} y1={42} x2={62} y2={36} stroke={smeared ? RED : col} strokeWidth={2.2} strokeLinecap="round" />
                    <circle cx={18} cy={28} r={3} fill={smeared ? RED : col} />
                  </svg>
                )}
              </div>

              {/* Relative Byte Size Bar + KB Label */}
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    height: 10,
                    borderRadius: 5,
                    background: dark ? "#333336" : "#E5E5EA",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(droppedI ? 0 : barFrac) * 100}%`,
                      height: "100%",
                      borderRadius: 5,
                      background: col,
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 5,
                    textAlign: "center",
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 16,
                    color: droppedI ? RED : fg,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {droppedI ? "0 KB (lost)" : `${f.sizeKb} KB`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM LEFT: Decoded Output & Macroblock Motion Vector Inspector (Normal vs Datamosh) */}
      <div
        style={{
          position: "absolute",
          left: pad,
          top: botTop,
          width: previewW,
          height: botH,
          borderRadius: 20,
          background: isDropped ? (dark ? tint(RED, 0.14) : "#FFF5F4") : cardBg,
          border: `1.5px solid ${isDropped ? RED : borderCol}`,
          padding: "14px 16px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...materialize(prog(frame, at + 12, 12), 0.97, 5),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, color: fg }}>
            {isDropped ? "Decoder output (datamoshed)" : "Decoder output (16×16 macroblocks)"}
          </span>
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 7,
              background: isDropped ? badTone.bg : goodTone.bg,
              color: isDropped ? badTone.fg : goodTone.fg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {isDropped ? "SMEAR" : "CLEAN"}
          </span>
        </div>

        {/* Macroblock Viewport */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: botH - 86,
            borderRadius: 14,
            background: innerBg,
            border: `1px solid ${borderCol}`,
            overflow: "hidden",
          }}
        >
          {(() => {
            const vw = previewW - 32;
            const vh = botH - 86;
            const cols = 8;
            const rows = 4;
            const bw = vw / cols;
            const bh = vh / rows;
            const subjectShift = ((frame - at) % 45) * 1.4;

            return (
              <svg width={vw} height={vh} style={{ display: "block" }}>
                {/* Clean reference scene when I-frame is intact */}
                <rect x={0} y={vh * 0.62} width={vw} height={vh * 0.38} fill={alpha(C.accent, 0.15)} />
                <circle
                  cx={110 + subjectShift + dropP * 28}
                  cy={vh * 0.48}
                  r={38}
                  fill={isDropped ? alpha(RED, 0.45) : C.accent}
                />

                {/* Datamoshed smeared macroblocks when I-frame is dropped */}
                {dropP > 0
                  ? Array.from({ length: 14 }).map((_, k) => {
                      const gx = ((k * 3) % cols) * bw;
                      const gy = ((k * 2) % rows) * bh;
                      const dx = ((k % 3) - 1) * 26 * dropP;
                      const dy = ((k % 2) * 2 - 1) * 14 * dropP;
                      const blockCol = k % 3 === 0 ? C.accent : k % 3 === 1 ? AMBER : RED;
                      return (
                        <rect
                          key={k}
                          x={gx + dx}
                          y={gy + dy}
                          width={bw + 4}
                          height={bh + 2}
                          fill={alpha(blockCol, 0.42 * dropP)}
                          stroke={RED}
                          strokeWidth={1.2}
                        />
                      );
                    })
                  : null}

                {/* 16x16 Macroblock Grid Overlay & Motion Vectors (Δx, Δy) */}
                {Array.from({ length: cols }).map((_, c) =>
                  Array.from({ length: rows }).map((__, r) => {
                    const bx = c * bw;
                    const by = r * bh;
                    const cx = bx + bw / 2;
                    const cy = by + bh / 2;
                    const hasMv = (c >= 2 && c <= 5 && r >= 1 && r <= 2) || isDropped;
                    const mvLen = isDropped ? 22 : 14;
                    return (
                      <g key={`${c}-${r}`}>
                        <rect
                          x={bx}
                          y={by}
                          width={bw}
                          height={bh}
                          fill="none"
                          stroke={isDropped ? alpha(RED, 0.28) : "rgba(0,0,0,0.08)"}
                          strokeWidth={1}
                        />
                        {hasMv ? (
                          <g>
                            <line
                              x1={cx - mvLen / 2}
                              y1={cy}
                              x2={cx + mvLen / 2}
                              y2={cy + (isDropped ? (r % 2 === 0 ? -7 : 7) : 0)}
                              stroke={isDropped ? RED : GREEN}
                              strokeWidth={2.2}
                              strokeLinecap="round"
                            />
                            <circle cx={cx - mvLen / 2} cy={cy} r={2.5} fill={isDropped ? RED : GREEN} />
                          </g>
                        ) : null}
                      </g>
                    );
                  }),
                )}
              </svg>
            );
          })()}
        </div>

        <div style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: isDropped ? badTone.fg : mute }}>
          {isDropped ? "P/B vectors push wrong pixels without I₀!" : "MV(Δx, Δy) shifts 16×16 blocks from I₀"}
        </div>
      </div>

      {/* BOTTOM RIGHT: GOP Frame-Type Breakdown */}
      <div
        style={{
          position: "absolute",
          left: pad + previewW + 20,
          top: botTop,
          width: legendW,
          height: botH,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...materialize(prog(frame, at + 14, 12), 0.97, 5),
        }}
      >
        {[
          {
            badge: "I-frame",
            name: "Intra keyframe",
            size: isDropped ? "DROPPED" : "420 KB",
            desc: isDropped
              ? "Missing keyframe! Every dependent P & B frame corrupts."
              : "Full independent image (like a JPEG). Anchors the GOP.",
            tone: isDropped ? badTone : accentTone,
            col: isDropped ? RED : C.accent,
          },
          {
            badge: "P-frame",
            name: "Predicted delta",
            size: "18 KB",
            desc: "Stores only forward motion vectors (Δx, Δy) from previous I/P.",
            tone: warnTone,
            col: AMBER,
          },
          {
            badge: "B-frame",
            name: "Bi-directional",
            size: "6 KB",
            desc: "Interpolates between past & future frames (98.5% smaller!).",
            tone: goodTone,
            col: GREEN,
          },
        ].map((row) => (
          <div
            key={row.badge}
            style={{
              padding: "11px 16px",
              borderRadius: 16,
              background: cardBg,
              border: `1.5px solid ${row.badge === "I-frame" && isDropped ? RED : borderCol}`,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    padding: "2px 9px",
                    borderRadius: 6,
                    background: row.tone.bg,
                    color: row.tone.fg,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {row.badge}
                </span>
                <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 18, color: fg }}>{row.name}</span>
              </div>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 17, color: row.col }}>{row.size}</span>
            </div>
            <div style={{ fontFamily: sans, fontSize: 15, color: mute, lineHeight: 1.25 }}>{row.desc}</div>
          </div>
        ))}
      </div>
    </DevCard>
  );
};
