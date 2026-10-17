import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Composition, interpolate, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Cover, CoverStill, CW, CX } from "../../components/Cover";
import { Captions } from "../../components/Captions";
import { Circle, Note, Sticker } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Headline } from "../../components/Headline";
import { PeekOver } from "../../components/PeekOver";
import { cheatLines, SaveOutro } from "../../components/SaveOutro";
import { dim, Terminal, termRing, type Block, type Line, type Seg } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { Vanish } from "../../components/layouts/Vanish";
import { Reaction } from "../../components/social/PunchWord";
import { BAND, TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, easeInOut, mono, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/linux-folders/captions.json";

// Every Linux folder explained: a tour of `ls /` (Sudo just moved in), seven folders, then /dev/null.
// Facts + sources: SudoRaccoon/Videos/linux-folders.md. Design + motion: Playbook/Design system.md.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      minute: at("minute"),
      sudo1: at("sudo"),
      tour: at("tour"),
      home: at("home"),
      bedroom: at("bedroom"),
      files: at("files"),
      etc: at("etc"),
      settings: at("settings"),
      plain: at("plain"),
      bin: at("bin"),
      programs: at("programs"),
      ls: at("ls"),
      shortcut: at("shortcut"),
      usrbin: at("usrbin"),
      tmp: at("tmp"),
      kitchen: at("kitchen"),
      leaves: at("leaves"),
      snacks: at("snacks"),
      many: at("many"),
      gone1: at("gone"),
      varr: at("var"),
      growing: at("growing"),
      logs: at("logs"),
      dev: at("dev"),
      hardware: at("hardware"),
      disk1: at("disk"),
      proc: at("proc"),
      disk2: at("disk", 2),
      kernel: at("kernel"),
      cat: at("catprocuptime"),
      long: at("long"),
      best: at("and", 2),
      devnull: at("devnull"),
      anything: at("anything"),
      gone2: at("gone", 2),
      perfect: at("perfect"),
      trash: at("trash"),
      sudo3: at("sudo", 3),
      never: at("never"),
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

// ---------------- the `ls /` grid (real layout: ls fills columns top to bottom, 7 chars wide) ----------------
const LS_FS = 32;
const COLW = 7;
const GRID = [
  ["bin", "etc", "lib64", "proc", "sbin", "tmp"],
  ["boot", "home", "mnt", "root", "srv", "usr"],
  ["dev", "lib", "opt", "run", "sys", "var"],
];
const LINKS = new Set(["bin", "lib", "lib64", "sbin"]); // usr merge: symlinks into /usr (ls shows them cyan)
const LS_OUT: Line[] = GRID.map((row) =>
  row.map((n, i): Seg => ({ t: i < row.length - 1 ? n.padEnd(COLW) : n, c: LINKS.has(n) ? TERM.cyan : TERM.blue, b: true })),
);
const cell = (name: string) => {
  const r = GRID.findIndex((row) => row.includes(name));
  return { line: 1 + r, col: GRID[r].indexOf(name) * COLW, len: name.length };
};
const lsRing = (y: number, name: string) => {
  const c = cell(name);
  return termRing(TX, y, LS_FS, c.line, c.col, c.len);
};

const HOOK_LS_Y = 600; // in the hook the window sits lower (headline + peeking raccoon above it)
const LS_H = 330; // cmd + 3 rows + prompt, no scroll (rings rely on it)
const lsY = (frame: number, T: Cues) => interpolate(prog(frame, T.home - 4, 14, easeInOut), [0, 1], [HOOK_LS_Y, TY]);

// which folder the tour is on, for the ring in the `ls /` window
const tourRings = (T: Cues) => [
  { name: "home", at: T.home + 10, until: T.etc },
  { name: "etc", at: T.etc, until: T.bin },
  { name: "bin", at: T.bin, until: T.usrbin },
  { name: "usr", at: T.usrbin, until: T.tmp },
  { name: "tmp", at: T.tmp, until: T.varr },
  { name: "var", at: T.varr, until: T.dev },
  { name: "dev", at: T.dev, until: T.proc },
  { name: "proc", at: T.proc, until: T.best },
];

const LsWindow: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const y = lsY(frame, T);
  return (
    <>
      <Terminal x={TX} y={y} w={TW} h={LS_H} fontSize={LS_FS} blocks={[{ at: -200, cmd: "ls /", out: LS_OUT }]} />
      {tourRings(T).map((r) => (
        <Circle key={r.name} at={r.at} until={r.until} {...lsRing(TY, r.name)} />
      ))}
    </>
  );
};

