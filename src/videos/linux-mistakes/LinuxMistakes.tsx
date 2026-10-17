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
import { PROMPT_COLS, red, green, Segs, Terminal, termColX, termLineY, termRing, type Line } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { KeyCombo } from "../../components/layouts/KeyCombo";
import { Mark, RED } from "../../components/layouts/Mark";
import { Pane, PANE_FS } from "../../components/layouts/StackedPanes";
import { DocsQuote } from "../../components/social/DocsQuote";
import { Annotate } from "../../components/text/Annotate";
import { Icon, type IconName } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, materialize, mono, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/linux-mistakes/captions.json";

// 5 Linux commands you're using wrong: rm -rf → rm -rI, chmod 777 → chmod u+x, kill -9 → kill, retyping → sudo !!,
// history | grep → ctrl + r. Facts + sources (rm(1), chmod(1), kill(1) util-linux, man bash; all run in a scratch
// folder 2026-10-13): SudoRaccoon/Videos/linux-mistakes.md. Design + motion: Playbook/Design system.md.
// Every beat: "3:07 am" pane (the habit) on top, "instead" pane below; the space of the bottom pane holds the
// wrong-way notes until the better way arrives.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

export const LinuxMistakesComposition = () => (
  <>
    <Composition id="LinuxMistakes" component={LinuxMistakes} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="LinuxMistakesCover" component={LinuxMistakesCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      wrong: at("wrong"),
      sudo0: at("sudo"),
      story: at("last"),
      deleted: at("deleted"),
      folder0: at("folder"),
      single: at("single"),
      lets: at("let's"),
      // 1/5 rm
      t1: at("one"),
      rmrf: at("rm-rf"),
      noUndo: at("no"),
      gone: at("gone"),
      type1: at("type"),
      rmri: at("rm-ri"),
      asks: at("asks"),
      folder: at("folder", 2),
      sayNo: at("no", 3),
      survive: at("survive"),
      // 2/5 chmod
      t2: at("two"),
      c777: at("chmod777"),
      permission: at("permission"),
      every: at("every"),
      user: at("user"),
      read: at("read"),
      raccoon: at("raccoon"),
      use: at("use"),
      cux: at("chmodux"),
      you2: at("you", 2),
      nobody: at("nobody"),
      change2: at("change", 2),
      // 3/5 kill
      t3: at("three", 2),
      kill9: at("kill-9"),
      ends: at("ends"),
      the3: at("the", 4),
      catch: at("catch"),
      saved: at("saved"),
      plain: at("plain"),
      kill: at("kill"),
      save1: at("save"),
      keep: at("keep"),
      ignores: at("ignores"),
      // 4/5 sudo !!
      t4: at("four"),
      forgot: at("forgot"),
      retype: at("retype"),
      type2: at("type", 2),
      sudoBang: at("sudo", 3),
      bang: at("bang"),
      lastCmd: at("last", 2),
      root: at("root"),
      works: at("works"),
      // 5/5 ctrl + r
      t5: at("five", 2),
      hgrep: at("historygrep"),
      just: at("just", 2),
      press: at("press"),
      ctrlr: at("ctrlr"),
      typing: at("typing"),
      matching: at("matching"),
      press2: at("press", 2),
      again: at("again", 2),
      enter: at("enter"),
      // outro
      save: at("save", 2),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

// In Inter a capital I looks like a lowercase l ("rm -rl"), and the Google Fonts build has no serif-I variant (cv08):
// the header shows that one letter in JetBrains Mono, whose I has serifs. ToolHeader renders `name` as a child,
// so a node works at runtime even though the prop is typed string.
const RM_RI = (
  <>
    rm -r<span style={{ fontFamily: mono, fontWeight: 700, letterSpacing: 0 }}>I</span>
  </>
) as unknown as string;

const IconNote: React.FC<{
  icon: IconName;
  at: number;
  until?: number;
  x: number;
  y: number;
  size?: number;
  tint?: string;
  children: React.ReactNode;
}> = ({ icon, at, until, x, y, size, tint = C.accent, children }) => {
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

// ---------------- pane geometry ----------------
const FS = PANE_FS; // 26 px, 54 columns
const rowsH = (rows: number) => Math.round(rows * 1.38 * FS + 148); // the body loses 148 px to title bar + padding
const P1 = 430; // under the ToolHeader
const p2Of = (h1: number) => P1 + h1 + 14;
const ring = (paneY: number, line: number, col: number, cols: number) => termRing(TX, paneY, FS, line, col, cols);

// Typed user input that appears on an output line (the "n" answer to rm's question), pinned to a pane line.
const TypedAt: React.FC<{
  at: number;
  until: number;
  y: number;
  line: number;
  col: number;
  text: string;
}> = ({ at, until, y, line, col, text }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= until) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: termColX(TX, col, FS),
        top: termLineY(y, line, FS),
        fontFamily: mono,
        fontWeight: 700,
        fontSize: FS,
        lineHeight: 1.38,
        color: TERM.yellow,
        whiteSpace: "pre",
        opacity: 1 - prog(frame, until - 9, 9),
      }}
    >
      {text}
    </div>
  );
};

