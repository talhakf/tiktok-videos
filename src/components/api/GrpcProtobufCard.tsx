import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, TERM } from "../../theme";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type ProtoSegmentSpec = {
  fieldTag: string;
  fieldName: string;
  hexBytes: string[];
  meaning: string;
  jsonEquivalent: string;
  jsonBytes: number;
  color: string;
};

const DEFAULT_SEGMENTS: ProtoSegmentSpec[] = [
  {
    fieldTag: "tag #1 · varint",
    fieldName: "id = 42",
    hexBytes: ["08", "2A"],
    meaning: "tag(1,0)=0x08 · val=42",
    jsonEquivalent: '"id": 42,',
    jsonBytes: 10,
    color: "#0071E3",
  },
  {
    fieldTag: "tag #2 · len=4",
    fieldName: 'name = "sudo"',
    hexBytes: ["12", "04", "73", "75", "64", "6F"],
    meaning: 'tag(2,2)=0x12 · len=4 · "sudo"',
    jsonEquivalent: '"name": "sudo",',
    jsonBytes: 16,
    color: "#8E4EC6",
  },
  {
    fieldTag: "tag #3 · varint",
    fieldName: "active = true",
    hexBytes: ["18", "01"],
    meaning: "tag(3,0)=0x18 · val=1",
    jsonEquivalent: '"active": true',
    jsonBytes: 14,
    color: "#248A3D",
  },
];

/**
 * JSON vs Protocol Buffers (gRPC) binary serialization card:
 * Shows verbose JSON (`{"id": 42, "name": "sudo", "active": true}` · `45 bytes`)
 * compacting at `encodeAt` into field-tag binary bytes
 * (`08 2A 12 04 73 75 64 6F 18 01` · `10 bytes · 78% smaller`).
 */
