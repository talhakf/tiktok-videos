import { interpolateColors, useCurrentFrame } from "remotion";
import { TW, TX, TY } from "../../layout";
import { C, GLASS, materialize, prog, sans } from "../../theme";
import { Mark, outP, RED } from "./Mark";

// Quiz answers: 2–4 frosted-glass pills with a lowercase letter chip. `pick` rings the viewer's / raccoon's
// choice; `reveal` turns the right answer blue with a check, dims the rest and crosses a wrong pick in red.

/** Quiz answer pills (a, b, c, d) with an optional `pick` ring and a `reveal` of the correct one. */
export const OptionPills: React.FC<{
  options: string[];
  at: number;
  until?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number; // pill height
  gap?: number;
  stagger?: number;
  pick?: { index: number; at: number };
  reveal?: { index: number; at: number };
  size?: number; // answer text size
}> = ({ options, at, until, x = TX, y = TY, w = TW, h = 120, gap = 22, stagger = 4, pick, reveal, size = 44 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;
  const pr = reveal ? prog(frame, reveal.at, 10) : 0;
  const pickWrong = pick && reveal && pick.index !== reveal.index;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: 1 - out, translate: `${-out * 40}px 0px` }}>
      {options.map((opt, i) => {
        const oa = at + i * stagger;
        if (frame < oa) return null;
        const p = prog(frame, oa, 9);
        const right = reveal?.index === i ? pr : 0;
        const picked = pick?.index === i;
        const wrong = reveal && reveal.index !== i ? pr : 0;
        const dim = wrong * (picked ? 0.3 : 0.55);
        const pp = picked && pick ? prog(frame, pick.at, 8) : 0;
        const ringCol = picked && pickWrong ? interpolateColors(pr, [0, 1], [C.accent, RED]) : C.accent;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: i * (h + gap),
              width: w,
              height: h,
              ...materialize(p, 0.96, 8),
              opacity: p * (1 - dim),
              translate: `0px ${(1 - p) * 20}px`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                ...GLASS,
                borderRadius: h / 2,
                background: interpolateColors(right, [0, 1], ["rgba(255,255,255,0.62)", C.accent]),
                display: "flex",
                alignItems: "center",
                gap: 28,
                padding: `0 ${h * 0.2}px`,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: h * 0.62,
                  height: h * 0.62,
                  borderRadius: h,
                  flexShrink: 0,
                  background: interpolateColors(right, [0, 1], [C.soft, C.white]),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: h * 0.32,
                  color: interpolateColors(right, [0, 1], [C.ink, C.accent]),
                  paddingBottom: h * 0.03,
                  boxSizing: "border-box",
                }}
              >
                {String.fromCharCode(97 + i)}
              </div>
              <div
                style={{
                  flex: 1,
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: size,
                  letterSpacing: "-0.02em",
                  color: interpolateColors(right, [0, 1], [C.ink, C.white]),
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {opt}
              </div>
              {reveal && reveal.index === i && frame >= reveal.at ? (
                <Mark kind="check" size={h * 0.5} color={C.white} glyph={C.accent} draw={prog(frame, reveal.at + 3, 10)} style={{ ...materialize(pr, 0.8, 0) }} />
              ) : null}
              {picked && pickWrong && reveal && frame >= reveal.at ? (
                <Mark kind="cross" size={h * 0.5} color={RED} draw={prog(frame, reveal.at + 3, 10)} style={{ ...materialize(pr, 0.8, 0) }} />
              ) : null}
            </div>
            {picked && pick && frame >= pick.at ? (
              <div
                style={{
                  position: "absolute",
                  inset: -9,
                  borderRadius: h / 2 + 9,
                  border: `4px solid ${ringCol}`,
                  opacity: pp,
                  scale: String(1.04 - 0.04 * pp),
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
