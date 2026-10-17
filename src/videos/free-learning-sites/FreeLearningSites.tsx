import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Composition, interpolateColors, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Cover, CoverStill, CW, CX } from "../../components/Cover";
import { Captions } from "../../components/Captions";
import { Circle, Note, Sticker } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Headline } from "../../components/Headline";
import { PeekOver } from "../../components/PeekOver";
import { SaveOutro } from "../../components/SaveOutro";
import { dim, Terminal, termRing, type Line } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { GitGraph } from "../../components/diagram/GitGraph";
import { BuildList } from "../../components/layouts/BuildList";
import { CardFan } from "../../components/layouts/CardFan";
import { FromTrash } from "../../components/layouts/ChipDrop";
import { StatBadge } from "../../components/layouts/StatBadge";
import { Button, TextField } from "../../components/ui/Form";
import { BrowserWindow } from "../../components/windows/BrowserWindow";
import { TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, materialize, mono, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/free-learning-sites/captions.json";

// Five free sites that teach you the terminal: explainshell, OverTheWire Bandit, Learn Git Branching,
// MIT's Missing Semester, build-your-own-x. Facts + sources: SudoRaccoon/Videos/free-learning-sites.md.
// Design + motion: Playbook/Design system.md. Every site page is built from library pieces (no screenshots).

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

const SITES = [
  { title: "explainshell", url: "explainshell.com", icon: "search" as const },
  { title: "OverTheWire Bandit", url: "overthewire.org/wargames/bandit", icon: "key" as const },
  { title: "Learn Git Branching", url: "learngitbranching.js.org", icon: "branch" as const },
  { title: "Missing Semester", url: "missing.csail.mit.edu", icon: "terminal" as const },
  { title: "build-your-own-x", url: "github.com/codecrafters-io/build-your-own-x", icon: "box" as const },
];
const SSH_CMD = "ssh bandit0@bandit.labs.overthewire.org -p 2220";

export const FreeLearningSitesComposition = () => (
  <>
    <Composition id="FreeLearningSites" component={FreeLearningSites} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="FreeLearningSitesCover" component={FreeLearningSitesCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      no: at("no"),
      story: at("sudo"),
      dug: at("dug"),
      trash: at("trash"),
      t1: at("one", 2),
      paste: at("paste"),
      tar: at("tar-xzvf"),
      explains: at("explains"),
      flag: at("flag"),
      extract: at("extract"),
      gzip: at("gzip"),
      verbose: at("verbose"),
      file: at("file"),
      t2: at("two"),
      bandit: at("overthewirebandit"),
      hacking: at("hacking"),
      ssh: at("ssh"),
      level: at("level"),
      password: at("password"),
      next: at("next"),
      t3: at("three"),
      type: at("type"),
      commands: at("commands"),
      watch: at("watch"),
      commit: at("commit"),
      grow: at("grow"),
      browser: at("browser"),
      t4: at("four"),
      shell: at("shell"),
      git3: at("git", 3),
      editor: at("editor"),
      skip: at("skip"),
      free2: at("free", 2),
      t5: at("five", 2),
      over2: at("over", 2),
      million: at("million"),
      guides: at("guides"),
      git4: at("git", 4),
      shell2: at("shell", 2),
      database: at("database"),
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

// the browser body starts this far below the window's top (BrowserWindow toolbar)
const BAR = 84;

// ---------------- hook: the five sites are on screen from frame 0 ----------------
const LIST_Y = 660;
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <CardFan
      at={-100}
      dealAt={-100}
      until={T.story}
      y={LIST_Y}
      rowH={100}
      gap={12}
      cards={SITES.map((s) => ({ title: s.title, sub: s.url, icon: s.icon }))}
    />
    <PeekOver src="raccoon/peek-paws.png" at={-100} until={T.story} x={TX + 400} edgeY={LIST_Y} w={300} h={231} overhang={34} />
  </>
);

// ---------------- story: Sudo digs them out of the internet's trash ----------------
const BIN_X = TX + 580;
const BIN_Y = 700;
const BIN_W = 250;
// the bin's open flap, in page px (trash-bin.png is 162×194, the flap opening sits around (50, 40))
const FLAP_X = BIN_X + (50 / 162) * BIN_W;
const FLAP_Y = BIN_Y + (40 / 162) * BIN_W;
const Story: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Sticker src="raccoon/trash-bin.png" at={T.story} x={BIN_X} y={BIN_Y} w={BIN_W} fadeBottom={60} />
    <FromTrash
      showCan={false}
      canX={FLAP_X - 93}
      canY={FLAP_Y - 19 + 10}
      x={TX}
      y={500}
      rowGap={92}
      size={32}
      items={["explainshell.com", "overthewire.org", "learngitbranching.js.org", "missing.csail.mit.edu", "build-your-own-x"].map((label, i) => ({
        label,
        at: T.dug + i * 6,
      }))}
    />
    <StatBadge at={T.trash} x={TX} y={980} icon="check" value="$0" label="  all five, no account" />
  </>
);

// ---------------- 1/5 explainshell: every flag of tar -xzvf explained ----------------
const ES_H = 660;
const FLAGS = [
  { t: "-x", text: "Extract files from an archive.", key: "extract" as const },
  { t: "z", text: "Filter the archive through gzip.", key: "gzip" as const },
  { t: "v", text: "Verbosely list files processed.", key: "verbose" as const },
  { t: "f", text: "Use archive file or device ARCHIVE.", key: "file" as const },
];
const ExplainPage: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const cues = FLAGS.map((f) => T[f.key]);
  const active = cues.findLastIndex((c) => frame >= c);
  const res = prog(frame, T.explains, 10);
  const tok = (s: string, i: number | null) => {
    const on = i !== null && i === active;
    const p = i === null ? 0 : on ? prog(frame, cues[i], 6) : 0;
    return (
      <span
        key={s}
        style={{
          padding: "4px 8px",
          borderRadius: 10,
          background: interpolateColors(p, [0, 1], ["rgba(0,113,227,0)", "rgba(0,113,227,0.14)"]),
          color: i === null ? C.ink : interpolateColors(p, [0, 1], [C.accent, C.accent]),
          outline: on ? `3px solid rgba(0,113,227,${p})` : undefined,
        }}
      >
        {s}
      </span>
    );
  };
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 26, width: TW, textAlign: "center", fontFamily: sans, fontWeight: 600, fontSize: 30, color: C.ink, letterSpacing: "-0.02em" }}>
        explain <span style={{ color: C.mute }}>shell . com</span>
      </div>
      <TextField
        x={40}
        y={110}
        w={TW - 80}
        at={T.t1}
        until={T.explains}
        placeholder="write down a command-line…"
        value="tar -xzvf archive.tar.gz"
        typeAt={T.paste + 2}
        fpc={1}
        monoValue
      />
      <Button x={40} y={232} w={220} h={80} size={28} at={T.t1} until={T.explains} label="explain" pressAt={T.explains - 8} />
      {frame >= T.explains ? (
        <div style={{ position: "absolute", left: 0, top: 96, width: TW, ...materialize(res) }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, fontFamily: mono, fontWeight: 500, fontSize: 46 }}>
            {tok("tar", null)}
            {FLAGS.map((f, i) => tok(f.t, i))}
            {tok("archive.tar.gz", null)}
          </div>
          <div style={{ marginTop: 10, textAlign: "center", fontFamily: sans, fontWeight: 500, fontSize: 26, color: C.mute }}>tar(1): an archiving utility</div>
        </div>
      ) : null}
      <BuildList
        card
        x={40}
        y={212}
        w={TW - 80}
        at={T.flag}
        cmdSize={30}
        textSize={28}
        rows={FLAGS.map((f, i) => ({ at: cues[i], cmd: f.t.startsWith("-") ? f.t : `-${f.t}`, text: f.text, h: 88 }))}
      />
    </>
  );
};
const Explain: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <BrowserWindow x={TX} y={TY} w={TW} h={ES_H} at={T.t1} url="explainshell.com">
      <ExplainPage T={T} />
    </BrowserWindow>
    <Note at={T.flag} x={TX} y={TY + ES_H + 40}>
      Every flag, from the man page
    </Note>
    <Sticker src="raccoon/pointing.png" at={T.explains} x={TX + 680} y={TY + ES_H + 10} w={210} />
  </>
);

