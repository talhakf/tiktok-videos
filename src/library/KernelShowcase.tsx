import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { DeadlockGraph } from "../components/kernel/DeadlockGraph";
import { EpollLoop } from "../components/kernel/EpollLoop";
import { PageTableMap } from "../components/kernel/PageTableMap";
import { SignalHandler } from "../components/kernel/SignalHandler";
import { SyscallBoundary } from "../components/kernel/SyscallBoundary";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the operating systems, Linux kernel & concurrency group (600 frames @ 30fps):
// 0..120   SyscallBoundary (user space ring 3 ↔ kernel space ring 0)
// 120..240 DeadlockGraph   (circular mutex wait → consistent lock ordering fix)
// 240..360 PageTableMap    (virtual pages → MMU PTEs / TLB → physical RAM & NVMe swap)
// 360..480 EpollLoop       (C10K thread-per-connection vs non-blocking epoll event loop)
// 480..600 SignalHandler   (SIGINT 2, SIGTERM 15 graceful trap, SIGKILL 9 kernel termination)

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

export const KernelShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. SyscallBoundary: read(fd, buf, 4096) trapping from Ring 3 to Ring 0 and returning */}
    <Win from={0} to={120}>
      <Label at={0} y={265}>
        SyscallBoundary · ring 3 → ring 0 trap (18) · VFS/NVMe (36) · sysret (70)
      </Label>
      <SyscallBoundary
        at={2}
        x={TX}
        y={320}
        trapAt={18}
        kernelAt={36}
        returnAt={70}
      />
    </Win>

    {/* 2. DeadlockGraph: circular wait at 164, resolved via lock ordering M1 → M2 at 194 */}
    <Win from={120} to={240}>
      <Label at={120} y={265}>
        DeadlockGraph · circular wait (164) → lock order M1 → M2 fix (194)
      </Label>
      <DeadlockGraph
        at={122}
        x={TX}
        y={320}
        acquireAt={134}
        waitAt={148}
        deadlockAt={164}
        fixAt={194}
      />
    </Win>

    {/* 3. PageTableMap: TLB hit at 256, Page Fault #PF at 282, Swap-In to RAM at 310 */}
    <Win from={240} to={360}>
      <Label at={240} y={265}>
        PageTableMap · TLB hit (256) · page fault #PF (282) · swap in (310)
      </Label>
      <PageTableMap
        at={242}
        x={TX}
        y={320}
        lookupAt={256}
        faultAt={282}
        swapInAt={310}
      />
    </Win>

    {/* 4. EpollLoop: C10K thread-per-connection vs non-blocking epoll / kqueue */}
    <Win from={360} to={480}>
      <Label at={360} y={265}>
        EpollLoop · C10K blocking threads vs non-blocking epoll_wait()
      </Label>
      <EpollLoop
        at={362}
        x={TX}
        y={320}
        epollAt={380}
      />
    </Win>

    {/* 5. SignalHandler: SIGINT (2), SIGTERM (15) trap cleanup(), SIGKILL (9) kernel bypass */}
    <Win from={480} to={600}>
      <Label at={480} y={265}>
        SignalHandler · SIGINT (492) · SIGTERM cleanup (516) · SIGKILL -9 (546)
      </Label>
      <SignalHandler
        at={482}
        x={TX}
        y={320}
        sigintAt={492}
        sigtermAt={516}
        sigkillAt={546}
      />
    </Win>
  </AbsoluteFill>
);
