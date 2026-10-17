import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Composition, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Captions } from "../../components/Captions";
import { Cover, CoverStill, CW, CX } from "../../components/Cover";
import { Circle, Note, Sticker, TrashCan } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Headline } from "../../components/Headline";
import { PeekOver } from "../../components/PeekOver";
import { cheatLines, SaveOutro } from "../../components/SaveOutro";
import { dir, dim, file, Terminal, termRing, type Block } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { Arrow } from "../../components/diagram/Arrow";
import { FolderTree } from "../../components/diagram/FolderTree";
import { anchors, Node } from "../../components/diagram/Node";
import { GREEN, RED } from "../../components/layouts/Mark";
import { Vanish } from "../../components/layouts/Vanish";
import { FinderWindow } from "../../components/windows/FinderWindow";
import { Icon, type IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { makeCues } from "../../lib/cues";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { C, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/terminal-basics/captions.json";

// The 8 terminal commands that do 90% of the work: pwd, ls, cd, mkdir, touch, cp, mv, rm.
// Facts + sources (POSIX / Apple man pages + local scratch verification, 2026-10-13):
// SudoRaccoon/Videos/terminal-basics.md → Facts checked (2026-10-13).

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

export const TerminalBasicsComposition = () => (
  <>
    <Composition id="TerminalBasics" component={TerminalBasics} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="TerminalBasicsCover" component={TerminalBasicsCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      these: at("these"),
      story: at("sudo"),
      moving: at("moving"),
      trash: at("trash"),
      // 1/8 pwd
      t1: at("one"),
      pwd: at("pwd"),
      print: at("print"),
      standing: at("standing"),
      userssudo: at("userssudo"),
      // 2/8 ls
      t2: at("two"),
      ls: at("ls"),
      shows: at("shows"),
      la: at("-la"),
      lsla: at("ls-la"),
      sizes: at("sizes"),
      dates: at("dates"),
      hidden: at("hidden"),
      zshrc: at("zshrc"),
      // 3/8 cd
      t3: at("three"),
      cd: at("cd"),
      cddesktop: at("cddesktop"),
      inside: at("inside"),
      cddot: at("cd", 2),
      back: at("back"),
      cdtilde: at("cd", 3),
      home: at("home"),
      // 4/8 mkdir
      t4: at("four"),
      mkdir: at("mkdir"),
      mkdirtrash: at("mkdirtrash-can"),
      fresh: at("fresh"),
      dashp: at("-p"),
      nested: at("nested"),
      // 5/8 touch
      t5: at("five"),
      touch: at("touch"),
      touchsnacks: at("touchsnackstxt"),
      empty: at("empty"),
      // 6/8 cp
      t6: at("six"),
      cp: at("cp"),
      cpsnacks: at("cpsnackstxtbackuptxt"),
      copying: at("copying"),
      dashr: at("-r"),
      // 7/8 mv
      t7: at("seven"),
      mv: at("mv"),
      jobs: at("jobs"),
      mvsnacks: at("mvsnackstxttrash-can"),
      moves: at("moves"),
      mvbackup: at("mvbackuptxtpizzatxt"),
      renames: at("renames"),
      // 8/8 rm
      t8: at("eight", 2),
      rm: at("rm"),
      careful: at("careful"),
      rmpizza: at("rmpizzatxt"),
      trashBin: at("trash", 2),
      deletes: at("deletes"),
      dig: at("dig"),
      dashi: at("-i"),
      rmi: at("rm-i"),
      asks: at("asks"),
      // outro
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

// window height for `rows` text rows (the body loses ~148 px to title bar + padding)
const termH = (rows: number, fs: number) => Math.ceil(rows * fs * 1.38 + 150);

const CHEAT_ROWS: [string, string][] = [
  ["pwd", "where am I?"],
  ["ls -la", "list all (even .files)"],
  ["cd .. / ~", "step back / go home"],
  ["mkdir -p", "make folder(s)"],
  ["touch", "new empty file"],
  ["cp -r", "copy file or folder"],
  ["mv", "move or rename"],
  ["rm -i", "delete (asks first)"],
];

// ---------------- Hook (0 - 6.2s) ----------------
const HOOK_TY = 540;
const HOOK_FS = 26;
const HOOK_TH = termH(5, HOOK_FS);
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="100 terminal commands?" b="These 8 do most of it." bAt={T.these - 4} until={T.story} size={72} />
    <Terminal
      x={TX}
      y={HOOK_TY}
      w={TW}
      h={HOOK_TH}
      fontSize={HOOK_FS}
      title="sudo@laptop: ~"
      blocks={[
        {
          at: -100,
          out: cheatLines(
            [
              ["pwd · ls", "where am I & what's here"],
              ["cd", "move around folders"],
              ["mkdir · touch", "create folders & files"],
              ["cp · mv", "copy, move & rename"],
              ["rm", "delete for good"],
            ],
            16,
          ),
        },
      ]}
    />
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 590} edgeY={HOOK_TY} w={290} h={220} overhang={34} />
    <Note at={-100} x={TX} y={HOOK_TY + HOOK_TH + 30} font="mono" size={30}>
      pwd · ls · cd · mkdir · touch · cp · mv · rm
    </Note>
    <IconNote icon="check" tint={GREEN} at={T.these} y={HOOK_TY + HOOK_TH + 142}>
      Built into macOS & Linux.
    </IconNote>
  </>
);

// ---------------- Story: Sudo moves into a new trash can (6.2 - 11.8s) ----------------
const STORY_TY = 430;
const STORY_TH = termH(3, 30);
const Story: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="First day in the terminal." b="Moving into a new trash can." at={T.story} bAt={T.moving - 4} size={66} />
    <Terminal x={TX} y={STORY_TY} w={TW} h={STORY_TH} fontSize={30} enterAt={T.story} blocks={[{ at: T.story + 900, cmd: "" }]} />
    <TrashCan at={T.moving - 4} x={TX + 70} y={760} />
    <IconNote icon="house" at={T.trash - 6} x={TX} y={1020}>
      {"Home sweet\ntrash can."}
    </IconNote>
    <Sticker src="raccoon/baby-glove.png" at={T.story + 6} x={TX + 560} y={750} w={320} fadeBottom={70} />
  </>
);

// ---------------- 1/8 pwd ----------------
const PWD_FS = 30;
const PWD_H = termH(3, PWD_FS);
const PwdBeat: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(12, T.print - T.pwd - 8);
  const outPath = "/Users/sudo";
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={PWD_H}
        fontSize={PWD_FS}
        enterAt={T.t1}
        blocks={[{ at: T.pwd, cmd: "pwd", typeFrames: tf, out: [[{ t: outPath, b: true }]] }]}
      />
      <Circle at={T.userssudo - 6} {...termRing(TX, TY, PWD_FS, 1, 0, outPath.length)} />
      <FolderTree
        x={TX + 20}
        y={TY + PWD_H + 34}
        w={560}
        rowH={62}
        size={30}
        at={T.print}
        items={[
          { path: "/", desc: "root" },
          { path: "/Users", desc: "home folders" },
          { path: "/Users/sudo", desc: "you are here" },
        ]}
        highlight={[{ path: "/Users/sudo", at: T.standing }]}
      />
      <IconNote icon="folder" at={T.standing} y={985}>
        {"Shows the exact folder\nyou're standing in."}
      </IconNote>
      <Sticker src="raccoon/pointing.png" at={T.userssudo - 6} x={TX + 630} y={760} w={250} />
    </>
  );
};

