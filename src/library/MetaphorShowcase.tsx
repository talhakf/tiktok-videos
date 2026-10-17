import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { GREEN, RED } from "../components/diagram/Node";
import { BeforeAfterSlider } from "../components/metaphor/BeforeAfterSlider";
import { FunnelStages } from "../components/metaphor/FunnelStages";
import { RadarChart } from "../components/metaphor/RadarChart";
import { VaultSafe } from "../components/metaphor/VaultSafe";
import { VennDiagram } from "../components/metaphor/VennDiagram";
import { tint } from "../components/windows/MacWindow";
import { Icon } from "../icons/Icons";
import { TW, TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog, sans } from "../theme";

// Preview of the Metaphor & Diagrams Pack 2 group (600 frames @ 30fps):
// 0..120: VaultSafe · 120..240: BeforeAfterSlider · 240..360: FunnelStages · 360..480: RadarChart · 480..600: VennDiagram

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

/** Demo comparison pane for BeforeAfterSlider ("before" unindexed scan vs "after" B-tree index scan). */
const QueryComparisonPane: React.FC<{
  mode: "before" | "after";
  planTitle: string;
  sqlLine: string;
  planNode: string;
  rowsScanned: string;
  latency: string;
  costBarPct: number;
}> = ({ mode, planTitle, sqlLine, planNode, rowsScanned, latency, costBarPct }) => {
  const isBefore = mode === "before";
  const accent = isBefore ? RED : GREEN;
  const fgAccent = isBefore ? "#C9281E" : "#248A3D";
  const bgTint = isBefore ? "#FFF5F4" : "#F2FBF5";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bgTint,
        padding: "92px 44px 38px 44px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top SQL + Plan Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: "-0.02em",
              color: C.ink,
            }}
          >
            {planTitle}
          </div>
          <div
            style={{
              marginTop: 10,
              display: "inline-block",
              padding: "8px 16px",
              borderRadius: 12,
              background: C.white,
              border: `1px solid ${C.line}`,
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 21,
              color: C.ink,
            }}
          >
            {sqlLine}
          </div>
        </div>

        {/* Big Latency Readout */}
        <div
          style={{
            padding: "14px 24px",
            borderRadius: 20,
            background: C.white,
            border: `2px solid ${tint(accent, 0.45)}`,
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 40,
              letterSpacing: "-0.03em",
              color: fgAccent,
              lineHeight: 1,
            }}
          >
            {latency}
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 18,
              color: C.mute,
            }}
          >
            query execution time
          </div>
        </div>
      </div>

      {/* Middle Execution Plan Card */}
      <div
        style={{
          borderRadius: 20,
          background: C.white,
          border: `1.5px solid ${C.line}`,
          padding: "22px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: tint(accent, 0.14),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={isBefore ? "warning" : "bolt"}
              size={28}
              color={fgAccent}
              weight={2.2}
            />
          </div>
          <div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 23,
                color: C.ink,
              }}
            >
              {planNode}
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: sans,
                fontWeight: 500,
                fontSize: 20,
                color: C.mute,
              }}
            >
              {rowsScanned}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: tint(accent, 0.14),
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 19,
            color: fgAccent,
          }}
        >
          {isBefore ? "O(n) full scan" : "O(log n) B-tree"}
        </div>
      </div>

      {/* Bottom I/O Load Bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 20,
            color: C.mute,
          }}
        >
          <span>Disk pages touched</span>
          <span style={{ fontFamily: mono, color: fgAccent }}>{costBarPct}% load</span>
        </div>
        <div
          style={{
            height: 22,
            borderRadius: 11,
            background: "rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${costBarPct}%`,
              height: "100%",
              borderRadius: 11,
              background: accent,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const MetaphorShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. VaultSafe: locks at 16, unauthorized deny shake at 46, sudo unlock at 84 */}
    <Win from={0} to={120}>
      <Label at={0} y={265}>
        VaultSafe · lockAt 16 · denyAt 46 · unlockAt 84
      </Label>
      <VaultSafe
        at={2}
        x={TX}
        y={330}
        w={TW}
        h={560}
        secretLabel="/etc/shadow"
        secretSub="-rw-------  1 root  shadow  1.4 KB"
        secretValue="root:$6$rounds=656000$9f8e2a01...d83e19a0"
        secretIcon="key"
        ownerLabel="root (uid 0)"
        modeLabel="chmod 0600"
        lockAt={16}
        denyAt={46}
        denyLabel="Permission denied"
        denyCmd="$ cat /etc/shadow → EACCES (uid 1000)"
        unlockAt={84}
      />
    </Win>

    {/* 2. BeforeAfterSlider: sweeps curtain from 0.85 to 0.15 at 152, settles at 196 */}
    <Win from={120} to={240}>
      <Label at={120} y={265}>
        BeforeAfterSlider · sweepAt 152 (0.85 → 0.15) · settleAt 196
      </Label>
      <BeforeAfterSlider
        at={122}
        x={TX}
        y={330}
        w={TW}
        h={560}
        title="Postgres query planner comparison"
        subtitle="EXPLAIN ANALYZE"
        initialSplit={0.85}
        targetSplit={0.15}
        sweepAt={152}
        settleAt={196}
        settleSplit={0.48}
        beforeLabel="before"
        beforeMeta="1,420 ms"
        afterLabel="after"
        afterMeta="1.8 ms"
        beforeNode={
          <QueryComparisonPane
            mode="before"
            planTitle="Unindexed table scan"
            sqlLine="SELECT * FROM orders WHERE user_id = 42;"
            planNode="Seq Scan on orders (cost=0..18420)"
            rowsScanned="480,000 rows read · 479,997 filtered out"
            latency="1,420 ms"
            costBarPct={94}
          />
        }
        afterNode={
          <QueryComparisonPane
            mode="after"
            planTitle="B-tree composite index"
            sqlLine="CREATE INDEX idx_orders_user ON orders (user_id);"
            planNode="Index Scan using idx_orders_user"
            rowsScanned="3 rows fetched directly via 3 B-tree hops"
            latency="1.8 ms"
            costBarPct={6}
          />
        }
      />
    </Win>

    {/* 3. FunnelStages: 4-stage pipeline narrowing down to final output */}
    <Win from={240} to={360}>
      <Label at={240} y={265}>
        FunnelStages · find | grep | rg | head · narrowing stages
      </Label>
      <FunnelStages
        at={242}
        x={TX}
        y={330}
        w={TW}
        title="Unix pipeline filter funnel"
        subtitle="find . | grep | rg | head"
        stages={[
          {
            label: "All repository files",
            cmd: "find . -type f",
            count: "48,200",
            pct: 100,
            at: 246,
          },
          {
            label: "TypeScript sources",
            cmd: "| grep -E '\\.tsx?$'",
            count: "6,410",
            pct: 28,
            at: 260,
          },
          {
            label: "Files calling useEffect",
            cmd: "| xargs rg -l 'useEffect'",
            count: "312",
            pct: 6.5,
            at: 274,
          },
          {
            label: "Top 5 largest components",
            cmd: "| sort -rn | head -n 5",
            count: "5 files",
            pct: 1.2,
            at: 288,
            highlight: true,
          },
        ]}
      />
    </Win>

    {/* 4. RadarChart: 6-axis Spider / Radar polygon chart */}
    <Win from={360} to={480}>
      <Label at={360} y={265}>
        RadarChart · 6 axes · 2 series expanding from center
      </Label>
      <RadarChart
        at={362}
        x={TX}
        y={330}
        w={TW}
        h={630}
        title="API protocol trade-offs"
        subtitle="normalized 0..1"
        axes={[
          "Throughput",
          "Type safety",
          "Browser support",
          "Streaming",
          "Compact payload",
          "Human readable",
        ]}
        series={[
          {
            label: "REST + JSON",
            values: [0.55, 0.42, 0.96, 0.45, 0.48, 0.95],
            at: 370,
          },
          {
            label: "gRPC + Protobuf",
            values: [0.94, 0.96, 0.62, 0.95, 0.92, 0.44],
            highlight: true,
            at: 388,
          },
        ]}
      />
    </Win>

    {/* 5. VennDiagram: 2 circles + center overlap lens lighting up in system blue */}
    <Win from={480} to={600}>
      <Label at={480} y={265}>
        VennDiagram · 2 circles · center lens lights up at 514
      </Label>
      <VennDiagram
        at={482}
        x={TX}
        y={330}
        w={TW}
        h={590}
        title="OS concurrency primitives"
        subtitle="processes ∩ threads"
        overlapAt={514}
        leftTitle="Processes"
        leftItems={[
          "own virtual memory",
          "separate PID",
          "crash isolated",
          "IPC via sockets",
        ]}
        rightTitle="Threads"
        rightItems={[
          "shared heap space",
          "fast context switch",
          "mutex & atomics",
          "lightweight spawn",
        ]}
        centerTitle="Both"
        centerItems={[
          "kernel scheduled",
          "own stack + regs",
          "task_struct in Linux",
        ]}
      />
    </Win>
  </AbsoluteFill>
);
