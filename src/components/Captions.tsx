import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, materialize, prog, sans } from "../theme";

// Word-timed captions: short pages that materialize in; the spoken word turns system blue.
export const Captions: React.FC<{ captions: Caption[]; top: number }> = ({ captions, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const pages = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 700 }).pages,
    [captions],
  );

  const page = pages.find((p, i) => {
    const next = pages[i + 1];
    return ms >= p.startMs && (next ? ms < next.startMs : ms < p.startMs + p.durationMs + 400);
  });
  if (!page) return null;

  const p = prog(frame, Math.round((page.startMs / 1000) * fps), 7);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 110,
        right: 110,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        columnGap: 20,
        rowGap: 4,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: 80,
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        color: C.ink,
        ...materialize(p, 0.97, 6),
        translate: `0px ${(1 - p) * 10}px`,
      }}
    >
      {page.tokens.map((t, i) => {
        const active = ms >= t.fromMs && ms < t.toMs + 60;
        const said = ms >= t.fromMs;
        return (
          // index key: two words can share a start time, and duplicate keys leave stale words on screen
          <span key={i} style={{ color: active ? C.accent : C.ink, opacity: said ? 1 : 0.3 }}>
            {t.text.trim()}
          </span>
        );
      })}
    </div>
  );
};