// ---------------- 2/8 ls + ls -la ----------------
const LS_FS = 22;
const LS_H = termH(9, LS_FS);
const LS_NOTE_Y = TY + LS_H + 34;
const LS_DOT_ROW = "-rw-r--r--  1 sudo  staff   420 Oct 13 09:10 .zshrc";
const LsBeat: React.FC<{ T: Cues }> = ({ T }) => {
  const blocks: Block[] = [
    {
      at: T.ls,
      cmd: "ls",
      typeFrames: 10,
      out: [[{ ...dir("Desktop"), t: "Desktop    " }, { ...dir("Downloads"), t: "Downloads    " }, file("notes.txt")]],
    },
    {
      at: T.lsla - 6,
      cmd: "ls -la",
      typeFrames: 16,
      out: [
        dim("total 16"),
        "drwxr-xr-x  5 sudo  staff   160 Oct 13 09:12 .",
        "drwxr-xr-x  4 root  admin   128 Oct 11 08:00 ..",
        [{ t: LS_DOT_ROW, c: TERM.green, b: true }],
        "drwxr-xr-x  3 sudo  staff    96 Oct 13 09:11 Desktop",
        "-rw-r--r--  1 sudo  staff  1024 Oct 13 09:12 notes.txt",
      ],
    },
  ];
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={LS_H} fontSize={LS_FS} enterAt={T.t2} blocks={blocks} />
      <Circle at={T.sizes} until={T.dates - 2} {...termRing(TX, TY, LS_FS, 4, 26, 5, 5)} />
      <Circle at={T.dates} until={T.hidden - 2} {...termRing(TX, TY, LS_FS, 4, 32, 12, 5)} />
      <Circle at={T.hidden} {...termRing(TX, TY, LS_FS, 6, 0, LS_DOT_ROW.length)} />
      <IconNote icon="folder" at={T.shows} until={T.la} y={LS_NOTE_Y}>
        {"Files and folders\nin this directory"}
      </IconNote>
      <IconNote icon="search" at={T.la} until={T.hidden} y={LS_NOTE_Y}>
        {"-l = sizes & dates\n-a = show everything"}
      </IconNote>
      <IconNote icon="eye" at={T.hidden} y={LS_NOTE_Y}>
        {"Starts with a dot (.zshrc)\n= hidden file"}
      </IconNote>
      <Sticker src="raccoon/peek-pillar.png" at={T.hidden} x={W - 210} y={840} w={210} from="right" />
    </>
  );
};

