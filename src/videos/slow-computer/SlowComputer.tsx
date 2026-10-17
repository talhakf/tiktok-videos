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
import { Segs, Terminal, termColX, termLineY, termRing, type Line } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { Gauge } from "../../components/data/Gauge";
import { ResourceMeters } from "../../components/dev/ResourceMeters";
import { RED } from "../../components/layouts/Mark";
import { Camera } from "../../components/motion/Camera";
import { Icon, type IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/slow-computer/captions.json";

// Why your computer is slow: 4 built-in commands (uptime, top -o cpu, df -h ~, du -sh ~/* | sort -h).
// Facts + sources (macOS man pages, checked 2026-10-12): SudoRaccoon/Videos/slow-computer.md. Design + motion: Playbook/Design system.md.
// Outputs follow the real macOS formats (uptime "3:07AM  up …, load averages: a, b, c"; top truncates to the window
// width; df -h shows inode columns by default, hence the small font + camera zoom), with made-up numbers.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

export const SlowComputerComposition = () => (
  <>
    <Composition id="SlowComputer" component={SlowComputer} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="SlowComputerCover" component={SlowComputerCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      four0: at("four"),
      already: at("already"),
      story: at("sudo's"),
      jet: at("jet"),
      am: at("3"),
      single: at("single"),
      recipe: at("recipe"),
      t1: at("one"),
      uptime: at("uptime"),
      n41: at("41"),
      days: at("days"),
      restart: at("restart"),
      fix: at("fix"),
      load: at("load"),
      cores: at("cores"),
      overworked: at("overworked"),
      t2: at("two"),
      top: at("top-ocpu"),
      every: at("every"),
      sorted: at("sorted"),
      that: at("that"),
      n98: at("98"),
      quit: at("quit"),
      t3: at("three", 2),
      df: at("df-h"),
      disk: at("disk"),
      n97: at("97"),
      breathe: at("breathe"),
      slows: at("slows"),
      t4: at("four", 2),
      du: at("du-shsort-h"),
      every2: at("every", 2),
      biggest: at("biggest"),
      sudos2: at("sudo's", 2),
      downloads: at("downloads"),
      n80: at("80"),
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

const IconNote: React.FC<{ icon: IconName; at: number; until?: number; x: number; y: number; size?: number; tint?: string; children: React.ReactNode }> = ({
  icon,
  at,
  until,
  x,
  y,
  size,
  tint = C.accent,
  children,
}) => {
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

// Camera key that puts page point (cx, py) at screen (540, sy) at scale s (Camera pads every rect by 40 px).
const zoomTo = (at: number, cx: number, py: number, s: number, sy: number, dur = 18) => {
  const cy = py - (sy - H / 2) / s;
  return { at, x: cx - W / s / 2 + 40, y: cy - 10, w: W / s - 80, h: 20, dur };
};
const lineMid = (ty: number, line: number, fs: number) => termLineY(ty, line, fs) + (fs * 1.38) / 2;

// ---------------- shared terminal content ----------------
const LOAD = "9.84, 8.71, 7.02";

// uptime (macOS format, see the man page example "11:23AM  up  3:01, 8 users, load averages: 21.09, 15.43, 12.79")
const UP_FS = 21;
const UP_OUT = `3:07AM  up 41 days,  3:12, 1 user, load averages: ${LOAD}`;
const UP_DAYS_COL = UP_OUT.indexOf("up 41 days");
const UP_LOAD_COL = UP_OUT.indexOf(LOAD);

// top -o cpu: the full-screen view, cut at the window width like the real one
const TOP_FS = 21;
const TOP_COLS = Math.floor((TW - 56) / (TOP_FS * 0.6));
const fit = (s: string) => s.slice(0, TOP_COLS);
const row = (pid: string, cmd: string, cpu: string, time: string, th: string, wq: string, ports: string, mem: string) =>
  pid.padEnd(7) + cmd.padEnd(17) + cpu.padEnd(6) + time.padEnd(9) + th.padEnd(7) + wq.padEnd(5) + ports.padEnd(7) + mem;
const TOP_HEAD = row("PID", "COMMAND", "%CPU", "TIME", "#TH", "#WQ", "#PORT", "MEM");
const TOP_ROWS = [
  row("4127", "Google Chrome He", "98.7", "41:12.07", "23", "4", "211", "2312M"), // the snack recipe tab (renderer)
  row("388", "WindowServer", "21.4", "09:58:31", "24", "6", "3810", "1204M"),
  row("1903", "mds_stores", "12.9", "03:20.44", "9", "5", "95", "310M"),
  row("0", "kernel_task", "8.1", "07:42:10", "562/8", "0", "0", "41M"),
  row("5521", "Slack Helper", "4.6", "12:08.91", "19", "1", "167", "488M"),
];
const TOP_LINES: Line[] = [
  fit("Processes: 612 total, 5 running, 607 sleeping, 2841 threads"),
  fit(`Load Avg: ${LOAD}  CPU usage: 81.40% user, 12.10% sys, 6.50% idle`),
  fit("PhysMem: 15G used (2412M wired, 3102M compressor), 182M unused."),
  "",
  [{ t: fit(TOP_HEAD), b: true }],
  [{ t: fit(TOP_ROWS[0]), b: true }],
  ...TOP_ROWS.slice(1).map((r) => fit(r)),
];
const TOP_HOG_LINE = 5;
const TOP_ROW_COLS = TOP_ROWS[0].length; // ring width: the whole culprit row
const TOP_CPU_COL = TOP_HEAD.indexOf("%CPU");

const TopScreen: React.FC<{ at?: number }> = ({ at = -1000 }) => {
  const frame = useCurrentFrame();
  return (
    <div>
      {TOP_LINES.map((l, i) => {
        const p = prog(frame, at + i * 1.2, 5);
        return (
          <div key={i} style={{ whiteSpace: "pre", minHeight: "1.38em", opacity: p, translate: `0px ${(1 - p) * 8}px` }}>
            <Segs line={l} />
          </div>
        );
      })}
    </div>
  );
};
const TOP_TITLE = "sudo@laptop: ~ — top";

// df -h ~ on macOS: inode columns are on by default (Single UNIX Spec), so the line is ~85 columns wide
const DF_FS = 16;
const DF_HEAD = "Filesystem     Size   Used  Avail Capacity iused ifree %iused  Mounted on";
const DF_LINE = "/dev/disk3s5  460Gi  441Gi   14Gi    97%    2.9M  147M    2%   /System/Volumes/Data";
const DF_OUT: Line[] = [DF_HEAD, [{ t: DF_LINE.slice(0, DF_LINE.indexOf("97%")) }, { t: "97%", c: TERM.red, b: true }, { t: DF_LINE.slice(DF_LINE.indexOf("97%") + 3) }]];
const DF_USED_COL = DF_LINE.indexOf("441Gi");
const DF_CAP_COL = DF_LINE.indexOf("97%");

// du -sh ~/* | sort -h: smallest first, biggest last (sort -h reads the K/M/G suffixes)
const DU_FS = 28;
const DU_ROWS: [string, string][] = [
  ["4.0K", "Public"],
  ["1.2G", "Desktop"],
  ["3.4G", "Pictures"],
  ["9.8G", "Documents"],
  ["21G", "Library"],
  ["80G", "Downloads"],
];
const DU_OUT: Line[] = DU_ROWS.map(([s, n], i) =>
  i === DU_ROWS.length - 1
    ? [{ t: s.padEnd(8), c: TERM.red, b: true }, { t: `/Users/sudo/${n}`, b: true }]
    : [{ t: s.padEnd(8) }, { t: `/Users/sudo/${n}` }],
);
const DU_CMD = "du -sh ~/* | sort -h";

// ---------------- hook: the culprit is already on screen ----------------
const HOOK_TY = 600;
const HOOK_H = 440; // 10 rows at font 21 (the body loses 148 px to title bar + padding)
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Computer slow?" b="4 commands show why." until={T.story} size={80} />
    <Terminal x={TX} y={HOOK_TY} w={TW} h={HOOK_H} fontSize={TOP_FS} title={TOP_TITLE}>
      <TopScreen />
    </Terminal>
    <Circle at={-100} {...termRing(TX, HOOK_TY, TOP_FS, TOP_HOG_LINE, 0, TOP_ROW_COLS)} />
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 580} edgeY={HOOK_TY} w={300} h={230} overhang={34} />
    <Note at={T.four0} x={TX} y={HOOK_TY + HOOK_H + 40} font="mono" size={36}>
      uptime · top · df · du
    </Note>
    <IconNote icon="check" at={T.already} x={TX} y={HOOK_TY + HOOK_H + 160}>
      Already installed.
    </IconNote>
  </>
);

// ---------------- story: 3 a.m., jet engine, one tab ----------------
const RM_Y = 560;
const Story: React.FC<{ T: Cues }> = ({ T }) => {
  const core = (i: number) => ({
    label: String(i + 1),
    keys: [
      { at: T.story + 4, value: 28 + ((i * 17) % 30) },
      { at: T.jet + i, value: 91 + ((i * 7) % 9) },
    ],
  });
  return (
    <>
      <Headline a="Sudo's laptop, 3 a.m.:" b="a jet engine." at={T.story} bAt={T.jet} size={76} />
      <ResourceMeters
        x={TX}
        y={RM_Y}
        w={TW}
        at={T.story}
        filename="activity"
        right="8 cores"
        coreCols={2}
        cores={Array.from({ length: 8 }, (_, i) => core(i))}
        rows={[{ label: "mem", display: "of", max: 16, unit: "GiB", keys: [{ at: T.story + 4, value: 9.2 }, { at: T.jet + 4, value: 15.1 }] }]}
      />
      <IconNote icon="window" at={T.single} x={TX} y={1010}>
        {"1 tab open:\na snack recipe"}
      </IconNote>
      <Sticker src="raccoon/night-snack.png" at={T.am} x={TX + 560} y={990} w={330} fadeBottom={70} />
    </>
  );
};

// ---------------- 1/4 uptime ----------------
const UP_H = 240;
const UP_NOTE_Y = 910; // under the zoomed terminal
const Uptime: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    {/* zoom on "up 41 days", then pan right to the load averages */}
    <Camera keys={[zoomTo(T.n41 - 6, 345, lineMid(TY, 1, UP_FS), 2, 670), zoomTo(T.load - 4, 760, lineMid(TY, 1, UP_FS), 2, 670)]}>
      <Terminal x={TX} y={TY} w={TW} h={UP_H} fontSize={UP_FS} enterAt={T.t1} blocks={[{ at: T.uptime, cmd: "uptime", typeFrames: 10, out: [UP_OUT] }]} />
      <Circle at={T.n41 + 8} until={T.load} {...termRing(TX, TY, UP_FS, 1, UP_DAYS_COL, 10)} />
      <Circle at={T.load + 10} {...termRing(TX, TY, UP_FS, 1, UP_LOAD_COL, LOAD.length)} />
    </Camera>
    <IconNote icon="calendar" at={T.days} until={T.restart} x={TX} y={UP_NOTE_Y}>
      41 days without a restart
    </IconNote>
    <IconNote icon="refresh" at={T.restart} until={T.load} x={TX} y={UP_NOTE_Y}>
      {"Restart it.\nStill the #1 fix."}
    </IconNote>
    <IconNote icon="clock" at={T.load} until={T.cores} x={TX} y={UP_NOTE_Y}>
      {"Load over the last\n1 · 5 · 15 minutes"}
    </IconNote>
    <IconNote icon="warning" at={T.cores} x={TX} y={UP_NOTE_Y} tint={RED}>
      {"9.84 on 8 cores\n= overworked"}
    </IconNote>
    <Sticker src="raccoon/belly-up.png" at={T.days} x={TX + 480} y={1070} w={400} />
  </>
);

// ---------------- 2/4 top -o cpu ----------------
const TOP_H = 440;
const TOP_NOTE_Y = 1090; // under the zoomed terminal
const Top: React.FC<{ T: Cues }> = ({ T }) => {
  const screenAt = T.every - 4; // enter pressed: top takes over the window
  return (
    <>
      {/* zoom (1.5×) onto the top row when the culprit is named */}
      <Camera keys={[zoomTo(T.that - 6, 440, lineMid(TY, TOP_HOG_LINE, TOP_FS), 1.5, 760)]}>
        <Win from={T.t2} to={screenAt}>
          <Terminal x={TX} y={TY} w={TW} h={TOP_H} fontSize={TOP_FS} enterAt={T.t2} blocks={[{ at: T.top + 2, cmd: "top -o cpu", typeFrames: 16 }]} />
        </Win>
        <Win from={screenAt} to={T.t3}>
          <Terminal x={TX} y={TY} w={TW} h={TOP_H} fontSize={TOP_FS} title={TOP_TITLE}>
            <TopScreen at={screenAt} />
          </Terminal>
        </Win>
        <Circle at={T.sorted} until={T.that - 6} {...termRing(TX, TY, TOP_FS, 4, TOP_CPU_COL, 4, 6)} />
        <Circle at={T.that + 8} {...termRing(TX, TY, TOP_FS, TOP_HOG_LINE, 0, TOP_CPU_COL + 4)} />
      </Camera>
      <IconNote icon="arrowDown" at={T.sorted} until={T.that} x={TX} y={TY + TOP_H + 40}>
        Biggest CPU user on top
      </IconNote>
      <IconNote icon="pizza" at={T.that} until={T.quit} x={TX} y={TOP_NOTE_Y}>
        {"The snack recipe tab:\n98.7% CPU"}
      </IconNote>
      <IconNote icon="cross" at={T.quit} x={TX} y={TOP_NOTE_Y} tint={RED}>
        {"Quit that app.\nq leaves top."}
      </IconNote>
      <Sticker src="raccoon/side-eye.png" at={T.that} x={TX + 600} y={1090} w={300} fadeBottom={50} />
    </>
  );
};

// ---------------- 3/4 df -h ~ ----------------
const DF_H = 240;
const Df: React.FC<{ T: Cues }> = ({ T }) => {
  // zoom so the Size…Capacity columns fill the screen at 2×, data line just under the header
  const left = termColX(TX, 0, DF_FS) - 20;
  const right = termColX(TX, DF_CAP_COL + 3, DF_FS) + 20;
  const zoom = zoomTo(T.disk, (left + right) / 2, lineMid(TY, 2, DF_FS), 2, 700);
  return (
    <>
      <Camera keys={[zoom]}>
        <Terminal x={TX} y={TY} w={TW} h={DF_H} fontSize={DF_FS} enterAt={T.t3} blocks={[{ at: T.df + 2, cmd: "df -h ~", typeFrames: 10, out: DF_OUT }]} />
        <Circle at={T.n97} {...termRing(TX, TY, DF_FS, 2, DF_CAP_COL - 1, 5)} />
        <Circle at={T.disk + 14} until={T.n97} {...termRing(TX, TY, DF_FS, 2, DF_USED_COL, 19)} />
      </Camera>
      <IconNote icon="disk" at={T.disk} until={T.n97} x={TX} y={930}>
        {"df = disk free.\n441 GB used, 14 GB left"}
      </IconNote>
      <Gauge x={TX} y={930} size={420} at={T.n97} keys={[{ at: T.n97 + 2, value: 97, color: RED }]} max={100} ticks={[0, 50, 100]} unit="%" label="full" />
      <Sticker src="raccoon/oops.png" at={T.breathe} x={TX + 560} y={930} w={300} fadeBottom={70} />
    </>
  );
};

// ---------------- 4/4 du -sh ~/* | sort -h ----------------
const DU_H = 460;
const DU_NOTE_Y = TY + DU_H + 40;
const Du: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = 30;
  const typeAt = T.du + 2;
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={DU_H}
        fontSize={DU_FS}
        enterAt={T.t4}
        blocks={[{ at: typeAt, cmd: DU_CMD, typeFrames: tf, outDelay: Math.max(4, T.every2 - (typeAt + tf)), out: DU_OUT }]}
      />
      <IconNote icon="folder" at={T.every2 + 4} until={T.downloads} x={TX} y={DU_NOTE_Y}>
        {"Every folder in ~\nbiggest last"}
      </IconNote>
      <Circle at={T.downloads} {...termRing(TX, TY, DU_FS, DU_ROWS.length, 0, 8 + "/Users/sudo/Downloads".length)} />
      <Note at={T.n80} x={TX} y={DU_NOTE_Y}>
        {"80 GB of\nsnack receipts"}
      </Note>
      <Sticker src="raccoon/trash-bin.png" at={T.sudos2} x={TX + 600} y={DU_NOTE_Y + 40} w={240} fadeBottom={30} />
    </>
  );
};

