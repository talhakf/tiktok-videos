import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { alpha, GREEN, lerp, presence, RED } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { appleSpring, C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type ReflogEntry = {
  ref: string;
  hash: string;
  action: string;
  target?: boolean;
};

export type ReflogTimelineProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  /** Frame when `git reset --hard HEAD~3` orphans the top 3 commits. */
  resetAt?: number;
  /** Frame when `git reflog` reveals the hidden commit history. */
  reflogAt?: number;
  /** Frame when `git checkout b4f92a1` restores the orphaned commits. */
  restoreAt?: number;
  entries?: ReflogEntry[];
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
};

const GRAPH_COMMITS = [
  { id: "c0", hash: "8a1b2c0", msg: "init", orphan: false },
  { id: "c1", hash: "4d5e6f1", msg: "auth model", orphan: false },
  { id: "c2", hash: "9a8b7c2", msg: "oauth flow", orphan: true },
  { id: "c3", hash: "3e4f5a3", msg: "rate limit", orphan: true },
  { id: "c4", hash: "b4f92a1", msg: "secret feature", orphan: true },
];

const DEFAULT_REFLOG: ReflogEntry[] = [
  { ref: "HEAD@{0}", hash: "4d5e6f1", action: "reset: moving to HEAD~3" },
  { ref: "HEAD@{1}", hash: "b4f92a1", action: "commit: secret feature", target: true },
  { ref: "HEAD@{2}", hash: "3e4f5a3", action: "commit: rate limit" },
  { ref: "HEAD@{3}", hash: "9a8b7c2", action: "commit: oauth flow" },
];

/**
 * `git reflog` time-machine recovery card: shows `git reset --hard HEAD~3` making 3 commits look
 * "deleted" (`orphaned / dangling`), then `git reflog` revealing `HEAD@{1}: commit: secret feature`
 * and `git checkout b4f92a1` restoring them at `restoreAt`.
 */
