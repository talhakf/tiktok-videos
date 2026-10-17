import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Circle } from "../components/Doodles";
import { Headline } from "../components/Headline";
import { BuildList } from "../components/layouts/BuildList";
import { CardFan } from "../components/layouts/CardFan";
import { ChipDrop, FromTrash } from "../components/layouts/ChipDrop";
import { KeyCombo } from "../components/layouts/KeyCombo";
import { OptionPills } from "../components/layouts/OptionPills";
import { Spotlight } from "../components/layouts/Spotlight";
import { paneRing, StackedPanes } from "../components/layouts/StackedPanes";
import { StatBadge } from "../components/layouts/StatBadge";
import { StepDots } from "../components/layouts/StepDots";
import { Vanish } from "../components/layouts/Vanish";
import { Verdict } from "../components/layouts/Verdict";
import { VsSplit } from "../components/layouts/VsSplit";
import { Block, dim, green, PROMPT_COLS, red } from "../components/Terminal";
import { PANE_1, PANE_2, PANE_BAND, TW, TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the layouts group (lists, comparisons, quizzes, bins, spotlights) in timed sections.
// Section frames: vs 0, panes 100, lists 195, quiz 285, fan 375, bins 455, badges/keys/spotlight 535.

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontWeight: 500, fontSize: 26, color: C.mute, opacity: prog(frame, at, 8) }}>
      {children}
    </div>
  );
};

const top: Block[] = [
  {
    at: 106,
    cmd: "rm -rf node_modules && npm install",
    typeFrames: 14,
    out: [dim("added 1312 packages in 48s"), red("npm warn deprecated inflight@1.0.6"), red("3 high severity vulnerabilities")],
  },
];
const bottom: Block[] = [{ at: 134, cmd: "npm ci", typeFrames: 6, out: [green("added 1312 packages in 9s"), dim("clean install from the lockfile")] }];

