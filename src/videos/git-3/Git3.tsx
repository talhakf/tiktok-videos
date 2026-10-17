import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Composition, useVideoConfig, staticFile } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Cover, CoverStill, CW, CX } from "../../components/Cover";
import { Captions } from "../../components/Captions";
import { Circle, Note, Sticker } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Headline } from "../../components/Headline";
import { PeekOver } from "../../components/PeekOver";
import { SaveOutro } from "../../components/SaveOutro";
import { dim, file, Terminal, termRing, type Line, type Seg } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { MetricChange } from "../../components/data/MetricChange";
import { ChipDrop } from "../../components/layouts/ChipDrop";
import { paneRing, StackedPanes } from "../../components/layouts/StackedPanes";
import { Typewriter } from "../../components/motion/Typewriter";
import { BAND, PANE_BAND, TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/git-3/captions.json";

// Git 3.0 is coming (not out, no release date as of 2026-10-11): main, SHA-256, reftable, git whatchanged removed.
// Facts + sources: SudoRaccoon/Videos/git-3.md (## Why now). Design + motion: Playbook/Design system.md.
// Hashes and outputs below are real (git 2.55.0, clean HOME): a sha1 repo and a sha256 + reftable repo.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

const SHA1 = "0ed6e0fed70001ca1e6b3188fa7bacc5f7315d25"; // 40 hex
const SHA256 = "b9dc667bd58a3cb02505fea7258af14e786d4622fd2e805dd20b769e4aa9df15"; // 64 hex
const TRY_CMD = "git init --object-format=sha256 --ref-format=reftable";

export const Git3Composition = () => (
  <>
    <Composition id="Git3" component={Git3} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="Git3Cover" component={Git3Cover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      master1: at("master"),
      heres: at("here's"),
      story: at("sudo's"),
      snack: at("snack"),
      master2: at("master", 2),
      good: at("good"),
      latest: at("latest"),
      v256: at("git256"),
      noDate: at("no"),
      release: at("release"),
      t1: at("one"),
      main: at("main"),
      master3: at("master", 3),
      t2: at("two"),
      sha1: at("sha-1"),
      sha256: at("sha-256"),
      n40: at("40"),
      n64: at("64"),
      collision: at("collision"),
      t3: at("three"),
      reftable: at("reftable"),
      compact: at("compact"),
      tiny: at("tiny"),
      faster: at("faster"),
      kase: at("case"),
      t4: at("four"),
      trash: at("trash"),
      whatchanged: at("gitwhatchanged"),
      logRaw: at("gitlog--raw"),
      old: at("your"),
      these: at("these"),
      tryIt: at("try"),
      tryCmd: at("gitinit--object-formatsha256"),
      refFmt: at("--ref-formatreftable"),
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

const ok = (t: string): Seg => ({ t, c: TERM.green, b: true });
const blue = (t: string): Seg => ({ t, c: TERM.blue, b: true });

// ---------------- hook: the payoff (a new repo on main) is on screen from frame 0 ----------------
const HOOK_TY = 600;
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Git 3.0 is coming." b="Goodbye, master branch." until={T.story} size={76} />
    <Terminal
      x={TX}
      y={HOOK_TY}
      w={TW}
      h={300}
      title="sudo@laptop: ~/stash"
      blocks={[
        { at: -200, cmd: "git init -q" },
        { at: -150, cmd: "git branch --show-current", out: [[ok("main")]] },
      ]}
    />
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 560} edgeY={HOOK_TY} w={300} h={230} overhang={34} />
    <Circle at={T.master1} {...termRing(TX, HOOK_TY, 28, 2, 0, 4)} />
    <Note at={T.heres} x={TX} y={HOOK_TY + 340} font="mono" size={34}>
      main · SHA-256 · reftable · removals
    </Note>
  </>
);

// ---------------- story: Sudo's 2009 repo on master; Git 3.0 isn't out ----------------
const ST_FS = 26;
const ST_TY = 450;
const Story: React.FC<{ T: Cues }> = ({ T }) => {
  const y = (t: string): Seg => ({ t, c: TERM.yellow });
  const log: Line[] = [
    [y("0ed6e0f "), y("("), blue("HEAD -> "), ok("master"), y(")"), { t: " hide snacks in the sink" }],
    [y("9c1d2aa "), { t: "raid the trash can" }],
    [y("3b7e410 "), { t: "first stash (2009)" }],
  ];
  return (
    <>
      <Headline a="Sudo's stash repo: 2009." b="Still on master." at={T.story} until={T.good} size={72} />
      <Headline a="Git 3.0 isn't out yet." b="No release date." at={T.good} bAt={T.noDate} size={72} />
      <Terminal
        x={TX}
        y={ST_TY}
        w={TW}
        h={380}
        fontSize={ST_FS}
        title="sudo@laptop: ~/stash"
        enterAt={T.story}
        blocks={[
          { at: T.story + 4, cmd: "git log --oneline", out: log },
          { at: T.latest, cmd: "git --version", typeFrames: 14, outDelay: Math.max(4, T.v256 - T.latest - 14), out: [[{ t: "git version " }, ok("2.56.0")]] },
        ]}
      />
      <Circle at={T.master2} until={T.good} {...termRing(TX, ST_TY, ST_FS, 1, 17, 6)} />
      <Circle at={T.v256 + 4} {...termRing(TX, ST_TY, ST_FS, 5, 12, 6)} />
      <Sticker src="raccoon/night-snack.png" at={T.snack} until={T.good} x={640} y={870} w={340} fadeBottom={70} />
      <Note at={T.release} x={TX} y={ST_TY + 420}>
        {"Latest: Git 2.56 (Sep 28)\n3.0: no date announced"}
      </Note>
      <Sticker src="raccoon/hands-up.png" at={T.good + 4} x={TX + 650} y={ST_TY + 420} w={240} fadeBottom={50} />
    </>
  );
};

// ---------------- 1/4 main ----------------
const One: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <div style={{ position: "absolute", left: TX, top: TY + 60, width: TW, fontFamily: sans, fontWeight: 600, fontSize: 36, color: C.mute, textAlign: "center" }}>
      git init makes the branch
    </div>
    <Typewriter
      text="master"
      at={T.t1 + 4}
      speed={2}
      deleteAt={T.main - 14}
      deleteSpeed={1.5}
      retype="main"
      retypeAt={T.main}
      retypeColor={C.accent}
      x={TX}
      y={TY + 160}
      w={TW}
      align="center"
      size={170}
      font="mono"
      color={C.mute}
    />
    <Note at={T.master3 + 4} x={TX} y={BAND - 140} font="mono" size={34}>
      {"Today already: git init -b main"}
    </Note>
    <Sticker src="raccoon/pointing.png" at={T.main + 4} x={TX + 650} y={BAND - 40} w={240} />
  </>
);

