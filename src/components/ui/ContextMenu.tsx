import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, materialize, prog, sans } from "../../theme";
import { presence, RED } from "../diagram/Node";
import { glide, Shortcut, under } from "./shared";

// macOS right-click / dropdown menu: frosted panel, rows with an optional icon and a shortcut on the right,
// separators, and the blue hover row that glides from item to item on cue. At `chooseAt` the chosen row
// blinks once (as macOS does) and the menu closes. Pair with Pointer for the right click.

export type MenuItem = { label: string; shortcut?: string; icon?: IconName; danger?: boolean; disabled?: boolean; checked?: boolean } | "-";
export type MenuHover = { item: number | string | null; at: number };

/**
 * Context menu at (x, y) (its top-left; it opens from that corner, like at the cursor). `items` are rows or
 * "-" separators. `hover` moves the blue row: `item` is a label, or an index counting rows only (separators
 * skipped); `null` takes the highlight away. `chooseAt`: the hovered row blinks and the menu leaves 9 frames later.
 * `shortcut` uses Shortcut glyphs: "⌘c", "⌘⇧n", "⌘⌫".
 */
export const ContextMenu: React.FC<{
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  items: MenuItem[];
  hover?: MenuHover[];
  chooseAt?: number;
  size?: number;
  rowH?: number;
}> = ({ x, y, w = 480, at, until, items, hover = [], chooseAt, size = 28, rowH = 62 }) => {
  const frame = useCurrentFrame();
  const leave = chooseAt !== undefined ? Math.min(chooseAt + 9, until ?? Infinity) : until;
  const vis = presence(frame, at, leave, 7, 7);
  if (vis === null) return null;

  const pad = 10;
  const sepH = 17;
  const rows = items.filter((it): it is Exclude<MenuItem, "-"> => it !== "-");
  const indexOf = (item: number | string) => (typeof item === "number" ? item : rows.findIndex((r) => r.label === item));
  // y of each row (separators take sepH)
  const tops: number[] = [];
  let cy = pad;
  for (const it of items) {
    if (it === "-") cy += sepH;
    else {
      tops.push(cy);
      cy += rowH;
    }
  }
  const h = cy + pad;
  const hasIcons = rows.some((r) => r.icon || r.checked !== undefined);

  // highlight position (fractional row) and opacity
  const sorted = [...hover].sort((a, b) => a.at - b.at);
  const cues = sorted.filter((c) => c.item !== null).map((c) => ({ index: indexOf(c.item as number | string), at: c.at }));
  const hi = glide(frame, cues[0]?.index ?? 0, cues, 7);
  // highlight fades in on the first item cue, out on a null cue (4 frames)
  let on = 0;
  let shown = false;
  for (const c of sorted) {
    if (frame < c.at) break;
    const want = c.item !== null;
    if (want && !shown) on = prog(frame, c.at, 4);
    if (!want && shown) on = 1 - prog(frame, c.at, 4);
    shown = want;
  }
  // macOS blink: off for 3 frames, on for 3, then the menu closes
  const blink = chooseAt !== undefined && frame >= chooseAt && frame < chooseAt + 3 ? 0 : 1;
  const lo = Math.floor(hi);
  const hiY = tops[lo] + (tops[Math.min(lo + 1, tops.length - 1)] - tops[lo]) * (hi - lo);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 20,
        background: "rgba(246,246,248,0.86)",
        backdropFilter: "blur(24px) saturate(180%)",
        border: `1px solid ${C.line}`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)",
        transformOrigin: "0 0",
        fontFamily: sans,
        ...materialize(vis, 0.96, 4),
      }}
    >
      {on > 0 ? (
        <div style={{ position: "absolute", left: pad, right: pad, top: hiY, height: rowH, borderRadius: 12, background: C.accent, opacity: on * blink }} />
      ) : null}
      {items.map((it, i) => {
        if (it === "-") {
          const after = items.slice(0, i).filter((t) => t !== "-").length;
          return (
            <div
              key={`sep${i}`}
              style={{ position: "absolute", left: pad + 14, right: pad + 14, top: (tops[after - 1] ?? pad) + rowH + sepH / 2 - 0.5, height: 1, background: C.line }}
            />
          );
        }
        const r = rows.indexOf(it);
        const white = it.disabled ? 0 : under(hi, r) * on * blink;
        const base = it.disabled ? "#AEAEB2" : it.danger ? RED : C.ink;
        const fg = interpolateColors(white, [0, 1], [base, C.white]);
        const sub = interpolateColors(white, [0, 1], [C.mute, C.white]);
        return (
          <div
            key={`${it.label}${i}`}
            style={{
              position: "absolute",
              left: pad,
              right: pad,
              top: tops[r],
              height: rowH,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "0 18px",
            }}
          >
            {hasIcons ? (
              <div style={{ width: 32, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                {it.icon ? (
                  <Icon name={it.icon} size={30} color={fg} weight={2} />
                ) : it.checked ? (
                  <Icon name="check" size={28} color={fg} weight={2.6} />
                ) : null}
              </div>
            ) : null}
            <div style={{ flex: 1, fontSize: size, fontWeight: 500, letterSpacing: "-0.01em", color: fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {it.label}
            </div>
            {it.shortcut ? <Shortcut keys={it.shortcut} size={size * 0.9} color={sub} /> : null}
          </div>
        );
      })}
    </div>
  );
};
