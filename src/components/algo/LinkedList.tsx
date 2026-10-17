import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type LinkedListHighlight = {
  index: number;
  at: number;
  label?: string;
};

export type LinkedListInsert = {
  afterIndex: number;
  label: string;
  at: number;
};

/**
 * Pointer-based singly linked list visualizer:
 * Renders `[value | next •] ──►` nodes ending at `NULL`, supports gliding pointer badges
 * (`slow` / `fast` / `curr`) via `highlight`, and animates `insert` pointer rewiring cleanly.
 */
export const LinkedList: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  values?: (string | number)[];
  nodes?: (string | number)[];
  highlight?: LinkedListHighlight[];
  insert?: LinkedListInsert;
  title?: string;
}> = ({
  x = TX,
  y,
  w = TW,
  h = 520,
  at,
  until,
  values,
  nodes,
  highlight = [],
  insert,
  title = "linked list · nodes & next pointers",
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const baseItems = (values ?? nodes ?? ["10", "20", "30", "40"]).map(String);
  const baseCount = baseItems.length;

  // Insertion animation phases
  const hasInsert = insert !== undefined;
  const insAt = insert?.at ?? Infinity;
  const appearP = hasInsert && frame >= insAt ? prog(frame, insAt, 10, easeOut) : 0;
  const shiftP = hasInsert && frame >= insAt + 2 ? prog(frame, insAt + 2, 16, easeInOut) : 0;
  const wireNextP = hasInsert && frame >= insAt + 8 ? prog(frame, insAt + 8, 11, easeInOut) : 0;
  const rewirePrevP = hasInsert && frame >= insAt + 18 ? prog(frame, insAt + 18, 12, easeInOut) : 0;
  const settleP = hasInsert && frame >= insAt + 32 ? prog(frame, insAt + 32, 14, easeInOut) : 0;

  // Horizontal layout: dynamically fits baseCount + (shiftP for inserted node) + NULL pill
  const headerH = 72;
  const totalSlots = baseCount + shiftP;
  const nodeW = baseCount >= 4 && hasInsert ? 132 : 146;
  const nodeH = 76;
  const nullW = 92;
  const nullH = 58;
  const ptrCompartmentW = 44;

  const padX = 36;
  const availW = w - padX * 2 - nullW;
  const stepX = availW / Math.max(1, totalSlots);

  const rowCenterY = hasInsert ? headerH + (h - headerH) * 0.42 : headerH + (h - headerH) * 0.52;

  const getBaseNodeLeft = (idx: number) => {
    const slot = hasInsert && idx > insert!.afterIndex ? idx + shiftP : idx;
    return padX + slot * stepX;
  };

  const nullLeft = padX + totalSlots * stepX;
  const nullCenterY = rowCenterY;

  // Inserted node coordinates
  const insSlot = insert ? insert.afterIndex + 0.5 + 0.5 * shiftP : 0;
  const insLeft = padX + insSlot * stepX;
  const insCenterY = lerp(rowCenterY + 132, rowCenterY, settleP);

  // Group highlight cues by label so named pointers ("slow", "fast") glide independently
  const trackMap = new Map<string, LinkedListHighlight[]>();
  highlight.forEach((c) => {
    const key = c.label ?? "__ptr__";
    if (!trackMap.has(key)) trackMap.set(key, []);
    trackMap.get(key)!.push(c);
  });

  const activeTracks: {
    key: string;
    label: string;
    curIdx: number;
    x: number;
    p: number;
    trackNum: number;
  }[] = [];

  let tNum = 0;
  trackMap.forEach((cues, key) => {
    const sorted = [...cues].sort((a, b) => a.at - b.at);
    let idx = -1;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].at <= frame) idx = i;
    }
    if (idx >= 0) {
      const cur = sorted[idx];
      const prev = idx > 0 ? sorted[idx - 1] : null;
      const glide = prev ? prog(frame, cur.at, 12, easeInOut) : 1;
      const fromX = prev ? getBaseNodeLeft(Math.min(baseCount - 1, prev.index)) + nodeW / 2 : getBaseNodeLeft(Math.min(baseCount - 1, cur.index)) + nodeW / 2;
      const toX = getBaseNodeLeft(Math.min(baseCount - 1, cur.index)) + nodeW / 2;
      activeTracks.push({
        key,
        label: cur.label ?? "curr",
        curIdx: cur.index,
        x: lerp(fromX, toX, glide),
        p: prog(frame, sorted[0].at, 8, easeOut),
        trackNum: tNum++,
      });
    }
  });

  // Status note in header
  const statusText =
    hasInsert && frame >= insAt
      ? settleP >= 0.95
        ? `inserted "${insert!.label}" in O(1)`
        : rewirePrevP > 0
          ? `2. prev.next = new`
          : wireNextP > 0
            ? `1. new.next = next`
            : `alloc node("${insert!.label}")`
      : activeTracks.length > 0
        ? activeTracks.map((t) => `${t.label} → [${t.curIdx}]`).join(" · ")
        : `${baseCount} nodes → NULL`;

  // Helper to draw an arrow with arrowhead between (x1, y1) and (x2, y2)
  const renderArrow = (
    key: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    drawP: number,
    opacity = 1,
    dashed = false,
  ) => {
    if (drawP <= 0 || opacity <= 0) return null;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const isStraight = Math.abs(dy) < 2;
    const d = isStraight
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} C ${x1 + dx * 0.45} ${y1}, ${x2 - dx * 0.45} ${y2}, ${x2} ${y2}`;

    const ang = isStraight ? 0 : (Math.atan2(dy, dx * 0.55) * 180) / Math.PI;
    const tipX = lerp(x1, x2, drawP);
    const tipY = lerp(y1, y2, drawP);

    return (
      <g key={key} opacity={opacity}>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={dashed ? "6 6" : 1}
          pathLength={dashed ? undefined : 1}
          strokeDashoffset={dashed ? undefined : 1 - drawP}
        />
        {drawP > 0.2 ? (
          <g transform={`translate(${ isStraight ? tipX : x2 } ${ isStraight ? tipY : y2 }) rotate(${ang})`} opacity={Math.min(1, (drawP - 0.2) / 0.8)}>
            <path d="M 0 0 L -11 -6 L -11 6 Z" fill={color} />
          </g>
        ) : null}
      </g>
    );
  };

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
              background: hasInsert && frame >= insAt ? "#EEFAF1" : BLUE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="link"
              size={21}
              color={hasInsert && frame >= insAt ? "#248A3D" : C.accent}
              weight={2.2}
            />
          </div>
          <span style={{ fontFamily: mono, fontSize: 23, fontWeight: 600, color: C.ink }}>{title}</span>
        </div>

        <div
          style={{
            padding: "7px 16px",
            borderRadius: 999,
            background: hasInsert && frame >= insAt ? "#EEFAF1" : BLUE_TINT,
            border: `1.5px solid ${hasInsert && frame >= insAt ? GREEN : C.accent}`,
            fontFamily: mono,
            fontSize: 19,
            fontWeight: 700,
            color: hasInsert && frame >= insAt ? "#248A3D" : C.accent,
          }}
        >
          {statusText}
        </div>
      </div>

      {/* SVG Pointer Arrows */}
      <svg
        width={w}
        height={h}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {baseItems.map((_, idx) => {
          const srcX = getBaseNodeLeft(idx) + nodeW - ptrCompartmentW / 2;
          const srcY = rowCenterY;
          const nextLeft = idx < baseCount - 1 ? getBaseNodeLeft(idx + 1) : nullLeft;
          const dstY = rowCenterY;

          const baseDraw = prog(frame, at + 6 + idx * 3, 10, easeInOut);
          const isSplitEdge = hasInsert && idx === insert!.afterIndex;

          if (!isSplitEdge) {
            return renderArrow(`ptr-${idx}`, srcX, srcY, nextLeft - 4, dstY, WIRE, baseDraw);
          }

          // Split edge where insertion rewires pointers
          const oldOpacity = 1 - rewirePrevP;
          const insSrcX = insLeft + nodeW - ptrCompartmentW / 2;
          const insSrcY = insCenterY;

          return (
            <g key={`split-${idx}`}>
              {/* Original arrow fades out as prev.next rewires */}
              {renderArrow(
                `old-${idx}`,
                srcX,
                srcY,
                nextLeft - 4,
                dstY,
                rewirePrevP > 0 ? RED : WIRE,
                baseDraw,
                oldOpacity,
                rewirePrevP > 0,
              )}

              {/* Step 1: new.next -> successor */}
              {renderArrow(
                `ins-next`,
                insSrcX,
                insSrcY,
                nextLeft - 4,
                dstY,
                GREEN,
                wireNextP,
              )}

              {/* Step 2: prev.next -> new */}
              {renderArrow(
                `ins-prev`,
                srcX,
                srcY,
                insLeft - 4,
                insCenterY,
                C.accent,
                rewirePrevP,
              )}
            </g>
          );
        })}
      </svg>

      {/* Base Linked List Nodes: [value | next •] */}
      {baseItems.map((val, idx) => {
        const left = getBaseNodeLeft(idx);
        const top = rowCenterY - nodeH / 2;
        const enterP = prog(frame, at + 2 + idx * 2.5, 10, easeOut);

        const matchingTracks = activeTracks.filter((t) => t.curIdx === idx);
        const isHighlighted = matchingTracks.length > 0;
        const isSecondTrack = matchingTracks.some((t) => t.trackNum > 0) && !matchingTracks.some((t) => t.trackNum === 0);

        const borderCol = isHighlighted ? (isSecondTrack ? AMBER : C.accent) : "rgba(0,0,0,0.14)";
        const valBg = isHighlighted ? (isSecondTrack ? tint(AMBER, 0.14) : BLUE_TINT) : C.white;
        const valFg = isHighlighted ? (isSecondTrack ? "#A05A00" : C.accent) : C.ink;

        return (
          <div
            key={`node-${idx}`}
            style={{
              position: "absolute",
              left,
              top,
              width: nodeW,
              height: nodeH,
              ...materialize(enterP),
            }}
          >
            {/* `head` label on index 0 when no custom track is on top */}
            {idx === 0 && activeTracks.length === 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: (nodeW - ptrCompartmentW) / 2,
                  top: -36,
                  translate: "-50% 0",
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.mute,
                }}
              >
                head ↓
              </div>
            ) : null}

            {/* Two-compartment node box */}
            <div
              style={{
                width: nodeW,
                height: nodeH,
                borderRadius: 18,
                background: C.white,
                border: `3px solid ${borderCol}`,
                boxShadow: CARD_SHADOW,
                display: "flex",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* Value cell */}
              <div
                style={{
                  flex: 1,
                  background: valBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: mono,
                  fontSize: 25,
                  fontWeight: 700,
                  color: valFg,
                }}
              >
                {val}
              </div>

              {/* Next pointer cell with origin dot */}
              <div
                style={{
                  width: ptrCompartmentW,
                  background: "#F5F5F7",
                  borderLeft: `2px solid ${C.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 6,
                    background: isHighlighted ? borderCol : C.ink,
                  }}
                />
              </div>
            </div>

            {/* Index label beneath */}
            <div
              style={{
                position: "absolute",
                left: 0,
                width: nodeW - ptrCompartmentW,
                top: nodeH + 8,
                textAlign: "center",
                fontFamily: mono,
                fontSize: 16,
                fontWeight: 600,
                color: C.mute,
                opacity: 0.65,
              }}
            >
              [{idx}]
            </div>
          </div>
        );
      })}

      {/* Newly Inserted Node `[insert.label | •]` */}
      {hasInsert && appearP > 0 ? (
        <div
          style={{
            position: "absolute",
            left: insLeft,
            top: insCenterY - nodeH / 2,
            width: nodeW,
            height: nodeH,
            ...materialize(appearP),
          }}
        >
          <div
            style={{
              position: "absolute",
              left: nodeW / 2,
              top: settleP < 0.5 ? nodeH + 10 : -36,
              translate: "-50% 0",
              padding: "3px 10px",
              borderRadius: 999,
              background: "#EEFAF1",
              border: `1.5px solid ${GREEN}`,
              fontFamily: mono,
              fontSize: 15,
              fontWeight: 700,
              color: "#248A3D",
              whiteSpace: "nowrap",
            }}
          >
            new node
          </div>
          <div
            style={{
              width: nodeW,
              height: nodeH,
              borderRadius: 18,
              background: C.white,
              border: `3px solid ${GREEN}`,
              boxShadow: CARD_SHADOW,
              display: "flex",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#EEFAF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontSize: 25,
                fontWeight: 700,
                color: "#248A3D",
              }}
            >
              {insert!.label}
            </div>
            <div
              style={{
                width: ptrCompartmentW,
                background: "#E3F6E8",
                borderLeft: `2px solid ${GREEN}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 11, height: 11, borderRadius: 6, background: "#248A3D" }} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Terminal NULL Box */}
      <div
        style={{
          position: "absolute",
          left: nullLeft,
          top: nullCenterY - nullH / 2,
          width: nullW,
          height: nullH,
          borderRadius: 14,
          background: "#F2F2F7",
          border: `2px dashed rgba(0,0,0,0.22)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: mono,
          fontSize: 20,
          fontWeight: 700,
          color: C.mute,
          ...materialize(prog(frame, at + 8 + baseCount * 2, 10, easeOut)),
        }}
      >
        NULL
      </div>

      {/* Gliding Highlight Pointer Badges (`slow`, `fast`, `curr`) */}
      {activeTracks.map((t) => {
        const isTop = t.trackNum % 2 === 0;
        const badgeY = isTop ? rowCenterY - nodeH / 2 - 48 : rowCenterY + nodeH / 2 + 34;
        const bg = isTop ? BLUE_TINT : tint(AMBER, 0.16);
        const border = isTop ? C.accent : AMBER;
        const fg = isTop ? C.accent : "#A05A00";

        return (
          <div
            key={t.key}
            style={{
              position: "absolute",
              left: t.x - ptrCompartmentW / 2,
              top: badgeY,
              translate: "-50% 0",
              padding: "5px 14px",
              borderRadius: 999,
              background: bg,
              border: `2px solid ${border}`,
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 700,
              color: fg,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
              ...materialize(t.p),
            }}
          >
            {isTop ? `${t.label} ↓` : `↑ ${t.label}`}
          </div>
        );
      })}
    </div>
  );
};
