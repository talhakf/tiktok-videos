import { useCurrentFrame } from "remotion";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { DevCard, TAB_H, Tone, toneColors } from "../dev/card";
import { presence } from "../diagram/Node";

export type TimeSlice = {
  core: number; // 0-indexed core track
  proc: string;
  from: number; // start time (e.g. in ms)
  to: number; // end time (e.g. in ms)
  tone?: Tone;
  at?: number;
};

const TONE_CYCLE: Tone[] = ["accent", "good", "warn", "bad"];

/**
 * OS CPU thread/process timeline (Concurrency vs Parallelism):
 * shows 1 or multiple CPU core tracks with time-slice blocks and a moving playhead.
 */
export const ProcessScheduler: React.FC<{
  slices: TimeSlice[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  cores?: number | string[];
  totalTime?: number;
  timeUnit?: string;
  playheadAt?: number;
  playheadDur?: number;
  modeLabel?: string;
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  slices,
  x = TX,
  y = TY,
  w = TW,
  h: customH,
  at = 0,
  until,
  cores,
  totalTime: customTotal,
  timeUnit = "ms",
  playheadAt,
  playheadDur = 76,
  modeLabel,
  filename = "sched_cfs",
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const maxCore = slices.reduce((m, s) => Math.max(m, s.core), 0);
  const coreNames: string[] = Array.isArray(cores)
    ? cores
    : Array.from({ length: typeof cores === "number" ? cores : maxCore + 1 }, (_, i) => `Core ${i}`);

  const totalTime = customTotal ?? Math.max(20, ...slices.map((s) => s.to));

  // Assign a consistent tone to each unique process name if `s.tone` is not provided
  const procTones = new Map<string, Tone>();
  for (const s of slices) {
    if (!procTones.has(s.proc)) {
      procTones.set(s.proc, s.tone ?? TONE_CYCLE[procTones.size % TONE_CYCLE.length]);
    }
  }

  const tabH = filename !== undefined ? TAB_H : 0;
  const headerH = 58;
  const trackH = 74;
  const trackGap = 16;
  const axisH = 44;
  const padX = 32;
  const padBottom = 20;
  const bodyH = headerH + coreNames.length * trackH + Math.max(0, coreNames.length - 1) * trackGap + axisH + padBottom;
  const h = customH ?? tabH + bodyH;

  const labelColW = 116;
  const timelineX = padX + labelColW;
  const timelineW = w - timelineX - padX;

  const playStart = playheadAt ?? at + 12;
  const playP = prog(frame, playStart, playheadDur, easeInOut);
  const curTime = playP * totalTime;
  const playX = timelineX + playP * timelineW;
  const showPlayhead = frame >= playStart - 4;

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const defaultMode =
    coreNames.length === 1
      ? "Concurrency · 1 core time-slicing"
      : `Parallelism · ${coreNames.length} cores simultaneous`;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      filename={filename}
      icon="cpu"
      right={right ?? (modeLabel ?? defaultMode)}
      style={style}
    >
      {/* Top process legend + live time readout */}
      <div
        style={{
          position: "absolute",
          left: padX,
          right: padX,
          top: 14,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {Array.from(procTones.entries()).map(([proc, tone]) => {
            const tc = toneColors(tone, false);
            return (
              <div
                key={proc}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 12px",
                  borderRadius: 9,
                  background: tc.bg,
                  border: `1.5px solid ${tc.edge}`,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 17,
                  color: tc.fg,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: 4, background: tc.edge }} />
                {proc}
              </div>
            );
          })}
        </div>

        <div
          style={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 19,
            color: C.accent,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          t = {Math.round(curTime)} {timeUnit}
        </div>
      </div>

      {/* Core tracks */}
      {coreNames.map((coreLabel, cIdx) => {
        const topY = headerH + cIdx * (trackH + trackGap);
        const trackEnter = prog(frame, at + 4 + cIdx * 3, 10, easeOut);
        const coreSlices = slices.filter((s) => s.core === cIdx);

        return (
          <div key={coreLabel} style={{ opacity: trackEnter }}>
            {/* Core label on left */}
            <div
              style={{
                position: "absolute",
                left: padX,
                top: topY,
                width: labelColW - 12,
                height: trackH,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 23,
                  color: C.ink,
                  letterSpacing: "-0.02em",
                }}
              >
                {coreLabel}
              </span>
              <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 15, color: C.mute }}>
                hw thread #{cIdx}
              </span>
            </div>

            {/* Track background */}
            <div
              style={{
                position: "absolute",
                left: timelineX,
                top: topY,
                width: timelineW,
                height: trackH,
                borderRadius: 16,
                background: "#F5F5F7",
                border: `1.5px solid ${C.line}`,
                overflow: "hidden",
              }}
            >
              {/* Subtle vertical grid lines */}
              {ticks.slice(1, -1).map((t) => (
                <div
                  key={t}
                  style={{
                    position: "absolute",
                    left: `${t * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: "rgba(0,0,0,0.06)",
                  }}
                />
              ))}

              {/* Time slice blocks on this core */}
              {coreSlices.map((s, sIdx) => {
                const sliceEnter = prog(frame, s.at ?? at + 6 + sIdx * 2, 9, easeOut);
                const leftPx = (s.from / totalTime) * timelineW + 3;
                const widthPx = Math.max(12, ((s.to - s.from) / totalTime) * timelineW - 6);
                const tone = s.tone ?? procTones.get(s.proc) ?? "accent";
                const tc = toneColors(tone, false);
                const isRunningNow = showPlayhead && curTime >= s.from && curTime <= s.to && playP < 1;

                return (
                  <div
                    key={`${s.proc}-${s.from}`}
                    style={{
                      position: "absolute",
                      left: leftPx,
                      top: 7,
                      width: widthPx,
                      height: trackH - 14,
                      borderRadius: 12,
                      background: tc.bg,
                      border: `${isRunningNow ? 2.5 : 2}px solid ${tc.edge}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 8px",
                      boxSizing: "border-box",
                      overflow: "hidden",
                      ...materialize(sliceEnter, 0.94, 4),
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: widthPx < 85 ? 16 : 19,
                        color: tc.fg,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {s.proc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bottom time axis ticks */}
      <div
        style={{
          position: "absolute",
          left: timelineX,
          top: headerH + coreNames.length * trackH + Math.max(0, coreNames.length - 1) * trackGap + 10,
          width: timelineW,
          height: 28,
        }}
      >
        {ticks.map((t) => (
          <div
            key={t}
            style={{
              position: "absolute",
              left: `${t * 100}%`,
              translate: t === 0 ? "0% 0" : t === 1 ? "-100% 0" : "-50% 0",
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 17,
              color: C.mute,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(t * totalTime)} {timeUnit}
          </div>
        ))}
      </div>

      {/* Moving Playhead */}
      {showPlayhead ? (
        <div
          style={{
            position: "absolute",
            left: playX - 1.5,
            top: headerH - 8,
            height: coreNames.length * trackH + Math.max(0, coreNames.length - 1) * trackGap + 14,
            width: 3,
            background: C.accent,
            borderRadius: 2,
            opacity: prog(frame, playStart - 4, 6),
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -6.5,
              top: -6,
              width: 16,
              height: 16,
              borderRadius: 8,
              background: C.accent,
              border: `2.5px solid ${C.white}`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
            }}
          />
        </div>
      ) : null}
    </DevCard>
  );
};
