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
import { dim, Terminal, termRing, type Line } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { Gauge } from "../../components/data/Gauge";
import { ProgressBar } from "../../components/data/ProgressBar";
import { Waveform } from "../../components/data/Waveform";
import { KeyCombo } from "../../components/layouts/KeyCombo";
import { FinderWindow } from "../../components/windows/FinderWindow";
import { MacWindow } from "../../components/windows/MacWindow";
import { Icon, type IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/mac-terminal-secrets/captions.json";

// 5 Mac terminal commands Apple doesn't advertise: caffeinate, networkQuality, say, pbcopy, open .
// Facts + sources (Apple man pages): SudoRaccoon/Videos/mac-terminal-secrets.md. Design + motion: Playbook/Design system.md.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

// `which` prints each command's path: all five live in /usr/bin, i.e. they ship with macOS.
const WHICH_CMD = "which caffeinate networkQuality say pbcopy open";
const WHICH_OUT: Line[] = ["caffeinate", "networkQuality", "say", "pbcopy", "open"].map((c) => [dim("/usr/bin/"), { t: c, c: TERM.green, b: true }]);
const STASH = ["acorns.txt", "chips.txt", "pizza-crust.txt", "snacks"]; // ls sorts alphabetically

export const MacTerminalSecretsComposition = () => (
  <>
    <Composition id="MacTerminalSecrets" component={MacTerminalSecrets} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="MacTerminalSecretsCover" component={MacTerminalSecretsCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      already: at("already"),
      story: at("sudo's"),
      asleep: at("asleep"),
      am: at("3"),
      again: at("again"),
      t1: at("one"),
      caff: at("caffeinate"),
      runs: at("runs"),
      dashD: at("-d"),
      ctrlc: at("ctrlc"),
      sleep: at("sleep"),
      t2: at("two"),
      nq: at("networkquality"),
      speed: at("speed"),
      website: at("website"),
      download: at("download", 2),
      upload: at("upload"),
      responsive: at("responsive"),
      t3: at("three"),
      sayHead: at("say"),
      say: at("say", 2),
      trash: at("trash"),
      reads: at("reads"),
      loud: at("loud"),
      t4: at("four"),
      pbcopy: at("pbcopy"),
      pipe: at("pipe"),
      clipboard: at("clipboard"),
      pbpaste: at("pbpaste"),
      prints: at("prints"),
      t5: at("five", 2),
      open: at("open"),
      finder: at("finder"),
      snack: at("snack"),
      found: at("found"),
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

const IconNote: React.FC<{ icon: IconName; at: number; until?: number; x: number; y: number; size?: number; children: React.ReactNode }> = ({
  icon,
  at,
  until,
  x,
  y,
  size,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <Note at={at} until={until} x={x} y={y} size={size}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Icon name={icon} size={46} color={C.accent} weight={2.2} draw={prog(frame, at + 2, 14)} />
        <span>{children}</span>
      </div>
    </Note>
  );
};

// ---------------- hook: all five are already on every Mac (frame 0 shows the payoff) ----------------
const HOOK_TY = 640;
const HOOK_H = 390;
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="5 Mac terminal commands" b="Apple doesn't advertise." until={T.story} size={74} />
    <Terminal x={TX} y={HOOK_TY} w={TW} h={HOOK_H} fontSize={26} blocks={[{ at: -200, cmd: WHICH_CMD, out: WHICH_OUT }]} />
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 560} edgeY={HOOK_TY} w={300} h={230} overhang={34} />
    <Circle at={T.already} {...termRing(TX, HOOK_TY, 26, 1, 0, 23, 5)} />
    <IconNote icon="check" at={T.already + 4} x={TX} y={HOOK_TY + HOOK_H + 40}>
      Built in. Nothing to install.
    </IconNote>
  </>
);

// ---------------- story: Sudo's Mac fell asleep mid-download, at 3 a.m. ----------------
const DL_Y = 560;
const DL_H = 300;
const Story: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const dark = prog(frame, T.asleep + 4, 14);
  return (
    <>
      <Headline a="Sudo's Mac fell asleep" b="mid-download. At 3 a.m." at={T.story} bAt={T.am} size={72} />
      <MacWindow x={TX} y={DL_Y} w={TW} h={DL_H} title="Downloads" at={T.story} />
      <ProgressBar
        at={T.story + 4}
        x={TX + 60}
        y={DL_Y + 120}
        w={TW - 120}
        label="trash-raids-s4.mp4"
        keys={[
          { at: T.story, value: 0.41 },
          { at: T.asleep, value: 0.63 },
        ]}
      />
      {/* the display goes to sleep: the window fades to black, a moon on it */}
      <div
        style={{
          position: "absolute",
          left: TX,
          top: DL_Y,
          width: TW,
          height: DL_H,
          borderRadius: 26,
          background: "#000",
          opacity: dark * 0.86,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="moon" size={110} color="#FFFFFF" weight={1.8} draw={prog(frame, T.asleep + 10, 14)} />
      </div>
      <IconNote icon="zzz" at={T.am} x={TX} y={DL_Y + DL_H + 40}>
        3:07 am · stuck at 63%
      </IconNote>
      <Sticker src="raccoon/belly-up.png" at={T.again} x={TX + 400} y={1030} w={460} />
    </>
  );
};

// ---------------- 1/5 caffeinate ----------------
const C1_H = 300;
const Caffeinate: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Terminal
      x={TX}
      y={TY}
      w={TW}
      h={C1_H}
      enterAt={T.t1}
      blocks={[
        { at: T.caff + 2, cmd: "caffeinate -d", typeFrames: 16 },
        { at: T.ctrlc + 4, out: [[dim("^C")]] },
        { at: T.ctrlc + 8, cmd: "" },
      ]}
    />
    <IconNote icon="coffee" at={T.runs} until={T.dashD} x={TX} y={TY + C1_H + 40}>
      Mac stays awake while it runs
    </IconNote>
    <Circle at={T.dashD} until={T.ctrlc} {...termRing(TX, TY, 28, 0, 4 + 11, 2)} />
    <IconNote icon="sun" at={T.dashD + 4} until={T.ctrlc} x={TX} y={TY + C1_H + 40}>
      -d keeps the screen on too
    </IconNote>
    <KeyCombo keys={["ctrl", "c"]} at={T.ctrlc - 6} press={T.ctrlc + 2} x={TX} w={460} y={TY + C1_H + 40} />
    <IconNote icon="moon" at={T.sleep} x={TX} y={TY + C1_H + 230}>
      Stops it. Sleep is back on.
    </IconNote>
    <Sticker src="raccoon/night-snack.png" at={T.runs + 6} x={TX + 560} y={TY + C1_H + 230} w={330} fadeBottom={70} />
  </>
);

// ---------------- 2/5 networkQuality ----------------
const C2_H = 400;
const NQ_OUT: Line[] = [
  [dim("==== SUMMARY ====")],
  [dim("Uplink capacity: "), { t: "41.208 Mbps", b: true }],
  [dim("Downlink capacity: "), { t: "312.442 Mbps", b: true }],
  [dim("Responsiveness: "), { t: "High (2310 RPM)", c: TERM.green, b: true }],
  [dim("Idle Latency: "), { t: "14.250 milliseconds" }],
];
const NetworkQuality: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = 18;
  const outAt = T.website - 4;
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={C2_H}
        enterAt={T.t2}
        blocks={[{ at: T.nq + 2, cmd: "networkQuality", typeFrames: tf, outDelay: Math.max(4, outAt - (T.nq + 2 + tf)), out: NQ_OUT }]}
      />
      <Circle at={T.download} until={T.upload} {...termRing(TX, TY, 28, 3, 0, 31)} />
      <Circle at={T.upload} until={T.responsive} {...termRing(TX, TY, 28, 2, 0, 28)} />
      <Circle at={T.responsive} {...termRing(TX, TY, 28, 4, 0, 31)} />
      <Gauge
        x={TX}
        y={TY + C2_H + 50}
        size={440}
        at={T.speed}
        keys={[{ at: T.download - 6, value: 312 }]}
        max={500}
        ticks={[0, 100, 200, 300, 400, 500]}
        unit="Mbps"
        label="download"
      />
      <Note at={T.responsive + 4} x={TX + 480} y={TY + C2_H + 90} size={32}>
        {"RPM = round trips\nper minute.\nHigher is better."}
      </Note>
    </>
  );
};

