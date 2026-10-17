import { C, TERM } from "../../theme";

// A small, deterministic syntax highlighter for code cards: one line at a time, a handful of regex rules
// per language (keywords, strings, numbers, comments, function calls, keys). Not a parser: multi-line
// strings and block comments are coloured line by line, which is fine for the 5–15 lines a video shows.

export type CodeLang = "bash" | "js" | "ts" | "python" | "json" | "yaml" | "text";
export type TokenKind = "plain" | "kw" | "lit" | "str" | "num" | "com" | "fn" | "key" | "var" | "punct";
export type Token = { t: string; k: TokenKind };
export type SyntaxPalette = Record<TokenKind, string>;

/** Light cards: calm Xcode-light colours (keywords plum, strings red-brown, numbers blue, comments grey). */
export const LIGHT_SYNTAX: SyntaxPalette = {
  plain: C.ink,
  punct: "#4A4A4F",
  kw: "#9B2393",
  lit: "#9B2393",
  str: "#B4371F",
  num: "#1C46B8",
  com: "#7D8590",
  fn: "#2F6F78",
  key: "#2F6F78",
  var: "#7A4CB8",
};

/** Dark cards: the Terminal palette. */
export const DARK_SYNTAX: SyntaxPalette = {
  plain: TERM.fg,
  punct: "#C7C7CC",
  kw: TERM.purple,
  lit: TERM.purple,
  str: TERM.orange,
  num: TERM.yellow,
  com: TERM.dim,
  fn: TERM.blue,
  key: TERM.cyan,
  var: TERM.cyan,
};

const KW: Record<CodeLang, string[]> = {
  js: [
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do", "break", "continue", "new", "class",
    "extends", "import", "from", "export", "default", "async", "await", "try", "catch", "finally", "throw", "typeof",
    "instanceof", "of", "in", "switch", "case", "this", "super", "delete", "void", "yield", "static", "get", "set",
  ],
  ts: [],
  python: [
    "def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "is", "import", "from", "as", "class",
    "try", "except", "finally", "raise", "with", "lambda", "yield", "async", "await", "pass", "break", "continue",
    "global", "nonlocal", "del", "assert", "self",
  ],
  bash: [
    "if", "then", "else", "elif", "fi", "for", "in", "do", "done", "while", "until", "case", "esac", "function",
    "return", "export", "local", "readonly", "unset", "source", "exit", "set",
  ],
  json: [],
  yaml: [],
  text: [],
};
KW.ts = [
  ...KW.js, "type", "interface", "enum", "implements", "private", "public", "protected", "readonly", "as", "keyof",
  "declare", "namespace", "abstract", "satisfies", "string", "number", "boolean", "unknown", "never", "any", "void",
];

const LIT: Record<CodeLang, string[]> = {
  js: ["true", "false", "null", "undefined", "NaN", "Infinity"],
  ts: ["true", "false", "null", "undefined", "NaN", "Infinity"],
  python: ["True", "False", "None"],
  bash: ["true", "false"],
  json: ["true", "false", "null"],
  yaml: ["true", "false", "null", "yes", "no", "on", "off", "~"],
  text: [],
};

