import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { DevCard, TAB_H } from "../dev/card";
import { GREEN, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

// Compiler Lexer / Tokenizer stream:
// Shows a line of source code (`const total = price * 2;`) slicing at `tokenizeAt`
// into typed token cards (`KEYWORD const`, `IDENT total`, `OP =`, `IDENT price`, `OP *`, `NUMBER 2`).

export type LexTokenKind = "KEYWORD" | "IDENT" | "NUMBER" | "STRING" | "OP" | "PUNCT" | (string & {});

export type LexToken = {
  kind: LexTokenKind;
  value: string;
  start?: number;
  end?: number;
  at?: number;
};

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "type", "interface", "import", "export", "from", "async", "await", "def", "class",
]);

/** Deterministic fallback lexer when `tokens` is not explicitly passed. */
export const autoLex = (code: string, includePunct = false): LexToken[] => {
  const out: LexToken[] = [];
  let i = 0;
  while (i < code.length) {
    if (/\s/.test(code[i])) {
      i++;
      continue;
    }
    const start = i;
    if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
      const q = code[i++];
      while (i < code.length && code[i] !== q) {
        if (code[i] === "\\") i++;
        i++;
      }
      if (i < code.length) i++;
      out.push({ kind: "STRING", value: code.slice(start, i), start, end: i });
      continue;
    }
    if (/\d/.test(code[i])) {
      while (i < code.length && /[\d._]/.test(code[i])) i++;
      out.push({ kind: "NUMBER", value: code.slice(start, i), start, end: i });
      continue;
    }
    if (/[A-Za-z_$]/.test(code[i])) {
      while (i < code.length && /[\w$]/.test(code[i])) i++;
      const word = code.slice(start, i);
      out.push({ kind: KEYWORDS.has(word) ? "KEYWORD" : "IDENT", value: word, start, end: i });
      continue;
    }
    const two = code.slice(i, i + 2);
    if (["==", "!=", "<=", ">=", "=>", "&&", "||", "+=", "-="].includes(two)) {
      i += 2;
      out.push({ kind: "OP", value: two, start, end: i });
      continue;
    }
    const ch = code[i++];
    if (/[=+\-*/%<>!&|^~]/.test(ch)) {
      out.push({ kind: "OP", value: ch, start, end: i });
    } else if (includePunct) {
      out.push({ kind: "PUNCT", value: ch, start, end: i });
    }
  }
  return out;
};

const kindColor = (kind: string, dark: boolean): string => {
  const k = kind.toUpperCase();
  if (dark) {
    if (k === "KEYWORD") return TERM.purple;
    if (k === "IDENT") return TERM.blue;
    if (k === "NUMBER") return TERM.yellow;
    if (k === "STRING") return TERM.orange;
    if (k === "OP") return TERM.cyan;
    return TERM.dim;
  }
  if (k === "KEYWORD") return "#8E3CCB";
  if (k === "IDENT") return C.accent;
  if (k === "NUMBER") return "#248A3D";
  if (k === "STRING") return "#B4371F";
  if (k === "OP") return "#C95A00";
  return C.mute;
};

