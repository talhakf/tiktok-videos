import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { BLUE_TINT, CARD_SHADOW, GREEN } from "../diagram/Node";
import { Mark, outP } from "../layouts/Mark";
import { tint } from "../windows/MacWindow";

// Head-to-head multi-round benchmark scoreboard:
// Tallies the live score ("1 – 3") at the top as each round reveals its metric and winner.

export type ScoreRound = {
  metric: string;
  leftVal: string;
  rightVal: string;
  winner: "left" | "right" | "tie";
  at: number;
};

export const Scoreboard: React.FC<{
  at?: number;
  until?: number;
  leftName: string;
  leftSub?: string;
  leftIcon?: IconName;
  rightName: string;
  rightSub?: string;
  rightIcon?: IconName;
  rounds: ScoreRound[];
  x?: number;
  y?: number;
  w?: number;
}> = ({
  at = 0,
  until,
  leftName,
  leftSub,
  leftIcon,
  rightName,
  rightSub,
  rightIcon,
  rounds,
  x = TX,
  y = TY,
  w = TW,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;

  const p = prog(frame, at, 10);

  const revealed = rounds.filter((r) => frame >= r.at);
  const leftScore = revealed.filter((r) => r.winner === "left").length;
  const rightScore = revealed.filter((r) => r.winner === "right").length;
  const lastAt = revealed.length > 0 ? Math.max(...revealed.map((r) => r.at)) : -1;
  const scoreBump = lastAt >= 0 ? prog(frame, lastAt, 8) : 1;

  const leftLeads = leftScore > rightScore;
  const rightLeads = rightScore > leftScore;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        borderRadius: 36,
        background: C.white,
        boxShadow: CARD_SHADOW,
        border: `1px solid ${C.line}`,
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(p * (1 - out), 0.95, 8),
      }}
    >
      {/* Header: Contenders + Live Tally */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "32px 40px 28px",
          background: "#FAFAFC",
          borderBottom: `1px solid ${C.line}`,
          gap: 20,
        }}
      >
        {/* Left contender */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {leftIcon ? (
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: leftLeads ? BLUE_TINT : C.soft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={leftIcon} size={32} color={leftLeads ? C.accent : C.ink} weight={2.1} />
            </div>
          ) : null}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 40,
                letterSpacing: "-0.03em",
                color: leftLeads ? C.accent : C.ink,
                lineHeight: 1.1,
              }}
            >
              {leftName}
            </div>
            {leftSub ? (
              <div style={{ marginTop: 4, fontFamily: mono, fontWeight: 500, fontSize: 22, color: C.mute }}>
                {leftSub}
              </div>
            ) : null}
          </div>
        </div>

        {/* Center live score pill */}
        <div
          style={{
            padding: "12px 30px",
            borderRadius: 24,
            background: C.white,
            border: `1.5px solid ${C.line}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontVariantNumeric: "tabular-nums",
            ...materialize(scoreBump, 0.95, 4),
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 48,
              letterSpacing: "-0.03em",
              color: leftLeads ? C.accent : C.ink,
            }}
          >
            {leftScore}
          </span>
          <span style={{ fontWeight: 600, fontSize: 36, color: C.mute }}>–</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 48,
              letterSpacing: "-0.03em",
              color: rightLeads ? C.accent : C.ink,
            }}
          >
            {rightScore}
          </span>
        </div>

        {/* Right contender */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, textAlign: "right" }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 40,
                letterSpacing: "-0.03em",
                color: rightLeads ? C.accent : C.ink,
                lineHeight: 1.1,
              }}
            >
              {rightName}
            </div>
            {rightSub ? (
              <div style={{ marginTop: 4, fontFamily: mono, fontWeight: 500, fontSize: 22, color: C.mute }}>
                {rightSub}
              </div>
            ) : null}
          </div>
          {rightIcon ? (
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: rightLeads ? BLUE_TINT : C.soft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={rightIcon} size={32} color={rightLeads ? C.accent : C.ink} weight={2.1} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Rounds */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rounds.map((r, i) => {
          const rowEnter = prog(frame, at + 3 + i * 2, 10);
          const revP = prog(frame, r.at, 10, easeInOut);
          const isRevealed = frame >= r.at;
          const leftWon = isRevealed && r.winner === "left";
          const rightWon = isRevealed && r.winner === "right";
          const isTie = isRevealed && r.winner === "tie";

          return (
            <div
              key={`${r.metric}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                padding: "24px 40px",
                borderTop: i > 0 ? `1px solid ${C.line}` : undefined,
                gap: 20,
                ...materialize(rowEnter, 0.97, 6),
              }}
            >
              {/* Left result */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {isRevealed ? (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 12,
                      padding: leftWon ? "8px 20px" : "8px 4px",
                      borderRadius: 16,
                      background: leftWon ? tint(GREEN, 0.13) : "transparent",
                      border: leftWon ? `1.5px solid ${tint(GREEN, 0.4)}` : "1.5px solid transparent",
                      ...materialize(revP, 0.95, 6),
                    }}
                  >
                    {leftWon ? (
                      <Mark kind="check" size={32} color={GREEN} draw={prog(frame, r.at + 2, 8)} />
                    ) : null}
                    <span
                      style={{
                        fontFamily: mono,
                        fontWeight: leftWon ? 700 : 500,
                        fontSize: 32,
                        color: interpolateColors(
                          revP,
                          [0, 1],
                          [C.mute, leftWon ? "#248A3D" : isTie ? C.ink : C.mute]
                        ),
                      }}
                    >
                      {r.leftVal}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontFamily: mono, fontSize: 28, color: C.soft }}>—</span>
                )}
              </div>

              {/* Center metric name */}
              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 28,
                  letterSpacing: "-0.015em",
                  color: C.mute,
                  textAlign: "center",
                  padding: "6px 18px",
                  borderRadius: 999,
                  background: C.paper,
                }}
              >
                {r.metric}
              </div>

              {/* Right result */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
                {isRevealed ? (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 12,
                      padding: rightWon ? "8px 20px" : "8px 4px",
                      borderRadius: 16,
                      background: rightWon ? tint(GREEN, 0.13) : "transparent",
                      border: rightWon ? `1.5px solid ${tint(GREEN, 0.4)}` : "1.5px solid transparent",
                      ...materialize(revP, 0.95, 6),
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontWeight: rightWon ? 700 : 500,
                        fontSize: 32,
                        color: interpolateColors(
                          revP,
                          [0, 1],
                          [C.mute, rightWon ? "#248A3D" : isTie ? C.ink : C.mute]
                        ),
                      }}
                    >
                      {r.rightVal}
                    </span>
                    {rightWon ? (
                      <Mark kind="check" size={32} color={GREEN} draw={prog(frame, r.at + 2, 8)} />
                    ) : null}
                  </div>
                ) : (
                  <span style={{ fontFamily: mono, fontSize: 28, color: C.soft }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
