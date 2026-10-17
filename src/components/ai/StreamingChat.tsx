import { useCurrentFrame } from "remotion";
import { DevCard, TAB_H } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { Icon } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

/** Splits a response string into realistic subword-like chunks for token-by-token streaming. */
const toStreamTokens = (input: string | string[]): string[] => {
  if (Array.isArray(input)) return input;
  return input.match(/\s*\S+|\s+/g) ?? [input];
};

/**
 * LLM prompt & streaming response card: user prompt bubble on top, collapsible `"Thought for 1.4s"`
 * reasoning step at `thinkAt`, and token-by-token streaming response starting at `streamAt`
 * with a live speed pill (`"142 tok/s"`).
 */
export const StreamingChat: React.FC<{
  prompt: string;
  response: string | string[];
  thought?: string;
  thoughtLabel?: string;
  speedLabel?: string;
  model?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  thinkAt?: number;
  streamAt?: number;
  framesPerToken?: number;
  dark?: boolean;
  filename?: string;
  style?: React.CSSProperties;
}> = ({
  prompt,
  response,
  thought = "Checking exit code 137 → 128 + SIGKILL (9) → Linux OOM killer terminated container.",
  thoughtLabel = "Thought for 1.4s",
  speedLabel = "142 tok/s",
  model = "sudo-r1-70b",
  x = TX,
  y = TY,
  w = TW,
  h = 540,
  at = 0,
  until,
  thinkAt,
  streamAt,
  framesPerToken = 1.6,
  dark = false,
  filename = "chat · completions",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tThink = thinkAt ?? at + 12;
  const tStream = streamAt ?? tThink + 26;

  const promptP = prog(frame, at + 4, 10, easeOut);
  const thinkP = prog(frame, tThink, 10, easeOut);
  const collapseP = prog(frame, tStream - 4, 12, easeInOut);
  const streamStartP = prog(frame, tStream, 8, easeOut);

  const tokens = toStreamTokens(response);
  const elapsedStream = Math.max(0, frame - tStream);
  const visibleCount = frame < tStream ? 0 : Math.min(tokens.length, Math.floor(elapsedStream / framesPerToken) + 1);
  const isStreaming = frame >= tStream && visibleCount < tokens.length;
  const isDone = visibleCount >= tokens.length && frame >= tStream;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const line = dark ? "rgba(255,255,255,0.10)" : C.line;
  const bodyH = h - (filename !== undefined ? TAB_H : 0);

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="sparkle"
      right={model}
      style={style}
    >
      <div
        style={{
          padding: "26px 34px",
          height: bodyH,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxSizing: "border-box",
        }}
      >
        {/* User prompt bubble */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            ...materialize(promptP),
          }}
        >
          <div
            style={{
              maxWidth: w - 160,
              padding: "16px 24px",
              borderRadius: "22px 22px 6px 22px",
              background: dark ? "#2C2C2E" : BLUE_TINT,
              border: `1.5px solid ${tint(C.accent, 0.28)}`,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 26,
              lineHeight: 1.35,
              color: fg,
              letterSpacing: "-0.01em",
            }}
          >
            {prompt}
          </div>
        </div>

        {/* Collapsible reasoning step */}
        {frame >= tThink ? (
          <div
            style={{
              borderRadius: 18,
              background: dark ? "rgba(255,255,255,0.04)" : "#F5F5F7",
              border: `1px solid ${line}`,
              padding: "12px 20px",
              overflow: "hidden",
              ...materialize(thinkP),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 22,
                color: collapseP > 0.5 ? mute : C.accent,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon
                  name="sparkle"
                  size={24}
                  color={collapseP > 0.5 ? mute : C.accent}
                  weight={2}
                />
                <span>{collapseP > 0.4 ? thoughtLabel : "Reasoning..."}</span>
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 19,
                  color: mute,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{collapseP > 0.5 ? "collapsed" : "chain-of-thought"}</span>
                <span
                  style={{
                    display: "inline-block",
                    transform: `rotate(${lerp(90, 0, collapseP)}deg)`,
                  }}
                >
                  ›
                </span>
              </div>
            </div>

            {/* Expandable thought preview that tucks away as streaming starts */}
            {collapseP < 0.98 ? (
              <div
                style={{
                  marginTop: lerp(10, 0, collapseP),
                  maxHeight: lerp(76, 0, collapseP),
                  opacity: 1 - collapseP,
                  overflow: "hidden",
                  fontFamily: mono,
                  fontSize: 20,
                  lineHeight: 1.4,
                  color: mute,
                  borderLeft: `3px solid ${C.accent}`,
                  paddingLeft: 14,
                }}
              >
                {thought}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Streaming response area */}
        {frame >= tStream ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              ...materialize(streamStartP),
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontWeight: 500,
                fontSize: 28,
                lineHeight: 1.48,
                color: fg,
                letterSpacing: "-0.01em",
                whiteSpace: "pre-wrap",
              }}
            >
              {tokens.slice(0, visibleCount).map((tok, i) => {
                const tokAppearAt = tStream + i * framesPerToken;
                const tokP = prog(frame, tokAppearAt, 6, easeOut);
                const isNewest = i >= visibleCount - 2 && isStreaming;
                return (
                  <span
                    key={i}
                    style={{
                      opacity: tokP,
                      color: isNewest ? C.accent : fg,
                    }}
                  >
                    {tok}
                  </span>
                );
              })}
              {isStreaming ? (
                <span
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 28,
                    marginLeft: 5,
                    verticalAlign: "text-bottom",
                    borderRadius: 4,
                    background: C.accent,
                  }}
                />
              ) : null}
            </div>

            {/* Bottom telemetry & speed pill */}
            <div
              style={{
                paddingTop: 14,
                borderTop: `1px solid ${line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: mono,
                fontSize: 21,
                fontWeight: 600,
              }}
            >
              <div style={{ color: mute, fontVariantNumeric: "tabular-nums" }}>
                emitted:{" "}
                <span style={{ color: fg }}>
                  {visibleCount}/{tokens.length} tok
                </span>
              </div>

              <div
                style={{
                  height: 42,
                  padding: "0 16px",
                  borderRadius: 21,
                  background: isDone ? tint(GREEN, 0.14) : tint(C.accent, 0.12),
                  color: isDone ? "#248A3D" : C.accent,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    background: isDone ? GREEN : C.accent,
                  }}
                />
                <span>{speedLabel}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
