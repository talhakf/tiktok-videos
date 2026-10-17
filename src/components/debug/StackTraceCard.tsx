import { interpolateColors, useCurrentFrame } from "remotion";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { DARK_SYNTAX, LIGHT_SYNTAX, tokenizeLine } from "../dev/syntax";
import { GREEN, presence, RED } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { Mark } from "../layouts/Mark";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, TERM } from "../../theme";
import { tint } from "../windows/MacWindow";

export type TraceFrameItem = {
  minifiedFn: string;
  minifiedLoc: string;
  cleanFn: string;
  cleanLoc: string;
  lib?: boolean;
};

export type OffendingSnippet = {
  file?: string;
  startLine: number;
  errorLine: number;
  lines: string[];
  callout?: string;
};

const DEFAULT_FRAMES: TraceFrameItem[] = [
  {
    minifiedFn: "a.b",
    minifiedLoc: "bundle.min.js:1:48291",
    cleanFn: "getSessionUser",
    cleanLoc: "src/auth/session.ts:42:18",
  },
  {
    minifiedFn: "e.uh",
    minifiedLoc: "bundle.min.js:1:19402",
    cleanFn: "requireAuthMiddleware",
    cleanLoc: "src/api/middleware.ts:27:11",
  },
  {
    minifiedFn: "r.handle",
    minifiedLoc: "vendor.min.js:2:99104",
    cleanFn: "Router.dispatch",
    cleanLoc: "node_modules/hono/router.js:118:5",
    lib: true,
  },
];

const DEFAULT_SNIPPET: OffendingSnippet = {
  file: "src/auth/session.ts",
  startLine: 40,
  errorLine: 42,
  lines: [
    "export function getSessionUser(req: Request) {",
    "  const session = req.context.session;",
    "  return session.user.id;",
    "}",
  ],
  callout: "session.user is undefined",
};

/**
 * Exception Stack Trace & Source-Map de-minifier: shows an ugly minified crash
 * (`TypeError: Cannot read 'id' of undefined at a.b (bundle.min.js:1:48291)`) that transforms
 * at `sourceMapAt` into a clean, readable TypeScript stack trace (`src/auth/session.ts:42:18`)
 * with the exact offending code line highlighted.
 */
