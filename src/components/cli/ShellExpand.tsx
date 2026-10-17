import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export const ShellExpand: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  before: string;
  highlightSpan?: [number, number];
  expandAt: number;
  after: string[];
  sub?: string;
}> = ({ x = TX, y, w = 900, at, until, before, highlightSpan, expandAt, after, sub = "what bash actually runs" }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  // Auto-detect first {...} to last {...} if highlightSpan is not explicitly passed
  const firstBrace = before.indexOf("{");
  const lastBrace = before.lastIndexOf("}");
  const span: [number, number] | null =
    highlightSpan ?? (firstBrace >= 0 && lastBrace > firstBrace ? [firstBrace, lastBrace + 1] : null);

  const expP = prog(frame, expandAt, 14, easeOut);
  const padX = 32;
  const innerW = w - padX * 2;
  const cmdTop = 24;
  const cmdH = 82;
  const fanTop = cmdTop + cmdH;
  const fanH = 78;
  const tokensTop = fanTop + fanH;
  const tokenH = 68;
  const bottomStripTop = tokensTop + tokenH + 18;
  const h = TAB_H + bottomStripTop + 68;

  const count = Math.max(1, after.length);
  const gap = 14;
  const tokenW = (innerW - gap * (count - 1)) / count;
  const tokenFontSize = count >= 4 ? 21 : 25;

  // Calculate approximate horizontal center of the highlighted brace span in the top bar
  const cmdFontSize = 28;
  const charW = cmdFontSize * 0.6;
  const textStartX = 26 + 2 * charW; // "$ " prompt offset
  const originX = span
    ? Math.min(innerW - 60, Math.max(60, textStartX + ((span[0] + span[1]) / 2) * charW))
    : innerW / 2;

  const prefix = span ? before.slice(0, span[0]) : before;
  const mid = span ? before.slice(span[0], span[1]) : "";
  const suffix = span ? before.slice(span[1]) : "";

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename="brace expansion" icon="terminal" right={sub}>
      {/* Top command bar */}
      <div
        style={{
          position: "absolute",
          left: padX,
          top: cmdTop,
          width: innerW,
          height: cmdH,
          borderRadius: 18,
          background: TERM.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 26px",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontWeight: 500,
            fontSize: cmdFontSize,
            color: TERM.fg,
            whiteSpace: "pre",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ color: TERM.green, fontWeight: 700 }}>$ </span>
          <span>{prefix}</span>
          {mid ? (
            <span
              style={{
                color: TERM.blue,
                fontWeight: 700,
                background: tint(TERM.blue, 0.18 + 0.1 * expP),
                border: `2px solid ${tint(TERM.blue, 0.55 + 0.45 * expP)}`,
                borderRadius: 10,
                padding: "2px 8px",
                margin: "0 2px",
              }}
            >
              {mid}
            </span>
          ) : null}
          <span>{suffix}</span>
        </div>

        <div
          style={{
            padding: "6px 14px",
            borderRadius: 10,
            background: expP > 0 ? tint(TERM.blue, 0.2) : "rgba(255,255,255,0.08)",
            fontFamily: mono,
            fontWeight: 600,
            fontSize: 18,
            color: expP > 0 ? TERM.blue : TERM.dim,
          }}
        >
          {expP > 0 ? `→ ${after.length} tokens` : "brace pattern"}
        </div>
      </div>

      {/* SVG fan-out connector curves */}
      <svg
        width={innerW}
        height={fanH}
        viewBox={`0 0 ${innerW} ${fanH}`}
        style={{ position: "absolute", left: padX, top: fanTop, overflow: "visible" }}
      >
        {after.map((_, i) => {
          const itemP = prog(frame, expandAt + i * 2, 12, easeOut);
          const targetX = i * (tokenW + gap) + tokenW / 2;
          const d = `M ${originX} 0 C ${originX} ${fanH * 0.55}, ${targetX} ${fanH * 0.45}, ${targetX} ${fanH - 4}`;
          return (
            <g key={i} opacity={itemP > 0 ? 1 : 0}>
              <path
                d={d}
                fill="none"
                stroke={C.accent}
                strokeWidth={3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - itemP}
              />
              <circle
                cx={targetX}
                cy={fanH - 4}
                r={5}
                fill={C.accent}
                opacity={prog(frame, expandAt + 6 + i * 2, 6, easeOut)}
              />
            </g>
          );
        })}
      </svg>

      {/* Expanded token cards */}
      {after.map((tok, i) => {
        const tokP = prog(frame, expandAt + 3 + i * 2, 10, easeOut);
        const left = padX + i * (tokenW + gap);
        return (
          <div
            key={`${tok}-${i}`}
            style={{
              position: "absolute",
              left,
              top: tokensTop + lerp(-12, 0, tokP),
              width: tokenW,
              height: tokenH,
              borderRadius: 16,
              background: BLUE_TINT,
              border: `2px solid ${C.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 12px",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: tokenFontSize,
              color: C.accent,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              ...materialize(tokP),
            }}
          >
            {tok}
          </div>
        );
      })}

      {/* Assembled command footer */}
      <div
        style={{
          position: "absolute",
          left: padX,
          top: bottomStripTop,
          width: innerW,
          height: 46,
          borderRadius: 12,
          background: "#F5F5F7",
          border: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          ...materialize(prog(frame, expandAt + 8, 10, easeOut)),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: mono,
            fontWeight: 500,
            fontSize: 20,
            color: C.ink,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Icon name="arrowRight" size={20} color={C.accent} weight={2.2} />
          <span>{after.join(" ")}</span>
        </div>
        <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 18, color: C.mute, flexShrink: 0, marginLeft: 12 }}>
          {sub}
        </div>
      </div>
    </DevCard>
  );
};
