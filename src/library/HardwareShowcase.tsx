import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CacheHierarchy } from "../components/hw/CacheHierarchy";
import { CpuPipeline } from "../components/hw/CpuPipeline";
import { LogicGates } from "../components/hw/LogicGates";
import { MemoryLayout } from "../components/hw/MemoryLayout";
import { ProcessScheduler } from "../components/hw/ProcessScheduler";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the hw group: CPU pipeline & registers, virtual memory layout, cache hierarchy pyramid,
// OS process scheduler (concurrency vs parallelism), and digital logic gates with truth tables.

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
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

export const HardwareShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. CpuPipeline: 5-stage pipeline + 64-bit register file with blue flash on write */}
    <Win from={0} to={120}>
      <Label at={0} y={255}>
        CpuPipeline · Fetch → Decode → Execute → Memory → Write
      </Label>
      <CpuPipeline
        at={2}
        x={TX}
        y={310}
        filename="cpu-core-0"
        steps={[
          {
            at: 12,
            inst: "MOV RAX, [RSP+8]",
            stage: 0,
            regs: { RAX: "0x00000000", RBX: "0x00000010", RSP: "0x7FFF0040", RIP: "0x00401004" },
          },
          {
            at: 28,
            inst: "MOV RAX, [RSP+8]",
            stage: 1,
            regs: { RAX: "0x00000000", RBX: "0x00000010", RSP: "0x7FFF0040", RIP: "0x00401004" },
          },
          {
            at: 44,
            inst: "MOV RAX, [RSP+8]",
            stage: 2,
            regs: { RAX: "0x00000000", RBX: "0x00000010", RSP: "0x7FFF0048", RIP: "0x00401004" },
          },
          {
            at: 62,
            inst: "MOV RAX, [RSP+8]",
            stage: 3,
            regs: { RAX: "0x0000002A", RBX: "0x00000010", RSP: "0x7FFF0048", RIP: "0x00401004" },
          },
          {
            at: 82,
            inst: "ADD RAX, RBX",
            stage: 4,
            regs: { RAX: "0x0000003A", RBX: "0x00000010", RSP: "0x7FFF0048", RIP: "0x00401008" },
          },
        ]}
      />
    </Win>

    {/* 2. MemoryLayout: Stack growing down, Heap growing up, red stack overflow at 194 */}
    <Win from={120} to={240}>
      <Label at={120} y={255}>
        MemoryLayout · pushStackAt 138, 162 · allocHeapAt 150, 174 · overflowAt 194
      </Label>
      <MemoryLayout
        at={122}
        x={TX}
        y={310}
        pushStackAt={[138, 162]}
        allocHeapAt={[150, 174]}
        overflowAt={194}
      />
    </Win>

    {/* 3. CacheHierarchy: L1 → L2 → L3 → Main RAM → NVMe SSD pyramid */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        CacheHierarchy · L1 (1 ns) → NVMe SSD (50,000 ns) · activeTier
      </Label>
      <CacheHierarchy
        at={242}
        x={TX}
        y={310}
        activeTier={[
          { index: 0, at: 262, tone: "bad", label: "L1 MISS" },
          { index: 1, at: 282, tone: "bad", label: "L2 MISS" },
          { index: 2, at: 302, tone: "good", label: "L3 HIT · 12 ns" },
          { index: 3, at: 326, tone: "accent", label: "DRAM · 80 ns" },
        ]}
      />
    </Win>

    {/* 4. ProcessScheduler: Single-Core Concurrency vs Multi-Core Parallelism */}
    <Win from={360} to={480}>
      <Label at={360} y={255}>
        ProcessScheduler · Concurrency (1 core · context switching)
      </Label>
      <ProcessScheduler
        at={362}
        x={TX}
        y={310}
        cores={["Core 0"]}
        totalTime={100}
        playheadAt={374}
        playheadDur={84}
        filename="concurrency"
        slices={[
          { core: 0, proc: "nginx", from: 0, to: 25, tone: "accent" },
          { core: 0, proc: "postgres", from: 25, to: 50, tone: "good" },
          { core: 0, proc: "redis", from: 50, to: 72, tone: "warn" },
          { core: 0, proc: "nginx", from: 72, to: 100, tone: "accent" },
        ]}
      />

      <Label at={366} y={615}>
        ProcessScheduler · Parallelism (3 cores · simultaneous execution)
      </Label>
      <ProcessScheduler
        at={368}
        x={TX}
        y={670}
        cores={["Core 0", "Core 1", "Core 2"]}
        totalTime={100}
        playheadAt={374}
        playheadDur={84}
        filename="parallelism"
        slices={[
          { core: 0, proc: "nginx", from: 0, to: 92, tone: "accent" },
          { core: 1, proc: "postgres", from: 0, to: 85, tone: "good" },
          { core: 2, proc: "worker", from: 8, to: 96, tone: "warn" },
        ]}
      />
    </Win>

    {/* 5. LogicGates: XOR and NAND with cycling truth tables */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        LogicGates · XOR · cycleAt 494 (0,0 → 0,1 → 1,0 → 1,1)
      </Label>
      <LogicGates
        at={482}
        x={TX}
        y={310}
        gate="XOR"
        filename="alu_xor.v"
        cycleAt={494}
        stepDur={20}
      />

      <Label at={486} y={765}>
        LogicGates · NAND · cycleAt 498
      </Label>
      <LogicGates
        at={488}
        x={TX}
        y={820}
        gate="NAND"
        filename="nand_gate.v"
        cycleAt={498}
        stepDur={20}
      />
    </Win>
  </AbsoluteFill>
);
