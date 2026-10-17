import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BentoGrid } from "../components/story/BentoGrid";
import { Flashcard } from "../components/story/Flashcard";
import { MythFactCard } from "../components/story/MythFactCard";
import { Scoreboard } from "../components/story/Scoreboard";
import { TierList } from "../components/story/TierList";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the storytelling, hooks, quizzes & gamification group:
// 1. Flashcard (0..120)
// 2. TierList (120..240)
// 3. MythFactCard (240..360)
// 4. Scoreboard (360..480)
// 5. BentoGrid (480..600)

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: mono,
        fontWeight: 500,
        fontSize: 26,
        color: C.mute,
        opacity: prog(frame, at, 8),
      }}
    >
      {children}
    </div>
  );
};

export const StoryShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. Flashcard: 3D perspective flip on light and dark cards */}
    <Win from={0} to={120}>
      <Label at={0} y={255}>
        Flashcard · light · flipAt 42 (good)
      </Label>
      <Flashcard
        at={2}
        y={310}
        h={480}
        flipAt={42}
        tone="good"
        frontTitle="What frees port 3000 in one command?"
        frontSub="when a stuck dev server refuses to quit"
        frontCode="EADDRINUSE :::3000"
        backTitle="Find and kill the process by port"
        backSub="lsof -ti prints only the PID so kill receives it directly"
        backCode="kill -9 $(lsof -ti :3000)"
      />

      <Label at={10} y={835}>
        Flashcard · dark · flipAt 68 (accent)
      </Label>
      <Flashcard
        at={12}
        y={890}
        h={480}
        dark
        flipAt={68}
        tone="accent"
        frontTitle="Undo the last commit without losing files?"
        frontSub="keep every edit staged in your working tree"
        frontCode="git log -1 --oneline"
        backTitle="Move HEAD back one commit softly"
        backSub="--soft leaves your index and working tree untouched"
        backCode="git reset --soft HEAD~1"
      />
    </Win>

    {/* 2. TierList: S / A / B / C / F rows with chips popping into slots */}
    <Win from={120} to={240}>
      <Label at={120} y={255}>
        TierList · S / A / B / C / F · chips enter 132..196
      </Label>
      <TierList
        at={122}
        y={320}
        items={[
          { label: "ripgrep", tier: "S", at: 132, mono: true, icon: "bolt" },
          { label: "fzf", tier: "S", at: 142, mono: true, icon: "search" },
          { label: "zoxide", tier: "A", at: 152, mono: true, icon: "folder" },
          { label: "bat", tier: "A", at: 162, mono: true, icon: "fileCode" },
          { label: "jq", tier: "B", at: 172, mono: true, icon: "code" },
          { label: "grep", tier: "C", at: 184, mono: true, icon: "terminal" },
          { label: "rm -rf *", tier: "F", at: 196, mono: true, icon: "warning" },
        ]}
      />
    </Win>

    {/* 3. MythFactCard: strikes through Myth and expands Fact at revealAt */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        MythFactCard · revealAt 278 · strike + Fact expand
      </Label>
      <MythFactCard
        at={242}
        y={320}
        revealAt={278}
        myth="Deleting a file with rm erases the bytes from your SSD."
        mythSub="most people think the data is gone right away"
        fact="rm only unlinks the filename. The blocks stay until overwritten."
        factSub="use shred or full-disk encryption when disposing drives"
        proofCode="strace -e unlinkat rm secret.txt"
      />
    </Win>

    {/* 4. Scoreboard: head-to-head benchmark rounds with live tally */}
    <Win from={360} to={480}>
      <Label at={360} y={255}>
        Scoreboard · rounds at 380, 398, 416, 434
      </Label>
      <Scoreboard
        at={362}
        y={320}
        leftName="ripgrep"
        leftSub="rg 14.1"
        leftIcon="bolt"
        rightName="GNU grep"
        rightSub="grep -rn"
        rightIcon="search"
        rounds={[
          { metric: "linux kernel tree", leftVal: "0.08 s", rightVal: "1.94 s", winner: "left", at: 380 },
          { metric: "skips .gitignore", leftVal: "built-in", rightVal: "manual", winner: "left", at: 398 },
          { metric: "POSIX preinstalled", leftVal: "install", rightVal: "everywhere", winner: "right", at: 416 },
          { metric: "unicode regex", leftVal: "0.14 s", rightVal: "3.10 s", winner: "left", at: 434 },
        ]}
      />
    </Win>

    {/* 5. BentoGrid: 2-column Apple-style summary board */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        BentoGrid · 2-col summary board · span 1 & 2
      </Label>
      <BentoGrid
        at={482}
        y={320}
        rowH={250}
        cells={[
          {
            title: "Search 10× faster by default",
            sub: "skips node_modules, .git and binary files automatically",
            code: "rg 'TODO' src/",
            stat: "10×",
            icon: "bolt",
            span: 2,
            highlight: true,
            at: 486,
          },
          {
            title: "Fuzzy jump",
            sub: "cd to any ranked folder",
            code: "z api",
            stat: "2 keys",
            icon: "folder",
            span: 1,
            at: 496,
          },
          {
            title: "Syntax cat",
            sub: "line numbers + git diff",
            code: "bat app.ts",
            stat: "100%",
            icon: "fileCode",
            span: 1,
            at: 506,
          },
          {
            title: "Interactive history search",
            sub: "pipe anything into fzf with live preview",
            code: "ctrl + r → fzf",
            stat: "0 ms",
            icon: "terminal",
            span: 2,
            dark: true,
            at: 516,
          },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
