import { useCurrentFrame, useVideoConfig } from "remotion";
import { DevCard, toneColors } from "../dev/card";
import { alpha, BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { appleSpring, C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type BisectStep = {
  index: number;
  verdict: "good" | "bad" | "culprit";
  at: number;
  hash?: string;
  note?: string;
};

export type GitBisectTrackProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  total?: 16 | 32 | number;
  steps?: BisectStep[];
  goodLabel?: string;
  badLabel?: string;
  culpritReason?: string;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
};

const DEFAULT_HASHES_16 = [
  "1a0b2c3", "2b4d5e1", "3c8f9a0", "4d1e2b7",
  "5e9a3c4", "6f2b8d1", "7a4c9e2", "8b1d0f5",
  "9c3e7a8", "ad5f1b2", "be7a4c9", "cf9b2d3",
  "d01c5e6", "e42d8f1", "f73e9a4", "098f1b6",
];

/**
 * `git bisect` binary-search commit track: displays a horizontal track of 16 or 32 commits
 * (`v1.0 good` in green on the left, `HEAD bad` in red on the right) and animates `git bisect`
 * halving the active search window step-by-step until it isolates the exact culprit commit.
 */
export const GitBisectTrack: React.FC<GitBisectTrackProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 540,
  at,
  until,
  total = 16,
  steps,
  goodLabel = "v1.0 · good",
  badLabel = "HEAD · bad",
  culpritReason = "off-by-one in token expiry check",
  filename = "git-bisect",
  right = "O(log₂ n) search",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const mid1 = Math.floor(total / 2);
  const mid2 = Math.floor(mid1 / 2);
  const mid3 = mid2 + Math.floor((mid1 - mid2) / 2);
  const culpritIdx = mid3 + 1;

  const activeSteps: BisectStep[] = steps ?? [
    { index: mid1, verdict: "bad", at: at + 18, hash: DEFAULT_HASHES_16[mid1 % 16], note: "reproduces bug → search left half" },
    { index: mid2, verdict: "good", at: at + 38, hash: DEFAULT_HASHES_16[mid2 % 16], note: "passes tests → search right half" },
    { index: mid3, verdict: "good", at: at + 58, hash: DEFAULT_HASHES_16[mid3 % 16], note: "passes tests → 1 commit left" },
    { index: culpritIdx, verdict: "culprit", at: at + 78, hash: DEFAULT_HASHES_16[culpritIdx % 16], note: culpritReason },
  ];

  const sorted = [...activeSteps].sort((a, b) => a.at - b.at);

  // Smoothly compute the current binary search bounds [low, high] and active probe index
  let low = 0;
  let high = total - 1;
  let probeIdx = mid1;
  let currentStepIdx = -1;

  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    if (frame < s.at) break;
    currentStepIdx = i;
    const stepP = prog(frame, s.at, 14, easeInOut);
    const nextProbe = i + 1 < sorted.length ? sorted[i + 1].index : s.index;
    probeIdx = lerp(s.index, nextProbe, prog(frame, s.at + 6, 12, easeInOut));

    if (s.verdict === "good") {
      low = lerp(low, Math.max(low, s.index), stepP);
    } else if (s.verdict === "bad") {
      high = lerp(high, Math.min(high, s.index), stepP);
    } else if (s.verdict === "culprit") {
      low = lerp(low, s.index, stepP);
      high = lerp(high, s.index, stepP);
    }
  }

  const activeStep = currentStepIdx >= 0 ? sorted[currentStepIdx] : null;
  const culpritStep = sorted.find((s) => s.verdict === "culprit" && frame >= s.at);
  const culpritP = culpritStep ? prog(frame, culpritStep.at, 12) : 0;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const goodTone = toneColors("good", dark);
  const badTone = toneColors("bad", dark);
  const accentTone = toneColors("accent", dark);

  const trackLeft = 52;
  const trackRight = w - 52;
  const trackW = trackRight - trackLeft;
  const stepX = trackW / (total - 1);
  const trackY = 212;
  const dotR = total <= 16 ? 18 : 11;

  const xOf = (idx: number) => trackLeft + idx * stepX;
  const rangeLeftX = xOf(low);
  const rangeRightX = xOf(high);
  const probeX = xOf(probeIdx);

  const remainingCount = Math.max(1, Math.round(high - low));
  const stepsRemaining = culpritStep ? 0 : Math.max(1, Math.ceil(Math.log2(remainingCount + 1)));

  // Verdict map for already-evaluated steps
  const verdictAt = new Map<number, BisectStep>();
  for (const s of sorted) {
    if (frame >= s.at) verdictAt.set(s.index, s);
  }

  const commandText = !activeStep
    ? `$ git bisect start HEAD v1.0`
    : activeStep.verdict === "culprit"
      ? `bisect found first bad commit #${activeStep.index}`
      : `$ git bisect ${activeStep.verdict}   # commit #${activeStep.index}`;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon="search" right={right} style={style}>
      {/* Top command + remaining counter bar */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          top: 24,
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
            padding: "10px 20px",
            borderRadius: 14,
            background: dark ? TERM.bar : "#F2F2F4",
            border: `1px solid ${C.line}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 22,
            color: culpritStep ? badTone.fg : fg,
          }}
        >
          <Icon name={culpritStep ? "bug" : "terminal"} size={24} color={culpritStep ? RED : C.accent} weight={2.2} />
          <span>{commandText}</span>
        </div>

        <div
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            background: culpritStep ? badTone.bg : accentTone.bg,
            border: `1.5px solid ${culpritStep ? badTone.edge : accentTone.edge}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 20,
            color: culpritStep ? badTone.fg : accentTone.fg,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {culpritStep
            ? `pinned in ${sorted.length} steps!`
            : `${remainingCount} commits in range · ~${stepsRemaining} steps left`}
        </div>
      </div>

      {/* Endpoint badges: v1.0 good (left) and HEAD bad (right) */}
      <div
        style={{
          position: "absolute",
          left: trackLeft,
          top: 108,
          padding: "5px 14px",
          borderRadius: 999,
          background: goodTone.bg,
          border: `1.5px solid ${goodTone.edge}`,
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 18,
          color: goodTone.fg,
          ...materialize(prog(frame, at + 6, 8)),
        }}
      >
        {goodLabel}
      </div>

      <div
        style={{
          position: "absolute",
          right: w - trackRight,
          top: 108,
          padding: "5px 14px",
          borderRadius: 999,
          background: badTone.bg,
          border: `1.5px solid ${badTone.edge}`,
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 18,
          color: badTone.fg,
          ...materialize(prog(frame, at + 8, 8)),
        }}
      >
        {badLabel}
      </div>

      {/* Active search window highlight box behind the track */}
      <div
        style={{
          position: "absolute",
          left: rangeLeftX - dotR - 8,
          width: Math.max(( dotR + 8 ) * 2, rangeRightX - rangeLeftX + (dotR + 8) * 2),
          top: trackY - 38,
          height: 76,
          borderRadius: 22,
          background: culpritStep ? alpha(RED, 0.11) : dark ? alpha(C.accent, 0.16) : BLUE_TINT,
          border: `2.5px solid ${culpritStep ? RED : C.accent}`,
          ...materialize(prog(frame, at + 10, 10)),
        }}
      />

      {/* Gliding midpoint pointer pill above active probe */}
      <div
        style={{
          position: "absolute",
          left: probeX,
          top: trackY - 82,
          translate: "-50% 0",
          padding: "4px 14px",
          borderRadius: 999,
          background: culpritStep ? RED : C.accent,
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 17,
          color: C.white,
          whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          ...materialize(prog(frame, at + 12, 8)),
        }}
      >
        {culpritStep ? `culprit #${culpritStep.index}` : `midpoint #${Math.round(probeIdx)}`}
      </div>

      {/* SVG Commit Track */}
      <svg width={w} height={140} style={{ position: "absolute", left: 0, top: trackY - 70, overflow: "visible" }}>
        {/* Base connector line */}
        <line
          x1={trackLeft}
          y1={70}
          x2={trackRight}
          y2={70}
          stroke={dark ? "rgba(255,255,255,0.14)" : "#D2D2D7"}
          strokeWidth={5}
          strokeLinecap="round"
        />

        {/* Active search segment line */}
        <line
          x1={rangeLeftX}
          y1={70}
          x2={rangeRightX}
          y2={70}
          stroke={culpritStep ? RED : C.accent}
          strokeWidth={6}
          strokeLinecap="round"
        />

        {/* Commit nodes 0..total-1 */}
        {Array.from({ length: total }).map((_, idx) => {
          const cx = xOf(idx);
          const enterT = frame - (at + 4 + idx * (total <= 16 ? 0.7 : 0.35));
          if (enterT < 0) return null;
          const sp = appleSpring(enterT, fps, { response: 0.3 });

          const stepHit = verdictAt.get(idx);
          const isFirst = idx === 0;
          const isLast = idx === total - 1;
          const inRange = idx >= Math.floor(low) && idx <= Math.ceil(high);

          let stroke = dark ? TERM.dim : "#86868B";
          let fill = dark ? TERM.bg : C.white;
          let nodeOpacity = inRange ? 1 : 0.28;

          if (isFirst || stepHit?.verdict === "good") {
            stroke = GREEN;
            fill = isFirst || stepHit ? GREEN : fill;
            if (stepHit) nodeOpacity = 0.9;
          } else if (isLast || stepHit?.verdict === "bad") {
            stroke = RED;
            fill = isLast || stepHit ? RED : fill;
            if (stepHit) nodeOpacity = 0.9;
          } else if (stepHit?.verdict === "culprit") {
            stroke = RED;
            fill = RED;
            nodeOpacity = 1;
          } else if (inRange) {
            stroke = C.accent;
          }

          const isCulprit = stepHit?.verdict === "culprit";

          return (
            <g key={idx} opacity={nodeOpacity}>
              {isCulprit ? (
                <circle
                  cx={cx}
                  cy={70}
                  r={(dotR + 10) * (0.85 + 0.15 * culpritP)}
                  fill={alpha(RED, 0.2)}
                  stroke={RED}
                  strokeWidth={2.5}
                />
              ) : null}
              <circle
                cx={cx}
                cy={70}
                r={dotR * (isCulprit ? 1.18 : 1) * (0.5 + 0.5 * sp)}
                fill={fill}
                stroke={stroke}
                strokeWidth={total <= 16 ? 4.5 : 3.5}
              />
              {total <= 16 ? (
                <text
                  x={cx}
                  y={75}
                  textAnchor="middle"
                  fill={fill === GREEN || fill === RED ? C.white : fg}
                  style={{ fontFamily: mono, fontWeight: 700, fontSize: 14 }}
                >
                  {idx}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Step history pills + culprit banner at the bottom */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          top: 292,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Step pills row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {sorted.map((s, i) => {
            const sp = prog(frame, s.at, 9);
            if (sp <= 0) return null;
            const tone = s.verdict === "good" ? goodTone : badTone;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: tone.bg,
                  border: `1.5px solid ${tone.edge}`,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 19,
                  color: tone.fg,
                  ...materialize(sp),
                }}
              >
                <Icon
                  name={s.verdict === "good" ? "check" : s.verdict === "culprit" ? "bug" : "cross"}
                  size={20}
                  color={tone.fg}
                  weight={2.5}
                />
                <span>
                  #{s.index} {s.hash ?? DEFAULT_HASHES_16[s.index % 16]} · {s.verdict}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active step or culprit detail box */}
        {activeStep ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 22px",
              borderRadius: 18,
              background: culpritStep ? badTone.bg : dark ? TERM.bar : "#F5F5F7",
              border: `1.5px solid ${culpritStep ? badTone.edge : C.line}`,
              ...materialize(prog(frame, activeStep.at, 8)),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Icon
                name={culpritStep ? "bug" : "commit"}
                size={28}
                color={culpritStep ? RED : C.accent}
                weight={2.2}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: culpritStep ? badTone.fg : fg }}>
                  {culpritStep
                    ? `${culpritStep.hash ?? DEFAULT_HASHES_16[culpritStep.index % 16]} is the first bad commit`
                    : `Testing commit #${activeStep.index} (${activeStep.hash ?? DEFAULT_HASHES_16[activeStep.index % 16]})`}
                </div>
                <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 20, color: mute }}>
                  {activeStep.note}
                </div>
              </div>
            </div>

            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                color: culpritStep ? badTone.fg : C.accent,
                whiteSpace: "nowrap",
              }}
            >
              {culpritStep ? `${sorted.length} checks vs ${total}` : `step ${currentStepIdx + 1}/${sorted.length}`}
            </div>
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
