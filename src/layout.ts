// The 1080×1920 grid both posted videos use. Content column 900 wide, 90 from each side.
// Headline at y 210, main stage (terminal / diagram / browser) at TY, a band below it for raccoons,
// notes and keys, captions at 1340. Keep everything between SAFE.top and SAFE.bottom (theme.ts).
export const TX = 90; // left edge of the content column
export const TW = 900; // content column width
export const HEAD_Y = 210; // headline / ToolHeader top
export const TY = 420; // main stage top
export const TH = 620; // main stage height (one big terminal)
export const BAND = 1075; // raccoons / notes / keys live below the stage
export const CAPTIONS_Y = 1340;

// Two stacked panes per beat (before on top, after below): 6 terminal rows at font 26 each.
export const PANE_H = 336;
export const PANE_1 = TY;
export const PANE_2 = TY + PANE_H + 14;
export const PANE_BAND = PANE_2 + PANE_H + 20; // notes / raccoons / keys under two panes
