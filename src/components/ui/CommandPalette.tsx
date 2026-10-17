import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, easeInOut, GLASS, materialize, prog, sans } from "../../theme";
import { lerp, presence } from "../diagram/Node";
import { glide, IndexCue, typedCount, under } from "./shared";

// Spotlight / command-palette search: a frosted bar types a query, the results below filter as the query
// grows (case-insensitive substring match on the label), the matched letters are bold, the top result is
// selected in blue. Rows that drop out fade while the rest glide up; `enterAt` = the chosen result
// flashes darker and the palette closes. "open Terminal without the mouse", "cmd + space".

export type PaletteItem = { label: string; sub?: string; icon?: IconName };

const matches = (items: PaletteItem[], q: string, showAll: boolean, max: number) => {
  if (!q) return showAll ? items.slice(0, max) : [];
  const low = q.toLowerCase();
  return items.filter((it) => it.label.toLowerCase().includes(low)).slice(0, max);
};

/** The label with the matched part bold (700) and the rest regular (500). */
const Highlighted: React.FC<{ text: string; q: string }> = ({ text, q }) => {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <span style={{ fontWeight: 500 }}>{text}</span>;
  return (
    <span style={{ fontWeight: 500, whiteSpace: "pre" }}>
      {text.slice(0, i)}
      <span style={{ fontWeight: 700 }}>{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </span>
  );
};

/**
 * Search palette at (x, y), `w` wide. Types `query` from `typeAt` (one character every `fpc` frames);
 * results = `items` whose label contains the typed part (at most `rows`). Empty query shows nothing
 * (Spotlight) unless `showAll` (command palette). `select` moves the blue row down the results (arrow keys);
 * `enterAt` flashes it and closes the palette 10 frames later. `placeholder` greys the empty field.
 */
export const CommandPalette: React.FC<{
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  items: PaletteItem[];
  query: string;
  typeAt?: number;
  fpc?: number;
  rows?: number;
  showAll?: boolean;
  select?: IndexCue[];
  enterAt?: number;
  placeholder?: string;
}> = ({ x, y, w = 900, at, until, items, query, typeAt, fpc = 4, rows = 5, showAll = false, select = [], enterAt, placeholder = "Search" }) => {
  const frame = useCurrentFrame();
  const leave = enterAt !== undefined ? Math.min(enterAt + 10, until ?? Infinity) : until;
  const vis = presence(frame, at, leave);
  if (vis === null) return null;

  const fieldH = 104;
  const rowH = 88;
  const pad = 12;
  const n = typedCount(frame, query.length, typeAt, fpc);
  const q = query.slice(0, n);
  // when the last character landed, and the list before it (for the filter animation)
  const since = typeAt === undefined || n === 0 ? at : typeAt + (n - 1) * fpc;
  const t = prog(frame, since, Math.min(6, fpc + 2), easeInOut);
  const before = matches(items, query.slice(0, Math.max(0, n - 1)), showAll, rows);
  const now = matches(items, q, showAll, rows);
  const count = lerp(before.length || (q ? 1 : 0), now.length || (q ? 1 : 0), t); // 1 row for "No results"
  const listH = count > 0 ? count * rowH + pad * 2 + 1 : 0;

  const sel = Math.min(glide(frame, 0, select, 8), Math.max(0, now.length - 1));
  const typing = typeAt !== undefined && frame >= typeAt && (enterAt === undefined || frame < enterAt);
  const enter = enterAt === undefined ? 0 : prog(frame, enterAt, 4);
  const selColor = interpolateColors(enter, [0, 1], [C.accent, "#0058B0"]);

  return (
    <div
      style={{
        ...GLASS,
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: fieldH + listH,
        borderRadius: 32,
        background: "rgba(250,250,252,0.86)",
        overflow: "hidden",
        fontFamily: sans,
        transformOrigin: "50% 0",
        ...materialize(vis),
      }}
    >
      <div style={{ height: fieldH, display: "flex", alignItems: "center", gap: 22, padding: "0 32px" }}>
        <Icon name="search" size={46} color={C.mute} weight={2.2} />
        <div style={{ display: "flex", alignItems: "center", fontSize: 42, fontWeight: 500, letterSpacing: "-0.02em", color: C.ink, whiteSpace: "pre" }}>
          {q ? q : typing ? null : <span style={{ color: "#AEAEB2" }}>{placeholder}</span>}
          {typing ? <div style={{ width: 3, height: 48, marginLeft: 2, background: C.accent }} /> : null}
        </div>
      </div>
      {listH > 0 ? <div style={{ height: 1, background: C.line }} /> : null}
      <div style={{ position: "relative" }}>
        {now.length ? (
          <div
            style={{ position: "absolute", left: pad, right: pad, top: pad + sel * rowH, height: rowH, borderRadius: 18, background: selColor }}
          />
        ) : null}
        {q && !now.length ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: pad,
              height: rowH,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 500,
              color: C.mute,
              opacity: t,
            }}
          >
            No results
          </div>
        ) : null}
        {items.map((it) => {
          const a = before.indexOf(it);
          const b = now.indexOf(it);
          if (a < 0 && b < 0) return null;
          const idx = a >= 0 && b >= 0 ? lerp(a, b, t) : b >= 0 ? b : a;
          const op = a >= 0 && b >= 0 ? 1 : b >= 0 ? t : 1 - t;
          if (op <= 0) return null;
          const white = b >= 0 && now.length ? under(sel, b) : 0;
          const fg = interpolateColors(white, [0, 1], [C.ink, C.white]);
          return (
            <div
              key={it.label}
              style={{
                position: "absolute",
                left: pad,
                right: pad,
                top: pad + idx * rowH,
                height: rowH,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "0 22px",
                opacity: op,
              }}
            >
              {it.icon ? (
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: interpolateColors(white, [0, 1], [C.white, "rgba(255,255,255,0.18)"]),
                    border: `1px solid ${interpolateColors(white, [0, 1], [C.line, "rgba(255,255,255,0.3)"])}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={it.icon} size={34} color={fg} weight={2} />
                </div>
              ) : null}
              <div style={{ flex: 1, fontSize: 34, letterSpacing: "-0.02em", color: fg, whiteSpace: "nowrap", overflow: "hidden" }}>
                <Highlighted text={it.label} q={q} />
              </div>
              {it.sub ? (
                <div style={{ fontSize: 26, fontWeight: 500, color: interpolateColors(white, [0, 1], [C.mute, "rgba(255,255,255,0.85)"]), whiteSpace: "nowrap" }}>
                  {it.sub}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
