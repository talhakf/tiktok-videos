import { interpolateColors, useCurrentFrame } from "remotion";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, mono, prog } from "../../theme";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, lerp, presence, WIRE } from "../diagram/Node";

export type GateKind = "AND" | "OR" | "XOR" | "NAND" | "NOT";

const evalGate = (gate: GateKind, a: 0 | 1, b: 0 | 1): 0 | 1 => {
  switch (gate) {
    case "AND":
      return a === 1 && b === 1 ? 1 : 0;
    case "OR":
      return a === 1 || b === 1 ? 1 : 0;
    case "XOR":
      return a !== b ? 1 : 0;
    case "NAND":
      return a === 1 && b === 1 ? 0 : 1;
    case "NOT":
      return a === 1 ? 0 : 1;
  }
};

const GATE_FORMULA: Record<GateKind, string> = {
  AND: "OUT = A · B",
  OR: "OUT = A + B",
  XOR: "OUT = A ⊕ B",
  NAND: "OUT = ¬(A · B)",
  NOT: "OUT = ¬A",
};

const TRUTH_PAIRS: [0 | 1, 0 | 1][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

/**
 * Digital logic gate & truth table card: renders a clean SVG gate (`"AND" | "OR" | "XOR" | "NAND" | "NOT"`),
 * input wires `A` and `B`, output wire `OUT` (0 = grey, 1 = blue `#0071E3`), and the 4-row Truth Table on
 * the right where `cycleAt` steps through `(0,0) → (0,1) → (1,0) → (1,1)`.
 */
export const LogicGates: React.FC<{
  gate: GateKind;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  inputs?: [0 | 1, 0 | 1];
  cycleAt?: number | number[];
  stepDur?: number;
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  gate,
  x = TX,
  y = TY,
  w = TW,
  h: customH,
  at = 0,
  until,
  inputs = [0, 0],
  cycleAt,
  stepDur = 18,
  filename,
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  // Determine current truth-table row (0..3) and smooth transition progress
  const stepFrames: number[] = Array.isArray(cycleAt)
    ? cycleAt
    : cycleAt !== undefined
      ? [cycleAt, cycleAt + stepDur, cycleAt + stepDur * 2, cycleAt + stepDur * 3]
      : [];

  let activeRow = TRUTH_PAIRS.findIndex(([pa, pb]) => pa === inputs[0] && pb === inputs[1]);
  if (activeRow < 0) activeRow = 0;
  let prevRow = activeRow;
  let stepT = 1;

  for (let i = 0; i < stepFrames.length && i < 4; i++) {
    if (frame >= stepFrames[i]) {
      prevRow = activeRow;
      activeRow = i;
      stepT = prog(frame, stepFrames[i], 8, easeInOut);
    }
  }

  const [aBit, bBit] = TRUTH_PAIRS[activeRow];
  const [prevA, prevB] = TRUTH_PAIRS[prevRow];
  const outBit = evalGate(gate, aBit, bBit);
  const prevOut = evalGate(gate, prevA, prevB);

  const aWeight = lerp(prevA, aBit, stepT);
  const bWeight = lerp(prevB, bBit, stepT);
  const outWeight = lerp(prevOut, outBit, stepT);
  const smoothRow = lerp(prevRow, activeRow, stepT);

  const wireA = interpolateColors(aWeight, [0, 1], [WIRE, C.accent]);
  const wireB = interpolateColors(bWeight, [0, 1], [WIRE, C.accent]);
  const wireOut = interpolateColors(outWeight, [0, 1], [WIRE, C.accent]);
  const gateFill = interpolateColors(outWeight, [0, 1], [C.white, BLUE_TINT]);
  const gateStroke = interpolateColors(outWeight, [0, 1], [C.ink, C.accent]);

  const tabH = filename !== undefined ? TAB_H : 0;
  const bodyH = 340;
  const h = customH ?? tabH + bodyH;

  // SVG schematic coordinates (width 500, height 260)
  const svgW = 490;
  const svgH = 250;
  const isUnary = gate === "NOT";
  const hasBubble = gate === "NAND" || gate === "NOT";
  const gateOutX = hasBubble ? 334 : 316;

  // Gate body SVG path in local box x: 180..316, y: 65..185 (centre y = 125)
  const renderGateBody = () => {
    if (gate === "AND" || gate === "NAND") {
      return (
        <path
          d="M 185 65 H 250 A 60 60 0 0 1 250 185 H 185 Z"
          fill={gateFill}
          stroke={gateStroke}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      );
    }
    if (gate === "OR" || gate === "XOR") {
      return (
        <>
          {gate === "XOR" ? (
            <path
              d="M 168 65 Q 202 125 168 185"
              fill="none"
              stroke={gateStroke}
              strokeWidth={4}
              strokeLinecap="round"
            />
          ) : null}
          <path
            d="M 182 65 H 228 C 268 65 298 92 316 125 C 298 158 268 185 228 185 H 182 Q 216 125 182 65 Z"
            fill={gateFill}
            stroke={gateStroke}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        </>
      );
    }
    // NOT gate: triangle + inversion bubble
    return (
      <path
        d="M 190 68 L 310 125 L 190 182 Z"
        fill={gateFill}
        stroke={gateStroke}
        strokeWidth={4}
        strokeLinejoin="round"
      />
    );
  };

  const wireInX = gate === "OR" || gate === "XOR" ? 196 : 185;

  // Truth table dimensions on the right
  const tableX = 536;
  const tableW = w - tableX - 32;
  const tableTop = 28;
  const headerH = 48;
  const rowH = 56;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      filename={filename}
      icon="binary"
      right={right ?? GATE_FORMULA[gate]}
      style={style}
    >
      {/* Left side: Schematic diagram */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 22,
          width: svgW,
          height: bodyH - 44,
          borderRadius: 20,
          background: "#F5F5F7",
          border: `1.5px solid ${C.line}`,
          overflow: "hidden",
        }}
      >
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ position: "absolute", left: 0, top: 6 }}>
          {/* Input wire A */}
          <path
            d={isUnary ? `M 98 125 H 190` : `M 98 92 H ${wireInX}`}
            fill="none"
            stroke={wireA}
            strokeWidth={4.5}
            strokeLinecap="round"
          />

          {/* Input wire B (for 2-input gates) */}
          {!isUnary ? (
            <path
              d={`M 98 158 H ${wireInX}`}
              fill="none"
              stroke={wireB}
              strokeWidth={4.5}
              strokeLinecap="round"
            />
          ) : null}

          {/* Output wire OUT */}
          <path
            d={`M ${gateOutX} 125 H 392`}
            fill="none"
            stroke={wireOut}
            strokeWidth={4.5}
            strokeLinecap="round"
          />

          {/* Gate symbol */}
          {renderGateBody()}

          {/* Inversion bubble for NAND / NOT */}
          {hasBubble ? (
            <circle
              cx={322}
              cy={125}
              r={10}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={4}
            />
          ) : null}

          {/* Gate label inside symbol */}
          <text
            x={gate === "NOT" ? 236 : 244}
            y={133}
            textAnchor="middle"
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 22,
              fill: outWeight > 0.5 ? C.accent : C.ink,
            }}
          >
            {gate}
          </text>
        </svg>

        {/* Input terminal badge A */}
        <div
          style={{
            position: "absolute",
            left: 18,
            top: (isUnary ? 125 : 92) + 6 - 24,
            width: 80,
            height: 48,
            borderRadius: 12,
            background: aBit ? BLUE_TINT : C.white,
            border: `2.5px solid ${wireA}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            boxSizing: "border-box",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 22,
            color: aBit ? C.accent : C.mute,
          }}
        >
          <span>A</span>
          <span>{aBit}</span>
        </div>

        {/* Input terminal badge B */}
        {!isUnary ? (
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 158 + 6 - 24,
              width: 80,
              height: 48,
              borderRadius: 12,
              background: bBit ? BLUE_TINT : C.white,
              border: `2.5px solid ${wireB}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
              boxSizing: "border-box",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 22,
              color: bBit ? C.accent : C.mute,
            }}
          >
            <span>B</span>
            <span>{bBit}</span>
          </div>
        ) : null}

        {/* Output terminal badge OUT */}
        <div
          style={{
            position: "absolute",
            left: 392,
            top: 125 + 6 - 26,
            width: 82,
            height: 52,
            borderRadius: 14,
            background: outBit ? C.accent : C.white,
            border: `2.5px solid ${wireOut}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            fontFamily: mono,
            fontWeight: 700,
            color: outBit ? C.white : C.mute,
          }}
        >
          <span style={{ fontSize: 12, opacity: 0.85, lineHeight: 1 }}>OUT</span>
          <span style={{ fontSize: 24, lineHeight: 1.15 }}>{outBit}</span>
        </div>

        {/* Bottom formula caption inside schematic card */}
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontWeight: 600,
            fontSize: 18,
            color: C.mute,
          }}
        >
          <span>{GATE_FORMULA[gate]}</span>
          <span style={{ color: outBit ? C.accent : C.mute }}>
            {outBit ? "HIGH (1 · 3.3V)" : "LOW (0 · GND)"}
          </span>
        </div>
      </div>

      {/* Right side: 4-row Truth Table */}
      <div
        style={{
          position: "absolute",
          left: tableX,
          top: tableTop,
          width: tableW,
          height: headerH + 4 * rowH + 12,
          borderRadius: 20,
          background: "#F5F5F7",
          border: `1.5px solid ${C.line}`,
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            height: headerH,
            background: "#EAEAEF",
            borderBottom: `1px solid ${C.line}`,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1.2fr",
            alignItems: "center",
            textAlign: "center",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 19,
            color: C.mute,
          }}
        >
          <span>A</span>
          <span>B</span>
          <span>OUT</span>
        </div>

        {/* Gliding active row band */}
        <div
          style={{
            position: "absolute",
            left: 6,
            right: 6,
            top: headerH + 4 + smoothRow * rowH,
            height: rowH - 4,
            borderRadius: 12,
            background: BLUE_TINT,
            border: `2px solid ${C.accent}`,
            pointerEvents: "none",
          }}
        />

        {/* 4 Truth Table rows */}
        {TRUTH_PAIRS.map(([ra, rb], rIdx) => {
          const rOut = evalGate(gate, ra, rb);
          const isCur = rIdx === activeRow;
          const rowEnter = prog(frame, at + 4 + rIdx * 2, 8, easeOut);
          return (
            <div
              key={`${ra}-${rb}`}
              style={{
                position: "relative",
                height: rowH,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1.2fr",
                alignItems: "center",
                textAlign: "center",
                fontFamily: mono,
                fontWeight: isCur ? 700 : 500,
                fontSize: 22,
                opacity: rowEnter,
              }}
            >
              <span style={{ color: ra ? C.accent : isCur ? C.ink : C.mute }}>{ra}</span>
              <span style={{ color: rb ? C.accent : isCur ? C.ink : C.mute }}>{rb}</span>
              <span
                style={{
                  fontWeight: 700,
                  color: rOut ? C.accent : isCur ? C.ink : C.mute,
                }}
              >
                {rOut}
              </span>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
