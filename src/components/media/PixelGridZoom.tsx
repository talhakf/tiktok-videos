import { useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { alpha, BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";

// Raster (PNG/BMP pixel matrix) vs Vector (SVG cubic Bézier path) comparison card:
// zooms in at `zoomAt` (1× → 8×) showing stair-stepped [R, G, B] pixel blocks on the left
// vs infinitely crisp mathematical curves with control handles (P0, P1, P2) on the right.

export type PixelGridZoomProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  zoomAt?: number;
  zoomDur?: number;
  maxZoom?: number;
  rasterLabel?: string;
  vectorLabel?: string;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
};

// 11×11 pixel matrix representing a rasterized circular/Bézier arc crossing from bottom-left to top-right.
// Values: 0 = background, 1 = light anti-aliased edge, 2 = medium edge, 3 = solid shape interior.
const RASTER_MATRIX: number[][] = [
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3],
  [0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3],
  [0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3],
  [0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3],
  [0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3],
  [0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3],
  [0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3],
  [0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
];

export const PixelGridZoom: React.FC<PixelGridZoomProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 680,
  at,
  until,
  zoomAt,
  zoomDur = 30,
  maxZoom = 8,
  rasterLabel = "logo.png · 24×24 bitmap",
  vectorLabel = "logo.svg · cubic Bézier",
  filename = "raster-vs-vector",
  right = "1× → 8× zoom",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const bodyH = h - (filename !== undefined ? TAB_H : 0);
  const pad = 28;
  const zStart = zoomAt ?? at + 22;
  const zoomP = prog(frame, zStart, zoomDur, easeInOut);
  const zoomVal = lerp(1, maxZoom, zoomP);
  const enterP = prog(frame, at + 4, 14);
  const detailP = prog(frame, zStart + Math.round(zoomDur * 0.45), 14);

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const subBg = dark ? "#262629" : "#F5F5F7";
  const paneBg = dark ? "#161618" : C.white;
  const borderCol = dark ? "rgba(255,255,255,0.10)" : C.line;

  const topBarH = 62;
  const gap = 24;
  const paneW = (w - pad * 2 - gap) / 2;
  const paneH = bodyH - pad * 2 - topBarH - 18;
  const viewH = paneH - 122;

  // Visual scale inside the viewport (1x -> 2.45x around the curve boundary so individual pixels become huge)
  const viewScale = lerp(1, 2.45, zoomP);

  const badTone = toneColors("bad", dark);
  const goodTone = toneColors("good", dark);
  const accentTone = toneColors("accent", dark);

  const gridN = RASTER_MATRIX.length;
  const cellSize = 26;
  const gridTotal = gridN * cellSize;
  const gridX0 = (paneW - 24 - gridTotal) / 2;
  const gridY0 = (viewH - gridTotal) / 2;

  const pixelFill = (v: number) => {
    if (v === 0) return dark ? "#1F1F22" : "#F8F8FA";
    if (v === 1) return alpha(C.accent, lerp(0.28, 0.34, zoomP));
    if (v === 2) return alpha(C.accent, lerp(0.62, 0.68, zoomP));
    return C.accent;
  };

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon="image" right={right} style={style}>
      {/* Top Zoom Controller Bar */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: 20,
          height: topBarH,
          borderRadius: 16,
          background: subBg,
          border: `1px solid ${borderCol}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          opacity: enterP,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 22, color: fg, letterSpacing: "-0.01em" }}>
             Magnification
          </span>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 8,
              background: zoomP > 0.5 ? accentTone.bg : tint(C.ink, 0.06),
              color: zoomP > 0.5 ? accentTone.fg : mute,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 22,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {zoomVal.toFixed(1)}×
          </span>
        </div>

        {/* Zoom progress track */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, width: 320 }}>
          <span style={{ fontFamily: mono, fontSize: 19, color: mute }}>1×</span>
          <div style={{ flex: 1, height: 10, borderRadius: 5, background: dark ? "#3A3A3C" : "#E2E2E8", position: "relative" }}>
            <div
              style={{
                width: `${zoomP * 100}%`,
                height: "100%",
                borderRadius: 5,
                background: C.accent,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${zoomP * 100}%`,
                top: "50%",
                width: 20,
                height: 20,
                borderRadius: 10,
                background: C.white,
                border: `3px solid ${C.accent}`,
                translate: "-50% -50%",
              }}
            />
          </div>
          <span style={{ fontFamily: mono, fontSize: 19, fontWeight: 700, color: C.accent }}>{maxZoom}×</span>
        </div>

        <div style={{ fontFamily: mono, fontSize: 20, color: mute }}>
          {zoomP < 0.35 ? "native view" : "sub-pixel inspection"}
        </div>
      </div>

      {/* LEFT PANE: RASTER (PNG / BMP) */}
      <div
        style={{
          position: "absolute",
          left: pad,
          top: 20 + topBarH + 18,
          width: paneW,
          height: paneH,
          borderRadius: 22,
          background: subBg,
          border: `1.5px solid ${zoomP > 0.6 ? alpha(RED, 0.45) : borderCol}`,
          padding: 12,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...materialize(enterP, 0.96, 6),
        }}
      >
        {/* Pane Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px 8px" }}>
          <div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 23, color: fg, letterSpacing: "-0.02em" }}>Raster bitmap</div>
            <div style={{ fontFamily: mono, fontSize: 17, color: mute, marginTop: 2 }}>{rasterLabel}</div>
          </div>
          <div
            style={{
              padding: "5px 12px",
              borderRadius: 10,
              background: zoomP > 0.5 ? badTone.bg : tint(C.ink, 0.06),
              color: zoomP > 0.5 ? badTone.fg : mute,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 17,
            }}
          >
            {zoomP > 0.5 ? "stair-stepped" : "pixel grid"}
          </div>
        </div>

        {/* Raster Viewport */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: viewH,
            borderRadius: 16,
            background: paneBg,
            border: `1px solid ${borderCol}`,
            overflow: "hidden",
          }}
        >
          <svg width={paneW - 24} height={viewH} style={{ display: "block" }}>
            <g
              transform={`translate(${(paneW - 24) / 2}, ${viewH / 2}) scale(${viewScale}) translate(${-(paneW - 24) / 2}, ${-viewH / 2})`}
            >
              {RASTER_MATRIX.map((row, r) =>
                row.map((val, c) => {
                  const cx = gridX0 + c * cellSize;
                  const cy = gridY0 + r * cellSize;
                  const isInspected = r === 4 && c === 3;
                  return (
                    <g key={`${r}-${c}`}>
                      <rect
                        x={cx}
                        y={cy}
                        width={cellSize}
                        height={cellSize}
                        fill={pixelFill(val)}
                        stroke={dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.11)"}
                        strokeWidth={lerp(0.35, 1.1, zoomP)}
                      />
                      {isInspected && detailP > 0 ? (
                        <rect
                          x={cx + 0.5}
                          y={cy + 0.5}
                          width={cellSize - 1}
                          height={cellSize - 1}
                          fill="none"
                          stroke={RED}
                          strokeWidth={2.2}
                          opacity={detailP}
                        />
                      ) : null}
                    </g>
                  );
                }),
              )}
            </g>
          </svg>

          {/* Inspected Pixel RGB Callout Pill */}
          {detailP > 0 ? (
            <div
              style={{
                position: "absolute",
                left: 14,
                bottom: 14,
                padding: "8px 14px",
                borderRadius: 12,
                background: dark ? "rgba(30,30,32,0.94)" : "rgba(255,255,255,0.94)",
                border: `1.5px solid ${RED}`,
                boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
                fontFamily: mono,
                fontSize: 17,
                fontWeight: 700,
                color: fg,
                display: "flex",
                alignItems: "center",
                gap: 10,
                ...materialize(detailP, 0.94, 4),
              }}
            >
              <span style={{ width: 14, height: 14, borderRadius: 4, background: alpha(C.accent, 0.65), border: `1px solid ${C.accent}` }} />
              <span>px[3,4] = [0, 113, 227]</span>
            </div>
          ) : null}
        </div>

        {/* Footer formula */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 10px 2px",
            fontFamily: mono,
            fontSize: 17,
            color: mute,
          }}
        >
          <span>grid[x][y] = [R, G, B]</span>
          <span style={{ color: zoomP > 0.5 ? badTone.fg : mute, fontWeight: 700 }}>
            {zoomP > 0.5 ? "fixed resolution" : "24×24 px"}
          </span>
        </div>
      </div>

      {/* RIGHT PANE: VECTOR (SVG CUBIC BÉZIER) */}
      <div
        style={{
          position: "absolute",
          left: pad + paneW + gap,
          top: 20 + topBarH + 18,
          width: paneW,
          height: paneH,
          borderRadius: 22,
          background: subBg,
          border: `1.5px solid ${zoomP > 0.6 ? C.accent : borderCol}`,
          padding: 12,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...materialize(enterP, 0.96, 6),
        }}
      >
        {/* Pane Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px 8px" }}>
          <div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 23, color: fg, letterSpacing: "-0.02em" }}>Vector path</div>
            <div style={{ fontFamily: mono, fontSize: 17, color: mute, marginTop: 2 }}>{vectorLabel}</div>
          </div>
          <div
            style={{
              padding: "5px 12px",
              borderRadius: 10,
              background: zoomP > 0.5 ? goodTone.bg : BLUE_TINT,
              color: zoomP > 0.5 ? goodTone.fg : C.accent,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 17,
            }}
          >
            {zoomP > 0.5 ? "infinitely crisp" : "math curve"}
          </div>
        </div>

        {/* Vector Viewport */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: viewH,
            borderRadius: 16,
            background: paneBg,
            border: `1px solid ${borderCol}`,
            overflow: "hidden",
          }}
        >
          {(() => {
            const vw = paneW - 24;
            const vh = viewH;
            // Anchor & control points matching the same curve boundary
            const p0 = { x: gridX0 + 18, y: gridY0 + gridTotal - 14 };
            const p1 = { x: gridX0 + 68, y: gridY0 + 82 };
            const p2 = { x: gridX0 + 185, y: gridY0 + 18 };
            const fillPath = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y} L ${gridX0 + gridTotal} ${gridY0} L ${gridX0 + gridTotal} ${gridY0 + gridTotal} L ${gridX0} ${gridY0 + gridTotal} Z`;
            const strokePath = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;

            return (
              <svg width={vw} height={vh} style={{ display: "block" }}>
                <g transform={`translate(${vw / 2}, ${vh / 2}) scale(${viewScale}) translate(${-vw / 2}, ${-vh / 2})`}>
                  {/* Subtle coordinate hairlines */}
                  <line x1={0} y1={vh / 2} x2={vw} y2={vh / 2} stroke={borderCol} strokeWidth={1 / viewScale} strokeDasharray="4 4" />
                  <line x1={vw / 2} y1={0} x2={vw / 2} y2={vh} stroke={borderCol} strokeWidth={1 / viewScale} strokeDasharray="4 4" />

                  {/* Crisp filled vector region */}
                  <path d={fillPath} fill={C.accent} />
                  <path d={strokePath} fill="none" stroke={dark ? "#FFFFFF" : C.ink} strokeWidth={3 / viewScale} strokeLinecap="round" />

                  {/* Bézier Control Handles P0 -> P1 -> P2 */}
                  <g opacity={lerp(0.55, 1, zoomP)}>
                    <line
                      x1={p0.x}
                      y1={p0.y}
                      x2={p1.x}
                      y2={p1.y}
                      stroke={AMBER}
                      strokeWidth={2.4 / viewScale}
                      strokeDasharray={`${5 / viewScale} ${4 / viewScale}`}
                    />
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={AMBER}
                      strokeWidth={2.4 / viewScale}
                      strokeDasharray={`${5 / viewScale} ${4 / viewScale}`}
                    />

                    {/* Anchor P0 */}
                    <rect
                      x={p0.x - 6 / viewScale}
                      y={p0.y - 6 / viewScale}
                      width={12 / viewScale}
                      height={12 / viewScale}
                      rx={2 / viewScale}
                      fill={C.white}
                      stroke={C.ink}
                      strokeWidth={2.4 / viewScale}
                    />
                    {/* Control Point P1 */}
                    <circle
                      cx={p1.x}
                      cy={p1.y}
                      r={7 / viewScale}
                      fill={AMBER}
                      stroke={C.white}
                      strokeWidth={2.4 / viewScale}
                    />
                    {/* Anchor P2 */}
                    <rect
                      x={p2.x - 6 / viewScale}
                      y={p2.y - 6 / viewScale}
                      width={12 / viewScale}
                      height={12 / viewScale}
                      rx={2 / viewScale}
                      fill={C.white}
                      stroke={C.ink}
                      strokeWidth={2.4 / viewScale}
                    />
                  </g>
                </g>
              </svg>
            );
          })()}

          {/* Handle Labels P0, P1, P2 */}
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 14,
              padding: "4px 10px",
              borderRadius: 8,
              background: tint(AMBER, 0.16),
              border: `1px solid ${AMBER}`,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              color: "#A05A00",
            }}
          >
            P1 control handle
          </div>

          <div
            style={{
              position: "absolute",
              right: 16,
              top: 14,
              padding: "4px 10px",
              borderRadius: 8,
              background: dark ? "rgba(30,30,32,0.9)" : "rgba(255,255,255,0.9)",
              border: `1px solid ${borderCol}`,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              color: fg,
            }}
          >
            P0 · P1 · P2
          </div>

          {/* Crisp Equation Callout Pill */}
          {detailP > 0 ? (
            <div
              style={{
                position: "absolute",
                left: 14,
                bottom: 14,
                padding: "8px 14px",
                borderRadius: 12,
                background: dark ? "rgba(30,30,32,0.94)" : "rgba(255,255,255,0.94)",
                border: `1.5px solid ${GREEN}`,
                boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
                fontFamily: mono,
                fontSize: 17,
                fontWeight: 700,
                color: fg,
                display: "flex",
                alignItems: "center",
                gap: 10,
                ...materialize(detailP, 0.94, 4),
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: 6, background: GREEN }} />
              <span>&lt;path d="M P0 Q P1 P2" /&gt;</span>
            </div>
          ) : null}
        </div>

        {/* Footer formula */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 10px 2px",
            fontFamily: mono,
            fontSize: 17,
            color: mute,
          }}
        >
          <span>B(t) = (1−t)²P0 + 2(1−t)tP1 + t²P2</span>
          <span style={{ color: zoomP > 0.5 ? goodTone.fg : C.accent, fontWeight: 700 }}>∞ DPI</span>
        </div>
      </div>
    </DevCard>
  );
};
