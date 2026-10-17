import { useCurrentFrame } from "remotion";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";

// One word, taken apart. At `splitAt` its chunks glide apart and each meaning appears under its chunk
// (grep = g / re / p). `zoom` raises a round loupe above one glyph to expose a look-alike (the "1" in paypa1),
// with a blue focus ring on the original letter.

export type Chunk = { t: string; meaning?: string };

/**
 * Word made of `chunks`, centered in a `w`-wide box at x / y (y = top of the word). It materializes at `at`,
 * splits at `splitAt` (optional) and shows meanings below. `zoom.index` is a glyph index in the whole word;
 * the loupe sits above the word, so leave about 2 × size of room over it.
 */
export const LetterSplit: React.FC<{
  chunks: Chunk[];
  at: number;
  x: number;
  y: number;
  w?: number;
  splitAt?: number;
  zoom?: { index: number; at: number; until?: number; label?: string; color?: string };
  size?: number;
  gap?: number;
  font?: "sans" | "mono";
  color?: string;
  meaningW?: number;
  until?: number;
}> = ({ chunks, at, x, y, w = 900, splitAt, zoom, size = 160, gap = 72, font = "sans", color = C.ink, meaningW = 260, until }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const inP = prog(frame, at, 10);
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;

  const split = splitAt !== undefined ? prog(frame, splitAt, 14, easeInOut) : 0;
  const z = zoom && frame >= zoom.at ? prog(frame, zoom.at, 11) * (zoom.until !== undefined ? 1 - prog(frame, zoom.until, 8) : 1) : 0;
  const ring = zoom ? prog(frame, zoom.at - 4, 8) * (zoom.until !== undefined ? 1 - prog(frame, zoom.until, 8) : 1) : 0;
  const lens = size * 1.6;
  const total = chunks.reduce((n, c) => n + [...c.t].length, 0);
  const labelLeft = zoom !== undefined && zoom.index >= total / 2; // label on the side with more room

  let gi = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        display: "flex",
        justifyContent: "center",
        gap: split * gap,
        fontFamily: font === "mono" ? mono : sans,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: font === "mono" ? 0 : "-0.03em",
        color,
        whiteSpace: "pre",
        ...materialize(inP * (1 - out)),
      }}
    >
      {chunks.map((c, ci) => {
        const mp = splitAt !== undefined ? prog(frame, splitAt + 8 + ci * 3, 10) : 0;
        return (
          <span key={ci} style={{ position: "relative", display: "inline-block" }}>
            {[...c.t].map((ch, li) => {
              const idx = gi++;
              const zoomed = zoom !== undefined && idx === zoom.index;
              return (
                <span key={li} style={{ position: "relative", display: "inline-block", color: zoomed && z > 0 && zoom.color ? zoom.color : undefined }}>
                  {ch}
                  {zoomed && ring > 0 ? (
                    <span
                      style={{
                        position: "absolute",
                        left: "-0.1em",
                        right: "-0.1em",
                        top: "0.04em",
                        bottom: "0.04em",
                        borderRadius: "0.12em",
                        border: `${Math.max(3, size * 0.025)}px solid ${C.accent}`,
                        opacity: ring,
                        scale: String(1.08 - 0.08 * ring),
                      }}
                    />
                  ) : null}
                  {zoomed && z > 0 ? (
                    <span
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: `calc(100% + ${size * 0.22}px)`,
                        width: lens,
                        height: lens,
                        marginLeft: -lens / 2,
                        borderRadius: "50%",
                        background: C.white,
                        border: `${Math.max(3, size * 0.025)}px solid ${C.accent}`,
                        boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: size * 1.25,
                        letterSpacing: 0,
                        transformOrigin: "50% 100%",
                        ...materialize(z, 0.9, 10),
                      }}
                    >
                      {ch}
                      {zoom.label ? (
                        <span
                          style={{
                            position: "absolute",
                            ...(labelLeft ? { right: `calc(100% + ${size * 0.16}px)` } : { left: `calc(100% + ${size * 0.16}px)` }),
                            top: "50%",
                            translate: "0px -50%",
                            fontFamily: sans,
                            fontSize: size * 0.22,
                            fontWeight: 600,
                            letterSpacing: "-0.01em",
                            color: C.mute,
                          }}
                        >
                          {zoom.label}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </span>
              );
            })}
            {c.meaning && mp > 0 ? (
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: size * 1.12,
                  width: meaningW,
                  marginLeft: -meaningW / 2,
                  textAlign: "center",
                  whiteSpace: "normal",
                  fontFamily: sans,
                  fontSize: size * 0.22,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  color: C.mute,
                  transformOrigin: "50% 0%",
                  ...materialize(mp, 0.95, 6),
                }}
              >
                {c.meaning}
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
};
