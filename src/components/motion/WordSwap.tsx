import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { C, easeInOut, fontsReady, prog } from "../../theme";

// One word inside a sentence that changes on cue: "it's fast → simple → free". The old word rolls up and blurs out,
// the new one rolls up from below through the same blur, and the slot's width glides (ease-in-out) from one word to
// the next, so the rest of the line slides along instead of jumping. It inherits the surrounding type.
// Widths are measured once from hidden copies of every word (after the fonts are ready), not estimated.

export type WordKey = { at: number; t: string };

/**
 * Inline word cycling through `words: {at, t}[]` (the first shows from its `at`; `at` <= 0 = from frame 1).
 * `dur` = roll frames, `color` = word colour (system blue by default; the sentence's colour with `color="inherit"`),
 * `align` = where the word sits in its slot while the width glides, `until` = the word fades out.
 */
export const WordSwap: React.FC<{
  words: WordKey[];
  dur?: number;
  color?: string;
  align?: "left" | "center";
  until?: number;
  style?: React.CSSProperties;
}> = ({ words, dur = 12, color = C.accent, align = "left", until, style }) => {
  const frame = useCurrentFrame();
  const list = [...words].sort((a, b) => a.at - b.at);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [widths, setWidths] = useState<number[] | null>(null);
  const [handle] = useState(() => delayRender("WordSwap: measuring words"));
  const key = list.map((w) => w.t).join("\u0000");

  const released = useRef(false);
  const release = useCallback(() => {
    if (!released.current) {
      released.current = true;
      continueRender(handle);
    }
  }, [handle]);

  // Wait until the fonts are in (a fallback font measures narrower), then measure.
  useLayoutEffect(() => {
    let live = true;
    const done = () => {
      if (live) setWidths(refs.current.slice(0, key.split("\u0000").length).map((r) => r?.offsetWidth ?? 0));
    };
    if (typeof document !== "undefined" && document.fonts) {
      fontsReady()
        .then(() => document.fonts.ready)
        .then(done, done);
    } else done();
    return () => {
      live = false;
    };
  }, [key]);

  // Release the render only once the measured widths are on screen; re-check every frame (cheap) in case
  // the surrounding type changed after the first measure.
  useLayoutEffect(() => {
    if (!widths) return;
    const now = widths.map((_, i) => refs.current[i]?.offsetWidth ?? 0);
    if (now.some((v, i) => Math.abs(v - widths[i]) > 0.5)) setWidths(now);
    else release();
  }, [frame, widths, release]);

  // Never leave a render waiting on a word that unmounted before it measured.
  useLayoutEffect(() => () => release(), [release]);

  // Width glides from word to word; before measuring, a rough 0.56 em per character.
  const est = (i: number) => (widths ? widths[i] : Array.from(list[i].t).length * 0.56);
  const unit = widths ? "px" : "em";
  let width = 0;
  let cur = -1;
  list.forEach((wd, i) => {
    if (frame < wd.at) return;
    width = width + (est(i) - width) * (wd.at <= 0 ? 1 : prog(frame, wd.at, Math.round(dur * 0.8), easeInOut));
    cur = i;
  });
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  // While a swap runs, clip the slot's open sides so a wider word never draws over the text next to it.
  const moving = list.some((wd) => wd.at > 0 && frame >= wd.at && frame < wd.at + dur + 2);
  const clip = moving ? (align === "left" ? "inset(-0.6em 0 -0.6em -0.3em)" : "inset(-0.6em 0 -0.6em 0)") : undefined;

  const layer = (i: number) => {
    const wd = list[i];
    if (frame < wd.at) return null;
    const p = wd.at <= 0 || i === 0 ? (wd.at <= 0 ? 1 : prog(frame, wd.at, dur)) : prog(frame, wd.at + 2, dur);
    const next = list[i + 1];
    const q = next && frame >= next.at ? prog(frame, next.at, Math.round(dur * 0.75)) : 0;
    if (q >= 1) return null;
    const blur = (1 - p) * 8 + q * 8;
    return (
      <span
        key={i}
        style={{
          position: "absolute",
          top: 0,
          left: align === "left" ? 0 : "50%",
          translate: `${align === "left" ? "0" : "-50%"} ${(1 - p) * 0.55 - q * 0.55}em`,
          opacity: p * (1 - q) * (1 - out),
          filter: blur > 0.01 || out > 0 ? `blur(${blur + out * 6}px)` : undefined,
          whiteSpace: "pre",
        }}
      >
        {wd.t}
      </span>
    );
  };

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: `${width}${unit}`,
        whiteSpace: "pre",
        color,
        clipPath: clip,
        ...style,
      }}
    >
      {/* Baseline + line height for the slot, never visible. */}
      <span style={{ visibility: "hidden" }}>{cur >= 0 ? list[cur].t : "​"}</span>
      {list.map((_, i) => layer(i))}
      {/* Measuring copies: same type as the visible words. */}
      {list.map((wd, i) => (
        <span
          key={`m${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          style={{ position: "absolute", left: 0, top: 0, visibility: "hidden", whiteSpace: "pre" }}
        >
          {wd.t}
        </span>
      ))}
    </span>
  );
};