const promptLine = (cmd: string): Line => [{ t: "~ ", c: TERM.blue, b: true }, { t: "$ ", c: TERM.green, b: true }, { t: cmd }];

// ---------------- hook: all five habits on screen from frame 0 ----------------
const WRONG = ["rm -rf snacks/", "chmod 777 snack.sh", "kill -9 4821", "sudo touch /etc/snacks", "history | grep ssh"];
const HOOK_TY = 640;
const HOOK_FS = 36;
const HOOK_H = Math.round(WRONG.length * 1.38 * HOOK_FS + 148);
const Hook: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Headline a="5 Linux commands" b="you're using wrong." until={T.story} size={86} />
      <Terminal x={TX} y={HOOK_TY} w={TW} h={HOOK_H} fontSize={HOOK_FS} title="3:07 am">
        {WRONG.map((c, i) => (
          <div key={i} style={{ whiteSpace: "pre", minHeight: "1.38em" }}>
            <Segs line={promptLine(c)} />
          </div>
        ))}
      </Terminal>
      {WRONG.map((_, i) => {
        const a = T.wrong + i * 3;
        const p = prog(frame, a, 9);
        return frame < a ? null : (
          <div
            key={i}
            style={{
              position: "absolute",
              left: TX + TW - 28 - 46,
              top: termLineY(HOOK_TY, i, HOOK_FS) + (HOOK_FS * 1.38 - 46) / 2,
              ...materialize(p, 0.9, 6),
            }}
          >
            <Mark kind="cross" size={46} color={RED} draw={prog(frame, a + 2, 8)} />
          </div>
        );
      })}
      <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 560} edgeY={HOOK_TY} w={300} h={230} overhang={34} />
      <IconNote icon="moon" at={T.sudo0} x={TX} y={HOOK_TY + HOOK_H + 44}>
        {"Sudo did all five.\nAt 3 a.m."}
      </IconNote>
    </>
  );
};

// ---------------- story: the snack folder is gone ----------------
const NOFILE = "ls: cannot access 'snacks': No such file or directory";
const STORY_TY = 430;
const Story: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Sudo, 3 a.m.:" b="snack folder gone." at={T.story} bAt={T.deleted} size={80} />
    <Terminal
      x={TX}
      y={STORY_TY}
      w={TW}
      h={rowsH(4)}
      fontSize={FS}
      enterAt={T.story}
      title="3:07 am"
      blocks={[
        { at: T.story + 4, cmd: "rm -rf snacks/", typeFrames: 12, out: [] },
        {
          at: T.folder0 - 6,
          cmd: "ls snacks",
          typeFrames: 8,
          outDelay: 2,
          out: [red(NOFILE)],
        },
      ]}
    />
    <Circle at={T.single} {...ring(STORY_TY, 2, 0, NOFILE.length)} />
    <IconNote icon="trash" at={T.single} x={TX} y={800}>
      {"1 command.\n0 snacks."}
    </IconNote>
    <Note at={T.lets} x={TX} y={990}>
      Let's fix his habits.
    </Note>
    <Sticker src="raccoon/oops.png" at={T.deleted} x={TX + 530} y={800} w={350} fadeBottom={70} />
  </>
);

