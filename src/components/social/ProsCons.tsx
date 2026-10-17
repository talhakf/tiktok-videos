import { interpolateColors, useCurrentFrame } from "remotion";
import { TW, TX } from "../../layout";
import { C, easeInOut, materialize, prog, sans } from "../../theme";
import { CARD_SHADOW } from "../diagram/Node";
import { GREEN, Mark, outP, RED } from "../layouts/Mark";

// Two storytelling lists. `ProsCons`: green checks and red crosses side by side (or stacked), each item
// entering from the right on its own cue. `Checklist`: a scorecard: every criterion is listed up front,
// then each one passes (green check) or fails (red cross) on cue and the "n/N" score in the header counts up.
// (`BuildList` is the save-able cheat sheet; these are for judging one thing.)

export type ProsConsItem = { text: string; at: number };

const Item: React.FC<{ item: ProsConsItem; good: boolean; size: number; mark: number }> = ({ item, good, size, mark }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, item.at, 10);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 18, ...materialize(p, 1, 8), translate: `${(1 - p) * 40}px 0px` }}>
      <Mark kind={good ? "check" : "cross"} size={mark} color={good ? GREEN : RED} draw={prog(frame, item.at + 3, 9)} style={{ marginTop: (size * 1.22 - mark) / 2 }} />
      <span style={{ fontWeight: 600, fontSize: size, lineHeight: 1.22, letterSpacing: "-0.02em", color: C.ink }}>{item.text}</span>
    </div>
  );
};

/**
 * Pros (green checks) and cons (red crosses). `layout` "columns" = two white cards side by side (keep items
 * to ~3 short words), "stack" = pros card above cons card (longer items). Items take their space from the start.
 */
export const ProsCons: React.FC<{
  at: number;
  until?: number;
  pros: ProsConsItem[];
  cons: ProsConsItem[];
  titles?: [string, string];
  layout?: "columns" | "stack";
  x?: number;
  y?: number;
  w?: number;
  size?: number;
}> = ({ at, until, pros, cons, titles = ["pros", "cons"], layout = "columns", x = TX, y = 420, w = TW, size }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const cols = layout === "columns";
  const fs = size ?? (cols ? 34 : 38);
  const gap = 28;
  const col = (list: ProsConsItem[], title: string, good: boolean, i: number) => {
    const p = prog(frame, at + i * 2, 10); // 2 frames ≈ the house 40ms stagger
    return (
      <div
        style={{
          width: cols ? (w - gap) / 2 : w,
          boxSizing: "border-box",
          padding: "30px 32px 34px",
          borderRadius: 32,
          background: C.white,
          boxShadow: CARD_SHADOW,
          border: "1px solid rgba(0,0,0,0.06)",
          ...materialize(p, 0.96, 8),
          translate: `0px ${(1 - p) * 20}px`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 40, letterSpacing: "-0.035em", color: good ? "#248A3D" : RED, marginBottom: 22 }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {list.map((it, k) => (
            <Item key={k} item={it} good={good} size={fs} mark={cols ? 44 : 48} />
          ))}
        </div>
      </div>
    );
  };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        display: "flex",
        flexDirection: cols ? "row" : "column",
        alignItems: "flex-start",
        gap,
        fontFamily: sans,
        opacity: 1 - out,
      }}
    >
      {col(pros, titles[0], true, 0)}
      {col(cons, titles[1], false, 1)}
    </div>
  );
};

export type CheckItem = { text: string; sub?: string; result?: "pass" | "fail"; resultAt?: number };

/**
 * Scorecard: rows listed at `at` (40ms stagger) with hollow circles; each row with a `result` passes or fails
 * at `resultAt`. The header shows `title` and the passed count ("2/4"), which ticks up with each pass.
 */
export const Checklist: React.FC<{
  at: number;
  until?: number;
  items: CheckItem[];
  title?: string;
  score?: boolean;
  x?: number;
  y?: number;
  w?: number;
}> = ({ at, until, items, title, score = true, x = TX, y = 420, w = TW }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const p = prog(frame, at, 10);
  const passed = items.filter((it) => it.result === "pass" && it.resultAt !== undefined && frame >= it.resultAt).length;
  const lastPass = Math.max(-1, ...items.filter((it) => it.result === "pass" && it.resultAt !== undefined && frame >= it.resultAt).map((it) => it.resultAt as number));
  const bump = lastPass >= 0 ? prog(frame, lastPass, 8) : 1;
  const MARK = 52;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        boxSizing: "border-box",
        borderRadius: 36,
        background: C.white,
        boxShadow: CARD_SHADOW,
        border: "1px solid rgba(0,0,0,0.06)",
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(p * (1 - out), 0.96, 8),
      }}
    >
      {title || score ? (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "30px 36px 22px", borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontWeight: 700, fontSize: 40, letterSpacing: "-0.035em", color: C.ink }}>{title ?? ""}</span>
          {score ? (
            <span style={{ fontWeight: 600, fontSize: 40, letterSpacing: "-0.02em", color: C.mute, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: passed > 0 ? C.accent : C.mute, display: "inline-block", ...materialize(bump, 1, 4) }}>{passed}</span>/{items.length}
            </span>
          ) : null}
        </div>
      ) : null}
      {items.map((it, i) => {
        const rp = prog(frame, at + 3 + i * 2, 10);
        const r = it.result && it.resultAt !== undefined ? prog(frame, it.resultAt, 8) : 0;
        const good = it.result === "pass";
        const col = good ? GREEN : RED;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "24px 36px",
              borderTop: i > 0 ? `1px solid ${C.line}` : undefined,
              ...materialize(rp, 1, 6),
              translate: `${(1 - rp) * 30}px 0px`,
            }}
          >
            <div style={{ position: "relative", width: MARK, height: MARK, flexShrink: 0 }}>
              <Mark kind="check" size={MARK} color="#C7C7CC" filled={false} draw={0} style={{ position: "absolute", opacity: 1 - r }} />
              {r > 0 ? (
                <Mark
                  kind={good ? "check" : "cross"}
                  size={MARK}
                  color={col}
                  draw={prog(frame, (it.resultAt as number) + 2, 9)}
                  style={{ position: "absolute", ...materialize(r, 0.85, 0) }}
                />
              ) : null}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 38,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: interpolateColors(prog(frame, it.resultAt ?? 1e9, 8, easeInOut), [0, 1], [C.ink, good || !it.result ? C.ink : C.mute]),
                }}
              >
                {it.text}
              </div>
              {it.sub ? <div style={{ marginTop: 4, fontWeight: 500, fontSize: 28, color: C.mute }}>{it.sub}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
