import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type StackQueueOp = {
  at: number;
  kind: "push" | "pop";
  label: string;
};

type SimItem = {
  id: number;
  label: string;
  pushAt: number;
  popAt?: number;
  initial?: boolean;
};

const buildTimeline = (mode: "stack" | "queue", ops: StackQueueOp[], initialItems: string[], startAt: number): SimItem[] => {
  const all: SimItem[] = [];
  const active: SimItem[] = [];
  let nextId = 0;

  initialItems.forEach((label) => {
    const it: SimItem = { id: nextId++, label, pushAt: startAt, initial: true };
    all.push(it);
    active.push(it);
  });

  const sortedOps = [...ops].sort((a, b) => a.at - b.at);
  sortedOps.forEach((op) => {
    if (op.kind === "push") {
      const it: SimItem = { id: nextId++, label: op.label, pushAt: op.at };
      all.push(it);
      active.push(it);
    } else {
      const victim = mode === "stack" ? active.pop() : active.shift();
      if (victim) {
        victim.popAt = op.at;
      }
    }
  });

  return all;
};

/**
 * Animated `Stack (LIFO)` or `Queue (FIFO)` container:
 * Smoothly pushes/enqueues items in and pops/dequeues items out with
 * live `top` / `head` / `tail` pointer badges and an operation trace.
 */
export const StackQueue: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  mode: "stack" | "queue";
  ops: StackQueueOp[];
  initialItems?: string[];
  title?: string;
}> = ({
  x = TX,
  y,
  w = TW,
  h = 540,
  at,
  until,
  mode,
  ops,
  initialItems = [],
  title,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const isStack = mode === "stack";
  const headerTitle = title ?? (isStack ? "stack · LIFO (last in, first out)" : "queue · FIFO (first in, first out)");
  const headerH = 72;

  const items = buildTimeline(mode, ops, initialItems, at);
  const sortedOps = [...ops].sort((a, b) => a.at - b.at);

  let latestOpIdx = -1;
  for (let i = 0; i < sortedOps.length; i++) {
    if (sortedOps[i].at <= frame) latestOpIdx = i;
  }
  const latestOp = latestOpIdx >= 0 ? sortedOps[latestOpIdx] : null;
  const isPopStep = latestOp?.kind === "pop";

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
      {/* Header strip */}
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
              background: isPopStep ? tint(AMBER, 0.16) : BLUE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="layers" size={21} color={isPopStep ? "#A05A00" : C.accent} weight={2.2} />
          </div>
          <span style={{ fontFamily: mono, fontSize: 23, fontWeight: 600, color: C.ink }}>{headerTitle}</span>
        </div>

        {/* Active operation badge */}
        {latestOp ? (
          <div
            style={{
              padding: "7px 16px",
              borderRadius: 999,
              background: isPopStep ? tint(AMBER, 0.15) : "#EEFAF1",
              border: `1.5px solid ${isPopStep ? AMBER : GREEN}`,
              fontFamily: mono,
              fontSize: 19,
              fontWeight: 700,
              color: isPopStep ? "#A05A00" : "#248A3D",
              ...materialize(prog(frame, latestOp.at, 8, easeOut)),
            }}
          >
            {isStack
              ? latestOp.kind === "push"
                ? `push("${latestOp.label}")`
                : `pop() → "${latestOp.label}"`
              : latestOp.kind === "push"
                ? `enqueue("${latestOp.label}")`
                : `dequeue() → "${latestOp.label}"`}
          </div>
        ) : null}
      </div>

      {isStack ? (
        <StackBody frame={frame} at={at} w={w} h={h} headerH={headerH} items={items} ops={sortedOps} />
      ) : (
        <QueueBody frame={frame} at={at} w={w} h={h} headerH={headerH} items={items} ops={sortedOps} />
      )}
    </div>
  );
};