// ---------------- 3/8 cd ----------------
const CD_FS = 25;
const CD_H = termH(7, CD_FS);
const CD_TREE_Y = TY + CD_H + 28;
const CdBeat: React.FC<{ T: Cues }> = ({ T }) => {
  const blocks: Block[] = [
    { at: T.cddesktop - 4, cmd: "cd Desktop", typeFrames: 16, out: [dim("→ /Users/sudo/Desktop")] },
    { at: T.cddot - 4, cmd: "cd ..", typeFrames: 12, out: [dim("→ /Users/sudo")] },
    { at: T.cdtilde - 4, cmd: "cd ~", typeFrames: 12, out: [[{ t: "→ /Users/sudo (home)", c: TERM.green, b: true }]] },
  ];
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={CD_H} fontSize={CD_FS} enterAt={T.t3} blocks={blocks} />
      <Circle at={T.cddot + 6} until={T.cdtilde - 4} {...termRing(TX, TY, CD_FS, 2, 4, "cd ..".length)} />
      <Circle at={T.cdtilde + 6} {...termRing(TX, TY, CD_FS, 4, 4, "cd ~".length)} />
      <FolderTree
        x={TX + 16}
        y={CD_TREE_Y}
        w={520}
        descX={280}
        rowH={58}
        size={28}
        at={T.cd}
        items={[
          { path: "~", desc: "/Users/sudo (home)" },
          { path: "~/Desktop", desc: "step inside" },
          { path: "~/Downloads", desc: "other folder" },
        ]}
        highlight={[
          { path: "~", at: T.cd },
          { path: "~/Desktop", at: T.inside - 4 },
          { path: "~", at: T.back - 4 },
          { path: "~", at: T.home - 4 },
        ]}
      />
      <IconNote icon="arrowRight" at={T.inside - 4} until={T.cddot} y={1040}>
        cd Desktop → step in
      </IconNote>
      <IconNote icon="refresh" at={T.cddot} until={T.cdtilde} y={1040}>
        cd .. → one level up
      </IconNote>
      <IconNote icon="house" tint={GREEN} at={T.cdtilde} y={1040}>
        cd ~ → straight home
      </IconNote>
      <Sticker src="raccoon/pointing.png" at={T.inside} x={TX + 640} y={850} w={230} flip />
    </>
  );
};

// ---------------- 4/8 mkdir ----------------
const MK_FS = 25;
const MK_H = termH(5, MK_FS);
const MK_FINDER_Y = TY + MK_H + 28;
const MkdirBeat: React.FC<{ T: Cues }> = ({ T }) => {
  const blocks: Block[] = [
    { at: T.mkdirtrash - 4, cmd: "mkdir trash-can", typeFrames: 18, out: [dir("trash-can/")] },
    { at: T.dashp - 2, cmd: "mkdir -p trash-can/snacks", typeFrames: 22, out: [dir("trash-can/snacks/")] },
  ];
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={MK_H} fontSize={MK_FS} enterAt={T.t4} blocks={blocks} />
      <Circle at={T.dashp + 6} {...termRing(TX, TY, MK_FS, 2, 4, "mkdir -p".length)} />
      <FinderWindow
        x={TX}
        y={MK_FINDER_Y}
        w={TW}
        h={295}
        title="sudo"
        at={T.t4 + 4}
        iconSize={92}
        items={[
          { name: "Desktop", kind: "folder" },
          { name: "trash-can", kind: "folder", at: T.fresh - 6 },
          { name: "snacks", kind: "folder", at: T.nested - 4 },
        ]}
        select={[
          { name: "trash-can", at: T.fresh },
          { name: "snacks", at: T.nested },
        ]}
      />
      <IconNote icon="folder" at={T.dashp} y={MK_FINDER_Y + 315}>
        {"-p builds nested\nfolders in one go"}
      </IconNote>
      <Sticker src="raccoon/celebrate.png" at={T.fresh} x={TX + 630} y={960} w={250} fadeBottom={60} />
    </>
  );
};

