import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Composition, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Cover, CoverStill, CW, CX } from "../../components/Cover";
import { Captions } from "../../components/Captions";
import { Circle, Note, Sticker } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Headline } from "../../components/Headline";
import { PeekOver } from "../../components/PeekOver";
import { cheatLines, SaveOutro } from "../../components/SaveOutro";
import { red, green, Terminal, termRing, type Block } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { CodeBlock } from "../../components/dev/CodeBlock";
import { DiffView } from "../../components/dev/DiffView";
import { GitGraph } from "../../components/diagram/GitGraph";
import { GREEN, RED } from "../../components/layouts/Mark";
import { editorColX, editorLineY, EditorWindow, type CodeLine } from "../../components/windows/EditorWindow";
import { Icon, type IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/merge-conflicts/captions.json";

// Fix a git merge conflict without panicking
// Facts + outputs verified locally on git version 2.55.0 (2026-10-13): SudoRaccoon/Videos/merge-conflicts.md.
// Design + motion rules: SudoRaccoon/Playbook/Design system.md.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

export const MergeConflictsComposition = () => (
  <>
    <Composition id="MergeConflicts" component={MergeConflicts} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="MergeConflictsCover" component={MergeConflictsCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      panicking: at("panicking"),
      weird: at("weird"),
      arrows: at("arrows"),
      // Story: why it happens
      story: at("sudo", 1),
      bandit1: at("bandit", 1),
      snackstxt: at("snackstxt", 1),
      main: at("main"),
      tuna: at("tuna"),
      another: at("another"),
      pizza: at("pizza"),
      when: at("when"),
      mergeCmd: at("git", 2),
      refuses: at("refuses"),
      instead: at("instead"),
      writes: at("writes"),
      // How to read the markers
      read: at("here", 2),
      left: at("left", 1),
      head: at("head"),
      equals1: at("equals", 1),
      yourChange: at("your", 2),
      current: at("current"),
      equals2: at("equals", 2),
      right: at("right"),
      incoming: at("incoming"),
      merging: at("merging"),
      // 3 steps to fix it
      fixing: at("fixing"),
      s1: at("one", 1),
      open: at("open"),
      combine: at("combine"),
      delete: at("delete"),
      noArrows: at("no", 1),
      s2: at("two", 2),
      addCmd: at("git", 4),
      resolved: at("resolved"),
      s3: at("three", 3),
      commitCmd: at("git", 6),
      finish: at("finish"),
      // Escape hatch: git merge --abort
      panicked: at("panicked"),
      abortCmd: at("git", 7),
      abortFlag: at("--abort"),
      back: at("back"),
      // Bonus: merge.conflictstyle zdiff3
      bonus: at("and", 9),
       bonusWord: at("bonus"),
      configCmd: at("git", 9),
      zdiff3: at("zdiff3"),
      middle: at("middle"),
      bars: at("bars"),
      originally: at("originally"),
      // Outro + CTA
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

const IconNote: React.FC<{
  icon: IconName;
  at: number;
  until?: number;
  x?: number;
  y: number;
  size?: number;
  tint?: string;
  children: React.ReactNode;
}> = ({ icon, at, until, x = TX, y, size, tint = C.accent, children }) => {
  const frame = useCurrentFrame();
  return (
    <Note at={at} until={until} x={x} y={y} size={size}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Icon name={icon} size={46} color={tint} weight={2.2} draw={prog(frame, at + 2, 14)} />
        <span>{children}</span>
      </div>
    </Note>
  );
};

// Window height for `rows` terminal text rows (body loses ~148 px to title bar + padding)
const termH = (rows: number, fs: number) => Math.ceil(rows * fs * 1.38 + 150);
// Editor window height for `rows` lines at `fs` (BAR 60 + PAD 22*2 + rows * fs * 1.5)
const editorH = (rows: number, fs: number) => Math.ceil(104 + rows * fs * 1.5);

// Focus ring around editor lines `fromLine`..`toLine` (1-based) and `cols` characters starting at column 1
const editorRing = (ex: number, ey: number, fs: number, fromLine: number, toLine: number, cols: number, totalLines = 7) => {
  const x = editorColX(ex, 1, fs, totalLines) - 12;
  const y = editorLineY(ey, fromLine, fs) - 4;
  const w = cols * fs * 0.6 + 24;
  const h = (toLine - fromLine + 1) * fs * 1.5 + 8;
  return { x, y, w, h };
};

// Standard 7-line conflicted snacks.txt (verified on git 2.55.0)
const CONFLICT_LINES: CodeLine[] = [
  "1. apples",
  [{ t: "<<<<<<< HEAD", c: TERM.blue, b: true }],
  [{ t: "2. tuna", b: true }],
  [{ t: "=======", c: TERM.yellow, b: true }],
  [{ t: "2. pizza", b: true }],
  [{ t: ">>>>>>> bandit", c: TERM.green, b: true }],
  "3. grapes",
];

// 9-line zdiff3 conflicted snacks.txt (verified on git 2.55.0)
const ZDIFF3_LINES: CodeLine[] = [
  "1. apples",
  [{ t: "<<<<<<< HEAD", c: TERM.blue, b: true }],
  [{ t: "2. tuna", b: true }],
  [{ t: "||||||| 993929a", c: TERM.yellow, b: true }],
  [{ t: "2. crackers", c: TERM.dim }],
  [{ t: "=======", c: TERM.yellow, b: true }],
  [{ t: "2. pizza", b: true }],
  [{ t: ">>>>>>> bandit", c: TERM.green, b: true }],
  "3. grapes",
];

// ---------------- Beat 1: Hook (0 – T.story) ----------------
const HOOK_EY = 560;
const HOOK_FS = 28;
const HOOK_EH = editorH(7, HOOK_FS);

const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Git merge conflict?" b="Fix it without panicking." until={T.story} size={82} />
    <EditorWindow
      x={TX}
      y={HOOK_EY}
      w={TW}
      h={HOOK_EH}
      fontSize={HOOK_FS}
      title="snacks.txt"
      at={-100}
      lines={CONFLICT_LINES}
      bands={[
        { from: 2, to: 3, color: C.accent, label: "HEAD (yours)", at: -100 },
        { from: 5, to: 6, color: GREEN, label: "bandit (theirs)", at: -100 },
      ]}
    />
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 560} edgeY={HOOK_EY} w={300} h={230} overhang={34} />
    <Circle at={T.weird} {...editorRing(TX, HOOK_EY, HOOK_FS, 2, 2, "<<<<<<< HEAD".length)} />
    <Circle at={T.arrows} {...editorRing(TX, HOOK_EY, HOOK_FS, 4, 4, "=======".length)} />
    <Circle at={T.arrows + 4} {...editorRing(TX, HOOK_EY, HOOK_FS, 6, 6, ">>>>>>> bandit".length)} />
    <Note at={-100} until={T.weird} x={TX} y={HOOK_EY + HOOK_EH + 36} font="mono" size={32}>
      {"<<<<<<< HEAD · ======= · >>>>>>>"}
    </Note>
    <IconNote icon="question" at={T.weird} y={HOOK_EY + HOOK_EH + 36}>
      {"What do these weird arrows\nactually mean?"}
    </IconNote>
  </>
);

// ---------------- Beat 2a: Why it happens — two branches edit line 2 ----------------
const StoryBranches: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Two branches, same line." b="tuna vs pizza in snacks.txt" at={T.story} bAt={T.tuna - 6} until={T.when} size={74} />
    <GitGraph
      x={TX + 180}
      y={500}
      colGap={340}
      laneGap={125}
      dot={17}
      commits={[
        { id: "993929a", lane: 0, x: 0, label: "993929a · crackers", at: T.story },
        { id: "398faef", lane: 0, x: 1, label: "398faef · 2. tuna", at: T.main, parents: ["993929a"] },
        { id: "f550390", lane: 1, x: 1, label: "f550390 · 2. pizza", at: T.another, parents: ["993929a"] },
      ]}
      branches={[
        { name: "main", commit: "993929a", at: T.story, moveTo: [{ commit: "398faef", at: T.main }] },
        { name: "bandit", commit: "f550390", at: T.another, side: "bottom" },
      ]}
      head={[
        { commit: "993929a", at: T.story },
        { commit: "398faef", at: T.main },
      ]}
    />
    {/* Base snacks.txt before the branches diverge */}
    <CodeBlock
      x={TX}
      y={805}
      w={TW}
      at={T.snackstxt - 6}
      until={T.main - 2}
      filename="snacks.txt"
      right="commit 993929a"
      size={25}
      code={"1. apples\n2. crackers\n3. grapes"}
    />
    {/* Sudo's branch (main) vs Bandit's branch (bandit) editing line 2 */}
    <CodeBlock
      x={TX}
      y={805}
      w={435}
      at={T.main}
      filename="main · Sudo"
      size={25}
      code={"1. apples\n2. tuna\n3. grapes"}
      highlight={[{ lines: 2, at: T.tuna - 4, tone: "accent", label: "line 2" }]}
    />
    <CodeBlock
      x={TX + 465}
      y={805}
      w={435}
      at={T.another}
      filename="bandit · Bandit"
      size={25}
      code={"1. apples\n2. pizza\n3. grapes"}
      highlight={[{ lines: 2, at: T.pizza - 4, tone: "good", label: "line 2" }]}
    />
    <Sticker src="raccoon/duo-stare.png" at={T.bandit1} x={0} y={1055} w={290} fadeBottom={50} />
    <IconNote icon="branch" at={T.story + 10} until={T.pizza - 4} x={TX + 250} y={1090} size={36}>
      {"Sudo + Bandit share\nsnacks.txt"}
    </IconNote>
    <IconNote icon="pizza" at={T.pizza - 4} x={TX + 250} y={1090} size={36}>
      {"Both edited line 2:\ntuna vs pizza"}
    </IconNote>
  </>
);

