import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { CARD_SHADOW, GREEN, presence, RED, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type BackoffAttempt = {
  delay: string;
  at?: number;
  code?: string;
};

export const DEFAULT_BACKOFF_ATTEMPTS: BackoffAttempt[] = [
  { delay: "1s", code: "503" },
  { delay: "2s", code: "503" },
  { delay: "4s", code: "503" },
  { delay: "8s", code: "503" },
  { delay: "16s", code: "200 OK" },
];

/**
 * Retry & Exponential Backoff / Rate-Limiter visualizer.
 * Shows timeline attempts (`1s`, `2s`, `4s`, `8s`, `16s`) with arc hops between retries
 * and a final green success check or `429 Too Many Requests` shield.
 */
export const BackoffTimeline: React.FC<{
  attempts?: BackoffAttempt[];
  outcome?: "ok" | "rate_limited";
  x: number;
  y: number;
  w?: number;
  at?: number;
  until?: number;
  stepFrames?: number;
  filename?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  attempts = DEFAULT_BACKOFF_ATTEMPTS,
  outcome = "ok",
  x,
  y,
  w = 900,
  at = 0,
  until,
  stepFrames = 13,
  filename = "backoff.ts",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const bodyH = 380;
  const h = (filename ? TAB_H : 0) + bodyH;

  // Compute node X coordinates with progressively widening spacing to illustrate exponential wait growth
  const weights = attempts.map((_, i) => 1 + i * 0.34);
  const totalWeight = weights.reduce((acc, v) => acc + v, 0);
  const startX = 68;
  const endX = w - 82;
  const spanX = endX - startX;

  const nodeX: number[] = [startX];
  let accX = startX;
  for (let i = 0; i < attempts.length; i++) {
    accX += (weights[i] / totalWeight) * spanX;
    nodeX.push(accX);
  }

  const baseY = 258;
  const lastHopAt =
    attempts[attempts.length - 1]?.at ?? at + 8 + (attempts.length - 1) * stepFrames;
  const finalArriveAt = lastHopAt + 10;
  const finalP = prog(frame, finalArriveAt, 10, easeOut);

  const isSuccess = outcome === "ok";
  const rightText = isSuccess
    ? "wait = 1s × 2ⁿ · recovered"
    : "429 Rate Limit Exceeded";

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon={isSuccess ? "refresh" : "shield"}
      right={rightText}
      style={style}
    >
      {/* Top header banner inside card */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 25,
              letterSpacing: "-0.02em",
              color: dark ? TERM.fg : C.ink,
            }}
          >
            {isSuccess ? "Exponential backoff retry" : "Rate-limiter burst rejection"}
          </span>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 8,
              background: dark ? "rgba(255,255,255,0.08)" : "#F2F2F7",
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 18,
              color: dark ? TERM.dim : C.mute,
            }}
          >
            1s → 2s → 4s → 8s → 16s
          </span>
        </div>

        {/* Final status badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            borderRadius: 999,
            background:
              finalP > 0.1
                ? isSuccess
                  ? tint(GREEN, 0.16)
                  : tint(RED, 0.16)
                : dark
                  ? "rgba(255,255,255,0.08)"
                  : "#F2F2F7",
            color:
              finalP > 0.1
                ? isSuccess
                  ? "#248A3D"
                  : "#C9281E"
                : dark
                  ? TERM.dim
                  : C.mute,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 19,
            ...materialize(finalP > 0.1 ? finalP : 1, 0.94, 4),
          }}
        >
          <Icon
            name={
              finalP > 0.1
                ? isSuccess
                  ? "checkCircle"
                  : "shield"
                : "clock"
            }
            size={22}
            color={
              finalP > 0.1
                ? isSuccess
                  ? "#248A3D"
                  : RED
                : dark
                  ? TERM.dim
                  : C.mute
            }
            weight={2.3}
          />
          {finalP > 0.1
            ? isSuccess
              ? "200 OK · Connected"
              : "429 Too Many Requests"
            : "Retrying with backoff..."}
        </div>
      </div>

      {/* SVG Timeline & Arc Hops */}
      <svg
        width={w}
        height={bodyH}
        viewBox={`0 0 ${w} ${bodyH}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {/* Baseline track */}
        <line
          x1={startX}
          y1={baseY}
          x2={endX}
          y2={baseY}
          stroke={dark ? "rgba(255,255,255,0.14)" : "#E5E5EA"}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Arc hops between retry nodes */}
        {attempts.map((att, i) => {
          const hopStart = att.at ?? at + 8 + i * stepFrames;
          const hopP = prog(frame, hopStart, 11, easeInOut);
          if (hopP <= 0) return null;

          const x0 = nodeX[i];
          const x1 = nodeX[i + 1];
          const midX = (x0 + x1) / 2;
          const arcH = 54 + i * 22;
          const ctrlY = baseY - arcH * 1.85;
          const d = `M ${x0} ${baseY} Q ${midX} ${ctrlY} ${x1} ${baseY}`;

          const isLastHop = i === attempts.length - 1;
          const strokeColor = isLastHop
            ? isSuccess
              ? GREEN
              : RED
            : C.accent;

          // Traveling dot along quadratic curve for active hop
          const mt = 1 - hopP;
          const dotX = mt * mt * x0 + 2 * mt * hopP * midX + hopP * hopP * x1;
          const dotY = mt * mt * baseY + 2 * mt * hopP * ctrlY + hopP * hopP * baseY;

          return (
            <g key={i}>
              <path
                d={d}
                fill="none"
                stroke={tint(strokeColor, 0.22)}
                strokeWidth={3.5}
                strokeDasharray="6 6"
              />
              <path
                d={d}
                fill="none"
                stroke={strokeColor}
                strokeWidth={4}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - hopP}
              />
              {hopP > 0 && hopP < 1 ? (
                <circle cx={dotX} cy={dotY} r={7} fill={strokeColor} />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Delay pills at the peak of each arc */}
      {attempts.map((att, i) => {
        const hopStart = att.at ?? at + 8 + i * stepFrames;
        const pillP = prog(frame, hopStart + 2, 9, easeOut);
        if (pillP <= 0) return null;

        const x0 = nodeX[i];
        const x1 = nodeX[i + 1];
        const midX = (x0 + x1) / 2;
        const arcH = 54 + i * 22;
        const peakY = baseY - arcH * 0.94;
        const isLastHop = i === attempts.length - 1;

        const pillTone = isLastHop
          ? isSuccess
            ? { bg: "#EEFAF1", border: GREEN, fg: "#248A3D" }
            : { bg: "#FFF1F0", border: RED, fg: "#C9281E" }
          : {
              bg: dark ? "#2C2C30" : C.white,
              border: C.accent,
              fg: dark ? TERM.blue : C.accent,
            };

        return (
          <div
            key={`pill-${i}`}
            style={{
              position: "absolute",
              left: midX,
              top: peakY,
              translate: "-50% -50%",
              padding: "5px 14px",
              borderRadius: 999,
              background: pillTone.bg,
              border: `2px solid ${pillTone.border}`,
              boxShadow: CARD_SHADOW,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 20,
              color: pillTone.fg,
              whiteSpace: "nowrap",
              ...materialize(pillP, 0.9, 4),
            }}
          >
            +{att.delay}
          </div>
        );
      })}

      {/* Timeline Nodes (Initial + after each hop) */}
      {nodeX.map((nx, idx) => {
        const isFinal = idx === attempts.length;
        const nodeAt =
          idx === 0
            ? at + 4
            : (attempts[idx - 1].at ?? at + 8 + (idx - 1) * stepFrames) + 9;
        const nodeP = prog(frame, nodeAt, 9, easeOut);
        if (nodeP <= 0) return null;

        const size = isFinal ? 62 : 44;
        const codeLabel =
          idx === 0
            ? "Try #1"
            : isFinal
              ? isSuccess
                ? "200 OK"
                : "429 Block"
              : `Retry #${idx}`;

        const subCode =
          idx === 0
            ? outcome === "rate_limited"
              ? "429"
              : "503"
            : isFinal
              ? isSuccess
                ? "Success"
                : "Shielded"
              : attempts[idx - 1].code ?? (outcome === "rate_limited" ? "429" : "503");

        const nodeBg = isFinal
          ? isSuccess
            ? "#EEFAF1"
            : "#FFF1F0"
          : dark
            ? "#2C2C30"
            : C.white;

        const nodeBorder = isFinal
          ? isSuccess
            ? GREEN
            : RED
          : outcome === "rate_limited"
            ? AMBER
            : WIRE;

        const iconColor = isFinal
          ? isSuccess
            ? "#248A3D"
            : RED
          : outcome === "rate_limited"
            ? "#A05A00"
            : C.mute;

        return (
          <div
            key={`node-${idx}`}
            style={{
              position: "absolute",
              left: nx - size / 2,
              top: baseY - size / 2,
              width: size,
              height: size,
              ...materialize(nodeP, 0.88, 5),
            }}
          >
            <div
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                background: nodeBg,
                border: `3px solid ${nodeBorder}`,
                boxShadow: CARD_SHADOW,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name={
                  isFinal
                    ? isSuccess
                      ? "check"
                      : "shield"
                    : "cross"
                }
                size={isFinal ? 32 : 22}
                color={iconColor}
                weight={2.5}
              />
            </div>

            {/* Label under node */}
            <div
              style={{
                position: "absolute",
                top: size + 10,
                left: "50%",
                translate: "-50% 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 18,
                  color: isFinal
                    ? isSuccess
                      ? "#248A3D"
                      : "#C9281E"
                    : dark
                      ? TERM.fg
                      : C.ink,
                }}
              >
                {codeLabel}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 16,
                  color: isFinal
                    ? isSuccess
                      ? "#248A3D"
                      : "#C9281E"
                    : C.mute,
                }}
              >
                {subCode}
              </span>
            </div>
          </div>
        );
      })}
    </DevCard>
  );
};
