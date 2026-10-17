import { useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type VectorPoint = {
  label: string;
  x: number;
  y: number;
  cluster?: "a" | "b" | "query";
  at?: number;
  similarity?: number;
};

const CLUSTER_COLOR: Record<"a" | "b" | "query", string> = {
  a: GREEN,
  b: AMBER,
  query: C.accent,
};

/**
 * 2D embedding coordinate space & cosine similarity comparator: plots labelled points (`x, y` in `0..1`),
 * draws a query vector and nearest-neighbor lines at `queryAt`, and displays cosine similarity score pills.
 */
export const VectorSpace: React.FC<{
  points: VectorPoint[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  queryAt?: number;
  neighborsCount?: number;
  clusterNames?: { a?: string; b?: string };
  dark?: boolean;
  filename?: string;
  model?: string;
  style?: React.CSSProperties;
}> = ({
  points,
  x = TX,
  y = TY,
  w = TW,
  h = 620,
  at = 0,
  until,
  queryAt,
  neighborsCount = 2,
  clusterNames = { a: "Cluster A · animals", b: "Cluster B · systems" },
  dark = false,
  filename = "embeddings · cosine similarity",
  model = "text-embedding-3",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const qAt = queryAt ?? at + 22;
  const qP = prog(frame, qAt, 14, easeInOut);

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const gridStroke = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const bodyH = h - (filename !== undefined ? TAB_H : 0);

  const padL = 74;
  const padR = 44;
  const padT = 68;
  const padB = 64;
  const plotW = w - padL - padR;
  const plotH = bodyH - padT - padB;

  const toScreen = (pt: { x: number; y: number }) => ({
    sx: padL + pt.x * plotW,
    sy: padT + (1 - pt.y) * plotH,
  });

  const queryPoint = points.find((pt) => pt.cluster === "query") ?? points[points.length - 1];
  const candidates = points.filter((pt) => pt !== queryPoint);

  const rankedNeighbors = [...candidates]
    .map((pt) => {
      const dist = Math.hypot(pt.x - queryPoint.x, pt.y - queryPoint.y);
      const sim = pt.similarity ?? Math.max(0.12, Math.min(0.99, Number((1 - dist * 0.72).toFixed(2))));
      return { pt, dist, sim };
    })
    .sort((a, b) => b.sim - a.sim)
    .slice(0, neighborsCount);

  const qScreen = toScreen(queryPoint);
  const originScreen = toScreen({ x: 0.04, y: 0.06 });

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="search"
      right={model}
      style={style}
    >
      {/* Top legend strip */}
      <div
        style={{
          position: "absolute",
          left: padL,
          right: padR,
          top: 18,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 600,
          color: mute,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: GREEN }} />
            <span>{clusterNames.a}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: AMBER }} />
            <span>{clusterNames.b}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: C.accent }} />
            <span>Query vector</span>
          </div>
        </div>
        <div style={{ fontFamily: mono, fontSize: 19, color: C.accent, opacity: qP }}>
          top-{neighborsCount} cosine match
        </div>
      </div>

      {/* SVG coordinate grid + vectors */}
      <svg
        width={w}
        height={bodyH}
        viewBox={`0 0 ${w} ${bodyH}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const gx = padL + t * plotW;
          const gy = padT + t * plotH;
          return (
            <g key={i}>
              <line x1={gx} y1={padT} x2={gx} y2={padT + plotH} stroke={gridStroke} strokeWidth={1.5} />
              <line x1={padL} y1={gy} x2={padL + plotW} y2={gy} stroke={gridStroke} strokeWidth={1.5} />
            </g>
          );
        })}

        {/* Primary axes */}
        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          stroke={WIRE}
          strokeWidth={2}
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={padT + plotH}
          stroke={WIRE}
          strokeWidth={2}
        />

        {/* Origin-to-query vector arrow */}
        {qP > 0 ? (
          <g>
            <line
              x1={originScreen.sx}
              y1={originScreen.sy}
              x2={lerp(originScreen.sx, qScreen.sx, qP)}
              y2={lerp(originScreen.sy, qScreen.sy, qP)}
              stroke={C.accent}
              strokeWidth={3.5}
              strokeLinecap="round"
              opacity={0.45 * qP}
            />
          </g>
        ) : null}

        {/* Nearest neighbor comparison lines */}
        {rankedNeighbors.map(({ pt }, idx) => {
          const lineP = prog(frame, qAt + 4 + idx * 5, 12, easeInOut);
          if (lineP <= 0) return null;
          const target = toScreen(pt);
          const curX = lerp(qScreen.sx, target.sx, lineP);
          const curY = lerp(qScreen.sy, target.sy, lineP);
          const isBest = idx === 0;
          return (
            <g key={`nn-${pt.label}`}>
              <line
                x1={qScreen.sx}
                y1={qScreen.sy}
                x2={curX}
                y2={curY}
                stroke={isBest ? C.accent : WIRE}
                strokeWidth={isBest ? 3.5 : 2.5}
                strokeDasharray={isBest ? undefined : "8 8"}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>

      {/* Axis labels */}
      <div
        style={{
          position: "absolute",
          left: padL + plotW - 90,
          top: padT + plotH + 14,
          fontFamily: mono,
          fontSize: 18,
          fontWeight: 600,
          color: mute,
        }}
      >
        dim[0] →
      </div>
      <div
        style={{
          position: "absolute",
          left: 16,
          top: padT + 6,
          fontFamily: mono,
          fontSize: 18,
          fontWeight: 600,
          color: mute,
        }}
      >
        ↑ dim[1]
      </div>

      {/* Plotted embedding points */}
      {points.map((pt, i) => {
        const isQuery = pt === queryPoint;
        const enterAt = pt.at ?? (isQuery ? qAt - 4 : at + 6 + i * 3);
        const ptP = prog(frame, enterAt, 10, easeOut);
        if (ptP <= 0) return null;

        const { sx, sy } = toScreen(pt);
        const color = CLUSTER_COLOR[pt.cluster ?? "a"];
        const dotR = isQuery ? 13 : 10;

        return (
          <div
            key={pt.label}
            style={{
              position: "absolute",
              left: sx,
              top: sy,
              transform: "translate(-50%, -50%)",
              ...materialize(ptP),
            }}
          >
            {/* Active halo for query point */}
            {isQuery ? (
              <div
                style={{
                  position: "absolute",
                  left: -18,
                  top: -18,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: tint(C.accent, 0.18),
                  border: `2px solid ${C.accent}`,
                }}
              />
            ) : null}

            {/* Point circle */}
            <div
              style={{
                width: dotR * 2,
                height: dotR * 2,
                borderRadius: dotR,
                background: color,
                border: `3px solid ${dark ? TERM.bg : C.white}`,
                boxShadow: "0 4px 10px rgba(0,0,0,0.16)",
                marginLeft: -dotR,
                marginTop: -dotR,
              }}
            />

            {/* Token / phrase label pill */}
            <div
              style={{
                position: "absolute",
                left: 16,
                top: -18,
                padding: "4px 12px",
                borderRadius: 10,
                background: isQuery ? BLUE_TINT : dark ? "rgba(44,44,46,0.92)" : "rgba(255,255,255,0.92)",
                border: `1.5px solid ${isQuery ? C.accent : C.line}`,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                color: isQuery ? C.accent : fg,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              {pt.label}
            </div>
          </div>
        );
      })}

      {/* Cosine similarity score pills along nearest neighbor connectors */}
      {rankedNeighbors.map(({ pt, sim }, idx) => {
        const pillP = prog(frame, qAt + 10 + idx * 5, 10, easeOut);
        if (pillP <= 0) return null;
        const target = toScreen(pt);
        const midX = lerp(qScreen.sx, target.sx, 0.52);
        const midY = lerp(qScreen.sy, target.sy, 0.52);
        const isBest = idx === 0;

        return (
          <div
            key={`score-${pt.label}`}
            style={{
              position: "absolute",
              left: midX,
              top: midY,
              translate: "-50% -50%",
              height: 40,
              padding: "0 14px",
              borderRadius: 20,
              background: isBest ? C.accent : dark ? TERM.bar : C.white,
              border: `2px solid ${isBest ? C.accent : C.line}`,
              color: isBest ? C.white : fg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
              ...materialize(pillP),
            }}
          >
            <span style={{ opacity: 0.8, fontSize: 17 }}>cos</span>
            <span>{sim.toFixed(2)}</span>
          </div>
        );
      })}
    </DevCard>
  );
};