export const StackTraceCard: React.FC<{
  error?: string;
  message?: string;
  frames?: TraceFrameItem[];
  snippet?: OffendingSnippet;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  sourceMapAt: number;
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  error = "TypeError",
  message = "Cannot read 'id' of undefined",
  frames = DEFAULT_FRAMES,
  snippet = DEFAULT_SNIPPET,
  x = TX,
  y = TY,
  w = TW,
  h,
  at,
  until,
  sourceMapAt,
  filename = "exception · stack trace",
  right,
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const mapP = prog(frame, sourceMapAt, 14, easeInOut);
  const mapped = mapP > 0.5;
  const pal = dark ? DARK_SYNTAX : LIGHT_SYNTAX;

  const headH = 104;
  const rowH = 66;
  const codeBoxH = 44 + snippet.lines.length * 38 + 20;
  const bodyH = headH + frames.length * rowH + codeBoxH + 34;
  const cardH = h ?? TAB_H + bodyH;

  const badTone = toneColors("bad", dark);
  const warnTone = toneColors("warn", dark);
  const accentTone = toneColors("accent", dark);

  const tabRight = right ?? (mapped ? "sourcemaps: enabled" : "minified bundle");

  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} dark={dark} filename={filename} icon="bug" right={tabRight} style={style}>
      {/* Error header */}
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
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Mark kind="cross" size={30} color={RED} draw={prog(frame, at + 4, 10)} />
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 25, color: badTone.fg }}>
              {error}:
            </span>
            <span
              style={{
                fontFamily: mono,
                fontWeight: 600,
                fontSize: 24,
                color: dark ? TERM.fg : C.ink,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {message}
            </span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 19, color: dark ? TERM.dim : C.mute, paddingLeft: 42 }}>
            {mapped ? `resolved via bundle.min.js.map → ${snippet.file ?? "src/auth/session.ts"}` : "production build · symbols obfuscated"}
          </div>
        </div>

        {/* Source-map state pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 999,
            background: interpolateColors(mapP, [0, 1], [warnTone.bg, accentTone.bg]),
            border: `1.5px solid ${interpolateColors(mapP, [0, 1], [warnTone.edge, C.accent])}`,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 19,
            color: interpolateColors(mapP, [0, 1], [warnTone.fg, accentTone.fg]),
            flexShrink: 0,
          }}
        >
          <Icon name={mapped ? "sparkle" : "warning"} size={20} color={mapped ? C.accent : warnTone.fg} weight={2.2} />
          <span>{mapped ? "source map applied" : "minified crash"}</span>
        </div>
      </div>

      {/* Stack trace frames */}
      {frames.map((f, i) => {
        const enter = prog(frame, at + 6 + i * 3, 9, easeOut);
        const top = headH + i * rowH;
        const isTop = i === 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top,
              height: rowH,
              padding: "0 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: isTop
                ? interpolateColors(mapP, [0, 1], [warnTone.bg, badTone.bg])
                : "transparent",
              borderLeft: isTop
                ? `5px solid ${interpolateColors(mapP, [0, 1], [warnTone.edge, RED])}`
                : "5px solid transparent",
              boxSizing: "border-box",
              fontFamily: mono,
              opacity: enter * (f.lib ? 0.55 : 1),
              translate: `${(1 - enter) * 14}px 0px`,
            }}
          >
            {/* Function name */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22 }}>
              <span style={{ color: dark ? TERM.dim : C.mute, fontWeight: 500 }}>at</span>
              {!mapped ? (
                <span style={{ fontWeight: 700, color: isTop ? warnTone.fg : dark ? TERM.fg : C.ink, opacity: 1 - mapP * 2 }}>
                  {f.minifiedFn}
                </span>
              ) : (
                <span
                  style={{
                    fontWeight: 700,
                    color: isTop ? badTone.fg : dark ? TERM.fg : C.ink,
                    opacity: (mapP - 0.5) * 2,
                  }}
                >
                  {f.cleanFn}
                </span>
              )}
            </div>

            {/* File:line:col location */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!mapped ? (
                <span style={{ fontSize: 21, fontWeight: 500, color: dark ? TERM.dim : C.mute, opacity: 1 - mapP * 2 }}>
                  ({f.minifiedLoc})
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 21,
                    fontWeight: isTop ? 700 : 500,
                    color: isTop ? C.accent : dark ? TERM.dim : C.mute,
                    opacity: (mapP - 0.5) * 2,
                  }}
                >
                  ({f.cleanLoc})
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Code snippet frame: minified 1-liner before sourceMapAt, clean TypeScript snippet at sourceMapAt */}
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          top: headH + frames.length * rowH + 14,
          height: codeBoxH,
          borderRadius: 18,
          background: dark ? "#161618" : "#F7F7FA",
          border: `1.5px solid ${dark ? "rgba(255,255,255,0.1)" : C.line}`,
          overflow: "hidden",
          fontFamily: mono,
        }}
      >
        {/* Sub-bar inside code preview */}
        <div
          style={{
            height: 40,
            padding: "0 20px",
            background: dark ? "#222225" : "#EFEFF4",
            borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            fontWeight: 600,
            color: dark ? TERM.dim : C.mute,
          }}
        >
          <span>{mapped ? `${snippet.file ?? "src/auth/session.ts"}:${snippet.errorLine}:18` : "bundle.min.js:1:48291 (minified column)"}</span>
          <span style={{ color: mapped ? GREEN : warnTone.fg }}>{mapped ? "original TypeScript source" : "uglified output"}</span>
        </div>

        {!mapped ? (
          /* Minified unreadable single-line dump */
          <div
            style={{
              padding: "24px 20px",
              opacity: 1 - mapP * 2,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 21, color: dark ? TERM.dim : C.mute, whiteSpace: "pre", overflow: "hidden" }}>
              {"...function(e,t){var r=e.context.session;return "}
              <span
                style={{
                  background: badTone.bg,
                  color: badTone.fg,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 6,
                  borderBottom: `2.5px solid ${RED}`,
                }}
              >
                a.b(r.user.id)
              </span>
              {"}catch(n){throw new TypeError(n)}..."}
            </div>
            <div style={{ fontSize: 19, color: warnTone.fg, fontWeight: 600 }}>
              Col 48,291 on line 1 — impossible to tell which variable is undefined
            </div>
          </div>
        ) : (
          /* De-minified syntax-highlighted TypeScript code frame */
          <div
            style={{
              padding: "10px 0",
              ...materialize((mapP - 0.5) * 2, 0.97, 4),
            }}
          >
            {snippet.lines.map((lineText, idx) => {
              const lineNum = snippet.startLine + idx;
              const isErr = lineNum === snippet.errorLine;
              const tokens = tokenizeLine(lineText, "ts");
              return (
                <div
                  key={idx}
                  style={{
                    height: 38,
                    padding: "0 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isErr ? badTone.bg : "transparent",
                    borderLeft: isErr ? `4px solid ${RED}` : "4px solid transparent",
                    whiteSpace: "pre",
                    fontSize: 21,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        width: 44,
                        textAlign: "right",
                        marginRight: 20,
                        color: isErr ? badTone.fg : dark ? TERM.dim : "#AEAEB2",
                        fontWeight: isErr ? 700 : 500,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {lineNum}
                    </span>
                    <span>
                      {tokens.map((tk, k) => (
                        <span key={k} style={{ color: pal[tk.k], fontWeight: isErr ? 700 : 500 }}>
                          {tk.t}
                        </span>
                      ))}
                    </span>
                  </div>
                  {isErr && snippet.callout ? (
                    <span
                      style={{
                        padding: "3px 12px",
                        borderRadius: 8,
                        background: tint(RED, 0.16),
                        color: badTone.fg,
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {snippet.callout}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DevCard>
  );
};