export const LayoutsShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. VsSplit: two columns with a winner, three with verdicts */}
    <Win from={0} to={100}>
      <Label at={0} y={225}>
        VsSplit · winner
      </Label>
      <VsSplit
        at={4}
        y={300}
        h={540}
        winner={{ index: 0, at: 62 }}
        columns={[
          { label: "merge", icon: "merge", lines: ["keeps every commit", "adds a merge commit", { t: "git merge main", mono: true }, { t: "safe on shared branches", mark: "check" }] },
          { label: "rebase", icon: "branch", lines: ["rewrites your commits", "one straight line", { t: "git rebase main", mono: true }, { t: "never on shared branches", mark: "cross" }] },
        ]}
      />
      <Label at={20} y={872}>
        VsSplit · 3 columns + verdicts
      </Label>
      <VsSplit
        at={22}
        y={950}
        h={400}
        verdicts={[{ ok: false, at: 70 }, { ok: true, at: 74 }, { ok: false, at: 78 }]}
        columns={[
          { label: "rm", icon: "trash", lines: ["gone for good", { t: "rm -rf x", mono: true }] },
          { label: "trash", icon: "box", lines: ["can undo", { t: "trash x", mono: true }] },
          { label: "shred", icon: "cross", lines: ["overkill here", { t: "shred x", mono: true }] },
        ]}
      />
    </Win>

    {/* 2. StackedPanes + paneRing, Verdict as corner badge and as a big stamp */}
    <Win from={100} to={195}>
      <Label at={100} y={PANE_1 - 50}>
        StackedPanes · paneRing · Verdict
      </Label>
      <StackedPanes at={102} insteadAt={128} top={{ blocks: top }} bottom={{ blocks: bottom }} />
      <Circle at={120} until={128} {...paneRing(1, 0, PROMPT_COLS, 34)} />
      <Circle at={150} {...paneRing(2, 0, PROMPT_COLS, 6)} />
      <Verdict at={118} until={128} kind="myth" x={TX + TW - 190} y={PANE_1 + 252} size={0.6} origin="100% 100%" />
      <Verdict at={146} kind="fact" x={TX + TW - 180} y={PANE_2 + 252} size={0.6} origin="100% 100%" />
      <Verdict at={160} kind="myth" x={TX + 30} y={PANE_BAND + 20} />
      <Verdict at={168} kind="fact" x={TX + 330} y={PANE_BAND + 20} />
      <Verdict at={176} label="it depends" icon="info" color={C.accent} x={TX + 590} y={PANE_BAND + 20} size={0.7} rotate={-2} />
    </Win>

    {/* 3. BuildList: light card with checks, dark rows with numbers and a cross */}
    <Win from={195} to={285}>
      <Label at={195} y={250}>
        BuildList · card
      </Label>
      <BuildList
        card
        y={300}
        rows={[
          { at: 198, cmd: "git switch -", text: "back to the last branch", mark: "check", doneAt: 226 },
          { at: 204, cmd: "git commit --amend", text: "fix the last commit", mark: "check", doneAt: 232 },
          { at: 210, cmd: "git stash -u", text: "park everything, new files too", mark: "check", doneAt: 238 },
          { at: 216, cmd: "git push --force", text: "rewrites shared history", mark: "cross" },
        ]}
      />
      <Label at={225} y={900}>
        BuildList · dark · numbers
      </Label>
      <BuildList
        tone="dark"
        y={950}
        rows={[
          { at: 228, cmd: "ctrl + r", text: "search your history", mark: 1, doneAt: 256 },
          { at: 234, cmd: "!!", text: "run the last command again", mark: 2, doneAt: 260 },
          { at: 240, cmd: "cd -", text: "jump back to where you were", mark: 3 },
        ]}
      />
      <Label at={245} y={1400}>
        BuildList · plain text rows
      </Label>
      <BuildList y={1450} gap={12} rows={[{ at: 248, text: "read the error first", mark: 1 }, { at: 252, text: "then google it", mark: 2 }]} />
    </Win>

    {/* 4. StepDots + OptionPills quiz */}
    <Win from={285} to={375}>
      <Label at={285} y={250}>
        StepDots · 1/5 → 3/5
      </Label>
      <StepDots n={5} y={300} steps={[288, 318, 342]} label />
      <Headline at={292} y={470} size={64} a="Which one deletes" b="a merged branch?" />
      <Label at={296} y={680}>
        OptionPills · pick b, reveal a
      </Label>
      <OptionPills
        at={298}
        y={730}
        options={["git branch -d topic", "git rm topic", "git delete topic", "git checkout -b topic"]}
        pick={{ index: 1, at: 322 }}
        reveal={{ index: 0, at: 345 }}
      />
    </Win>

    {/* 5. CardFan: a hand of cards dealing into a list */}
    <Win from={375} to={455}>
      <Label at={375} y={250}>
        CardFan · deal at 412
      </Label>
      <CardFan
        at={378}
        dealAt={412}
        y={330}
        fanY={420}
        cards={[
          { title: "ctrl + r", sub: "search history", icon: "search" },
          { title: "cd -", sub: "go back", icon: "folder" },
          { title: "!!", sub: "run it again", icon: "refresh" },
          { title: "sudo !!", sub: "again, as root", icon: "lock" },
          { title: "ctrl + l", sub: "clear the screen", icon: "terminal" },
        ]}
      />
    </Win>

    {/* 6. ChipDrop into the can, FromTrash back out, Vanish into /dev/null */}
    <Win from={455} to={535}>
      <Label at={455} y={250}>
        ChipDrop → FromTrash
      </Label>
      <ChipDrop items={["git whatchanged", "git pack-redundant", ".git/info/grafts"]} at={457} drop={474} y={340} canY={360} />
      <FromTrash showCan={false} canY={360} y={340} items={[{ label: "git log --raw", at: 500 }, { label: "git gc", at: 505 }]} />
      <Label at={455} y={880}>
        Vanish
      </Label>
      <Vanish at={458} itemAt={462} suck={490} x={TX + 30} y={980} holeX={TX + 720} holeY={1180} text="warning: noisy output" />
    </Win>

    {/* 7. StatBadge, KeyCombo, Spotlight */}
    <Win from={535} to={600}>
      <Label at={535} y={250}>
        StatBadge
      </Label>
      <StatBadge at={537} x={TX} y={300} icon="star" count={{ to: 552, suffix: "K" }} label="stars" />
      <StatBadge at={541} x={TX + 440} y={300} icon="calendar" value="3.15" label="· 9 Oct 2026" />
      <StatBadge at={545} x={TX} y={420} icon="bolt" value="v2.56" label="latest" />
      <Label at={540} y={580}>
        KeyCombo · press at 566
      </Label>
      <KeyCombo keys={["ctrl", "r"]} at={540} y={630} press={566} />
      <KeyCombo keys={["cmd", "space"]} at={544} y={790} press={566} />
      <KeyCombo keys={["esc", ":", "q"]} sep={["", ""]} at={548} y={950} press={[566, 570, 574]} />
      <Label at={560} y={1130}>
        Spotlight · glides at 580
      </Label>
      <Spotlight
        ring
        pad={14}
        regions={[
          { x: TX + 300, y: 630, w: 300, h: 124, at: 560 },
          { x: TX + 232, y: 950, w: 436, h: 124, at: 580 },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