export const GrpcProtobufCard: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  encodeAt?: number;
  jsonText?: string;
  jsonBytes?: number;
  protoBytes?: number;
  segments?: ProtoSegmentSpec[];
}> = ({
  x = TX,
  y,
  w = TW,
  at,
  until,
  encodeAt,
  jsonText = '{"id": 42, "name": "sudo", "active": true}',
  jsonBytes = 45,
  protoBytes = 10,
  segments = DEFAULT_SEGMENTS,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const warnTone = toneColors("warn");
  const goodTone = toneColors("good");

  const encStart = encodeAt ?? at + 26;
  const encodeP = prog(frame, encStart, 14, easeInOut);
  const bytesDoneP = prog(frame, encStart + 10, 10, easeOut);

  const savingsPct = Math.round((1 - protoBytes / jsonBytes) * 100);
  const bodyH = 776;
  const totalH = TAB_H + bodyH;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={totalH}
      p={vis}
      filename="user.proto · gRPC binary wire format"
      icon="binary"
      right={encodeP > 0.3 ? `${protoBytes} bytes · ${savingsPct}% smaller` : `${jsonBytes} bytes JSON`}
    >
      <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* 1. Verbose JSON Text Payload vs .proto Contract */}
        <div style={{ display: "grid", gridTemplateColumns: "1.18fr 0.82fr", gap: 16 }}>
          {/* Verbose JSON Box */}
          <div
            style={{
              borderRadius: 20,
              background: "#FAFAFC",
              border: `1.5px solid ${tint(AMBER, 0.45)}`,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: warnTone.bg,
                  fontFamily: mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: warnTone.fg,
                }}
              >
                REST / JSON (ASCII text)
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: warnTone.fg,
                }}
              >
                {jsonBytes} bytes
              </span>
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: C.white,
                border: `1px solid ${C.line}`,
                fontFamily: mono,
                fontSize: 17.5,
                fontWeight: 700,
                color: C.ink,
                letterSpacing: "-0.01em",
                wordBreak: "break-all",
              }}
            >
              {jsonText}
            </div>

            {/* JSON Byte Bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 14, color: C.mute }}>
                <span>repeated field names + quotes + braces</span>
                <span>100% size</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "#ECECEF", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: AMBER, borderRadius: 999 }} />
              </div>
            </div>
          </div>

          {/* .proto Schema Box */}
          <div
            style={{
              borderRadius: 20,
              background: TERM.bg,
              padding: "16px 20px",
              fontFamily: mono,
              fontSize: 15,
              lineHeight: 1.5,
              color: TERM.fg,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: TERM.dim, fontSize: 14 }}>
              <span>schema contract</span>
              <span style={{ color: TERM.cyan, fontWeight: 700 }}>field tags 1..3</span>
            </div>
            <div>
              <div>
                <span style={{ color: TERM.purple, fontWeight: 700 }}>message</span>{" "}
                <span style={{ color: TERM.yellow, fontWeight: 700 }}>User</span> {"{"}
              </div>
              <div style={{ paddingLeft: 16 }}>
                <span style={{ color: TERM.blue }}>int32</span> id ={" "}
                <span style={{ color: TERM.green, fontWeight: 700 }}>1</span>;
              </div>
              <div style={{ paddingLeft: 16 }}>
                <span style={{ color: TERM.blue }}>string</span> name ={" "}
                <span style={{ color: TERM.green, fontWeight: 700 }}>2</span>;
              </div>
              <div style={{ paddingLeft: 16 }}>
                <span style={{ color: TERM.blue }}>bool</span> active ={" "}
                <span style={{ color: TERM.green, fontWeight: 700 }}>3</span>;
              </div>
              <div>{"}"}</div>
            </div>
            <div style={{ fontSize: 13.5, color: TERM.dim }}>
              Keys become 1-byte numeric tags
            </div>
          </div>
        </div>

        {/* 2. Serialization & Compaction Strip */}
        <div
          style={{
            borderRadius: 16,
            background: encodeP > 0.2 ? BLUE_TINT : "#F5F5F7",
            border: `1.5px solid ${encodeP > 0.2 ? C.accent : C.line}`,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="arrowDown" size={22} color={encodeP > 0.2 ? C.accent : C.mute} weight={2.4} />
            <span style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>
              Protocol Buffers binary encoding (tag + wire-type + bytes)
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 180, height: 12, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${lerp(100, (protoBytes / jsonBytes) * 100, encodeP)}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: encodeP > 0.5 ? GREEN : C.accent,
                }}
              />
            </div>
            <span
              style={{
                fontFamily: mono,
                fontSize: 17,
                fontWeight: 700,
                color: encodeP > 0.5 ? goodTone.fg : C.accent,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(lerp(jsonBytes, protoBytes, encodeP))} B
            </span>
          </div>
        </div>

        {/* 3. Protocol Buffers Binary Output + Field-Tag Breakdown */}
        <div
          style={{
            borderRadius: 22,
            background: "#F5FBF7",
            border: `2px solid ${GREEN}`,
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            ...materialize(Math.max(0.15, encodeP)),
          }}
        >
          {/* Full Binary Hex Stream Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: goodTone.bg,
                  fontFamily: mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: goodTone.fg,
                }}
              >
                PROTOBUF WIRE BYTES
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 21,
                  fontWeight: 700,
                  color: C.ink,
                  letterSpacing: "0.03em",
                  background: C.white,
                  padding: "5px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${tint(GREEN, 0.45)}`,
                }}
              >
                08 2A 12 04 73 75 64 6F 18 01
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                background: goodTone.bg,
                border: `1.5px solid ${GREEN}`,
                fontFamily: mono,
                fontSize: 18,
                fontWeight: 700,
                color: goodTone.fg,
                ...materialize(Math.max(0.3, bytesDoneP)),
              }}
            >
              <Icon name="bolt" size={18} color={goodTone.fg} weight={2.3} />
              {protoBytes} bytes · {savingsPct}% smaller
            </div>
          </div>

          {/* 3 Field-Tag Segment Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.35fr 0.85fr", gap: 12 }}>
            {segments.map((seg, i) => {
              const segP = prog(frame, encStart + 2 + i * 5, 10, easeOut);
              return (
                <div
                  key={seg.fieldName}
                  style={{
                    borderRadius: 16,
                    background: C.white,
                    border: `2px solid ${tint(seg.color, 0.4)}`,
                    borderTop: `6px solid ${seg.color}`,
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 10,
                    ...materialize(segP),
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: tint(seg.color, 0.12),
                        fontFamily: mono,
                        fontSize: 14,
                        fontWeight: 700,
                        color: seg.color,
                      }}
                    >
                      {seg.fieldTag}
                    </span>
                    <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: C.ink }}>
                      {seg.hexBytes.length} B
                    </span>
                  </div>

                  {/* Hex Pucks */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {seg.hexBytes.map((hex, idx) => (
                      <div
                        key={`${hex}-${idx}`}
                        style={{
                          padding: "6px 9px",
                          borderRadius: 8,
                          background: idx === 0 ? seg.color : tint(seg.color, 0.12),
                          color: idx === 0 ? C.white : seg.color,
                          fontFamily: mono,
                          fontSize: 18,
                          fontWeight: 700,
                        }}
                      >
                        {hex}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: C.ink }}>
                      {seg.fieldName}
                    </div>
                    <div style={{ fontFamily: mono, fontSize: 13, color: C.mute }}>
                      {seg.meaning}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        paddingTop: 6,
                        borderTop: `1px dashed ${C.line}`,
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: mono,
                        fontSize: 13,
                        color: C.mute,
                      }}
                    >
                      <span style={{ textDecoration: "line-through" }}>{seg.jsonEquivalent}</span>
                      <span style={{ color: RED, fontWeight: 700 }}>{seg.jsonBytes} B</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DevCard>
  );
};
