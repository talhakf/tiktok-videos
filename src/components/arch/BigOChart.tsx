import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED } from "../diagram/Node";

export type BigOClass = "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n²)";

export type BigONValueSpec = {
  from: number;
  to: number;
  at: number;
  dur?: number;
};

/**
 * Dedicated Big-O time complexity coordinate chart & live operation counter (`big-o-60s`).
 * Draws the 5 canonical growth curves (`O(1)`, `O(log n)`, `O(n)`, `O(n log n)`, `O(n²)`)
 * and displays a live bottom comparison strip of operation counts at input size `n`.
 */
export const BigOChart: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  drawAt?: number;
  dur?: number;
  highlight?: BigOClass;
  nValue?: BigONValueSpec;
}> = ({
  x = TX,
  y,
  w = 900,
  h = 560,
  at,
  until,
  drawAt,
  dur = 28,
  highlight,
  nValue,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const startDraw = drawAt ?? at + 6;
  const drawP = prog(frame, startDraw, dur, easeInOut);

  // Compute current n
  const nAnimP = nValue
    ? prog(frame, nValue.at, nValue.dur ?? 34, easeInOut)
    : 0;
  const currentN = nValue
    ? Math.max(1, Math.round(lerp(nValue.from, nValue.to, nAnimP)))
    : 1024;

  // Plot area bounds inside w x h card
  const headerH = 68;
  const stripH = 112;
  const plotLeft = 86;
  const plotRight = w - 148;
  const plotTop = headerH + 26;
  const plotBottom = h - stripH - 34;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  // Generate SVG path strings in [0..1] normalized space mapped to plot box
  const sampleCurve = (fn: (t: number) => number, maxT = 1, steps = 40) => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxT;
      const ny = Math.max(0, Math.min(1, fn(t)));
      pts.push({
        x: plotLeft + t * plotW,
        y: plotBottom - ny * plotH,
      });
    }
    const d = pts
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");
    const endPt = pts[pts.length - 1];
    return { d, endPt };
  };

  const curves: {
    name: BigOClass;
    color: string;
    d: string;
    endPt: { x: number; y: number };
    labelDy?: number;
  }[] = [
    {
      name: "O(1)",
      color: GREEN,
      ...sampleCurve(() => 0.07),
      labelDy: 4,
    },
    {
      name: "O(log n)",
      color: C.accent,
      ...sampleCurve((t) => 0.07 + 0.21 * (Math.log(1 + t * 15) / Math.log(16))),
      labelDy: 0,
    },
    {
      name: "O(n)",
      color: AMBER,
      ...sampleCurve((t) => 0.07 + 0.56 * t),
      labelDy: 0,
    },
    {
      name: "O(n log n)",
      color: "#6E6E73",
      ...sampleCurve((t) => 0.07 + 0.86 * Math.pow(t, 1.35)),
      labelDy: -4,
    },
    {
      name: "O(n²)",
      color: RED,
      ...sampleCurve((t) => 0.07 + 0.93 * Math.pow(t / 0.58, 2.2), 0.58),
      labelDy: -6,
    },
  ];

  // Operation counts at currentN for the 4 main complexity classes
  const logOps = Math.max(1, Math.round(Math.log2(Math.max(2, currentN))));
  const linOps = currentN;
  const quadOps = currentN * currentN;

  const badTone = toneColors("bad");
  const goodTone = toneColors("good");
  const warnTone = toneColors("warn");

  const opCards: {
    name: BigOClass;
    ops: string;
    color: string;
    bg: string;
  }[] = [
    {
      name: "O(1)",
      ops: "1 op",
      color: goodTone.fg,
      bg: goodTone.bg,
    },
    {
      name: "O(log n)",
      ops: `${logOps.toLocaleString()} ops`,
      color: C.accent,
      bg: BLUE_TINT,
    },
    {
      name: "O(n)",
      ops: `${linOps.toLocaleString()} ops`,
      color: warnTone.fg,
      bg: warnTone.bg,
    },
    {
      name: "O(n²)",
      ops: `${quadOps.toLocaleString()} ops`,
      color: badTone.fg,
      bg: badTone.bg,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {/* Header strip */}
      <div
        style={{
          height: headerH,
          padding: "0 30px",
          borderBottom: `1px solid ${C.line}`,
          background: "#FAFAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: BLUE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="trendUp" size={22} color={C.accent} weight={2.2} />
          </div>
          <div style={{ fontSize: 23, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
            Big-O time complexity
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 16px",
            borderRadius: 999,
            background: BLUE_TINT,
            border: `1.5px solid ${C.accent}`,
            fontFamily: mono,
            fontSize: 20,
            fontWeight: 700,
            color: C.accent,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          n = {currentN.toLocaleString()} items
        </div>
      </div>

      {/* SVG Coordinate Plot */}
      <svg
        width={w}
        height={h}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        {/* Horizontal gridlines */}
        {[0.25, 0.5, 0.75, 1].map((g) => {
          const gy = plotBottom - g * plotH;
          return (
            <line
              key={g}
              x1={plotLeft}
              y1={gy}
              x2={plotRight}
              y2={gy}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Axes */}
        <line
          x1={plotLeft}
          y1={plotTop}
          x2={plotLeft}
          y2={plotBottom}
          stroke="rgba(0,0,0,0.22)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={plotLeft}
          y1={plotBottom}
          x2={plotRight}
          y2={plotBottom}
          stroke="rgba(0,0,0,0.22)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Growth curves */}
        {curves.map((c) => {
          const isHi = highlight === c.name;
          const isDim = highlight !== undefined && !isHi;
          const opacity = isDim ? 0.32 : 1;
          const strokeW = isHi ? 6.5 : 4;

          return (
            <g key={c.name} opacity={opacity}>
              <path
                d={c.d}
                fill="none"
                stroke={c.color}
                strokeWidth={strokeW}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - drawP}
              />
              {drawP > 0.92 ? (
                <circle
                  cx={c.endPt.x}
                  cy={c.endPt.y}
                  r={isHi ? 7.5 : 5.5}
                  fill={c.color}
                  stroke={C.white}
                  strokeWidth={2.5}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Axis labels */}
      <div
        style={{
          position: "absolute",
          left: 22,
          top: (plotTop + plotBottom) / 2,
          transform: "translateY(-50%) rotate(-90deg)",
          fontFamily: mono,
          fontSize: 16,
          fontWeight: 600,
          color: C.mute,
          whiteSpace: "nowrap",
        }}
      >
        operations
      </div>
      <div
        style={{
          position: "absolute",
          left: (plotLeft + plotRight) / 2,
          top: plotBottom + 6,
          translate: "-50% 0",
          fontFamily: mono,
          fontSize: 16,
          fontWeight: 600,
          color: C.mute,
        }}
      >
        input size (n) →
      </div>

      {/* Curve end labels */}
      {curves.map((c) => {
        const isHi = highlight === c.name;
        const isDim = highlight !== undefined && !isHi;
        const labelP = prog(frame, startDraw + Math.round(dur * 0.65), 10);
        if (labelP <= 0) return null;

        const labelX =
          c.name === "O(n²)" ? c.endPt.x + 12 : plotRight + 14;
        const labelY = c.endPt.y + (c.labelDy ?? 0) - 14;

        return (
          <div
            key={c.name}
            style={{
              position: "absolute",
              left: labelX,
              top: labelY,
              padding: isHi ? "4px 10px" : "2px 6px",
              borderRadius: 8,
              background: isHi ? c.color : "transparent",
              fontFamily: mono,
              fontSize: isHi ? 20 : 18,
              fontWeight: 700,
              color: isHi ? C.white : c.color,
              whiteSpace: "nowrap",
              ...materialize(labelP, 0.95, 4),
              opacity: labelP * (isDim ? 0.42 : 1),
            }}
          >
            {c.name}
          </div>
        );
      })}

      {/* Bottom Operation Counter Comparison Strip */}
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 16,
          height: stripH - 20,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {opCards.map((card) => {
          const isHi = highlight === card.name;
          return (
            <div
              key={card.name}
              style={{
                borderRadius: 16,
                background: isHi ? card.bg : "#F5F5F7",
                border: `2px solid ${isHi ? card.color : "rgba(0,0,0,0.08)"}`,
                padding: "10px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 17,
                  fontWeight: 700,
                  color: card.color,
                }}
              >
                {card.name}
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 21,
                  fontWeight: 700,
                  color: C.ink,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {card.ops}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
