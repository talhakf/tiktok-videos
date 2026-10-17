import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BAND, TX, TY, TW } from "../layout";
import { C, mono, prog, sans, TERM, UNIT } from "../theme";
import { Bubble, Sticker } from "./Doodles";
import { Terminal, type Line } from "./Terminal";

/** Blue bookmark + "Save this", the header of every outro. */
export const SaveHeader: React.FC<{ at: number; x?: number; y?: number; label?: string }> = ({ at, x = TX, y = 200, label = "Save this" }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = prog(frame, at, UNIT * 2);
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 22, opacity: p, translate: `0px ${(1 - p) * 18}px` }}>
      <svg width={60} height={80} viewBox="0 0 60 80">
        <path d="M6 4 H54 V76 L30 58 L6 76 Z" fill={C.accent} />
      </svg>
      <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 96, letterSpacing: "-0.02em", color: C.ink }}>{label}</span>
    </div>
  );
};

/** Cheat-sheet rows: command in green, description in plain text. `cheatLines([["rm -rI", "asks first"]])` */
export const cheatLines = (rows: [string, string][], pad = 12): Line[] =>
  rows.map(([c, d]) => [{ t: c.padEnd(pad), c: TERM.green, b: true }, { t: d }]);

/**
 * The outro every video ends its script with: "Save this" + a cheat-sheet terminal, a waving raccoon and the
 * comment question in a blue bubble. `EndCard` takes over at `last("follow")`.
 */
export const SaveOutro: React.FC<{
  at: number;
  lines: Line[]; // e.g. cheatLines([...]) or a one-line install
  question: string; // "\n" for line breaks
  questionAt?: number;
  title?: string;
  sub?: string; // grey mono line under the card
  h?: number;
  fontSize?: number;
  raccoon?: string;
}> = ({ at, lines, question, questionAt, title = "cheat sheet", sub, h = 400, fontSize = 32, raccoon = "raccoon/waving-laugh.png" }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = prog(frame, at, UNIT * 2);
  return (
    <AbsoluteFill>
      <SaveHeader at={at} />
      <div style={{ opacity: p }}>
        <Terminal x={TX} y={TY} w={TW} h={h} title={title} fontSize={fontSize} blocks={[{ at, out: lines }]} />
      </div>
      {sub ? (
        <div style={{ position: "absolute", left: TX, top: TY + h + 30, fontFamily: mono, fontSize: 28, color: C.mute, opacity: p }}>{sub}</div>
      ) : null}
      <Sticker src={raccoon} at={at + 6} x={TX + 10} y={BAND - 200} w={340} fadeBottom={70} />
      <Bubble at={questionAt ?? at + 20} x={TX + 380} y={BAND - 235}>
        {question}
      </Bubble>
    </AbsoluteFill>
  );
};
