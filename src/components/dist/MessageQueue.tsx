import { useCurrentFrame } from "remotion";
import { TX } from "../../layout";
import { C, mono, sans } from "../../theme";
import { DevCard } from "../dev/card";
import { presence } from "../diagram/Node";

export const MessageQueue: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  produceAt?: number;
  consumeAt?: number;
}> = ({ x = TX, y, w = 900, h = 700, at, until, produceAt, consumeAt }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const consuming = consumeAt !== undefined && frame >= consumeAt;
  const producing = produceAt !== undefined && frame >= produceAt;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={vis} filename="kafka-topic.yml" icon="layers" right="3 partitions">
      <div style={{ padding: 34, fontFamily: sans, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontFamily: mono, fontSize: 25, fontWeight: 700, color: C.ink }}>
          {consuming ? "Consumer group reading offsets" : producing ? "Producers appending to partitions 0..2" : "Topic ready"}
        </div>
      </div>
    </DevCard>
  );
};