// ---------------- 3/5 say ----------------
const C3_H = 260;
const WAVE_Y = 940;
const Say: React.FC<{ T: Cues }> = ({ T }) => {
  const cmd = 'say "trash night"';
  const tf = 26;
  const spoke = T.say + 2 + tf + 6; // enter pressed, the Mac starts talking
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={C3_H}
        enterAt={T.t3}
        blocks={[
          { at: T.say + 2, cmd, typeFrames: tf },
          { at: T.loud + 14, cmd: "" },
        ]}
      />
      <IconNote icon="speaker" at={T.sayHead + 4} until={T.say} x={TX} y={WAVE_Y + 20}>
        Text to speech, built in
      </IconNote>
      <PeekOver src="raccoon/trash-bin.png" at={T.trash} x={TX + 620} edgeY={WAVE_Y} w={210} h={240} overhang={0} />
      <Waveform x={TX} y={WAVE_Y} at={T.say} speak={[[spoke, T.loud + 14]]} bars={26} h={120} pill />
      <Note at={spoke + 4} x={TX} y={WAVE_Y + 210}>
        {"Your Mac: “trash night”"}
      </Note>
    </>
  );
};

// ---------------- 4/5 pbcopy / pbpaste ----------------
const C4_H = 420;
const PBCOPY = "ls ~/stash | pbcopy";
const Pbcopy: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = 22;
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={C4_H}
        enterAt={T.t4}
        blocks={[
          { at: T.pbcopy + 2, cmd: PBCOPY, typeFrames: tf, out: [] },
          { at: T.pbpaste, cmd: "pbpaste", typeFrames: 10, outDelay: Math.max(4, T.prints - (T.pbpaste + 10)), out: STASH },
        ]}
      />
      <Circle at={T.pipe} until={T.pbpaste} {...termRing(TX, TY, 28, 0, 4 + 11, 8)} />
      <IconNote icon="clipboard" at={T.clipboard} until={T.pbpaste} x={TX} y={TY + C4_H + 40}>
        {"On the clipboard.\nPaste anywhere."}
      </IconNote>
      <Circle at={T.prints + 4} {...termRing(TX, TY, 28, 2, 0, 15, 4)} />
      <Note at={T.prints + 8} x={TX} y={TY + C4_H + 40} font="mono" size={32}>
        pbpaste prints it back
      </Note>
      <Sticker src="raccoon/bowl-grab.png" at={T.clipboard} x={W - 240} y={TY + C4_H + 40} w={240} flip from="right" />
    </>
  );
};

