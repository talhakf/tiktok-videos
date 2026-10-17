import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type RaidLevel = "RAID 0" | "RAID 1" | "RAID 5" | "RAID 10";

type BlockCell = {
  id: string;
  kind: "data" | "mirror" | "parity";
  sub: string;
  rebuiltSub: string;
};

const RAID_LAYOUTS: Record<RaidLevel, { summary: string; usable: string; tolerance: string; grid: BlockCell[][] }> = {
  "RAID 0": {
    summary: "Striping only (no redundancy)",
    usable: "100% capacity",
    tolerance: "0 drives (any failure = total loss)",
    grid: [
      [
        { id: "A1", kind: "data", sub: "stripe 0", rebuiltSub: "A1" },
        { id: "B1", kind: "data", sub: "stripe 1", rebuiltSub: "B1" },
        { id: "C1", kind: "data", sub: "stripe 2", rebuiltSub: "C1" },
      ],
      [
        { id: "A2", kind: "data", sub: "stripe 0", rebuiltSub: "LOST ❌" },
        { id: "B2", kind: "data", sub: "stripe 1", rebuiltSub: "LOST ❌" },
        { id: "C2", kind: "data", sub: "stripe 2", rebuiltSub: "LOST ❌" },
      ],
      [
        { id: "A3", kind: "data", sub: "stripe 0", rebuiltSub: "A3" },
        { id: "B3", kind: "data", sub: "stripe 1", rebuiltSub: "B3" },
        { id: "C3", kind: "data", sub: "stripe 2", rebuiltSub: "C3" },
      ],
      [
        { id: "A4", kind: "data", sub: "stripe 0", rebuiltSub: "A4" },
        { id: "B4", kind: "data", sub: "stripe 1", rebuiltSub: "B4" },
        { id: "C4", kind: "data", sub: "stripe 2", rebuiltSub: "C4" },
      ],
    ],
  },
  "RAID 1": {
    summary: "Exact block-level mirroring",
    usable: "50% capacity",
    tolerance: "1 drive per mirror pair",
    grid: [
      [
        { id: "A1", kind: "data", sub: "primary", rebuiltSub: "source ✓" },
        { id: "B1", kind: "data", sub: "primary", rebuiltSub: "source ✓" },
        { id: "C1", kind: "data", sub: "primary", rebuiltSub: "source ✓" },
      ],
      [
        { id: "A1'", kind: "mirror", sub: "mirror of D0", rebuiltSub: "copied D0 ✓" },
        { id: "B1'", kind: "mirror", sub: "mirror of D0", rebuiltSub: "copied D0 ✓" },
        { id: "C1'", kind: "mirror", sub: "mirror of D0", rebuiltSub: "copied D0 ✓" },
      ],
      [
        { id: "A2", kind: "data", sub: "primary", rebuiltSub: "primary" },
        { id: "B2", kind: "data", sub: "primary", rebuiltSub: "primary" },
        { id: "C2", kind: "data", sub: "primary", rebuiltSub: "primary" },
      ],
      [
        { id: "A2'", kind: "mirror", sub: "mirror of D2", rebuiltSub: "mirror of D2" },
        { id: "B2'", kind: "mirror", sub: "mirror of D2", rebuiltSub: "mirror of D2" },
        { id: "C2'", kind: "mirror", sub: "mirror of D2", rebuiltSub: "mirror of D2" },
      ],
    ],
  },
  "RAID 5": {
    summary: "Block striping + distributed XOR parity",
    usable: "75% capacity (N - 1)",
    tolerance: "survives any 1 drive failure",
    grid: [
      [
        { id: "A1", kind: "data", sub: "data block", rebuiltSub: "XOR input" },
        { id: "B1", kind: "data", sub: "data block", rebuiltSub: "XOR input" },
        { id: "C1", kind: "data", sub: "data block", rebuiltSub: "XOR input" },
      ],
      [
        { id: "A2", kind: "data", sub: "data block", rebuiltSub: "A1 ⊕ A3 ⊕ Ap ✓" },
        { id: "B2", kind: "data", sub: "data block", rebuiltSub: "B1 ⊕ Bp ⊕ B3 ✓" },
        { id: "Cp", kind: "parity", sub: "XOR parity", rebuiltSub: "C1 ⊕ C2 ⊕ C3 ✓" },
      ],
      [
        { id: "A3", kind: "data", sub: "data block", rebuiltSub: "XOR input" },
        { id: "Bp", kind: "parity", sub: "XOR parity", rebuiltSub: "XOR input" },
        { id: "C2", kind: "data", sub: "data block", rebuiltSub: "XOR input" },
      ],
      [
        { id: "Ap", kind: "parity", sub: "XOR parity", rebuiltSub: "XOR input" },
        { id: "B3", kind: "data", sub: "data block", rebuiltSub: "XOR input" },
        { id: "C3", kind: "data", sub: "data block", rebuiltSub: "XOR input" },
      ],
    ],
  },
  "RAID 10": {
    summary: "Stripe of mirrors (RAID 1 + 0)",
    usable: "50% capacity",
    tolerance: "fast rebuild from mirror peer",
    grid: [
      [
        { id: "A1", kind: "data", sub: "pair 0 · data", rebuiltSub: "mirror peer ✓" },
        { id: "B1", kind: "data", sub: "pair 0 · data", rebuiltSub: "mirror peer ✓" },
        { id: "C1", kind: "data", sub: "pair 0 · data", rebuiltSub: "mirror peer ✓" },
      ],
      [
        { id: "A1'", kind: "mirror", sub: "pair 0 · mirror", rebuiltSub: "cloned D0 ✓" },
        { id: "B1'", kind: "mirror", sub: "pair 0 · mirror", rebuiltSub: "cloned D0 ✓" },
        { id: "C1'", kind: "mirror", sub: "pair 0 · mirror", rebuiltSub: "cloned D0 ✓" },
      ],
      [
        { id: "A2", kind: "data", sub: "pair 1 · data", rebuiltSub: "pair 1 · data" },
        { id: "B2", kind: "data", sub: "pair 1 · data", rebuiltSub: "pair 1 · data" },
        { id: "C2", kind: "data", sub: "pair 1 · data", rebuiltSub: "pair 1 · data" },
      ],
      [
        { id: "A2'", kind: "mirror", sub: "pair 1 · mirror", rebuiltSub: "pair 1 · mirror" },
        { id: "B2'", kind: "mirror", sub: "pair 1 · mirror", rebuiltSub: "pair 1 · mirror" },
        { id: "C2'", kind: "mirror", sub: "pair 1 · mirror", rebuiltSub: "pair 1 · mirror" },
      ],
    ],
  },
};