// ---------------- 2/4 SHA-256 ----------------
const Two: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <StackedPanes
      at={T.t2}
      insteadAt={T.sha256}
      top={{
        title: "git 2 · sha1 repo",
        blocks: [{ at: T.sha1 - 6, cmd: "git rev-parse --show-object-format HEAD", typeFrames: 10, outDelay: 2, out: [[dim("sha1")], SHA1] }],
      }}
      bottom={{
        title: "git 3 · sha256 repo",
        blocks: [
          {
            at: T.sha256,
            cmd: "git rev-parse --show-object-format HEAD",
            typeFrames: 10,
            outDelay: 2,
            out: [[dim("sha256")], [blue(SHA256.slice(0, 40))], [blue(SHA256.slice(40))]],
          },
        ]}
      }
    />
    <Circle at={T.n40} until={T.n64} {...paneRing(1, 2, 0, 40)} />
    <Circle at={T.n64} until={T.collision} {...paneRing(2, 2, 0, 40, 2)} />
    <MetricChange before={40} after={64} at={T.n40} changeAt={T.n64 - 8} until={T.collision} x={TX} y={PANE_BAND} w={TW} size={96} label="characters per commit id" />
    <Note at={T.collision + 2} x={TX} y={PANE_BAND + 10}>
      {"SHAttered (2017): two different\nPDFs with the same SHA-1"}
    </Note>
    <Sticker src="raccoon/side-eye.png" at={T.collision + 6} x={W - 330} y={PANE_BAND - 20} w={300} fadeBottom={60} />
  </>
);

