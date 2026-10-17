import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { C, easeInOut, materialize, mono, prog, sans } from "../../theme";
import { BLUE_TINT, CARD_SHADOW, presence, RED } from "./Node";

// A function box that turns an input into an output, top to bottom: the input chip drops into the box, the
// box works (blue), the output prints below with its characters scrambling into place (a hash, an encoded
// string, a compiled file). `oneWayAt` adds the "can't go back" arrow with a red cross (hashes).

/** Deterministic scramble character for position `i` at time step `step`. */
const scrambleChar = (i: number, step: number, set: string) => {
  const n = Math.abs(Math.sin(i * 12.9898 + step * 78.233) * 43758.5453);
  return set[Math.floor((n - Math.floor(n)) * set.length)];
};

/** Text that scrambles from `at` and settles left to right over `dur` frames. */
export const scrambleText = (frame: number, text: string, at: number, dur = 16, set = "0123456789abcdef") => {
  if (frame < at) return "";
  const settled = Math.floor(((frame - at) / dur) * text.length);
  return text
    .split("")
    .map((ch, i) => (i < settled || ch === " " ? ch : scrambleChar(i, Math.floor(frame / 2), set)))
    .join("");
};

const Chip: React.FC<{ text: string; size: number; style?: React.CSSProperties; mono?: boolean }> = ({ text, size, style, mono: isMono = true }) => (
  <div
    style={{
      padding: `${size * 0.4}px ${size * 0.7}px`,
      background: C.white,
      borderRadius: size * 0.55,
      boxShadow: CARD_SHADOW,
      border: `1px solid ${C.line}`,
      fontFamily: isMono ? mono : sans,
      fontWeight: isMono ? 500 : 700,
      fontSize: size,
      color: C.ink,
      whiteSpace: "pre",
      ...style,
    }}
  >
    {text}
  </div>
);

/**
 * Input → function → output, centred in a column at (x, y), `w` wide. `inAt` drops the input in,
 * `outAt` prints the output (default: inAt + 14). `outputLabel` / `inputLabel` are grey captions.
 */
export const Machine: React.FC<{
  x: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  input: string;
  output: string;
  label: string; // the function: "sha256", "base64", "gzip"
  icon?: IconName;
  inAt?: number;
  outAt?: number;
  inputLabel?: string;
  outputLabel?: string;
  oneWayAt?: number;
  oneWayLabel?: string;
  size?: number; // chip text size
  outSize?: number; // output text size (long hashes need ~30)
  scrambleSet?: string;
}> = ({
  x,
  y,
  w = 900,
  at,
  until,
  input,
  output,
  label,
  icon = "chip",
  inAt,
  outAt,
  inputLabel,
  outputLabel,
  oneWayAt,
  oneWayLabel = "can't go back",
  size = 40,
  outSize = 30,
  scrambleSet,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const drop = inAt ?? at + 10;
  const print = outAt ?? drop + 14;
  const cx = w / 2;

  const BOX_Y = 190; // box top, inside the component
  const BOX_H = 170;
  const OUT_Y = BOX_Y + BOX_H + 110;

  const fall = prog(frame, drop, 12, easeInOut); // input glides into the box
  const work = prog(frame, drop + 8, 6) * (1 - prog(frame, print + 10, 8)); // box lights up while working
  const printed = prog(frame, print, 8);
  const arrow1 = prog(frame, at + 4, 10);
  const arrow2 = prog(frame, print - 4, 8);
  const oneWay = oneWayAt !== undefined ? prog(frame, oneWayAt, 10) : 0;

  const down = (y1: number, y2: number, draw: number, color = "#86868B") =>
    draw <= 0.01 ? null : (
    <svg style={{ position: "absolute", left: cx - 20, top: y1, overflow: "visible" }} width={40} height={y2 - y1}>
      <path d={`M20 0 V${(y2 - y1) * draw}`} stroke={color} strokeWidth={4} strokeLinecap="round" fill="none" />
      {draw > 0.95 ? <path d={`M8 ${y2 - y1 - 14} L20 ${y2 - y1} L32 ${y2 - y1 - 14}`} stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
    </svg>
  );

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: OUT_Y + 160, ...materialize(p) }}>
      {inputLabel ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: w, textAlign: "center", fontFamily: sans, fontWeight: 600, fontSize: 26, color: C.mute }}>{inputLabel}</div>
      ) : null}
      {/* input chip: sits above, then drops into the box and blurs away */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: (inputLabel ? 44 : 20) + fall * (BOX_Y + 30 - (inputLabel ? 44 : 20)),
          width: w,
          display: "flex",
          justifyContent: "center",
          opacity: 1 - prog(frame, drop + 6, 6),
          filter: fall > 0.5 ? `blur(${(fall - 0.5) * 10}px)` : undefined,
          scale: String(1 - fall * 0.15),
          zIndex: 1,
        }}
      >
        <Chip text={input} size={size} />
      </div>

      {down(130, BOX_Y - 14, arrow1)}

      {/* the function box */}
      <div
        style={{
          position: "absolute",
          left: cx - 230,
          top: BOX_Y,
          width: 460,
          height: BOX_H,
          borderRadius: 34,
          background: interpolateColors(work, [0, 1], [C.white, BLUE_TINT]),
          border: `3px solid ${interpolateColors(work, [0, 1], ["rgba(0,0,0,0.10)", C.accent])}`,
          boxShadow: CARD_SHADOW,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          zIndex: 2,
        }}
      >
        <Icon name={icon} size={64} color={interpolateColors(work, [0, 1], [C.ink, C.accent])} weight={2} draw={prog(frame, at + 2, 14)} />
        <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 52, color: C.ink, letterSpacing: "-0.02em" }}>{label}</span>
      </div>

      {down(BOX_Y + BOX_H + 14, OUT_Y - 14, arrow2)}

      {/* one-way: an upward arrow beside the flow, crossed out */}
      {oneWay > 0 ? (
        <div style={{ position: "absolute", left: cx + 260, top: BOX_Y + 20, opacity: oneWay, filter: oneWay < 1 ? `blur(${(1 - oneWay) * 6}px)` : undefined }}>
          <svg width={60} height={140} viewBox="0 0 60 140" style={{ overflow: "visible" }}>
            <path d="M30 130 V12 M16 28 L30 12 L44 28" stroke="#86868B" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="10 10" />
            <path d={`M10 50 L50 90`} stroke={RED} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - prog(frame, oneWayAt! + 6, 8)} />
            <path d={`M50 50 L10 90`} stroke={RED} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - prog(frame, oneWayAt! + 10, 8)} />
          </svg>
          <div style={{ position: "absolute", left: -70, top: 148, width: 200, textAlign: "center", fontFamily: sans, fontWeight: 600, fontSize: 28, color: RED, whiteSpace: "nowrap" }}>{oneWayLabel}</div>
        </div>
      ) : null}

      {/* output: prints with scrambling characters */}
      {frame >= print ? (
        <div style={{ position: "absolute", left: 0, top: OUT_Y, width: w, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: printed }}>
          <Chip text={scrambleText(frame, output, print, 18, scrambleSet)} size={outSize} />
          {outputLabel ? <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 26, color: C.mute }}>{outputLabel}</div> : null}
        </div>
      ) : null}
    </div>
  );
};
