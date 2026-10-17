import { useCurrentFrame } from "remotion";
import { C, easeInOut, materialize, prog, sans } from "../../theme";
import { CARD_SHADOW, presence } from "../diagram/Node";
import { BLUES, seeded } from "./chart";

// Activity heat grid (weeks × days, the "contributions" look without any brand): week columns fill in left
// to right, each cell one of five solid blue steps. A streak can light up later: the other cells dim, an ink
// outline traces the run and a pill names it. Data is a values array or deterministic from a seed.

/** Seeded activity counts, column-major (week by week, day 0..days-1 in each): busy weekdays, quiet weekends, a few gaps. */
export const activity = (weeks: number, days = 7, seed = 1) => {
  const rnd = seeded(seed);
  const out: number[] = [];
  for (let wk = 0; wk < weeks; wk++) {
    const busy = 0.4 + rnd() * 0.8; // some weeks are busier
    for (let d = 0; d < days; d++) {
      const weekend = days === 7 && (d === 0 || d === 6);
      const r = rnd();
      out.push(r < (weekend ? 0.55 : 0.18) ? 0 : Math.round(rnd() * 9 * busy * (weekend ? 0.4 : 1)) + 1);
    }
  }
  return out;
};

/** Count → level 0..4 (0 = empty, then four quarters of `max`). */
const level = (v: number, max: number) => (v <= 0 ? 0 : Math.min(4, Math.ceil((v / max) * 4)));

/**
 * Grid at (x, y). `values` (column-major, `weeks × days` counts) or `seed` for made-up data. Cells are
 * `cell` px with `gap`; columns appear `stagger` frames apart from `at`. `streak` = cells `from`..`to`
 * (indices into values, inclusive) lit at `at`, the rest dimmed, `label` in a pill above the grid.
 * Seeded data is adjusted so the streak holds (active inside, empty either side).
 * `dayLabels` puts names on rows (e.g. ["", "Mon", "", "Wed", "", "Fri", ""]); `legend` = less … more key.
 */
export const ContributionGrid: React.FC<{
  at: number;
  x: number;
  y: number;
  until?: number;
  weeks?: number;
  days?: number;
  values?: number[];
  seed?: number;
  cell?: number;
  gap?: number;
  stagger?: number;
  streak?: { from: number; to: number; at: number; label?: string };
  dayLabels?: string[];
  legend?: boolean;
  fontSize?: number;
}> = ({ at, x, y, until, weeks = 20, days = 7, values, seed = 1, cell = 36, gap = 7, stagger = 1.2, streak, dayLabels, legend = true, fontSize = 26 }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  // Made-up data gets a real streak: active days inside it, a quiet day on each side.
  const data =
    values ??
    activity(weeks, days, seed).map((v, i) =>
      !streak ? v : i >= streak.from && i <= streak.to ? Math.max(v, 5) : i === streak.from - 1 || i === streak.to + 1 ? 0 : v,
    );
  const cols = Math.ceil(data.length / days);
  const max = Math.max(1, ...data);
  const labelW = dayLabels ? fontSize * 2.6 : 0;
  const gridW = cols * (cell + gap) - gap;
  const gridH = days * (cell + gap) - gap;
  const sp = streak ? prog(frame, streak.at, 12, easeInOut) : 0;
  const inStreak = (i: number) => !!streak && i >= streak.from && i <= streak.to;
  const pillTop = -fontSize * 2.9;

  // Streak outline: the edges of lit cells that border an unlit cell, half a gap outside the cells.
  const edges: string[] = [];
  if (streak) {
    const pitch = cell + gap;
    for (let i = streak.from; i <= streak.to; i++) {
      const col = Math.floor(i / days);
      const row = i % days;
      const x0 = labelW + col * pitch - gap / 2;
      const y0 = row * pitch - gap / 2;
      const x1 = x0 + pitch;
      const y1 = y0 + pitch;
      const has = (c: number, r: number) => r >= 0 && r < days && inStreak(c * days + r);
      if (!has(col, row - 1)) edges.push(`M${x0} ${y0}H${x1}`);
      if (!has(col, row + 1)) edges.push(`M${x0} ${y1}H${x1}`);
      if (!has(col - 1, row)) edges.push(`M${x0} ${y0}V${y1}`);
      if (!has(col + 1, row)) edges.push(`M${x1} ${y0}V${y1}`);
    }
  }

  return (
    <div style={{ position: "absolute", left: x, top: y, width: labelW + gridW, height: gridH, opacity: p }}>
      {(dayLabels ?? []).map((d, i) =>
        d ? (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: i * (cell + gap) + cell / 2 - fontSize * 0.6,
              fontFamily: sans,
              fontWeight: 600,
              fontSize,
              lineHeight: 1.2,
              color: C.mute,
              opacity: prog(frame, at, 10),
            }}
          >
            {d}
          </div>
        ) : null,
      )}
      {data.map((v, i) => {
        const col = Math.floor(i / days);
        const row = i % days;
        const t = at + col * stagger + row * 0.4;
        if (frame < t) return null;
        const cp = prog(frame, t, 8);
        const lv = level(v, max);
        const lit = inStreak(i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: labelW + col * (cell + gap),
              top: row * (cell + gap),
              width: cell,
              height: cell,
              borderRadius: cell * 0.22,
              background: BLUES[lv],
              ...materialize(cp, 0.7, 3),
              opacity: cp * (streak && !lit ? 1 - 0.75 * sp : 1),
            }}
          />
        );
      })}
      {streak && sp > 0 ? (
        <svg width={labelW + gridW} height={gridH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: sp }}>
          <path d={edges.join(" ")} stroke={C.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
        </svg>
      ) : null}
      {streak?.label ? (
        <div
          style={{
            position: "absolute",
            left: labelW + Math.floor(streak.from / days) * (cell + gap),
            top: pillTop,
            padding: `${fontSize * 0.35}px ${fontSize * 0.75}px`,
            borderRadius: fontSize,
            background: C.white,
            boxShadow: CARD_SHADOW,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: fontSize * 1.15,
            letterSpacing: "-0.02em",
            color: C.ink,
            whiteSpace: "nowrap",
            transformOrigin: "0% 100%",
            ...materialize(prog(frame, streak.at + 6, 10), 0.95, 6),
          }}
        >
          {streak.label}
        </div>
      ) : null}
      {legend ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: gridH + fontSize * 0.9,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: sans,
            fontWeight: 600,
            fontSize,
            color: C.mute,
            opacity: prog(frame, at + cols * stagger, 10),
          }}
        >
          <span style={{ marginRight: 6 }}>less</span>
          {BLUES.map((b) => (
            <div key={b} style={{ width: cell * 0.75, height: cell * 0.75, borderRadius: cell * 0.18, background: b }} />
          ))}
          <span style={{ marginLeft: 6 }}>more</span>
        </div>
      ) : null}
    </div>
  );
};
