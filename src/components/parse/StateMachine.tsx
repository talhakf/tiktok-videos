import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

// Finite State Machine (FSM) diagram & character-by-character tape simulator:
// Renders states (`id, label, x, y, accept?: boolean`) and transitions (`from, to, label`),
// plus an `input: string` tape at the top that steps character by character starting at `stepAt`
// (`fpc?: number`), lighting up the active state and transition arrow, and ending in
// green `Accepted` or red `Rejected`.

export type FsmState = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  accept?: boolean;
  initial?: boolean;
};

export type FsmTransition = {
  from: string;
  to: string;
  label: string;
  match?: string | RegExp | ((ch: string) => boolean);
  bend?: number;
};

const matchChar = (t: FsmTransition, ch: string): boolean => {
  if (typeof t.match === "function") return t.match(ch);
  if (t.match instanceof RegExp) return t.match.test(ch);
  if (typeof t.match === "string") {
    if (t.match.startsWith("[") || t.match.startsWith("\\")) {
      try {
        return new RegExp(`^${t.match}$`).test(ch);
      } catch {
        return t.match.includes(ch);
      }
    }
    return t.match.includes(ch);
  }
  const lbl = t.label.trim();
  if (lbl === ch) return true;
  if (lbl === "digit" || lbl === "0-9" || lbl === "\\d") return /^[0-9]$/.test(ch);
  if (lbl === "letter" || lbl === "a-z" || lbl === "A-Z") return /^[a-zA-Z]$/.test(ch);
  if (lbl.startsWith("[") && lbl.endsWith("]")) {
    try {
      return new RegExp(`^${lbl}$`).test(ch);
    } catch {
      return false;
    }
  }
  if (lbl.includes(",") || lbl.includes("|")) {
    const parts = lbl.split(/[,|]/).map((s) => s.trim());
    return parts.includes(ch);
  }
  return false;
};

