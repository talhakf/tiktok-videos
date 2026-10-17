import { interpolateColors, useCurrentFrame } from "remotion";
import { presence } from "../diagram/Node";
import { easeInOut, mono, prog, TERM } from "../../theme";
import { DevCard, TAB_H, toneColors } from "./card";
import { CodeLang, DARK_SYNTAX, LIGHT_SYNTAX, tokenizeLine } from "./syntax";

// A unified diff on a code card, the way `git diff` and pull requests show it: removed lines tinted red
// with "-", added lines green with "+", context grey, hunk headers ("@@ -12,7 +12,8 @@") in a grey strip,
// old and new line numbers in the gutter. Lines enter staggered. With `applyAt` it plays the change:
// the card first shows the old file, then removed lines are struck through and collapse while the added
// lines grow in; `settleAt` then drops the tints so the new file is left.

const LH = 1.55;
const PAD = 18;

type Kind = "hunk" | "file" | "add" | "del" | "ctx";
type Parsed = { kind: Kind; text: string; old?: number; new?: number };

/** Parses unified-diff lines (each starting with "+", "-", " ", "@@", "---" or "+++") and numbers them. */
export const parseDiff = (lines: string[]): Parsed[] => {
  let o = 1;
  let n = 1;
  return lines.map((raw) => {
    if (raw.startsWith("@@")) {
      const m = raw.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (m) {
        o = Number(m[1]);
        n = Number(m[2]);
      }
      return { kind: "hunk", text: raw };
    }
    if (raw.startsWith("---") || raw.startsWith("+++")) return { kind: "file", text: raw };
    if (raw.startsWith("-")) return { kind: "del", text: raw.slice(1), old: o++ };
    if (raw.startsWith("+")) return { kind: "add", text: raw.slice(1), new: n++ };
    return { kind: "ctx", text: raw.startsWith(" ") ? raw.slice(1) : raw, old: o++, new: n++ };
  });
};

/**
 * Diff card at (x, y), `w` wide. `lines` are unified-diff lines; `lang` colours the code. Rows enter
 * `stagger` frames apart from `at`. `numbers` shows the old / new line-number columns.
 * `applyAt`: before→after mode (old file first, then strike + collapse the "-" lines, grow the "+" lines;
 * the card height follows). `settleAt` (after `applyAt`) fades the tints and markers away.
 */
export const DiffView: React.FC<{
  lines: string[];
  lang?: CodeLang;
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  dark?: boolean;
  filename?: string;
  right?: string;
  size?: number;
  stagger?: number;
  numbers?: boolean;
  applyAt?: number;
  settleAt?: number;
  style?: React.CSSProperties;
}> = ({ lines, lang = "text", x, y, w = 900, at, until, dark, filename, right, size = 26, stagger = 2, numbers = true, applyAt, settleAt, style }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const rows = parseDiff(lines);
  const pal = dark ? DARK_SYNTAX : LIGHT_SYNTAX;
  const lh = size * LH;
  const ch = size * 0.6;
  const maxNo = Math.max(1, ...rows.map((r) => Math.max(r.old ?? 0, r.new ?? 0)));
  const noW = String(maxNo).length * ch + 22;
  const markX = numbers ? noW * 2 + 8 : 22;
  const codeX = markX + ch * 2;
  const bad = toneColors("bad", dark);
  const good = toneColors("good", dark);
  const muted = dark ? TERM.dim : "#AEAEB2";

  const strike = applyAt !== undefined ? prog(frame, applyAt, 8) : 0;
  const morph = applyAt !== undefined ? prog(frame, applyAt + 8, 12, easeInOut) : 0;
  const settle = settleAt !== undefined ? prog(frame, settleAt, 10) : 0;

  // Row heights (0..1) now; rows hidden in "before" mode don't take a stagger slot.
  let slot = 0;
  const shown = rows.map((r) => {
    const hidden = applyAt !== undefined && r.kind === "add";
    const enter = hidden ? 1 : prog(frame, at + 6 + slot++ * stagger, 7);
    let hf = 1;
    if (applyAt !== undefined && r.kind === "del") hf = 1 - morph;
    if (applyAt !== undefined && r.kind === "add") hf = morph;
    return { enter, hf };
  });
  const bodyH = shown.reduce((a, s) => a + s.hf * lh, 0);
  const cardH = (filename !== undefined ? TAB_H : 0) + PAD * 2 + bodyH;

  let top = PAD;
  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} dark={dark} filename={filename} right={right} style={style}>
      {rows.map((r, i) => {
        const { enter, hf } = shown[i];
        const rowTop = top;
        top += hf * lh;
        if (hf <= 0.001) return null;
        const isDel = r.kind === "del";
        const isAdd = r.kind === "add";
        const tone = isDel ? bad : isAdd ? good : null;
        const tintO = (1 - settle) * (isAdd && applyAt !== undefined ? morph : 1);
        const meta = r.kind === "hunk" || r.kind === "file";
        const textColor = meta ? muted : undefined;
        const tokens = meta ? [{ t: r.text, k: "plain" as const }] : tokenizeLine(r.text, lang);
        const opacity = enter * (isAdd && applyAt !== undefined ? morph : 1) * (isDel && applyAt !== undefined ? 1 - morph * 0.6 : 1);
        const textW = r.text.length * ch;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: rowTop,
              height: hf * lh,
              overflow: "hidden",
              background: meta ? (dark ? TERM.bar : "#F2F2F4") : tone ? interpolateColors(tintO, [0, 1], ["rgba(0,0,0,0)", tone.bg]) : undefined,
              opacity,
              translate: `${(1 - enter) * 16}px 0px`,
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, height: lh, width: "100%", fontFamily: mono, fontWeight: 500, fontSize: size, lineHeight: `${lh}px`, whiteSpace: "pre" }}>
              {numbers && !meta ? (
                <>
                  <div style={{ position: "absolute", left: 0, width: noW, textAlign: "right", color: muted, fontVariantNumeric: "tabular-nums" }}>{r.old ?? ""}</div>
                  <div style={{ position: "absolute", left: noW, width: noW, textAlign: "right", color: muted, fontVariantNumeric: "tabular-nums" }}>{r.new ?? ""}</div>
                </>
              ) : null}
              {tone ? (
                <div style={{ position: "absolute", left: markX, color: tone.fg, fontWeight: 700, opacity: 1 - settle }}>{isDel ? "-" : "+"}</div>
              ) : null}
              <div style={{ position: "absolute", left: meta ? 22 : codeX, color: textColor }}>
                {tokens.map((tk, k) => (
                  <span key={k} style={{ color: textColor ?? pal[tk.k] }}>
                    {tk.t}
                  </span>
                ))}
              </div>
              {isDel && strike > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    left: codeX - 4,
                    top: lh / 2 - 1.5,
                    width: (textW + 8) * strike,
                    height: 3,
                    borderRadius: 2,
                    background: dark ? TERM.red : "#C9281E",
                  }}
                />
              ) : null}
            </div>
          </div>
        );
      })}
    </DevCard>
  );
};
