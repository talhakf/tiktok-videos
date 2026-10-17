import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { DevCard, focusTrack, TAB_H, Tone, toneColors } from "../dev/card";
import { presence } from "../diagram/Node";
import { TX } from "../../layout";
import { C, materialize, mono, prog, sans } from "../../theme";

export type ByteSectionTone = Tone | "neutral";

export type ByteSection = {
  label: string;
  sub?: string;
  magic?: string;
  range?: string;
  share: number;
  tone?: ByteSectionTone;
  icon?: IconName;
  at?: number;
  readDir?: "down" | "up";
};

export type ByteMapFocus = {
  index: number;
  at: number;
  until?: number;
  note?: string;
};

const sectionPalette = (tone: ByteSectionTone = "neutral") => {
  if (tone === "neutral") {
    return {
      bg: "#F5F5F7",
      edge: "#8E8E93",
      fg: C.ink,
      bar: "#C7C7CC",
    };
  }
  const tc = toneColors(tone, false);
  return { ...tc, bar: tc.edge };
};

/**
 * File anatomy / polyglot byte-layout card.
 * Shows both a proportional segmented byte-offset ribbon and detailed section blocks
 * with magic byte pills, offset ranges, and directional parser indicators (top→down vs bottom→up).
 */
export const ByteMap: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  title?: string;
  totalSize?: string;
  sections: ByteSection[];
  focus?: ByteMapFocus[];
  style?: React.CSSProperties;
}> = ({ x = TX, y, w = 900, at, until, title = "byte layout", totalSize, sections, focus = [], style }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const totalShare = Math.max(
    1,
    sections.reduce((acc, s) => acc + Math.max(0.05, s.share), 0),
  );
  const track = focusTrack(frame, focus);
  const hasNotes = focus.some((f) => f.note);

  const rowH = 104;
  const rowGap = 14;
  const ribbonH = 58;
  const noteH = hasNotes ? 62 : 0;
  const padY = 26;
  const bodyH =
    padY * 2 +
    ribbonH +
    22 +
    sections.length * rowH +
    Math.max(0, sections.length - 1) * rowGap +
    (noteH ? noteH + 16 : 0);
  const cardH = TAB_H + bodyH;

  const activeNote = track ? (track.t > 0.5 ? track.cur.note : track.prev?.note ?? track.cur.note) : undefined;
  const activeFocusIndex = track ? (track.t > 0.5 ? track.cur.index : track.prev?.index ?? track.cur.index) : null;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      filename={title}
      icon="file"
      right={totalSize ? `${totalSize} · 0x00..EOF` : "0x00..EOF"}
      style={style}
    >
      <div style={{ padding: `${padY}px 28px`, display: "flex", flexDirection: "column" }}>
        {/* Proportional horizontal byte bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 19, color: C.mute }}>
            <span>0x0000 (BOF)</span>
            <span>byte map</span>
            <span>EOF {totalSize ? `(${totalSize})` : ""}</span>
          </div>
          <div
            style={{
              height: 26,
              borderRadius: 10,
              background: "#F2F2F4",
              border: `1px solid ${C.line}`,
              display: "flex",
              overflow: "hidden",
              gap: 3,
              padding: 3,
            }}
          >
            {sections.map((s, i) => {
              const sStart = s.at ?? at + 5 + i * 5;
              const sP = prog(frame, sStart, 10);
              const pal = sectionPalette(s.tone);
              const isFocused = activeFocusIndex === null || activeFocusIndex === i;
              return (
                <div
                  key={i}
                  style={{
                    flex: Math.max(0.05, s.share) / totalShare,
                    borderRadius: 6,
                    background: pal.bar,
                    opacity: sP * (isFocused ? 1 : 0.35),
                    transformOrigin: "0% 50%",
                    scale: `${0.2 + 0.8 * sP} 1`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Section blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: rowGap }}>
          {sections.map((s, i) => {
            const sStart = s.at ?? at + 6 + i * 6;
            const sP = prog(frame, sStart, 10);
            const pal = sectionPalette(s.tone);
            const focusedWeight =
              track === null
                ? 1
                : track.cur.index === i
                  ? track.prev
                    ? track.t
                    : 1
                  : track.prev?.index === i
                    ? 1 - track.t
                    : 0;
            const dimFactor = track ? 1 - track.o * (1 - focusedWeight) * 0.48 : 1;
            const isHighlighted = track !== null && focusedWeight > 0.5;

            return (
              <div
                key={i}
                style={{
                  height: rowH,
                  borderRadius: 20,
                  background: pal.bg,
                  border: `${isHighlighted ? 3 : 2}px solid ${isHighlighted ? pal.edge : s.tone && s.tone !== "neutral" ? pal.edge : C.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 24px",
                  position: "relative",
                  overflow: "hidden",
                  ...materialize(sP, 0.96, 6),
                  opacity: sP * dimFactor,
                }}
              >
                {/* Left accent strip */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 8,
                    background: pal.edge,
                  }}
                />

                {/* Icon + Label + Sub */}
                <div style={{ display: "flex", alignItems: "center", gap: 18, paddingLeft: 6, minWidth: 0 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: C.white,
                      border: `1.5px solid ${C.line}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={s.icon ?? "box"} size={30} color={pal.fg} draw={prog(frame, sStart + 2, 12)} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          fontFamily: sans,
                          fontWeight: 700,
                          fontSize: 27,
                          letterSpacing: "-0.02em",
                          color: C.ink,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.label}
                      </span>
                      {s.range ? (
                        <span
                          style={{
                            fontFamily: mono,
                            fontWeight: 500,
                            fontSize: 20,
                            color: C.mute,
                            background: "rgba(255,255,255,0.75)",
                            padding: "2px 10px",
                            borderRadius: 8,
                            border: `1px solid ${C.line}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.range}
                        </span>
                      ) : null}
                    </div>
                    {s.sub ? (
                      <div
                        style={{
                          fontFamily: sans,
                          fontWeight: 500,
                          fontSize: 21,
                          color: C.mute,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.sub}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Right: Magic bytes pill + Read direction badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  {s.readDir ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 14px",
                        borderRadius: 12,
                        background: C.white,
                        border: `1.5px solid ${pal.edge}`,
                        fontFamily: sans,
                        fontWeight: 600,
                        fontSize: 20,
                        color: pal.fg,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 22 }}>
                        {s.readDir === "down" ? "↓" : "↑"}
                      </span>
                      <span>{s.readDir === "down" ? "top → down" : "bottom → up"}</span>
                    </div>
                  ) : null}

                  {s.magic ? (
                    <div
                      style={{
                        padding: "8px 16px",
                        borderRadius: 12,
                        background: "#1E1E1E",
                        color: "#F5F5F7",
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 22,
                        letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                        border: `2px solid ${pal.edge}`,
                      }}
                    >
                      {s.magic}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active focus note callout */}
        {hasNotes ? (
          <div
            style={{
              height: noteH,
              marginTop: 16,
              borderRadius: 16,
              background: track && activeNote ? "#EBF4FF" : "#F5F5F7",
              border: `2px solid ${track && activeNote ? C.accent : C.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 22px",
              opacity: track && activeNote ? track.o : 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Icon name="info" size={26} color={C.accent} />
              <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 23, color: C.ink, letterSpacing: "-0.01em" }}>
                {activeNote ?? ""}
              </span>
            </div>
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 20, color: C.accent }}>
              {activeFocusIndex !== null && sections[activeFocusIndex] ? sections[activeFocusIndex].label : ""}
            </span>
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