// ---------------- 5/8 touch ----------------
const TCH_FS = 28;
const TCH_H = termH(3, TCH_FS);
const TCH_FINDER_Y = TY + TCH_H + 32;
const TouchBeat: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Terminal
      x={TX}
      y={TY}
      w={TW}
      h={TCH_H}
      fontSize={TCH_FS}
      enterAt={T.t5}
      blocks={[
        {
          at: T.touchsnacks - 4,
          cmd: "touch snacks.txt",
          typeFrames: 18,
          out: [[file("snacks.txt"), dim("  0 bytes (empty)")]],
        },
      ]}
    />
    <Circle at={T.empty - 4} {...termRing(TX, TY, TCH_FS, 1, 0, "snacks.txt".length + 2)} />
    <FinderWindow
      x={TX}
      y={TCH_FINDER_Y}
      w={TW}
      h={300}
      title="sudo"
      at={T.t5 + 4}
      iconSize={94}
      items={[
        { name: "Desktop", kind: "folder" },
        { name: "trash-can", kind: "folder" },
        { name: "snacks.txt", kind: "file", ext: "TXT", at: T.touchsnacks + 16 },
      ]}
      select={[{ name: "snacks.txt", at: T.empty }]}
    />
    <IconNote icon="file" at={T.empty - 4} y={TCH_FINDER_Y + 322}>
      {"Instant empty file\non the spot"}
    </IconNote>
    <Sticker src="raccoon/scheming.png" at={T.touchsnacks} x={TX + 650} y={995} w={220} />
  </>
);

// ---------------- 6/8 cp ----------------
const CP_FS = 25;
const CP_H = termH(5, CP_FS);
const CP_FINDER_Y = TY + CP_H + 28;
const CpBeat: React.FC<{ T: Cues }> = ({ T }) => {
  const blocks: Block[] = [
    {
      at: T.cpsnacks - 4,
      cmd: "cp snacks.txt backup.txt",
      typeFrames: 24,
      out: [[file("snacks.txt"), dim("  →  "), file("backup.txt")]],
    },
    {
      at: T.dashr - 6,
      cmd: "cp -r trash-can backups",
      typeFrames: 20,
      out: [[dir("trash-can/"), dim("  →  "), dir("backups/")]],
    },
  ];
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={CP_H} fontSize={CP_FS} enterAt={T.t6} blocks={blocks} />
      <Circle at={T.dashr} {...termRing(TX, TY, CP_FS, 2, 4, "cp -r".length)} />
      <FinderWindow
        x={TX}
        y={CP_FINDER_Y}
        w={TW}
        h={295}
        title="sudo"
        at={T.t6 + 4}
        iconSize={90}
        items={[
          { name: "snacks.txt", kind: "file", ext: "TXT" },
          { name: "backup.txt", kind: "file", ext: "TXT", at: T.cpsnacks + 26 },
          { name: "trash-can", kind: "folder" },
          { name: "backups", kind: "folder", at: T.dashr + 12 },
        ]}
        select={[
          { name: "backup.txt", at: T.cpsnacks + 28 },
          { name: "backups", at: T.dashr + 14 },
        ]}
      />
      <IconNote icon="clipboard" at={T.cp} until={T.copying} y={CP_FINDER_Y + 315}>
        {"cp snacks.txt\nbackup.txt"}
      </IconNote>
      <IconNote icon="folder" at={T.copying} y={CP_FINDER_Y + 315}>
        {"Whole folder?\nAdd -r"}
      </IconNote>
      <Sticker src="raccoon/duo-bowl.png" at={T.cpsnacks + 22} x={TX + 620} y={1000} w={260} />
    </>
  );
};