const CMD_PREFIX = ["then", "do", "else", "elif", "if", "while", "until", "sudo", "xargs", "time", "exec", "nohup", "watch"];
const ID = /[A-Za-z_$][\w$]*/y;
const NUM = /(?:0[xX][0-9a-fA-F]+|0[bB][01]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)/y;
const DQ = /"(?:[^"\\]|\\.)*"?/y;
const SQ = /'(?:[^'\\]|\\.)*'?/y;
const BT = /`(?:[^`\\]|\\.)*`?/y;
const PY_STR = /[rRbBfFuU]{1,2}(?="|')/y;
const BASH_VAR = /\$(?:\{[^}]*\}?|[A-Za-z_]\w*|[0-9#?@*$!-])/y;
const BASH_FLAG = /--?[A-Za-z0-9][\w-]*/y;
const YAML_KEY = /(\s*)(-\s+)?([^\s:#][^:#]*?)(\s*:)(?=\s|$)/y;
const DECORATOR = /@[A-Za-z_][\w.]*/y;

const match = (re: RegExp, s: string, i: number) => {
  re.lastIndex = i;
  const m = re.exec(s);
  return m ? m[0] : null;
};
const isIdChar = (c: string | undefined) => c !== undefined && /[\w$]/.test(c);

/** Splits one line of code into coloured tokens. Same input, same output (no state between lines). */
export const tokenizeLine = (line: string, lang: CodeLang): Token[] => {
  if (lang === "text") return [{ t: line, k: "plain" }];
  const out: Token[] = [];
  const push = (t: string, k: TokenKind) => {
    if (!t) return;
    const last = out[out.length - 1];
    if (last && last.k === k) last.t += t;
    else out.push({ t, k });
  };
  let i = 0;

  // YAML: "key:" (and "- key:") at the start of a line.
  if (lang === "yaml") {
    YAML_KEY.lastIndex = 0;
    const m = YAML_KEY.exec(line);
    if (m && !/^\s*#/.test(line)) {
      push(m[1], "plain");
      push(m[2] ?? "", "punct");
      push(m[3], "key");
      push(m[4], "punct");
      i = m[0].length;
    }
  }

  let cmdStart = lang === "bash"; // the next word is a command name
  while (i < line.length) {
    const ch = line[i];
    const prev = line[i - 1];
    // whitespace
    if (/\s/.test(ch)) {
      const ws = /\s+/y;
      ws.lastIndex = i;
      const w = ws.exec(line)![0];
      push(w, "plain");
      i += w.length;
      continue;
    }
    // comments
    if ((lang === "js" || lang === "ts") && line.startsWith("//", i)) {
      push(line.slice(i), "com");
      break;
    }
    if ((lang === "js" || lang === "ts") && line.startsWith("/*", i)) {
      const end = line.indexOf("*/", i + 2);
      const t = end < 0 ? line.slice(i) : line.slice(i, end + 2);
      push(t, "com");
      i += t.length;
      continue;
    }
    if ((lang === "python" || lang === "yaml" || lang === "bash") && ch === "#" && (prev === undefined || /\s/.test(prev))) {
      push(line.slice(i), "com");
      break;
    }
    // strings
    if (lang === "python") {
      const pre = match(PY_STR, line, i);
      if (pre && !isIdChar(prev)) {
        const q = match(line[i + pre.length] === '"' ? DQ : SQ, line, i + pre.length)!;
        push(pre + q, "str");
        i += pre.length + q.length;
        continue;
      }
    }
    if (ch === '"' || (ch === "'" && lang !== "json") || (ch === "`" && (lang === "js" || lang === "ts"))) {
      const s = match(ch === '"' ? DQ : ch === "'" ? SQ : BT, line, i)!;
      // JSON / YAML / JS object keys: a string followed by a colon.
      const after = line.slice(i + s.length).match(/^\s*:/);
      push(s, after && (lang === "json" || lang === "yaml") ? "key" : "str");
      i += s.length;
      cmdStart = false;
      continue;
    }
    // bash: variables and flags
    if (lang === "bash") {
      const v = match(BASH_VAR, line, i);
      if (v) {
        push(v, "var");
        i += v.length;
        cmdStart = false;
        continue;
      }
      if (ch === "-" && (prev === undefined || /\s/.test(prev))) {
        const f = match(BASH_FLAG, line, i);
        if (f) {
          push(f, "plain");
          i += f.length;
          continue;
        }
      }
      if (ch === "~" || ch === "/" || (ch === "." && /[./]/.test(line[i + 1] ?? ""))) {
        const path = line.slice(i).match(/^[~./\w-]+/)![0]; // ./build, ~/.bashrc, /etc/hosts
        push(path, cmdStart ? "fn" : "plain");
        i += path.length;
        cmdStart = false;
        continue;
      }
      if (ch === "|" || ch === ";" || ch === "&" || (ch === "(" && prev === "$")) {
        const op = line.slice(i).match(/^(\|\||&&|\||;|&|\()/)![0];
        push(op, "punct");
        i += op.length;
        cmdStart = true;
        continue;
      }
    }
    // yaml: unquoted scalars (paths, versions, images like node:20) are one token
    if (lang === "yaml") {
      const sc = line.slice(i).match(/^[^\s#,[\]{}]+/);
      if (sc) {
        const v = sc[0];
        const k: TokenKind = v === "-" || v === "|" || v === ">" ? "punct" : LIT.yaml.includes(v) ? "lit" : /^-?\d+(\.\d+)?$/.test(v) ? "num" : "plain";
        push(v, k);
        i += v.length;
        continue;
      }
    }
    // python decorators
    if (lang === "python" && ch === "@") {
      const d = match(DECORATOR, line, i);
      if (d) {
        push(d, "kw");
        i += d.length;
        continue;
      }
    }
    // numbers (not inside an identifier)
    if (/\d/.test(ch) && !isIdChar(prev)) {
      const n = match(NUM, line, i);
      if (n && !isIdChar(line[i + n.length])) {
        push(n, "num");
        i += n.length;
        cmdStart = false;
        continue;
      }
    }
    if (ch === "-" && lang !== "bash" && /\d/.test(line[i + 1] ?? "") && !isIdChar(prev) && (lang === "json" || lang === "yaml")) {
      const n = match(NUM, line, i + 1);
      if (n) {
        push("-" + n, "num");
        i += 1 + n.length;
        continue;
      }
    }
    // identifiers: keyword, literal, command, function call, key, plain
    const id = match(ID, line, i);
    if (id) {
      let word = id;
      // bash command names may contain dashes and dots (apt-get, docker-compose, node.js)
      if (lang === "bash") word = line.slice(i).match(/^[\w$.-]+/)![0];
      const rest = line.slice(i + word.length);
      let k: TokenKind = "plain";
      if (LIT[lang].includes(word)) k = "lit";
      else if (KW[lang].includes(word) && line[i - 1] !== ".") k = "kw";
      else if (lang === "bash" && cmdStart) k = "fn";
      else if (lang !== "bash" && /^\s*\(/.test(rest)) k = "fn";
      else if ((lang === "js" || lang === "ts") && /^\s*:/.test(rest) && ["", "{", ",", ";"].includes(line.slice(0, i).trimEnd().slice(-1))) k = "key";
      push(word, k);
      i += word.length;
      // after "if", "then", "sudo", "xargs" ... the next word is a command again
      if (lang === "bash") cmdStart = CMD_PREFIX.includes(word) && (k === "kw" || k === "fn");
      continue;
    }
    push(ch, /[{}[\]().,;:=<>+\-*/%!&|?^~]/.test(ch) ? "punct" : "plain");
    i += 1;
    if (lang === "bash") cmdStart = false;
  }
  return out;
};

/** Tokens of every line of `code` ("\n"-separated). */
export const tokenize = (code: string, lang: CodeLang) => code.split("\n").map((l) => tokenizeLine(l, lang));

/** The first `n` characters of a token line (for typing in). */
export const sliceTokens = (tokens: Token[], n: number): Token[] => {
  const out: Token[] = [];
  let left = n;
  for (const tk of tokens) {
    if (left <= 0) break;
    out.push(tk.t.length <= left ? tk : { t: tk.t.slice(0, left), k: tk.k });
    left -= tk.t.length;
  }
  return out;
};

export const tokensLength = (tokens: Token[]) => tokens.reduce((a, t) => a + t.t.length, 0);
