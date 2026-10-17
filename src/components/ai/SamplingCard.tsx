import { useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { Icon } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type CandidateToken = { token: string; prob: number };

const normalizeCandidates = (list: (CandidateToken | [string, number])[]): CandidateToken[] =>
  list.map((item) => (Array.isArray(item) ? { token: item[0], prob: item[1] } : item));

/** Applies temperature scaling to base probabilities (T=1 preserves exact input probabilities). */
const applyTemperature = (probs: number[], temp: number): number[] => {
  const effT = Math.max(0.12, temp);
  const logits = probs.map((p) => Math.log(Math.max(1e-4, p)) / effT);
  const maxLogit = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
};

/**
 * Next-token probability distribution card: shows a prompt with a blank slot (`___`),
 * candidate token probabilities, how `temperature` (`0.0` greedy vs `1.0+` creative)
 * reshapes the softmax bars, and picks a token into the prompt at `pickAt`.
 */
export const SamplingCard: React.FC<{
  prompt?: string;
  candidates: (CandidateToken | [string, number])[];
  temperature?: number;
  tempTo?: { at: number; value: number };
  pickAt?: number;
  pickedIndex?: number;
  topP?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  dark?: boolean;
  filename?: string;
  style?: React.CSSProperties;
}> = ({
  prompt = "The raccoon opened the",
  candidates,
  temperature = 1.0,
  tempTo,
  pickAt,
  pickedIndex,
  topP = 0.92,
  x = TX,
  y = TY,
  w = TW,
  h = 560,
  at = 0,
  until,
  dark = false,
  filename = "sampler · next-token logits",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const items = normalizeCandidates(candidates);
  const tempGlide = tempTo ? prog(frame, tempTo.at, 18, easeInOut) : 0;
  const curTemp = tempTo ? lerp(temperature, tempTo.value, tempGlide) : temperature;

  const baseProbs = items.map((c) => c.prob);
  const scaledProbs = Math.abs(curTemp - 1.0) < 0.02 ? baseProbs : applyTemperature(baseProbs, curTemp);

  const pAt = pickAt ?? at + 38;
  const pickP = prog(frame, pAt, 12, easeOut);
  const isPicked = frame >= pAt;
  const chosenIdx = pickedIndex ?? (curTemp > 0.85 && items.length > 2 ? 0 : 0);
  const chosenToken = items[chosenIdx]?.token ?? "trash";

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const line = dark ? "rgba(255,255,255,0.10)" : C.line;
  const bodyH = h - (filename !== undefined ? TAB_H : 0);

  const modeLabel = curTemp <= 0.15 ? "greedy (argmax)" : curTemp >= 0.95 ? "creative sampling" : "focused";
  const modeColor = curTemp <= 0.15 ? C.accent : curTemp >= 0.95 ? AMBER : GREEN;

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
      right={`top_p = ${topP.toFixed(2)}`}
      style={style}
    >
      <div
        style={{
          padding: "24px 34px",
          height: bodyH,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* Prompt completion header */}
        <div
          style={{
            padding: "16px 22px",
            borderRadius: 18,
            background: dark ? "rgba(255,255,255,0.05)" : "#F5F5F7",
            border: `1px solid ${line}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 28,
            color: fg,
            letterSpacing: "-0.01em",
          }}
        >
          <span>{prompt}</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 16px",
              borderRadius: 12,
              background: isPicked ? tint(GREEN, 0.16) : BLUE_TINT,
              border: `2px solid ${isPicked ? GREEN : C.accent}`,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 26,
              color: isPicked ? "#248A3D" : C.accent,
            }}
          >
            {isPicked ? chosenToken : "___"}
          </span>
        </div>

        {/* Temperature gauge strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 2px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 22, color: mute }}>
              temperature
            </span>
            <span
              style={{
                padding: "4px 14px",
                borderRadius: 10,
                background: tint(modeColor, 0.14),
                color: modeColor === AMBER ? "#A05A00" : modeColor,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 22,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              T = {curTemp.toFixed(1)} · {modeLabel}
            </span>
          </div>

          {/* Mini slider bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: mono, fontSize: 18, color: mute }}>
            <span>0.0</span>
            <div
              style={{
                width: 130,
                height: 10,
                borderRadius: 5,
                background: dark ? "rgba(255,255,255,0.12)" : C.soft,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: `${Math.min(100, Math.max(0, (curTemp / 1.4) * 100))}%`,
                  top: -4,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: modeColor,
                  translate: "-50% 0",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                }}
              />
            </div>
            <span>1.4</span>
          </div>
        </div>

        {/* Candidate distribution rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((cand, i) => {
            const rowEnter = prog(frame, at + 6 + i * 3, 10, easeOut);
            const prob = scaledProbs[i] ?? 0;
            const win = isPicked && i === chosenIdx;
            const dimmed = isPicked && i !== chosenIdx;

            return (
              <div
                key={cand.token}
                style={{
                  height: 58,
                  padding: "0 18px",
                  borderRadius: 16,
                  background: win
                    ? tint(GREEN, 0.13)
                    : dark
                      ? "rgba(255,255,255,0.03)"
                      : "#FAFAFC",
                  border: `2px solid ${win ? GREEN : line}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  ...materialize(rowEnter),
                  opacity: rowEnter * (dimmed ? lerp(1, 0.48, pickP) : 1),
                }}
              >
                {/* Token chip */}
                <div
                  style={{
                    width: 170,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 24,
                    color: win ? "#248A3D" : fg,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: mute, fontWeight: 500 }}>"</span>
                  <span>{cand.token}</span>
                  <span style={{ color: mute, fontWeight: 500 }}>"</span>
                </div>

                {/* Probability bar */}
                <div
                  style={{
                    flex: 1,
                    height: 22,
                    borderRadius: 11,
                    background: dark ? "rgba(255,255,255,0.10)" : C.soft,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(2, prob * rowEnter * 100)}%`,
                      height: "100%",
                      borderRadius: 11,
                      background: win ? GREEN : i === 0 ? C.accent : "#8E8E93",
                    }}
                  />
                </div>

                {/* Numeric probability */}
                <div
                  style={{
                    width: 82,
                    textAlign: "right",
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 23,
                    color: win ? "#248A3D" : fg,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {(prob * 100).toFixed(0)}%
                </div>

                {/* Sampled badge */}
                <div style={{ width: 116, display: "flex", justifyContent: "flex-end" }}>
                  {win ? (
                    <div
                      style={{
                        height: 36,
                        padding: "0 12px",
                        borderRadius: 18,
                        background: GREEN,
                        color: C.white,
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 17,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        ...materialize(pickP),
                      }}
                    >
                      <Icon name="check" size={18} color={C.white} weight={2.6} />
                      <span>picked</span>
                    </div>
                  ) : (
                    <span style={{ fontFamily: mono, fontSize: 18, color: mute }}>
                      p={prob.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DevCard>
  );
};