// ---------------- Beat 2b: Sudo runs git merge bandit ----------------
const MERGE_FS = 22;
const MERGE_H = termH(5, MERGE_FS);
const MERGE_CONFLICT_LINE = "CONFLICT (content): Merge conflict in snacks.txt";
const MERGE_FAIL_LINE = "Automatic merge failed; fix conflicts and then commit the result.";

const StoryMerge: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(14, T.refuses - T.mergeCmd - 8);
  return (
    <>
      <Headline a="git merge bandit" b="Git refuses to guess." at={T.when} bAt={T.refuses - 4} until={T.read} size={78} />
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={MERGE_H}
        fontSize={MERGE_FS}
        enterAt={T.when}
        blocks={[
          {
            at: T.mergeCmd,
            cmd: "git merge bandit",
            typeFrames: tf,
            outDelay: 2,
            out: [
              "Auto-merging snacks.txt",
              red(MERGE_CONFLICT_LINE),
              MERGE_FAIL_LINE,
            ],
          },
        ]}
      />
      <Circle at={T.refuses} until={T.instead} {...termRing(TX, TY, MERGE_FS, 2, 0, MERGE_CONFLICT_LINE.length)} />
      <Circle at={T.writes} {...termRing(TX, TY, MERGE_FS, 3, 0, "Automatic merge failed; fix conflicts".length)} />
      <IconNote icon="warning" tint={RED} at={T.refuses} until={T.instead} y={TY + MERGE_H + 40}>
        {"Git won't guess whose\nsnack wins."}
      </IconNote>
      <IconNote icon="fileCode" at={T.instead} y={TY + MERGE_H + 40}>
        {"Stops and writes both\nversions into snacks.txt"}
      </IconNote>
      <Sticker src="raccoon/gasp.png" at={T.refuses + 4} x={TX + 610} y={TY + MERGE_H + 10} w={280} fadeBottom={70} />
    </>
  );
};

