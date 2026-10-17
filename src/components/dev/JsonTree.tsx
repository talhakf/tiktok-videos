import { useCurrentFrame } from "remotion";
import { presence } from "../diagram/Node";
import { easeInOut, mono, prog, TERM } from "../../theme";
import { DevCard, focusTrack, mixTone, TAB_H, Tone } from "./card";
import { DARK_SYNTAX, LIGHT_SYNTAX, TokenKind } from "./syntax";

// A collapsible JSON viewer (browser devtools style) on a code card: real JSON text with a chevron on every
// object and array. Collapsed nodes read `{…} 3 keys`; on cue they open (chevron turns, children slide in,
// the card grows) or close again. A blue band focuses one path and glides to the next.
// Paths: "" is the root, keys join with dots, array items by index: "user.roles.0".

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type JsonToggle = { path: string; at: number; open?: boolean };
export type JsonFocus = { path: string; at: number; until?: number; tone?: Tone };

const LH = 1.55;
const PAD = 22;

type Row = {
  path: string;
  depth: number;
  key?: string;
  kind: "open" | "leaf" | "close";
  value?: JsonValue;
  container?: "obj" | "arr";
  count?: number;
  comma: boolean;
  parents: string[]; // container paths this row sits inside (root first)
};

const join = (path: string, k: string | number) => (path === "" ? String(k) : `${path}.${k}`);

const flatten = (v: JsonValue, path: string, depth: number, key: string | undefined, comma: boolean, parents: string[], out: Row[]) => {
  if (v !== null && typeof v === "object") {
    const arr = Array.isArray(v);
    const entries: [string | number, JsonValue][] = arr ? v.map((x, i) => [i, x]) : Object.entries(v);
    out.push({ path, depth, key, kind: "open", container: arr ? "arr" : "obj", count: entries.length, comma, parents });
    entries.forEach(([k, x], i) =>
      flatten(x, join(path, k), depth + 1, arr ? undefined : String(k), i < entries.length - 1, [...parents, path], out),
    );
    out.push({ path, depth, kind: "close", container: arr ? "arr" : "obj", comma, parents: [...parents, path] });
  } else {
    out.push({ path, depth, key, kind: "leaf", value: v, comma, parents });
  }
};

const valueKind = (v: JsonValue): TokenKind => (typeof v === "string" ? "str" : typeof v === "number" ? "num" : "lit");

/**
 * JSON viewer at (x, y), `w` wide. `open` = paths open at the start (default: just the root); `expand` cues
 * open (or with `open: false` close) a path at a frame. `focus` puts a band on a path's row from `at` to
 * `until`. Rows enter staggered at `at`. `size` 26 fits about 50 columns in 900 px; keep values short.
 */
