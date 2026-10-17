import { useCurrentFrame } from "remotion";
import { TX } from "../../layout";
import { C, mono, sans } from "../../theme";
import { DevCard } from "../dev/card";
import { presence } from "../diagram/Node";

export const ConsistentHashRing: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  addNodeAt?: number;
}> = ({ x = TX, y, w = 900, h = 760, at, until, addNodeAt }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const added = addNodeAt !== undefined && frame >= addNodeAt;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={vis} filename="hash-ring.go" icon="refresh" right={added ? "4 nodes (+S4)" : "3 nodes"}>
      <div style={{ padding: 34, fontFamily: sans, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: C.ink }}>
          {added ? "Node S4 added → only 2/6 keys remapped (~25%)" : "Ring [0°..360°] · S1, S2, S3"}
        </div>
      </div>
    </DevCard>
  );
};
