import { useCurrentFrame } from "remotion";
import { TX } from "../../layout";
import { C, mono, prog, sans } from "../../theme";
import { DevCard, toneColors } from "../dev/card";
import { GREEN, presence, RED } from "../diagram/Node";

export const CapTriangle: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  partitionAt?: number;
  highlightMode?: "CP" | "AP";
}> = ({ x = TX, y, w = 900, h = 760, at, until, partitionAt, highlightMode = "CP" }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;
  const cut = partitionAt !== undefined ? prog(frame, partitionAt, 12) : 0;
  const good = toneColors("good");
  const bad = toneColors("bad");

  return (
    <DevCard x={x} y={y} w={w} h={h} p={vis} filename="cap-theorem.svg" icon="sitemap" right={`CAP · ${highlightMode}`}>
      <div style={{ padding: 34, display: "flex", flexDirection: "column", gap: 22, fontFamily: sans }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { k: "C", title: "Consistency", sub: "Every read sees latest write", active: highlightMode === "CP" },
            { k: "A", title: "Availability", sub: "Every request gets a response", active: highlightMode === "AP" },
            { k: "P", title: "Partition Tolerance", sub: "Survives network split", active: true },
          ].map((item) => (
            <div
              key={item.k}
              style={{
                padding: 20,
                borderRadius: 18,
                background: item.active ? good.bg : "#F5F5F7",
                border: `2px solid ${item.active ? GREEN : C.line}`,
              }}
            >
              <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 700, color: item.active ? good.fg : C.ink }}>{item.k}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 6 }}>{item.title}</div>
              <div style={{ fontSize: 18, color: C.mute, marginTop: 4 }}>{item.sub}</div>
            </div>
          ))}
        </div>
        {cut > 0 ? (
          <div style={{ padding: "16px 22px", borderRadius: 16, background: bad.bg, border: `1.5px solid ${RED}`, fontFamily: mono, fontSize: 21, fontWeight: 700, color: bad.fg }}>
            Network partition active → Pick Consistency (CP) or Availability (AP)
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
