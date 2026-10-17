import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Sticker } from "../components/Doodles";
import { Headline } from "../components/Headline";
import { Callout } from "../components/social/Callout";
import { ChapterCard } from "../components/social/ChapterCard";
import { CommentReply } from "../components/social/CommentReply";
import { DocsQuote } from "../components/social/DocsQuote";
import { Checklist, ProsCons } from "../components/social/ProsCons";
import { PunchWord, Reaction } from "../components/social/PunchWord";
import { Ranking } from "../components/social/Ranking";
import { ThoughtBubble } from "../components/social/ThoughtBubble";
import { dim, dir, file, Terminal, termColX, termLineY } from "../components/Terminal";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the social + explainer group: viewer comment hook, chapter cards, callouts with leader lines,
// docs quote, pros / cons + scorecard, thought bubble + reaction, punch word, ranking.
// Section frames: comment 0, chapters 70, callouts 140, docs 210, lists 280, thought 360, punch 430, ranking 490.

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontWeight: 500, fontSize: 26, color: C.mute, opacity: prog(frame, at, 8) }}>
      {children}
    </div>
  );
};

// the callout demo terminal
const TT = { x: TX, y: 400, w: 900, h: 470, fs: 28 };

export const SocialShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. CommentReply: hook at the top, docks into a corner badge, the answer takes the stage */}
    <Win from={0} to={70}>
      <Label at={0} y={250}>
        CommentReply · dockAt 34
      </Label>
      <CommentReply
        at={2}
        y={310}
        handle="@sleepy_dev"
        meta="2h"
        likes="1,204"
        text={"how do I undo a git commit\nwithout losing my work?"}
        dockAt={34}
        dock={{ x: TX, y: 310, scale: 0.6 }}
      />
      <Headline at={46} y={540} a="git reset --soft" b="keeps every change." />
    </Win>

    {/* 2. ChapterCard full-screen: 1/5 pushes in, 2/5 pushes it out from the right */}
    <Win from={70} to={140}>
      <Headline at={0} y={420} a="The beat before" b="(covered by the card)" />
      <ChapterCard full at={72} until={104} n={1} of={5} title="ripgrep" sub="grep, but it skips what you don't need" />
      <ChapterCard full at={104} until={132} n={2} of={5} title="fzf" sub="fuzzy-find anything you can list" />
      <Label at={72} y={1460}>
        ChapterCard · full · push at 104, leave 132
      </Label>
    </Win>

    {/* 3. Callout: straight and elbow leader lines onto a terminal */}
    <Win from={140} to={210}>
      <Label at={140} y={250}>
        Callout · straight 150 · elbow vh 170
      </Label>
      <Terminal
        x={TT.x}
        y={TT.y}
        w={TT.w}
        h={TT.h}
        enterAt={140}
        blocks={[
          {
            at: 142,
            cmd: "ls -l",
            typeFrames: 6,
            out: [
              dim("total 3"),
              [{ t: "-rw-r--r--  1 raccoon  " }, file("snacks.txt")],
              [{ t: "drwxr-xr-x  3 raccoon  " }, dir("stash")],
              [{ t: "-rwx------  1 raccoon  " }, file("plan.sh")],
            ],
          },
        ]}
      />
      <Callout
        at={152}
        x={300}
        y={1000}
        x2={termColX(TT.x, 1.5, TT.fs)}
        y2={termLineY(TT.y, 2, TT.fs) + 20}
        text="who can read it"
      />
      <Callout
        at={170}
        kind="elbow"
        route="vh"
        x={760}
        y={1130}
        x2={termColX(TT.x, 26, TT.fs) + 120}
        y2={termLineY(TT.y, 4, TT.fs) + 20}
        side="bottom"
        text="a script only you can run"
      />
    </Win>

    {/* 4. DocsQuote: the official wording, one phrase marked, verified */}
    <Win from={210} to={280}>
      <Label at={210} y={250}>
        DocsQuote · highlight 232 · verified 248
      </Label>
      <DocsQuote
        at={212}
        y={310}
        site="Git docs"
        url="git-scm.com/docs/git-reset"
        quote={"--hard\nResets the index and working tree. Any changes to tracked files in the working tree since <commit> are discarded."}
        highlight="are discarded."
        highlightAt={232}
        verifiedAt={248}
      />
    </Win>

    {/* 5. ProsCons columns + Checklist scorecard */}
    <Win from={280} to={360}>
      <Label at={280} y={250}>
        ProsCons · columns
      </Label>
      <ProsCons
        at={282}
        y={300}
        pros={[
          { text: "survives ssh drops", at: 288 },
          { text: "split panes", at: 296 },
          { text: "scriptable", at: 304 },
        ]}
        cons={[
          { text: "odd shortcuts", at: 292 },
          { text: "one more config", at: 300 },
        ]}
      />
      <Label at={300} y={800}>
        Checklist · results 314, 322, 330, 338
      </Label>
      <Checklist
        at={302}
        y={850}
        title="is it a strong password?"
        items={[
          { text: "12 or more characters", result: "pass", resultAt: 314 },
          { text: "not in a leak list", sub: "rockyou.txt has 14 million", result: "fail", resultAt: 322 },
          { text: "no names or birthdays", result: "pass", resultAt: 330 },
          { text: "used on one site only", result: "pass", resultAt: 338 },
        ]}
      />
    </Win>

    {/* 6. ThoughtBubble over a raccoon + Reaction discs */}
    <Win from={360} to={430}>
      <Label at={360} y={250}>
        ThoughtBubble · glass · Reaction ? at 392, +1 float at 404
      </Label>
      <Sticker src="raccoon/side-eye.png" at={362} x={TX} y={930} w={560} fadeBottom={70} />
      <ThoughtBubble at={372} x={350} y={560} w={600} tx={360} ty={900} text={"wait, what does\nsudo actually do?"} />
      <Reaction at={392} x={780} y={1000} glyph="?" />
      <Reaction at={404} x={880} y={1180} glyph="+1" float size={120} />
    </Win>

    {/* 7. PunchWord: one word slams in; second with a grey follow-up */}
    <Win from={430} to={490}>
      <Label at={430} y={250}>
        PunchWord · 432 until 456 · 460 with b
      </Label>
      <PunchWord at={432} until={456} text="nope." />
      <PunchWord at={460} text="0 bytes" b="left on the disk" color={C.accent} size={200} />
    </Win>

    {/* 8. Ranking: rows slide in, zoxide moves from 4 to 1, highlighted */}
    <Win from={490} to={600}>
      <Label at={490} y={250}>
        Ranking · reorder 536 · highlight 556
      </Label>
      <Ranking
        y={310}
        items={[
          { id: "fzf", label: "fzf", sub: "fuzzy finder", icon: "search", at: 492 },
          { id: "rg", label: "ripgrep", sub: "fast search", icon: "fileCode", at: 496 },
          { id: "bat", label: "bat", sub: "cat with colours", icon: "file", at: 500 },
          { id: "z", label: "zoxide", sub: "smarter cd", icon: "folder", at: 504 },
          { id: "eza", label: "eza", sub: "nicer ls", icon: "panes", at: 508 },
        ]}
        orders={[{ at: 536, ids: ["z", "fzf", "rg", "bat", "eza"] }]}
        highlight={[{ id: "z", at: 556 }]}
      />
    </Win>
  </AbsoluteFill>
);
