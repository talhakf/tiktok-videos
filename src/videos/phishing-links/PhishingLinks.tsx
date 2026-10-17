import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Composition, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Cover, CoverStill, CX } from "../../components/Cover";
import { Captions } from "../../components/Captions";
import { Circle, Note, Sticker } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Headline } from "../../components/Headline";
import { SaveOutro } from "../../components/SaveOutro";
import { dim, type Line } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { Countdown } from "../../components/data/Countdown";
import { OptionPills } from "../../components/layouts/OptionPills";
import { GREEN, RED } from "../../components/layouts/Mark";
import { Verdict } from "../../components/layouts/Verdict";
import { Enter } from "../../components/motion/Enter";
import { Annotate } from "../../components/text/Annotate";
import { LetterSplit } from "../../components/text/LetterSplit";
import { UrlBar } from "../../components/windows/UrlBar";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, mono, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/phishing-links/captions.json";

// Spot a fake link in 3 seconds: the real owner is the name right before the ending (.com), before the first single slash.
// Facts + sources: SudoRaccoon/Videos/phishing-links.md. Design + motion: Playbook/Design system.md.
// Fake domains are made up and not registered (secure-login.xyz: NXDOMAIN on 2026-10-11); paypa1.com is registered
// through MarkMonitor (likely defensive), shown only as a look-alike spelling.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

const OPTIONS = ["paypal.com.secure-login.xyz", "secure-login.xyz/paypal.com", "www.paypal.com/signin", "paypa1.com/signin"];
const REAL = 2; // the third one

const RULE_URL = "https://www.paypal.com/signin";
const T1_URL = "paypal.com.secure-login.xyz/signin";
const T2_URL = "secure-login.xyz/paypal.com";

const MONO_W = 0.6; // JetBrains Mono advance per font px
const annW = (text: string, size: number) => text.length * MONO_W * size + 60; // Annotate card width (padX 30)
const centerX = (text: string, size: number) => Math.round((W - annW(text, size)) / 2);
/** Focus ring around chars [from, to) of an Annotate card at x, y. */
const annRing = (x: number, y: number, size: number, from: number, to: number) => ({
  x: x + 30 + from * MONO_W * size - 10,
  y: y + 22 - 8,
  w: (to - from) * MONO_W * size + 20,
  h: size * 1.3 + 16,
});

export const PhishingLinksComposition = () => (
  <>
    <Composition id="PhishingLinks" component={PhishingLinks} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="PhishingLinksCover" component={PhishingLinksCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      really: at("really"),
      count: at("three", 2), // "Three. Two. One."
      sudo: at("sudo"),
      masked: at("masked"),
      knows: at("knows"),
      rule: at("rule"),
      find: at("find"),
      slash1: at("slash"),
      https: at("https"),
      ending: at("ending"),
      com: at("com"),
      owns: at("owns"),
      make: at("make"),
      t1: at("trick", 2),
      front: at("front", 2),
      belongs: at("belongs"),
      owner1: at("secure-loginxyz"),
      not: at("not"),
      t2: at("trick", 3),
      slash2: at("slash", 2),
      page: at("page"),
      anyone: at("anyone"),
      t3: at("trick", 4),
      lookalike: at("look-alike"),
      one1: at("1"),
      ell: at("l"),
      rn: at("rn"),
      looks: at("looks"),
      m: at("m"),
      bonus: at("bonus"),
      padlock: at("padlock"),
      nope: at("nope"),
      encrypted: at("encrypted"),
      free: at("free"),
      so: at("so", 2),
      third: at("third"),
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

// ---------------- hook: four links on screen from frame 0, the countdown on the spoken numbers ----------------
const PILLS_Y = 450;
const PILL_H = 112;
const PILL_GAP = 20;
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Spot a fake link" b="in 3 seconds." size={84} until={T.sudo} />
    <OptionPills options={OPTIONS} at={-40} x={TX} y={PILLS_Y} h={PILL_H} gap={PILL_GAP} size={40} />
    {/* the voice counts at ~1s steps (three 5.1s, two 5.8s, one 7.0s): the ring starts just before "three" */}
    <Countdown at={T.count - 3} x={TX + 20} y={1010} size={220} />
    <Sticker src="raccoon/side-eye.png" at={-20} x={590} y={1010} w={400} fadeBottom={60} />
  </>
);

// ---------------- Sudo, the masked bandit: 1 rule, 3 tricks, 1 myth ----------------
const Story: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Sudo is a masked bandit." b="He knows every trick." at={T.sudo} bAt={T.knows} size={72} />
    <Enter at={T.masked} x={TX + 10} y={470}>
      <Icon name="mask" size={200} color={C.ink} weight={1.6} />
    </Enter>
    <Sticker src="raccoon/head-front.png" at={T.sudo + 4} x={W - 470} y={460} w={470} from="right" />
    {["1 rule", "3 tricks", "1 myth"].map((t, i) => (
      <Note key={t} at={T.rule + i * 4} x={TX} y={760 + i * 130} size={44}>
        {t}
      </Note>
    ))}
  </>
);