// ---------------- Beat 3: How to read the conflict markers ----------------
const READ_EY = 430;
const READ_FS = 28;
const READ_EH = editorH(7, READ_FS);
const READ_NOTE_Y = READ_EY + READ_EH + 36;

const ReadMarkers: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="How to read the markers" b="Yours on top, theirs below." at={T.read} bAt={T.incoming - 6} until={T.fixing} size={76} />
    <EditorWindow
      x={TX}
      y={READ_EY}
      w={TW}
      h={READ_EH}
      fontSize={READ_FS}
      title="snacks.txt"
      at={T.read}
      lines={CONFLICT_LINES}
      bands={[
        { from: 2, to: 3, color: C.accent, label: "yours · HEAD (main)", at: T.left },
        { from: 4, to: 4, color: TERM.yellow, label: "divider", at: T.equals1 },
        { from: 5, to: 6, color: GREEN, label: "theirs · bandit", at: T.right },
      ]}
    />
    <Circle at={T.left} until={T.equals1} {...editorRing(TX, READ_EY, READ_FS, 2, 2, "<<<<<<< HEAD".length)} />
    <Circle at={T.equals1} until={T.yourChange} {...editorRing(TX, READ_EY, READ_FS, 4, 4, "=======".length)} />
    <Circle at={T.yourChange} until={T.equals2} {...editorRing(TX, READ_EY, READ_FS, 2, 3, "<<<<<<< HEAD".length)} />
    <Circle at={T.right} until={T.incoming} {...editorRing(TX, READ_EY, READ_FS, 6, 6, ">>>>>>> bandit".length)} />
    <Circle at={T.incoming} {...editorRing(TX, READ_EY, READ_FS, 5, 6, ">>>>>>> bandit".length)} />
    <Note at={T.left} until={T.yourChange} x={TX} y={READ_NOTE_Y} font="mono" size={32}>
      {"<<<<<<< HEAD  start of yours\n=======       divider"}
    </Note>
    <IconNote icon="user" at={T.yourChange} until={T.equals2} y={READ_NOTE_Y}>
      {"Top = YOUR change\n(current branch)"}
    </IconNote>
    <IconNote icon="users" tint={GREEN} at={T.equals2 + 6} y={READ_NOTE_Y}>
      {"Bottom = THEIR change\n(incoming branch)"}
    </IconNote>
    <Sticker src="raccoon/pointing.png" at={T.yourChange} x={TX + 655} y={READ_NOTE_Y - 20} w={245} />
  </>
);

