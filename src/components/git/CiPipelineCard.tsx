import { useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { alpha, BLUE_TINT, CARD_SHADOW, GREEN, presence, Pt, RED } from "../diagram/Node";
import { Icon, IconName } from "../../icons/Icons";
import { Mark } from "../layouts/Mark";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type CiJobResult = "pass" | "fail" | "skip" | "blocked";
export type CiJobPhase = "pending" | "running" | CiJobResult;

export type CiJob = {
  id: string;
  label: string;
  sub?: string;
  startAt?: number;
  endAt?: number;
  result?: CiJobResult;
  duration?: string;
  icon?: IconName;
};

export type CiStage = {
  title: string;
  jobs: CiJob[];
};

export type CiPipelineCardProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  stages?: CiStage[];
  /** Optional shorthand: set `"e2e"` or `"sec"` to make that job fail and block Deploy Production. */
  failJobId?: string;
  branch?: string;
  commit?: string;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
};

const phaseOfJob = (j: CiJob, frame: number): CiJobPhase => {
  if (j.endAt !== undefined && frame >= j.endAt) return j.result ?? "pass";
  if (j.startAt !== undefined && frame >= j.startAt) return "running";
  return "pending";
};

const JobStatusGlyph: React.FC<{ job: CiJob; size?: number; dark?: boolean }> = ({ job, size = 40, dark }) => {
  const frame = useCurrentFrame();
  const phase = phaseOfJob(job, frame);
  const done = phase === "pass" || phase === "fail" || phase === "skip" || phase === "blocked";
  const dp = done && job.endAt !== undefined ? prog(frame, job.endAt, 8) : 0;
  const r = size / 2 - 2.5;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill={dark ? TERM.bg : C.white}
          stroke={phase === "pending" ? (dark ? "#48484A" : "#C7C7CC") : dark ? "#3A3A3C" : "#E8E8ED"}
          strokeWidth={3.5}
        />
        {phase === "running" || (done && dp < 1) ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={C.accent}
            strokeWidth={3.5}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="30 70"
            style={{
              transformOrigin: "50% 50%",
              rotate: `${((frame - (job.startAt ?? 0)) * 13) % 360}deg`,
              opacity: (1 - dp) * prog(frame, job.startAt ?? 0, 5),
            }}
          />
        ) : null}
      </svg>

      {done ? (
        <div style={{ position: "absolute", inset: 0, ...materialize(dp, 0.85, 4) }}>
          {phase === "blocked" || phase === "skip" ? (
            <div
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                background: phase === "blocked" ? alpha(AMBER, 0.18) : dark ? TERM.bar : "#F2F2F4",
                border: `2px solid ${phase === "blocked" ? AMBER : C.mute}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name={phase === "blocked" ? "lock" : "minus"}
                size={size * 0.52}
                color={phase === "blocked" ? "#A05A00" : C.mute}
                weight={2.4}
              />
            </div>
          ) : (
            <Mark
              kind={phase === "fail" ? "cross" : "check"}
              size={size}
              color={phase === "fail" ? RED : GREEN}
              draw={prog(frame, (job.endAt ?? 0) + 2, 9)}
            />
          )}
        </div>
      ) : null}
    </div>
  );
};

/**
 * GitHub Actions / CI/CD Pipeline DAG board: stages (`Build & Lint` -> parallel
 * `Unit Tests` / `E2E Tests` / `Security Scan` -> `Deploy Production`), animating
 * spinners and progress bars into green checkmarks (or a red failed step blocking deploy).
 */
export const CiPipelineCard: React.FC<CiPipelineCardProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 520,
  at,
  until,
  stages,
  failJobId,
  branch = "main",
  commit = "a8f3d21",
  filename = ".github/workflows/ci.yml",
  right = "GitHub Actions",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const defaultStages: CiStage[] = [
    {
      title: "Stage 1 · Build",
      jobs: [
        {
          id: "build",
          label: "Build & Lint",
          sub: "tsc && eslint",
          startAt: at + 6,
          endAt: at + 22,
          result: "pass",
          duration: "14s",
        },
      ],
    },
    {
      title: "Stage 2 · Parallel Matrix",
      jobs: [
        {
          id: "unit",
          label: "Unit Tests",
          sub: "vitest · 142 specs",
          startAt: at + 24,
          endAt: at + 42,
          result: failJobId === "unit" ? "fail" : "pass",
          duration: "18s",
        },
        {
          id: "e2e",
          label: "E2E Tests",
          sub: "playwright · 28 flows",
          startAt: at + 24,
          endAt: at + 50,
          result: failJobId === "e2e" ? "fail" : "pass",
          duration: failJobId === "e2e" ? "failed 31s" : "31s",
        },
        {
          id: "sec",
          label: "Security Scan",
          sub: "codeql & audit",
          startAt: at + 24,
          endAt: at + 38,
          result: failJobId === "sec" ? "fail" : "pass",
          duration: "12s",
        },
      ],
    },
    {
      title: "Stage 3 · Release",
      jobs: [
        {
          id: "deploy",
          label: "Deploy Production",
          sub: failJobId ? `blocked by ${failJobId}` : "us-east-1 · v2.4.0",
          startAt: failJobId ? undefined : at + 52,
          endAt: failJobId ? at + 52 : at + 72,
          result: failJobId ? "blocked" : "pass",
          duration: failJobId ? "blocked" : "22s",
        },
      ],
    },
  ];

  const activeStages = stages ?? defaultStages;
  const allJobs = activeStages.flatMap((s) => s.jobs);

  const anyFailed = allJobs.some((j) => phaseOfJob(j, frame) === "fail");
  const allFinished = allJobs.every((j) => {
    const ph = phaseOfJob(j, frame);
    return ph === "pass" || ph === "fail" || ph === "skip" || ph === "blocked";
  });

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const goodTone = toneColors("good", dark);
  const badTone = toneColors("bad", dark);
  const accentTone = toneColors("accent", dark);

  const colCenters = [152, 450, 748];
  const cardW = 248;
  const jobH = 92;
  const dagMidY = 262;

  const jobPos = (stageIdx: number, jobIdx: number, count: number): Pt => {
    const cx = colCenters[stageIdx] ?? 152 + stageIdx * 298;
    const gap = 18;
    const totalH = count * jobH + (count - 1) * gap;
    const startY = dagMidY - totalH / 2 + jobH / 2;
    return { x: cx, y: startY + jobIdx * (jobH + gap) };
  };

  // Build DAG edges between stage k and stage k+1
  const dagEdges: {
    key: string;
    d: string;
    fillP: number;
    color: string;
    dashed?: boolean;
    enterAt: number;
  }[] = [];

  for (let s = 0; s < activeStages.length - 1; s++) {
    const leftJobs = activeStages[s].jobs;
    const rightJobs = activeStages[s + 1].jobs;
    leftJobs.forEach((lj, li) => {
      const a = jobPos(s, li, leftJobs.length);
      const outPt: Pt = { x: a.x + cardW / 2, y: a.y };
      const lPhase = phaseOfJob(lj, frame);
      const fillP =
        lPhase === "pass" || lPhase === "fail"
          ? prog(frame, (lj.endAt ?? at) + 1, 10, easeInOut)
          : 0;
      const edgeColor = lPhase === "fail" ? RED : GREEN;

      rightJobs.forEach((rj, ri) => {
        const b = jobPos(s + 1, ri, rightJobs.length);
        const inPt: Pt = { x: b.x - cardW / 2, y: b.y };
        const dx = inPt.x - outPt.x;
        const d =
          Math.abs(outPt.y - inPt.y) < 1
            ? `M${outPt.x} ${outPt.y} L${inPt.x} ${inPt.y}`
            : `M${outPt.x} ${outPt.y} C${outPt.x + dx * 0.5} ${outPt.y} ${inPt.x - dx * 0.5} ${inPt.y} ${inPt.x} ${inPt.y}`;
        dagEdges.push({
          key: `${lj.id}-${rj.id}`,
          d,
          fillP,
          color: edgeColor,
          dashed: lPhase === "fail",
          enterAt: at + 6 + s * 4,
        });
      });
    });
  }

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon="layers" right={right} style={style}>
      {/* Top workflow metadata strip */}
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 18,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          borderRadius: 14,
          background: dark ? TERM.bar : "#F5F5F7",
          border: `1px solid ${C.line}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: mono, fontWeight: 700, fontSize: 19, color: fg }}>
            <Icon name="branch" size={20} color={C.accent} weight={2.2} />
            <span>{branch}</span>
          </div>
          <span style={{ color: mute, fontFamily: mono, fontSize: 18 }}>·</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: mono, fontWeight: 500, fontSize: 18, color: mute }}>
            <Icon name="commit" size={20} color={mute} weight={2} />
            <span>{commit}</span>
          </div>
        </div>

        <div
          style={{
            padding: "5px 14px",
            borderRadius: 999,
            background: anyFailed ? badTone.bg : allFinished ? goodTone.bg : accentTone.bg,
            border: `1.5px solid ${anyFailed ? badTone.edge : allFinished ? goodTone.edge : accentTone.edge}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: anyFailed ? badTone.fg : allFinished ? goodTone.fg : accentTone.fg,
          }}
        >
          {anyFailed
            ? "1 check failed · deploy blocked"
            : allFinished
              ? "All 5 checks passed · deployed"
              : "Running pipeline DAG..."}
        </div>
      </div>

      {/* Stage column headers */}
      {activeStages.map((st, sIdx) => (
        <div
          key={st.title}
          style={{
            position: "absolute",
            left: (colCenters[sIdx] ?? 152) - cardW / 2,
            width: cardW,
            top: 86,
            textAlign: "center",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 17,
            color: mute,
            opacity: prog(frame, at + 4 + sIdx * 3, 8),
          }}
        >
          {st.title}
        </div>
      ))}

      {/* SVG DAG connectors */}
      <svg width={w} height={h - TAB_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {dagEdges.map((e) => {
          const ep = prog(frame, e.enterAt, 8);
          if (ep <= 0) return null;
          return (
            <g key={e.key} opacity={ep}>
              <path
                d={e.d}
                fill="none"
                stroke={dark ? "#3A3A3C" : "#D2D2D7"}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              {e.fillP > 0 ? (
                <path
                  d={e.d}
                  fill="none"
                  stroke={e.color}
                  strokeWidth={4}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={e.dashed ? "6 6" : 1}
                  strokeDashoffset={e.dashed ? undefined : 1 - e.fillP}
                  opacity={e.fillP}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Job cards */}
      {activeStages.map((st, sIdx) =>
        st.jobs.map((job, jIdx) => {
          const center = jobPos(sIdx, jIdx, st.jobs.length);
          const enterP = prog(frame, at + 5 + sIdx * 4 + jIdx * 2, 9);
          if (enterP <= 0) return null;

          const phase = phaseOfJob(job, frame);
          const runP =
            job.startAt !== undefined && job.endAt !== undefined
              ? prog(frame, job.startAt, Math.max(1, job.endAt - job.startAt))
              : 0;

          let borderColor = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.11)";
          let cardBg = dark ? "#252528" : C.white;

          if (phase === "running") {
            borderColor = C.accent;
            cardBg = dark ? alpha(C.accent, 0.14) : BLUE_TINT;
          } else if (phase === "pass") {
            borderColor = alpha(GREEN, 0.65);
          } else if (phase === "fail") {
            borderColor = RED;
            cardBg = dark ? alpha(RED, 0.16) : "#FFF1F0";
          } else if (phase === "blocked") {
            borderColor = AMBER;
            cardBg = dark ? alpha(AMBER, 0.12) : "rgba(255,159,10,0.08)";
          }

          return (
            <div
              key={job.id}
              style={{
                position: "absolute",
                left: center.x - cardW / 2,
                top: center.y - jobH / 2,
                width: cardW,
                height: jobH,
                borderRadius: 18,
                background: cardBg,
                border: `2px solid ${borderColor}`,
                boxShadow: CARD_SHADOW,
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                overflow: "hidden",
                ...materialize(enterP),
              }}
            >
              <JobStatusGlyph job={job} size={38} dark={dark} />

              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                <div
                  style={{
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: 20,
                    letterSpacing: "-0.02em",
                    color: phase === "pending" ? mute : fg,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {job.label}
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 500,
                    fontSize: 15,
                    color:
                      phase === "fail"
                        ? badTone.fg
                        : phase === "blocked"
                          ? "#A05A00"
                          : phase === "running"
                            ? C.accent
                            : mute,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {phase === "running"
                    ? `running · ${Math.round(runP * 100)}%`
                    : phase === "pass" || phase === "fail" || phase === "blocked"
                      ? `${job.sub ?? ""} · ${job.duration ?? ""}`
                      : job.sub ?? "queued"}
                </div>
              </div>

              {/* Bottom live progress bar while running */}
              {phase === "running" ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 4,
                    background: alpha(C.accent, 0.18),
                  }}
                >
                  <div
                    style={{
                      width: `${runP * 100}%`,
                      height: "100%",
                      background: C.accent,
                    }}
                  />
                </div>
              ) : null}
            </div>
          );
        }),
      )}
    </DevCard>
  );
};
