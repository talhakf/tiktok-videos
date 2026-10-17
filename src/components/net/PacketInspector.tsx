import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";
import { DevCard, focusTrack, mixTone, TAB_H, Tone, toneColors } from "../dev/card";
import { lerp, presence } from "../diagram/Node";

export type CapturedPacket = {
  no?: number;
  time: string;
  src: string;
  dst: string;
  proto: string;
  info: string;
  tone?: Tone;
  at?: number;
};

export type PacketSelectCue = {
  index: number;
  at: number;
  until?: number;
};

export type DissectionLayer = {
  title: string;
  detail: string;
  highlight?: boolean;
  tone?: Tone;
  icon?: IconName;
  at?: number;
};

const protoBadgeColors = (proto: string, tone?: Tone) => {
  if (tone) {
    const tc = toneColors(tone);
    return { bg: tc.bg, fg: tc.fg };
  }
  const u = proto.toUpperCase();
  if (u.includes("TLS") || u.includes("HTTPS") || u.includes("SSH")) {
    return { bg: "#EEFAF1", fg: "#248A3D" };
  }
  if (u.includes("HTTP")) {
    return { bg: "rgba(255,159,10,0.16)", fg: "#A05A00" };
  }
  if (u.includes("DNS") || u.includes("UDP")) {
    return { bg: "#EBF4FF", fg: C.accent };
  }
  return { bg: "#F2F2F4", fg: C.ink };
};

/**
 * Wireshark / tcpdump packet capture & protocol layer dissection card.
 * Top pane lists captured packets with a gliding selection band (`select`);
 * bottom pane dissects the frame into OSI / protocol layers (`layers`).
 */
