import { useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { IconName } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type FormulaTerm = {
  sym: string;
  label: string;
  value?: string;
  color?: string;
  at?: number;
};

const PALETTE = [C.accent, GREEN, AMBER, RED, "#AF52DE"];

/**
 * Annotated math/CS formula card.
 * Displays a large formula made of segments (`terms`), connects annotated variables
 * via SVG leader lines to explanation pills, and computes the final output at `solveAt`.
 */
export const FormulaCard: React.FC<{
  title?: string;
  terms: FormulaTerm[];
  solveAt?: number;
  result?: string;
  substitution?: string;
  at?: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  filename?: string;
  icon?: IconName;
}> = ({
  title = "formula breakdown",
  terms,
  solveAt,
  result,
  substitution,
  at = 0,
  until,
  x = TX,
  y = TY,
  w = TW,
  h = 540,
  dark = false,
  filename = "formula.math",
  icon = "code",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until, 10, 8);
  if (p === null) return null;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const borderCol = dark ? "rgba(255,255,255,0.1)" : C.line;
  const softBg = dark ? "rgba(255,255,255,0.04)" : "#F7F7FA";

  // Identify annotated variable terms (those with non-empty label)
  const annotated = terms
    .map((t, idx) => ({
      ...t,
      idx,
      color: t.color ?? PALETTE[idx % PALETTE.length],
      appearAt: t.at ?? at + 8 + idx * 5,
    }))
    .filter((t) => t.label.trim().length > 0);

  const effectiveSolveAt = solveAt ?? at + 28;
  const solveP = prog(frame, effectiveSolveAt, 12, easeOut);

  // Compute approximate horizontal positions of each term in the formula box for SVG leader lines
  const innerW = w - 64;
  const charUnits = terms.map((t) => Math.max(1.4, t.sym.length * 0.9 + (t.label.trim() ? 0.9 : 0.3)));
  const totalUnits = charUnits.reduce((acc, n) => acc + n, 0);
  const formulaSpanW = Math.min(innerW - 80, totalUnits * 30);
  const startX = (innerW - formulaSpanW) / 2;

  let accum = 0;
  const termCentersX = terms.map((_, i) => {
    const segW = (charUnits[i] / totalUnits) * formulaSpanW;
    const cx = startX + accum + segW / 2;
    accum += segW;
    return cx;
  });

  // Auto-derive final output & substitution if not explicitly passed
  const firstAnnotated = annotated[0];
  const rhsAnnotated = annotated.slice(1);
  const autoSubstitution =
    substitution ??
    rhsAnnotated
      .filter((t) => t.value)
      .map((t) => `${t.sym.trim()} = ${t.value}`)
      .join("  ·  ");
  const autoResult =
    result ??
    (firstAnnotated?.value
      ? `${firstAnnotated.sym.trim()} = ${firstAnnotated.value}`
      : annotated.find((t) => t.value)?.value ?? "solved");

  const bodyH = h - (filename !== undefined ? TAB_H : 0);
  const leaderH = 44;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon={icon}
      right={title}
    >
      <div
        style={{
          height: bodyH,
          padding: "24px 32px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* 1. Large Formula Stage */}
        <div
          style={{
            height: 112,
            borderRadius: 22,
            background: softBg,
            border: `1.5px solid ${borderCol}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "0 28px",
            position: "relative",
          }}
        >
          {terms.map((t, idx) => {
            const isVar = t.label.trim().length > 0;
            const varIdx = annotated.findIndex((a) => a.idx === idx);
            const col = isVar ? annotated[varIdx].color : mute;
            const tAt = isVar ? annotated[varIdx].appearAt : at + 4;
            const activeP = prog(frame, tAt, 10, easeOut);

            if (!isVar) {
              return (
                <span
                  key={idx}
                  style={{
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 44,
                    color: mute,
                    whiteSpace: "pre",
                  }}
                >
                  {t.sym}
                </span>
              );
            }

            return (
              <div
                key={idx}
                style={{
                  padding: "8px 18px",
                  borderRadius: 16,
                  background: activeP > 0 ? tint(col, dark ? 0.2 : 0.12) : "transparent",
                  border: `2px solid ${activeP > 0 ? col : "transparent"}`,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 46,
                  color: activeP > 0.2 ? col : fg,
                  lineHeight: 1.1,
                  whiteSpace: "pre",
                  ...materialize( Math.max(0.4, activeP), 0.96, 4),
                }}
              >
                {t.sym}
              </div>
            );
          })}
        </div>

        {/* 2. SVG Leader Lines connecting formula symbols to variable pills */}
        <svg
          width={innerW}
          height={leaderH}
          viewBox={`0 0 ${innerW} ${leaderH}`}
          style={{ display: "block", overflow: "visible" }}
        >
          {annotated.map((item, aIdx) => {
            const d = prog(frame, item.appearAt, 12, easeOut);
            if (d <= 0) return null;
            const fromX = termCentersX[item.idx];
            const pillColW = innerW / Math.max(1, annotated.length);
            const toX = pillColW * aIdx + pillColW / 2;
            const midY = leaderH * 0.5;
            const pathD = `M ${fromX} 0 L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${leaderH}`;
            return (
              <g key={item.idx}>
                <circle cx={fromX} cy={2} r={4.5} fill={item.color} opacity={d} />
                <path
                  d={pathD}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.75 * d}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - d}
                />
                <circle cx={toX} cy={leaderH - 2} r={4.5} fill={item.color} opacity={d} />
              </g>
            );
          })}
        </svg>

        {/* 3. Variable Explanation Pills Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(1, annotated.length)}, 1fr)`,
            gap: 14,
          }}
        >
          {annotated.map((item) => {
            const pillP = prog(frame, item.appearAt + 3, 10, easeOut);
            return (
              <div
                key={item.idx}
                style={{
                  padding: "14px 16px",
                  borderRadius: 18,
                  background: dark ? TERM.bg : C.white,
                  border: `1.5px solid ${tint(item.color, 0.55)}`,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 10,
                  ...materialize(pillP, 0.95, 6),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      background: tint(item.color, 0.15),
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 20,
                      color: item.color,
                    }}
                  >
                    {item.sym.trim()}
                  </span>
                  {item.value ? (
                    <span
                      style={{
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 18,
                        color: fg,
                        opacity: 0.45 + 0.55 * solveP,
                      }}
                    >
                      = {item.value}
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: 19,
                    color: mute,
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Computed Output Banner at `solveAt` */}
        <div
          style={{
            padding: "16px 22px",
            borderRadius: 18,
            background: solveP > 0 ? (dark ? tint(C.accent, 0.18) : BLUE_TINT) : softBg,
            border: `2px solid ${solveP > 0 ? C.accent : borderCol}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...materialize(Math.max(0.25, solveP), 0.96, 6),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 17, color: mute }}>
              substituted values
            </span>
            <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 21, color: fg }}>
              {autoSubstitution || title}
            </span>
          </div>

          <div
            style={{
              padding: "8px 18px",
              borderRadius: 12,
              background: C.accent,
              color: C.white,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 26,
              whiteSpace: "nowrap",
            }}
          >
            {autoResult}
          </div>
        </div>
      </div>
    </DevCard>
  );
};
