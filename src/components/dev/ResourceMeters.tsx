import { interpolateColors, useCurrentFrame } from "remotion";
import { presence } from "../diagram/Node";
import { RED } from "../layouts/Mark";
import { C, easeInOut, mono, prog } from "../../theme";
import { AMBER, DevCard, TAB_H } from "./card";

// htop-style resource bars on a white card: a grid of CPU cores and full-width meters (memory, swap).
// Values glide to new targets only on key frames (no random jitter), and a bar turns amber past `warn`
// and red past `bad` (overloaded = wrong). Use it for "this loop pins one core", "the leak eats memory".

export type MeterKey = { at: number; value: number };
export type Meter = {
  label: string;
  keys: MeterKey[]; // value before the first key is 0: the bar grows in on the first key
  max?: number; // default 100
  unit?: string; // "GiB" for display "of"
  decimals?: number;
  display?: "percent" | "of"; // "73%" or "3.1/16 GiB"
};

/** Value of a meter at `frame`: each key glides from the previous value (easeInOut, `dur` frames). */
export const meterValue = (keys: MeterKey[], frame: number, dur = 14) => {
  let v = 0;
  for (const k of [...keys].sort((a, b) => a.at - b.at)) {
    if (frame < k.at) break;
    v = v + (k.value - v) * prog(frame, k.at, dur, easeInOut);
  }
  return v;
};

const label = (m: Meter, v: number) => {
  const max = m.max ?? 100;
  const d = m.decimals ?? (m.display === "of" ? 1 : 0);
  if (m.display === "of") return `${v.toFixed(d)}/${max}${m.unit ? ` ${m.unit}` : ""}`;
  return `${((v / max) * 100).toFixed(d)}%`;
};

const MeterRow: React.FC<{
  m: Meter;
  frame: number;
  labelW: number;
  valueW: number;
  barH: number;
  size: number;
  warn: number;
  bad: number;
  dur: number;
}> = ({ m, frame, labelW, valueW, barH, size, warn, bad, dur }) => {
  const v = meterValue(m.keys, frame, dur);
  const frac = Math.max(0, Math.min(1, v / (m.max ?? 100)));
  const color = interpolateColors(frac, [0, warn - 0.04, warn, bad - 0.04, bad, 1], [C.accent, C.accent, AMBER, AMBER, RED, RED]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, height: "100%", fontFamily: mono, fontWeight: 500, fontSize: size }}>
      <div style={{ width: labelW, flexShrink: 0, color: C.mute, whiteSpace: "nowrap" }}>{m.label}</div>
      <div style={{ flex: 1, height: barH, borderRadius: barH / 2, background: "#E8E8ED", overflow: "hidden" }}>
        <div style={{ width: `${frac * 100}%`, height: "100%", borderRadius: barH / 2, background: color }} />
      </div>
      <div style={{ width: valueW, flexShrink: 0, textAlign: "right", color: C.ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{label(m, v)}</div>
    </div>
  );
};

/**
 * Resource card at (x, y), `w` wide. `cores` sit in a grid of `coreCols` columns (labels "1", "2", ... as
 * in htop), `rows` below them run full width ("mem" with display "of", unit "GiB"). `warn` / `bad` are
 * fractions of max (default 0.7 / 0.9). `filename` adds a tab ("htop"). Rows enter staggered at `at`.
 */
export const ResourceMeters: React.FC<{
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  cores?: Meter[];
  coreCols?: number;
  rows?: Meter[];
  warn?: number;
  bad?: number;
  dur?: number;
  size?: number;
  filename?: string;
  right?: string;
  style?: React.CSSProperties;
}> = ({ x, y, w = 900, at, until, cores = [], coreCols = 2, rows = [], warn = 0.7, bad = 0.9, dur = 14, size = 26, filename, right, style }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const ch = size * 0.6;
  const padX = 36;
  const padY = 22;
  const coreH = 58;
  const rowH = 70;
  const gapX = 48;
  const coreRows = Math.ceil(cores.length / coreCols);
  const sep = cores.length && rows.length ? 18 : 0;
  const h = (filename !== undefined ? TAB_H : 0) + padY * 2 + coreRows * coreH + sep + rows.length * rowH;
  const colW = (w - padX * 2 - gapX * (coreCols - 1)) / coreCols;
  const coreLabelW = Math.max(1, ...cores.map((c) => c.label.length)) * ch;
  const coreValueW = 5 * ch;
  const rowLabelW = Math.max(3, ...rows.map((r) => r.label.length)) * ch;
  const rowValueW = Math.max(5, ...rows.map((r) => label(r, r.max ?? 100).length)) * ch;
  const enter = (i: number) => prog(frame, at + 6 + i * 2, 8);

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="chip" right={right} style={style}>
      {cores.map((m, i) => {
        const col = i % coreCols;
        const row = Math.floor(i / coreCols);
        const e = enter(i);
        return (
          <div key={`c${i}`} style={{ position: "absolute", left: padX + col * (colW + gapX), top: padY + row * coreH, width: colW, height: coreH, opacity: e }}>
            <MeterRow m={m} frame={frame} labelW={coreLabelW} valueW={coreValueW} barH={18} size={size} warn={warn} bad={bad} dur={dur} />
          </div>
        );
      })}
      {cores.length && rows.length ? (
        <div style={{ position: "absolute", left: padX, right: padX, top: padY + coreRows * coreH + sep / 2, height: 1, background: C.line }} />
      ) : null}
      {rows.map((m, i) => {
        const e = enter(cores.length + i);
        return (
          <div key={`r${i}`} style={{ position: "absolute", left: padX, right: padX, top: padY + coreRows * coreH + sep + i * rowH, height: rowH, opacity: e }}>
            <MeterRow m={m} frame={frame} labelW={rowLabelW} valueW={rowValueW} barH={24} size={size} warn={warn} bad={bad} dur={dur} />
          </div>
        );
      })}
    </DevCard>
  );
};
