import { useCurrentFrame } from "remotion";
import { PANE_1, PANE_2, PANE_H, TW, TX } from "../../layout";
import { materialize, prog } from "../../theme";
import { Block, Prompt, Terminal, termRing } from "../Terminal";

// Two terminals stacked: the "3:07 am" habit on top, the better way ("instead") below it.
// The top pane enters from the right; when the bottom one arrives the top steps back (dims to ~55%).

export const PANE_FS = 26; // 54 columns at TW: long error lines fit; 6 rows per pane

/** Focus-ring box (for `Circle`) inside pane 1 (top) or 2 (bottom) at the pane font. A command starts at column PROMPT_COLS. */
export const paneRing = (pane: 1 | 2, line: number, col: number, cols: number, rows = 1) =>
  termRing(TX, pane === 1 ? PANE_1 : PANE_2, PANE_FS, line, col, cols, rows);

/** A terminal pane that enters from the right, steps back (dims) at `dimAt` and leaves to the left at `until`. */
export const Pane: React.FC<{
  at: number;
  until?: number;
  dimAt?: number;
  pane?: 1 | 2;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  title?: string;
  blocks?: Block[];
  children?: React.ReactNode;
  prompt?: Prompt;
  fontSize?: number;
}> = ({ at, until, dimAt, pane = 1, x = TX, y, w = TW, h = PANE_H, title = "sudo@laptop: ~", blocks, children, prompt, fontSize = PANE_FS }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = prog(frame, at, 12);
  const out = until !== undefined ? prog(frame, until, 9) : 0;
  if (out >= 1) return null;
  const d = dimAt !== undefined ? prog(frame, dimAt, 10) : 0;
  return (
    <Terminal
      x={x}
      y={y ?? (pane === 1 ? PANE_1 : PANE_2)}
      w={w}
      h={h}
      title={title}
      fontSize={fontSize}
      blocks={blocks}
      prompt={prompt}
      style={{
        ...materialize(p * (1 - out), 0.98, 8),
        opacity: p * (1 - out) * (1 - 0.45 * d),
        translate: `${(1 - p) * 60 - out * 60}px 0px`,
      }}
    >
      {children}
    </Terminal>
  );
};

export type PaneContent = { title?: string; blocks?: Block[]; children?: React.ReactNode; prompt?: Prompt };

/**
 * "3:07 am" vs "instead": the top pane enters at `at`, the bottom one at `insteadAt`, and the top dims at `dimAt`
 * (default: when the bottom arrives). Ring lines with `paneRing(1 | 2, line, col, cols)`.
 */
export const StackedPanes: React.FC<{
  at: number;
  insteadAt: number;
  dimAt?: number;
  until?: number;
  top: PaneContent;
  bottom: PaneContent;
}> = ({ at, insteadAt, dimAt, until, top, bottom }) => (
  <>
    <Pane pane={1} at={at} until={until} dimAt={dimAt ?? insteadAt} title={top.title ?? "3:07 am"} blocks={top.blocks} prompt={top.prompt}>
      {top.children}
    </Pane>
    <Pane pane={2} at={insteadAt} until={until} title={bottom.title ?? "instead"} blocks={bottom.blocks} prompt={bottom.prompt}>
      {bottom.children}
    </Pane>
  </>
);
