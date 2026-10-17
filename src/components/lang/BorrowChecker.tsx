import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { tint } from "../windows/MacWindow";

export type BorrowCheckerProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  filename?: string;
  right?: string;
  heapValue?: string;
  heapAddr?: string;
  moveAt?: number;
  sharedAt?: number;
  mutAt?: number;
  style?: React.CSSProperties;
};

/**
 * Rust Ownership & Borrow Checker card:
 * 1. Visualizes a heap allocation (`String::from("snacks")`) owned by `s1`.
 * 2. At `moveAt`, `let s2 = s1` moves ownership to `s2` and dims `s1` with "value moved".
 * 3. At `sharedAt`, shared immutable references (`r1: &s2`, `r2: &s2`) borrow concurrently in green.
 * 4. At `mutAt`, an exclusive mutable borrow (`m1: &mut s2`) collides with active readers at compile time (`E0502`).
 */
export const BorrowChecker: React.FC<BorrowCheckerProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 860,
  at,
  until,
  filename = "borrow.rs",
  right = "rustc · borrowck",
  heapValue = "snacks",
  heapAddr = "0x7f4a_01c0",
  moveAt,
  sharedAt,
  mutAt,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tMove = moveAt ?? at + 22;
  const tShared = sharedAt ?? at + 48;
  const tMut = mutAt ?? at + 74;

  const moveP = prog(frame, tMove, 14, easeInOut);
  const sharedP1 = prog(frame, tShared, 10);
  const sharedP2 = prog(frame, tShared + 5, 10);
  const mutP = prog(frame, tMut, 12);

  const good = toneColors("good");
  const bad = toneColors("bad");
  const accent = toneColors("accent");

  // Stack slots Y coordinates (relative to body)
  const s1Y = 128;
  const s2Y = 238;
  const r1Y = 358;
  const r2Y = 446;
  const m1Y = 548;

  // Ownership arrow start Y glides from s1Y to s2Y
  const ownerStartY = lerp(s1Y, s2Y, moveP);
  const heapTargetX = 568;
  const heapTargetY = 250;
  const stackRightX = 398;

  const chars = heapValue.slice(0, 6).split("");

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="shieldCheck" right={right} style={style}>
      {/* Top column headers: Stack Frame vs Heap Memory */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 24,
          width: 362,
          height: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderRadius: 12,
          background: "#F5F5F7",
          border: `1px solid ${C.line}`,
        }}
      >
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, color: C.ink, letterSpacing: "-0.01em" }}>
          Stack bindings
        </span>
        <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 18, color: C.mute }}>fn main()</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 568,
          top: 24,
          width: 296,
          height: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderRadius: 12,
          background: "#F5F5F7",
          border: `1px solid ${C.line}`,
        }}
      >
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, color: C.ink, letterSpacing: "-0.01em" }}>
          Heap allocation
        </span>
        <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 18, color: C.mute }}>{heapAddr}</span>
      </div>

      {/* SVG Pointer Connectors between Stack and Heap */}
      <svg
        width={w}
        height={h - TAB_H}
        viewBox={`0 0 ${w} ${h - TAB_H}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {/* Ghost dashed line from moved s1 */}
        {moveP > 0.05 && (
          <path
            d={`M ${stackRightX} ${s1Y} C 470 ${s1Y}, 490 ${heapTargetY - 40}, ${heapTargetX - 8} ${heapTargetY - 40}`}
            fill="none"
            stroke={C.mute}
            strokeWidth={2.5}
            strokeDasharray="6 6"
            opacity={moveP * 0.35}
          />
        )}

        {/* Active Owner arrow (glides from s1 to s2 at moveAt) */}
        <path
          d={`M ${stackRightX} ${ownerStartY} C 478 ${ownerStartY}, 488 ${heapTargetY - 12}, ${heapTargetX - 8} ${heapTargetY - 12}`}
          fill="none"
          stroke={C.accent}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <polygon
          points={`${heapTargetX - 2},${heapTargetY - 12} ${heapTargetX - 16},${heapTargetY - 20} ${heapTargetX - 16},${heapTargetY - 4}`}
          fill={C.accent}
        />

        {/* Shared borrow r1: &s2 */}
        {sharedP1 > 0 && (
          <g opacity={sharedP1}>
            <path
              d={`M ${stackRightX} ${r1Y} C 475 ${r1Y}, 495 ${heapTargetY + 26}, ${heapTargetX - 8} ${heapTargetY + 26}`}
              fill="none"
              stroke={GREEN}
              strokeWidth={3.5}
              strokeDasharray="8 5"
              strokeLinecap="round"
            />
            <polygon
              points={`${heapTargetX - 2},${heapTargetY + 26} ${heapTargetX - 15},${heapTargetY + 19} ${heapTargetX - 15},${heapTargetY + 33}`}
              fill={GREEN}
            />
          </g>
        )}

        {/* Shared borrow r2: &s2 */}
        {sharedP2 > 0 && (
          <g opacity={sharedP2}>
            <path
              d={`M ${stackRightX} ${r2Y} C 485 ${r2Y}, 505 ${heapTargetY + 56}, ${heapTargetX - 8} ${heapTargetY + 56}`}
              fill="none"
              stroke={GREEN}
              strokeWidth={3.5}
              strokeDasharray="8 5"
              strokeLinecap="round"
            />
            <polygon
              points={`${heapTargetX - 2},${heapTargetY + 56} ${heapTargetX - 15},${heapTargetY + 49} ${heapTargetX - 15},${heapTargetY + 63}`}
              fill={GREEN}
            />
          </g>
        )}

        {/* Exclusive mutable borrow m1: &mut s2 blocked at compile time */}
        {mutP > 0 && (
          <g opacity={mutP}>
            <path
              d={`M ${stackRightX} ${m1Y} C 462 ${m1Y}, 474 ${heapTargetY + 96}, 512 ${heapTargetY + 96}`}
              fill="none"
              stroke={RED}
              strokeWidth={3.5}
              strokeDasharray="6 6"
              strokeLinecap="round"
            />
            <circle cx={516} cy={heapTargetY + 96} r={16} fill="#FFF1F0" stroke={RED} strokeWidth={3} />
            <path d={`M 510 ${heapTargetY + 90} L 522 ${heapTargetY + 102} M 522 ${heapTargetY + 90} L 510 ${heapTargetY + 102}`} stroke={RED} strokeWidth={2.8} strokeLinecap="round" />
          </g>
        )}
      </svg>

      {/* 1. s1 binding (initial owner -> moved) */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: s1Y - 40,
          width: 362,
          height: 82,
          borderRadius: 18,
          background: interpolateColors(moveP, [0, 1], [BLUE_TINT, "#F5F5F7"]),
          border: `2px solid ${interpolateColors(moveP, [0, 1], [C.accent, "rgba(0,0,0,0.10)"])}`,
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: lerp(1, 0.52, moveP),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 22, color: C.ink }}>
            <span style={{ color: C.mute }}>let </span>s1<span style={{ color: C.mute }}>: String</span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 17, color: C.mute }}>
            String::from("{heapValue}")
          </div>
        </div>
        <div
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            background: moveP > 0.5 ? bad.bg : accent.bg,
            border: `1px solid ${moveP > 0.5 ? bad.edge : accent.edge}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 16,
            color: moveP > 0.5 ? bad.fg : accent.fg,
          }}
        >
          {moveP > 0.5 ? "value moved" : "owner"}
        </div>
      </div>

      {/* 2. s2 binding (receives move at moveAt) */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: s2Y - 40,
          width: 362,
          height: 82,
          borderRadius: 18,
          background: interpolateColors(moveP, [0, 1], [C.white, BLUE_TINT]),
          border: `2px solid ${interpolateColors(moveP, [0, 1], [C.line, C.accent])}`,
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          ...materialize(prog(frame, at + 8, 10)),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 22, color: C.ink }}>
            <span style={{ color: C.mute }}>let </span>s2 <span style={{ color: C.mute }}>=</span> s1;
          </div>
          <div style={{ fontFamily: mono, fontSize: 17, color: C.mute }}>
            {moveP > 0.3 ? "move semantics (no copy)" : "awaiting move..."}
          </div>
        </div>
        <div
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            background: moveP > 0.3 ? accent.bg : "#F2F2F4",
            border: `1px solid ${moveP > 0.3 ? accent.edge : C.line}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 16,
            color: moveP > 0.3 ? accent.fg : C.mute,
          }}
        >
          {moveP > 0.3 ? "owner" : "uninit"}
        </div>
      </div>

      {/* 3. Shared borrows r1 & r2 */}
      {sharedP1 > 0 && (
        <div
          style={{
            position: "absolute",
            left: 36,
            top: r1Y - 34,
            width: 362,
            height: 68,
            borderRadius: 16,
            background: good.bg,
            border: `2px solid ${GREEN}`,
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...materialize(sharedP1),
          }}
        >
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>
            <span style={{ color: C.mute }}>let </span>r1 <span style={{ color: C.mute }}>=</span>{" "}
            <span style={{ color: good.fg }}>&amp;s2</span>;
          </div>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 16, color: good.fg }}>shared &amp;T #1</span>
        </div>
      )}

      {sharedP2 > 0 && (
        <div
          style={{
            position: "absolute",
            left: 36,
            top: r2Y - 34,
            width: 362,
            height: 68,
            borderRadius: 16,
            background: good.bg,
            border: `2px solid ${GREEN}`,
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...materialize(sharedP2),
          }}
        >
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>
            <span style={{ color: C.mute }}>let </span>r2 <span style={{ color: C.mute }}>=</span>{" "}
            <span style={{ color: good.fg }}>&amp;s2</span>;
          </div>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 16, color: good.fg }}>shared &amp;T #2</span>
        </div>
      )}

      {/* 4. Exclusive mutable borrow m1: &mut s2 */}
      {mutP > 0 && (
        <div
          style={{
            position: "absolute",
            left: 36,
            top: m1Y - 38,
            width: 362,
            height: 76,
            borderRadius: 18,
            background: bad.bg,
            border: `2.5px solid ${RED}`,
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...materialize(mutP),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>
              <span style={{ color: C.mute }}>let </span>m1 <span style={{ color: C.mute }}>=</span>{" "}
              <span style={{ color: bad.fg }}>&amp;mut s2</span>;
            </div>
            <div style={{ fontFamily: mono, fontSize: 16, color: bad.fg }}>
              conflicts with active &amp;s2
            </div>
          </div>
          <div
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              background: tint(RED, 0.16),
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              color: bad.fg,
            }}
          >
            rejected
          </div>
        </div>
      )}

      {/* Right side: Heap String Buffer Box */}
      <div
        style={{
          position: "absolute",
          left: heapTargetX,
          top: 94,
          width: 296,
          height: 360,
          borderRadius: 22,
          background: C.white,
          border: `2.5px solid ${C.accent}`,
          boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 20, color: C.accent }}>
              String buffer
            </span>
            <Icon name="lock" size={26} color={sharedP1 > 0 ? GREEN : C.accent} />
          </div>

          {/* Fat header metadata: ptr / len / cap */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 18,
            }}
          >
            <div style={{ padding: "8px 12px", borderRadius: 10, background: "#F5F5F7", fontFamily: mono, fontSize: 17, color: C.ink }}>
              <span style={{ color: C.mute }}>len: </span>
              <b>{chars.length}</b>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: 10, background: "#F5F5F7", fontFamily: mono, fontSize: 17, color: C.ink }}>
              <span style={{ color: C.mute }}>cap: </span>
              <b>{chars.length}</b>
            </div>
          </div>

          {/* UTF-8 byte cells */}
          <div style={{ fontFamily: mono, fontSize: 16, color: C.mute, marginBottom: 8 }}>UTF-8 bytes on heap</div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${chars.length}, 1fr)`, gap: 6 }}>
            {chars.map((ch, idx) => (
              <div
                key={idx}
                style={{
                  height: 52,
                  borderRadius: 10,
                  background: BLUE_TINT,
                  border: `1.5px solid ${tint(C.accent, 0.35)}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: mono,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 22, color: C.ink }}>{ch}</span>
                <span style={{ fontSize: 12, color: C.mute }}>{idx}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live borrow state counter */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            background: sharedP1 > 0 ? good.bg : "#F5F5F7",
            border: `1.5px solid ${sharedP1 > 0 ? GREEN : C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 17,
          }}
        >
          <span style={{ color: C.ink, fontWeight: 600 }}>
            {sharedP2 > 0 ? "2 readers · 0 writers" : sharedP1 > 0 ? "1 reader · 0 writers" : "1 owner · 0 borrows"}
          </span>
          <span style={{ color: sharedP1 > 0 ? good.fg : C.accent, fontWeight: 700 }}>
            {sharedP1 > 0 ? "read-only" : "owned"}
          </span>
        </div>
      </div>

      {/* Aliasing XOR Mutability rule card under Heap */}
      <div
        style={{
          position: "absolute",
          left: heapTargetX,
          top: 472,
          width: 296,
          height: 114,
          borderRadius: 18,
          background: "#F5F5F7",
          border: `1px solid ${C.line}`,
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 19, color: C.ink }}>
          Aliasing XOR mutability
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: mono, fontSize: 17 }}>
          <span style={{ color: good.fg, fontWeight: 700 }}>∞ &amp;T</span>
          <span style={{ color: C.mute }}>or</span>
          <span style={{ color: accent.fg, fontWeight: 700 }}>1 &amp;mut T</span>
        </div>
      </div>

      {/* Bottom Compiler Diagnostic Banner */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          bottom: 28,
          height: 156,
          borderRadius: 20,
          background: mutP > 0 ? bad.bg : sharedP1 > 0 ? good.bg : "#F5F5F7",
          border: `2px solid ${mutP > 0 ? RED : sharedP1 > 0 ? GREEN : C.line}`,
          padding: "18px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon
              name={mutP > 0 ? "crossCircle" : "checkCircle"}
              size={28}
              color={mutP > 0 ? RED : sharedP1 > 0 ? GREEN : C.accent}
            />
            <span
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 22,
                color: mutP > 0 ? bad.fg : sharedP1 > 0 ? good.fg : C.ink,
              }}
            >
              {mutP > 0
                ? "error[E0502]: cannot borrow `s2` as mutable"
                : sharedP1 > 0
                  ? "borrowck: multiple immutable borrows (&s2) allowed"
                  : moveP > 0.3
                    ? "borrowck: ownership moved s1 → s2 (s1 invalidated)"
                    : "borrowck: single owner `s1` holds heap allocation"}
            </span>
          </div>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 17,
              padding: "4px 12px",
              borderRadius: 8,
              background: C.white,
              color: mutP > 0 ? bad.fg : C.mute,
              border: `1px solid ${C.line}`,
            }}
          >
            {mutP > 0 ? "compile time" : "zero runtime cost"}
          </span>
        </div>

        <div style={{ fontFamily: mono, fontSize: 19, color: C.ink, lineHeight: 1.4 }}>
          {mutP > 0
            ? "├── immutable borrow occurs at `let r1 = &s2;` and remains active"
            : sharedP1 > 0
              ? "├── `r1` and `r2` can read `\"snacks\"` simultaneously without data races"
              : moveP > 0.3
                ? "├── using `s1` after move is rejected with `error[E0382]: borrow of moved value`"
                : "├── memory is automatically freed when the active owner goes out of scope"}
        </div>
      </div>
    </DevCard>
  );
};
