import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, WIRE } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { tint } from "../windows/MacWindow";

export type TypeLatticeProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  guard1At?: number;
  guard2At?: number;
  filename?: string;
  right?: string;
  style?: React.CSSProperties;
};

/**
 * TypeScript Type Narrowing flow card:
 * - Starts with a broad union type pill (`string | number | null`).
 * - Flows through control-flow guards (`if (val === null) return;`, `if (typeof val === "number")`).
 * - Narrows the active type pill step-by-step down to `string`.
 */
export const TypeLattice: React.FC<TypeLatticeProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 860,
  at,
  until,
  guard1At,
  guard2At,
  filename = "narrow.ts",
  right = "tsc · narrowing",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tG1 = guard1At ?? at + 24;
  const tG2 = guard2At ?? at + 54;

  const g1P = prog(frame, tG1, 14, easeInOut);
  const g2P = prog(frame, tG2, 14, easeInOut);

  const accent = toneColors("accent");
  const good = toneColors("good");
  const warn = toneColors("warn");

  // Current narrowed type string
  const currentType =
    g2P > 0.5 ? "string" : g1P > 0.5 ? "string | number" : "string | number | null";

  // Y positions of the 3 control-flow stages
  const y0 = 190;
  const y1 = 385;
  const y2 = 580;
  const mainX = 310;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="filter" right={right} style={style}>
      {/* Top Live Union Lattice Strip */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          top: 22,
          height: 82,
          borderRadius: 18,
          background: "#F5F5F7",
          border: `1.5px solid ${C.line}`,
          padding: "0 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, color: C.mute }}>
            Active type of
          </span>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 22,
              padding: "4px 12px",
              borderRadius: 10,
              background: C.white,
              border: `1px solid ${C.line}`,
              color: C.ink,
            }}
          >
            val
          </span>
        </div>

        {/* The 3 Union Member Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: mono, fontWeight: 700, fontSize: 21 }}>
          {/* string (remains live, turns green at g2P) */}
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: interpolateColors(g2P, [0, 1], [BLUE_TINT, good.bg]),
              border: `2px solid ${interpolateColors(g2P, [0, 1], [C.accent, GREEN])}`,
              color: interpolateColors(g2P, [0, 1], [C.accent, good.fg]),
            }}
          >
            string
          </div>

          <span style={{ color: C.mute, opacity: lerp(1, 0.25, g2P) }}>|</span>

          {/* number (pruned at g2P) */}
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: interpolateColors(g2P, [0, 1], [BLUE_TINT, "#EBEBED"]),
              border: `2px solid ${interpolateColors(g2P, [0, 1], [C.accent, "rgba(0,0,0,0.08)"])}`,
              color: interpolateColors(g2P, [0, 1], [C.accent, C.mute]),
              opacity: lerp(1, 0.42, g2P),
              textDecoration: g2P > 0.6 ? "line-through" : "none",
            }}
          >
            number
          </div>

          <span style={{ color: C.mute, opacity: lerp(1, 0.25, g1P) }}>|</span>

          {/* null (pruned at g1P) */}
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: interpolateColors(g1P, [0, 1], [BLUE_TINT, "#EBEBED"]),
              border: `2px solid ${interpolateColors(g1P, [0, 1], [C.accent, "rgba(0,0,0,0.08)"])}`,
              color: interpolateColors(g1P, [0, 1], [C.accent, C.mute]),
              opacity: lerp(1, 0.42, g1P),
              textDecoration: g1P > 0.6 ? "line-through" : "none",
            }}
          >
            null
          </div>
        </div>
      </div>

      {/* SVG Control-Flow Connectors */}
      <svg
        width={w}
        height={h - TAB_H}
        viewBox={`0 0 ${w} ${h - TAB_H}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {/* Spine 0 -> 1 */}
        <line
          x1={mainX}
          y1={y0 + 54}
          x2={mainX}
          y2={y1 - 56}
          stroke={interpolateColors(g1P, [0, 1], [WIRE, C.accent])}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <polygon
          points={`${mainX},${y1 - 50} ${mainX - 8},${y1 - 64} ${mainX + 8},${y1 - 64}`}
          fill={interpolateColors(g1P, [0, 1], [WIRE, C.accent])}
        />

        {/* Guard 1 true branch -> right (`val: null`) */}
        {g1P > 0 && (
          <g opacity={g1P}>
            <line
              x1={584}
              y1={y1}
              x2={644}
              y2={y1}
              stroke={AMBER}
              strokeWidth={3.5}
              strokeDasharray="7 5"
              strokeLinecap="round"
            />
            <polygon points={`650,${y1} 636,${y1 - 7} 636,${y1 + 7}`} fill={AMBER} />
          </g>
        )}

        {/* Spine 1 -> 2 */}
        <line
          x1={mainX}
          y1={y1 + 54}
          x2={mainX}
          y2={y2 - 56}
          stroke={interpolateColors(g2P, [0, 1], [WIRE, GREEN])}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <polygon
          points={`${mainX},${y2 - 50} ${mainX - 8},${y2 - 64} ${mainX + 8},${y2 - 64}`}
          fill={interpolateColors(g2P, [0, 1], [WIRE, GREEN])}
        />

        {/* Guard 2 true branch -> right (`val: number`) */}
        {g2P > 0 && (
          <g opacity={g2P}>
            <line
              x1={584}
              y1={y2 - 22}
              x2={644}
              y2={y2 - 22}
              stroke={C.accent}
              strokeWidth={3.5}
              strokeDasharray="7 5"
              strokeLinecap="round"
            />
            <polygon points={`650,${y2 - 22} 636,${y2 - 29} 636,${y2 - 15}`} fill={C.accent} />
          </g>
        )}
      </svg>

      {/* Node 0: Function Entry Parameter */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: y0 - 52,
          width: 548,
          height: 104,
          borderRadius: 20,
          background: C.white,
          border: `2.5px solid ${C.accent}`,
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
          padding: "14px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 600, color: C.mute }}>
            1 · Function entry
          </span>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              padding: "3px 12px",
              borderRadius: 999,
              background: accent.bg,
              color: accent.fg,
            }}
          >
            val: string | number | null
          </span>
        </div>
        <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>
          <span style={{ color: C.accent }}>function</span> render(val:{" "}
          <span style={{ color: C.accent }}>string | number | null</span>)
        </div>
      </div>

      {/* Right Callout 0: Initial Union Breadth */}
      <div
        style={{
          position: "absolute",
          left: 654,
          top: y0 - 42,
          width: 210,
          height: 84,
          borderRadius: 16,
          background: "#F5F5F7",
          border: `1.5px solid ${C.line}`,
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 17, color: C.mute }}>Union width</span>
        <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 20, color: C.ink }}>3 possible types</span>
      </div>

      {/* Node 1: Guard #1 (Equality Narrowing `val === null`) */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: y1 - 52,
          width: 548,
          height: 104,
          borderRadius: 20,
          background: interpolateColors(g1P, [0, 1], [C.white, BLUE_TINT]),
          border: `2.5px solid ${interpolateColors(g1P, [0, 1], [C.line, C.accent])}`,
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
          padding: "14px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 600, color: C.mute }}>
            2 · Equality guard (eliminates null)
          </span>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              padding: "3px 12px",
              borderRadius: 999,
              background: g1P > 0.3 ? C.white : "#F2F2F4",
              color: g1P > 0.3 ? C.accent : C.mute,
              border: `1px solid ${g1P > 0.3 ? tint(C.accent, 0.35) : C.line}`,
            }}
          >
            {g1P > 0.3 ? "after: string | number" : "unchecked"}
          </span>
        </div>
        <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>
          <span style={{ color: C.accent }}>if</span> (val === <span style={{ color: "#A05A00" }}>null</span>){" "}
          <span style={{ color: C.accent }}>return</span> <span style={{ color: "#248A3D" }}>"none"</span>;
        </div>
      </div>

      {/* Right Branch 1: Pruned `null` early return */}
      {g1P > 0 && (
        <div
          style={{
            position: "absolute",
            left: 654,
            top: y1 - 42,
            width: 210,
            height: 84,
            borderRadius: 16,
            background: warn.bg,
            border: `2px solid ${AMBER}`,
            padding: "10px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
            ...materialize(g1P),
          }}
        >
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 17, color: warn.fg }}>then · val: null</span>
          <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>early return exits</span>
        </div>
      )}

      {/* Node 2: Guard #2 (`typeof val === "number"`) -> Narrowed `string` */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: y2 - 64,
          width: 548,
          height: 128,
          borderRadius: 20,
          background: interpolateColors(g2P, [0, 1], [C.white, good.bg]),
          border: `2.5px solid ${interpolateColors(g2P, [0, 1], [C.line, GREEN])}`,
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
          padding: "14px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 600, color: C.mute }}>
            3 · typeof guard → narrowed fallthrough
          </span>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              padding: "3px 12px",
              borderRadius: 999,
              background: g2P > 0.3 ? C.white : "#F2F2F4",
              color: g2P > 0.3 ? good.fg : C.mute,
              border: `1px solid ${g2P > 0.3 ? GREEN : C.line}`,
            }}
          >
            {g2P > 0.3 ? "val: string" : "awaiting guard"}
          </span>
        </div>
        <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 19, color: C.mute }}>
          <span style={{ color: C.accent }}>if</span> (<span style={{ color: C.accent }}>typeof</span> val ==={" "}
          <span style={{ color: "#248A3D" }}>"number"</span>) <span style={{ color: C.accent }}>return</span> val.toFixed(2);
        </div>
        <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>
          <span style={{ color: C.accent }}>return</span> val.<span style={{ color: good.fg }}>toUpperCase</span>();
        </div>
      </div>

      {/* Right Branch 2: Pruned `number` branch */}
      {g2P > 0 && (
        <div
          style={{
            position: "absolute",
            left: 654,
            top: y2 - 64,
            width: 210,
            height: 84,
            borderRadius: 16,
            background: accent.bg,
            border: `2px solid ${C.accent}`,
            padding: "10px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
            ...materialize(g2P),
          }}
        >
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 17, color: accent.fg }}>then · val: number</span>
          <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>val.toFixed(2) ok</span>
        </div>
      )}

      {/* Bottom Compiler Proof Footer */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          bottom: 26,
          height: 98,
          borderRadius: 18,
          background: g2P > 0.5 ? good.bg : "#F5F5F7",
          border: `2px solid ${g2P > 0.5 ? GREEN : C.line}`,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Icon
            name={g2P > 0.5 ? "checkCircle" : "filter"}
            size={28}
            color={g2P > 0.5 ? GREEN : C.accent}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.ink }}>
              {g2P > 0.5
                ? "Exhaustive narrowing complete: `val.toUpperCase()` is 100% type-safe"
                : g1P > 0.5
                  ? "Nullability eliminated: `val` is now `string | number`"
                  : "Control-flow analysis tracking union type across branches"}
            </span>
            <span style={{ fontFamily: mono, fontSize: 17, color: C.mute }}>
              (parameter) val: {currentType}
            </span>
          </div>
        </div>
      </div>
    </DevCard>
  );
};