// ---------------- 5/5 open . ----------------
const C5_H = 200;
const FIN_Y = TY + C5_H + 40;
const FIN_H = 340;
const stashPrompt = (
  <>
    <span style={{ color: TERM.blue, fontWeight: 700 }}>~/stash </span>
    <span style={{ color: TERM.green, fontWeight: 700 }}>$ </span>
  </>
);
const Open: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Terminal
      x={TX}
      y={TY}
      w={TW}
      h={C5_H}
      title="sudo@laptop: ~/stash"
      prompt={stashPrompt}
      enterAt={T.t5}
      blocks={[{ at: T.open + 2, cmd: "open .", typeFrames: 8, out: [] }]}
    />
    <Circle at={T.open + 14} until={T.finder} {...termRing(TX, TY, 28, 0, 10, 6)} />
    <FinderWindow
      x={TX}
      y={FIN_Y}
      w={TW}
      h={FIN_H}
      title="stash"
      at={T.finder}
      items={[
        { name: "snacks", kind: "folder" },
        { name: "acorns.txt", kind: "file" },
        { name: "chips.txt", kind: "file" },
        { name: "pizza-crust.txt", kind: "file" },
      ]}
      select={[{ name: "snacks", at: T.snack }]}
    />
    <Sticker src="raccoon/celebrate.png" at={T.found} x={TX + 640} y={FIN_Y + FIN_H - 40} w={240} fadeBottom={60} />
  </>
);

export const MacTerminalSecrets: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.save}
        tools={[
          { from: T.t1, name: "caffeinate", repo: "built in · no more sleep", n: 1, of: 5 },
          { from: T.t2, name: "networkQuality", repo: "built in · macOS 12+", n: 2, of: 5 },
          { from: T.t3, name: "say", repo: "built in · text to speech", n: 3, of: 5 },
          { from: T.t4, name: "pbcopy", repo: "built in · + pbpaste", n: 4, of: 5 },
          { from: T.t5, name: "open .", repo: "built in · Finder, right here", n: 5, of: 5 },
        ]}
      />

      <Win from={0} to={T.story}>
        <Hook T={T} />
      </Win>
      <Win from={T.story} to={T.t1}>
        <Story T={T} />
      </Win>
      <Win from={T.t1} to={T.t2}>
        <Caffeinate T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <NetworkQuality T={T} />
      </Win>
      <Win from={T.t3} to={T.t4}>
        <Say T={T} />
      </Win>
      <Win from={T.t4} to={T.t5}>
        <Pbcopy T={T} />
      </Win>
      <Win from={T.t5} to={T.save}>
        <Open T={T} />
      </Win>

      <SaveOutro
        at={T.save}
        h={320}
        fontSize={28}
        lines={cheatLines(
          [
            ["caffeinate -d", "stay awake"],
            ["networkQuality", "speed test"],
            ['say "hi"', "talk"],
            ["ls | pbcopy", "copy output"],
            ["open .", "Finder here"],
          ],
          17,
        )}
        question={"Which one\ndidn't you know?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="Which one didn't you know?" />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("mac-terminal-secrets/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.t1, T.t2, T.t3, T.t4, T.t5, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.caff + 2, T.nq + 2, T.say + 2, T.pbcopy + 2, T.pbpaste, T.open + 2]} />
      <Sfx name="switch" at={[T.ctrlc + 2]} />
      <Sfx name="ding" at={[T.website, T.prints, T.found]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 600;
const CTH = 390;
export const MacTerminalSecretsCover: React.FC = () => (
  <Cover title="5 hidden Mac" sub="terminal commands." size={92} chips={["caffeinate", "networkQuality", "pbcopy"]}>
    <Terminal x={CX} y={CTY} w={CW} h={CTH} fontSize={26} blocks={[{ at: -200, cmd: WHICH_CMD, out: WHICH_OUT }]} />
    <div style={{ position: "absolute", left: CX + 580, top: CTY + 34 - 240, width: 340, height: 240, overflow: "hidden" }}>
      <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={320} from="below" shadow={false} />
    </div>
    <div style={{ position: "absolute", left: CX, top: CTY + CTH + 40, fontFamily: sans, fontWeight: 600, fontSize: 40, color: C.mute }}>
      Already on your Mac. Nothing to install.
    </div>
  </Cover>
);