// ---------------- the rule: first single slash, the name before the ending owns it ----------------
const RS = 44;
const RX = centerX(RULE_URL, RS);
const RY = 560;
const Rule: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Find the first single /." b="The name before .com owns it." at={T.find} bAt={T.ending} size={60} until={T.t1} />
    <Annotate
      text={RULE_URL}
      at={T.find}
      x={RX}
      y={RY}
      size={RS}
      segments={[
        { from: 18, to: 22, label: "ending", at: T.com },
        { from: 12, to: 18, label: "owner", at: T.owns, color: C.accent },
        { from: 8, to: 12, label: "made up", at: T.make },
      ]}
      focus={{ index: 1, at: T.owns + 6, until: T.make }}
    />
    {/* the slash after the host (index 22), not the two in https:// */}
    <Circle at={T.slash1} until={T.ending} {...annRing(RX, RY, RS, 22, 23)} />
    <Note at={T.https} until={T.ending} x={TX} y={RY + 230} font="mono" size={36}>
      {"not the // in https://"}
    </Note>
    <Note at={T.owns + 4} x={TX} y={RY + 230}>
      {"paypal.com = PayPal"}
    </Note>
    <Sticker src="raccoon/pointing.png" at={T.slash1} x={TX + 640} y={1000} w={250} />
  </>
);

// ---------------- 1/3 brand in front ----------------
const T1S = 40;
const T1X = centerX(T1_URL, T1S);
const T1Y = 540;
const Trick1: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Annotate
      text={T1_URL}
      at={T.t1 + 4}
      x={T1X}
      y={T1Y}
      size={T1S}
      segments={[
        { from: 0, to: 11, label: "made up", at: T.front },
        { from: 11, to: 27, label: "the owner", at: T.owner1, color: RED },
      ]}
      focus={{ index: 1, at: T.owner1 + 4 }}
    />
    <Circle at={T.belongs} until={T.owner1 + 4} {...annRing(T1X, T1Y, T1S, 27, 28)} />
    <Verdict at={T.not} x={TX} y={T1Y + 260} kind="myth" label="not paypal" />
    <Sticker src="raccoon/sneaking.png" at={T.owner1} x={W - 440} y={1000} w={440} from="right" />
  </>
);

// ---------------- 2/3 brand after the slash ----------------
const T2S = 44;
const T2X = centerX(T2_URL, T2S);
const T2Y = 540;
const Trick2: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Annotate
      text={T2_URL}
      at={T.t2 + 4}
      x={T2X}
      y={T2Y}
      size={T2S}
      segments={[
        { from: 0, to: 16, label: "the owner", at: T.slash2 + 4, color: RED },
        { from: 16, to: 27, label: "just a page", at: T.page },
      ]}
    />
    <Circle at={T.slash2} until={T.page} {...annRing(T2X, T2Y, T2S, 16, 17)} />
    <Note at={T.anyone} x={TX} y={T2Y + 260} font="mono" size={36}>
      {"/paypal  /bank  /login\n= any name they like"}
    </Note>
    <Sticker src="raccoon/scheming.png" at={T.anyone + 6} x={TX + 660} y={1060} w={230} />
  </>
);

// ---------------- 3/3 look-alike letters ----------------
const GLYPH: React.CSSProperties = { fontFamily: sans, fontWeight: 700, fontSize: 240, lineHeight: 1, letterSpacing: "-0.03em", color: C.ink };
const SUB: React.CSSProperties = { fontFamily: sans, fontWeight: 600, fontSize: 40, color: C.mute, marginTop: 18, textAlign: "center" };
const Trick3: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <LetterSplit chunks={[{ t: "paypa1.com" }]} at={T.t3 + 4} until={T.rn - 2} x={TX} y={700} w={900} size={140} zoom={{ index: 5, at: T.one1, label: "a one, not an l", color: RED }} />
    <div style={{ position: "absolute", left: TX, top: 560, width: 900, display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 70 }}>
      <Enter at={T.rn} inline>
        <div style={GLYPH}>rn</div>
        <div style={SUB}>r + n</div>
      </Enter>
      <Enter at={T.looks} inline>
        <div style={{ ...GLYPH, color: C.mute }}>≈</div>
      </Enter>
      <Enter at={T.m} inline from="right">
        <div style={GLYPH}>m</div>
        <div style={SUB}>m</div>
      </Enter>
    </div>
    <Note at={T.m + 8} x={TX} y={960}>
      {"Zoom in before you tap"}
    </Note>
    <Sticker src="raccoon/peek-pillar.png" at={T.lookalike} x={W - 190} y={950} w={190} from="right" />
  </>
);