/**
 * Disk RAID array (`RAID 0`, `RAID 1`, `RAID 5`, `RAID 10`) block visualizer (`RaidArray`).
 * Displays 4 drive columns with data/mirror/parity blocks (`A1, A2, Ap`), animates a drive
 * failure at `failAt`, and shows whether data is lost (`RAID 0`) or reconstructed via
 * parity/mirror (`RAID 1 / 5 / 10`) at `rebuildAt`.
 */
export const RaidArray: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  level?: RaidLevel;
  failedDrive?: number;
  failAt?: number;
  rebuildAt?: number;
}> = ({
  x = TX,
  y,
  w = 900,
  h = 790,
  at,
  until,
  level = "RAID 5",
  failedDrive = 1,
  failAt,
  rebuildAt,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const tFail = failAt ?? at + 30;
  const tRebuild = rebuildAt ?? tFail + 30;

  const failP = prog(frame, tFail, 10, easeOut);
  const rebuildP = prog(frame, tRebuild, 14, easeInOut);

  const isFailed = failP > 0.4;
  const isRebuilt = rebuildP > 0.5;
  const canRecover = level !== "RAID 0";

  const cfg = RAID_LAYOUTS[level];
  const goodTone = toneColors("good");
  const badTone = toneColors("bad");
  const accentTone = toneColors("accent");

  const statusBadge = (() => {
    if (isRebuilt && canRecover) {
      return { bg: goodTone.bg, fg: goodTone.fg, icon: "shieldCheck" as const, text: "REBUILT · 0 bytes lost" };
    }
    if (isFailed && !canRecover) {
      return { bg: badTone.bg, fg: badTone.fg, icon: "crossCircle" as const, text: "DATA LOST · no parity" };
    }
    if (isFailed) {
      return { bg: badTone.bg, fg: badTone.fg, icon: "warning" as const, text: `DEGRADED · Disk ${failedDrive} offline` };
    }
    return { bg: accentTone.bg, fg: accentTone.fg, icon: "disk" as const, text: "HEALTHY · 4 drives online" };
  })();

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={vis}
      filename="raid_controller.array"
      icon="disk"
      right={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: statusBadge.bg,
            color: statusBadge.fg,
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          <Icon name={statusBadge.icon} size={18} color={statusBadge.fg} weight={2.2} />
          {statusBadge.text}
        </div>
      }
    >
      <div
        style={{
          padding: "20px 30px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          height: "100%",
          boxSizing: "border-box",
          fontFamily: sans,
        }}
      >
        {/* 1. RAID Level Selector & Summary Strip */}
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 16,
            background: "#F5F5F7",
            border: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {(["RAID 0", "RAID 1", "RAID 5", "RAID 10"] as RaidLevel[]).map((r) => {
              const active = r === level;
              return (
                <span
                  key={r}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 10,
                    background: active ? C.accent : C.white,
                    color: active ? C.white : C.mute,
                    border: `1px solid ${active ? C.accent : C.line}`,
                    fontFamily: mono,
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {r}
                </span>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: mono, fontSize: 16 }}>
            <span style={{ color: C.ink, fontWeight: 700 }}>{cfg.summary}</span>
            <span style={{ color: C.accent, fontWeight: 700 }}>{cfg.usable}</span>
          </div>
        </div>

        {/* 2. 4 Drive Columns Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, flex: 1 }}>
          {cfg.grid.map((col, dIdx) => {
            const colP = prog(frame, at + 4 + dIdx * 3, 10, easeOut);
            const thisFailed = dIdx === failedDrive && isFailed;
            const thisRecovered = thisFailed && isRebuilt && canRecover;
            const thisDead = thisFailed && (!isRebuilt || !canRecover);

            const colBorder = thisRecovered
              ? GREEN
              : thisDead
                ? RED
                : C.line;

            const colBg = thisRecovered
              ? "#EEFAF1"
              : thisDead
                ? "#FFF1F0"
                : "#F8F8FA";

            return (
              <div
                key={dIdx}
                style={{
                  borderRadius: 20,
                  background: colBg,
                  border: `2.5px solid ${colBorder}`,
                  padding: "14px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  ...materialize(colP),
                }}
              >
                {/* Drive Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: 8,
                    borderBottom: `1px solid ${C.line}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon
                      name={thisDead ? "warning" : thisRecovered ? "checkCircle" : "disk"}
                      size={22}
                      color={thisRecovered ? GREEN : thisDead ? RED : C.ink}
                      weight={2}
                    />
                    <span style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>
                      Disk {dIdx}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: thisRecovered
                        ? tint(GREEN, 0.18)
                        : thisDead
                          ? badTone.bg
                          : "rgba(52,199,89,0.14)",
                      color: thisRecovered ? "#248A3D" : thisDead ? badTone.fg : "#248A3D",
                      fontFamily: mono,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {thisRecovered ? "REBUILT" : thisDead ? "FAILED" : "ONLINE"}
                  </span>
                </div>

                {/* 3 Stripe Blocks in this Drive */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {col.map((cell, rIdx) => {
                    const isParity = cell.kind === "parity";
                    const isMirror = cell.kind === "mirror";

                    const blockBg = thisRecovered
                      ? C.white
                      : thisDead
                        ? "rgba(255,59,48,0.10)"
                        : isParity
                          ? BLUE_TINT
                          : isMirror
                            ? "rgba(255,159,10,0.10)"
                            : C.white;

                    const blockBorder = thisRecovered
                      ? GREEN
                      : thisDead
                        ? RED
                        : isParity
                          ? C.accent
                          : isMirror
                            ? AMBER
                            : C.line;

                    return (
                      <div
                        key={rIdx}
                        style={{
                          flex: 1,
                          borderRadius: 14,
                          background: blockBg,
                          border: `2px ${thisDead ? "dashed" : "solid"} ${blockBorder}`,
                          padding: "10px 12px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            style={{
                              fontFamily: mono,
                              fontSize: 24,
                              fontWeight: 700,
                              color: thisDead
                                ? "#C9281E"
                                : thisRecovered
                                  ? "#248A3D"
                                  : isParity
                                    ? C.accent
                                    : C.ink,
                              textDecoration: thisDead && !canRecover ? "line-through" : undefined,
                            }}
                          >
                            {cell.id}
                          </span>
                          <span
                            style={{
                              padding: "2px 7px",
                              borderRadius: 6,
                              background: isParity
                                ? tint(C.accent, 0.14)
                                : isMirror
                                  ? "rgba(255,159,10,0.2)"
                                  : "#F2F2F4",
                              color: isParity ? C.accent : isMirror ? "#A05A00" : C.mute,
                              fontFamily: mono,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {cell.kind}
                          </span>
                        </div>

                        <div
                          style={{
                            fontFamily: mono,
                            fontSize: 13,
                            fontWeight: 700,
                            color: thisRecovered
                              ? "#248A3D"
                              : thisDead
                                ? "#C9281E"
                                : isRebuilt
                                  ? C.accent
                                  : C.mute,
                          }}
                        >
                          {thisFailed
                            ? isRebuilt
                              ? cell.rebuiltSub
                              : "⚡ OFFLINE"
                            : isRebuilt
                              ? cell.rebuiltSub
                              : cell.sub}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Parity / Rebuild Formula Banner */}
        <div
          style={{
            padding: "13px 20px",
            borderRadius: 16,
            background: isRebuilt && canRecover
              ? "#EEFAF1"
              : isFailed && !canRecover
                ? "#FFF1F0"
                : "#F5F5F7",
            border: `1.5px solid ${
              isRebuilt && canRecover ? GREEN : isFailed && !canRecover ? RED : C.line
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 16,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: isRebuilt && canRecover ? "#248A3D" : isFailed && !canRecover ? "#C9281E" : C.ink,
            }}
          >
            {level === "RAID 5"
              ? "XOR Parity Rebuild: missing block A2 = A1 ⊕ A3 ⊕ Ap"
              : level === "RAID 0"
                ? "RAID 0 has 0 parity blocks — losing 1 drive destroys the entire array"
                : "Mirror Rebuild: surviving drive copies exact blocks to replacement drive"}
          </span>
          <span style={{ color: C.mute, fontWeight: 600 }}>{cfg.tolerance}</span>
        </div>
      </div>
    </DevCard>
  );
};
