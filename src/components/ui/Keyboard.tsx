import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { C, easeInOut, materialize, prog, sans, SHADOW_WINDOW } from "../../theme";
import { presence } from "../diagram/Node";
import { Glyph, pressDepth } from "./shared";

// A whole Mac-style keyboard (US layout, function row, inverted-T arrows) for shortcut videos:
// "cmd + shift + 4" lights three keys blue and presses them in order. White keys on a light aluminium
// case, one blue for the keys that matter. Labels are lowercase words (cmd, shift, esc) like KeyCombo,
// or macOS symbols with `legend="symbol"`. Readable at the default 900 px width (labels ≥ 24 px).

type KeyDef = { id: string; label: string; symbol?: string; w: number; row: number; x: number; y?: number; h?: number };

// Row widths in key units (u); every row adds up to 14.5 u like a real Mac keyboard.
const ROWS: [string, string, number, string?][][] = [
  [["esc", "esc", 1.5], ...Array.from({ length: 12 }, (_, i): [string, string, number] => [`f${i + 1}`, `f${i + 1}`, 1]), ["touchid", "", 1]],
  [..."`1234567890-=".split("").map((k): [string, string, number] => [k, k, 1]), ["delete", "delete", 1.5, "⌫"]],
  [["tab", "tab", 1.5, "⇥"], ..."qwertyuiop[]\\".split("").map((k): [string, string, number] => [k, k, 1])],
  [["caps", "caps", 1.75, "⇪"], ..."asdfghjkl;'".split("").map((k): [string, string, number] => [k, k, 1]), ["return", "return", 1.75, "↩"]],
  [["shift", "shift", 2.25, "⇧"], ..."zxcvbnm,./".split("").map((k): [string, string, number] => [k, k, 1]), ["rshift", "shift", 2.25, "⇧"]],
  [
    ["fn", "fn", 1],
    ["ctrl", "ctrl", 1, "⌃"],
    ["opt", "opt", 1, "⌥"],
    ["cmd", "cmd", 1.25, "⌘"],
    ["space", "", 5],
    ["rcmd", "cmd", 1.25, "⌘"],
    ["ropt", "opt", 1, "⌥"],
  ],
];

const LAYOUT: KeyDef[] = (() => {
  const keys: KeyDef[] = [];
  ROWS.forEach((row, r) => {
    let x = 0;
    for (const [id, label, w, symbol] of row) {
      keys.push({ id, label, symbol, w, row: r, x });
      x += w;
    }
  });
  // inverted-T arrows in the last 3 u of the bottom row: half-height keys, up and down stacked
  keys.push({ id: "left", label: "", symbol: "←", w: 1, row: 5, x: 11.5, y: 0.5, h: 0.5 });
  keys.push({ id: "up", label: "", symbol: "↑", w: 1, row: 5, x: 12.5, y: 0, h: 0.5 });
  keys.push({ id: "down", label: "", symbol: "↓", w: 1, row: 5, x: 12.5, y: 0.5, h: 0.5 });
  keys.push({ id: "right", label: "", symbol: "→", w: 1, row: 5, x: 13.5, y: 0.5, h: 0.5 });
  return keys;
})();

const ALIAS: Record<string, string> = {
  command: "cmd",
  "⌘": "cmd",
  option: "opt",
  alt: "opt",
  "⌥": "opt",
  control: "ctrl",
  "⌃": "ctrl",
  "⇧": "shift",
  enter: "return",
  "↩": "return",
  "⏎": "return",
  backspace: "delete",
  "⌫": "delete",
  escape: "esc",
  capslock: "caps",
  "caps lock": "caps",
  "⇪": "caps",
  "⇥": "tab",
  " ": "space",
  "←": "left",
  "→": "right",
  "↑": "up",
  "↓": "down",
};

/**
 * Normalises a key name: "Command", "⌘" → "cmd"; "alt", "option" → "opt"; "enter" → "return";
 * "backspace" → "delete"; letters lowercase. Left modifiers by default; "rcmd", "ropt", "rshift" = the right ones.
 */