export const ReflogTimeline: React.FC<ReflogTimelineProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 640,
  at,
  until,
  resetAt,
  reflogAt,
  restoreAt,
  entries = DEFAULT_REFLOG,
  filename = "git-reflog-recovery",
  right = "time machine",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tReset = resetAt ?? at + 20;
  const tReflog = reflogAt ?? tReset + 22;
  const tRestore = restoreAt ?? tReflog + 28;

  const resetP = prog(frame, tReset, 14, easeInOut);
  const reflogP = prog(frame, tReflog, 12);
  const restoreP = prog(frame, tRestore, 16, easeInOut);

  // Orphan state: rises at resetAt, returns to 0 at restoreAt
  const orphanWeight = resetP * (1 - restoreP);

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const badTone = toneColors("bad", dark);
  const warnTone = toneColors("warn", dark);
  const goodTone = toneColors("good", dark);
  const accentTone = toneColors("accent", dark);

  // Command banner text & tone
  const phaseCmd =
    frame >= tRestore
      ? "$ git checkout b4f92a1"
      : frame >= tReflog
        ? "$ git reflog"
        : frame >= tReset
          ? "$ git reset --hard HEAD~3"
          : "$ git log --oneline";

  const phaseBadge =
    frame >= tRestore
      ? { text: "3 commits restored!", tone: goodTone }
      : frame >= tReflog
        ? { text: "HEAD@{1} found: b4f92a1", tone: accentTone }
        : frame >= tReset
          ? { text: "3 commits orphaned (dangling)", tone: badTone }
          : { text: "5 commits on main", tone: accentTone };

  const x0 = 104;
  const colGap = (w - x0 * 2) / 4; // 5 commits across w
  const graphY = 178;
  const dotR = 20;

  const xOf = (idx: number) => x0 + idx * colGap;

  // HEAD position: starts at col 4 (b4f92a1), snaps to col 1 (4d5e6f1) at resetAt, glides back to col 4 at restoreAt
  const headCol = lerp(lerp(4, 1, resetP), 4, restoreP);
  const headX = xOf(headCol);

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon="clock" right={right} style={style}>
      {/* Top command & status bar */}
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          top: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 18px",
            borderRadius: 12,
            background: dark ? TERM.bar : "#F2F2F4",
            border: `1px solid ${C.line}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 22,
            color: fg,
          }}
        >
          <Icon
            name={frame >= tRestore ? "checkCircle" : frame >= tReflog ? "clock" : frame >= tReset ? "warning" : "terminal"}
            size={24}
            color={frame >= tRestore ? GREEN : frame >= tReflog ? C.accent : frame >= tReset ? RED : C.accent}
            weight={2.2}
          />
          <span>{phaseCmd}</span>
        </div>

        <div
          style={{
            padding: "7px 16px",
            borderRadius: 999,
            background: phaseBadge.tone.bg,
            border: `1.5px solid ${phaseBadge.tone.edge}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 19,
            color: phaseBadge.tone.fg,
          }}
        >
          {phaseBadge.text}
        </div>
      </div>

      {/* Orphaned / Dangling bracket callout over commits 2..4 */}
      {orphanWeight > 0.05 || restoreP > 0.05 ? (
        <div
          style={{
            position: "absolute",
            left: xOf(2) - 42,
            width: xOf(4) - xOf(2) + 84,
            top: graphY - 46,
            height: 98,
            borderRadius: 22,
            background: restoreP > 0.3 ? alpha(GREEN, 0.1) : alpha(RED, 0.08 * orphanWeight),
            border: `2px ${restoreP > 0.5 ? "solid" : "dashed"} ${restoreP > 0.3 ? GREEN : alpha(RED, 0.65)}`,
            opacity: Math.max(orphanWeight, restoreP),
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 14,
              top: -28,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              color: restoreP > 0.3 ? goodTone.fg : badTone.fg,
            }}
          >
            {restoreP > 0.3 ? "recovered via b4f92a1" : "orphaned / dangling in .git/objects"}
          </div>
        </div>
      ) : null}

      {/* Commit graph SVG */}
      <svg width={w} height={160} style={{ position: "absolute", left: 0, top: graphY - 80, overflow: "visible" }}>
        {/* Edges between commits */}
        {GRAPH_COMMITS.slice(0, -1).map((c, i) => {
          const next = GRAPH_COMMITS[i + 1];
          const isOrphanEdge = next.orphan;
          const enterP = prog(frame, at + 5 + i * 3, 8);
          if (enterP <= 0) return null;

          const strokeColor = isOrphanEdge
            ? restoreP > 0.2
              ? interpolateColors(restoreP, [0, 1], [mute, GREEN])
              : interpolateColors(orphanWeight, [0, 1], [fg, mute])
            : fg;

          return (
            <line
              key={`edge-${c.id}`}
              x1={xOf(i)}
              y1={80}
              x2={xOf(i + 1)}
              y2={80}
              stroke={strokeColor}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={isOrphanEdge && orphanWeight > 0.4 ? "8 7" : undefined}
              opacity={enterP * (isOrphanEdge ? 1 - orphanWeight * 0.62 : 1)}
            />
          );
        })}

        {/* Commit dots */}
        {GRAPH_COMMITS.map((c, i) => {
          const t = frame - (at + 4 + i * 3);
          if (t < 0) return null;
          const sp = appleSpring(t, fps, { response: 0.35 });
          const cx = xOf(i);
          const isOrphan = c.orphan;

          const nodeColor = isOrphan
            ? restoreP > 0.2
              ? interpolateColors(restoreP, [0, 1], [RED, GREEN])
              : interpolateColors(orphanWeight, [0, 1], [C.accent, mute])
            : fg;

          return (
            <g key={c.id} opacity={isOrphan ? 1 - orphanWeight * 0.62 : 1}>
              <circle
                cx={cx}
                cy={80}
                r={dotR * (0.55 + 0.45 * sp)}
                fill={dark ? TERM.bg : C.white}
                stroke={nodeColor}
                strokeWidth={5.5}
                strokeDasharray={isOrphan && orphanWeight > 0.4 ? "6 4" : undefined}
              />
            </g>
          );
        })}
      </svg>

      {/* Commit hashes and short messages */}
      {GRAPH_COMMITS.map((c, i) => {
        const ep = prog(frame, at + 6 + i * 3, 8);
        if (ep <= 0) return null;
        const cx = xOf(i);
        const isOrphan = c.orphan;
        const fade = isOrphan ? 1 - orphanWeight * 0.62 : 1;
        return (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: cx,
              top: graphY + dotR + 8,
              translate: "-50% 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              opacity: ep * fade,
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 18,
                color: isOrphan && restoreP > 0.4 ? goodTone.fg : fg,
              }}
            >
              {c.hash}
            </span>
            <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 16, color: mute, whiteSpace: "nowrap" }}>
              {c.msg}
            </span>
          </div>
        );
      })}

      {/* Gliding HEAD pill */}
      <div
        style={{
          position: "absolute",
          left: headX,
          top: graphY - dotR - 46,
          translate: "-50% 0",
          height: 36,
          padding: "0 14px",
          borderRadius: 18,
          background: restoreP > 0.5 ? GREEN : orphanWeight > 0.5 ? RED : C.accent,
          display: "flex",
          alignItems: "center",
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 18,
          color: C.white,
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          ...materialize(prog(frame, at + 14, 8)),
        }}
      >
        {restoreP > 0.5 ? "HEAD → b4f92a1" : "HEAD → main"}
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          top: 268,
          height: 1,
          background: C.line,
        }}
      />

      {/* Bottom section: `git reflog` time-machine table */}
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          top: 286,
          bottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            opacity: prog(frame, at + 10, 8),
          }}
        >
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: mute }}>
            REFLOG LEDGER (.git/logs/HEAD)
          </span>
          <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 18, color: reflogP > 0.1 ? C.accent : mute }}>
            {reflogP > 0.1 ? "Nothing is truly lost for 90 days" : "waiting for git reflog..."}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.map((entry, idx) => {
            const rowP = prog(frame, tReflog + idx * 3, 9);
            if (rowP <= 0) return null;

            const isTarget = Boolean(entry.target);
            const targetLock = isTarget ? prog(frame, tReflog + 10, 10) : 0;
            const restored = isTarget && restoreP > 0.2;

            const rowTone = restored ? goodTone : isTarget ? accentTone : idx === 0 ? warnTone : null;

            return (
              <div
                key={entry.ref}
                style={{
                  height: 54,
                  padding: "0 18px",
                  borderRadius: 14,
                  background:
                    isTarget && targetLock > 0
                      ? rowTone!.bg
                      : idx === 0
                        ? alpha(AMBER, 0.08)
                        : dark
                          ? TERM.bar
                          : "#F8F8FA",
                  border: `1.5px solid ${
                    isTarget && targetLock > 0 ? rowTone!.edge : C.line
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  ...materialize(rowP),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 20,
                      color: isTarget ? (restored ? goodTone.fg : C.accent) : mute,
                      width: 104,
                    }}
                  >
                    {entry.ref}
                  </span>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      background: isTarget ? (restored ? GREEN : C.accent) : dark ? "#3A3A3C" : "#E8E8ED",
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 19,
                      color: isTarget ? C.white : fg,
                    }}
                  >
                    {entry.hash}
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: isTarget ? 700 : 500,
                      fontSize: 20,
                      color: fg,
                    }}
                  >
                    {entry.action}
                  </span>
                </div>

                {isTarget && targetLock > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 12px",
                      borderRadius: 999,
                      background: restored ? GREEN : C.accent,
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 16,
                      color: C.white,
                      ...materialize(targetLock),
                    }}
                  >
                    <Icon name={restored ? "check" : "arrowRight"} size={16} color={C.white} weight={2.6} />
                    <span>{restored ? "checked out!" : "target hash"}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </DevCard>
  );
};
