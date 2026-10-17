import { useCurrentFrame } from "remotion";
import { TX } from "../../layout";
import { C, mono, sans } from "../../theme";
import { DevCard } from "../dev/card";
import { presence } from "../diagram/Node";

export const RaftConsensus: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  failAt?: number;
  electAt?: number;
  promoteAt?: number;
}> = ({ x = TX, y, w = 900, h = 760, at, until, failAt, electAt, promoteAt }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const status =
    promoteAt !== undefined && frame >= promoteAt
      ? "New leader promoted (3/5 quorum)"
      : electAt !== undefined && frame >= electAt
        ? "Leader election in progress"
        : failAt !== undefined && frame >= failAt
          ? "Leader node failed"
          : "5-node cluster healthy";

  return (
    <DevCard x={x} y={y} w={w} h={h} p={vis} filename="raft-cluster.go" icon="server" right="quorum 3/5">
      <div style={{ padding: 34, fontFamily: sans, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontFamily: mono, fontSize: 25, fontWeight: 700, color: C.ink }}>{status}</div>
      </div>
    </DevCard>
  );
};