// ---------------- Beat 4a: Intro + Step 1/3 (edit file & delete markers) ----------------
const DIFF_LINES = [
  " 1. apples",
  "-<<<<<<< HEAD",
  "-2. tuna",
  "-=======",
  "-2. pizza",
  "->>>>>>> bandit",
  "+2. tuna + pizza",
  " 3. grapes",
];

const StepOne: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Win from={T.fixing} to={T.s1}>
      <Headline a="Fix it in 3 steps." b="Edit · git add · git commit" at={T.fixing} until={T.s1} size={80} />
    </Win>
    <DiffView
      x={TX}
      y={TY}
      w={TW}
      at={T.fixing}
      dark
      filename="snacks.txt"
      right="step 1/3"
      size={27}
      stagger={1.5}
      applyAt={T.delete}
      settleAt={T.noArrows + 6}
      lines={DIFF_LINES}
    />
    <IconNote icon="code" at={T.open} until={T.delete} y={910}>
      {"Keep the line you want,\nor combine both snacks"}
    </IconNote>
    <IconNote icon="trash" tint={RED} at={T.delete} until={T.noArrows} y={910}>
      {"Delete all 3 marker lines:\n<<<<<<<, =======, >>>>>>>"}
    </IconNote>
    <IconNote icon="check" tint={GREEN} at={T.noArrows} y={910}>
      {"No arrows or equals signs\nleft behind"}
    </IconNote>
    <Sticker src="raccoon/duo-bowl.png" at={T.combine} x={TX + 640} y={890} w={250} />
  </>
);

// ---------------- Beat 4b: Steps 2/3 & 3/3 (git add + git commit) ----------------
const FIX_FS = 25;
const FIX_TH = termH(6, FIX_FS);
const COMMIT_OUT = "[main 549255e] Merge branch 'bandit'";

