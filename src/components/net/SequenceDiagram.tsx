import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { CARD_SHADOW, GREEN, lerp, presence, RED, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type SequenceTone = "accent" | "good" | "warn" | "bad" | "neutral";

export type SequenceActor = {
  id: string;
  label: string;
  sub?: string;
  icon?: IconName;
};

export type SequenceMessage = {
  from: string;
  to: string;
  label: string;
  sub?: string;
  at: number;
  dur?: number;
  tone?: SequenceTone;
  dashed?: boolean;
  lost?: boolean;
};

export type SequenceBracket = {
  fromY: number;
  toY: number;
  label: string;
  at: number;
  side?: "left" | "right";
};

const TONE_MAP: Record<SequenceTone, { line: string; fg: string; bg: string; border: string }> = {
  accent: { line: C.accent, fg: C.accent, bg: "#EBF4FF", border: tint(C.accent, 0.28) },
  good: { line: GREEN, fg: "#248A3D", bg: "#EEFAF1", border: tint(GREEN, 0.32) },
  warn: { line: "#FF9F0A", fg: "#A05A00", bg: "rgba(255,159,10,0.14)", border: "rgba(255,159,10,0.35)" },
  bad: { line: RED, fg: "#C9281E", bg: "#FFF1F0", border: tint(RED, 0.32) },
  neutral: { line: WIRE, fg: C.ink, bg: "#F5F5F7", border: C.line },
};

/**
 * Protocol handshake & timeline sequence diagram.
 * Renders 2 or 3 vertical lifelines with top actor headers, directional messages that travel
 * across lifelines over `dur` frames (stopping at 65% with a red "dropped!" badge if `lost: true`),
 * and optional side brackets (e.g. "1-RTT", "3-way handshake").
 */
export const SequenceDiagram: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  actors: SequenceActor[];
  messages: SequenceMessage[];
  brackets?: SequenceBracket[];
}> = ({ x = TX, y, w = 900, h = 640, at, until, actors, messages, brackets = [] }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const headerH = 112;
  const hasLeftBracket = brackets.some((b) => (b.side ?? "left") === "left");
  const hasRightBracket = brackets.some((b) => b.side === "right");
  const padLeft = hasLeftBracket ? 195 : actors.length === 2 ? 190 : 155;
  const padRight = hasRightBracket ? 195 : actors.length === 2 ? 190 : 155;
  const spanW = Math.max(200, w - padLeft - padRight);

  const actorX = (idx: number) => {
    if (actors.length <= 1) return w / 2;
    return padLeft + (idx / (actors.length - 1)) * spanW;
  };

  const actorMap = new Map<string, number>();
  actors.forEach((a, i) => actorMap.set(a.id, actorX(i)));

  const topMsgY = headerH + 54;
  const botMsgY = h - 48;
  const msgCount = messages.length;
  const stepY = msgCount > 1 ? Math.min(108, (botMsgY - topMsgY) / (msgCount - 1)) : 0;
  const msgY = (idx: number) => topMsgY + idx * stepY;

  const resolveBracketY = (val: number) => {
    if (val >= 0 && val < 20 && val < Math.max(1, msgCount)) {
      return msgY(val);
    }
    if (val >= y && val <= y + h) return val - y;
    return Math.max(headerH + 16, Math.min(h - 24, val));
  };

  const lifelineP = prog(frame, at + 4, 14, easeOut);
  const lifelineTop = headerH + 8;
  const lifelineBot = lifelineTop + (h - lifelineTop - 24) * lifelineP;

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
        ...materialize(vis),
      }}
    >
      {/* Subtle header band */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: headerH,
          background: "#FAFAFC",
          borderBottom: `1px solid ${C.line}`,
        }}
      />

      {/* SVG layer for lifelines, message arrows, and brackets */}
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {/* Lifelines */}
        {actors.map((a, i) => {
          const ax = actorX(i);
          return (
            <g key={a.id}>
              <line
                x1={ax}
                y1={lifelineTop}
                x2={ax}
                y2={lifelineBot}
                stroke="#D2D2D7"
                strokeWidth={2.5}
                strokeDasharray="7 7"
                strokeLinecap="round"
              />
              <circle cx={ax} cy={lifelineBot} r={4} fill="#D2D2D7" opacity={lifelineP} />
            </g>
          );
        })}

        {/* Message lines and arrowheads */}
        {messages.map((m, i) => {
          if (frame < m.at) return null;
          const x1 = actorMap.get(m.from) ?? actorX(0);
          const x2 = actorMap.get(m.to) ?? actorX(actors.length - 1);
          const my = msgY(i);
          const dur = m.dur ?? 16;
          const rawP = prog(frame, m.at, dur, easeInOut);
          const maxReach = m.lost ? 0.65 : 1;
          const curX = lerp(x1, x2, rawP * maxReach);
          const dir = x2 >= x1 ? 1 : -1;
          const toneKey: SequenceTone = m.tone ?? (m.lost ? "bad" : "accent");
          const palette = TONE_MAP[toneKey];
          const arrowSize = 11;

          return (
            <g key={i}>
              {/* Origin node dot on lifeline */}
              <circle cx={x1} cy={my} r={5.5} fill={palette.line} opacity={prog(frame, m.at, 5)} />

              {/* Animated message line */}
              <line
                x1={x1}
                y1={my}
                x2={curX}
                y2={my}
                stroke={palette.line}
                strokeWidth={3.5}
                strokeDasharray={m.dashed ? "9 6" : undefined}
                strokeLinecap="round"
              />

              {/* Arrowhead at leading tip (unless lost and finished) */}
              {!(m.lost && rawP >= 0.95) ? (
                <path
                  d={`M ${curX} ${my} L ${curX - dir * arrowSize} ${my - arrowSize * 0.62} L ${curX - dir * arrowSize} ${my + arrowSize * 0.62} Z`}
                  fill={palette.line}
                  stroke={palette.line}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Riding pulse dot while in transit */}
              {rawP > 0 && rawP < 1 ? (
                <circle cx={curX} cy={my} r={7} fill={palette.line} opacity={0.28} />
              ) : null}

              {/* Target arrival dot */}
              {!m.lost && rawP >= 1 ? (
                <circle cx={x2} cy={my} r={5.5} fill={palette.line} />
              ) : null}
            </g>
          );
        })}

        {/* Brackets */}
        {brackets.map((b, i) => {
          if (frame < b.at) return null;
          const bp = prog(frame, b.at, 10, easeOut);
          const side = b.side ?? "left";
          const y1 = resolveBracketY(b.fromY) - 14;
          const y2 = resolveBracketY(b.toY) + 14;
          const firstX = actorX(0);
          const lastX = actorX(actors.length - 1);
          const spineX = side === "left" ? firstX - 30 : lastX + 30;
          const tickX = side === "left" ? firstX - 16 : lastX + 16;
          return (
            <path
              key={i}
              d={`M ${tickX} ${y1} L ${spineX} ${y1} L ${spineX} ${y2} L ${tickX} ${y2}`}
              fill="none"
              stroke={C.mute}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={bp}
            />
          );
        })}
      </svg>

      {/* Actor Header Cards */}
      {actors.map((a, i) => {
        const ax = actorX(i);
        const ap = prog(frame, at + i * 3, 10, easeOut);
        return (
          <div
            key={a.id}
            style={{
              position: "absolute",
              left: ax,
              top: headerH / 2,
              translate: "-50% -50%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 22px",
              borderRadius: 18,
              background: C.white,
              border: `1.5px solid ${C.line}`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              whiteSpace: "nowrap",
              ...materialize(ap),
            }}
          >
            {a.icon ? <Icon name={a.icon} size={30} color={C.accent} weight={2} draw={prog(frame, at + 2 + i * 3, 12)} /> : null}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: C.ink, lineHeight: 1.1 }}>
                {a.label}
              </div>
              {a.sub ? (
                <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 16, color: C.mute, lineHeight: 1.1 }}>
                  {a.sub}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* Message Pill Labels & Lost Badges */}
      {messages.map((m, i) => {
        if (frame < m.at) return null;
        const x1 = actorMap.get(m.from) ?? actorX(0);
        const x2 = actorMap.get(m.to) ?? actorX(actors.length - 1);
        const my = msgY(i);
        const dur = m.dur ?? 16;
        const labelP = prog(frame, m.at + 2, 9, easeOut);
        const toneKey: SequenceTone = m.tone ?? (m.lost ? "bad" : "accent");
        const palette = TONE_MAP[toneKey];
        const midX = m.lost ? lerp(x1, x2, 0.33) : (x1 + x2) / 2;
        const dropX = lerp(x1, x2, 0.65);
        const dropP = m.lost ? prog(frame, m.at + Math.round(dur * 0.62), 9, easeOut) : 0;

        return (
          <div key={i}>
            {/* Pill label */}
            <div
              style={{
                position: "absolute",
                left: midX,
                top: my - 26,
                translate: "-50% -50%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                background: palette.bg,
                border: `1.5px solid ${palette.border}`,
                whiteSpace: "nowrap",
                ...materialize(labelP),
              }}
            >
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: palette.fg }}>{m.label}</span>
              {m.sub ? <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 17, color: C.mute }}>{m.sub}</span> : null}
            </div>

            {/* Dropped badge when lost: true */}
            {m.lost && dropP > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: dropX,
                  top: my,
                  translate: "-14px -50%",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px 4px 6px",
                  borderRadius: 999,
                  background: "#FFF1F0",
                  border: `1.5px solid ${RED}`,
                  boxShadow: "0 4px 10px rgba(255,59,48,0.16)",
                  whiteSpace: "nowrap",
                  ...materialize(dropP),
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: RED,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="cross" size={16} color={C.white} weight={2.6} />
                </div>
                <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 17, color: "#C9281E" }}>dropped!</span>
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Bracket Labels */}
      {brackets.map((b, i) => {
        if (frame < b.at) return null;
        const bp = prog(frame, b.at, 10, easeOut);
        const side = b.side ?? "left";
        const y1 = resolveBracketY(b.fromY) - 14;
        const y2 = resolveBracketY(b.toY) + 14;
        const midY = (y1 + y2) / 2;
        const firstX = actorX(0);
        const lastX = actorX(actors.length - 1);
        const spineX = side === "left" ? firstX - 30 : lastX + 30;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: side === "left" ? spineX - 10 : spineX + 10,
              top: midY,
              translate: side === "left" ? "-100% -50%" : "0% -50%",
              padding: "6px 12px",
              borderRadius: 10,
              background: "#F2F2F4",
              border: `1px solid ${C.line}`,
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 17,
              color: C.ink,
              whiteSpace: "nowrap",
              ...materialize(bp),
            }}
          >
            {b.label}
          </div>
        );
      })}
    </div>
  );
};
