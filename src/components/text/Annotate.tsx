import { interpolateColors, useCurrentFrame } from "remotion";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";

// A mono string (URL, command, path) taken apart: a bracket draws under each segment and its label
// materializes below it. Labels that would collide drop to a second line with a thin leader. `focus`
// dims everything but one segment, so the eye lands on it (the look-alike domain in a phishing link).

export type AnnotateSegment = { from: number; to: number; label: string; at: number; color?: string }; // [from, to) char indexes

/**
 * Annotated mono text in a white address-bar card (`card={false}` for bare text). Segments mark character
 * ranges [from, to) and enter at their own `at`. `focus` keeps one segment at full strength from its frame.
 */
export const Annotate: React.FC<{
  text: string;
  segments: AnnotateSegment[];
  at: number;
  x: number;
  y: number;
  size?: number;
  labelSize?: number;
  card?: boolean;
  focus?: { index: number; at: number; until?: number };
  until?: number;
}> = ({ text, segments, at, x, y, size = 42, labelSize, card = true, focus, until }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const inP = prog(frame, at, 10);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;

  const ls = labelSize ?? Math.round(size * 0.74);
  const charW = size * 0.6; // JetBrains Mono advance
  const padX = card ? 30 : 0;
  const padY = card ? 22 : 0;
  const textH = size * 1.3;
  const boxW = text.length * charW + padX * 2;
  const bracketY = padY * 2 + textH + 14;
  const tick = 14;
  const lineH = ls * 1.5;

  const f = focus ? prog(frame, focus.at, 12, easeInOut) * (focus.until !== undefined ? 1 - prog(frame, focus.until, 12, easeInOut) : 1) : 0;
  const dimFor = (si: number | undefined) => (focus && si !== focus.index ? 1 - 0.72 * f : 1);

  // Stack labels on lines so neighbours never overlap.
  const placed: { l: number; a: number; b: number }[] = [];
  const geo = segments.map((s) => {
    const x0 = padX + s.from * charW + 3;
    const x1 = padX + s.to * charW - 3;
    const cx = (x0 + x1) / 2;
    const half = (s.label.length * ls * 0.53) / 2 + 14;
    let l = 0;
    while (placed.some((q) => q.l === l && cx - half < q.b && cx + half > q.a)) l++;
    placed.push({ l, a: cx - half, b: cx + half });
    return { x0, x1, cx, level: l };
  });

  // Text runs, each tinted by its segment once the bracket is in.
  const segOf = (i: number) => {
    const k = segments.findIndex((s) => i >= s.from && i < s.to);
    return k < 0 ? undefined : k;
  };
  const runs: { t: string; si: number | undefined }[] = [];
  [...text].forEach((ch, i) => {
    const si = segOf(i);
    const last = runs[runs.length - 1];
    if (last && last.si === si) last.t += ch;
    else runs.push({ t: ch, si });
  });

  return (
    <div style={{ position: "absolute", left: x, top: y, width: boxW, ...materialize(inP * (1 - out), 0.97, 8) }}>
      <div
        style={{
          width: boxW,
          padding: `${padY}px ${padX}px`,
          boxSizing: "border-box",
          background: card ? C.white : undefined,
          border: card ? `1px solid ${C.line}` : undefined,
          borderRadius: 22,
          boxShadow: card ? "0 12px 30px rgba(0,0,0,0.08)" : undefined,
          fontFamily: mono,
          fontWeight: 500,
          fontSize: size,
          lineHeight: `${textH}px`,
          whiteSpace: "pre",
          color: C.ink,
        }}
      >
        {runs.map((r, i) => {
          const s = r.si !== undefined ? segments[r.si] : undefined;
          const tint = s?.color && frame >= s.at ? interpolateColors(prog(frame, s.at, 10), [0, 1], [C.ink, s.color]) : C.ink;
          return (
            <span key={i} style={{ color: tint, opacity: dimFor(r.si) }}>
              {r.t}
            </span>
          );
        })}
      </div>
      <svg width={boxW} height={tick + 4} style={{ position: "absolute", left: 0, top: bracketY - 2, overflow: "visible" }}>
        {segments.map((s, i) => {
          if (frame < s.at) return null;
          const g = geo[i];
          const d = prog(frame, s.at, 12);
          return (
            <g key={i} opacity={dimFor(i)}>
              <path
                d={`M${g.x0} 2v${tick}H${g.x1}v${-tick}`}
                fill="none"
                stroke={s.color ?? C.mute}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - d}
              />
              {g.level > 0 ? (
                <path
                  d={`M${g.cx} ${tick + 2}v${g.level * lineH + 8}`}
                  stroke={s.color ?? C.mute}
                  strokeWidth={2}
                  strokeLinecap="round"
                  opacity={0.6 * prog(frame, s.at + 6, 8)}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      {segments.map((s, i) => {
        if (frame < s.at + 5) return null;
        const g = geo[i];
        const p = prog(frame, s.at + 5, 10);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: g.cx,
              top: bracketY + tick + 14 + g.level * lineH,
              translate: "-50% 0px",
              fontFamily: sans,
              fontWeight: 600,
              fontSize: ls,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              color: s.color ?? C.mute,
              transformOrigin: "50% 0%",
              ...materialize(p * dimFor(i), 0.95, 6),
            }}
          >
            {s.label}
          </div>
        );
      })}
    </div>
  );
};
