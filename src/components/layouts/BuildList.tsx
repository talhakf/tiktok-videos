import { interpolateColors, useCurrentFrame } from "remotion";
import { TW, TX, TY } from "../../layout";
import { C, materialize, mono, prog, sans, TERM } from "../../theme";
import { Mark, outP, RED } from "./Mark";

// The save-able cheat sheet: rows build one by one, each with a leading marker (a number, a check that
// ticks at `doneAt`, or a red cross), an optional mono command and a grey description.
// `card`: one white rounded card with hairline separators (iOS Settings) that grows as rows arrive.

export type ListRow = {
  at: number;
  text: string;
  cmd?: string;
  mark?: "check" | "cross" | number;
  doneAt?: number; // check: ticks here (default at + 6); number: fills blue here (optional)
  h?: number; // row height override
};

const MARK = 56;

const Marker: React.FC<{ row: ListRow; dark: boolean }> = ({ row, dark }) => {
  const frame = useCurrentFrame();
  const { mark } = row;
  if (mark === undefined) return null;
  const outline = dark ? "#5A5A5E" : "#C7C7CC";
  if (mark === "cross") {
    return <Mark kind="cross" size={MARK} color={RED} draw={prog(frame, row.doneAt ?? row.at + 4, 9)} />;
  }
  if (mark === "check") {
    const done = row.doneAt ?? row.at + 6;
    const f = prog(frame, done, 6);
    return (
      <div style={{ position: "relative", width: MARK, height: MARK, flexShrink: 0 }}>
        <Mark kind="check" size={MARK} color={outline} filled={false} draw={0} style={{ position: "absolute", opacity: 1 - f }} />
        <Mark kind="check" size={MARK} color={C.accent} draw={prog(frame, done + 2, 10)} style={{ position: "absolute", ...materialize(f, 0.85, 0) }} />
      </div>
    );
  }
  const f = row.doneAt !== undefined ? prog(frame, row.doneAt, 8) : 0;
  return (
    <Mark
      kind={mark}
      size={MARK}
      color={interpolateColors(f, [0, 1], [dark ? "#3A3A3C" : C.soft, C.accent])}
      glyph={interpolateColors(f, [0, 1], [dark ? TERM.fg : C.ink, C.white])}
    />
  );
};

/** A list / cheat sheet that builds row by row. `tone` "dark" = terminal-black rows with green commands. */
export const BuildList: React.FC<{
  rows: ListRow[];
  x?: number;
  y?: number;
  w?: number;
  at?: number; // card / first row (default: the first row's `at`)
  until?: number;
  tone?: "light" | "dark";
  card?: boolean;
  gap?: number; // between separate rows
  cmdSize?: number;
  textSize?: number;
}> = ({ rows, x = TX, y = TY, w = TW, at, until, tone = "light", card = false, gap = 14, cmdSize = 34, textSize = 30 }) => {
  const frame = useCurrentFrame();
  const start = at ?? rows[0]?.at ?? 0;
  if (frame < start) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const dark = tone === "dark";
  const bg = dark ? TERM.bg : C.white;
  const sep = dark ? "rgba(255,255,255,0.10)" : C.line;
  const pad = 30;
  const heights = rows.map((r) => r.h ?? (r.cmd ? 128 : 100));
  const tops: number[] = [];
  let acc = 0;
  let grown = 0;
  rows.forEach((r, i) => {
    tops.push(acc);
    acc += heights[i] + (card ? 0 : gap);
    grown += heights[i] * prog(frame, r.at, 9);
  });
  const cp = prog(frame, start, 9);

  const rowNode = (r: ListRow, i: number) => {
    if (frame < r.at) return null;
    const p = prog(frame, r.at, 9);
    const hasMark = r.mark !== undefined;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: 0,
          top: tops[i],
          width: w,
          height: heights[i],
          boxSizing: "border-box",
          padding: `0 ${pad}px`,
          display: "flex",
          alignItems: "center",
          gap: 26,
          ...(card
            ? {}
            : {
                background: bg,
                borderRadius: 24,
                border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : C.line}`,
                boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
              }),
          ...materialize(p, card ? 1 : 0.97, 6),
          translate: `0px ${(1 - p) * 14}px`,
        }}
      >
        {card && i > 0 ? (
          <div style={{ position: "absolute", top: 0, right: 0, left: pad + (hasMark ? MARK + 26 : 0), height: 1, background: sep }} />
        ) : null}
        <Marker row={r} dark={dark} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          {r.cmd ? (
            <div style={{ fontFamily: mono, fontWeight: 500, fontSize: cmdSize, color: dark ? TERM.green : C.accent, whiteSpace: "pre" }}>{r.cmd}</div>
          ) : null}
          <div
            style={{
              fontFamily: sans,
              fontWeight: r.cmd ? 500 : 600,
              fontSize: r.cmd ? textSize : textSize * 1.2,
              letterSpacing: "-0.01em",
              color: r.cmd ? (dark ? TERM.dim : C.mute) : dark ? TERM.fg : C.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {r.text}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: 1 - out, translate: `${-out * 40}px 0px` }}>
      {card ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: w,
            height: grown,
            borderRadius: 28,
            background: bg,
            border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : C.line}`,
            boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
            overflow: "hidden",
            opacity: cp,
          }}
        >
          {rows.map(rowNode)}
        </div>
      ) : (
        rows.map(rowNode)
      )}
    </div>
  );
};