// ---------------- 7/8 mv ----------------
const MV_FS = 25;
const MV_H = termH(5, MV_FS);
const MV_ROW1_Y = TY + MV_H + 95;
const MV_ROW2_Y = MV_ROW1_Y + 135;
const MV_LEFT_X = TX + 170;
const MV_RIGHT_X = TX + 690;
const MV_NODE_W = 280;
const MvBeat: React.FC<{ T: Cues }> = ({ T }) => {
  const blocks: Block[] = [
    { at: T.mvsnacks - 4, cmd: "mv snacks.txt trash-can/", typeFrames: 24, out: [dim("moved → trash-can/snacks.txt")] },
    {
      at: T.mvbackup - 4,
      cmd: "mv backup.txt pizza.txt",
      typeFrames: 24,
      out: [[{ t: "renamed → pizza.txt", c: TERM.green, b: true }]],
    },
  ];
  const n1L = { x: MV_LEFT_X, y: MV_ROW1_Y, w: MV_NODE_W, h: 100 };
  const n1R = { x: MV_RIGHT_X, y: MV_ROW1_Y, w: MV_NODE_W, h: 100 };
  const n2L = { x: MV_LEFT_X, y: MV_ROW2_Y, w: MV_NODE_W, h: 100 };
  const n2R = { x: MV_RIGHT_X, y: MV_ROW2_Y, w: MV_NODE_W, h: 100 };
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={MV_H} fontSize={MV_FS} enterAt={T.t7} blocks={blocks} />
      <Circle at={T.moves} until={T.mvbackup - 4} {...termRing(TX, TY, MV_FS, 0, 18, "trash-can/".length)} />
      <Circle at={T.renames - 4} {...termRing(TX, TY, MV_FS, 2, 18, "pizza.txt".length)} />

      {/* Job 1: move into a folder */}
      <Node {...n1L} icon="file" label="snacks.txt" size={28} at={T.jobs} states={[{ at: T.moves, state: "dim" }]} />
      <Node {...n1R} icon="folder" label="trash-can/" size={28} at={T.jobs + 4} states={[{ at: T.moves, state: "ok" }]} />
      <Arrow at={T.mvsnacks + 8} from={anchors(n1L).right} to={anchors(n1R).left} active={T.moves} label="move" />

      {/* Job 2: rename in place */}
      <Node {...n2L} icon="file" label="backup.txt" size={28} at={T.mvbackup} states={[{ at: T.renames, state: "dim" }]} />
      <Node {...n2R} icon="pizza" label="pizza.txt" size={28} at={T.mvbackup + 4} states={[{ at: T.renames, state: "ok" }]} />
      <Arrow at={T.mvbackup + 16} from={anchors(n2L).right} to={anchors(n2R).left} active={T.renames - 4} label="rename" />

      <IconNote icon="arrowRight" at={T.moves} until={T.mvbackup} y={1115}>
        {"Job 1: move into\na folder"}
      </IconNote>
      <IconNote icon="check" tint={GREEN} at={T.renames - 8} y={1115}>
        {"Job 2: rename in\nthe same place"}
      </IconNote>
      <Sticker src="raccoon/crepe.png" at={T.renames - 4} x={TX + 620} y={1055} w={260} />
    </>
  );
};

// ---------------- 8/8 rm ----------------
const RM_FS = 25;
const RM_H = termH(6, RM_FS);
const RM_NOTE_Y = 1045;
const RmBeat: React.FC<{ T: Cues }> = ({ T }) => {
  const blocks: Block[] = [
    {
      at: T.rmpizza - 4,
      cmd: "rm pizza.txt",
      typeFrames: 16,
      out: [[{ t: "gone forever (skips Trash)", c: TERM.red, b: true }]],
    },
    {
      at: T.rmi - 6,
      cmd: "rm -i notes.txt",
      typeFrames: 16,
      out: [
        [
          { t: "remove notes.txt? ", c: TERM.yellow, b: true },
          { t: "n", c: TERM.green, b: true },
        ],
      ],
    },
  ];
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={RM_H} fontSize={RM_FS} enterAt={T.t8} blocks={blocks} />
      <Circle at={T.deletes} until={T.dashi} {...termRing(TX, TY, RM_FS, 1, 0, "gone forever (skips Trash)".length)} />
      <Circle at={T.asks} {...termRing(TX, TY, RM_FS, 3, 0, "remove notes.txt? n".length)} />

      <Vanish
        at={T.careful}
        suck={T.deletes - 4}
        x={TX + 70}
        y={860}
        holeX={TX + 410}
        holeY={895}
        text="pizza.txt"
        label="no Trash · gone forever"
        until={T.dashi}
      />

      <IconNote icon="warning" tint={RED} at={T.trashBin} until={T.dig} y={RM_NOTE_Y}>
        No Trash or Recycle Bin.
      </IconNote>
      <IconNote icon="trash" tint={RED} at={T.dig} until={T.dashi} y={RM_NOTE_Y}>
        {"Even Sudo can't\ndig it back out."}
      </IconNote>
      <IconNote icon="shieldCheck" tint={GREEN} at={T.dashi} y={RM_NOTE_Y}>
        {"rm -i asks you\nbefore deleting"}
      </IconNote>

      <Sticker src="raccoon/gasp.png" at={T.trashBin} until={T.dashi} x={TX + 630} y={785} w={250} fadeBottom={70} />
      <Sticker src="raccoon/hands-up.png" at={T.rmi} x={TX + 640} y={830} w={240} fadeBottom={50} />
    </>
  );
};

