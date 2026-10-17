import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

/**
 * NoSQL LSM-Tree Storage Engine visualizer (`LsmTree` — RocksDB / Cassandra / LevelDB).
 * Shows fast append writes entering `WAL (disk)` + `MemTable (RAM)` and flushing/compacting
 * into sorted `SSTable L0 → L1 → L2` tiers at `flushAt` and `compactAt`.
 */
export const LsmTree: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  writeAt?: number;
  flushAt?: number;
  compactAt?: number;
}> = ({
  x = TX,
  y,
  w = 900,
  h = 790,
  at,
  until,
  writeAt,
  flushAt,
  compactAt,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const tWrite = writeAt ?? at + 8;
  const tFlush = flushAt ?? at + 42;
  const tCompact = compactAt ?? tFlush + 26;

  const writeP = prog(frame, tWrite, 14, easeOut);
  const flushP = prog(frame, tFlush, 14, easeInOut);
  const compactP = prog(frame, tCompact, 14, easeInOut);

  const isFlushed = flushP > 0.5;
  const isCompacted = compactP > 0.5;

  const goodTone = toneColors("good");
  const accentTone = toneColors("accent");
  const warnTone = toneColors("warn");

  // MemTable fill percentage: climbs 20% -> 100% on write, drops to 12% after flush
  const memFill = isFlushed
    ? lerp(100, 14, prog(frame, tFlush + 4, 12, easeOut))
    : lerp(22, 100, writeP);

  const memEntries = [
    { k: "k:07", v: '"Ada"', kind: "put" as const },
    { k: "k:19", v: "TOMBSTONE", kind: "del" as const },
    { k: "k:42", v: '"score:98"', kind: "put" as const },
    { k: "k:88", v: '"Linus"', kind: "put" as const },
  ];

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={vis}
      filename="rocksdb_lsm.engine"
      icon="layers"
      right={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: isCompacted ? goodTone.bg : isFlushed ? warnTone.bg : accentTone.bg,
            color: isCompacted ? goodTone.fg : isFlushed ? warnTone.fg : accentTone.fg,
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          <Icon
            name={isCompacted ? "checkCircle" : isFlushed ? "download" : "bolt"}
            size={18}
            color={isCompacted ? goodTone.fg : isFlushed ? warnTone.fg : accentTone.fg}
            weight={2.2}
          />
          {isCompacted
            ? "compacted L0 → L1 → L2"
            : isFlushed
              ? "flushing MemTable → L0"
              : "sequential append writes"}
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
        {/* 1. Incoming Write Stream Banner */}
        <div
          style={{
            padding: "11px 18px",
            borderRadius: 16,
            background: BLUE_TINT,
            border: `1.5px solid ${C.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...materialize(writeP),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="bolt" size={22} color={C.accent} weight={2.2} />
            <span style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>
              Incoming Writes:
            </span>
            <span style={{ fontFamily: mono, fontSize: 17, fontWeight: 700, color: C.accent }}>
              PUT(k:42, &quot;score:98&quot;) · DEL(k:19)
            </span>
          </div>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 8,
              background: C.white,
              fontFamily: mono,
              fontSize: 15,
              fontWeight: 700,
              color: "#248A3D",
            }}
          >
            0 random disk seeks
          </span>
        </div>

        {/* 2. Top Row: MemTable (RAM) + Write-Ahead Log (Disk) */}
        <div style={{ display: "flex", gap: 18 }}>
          {/* MemTable (RAM) */}
          <div
            style={{
              flex: 1.25,
              borderRadius: 20,
              background: isFlushed ? "#F8F8FA" : BLUE_TINT,
              border: `2px solid ${isFlushed ? C.line : C.accent}`,
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="ram" size={22} color={C.accent} weight={2} />
                <span style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>
                  MemTable (RAM · SkipList)
                </span>
              </div>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: !isFlushed && writeP > 0.8 ? "#A05A00" : C.accent,
                }}
              >
                {Math.round((memFill / 100) * 64)} / 64 MB {!isFlushed && writeP > 0.8 ? "(FULL!)" : ""}
              </span>
            </div>

            {/* RAM Capacity Bar */}
            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: "rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${memFill}%`,
                  height: "100%",
                  background: !isFlushed && writeP > 0.8 ? AMBER : C.accent,
                  borderRadius: 999,
                }}
              />
            </div>

            {/* Sorted in-memory key-value pairs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {memEntries.map((e, i) => {
                const ep = prog(frame, tWrite + i * 2, 8, easeOut);
                return (
                  <div
                    key={e.k}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 10,
                      background: C.white,
                      border: `1px solid ${e.kind === "del" ? AMBER : C.line}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontFamily: mono,
                      fontSize: 15,
                      opacity: isFlushed ? 0.45 : ep,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: C.ink }}>{e.k}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: e.kind === "del" ? "#A05A00" : C.accent,
                        fontSize: 14,
                      }}
                    >
                      {e.v}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WAL (Append-Only Disk Log) */}
          <div
            style={{
              flex: 0.95,
              borderRadius: 20,
              background: "#F5F5F7",
              border: `1.5px solid ${C.line}`,
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="disk" size={22} color={C.ink} weight={2} />
                <span style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>WAL (Disk)</span>
              </div>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: goodTone.bg,
                  color: goodTone.fg,
                  fontFamily: mono,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                append-only
              </span>
            </div>

            <div style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>
              Sequential log on disk for crash recovery:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: C.white,
                  border: `1px solid ${C.line}`,
                  fontFamily: mono,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.ink,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>01: PUT k:07 | 02: DEL k:19</span>
                <span style={{ color: "#248A3D", fontWeight: 700 }}>fsync ✓</span>
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: C.white,
                  border: `1px solid ${C.line}`,
                  fontFamily: mono,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.ink,
                  display: "flex",
                  justifyContent: "space-between",
                  opacity: writeP,
                }}
              >
                <span>03: PUT k:42 | 04: PUT k:88</span>
                <span style={{ color: "#248A3D", fontWeight: 700 }}>fsync ✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Flush Connector Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            opacity: flushP > 0 ? Math.max(0.35, flushP) : 0.35,
          }}
        >
          <Icon name="arrowDown" size={24} color={isFlushed ? C.accent : C.mute} weight={2.4} />
          <span
            style={{
              fontFamily: mono,
              fontSize: 16,
              fontWeight: 700,
              color: isFlushed ? C.accent : C.mute,
            }}
          >
            {isFlushed
              ? "MemTable flushed sequentially to immutable SSTable L0 · Compaction merges L0 → L1 → L2"
              : "when MemTable hits 64 MB → flushes to immutable SSTable L0"}
          </span>
          <Icon name="arrowDown" size={24} color={isFlushed ? C.accent : C.mute} weight={2.4} />
        </div>

        {/* 4. Disk SSTable Tiers (L0 -> L1 -> L2) */}
        <div
          style={{
            flex: 1,
            borderRadius: 22,
            background: "#F5F5F7",
            border: `1.5px solid ${C.line}`,
            padding: "14px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          {/* Tier L0 */}
          <SstLevelRow
            level="SSTable L0"
            sizeCap="64 MB · minor flush"
            active={isFlushed && !isCompacted}
            done={isCompacted}
            blocks={[
              { name: "sst_003.db", range: "[k:02 .. k:55]", highlight: false },
              {
                name: "sst_004.db (NEW)",
                range: "[k:07 .. k:88]",
                highlight: isFlushed,
              },
            ]}
            note={isFlushed ? "flushed from RAM!" : "awaiting flush"}
          />

          {/* Tier L1 */}
          <SstLevelRow
            level="SSTable L1"
            sizeCap="640 MB · compacted"
            active={isCompacted}
            done={isCompacted}
            blocks={[
              { name: "sst_101.db", range: "[k:01 .. k:39] (k:19 purged 🪦)", highlight: isCompacted },
              { name: "sst_102.db", range: "[k:40 .. k:99] (k:42 deduplicated)", highlight: isCompacted },
            ]}
            note={isCompacted ? "merge-sorted ✓" : "non-overlapping"}
          />

          {/* Tier L2 */}
          <SstLevelRow
            level="SSTable L2"
            sizeCap="6.4 GB · + Bloom filter"
            active={false}
            done={isCompacted}
            blocks={[
              { name: "sst_201.db", range: "[k:00 .. k:29]", highlight: false },
              { name: "sst_202.db", range: "[k:30 .. k:64]", highlight: false },
              { name: "sst_203.db", range: "[k:65 .. k:99]", highlight: false },
            ]}
            note="Bloom filter O(1)"
          />
        </div>
      </div>
    </DevCard>
  );
};

const SstLevelRow: React.FC<{
  level: string;
  sizeCap: string;
  active: boolean;
  done: boolean;
  blocks: { name: string; range: string; highlight: boolean }[];
  note: string;
}> = ({ level, sizeCap, active, done, blocks, note }) => {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 14,
        background: active ? BLUE_TINT : done ? "#EEFAF1" : C.white,
        border: `1.5px solid ${active ? C.accent : done ? GREEN : C.line}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
      }}
    >
      <div style={{ width: 175, flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>{level}</div>
        <div style={{ fontFamily: mono, fontSize: 13, color: C.mute }}>{sizeCap}</div>
      </div>

      <div style={{ display: "flex", gap: 10, flex: 1 }}>
        {blocks.map((b) => (
          <div
            key={b.name}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 10,
              background: b.highlight ? C.white : "#F5F5F7",
              border: `1.5px solid ${b.highlight ? (done ? GREEN : C.accent) : C.line}`,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 14,
                fontWeight: 700,
                color: b.highlight ? (done ? "#248A3D" : C.accent) : C.ink,
              }}
            >
              {b.name}
            </span>
            <span style={{ fontFamily: mono, fontSize: 13, color: C.mute }}>{b.range}</span>
          </div>
        ))}
      </div>

      <span
        style={{
          padding: "4px 10px",
          borderRadius: 8,
          background: active ? tint(C.accent, 0.14) : done ? tint(GREEN, 0.16) : "#F2F2F4",
          color: active ? C.accent : done ? "#248A3D" : C.mute,
          fontFamily: mono,
          fontSize: 14,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {note}
      </span>
    </div>
  );
};