// ---------------- 3/4 reftable ----------------
const Three: React.FC<{ T: Cues }> = ({ T }) => {
  const heads: Line[] = [
    [file("cheetos  "), file("fix-lid  "), file("master")],
    [file("midnight-raid  "), file("snacks  "), file("trash-v2")],
  ];
  return (
    <>
      <StackedPanes
        at={T.t3}
        insteadAt={T.reftable}
        top={{ title: "today · files", blocks: [{ at: T.t3 + 6, cmd: "ls .git/refs/heads", typeFrames: 12, out: heads }] }}
        bottom={{
          title: "git 3 · reftable",
          blocks: [{ at: T.reftable + 2, cmd: "ls .git/reftable", typeFrames: 12, outDelay: 3, out: ["0x000000000001-0x000000000002-32d3dcd1.ref", "tables.list"] }],
        }}
      />
      <Circle at={T.compact + 6} until={T.tiny} {...paneRing(2, 1, 0, 42)} />
      <Circle at={T.tiny} until={T.faster} {...paneRing(1, 1, 0, 39, 2)} />
      <Note at={T.faster} until={T.kase} x={TX} y={PANE_BAND + 10}>
        Faster with lots of branches
      </Note>
      <Note at={T.kase} x={TX} y={PANE_BAND + 10} font="mono" size={34}>
        {"Snack vs snack: no clash\non Mac and Windows"}
      </Note>
      <Sticker src="raccoon/laughing.png" at={T.faster + 4} x={TX + 670} y={PANE_BAND - 10} w={230} />
    </>
  );
};

// ---------------- 4/4 removals ----------------
const FR_FS = 26;
const FR_H = 450;
const Four: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Terminal
      x={TX}
      y={TY}
      w={TW}
      h={FR_H}
      fontSize={FR_FS}
      enterAt={T.t4}
      title="sudo@laptop: ~/stash"
      blocks={[
        {
          at: T.t4 + 6,
          cmd: "git whatchanged",
          typeFrames: 12,
          out: ["'git whatchanged' is nominated for removal.", [{ t: "fatal: refusing to run without --i-still-use-this", c: TERM.red }]],
        },
        {
          at: T.logRaw,
          cmd: "git log --raw",
          typeFrames: 12,
          out: [[{ t: `commit ${SHA1}`, c: TERM.yellow }], [dim("    hide snacks in the sink")], ":000000 100644 0000000 b948272 A   stash.txt"],
        },
      ]}
    />
    <Circle at={T.whatchanged} until={T.logRaw} {...termRing(TX, TY, FR_FS, 2, 0, 49)} />
    <Circle at={T.logRaw + 20} {...termRing(TX, TY, FR_FS, 6, 0, 46)} />
    <ChipDrop items={["git whatchanged"]} at={T.trash - 4} drop={T.whatchanged + 6} x={TX + 30} y={TY + FR_H + 70} canX={TX + 420} canY={TY + FR_H + 60} />
    {/* Sudo pops out of the can once the command is in it */}
    <PeekOver src="raccoon/peek-ledge.png" at={T.whatchanged + 16} x={TX + 420 + 93 - 100} edgeY={TY + FR_H + 60 + 19} w={180} h={150} overhang={24} />
  </>
);

