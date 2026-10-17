import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { tint } from "../windows/MacWindow";

export type GarbageCollectorProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  markAt?: number;
  sweepAt?: number;
  filename?: string;
  right?: string;
  style?: React.CSSProperties;
};

type HeapNodeSpec = {
  id: string;
  addr: string;
  label: string;
  size: string;
  cx: number;
  cy: number;
  reachable: boolean;
  hop: number; // 0 = root direct, 1 = child hop
};

const HEAP_NODES: HeapNodeSpec[] = [
  { id: "n1", addr: "0x10", label: "User", size: "16 B", cx: 430, cy: 175, reachable: true, hop: 0 },
  { id: "n2", addr: "0x24", label: "Profile", size: "24 B", cx: 730, cy: 175, reachable: true, hop: 1 },
  { id: "n3", addr: "0x38", label: "CacheMap", size: "32 B", cx: 430, cy: 335, reachable: true, hop: 0 },
  { id: "n4", addr: "0x4C", label: "Bucket[4]", size: "48 B", cx: 730, cy: 335, reachable: true, hop: 1 },
  { id: "n5", addr: "0x60", label: "TempBuf", size: "32 B", cx: 430, cy: 505, reachable: false, hop: 0 },
  { id: "n6", addr: "0x74", label: "Detached", size: "32 B", cx: 730, cy: 505, reachable: false, hop: 1 },
];

/**
 * Mark-and-Sweep Garbage Collector visualizer:
 * - Renders `Stack Roots` pointing into a graph of `Heap Objects`.
 * - At `markAt`, a green reachability wave traverses live pointers (`hop 0` -> `hop 1`).
 * - At `sweepAt`, unreachable island objects fade and reclaim into free memory blocks.
 */