// ---------------- bonus myth: the padlock ----------------
const LOCK_Y = 520;
const LS = 44; // url bar font size
const Padlock: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  // lock icon in the bar: left padding 0.8 × size + border 3, icon 0.9 × size, centred in the 2.1 × size pill
  const lx = TX + 3 + 0.8 * LS + 0.45 * LS;
  const ly = LOCK_Y + 1.05 * LS;
  return (
    <>
      <Headline a="Bonus myth:" b="the padlock = safe." at={T.bonus} bAt={T.padlock} size={84} until={T.so} />
      <UrlBar url={OPTIONS[0]} x={TX} y={LOCK_Y} w={900} size={LS} align="left" at={T.bonus + 4} state="safe" stateAt={T.padlock} />
      <Circle at={T.padlock} until={T.nope} x={lx - 30} y={ly - 30} w={60} h={60} />
      <div style={{ position: "absolute", left: TX + 40, top: 690, opacity: prog(frame, T.padlock + 4, 10) }}>
        <Icon name="lock" size={220} color={GREEN} weight={1.6} draw={prog(frame, T.padlock + 4, 16)} />
      </div>
      <Verdict at={T.nope} x={TX + 300} y={760} kind="myth" />
      <Note at={T.encrypted} x={TX} y={960}>
        {"padlock = encrypted connection\nnot an honest website"}
      </Note>
      <Note at={T.free} x={TX} y={1135}>
        {"any site gets one for free"}
      </Note>
      <Sticker src="raccoon/oops.png" at={T.nope} x={W - 250} y={930} w={220} fadeBottom={50} />
    </>
  );
};

// ---------------- reveal: the third one ----------------
const Reveal: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="The real PayPal:" b="the third one." at={T.so} bAt={T.third} size={84} />
    <OptionPills options={OPTIONS} at={T.so + 2} x={TX} y={PILLS_Y} h={PILL_H} gap={PILL_GAP} size={40} reveal={{ index: REAL, at: T.third }} />
    <Verdict at={T.third + 6} x={TX + 560} y={PILLS_Y + 4 * (PILL_H + PILL_GAP) + 30} kind="fact" label="real one" size={0.8} />
  </>
);

const cheat = (rows: [string, string][]): Line[] => [[dim("# spot a fake link")], ...rows.map(([a, b]): Line => [{ t: a.padEnd(9), c: TERM.green, b: true }, { t: b }])];

export const PhishingLinks: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <ToolHeader
        x={TX}
        y={210}
        w={900}
        until={T.bonus}
        tools={[
          { from: T.t1, name: "In front", repo: "the brand before the real name", n: 1, of: 3 },
          { from: T.t2, name: "After the /", repo: "the brand as a page name", n: 2, of: 3 },
          { from: T.t3, name: "Look-alikes", repo: "letters that look the same", n: 3, of: 3 },
        ]}
      />

      <Win from={0} to={T.sudo}>
        <Hook T={T} />
      </Win>
      <Win from={T.sudo} to={T.find}>
        <Story T={T} />
      </Win>
      <Win from={T.find} to={T.t1}>
        <Rule T={T} />
      </Win>
      <Win from={T.t1} to={T.t2}>
        <Trick1 T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <Trick2 T={T} />
      </Win>
      <Win from={T.t3} to={T.bonus}>
        <Trick3 T={T} />
      </Win>
      <Win from={T.bonus} to={T.so}>
        <Padlock T={T} />
      </Win>
      <Win from={T.so} to={T.save}>
        <Reveal T={T} />
      </Win>

      <SaveOutro
        at={T.save}
        h={380}
        fontSize={28}
        lines={cheat([
          ["find", "the first single /"],
          ["owner", "the name before .com"],
          ["fake", "brand in front or after /"],
          ["zoom", "1 vs l · rn vs m"],
          ["padlock", "encrypted, not safe"],
        ])}
        question={"Did you get it\nin 3 seconds?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="Did you get it in 3 seconds?" />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("phishing-links/voice.mp3")} />
      <Sfx name="whoosh" at={[T.sudo, T.find, T.t1, T.t2, T.t3, T.bonus, T.so, T.save, T.follow]} />
      <Sfx name="switch" at={[T.not, T.nope]} />
      <Sfx name="ding" at={[T.third]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CS = 38;
const CXU = Math.round((1080 - annW(T1_URL, CS)) / 2);
export const PhishingLinksCover: React.FC = () => (
  <Cover title="Spot a fake link" sub="in 3 seconds." chips={["1 rule", "3 tricks", "1 myth"]}>
    <Annotate
      text={T1_URL}
      at={-100}
      x={CXU}
      y={520}
      size={CS}
      segments={[
        { from: 11, to: 27, label: "the owner", at: -100, color: RED },
      ]}
      focus={{ index: 0, at: -100 }}
    />
    <Verdict at={-100} x={CX} y={800} kind="myth" label="not paypal" />
    <Sticker src="raccoon/side-eye.png" at={-100} x={600} y={790} w={400} fadeBottom={50} />
    <div style={{ position: "absolute", left: CX, top: 950, fontFamily: mono, fontWeight: 500, fontSize: 34, color: C.mute }}>
      read the name before .com
    </div>
  </Cover>
);
