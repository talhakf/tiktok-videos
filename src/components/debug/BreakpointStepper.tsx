import { useCurrentFrame } from "remotion";
import { AMBER, DevCard, focusTrack, TAB_H, toneColors } from "../dev/card";
import { CodeLang, DARK_SYNTAX, LIGHT_SYNTAX, tokenize } from "../dev/syntax";
import { lerp, presence, RED } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { tint } from "../windows/MacWindow";

export type DebugStep = {
  at: number;
  line: number; // 1-based line number (relative to startLine)
  locals: Record<string, string>;
  note?: string;
};

/**
 * Interactive IDE Step Debugger card: left pane shows numbered code lines with a red breakpoint dot
 * and a gliding yellow current-line execution highlight; right pane shows `Locals / Watch` variables
 * updating live as execution steps through the function.
 */
export const BreakpointStepper: React.FC<{
  code: string;
  lang?: CodeLang;
  steps: DebugStep[];
  breakpoints?: number[];
  startLine?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  code,
  lang = "ts",
  steps,
  breakpoints,
  startLine = 1,
  x = TX,
  y = TY,
  w = TW,
  h,
  at,
  until,
  filename = "debugger · checkout.ts",
  right,
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const lines = tokenize(code, lang);
  const pal = dark ? DARK_SYNTAX : LIGHT_SYNTAX;
  const warnTone = toneColors("warn", dark);
  const accentTone = toneColors("accent", dark);

  const bps = breakpoints ?? (steps.length > 0 ? [steps[0].line] : [2]);
  const track = focusTrack(frame, steps, 10, 8);

  // Determine active step index for header & locals
  const sortedSteps = [...steps].sort((a, b) => a.at - b.at);
  let activeIdx = -1;
  for (let i = 0; i < sortedSteps.length; i++) {
    if (sortedSteps[i].at <= frame) activeIdx = i;
  }
  const curStep = activeIdx >= 0 ? sortedSteps[activeIdx] : sortedSteps[0];
  const prevStep = activeIdx > 0 ? sortedSteps[activeIdx - 1] : null;

  const toolbarH = 66;
  const lineH = 44;
  const padY = 20;
  const codePaneW = Math.round(w * 0.59);
  const watchPaneW = w - codePaneW;
  const bodyH = toolbarH + padY * 2 + Math.max(lines.length, 6) * lineH;
  const cardH = h ?? TAB_H + bodyH;

  const lineTop = (lineNum: number) => padY + (lineNum - startLine) * lineH;
  const glideTop = track
    ? lerp(
        lineTop(track.prev?.line ?? track.cur.line),
        lineTop(track.cur.line),
        track.t,
      )
    : curStep
      ? lineTop(curStep.line)
      : padY;

  const stepPulse = curStep ? prog(frame, curStep.at, 10, easeOut) : 1;
  const localEntries = curStep ? Object.entries(curStep.locals) : [];

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      dark={dark}
      filename={filename}
      icon="bug"
      right={right ?? (curStep ? `paused · line ${curStep.line}` : "ready")}
      style={style}
    >
      {/* Debugger control bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: toolbarH,
          padding: "0 28px",
          borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.1)" : C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: dark ? "#242426" : "#FAFAFC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Debugger controls: Continue, Step Over, Step Into */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 38,
                height: 34,
                borderRadius: 9,
                background: dark ? "#323236" : "#EFEFF4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="play" size={18} color={C.accent} weight={2.4} />
            </div>
            <div
              style={{
                padding: "0 12px",
                height: 34,
                borderRadius: 9,
                background: accentTone.bg,
                border: `1.5px solid ${C.accent}`,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 17,
                color: accentTone.fg,
              }}
            >
              <Icon name="refresh" size={17} color={C.accent} weight={2.4} />
              <span>step over</span>
            </div>
          </div>

          <div
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              background: warnTone.bg,
              color: warnTone.fg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 18,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            line {curStep?.line ?? startLine} · step {Math.max(1, activeIdx + 1)}/{ Math.max(1, sortedSteps.length)}
          </div>
        </div>

        {/* Optional step note callout */}
        {curStep?.note ? (
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              background: dark ? "#2E2618" : "rgba(255,159,10,0.14)",
              border: `1.5px solid ${AMBER}`,
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 18,
              color: warnTone.fg,
              ...materialize(stepPulse, 0.96, 4),
            }}
          >
            {curStep.note}
          </div>
        ) : null}
      </div>

      {/* Left pane: Code with breakpoint dots & gliding yellow execution line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: toolbarH,
          width: codePaneW,
          bottom: 0,
          borderRight: `1px solid ${dark ? "rgba(255,255,255,0.1)" : C.line}`,
          overflow: "hidden",
        }}
      >
        {/* Gliding yellow execution highlight band */}
        {curStep ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: glideTop,
              height: lineH,
              background: warnTone.bg,
              borderLeft: `5px solid ${AMBER}`,
              opacity: track ? track.o : 1,
            }}
          />
        ) : null}

        {/* Code lines */}
        <div style={{ position: "absolute", left: 0, right: 0, top: padY, fontFamily: mono, fontSize: 21, fontWeight: 500 }}>
          {lines.map((tokens, i) => {
            const lineNum = startLine + i;
            const hasBp = bps.includes(lineNum);
            const isCur = curStep?.line === lineNum;
            return (
              <div
                key={i}
                style={{
                  height: lineH,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 14,
                  paddingRight: 16,
                  whiteSpace: "pre",
                }}
              >
                {/* Breakpoint dot */}
                <div style={{ width: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {hasBp ? (
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        background: RED,
                        boxShadow: `0 0 0 3px ${tint(RED, 0.22)}`,
                      }}
                    />
                  ) : isCur ? (
                    <Icon name="arrowRight" size={16} color={AMBER} weight={2.8} />
                  ) : null}
                </div>

                {/* Line number */}
                <div
                  style={{
                    width: 38,
                    textAlign: "right",
                    marginRight: 18,
                    color: isCur ? warnTone.fg : dark ? TERM.dim : "#AEAEB2",
                    fontWeight: isCur ? 700 : 500,
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {lineNum}
                </div>

                {/* Syntax-highlighted code */}
                <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {tokens.map((tk, k) => (
                    <span key={k} style={{ color: pal[tk.k], fontWeight: isCur ? 700 : 500 }}>
                      {tk.t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right pane: Locals / Watch inspector */}
      <div
        style={{
          position: "absolute",
          left: codePaneW,
          top: toolbarH,
          width: watchPaneW,
          bottom: 0,
          background: dark ? "#19191B" : "#F9F9FB",
          padding: `${padY}px 22px`,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 10,
            borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
            fontFamily: sans,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 20, color: dark ? TERM.fg : C.ink, letterSpacing: "-0.01em" }}>
            Locals / Watch
          </span>
          <span style={{ fontFamily: mono, fontSize: 17, fontWeight: 600, color: dark ? TERM.dim : C.mute }}>
            scope: block
          </span>
        </div>

        {/* Variable rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          {localEntries.map(([k, v]) => {
            const prevVal = prevStep?.locals[k];
            const changed = activeIdx > 0 && prevVal !== v;
            return (
              <div
                key={k}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: changed
                    ? warnTone.bg
                    : dark
                      ? "#232326"
                      : C.white,
                  border: `1.5px solid ${
                    changed
                      ? AMBER
                      : dark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.08)"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  fontFamily: mono,
                  ...(changed ? materialize(stepPulse, 0.96, 4) : {}),
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 600, color: dark ? TERM.cyan : "#2F6F78" }}>
                  {k}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  {changed && prevVal !== undefined ? (
                    <span
                      style={{
                        fontSize: 17,
                        color: dark ? TERM.dim : C.mute,
                        textDecoration: "line-through",
                      }}
                    >
                      {prevVal}
                    </span>
                  ) : null}
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: changed ? warnTone.fg : dark ? TERM.fg : C.ink,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {v}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DevCard>
  );
};
