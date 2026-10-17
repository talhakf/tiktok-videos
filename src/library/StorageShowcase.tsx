import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { AcidTransactions } from "../components/storage/AcidTransactions";
import { JoinVisualizer } from "../components/storage/JoinVisualizer";
import { LsmTree } from "../components/storage/LsmTree";
import { MvccTimeline } from "../components/storage/MvccTimeline";
import { RaidArray } from "../components/storage/RaidArray";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the storage group (Databases & Storage Engines Pack 2):
// 0..120: AcidTransactions · 120..240: JoinVisualizer · 240..360: MvccTimeline · 360..480: LsmTree · 480..600: RaidArray

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({
  at,
  x = TX,
  y,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: mono,
        fontWeight: 500,
        fontSize: 26,
        color: C.mute,
        opacity: prog(frame, at, 8),
      }}
    >
      {children}
    </div>
  );
};

export const StorageShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. AcidTransactions: SQL ACID transaction log, mid-flight crash & atomic rollback */}
    <Win from={0} to={120}>
      <Label at={0} y={265}>
        AcidTransactions · debitAt 24 · crashAt 52 · atomic ROLLBACK at 78
      </Label>
      <AcidTransactions
        at={2}
        x={TX}
        y={325}
        beginAt={10}
        debitAt={24}
        crashAt={52}
        rollbackAt={78}
      />
    </Win>

    {/* 2. JoinVisualizer: SQL INNER JOIN -> LEFT JOIN foreign key row matcher */}
    <Win from={120} to={240}>
      <Label at={120} y={265}>
        JoinVisualizer · INNER JOIN (134) → LEFT JOIN NULL padding (174)
      </Label>
      <JoinVisualizer
        at={122}
        x={TX}
        y={325}
        matchAt={134}
        switchAt={174}
        fullJoinAt={208}
      />
    </Win>

    {/* 3. MvccTimeline: Postgres MVCC tuple versions (xmin / xmax) & non-blocking snapshot reads */}
    <Win from={240} to={360}>
      <Label at={240} y={265}>
        MvccTimeline · Reader tx 101 (v1) vs Writer tx 102 (v2)
      </Label>
      <MvccTimeline
        at={242}
        x={TX}
        y={325}
        readAt={254}
        writeAt={280}
        commitAt={314}
      />
    </Win>

    {/* 4. LsmTree: RocksDB / Cassandra WAL + MemTable flush & SSTable L0->L1->L2 compaction */}
    <Win from={360} to={480}>
      <Label at={360} y={265}>
        LsmTree · WAL + MemTable (370) → SSTable flush (404) &amp; compact (434)
      </Label>
      <LsmTree
        at={362}
        x={TX}
        y={325}
        writeAt={370}
        flushAt={404}
        compactAt={434}
      />
    </Win>

    {/* 5. RaidArray: 4-drive RAID 5 stripe + distributed XOR parity failure & rebuild */}
    <Win from={480} to={600}>
      <Label at={480} y={265}>
        RaidArray · RAID 5 XOR parity · Disk 1 failAt 514 → rebuildAt 548
      </Label>
      <RaidArray
        at={482}
        x={TX}
        y={325}
        level="RAID 5"
        failedDrive={1}
        failAt={514}
        rebuildAt={548}
      />
    </Win>
  </AbsoluteFill>
);
