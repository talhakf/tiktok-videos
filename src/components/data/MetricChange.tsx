import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, easeInOut, materialize, prog, sans } from "../../theme";
import { formatNumber, NumberTicker } from "./NumberTicker";

// The hook stat: "125 ms → 15 ms". The old value lands big, a red strike draws through it, it shrinks
// grey above, and the new value rolls in from the old one in the big slot (blue when better, red when worse).

const RED = "#FF3B30";

/** One value with its unit, Inter 700, unit set smaller (matches NumberTicker). */
const Value: React.FC<{ v: number | string; unit?: string; decimals: number; color: string }> = ({ v, unit, decimals, color }) => (
  <span style={{ display: "inline-flex", alignItems: "baseline", whiteSpace: "pre", color }}>
    <span style={{ fontVariantNumeric: "tabular-nums" }}>{typeof v === "number" ? formatNumber(v, decimals) : v}</span>
    {unit ? <span style={{ fontSize: "0.48em", fontWeight: 600, letterSpacing: "-0.02em", marginLeft: "0.3em" }}>{unit}</span> : null}
  </span>
);

/**
 * Before → after metric. `before` lands at `at`; at `changeAt` it is struck through and moves aside while
 * `after` rolls in (numbers roll digit by digit, strings materialize). `good` (default true) colors the
 * new value blue, otherwise red. The trend icon follows the direction unless `icon` is given.
 */
export const MetricChange: React.FC<{
  before: number | string;
  after: number | string;
  at: number;
  changeAt: number;
  x: number;
  y: number;
  w?: number;
  label?: string;
  unit?: string;
  afterUnit?: string; // when the unit changes too ("2 weeks" → "132 years")
  decimals?: number;
  good?: boolean;
  icon?: "trendUp" | "trendDown" | "arrowRight";
  size?: number;
  until?: number;
}> = ({ before, after, at, changeAt, x, y, w = 900, label, unit, afterUnit, decimals = 0, good = true, icon, size = 220, until }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const inP = prog(frame, at, 10);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;

  const strike = prog(frame, changeAt, 8);
  const move = prog(frame, changeAt + 9, 14, easeInOut);
  const afterAt = changeAt + 15;
  const afterP = prog(frame, afterAt, 10);
  const iconP = prog(frame, changeAt + 22, 14);
  const accent = good ? C.accent : RED;
  const trend = icon ?? (typeof before === "number" && typeof after === "number" && after < before ? "trendDown" : "trendUp");

  const smallScale = 0.42;
  const bigTop = size * 0.62; // the small row sits above the big slot
  const row: React.CSSProperties = { position: "absolute", left: 0, width: w, display: "flex", justifyContent: "center" };

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: bigTop + size * 1.4,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.045em",
        ...materialize(inP * (1 - out)),
      }}
    >
      {/* before: big in the slot, then struck, shrunk and greyed above it */}
      <div style={{ ...row, top: bigTop, translate: `0px ${-bigTop * move}px`, scale: String(1 - (1 - smallScale) * move), transformOrigin: "50% 0%" }}>
        <span style={{ position: "relative" }}>
          <Value v={before} unit={unit} decimals={decimals} color={interpolateColors(move, [0, 1], [C.ink, C.mute])} />
          <span
            style={{
              position: "absolute",
              left: "-0.04em",
              top: "0.47em",
              height: "0.07em",
              width: `calc(${strike} * (100% + 0.08em))`,
              borderRadius: "0.035em",
              background: RED,
              opacity: strike > 0 ? 1 : 0,
            }}
          />
        </span>
      </div>

      {/* after: rolls in from the old value */}
      {frame >= afterAt ? (
        <div style={{ ...row, top: bigTop, ...materialize(afterP, 0.95, 8) }}>
          {typeof before === "number" && typeof after === "number" ? (
            <NumberTicker
              from={before}
              to={after}
              at={afterAt}
              dur={26}
              roll
              enter={false}
              decimals={decimals}
              unit={afterUnit ?? unit}
              size={size}
              color={accent}
            />
          ) : (
            <Value v={after} unit={afterUnit ?? unit} decimals={decimals} color={accent} />
          )}
        </div>
      ) : null}

      {/* label line with the trend icon */}
      <div
        style={{
          ...row,
          top: bigTop + size * 1.12,
          fontSize: size * 0.2,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: C.mute,
        }}
      >
        <span style={{ position: "relative" }}>
          {iconP > 0 ? (
            <span style={{ position: "absolute", right: label ? `calc(100% + ${size * 0.07}px)` : -size * 0.12, top: "50%", translate: "0px -50%" }}>
              <Icon name={trend} size={size * 0.24} color={accent} weight={2.2} draw={iconP} />
            </span>
          ) : null}
          {label ?? ""}
        </span>
      </div>
    </div>
  );
};
