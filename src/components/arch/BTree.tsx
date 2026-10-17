import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, WIRE } from "../diagram/Node";

export type BTreeRoot = {
  keys: string[];
  activeAt?: number;
};

export type BTreeBranch = {
  keys: string[];
  activeAt?: number;
  parentIndex?: number;
};

export type BTreeLeaf = {
  label: string;
  rowRef: string;
  activeAt?: number;
  branchIndex: number;
};

/**
 * Animated B-Tree database index visualizer (`sql-indexes`).
 * Renders 3 levels (Root -> Internal Nodes -> Leaf + Row Pointer) with SVG connector lines.
 * As each level's `activeAt` triggers, its connector and node light up in system blue (#0071E3)
 * while unvisited siblings dim to 0.45, ending on the green/blue leaf row pointer.
 */
export const BTree: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  root: BTreeRoot;
  branches: BTreeBranch[];
  leaves: BTreeLeaf[];
  searchKey?: string;
  hopsLabel?: string;
}> = ({
  x = TX,
  y,
  w = 900,
  h = 740,
  at,
  until,
  root,
  branches,
  leaves,
  searchKey,
  hopsLabel,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const rootActP = root.activeAt !== undefined ? prog(frame, root.activeAt, 10, easeInOut) : 0;

  // Determine which branch is active so we can highlight the matching key slot in root
  const activeBranchIdx = branches.findIndex((b) => b.activeAt !== undefined);
  const activeRootSlot =
    activeBranchIdx >= 0
      ? (branches[activeBranchIdx].parentIndex ?? Math.min(activeBranchIdx, root.keys.length - 1))
      : 0;

  // Any branch currently activated?
  const anyBranchActiveP = branches.reduce(
    (max, b) => Math.max(max, b.activeAt !== undefined ? prog(frame, b.activeAt, 10, easeInOut) : 0),
    0,
  );

  // Any leaf currently activated?
  const anyLeafActiveP = leaves.reduce(
    (max, l) => Math.max(max, l.activeAt !== undefined ? prog(frame, l.activeAt, 10, easeInOut) : 0),
    0,
  );

  // Geometry inside the card
  const rootY = 175;
  const rootH = 92;
  const rootCellW = 190;
  const rootW = Math.max(260, root.keys.length * rootCellW);
  const rootX = w / 2;

  const branchY = 385;
  const branchH = 92;
  const branchCount = Math.max(1, branches.length);
  const branchSpan = w - 120;
  const branchCenterX = (i: number) =>
    branchCount === 1 ? w / 2 : 60 + ((i + 0.5) / branchCount) * branchSpan;

  const leafY = 605;
  const leafH = 124;
  const leafCount = Math.max(1, leaves.length);
  const leafSpan = w - 72;
  const leafCenterX = (i: number) =>
    leafCount === 1 ? w / 2 : 36 + ((i + 0.5) / leafCount) * leafSpan;

  const rootKeyX = (slotIdx: number) => {
    const count = Math.max(1, root.keys.length);
    const left = rootX - rootW / 2;
    return left + ((slotIdx + 0.5) / count) * rootW;
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
      {/* Top header strip */}
      <div
        style={{
          height: 76,
          padding: "0 32px",
          borderBottom: `1px solid ${C.line}`,
          background: "#FAFAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: BLUE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="search" size={22} color={C.accent} weight={2.2} />
          </div>
          <div style={{ fontFamily: mono, fontSize: 23, fontWeight: 600, color: C.ink }}>
            {searchKey ? (
              <>
                <span style={{ color: C.mute }}>WHERE key = </span>
                <span style={{ color: C.accent }}>'{searchKey}'</span>
              </>
            ) : (
              "B-tree index traversal"
            )}
          </div>
        </div>

        {hopsLabel ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 18px",
              borderRadius: 999,
              background: anyLeafActiveP > 0 ? "#EEFAF1" : BLUE_TINT,
              border: `1.5px solid ${anyLeafActiveP > 0 ? GREEN : C.accent}`,
              fontFamily: mono,
              fontSize: 21,
              fontWeight: 700,
              color: anyLeafActiveP > 0 ? "#248A3D" : C.accent,
              ...materialize(Math.max(rootActP, 0.01) > 0.05 ? prog(frame, root.activeAt ?? at + 6, 10) : 1),
            }}
          >
            <Icon name="bolt" size={20} color={anyLeafActiveP > 0 ? "#248A3D" : C.accent} weight={2.2} />
            {hopsLabel}
          </div>
        ) : null}
      </div>

      {/* Level tags on left margin */}
      {[
        { label: "root", top: rootY - 14 },
        { label: "internal", top: branchY - 14 },
        { label: "leaf + ptr", top: leafY - 14 },
      ].map((lv) => (
        <div
          key={lv.label}
          style={{
            position: "absolute",
            left: 26,
            top: lv.top,
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 600,
            color: C.mute,
            opacity: 0.65,
            letterSpacing: "-0.01em",
          }}
        >
          {lv.label}
        </div>
      ))}

      {/* SVG connector wires */}
      <svg
        width={w}
        height={h}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {/* Root -> Branches connectors */}
        {branches.map((b, bi) => {
          const pIdx = b.parentIndex ?? Math.min(bi, root.keys.length - 1);
          const x1 = rootKeyX(pIdx);
          const y1 = rootY + rootH / 2;
          const x2 = branchCenterX(bi);
          const y2 = branchY - branchH / 2;
          const midY = (y1 + y2) / 2;
          const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

          const bAct = b.activeAt !== undefined ? prog(frame, b.activeAt, 12, easeInOut) : 0;
          const isUnvisited = b.activeAt === undefined && anyBranchActiveP > 0;
          const wireOpacity = isUnvisited ? lerp(0.55, 0.25, anyBranchActiveP) : 0.65;

          return (
            <g key={`rb-${bi}`}>
              <path
                d={d}
                fill="none"
                stroke={WIRE}
                strokeWidth={2.5}
                strokeDasharray="6 6"
                opacity={wireOpacity}
              />
              {bAct > 0 ? (
                <>
                  <path
                    d={d}
                    fill="none"
                    stroke={C.accent}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - bAct}
                  />
                  <circle cx={x1} cy={y1} r={5} fill={C.accent} opacity={bAct} />
                  <circle cx={x2} cy={y2} r={6} fill={C.accent} opacity={bAct} />
                </>
              ) : null}
            </g>
          );
        })}

        {/* Branches -> Leaves connectors */}
        {leaves.map((l, li) => {
          const bi = Math.max(0, Math.min(branches.length - 1, l.branchIndex));
          const x1 = branchCenterX(bi);
          const y1 = branchY + branchH / 2;
          const x2 = leafCenterX(li);
          const y2 = leafY - leafH / 2;
          const midY = (y1 + y2) / 2;
          const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

          const lAct = l.activeAt !== undefined ? prog(frame, l.activeAt, 12, easeInOut) : 0;
          const isUnvisited = l.activeAt === undefined && anyLeafActiveP > 0;
          const wireOpacity = isUnvisited ? lerp(0.55, 0.22, anyLeafActiveP) : 0.6;

          return (
            <g key={`bl-${li}`}>
              <path
                d={d}
                fill="none"
                stroke={WIRE}
                strokeWidth={2.5}
                strokeDasharray="6 6"
                opacity={wireOpacity}
              />
              {lAct > 0 ? (
                <>
                  <path
                    d={d}
                    fill="none"
                    stroke={C.accent}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - lAct}
                  />
                  <circle cx={x1} cy={y1} r={5} fill={C.accent} opacity={lAct} />
                  <circle cx={x2} cy={y2} r={6} fill={GREEN} opacity={lAct} />
                </>
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Level 1: Root node */}
      <div
        style={{
          position: "absolute",
          left: rootX - rootW / 2,
          top: rootY - rootH / 2,
          width: rootW,
          height: rootH,
          borderRadius: 22,
          background: C.white,
          border: `3px solid ${interpolateColors(rootActP, [0, 1], ["rgba(0,0,0,0.12)", C.accent])}`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          overflow: "hidden",
          ...materialize(prog(frame, at + 2, 10)),
        }}
      >
        {root.keys.map((k, ki) => {
          const isTargetKey = ki === activeRootSlot;
          const cellP = isTargetKey ? rootActP : 0;
          return (
            <div
              key={ki}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: interpolateColors(cellP, [0, 1], [C.white, BLUE_TINT]),
                borderLeft: ki > 0 ? `1.5px solid ${C.line}` : undefined,
                opacity: !isTargetKey && rootActP > 0 ? lerp(1, 0.55, rootActP) : 1,
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 25,
                  fontWeight: 700,
                  color: interpolateColors(cellP, [0, 1], [C.ink, C.accent]),
                }}
              >
                {k}
              </div>
            </div>
          );
        })}
      </div>

      {/* Level 2: Internal Branch nodes */}
      {branches.map((b, bi) => {
        const bW = Math.min(360, Math.max(220, b.keys.length * 155));
        const cx = branchCenterX(bi);
        const bAct = b.activeAt !== undefined ? prog(frame, b.activeAt, 10, easeInOut) : 0;
        const isDimmed = b.activeAt === undefined && anyBranchActiveP > 0;
        const dimOpacity = isDimmed ? lerp(1, 0.45, anyBranchActiveP) : 1;

        // Which key inside this active branch leads to the active leaf?
        const activeLeaf = leaves.find((l) => l.activeAt !== undefined && l.branchIndex === bi);
        const activeKeyIdx = activeLeaf
          ? Math.min(b.keys.length - 1, leaves.filter((l) => l.branchIndex === bi).indexOf(activeLeaf))
          : 0;

        return (
          <div
            key={bi}
            style={{
              position: "absolute",
              left: cx - bW / 2,
              top: branchY - branchH / 2,
              width: bW,
              height: branchH,
              borderRadius: 22,
              background: C.white,
              border: `3px solid ${interpolateColors(bAct, [0, 1], ["rgba(0,0,0,0.12)", C.accent])}`,
              boxShadow: CARD_SHADOW,
              display: "flex",
              overflow: "hidden",
              ...materialize(prog(frame, at + 6 + bi * 3, 10)),
              opacity: prog(frame, at + 6 + bi * 3, 10) * dimOpacity,
            }}
          >
            {b.keys.map((k, ki) => {
              const highlightCell = bAct > 0 && (b.keys.length === 1 || ki === activeKeyIdx);
              const cellP = highlightCell ? bAct : 0;
              return (
                <div
                  key={ki}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: interpolateColors(cellP, [0, 1], [C.white, BLUE_TINT]),
                    borderLeft: ki > 0 ? `1.5px solid ${C.line}` : undefined,
                  }}
                >
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 23,
                      fontWeight: 700,
                      color: interpolateColors(cellP, [0, 1], [C.ink, C.accent]),
                    }}
                  >
                    {k}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Level 3: Leaf nodes + Row Pointers */}
      {leaves.map((l, li) => {
        const lW = Math.min(265, Math.floor((w - 90) / leafCount) - 14);
        const cx = leafCenterX(li);
        const lAct = l.activeAt !== undefined ? prog(frame, l.activeAt, 10, easeInOut) : 0;
        const isDimmed = l.activeAt === undefined && anyLeafActiveP > 0;
        const dimOpacity = isDimmed ? lerp(1, 0.45, anyLeafActiveP) : 1;
        const enterP = prog(frame, at + 10 + li * 2, 10);

        return (
          <div
            key={li}
            style={{
              position: "absolute",
              left: cx - lW / 2,
              top: leafY - leafH / 2,
              width: lW,
              height: leafH,
              borderRadius: 22,
              background: interpolateColors(lAct, [0, 1], [C.white, BLUE_TINT]),
              border: `3px solid ${interpolateColors(lAct, [0, 1], ["rgba(0,0,0,0.12)", C.accent])}`,
              boxShadow: CARD_SHADOW,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 14px",
              boxSizing: "border-box",
              ...materialize(enterP),
              opacity: enterP * dimOpacity,
            }}
          >
            {/* Leaf indexed key */}
            <div
              style={{
                fontFamily: mono,
                fontSize: 24,
                fontWeight: 700,
                color: interpolateColors(lAct, [0, 1], [C.ink, C.accent]),
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {l.label}
            </div>

            {/* Row pointer pill */}
            <div
              style={{
                width: "100%",
                height: 44,
                borderRadius: 12,
                background: interpolateColors(lAct, [0, 1], ["#F5F5F7", "#EEFAF1"]),
                border: `1.5px solid ${interpolateColors(lAct, [0, 1], ["rgba(0,0,0,0.08)", GREEN])}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "0 10px",
                boxSizing: "border-box",
              }}
            >
              <Icon
                name={lAct > 0.5 ? "check" : "arrowRight"}
                size={18}
                color={lAct > 0.5 ? "#248A3D" : C.mute}
                weight={2.4}
              />
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: interpolateColors(lAct, [0, 1], [C.mute, "#248A3D"]),
                  whiteSpace: "nowrap",
                }}
              >
                {l.rowRef}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
