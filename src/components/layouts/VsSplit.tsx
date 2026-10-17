import { interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TH, TW, TX, TY } from "../../layout";
import { appleSpring, C, materialize, mono, prog, sans } from "../../theme";
import { GREEN, Mark, outP, RED } from "./Mark";

// "X vs Y" (or X vs Y vs Z): white columns side by side, a small "vs" chip on each divider. The winner gets
// a blue header and a check badge (top centre, clear of the vs chips), the others step back. Columns enter left to right.

export type VsLine = string | { t: string; at?: number; mono?: boolean; mark?: "check" | "cross" };
export type VsColumn = {
  label: string;
  icon?: IconName;
  lines?: VsLine[]; // simple body: text rows that cascade in after the column
  body?: React.ReactNode | ((s: { won: number; lost: number }) => React.ReactNode); // custom body (render prop gets winner progress)
};

const Badge: React.FC<{ at: number; kind: "check" | "cross"; color: string; size: number }> = ({ at, kind, color, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = appleSpring(frame - at, fps, { response: 0.35 });
  return (
    <div style={{ position: "absolute", top: -size * 0.6, left: "50%", marginLeft: -size / 2, ...materialize(Math.min(1, s), 0.8, 6) }}>
      <Mark kind={kind} size={size} color={color} draw={prog(frame, at + 3, 10)} style={{ boxShadow: "0 8px 18px rgba(0,0,0,0.16)" }} />
    </div>
  );
};

/** Two or three columns compared side by side, with an optional `winner` tick and per-column `verdicts` (✓ / ✕). */
export const VsSplit: React.FC<{
  columns: VsColumn[];
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  stagger?: number;
  winner?: { index: number; at: number };
  verdicts?: ({ ok: boolean; at: number } | null)[];
}> = ({ columns, at, until, x = TX, y = TY, w = TW, h = TH, stagger = 6, winner, verdicts }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const n = columns.length;
  const three = n >= 3;
  const gap = three ? 22 : 28;
  const cw = (w - gap * (n - 1)) / n;
  const headH = three ? 104 : 120;
  const labelSize = three ? 38 : 48;
  const lineSize = three ? 27 : 32;
  const pw = winner ? prog(frame, winner.at, 10) : 0;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: 1 - out, translate: `${-out * 40}px 0px` }}>
      {columns.map((col, i) => {
        const ca = at + i * stagger;
        if (frame < ca) return null;
        const p = prog(frame, ca, 10);
        const won = winner && winner.index === i ? pw : 0;
        const lost = winner && winner.index !== i ? pw : 0;
        const head = interpolateColors(won, [0, 1], [C.ink, C.accent]);
        const v = verdicts?.[i];
        const lines = col.lines ?? [];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * (cw + gap),
              top: 0,
              width: cw,
              height: h,
              ...materialize(p, 0.96, 8),
              opacity: p * (1 - 0.5 * lost),
              translate: `0px ${(1 - p) * 30}px`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 30,
                background: C.white,
                border: `1px solid ${C.line}`,
                boxShadow: `0 0 0 ${4 * won}px ${C.accent}, 0 18px 40px rgba(0,0,0,0.08)`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: headH,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  borderBottom: `1px solid ${C.line}`,
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: labelSize,
                  letterSpacing: "-0.03em",
                  color: head,
                }}
              >
                {col.icon ? <Icon name={col.icon} size={labelSize * 1.05} color={head} draw={prog(frame, ca + 2, 14)} /> : null}
                {col.label}
              </div>
              <div style={{ padding: three ? "26px 22px" : "32px 34px", display: "flex", flexDirection: "column", gap: three ? 18 : 22 }}>
                {lines.map((l, li) => {
                  const o = typeof l === "string" ? { t: l } : l;
                  const la = o.at ?? ca + 8 + li * 3;
                  if (frame < la) return null;
                  const lp = prog(frame, la, 8);
                  return (
                    <div key={li} style={{ display: "flex", alignItems: "center", gap: 14, opacity: lp, translate: `0px ${(1 - lp) * 10}px` }}>
                      {o.mark ? (
                        <Mark kind={o.mark} size={lineSize * 1.15} color={o.mark === "check" ? GREEN : RED} draw={prog(frame, la + 2, 8)} />
                      ) : null}
                      <span
                        style={
                          o.mono
                            ? { fontFamily: mono, fontWeight: 500, fontSize: lineSize * 0.92, color: C.ink, background: C.paper, borderRadius: 12, padding: "6px 14px" }
                            : { fontFamily: sans, fontWeight: 600, fontSize: lineSize, lineHeight: 1.2, letterSpacing: "-0.01em", color: C.mute }
                        }
                      >
                        {o.t}
                      </span>
                    </div>
                  );
                })}
                {typeof col.body === "function" ? col.body({ won, lost }) : col.body}
              </div>
            </div>
            {winner && winner.index === i ? <Badge at={winner.at + 2} kind="check" color={C.accent} size={three ? 60 : 72} /> : null}
            {v ? <Badge at={v.at} kind={v.ok ? "check" : "cross"} color={v.ok ? GREEN : RED} size={three ? 60 : 72} /> : null}
          </div>
        );
      })}
      {columns.slice(1).map((_, i) => {
        const va = at + (i + 1) * stagger + 4;
        if (frame < va) return null;
        const vp = prog(frame, va, 8);
        return (
          <div
            key={`vs${i}`}
            style={{
              position: "absolute",
              left: (i + 1) * (cw + gap) - gap / 2 - 38,
              top: headH / 2 - 27,
              width: 76,
              height: 54,
              borderRadius: 27,
              background: C.ink,
              color: C.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: "-0.02em",
              boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
              ...materialize(vp, 0.85, 6),
              opacity: vp * interpolate(pw, [0, 1], [1, 0.6]),
            }}
          >
            vs
          </div>
        );
      })}
    </div>
  );
};