export const keyId = (name: string) => {
  const s = name.length === 1 ? name.toLowerCase() : name.trim().toLowerCase();
  return ALIAS[s] ?? s;
};

export type KeyPress = { key: string; at: number; hold?: number };
export type KeyHighlight = { keys: string[]; at: number; until?: number };

/**
 * Mac keyboard at (x, y), `w` wide (height ≈ 0.42 × w with the function row). Keys light up blue while a
 * `highlight` is on (crossfade 6 frames) and while `press`ed: down 4 frames, held `hold` frames, spring up.
 * Hold the modifiers through the last key: `[{key: "cmd", at: 30, hold: 24}, {key: "shift", at: 36, hold: 18}, {key: "4", at: 46}]`.
 * `fnRow` false drops the function row; `legend` "symbol" shows ⌘ ⇧ ⌥ ⌃ instead of words.
 */
export const Keyboard: React.FC<{
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  press?: KeyPress[];
  highlight?: KeyHighlight[];
  fnRow?: boolean;
  legend?: "word" | "symbol";
  color?: string;
}> = ({ x, y, w = 900, at, until, press = [], highlight = [], fnRow = true, legend = "word", color = C.accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const pad = w * 0.026;
  const gap = w * 0.0078;
  const pitch = (w - 2 * pad + gap) / 14.5;
  const u = pitch - gap;
  const fnH = u * 0.7;
  const rowTop = (r: number) => (r === 0 ? 0 : (fnRow ? fnH + gap : 0) + (r - 1) * pitch);
  const h = 2 * pad + rowTop(5) + u;
  const letter = u * 0.52;
  const word = Math.max(24, u * 0.44);

  const presses = press.map((p) => ({ ...p, id: keyId(p.key) }));
  const lights = highlight.map((hl) => ({ ...hl, ids: hl.keys.map(keyId) }));

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: pad * 1.3,
        background: "#E3E4E8",
        border: `1px solid ${C.line}`,
        boxShadow: SHADOW_WINDOW,
        ...materialize(vis),
      }}
    >
      {LAYOUT.filter((k) => fnRow || k.row > 0).map((k) => {
        const down = Math.max(0, ...presses.filter((p) => p.id === k.id).map((p) => pressDepth(frame, fps, p.at, p.hold)));
        let lit = 0;
        for (const hl of lights) {
          if (!hl.ids.includes(k.id)) continue;
          const on = prog(frame, hl.at, 6, easeInOut) * (1 - (hl.until !== undefined ? prog(frame, hl.until, 6, easeInOut) : 0));
          lit = Math.max(lit, on);
        }
        lit = Math.max(lit, down);
        const kh = (k.row === 0 ? fnH : u) * (k.h ?? 1) - (k.h ? gap * 0.25 : 0);
        const ky = pad + rowTop(k.row) + (k.y ? u * k.y + gap * 0.25 : 0);
        const fg = interpolateColors(lit, [0, 1], [C.ink, C.white]);
        const isLetter = k.label.length === 1;
        const showSymbol = k.symbol && (legend === "symbol" || !k.label);
        return (
          <div
            key={k.id}
            style={{
              position: "absolute",
              left: pad + k.x * pitch,
              top: ky,
              width: k.w * pitch - gap,
              height: kh,
              borderRadius: u * 0.16,
              background: interpolateColors(lit, [0, 1], [C.white, color]),
              boxShadow: `0 ${(1 - down) * 2.5}px 0 rgba(0,0,0,${0.16 - lit * 0.04}), 0 ${(1 - down) * 3 + 1}px ${4 - down * 2}px rgba(0,0,0,0.08)`,
              translate: `0px ${down * 2.5}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: sans,
              fontWeight: isLetter ? 500 : 600,
              fontSize: isLetter ? letter : word,
              letterSpacing: isLetter ? 0 : "-0.02em",
              color: fg,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {showSymbol ? <Glyph ch={k.symbol!} size={k.h ? u * 0.5 : u * 0.46} color={fg} weight={2.2} /> : k.label}
          </div>
        );
      })}
    </div>
  );
};