export const PacketInspector: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  title?: string;
  packets: CapturedPacket[];
  select?: PacketSelectCue[];
  layers?: DissectionLayer[];
}> = ({ x = TX, y, w = 900, at, until, title = "Packet capture", packets, select = [], layers = [] }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const colHeaderH = 44;
  const pktRowH = 54;
  const pktSectionH = colHeaderH + packets.length * pktRowH + 8;

  const hasLayers = layers.length > 0;
  const dividerH = hasLayers ? 44 : 0;
  const layerRowH = 62;
  const layerGap = 10;
  const layersPadY = hasLayers ? 18 : 0;
  const layersSectionH = hasLayers ? layersPadY * 2 + layers.length * layerRowH + Math.max(0, layers.length - 1) * layerGap : 0;

  const totalH = TAB_H + pktSectionH + dividerH + layersSectionH;

  // Gliding selection band across packet rows
  const track = focusTrack(frame, select, 10, 8);
  let band: null | { top: number; colors: ReturnType<typeof mixTone>; o: number } = null;
  if (track) {
    const curIdx = Math.max(0, Math.min(packets.length - 1, track.cur.index));
    const prevIdx = track.prev ? Math.max(0, Math.min(packets.length - 1, track.prev.index)) : curIdx;
    const curTone: Tone = packets[curIdx]?.tone ?? "accent";
    const prevTone: Tone = packets[prevIdx]?.tone ?? curTone;
    const topA = colHeaderH + prevIdx * pktRowH;
    const topB = colHeaderH + curIdx * pktRowH;
    band = {
      top: lerp(topA, topB, track.t),
      colors: mixTone(prevTone, curTone, track.t),
      o: track.o,
    };
  }

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={totalH}
      p={vis}
      filename={title}
      icon="search"
      right={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: "#34C759" }} />
          <span>en0 · live</span>
        </div>
      }
    >
      {/* Top Pane: Packet Table */}
      <div style={{ position: "relative", height: pktSectionH }}>
        {/* Column Headers */}
        <div
          style={{
            height: colHeaderH,
            background: "#FAFAFC",
            borderBottom: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 17,
            color: C.mute,
          }}
        >
          <div style={{ width: 52 }}>No.</div>
          <div style={{ width: 92 }}>Time</div>
          <div style={{ width: 185 }}>Source</div>
          <div style={{ width: 185 }}>Destination</div>
          <div style={{ width: 98 }}>Proto</div>
          <div style={{ flex: 1 }}>Info</div>
        </div>

        {/* Gliding Selection Band */}
        {band ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: band.top,
              height: pktRowH,
              background: band.colors.bg,
              borderLeft: `5px solid ${band.colors.edge}`,
              opacity: band.o,
            }}
          />
        ) : null}

        {/* Packet Rows */}
        {packets.map((pkt, i) => {
          const pktAt = pkt.at ?? at + 3 + i * 4;
          if (frame < pktAt) return null;
          const rp = prog(frame, pktAt, 8, easeOut);
          const badge = protoBadgeColors(pkt.proto, pkt.tone);
          const rowTone = pkt.tone ? toneColors(pkt.tone) : null;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: colHeaderH + i * pktRowH,
                height: pktRowH,
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                borderBottom: i < packets.length - 1 ? "1px solid rgba(0,0,0,0.05)" : undefined,
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 19,
                color: C.ink,
                opacity: rp,
                translate: `0px ${(1 - rp) * 8}px`,
              }}
            >
              <div style={{ width: 52, color: C.mute, fontVariantNumeric: "tabular-nums" }}>{pkt.no ?? i + 1}</div>
              <div style={{ width: 92, color: C.mute, fontVariantNumeric: "tabular-nums" }}>{pkt.time}</div>
              <div style={{ width: 185, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 10 }}>
                {pkt.src}
              </div>
              <div style={{ width: 185, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 10 }}>
                {pkt.dst}
              </div>
              <div style={{ width: 98 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: 8,
                    background: badge.bg,
                    color: badge.fg,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {pkt.proto}
                </span>
              </div>
              <div
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: rowTone ? rowTone.fg : C.ink,
                  fontWeight: pkt.tone ? 700 : 500,
                }}
              >
                {pkt.info}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Pane: Protocol Dissection Layers */}
      {hasLayers ? (
        <div style={{ position: "relative" }}>
          {/* Section Divider */}
          <div
            style={{
              height: dividerH,
              background: "#F2F2F4",
              borderTop: `1px solid ${C.line}`,
              borderBottom: `1px solid ${C.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 18,
              color: C.mute,
            }}
          >
            <span>Protocol layer dissection</span>
            <span style={{ fontFamily: mono, fontSize: 16 }}>OSI layers 2 → 7</span>
          </div>

          {/* Layer Cards */}
          <div style={{ padding: `${layersPadY}px 24px`, display: "flex", flexDirection: "column", gap: layerGap }}>
            {layers.map((layer, idx) => {
              const lAt = layer.at ?? at + 12 + idx * 5;
              if (frame < lAt) return null;
              const lp = prog(frame, lAt, 9, easeOut);
              const isHighlighted = Boolean(layer.highlight || layer.tone);
              const tc = isHighlighted ? toneColors(layer.tone ?? "accent") : null;
              const iconName: IconName =
                layer.icon ??
                (layer.tone === "bad"
                  ? "unlock"
                  : layer.tone === "good"
                    ? "lock"
                    : layer.tone === "warn"
                      ? "warning"
                      : "box");

              return (
                <div
                  key={idx}
                  style={{
                    height: layerRowH,
                    borderRadius: 14,
                    background: tc ? tc.bg : "#F7F7FA",
                    border: `1.5px solid ${tc ? tc.edge : C.line}`,
                    borderLeft: tc ? `6px solid ${tc.edge}` : `1.5px solid ${C.line}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "0 20px",
                    ...materialize(lp),
                  }}
                >
                  <Icon name={iconName} size={24} color={tc ? tc.fg : C.mute} weight={2.1} draw={prog(frame, lAt + 2, 10)} />
                  <div
                    style={{
                      fontFamily: sans,
                      fontWeight: 600,
                      fontSize: 20,
                      color: tc ? tc.fg : C.ink,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {layer.title}
                  </div>
                  <div style={{ width: 1, height: 24, background: C.line }} />
                  <div
                    style={{
                      flex: 1,
                      fontFamily: mono,
                      fontWeight: isHighlighted ? 700 : 500,
                      fontSize: 19,
                      color: tc ? tc.fg : C.mute,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {layer.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </DevCard>
  );
};
