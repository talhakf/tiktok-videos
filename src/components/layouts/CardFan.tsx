import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, prog, sans, W } from "../../theme";
import { outP } from "./Mark";

// Hook: 3–5 white cards fanned like a hand of cards, then at `dealAt` they glide (ease-in-out, staggered)
// into a vertical list. The card content cross-fades from the tall "card" layout to the row layout mid-glide.

export type FanCard = { title: string; sub?: string; icon?: IconName };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A fanned hand of cards (`at`) that deals into a vertical list at `dealAt`. */
export const CardFan: React.FC<{
  cards: FanCard[];
  at: number;
  dealAt?: number;
  until?: number;
  fanX?: number; // centre of the fan
  fanY?: number; // top of the middle card
  cardW?: number;
  cardH?: number;
  x?: number; // list
  y?: number;
  w?: number;
  rowH?: number;
  gap?: number;
  stagger?: number;
}> = ({ cards, at, dealAt, until, fanX = W / 2, fanY = TY + 60, cardW = 280, cardH = 390, x = TX, y = TY, w = TW, rowH = 124, gap = 16, stagger = 3 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const n = cards.length;
  const mid = (n - 1) / 2;
  // fit the hand in the content column; card content stays inside the strip the next card leaves visible
  const spread = Math.min(190, (TW + 20 - cardW) / Math.max(1, n - 1));
  const strip = Math.min(cardW - 56, spread - 34);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      {cards.map((c, i) => {
        const ca = at + i * 3;
        if (frame < ca) return null;
        const e = prog(frame, ca, 10);
        const d = dealAt !== undefined ? prog(frame, dealAt + i * stagger, 16, easeInOut) : 0;
        const off = i - mid;
        const fanAngle = mid ? (off / mid) * 8 : 0;
        const fx = fanX + off * spread - cardW / 2;
        const fy = fanY + off * off * 16;
        const left = lerp(fx, x, d);
        const top = lerp(fy, y + i * (rowH + gap), d);
        const cw = lerp(cardW, w, d);
        const ch = lerp(cardH, rowH, d);
        const fanO = Math.max(0, 1 - d * 2.2);
        const listO = Math.max(0, Math.min(1, d * 2.2 - 1.2));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top,
              width: cw,
              height: ch,
              borderRadius: lerp(34, 26, d),
              background: C.white,
              border: `1px solid ${C.line}`,
              boxShadow: "0 22px 44px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.05)",
              rotate: `${fanAngle * (1 - d)}deg`,
              transformOrigin: "50% 100%",
              overflow: "hidden",
              ...materialize(e, 0.95, 8),
              translate: `0px ${(1 - e) * 50}px`,
            }}
          >
            {fanO > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: cardW,
                  height: cardH,
                  padding: 28,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  opacity: fanO,
                  filter: fanO < 1 ? `blur(${(1 - fanO) * 6}px)` : undefined,
                }}
              >
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 30, color: C.mute }}>
                  {i + 1}/{n}
                </div>
                {c.icon ? <Icon name={c.icon} size={72} color={C.accent} weight={1.8} draw={prog(frame, ca + 4, 16)} /> : null}
                <div style={{ marginTop: "auto", width: strip }}>
                  <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.035em", color: C.ink }}>{c.title}</div>
                  {c.sub ? <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 26, lineHeight: 1.2, marginTop: 10, color: C.mute }}>{c.sub}</div> : null}
                </div>
              </div>
            ) : null}
            {listO > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: w,
                  height: rowH,
                  padding: "0 34px",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  opacity: listO,
                  filter: listO < 1 ? `blur(${(1 - listO) * 6}px)` : undefined,
                }}
              >
                {c.icon ? <Icon name={c.icon} size={60} color={C.accent} weight={1.8} /> : null}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 40, letterSpacing: "-0.03em", color: C.ink, whiteSpace: "nowrap" }}>{c.title}</div>
                  {c.sub ? <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 28, color: C.mute, whiteSpace: "nowrap" }}>{c.sub}</div> : null}
                </div>
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 30, color: C.mute }}>
                  {i + 1}/{n}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