// ---------------- 1/5 rm -rf → rm -rI ----------------
const ASK = "rm: remove 1 argument recursively? ";
const SNACKS = "chips  cookies  grapes  pizza";
const RM_H1 = rowsH(4);
const RM_P2 = p2Of(RM_H1);
const RM_H2 = rowsH(5);
const Rm: React.FC<{ T: Cues }> = ({ T }) => {
  const out = T.t2 - 8;
  const band = RM_P2 + RM_H2 + 30;
  return (
    <>
      <Pane
        at={T.t1}
        until={out}
        dimAt={T.type1}
        y={P1}
        h={RM_H1}
        title="3:07 am"
        blocks={[
          { at: T.rmrf + 2, cmd: "rm -rf snacks/", typeFrames: 14, out: [] },
          {
            at: T.gone - 8,
            cmd: "ls snacks",
            typeFrames: 8,
            outDelay: 2,
            out: [red(NOFILE)],
          },
        ]}
      />
      <IconNote icon="trash" at={T.noUndo} until={T.type1 - 4} x={TX} y={RM_P2 + 30}>
        {"No undo.\nNo trash can."}
      </IconNote>
      <Pane
        at={T.type1}
        until={out}
        pane={2}
        y={RM_P2}
        h={RM_H2}
        title="instead"
        blocks={[
          { at: T.rmri + 2, cmd: "rm -rI snacks/", typeFrames: 14 },
          { at: T.asks - 2, out: [ASK] }, // rm waits for an answer: no prompt yet
          {
            at: T.sayNo + 8,
            cmd: "ls snacks",
            typeFrames: 8,
            outDelay: Math.max(2, T.survive - (T.sayNo + 16)),
            out: [SNACKS],
          },
        ]}
      />
      <TypedAt at={T.sayNo} until={out + 9} y={RM_P2} line={1} col={ASK.length} text="n" />
      <Circle at={T.asks + 4} until={T.sayNo + 8} {...ring(RM_P2, 1, 0, ASK.length + 1)} />
      <Circle at={T.survive} until={out} {...ring(RM_P2, 3, 0, SNACKS.length)} />
      <IconNote icon="question" at={T.folder} until={out} x={TX} y={band}>
        {"Asks once: a folder,\nor more than 3 files"}
      </IconNote>
      <Sticker src="raccoon/celebrate.png" at={T.survive} until={out} x={TX + 660} y={band + 6} w={200} fadeBottom={40} />
    </>
  );
};

