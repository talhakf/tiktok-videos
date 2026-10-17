import { appleSpring, C, easeInOut, prog, sans } from "../../theme";

// Shared pieces of the app UI mockups (src/components/ui/): cue helpers (glide between indices, typing,
// button presses) and the macOS modifier glyphs drawn as SVG (⌘ ⇧ ⌥ ⌃ ⇪ ↩ ⌫ ⇥), so shortcuts render the
// same on every computer whatever fonts it has.

export type IndexCue = { index: number; at: number };

/**
 * Fractional index at `frame`: starts at `initial`, glides (easeInOut, `dur` frames) to each cue's index.
 * A cue that arrives mid-glide starts from wherever the last glide was. Used by highlights and pills.
 */
export const glide = (frame: number, initial: number, cues: IndexCue[] = [], dur = 10) => {
  let v = initial;
  for (const c of [...cues].sort((a, b) => a.at - b.at)) {
    if (frame < c.at) break;
    const t = prog(frame, c.at, dur, easeInOut);
    v = v + (c.index - v) * t;
    if (t < 1) break;
  }
  return v;
};

/** Characters of a `len`-long string typed by `frame` (one every `fpc` frames from `typeAt`). */
export const typedCount = (frame: number, len: number, typeAt: number | undefined, fpc = 3) =>
  typeAt === undefined ? len : frame < typeAt ? 0 : Math.min(len, Math.floor((frame - typeAt) / fpc) + 1);

/** Frame at which typing of a `len`-long string finishes. */
export const typedEnd = (len: number, typeAt: number, fpc = 3) => typeAt + Math.max(0, len - 1) * fpc;

/**
 * Press depth 0→1→0: fast down (4 frames, ease-out), held `hold` frames, then a critically damped spring
 * back up (asymmetric, like KeyCap). 0 when `at` is undefined or not reached.
 */
export const pressDepth = (frame: number, fps: number, at: number | undefined, hold = 0) => {
  if (at === undefined || frame < at) return 0;
  if (frame < at + 4 + hold) return prog(frame, at, 4);
  return 1 - appleSpring(frame - at - 4 - hold, fps, { response: 0.3 });
};

/** How much a row at `rowIndex` sits under a highlight at fractional index `h` (1 = fully, 0 = a row away). */
export const under = (h: number, rowIndex: number) => Math.max(0, 1 - Math.abs(h - rowIndex));

// ---------------- modifier glyphs ----------------

const GLYPHS: Record<string, { d: string[]; fill?: boolean }> = {
  "⌘": { d: ["M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"] },
  "⇧": { d: ["M9 19v-6H5l7-8 7 8h-4v6z"] },
  "⌥": { d: ["M3 5h6l6 14h6", "M14 5h7"] },
  "⌃": { d: ["M5 14l7-7 7 7"] },
  "⇪": { d: ["M9 15v-3H5l7-8 7 8h-4v3z", "M9 20h6"] },
  "↩": { d: ["M20 5v7a3 3 0 0 1-3 3H5", "M9 11l-4 4 4 4"] },
  "⌫": { d: ["M9 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-7-7z", "M12 9l6 6", "M18 9l-6 6"] },
  "⇥": { d: ["M3 12h14", "M11 6l6 6-6 6", "M21 5v14"] },
  "←": { d: ["M16 6l-8 6 8 6z"], fill: true },
  "→": { d: ["M8 6l8 6-8 6z"], fill: true },
  "↑": { d: ["M6 16l6-8 6 8z"], fill: true },
  "↓": { d: ["M6 8l6 8 6-8z"], fill: true },
};

/** True for the characters `Glyph` draws (⌘ ⇧ ⌥ ⌃ ⇪ ↩ ⌫ ⇥ ← → ↑ ↓). */
export const isGlyph = (ch: string) => ch in GLYPHS;

/** One macOS modifier symbol as an SVG (24 grid), `size` px, in `color`. */
export const Glyph: React.FC<{ ch: string; size?: number; color?: string; weight?: number }> = ({ ch, size = 28, color = C.ink, weight = 2 }) => {
  const g = GLYPHS[ch];
  if (!g) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {g.d.map((d) => (
        <path
          key={d}
          d={d}
          fill={g.fill ? color : "none"}
          stroke={color}
          strokeWidth={g.fill ? 1 : weight}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};

/**
 * A shortcut like "⌘⇧4" or "⌘C": glyph characters become SVG glyphs, the rest is text (sans, `size` px).
 * Letters are shown as written, so write them lowercase ("⌘c") to keep the no-uppercase rule.
 */
export const Shortcut: React.FC<{ keys: string; size?: number; color?: string; gap?: number }> = ({ keys, size = 26, color = C.mute, gap = 3 }) => (
  <div style={{ display: "flex", alignItems: "center", gap, fontFamily: sans, fontWeight: 500, fontSize: size, color, lineHeight: 1 }}>
    {[...keys].map((ch, i) =>
      isGlyph(ch) ? <Glyph key={i} ch={ch} size={size * 0.92} color={color} weight={2.2} /> : <span key={i}>{ch}</span>,
    )}
  </div>
);
