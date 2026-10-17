import { useCurrentFrame } from "remotion";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, TERM } from "../../theme";

export type NeuralLayer = {
  label?: string;
  nodes: string[];
};

/**
 * Multi-layer neural network diagram (`Input → Hidden → Output` with softmax bars),
 * animating forward-pass signal pulses across edges at `pulseAt` and highlighting the
 * winning output node and its probability bar.
 */
export const NeuralNet: React.FC<{
  layers: NeuralLayer[];
  probabilities?: number[];
  winnerIndex?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  pulseAt?: number;
  hopDur?: number;
  dark?: boolean;
  filename?: string;
  right?: string;
  style?: React.CSSProperties;
}> = ({
  layers,
  probabilities,
  winnerIndex,
  x = TX,
  y = TY,
  w = TW,
  h = 580,
  at = 0,
  until,
  pulseAt,
  hopDur = 16,
  dark = false,
  filename = "forward_pass.nn",
  right = "softmax",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const pStart = pulseAt ?? at + 16;
  const numHops = Math.max(1, layers.length - 1);
  const outArriveAt = pStart + numHops * hopDur;
  const outP = prog(frame, outArriveAt - 2, 16, easeOut);

  const lastLayer = layers[layers.length - 1] ?? { nodes: [] };
  const defaultProbs = lastLayer.nodes.map((_, i) => (i === 0 ? 0.76 : Number((0.24 / Math.max(1, lastLayer.nodes.length - 1)).toFixed(2))));
  const probs = probabilities ?? defaultProbs;
  const winIdx =
    winnerIndex ??
    probs.reduce((bestIdx, cur, idx, arr) => (cur > arr[bestIdx] ? idx : bestIdx), 0);

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const bodyH = h - (filename !== undefined ? TAB_H : 0);

  // Layout geometry: reserve right column for output softmax bars
  const leftX = 110;
  const rightX = w - 285;
  const topY = 86;
  const bottomY = bodyH - 46;
  const colSpan = Math.max(1, layers.length - 1);

  const nodeCoords = layers.map((layer, lIdx) => {
    const cx = layers.length === 1 ? (leftX + rightX) / 2 : leftX + (lIdx / colSpan) * (rightX - leftX);
    const count = layer.nodes.length;
    return layer.nodes.map((label, nIdx) => {
      const frac = count === 1 ? 0.5 : nIdx / (count - 1);
      const cy = lerp(topY + 28, bottomY - 28, frac);
      return { cx, cy, label, lIdx, nIdx };
    });
  });

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="layers"
      right={right}
      style={style}
    >
      {/* Layer column headers */}
      {layers.map((layer, lIdx) => {
        const cx = nodeCoords[lIdx]?.[0]?.cx ?? leftX;
        const headerP = prog(frame, at + 4 + lIdx * 3, 10, easeOut);
        return (
          <div
            key={`hdr-${lIdx}`}
            style={{
              position: "absolute",
              left: cx,
              top: 22,
              translate: "-50% 0",
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 19,
              color: mute,
              whiteSpace: "nowrap",
              ...materialize(headerP),
            }}
          >
            {layer.label ?? `Layer ${lIdx + 1}`}
          </div>
        );
      })}

      {/* Softmax header above output bars */}
      <div
        style={{
          position: "absolute",
          left: rightX + 64,
          top: 22,
          fontFamily: mono,
          fontWeight: 600,
          fontSize: 19,
          color: outP > 0.1 ? C.accent : mute,
        }}
      >
        P(y | x)
      </div>

      {/* Edges and travelling signal pulses */}
      <svg
        width={w}
        height={bodyH}
        viewBox={`0 0 ${w} ${bodyH}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {nodeCoords.slice(0, -1).map((fromNodes, hopIdx) => {
          const toNodes = nodeCoords[hopIdx + 1];
          const hopStart = pStart + hopIdx * hopDur;
          const hopP = prog(frame, hopStart, hopDur, easeInOut);
          const isHopActive = frame >= hopStart && frame <= hopStart + hopDur + 4;
          const hasPassed = frame >= hopStart;

          return fromNodes.map((src) =>
            toNodes.map((dst) => {
              const isWinningEdge = hopIdx === numHops - 1 && dst.nIdx === winIdx;
              const edgeActive = hasPassed && (hopIdx < numHops - 1 || isWinningEdge);
              const px = lerp(src.cx, dst.cx, hopP);
              const py = lerp(src.cy, dst.cy, hopP);

              return (
                <g key={`e-${hopIdx}-${src.nIdx}-${dst.nIdx}`}>
                  <line
                    x1={src.cx}
                    y1={src.cy}
                    x2={dst.cx}
                    y2={dst.cy}
                    stroke={
                      isWinningEdge && outP > 0.2
                        ? GREEN
                        : edgeActive
                          ? C.accent
                          : dark
                            ? "rgba(255,255,255,0.14)"
                            : "rgba(0,0,0,0.12)"
                    }
                    strokeWidth={isWinningEdge && outP > 0.2 ? 3 : edgeActive ? 2.2 : 1.6}
                    opacity={
                      hopIdx === numHops - 1 && !isWinningEdge && outP > 0.3
                        ? 0.35
                        : edgeActive
                          ? 0.75
                          : 0.55
                    }
                  />
                  {isHopActive && hopP > 0 && hopP < 1 ? (
                    <circle
                      cx={px}
                      cy={py}
                      r={6.5}
                      fill={isWinningEdge ? GREEN : C.accent}
                    />
                  ) : null}
                </g>
              );
            })
          );
        })}
      </svg>

      {/* Layer nodes */}
      {nodeCoords.map((layerNodes, lIdx) => {
        const isOutput = lIdx === layers.length - 1;
        const layerActivateAt = lIdx === 0 ? pStart : pStart + lIdx * hopDur - 2;
        const activeP = prog(frame, layerActivateAt, 10, easeOut);

        return layerNodes.map((node) => {
          const enterP = prog(frame, at + 4 + lIdx * 4 + node.nIdx * 2, 10, easeOut);
          const isWinner = isOutput && node.nIdx === winIdx && outP > 0.2;
          const isNodeLit = activeP > 0.2 && (!isOutput || isWinner);

          const borderCol = isWinner
            ? GREEN
            : isNodeLit
              ? C.accent
              : dark
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.14)";
          const bgCol = isWinner
            ? tint(GREEN, 0.16)
            : isNodeLit
              ? dark
                ? tint(C.accent, 0.22)
                : BLUE_TINT
              : dark
                ? TERM.bar
                : C.white;

          const prob = probs[node.nIdx] ?? 0;

          return (
            <div key={`n-${lIdx}-${node.nIdx}`}>
              {/* Neuron pill/circle */}
              <div
                style={{
                  position: "absolute",
                  left: node.cx,
                  top: node.cy,
                  translate: "-50% -50%",
                  minWidth: 96,
                  height: 52,
                  padding: "0 16px",
                  borderRadius: 26,
                  background: bgCol,
                  border: `2.5px solid ${borderCol}`,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 20,
                  color: isWinner ? "#248A3D" : isNodeLit ? C.accent : fg,
                  whiteSpace: "nowrap",
                  ...materialize(enterP),
                }}
              >
                {node.label}
              </div>

              {/* Output softmax probability bar */}
              {isOutput ? (
                <div
                  style={{
                    position: "absolute",
                    left: node.cx + 64,
                    top: node.cy - 18,
                    width: 200,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    ...materialize(enterP),
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 18,
                      borderRadius: 9,
                      background: dark ? "rgba(255,255,255,0.1)" : C.soft,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(4, prob * outP * 100)}%`,
                        height: "100%",
                        borderRadius: 9,
                        background: isWinner ? GREEN : WIRE,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: 62,
                      textAlign: "right",
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 20,
                      color: isWinner ? "#248A3D" : mute,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {Math.round(prob * outP * 100)}%
                  </div>
                </div>
              ) : null}
            </div>
          );
        });
      })}
    </DevCard>
  );
};