// ---------------- hook: headline + the whole `ls /` from frame 0 ----------------
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Every Linux folder," b="explained." until={T.home} size={84} />
    <PeekOver src="raccoon/peek-paws.png" at={-100} until={T.home - 10} x={TX + 560} edgeY={HOOK_LS_Y} w={300} h={230} overhang={34} />
    <Note at={T.minute} until={T.home - 6} x={TX} y={HOOK_LS_Y + LS_H + 40}>
      7 folders · 1 trash can
    </Note>
  </>
);

// ---------------- the tour: one small terminal per folder under the map ----------------
const D_Y = 776;
const D_H = 310;
const D_FS = 28;
const NOTE_Y = BAND + 20;

const Detail: React.FC<{ at: number; blocks: Block[] }> = ({ at, blocks }) => (
  <Terminal x={TX} y={D_Y} w={TW} h={D_H} fontSize={D_FS} enterAt={at} blocks={blocks} />
);
const dRing = (line: number, col: number, cols: number) => termRing(TX, D_Y, D_FS, line, col, cols);

const Home: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Detail at={T.home} blocks={[{ at: T.home + 6, cmd: "ls /home", typeFrames: 10, out: [[{ t: "sudo", c: TERM.blue, b: true }]] }]} />
    <Note at={T.files} x={TX} y={NOTE_Y} font="mono" size={36}>
      {"~ = /home/sudo"}
    </Note>
    <Sticker src="raccoon/belly-up.png" at={T.bedroom} x={TX + 540} y={NOTE_Y + 40} w={360} />
  </>
);

const Etc: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Detail at={T.etc} blocks={[{ at: T.etc + 6, cmd: "cat /etc/hostname", typeFrames: 16, out: ["laptop"] }]} />
    <Circle at={T.plain} {...dRing(1, 0, 6)} />
    <Note at={T.plain + 4} x={TX} y={NOTE_Y}>
      {"Settings are text files.\nThis one: the computer's name."}
    </Note>
  </>
);

const Bin: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Detail
      at={T.bin}
      blocks={[{ at: T.programs, cmd: "readlink /bin", typeFrames: 14, outDelay: Math.max(4, T.shortcut - (T.programs + 14)), out: [[{ t: "usr/bin", c: TERM.cyan, b: true }]] }]}
    />
    <Circle at={T.usrbin} {...dRing(1, 0, 7)} />
    <Note at={T.shortcut + 4} x={TX} y={NOTE_Y} font="mono" size={36}>
      {"/bin → /usr/bin\nls lives here"}
    </Note>
    <Sticker src="raccoon/scheming.png" at={T.ls} x={TX + 650} y={NOTE_Y + 20} w={220} />
  </>
);

const Tmp: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Detail
      at={T.tmp}
      blocks={[
        { at: T.kitchen + 4, cmd: "echo chips > /tmp/snack", typeFrames: 20 },
        { at: T.many - 6, out: [[dim("# … reboot …")]] },
        { at: T.many, cmd: "cat /tmp/snack", typeFrames: 12, outDelay: Math.max(4, T.gone1 - (T.many + 12)), out: [[{ t: "cat: /tmp/snack: No such file or directory", c: TERM.red }]] },
      ]}
    />
    <Note at={T.gone1 + 4} x={TX} y={NOTE_Y}>
      {"On many distros:\nwiped at every boot"}
    </Note>
    <Sticker src="raccoon/night-snack.png" at={T.snacks} x={TX + 630} y={NOTE_Y + 5} w={250} fadeBottom={60} />
  </>
);

