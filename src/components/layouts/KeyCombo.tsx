import { useCurrentFrame } from "remotion";
import { TW, TX } from "../../layout";
import { C, materialize, prog, sans } from "../../theme";
import { KeyCap } from "../Doodles";

// A shortcut as keyboard keys: ctrl + r, cmd + space, esc : q. Keys enter left to right; press them all at
// `press` (or one frame per key). A "" separator = keys side by side (esc : q). An invisible copy of each key sizes the row, so spacing is exact.

/** Row of KeyCap keys with "+" (or `sep`) between them, staggered in, pressed at `press`. */
export const KeyCombo: React.FC<{
  keys: string[];
  at: number;
  y: number;
  x?: number; // left edge; default: centred in the content column
  w?: number;
  press?: number | number[];
  sep?: string | string[];
  stagger?: number;
  until?: number;
}> = ({ keys, at, y, x, w = TW, press, sep = "+", stagger = 4, until }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until !== undefined ? prog(frame, until, 9) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x ?? TX,
        top: y,
        width: x === undefined ? w : undefined,
        height: 124,
        display: "flex",
        alignItems: "center",
        justifyContent: x === undefined ? "center" : "flex-start",
        gap: 22,
      }}
    >
      {keys.map((k, i) => {
        const ka = at + i * stagger;
        const s = Array.isArray(sep) ? sep[i - 1] ?? "+" : sep;
        const sp = prog(frame, ka - 2, 8);
        const pr = Array.isArray(press) ? press[i] : press;
        return [
          i > 0 && s !== "" ? (
            <div
              key={`s${i}`}
              style={{ fontFamily: sans, fontWeight: 600, fontSize: 48, color: C.mute, ...materialize(sp * (1 - out), 0.9, 4) }}
            >
              {s}
            </div>
          ) : null,
          <div key={`k${i}`} style={{ position: "relative" }}>
            {/* sizer: same box as KeyCap (min 120 + 2×30 padding + border), invisible */}
            <div style={{ visibility: "hidden", minWidth: 120, height: 120, padding: "0 30px", border: "1px solid transparent", fontFamily: sans, fontWeight: 600, fontSize: 50, lineHeight: "120px", whiteSpace: "pre" }}>
              {k}
            </div>
            <KeyCap label={k} at={ka} press={pr} until={until} x={0} y={0} />
          </div>,
        ];
      })}
    </div>
  );
};
