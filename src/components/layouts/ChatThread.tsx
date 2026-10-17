import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { appleSpring, C, prog, sans } from "../../theme";
import { outP } from "./Mark";

// An iMessage conversation: grey incoming bubbles on the left, blue ones on the right, a "…" typing
// bubble before a message lands, an optional contact header and a "Read 3:07 am" receipt. Messages stack
// down from the top, so nothing reflows. Use it for the "problem" beat (a friend asks for the Wi-Fi password).

export type ChatMessage = {
  at: number; // frame the message lands
  text: string; // "\n" for a line break (bubbles don't wrap on their own)
  me?: boolean; // blue, right side
  typing?: number; // frames of the "…" bubble before `at` (default 0 = none)
};

const GREY = "#E9E9EB";

const Tail: React.FC<{ color: string; me?: boolean }> = ({ color, me }) => (
  <svg width={44} height={40} viewBox="0 0 44 40" style={{ position: "absolute", bottom: -2, ...(me ? { right: -10, scale: "-1 1" } : { left: -10 }) }}>
    <path d="M30 0 C30 18 22 32 0 38 C22 40 38 34 44 22 Z" fill={color} />
  </svg>
);

/** Three dots that pulse one after another inside a grey bubble. */
const Typing: React.FC<{ size: number; frame: number }> = ({ size, frame }) => (
  <div style={{ position: "relative", display: "inline-flex", gap: size * 0.22, padding: `${size * 0.52}px ${size * 0.6}px`, background: GREY, borderRadius: size }}>
    {[0, 1, 2].map((i) => {
      const t = ((frame / 18 - i * 0.22) % 1 + 1) % 1;
      const o = 0.35 + 0.5 * Math.max(0, Math.sin(t * Math.PI));
      return <div key={i} style={{ width: size * 0.3, height: size * 0.3, borderRadius: size, background: `rgba(60,60,67,${o})` }} />;
    })}
    <Tail color={GREY} />
  </div>
);

/**
 * Chat thread inside a column at (x, y), `w` wide. `contact` adds the avatar + name header; `readAt` shows
 * "Read …" under the last blue message. `size` = text size (46 reads well on its own, 34 inside a PhoneFrame).
 */
export const ChatThread: React.FC<{
  messages: ChatMessage[];
  x: number;
  y: number;
  w?: number;
  at?: number;
  until?: number;
  size?: number;
  gap?: number;
  contact?: string;
  readAt?: number;
  readLabel?: string;
}> = ({ messages, x, y, w = 900, at = 0, until, size = 46, gap, contact, readAt, readLabel = "Read 3:07 am" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const g = gap ?? size * 0.32;
  const lineH = size * 1.22;
  const bubbleH = (t: string) => t.split("\n").length * lineH + size * 0.9;
  const headH = contact ? size * 3.4 : 0;

  let top = headH;
  const placed = messages.map((m) => {
    const y0 = top;
    const shown = frame >= m.at - (m.typing ?? 0);
    if (shown) top += bubbleH(frame >= m.at ? m.text : "…") + g;
    return { m, y0, shown };
  });
  const lastMine = [...messages].reverse().find((m) => m.me && frame >= m.at);

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: 1 - out }}>
      {contact ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: w, display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.2, opacity: prog(frame, at, 8) }}>
          <div
            style={{
              width: size * 1.9,
              height: size * 1.9,
              borderRadius: size,
              background: "#A6A6AD",
              color: C.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: sans,
              fontWeight: 600,
              fontSize: size * 0.9,
            }}
          >
            {contact[0]}
          </div>
          <div style={{ fontFamily: sans, fontWeight: 500, fontSize: size * 0.56, color: C.ink }}>{contact}</div>
        </div>
      ) : null}

      {placed.map(({ m, y0, shown }, i) => {
        if (!shown) return null;
        const typing = frame < m.at;
        const t0 = typing ? m.at - (m.typing ?? 0) : m.at;
        const s = appleSpring(frame - t0, fps, { response: 0.4, damping: 0.8 });
        const bg = m.me ? C.accent : GREY;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y0,
              ...(m.me ? { right: 10 } : { left: 10 }),
              transformOrigin: m.me ? "100% 100%" : "0% 100%",
              scale: String(interpolate(s, [0, 1], [0.9, 1])),
              opacity: Math.min(1, s * 1.8),
            }}
          >
            {typing ? (
              <Typing size={size} frame={frame} />
            ) : (
              <div
                style={{
                  position: "relative",
                  padding: `${size * 0.45}px ${size * 0.62}px`,
                  background: bg,
                  borderRadius: size * 0.8,
                  fontFamily: sans,
                  fontWeight: 500,
                  fontSize: size,
                  lineHeight: 1.22,
                  letterSpacing: "-0.01em",
                  color: m.me ? C.white : C.ink,
                  whiteSpace: "pre",
                  maxWidth: w * 0.8,
                }}
              >
                {m.text}
                <Tail color={bg} me={m.me} />
              </div>
            )}
          </div>
        );
      })}

      {readAt !== undefined && lastMine && frame >= readAt ? (
        <div
          style={{
            position: "absolute",
            right: 14,
            top: placed[messages.indexOf(lastMine)].y0 + bubbleH(lastMine.text) + 6,
            fontFamily: sans,
            fontWeight: 500,
            fontSize: size * 0.48,
            color: C.mute,
            opacity: prog(frame, readAt, 8),
          }}
        >
          {readLabel}
        </div>
      ) : null}
    </div>
  );
};
