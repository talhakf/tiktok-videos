import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX, TW } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER, DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type EventLoopStep = {
  at: number;
  stack: string[];
  micro: string[];
  macro: string[];
  logs: string[];
  note?: string;
};

type Zone = "stack" | "micro" | "macro";

type ChipPlacement = {
  id: string;
  label: string;
  zone: Zone;
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

const PAD = 28;
const STACK_X = PAD;
const STACK_Y = 24;
const STACK_W = 356;
const STACK_H = 408;

const RIGHT_X = STACK_X + STACK_W + 84;
const RIGHT_W = TW - RIGHT_X - PAD;
const QUEUE_H = 192;
const MICRO_Y = STACK_Y;
const MACRO_Y = STACK_Y + QUEUE_H + 24;

const CONSOLE_Y = STACK_Y + STACK_H + 24;
const CONSOLE_H = 136;

const chipCoords = (zone: Zone, index: number, total: number): { x: number; y: number; w: number; h: number } => {
  if (zone === "stack") {
    const h = 58;
    const gap = 10;
    const x = STACK_X + 20;
    const w = STACK_W - 40;
    // Stack grows upwards from the bottom of the call stack box
    const y = STACK_Y + STACK_H - 22 - (index + 1) * h - index * gap;
    return { x, y, w, h };
  }
  const boxY = zone === "micro" ? MICRO_Y : MACRO_Y;
  const h = 54;
  const gap = 12;
  const availW = RIGHT_W - 36;
  const count = Math.max(1, total);
  const w = Math.min(200, Math.floor((availW - gap * (count - 1)) / count));
  const x = RIGHT_X + 18 + index * (w + gap);
  const y = boxY + 98;
  return { x, y, w, h };
};

const buildPlacements = (step: EventLoopStep): ChipPlacement[] => {
  const out: ChipPlacement[] = [];
  const seen = new Map<string, number>();
  const pushZone = (items: string[], zone: Zone) => {
    items.forEach((label, idx) => {
      const n = (seen.get(label) ?? 0) + 1;
      seen.set(label, n);
      const id = `${label}#${n}`;
      const pos = chipCoords(zone, idx, items.length);
      out.push({ id, label, zone, index: idx, ...pos });
    });
  };
  pushZone(step.stack, "stack");
  pushZone(step.micro, "micro");
  pushZone(step.macro, "macro");
  return out;
};

const zoneAppearance = (zone: Zone, isTopStack: boolean) => {
  if (zone === "stack") {
    return isTopStack
      ? { bg: BLUE_TINT, border: C.accent, fg: C.accent, badge: "running" }
      : { bg: "#F2F2F4", border: "rgba(0,0,0,0.14)", fg: C.ink, badge: "frame" };
  }
  if (zone === "micro") {
    return { bg: tint(GREEN, 0.14), border: GREEN, fg: "#1E7E34", badge: "micro" };
  }
  return { bg: tint(AMBER, 0.16), border: AMBER, fg: "#A05A00", badge: "task" };
};

/**
 * JavaScript Event Loop diagram: 3 boxes (`Call stack`, `Microtask queue (Promises)`, `Task queue (setTimeout)`)
 * + `Console output` strip. Animates chips moving between queues and stack across `steps`.
 */
export const EventLoop: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  steps: EventLoopStep[];
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x = TX, y, w = TW, h, at, until, steps, filename = "event-loop.js", right = "JS runtime", style }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const sorted = [...steps].sort((a, b) => a.at - b.at);
  let curIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (frame >= sorted[i].at) curIdx = i;
  }
  const curStep = sorted[curIdx] ?? { at, stack: [], micro: [], macro: [], logs: [] };
  const prevStep = curIdx > 0 ? sorted[curIdx - 1] : null;
  const glide = prevStep ? prog(frame, curStep.at, 14, easeInOut) : 1;

  const curChips = buildPlacements(curStep);
  const prevChips = prevStep ? buildPlacements(prevStep) : [];
  const prevById = new Map(prevChips.map((c) => [c.id, c]));
  const curById = new Map(curChips.map((c) => [c.id, c]));

  const cardH = h ?? (filename !== undefined ? TAB_H : 0) + CONSOLE_Y + CONSOLE_H + PAD;
  const loopSpin = curIdx * 180 * glide + (curIdx > 0 ? (curIdx - 1) * 180 * (1 - glide) : 0);

  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} filename={filename} icon="bolt" right={right} style={style}>
      {/* 1. Call stack box */}
      <div
        style={{
          position: "absolute",
          left: STACK_X,
          top: STACK_Y,
          width: STACK_W,
          height: STACK_H,
          borderRadius: 22,
          background: "#FAFAFC",
          border: `2px solid ${curStep.stack.length > 0 ? C.accent : C.line}`,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em", color: C.ink }}>
            Call stack
          </div>
          <div
            style={{
              padding: "4px 12px",
              borderRadius: 10,
              background: curStep.stack.length ? BLUE_TINT : "#ECECEF",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 17,
              color: curStep.stack.length ? C.accent : C.mute,
            }}
          >
            LIFO · sync
          </div>
        </div>
        {curStep.stack.length === 0 && glide >= 1 ? (
          <div
            style={{
              marginBottom: 140,
              textAlign: "center",
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 20,
              color: C.mute,
            }}
          >
            stack empty (idle)
          </div>
        ) : null}
      </div>

      {/* Event loop centre badge between stack and queues */}
      <div
        style={{
          position: "absolute",
          left: STACK_X + STACK_W + 14,
          top: STACK_Y + STACK_H / 2 - 28,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: C.white,
          border: `2px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${loopSpin}deg)`,
        }}
      >
        <Icon name="refresh" size={28} color={C.accent} weight={2.2} />
      </div>

      {/* 2. Microtask queue box */}
      <div
        style={{
          position: "absolute",
          left: RIGHT_X,
          top: MICRO_Y,
          width: RIGHT_W,
          height: QUEUE_H,
          borderRadius: 22,
          background: "#FAFAFC",
          border: `2px solid ${curStep.micro.length > 0 && curStep.stack.length === 0 ? GREEN : C.line}`,
          padding: "18px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 23, letterSpacing: "-0.02em", color: C.ink }}>
            Microtask queue (Promises)
          </div>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 10,
              background: tint(GREEN, 0.14),
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              color: "#1E7E34",
            }}
          >
            priority 1
          </div>
        </div>
        <div style={{ marginTop: 4, fontFamily: mono, fontSize: 17, color: C.mute }}>
          Promise.then · queueMicrotask · await
        </div>
      </div>

      {/* 3. Task queue (setTimeout) box */}
      <div
        style={{
          position: "absolute",
          left: RIGHT_X,
          top: MACRO_Y,
          width: RIGHT_W,
          height: QUEUE_H,
          borderRadius: 22,
          background: "#FAFAFC",
          border: `2px solid ${
            curStep.macro.length > 0 && curStep.micro.length === 0 && curStep.stack.length === 0 ? AMBER : C.line
          }`,
          padding: "18px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 23, letterSpacing: "-0.02em", color: C.ink }}>
            Task queue (setTimeout)
          </div>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 10,
              background: tint(AMBER, 0.16),
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              color: "#A05A00",
            }}
          >
            priority 2
          </div>
        </div>
        <div style={{ marginTop: 4, fontFamily: mono, fontSize: 17, color: C.mute }}>
          setTimeout · setInterval · DOM events
        </div>
      </div>

      {/* Exiting chips from previous step */}
      {prevChips
        .filter((pc) => !curById.has(pc.id))
        .map((pc) => {
          const outP = 1 - glide;
          if (outP <= 0.01) return null;
          const look = zoneAppearance(pc.zone, pc.zone === "stack" && pc.index === prevStep!.stack.length - 1);
          return (
            <div
              key={`out-${pc.id}`}
              style={{
                position: "absolute",
                left: pc.x,
                top: pc.y,
                width: pc.w,
                height: pc.h,
                borderRadius: 14,
                background: look.bg,
                border: `2px solid ${look.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 14px",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 21,
                color: look.fg,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                ...materialize(outP),
              }}
            >
              {pc.label}
            </div>
          );
        })}

      {/* Current & gliding chips */}
      {curChips.map((cc) => {
        const pc = prevById.get(cc.id);
        const cx = pc ? lerp(pc.x, cc.x, glide) : cc.x;
        const cy = pc ? lerp(pc.y, cc.y, glide) : cc.y;
        const cw = pc ? lerp(pc.w, cc.w, glide) : cc.w;
        const ch = pc ? lerp(pc.h, cc.h, glide) : cc.h;
        const enterP = pc ? 1 : glide;
        const isTop = cc.zone === "stack" && cc.index === curStep.stack.length - 1;
        const look = zoneAppearance(cc.zone, isTop);

        return (
          <div
            key={cc.id}
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              width: cw,
              height: ch,
              borderRadius: 14,
              background: look.bg,
              border: `2.5px solid ${look.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 21,
              color: look.fg,
              whiteSpace: "nowrap",
              overflow: "hidden",
              boxShadow: pc && pc.zone !== cc.zone && glide < 1 ? "0 12px 24px rgba(0,0,0,0.12)" : undefined,
              ...materialize(enterP),
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{cc.label}</span>
            {cc.zone === "stack" && isTop ? (
              <span
                style={{
                  fontSize: 15,
                  padding: "2px 8px",
                  borderRadius: 8,
                  background: C.accent,
                  color: C.white,
                  marginLeft: 8,
                }}
              >
                exec
              </span>
            ) : null}
          </div>
        );
      })}

      {/* 4. Console output strip */}
      <div
        style={{
          position: "absolute",
          left: PAD,
          top: CONSOLE_Y,
          width: w - PAD * 2,
          height: CONSOLE_H,
          borderRadius: 20,
          background: TERM.bg,
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="terminal" size={24} color={TERM.dim} weight={2} />
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: TERM.dim }}>Console output</span>
          </div>
          {curStep.note ? (
            <div
              style={{
                padding: "4px 14px",
                borderRadius: 10,
                background: "rgba(100,168,255,0.16)",
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 19,
                color: TERM.blue,
              }}
            >
              {curStep.note}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, overflow: "hidden" }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 24, color: TERM.green }}>{">"}</span>
          {curStep.logs.length === 0 ? (
            <span style={{ fontFamily: mono, fontSize: 21, color: TERM.dim }}>waiting for synchronous stack...</span>
          ) : (
            curStep.logs.map((log, i) => {
              const existedBefore = prevStep ? i < prevStep.logs.length : false;
              const logP = existedBefore ? 1 : glide;
              return (
                <div
                  key={`${i}-${log}`}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 10,
                    background: "#2B2B2E",
                    border: `1.5px solid ${existedBefore ? "rgba(255,255,255,0.12)" : TERM.green}`,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 22,
                    color: TERM.fg,
                    whiteSpace: "nowrap",
                    ...materialize(logP),
                  }}
                >
                  {log}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DevCard>
  );
};
