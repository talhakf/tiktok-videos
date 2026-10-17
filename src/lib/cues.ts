import type { Caption } from "@remotion/captions";

// Find when a word is spoken, so every animation can be anchored to the narration.
const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9'-]/g, "");

export const makeCues = (captions: Caption[], fps: number) => {
  const at = (word: string, nth = 1) => {
    let k = 0;
    for (const c of captions) {
      if (norm(c.text) === word && ++k === nth) return Math.round((c.startMs / 1000) * fps);
    }
    throw new Error(`cue word not found: ${word} #${nth}`);
  };
  const last = (word: string) => {
    const c = captions.findLast((x) => norm(x.text) === word);
    if (!c) throw new Error(`cue word not found: ${word}`);
    return Math.round((c.startMs / 1000) * fps);
  };
  const end = Math.round((captions[captions.length - 1].endMs / 1000) * fps);
  return { at, last, end };
};
