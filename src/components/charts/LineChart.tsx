import { useCurrentFrame } from "remotion";
import { C, easeInOut, materialize, prog, sans } from "../../theme";
import { formatNumber } from "../data/NumberTicker";
import { CARD_SHADOW, presence } from "../diagram/Node";
import { AXIS, GRID, lineUpTo, niceScale, seriesColor, valueAt } from "./chart";

// Line chart in the Apple keynote style: a few hairline gridlines with round tick values, lines that draw on
// left to right with a dot riding the tip and the value counting along beside it. One series is blue (the one
// the beat is about), the others grey. A marker can drop a dot and a value pill onto one point later.

export type LineSeries = { label?: string; values: number[]; highlight?: boolean; display?: string };
export type LineMarker = { at: number; x: number; series?: number; label?: string; side?: "above" | "left" | "right" };

/**
 * Line chart at (x, y), `w` × `h` including its axis labels. Series share one x axis (index 0..n-1, evenly
 * spaced); `xLabels[i]` labels index i (leave entries empty to skip). Lines draw from `drawAt` (default
 * `at + 8`) over `dur` frames. `min` / `max` override the round y range, `ticks` ≈ number of gridlines.
 * `unit` follows the end values ("ms"); `display` replaces a series' final end value. `marker.x` may be
 * fractional; `marker.series` defaults to the highlighted series. The marker pill sits on the side the line
 * leaves free (upper left on a rising line, upper right on a falling one) unless `marker.side` says otherwise.
 */
