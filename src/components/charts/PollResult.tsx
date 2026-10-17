import { interpolateColors, useCurrentFrame } from "remotion";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { formatNumber } from "../data/NumberTicker";
import { CARD_SHADOW, GREEN, presence, RED } from "../diagram/Node";
import { Mark } from "../layouts/Mark";

// Poll result ("73% got this wrong"): white option cards whose grey fills grow to each option's share while
// the percentages count up, then the answer is marked: the right option turns green with a check, options
// flagged `wrong` turn red with a cross. Without a right answer the most-voted option is marked in blue.

export type PollOption = { label: string; value: number; correct?: boolean; wrong?: boolean };

const FILL = "#E8E8ED";
const TONE = { right: { fill: "#D3F2DB", mark: GREEN }, wrong: { fill: "#FFE0DE", mark: RED }, top: { fill: "#D3E6FB", mark: C.accent } };

/**
 * Poll at (x, y), `w` wide. `options[].value` = votes or percent (shares are computed from the sum).
 * Rows enter `stagger` frames apart from `at`, fills grow from `fillAt` (default `at + 12`) over `dur`,
 * marks land at `markAt` (default when the fills end). `question` sits above, `votes` ("1,284 votes") below.
 */
export const PollResult: React.FC<{
  options: PollOption[];
  at: number;
  x: number;
  y: number;
  w?: number;
  until?: number;
  fillAt?: number;
  markAt?: number;
  dur?: number;
  stagger?: number;
  question?: string;
  votes?: number;
  rowH?: number;
  gap?: number;
  labelFont?: "sans" | "mono";
  fontSize?: number;
}> = ({ options, at, x, y, w = 900, until, fillAt, markAt, dur = 28, stagger = 4, question, votes, rowH = 108, gap = 22, labelFont = "sans", fontSize = 36 }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const total = options.reduce((s, o) => s + o.value, 0) || 1;
  const fStart = fillAt ?? at + 12;
  const mStart = markAt ?? fStart + dur;
  const g = prog(frame, fStart, dur, easeOut);
  const mp = prog(frame, mStart, 12, easeInOut);
  const hasAnswer = options.some((o) => o.correct);
  const top = options.reduce((b, o, i) => (o.value > options[b].value ? i : b), 0);
  const qH = question ? fontSize * 2.4 : 0;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: p }}>
      {question ? (
        <div
          style={{
            height: qH,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: fontSize * 1.1,
            letterSpacing: "-0.03em",
            color: C.ink,
            whiteSpace: "nowrap",
            ...materialize(prog(frame, at, 10), 0.95, 6),
            transformOrigin: "0% 50%",
          }}
        >
          {question}
        </div>
      ) : null}
      {options.map((o, i) => {
        const t = at + (question ? 4 : 0) + i * stagger;
        const lp = prog(frame, t, 10);
        const share = o.value / total;
        const tone = o.correct ? TONE.right : o.wrong ? TONE.wrong : !hasAnswer && i === top ? TONE.top : null;
        const fill = tone ? interpolateColors(mp, [0, 1], [FILL, tone.fill]) : FILL;
        const dim = tone ? 1 : 1 - 0.45 * mp;
        return (
          <div
            key={i}
            style={{
              position: "relative",
              height: rowH,
              marginBottom: gap,
              borderRadius: 24,
              background: C.white,
              boxShadow: CARD_SHADOW,
              overflow: "hidden",
              ...materialize(frame < t ? 0 : lp, 0.97, 6),
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${share * 100 * g}%`, background: fill }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                padding: "0 32px",
                gap: 18,
                fontSize,
                opacity: dim,
              }}
            >
              <div
                style={{
                  flex: 1,
                  fontFamily: labelFont === "mono" ? mono : sans,
                  fontWeight: labelFont === "mono" ? 500 : 600,
                  fontSize: labelFont === "mono" ? fontSize * 0.9 : fontSize,
                  letterSpacing: labelFont === "mono" ? 0 : "-0.015em",
                  color: C.ink,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {o.label}
              </div>
              {tone && mp > 0 ? (
                <Mark kind={o.correct || !hasAnswer ? "check" : "cross"} size={fontSize * 1.25} color={tone.mark} draw={mp} style={{ ...materialize(mp, 0.8, 4) }} />
              ) : null}
              <div style={{ fontFamily: sans, fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: C.ink, minWidth: fontSize * 2.3, textAlign: "right" }}>
                {formatNumber(Math.round(share * 100 * g))}%
              </div>
            </div>
          </div>
        );
      })}
      {votes !== undefined ? (
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: fontSize * 0.78, color: C.mute, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums", opacity: prog(frame, fStart, 10) }}>
          {formatNumber(Math.round(votes * g))} votes
        </div>
      ) : null}
    </div>
  );
};