// ---------------- 2/5 chmod 777 → chmod u+x ----------------
const DENIED = "bash: ./snack.sh: Permission denied";
const LS = (perm: string) => `-${perm} 1 sudo sudo 30 Oct 13 03:07 snack.sh`;
const CH_H1 = rowsH(6);
const CH_P2 = p2Of(CH_H1);
const CH_H2 = rowsH(6);
const Chmod: React.FC<{ T: Cues }> = ({ T }) => {
  const out = T.t3 - 8;
  const lsAt = T.every - 12;
  const lsAt2 = T.you2 - 12;
  return (
    <>
      <Pane
        at={T.t2}
        until={out}
        dimAt={T.use}
        y={P1}
        h={CH_H1}
        title="3:07 am"
        blocks={[
          {
            at: T.t2,
            cmd: "./snack.sh",
            typeFrames: 6,
            outDelay: 2,
            out: [red(DENIED)],
          },
          {
            at: T.c777 + 8,
            cmd: "chmod 777 snack.sh",
            typeFrames: 18,
            out: [],
          },
          {
            at: lsAt,
            cmd: "ls -l snack.sh",
            typeFrames: 10,
            outDelay: 2,
            out: [[{ t: "-" }, { t: "rwxrwxrwx", c: TERM.red, b: true }, { t: LS("rwxrwxrwx").slice(10) }]],
          },
        ]}
      />
      <Circle at={T.permission} until={lsAt + 8} {...ring(P1, 1, 0, DENIED.length)} />
      <Circle at={T.read} until={T.use} {...ring(P1, 4, 1, 9)} />
      <Annotate
        text="rwx  rwx  rwx"
        at={T.user - 4}
        until={T.use - 4}
        x={TX}
        y={CH_P2 + 24}
        size={64}
        segments={[
          { from: 0, to: 3, label: "you", at: T.user - 2 },
          { from: 5, to: 8, label: "group", at: T.user + 4 },
          { from: 10, to: 13, label: "everyone", at: T.user + 10, color: RED },
        ]}
        focus={{ index: 2, at: T.read }}
      />
      <IconNote icon="users" at={T.raccoon} until={T.use - 4} x={TX} y={CH_P2 + 300}>
        {"Every raccoon in the\nneighborhood moved in."}
      </IconNote>
      <Sticker src="raccoon/duo-bowl.png" at={T.raccoon} until={T.use - 4} x={TX + 630} y={CH_P2 + 20} w={260} />
      <Pane
        at={T.use}
        until={out}
        pane={2}
        y={CH_P2}
        h={CH_H2}
        title="instead"
        blocks={[
          { at: T.cux + 4, cmd: "chmod u+x snack.sh", typeFrames: 18, out: [] },
          {
            at: lsAt2,
            cmd: "ls -l snack.sh",
            typeFrames: 10,
            outDelay: 2,
            out: [[{ t: "-" }, { t: "rwx", c: TERM.green, b: true }, { t: "r--r--" }, { t: LS("rwxr--r--").slice(10) }]],
          },
          {
            at: T.nobody - 4,
            cmd: "./snack.sh",
            typeFrames: 6,
            outDelay: Math.max(2, T.change2 - (T.nobody + 2)),
            out: [green("snacks: safe")],
          },
        ]}
      />
      <Circle at={T.you2 + 4} until={T.nobody} {...ring(CH_P2, 2, 1, 3)} />
      <Circle at={T.nobody + 2} until={out} {...ring(CH_P2, 2, 4, 6)} />
    </>
  );
};

// ---------------- 3/5 kill -9 → kill ----------------
const job = (status: string, cmd: string) => `[1]+  ${status.padEnd(27)}${cmd}`; // bash's job notice layout
const KILL_QUOTE =
  "If a process does not terminate after a TERM signal has been sent, then the KILL signal may be used; be aware that the latter signal cannot be caught, and so does not give the target process the opportunity to perform any clean-up before terminating.";