export const LineChart: React.FC<{
  series: LineSeries[];
  at: number;
  x: number;
  y: number;
  w?: number;
  h?: number;
  until?: number;
  drawAt?: number;
  dur?: number;
  xLabels?: string[];
  min?: number;
  max?: number;
  ticks?: number;
  decimals?: number;
  unit?: string;
  yLabel?: string;
  endLabels?: boolean;
  endW?: number; // room right of the plot for the end labels
  marker?: LineMarker;
  fontSize?: number;
}> = ({
  series,
  at,
  x,
  y,
  w = 900,
  h = 560,
  until,
  drawAt,
  dur = 40,
  xLabels,
  min,
  max,
  ticks = 4,
  decimals = 0,
  unit,
  yLabel,
  endLabels = true,
  endW = 190,
  marker,
  fontSize = 26,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const all = series.flatMap((s) => s.values);
  const lo = min ?? Math.min(0, ...all);
  const hi = max ?? Math.max(...all);
  const sc = niceScale(lo, hi, ticks);
  const yMin = min ?? sc.min;
  const yMax = max ?? sc.max;
  const tickVals = sc.ticks.filter((v) => v >= yMin - 1e-9 && v <= yMax + 1e-9);
  const tickDec = Number.isInteger(sc.step) ? 0 : sc.step * 10 === Math.round(sc.step * 10) ? 1 : 2;

  const axisW = Math.max(70, Math.max(...tickVals.map((v) => formatNumber(v, tickDec).length)) * fontSize * 0.62 + 22);
  const topPad = yLabel ? fontSize * 1.8 : fontSize * 0.6;
  const px0 = axisW;
  const px1 = w - (endLabels ? endW : 20);
  const py0 = topPad;
  const py1 = h - (xLabels ? fontSize * 2.2 : 10);
  const n = Math.max(...series.map((s) => s.values.length));
  const xAt = (i: number) => px0 + (n > 1 ? i / (n - 1) : 0) * (px1 - px0);
  const yAt = (v: number) => py1 - ((v - yMin) / (yMax - yMin)) * (py1 - py0);

  const gridP = prog(frame, at, 16);
  const start = drawAt ?? at + 8;
  const t = prog(frame, start, dur, easeInOut);
  const xEnd = px0 + t * (px1 - px0);
  const hiIndex = series.some((s) => s.highlight) ? series.findIndex((s) => s.highlight) : 0;
  const isHi = (i: number) => (series.some((s) => s.highlight) ? !!series[i].highlight : i === 0);

  // Draw order: greys first, the blue series on top.
  let grey = 0;
  const lines = series.map((s, i) => {
    const pts = s.values.map((v, j) => ({ x: xAt(j), y: yAt(v) }));
    const part = lineUpTo(pts, xEnd);
    const fi = Math.min(s.values.length - 1, ((xEnd - px0) / (px1 - px0)) * (n - 1));
    const color = seriesColor(isHi(i), isHi(i) ? 0 : grey++);
    return { s, i, part, value: valueAt(s.values, fi), done: fi >= s.values.length - 1 && t > 0, color, hi: isHi(i) };
  });
  const order = [...lines].sort((a, b) => Number(a.hi) - Number(b.hi));

  // End labels: pushed apart when two tips come too close.
  const labelH = fontSize * 2.6;
  const placed = lines
    .filter((l) => l.part)
    .map((l) => ({ l, y: l.part!.tip.y }))
    .sort((a, b) => a.y - b.y);
  for (let k = 1; k < placed.length; k++) placed[k].y = Math.max(placed[k].y, placed[k - 1].y + labelH);

  // Marker
  const mk = marker && frame >= marker.at ? marker : undefined;
  const mkS = mk ? series[mk.series ?? hiIndex] : undefined;
  const mkV = mk && mkS ? valueAt(mkS.values, mk.x) : 0;
  const mkPt = mk ? { x: xAt(mk.x), y: yAt(mkV) } : { x: 0, y: 0 };
  const mkLine = mk ? prog(frame, mk.at, 12) : 0;
  const mkDot = mk ? prog(frame, mk.at + 6, 10) : 0;
  const mkPill = mk ? prog(frame, mk.at + 10, 10) : 0;
  const slope = mk && mkS ? valueAt(mkS.values, mk.x + 0.5) - valueAt(mkS.values, mk.x - 0.5) : 0;
  const side = mk?.side ?? (Math.abs(slope) < (yMax - yMin) * 0.01 ? "above" : slope > 0 ? "left" : "right");

  const text: React.CSSProperties = { position: "absolute", fontFamily: sans, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: p }}>
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {tickVals.map((v) => (
          <line
            key={v}
            x1={px0}
            x2={px0 + (px1 - px0) * gridP}
            y1={yAt(v)}
            y2={yAt(v)}
            stroke={v === yMin ? AXIS : GRID}
            strokeWidth={2}
          />
        ))}
        {mk ? (
          <line x1={mkPt.x} x2={mkPt.x} y1={py1} y2={py1 + (mkPt.y - py1) * mkLine} stroke={AXIS} strokeWidth={2} opacity={mkLine} />
        ) : null}
        {order.map((l) =>
          l.part ? (
            <path key={l.i} d={l.part.d} stroke={l.color} strokeWidth={l.hi ? 7 : 5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ) : null,
        )}
        {order.map((l) =>
          l.part ? (
            <circle key={l.i} cx={l.part.tip.x} cy={l.part.tip.y} r={l.hi ? 11 : 9} fill={l.color} stroke={C.paper} strokeWidth={4} />
          ) : null,
        )}
        {mk ? (
          <circle cx={mkPt.x} cy={mkPt.y} r={9 + 4 * mkDot} fill={C.accent} stroke={C.paper} strokeWidth={4} opacity={mkDot} />
        ) : null}
      </svg>

      {/* y ticks */}
      {tickVals.map((v) => (
        <div
          key={v}
          style={{ ...text, right: w - px0 + 18, top: yAt(v) - fontSize * 0.6, fontSize, fontWeight: 600, color: C.mute, lineHeight: 1.2, opacity: gridP }}
        >
          {formatNumber(v, tickDec)}
        </div>
      ))}
      {yLabel ? (
        <div style={{ ...text, left: px0, top: 0, fontSize, fontWeight: 600, color: C.mute, letterSpacing: "-0.01em", opacity: gridP }}>{yLabel}</div>
      ) : null}

      {/* x labels */}
      {(xLabels ?? []).map((lb, i) =>
        lb ? (
          <div
            key={i}
            style={{ ...text, left: xAt(i), top: py1 + fontSize * 0.6, translate: "-50% 0", fontSize, fontWeight: 600, color: C.mute, opacity: gridP }}
          >
            {lb}
          </div>
        ) : null,
      )}

      {/* end labels riding the tips */}
      {endLabels
        ? placed.map(({ l, y: ly }) => {
            const tip = l.part!.tip;
            const vp = prog(frame, start, 8);
            const shown = l.done && l.s.display ? l.s.display : formatNumber(l.value, decimals);
            return (
              <div key={l.i} style={{ ...text, left: tip.x + 24, top: ly - fontSize * 0.85, lineHeight: 1, ...materialize(vp, 0.95, 6), transformOrigin: "0% 50%" }}>
                <div style={{ fontSize: fontSize * 1.45, fontWeight: 700, letterSpacing: "-0.03em", color: l.hi ? C.accent : C.ink }}>
                  {shown}
                  {unit && !(l.done && l.s.display) ? (
                    <span style={{ fontSize: fontSize * 0.9, fontWeight: 600, color: C.mute, letterSpacing: "-0.01em" }}> {unit}</span>
                  ) : null}
                </div>
                {l.s.label ? (
                  <div style={{ marginTop: 6, fontSize: fontSize * 0.92, fontWeight: 600, color: C.mute, letterSpacing: "-0.01em" }}>{l.s.label}</div>
                ) : null}
              </div>
            );
          })
        : null}

      {/* marker pill */}
      {mk ? (
        <div
          style={{
            ...text,
            left: side === "above" ? mkPt.x : mkPt.x + (side === "left" ? -18 : 18),
            top: mkPt.y - (side === "above" ? 30 : 18),
            translate: side === "above" ? "-50% -100%" : side === "left" ? "-100% -100%" : "0 -100%",
            padding: `${fontSize * 0.4}px ${fontSize * 0.7}px`,
            borderRadius: fontSize,
            background: C.white,
            boxShadow: CARD_SHADOW,
            fontSize: fontSize * 1.2,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: C.ink,
            transformOrigin: side === "above" ? "50% 100%" : side === "left" ? "100% 100%" : "0% 100%",
            ...materialize(mkPill, 0.95, 6),
          }}
        >
          {mk.label ?? formatNumber(mkV, decimals)}
          {!mk.label && unit ? <span style={{ fontSize: fontSize * 0.9, fontWeight: 600, color: C.mute }}> {unit}</span> : null}
        </div>
      ) : null}
    </div>
  );
};