export const StateMachine: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  states: FsmState[];
  transitions: FsmTransition[];
  input: string;
  initialState?: string;
  stepAt?: number;
  fpc?: number;
  dark?: boolean;
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  x = 90,
  y,
  w = 900,
  h = 560,
  at = 0,
  until,
  states,
  transitions,
  input,
  initialState,
  stepAt,
  fpc = 14,
  dark = false,
  filename = "fsm.ts",
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const byId = new Map<string, FsmState>();
  states.forEach((s) => byId.set(s.id, s));

  const startId = initialState ?? states.find((s) => s.initial)?.id ?? states[0]?.id ?? "";
  const simStart = stepAt ?? at + 16;

  // Deterministically simulate the input string on the FSM
  type StepRecord = {
    charIndex: number;
    ch: string;
    fromState: string;
    toState: string;
    transitionIndex: number; // -1 if rejected (no matching transition)
    startFrame: number;
    endFrame: number;
  };

  const steps: StepRecord[] = [];
  let curState = startId;
  let haltedEarly = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const sf = simStart + i * fpc;
    const ef = sf + fpc;
    const tIdx = transitions.findIndex((t) => t.from === curState && matchChar(t, ch));
    if (tIdx >= 0) {
      const nextState = transitions[tIdx].to;
      steps.push({
        charIndex: i,
        ch,
        fromState: curState,
        toState: nextState,
        transitionIndex: tIdx,
        startFrame: sf,
        endFrame: ef,
      });
      curState = nextState;
    } else {
      steps.push({
        charIndex: i,
        ch,
        fromState: curState,
        toState: curState,
        transitionIndex: -1,
        startFrame: sf,
        endFrame: ef,
      });
      haltedEarly = true;
      break;
    }
  }

  const verdictAt = simStart + steps.length * fpc;
  const isFinished = frame >= verdictAt;
  const accepted = !haltedEarly && Boolean(byId.get(curState)?.accept);
  const verdictP = prog(frame, verdictAt, 10, easeOut);

  // Determine current active step, active state, and active transition at `frame`
  let activeStepIdx = -1;
  for (let i = 0; i < steps.length; i++) {
    if (frame >= steps[i].startFrame && frame < steps[i].endFrame) {
      activeStepIdx = i;
      break;
    }
  }

  const activeStep = activeStepIdx >= 0 ? steps[activeStepIdx] : null;
  let activeStateId = startId;
  if (frame < simStart) {
    activeStateId = startId;
  } else if (activeStep) {
    const stepT = prog(frame, activeStep.startFrame, fpc, easeInOut);
    activeStateId = stepT < 0.55 ? activeStep.fromState : activeStep.toState;
  } else if (isFinished && steps.length > 0) {
    activeStateId = steps[steps.length - 1].toState;
  }

  // Smooth tape cursor index
  let cursorPos = 0;
  if (steps.length > 0) {
    if (frame <= simStart) {
      cursorPos = 0;
    } else if (frame >= verdictAt) {
      cursorPos = steps[steps.length - 1].charIndex;
    } else {
      const raw = (frame - simStart) / fpc;
      const idx = Math.min(steps.length - 1, Math.floor(raw));
      const prevIdx = Math.max(0, idx - 1);
      const glide = prog(frame, steps[idx].startFrame, Math.min(8, fpc * 0.6), easeInOut);
      cursorPos = idx === 0 ? 0 : lerp(prevIdx, idx, glide);
    }
  }

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const subBg = dark ? "rgba(255,255,255,0.05)" : "#F6F6F9";
  const borderCol = dark ? "rgba(255,255,255,0.1)" : C.line;

  const tapeBarH = 104;
  const canvasH = h - (filename !== undefined ? TAB_H : 0) - tapeBarH;
  const R = 56; // State circle radius
  const cellW = 54;
  const cellGap = 8;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="sliders"
      right={right ?? `state: ${activeStateId}`}
      style={style}
    >
      {/* 1. Top Input Tape Bar + Accepted/Rejected Verdict Pill */}
      <div
        style={{
          height: tapeBarH,
          padding: "0 28px",
          borderBottom: `1px solid ${borderCol}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 600, color: mute }}>input tape</span>

          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: cellGap }}>
            {/* Gliding active character cursor frame */}
            {frame >= simStart - 4 && steps.length > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: cursorPos * (cellW + cellGap) - 3,
                  top: -3,
                  width: cellW + 6,
                  height: 60 + 6,
                  borderRadius: 15,
                  border: `3px solid ${
                    isFinished
                      ? accepted
                        ? GREEN
                        : RED
                      : activeStep && activeStep.transitionIndex === -1
                        ? RED
                        : C.accent
                  }`,
                  pointerEvents: "none",
                  zIndex: 4,
                  ...materialize(prog(frame, simStart - 4, 8)),
                }}
              />
            ) : null}

            {input.split("").map((ch, i) => {
              const stepForChar = steps.find((s) => s.charIndex === i);
              const started = stepForChar ? frame >= stepForChar.startFrame : false;
              const finished = stepForChar ? frame >= stepForChar.endFrame : false;
              const failedHere = stepForChar ? stepForChar.transitionIndex === -1 && started : false;

              const cellBg = failedHere
                ? tint(RED, dark ? 0.25 : 0.14)
                : finished
                  ? tint(GREEN, dark ? 0.2 : 0.12)
                  : started
                    ? tint(C.accent, dark ? 0.24 : 0.14)
                    : subBg;

              const cellColor = failedHere
                ? RED
                : finished
                  ? dark
                    ? TERM.green
                    : "#248A3D"
                  : started
                    ? C.accent
                    : fg;

              return (
                <div
                  key={i}
                  style={{
                    width: cellW,
                    height: 60,
                    borderRadius: 12,
                    background: cellBg,
                    border: `1.5px solid ${borderCol}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 27,
                    color: cellColor,
                    boxSizing: "border-box",
                  }}
                >
                  {ch}
                </div>
              );
            })}
          </div>
        </div>

        {/* Verdict Pill: Accepted (green) or Rejected (red), or current step status */}
        {isFinished ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px 10px 14px",
              borderRadius: 999,
              background: accepted ? tint(GREEN, dark ? 0.22 : 0.14) : tint(RED, dark ? 0.22 : 0.13),
              border: `2px solid ${accepted ? GREEN : RED}`,
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 24,
              color: accepted ? (dark ? TERM.green : "#248A3D") : RED,
              ...materialize(verdictP),
            }}
          >
            <Icon
              name={accepted ? "checkCircle" : "crossCircle"}
              size={28}
              color={accepted ? (dark ? TERM.green : "#248A3D") : RED}
              weight={2.2}
            />
            {accepted ? "Accepted" : "Rejected"}
          </div>
        ) : (
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: subBg,
              border: `1.5px solid ${borderCol}`,
              fontFamily: mono,
              fontSize: 20,
              fontWeight: 600,
              color: activeStep ? C.accent : mute,
            }}
          >
            {activeStep
              ? `read '${activeStep.ch}' → ${activeStep.transitionIndex >= 0 ? activeStep.toState : "no edge"}`
              : "ready"}
          </div>
        )}
      </div>

      {/* 2. FSM Diagram Canvas */}
      <div style={{ position: "relative", width: w, height: canvasH }}>
        <svg
          width={w}
          height={canvasH}
          viewBox={`0 0 ${w} ${canvasH}`}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {/* Start arrow pointing into the initial state */}
          {(() => {
            const init = byId.get(startId);
            if (!init) return null;
            const sx1 = init.x - R - 54;
            const sx2 = init.x - R - 6;
            const sy = init.y;
            return (
              <g opacity={prog(frame, at + 4, 10)}>
                <line x1={sx1} y1={sy} x2={sx2} y2={sy} stroke={WIRE} strokeWidth={3.5} strokeLinecap="round" />
                <polygon points={`${sx2},${sy} ${sx2 - 12},${sy - 7} ${sx2 - 12},${sy + 7}`} fill={WIRE} />
              </g>
            );
          })()}

          {/* Transitions */}
          {transitions.map((t, i) => {
            const fromS = byId.get(t.from);
            const toS = byId.get(t.to);
            if (!fromS || !toS) return null;

            const isAct = activeStep?.transitionIndex === i;
            const stepProg = isAct && activeStep ? prog(frame, activeStep.startFrame, fpc, easeInOut) : 0;
            const col = isAct ? C.accent : WIRE;
            const sw = isAct ? 4.5 : 3.2;

            // Self-loop above the state circle
            if (t.from === t.to) {
              const lx = fromS.x;
              const ly = fromS.y - R;
              const loopPath = `M ${lx - 22} ${ly + 4} C ${lx - 48} ${ly - 68}, ${lx + 48} ${ly - 68}, ${lx + 22} ${ly + 4}`;
              const ax = lx + 22;
              const ay = ly + 4;
              return (
                <g key={i}>
                  <path d={loopPath} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" />
                  <polygon points={`${ax},${ay} ${ax - 4},${ay - 14} ${ax + 9},${ay - 10}`} fill={col} />
                </g>
              );
            }

            // Directed edge between two distinct states
            const dx = toS.x - fromS.x;
            const dy = toS.y - fromS.y;
            const dist = Math.hypot(dx, dy) || 1;
            const ux = dx / dist;
            const uy = dy / dist;
            const nx = -uy;
            const ny = ux;

            const hasReverse = transitions.some((other, j) => j !== i && other.from === t.to && other.to === t.from);
            const bend = t.bend ?? (hasReverse ? 42 : 0);

            const startX = fromS.x + ux * (R + 4) + nx * (bend * 0.22);
            const startY = fromS.y + uy * (R + 4) + ny * (bend * 0.22);
            const endX = toS.x - ux * (R + 8) + nx * (bend * 0.22);
            const endY = toS.y - uy * (R + 8) + ny * (bend * 0.22);

            const ctrlX = (startX + endX) / 2 + nx * bend;
            const ctrlY = (startY + endY) / 2 + ny * bend;

            const pathD =
              Math.abs(bend) > 1
                ? `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`
                : `M ${startX} ${startY} L ${endX} ${endY}`;

            // Tangent at end for arrowhead
            const tx = Math.abs(bend) > 1 ? endX - ctrlX : dx;
            const ty = Math.abs(bend) > 1 ? endY - ctrlY : dy;
            const tLen = Math.hypot(tx, ty) || 1;
            const tux = tx / tLen;
            const tuy = ty / tLen;
            const ahx = endX - tux * 13;
            const ahy = endY - tuy * 13;

            // Travelling pulse dot along edge when active
            const dotT = stepProg;
            const dotX =
              Math.abs(bend) > 1
                ? (1 - dotT) * (1 - dotT) * startX + 2 * (1 - dotT) * dotT * ctrlX + dotT * dotT * endX
                : lerp(startX, endX, dotT);
            const dotY =
              Math.abs(bend) > 1
                ? (1 - dotT) * (1 - dotT) * startY + 2 * (1 - dotT) * dotT * ctrlY + dotT * dotT * endY
                : lerp(startY, endY, dotT);

            return (
              <g key={i}>
                <path d={pathD} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" />
                <polygon
                  points={`${endX},${endY} ${ahx - tuy * 7},${ahy + tux * 7} ${ahx + tuy * 7},${ahy - tux * 7}`}
                  fill={col}
                />
                {isAct ? <circle cx={dotX} cy={dotY} r={8} fill={C.accent} stroke={C.white} strokeWidth={3} /> : null}
              </g>
            );
          })}
        </svg>

        {/* Transition Label Chips */}
        {transitions.map((t, i) => {
          const fromS = byId.get(t.from);
          const toS = byId.get(t.to);
          if (!fromS || !toS) return null;

          const isAct = activeStep?.transitionIndex === i;
          let cx = 0;
          let cy = 0;
          if (t.from === t.to) {
            cx = fromS.x;
            cy = fromS.y - R - 56;
          } else {
            const dx = toS.x - fromS.x;
            const dy = toS.y - fromS.y;
            const dist = Math.hypot(dx, dy) || 1;
            const nx = -dy / dist;
            const ny = dx / dist;
            const hasReverse = transitions.some((other, j) => j !== i && other.from === t.to && other.to === t.from);
            const bend = t.bend ?? (hasReverse ? 42 : 0);
            cx = (fromS.x + toS.x) / 2 + nx * (bend * 0.65);
            cy = (fromS.y + toS.y) / 2 + ny * (bend * 0.65) - (bend === 0 ? 22 : 0);
          }

          return (
            <div
              key={`lbl-${i}`}
              style={{
                position: "absolute",
                left: cx,
                top: cy,
                translate: "-50% -50%",
                padding: "4px 12px",
                borderRadius: 999,
                background: isAct ? C.accent : dark ? "#2B2B2E" : C.white,
                border: `1.5px solid ${isAct ? C.accent : borderCol}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 19,
                color: isAct ? C.white : mute,
                whiteSpace: "nowrap",
                zIndex: isAct ? 6 : 2,
              }}
            >
              {t.label}
            </div>
          );
        })}

        {/* State Nodes */}
        {states.map((s, idx) => {
          const enterP = prog(frame, at + 4 + idx * 4, 10, easeOut);
          const isCurrent = activeStateId === s.id;
          const isFinalThis = isFinished && curState === s.id;

          let border = dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.15)";
          let bg = dark ? "#262629" : C.white;
          if (isFinalThis) {
            border = accepted ? GREEN : RED;
            bg = accepted ? (dark ? tint(GREEN, 0.18) : "#EEFAF1") : dark ? tint(RED, 0.18) : "#FFF1F0";
          } else if (isCurrent) {
            border = C.accent;
            bg = dark ? tint(C.accent, 0.22) : BLUE_TINT;
          }

          return (
            <div
              key={s.id}
              style={{
                position: "absolute",
                left: s.x - R,
                top: s.y - R,
                width: R * 2,
                height: R * 2,
                ...materialize(enterP),
              }}
            >
              {/* Red lock-on ring if rejected on this state */}
              {isFinalThis && !accepted ? (
                <div
                  style={{
                    position: "absolute",
                    inset: -11,
                    borderRadius: R + 11,
                    border: `3.5px solid ${RED}`,
                    opacity: verdictP,
                    scale: String(1.08 - 0.08 * verdictP),
                  }}
                />
              ) : null}

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: R,
                  background: bg,
                  border: `3.5px solid ${border}`,
                  boxShadow: CARD_SHADOW,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Accepting state inner ring (double circle) */}
                {s.accept ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 7,
                      borderRadius: R - 7,
                      border: `2.5px solid ${interpolateColors(isCurrent || isFinalThis ? 1 : 0, [0, 1], [mute, border])}`,
                      pointerEvents: "none",
                    }}
                  />
                ) : null}

                <span
                  style={{
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 26,
                    color: fg,
                    lineHeight: 1.1,
                  }}
                >
                  {s.label}
                </span>
                {s.sub ? (
                  <span
                    style={{
                      fontFamily: sans,
                      fontWeight: 500,
                      fontSize: 16,
                      color: mute,
                      marginTop: 2,
                    }}
                  >
                    {s.sub}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