// ---------------- 2/5 OverTheWire Bandit: a game over ssh ----------------
const BD_H = 500;
const BFS = 26;
const Bandit: React.FC<{ T: Cues }> = ({ T }) => {
  const sshAt = T.bandit + 10;
  const sshTf = Math.min(40, T.ssh - 6 - sshAt);
  const out1: Line[] = [[dim("This is an OverTheWire game server.")], [dim("bandit0@bandit.labs.overthewire.org's password:")]];
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={BD_H}
        fontSize={BFS}
        enterAt={T.t2}
        blocks={[
          { at: sshAt, cmd: SSH_CMD, typeFrames: sshTf, outDelay: Math.max(3, T.ssh - (sshAt + sshTf)), out: out1 },
          { at: T.level - 4, cmd: "ls", typeFrames: 4, outDelay: 2, out: ["readme"] },
          // the level 1 password stays hidden: OverTheWire's rules say never publish credentials
          { at: T.level + 8, cmd: "cat readme", typeFrames: 8, outDelay: Math.max(2, T.password - (T.level + 16)), out: [[{ t: "•".repeat(32), c: TERM.green, b: true }]] },
        ]}
      />
      <Circle at={T.password + 4} {...termRing(TX, TY, BFS, 6, 0, 32)} />
      <StatBadge at={T.hacking} until={T.next} x={TX} y={TY + BD_H + 40} icon="key" value="Level 0" label="  user bandit0, password bandit0" size={34} />
      <Note at={T.next} x={TX} y={TY + BD_H + 40}>
        {"readme holds the\npassword for level 1"}
      </Note>
      <Sticker src="raccoon/sneaking.png" at={T.hacking} x={W - 430} y={TY + BD_H + 110} w={430} from="right" />
    </>
  );
};

