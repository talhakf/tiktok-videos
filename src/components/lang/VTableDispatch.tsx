import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, WIRE } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { tint } from "../windows/MacWindow";

export type VTableDispatchProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  lookupAt?: number;
  compareAt?: number;
  filename?: string;
  right?: string;
  style?: React.CSSProperties;
};

/**
 * Dynamic Dispatch (`vtable`) vs Static Dispatch pointer diagram:
 * - Shows a trait object fat pointer (`ptr: &dyn Drawable`) with its `data ptr` + `vptr`.
 * - `data ptr` points to `Circle { radius: 12.0 }` on the heap.
 * - `vptr` points to the read-only `vtable` method table (`draw → Circle::draw`, `drop → Circle::drop`).
 * - Contrasts runtime vtable lookup against compile-time monomorphized static dispatch.
 */
export const VTableDispatch: React.FC<VTableDispatchProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 860,
  at,
  until,
  lookupAt,
  compareAt,
  filename = "dispatch.rs",
  right = "vtable vs monomorphized",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tLookup = lookupAt ?? at + 22;
  const tCompare = compareAt ?? at + 52;

  const lookP = prog(frame, tLookup, 14, easeInOut);
  const compP = prog(frame, tCompare, 14, easeInOut);

  const accent = toneColors("accent");
  const good = toneColors("good");

  // Layout coordinates
  const fatX = 36;
  const fatW = 310;
  const targetX = 438;
  const targetW = 426;

  const dataRowY = 178; // data_ptr center Y
  const vptrRowY = 262; // vptr center Y

  const heapBoxTop = 94;
  const vtableBoxTop = 250;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="sitemap" right={right} style={style}>
      {/* Top Section Header */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          top: 22,
          height: 50,
          borderRadius: 14,
          background: accent.bg,
          border: `1.5px solid ${accent.edge}`,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          ...materialize(prog(frame, at + 4, 10)),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="sitemap" size={24} color={accent.fg} />
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.ink }}>
            Dynamic dispatch · trait object fat pointer
          </span>
        </div>
        <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 18, color: accent.fg }}>
          ptr: &amp;dyn Drawable (16 B)
        </span>
      </div>

      {/* SVG Pointers: data_ptr -> Heap Instance, vptr -> VTable */}
      <svg
        width={w}
        height={h - TAB_H}
        viewBox={`0 0 ${w} ${h - TAB_H}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {/* data_ptr -> Circle instance on Heap */}
        <path
          d={`M ${fatX + fatW} ${dataRowY} C 384 ${dataRowY}, 394 158, ${targetX - 8} 158`}
          fill="none"
          stroke={C.accent}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <polygon points={`${targetX - 2},158 ${targetX - 15},151 ${targetX - 15},165`} fill={C.accent} />

        {/* vptr -> vtable in .rodata */}
        <path
          d={`M ${fatX + fatW} ${vptrRowY} C 384 ${vptrRowY}, 392 365, ${targetX - 8} 365`}
          fill="none"
          stroke={interpolateColors(lookP, [0, 1], [WIRE, GREEN])}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <polygon
          points={`${targetX - 2},365 ${targetX - 15},357 ${targetX - 15},373`}
          fill={interpolateColors(lookP, [0, 1], [WIRE, GREEN])}
        />
      </svg>

      {/* Left Box: Stack Fat Pointer `ptr: &dyn Drawable` */}
      <div
        style={{
          position: "absolute",
          left: fatX,
          top: 94,
          width: fatW,
          height: 230,
          borderRadius: 22,
          background: C.white,
          border: `2.5px solid ${C.ink}`,
          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 20, color: C.ink }}>
            ptr: &amp;dyn Drawable
          </span>
          <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>stack</span>
        </div>

        {/* Slot 0: data_ptr */}
        <div
          style={{
            height: 68,
            borderRadius: 14,
            background: BLUE_TINT,
            border: `2px solid ${C.accent}`,
            padding: "0 14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: mono }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: C.ink }}>data_ptr</span>
            <span style={{ fontSize: 15, color: C.accent, fontWeight: 700 }}>0x7f10_0040 →</span>
          </div>
          <span style={{ fontFamily: mono, fontSize: 14, color: C.mute }}>points to concrete struct fields</span>
        </div>

        {/* Slot 1: vptr */}
        <div
          style={{
            height: 68,
            borderRadius: 14,
            background: interpolateColors(lookP, [0, 1], ["#F5F5F7", good.bg]),
            border: `2px solid ${interpolateColors(lookP, [0, 1], [C.line, GREEN])}`,
            padding: "0 14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: mono }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: C.ink }}>vptr</span>
            <span style={{ fontSize: 15, color: lookP > 0.3 ? good.fg : C.mute, fontWeight: 700 }}>
              0x55a0_8100 →
            </span>
          </div>
          <span style={{ fontFamily: mono, fontSize: 14, color: C.mute }}>points to static method table</span>
        </div>
      </div>

      {/* Left Call Site Box under Fat Pointer */}
      <div
        style={{
          position: "absolute",
          left: fatX,
          top: 344,
          width: fatW,
          height: 154,
          borderRadius: 20,
          background: lookP > 0.2 ? good.bg : "#F5F5F7",
          border: `2px solid ${lookP > 0.2 ? GREEN : C.line}`,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: lookP > 0.2 ? good.fg : C.mute }}>
          RUNTIME CALL SITE
        </div>
        <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 23, color: C.ink }}>
          ptr.<span style={{ color: lookP > 0.2 ? good.fg : C.accent }}>draw</span>();
        </div>
        <div style={{ fontFamily: mono, fontSize: 15, color: C.mute, lineHeight: 1.35 }}>
          {lookP > 0.2
            ? "(ptr.vptr.draw)(ptr.data_ptr)"
            : "resolves method via vptr at runtime"}
        </div>
      </div>

      {/* Right Top: Concrete Instance `Circle` on Heap */}
      <div
        style={{
          position: "absolute",
          left: targetX,
          top: heapBoxTop,
          width: targetW,
          height: 132,
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
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: C.accent }}>
            Circle instance (heap)
          </span>
          <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>0x7f10_0040</span>
        </div>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            background: BLUE_TINT,
            border: `1.5px solid ${tint(C.accent, 0.3)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 18,
          }}
        >
          <span style={{ fontWeight: 700, color: C.ink }}>radius: f64</span>
          <span style={{ fontWeight: 700, color: C.accent }}>12.0 (8 bytes)</span>
        </div>
      </div>

      {/* Right Middle: VTable Method Table in `.rodata` */}
      <div
        style={{
          position: "absolute",
          left: targetX,
          top: vtableBoxTop,
          width: targetW,
          height: 248,
          borderRadius: 22,
          background: C.white,
          border: `2.5px solid ${interpolateColors(lookP, [0, 1], [C.line, GREEN])}`,
          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: C.ink }}>
            vtable · &lt;Circle as Drawable&gt;
          </span>
          <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>.rodata · 0x55a0_8100</span>
        </div>

        {/* Row 1: draw -> Circle::draw */}
        <div
          style={{
            height: 54,
            borderRadius: 12,
            background: interpolateColors(lookP, [0, 1], ["#F5F5F7", good.bg]),
            border: `2px solid ${interpolateColors(lookP, [0, 1], [C.line, GREEN])}`,
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 18,
          }}
        >
          <span style={{ fontWeight: 700, color: C.ink }}>draw</span>
          <span style={{ fontWeight: 700, color: lookP > 0.2 ? good.fg : C.accent }}>
            → Circle::draw (0x1040)
          </span>
        </div>

        {/* Row 2: drop -> Circle::drop */}
        <div
          style={{
            height: 50,
            borderRadius: 12,
            background: "#F5F5F7",
            border: `1px solid ${C.line}`,
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 17,
          }}
        >
          <span style={{ fontWeight: 600, color: C.ink }}>drop</span>
          <span style={{ color: C.mute }}>→ Circle::drop (0x1088)</span>
        </div>

        {/* Row 3: size & align metadata */}
        <div
          style={{
            height: 44,
            borderRadius: 12,
            background: "#F5F5F7",
            border: `1px solid ${C.line}`,
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 16,
            color: C.mute,
          }}
        >
          <span>layout metadata</span>
          <span>size: 8 B · align: 8 B</span>
        </div>
      </div>

      {/* Bottom Comparison Strip: Dynamic Dispatch (`&dyn Trait`) vs Static Dispatch (`impl Trait`) */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          bottom: 28,
          height: 244,
          borderRadius: 22,
          background: "#F5F5F7",
          border: `1.5px solid ${C.line}`,
          padding: "18px 22px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: lerp(0.85, 1, compP),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, color: C.ink }}>
            Dispatch tradeoff · runtime flexibility vs compile-time inlining
          </span>
          <span style={{ fontFamily: mono, fontSize: 16, color: C.mute }}>
            {compP > 0.3 ? "monomorphization compared" : "vtable indirection"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: 158 }}>
          {/* Left card: Dynamic dispatch */}
          <div
            style={{
              borderRadius: 16,
              background: C.white,
              border: `2px solid ${C.accent}`,
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 18, color: C.accent }}>
                Dynamic (&amp;dyn Drawable)
              </span>
              <span style={{ fontFamily: mono, fontSize: 14, color: C.mute }}>runtime</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 16, color: C.ink }}>
              • Fat pointer (data + vptr)
              <br />• Indirect call through vtable
              <br />• Mixed <code style={{ fontFamily: mono }}>Vec&lt;Box&lt;dyn Drawable&gt;&gt;</code>
            </div>
          </div>

          {/* Right card: Static dispatch */}
          <div
            style={{
              borderRadius: 16,
              background: compP > 0.2 ? good.bg : C.white,
              border: `2px solid ${compP > 0.2 ? GREEN : C.line}`,
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 18, color: compP > 0.2 ? good.fg : C.ink }}>
                Static (&lt;T: Drawable&gt;)
              </span>
              <span style={{ fontFamily: mono, fontSize: 14, color: compP > 0.2 ? good.fg : C.mute }}>
                compile time
              </span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 16, color: C.ink }}>
              • Thin pointer (8 B address only)
              <br />• Direct call <code style={{ fontFamily: mono }}>Circle::draw(x)</code>
              <br />• Zero vtable overhead, inlined
            </div>
          </div>
        </div>
      </div>
    </DevCard>
  );
};
