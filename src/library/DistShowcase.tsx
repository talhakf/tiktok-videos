import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CapTriangle } from "../components/dist/CapTriangle";
import { CircuitBreaker } from "../components/dist/CircuitBreaker";
import { ConsistentHashRing } from "../components/dist/ConsistentHashRing";
import { MessageQueue } from "../components/dist/MessageQueue";
import { RaftConsensus } from "../components/dist/RaftConsensus";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the distributed systems & consensus group (600 frames @ 30fps):
// 0..120 RaftConsensus, 120..240 CapTriangle, 240..360 ConsistentHashRing,
// 360..480 MessageQueue, 480..600 CircuitBreaker.

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

export const DistShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. RaftConsensus: 5-node pentagon, leader crash, election & quorum promotion */}
    <Win from={0} to={120}>
      <Label at={0} y={260}>
        RaftConsensus · failAt 32 · electAt 56 · promoteAt 84 (3/5 quorum)
      </Label>
      <RaftConsensus
        at={2}
        x={TX}
        y={320}
        h={800}
        failAt={32}
        electAt={56}
        promoteAt={84}
      />
    </Win>

    {/* 2. CapTriangle: Consistency, Availability, Partition tolerance & network cut */}
    <Win from={120} to={240}>
      <Label at={120} y={260}>
        CapTriangle · CP vs AP · partitionAt 154
      </Label>
      <CapTriangle
        at={122}
        x={TX}
        y={320}
        h={820}
        partitionAt={154}
      />
    </Win>

    {/* 3. ConsistentHashRing: 0°..360° ring, S4 inserted at 278 remapping ~25% of keys */}
    <Win from={240} to={360}>
      <Label at={240} y={260}>
        ConsistentHashRing · 0°..360° · addNodeAt 278 (+S4 remaps 2/6 keys)
      </Label>
      <ConsistentHashRing
        at={242}
        x={TX}
        y={320}
        h={800}
        addNodeAt={278}
      />
    </Win>

    {/* 4. MessageQueue: Producers → Partition 0..2 logs → Consumer Group workers */}
    <Win from={360} to={480}>
      <Label at={360} y={260}>
        MessageQueue · produceAt 388 · consumeAt 420 · 3 partitions
      </Label>
      <MessageQueue
        at={362}
        x={TX}
        y={320}
        h={740}
        produceAt={388}
        consumeAt={420}
      />
    </Win>

    {/* 5. CircuitBreaker: Closed → Open (tripAt 506) → Half-open (probeAt 538) → Closed (recoverAt 568) */}
    <Win from={480} to={600}>
      <Label at={480} y={260}>
        CircuitBreaker · tripAt 506 · probeAt 538 · recoverAt 568
      </Label>
      <CircuitBreaker
        at={482}
        x={TX}
        y={320}
        h={740}
        tripAt={506}
        probeAt={538}
        recoverAt={568}
      />
    </Win>
  </AbsoluteFill>
);
