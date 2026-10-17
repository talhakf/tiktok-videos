import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { alpha, BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, WIRE } from "../diagram/Node";

export type GraphNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  cost?: string;
};

export type GraphEdge = {
  from: string;
  to: string;
  weight?: string;
};

export type GraphVisitStep = {
  id: string;
  at: number;
};

/**
 * Graph / Grid pathfinding visualizer (BFS / DFS / Dijkstra).
 * Renders nodes, weighted/unweighted edges, animated traversal order in system blue,
 * shortest-path reconstruction in green, and a live Queue/Stack frontier strip at the bottom.
 */
export const GraphTraversal: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  title?: string;
  mode?: "bfs" | "dfs" | "dijkstra";
  nodes: GraphNode[];
  edges: GraphEdge[];
  visitOrder: GraphVisitStep[];
  pathOrder?: GraphVisitStep[];
}> = ({
  x = TX,
  y,
  w = TW,
  h = 680,
  at,
  until,
  title = "graph traversal · shortest path",
  mode = "dijkstra",
  nodes,
  edges,
  visitOrder,
  pathOrder = [],
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const headerH = 74;
  const footerH = 104;
  const stageTop = headerH;
  const stageH = h - headerH - footerH;

  // Support both pixel coordinates and normalized 0..1 coordinates
  const isNormalized = nodes.every((n) => n.x <= 1.5 && n.y <= 1.5);
  const posOf = (n: GraphNode) => ({
    x: isNormalized ? 110 + n.x * (w - 220) : n.x,
    y: isNormalized ? stageTop + 85 + n.y * (stageH - 170) : n.y,
  });

  const nodeMap = new Map<string, GraphNode & { px: number; py: number }>();
  nodes.forEach((n) => {
    const p = posOf(n);
    nodeMap.set(n.id, { ...n, px: p.x, py: p.y });
  });

  const sortedVisits = [...visitOrder].sort((a, b) => a.at - b.at);
  const sortedPath = [...pathOrder].sort((a, b) => a.at - b.at);

  const visitMap = new Map<string, { at: number; order: number }>();
  sortedVisits.forEach((v, idx) => {
    if (!visitMap.has(v.id)) visitMap.set(v.id, { at: v.at, order: idx + 1 });
  });

  const pathMap = new Map<string, { at: number; order: number }>();
  sortedPath.forEach((p, idx) => {
    if (!pathMap.has(p.id)) pathMap.set(p.id, { at: p.at, order: idx + 1 });
  });

  // Latest active visit step at current frame
  let curVisitIdx = -1;
  for (let i = 0; i < sortedVisits.length; i++) {
    if (sortedVisits[i].at <= frame) curVisitIdx = i;
  }
  const activeVisitId = curVisitIdx >= 0 ? sortedVisits[curVisitIdx].id : null;

  // Has shortest-path phase started?
  const firstPathAt = sortedPath.length > 0 ? sortedPath[0].at : Infinity;
  const inPathPhase = frame >= firstPathAt;
  const pathPhaseP = inPathPhase ? prog(frame, firstPathAt, 12, easeInOut) : 0;

  // Compute live frontier queue: nodes adjacent to any already-visited node that are not yet visited
  const visitedSet = new Set<string>();
  for (let i = 0; i <= curVisitIdx; i++) {
    visitedSet.add(sortedVisits[i].id);
  }

  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    adj.get(e.from)?.push(e.to);
    adj.get(e.to)?.push(e.from);
  });

  const discoveredIds: string[] = [];
  if (curVisitIdx < 0 && sortedVisits.length > 0) {
    discoveredIds.push(sortedVisits[0].id);
  } else {
    sortedVisits.forEach((v) => {
      if (visitedSet.has(v.id)) return;
      const neighbors = adj.get(v.id) ?? [];
      if (neighbors.some((nb) => visitedSet.has(nb))) {
        discoveredIds.push(v.id);
      }
    });
  }

  // Helper to check if an edge (u, v) is on the shortest path and when it activates
  const getPathEdgeAt = (u: string, v: string): number | null => {
    for (let i = 0; i < sortedPath.length - 1; i++) {
      const a = sortedPath[i].id;
      const b = sortedPath[i + 1].id;
      if ((a === u && b === v) || (a === v && b === u)) {
        return sortedPath[i + 1].at;
      }
    }
    return null;
  };

  const nodeR = 44;
  const frontierLabel = mode === "dfs" ? "stack (LIFO)" : mode === "dijkstra" ? "priority queue" : "queue (FIFO)";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {/* Top header strip */}
      <div
        style={{
          height: headerH,
          padding: "0 32px",
          background: "#FAFAFC",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: inPathPhase ? "#EEFAF1" : BLUE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={inPathPhase ? "checkCircle" : "sitemap"}
              size={21}
              color={inPathPhase ? "#248A3D" : C.accent}
              weight={2.2}
            />
          </div>
          <span style={{ fontFamily: mono, fontSize: 23, fontWeight: 600, color: C.ink }}>{title}</span>
        </div>

        {/* Status pill */}
        <div
          style={{
            padding: "7px 16px",
            borderRadius: 999,
            background: inPathPhase ? "#EEFAF1" : BLUE_TINT,
            border: `1.5px solid ${inPathPhase ? GREEN : C.accent}`,
            fontFamily: mono,
            fontSize: 20,
            fontWeight: 700,
            color: inPathPhase ? "#248A3D" : C.accent,
          }}
        >
          {inPathPhase
            ? `shortest path (${sortedPath.length} nodes)`
            : `visited ${visitedSet.size} / ${nodes.length}`}
        </div>
      </div>

      {/* SVG Edges Layer */}
      <svg
        width={w}
        height={h}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {edges.map((e, idx) => {
          const u = nodeMap.get(e.from);
          const v = nodeMap.get(e.to);
          if (!u || !v) return null;

          const uVisit = visitMap.get(e.from);
          const vVisit = visitMap.get(e.to);

          // Edge becomes explored once both endpoints are visited
          const bothVisitedAt =
            uVisit && vVisit ? Math.max(uVisit.at, vVisit.at) : Infinity;
          const visitEdgeP = frame >= bothVisitedAt ? prog(frame, bothVisitedAt, 12, easeInOut) : 0;

          // Determine direction from earlier-visited to later-visited node
          const forward = !uVisit || !vVisit || uVisit.at <= vVisit.at;
          const p1 = forward ? u : v;
          const p2 = forward ? v : u;
          const d = `M ${p1.px} ${p1.py} L ${p2.px} ${p2.py}`;

          const pathEdgeAt = getPathEdgeAt(e.from, e.to);
          const pathEdgeP = pathEdgeAt !== null && frame >= pathEdgeAt ? prog(frame, pathEdgeAt, 10, easeInOut) : 0;

          const enterP = prog(frame, at + 3 + idx * 1.5, 10, easeOut);
          const dimFactor = inPathPhase && pathEdgeAt === null ? lerp(1, 0.35, pathPhaseP) : 1;

          return (
            <g key={`edge-${idx}`} opacity={enterP * dimFactor}>
              {/* Base idle wire */}
              <path
                d={d}
                fill="none"
                stroke={WIRE}
                strokeWidth={3.5}
                strokeDasharray="7 7"
                opacity={0.45}
              />

              {/* Explored blue edge */}
              {visitEdgeP > 0 ? (
                <path
                  d={d}
                  fill="none"
                  stroke={C.accent}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - visitEdgeP}
                />
              ) : null}

              {/* Shortest-path green edge */}
              {pathEdgeP > 0 ? (
                <path
                  d={d}
                  fill="none"
                  stroke={GREEN}
                  strokeWidth={7}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - pathEdgeP}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Edge weight chips */}
      {edges.map((e, idx) => {
        if (!e.weight) return null;
        const u = nodeMap.get(e.from);
        const v = nodeMap.get(e.to);
        if (!u || !v) return null;
        const mx = (u.px + v.px) / 2;
        const my = (u.py + v.py) / 2;
        const pathEdgeAt = getPathEdgeAt(e.from, e.to);
        const onPath = pathEdgeAt !== null && frame >= pathEdgeAt;
        const enterP = prog(frame, at + 5 + idx * 1.5, 9, easeOut);
        const dimFactor = inPathPhase && pathEdgeAt === null ? lerp(1, 0.4, pathPhaseP) : 1;

        return (
          <div
            key={`w-${idx}`}
            style={{
              position: "absolute",
              left: mx,
              top: my,
              translate: "-50% -50%",
              padding: "3px 11px",
              borderRadius: 999,
              background: onPath ? "#EEFAF1" : C.white,
              border: `1.5px solid ${onPath ? GREEN : C.line}`,
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 700,
              color: onPath ? "#248A3D" : C.mute,
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              ...materialize(enterP),
              opacity: enterP * dimFactor,
            }}
          >
            {e.weight}
          </div>
        );
      })}

      {/* Graph Nodes */}
      {nodes.map((n, idx) => {
        const pos = nodeMap.get(n.id)!;
        const vInfo = visitMap.get(n.id);
        const pInfo = pathMap.get(n.id);

        const visitP = vInfo && frame >= vInfo.at ? prog(frame, vInfo.at, 10, easeOut) : 0;
        const pathP = pInfo && frame >= pInfo.at ? prog(frame, pInfo.at, 10, easeOut) : 0;
        const isCurrentActive = !inPathPhase && activeVisitId === n.id;

        let bg = C.white;
        let border = "rgba(0,0,0,0.14)";
        let textCol = C.ink;

        if (visitP > 0) {
          bg = interpolateColors(visitP, [0, 1], [C.white, BLUE_TINT]);
          border = interpolateColors(visitP, [0, 1], ["rgba(0,0,0,0.14)", C.accent]);
          textCol = interpolateColors(visitP, [0, 1], [C.ink, C.accent]);
        }
        if (pathP > 0) {
          bg = interpolateColors(pathP, [0, 1], [BLUE_TINT, "#EEFAF1"]);
          border = interpolateColors(pathP, [0, 1], [C.accent, GREEN]);
          textCol = interpolateColors(pathP, [0, 1], [C.accent, "#248A3D"]);
        }

        const enterP = prog(frame, at + 2 + idx * 2, 10, easeOut);
        const isNotInPath = inPathPhase && !pInfo;
        const dimAlpha = isNotInPath ? lerp(1, 0.42, pathPhaseP) : 1;

        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: pos.px - nodeR,
              top: pos.py - nodeR,
              width: nodeR * 2,
              height: nodeR * 2,
              ...materialize(enterP),
              opacity: enterP * dimAlpha,
            }}
          >
            {/* Outer focus ring when actively visiting or on shortest path */}
            {isCurrentActive || pathP > 0 ? (
              <div
                style={{
                  position: "absolute",
                  inset: -9,
                  borderRadius: nodeR + 9,
                  border: `3px solid ${pathP > 0 ? alpha(GREEN, 0.45) : alpha(C.accent, 0.4)}`,
                  opacity: pathP > 0 ? pathP : visitP,
                }}
              />
            ) : null}

            {/* Circle body */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: nodeR,
                background: bg,
                border: `3.5px solid ${border}`,
                boxShadow: CARD_SHADOW,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 28,
                  fontWeight: 700,
                  color: textCol,
                  lineHeight: 1,
                }}
              >
                {n.label}
              </span>
            </div>

            {/* Cost or Visit Order badge below/above node */}
            {(n.cost || (vInfo && visitP > 0)) ? (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: nodeR * 2 + 8,
                  translate: "-50% 0",
                  padding: "2px 10px",
                  borderRadius: 999,
                  background: pathP > 0 ? "#EEFAF1" : visitP > 0 ? BLUE_TINT : "#F2F2F7",
                  border: `1.5px solid ${pathP > 0 ? GREEN : visitP > 0 ? C.accent : C.line}`,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: pathP > 0 ? "#248A3D" : visitP > 0 ? C.accent : C.mute,
                  whiteSpace: "nowrap",
                }}
              >
                {n.cost ? (visitP > 0 ? n.cost : "d=∞") : `#${vInfo?.order}`}
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Bottom Queue / Stack / Shortest-Path Pill Strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: footerH,
          padding: "0 32px",
          background: "#FAFAFC",
          borderTop: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontFamily: mono,
              fontSize: 20,
              fontWeight: 600,
              color: C.mute,
              whiteSpace: "nowrap",
            }}
          >
            {inPathPhase ? "shortest path:" : `${frontierLabel}:`}
          </span>

          {/* Pills inside the strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {inPathPhase ? (
              sortedPath.map((step, i) => {
                const p = prog(frame, step.at, 8, easeOut);
                if (p <= 0) return null;
                const node = nodeMap.get(step.id);
                return (
                  <div key={`p-${step.id}`} style={{ display: "flex", alignItems: "center", gap: 10, ...materialize(p) }}>
                    {i > 0 ? (
                      <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: "#248A3D" }}>→</span>
                    ) : null}
                    <div
                      style={{
                        padding: "7px 16px",
                        borderRadius: 12,
                        background: "#EEFAF1",
                        border: `2px solid ${GREEN}`,
                        fontFamily: mono,
                        fontSize: 21,
                        fontWeight: 700,
                        color: "#248A3D",
                      }}
                    >
                      {node?.label ?? step.id}
                      {node?.cost ? <span style={{ fontSize: 16, marginLeft: 6, opacity: 0.8 }}>({node.cost})</span> : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                {/* Currently visiting node */}
                {activeVisitId ? (
                  <div
                    style={{
                      padding: "7px 16px",
                      borderRadius: 12,
                      background: C.accent,
                      fontFamily: mono,
                      fontSize: 20,
                      fontWeight: 700,
                      color: C.white,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      ...materialize(prog(frame, sortedVisits[curVisitIdx].at, 8, easeOut)),
                    }}
                  >
                    <span>pop → {nodeMap.get(activeVisitId)?.label ?? activeVisitId}</span>
                  </div>
                ) : null}

                {/* Queued frontier nodes */}
                {discoveredIds.map((id) => {
                  const node = nodeMap.get(id);
                  return (
                    <div
                      key={`q-${id}`}
                      style={{
                        padding: "7px 16px",
                        borderRadius: 12,
                        background: BLUE_TINT,
                        border: `1.5px solid ${C.accent}`,
                        fontFamily: mono,
                        fontSize: 20,
                        fontWeight: 700,
                        color: C.accent,
                      }}
                    >
                      {node?.label ?? id}
                    </div>
                  );
                })}

                {!activeVisitId && discoveredIds.length === 0 ? (
                  <span style={{ fontFamily: mono, fontSize: 20, color: C.mute }}>empty</span>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