const StepsTwoThree: React.FC<{ T: Cues }> = ({ T }) => {
  const blocks: Block[] = [
    { at: T.addCmd, cmd: "git add snacks.txt", typeFrames: 18, out: [] },
    {
      at: T.resolved - 6,
      cmd: "git status -s",
      typeFrames: 10,
      outDelay: 2,
      out: [[{ t: "M  ", c: TERM.green, b: true }, { t: "snacks.txt" }]],
    },
    {
      at: T.commitCmd,
      cmd: "git commit",
      typeFrames: 12,
      outDelay: 4,
      out: [green(COMMIT_OUT)],
    },
  ];
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={FIX_TH} fontSize={FIX_FS} enterAt={T.s2} blocks={blocks} />
      <Circle at={T.resolved} until={T.s3} {...termRing(TX, TY, FIX_FS, 2, 0, "M  snacks.txt".length)} />
      <Circle at={T.finish} {...termRing(TX, TY, FIX_FS, 4, 0, COMMIT_OUT.length)} />
      <GitGraph
        x={TX + 110}
        y={900}
        colGap={260}
        laneGap={95}
        dot={16}
        commits={[
          { id: "993929a", lane: 0, x: 0, label: "base", at: T.s2 },
          { id: "398faef", lane: 0, x: 1, label: "2. tuna", at: T.s2, parents: ["993929a"] },
          { id: "f550390", lane: 1, x: 1, label: "2. pizza", at: T.s2, parents: ["993929a"] },
          { id: "549255e", lane: 0, x: 2, label: "549255e · merged", at: T.finish - 4, parents: ["398faef", "f550390"] },
        ]}
        branches={[
          { name: "main", commit: "398faef", at: T.s2, moveTo: [{ commit: "549255e", at: T.finish - 4 }] },
        ]}
        head={[
          { commit: "398faef", at: T.s2 },
          { commit: "549255e", at: T.finish - 4 },
        ]}
      />
      <IconNote icon="check" tint={GREEN} at={T.resolved - 4} until={T.s3} y={1095}>
        {"git add marks snacks.txt\nas resolved"}
      </IconNote>
      <IconNote icon="merge" tint={GREEN} at={T.finish - 4} y={1095}>
        {"git commit finishes\nthe merge!"}
      </IconNote>
      <Sticker src="raccoon/celebrate.png" at={T.finish - 2} x={TX + 640} y={1035} w={230} fadeBottom={40} />
    </>
  );
};

// ---------------- Beat 5: Escape hatch (git merge --abort) ----------------
const ABORT_FS = 26;
const ABORT_TH = termH(6, ABORT_FS);

const AbortBeat: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Panicked and want out?" b="--abort undoes the merge." at={T.panicked} bAt={T.abortFlag - 4} until={T.bonus} size={74} />
    <Terminal
      x={TX}
      y={TY}
      w={TW}
      h={ABORT_TH}
      fontSize={ABORT_FS}
      enterAt={T.panicked}
      blocks={[
        { at: T.abortCmd, cmd: "git merge --abort", typeFrames: 18, out: [] },
        {
          at: T.back - 8,
          cmd: "cat snacks.txt",
          typeFrames: 10,
          outDelay: 2,
          out: ["1. apples", [{ t: "2. tuna", c: TERM.green, b: true }], "3. grapes"],
        },
      ]}
    />
    <Circle at={T.abortFlag} until={T.back - 6} {...termRing(TX, TY, ABORT_FS, 0, 4, "git merge --abort".length)} />
    <Circle at={T.back} {...termRing(TX, TY, ABORT_FS, 3, 0, "2. tuna".length)} />
    <IconNote icon="refresh" at={T.abortFlag + 4} until={T.back} y={TY + ABORT_TH + 40}>
      {"Aborts the merge\nimmediately"}
    </IconNote>
    <IconNote icon="check" tint={GREEN} at={T.back} y={TY + ABORT_TH + 40}>
      {"Back to how it was\nbefore you started"}
    </IconNote>
    <Sticker src="raccoon/hands-up.png" at={T.panicked + 6} x={TX + 630} y={TY + ABORT_TH + 10} w={240} fadeBottom={40} />
  </>
);

// ---------------- Beat 6: Bonus setting (merge.conflictstyle zdiff3) ----------------
const Z_CMD = "git config --global merge.conflictstyle zdiff3";
const Z_TERM_FS = 22;
const Z_TERM_H = termH(2, Z_TERM_FS);
const Z_EY = TY + Z_TERM_H + 22;
const Z_EFS = 23;
const Z_EH = editorH(9, Z_EFS);