const KI_H1 = rowsH(3);
const KI_P2 = p2Of(KI_H1);
const KI_H2 = rowsH(4);
const Kill: React.FC<{ T: Cues }> = ({ T }) => {
  const out = T.t4 - 8;
  const band = KI_P2 + KI_H2 + 30;
  return (
    <>
      <Pane
        at={T.t3}
        until={out}
        dimAt={T.plain}
        y={P1}
        h={KI_H1}
        title="3:07 am"
        blocks={[
          {
            at: T.kill9 + 2,
            cmd: "kill -9 4821",
            typeFrames: 12,
            outDelay: Math.max(2, T.ends - (T.kill9 + 14)),
            out: [red(job("Killed", "./snackd"))],
          },
        ]}
      />
      <DocsQuote
        at={T.the3 - 6}
        until={T.plain - 6}
        site="man kill"
        url="man7.org/linux/man-pages/man1/kill.1.html"
        quote={KILL_QUOTE}
        highlight="cannot be caught"
        highlightAt={T.catch}
        verifiedAt={T.saved}
        verifiedLabel="no clean-up, nothing saved"
        y={KI_P2 + 10}
        size={34}
      />
      <Pane
        at={T.plain}
        until={out}
        pane={2}
        y={KI_P2}
        h={KI_H2}
        title="instead"
        blocks={[
          {
            at: T.kill + 2,
            cmd: "kill 4822",
            typeFrames: 10,
            outDelay: Math.max(2, T.save1 - (T.kill + 12)),
            out: [green("saving snacks.db... bye"), job("Done", "./snackd")],
          },
        ]}
      />
      <Circle at={T.save1 + 4} until={out} {...ring(KI_P2, 1, 0, 23)} />
      <IconNote icon="warning" at={T.keep} until={out} x={TX} y={band} tint={RED}>
        {"kill -9 only when\nit ignores you"}
      </IconNote>
      <Sticker src="raccoon/side-eye.png" at={T.ignores} until={out} x={TX + 600} y={band + 20} w={300} fadeBottom={60} />
    </>
  );
};

// ---------------- 4/5 retyping → sudo !! ----------------
const DENIED2 = "touch: cannot touch '/etc/snacks': Permission denied";
const SU_H1 = rowsH(3);
const SU_P2 = p2Of(SU_H1);
const SU_H2 = rowsH(5);
const Sudo: React.FC<{ T: Cues }> = ({ T }) => {
  const out = T.t5 - 8;
  const band = SU_P2 + SU_H2 + 30;
  return (
    <>
      <Pane
        at={T.t4}
        until={out}
        dimAt={T.type2}
        y={P1}
        h={SU_H1}
        title="3:07 am"
        blocks={[
          {
            at: T.forgot - 6,
            cmd: "touch /etc/snacks",
            typeFrames: 12,
            outDelay: 2,
            out: [red(DENIED2)],
          },
          { at: T.retype - 4, cmd: "sudo touch /etc/snacks", typeFrames: 44 },
        ]}
      />
      <IconNote icon="refresh" at={T.retype} until={T.type2 - 4} x={TX} y={SU_P2 + 30}>
        {"Typing it all again…"}
      </IconNote>
      <Pane
        at={T.type2}
        until={out}
        pane={2}
        y={SU_P2}
        h={SU_H2}
        title="instead"
        blocks={[
          {
            at: T.type2 - 20,
            cmd: "touch /etc/snacks",
            typeFrames: 1,
            outDelay: 0,
            out: [red(DENIED2)],
          },
          {
            at: T.sudoBang + 2,
            cmd: "sudo !!",
            typeFrames: 10,
            outDelay: Math.max(2, T.bang - (T.sudoBang + 12)),
            out: ["sudo touch /etc/snacks"],
          },
        ]}
      />
      <Circle at={T.bang} until={T.lastCmd} {...ring(SU_P2, 2, PROMPT_COLS + 5, 2)} />
      <Circle at={T.lastCmd} until={out} {...ring(SU_P2, 3, 0, 22)} />
      <Note at={T.bang + 6} until={T.works} x={TX} y={band} font="mono" size={38}>
        !! = your last command
      </Note>
      <IconNote icon="check" at={T.works} until={out} x={TX} y={band}>
        Works in bash and zsh
      </IconNote>
      <Sticker src="raccoon/driving.png" at={T.root} until={out} x={TX + 520} y={band + 110} w={360} />
    </>
  );
};

// ---------------- 5/5 history | grep → ctrl + r ----------------
const HIST: Line[] = [
  [{ t: "  389  ", c: TERM.dim }, { t: "ssh -p 2222 sudo@trash-can" }],
  [{ t: "  501  ", c: TERM.dim }, { t: "ssh sudo@snack-server" }],
  [{ t: "  514  ", c: TERM.dim }, { t: "history | grep ssh" }],
];
const MATCH_NEW = "ssh sudo@snack-server";
const MATCH_OLD = "ssh -p 2222 sudo@trash-can";
const HI_H1 = rowsH(5);
const HI_P2 = p2Of(HI_H1);
const HI_H2 = rowsH(3);