export const LexerTokens: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  code: string;
  tokens?: LexToken[];
  tokenizeAt?: number;
  stepFrames?: number;
  dark?: boolean;
  filename?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  x = 90,
  y,
  w = 900,
  h,
  at = 0,
  until,
  code,
  tokens: propTokens,
  tokenizeAt,
  stepFrames = 6,
  dark = false,
  filename = "lexer.ts",
  right,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const rawTokens = propTokens ?? autoLex(code);
  const startFrame = tokenizeAt ?? at + 14;

  // Locate start/end character offsets in `code` for each token if not specified
  let searchFrom = 0;
  const resolved = rawTokens.map((tk, idx) => {
    const found = tk.start !== undefined ? tk.start : code.indexOf(tk.value, searchFrom);
    const s = found >= 0 ? found : searchFrom;
    const e = tk.end !== undefined ? tk.end : s + tk.value.length;
    searchFrom = Math.max(searchFrom, e);
    const tkAt = tk.at ?? startFrame + idx * stepFrames;
    return { ...tk, start: s, end: e, at: tkAt };
  });

  // Determine how many tokens have been emitted so far
  let activeTokenIdx = -1;
  for (let i = 0; i < resolved.length; i++) {
    if (frame >= resolved[i].at) activeTokenIdx = i;
  }
  const doneAll = resolved.length > 0 && frame >= resolved[resolved.length - 1].at + 10;

  // Build slices of `code` so each lexeme in the input bar highlights as it's scanned
  type CodePiece = { text: string; tokenIndex?: number; start: number; end: number };
  const pieces: CodePiece[] = [];
  let ptr = 0;
  resolved.forEach((tk, idx) => {
    if (tk.start > ptr) {
      pieces.push({ text: code.slice(ptr, tk.start), start: ptr, end: tk.start });
    }
    pieces.push({ text: code.slice(tk.start, tk.end), tokenIndex: idx, start: tk.start, end: tk.end });
    ptr = tk.end;
  });
  if (ptr < code.length) {
    pieces.push({ text: code.slice(ptr), start: ptr, end: code.length });
  }

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const subBg = dark ? "rgba(255,255,255,0.05)" : "#F6F6F9";
  const borderCol = dark ? "rgba(255,255,255,0.1)" : C.line;

  const cols = Math.min(3, Math.max(2, resolved.length <= 4 ? 2 : 3));
  const rows = Math.ceil(resolved.length / cols);
  const bodyH = 152 + 54 + rows * 108 + 26;
  const cardH = h ?? (filename !== undefined ? TAB_H : 0) + bodyH;

  const emittedCount = resolved.filter((t) => frame >= t.at).length;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={cardH}
      p={p}
      dark={dark}
      filename={filename}
      icon="code"
      right={right ?? `${emittedCount}/${resolved.length} tokens`}
      style={style}
    >
      {/* 1. Source Code Input Tape with Lexeme Slicing */}
      <div
        style={{
          padding: "20px 28px 18px",
          borderBottom: `1px solid ${borderCol}`,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontSize: 19, fontWeight: 600, color: mute }}>
            character stream (input)
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 19,
              fontWeight: 600,
              color: doneAll ? (dark ? TERM.green : "#248A3D") : activeTokenIdx >= 0 ? C.accent : mute,
            }}
          >
            {doneAll
              ? `tokenized ${code.length} chars`
              : activeTokenIdx >= 0
                ? `scanning col ${resolved[activeTokenIdx].start}..${resolved[activeTokenIdx].end}`
                : "waiting for lexer"}
          </span>
        </div>

        <div
          style={{
            height: 74,
            borderRadius: 16,
            background: subBg,
            border: `1.5px solid ${borderCol}`,
            padding: "0 22px",
            display: "flex",
            alignItems: "center",
            fontFamily: mono,
            fontSize: 30,
            fontWeight: 600,
            color: fg,
            whiteSpace: "pre",
            overflow: "hidden",
          }}
        >
          {pieces.map((pc, i) => {
            if (pc.tokenIndex === undefined) {
              return (
                <span key={i} style={{ color: mute }}>
                  {pc.text}
                </span>
              );
            }
            const tk = resolved[pc.tokenIndex];
            const sliceP = prog(frame, tk.at, 9, easeOut);
            const isCurrent = pc.tokenIndex === activeTokenIdx && !doneAll;
            const col = kindColor(tk.kind, dark);
            return (
              <span
                key={i}
                style={{
                  position: "relative",
                  padding: sliceP > 0 ? "4px 8px" : "4px 0",
                  margin: sliceP > 0 ? "0 2px" : 0,
                  borderRadius: 9,
                  background: sliceP > 0 ? tint(col, (dark ? 0.24 : isCurrent ? 0.2 : 0.11) * sliceP) : "transparent",
                  border: `1.5px solid ${sliceP > 0 ? tint(col, (isCurrent ? 0.75 : 0.35) * sliceP) : "transparent"}`,
                  color: sliceP > 0.2 ? col : fg,
                  display: "inline-block",
                }}
              >
                {pc.text}
              </span>
            );
          })}
        </div>
      </div>

      {/* 2. Divider Header: Lexer Arrow -> Token Cards */}
      <div
        style={{
          height: 54,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="arrowDown" size={24} color={activeTokenIdx >= 0 ? C.accent : mute} weight={2.2} />
          <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 600, color: mute }}>
            token stream
          </span>
        </div>

        {doneAll ? (
          <div
            style={{
              padding: "4px 14px",
              borderRadius: 999,
              background: tint(GREEN, dark ? 0.2 : 0.12),
              color: dark ? TERM.green : "#248A3D",
              fontFamily: mono,
              fontSize: 19,
              fontWeight: 700,
              ...materialize(prog(frame, resolved[resolved.length - 1].at + 10, 8)),
            }}
          >
            lexing complete
          </div>
        ) : null}
      </div>

      {/* 3. Emitted Token Cards Grid */}
      <div
        style={{
          padding: "0 28px 24px",
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 14,
        }}
      >
        {resolved.map((tk, i) => {
          const tkP = prog(frame, tk.at, 11, easeOut);
          const col = kindColor(tk.kind, dark);
          const isCurrent = i === activeTokenIdx && !doneAll;
          return (
            <div
              key={i}
              style={{
                height: 94,
                borderRadius: 18,
                background: dark ? "rgba(255,255,255,0.04)" : C.white,
                border: `2px solid ${isCurrent ? col : tint(col, dark ? 0.38 : 0.28)}`,
                boxShadow: isCurrent
                  ? `0 8px 20px ${tint(col, 0.16)}`
                  : "0 4px 12px rgba(0,0,0,0.04)",
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                boxSizing: "border-box",
                translate: `0px ${(1 - tkP) * -14}px`,
                ...materialize(tkP),
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      background: tint(col, dark ? 0.22 : 0.13),
                      color: col,
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: 18,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {tk.kind}
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 17, fontWeight: 500, color: mute }}>
                    #{i + 1}
                  </span>
                </div>
                <span style={{ fontFamily: sans, fontSize: 17, fontWeight: 500, color: mute }}>
                  col {tk.start}..{tk.end}
                </span>
              </div>

              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: 12,
                  background: subBg,
                  border: `1px solid ${borderCol}`,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 28,
                  color: fg,
                  whiteSpace: "pre",
                }}
              >
                {tk.value}
              </div>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
