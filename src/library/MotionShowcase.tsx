import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Circle } from "../components/Doodles";
import { CARD_SHADOW, RED } from "../components/diagram/Node";
import { Camera, FULL_FRAME } from "../components/motion/Camera";
import { Enter, Stagger } from "../components/motion/Enter";
import { Move, Shake } from "../components/motion/Move";
import { Swap } from "../components/motion/Swap";
import { TextIn } from "../components/motion/TextIn";
import { Typewriter } from "../components/motion/Typewriter";
import { Wipe } from "../components/motion/Wipe";
import { WordSwap } from "../components/motion/WordSwap";
import { dim, file, termRing, Terminal } from "../components/Terminal";
import { Icon, IconName } from "../icons/Icons";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog, sans } from "../theme";

// Preview of the motion group: general wrappers and text effects any video can use.
// Section frames: Camera 0, Swap 90, Enter + Stagger 170, Typewriter 250, WordSwap 340, Wipe 420,
// TextIn + Move + Shake 500.

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontWeight: 500, fontSize: 26, color: C.mute, opacity: prog(frame, at, 8) }}>
      {children}
    </div>
  );
};

/** Plain white card (icon + title + grey line) for the demos. */
const Card: React.FC<{ icon: IconName; title: string; sub: string; w?: number; h?: number; code?: boolean; tone?: string }> = ({
  icon,
  title,
  sub,
  w = 900,
  h = 240,
  code,
  tone = C.accent,
}) => (
  <div
    style={{
      width: w,
      height: h,
      boxSizing: "border-box",
      borderRadius: 32,
      background: C.white,
      boxShadow: CARD_SHADOW,
      border: "1px solid rgba(0,0,0,0.06)",
      display: "flex",
      alignItems: "center",
      gap: 36,
      padding: "0 48px",
    }}
  >
    <div style={{ width: 120, height: 120, borderRadius: 30, background: `${tone}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={icon} size={68} color={tone} weight={2} />
    </div>
    <div>
      <div style={{ fontFamily: code ? mono : sans, fontWeight: 700, fontSize: 64, letterSpacing: code ? "-0.02em" : "-0.045em", color: C.ink }}>{title}</div>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 36, letterSpacing: "-0.02em", color: C.mute, marginTop: 6 }}>{sub}</div>
    </div>
  </div>
);

/** One-line chip (command + meaning) for the Stagger list. */
const Row: React.FC<{ cmd: string; text: string }> = ({ cmd, text }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 24, padding: "22px 34px", borderRadius: 24, background: C.white, boxShadow: CARD_SHADOW, width: 900, boxSizing: "border-box" }}>
    <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 40, color: C.accent, width: 200 }}>{cmd}</span>
    <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 40, letterSpacing: "-0.02em", color: C.ink }}>{text}</span>
  </div>
);

const Tile: React.FC<{ icon: IconName }> = ({ icon }) => (
  <div style={{ width: 150, height: 150, borderRadius: 34, background: C.white, boxShadow: CARD_SHADOW, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Icon name={icon} size={76} color={C.ink} weight={1.9} />
  </div>
);

const big: React.CSSProperties = { fontFamily: sans, fontWeight: 700, fontSize: 104, lineHeight: 1.05, letterSpacing: "-0.045em", color: C.ink };

// Camera stage: a terminal listing ~/.ssh.
const TERM_Y = 420;
const line2 = termRing(TX, TERM_Y, 28, 2, 0, 34);
const line3 = termRing(TX, TERM_Y, 28, 3, 0, 34);

export const MotionShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. Camera: zoom into line 2, pan to line 3, back out */}
    <Win from={0} to={90}>
      <Camera keys={[{ at: 30, ...line2 }, { at: 52, ...line3 }, { at: 72, ...FULL_FRAME }]}>
        <Terminal
          x={TX}
          y={TERM_Y}
          w={900}
          h={620}
          blocks={[
            {
              at: 2,
              cmd: "ls -la ~/.ssh",
              out: [dim("total 24"), [{ t: "-rw------- " }, file("id_ed25519")], [{ t: "-rw-r--r-- " }, file("id_ed25519.pub")], [{ t: "-rw-r--r-- " }, file("known_hosts")]],
            },
          ]}
        />
        <Circle at={38} until={50} {...line2} />
      </Camera>
      <Label at={0} y={250}>
        Camera · line 2 at 30, line 3 at 52, full at 72
      </Label>
    </Win>

    {/* 2. Swap: from the right, from below, in place */}
    <Win from={90} to={170}>
      <Label at={90} y={250}>
        Swap · from right · 96, 118, 140
      </Label>
      <Swap
        x={TX}
        y={300}
        items={[
          { at: 96, node: <Card icon="folder" title="ls" sub="list what is here" code /> },
          { at: 118, node: <Card icon="arrowRight" title="cd" sub="go into a folder" code /> },
          { at: 140, node: <Card icon="search" title="pwd" sub="where am I?" code /> },
        ]}
      />
      <Label at={92} y={610}>
        Swap · from below · 100, 124, 148
      </Label>
      <Swap
        x={TX}
        y={660}
        from="below"
        items={[
          { at: 100, node: <Card icon="lock" title="Locked" sub="needs your password" /> },
          { at: 124, node: <Card icon="key" title="Unlocked" sub="for 15 minutes" /> },
          { at: 148, node: <Card icon="checkCircle" title="Done" sub="sudo remembers you" tone="#34C759" /> },
        ]}
      />
      <Label at={94} y={970}>
        Swap · none (blur in place) · 104, 128
      </Label>
      <Swap
        x={TX}
        y={1020}
        from="none"
        items={[
          { at: 104, node: <div style={big}>3 commands</div> },
          { at: 128, node: <div style={{ ...big, color: C.accent }}>one habit</div> },
        ]}
      />
    </Win>

    {/* 3. Enter + Stagger */}
    <Win from={170} to={250}>
      <Label at={170} y={250}>
        Enter · from below at 174 · until 236
      </Label>
      <Enter x={TX} y={300} at={174} until={236} from="below">
        <Card icon="bolt" title="Enter" sub="any content, materialized" />
      </Enter>
      <Label at={172} y={590}>
        Stagger · column · gap 1.2 (40 ms) at 186
      </Label>
      <Stagger x={TX} y={640} at={186} from="below" dist={24}>
        <Row cmd="cp" text="copy a file" />
        <Row cmd="mv" text="move or rename" />
        <Row cmd="rm" text="delete for good" />
        <Row cmd="mkdir" text="make a folder" />
      </Stagger>
      <Label at={176} y={1100}>
        Stagger · row · gap 3 · from right at 200
      </Label>
      <Stagger x={TX} y={1150} at={200} gap={3} direction="row" space={34} from="right" dist={30}>
        <Tile icon="terminal" />
        <Tile icon="folder" />
        <Tile icon="file" />
        <Tile icon="trash" />
        <Tile icon="check" />
      </Stagger>
    </Win>

    {/* 4. Typewriter: mono with delete + retype, sans centred */}
    <Win from={250} to={340}>
      <Label at={250} y={250}>
        Typewriter · mono · delete 284 · retype
      </Label>
      <Typewriter x={TX} y={310} at={256} text="rm -rf old/" font="mono" size={96} deleteAt={284} retype="trash old/" retypeColor={C.accent} />
      <Label at={252} y={560}>
        Typewriter · sans · centred · caret blinks
      </Label>
      <Typewriter x={TX} y={620} w={900} align="center" at={262} text="it's just a file" size={104} speed={2} />
      <Label at={254} y={860}>
        Typewriter · caret typing only
      </Label>
      <Typewriter x={TX} y={920} at={270} text="ssh-keygen -t ed25519" font="mono" size={58} speed={1.5} caret="typing" color={C.mute} />
    </Win>

    {/* 5. WordSwap inside sentences */}
    <Win from={340} to={420}>
      <Label at={340} y={250}>
        WordSwap · 344 fast, 366 simple, 388 free
      </Label>
      <div style={{ position: "absolute", left: TX, top: 310, width: 900, ...big }}>
        Make it{" "}
        <WordSwap
          words={[
            { at: 344, t: "fast" },
            { at: 366, t: "simple" },
            { at: 388, t: "free" },
          ]}
        />
        .<br />
        <span style={{ color: C.mute }}>Then ship it.</span>
      </div>
      <Label at={342} y={640}>
        WordSwap · centred line
      </Label>
      <div style={{ position: "absolute", left: TX, top: 700, width: 900, textAlign: "center", ...big, fontSize: 88 }}>
        works on{" "}
        <WordSwap
          align="center"
          color={C.accent}
          words={[
            { at: 350, t: "macOS" },
            { at: 372, t: "Linux" },
            { at: 394, t: "Windows" },
          ]}
        />{" "}
        too
      </div>
      <Label at={344} y={920}>
        WordSwap · mono command
      </Label>
      <div style={{ position: "absolute", left: TX, top: 980, fontFamily: mono, fontWeight: 700, fontSize: 64, color: C.ink, letterSpacing: "-0.02em" }}>
        git{" "}
        <WordSwap
          words={[
            { at: 0, t: "add" },
            { at: 356, t: "commit" },
            { at: 378, t: "push" },
          ]}
        />{" "}
        <span style={{ color: C.mute }}>-v</span>
      </div>
    </Win>

    {/* 6. Wipe: left, top, circle from the icon */}
    <Win from={420} to={500}>
      <Label at={420} y={250}>
        Wipe · left at 424 · until 482
      </Label>
      <Wipe x={TX} y={300} at={424} until={482}>
        <Card icon="eye" title="Revealed" sub="left to right, hard edge" />
      </Wipe>
      <Label at={422} y={590}>
        Wipe · top at 432
      </Label>
      <Wipe x={TX} y={640} at={432} kind="top">
        <Card icon="arrowDown" title="Top down" sub="for lists and panels" />
      </Wipe>
      <Label at={424} y={930}>
        Wipe · circle from the icon at 440
      </Label>
      <Wipe x={TX} y={980} at={440} kind="circle" cx={108} cy={120} dur={22}>
        <Card icon="lock" title="Circle" sub="grows from a point" />
      </Wipe>
    </Win>

    {/* 7. TextIn, Move, Shake */}
    <Win from={500} to={600}>
      <Label at={500} y={250}>
        TextIn · by word at 504 · blue word 2
      </Label>
      <TextIn x={TX} y={300} w={900} at={504} text={"Your key never\nleaves your laptop."} colors={{ 2: C.accent }} size={96} />
      <Label at={502} y={560}>
        TextIn · by char at 516
      </Label>
      <TextIn x={TX} y={610} at={516} by="char" text="one letter at a time" size={72} color={C.mute} weight={600} />
      <Label at={504} y={780}>
        Move · 540 right + up, 562 back · scale 1.15
      </Label>
      <Move
        keys={[
          { at: 540, x: 360, y: -20, scale: 1.15 },
          { at: 562, x: 0, y: 0, scale: 1 },
        ]}
        origin={`${TX + 170}px 880px`}
      >
        <div style={{ position: "absolute", left: TX, top: 840, padding: "18px 30px", borderRadius: 40, background: C.white, boxShadow: CARD_SHADOW, fontFamily: mono, fontWeight: 700, fontSize: 38, color: C.ink }}>
          id_ed25519.pub
        </div>
      </Move>
      <Label at={506} y={1000}>
        Shake · 576 wrong password
      </Label>
      <Shake x={TX} y={1050} at={576}>
        <div
          style={{
            width: 900,
            boxSizing: "border-box",
            padding: "30px 40px",
            borderRadius: 28,
            background: C.white,
            boxShadow: CARD_SHADOW,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: "0.12em",
            color: C.ink,
          }}
        >
          ••••••••
        </div>
      </Shake>
      <Enter x={TX} y={1190} at={578} from="below" dist={16}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 40, letterSpacing: "-0.02em", color: RED }}>Sorry, try again.</div>
      </Enter>
    </Win>
  </AbsoluteFill>
);
