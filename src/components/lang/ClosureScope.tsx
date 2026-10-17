import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { tint } from "../windows/MacWindow";

export type ClosureScopeProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  returnAt?: number;
  call1At?: number;
  call2At?: number;
  filename?: string;
  right?: string;
  style?: React.CSSProperties;
};

/**
 * Lexical Closure & Heap Environment backpack card:
 * - Shows outer function `createCounter()` popping off the call stack at `returnAt`.
 * - While the returned inner function `inc()` keeps a live reference link (`[[Environment]]`)
 *   to `Closure { count: 0 → 1 → 2 }` on the heap.
 */
export const ClosureScope: React.FC<ClosureScopeProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 860,
  at,
  until,
  returnAt,
  call1At,
  call2At,
  filename = "closure.ts",
  right = "lexical environment",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tReturn = returnAt ?? at + 22;
  const tCall1 = call1At ?? at + 48;
  const tCall2 = call2At ?? at + 72;

  const popP = prog(frame, tReturn, 14, easeInOut);
  const c1P = prog(frame, tCall1, 12);
  const c2P = prog(frame, tCall2, 12);

  const countVal = c2P > 0.4 ? 2 : c1P > 0.4 ? 1 : 0;

  const accent = toneColors("accent");
  const good = toneColors("good");

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="layers" right={right} style={style}>
      {/* Top Column Headers */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 24,
          width: 384,
          height: 46,
          borderRadius: 12,
          background: "#F5F5F7",
          border: `1px solid ${C.line}`,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, color: C.ink }}>Call stack (LIFO)</span>
        <span style={{ fontFamily: mono, fontSize: 17, color: C.mute }}>
          {popP > 0.5 ? "1 frame active" : "2 frames active"}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 480,
          top: 24,
          width: 384,
          height: 46,
          borderRadius: 12,
          background: "#F5F5F7",
          border: `1px solid ${C.line}`,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, color: C.ink }}>Heap closure backpack</span>
        <span style={{ fontFamily: mono, fontSize: 17, color: C.accent }}>0x4a90 · escaped</span>
      </div>

      {/* SVG Live Reference Link from `inc` on Stack to Heap Closure Record */}
      <svg
        width={w}
        height={h - TAB_H}
        viewBox={`0 0 ${w} ${h - TAB_H}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {/* Escape arc when createCounter() returns */}
        <path
          d="M 420 175 C 450 175, 450 205, 476 205"
          fill="none"
          stroke={C.accent}
          strokeWidth={3}
          strokeDasharray="6 6"
          opacity={1 - popP * 0.65}
        />

        {/* Persistent [[Environment]] link from global `inc` to Heap Closure */}
        <path
          d="M 420 390 C 454 390, 446 250, 474 250"
          fill="none"
          stroke={c1P > 0 ? GREEN : C.accent}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <polygon
          points={`478,250 464,242 464,258`}
          fill={c1P > 0 ? GREEN : C.accent}
        />
      </svg>

      {/* Left Top: Outer Function `createCounter()` Frame (Pops at returnAt) */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 92,
          width: 384,
          height: 186,
          borderRadius: 20,
          background: popP > 0.5 ? "#F5F5F7" : BLUE_TINT,
          border: popP > 0.5 ? `2px dashed ${C.line}` : `2.5px solid ${C.accent}`,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: lerp(1, 0.48, popP),
          translate: `0px ${lerp(0, -10, popP)}px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>
            createCounter()
          </span>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 15,
              padding: "4px 10px",
              borderRadius: 999,
              background: popP > 0.5 ? "#E8E8ED" : accent.bg,
              color: popP > 0.5 ? C.mute : accent.fg,
            }}
          >
            {popP > 0.5 ? "popped off stack" : "executing"}
          </span>
        </div>

        <div
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            background: C.white,
            border: `1px solid ${C.line}`,
            fontFamily: mono,
            fontSize: 18,
            color: C.ink,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div>
            <span style={{ color: C.accent }}>let</span> count = <span style={{ color: C.accent }}>0</span>;
          </div>
          <div>
            <span style={{ color: C.accent }}>return</span> () =&gt; ++count;
          </div>
        </div>

        <div style={{ fontFamily: mono, fontSize: 16, color: C.mute }}>
          {popP > 0.5 ? "stack frame destroyed · local `count` escaped" : "allocating lexical environment..."}
        </div>
      </div>

      {/* Left Bottom: `main()` / Global Stack Frame holding `inc` */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 304,
          width: 384,
          height: 282,
          borderRadius: 20,
          background: C.white,
          border: `2.5px solid ${C.ink}`,
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>main()</span>
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 15,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#F5F5F7",
              color: C.ink,
            }}
          >
            active frame
          </span>
        </div>

        {/* Binding `inc` */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            background: BLUE_TINT,
            border: `1.5px solid ${C.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 19, color: C.ink }}>const inc</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>fn + [[Env]] →</span>
        </div>

        {/* Invocations of inc() */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              height: 48,
              borderRadius: 12,
              background: c1P > 0 ? good.bg : "#F5F5F7",
              border: `1.5px solid ${c1P > 0 ? GREEN : C.line}`,
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: mono,
              fontSize: 18,
              opacity: lerp(0.55, 1, c1P),
            }}
          >
            <span style={{ fontWeight: 700, color: C.ink }}>inc()</span>
            <span style={{ fontWeight: 700, color: c1P > 0 ? good.fg : C.mute }}>
              {c1P > 0 ? "// → 1" : "pending"}
            </span>
          </div>

          <div
            style={{
              height: 48,
              borderRadius: 12,
              background: c2P > 0 ? good.bg : "#F5F5F7",
              border: `1.5px solid ${c2P > 0 ? GREEN : C.line}`,
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: mono,
              fontSize: 18,
              opacity: lerp(0.55, 1, c2P),
            }}
          >
            <span style={{ fontWeight: 700, color: C.ink }}>inc()</span>
            <span style={{ fontWeight: 700, color: c2P > 0 ? good.fg : C.mute }}>
              {c2P > 0 ? "// → 2" : "pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Heap Closure Environment Record */}
      <div
        style={{
          position: "absolute",
          left: 480,
          top: 92,
          width: 384,
          height: 494,
          borderRadius: 22,
          background: C.white,
          border: `3px solid ${c1P > 0 ? GREEN : C.accent}`,
          boxShadow: "0 14px 32px rgba(0,0,0,0.07)",
          padding: 22,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...materialize(prog(frame, at + 6, 10)),
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="lock" size={26} color={c1P > 0 ? GREEN : C.accent} />
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>
                Closure {"{"} count {"}"}
              </span>
            </div>
            <span
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 15,
                padding: "4px 10px",
                borderRadius: 999,
                background: good.bg,
                color: good.fg,
              }}
            >
              heap alive
            </span>
          </div>

          <div style={{ fontFamily: sans, fontSize: 18, color: C.mute, marginBottom: 18 }}>
            Captured outer bindings survive after <code style={{ fontFamily: mono, color: C.ink }}>createCounter()</code> returns:
          </div>

          {/* Captured variable cell: count: 0 -> 1 -> 2 */}
          <div
            style={{
              padding: 18,
              borderRadius: 18,
              background: interpolateColors(c1P, [0, 1], [BLUE_TINT, good.bg]),
              border: `2px solid ${interpolateColors(c1P, [0, 1], [C.accent, GREEN])}`,
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 22, color: C.ink }}>
                count: <span style={{ color: c1P > 0 ? good.fg : C.accent }}>{countVal}</span>
              </span>
              <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>mutable cell</span>
            </div>

            {/* Step progression pills 0 -> 1 -> 2 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: mono, fontWeight: 700, fontSize: 19 }}>
              <div
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  background: countVal === 0 ? C.accent : C.white,
                  color: countVal === 0 ? C.white : C.mute,
                  border: `1.5px solid ${countVal === 0 ? C.accent : C.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                0
              </div>
              <span style={{ color: C.mute }}>→</span>
              <div
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  background: countVal === 1 ? GREEN : C.white,
                  color: countVal === 1 ? C.white : countVal > 1 ? good.fg : C.mute,
                  border: `1.5px solid ${countVal >= 1 ? GREEN : C.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                1
              </div>
              <span style={{ color: C.mute }}>→</span>
              <div
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  background: countVal === 2 ? GREEN : C.white,
                  color: countVal === 2 ? C.white : C.mute,
                  border: `1.5px solid ${countVal === 2 ? GREEN : C.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                2
              </div>
            </div>
          </div>

          {/* Closure Struct Layout */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: "#F5F5F7",
              border: `1px solid ${C.line}`,
              fontFamily: mono,
              fontSize: 17,
              color: C.ink,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ color: C.mute, fontSize: 15 }}>// closure object representation</div>
            <div>
              fn_ptr: <span style={{ color: C.accent }}>0x1040 (inc)</span>
            </div>
            <div>
              env_ptr: <span style={{ color: good.fg }}>0x4a90 (&amp;mut count)</span>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            background: tint(C.accent, 0.08),
            fontFamily: mono,
            fontSize: 16,
            color: C.accent,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          [[Environment]] keeps `count` reachable from GC roots
        </div>
      </div>

      {/* Bottom Summary Strip */}
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          bottom: 28,
          height: 156,
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
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: C.ink }}>
            {c2P > 0.3
              ? "Second call `inc()` mutates the same heap-allocated `count` (1 → 2)"
              : c1P > 0.3
                ? "First call `inc()` reads & increments `count` inside the closure backpack (0 → 1)"
                : popP > 0.3
                  ? "`createCounter()` popped off the stack, but `inc` holds a live pointer to `Closure { count: 0 }`"
                  : "`createCounter()` initializes `count = 0` and captures it in a lexical environment"}
          </span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 19, color: C.mute }}>
          Closure = <span style={{ color: C.ink, fontWeight: 700 }}>function code pointer</span> +{" "}
          <span style={{ color: C.accent, fontWeight: 700 }}>lexical environment pointer</span>
        </div>
      </div>
    </DevCard>
  );
};
