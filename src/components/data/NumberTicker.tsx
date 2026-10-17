import { useCurrentFrame } from "remotion";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";

// Big numbers that count up or roll like an odometer. Inter 700, tight tracking, tabular figures,
// formatted with Intl (thousands separators). Every character sits in a fixed 1em-tall cell, so a
// number can sit inline in a sentence or be placed on the page with x / y.

export const formatNumber = (v: number, decimals = 0, locale = "en-US") => {
  const s = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
  return s === "-0" ? "0" : s.replace("-", "\u2212"); // a real minus sign
};

// Baseline of a 1em line box, as a share of the font size (Inter and JetBrains Mono both sit at ~0.86).
const BASELINE = 0.865;
const isDigit = (c?: string) => c !== undefined && c >= "0" && c <= "9";
const mod10 = (n: number) => ((n % 10) + 10) % 10;
/** A digit fades as it leaves the window, so no slivers of half-gone digits show at the edges. */
export const fade = (offset: number) => Math.max(0, 1 - Math.abs(offset) * 1.4);

/** One odometer column: the digits between `pos` and `pos + 1`, clipped to a 1em window. */
const RollColumn: React.FC<{ pos: number }> = ({ pos }) => {
  const base = Math.floor(pos);
  const frac = pos - base;
  const cell: React.CSSProperties = { position: "absolute", left: 0, top: 0 };
  return (
    <span style={{ position: "relative", display: "inline-block", height: "1em", overflow: "hidden" }}>
      <span style={{ visibility: "hidden" }}>0</span>
      <span style={{ ...cell, translate: `0px ${-frac}em`, opacity: fade(frac) }}>{mod10(base)}</span>
      {frac > 0.001 ? <span style={{ ...cell, translate: `0px ${1 - frac}em`, opacity: fade(1 - frac) }}>{mod10(base + 1)}</span> : null}
    </span>
  );
};

/** Rolled number: each digit column slides from its old digit to its new one, odometer style. */
const Rolled: React.FC<{ from: number; to: number; p: number; decimals: number; locale: string }> = ({ from, to, p, decimals, locale }) => {
  const scale = 10 ** decimals;
  const a = Math.round(Math.abs(from) * scale);
  const b = Math.round(Math.abs(to) * scale);
  const fa = [...formatNumber(from, decimals, locale)].reverse();
  const ta = [...formatNumber(to, decimals, locale)].reverse();
  const n = Math.max(fa.length, ta.length);
  const cells: React.ReactNode[] = [];
  let place = 0;
  for (let i = 0; i < n; i++) {
    const fc = fa[i];
    const tc = ta[i];
    // A column that only exists on one side grows in or collapses out.
    const vis = fc !== undefined && tc !== undefined ? 1 : tc !== undefined ? p : 1 - p;
    const wrap: React.CSSProperties = {
      display: "inline-block",
      height: "1em",
      opacity: vis,
      maxWidth: vis < 1 ? `${vis * 0.7}em` : undefined,
      overflow: vis < 1 ? "hidden" : undefined,
    };
    if ((isDigit(fc) || fc === undefined) && (isDigit(tc) || tc === undefined)) {
      const P = Math.floor(a / 10 ** place);
      const Q = Math.floor(b / 10 ** place);
      let d = Q - P;
      if (Math.abs(d) > 20) d = Math.sign(d) * (10 + (Math.abs(d) % 10)); // cap the spin, keep the end digit
      cells.push(
        <span key={i} style={wrap}>
          <RollColumn pos={P + d * p} />
        </span>,
      );
      place++;
    } else {
      // Separator / sign: cross-fade when it changes.
      const same = fc === tc;
      cells.push(
        <span key={i} style={{ ...wrap, position: "relative" }}>
          {same ? (
            tc
          ) : (
            <>
              <span style={{ visibility: "hidden" }}>{tc ?? fc}</span>
              {fc !== undefined ? <span style={{ position: "absolute", left: 0, opacity: 1 - p }}>{fc}</span> : null}
              {tc !== undefined ? <span style={{ position: "absolute", left: 0, opacity: p }}>{tc}</span> : null}
            </>
          )}
        </span>,
      );
    }
  }
  return <>{cells.reverse()}</>;
};

/**
 * Number that counts from `from` to `to` (ease-out) starting at `start` (default `at`), or with `roll` slides
 * each digit column like an odometer. Without x / y it renders inline. `unit` is set smaller after the number.
 */
export const NumberTicker: React.FC<{
  to: number;
  at: number;
  from?: number;
  start?: number; // frame the count starts (default: at)
  dur?: number;
  until?: number;
  x?: number;
  y?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  unit?: string;
  roll?: boolean;
  size?: number;
  color?: string;
  unitColor?: string;
  font?: "sans" | "mono";
  weight?: number;
  locale?: string;
  enter?: boolean; // materialize at `at` (default true); off when the number is part of a bigger entrance
  style?: React.CSSProperties;
}> = ({
  to,
  at,
  from = 0,
  start,
  dur = 30,
  until,
  x,
  y,
  decimals = 0,
  prefix,
  suffix,
  unit,
  roll,
  size = 120,
  color = C.ink,
  unitColor,
  font = "sans",
  weight = 700,
  locale = "en-US",
  enter = true,
  style,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const inP = enter ? prog(frame, at, 9) : 1;
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  const p = prog(frame, start ?? at, dur, easeOut);
  const positioned = x !== undefined && y !== undefined;
  const unitSize = 0.48;
  return (
    <span
      style={{
        ...(positioned ? { position: "absolute", left: x, top: y } : { verticalAlign: "top" }),
        display: "inline-flex",
        alignItems: "flex-start",
        whiteSpace: "pre",
        fontFamily: font === "mono" ? mono : sans,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: font === "mono" ? 0 : "-0.045em",
        fontVariantNumeric: "tabular-nums",
        color,
        ...materialize(inP * (1 - out), 0.95, 8),
        ...style,
      }}
    >
      {prefix ? <span>{prefix}</span> : null}
      {roll ? (
        <Rolled from={from} to={to} p={p} decimals={decimals} locale={locale} />
      ) : (
        <span>{formatNumber(from + (to - from) * p, decimals, locale)}</span>
      )}
      {suffix ? <span>{suffix}</span> : null}
      {unit ? (
        <span
          style={{
            fontSize: `${unitSize}em`,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginLeft: "0.3em",
            marginTop: `${(BASELINE * (1 - unitSize)) / unitSize}em`,
            color: unitColor ?? color,
          }}
        >
          {unit}
        </span>
      ) : null}
    </span>
  );
};