// bash's incremental search line: (reverse-i-search)`ssh': <match>, typed on cue (checked in a pty, 2026-10-13)
const ReverseSearch: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 15) % 2 === 0;
  const cur = (on: boolean) => <span style={{ background: on ? TERM.fg : "transparent" }}> </span>;
  const prompt = (
    <>
      <span style={{ color: TERM.blue, fontWeight: 700 }}>~ </span>
      <span style={{ color: TERM.green, fontWeight: 700 }}>$ </span>
    </>
  );
  if (frame < T.ctrlr) {
    return (
      <div style={{ whiteSpace: "pre" }}>
        {prompt}
        {cur(blink)}
      </div>
    );
  }
  if (frame >= T.enter) {
    const p = prog(frame, T.enter + 8, 5);
    return (
      <div style={{ whiteSpace: "pre" }}>
        <div>
          {prompt}
          {MATCH_OLD}
        </div>
        {frame >= T.enter + 8 ? <div style={{ opacity: p, translate: `0px ${(1 - p) * 8}px` }}>sudo@trash-can's password: {cur(blink)}</div> : null}
      </div>
    );
  }
  const n = Math.max(0, Math.min(3, Math.floor((frame - T.typing) / 3) + 1));
  const q = "ssh".slice(0, frame < T.typing ? 0 : n);
  const match = q.length === 0 ? "" : frame >= T.again ? MATCH_OLD : MATCH_NEW;
  return (
    <div style={{ whiteSpace: "pre" }}>
      <span style={{ color: TERM.dim }}>(reverse-i-search)`</span>
      <span style={{ color: TERM.yellow, fontWeight: 700 }}>{q}</span>
      <span style={{ color: TERM.dim }}>': </span>
      <span>{match}</span>
      {cur(true)}
    </div>
  );
};

const History: React.FC<{ T: Cues }> = ({ T }) => {
  const out = T.save - 8;
  const band = HI_P2 + HI_H2 + 30;
  const qCols = "(reverse-i-search)`ssh': ".length;
  return (
    <>
      <Pane
        at={T.t5}
        until={out}
        dimAt={T.just}
        y={P1}
        h={HI_H1}
        title="3:07 am"
        blocks={[
          {
            at: T.hgrep + 2,
            cmd: "history | grep ssh",
            typeFrames: 16,
            outDelay: 2,
            out: HIST,
          },
        ]}
      />
      <Pane at={T.just} until={out} pane={2} y={HI_P2} h={HI_H2} title="instead">
        <ReverseSearch T={T} />
      </Pane>
      <Circle at={T.matching} until={T.again} {...ring(HI_P2, 0, qCols, MATCH_NEW.length)} />
      <Circle at={T.again + 4} until={T.enter} {...ring(HI_P2, 0, qCols, MATCH_OLD.length)} />
      <KeyCombo keys={["ctrl", "r"]} at={T.press} press={T.ctrlr} until={T.press2 - 2} x={TX} y={band} />
      <KeyCombo keys={["ctrl", "r"]} at={T.press2} press={T.again} until={T.enter - 4} x={TX} y={band} />
      <KeyCombo keys={["enter"]} at={T.enter - 4} press={T.enter} until={out} x={TX} y={band} />
      <Sticker src="raccoon/sneaking.png" at={T.typing} until={out} x={W - 380} y={band - 10} w={380} from="right" />
    </>
  );
};

export const LinuxMistakes: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <Win from={0} to={T.story}>
        <Hook T={T} />
      </Win>
      <Win from={T.story} to={T.t1}>
        <Story T={T} />
      </Win>
      <Win from={T.t1} to={T.t2}>
        <Rm T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <Chmod T={T} />
      </Win>
      <Win from={T.t3} to={T.t4}>
        <Kill T={T} />
      </Win>
      <Win from={T.t4} to={T.t5}>
        <Sudo T={T} />
      </Win>
      <Win from={T.t5} to={T.save}>
        <History T={T} />
      </Win>

      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.save}
        tools={[
          {
            from: T.t1,
            name: "rm -rf",
            repo: "no undo, no trash can",
            n: 1,
            of: 5,
          },
          {
            from: T.rmri,
            name: RM_RI,
            repo: "asks once before it deletes",
            n: 1,
            of: 5,
          },
          {
            from: T.t2,
            name: "chmod 777",
            repo: "every user can change your file",
            n: 2,
            of: 5,
          },
          {
            from: T.cux,
            name: "chmod u+x",
            repo: "you can run it, nobody else can change it",
            n: 2,
            of: 5,
          },
          {
            from: T.t3,
            name: "kill -9",
            repo: "can't be caught, nothing gets saved",
            n: 3,
            of: 5,
          },
          {
            from: T.kill,
            name: "kill",
            repo: "asks it to stop, so it can clean up",
            n: 3,
            of: 5,
          },
          {
            from: T.t4,
            name: "retyping",
            repo: "the whole command again, with sudo",
            n: 4,
            of: 5,
          },
          {
            from: T.sudoBang,
            name: "sudo !!",
            repo: "your last command, as root",
            n: 4,
            of: 5,
          },
          {
            from: T.t5,
            name: "history | grep",
            repo: "scrolling through old commands",
            n: 5,
            of: 5,
          },
          {
            from: T.ctrlr,
            name: "ctrl + r",
            repo: "search your history as you type",
            n: 5,
            of: 5,
          },
        ]}
      />

      <SaveOutro
        at={T.save}
        h={Math.round(5 * 1.38 * 30 + 148)}
        fontSize={30}
        lines={cheatLines(
          [
            ["rm -rI", "asks before it deletes"],
            ["chmod u+x", "not chmod 777"],
            ["kill", "kill -9 only if stuck"],
            ["sudo !!", "last command as root"],
            ["ctrl + r", "search your history"],
          ],
          11,
        )}
        question={"Which command\nburned you?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="Which command burned you?" line="Follow for more Linux tricks." />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("linux-mistakes/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.t1, T.t2, T.t3, T.t4, T.t5, T.save, T.follow]} />
      <Sfx
        name="mouse-click"
        at={[T.rmrf + 2, T.type1, T.rmri + 2, T.c777 + 8, T.cux + 4, T.kill9 + 2, T.kill + 2, T.retype - 4, T.sudoBang + 2, T.hgrep + 2]}
      />
      <Sfx name="switch" at={[T.ctrlr, T.again, T.enter]} />
      <Sfx name="ding" at={[T.survive, T.change2, T.save1, T.lastCmd, T.again + 4]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 620;
const CFS = 36;
export const LinuxMistakesCover: React.FC = () => {
  const ch = Math.round(WRONG.length * 1.38 * CFS + 148);
  return (
    <Cover title="5 Linux commands" sub="you're using wrong." size={96} chips={["rm -rI", "chmod u+x", "kill", "sudo !!"]}>
      <Terminal x={CX} y={CTY} w={CW} h={ch} fontSize={CFS} title="3:07 am">
        {WRONG.map((c, i) => (
          <div key={i} style={{ whiteSpace: "pre", minHeight: "1.38em" }}>
            <Segs line={promptLine(c)} />
          </div>
        ))}
      </Terminal>
      {WRONG.map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: CX + CW - 28 - 50,
            top: termLineY(CTY, i, CFS) + (CFS * 1.38 - 50) / 2,
          }}
        >
          <Mark kind="cross" size={50} color={RED} />
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: CX + 560,
          top: CTY + 34 - 240,
          width: 340,
          height: 240,
          overflow: "hidden",
        }}
      >
        <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={320} from="below" shadow={false} />
      </div>
    </Cover>
  );
};
