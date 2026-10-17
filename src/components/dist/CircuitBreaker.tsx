import { useCurrentFrame } from "remotion";
import { TX } from "../../layout";
import { mono, sans } from "../../theme";
import { DevCard, toneColors } from "../dev/card";
import { GREEN, presence, RED } from "../diagram/Node";

export const CircuitBreaker: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  tripAt?: number;
  probeAt?: number;
  recoverAt?: number;
}> = ({ x = TX, y, w = 900, h = 700, at, until, tripAt, probeAt, recoverAt }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const state =
    recoverAt !== undefined && frame >= recoverAt
      ? "CLOSED"
      : probeAt !== undefined && frame >= probeAt
        ? "HALF-OPEN"
        : tripAt !== undefined && frame >= tripAt
          ? "OPEN"
          : "CLOSED";

  const good = toneColors("good");
  const bad = toneColors("bad");
  const warn = toneColors("warn");
  const tone = state === "CLOSED" ? good : state === "OPEN" ? bad : warn;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={vis} filename="circuit-breaker.ts" icon="switch" right={state}>
      <div style={{ padding: 34, display: "flex", flexDirection: "column", gap: 20, fontFamily: sans }}>
        <div
          style={{
            padding: 24,
            borderRadius: 18,
            background: tone.bg,
            border: `2px solid ${state === "CLOSED" ? GREEN : state === "OPEN" ? RED : "#FF9F0A"}`,
            fontFamily: mono,
            fontSize: 28,
            fontWeight: 700,
            color: tone.fg,
          }}
        >
          State: {state}
        </div>
      </div>
    </DevCard>
  );
};
