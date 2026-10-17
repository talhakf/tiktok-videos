import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { presence } from "../diagram/Node";
import { GREEN, Mark, RED } from "../layouts/Mark";
import { C, materialize, mono, prog, sans } from "../../theme";
import { DevCard, TAB_H } from "./card";

// A CI / build pipeline (install → test → build → deploy) on a white card, as a column (GitHub Actions
// job list) or a row. Each step is pending (grey ring) until `startAt`, running (blue arc turning at a
// fixed speed) until `endAt`, then pass (green check), fail (red cross) or skip (grey dash), and shows
// its `duration`. The connector to the next step fills green once a step passes.

export type StepResult = "pass" | "fail" | "skip";
export type PipelineStep = { label: string; sub?: string; startAt?: number; endAt?: number; result?: StepResult; duration?: string };

type Phase = "pending" | "running" | StepResult;
const phaseOf = (s: PipelineStep, frame: number): Phase =>
  s.endAt !== undefined && frame >= s.endAt ? (s.result ?? "pass") : s.startAt !== undefined && frame >= s.startAt ? "running" : "pending";

/** Step status glyph, `size` px: grey ring, turning blue arc, green check, red cross or grey dash. */
export const StepIcon: React.FC<{ step: PipelineStep; size?: number }> = ({ step, size = 52 }) => {
  const frame = useCurrentFrame();
  const phase = phaseOf(step, frame);
  const done = phase === "pass" || phase === "fail" || phase === "skip";
  const dp = done ? prog(frame, step.endAt!, 8) : 0;
  const r = size / 2 - 3;
  const ring = (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill={C.white} stroke={phase === "pending" ? "#C7C7CC" : "#E8E8ED"} strokeWidth={4} />
      {phase === "running" || (done && dp < 1) ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.accent}
          strokeWidth={4}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="28 72"
          style={{
            transformOrigin: "50% 50%",
            rotate: `${((frame - (step.startAt ?? 0)) * 12) % 360}deg`,
            opacity: (1 - dp) * prog(frame, step.startAt ?? 0, 5),
          }}
        />
      ) : null}
    </svg>
  );
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {ring}
      {done ? (
        <div style={{ position: "absolute", inset: 0, ...materialize(dp, 0.85, 4) }}>
          {phase === "skip" ? (
            <div
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                background: "#F2F2F4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="minus" size={size * 0.55} color={C.mute} weight={2.6} />
            </div>
          ) : (
            <Mark kind={phase === "fail" ? "cross" : "check"} size={size} color={phase === "fail" ? RED : GREEN} draw={prog(frame, step.endAt! + 2, 10)} />
          )}
        </div>
      ) : null}
    </div>
  );
};

const statusText = (s: PipelineStep, phase: Phase) =>
  phase === "running" ? "running" : phase === "pass" || phase === "fail" ? (s.duration ?? "") : phase === "skip" ? "skipped" : "";

/**
 * Pipeline at (x, y), `w` wide. `dir` "column" (default, one row per step, `rowH` tall) or "row" (steps
 * side by side, best for 3–5 short labels). Steps enter staggered at `at`. `filename` adds a tab
 * ("ci.yml"). Use `sub` for a grey second line ("npm ci", "exit code 1").
 */
export const Pipeline: React.FC<{
  steps: PipelineStep[];
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  dir?: "column" | "row";
  rowH?: number;
  size?: number;
  filename?: string;
  right?: string;
  style?: React.CSSProperties;
}> = ({ steps, x, y, w = 900, at, until, dir = "column", rowH = 116, size = 34, filename, right, style }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const tab = filename !== undefined ? TAB_H : 0;
  const icon = 52;
  const enter = (i: number) => prog(frame, at + 6 + i * 3, 8);
  const fill = (s: PipelineStep) => (phaseOf(s, frame) === "pass" ? prog(frame, s.endAt! + 4, 10) : 0);

  if (dir === "row") {
    const colW = w / steps.length;
    const h = tab + 222;
    const iconY = 44;
    return (
      <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} right={right} style={style}>
        {steps.slice(0, -1).map((s, i) => {
          const x0 = colW * i + colW / 2 + icon / 2 + 10;
          const len = colW - icon - 20;
          return (
            <div key={`c${i}`} style={{ position: "absolute", left: x0, top: iconY + icon / 2 - 2, width: len, height: 4, borderRadius: 2, background: "#E8E8ED", opacity: enter(i + 1) }}>
              <div style={{ width: len * fill(s), height: 4, borderRadius: 2, background: GREEN }} />
            </div>
          );
        })}
        {steps.map((s, i) => {
          const phase = phaseOf(s, frame);
          const e = enter(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: colW * i,
                width: colW,
                top: iconY,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                opacity: e,
                translate: `0px ${(1 - e) * 12}px`,
              }}
            >
              <StepIcon step={s} size={icon} />
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: size * 0.88, letterSpacing: "-0.02em", color: phase === "pending" || phase === "skip" ? C.mute : C.ink, whiteSpace: "nowrap" }}>
                {s.label}
              </div>
              <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 24, color: phase === "running" ? C.accent : phase === "fail" ? "#C9281E" : C.mute, whiteSpace: "nowrap", height: 30 }}>
                {statusText(s, phase) || s.sub || ""}
              </div>
            </div>
          );
        })}
      </DevCard>
    );
  }

  const h = tab + 24 + steps.length * rowH;
  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} right={right} style={style}>
      {steps.slice(0, -1).map((s, i) => {
        const top = 12 + i * rowH + rowH / 2 + icon / 2 + 8;
        const len = rowH - icon - 16;
        return (
          <div key={`c${i}`} style={{ position: "absolute", left: 40 + icon / 2 - 2, top, width: 4, height: len, borderRadius: 2, background: "#E8E8ED", opacity: enter(i + 1) }}>
            <div style={{ width: 4, height: len * fill(s), borderRadius: 2, background: GREEN }} />
          </div>
        );
      })}
      {steps.map((s, i) => {
        const phase = phaseOf(s, frame);
        const e = enter(i);
        const st = statusText(s, phase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 40,
              right: 36,
              top: 12 + i * rowH,
              height: rowH,
              display: "flex",
              alignItems: "center",
              gap: 28,
              opacity: e,
              translate: `${(1 - e) * 16}px 0px`,
            }}
          >
            <StepIcon step={s} size={icon} />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.02em", color: phase === "pending" || phase === "skip" ? C.mute : C.ink, whiteSpace: "nowrap" }}>
                {s.label}
              </div>
              {s.sub ? (
                <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 24, color: C.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.sub}</div>
              ) : null}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 26,
                color: phase === "running" ? C.accent : phase === "fail" ? "#C9281E" : C.mute,
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {st}
            </div>
          </div>
        );
      })}
    </DevCard>
  );
};
