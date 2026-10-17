import { Easing, useCurrentFrame } from "remotion";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { alpha, BLUE_TINT, GREEN, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX, TW, TY } from "../../layout";
import { appleSpring, C, materialize, mono, prog, sans, TERM } from "../../theme";

// Cubic-Bézier & Spring easing curve inspector (linear(0,0,1,1) vs cubic-bezier(0.22, 1, 0.36, 1)):
// plots the 2D time-vs-progress graph with control handles, a sweeping playhead, and two live
// comparison pucks below showing why linear motion feels robotic while eased motion feels natural.

export type KeyframeCurveProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  playAt?: number;
  playDur?: number;
  p1?: [number, number];
  p2?: [number, number];
  showSpring?: boolean;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
};

export const KeyframeCurve: React.FC<KeyframeCurveProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 700,
  at,
  until,
  playAt,
  playDur = 54,
  p1 = [0.22, 1],
  p2 = [0.36, 1],
  showSpring = true,
  filename = "easing-inspector.css",
  right = "cubic-bezier(0.22, 1, 0.36, 1)",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const pad = 28;
  const start = playAt ?? at + 12;
  const enterP = prog(frame, at + 4, 12);

  // Sweeping time `t` from 0 -> 1 over playDur, with a brief pause before cycling
  const elapsed = Math.max(0, frame - start);
  const cycle = playDur + 20;
  const t = prog(elapsed % cycle, 0, playDur, Easing.linear);

  const bezierFn = Easing.bezier(p1[0], p1[1], p2[0], p2[1]);
  const easedY = bezierFn(t);
  const linearY = t;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const cardBg = dark ? "#262629" : "#F5F5F7";
  const plotBg = dark ? "#18181A" : C.white;
  const borderCol = dark ? "rgba(255,255,255,0.10)" : C.line;

  const accentTone = toneColors("accent", dark);
  const goodTone = toneColors("good", dark);

  // Upper area: 2D Plot on Left + Inspector Readout on Right
  const topY = 20;
  const plotCardW = 470;
  const plotCardH = 380;
  const infoX = pad + plotCardW + 20;
  const infoW = w - pad * 2 - plotCardW - 20;

  // Plot inner coordinates
  const px0 = 56;
  const py0 = 28;
  const pw = plotCardW - 84;
  const ph = plotCardH - 74;
  const toX = (u: number) => px0 + u * pw;
  const toY = (v: number) => py0 + (1 - v) * ph;

  // Spring reference path (optional overlay)
  const springPts: string[] = [];
  if (showSpring) {
    const N = 36;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const sy = Math.min(1.06, appleSpring(u * 30, 30, { response: 0.42, damping: 0.82 }));
      springPts.push(`${i === 0 ? "M" : "L"} ${toX(u).toFixed(1)} ${toY(sy).toFixed(1)}`);
    }
  }

  // Bottom area: Two Live Comparison Puck Tracks
  const tracksTop = topY + plotCardH + 20;
  const trackH = 92;
  const trackGap = 14;
  const labelColW = 240;
  const badgeColW = 136;
  const laneW = w - pad * 2 - labelColW - badgeColW - 36;
  const puckR = 16;
  const travelW = laneW - puckR * 2 - 24;

  const curveLabel = `cubic-bezier(${p1[0]}, ${p1[1]}, ${p2[0]}, ${p2[1]})`;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon="sliders" right={right} style={style}>
      {/* LEFT: 2D Time (t) vs Progress (x) Curve Graph */}
      <div
        style={{
          position: "absolute",
          left: pad,
          top: topY,
          width: plotCardW,
          height: plotCardH,
          borderRadius: 20,
          background: plotBg,
          border: `1.5px solid ${borderCol}`,
          overflow: "hidden",
          ...materialize(enterP, 0.96, 6),
        }}
      >
        <svg width={plotCardW} height={plotCardH} style={{ display: "block" }}>
          {/* Grid lines (0, 0.25, 0.5, 0.75, 1.0) */}
          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <g key={g}>
              <line
                x1={toX(0)}
                y1={toY(g)}
                x2={toX(1)}
                y2={toY(g)}
                stroke={g === 0 || g === 1 ? (dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)") : borderCol}
                strokeWidth={g === 0 || g === 1 ? 1.5 : 1}
              />
              <line
                x1={toX(g)}
                y1={toY(0)}
                x2={toX(g)}
                y2={toY(1)}
                stroke={g === 0 || g === 1 ? (dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)") : borderCol}
                strokeWidth={g === 0 || g === 1 ? 1.5 : 1}
              />
            </g>
          ))}

          {/* Diagonal Linear Reference Line (0,0) -> (1,1) */}
          <line
            x1={toX(0)}
            y1={toY(0)}
            x2={toX(1)}
            y2={toY(1)}
            stroke={mute}
            strokeWidth={3}
            strokeDasharray="7 6"
            opacity={0.65}
          />

          {/* Optional Spring Reference Curve */}
          {showSpring ? (
            <path
              d={springPts.join(" ")}
              fill="none"
              stroke={GREEN}
              strokeWidth={2.5}
              strokeDasharray="4 4"
              opacity={0.7}
            />
          ) : null}

          {/* Control Handle Tethers: (0,0)->P1 and (1,1)->P2 */}
          <line
            x1={toX(0)}
            y1={toY(0)}
            x2={toX(p1[0])}
            y2={toY(p1[1])}
            stroke={AMBER}
            strokeWidth={2.5}
          />
          <line
            x1={toX(1)}
            y1={toY(1)}
            x2={toX(p2[0])}
            y2={toY(p2[1])}
            stroke={AMBER}
            strokeWidth={2.5}
          />

          {/* Cubic-Bézier Curve */}
          <path
            d={`M ${toX(0)} ${toY(0)} C ${toX(p1[0])} ${toY(p1[1])}, ${toX(p2[0])} ${toY(p2[1])}, ${toX(1)} ${toY(1)}`}
            fill="none"
            stroke={C.accent}
            strokeWidth={5.5}
            strokeLinecap="round"
          />

          {/* Endpoints (0,0) and (1,1) */}
          <circle cx={toX(0)} cy={toY(0)} r={5.5} fill={plotBg} stroke={fg} strokeWidth={2.5} />
          <circle cx={toX(1)} cy={toY(1)} r={5.5} fill={plotBg} stroke={fg} strokeWidth={2.5} />

          {/* Control Handle Nodes P1 and P2 */}
          <circle cx={toX(p1[0])} cy={toY(p1[1])} r={8} fill={AMBER} stroke={C.white} strokeWidth={2.5} />
          <circle cx={toX(p2[0])} cy={toY(p2[1])} r={8} fill={AMBER} stroke={C.white} strokeWidth={2.5} />

          {/* Sweeping Vertical Playhead at time `t` */}
          <line
            x1={toX(t)}
            y1={toY(0)}
            x2={toX(t)}
            y2={toY(1)}
            stroke={alpha(C.accent, 0.45)}
            strokeWidth={2}
          />
          {/* Linear Playhead Dot */}
          <circle cx={toX(t)} cy={toY(linearY)} r={7} fill={mute} stroke={C.white} strokeWidth={2.5} />
          {/* Eased Playhead Dot */}
          <circle cx={toX(t)} cy={toY(easedY)} r={9.5} fill={C.accent} stroke={C.white} strokeWidth={3} />
        </svg>

        {/* Axis Labels */}
        <div style={{ position: "absolute", left: 12, top: toY(1) - 10, fontFamily: mono, fontSize: 15, color: mute }}>1.0</div>
        <div style={{ position: "absolute", left: 12, top: toY(0.5) - 10, fontFamily: mono, fontSize: 15, color: mute }}>0.5</div>
        <div style={{ position: "absolute", left: 12, top: toY(0) - 10, fontFamily: mono, fontSize: 15, color: mute }}>0.0</div>

        <div style={{ position: "absolute", left: toX(0) - 8, bottom: 10, fontFamily: mono, fontSize: 15, color: mute }}>0s</div>
        <div style={{ position: "absolute", left: toX(0.5) - 24, bottom: 10, fontFamily: mono, fontSize: 15, color: mute }}>time (t)</div>
        <div style={{ position: "absolute", left: toX(1) - 14, bottom: 10, fontFamily: mono, fontSize: 15, color: mute }}>1s</div>

        {/* Handle Callout Pills inside Plot */}
        <div
          style={{
            position: "absolute",
            left: toX(p1[0]) + 10,
            top: toY(p1[1]) + 8,
            padding: "2px 8px",
            borderRadius: 6,
            background: tint(AMBER, 0.16),
            border: `1px solid ${AMBER}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 14,
            color: "#A05A00",
          }}
        >
          P1({p1[0]}, {p1[1]})
        </div>
        <div
          style={{
            position: "absolute",
            left: toX(p2[0]) + 10,
            top: toY(p2[1]) - 6,
            padding: "2px 8px",
            borderRadius: 6,
            background: tint(AMBER, 0.16),
            border: `1px solid ${AMBER}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 14,
            color: "#A05A00",
          }}
        >
          P2({p2[0]}, {p2[1]})
        </div>
      </div>

      {/* RIGHT: Curve Inspector Readout Column */}
      <div
        style={{
          position: "absolute",
          left: infoX,
          top: topY,
          width: infoW,
          height: plotCardH,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...materialize(enterP, 0.96, 6),
        }}
      >
        {/* Eased Card */}
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 18,
            background: dark ? tint(C.accent, 0.14) : BLUE_TINT,
            border: `1.5px solid ${C.accent}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.accent }}>Ease-out curve</span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 8,
                background: C.white,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 15,
                color: C.accent,
              }}
            >
              natural
            </span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: fg, marginTop: 6 }}>{curveLabel}</div>
          <div style={{ fontFamily: sans, fontSize: 16, color: mute, marginTop: 4, lineHeight: 1.3 }}>
            Fast initial impulse, smooth deceleration into rest.
          </div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: mono,
              fontSize: 16,
              fontWeight: 700,
              color: C.accent,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>t = {t.toFixed(2)}</span>
            <span>progress = {(easedY * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Linear Card */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 18,
            background: cardBg,
            border: `1px solid ${borderCol}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, color: fg }}>Linear interpolation</span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 8,
                background: tint(C.ink, 0.07),
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 15,
                color: mute,
              }}
            >
              robotic
            </span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 16, color: mute, marginTop: 4 }}>linear(0, 0, 1, 1)</div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: mono,
              fontSize: 16,
              color: mute,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>constant Δx/Δt</span>
            <span>progress = {(linearY * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Spring Legend Pill */}
        {showSpring ? (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 14,
              background: goodTone.bg,
              border: `1px solid ${goodTone.edge}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: mono,
              fontSize: 15,
              fontWeight: 700,
              color: goodTone.fg,
            }}
          >
            <span>spring(response: 0.42, ζ: 0.82)</span>
            <span>physical</span>
          </div>
        ) : null}
      </div>

      {/* BOTTOM: Two Live Comparison Puck Tracks */}
      {[
        {
          title: "linear(0, 0, 1, 1)",
          sub: "constant velocity · mechanical start & stop",
          progVal: linearY,
          sampleFn: (u: number) => u,
          isEased: false,
          badge: "robotic",
        },
        {
          title: curveLabel,
          sub: "high initial velocity · gentle friction settle",
          progVal: easedY,
          sampleFn: bezierFn,
          isEased: true,
          badge: "natural",
        },
      ].map((tr, idx) => {
        const puckX = 12 + puckR + tr.progVal * travelW;
        const ghosts = 12;
        return (
          <div
            key={tr.title}
            style={{
              position: "absolute",
              left: pad,
              right: pad,
              top: tracksTop + idx * (trackH + trackGap),
              height: trackH,
              borderRadius: 18,
              background: tr.isEased ? (dark ? tint(C.accent, 0.14) : BLUE_TINT) : cardBg,
              border: `1.5px solid ${tr.isEased ? C.accent : borderCol}`,
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              gap: 18,
              boxSizing: "border-box",
              ...materialize(prog(frame, at + 10 + idx * 4, 10), 0.97, 4),
            }}
          >
            {/* Left Track Title */}
            <div style={{ width: labelColW, flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 18,
                  color: tr.isEased ? C.accent : fg,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tr.title}
              </div>
              <div style={{ fontFamily: sans, fontSize: 15, color: mute, marginTop: 3 }}>{tr.sub}</div>
            </div>

            {/* Center Puck Track with Stroboscopic Velocity Snapshots */}
            <div
              style={{
                position: "relative",
                width: laneW,
                height: 54,
                borderRadius: 12,
                background: plotBg,
                border: `1px solid ${borderCol}`,
                overflow: "hidden",
              }}
            >
              <svg width={laneW} height={54} style={{ display: "block" }}>
                {/* Stroboscopic spacing markers at equal time steps */}
                {Array.from({ length: ghosts + 1 }).map((_, gIdx) => {
                  const u = gIdx / ghosts;
                  const pos = tr.sampleFn(u);
                  const gx = 12 + puckR + pos * travelW;
                  const passed = u <= t + 0.001;
                  return (
                    <g key={gIdx}>
                      <line
                        x1={gx}
                        y1={40}
                        x2={gx}
                        y2={50}
                        stroke={tr.isEased ? alpha(C.accent, 0.5) : dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)"}
                        strokeWidth={1.6}
                      />
                      {passed ? (
                        <circle
                          cx={gx}
                          cy={25}
                          r={puckR * 0.62}
                          fill={tr.isEased ? C.accent : mute}
                          opacity={0.22}
                        />
                      ) : null}
                    </g>
                  );
                })}

                {/* Active Moving Puck */}
                <circle
                  cx={puckX}
                  cy={25}
                  r={puckR}
                  fill={tr.isEased ? C.accent : fg}
                  stroke={C.white}
                  strokeWidth={3}
                />
              </svg>
            </div>

            {/* Right Feel Badge */}
            <div style={{ width: badgeColW, flexShrink: 0, textAlign: "right" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: tr.isEased ? accentTone.bg : tint(C.ink, 0.06),
                  color: tr.isEased ? C.accent : mute,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 17,
                }}
              >
                {tr.badge}
              </span>
            </div>
          </div>
        );
      })}
    </DevCard>
  );
};
