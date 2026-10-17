import { useCurrentFrame } from "remotion";
import { AXIS, GRID, lineUpTo, Pt, valueAt } from "../charts/chart";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { CARD_SHADOW, GREEN, presence, RED } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { tint } from "../windows/MacWindow";

const DEFAULT_HEALTHY = [220, 520, 230, 540, 225, 530, 220, 510, 230];
const DEFAULT_LEAK = [220, 520, 740, 1020, 1280, 1510, 1690, 1840, 1920];

/**
 * Heap Memory & Garbage Collection vs Memory Leak timeline chart: compares a healthy saw-tooth
 * heap curve (periodic GC drops) against a runaway memory leak curve (`leakAt`) with retained
 * object count pills (`"14,200 detached listeners · 1.8 GB"`).
 */
export const MemoryProfiler: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  leakAt?: number;
  healthyPoints?: number[];
  leakPoints?: number[];
  retainedLabel?: string;
  oomLimitMb?: number;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 560,
  at,
  until,
  leakAt,
  healthyPoints = DEFAULT_HEALTHY,
  leakPoints = DEFAULT_LEAK,
  retainedLabel = "14,200 detached listeners · 1.8 GB",
  oomLimitMb = 2000,
  filename = "heap-profiler · v8-inspector",
  right = "heap limit: 2.0 GB",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const bodyH = h - TAB_H;
  const headH = 74;
  const px0 = 116;
  const px1 = w - 42;
  const py0 = headH + 28;
  const py1 = bodyH - 48;

  const yMax = oomLimitMb;
  const yAt = (mb: number) => py1 - (mb / yMax) * (py1 - py0);
  const n = Math.max(healthyPoints.length, leakPoints.length);
  const xAt = (i: number) => px0 + (i / (n - 1)) * (px1 - px0);

  const healthyDrawP = prog(frame, at + 6, 32, easeInOut);
  const leakStart = leakAt ?? at + 18;
  const leakDrawP = prog(frame, leakStart, 34, easeInOut);
  const pillP = prog(frame, leakStart + 18, 12, easeOut);

  const healthyPts: Pt[] = healthyPoints.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const leakPts: Pt[] = leakPoints.map((v, i) => ({ x: xAt(i), y: yAt(v) }));

  const healthyXEnd = px0 + healthyDrawP * (px1 - px0);
  const leakXEnd = px0 + leakDrawP * (px1 - px0);

  const healthyPart = lineUpTo(healthyPts, healthyXEnd);
  const leakPart = frame >= leakStart ? lineUpTo(leakPts, leakXEnd) : null;

  const curLeakMb = frame >= leakStart ? valueAt(leakPoints, leakDrawP * (leakPoints.length - 1)) : healthyPoints[0];
  const curHealthyMb = valueAt(healthyPoints, healthyDrawP * (healthyPoints.length - 1));

  // Build closed polygon path under the leak curve for a subtle solid red tint fill
  const leakAreaPath = leakPart
    ? `${leakPart.d} L${leakPart.tip.x.toFixed(2)} ${py1.toFixed(2)} L${px0.toFixed(2)} ${py1.toFixed(2)} Z`
    : null;

  const badTone = toneColors("bad", dark);
  const goodTone = toneColors("good", dark);
  const ticks = [0, 500, 1000, 1500, 2000];
  const timeTicks = ["0s", "15s", "30s", "45s", "60s"];

  // GC drop indices (even indices > 0 where saw-tooth drops back down)
  const gcDropIndices = [2, 4, 6];

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon="ram" right={right} style={style}>
      {/* Top legend & live counters */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: headH,
          padding: "0 32px",
          borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.1)" : C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: sans,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {/* Healthy GC legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: GREEN }} />
            <span style={{ fontWeight: 600, fontSize: 21, color: dark ? TERM.fg : C.ink }}>
              Healthy GC (saw-tooth)
            </span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 8,
                background: goodTone.bg,
                color: goodTone.fg,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 18,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(curHealthyMb)} MB
            </span>
          </div>

          {/* Leak curve legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: frame >= leakStart ? 1 : 0.45 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: RED }} />
            <span style={{ fontWeight: 600, fontSize: 21, color: dark ? TERM.fg : C.ink }}>
              Memory leak
            </span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 8,
                background: badTone.bg,
                color: badTone.fg,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 18,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {(curLeakMb / 1000).toFixed(2)} GB
            </span>
          </div>
        </div>

        <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 600, color: RED }}>
          OOM threshold · 2.0 GB
        </div>
      </div>

      {/* SVG Plot */}
      <svg width={w} height={bodyH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {/* Grid lines */}
        {ticks.map((mb) => {
          const ty = yAt(mb);
          const isOom = mb === oomLimitMb;
          return (
            <line
              key={mb}
              x1={px0}
              x2={px1}
              y1={ty}
              y2={ty}
              stroke={isOom ? tint(RED, 0.55) : mb === 0 ? AXIS : dark ? "rgba(255,255,255,0.08)" : GRID}
              strokeWidth={2}
              strokeDasharray={isOom ? "8 6" : undefined}
            />
          );
        })}

        {/* Solid light-red area under leak curve */}
        {leakAreaPath ? <path d={leakAreaPath} fill={tint(RED, dark ? 0.14 : 0.09)} /> : null}

        {/* Healthy saw-tooth curve */}
        {healthyPart ? (
          <>
            <path d={healthyPart.d} stroke={GREEN} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={healthyPart.tip.x} cy={healthyPart.tip.y} r={8.5} fill={GREEN} stroke={dark ? TERM.bg : C.white} strokeWidth={3.5} />
          </>
        ) : null}

        {/* Runaway memory leak curve */}
        {leakPart ? (
          <>
            <path d={leakPart.d} stroke={RED} strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={leakPart.tip.x} cy={leakPart.tip.y} r={10} fill={RED} stroke={dark ? TERM.bg : C.white} strokeWidth={3.5} />
          </>
        ) : null}
      </svg>

      {/* Y-axis labels */}
      {ticks.map((mb) => (
        <div
          key={mb}
          style={{
            position: "absolute",
            left: 20,
            width: px0 - 34,
            top: yAt(mb) - 13,
            textAlign: "right",
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 600,
            color: mb === oomLimitMb ? RED : dark ? TERM.dim : C.mute,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb} MB`}
        </div>
      ))}

      {/* X-axis time labels */}
      {timeTicks.map((tLabel, i) => {
        const tx = px0 + (i / (timeTicks.length - 1)) * (px1 - px0);
        return (
          <div
            key={tLabel}
            style={{
              position: "absolute",
              left: tx,
              top: py1 + 12,
              translate: "-50% 0",
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 500,
              color: dark ? TERM.dim : C.mute,
            }}
          >
            {tLabel}
          </div>
        );
      })}

      {/* Periodic GC drop badges along the saw-tooth valleys */}
      {gcDropIndices.map((idx) => {
        const gx = xAt(idx);
        const gy = yAt(healthyPoints[idx]);
        if (healthyXEnd < gx) return null;
        const gp = prog(frame, at + 6 + (idx / (n - 1)) * 28, 8, easeOut);
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: gx,
              top: gy + 10,
              translate: "-50% 0",
              padding: "2px 9px",
              borderRadius: 7,
              background: goodTone.bg,
              border: `1px solid ${tint(GREEN, 0.35)}`,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 16,
              color: goodTone.fg,
              ...materialize(gp, 0.94, 4),
            }}
          >
            GC ↓
          </div>
        );
      })}

      {/* Retained objects callout pill on the runaway leak curve */}
      {pillP > 0 ? (
        <div
          style={{
            position: "absolute",
            left: px0 + 0.56 * (px1 - px0),
            top: yAt(1650) - 18,
            translate: "-50% -100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 18px",
            borderRadius: 999,
            background: dark ? "#2C1B1B" : C.white,
            border: `2px solid ${RED}`,
            boxShadow: CARD_SHADOW,
            fontFamily: sans,
            whiteSpace: "nowrap",
            ...materialize(pillP, 0.95, 6),
          }}
        >
          <Icon name="warning" size={22} color={RED} weight={2.2} />
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 20, color: dark ? TERM.fg : C.ink }}>
            {retainedLabel}
          </span>
        </div>
      ) : null}
    </DevCard>
  );
};