export const JsonTree: React.FC<{
  data: JsonValue;
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  open?: string[];
  expand?: JsonToggle[];
  focus?: JsonFocus[];
  dark?: boolean;
  filename?: string;
  right?: string;
  size?: number;
  stagger?: number;
  dimOthers?: boolean;
  style?: React.CSSProperties;
}> = ({ data, x, y, w = 900, at, until, open = [""], expand = [], focus = [], dark, filename, right, size = 26, stagger = 1.2, dimOthers = false, style }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const pal = dark ? DARK_SYNTAX : LIGHT_SYNTAX;
  const lh = size * LH;
  const ch = size * 0.6;
  const indent = ch * 2;
  const chevW = size * 0.9;

  const rows: Row[] = [];
  flatten(data, "", 0, undefined, false, [], rows);

  // Openness 0..1 of every container path at this frame.
  const openness = new Map<string, number>();
  const openOf = (path: string) => {
    const cached = openness.get(path);
    if (cached !== undefined) return cached;
    let s = open.includes(path) ? 1 : 0;
    for (const c of expand.filter((e) => e.path === path).sort((a, b) => a.at - b.at)) {
      if (frame < c.at) break;
      const target = c.open === false ? 0 : 1;
      s = s + (target - s) * prog(frame, c.at, 10, easeInOut);
    }
    openness.set(path, s);
    return s;
  };

  // Height factor of every row (product of its parents' openness), and its top.
  let slot = 0;
  let top = PAD;
  const layout = rows.map((r) => {
    const v = r.parents.reduce((a, path) => a * openOf(path), 1);
    const enter = v > 0.999 ? prog(frame, at + 6 + slot++ * stagger, 7) : 1;
    const t = top;
    top += v * lh;
    return { v, enter, top: t };
  });
  const cardH = (filename !== undefined ? TAB_H : 0) + PAD * 2 + (top - PAD);

  // Focus band on the row of a path (its opening row for objects / arrays).
  const rowIndex = (path: string) => rows.findIndex((r) => r.path === path && r.kind !== "close");
  const track = focusTrack(frame, focus);
  let band: null | { top: number; colors: ReturnType<typeof mixTone>; o: number } = null;
  if (track) {
    const yOf = (c: JsonFocus) => layout[Math.max(0, rowIndex(c.path))].top;
    const B = yOf(track.cur);
    const A = track.prev ? yOf(track.prev) : B;
    band = {
      top: A + (B - A) * track.t,
      colors: mixTone(track.prev?.tone ?? track.cur.tone ?? "accent", track.cur.tone ?? "accent", track.t, dark),
      o: track.o,
    };
  }
  const focused = (i: number) => {
    if (!track || !dimOthers) return 1;
    const at = (c: JsonFocus) => (rowIndex(c.path) === i ? 1 : 0);
    const wIn = track.prev ? at(track.prev) + (at(track.cur) - at(track.prev)) * track.t : at(track.cur);
    return 1 - track.o * (1 - wIn) * 0.55;
  };

  const span = (t: string, k: TokenKind) => <span style={{ color: pal[k] }}>{t}</span>;

  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} dark={dark} filename={filename} right={right} style={style}>
      {band ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: band.top,
            height: lh,
            background: band.colors.bg,
            borderLeft: `5px solid ${band.colors.edge}`,
            opacity: band.o,
          }}
        />
      ) : null}
      {rows.map((r, i) => {
        const { v, enter, top: rowTop } = layout[i];
        if (v <= 0.001) return null;
        const o = r.kind === "open" ? openOf(r.path) : 0;
        const brackets = r.container === "arr" ? ["[", "]"] : ["{", "}"];
        const summary = r.container === "arr" ? `${r.count} ${r.count === 1 ? "item" : "items"}` : `${r.count} ${r.count === 1 ? "key" : "keys"}`;
        return (
          <div
            key={`${r.kind}${r.path}`}
            style={{
              position: "absolute",
              left: 28 + r.depth * indent,
              right: 18,
              top: rowTop,
              height: v * lh,
              overflow: "hidden",
              opacity: enter * v * v * focused(i),
              translate: `${(1 - enter) * 12}px 0px`,
              fontFamily: mono,
              fontWeight: 500,
              fontSize: size,
              lineHeight: `${lh}px`,
              whiteSpace: "pre",
              display: "flex",
            }}
          >
            <div style={{ width: chevW, flexShrink: 0, display: "flex", alignItems: "center", height: lh }}>
              {r.kind === "open" ? (
                <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 12 12" style={{ rotate: `${o * 90}deg` }}>
                  <path d="M4 2l4 4-4 4" fill="none" stroke={dark ? TERM.dim : "#8E8E93"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.key !== undefined && r.kind !== "close" ? (
                <>
                  {span(JSON.stringify(r.key), "key")}
                  {span(": ", "punct")}
                </>
              ) : null}
              {r.kind === "leaf" ? span(JSON.stringify(r.value), valueKind(r.value ?? null)) : null}
              {r.kind === "open" ? (
                <>
                  {span(brackets[0], "punct")}
                  {o < 1 ? (
                    <span style={{ opacity: 1 - o }}>
                      <span style={{ color: dark ? TERM.dim : "#8E8E93" }}>…</span>
                      {span(brackets[1], "punct")}
                      {r.comma ? span(",", "punct") : null}
                      <span style={{ color: dark ? TERM.dim : "#8E8E93", fontSize: size * 0.85 }}>{`  ${summary}`}</span>
                    </span>
                  ) : null}
                </>
              ) : null}
              {r.kind === "close" ? span(brackets[1], "punct") : null}
              {r.kind !== "open" && r.comma ? span(",", "punct") : null}
            </div>
          </div>
        );
      })}
    </DevCard>
  );
};