// ---------------- 3/5 Learn Git Branching: type git, the tree grows ----------------
const LG_H = 660;
const GitPage: React.FC<{ T: Cues }> = ({ T }) => {
  const c1 = T.type + 10; // "git commit" typed
  const c2 = T.commands + 4 + 14; // "git checkout -b bugFix" typed
  const c3 = T.commit + 2; // second "git commit"
  return (
    <>
      <GitGraph
        x={170}
        y={96}
        colGap={170}
        laneGap={112}
        commits={[
          { id: "C0", lane: 0, label: "C0", at: T.t3 },
          { id: "C1", lane: 0, label: "C1", at: T.t3 + 4, parents: ["C0"] },
          { id: "C2", lane: 0, label: "C2", at: c1, parents: ["C1"] },
          { id: "C3", lane: 1, x: 3, label: "C3", at: c3, parents: ["C2"] },
        ]}
        branches={[
          { name: "main", commit: "C1", at: T.t3 + 6, moveTo: [{ commit: "C2", at: c1 + 4 }] },
          { name: "bugFix", commit: "C2", at: c2, moveTo: [{ commit: "C3", at: c3 + 4 }], side: "bottom" },
        ]}
        head={[
          { commit: "C1", at: T.t3 + 6 },
          { commit: "C2", at: c1 + 4 },
          { commit: "C3", at: c3 + 4 },
        ]}
      />
      <Terminal
        x={30}
        y={336}
        w={TW - 60}
        h={232}
        fontSize={26}
        title="git"
        blocks={[
          { at: T.type, cmd: "git commit", typeFrames: 9 },
          { at: T.commands + 4, cmd: "git checkout -b bugFix", typeFrames: 13 },
          { at: T.commit - 7, cmd: "git commit", typeFrames: 8 },
        ]}
      />
    </>
  );
};
const LearnGit: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <BrowserWindow x={TX} y={TY} w={TW} h={LG_H} at={T.t3} url="learngitbranching.js.org">
      <GitPage T={T} />
    </BrowserWindow>
    <Note at={T.browser} x={TX} y={TY + LG_H + 40}>
      Nothing to install
    </Note>
  </>
);

