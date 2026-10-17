import { interpolateColors, useCurrentFrame } from "remotion";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

// Abstract Syntax Tree (AST) diagram & bottom-up expression evaluator:
// Renders tree nodes (`id`, `kind`, `value`, `x`, `y`, `children`) and animates bottom-up
// expression evaluation (`evalAt`: child nodes collapse/compute into parent result pills,
// e.g. `2 * 5 → 10`, `40 + 10 → 50`).

export type AstNode = {
  id: string;
  kind: string;
  value: string;
  x: number;
  y: number;
  children?: string[];
  result?: string | number;
  formula?: string;
  at?: number;
  evalAt?: number;
};

export const AstView: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  expression?: string;
  nodes: AstNode[];
  evalAt?: number;
  evalStep?: number;
  dark?: boolean;
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  x = 90,
  y,
  w = 900,
  h = 740,
  at = 0,
  until,
  expression = "40 + 2 * 5",
  nodes,
  evalAt,
  evalStep = 28,
  dark = false,
  filename = "ast.ts",
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const byId = new Map<string, AstNode>();
  nodes.forEach((n) => byId.set(n.id, n));

  // Compute tree depth (top-down for staggered entrance) and height (bottom-up for evaluation order)
  const parentOf = new Map<string, string>();
  nodes.forEach((n) => {
    (n.children ?? []).forEach((cid) => parentOf.set(cid, n.id));
  });

  const depthOf = (id: string): number => {
    const pid = parentOf.get(id);
    return pid ? 1 + depthOf(pid) : 0;
  };

  const heightOf = (id: string): number => {
    const n = byId.get(id);
    if (!n || !n.children || n.children.length === 0) return 0;
    return 1 + Math.max(...n.children.map(heightOf));
  };

  // Compute evaluated values & reduction formulas recursively
  const computedResult = new Map<string, string>();
  const computedFormula = new Map<string, string>();
  const solve = (id: string): string => {
    if (computedResult.has(id)) return computedResult.get(id)!;
    const n = byId.get(id);
    if (!n) return "";
    if (!n.children || n.children.length === 0) {
      const val = n.result !== undefined ? String(n.result) : n.value;
      computedResult.set(id, val);
      return val;
    }
    const childVals = n.children.map(solve);
    let res = n.result !== undefined ? String(n.result) : "";
    if (!res && childVals.length === 2) {
      const a = Number(childVals[0]);
      const b = Number(childVals[1]);
      if (!Number.isNaN(a) && !Number.isNaN(b)) {
        if (n.value === "+") res = String(a + b);
        else if (n.value === "-") res = String(a - b);
        else if (n.value === "*" || n.value === "×") res = String(a * b);
        else if (n.value === "/" && b !== 0) res = String(a / b);
      }
    }
    if (!res) res = childVals.join(` ${n.value} `);
    computedResult.set(id, res);
    const expr = n.formula ?? (childVals.length === 2 ? `${childVals[0]} ${n.value} ${childVals[1]}` : `${n.value}(${childVals.join(", ")})`);
    computedFormula.set(id, `${expr} → ${res}`);
    return res;
  };
  nodes.forEach((n) => solve(n.id));

  // Assign evaluation frame to every internal node (bottom-up: height 1 first, then height 2, ...)
  const internalNodes = nodes
    .filter((n) => n.children && n.children.length > 0)
    .sort((a, b) => heightOf(a.id) - heightOf(b.id));

  const nodeEvalFrame = new Map<string, number>();
  internalNodes.forEach((n, idx) => {
    const f = n.evalAt ?? (evalAt !== undefined ? evalAt + idx * evalStep : Infinity);
    nodeEvalFrame.set(n.id, f);
  });

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const subBg = dark ? "rgba(255,255,255,0.05)" : "#F6F6F9";
  const borderCol = dark ? "rgba(255,255,255,0.1)" : C.line;

  const topBarH = 92;
  const canvasH = h - (filename !== undefined ? TAB_H : 0) - topBarH;

  // Determine active evaluation step for the top header
  let currentStepText = "parsed syntax tree";
  let finalDone = false;
  for (let i = 0; i < internalNodes.length; i++) {
    const n = internalNodes[i];
    const ef = nodeEvalFrame.get(n.id) ?? Infinity;
    if (frame >= ef) {
      currentStepText = `eval: ${computedFormula.get(n.id)}`;
      if (i === internalNodes.length - 1 && frame >= ef + 16) {
        finalDone = true;
      }
    }
  }

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="sitemap"
      right={right ?? `${nodes.length} AST nodes`}
      style={style}
    >
      {/* Top Bar: Source Expression & Live Evaluation Step */}
      <div
        style={{
          height: topBarH,
          padding: "0 28px",
          borderBottom: `1px solid ${borderCol}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 600, color: mute }}>expr</span>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 12,
              background: subBg,
              border: `1.5px solid ${borderCol}`,
              fontFamily: mono,
              fontSize: 26,
              fontWeight: 700,
              color: fg,
            }}
          >
            {expression}
          </div>
        </div>

        <div
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            background: finalDone
              ? tint(GREEN, dark ? 0.22 : 0.14)
              : currentStepText.startsWith("eval:")
                ? tint(C.accent, dark ? 0.22 : 0.12)
                : subBg,
            border: `1.5px solid ${
              finalDone ? tint(GREEN, 0.4) : currentStepText.startsWith("eval:") ? tint(C.accent, 0.35) : borderCol
            }`,
            fontFamily: mono,
            fontSize: 22,
            fontWeight: 700,
            color: finalDone ? (dark ? TERM.green : "#248A3D") : currentStepText.startsWith("eval:") ? C.accent : mute,
          }}
        >
          {currentStepText}
        </div>
      </div>

      {/* Tree Canvas */}
      <div style={{ position: "relative", width: w, height: canvasH }}>
        {/* 1. SVG Edges + Travelling Child-to-Parent Evaluation Pulses */}
        <svg
          width={w}
          height={canvasH}
          viewBox={`0 0 ${w} ${canvasH}`}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {nodes.map((parent) =>
            (parent.children ?? []).map((cid) => {
              const child = byId.get(cid);
              if (!child) return null;
              const d = depthOf(child.id);
              const drawP = prog(frame, (child.at ?? at + 6 + d * 6), 12, easeInOut);
              if (drawP <= 0) return null;

              const pEval = nodeEvalFrame.get(parent.id) ?? Infinity;
              const evalP = prog(frame, pEval, 14, easeInOut);
              const doneP = prog(frame, pEval + 14, 8, easeOut);

              const strokeCol =
                doneP > 0
                  ? interpolateColors(doneP, [0, 1], [C.accent, GREEN])
                  : evalP > 0
                    ? interpolateColors(evalP, [0, 1], [WIRE, C.accent])
                    : WIRE;

              const x1 = parent.x;
              const y1 = parent.y + 38;
              const x2 = child.x;
              const y2 = child.y - 42;
              const my = (y1 + y2) / 2;
              const pathD = `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;

              return (
                <g key={`${parent.id}-${child.id}`} opacity={1 - doneP * 0.45}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeCol}
                    strokeWidth={evalP > 0 && doneP < 1 ? 4.5 : 3.5}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - drawP}
                  />
                </g>
              );
            }),
          )}
        </svg>

        {/* Travelling value pills moving from child to parent during bottom-up evaluation */}
        {nodes.map((parent) => {
          const pEval = nodeEvalFrame.get(parent.id) ?? Infinity;
          if (frame < pEval || frame > pEval + 15) return null;
          const t = prog(frame, pEval, 14, easeInOut);
          const pillO = Math.min(prog(frame, pEval, 4), 1 - prog(frame, pEval + 11, 4));
          return (parent.children ?? []).map((cid) => {
            const child = byId.get(cid);
            if (!child) return null;
            const px = lerp(child.x, parent.x, t);
            const py = lerp(child.y, parent.y, t);
            const val = computedResult.get(child.id) ?? child.value;
            return (
              <div
                key={`pulse-${parent.id}-${child.id}`}
                style={{
                  position: "absolute",
                  left: px,
                  top: py,
                  translate: "-50% -50%",
                  padding: "6px 16px",
                  borderRadius: 999,
                  background: C.accent,
                  border: `3px solid ${C.white}`,
                  boxShadow: "0 6px 16px rgba(0,113,227,0.28)",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 22,
                  color: C.white,
                  opacity: pillO,
                  zIndex: 10,
                }}
              >
                {val}
              </div>
            );
          });
        })}

        {/* 2. Tree Nodes + Computed Result Pills */}
        {nodes.map((node) => {
          const d = depthOf(node.id);
          const enterP = prog(frame, node.at ?? at + 4 + d * 6, 11, easeOut);
          if (enterP <= 0) return null;

          const isInternal = Boolean(node.children && node.children.length > 0);
          const selfEvalAt = nodeEvalFrame.get(node.id) ?? Infinity;
          const selfEvalP = prog(frame, selfEvalAt + 10, 11, easeOut);

          // Check if this node's parent is currently evaluating/collapsing it
          const parentId = parentOf.get(node.id);
          const parentNode = parentId ? byId.get(parentId) : undefined;
          const parentEvalAt = parentId ? (nodeEvalFrame.get(parentId) ?? Infinity) : Infinity;
          const collapseP = prog(frame, parentEvalAt, 14, easeInOut);

          const nodeW = 216;
          const nodeH = 98;

          // Subtle upward pull toward parent when collapsing into parent result
          const pullX = parentNode ? (parentNode.x - node.x) * 0.12 * collapseP : 0;
          const pullY = parentNode ? (parentNode.y - node.y) * 0.12 * collapseP : 0;

          const isEvaluatingNow = frame >= selfEvalAt && frame < selfEvalAt + 16;
          const isEvaluated = frame >= selfEvalAt + 10;

          const borderColor = isEvaluated
            ? GREEN
            : isEvaluatingNow || (!isInternal && collapseP > 0 && collapseP < 1)
              ? C.accent
              : dark
                ? "rgba(255,255,255,0.16)"
                : "rgba(0,0,0,0.12)";

          const bgColor = isEvaluated
            ? dark
              ? tint(GREEN, 0.16)
              : "#EEFAF1"
            : isEvaluatingNow
              ? dark
                ? tint(C.accent, 0.2)
                : BLUE_TINT
              : dark
                ? "#262629"
                : C.white;

          const formulaText = computedFormula.get(node.id);

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: node.x - nodeW / 2 + pullX,
                top: node.y - nodeH / 2 + pullY,
                width: nodeW,
                height: nodeH,
                ...materialize(enterP),
                opacity: enterP * (1 - collapseP * 0.58),
                scale: String((0.95 + 0.05 * enterP) * (1 - collapseP * 0.08)),
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 22,
                  background: bgColor,
                  border: `3px solid ${borderColor}`,
                  boxShadow: CARD_SHADOW,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "0 16px",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 17,
                    fontWeight: 600,
                    color: isEvaluated ? (dark ? TERM.green : "#248A3D") : mute,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {node.kind}
                </span>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 30,
                    fontWeight: 700,
                    color: fg,
                    lineHeight: 1.05,
                  }}
                >
                  {node.value}
                </span>
              </div>

              {/* Result Pill that pops onto internal nodes when evaluated */}
              {isInternal && selfEvalP > 0 && formulaText ? (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: -24,
                    translate: "-50% 0",
                    padding: "5px 16px",
                    borderRadius: 999,
                    background: GREEN,
                    border: `3px solid ${dark ? TERM.bg : C.white}`,
                    boxShadow: "0 6px 16px rgba(52,199,89,0.28)",
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 20,
                    color: C.white,
                    whiteSpace: "nowrap",
                    zIndex: 12,
                    ...materialize(selfEvalP),
                  }}
                >
                  {formulaText}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