export const SlowComputer: React.FC = () => {
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
        <Uptime T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <Top T={T} />
      </Win>
      <Win from={T.t3} to={T.t4}>
        <Df T={T} />
      </Win>
      <Win from={T.t4} to={T.save}>
        <Du T={T} />
      </Win>

      {/* after the df camera, so the header always sits on top */}
      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.save}
        tools={[
          { from: T.t1, name: "uptime", repo: "built in · time since restart + load", n: 1, of: 4 },
          { from: T.t2, name: "top -o cpu", repo: "built in · Linux: just top", n: 2, of: 4 },
          { from: T.t3, name: "df -h", repo: "built in · disk free", n: 3, of: 4 },
          { from: T.t4, name: "du -sh", repo: "built in · disk usage, + sort -h", n: 4, of: 4 },
        ]}
      />

      <SaveOutro
        at={T.save}
        h={290}
        fontSize={26}
        lines={cheatLines(
          [
            ["uptime", "days since restart"],
            ["top -o cpu", "what eats the CPU"],
            ["df -h ~", "how full the disk is"],
            [DU_CMD, "biggest folders"],
          ],
          21,
        )}
        question={"What was\neating yours?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="What was eating yours?" line="Follow for more terminal tricks." />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("slow-computer/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.t1, T.t2, T.t3, T.t4, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.uptime, T.top + 2, T.df + 2, T.du + 2]} />
      <Sfx name="ding" at={[T.n98, T.downloads]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 590;
const CFS = 22;
export const SlowComputerCover: React.FC = () => {
  const ring = termRing(CX, CTY, CFS, TOP_HOG_LINE, 0, TOP_ROW_COLS);
  return (
    <Cover title="Computer slow?" sub="4 commands show why." size={82} chips={["uptime", "top -o cpu", "df -h", "du -sh"]}>
      <Terminal x={CX} y={CTY} w={CW} h={460} fontSize={CFS} title={TOP_TITLE}>
        <TopScreen />
      </Terminal>
      <div style={{ position: "absolute", left: ring.x, top: ring.y, width: ring.w, height: ring.h, borderRadius: 16, border: `4px solid ${C.accent}`, background: `${C.accent}24` }} />
      <div style={{ position: "absolute", left: CX + 580, top: CTY + 34 - 240, width: 340, height: 240, overflow: "hidden" }}>
        <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={320} from="below" shadow={false} />
      </div>
    </Cover>
  );
};