const Var: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Detail at={T.varr} blocks={[{ at: T.varr + 8, cmd: "du -sh /var/log", typeFrames: 14, out: ["67M     /var/log"] }]} />
    <Circle at={T.logs} {...dRing(1, 0, 3)} />
    <Note at={T.logs + 2} x={TX} y={NOTE_Y}>
      Logs only get bigger
    </Note>
  </>
);

const Dev: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Detail at={T.dev} blocks={[{ at: T.hardware, cmd: "file /dev/nvme0n1", typeFrames: 16, out: ["/dev/nvme0n1: block special (259/0)"] }]} />
    <Circle at={T.disk1} {...dRing(1, 0, 13)} />
    <Note at={T.disk1 + 4} x={TX} y={NOTE_Y}>
      {"That's the SSD.\nAs a file."}
    </Note>
  </>
);

const UPTIME = "12552.08";
const Proc: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Detail
      at={T.proc}
      blocks={[
        { at: T.proc + 8, cmd: "ls -l /proc/uptime", typeFrames: 16, out: ["-r--r--r-- 1 root root 0 Oct 11 13:55 /proc/uptime"] },
        { at: T.cat, cmd: "cat /proc/uptime", typeFrames: 14, out: [`${UPTIME} 141838.75`] },
      ]}
    />
    {/* size column of the ls -l line: 0 bytes */}
    <Circle at={T.disk2} until={T.cat} {...dRing(1, 23, 1)} />
    <Note at={T.disk2 + 4} until={T.cat} x={TX} y={NOTE_Y}>
      {"0 bytes. The kernel\nwrites it when you look."}
    </Note>
    <Circle at={T.long} {...dRing(3, 0, UPTIME.length)} />
    <Note at={T.long + 4} x={TX} y={NOTE_Y}>
      {"Seconds since boot\n≈ 3.5 hours"}
    </Note>
  </>
);

// ---------------- payoff: /dev/null ----------------
const HOLE_X = TX + 560;
const HOLE_Y = 900;
const DevNull: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="/dev/null." b="The perfect trash can." at={T.best} bAt={T.perfect} size={84} />
    <Terminal
      x={TX}
      y={TY}
      w={TW}
      h={LS_H}
      fontSize={LS_FS}
      enterAt={T.best}
      blocks={[
        { at: T.devnull, cmd: "echo snacks > /dev/null", typeFrames: 22, out: [] },
        { at: T.perfect, cmd: "cat /dev/null", typeFrames: 12, out: [] },
      ]}
    />
    <Vanish at={T.anything} suck={T.gone2} x={TX + 30} y={HOLE_Y - 40} holeX={HOLE_X} holeY={HOLE_Y} text="snacks" size={40} />
    <Note at={T.trash} x={TX} y={NOTE_Y + 20}>
      Always empty
    </Note>
    <Sticker src="raccoon/trash-bin.png" at={T.sudo3} x={TX + 560} y={NOTE_Y - 20} w={220} fadeBottom={40} />
    <Reaction at={T.never} x={TX + 840} y={NOTE_Y + 20} size={110} glyph="?" />
  </>
);

export const LinuxFoldersComposition = () => (
  <>
    <Composition id="LinuxFolders" component={LinuxFolders} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="LinuxFoldersCover" component={LinuxFoldersCover} />
  </>
);