// ---------------- what to do: old repos stay, try it today ----------------
const TRY_TY = 470;
const TRY_FS = 24;
const Today: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Your old repos don't change." b="New defaults, new repos." at={T.old} bAt={T.these} size={66} />
    <Terminal
      x={TX}
      y={TRY_TY}
      w={TW}
      h={300}
      fontSize={TRY_FS}
      enterAt={T.old}
      title="sudo@laptop: ~"
      blocks={[
        { at: T.old + 4, cmd: "git -C stash branch --show-current", typeFrames: 16, out: [[ok("master")]] },
        {
          at: T.tryCmd,
          cmd: TRY_CMD,
          typeFrames: T.refFmt + 40 - T.tryCmd,
          outDelay: 4,
          out: [[dim("Initialized empty Git repository in /home/sudo/v3/.git/")]],
        },
      ]}
    />
    <Circle at={T.old + 26} until={T.tryCmd} {...termRing(TX, TRY_TY, TRY_FS, 1, 0, 6)} />
    <Note at={T.tryIt + 6} x={TX} y={TRY_TY + 340}>
      {"Works now in Git 2.45 and up.\nTry it in a test repo."}
    </Note>
    <Sticker src="raccoon/cool-outfit.png" at={T.tryIt + 10} x={TX + 690} y={TRY_TY + 330} w={190} />
  </>
);

export const Git3: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.old}
        tools={[
          { from: T.t1, name: "main", repo: "default branch name", n: 1, of: 4 },
          { from: T.t2, name: "SHA-256", repo: "default hash", n: 2, of: 4 },
          { from: T.t3, name: "reftable", repo: "where branches are stored", n: 3, of: 4 },
          { from: T.t4, name: "whatchanged", repo: "removed in Git 3.0", n: 4, of: 4 },
        ]}
      />

      <Win from={0} to={T.story}>
        <Hook T={T} />
      </Win>
      <Win from={T.story} to={T.t1}>
        <Story T={T} />
      </Win>
      <Win from={T.t1} to={T.t2}>
        <One T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <Two T={T} />
      </Win>
      <Win from={T.t3} to={T.t4}>
        <Three T={T} />
      </Win>
      <Win from={T.t4} to={T.old}>
        <Four T={T} />
      </Win>
      <Win from={T.old} to={T.save}>
        <Today T={T} />
      </Win>

      <SaveOutro
        at={T.save}
        h={360}
        fontSize={28}
        lines={[
          [dim("# git 3 defaults, today")],
          [ok("git init -b main \\")],
          [ok("  --object-format=sha256 \\")],
          [ok("  --ref-format=reftable")],
          [dim("# instead of git whatchanged")],
          [ok("git log --raw")],
        ]}
        question={"Which change breaks\nyour workflow?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="Which change breaks your workflow?" />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("git-3/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.t1, T.t2, T.t3, T.t4, T.old, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.latest, T.sha1 - 6, T.sha256, T.reftable + 2, T.t4 + 6, T.logRaw, T.tryCmd]} />
      <Sfx name="switch" at={[T.main, T.whatchanged + 6]} />
      <Sfx name="ding" at={[T.n64, T.refFmt + 44]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 600;
export const Git3Cover: React.FC = () => (
  <Cover title="Git 3.0 is coming." sub="What changes for you." size={84} chips={["main", "SHA-256", "reftable", "removals"]}>
    <Terminal
      x={CX}
      y={CTY}
      w={CW}
      h={320}
      fontSize={28}
      title="sudo@laptop: ~/stash"
      blocks={[
        { at: -200, cmd: "git branch --show-current", out: [[ok("main")]] },
        { at: -150, cmd: "git rev-parse --show-object-format", out: [[ok("sha256")]] },
      ]}
    />
    <div
      style={{
        position: "absolute",
        ...(({ x, y, w, h }) => ({ left: x, top: y, width: w, height: h }))(termRing(CX, CTY, 28, 1, 0, 4)),
        borderRadius: 16,
        border: `4px solid ${C.accent}`,
        background: `${C.accent}24`,
      }}
    />
    <div style={{ position: "absolute", left: CX + 560, top: CTY + 34 - 240, width: 340, height: 240, overflow: "hidden" }}>
      <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={320} from="below" shadow={false} />
    </div>
    <div style={{ position: "absolute", left: CX, top: CTY + 350, fontFamily: sans, fontWeight: 600, fontSize: 36, color: C.mute }}>
      master → main · sha1 → sha256
    </div>
  </Cover>
);