// ---------------- 4/5 MIT's Missing Semester ----------------
const MS_H = 640;
const LECTURES = [
  ["1/12/26", "Course Overview + Introduction to the Shell"],
  ["1/13/26", "Command-line Environment"],
  ["1/14/26", "Development Environment and Tools"],
  ["1/15/26", "Debugging and Profiling"],
  ["1/16/26", "Version Control and Git"],
  ["1/20/26", "Packaging and Shipping Code"],
];
const ROW0 = 236;
const ROW_H = 52;
const MissingPage: React.FC = () => (
  <div style={{ position: "absolute", left: 40, top: 26, width: TW - 80, fontFamily: sans }}>
    <div style={{ fontFamily: mono, fontSize: 24, color: C.mute }}>./missing-semester</div>
    <div style={{ marginTop: 18, fontWeight: 700, fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.035em", color: C.ink }}>
      The Missing Semester of Your CS Education
    </div>
    <div style={{ position: "absolute", top: ROW0 - 26 - 50, fontWeight: 700, fontSize: 30, color: C.ink }}>Syllabus</div>
    {LECTURES.map(([d, t], i) => (
      <div key={t} style={{ position: "absolute", top: ROW0 - 26 + i * ROW_H, height: ROW_H, display: "flex", alignItems: "center", gap: 18, fontSize: 28, whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: mono, fontSize: 24, color: C.mute }}>{d}</span>
        <span style={{ color: C.accent, fontWeight: 500 }}>{t}</span>
      </div>
    ))}
  </div>
);
// focus ring around lecture row i, in page px
const lectureRing = (i: number) => ({ x: TX + 24, y: TY + BAR + ROW0 + i * ROW_H - 4, w: TW - 48, h: ROW_H + 8 });
const Missing: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <BrowserWindow x={TX} y={TY} w={TW} h={MS_H} at={T.t4} url="missing.csail.mit.edu">
      <MissingPage />
    </BrowserWindow>
    <Circle at={T.shell} until={T.git3} {...lectureRing(0)} />
    <Circle at={T.git3} until={T.editor} {...lectureRing(4)} />
    <Circle at={T.editor} until={T.skip} {...lectureRing(2)} />
    <Note at={T.skip} x={TX} y={TY + MS_H + 36} size={34}>
      {"“one critical subject that’s\nrarely covered”"}
    </Note>
    <StatBadge at={T.free2} x={TX} y={TY + MS_H + 180} icon="check" value="free" label="  lecture videos + notes" size={34} />
    <Sticker src="raccoon/standing-front.png" at={T.skip} x={TX + 740} y={TY + MS_H + 20} w={150} />
  </>
);

// ---------------- 5/5 build-your-own-x ----------------
const BY_H = 580;
const TECH = ["Git", "Shell", "Database", "Docker", "Web Browser", "Operating System", "Text Editor", "BitTorrent Client", "Search Engine", "Emulator"];
const BuildPage: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const hot = [T.git4, T.shell2, T.database];
  return (
    <>
      <div style={{ position: "absolute", left: 40, top: 30, fontFamily: sans, fontSize: 32, fontWeight: 500, color: C.accent, letterSpacing: "-0.02em" }}>
        codecrafters-io <span style={{ color: C.mute }}>/</span> <span style={{ fontWeight: 700 }}>build-your-own-x</span>
      </div>
      <StatBadge at={T.t5 + 12} countAt={T.over2} x={40} y={92} icon="star" count={{ to: 552, suffix: "K", dur: 26 }} label="  stars" size={36} />
      <div style={{ position: "absolute", left: 40, top: 200, fontFamily: sans, fontWeight: 700, fontSize: 34, letterSpacing: "-0.03em", color: C.ink }}>
        Build your own <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 30, color: C.mute }}>&lt;insert-technology-here&gt;</span>
      </div>
      <div style={{ position: "absolute", left: 40, top: 268, width: TW - 80, display: "flex", flexWrap: "wrap", gap: 14 }}>
        {TECH.map((t, i) => {
          const p = prog(frame, T.guides + i * 1.2, 9);
          const h = i < 3 ? prog(frame, hot[i], 6) : 0;
          return (
            <div
              key={t}
              style={{
                padding: "12px 24px",
                borderRadius: 999,
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 30,
                letterSpacing: "-0.01em",
                background: interpolateColors(h, [0, 1], [C.soft, C.accent]),
                color: interpolateColors(h, [0, 1], [C.ink, C.white]),
                ...materialize(p),
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
    </>
  );
};
const BuildX: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <BrowserWindow x={TX} y={TY} w={TW} h={BY_H} at={T.t5} url="github.com/codecrafters-io/build-your-own-x">
      <BuildPage T={T} />
    </BrowserWindow>
    <Sticker src="raccoon/gasp.png" at={T.million} x={0} y={TY + BY_H - 30} w={230} fadeBottom={80} />
  </>
);

const outroLines: Line[] = SITES.map((s, i) => [dim(`${i + 1} `), { t: s.url, c: TERM.green, b: true }]);

export const FreeLearningSites: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <Headline a="5 free sites that teach you the terminal." b="No signup, no credit card." bAt={T.no} size={72} until={T.t1} />
      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.save}
        tools={[
          { from: T.t1, name: "explainshell", repo: "explainshell.com", n: 1, of: 5 },
          { from: T.t2, name: "Bandit", repo: "OverTheWire · overthewire.org", n: 2, of: 5 },
          { from: T.t3, name: "Git Branching", repo: "Learn Git Branching · learngitbranching.js.org", n: 3, of: 5 },
          { from: T.t4, name: "MIT", repo: "The Missing Semester · missing.csail.mit.edu", n: 4, of: 5 },
          { from: T.t5, name: "Build your own", repo: "build-your-own-x · github.com/codecrafters-io", n: 5, of: 5 },
        ]}
      />

      <Win from={0} to={T.story}>
        <Hook T={T} />
      </Win>
      <Win from={T.story} to={T.t1}>
        <Story T={T} />
      </Win>
      <Win from={T.t1} to={T.t2}>
        <Explain T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <Bandit T={T} />
      </Win>
      <Win from={T.t3} to={T.t4}>
        <LearnGit T={T} />
      </Win>
      <Win from={T.t4} to={T.t5}>
        <Missing T={T} />
      </Win>
      <Win from={T.t5} to={T.save}>
        <BuildX T={T} />
      </Win>

      <SaveOutro at={T.save} h={330} fontSize={28} title="free sites" lines={outroLines} question={"Which one are you\nstarting tonight?"} />
      <EndCard at={T.follow} comment={T.comment} question="Which one are you starting tonight?" />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("free-learning-sites/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.t1, T.t2, T.t3, T.t4, T.t5, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.paste + 2, T.bandit + 10, T.level - 4, T.level + 8, T.type, T.commands + 4, T.commit - 7]} />
      <Sfx name="switch" at={[T.explains - 8, T.shell, T.git3, T.editor]} />
      <Sfx name="ding" at={[T.explains, T.ssh, T.commit + 2, T.million]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440): headline + the payoff visual (the five sites) + Sudo + chips. Not a video frame.
export const FreeLearningSitesCover: React.FC = () => (
  <Cover title="5 free sites that teach" sub="you the terminal." chips={["no signup", "no credit card"]} size={88}>
    <CardFan at={-100} dealAt={-100} x={CX} y={560} w={CW} rowH={92} gap={12} cards={SITES.map((s) => ({ title: s.title, sub: s.url, icon: s.icon }))} />
    <div style={{ position: "absolute", left: CX + 520, top: 560 + 34 - 231, width: 320, height: 231, overflow: "hidden" }}>
      <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={300} from="below" shadow={false} />
    </div>
  </Cover>
);