export const LinuxFolders: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.best}
        tools={[
          { from: T.home, name: "/home", repo: "your files · the bedroom", n: 1, of: 7 },
          { from: T.etc, name: "/etc", repo: "settings · plain text", n: 2, of: 7 },
          { from: T.bin, name: "/bin", repo: "programs · a shortcut to /usr/bin", n: 3, of: 7 },
          { from: T.tmp, name: "/tmp", repo: "temporary · the kitchen counter", n: 4, of: 7 },
          { from: T.varr, name: "/var", repo: "data that grows · logs", n: 5, of: 7 },
          { from: T.dev, name: "/dev", repo: "devices · hardware as files", n: 6, of: 7 },
          { from: T.proc, name: "/proc", repo: "live info from the kernel · not on disk", n: 7, of: 7 },
        ]}
      />

      <Win from={0} to={T.best}>
        <LsWindow T={T} />
      </Win>
      <Win from={0} to={T.home}>
        <Hook T={T} />
      </Win>
      <Win from={T.home} to={T.etc}>
        <Home T={T} />
      </Win>
      <Win from={T.etc} to={T.bin}>
        <Etc T={T} />
      </Win>
      <Win from={T.bin} to={T.tmp}>
        <Bin T={T} />
      </Win>
      <Win from={T.tmp} to={T.varr}>
        <Tmp T={T} />
      </Win>
      <Win from={T.varr} to={T.dev}>
        <Var T={T} />
      </Win>
      <Win from={T.dev} to={T.proc}>
        <Dev T={T} />
      </Win>
      <Win from={T.proc} to={T.best}>
        <Proc T={T} />
      </Win>
      <Win from={T.best} to={T.save}>
        <DevNull T={T} />
      </Win>

      <SaveOutro
        at={T.save}
        h={430}
        fontSize={28}
        title="map of /"
        lines={cheatLines(
          [
            ["/home", "your files"],
            ["/etc", "settings, plain text"],
            ["/bin", "programs (→ /usr/bin)"],
            ["/tmp", "temporary files"],
            ["/var", "logs and growing data"],
            ["/dev", "devices as files"],
            ["/proc", "live info from the kernel"],
            ["/dev/null", "the trash, always empty"],
          ],
          11,
        )}
        question={"Which folder\nconfused you?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="Which folder confused you?" line="Follow for more Linux tricks." />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("linux-folders/voice.mp3")} />
      <Sfx name="whoosh" at={[T.home, T.etc, T.bin, T.tmp, T.varr, T.dev, T.proc, T.best, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.home + 6, T.etc + 6, T.programs, T.kitchen + 4, T.many, T.varr + 8, T.hardware, T.proc + 8, T.cat, T.devnull, T.perfect]} />
      <Sfx name="ding" at={[T.gone2 + 14]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 600;
const coverRing = (name: string) => {
  const c = cell(name);
  return termRing(CX, CTY, LS_FS, c.line, c.col, c.len);
};
export const LinuxFoldersCover: React.FC = () => (
  <Cover title="Every Linux folder," sub="explained." chips={["/home", "/etc", "/tmp", "/dev/null"]}>
    <Terminal x={CX} y={CTY} w={CW} h={LS_H} fontSize={LS_FS} blocks={[{ at: -200, cmd: "ls /", out: LS_OUT }]} />
    {["etc", "tmp"].map((n) => (
      <div
        key={n}
        style={{
          position: "absolute",
          ...(({ x, y, w, h }) => ({ left: x, top: y, width: w, height: h }))(coverRing(n)),
          borderRadius: 16,
          border: `4px solid ${C.accent}`,
          background: `${C.accent}24`,
        }}
      />
    ))}
    <div style={{ position: "absolute", left: CX + 560, top: CTY + 34 - 240, width: 340, height: 240, overflow: "hidden" }}>
      <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={320} from="below" shadow={false} />
    </div>
    <div style={{ position: "absolute", left: CX, top: CTY + LS_H + 40, fontFamily: mono, fontWeight: 500, fontSize: 36, color: C.mute }}>
      7 folders · 1 trash can
    </div>
  </Cover>
);
