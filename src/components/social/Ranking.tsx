import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, materialize, prog, sans } from "../../theme";
import { BLUE_TINT, CARD_SHADOW, lerp } from "../diagram/Node";
import { Mark, outP } from "../layouts/Mark";

// "Ranked" list: numbered slots (1, 2, 3 … never zero-padded) on the left, item cards sliding in from the right
// into their slot, and reorders that glide (easeInOut, 16 frames) when one item moves up: the mover lifts
// (slightly larger, deeper shadow, on top) while the others shift aside. The numbers belong to the slots, so
// they stay put while the cards move. `highlight` turns one card blue (the winner / the one we talk about).

export type RankItem = { id: string; label: string; sub?: string; icon?: IconName; at: number };
export type RankOrder = { at: number; ids: string[] }; // the full order, top first

const MOVE = 16;

/**
 * Ranked rows. Items start in array order; each `orders` cue glides them to a new order. `rowH` + `gap`
 * set the slot pitch (default 132 + 18 → 5 rows ≈ 740 px).
 */
export const Ranking: React.FC<{
  items: RankItem[];
  orders?: RankOrder[];
  at?: number;
  until?: number;
  highlight?: { id: string; at: number }[];
  x?: number;
  y?: number;
  w?: number;
  rowH?: number;
  gap?: number;
}> = ({ items, orders = [], at, until, highlight = [], x = TX, y = 420, w = TW, rowH = 132, gap = 18 }) => {
  const frame = useCurrentFrame();
  const start = at ?? Math.min(...items.map((it) => it.at));
  if (frame < start) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;

  // slot of each id before and after the latest reorder that has started
  const cues = [...orders].sort((a, b) => a.at - b.at);
  const initial = items.map((it) => it.id);
  let prev = initial;
  let cur = initial;
  let moveAt: number | null = null;
  for (const c of cues) {
    if (c.at > frame) break;
    prev = cur;
    cur = c.ids;
    moveAt = c.at;
  }
  const m = moveAt === null ? 1 : prog(frame, moveAt, MOVE, easeInOut);
  const slotOf = (order: string[], id: string) => Math.max(0, order.indexOf(id));
  const pitch = rowH + gap;
  const NUM = 64;
  const numW = NUM + 26;
  const hl = [...highlight].sort((a, b) => a.at - b.at).filter((h) => h.at <= frame).pop();

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: items.length * pitch, fontFamily: sans, opacity: 1 - out }}>
      {/* slot numbers: each appears with the first item that lands in it */}
      {items.map((it, i) => {
        const p = prog(frame, it.at, 10);
        return (
          <div key={`n${i}`} style={{ position: "absolute", left: 0, top: i * pitch + (rowH - NUM) / 2, ...materialize(p, 0.9, 6) }}>
            <Mark kind={i + 1} size={NUM} color={i === 0 ? C.accent : C.soft} glyph={i === 0 ? C.white : C.ink} />
          </div>
        );
      })}
      {/* cards: the moving one renders last so it passes over the others */}
      {items
        .map((it) => {
          const from = slotOf(prev, it.id);
          const to = slotOf(cur, it.id);
          return { it, from, to, up: to < from && m < 1 };
        })
        .sort((a, b) => Number(a.up) - Number(b.up))
        .map(({ it, from, to, up }) => {
          if (frame < it.at) return null;
          const p = prog(frame, it.at, 12);
          const slot = lerp(from, to, m);
          const lift = up ? Math.sin(m * Math.PI) : 0;
          const h = hl && hl.id === it.id ? prog(frame, hl.at, 8, easeInOut) : 0;
          return (
            <div
              key={it.id}
              style={{
                position: "absolute",
                left: numW,
                top: slot * pitch,
                width: w - numW,
                height: rowH,
                boxSizing: "border-box",
                padding: "0 32px",
                borderRadius: 30,
                background: interpolateColors(h, [0, 1], [C.white, BLUE_TINT]),
                border: `${2 + h}px solid ${interpolateColors(h, [0, 1], ["rgba(0,0,0,0.06)", C.accent])}`,
                boxShadow: lift > 0 ? `0 ${12 + lift * 18}px ${32 + lift * 24}px rgba(0,0,0,${0.07 + lift * 0.08}), 0 2px 6px rgba(0,0,0,0.05)` : CARD_SHADOW,
                display: "flex",
                alignItems: "center",
                gap: 24,
                ...materialize(p, 1, 8),
                scale: String(1 + lift * 0.03),
                translate: `${(1 - p) * 80}px 0px`,
              }}
            >
              {it.icon ? <Icon name={it.icon} size={52} color={h > 0.5 ? C.accent : C.ink} weight={2} /> : null}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.035em", color: C.ink, whiteSpace: "pre" }}>{it.label}</div>
                {it.sub ? <div style={{ marginTop: 6, fontWeight: 500, fontSize: 28, color: C.mute, whiteSpace: "pre" }}>{it.sub}</div> : null}
              </div>
            </div>
          );
        })}
    </div>
  );
};
