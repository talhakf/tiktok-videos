import { useCurrentFrame } from "remotion";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

// Regex101-style live pattern matcher & breakdown card:
// 1. Top bar: `/pattern/flags` with colour-coded regex parts
// 2. Middle: test string with highlighted match spans and capture group pills ($1, $2, $3)
// 3. Bottom: explanation list showing what each piece of the regex matches

export type RegexPart = {
  expr: string;
  desc: string;
  color?: string;
  group?: number;
  example?: string;
  at?: number;
};

export type RegexMatchSpan = {
  start: number;
  end: number;
  group?: number;
  color?: string;
  label?: string;
  at?: number;
};

export type RegexGroupPill = {
  index: number;
  name?: string;
  value: string;
  color?: string;
  at?: number;
};

const LIGHT_PART_COLORS = [
  "#0071E3", // system blue
  "#8E3CCB", // purple
  "#248A3D", // green
  "#C95A00", // amber
  "#0E7490", // teal
  "#C9281E", // red
];

const DARK_PART_COLORS = [
  TERM.blue,
  TERM.purple,
  TERM.green,
  TERM.orange,
  TERM.cyan,
  TERM.red,
];

export const RegexCard: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  parts: RegexPart[];
  flags?: string;
  testString: string;
  matches?: RegexMatchSpan[];
  groups?: RegexGroupPill[];
  stepAt?: number;
  stepGap?: number;
  dark?: boolean;
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  x = 90,
  y,
  w = 900,
  h,
  at = 0,
  until,
  parts,
  flags = "g",
  testString,
  matches = [],
  groups = [],
  stepAt,
  stepGap = 12,
  dark = false,
  filename = "regex",
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const palette = dark ? DARK_PART_COLORS : LIGHT_PART_COLORS;
  const colorOf = (idx: number, custom?: string) => custom ?? palette[idx % palette.length];
  const baseStep = stepAt ?? at + 10;

  // Determine which part is currently being stepped/highlighted
  const partTimes = parts.map((pt, i) => pt.at ?? baseStep + i * stepGap);
  let activeIdx = -1;
  for (let i = 0; i < partTimes.length; i++) {
    if (frame >= partTimes[i]) activeIdx = i;
  }

  // Build segments for the testString so each character can be styled if inside a match span
  type CharSpan = { text: string; span?: RegexMatchSpan; spanIdx?: number };
  const sortedSpans = [...matches].sort((a, b) => a.start - b.start);
  const segments: CharSpan[] = [];
  let cursor = 0;
  sortedSpans.forEach((sp, idx) => {
    const s = Math.max(cursor, Math.min(testString.length, sp.start));
    const e = Math.max(s, Math.min(testString.length, sp.end));
    if (s > cursor) segments.push({ text: testString.slice(cursor, s) });
    if (e > s) segments.push({ text: testString.slice(s, e), span: sp, spanIdx: idx });
    cursor = e;
  });
  if (cursor < testString.length) segments.push({ text: testString.slice(cursor) });

  const rowH = 62;
  const hasGroups = groups.length > 0;
  const topSectionH = 112;
  const midSectionH = hasGroups ? 176 : 118;
  const listHeaderH = 48;
  const bottomPad = 24;
  const bodyH = topSectionH + midSectionH + listHeaderH + parts.length * rowH + bottomPad;
  const cardH = h ?? (filename !== undefined ? TAB_H : 0) + bodyH;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const subBg = dark ? "rgba(255,255,255,0.05)" : "#F6F6F9";
  const borderCol = dark ? "rgba(255,255,255,0.1)" : C.line;

  // Gliding focus band across the explanation rows
  const prevIdx = Math.max(0, activeIdx - 1);
  const bandGlide = activeIdx >= 0 ? prog(frame, partTimes[activeIdx], 9, easeInOut) : 0;
  const bandRow = activeIdx <= 0 ? Math.max(0, activeIdx) : lerp(prevIdx, activeIdx, bandGlide);
  const bandOpacity = activeIdx >= 0 ? prog(frame, partTimes[0], 8) : 0;
  const activeColor = activeIdx >= 0 ? colorOf(activeIdx, parts[activeIdx]?.color) : C.accent;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      dark={dark}
      filename={filename}
      icon="regex"
      right={right ?? (groups.length > 0 ? `${groups.length} capture groups` : "pattern breakdown")}
      style={style}
    >
      {/* 1. Top Bar: /pattern/flags with colour-coded parts */}
      <div
        style={{
          padding: "20px 28px 16px",
          borderBottom: `1px solid ${borderCol}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          height: topSectionH,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flex: 1,
            height: 68,
            borderRadius: 16,
            background: subBg,
            border: `1.5px solid ${borderCol}`,
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: mono,
            fontSize: 28,
            fontWeight: 600,
            overflow: "hidden",
          }}
        >
          <span style={{ color: mute, fontWeight: 500 }}>/</span>
          {parts.map((pt, i) => {
            const col = colorOf(i, pt.color);
            const reveal = prog(frame, partTimes[i], 10, easeOut);
            const isCurrent = i === activeIdx;
            return (
              <span
                key={i}
                style={{
                  padding: "4px 9px",
                  borderRadius: 10,
                  background: reveal > 0 ? tint(col, dark ? 0.22 * reveal : (isCurrent ? 0.18 : 0.11) * reveal) : "transparent",
                  border: `1.5px solid ${reveal > 0 ? tint(col, (isCurrent ? 0.65 : 0.3) * reveal) : "transparent"}`,
                  color: reveal > 0.2 ? col : fg,
                  scale: String(1 + (isCurrent ? 0.04 * Math.sin(reveal * Math.PI) : 0)),
                  display: "inline-block",
                }}
              >
                {pt.expr}
              </span>
            );
          })}
          <span style={{ color: mute, fontWeight: 500 }}>/{flags}</span>
        </div>

        <div
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            background: tint(GREEN, dark ? 0.2 : 0.12),
            border: `1.5px solid ${tint(GREEN, 0.35)}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 21,
            color: dark ? TERM.green : "#248A3D",
            whiteSpace: "nowrap",
          }}
        >
          match found
        </div>
      </div>

      {/* 2. Middle: Test String + Highlighted Match Spans + Capture Group Pills */}
      <div
        style={{
          padding: "18px 28px",
          borderBottom: `1px solid ${borderCol}`,
          height: midSectionH,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontFamily: mono,
              fontSize: 20,
              fontWeight: 600,
              color: mute,
              width: 86,
              flexShrink: 0,
            }}
          >
            test str
          </span>
          <div
            style={{
              flex: 1,
              height: 62,
              borderRadius: 14,
              background: subBg,
              border: `1px solid ${borderCol}`,
              padding: "0 18px",
              display: "flex",
              alignItems: "center",
              fontFamily: mono,
              fontSize: 26,
              fontWeight: 500,
              color: fg,
              whiteSpace: "pre",
              overflow: "hidden",
            }}
          >
            {segments.map((seg, i) => {
              if (!seg.span) {
                return <span key={i}>{seg.text}</span>;
              }
              const sp = seg.span;
              const colIdx = sp.group ? sp.group - 1 : seg.spanIdx ?? 0;
              const col = colorOf(colIdx, sp.color);
              const spAt = sp.at ?? baseStep + colIdx * stepGap + 4;
              const spP = prog(frame, spAt, 10, easeOut);
              return (
                <span
                  key={i}
                  style={{
                    padding: "3px 8px",
                    margin: "0 2px",
                    borderRadius: 9,
                    background: spP > 0 ? tint(col, (dark ? 0.24 : 0.14) * spP) : "transparent",
                    borderBottom: `3px solid ${spP > 0 ? tint(col, spP) : "transparent"}`,
                    color: spP > 0.3 ? col : fg,
                    fontWeight: 700,
                  }}
                >
                  {seg.text}
                </span>
              );
            })}
          </div>
        </div>

        {hasGroups ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                fontFamily: mono,
                fontSize: 20,
                fontWeight: 600,
                color: mute,
                width: 86,
                flexShrink: 0,
              }}
            >
              groups
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap", overflow: "hidden" }}>
              {groups.map((g, i) => {
                const col = colorOf(g.index - 1, g.color);
                const gAt = g.at ?? baseStep + (g.index - 1) * stepGap + 6;
                const gP = prog(frame, gAt, 11, easeOut);
                return (
                  <div
                    key={g.index ?? i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 14px 6px 10px",
                      borderRadius: 12,
                      background: tint(col, dark ? 0.18 : 0.1),
                      border: `1.5px solid ${tint(col, 0.35)}`,
                      ...materialize(gP),
                    }}
                  >
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 7,
                        background: col,
                        color: C.white,
                        fontFamily: mono,
                        fontWeight: 700,
                        fontSize: 19,
                      }}
                    >
                      ${g.index}
                    </span>
                    {g.name ? (
                      <span style={{ fontFamily: sans, fontSize: 20, fontWeight: 500, color: mute }}>{g.name}:</span>
                    ) : null}
                    <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: fg }}>
                      &quot;{g.value}&quot;
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. Bottom: Explanation List */}
      <div style={{ position: "relative", padding: "12px 0 16px" }}>
        <div
          style={{
            padding: "4px 28px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 19,
            fontWeight: 600,
            color: mute,
          }}
        >
          <span>token breakdown</span>
          <span>meaning</span>
        </div>

        {/* Gliding active band */}
        {bandOpacity > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: listHeaderH + bandRow * rowH,
              height: rowH,
              background: tint(activeColor, dark ? 0.14 : 0.08),
              borderLeft: `5px solid ${activeColor}`,
              opacity: bandOpacity,
            }}
          />
        ) : null}

        {parts.map((pt, i) => {
          const col = colorOf(i, pt.color);
          const rowP = prog(frame, at + 6 + i * 3, 10, easeOut);
          const litP = prog(frame, partTimes[i], 10, easeOut);
          return (
            <div
              key={i}
              style={{
                height: rowH,
                padding: "0 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                position: "relative",
                ...materialize(rowP),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 230 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    background: col,
                    opacity: 0.45 + 0.55 * litP,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 9,
                    background: tint(col, dark ? 0.2 : 0.12),
                    border: `1.5px solid ${tint(col, 0.32)}`,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 23,
                    color: col,
                  }}
                >
                  {pt.expr}
                </span>
                {pt.group !== undefined ? (
                  <span
                    style={{
                      padding: "2px 9px",
                      borderRadius: 7,
                      background: dark ? "rgba(255,255,255,0.08)" : BLUE_TINT,
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 18,
                      color: col,
                    }}
                  >
                    ${pt.group}
                  </span>
                ) : null}
              </div>

              <div
                style={{
                  flex: 1,
                  fontFamily: sans,
                  fontSize: 24,
                  fontWeight: 500,
                  color: fg,
                  opacity: 0.65 + 0.35 * litP,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {pt.desc}
              </div>

              {pt.example ? (
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 21,
                    fontWeight: 600,
                    color: mute,
                    padding: "3px 10px",
                    borderRadius: 8,
                    background: subBg,
                  }}
                >
                  {pt.example}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