const StackBody: React.FC<{
  frame: number;
  at: number;
  w: number;
  h: number;
  headerH: number;
  items: SimItem[];
  ops: StackQueueOp[];
}> = ({ frame, at, w, h, headerH, items, ops }) => {
  const wellX = 64;
  const wellW = 330;
  const wellTop = headerH + 62;
  const wellBottom = h - 34;
  const wellH = wellBottom - wellTop;
  const itemH = 66;
  const gap = 10;
  const padX = 18;

  const slotY = (slot: number) => wellBottom - 16 - (slot + 1) * itemH - slot * gap;

  // Compute continuous stack height for the `top` pointer badge
  const liveCount = items.reduce((acc, it) => {
    if (frame < it.pushAt) return acc;
    const inP = it.initial ? 1 : prog(frame, it.pushAt, 12, easeInOut);
    const outP = it.popAt !== undefined && frame >= it.popAt ? prog(frame, it.popAt, 12, easeInOut) : 0;
    return acc + Math.max(0, inP - outP);
  }, 0);

  const topSlotFloat = Math.max(0, liveCount - 1);
  const topBadgeY = slotY(topSlotFloat) + itemH / 2;

  return (
    <>
      {/* Left: U-shaped Stack Well */}
      <div
        style={{
          position: "absolute",
          left: wellX,
          top: wellTop,
          width: wellW,
          height: wellH,
          borderLeft: `4px solid rgba(0,0,0,0.16)`,
          borderRight: `4px solid rgba(0,0,0,0.16)`,
          borderBottom: `4px solid rgba(0,0,0,0.16)`,
          borderRadius: "0 0 24px 24px",
          background: "#F7F7FA",
        }}
      />

      {/* Push/Pop entry arrow hint above well */}
      <div
        style={{
          position: "absolute",
          left: wellX,
          top: headerH + 18,
          width: wellW,
          textAlign: "center",
          fontFamily: mono,
          fontSize: 18,
          fontWeight: 600,
          color: C.mute,
        }}
      >
        ↓ push · ↑ pop (LIFO)
      </div>

      {/* Stack items */}
      {items.map((it, idx) => {
        if (frame < it.pushAt) return null;
        const inP = it.initial ? prog(frame, at + 4 + idx * 2, 10, easeOut) : prog(frame, it.pushAt, 13, easeOut);
        const outP = it.popAt !== undefined && frame >= it.popAt ? prog(frame, it.popAt, 13, easeOut) : 0;
        if (outP >= 1) return null;

        // Slot index is count of earlier items still in stack at this frame
        const slot = items.slice(0, idx).filter((prev) => frame >= prev.pushAt && (prev.popAt === undefined || frame < prev.popAt)).length;
        const targetY = slotY(slot);
        const startY = wellTop - 52;
        const curY = lerp(startY, targetY, inP) - outP * 76;

        const isPopping = outP > 0;
        const isJustPushed = !it.initial && frame - it.pushAt < 22 && !isPopping;

        const bg = isPopping ? tint(AMBER, 0.18) : isJustPushed ? C.accent : BLUE_TINT;
        const border = isPopping ? AMBER : C.accent;
        const fg = isPopping ? "#A05A00" : isJustPushed ? C.white : C.accent;

        return (
          <div
            key={it.id}
            style={{
              position: "absolute",
              left: wellX + padX,
              top: curY,
              width: wellW - padX * 2,
              height: itemH,
              borderRadius: 16,
              background: bg,
              border: `2.5px solid ${border}`,
              boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              boxSizing: "border-box",
              ...materialize(inP * (1 - outP)),
            }}
          >
            <span style={{ fontFamily: mono, fontSize: 23, fontWeight: 700, color: fg }}>{it.label}</span>
            <span
              style={{
                fontFamily: mono,
                fontSize: 16,
                fontWeight: 600,
                color: isJustPushed ? "rgba(255,255,255,0.8)" : C.mute,
              }}
            >
              [{slot}]
            </span>
          </div>
        );
      })}

      {/* Gliding `← top` pointer badge */}
      {liveCount > 0.05 ? (
        <div
          style={{
            position: "absolute",
            left: wellX + wellW + 18,
            top: topBadgeY,
            translate: "0 -50%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 16px",
            borderRadius: 999,
            background: C.accent,
            fontFamily: mono,
            fontSize: 19,
            fontWeight: 700,
            color: C.white,
            boxShadow: CARD_SHADOW,
            opacity: Math.min(1, liveCount),
          }}
        >
          <span>← top</span>
        </div>
      ) : null}

      {/* Right Column: Operation Log */}
      <div
        style={{
          position: "absolute",
          left: 530,
          right: 36,
          top: wellTop,
          bottom: 34,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 600, color: C.mute, marginBottom: 4 }}>
          operations
        </div>
        {ops.map((op, i) => {
          const started = frame >= op.at;
          const p = started ? prog(frame, op.at, 9, easeOut) : 1;
          const isPop = op.kind === "pop";
          return (
            <div
              key={i}
              style={{
                height: 56,
                borderRadius: 14,
                padding: "0 18px",
                background: !started ? "#F5F5F7" : isPop ? tint(AMBER, 0.14) : "#EEFAF1",
                border: `1.5px solid ${!started ? C.line : isPop ? AMBER : GREEN}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: mono,
                fontSize: 19,
                fontWeight: 700,
                color: !started ? C.mute : isPop ? "#A05A00" : "#248A3D",
                opacity: started ? p : 0.45,
              }}
            >
              <span>{isPop ? `pop()` : `push("${op.label}")`}</span>
              <span style={{ fontSize: 16 }}>{isPop ? `→ "${op.label}"` : "O(1)"}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

const QueueBody: React.FC<{
  frame: number;
  at: number;
  w: number;
  h: number;
  headerH: number;
  items: SimItem[];
  ops: StackQueueOp[];
}> = ({ frame, at, w, h, headerH, items, ops }) => {
  const trackX = 64;
  const trackW = w - 128;
  const trackY = headerH + 112;
  const trackH = 126;
  const pad = 16;
  const itemW = 162;
  const gap = 14;

  const slotX = (slot: number) => trackX + 24 + slot * (itemW + gap);

  // Compute live count for tail pointer badge
  const liveCount = items.reduce((acc, it) => {
    if (frame < it.pushAt) return acc;
    const inP = it.initial ? 1 : prog(frame, it.pushAt, 12, easeInOut);
    const outP = it.popAt !== undefined && frame >= it.popAt ? prog(frame, it.popAt, 12, easeInOut) : 0;
    return acc + Math.max(0, inP - outP);
  }, 0);

  const headCenterX = slotX(0) + itemW / 2;
  const tailSlotFloat = Math.max(0, liveCount - 1);
  const tailCenterX = slotX(tailSlotFloat) + itemW / 2;

  return (
    <>
      {/* Direction labels */}
      <div
        style={{
          position: "absolute",
          left: trackX,
          top: trackY - 46,
          fontFamily: mono,
          fontSize: 18,
          fontWeight: 600,
          color: C.mute,
        }}
      >
        ← dequeue (front)
      </div>
      <div
        style={{
          position: "absolute",
          right: w - (trackX + trackW),
          top: trackY - 46,
          fontFamily: mono,
          fontSize: 18,
          fontWeight: 600,
          color: C.mute,
        }}
      >
        enqueue (back) ←
      </div>

      {/* Horizontal open-ended Queue Channel */}
      <div
        style={{
          position: "absolute",
          left: trackX,
          top: trackY,
          width: trackW,
          height: trackH,
          borderTop: `4px solid rgba(0,0,0,0.15)`,
          borderBottom: `4px solid rgba(0,0,0,0.15)`,
          background: "#F7F7FA",
        }}
      />

      {/* Queue Items */}
      {items.map((it, idx) => {
        if (frame < it.pushAt) return null;
        const inP = it.initial ? prog(frame, at + 4 + idx * 2, 10, easeOut) : prog(frame, it.pushAt, 14, easeOut);
        const outP = it.popAt !== undefined && frame >= it.popAt ? prog(frame, it.popAt, 14, easeOut) : 0;
        if (outP >= 1) return null;

        // Smooth slot index based on how many earlier items are still in the queue
        const ahead = items.slice(0, idx).reduce((acc, prev) => {
          if (frame < prev.pushAt) return acc;
          const prevOut = prev.popAt !== undefined && frame >= prev.popAt ? prog(frame, prev.popAt, 14, easeInOut) : 0;
          return acc + (1 - prevOut);
        }, 0);

        const targetX = slotX(ahead);
        const enterStartX = trackX + trackW + 30;
        const curX = (it.initial ? targetX : lerp(enterStartX, targetX, inP)) - outP * 170;

        const isPopping = outP > 0;
        const isJustPushed = !it.initial && frame - it.pushAt < 22 && !isPopping;

        const bg = isPopping ? tint(AMBER, 0.18) : isJustPushed ? C.accent : BLUE_TINT;
        const border = isPopping ? AMBER : C.accent;
        const fg = isPopping ? "#A05A00" : isJustPushed ? C.white : C.accent;

        return (
          <div
            key={it.id}
            style={{
              position: "absolute",
              left: curX,
              top: trackY + pad,
              width: itemW,
              height: trackH - pad * 2,
              borderRadius: 18,
              background: bg,
              border: `2.5px solid ${border}`,
              boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: mono,
              fontSize: 23,
              fontWeight: 700,
              color: fg,
              ...materialize(inP * (1 - outP)),
            }}
          >
            {it.label}
          </div>
        );
      })}

      {/* `head` and `tail` pointer badges below the track */}
      {liveCount > 0.05 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: headCenterX,
              top: trackY + trackH + 14,
              translate: "-50% 0",
              padding: "5px 14px",
              borderRadius: 999,
              background: "#EEFAF1",
              border: `2px solid ${GREEN}`,
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 700,
              color: "#248A3D",
              whiteSpace: "nowrap",
            }}
          >
            ↑ head
          </div>
          <div
            style={{
              position: "absolute",
              left: Math.max(headCenterX + 115, tailCenterX),
              top: trackY + trackH + 14,
              translate: "-50% 0",
              padding: "5px 14px",
              borderRadius: 999,
              background: BLUE_TINT,
              border: `2px solid ${C.accent}`,
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 700,
              color: C.accent,
              whiteSpace: "nowrap",
            }}
          >
            ↑ tail
          </div>
        </>
      ) : null}

      {/* Bottom operation pills */}
      <div
        style={{
          position: "absolute",
          left: trackX,
          right: w - (trackX + trackW),
          bottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "nowrap",
          overflow: "hidden",
        }}
      >
        {ops.map((op, i) => {
          const started = frame >= op.at;
          const isPop = op.kind === "pop";
          return (
            <div
              key={i}
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                background: !started ? "#F5F5F7" : isPop ? tint(AMBER, 0.14) : "#EEFAF1",
                border: `1.5px solid ${!started ? C.line : isPop ? AMBER : GREEN}`,
                fontFamily: mono,
                fontSize: 18,
                fontWeight: 700,
                color: !started ? C.mute : isPop ? "#A05A00" : "#248A3D",
                opacity: started ? 1 : 0.45,
                whiteSpace: "nowrap",
              }}
            >
              {isPop ? `dequeue() → ${op.label}` : `enqueue(${op.label})`}
            </div>
          );
        })}
      </div>
    </>
  );
};