export const GarbageCollector: React.FC<GarbageCollectorProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 860,
  at,
  until,
  markAt,
  sweepAt,
  filename = "runtime/mgc.go",
  right = "mark & sweep",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tMark = markAt ?? at + 24;
  const tSweep = sweepAt ?? at + 62;

  const markWave0 = prog(frame, tMark, 12, easeInOut);
  const markWave1 = prog(frame, tMark + 12, 12, easeInOut);
  const sweepP = prog(frame, tSweep, 14, easeInOut);

  const good = toneColors("good");
  const bad = toneColors("bad");
  const warn = toneColors("warn");

  const phaseText =
    sweepP > 0.1
      ? "Phase 3 · Sweep: reclaim unmarked blocks to free list"
      : markWave0 > 0.05
        ? "Phase 2 · Mark: trace reachable graph from stack roots"
        : "Phase 1 · Heap graph: live references vs detached island";

  const phaseTone = sweepP > 0.1 ? good : markWave0 > 0.05 ? toneColors("accent") : { bg: "#F5F5F7", edge: C.line, fg: C.mute };

  const nodeW = 216;
  const nodeH = 104;

  // Stack roots positions
  const roots = [
    { name: "req.user", sub: "root #1", y: 175, active: true },
    { name: "app.cache", sub: "root #2", y: 335, active: true },
    { name: "tmp = nil", sub: "dropped ref", y: 505, active: false },
  ];

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="refresh" right={right} style={style}>
      {/* Top phase bar */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          top: 22,
          height: 52,
          borderRadius: 14,
          background: phaseTone.bg,
          border: `1.5px solid ${phaseTone.edge}`,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name={sweepP > 0.5 ? "checkCircle" : "refresh"} size={24} color={phaseTone.fg} />
          <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, color: C.ink, letterSpacing: "-0.01em" }}>
            {phaseText}
          </span>
        </div>
        <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 17, color: phaseTone.fg }}>
          {sweepP > 0.5 ? "64 B freed" : markWave1 > 0.5 ? "4 marked · 2 garbage" : "6 objects allocated"}
        </span>
      </div>

      {/* Column section labels */}
      <div style={{ position: "absolute", left: 36, top: 88, fontFamily: mono, fontWeight: 700, fontSize: 17, color: C.mute }}>
        Stack roots
      </div>
      <div style={{ position: "absolute", left: 322, top: 88, fontFamily: mono, fontWeight: 700, fontSize: 17, color: C.mute }}>
        Heap object graph
      </div>

      {/* SVG Edges & Reachability Wave */}
      <svg
        width={w}
        height={h - TAB_H}
        viewBox={`0 0 ${w} ${h - TAB_H}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {/* Root 1 -> Node 1 */}
        <line
          x1={236}
          y1={175}
          x2={430 - nodeW / 2 - 6}
          y2={175}
          stroke={interpolateColors(markWave0, [0, 1], [WIRE, GREEN])}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <polygon
          points={`${430 - nodeW / 2 - 2},175 ${430 - nodeW / 2 - 14},168 ${430 - nodeW / 2 - 14},182`}
          fill={interpolateColors(markWave0, [0, 1], [WIRE, GREEN])}
        />

        {/* Node 1 -> Node 2 */}
        <line
          x1={430 + nodeW / 2}
          y1={175}
          x2={730 - nodeW / 2 - 6}
          y2={175}
          stroke={interpolateColors(markWave1, [0, 1], [WIRE, GREEN])}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <polygon
          points={`${730 - nodeW / 2 - 2},175 ${730 - nodeW / 2 - 14},168 ${730 - nodeW / 2 - 14},182`}
          fill={interpolateColors(markWave1, [0, 1], [WIRE, GREEN])}
        />

        {/* Root 2 -> Node 3 */}
        <line
          x1={236}
          y1={335}
          x2={430 - nodeW / 2 - 6}
          y2={335}
          stroke={interpolateColors(markWave0, [0, 1], [WIRE, GREEN])}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <polygon
          points={`${430 - nodeW / 2 - 2},335 ${430 - nodeW / 2 - 14},328 ${430 - nodeW / 2 - 14},342`}
          fill={interpolateColors(markWave0, [0, 1], [WIRE, GREEN])}
        />

        {/* Node 3 -> Node 4 */}
        <line
          x1={430 + nodeW / 2}
          y1={335}
          x2={730 - nodeW / 2 - 6}
          y2={335}
          stroke={interpolateColors(markWave1, [0, 1], [WIRE, GREEN])}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <polygon
          points={`${730 - nodeW / 2 - 2},335 ${730 - nodeW / 2 - 14},328 ${730 - nodeW / 2 - 14},342`}
          fill={interpolateColors(markWave1, [0, 1], [WIRE, GREEN])}
        />

        {/* Severed Root 3 -X-> Node 5 */}
        <line
          x1={236}
          y1={505}
          x2={305}
          y2={505}
          stroke={RED}
          strokeWidth={2.5}
          strokeDasharray="6 6"
          opacity={1 - sweepP * 0.6}
        />
        <g opacity={1 - sweepP * 0.6}>
          <circle cx={274} cy={505} r={12} fill="#FFF1F0" stroke={RED} strokeWidth={2.2} />
          <path d="M 269 500 L 279 510 M 279 500 L 269 510" stroke={RED} strokeWidth={2.2} strokeLinecap="round" />
        </g>

        {/* Unreachable Island Cycle: Node 5 <-> Node 6 */}
        <g opacity={1 - sweepP}>
          <path
            d={`M ${430 + nodeW / 2} 492 Q 580 468 ${730 - nodeW / 2 - 4} 492`}
            fill="none"
            stroke={markWave1 > 0.3 ? RED : WIRE}
            strokeWidth={3}
            strokeDasharray="7 5"
          />
          <path
            d={`M ${730 - nodeW / 2} 518 Q 580 542 ${430 + nodeW / 2 + 4} 518`}
            fill="none"
            stroke={markWave1 > 0.3 ? RED : WIRE}
            strokeWidth={3}
            strokeDasharray="7 5"
          />
        </g>
      </svg>

      {/* Left Stack Root Boxes */}
      {roots.map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 36,
            top: r.y - 44,
            width: 200,
            height: 88,
            borderRadius: 18,
            background: r.active ? C.white : "#F5F5F7",
            border: `2px solid ${r.active ? (markWave0 > 0.1 ? GREEN : C.accent) : C.line}`,
            padding: "0 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
            opacity: r.active ? 1 : 0.6,
          }}
        >
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 20, color: C.ink }}>{r.name}</div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 15,
              fontWeight: 600,
              color: r.active ? (markWave0 > 0.1 ? good.fg : C.accent) : bad.fg,
            }}
          >
            {r.sub}
          </div>
        </div>
      ))}

      {/* Heap Objects */}
      {HEAP_NODES.map((node) => {
        const markP = node.hop === 0 ? markWave0 : markWave1;
        const isMarked = node.reachable && markP > 0.1;
        const isUnreachableRevealed = !node.reachable && markWave1 > 0.4;

        // For unreachable nodes during sweep, crossfade into reclaimed free block
        if (!node.reachable) {
          return (
            <React.Fragment key={node.id}>
              {/* Unreachable island object fading out on sweep */}
              <div
                style={{
                  position: "absolute",
                  left: node.cx - nodeW / 2,
                  top: node.cy - nodeH / 2,
                  width: nodeW,
                  height: nodeH,
                  borderRadius: 20,
                  background: isUnreachableRevealed ? bad.bg : C.white,
                  border: `2.5px solid ${isUnreachableRevealed ? RED : C.line}`,
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  opacity: 1 - sweepP,
                  scale: String(lerp(1, 0.95, sweepP)),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>{node.addr}</span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 14,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: isUnreachableRevealed ? tint(RED, 0.16) : "#F2F2F4",
                      color: isUnreachableRevealed ? bad.fg : C.mute,
                    }}
                  >
                    mark: 0
                  </span>
                </div>
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: C.ink }}>{node.label}</div>
                <div style={{ fontFamily: mono, fontSize: 15, color: isUnreachableRevealed ? bad.fg : C.mute }}>
                  {isUnreachableRevealed ? "unreachable island" : node.size}
                </div>
              </div>

              {/* Reclaimed Free Memory Slot materializing on sweep */}
              {sweepP > 0.05 && (
                <div
                  style={{
                    position: "absolute",
                    left: node.cx - nodeW / 2,
                    top: node.cy - nodeH / 2,
                    width: nodeW,
                    height: nodeH,
                    borderRadius: 20,
                    background: "#F5F5F7",
                    border: `2px dashed ${GREEN}`,
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    ...materialize(sweepP),
                  }}
                >
                  <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 18, color: good.fg }}>
                    free block ({node.addr})
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>
                    +{node.size} reclaimed
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        }

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.cx - nodeW / 2,
              top: node.cy - nodeH / 2,
              width: nodeW,
              height: nodeH,
              borderRadius: 20,
              background: interpolateColors(markP, [0, 1], [C.white, "#EEFAF1"]),
              border: `2.5px solid ${interpolateColors(markP, [0, 1], ["rgba(0,0,0,0.12)", GREEN])}`,
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>{node.addr}</span>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 14,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: isMarked ? tint(GREEN, 0.2) : "#F2F2F4",
                  color: isMarked ? good.fg : C.mute,
                }}
              >
                {isMarked ? "mark: 1" : "mark: 0"}
              </span>
            </div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: C.ink }}>{node.label}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: mono, fontSize: 15 }}>
              <span style={{ color: C.mute }}>{node.size}</span>
              <span style={{ color: isMarked ? good.fg : C.mute, fontWeight: 600 }}>
                {isMarked ? "reachable" : "live"}
              </span>
            </div>
          </div>
        );
      })}

      {/* Bottom Heap Arena Bar */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          bottom: 28,
          height: 158,
          borderRadius: 20,
          background: "#F5F5F7",
          border: `1.5px solid ${C.line}`,
          padding: "18px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, color: C.ink }}>
            Heap arena bitmap &amp; free list
          </span>
          <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 18, color: C.mute }}>
            used: {Math.round(lerp(184, 120, sweepP))} B / 184 B
          </span>
        </div>

        {/* 6 physical page cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
          {HEAP_NODES.map((n) => {
            const mP = n.hop === 0 ? markWave0 : markWave1;
            const liveMarked = n.reachable && mP > 0.2;
            const swept = !n.reachable && sweepP > 0.3;
            const unmarkedWarn = !n.reachable && markWave1 > 0.4 && !swept;
            return (
              <div
                key={n.id}
                style={{
                  height: 62,
                  borderRadius: 12,
                  background: swept
                    ? C.white
                    : unmarkedWarn
                      ? warn.bg
                      : liveMarked
                        ? good.bg
                        : C.white,
                  border: swept
                    ? `2px dashed ${GREEN}`
                    : `2px solid ${unmarkedWarn ? AMBER : liveMarked ? GREEN : C.line}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: mono,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 16, color: swept ? good.fg : C.ink }}>
                  {swept ? "FREE" : n.addr}
                </span>
                <span style={{ fontSize: 13, color: swept ? good.fg : unmarkedWarn ? warn.fg : C.mute }}>
                  {swept ? "reclaimed" : liveMarked ? "marked" : unmarkedWarn ? "garbage" : n.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </DevCard>
  );
};