const BonusZdiff3: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(24, T.zdiff3 - T.configCmd);
  return (
    <>
      <Headline a="Bonus: turn on zdiff3" b="See the original line too." at={T.bonus} bAt={T.middle - 4} until={T.save} size={74} />
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={Z_TERM_H}
        fontSize={Z_TERM_FS}
        enterAt={T.bonus}
        blocks={[{ at: T.configCmd, cmd: Z_CMD, typeFrames: tf, out: [] }]}
      />
      <EditorWindow
        x={TX}
        y={Z_EY}
        w={TW}
        h={Z_EH}
        fontSize={Z_EFS}
        title="snacks.txt · zdiff3"
        at={T.zdiff3 - 6}
        lines={ZDIFF3_LINES}
        bands={[
          { from: 2, to: 3, color: C.accent, label: "yours (tuna)", at: T.zdiff3 + 4 },
          { from: 4, to: 5, color: TERM.yellow, label: "original (crackers)", at: T.middle },
          { from: 7, to: 8, color: GREEN, label: "theirs (pizza)", at: T.zdiff3 + 4 },
        ]}
      />
      <Circle at={T.bars} {...editorRing(TX, Z_EY, Z_EFS, 4, 5, "||||||| 993929a".length, 9)} />
      <IconNote icon="eye" at={T.middle} y={Z_EY + Z_EH + 26} size={36}>
        {"||||||| = what line 2 looked\nlike before either edit"}
      </IconNote>
      <Sticker src="raccoon/scheming.png" at={T.zdiff3 + 6} x={TX + 660} y={Z_EY + Z_EH + 16} w={200} />
    </>
  );
};

export const MergeConflicts: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <Win from={0} to={T.story}>
        <Hook T={T} />
      </Win>
      <Win from={T.story} to={T.when}>
        <StoryBranches T={T} />
      </Win>
      <Win from={T.when} to={T.read}>
        <StoryMerge T={T} />
      </Win>
      <Win from={T.read} to={T.fixing}>
        <ReadMarkers T={T} />
      </Win>
      <Win from={T.fixing} to={T.s2}>
        <StepOne T={T} />
      </Win>
      <Win from={T.s2} to={T.panicked}>
        <StepsTwoThree T={T} />
      </Win>
      <Win from={T.panicked} to={T.bonus}>
        <AbortBeat T={T} />
      </Win>
      <Win from={T.bonus} to={T.save}>
        <BonusZdiff3 T={T} />
      </Win>

      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.panicked}
        tools={[
          { from: T.s1, name: "edit snacks.txt", repo: "keep what you want · delete the 3 marker lines", n: 1, of: 3 },
          { from: T.s2, name: "git add", repo: "mark the conflict in snacks.txt as resolved", n: 2, of: 3 },
          { from: T.s3, name: "git commit", repo: "finish the merge commit", n: 3, of: 3 },
        ]}
      />

      <SaveOutro
        at={T.save}
        h={termH(5, 25)}
        fontSize={25}
        lines={cheatLines(
          [
            ["<<<<<<< to =======", "your current branch"],
            ["======= to >>>>>>>", "their incoming branch"],
            ["git add + commit", "mark resolved + finish"],
            ["git merge --abort", "undo the merge"],
            ["...conflictstyle zdiff3", "show original |||||||"],
          ],
          24,
        )}
        question={"Editor or\nterminal?"}
      />
      <EndCard
        at={T.follow}
        comment={T.comment}
        question="Do you fix conflicts in your editor or the terminal?"
        line="Follow for more git tricks."
      />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("merge-conflicts/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.when, T.read, T.fixing, T.s1, T.s2, T.s3, T.panicked, T.bonus, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.mergeCmd, T.addCmd, T.commitCmd, T.abortCmd, T.configCmd]} />
      <Sfx name="ding" at={[T.noArrows, T.finish, T.back, T.bars]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CEY = 560;
const CFS = 28;
const CEH = editorH(7, CFS);
export const MergeConflictsCover: React.FC = () => (
  <Cover
    title="Git merge conflict?"
    sub="Fix it without panicking."
    size={80}
    chips={["<<<<<<< HEAD", "git add", "git merge --abort", "zdiff3"]}
  >
    <EditorWindow
      x={CX}
      y={CEY}
      w={CW}
      h={CEH}
      fontSize={CFS}
      title="snacks.txt"
      at={-100}
      lines={CONFLICT_LINES}
      bands={[
        { from: 2, to: 3, color: C.accent, label: "HEAD (yours)", at: -100 },
        { from: 5, to: 6, color: GREEN, label: "bandit (theirs)", at: -100 },
      ]}
    />
    <div style={{ position: "absolute", left: CX + 580, top: CEY + 34 - 240, width: 340, height: 240, overflow: "hidden" }}>
      <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={320} from="below" shadow={false} />
    </div>
  </Cover>
);