export const TerminalBasics: React.FC = () => {
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
        <PwdBeat T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <LsBeat T={T} />
      </Win>
      <Win from={T.t3} to={T.t4}>
        <CdBeat T={T} />
      </Win>
      <Win from={T.t4} to={T.t5}>
        <MkdirBeat T={T} />
      </Win>
      <Win from={T.t5} to={T.t6}>
        <TouchBeat T={T} />
      </Win>
      <Win from={T.t6} to={T.t7}>
        <CpBeat T={T} />
      </Win>
      <Win from={T.t7} to={T.t8}>
        <MvBeat T={T} />
      </Win>
      <Win from={T.t8} to={T.save}>
        <RmBeat T={T} />
      </Win>

      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.save}
        tools={[
          { from: T.t1, name: "pwd", repo: "print working directory · where am I?", n: 1, of: 8 },
          { from: T.t2, name: "ls", repo: "list files & folders · ls -la shows hidden", n: 2, of: 8 },
          { from: T.t3, name: "cd", repo: "change directory · cd .. back · cd ~ home", n: 3, of: 8 },
          { from: T.t4, name: "mkdir", repo: "make directory · -p for nested folders", n: 4, of: 8 },
          { from: T.t5, name: "touch", repo: "create an empty file on the spot", n: 5, of: 8 },
          { from: T.t6, name: "cp", repo: "copy files · add -r for folders", n: 6, of: 8 },
          { from: T.t7, name: "mv", repo: "move into a folder · or rename in place", n: 7, of: 8 },
          { from: T.t8, name: "rm", repo: "delete forever · add -i to ask first", n: 8, of: 8 },
        ]}
      />

      <SaveOutro
        at={T.save}
        h={termH(8, 22)}
        fontSize={22}
        lines={cheatLines(CHEAT_ROWS, 12)}
        question={"Which one did you\nlearn too late?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="Which command did you learn way too late?" line="Follow for more terminal tricks." />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("terminal-basics/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.t1, T.t2, T.t3, T.t4, T.t5, T.t6, T.t7, T.t8, T.save, T.follow]} />
      <Sfx
        name="mouse-click"
        at={[
          T.pwd,
          T.ls,
          T.lsla - 6,
          T.cddesktop - 4,
          T.cddot - 4,
          T.cdtilde - 4,
          T.mkdirtrash - 4,
          T.dashp - 2,
          T.touchsnacks - 4,
          T.cpsnacks - 4,
          T.dashr - 6,
          T.mvsnacks - 4,
          T.mvbackup - 4,
          T.rmpizza - 4,
          T.rmi - 6,
        ]}
      />
      <Sfx name="ding" at={[T.userssudo, T.home, T.fresh, T.empty, T.renames, T.asks]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 670;
const CFS = 24;
export const TerminalBasicsCover: React.FC = () => (
  <Cover title="100 terminal commands?" sub="These 8 do most of it." size={80} chips={["pwd · ls", "cd · mkdir", "touch · cp", "mv · rm"]}>
    <Terminal
      x={CX}
      y={CTY}
      w={CW}
      h={termH(8, CFS)}
      fontSize={CFS}
      title="cheat sheet"
      blocks={[{ at: -100, out: cheatLines(CHEAT_ROWS, 12) }]}
    />
    <div style={{ position: "absolute", left: CX + 600, top: CTY + 34 - 240, width: 340, height: 240, overflow: "hidden" }}>
      <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={320} from="below" shadow={false} />
    </div>
  </Cover>
);
