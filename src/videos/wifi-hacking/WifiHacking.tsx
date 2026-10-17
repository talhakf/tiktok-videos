import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Composition, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Cover, CoverStill, CW, CX } from "../../components/Cover";
import { Captions } from "../../components/Captions";
import { Note, Sticker } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Headline } from "../../components/Headline";
import { PeekOver } from "../../components/PeekOver";
import { SaveOutro } from "../../components/SaveOutro";
import { dim } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { BarCompare } from "../../components/data/BarCompare";
import { Arrow, arrowPath, Packet } from "../../components/diagram/Arrow";
import { Badge } from "../../components/diagram/Badge";
import { anchors, Node } from "../../components/diagram/Node";
import { GuessList } from "../../components/text/GuessList";
import { Marker } from "../../components/text/Marker";
import { BuildList } from "../../components/layouts/BuildList";
import { ToggleList } from "../../components/layouts/ToggleList";
import { Verdict } from "../../components/layouts/Verdict";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, materialize, mono, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/wifi-hacking/captions.json";

// How hackers crack Wi-Fi (and the settings that stop them). Defensive concept explainer: no tools, no commands.
// Third Wi-Fi video after wifi-passwords (read your own saved password) and who-on-wifi (list devices).
// Facts + sources: SudoRaccoon/Videos/wifi-hacking.md → Why now (evidence). Design + motion: Playbook/Design system.md.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

export const WifiHackingComposition = () => (
  <>
    <Composition id="WifiHacking" component={WifiHacking} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="WifiHackingCover" component={WifiHackingCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      dont: at("don't"),
      record: at("record"),
      home: at("home"),
      tonight: at("tonight"),
      laptop: at("laptop"),
      chips: at("chips"),
      join: at("every"),
      fourway: at("four-way"),
      never: at("never"),
      proof: at("proof"),
      anyone: at("anyone"),
      record2: at("record", 2),
      nobody: at("nobody"),
      kick: at("kick"),
      again: at("again"),
      now: at("now"),
      offline: at("offline"),
      checked: at("checked"),
      lockout: at("lockout"),
      alarm: at("alarm"),
      gaming: at("gaming"),
      million: at("million"),
      leaked: at("leaked"),
      six: at("six"),
      eight: at("eight"),
      day: at("day"),
      five: at("five"),
      years: at("years"),
      door: at("wps") - 12,
      wps: at("wps"),
      sticker: at("sticker"),
      halves: at("halves"),
      checksum: at("checksum"),
      hundred: at("100"),
      eleven: at("11000"),
      hours: at("hours"),
      hands: at("hands"),
      stopAll: at("settings"),
      t1: at("one", 3),
      passphrase: at("passphrase"),
      twenty: at("20"),
      t2: at("two", 3),
      useless: at("useless"),
      live: at("live"),
      blocks: at("blocks"),
      older: at("older"),
      mixed: at("mixed"),
      aes: at("aes"),
      tkip: at("tkip"),
      t3: at("three"),
      turn: at("turn"),
      t4: at("four", 3),
      firmware: at("firmware"),
      krack: at("krack"),
      fix: at("fix"),
      sudoChecks: at("sudo", 2),
      wpsOff: at("wps", 4),
      trash: at("trash"),
      crime: at("cracking"),
      raccoons: at("raccoons"),
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

// ---------------- shared diagram: your phone ⇄ your router ----------------
const PHONE = { x: 250, y: 640, w: 280, icon: "phone" as const };
const ROUTER = { x: 830, y: 640, w: 280, icon: "router" as const };
const LINK = { from: anchors(PHONE).right, to: anchors(ROUTER).left };

// ---------------- hook: the handshake is copied and taken home ----------------
const HOUSE = { x: 540, y: 1010, w: 420, icon: "house" as const };
const DROP = arrowPath({ from: { x: 540, y: 660 }, to: anchors(HOUSE).top });
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="How hackers crack Wi-Fi." b="They take it home." until={T.tonight} size={76} />
    <Arrow from={{ x: 540, y: 660 }} to={anchors(HOUSE).top} at={-100} dashed />
    <Node {...PHONE} label="Your phone" at={-100} />
    <Node {...ROUTER} label="Your router" at={-100} />
    <Arrow {...LINK} at={-100} both label="handshake" />
    <Packet path={arrowPath(LINK)} at={0} dur={22} loop={6} every={26} />
    <Badge x={anchors(ROUTER).tr.x} y={anchors(ROUTER).tr.y} icon="cross" tone="red" at={T.dont + 4} />
    <Packet path={DROP} at={T.record} dur={Math.max(24, T.home - T.record)} label="recording" icon="download" />
    <Node {...HOUSE} label="Home" sub="offline, no router" at={-100} states={[{ at: T.home, state: "active" }]} />
    {/* Sudo already peeks over the house: his place, his recording */}
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={560} edgeY={anchors(HOUSE).top.y} w={200} h={160} overhang={22} />
  </>
);

// ---------------- Sudo outside your window, with chips ----------------
const Window: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Headline a="Sudo is outside your window." b="Laptop, chips, bad intentions." at={T.tonight} bAt={T.laptop} size={68} />
      <div style={{ position: "absolute", left: 760, top: 470, opacity: prog(frame, T.tonight + 4, 10) }}>
        <Icon name="moon" size={170} color={C.mute} weight={1.6} draw={prog(frame, T.tonight + 4, 18)} />
      </div>
      <Sticker src="raccoon/night-snack.png" at={T.tonight + 2} x={190} y={560} w={640} fadeBottom={80} />
    </>
  );
};

// ---------------- the handshake: proof of the password crosses the air, anyone nearby can record it ----------------
const SUDO_LAPTOP = { x: 400, y: 1000, w: 420, h: 120, icon: "laptop" as const, iconPos: "left" as const };
const Handshake: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const path = arrowPath(LINK);
  const copy = arrowPath({ from: { x: 540, y: 670 }, to: anchors(SUDO_LAPTOP).top });
  // phone drops off on "kick" and rejoins on "again"
  const off = frame >= T.kick && frame < T.again;
  return (
    <>
      <Headline a="Your phone joins your Wi-Fi." b="A 4-way handshake." at={T.join} bAt={T.fourway} until={T.anyone} size={66} />
      <Headline a="Anyone nearby can record it." b="Nobody joining? Kick, rejoin." at={T.anyone} bAt={T.nobody} size={66} />
      <Node {...PHONE} label="Your phone" at={T.join} states={[{ at: T.kick, state: "dim" }, { at: T.again, state: "idle" }]} />
      <Node {...ROUTER} label="Your router" at={T.join + 3} />
      <Arrow {...LINK} at={T.fourway - 4} both label={off ? "dropped" : "4-way handshake"} active={T.proof} />
      {/* four messages, alternating direction, on "four-way handshake" */}
      {[0, 1, 2, 3].map((i) => (
        <Packet key={i} path={path} at={T.fourway + i * 8} dur={14} reverse={i % 2 === 0} />
      ))}
      <Note at={T.never} until={T.anyone} x={TX} y={820} size={38}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Icon name="key" size={44} color={C.mute} weight={2.2} />
            <span>
              Password: <Marker kind="strike" at={T.never + 6}>sent</Marker> never sent
            </span>
          </div>
          {frame >= T.proof ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, ...materialize(prog(frame, T.proof, 10)) }}>
              <Icon name="shieldCheck" size={44} color={C.accent} weight={2.2} />
              <span style={{ color: C.accent }}>Proof you know it: in the air</span>
            </div>
          ) : null}
        </div>
      </Note>
      <Node {...SUDO_LAPTOP} label="Sudo's laptop" sub="just listening" at={T.anyone} states={[{ at: T.record2, state: "active" }]} />
      <Packet path={copy} at={T.record2} dur={22} label="copy" icon="download" />
      <Packet path={path} at={T.again} dur={14} />
      <Packet path={copy} at={T.again + 10} dur={22} label="copy" icon="download" />
      <Sticker src="raccoon/sneaking.png" at={T.anyone + 6} x={W - 360} y={1010} w={360} from="right" />
    </>
  );
};

// ---------------- offline guessing at home ----------------
const WORDS = ["password", "12345678", "iloveyou", "sunshine", "princess", "football", "trashpanda", "snacks123", "qwertyui", "letmein1", "dragon12", "monkey99"];
const Offline: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Guessing happens offline." b="No lockout. No alarm." at={T.now} bAt={T.lockout} until={T.leaked} size={70} />
    <GuessList words={WORDS} hit={-1} x={TX} y={460} w={TW} at={T.offline} until={T.leaked} rate={7} accel={0.6} rows={5} size={40} title="guesses vs the recording" icon="download" countTo={10_000_000} countLabel="guesses" />
    <Node x={300} y={1095} w={420} h={110} icon="router" iconPos="left" label="Your router" sub="sees nothing" at={T.checked + 8} until={T.leaked} state="dim" />
    <Badge x={480} y={1060} icon="eyeOff" tone="grey" at={T.lockout} until={T.leaked} />
    <Note at={T.gaming} until={T.leaked} x={560} y={1050} size={34}>
      {"1 gaming GPU\n≈ 2.5 million / s"}
    </Note>
  </>
);

// ---------------- how long that takes ----------------
const CrackTimes: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="How long until it's cracked?" b="One gaming graphics card." at={T.leaked} until={T.door} size={70} />
    <BarCompare
      x={TX}
      y={520}
      w={TW}
      at={T.leaked}
      until={T.door}
      log
      labelW={330}
      valueW={270}
      fontSize={40}
      barH={84}
      gap={64}
      rows={[
        { label: "leaked list", value: 6, display: "6 seconds", at: T.six },
        { label: "8 lowercase", value: 82_000, display: "about a day", at: T.day },
        { label: "5 random words", value: 1.1e13, display: "300,000+ years", at: T.years, highlight: true },
      ]}
    />
    <Note at={T.years + 6} until={T.door} x={TX} y={1010} size={34}>
      {"Leaked list: 14 million passwords\nWords: random, from a 7,776-word list"}
    </Note>
  </>
);

// ---------------- second door: the WPS PIN ----------------
const Digit: React.FC<{ d: string; tone: "a" | "b" | "c"; at: number; p: number }> = ({ d, tone, p }) => (
  <div
    style={{
      width: 92,
      height: 124,
      borderRadius: 20,
      background: tone === "c" ? C.soft : C.white,
      border: `3px solid ${tone === "a" ? C.accent : tone === "b" ? "#5E5CE6" : "rgba(0,0,0,0.10)"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: mono,
      fontWeight: 600,
      fontSize: 64,
      color: tone === "c" ? C.mute : C.ink,
      boxShadow: "0 10px 24px rgba(0,0,0,0.07)",
      ...materialize(p),
    }}
  >
    {d}
  </div>
);
const PIN = "12345670"; // made-up PIN whose last digit is the valid WPS checksum
const Wps: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const split = prog(frame, T.halves, 12);
  const sum = frame >= T.checksum;
  const y = 560;
  return (
    <>
      <Headline a="Second door: WPS." b="An 8-digit PIN on the sticker." at={T.door} bAt={T.sticker} until={T.hands} size={70} />
      <div style={{ position: "absolute", left: TX, top: y, width: TW, display: "flex", justifyContent: "center", gap: 14 }}>
        {PIN.split("").map((d, i) => (
          <div key={i} style={{ marginLeft: i === 4 ? 14 + split * 46 : 0 }}>
            <Digit d={d} tone={frame < T.halves ? "c" : i < 4 ? "a" : i < 7 || !sum ? "b" : "c"} at={T.wps} p={prog(frame, T.wps + i * 1.2, 9)} />
          </div>
        ))}
      </div>
      {frame >= T.halves ? (
        <>
          <div style={{ position: "absolute", left: 132, top: y + 146, fontFamily: sans, fontWeight: 600, fontSize: 32, color: C.accent, ...materialize(split) }}>1st half: checked alone</div>
          <div style={{ position: "absolute", left: 600, top: y + 146, fontFamily: sans, fontWeight: 600, fontSize: 32, color: "#5E5CE6", ...materialize(split) }}>2nd half: checked alone</div>
        </>
      ) : null}
      {sum ? (
        <div style={{ position: "absolute", left: 830, top: y - 56, fontFamily: sans, fontWeight: 600, fontSize: 28, color: C.mute, ...materialize(prog(frame, T.checksum, 10)) }}>checksum</div>
      ) : null}
      {frame >= T.hundred ? (
        <div style={{ position: "absolute", left: TX, top: 830, width: TW, display: "flex", alignItems: "baseline", gap: 34, fontFamily: sans, fontWeight: 700, letterSpacing: "-0.04em", ...materialize(prog(frame, T.hundred, 10)) }}>
          <span style={{ fontSize: 80, color: C.mute }}>
            <Marker kind="strike" at={T.eleven - 6} color={"#FF3B30"}>100,000,000</Marker>
          </span>
          {frame >= T.eleven ? (
            <span style={{ fontSize: 96, color: C.ink, ...materialize(prog(frame, T.eleven, 10)) }}>11,000</span>
          ) : null}
        </div>
      ) : null}
      {frame >= T.eleven ? (
        <div style={{ position: "absolute", left: TX, top: 960, fontFamily: sans, fontWeight: 600, fontSize: 34, color: C.mute, ...materialize(prog(frame, T.eleven + 4, 10)) }}>
          guesses at most = 10,000 + 1,000
        </div>
      ) : null}
      <Note at={T.hours} until={T.hands} x={TX} y={1050} size={36}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Icon name="clock" size={44} color={C.accent} weight={2.2} />
          No lockout: under 4 hours
        </div>
      </Note>
      <Sticker src="raccoon/scheming.png" at={T.halves} until={T.hands} x={W - 330} y={1030} w={220} />
    </>
  );
};
const HandsOver: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const path = arrowPath({ from: { x: 700, y: 640 }, to: { x: 380, y: 640 } });
  return (
    <>
      <Headline a="Then the router hands over" b="your Wi-Fi password." at={T.hands} size={70} />
      <Node x={250} y={640} w={280} icon="laptop" label="Sudo's laptop" at={T.hands} />
      <Node x={830} y={640} w={280} icon="router" label="Your router" at={T.hands + 2} states={[{ at: T.hands + 8, state: "error" }]} />
      <Packet path={path} at={T.hands + 10} dur={26} label="Wi-Fi password" icon="key" color={"#FF3B30"} />
      {frame >= T.hands + 36 ? (
        <div style={{ position: "absolute", left: TX, top: 860, width: TW, textAlign: "center", fontFamily: sans, fontWeight: 700, fontSize: 52, letterSpacing: "-0.03em", color: C.ink, ...materialize(prog(frame, T.hands + 36, 10)) }}>
          length doesn't matter here
        </div>
      ) : null}
    </>
  );
};

// ---------------- the four settings ----------------
const BIG = { fontFamily: sans, fontWeight: 700, letterSpacing: "-0.04em", color: C.ink } as const;
const Fix1: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const words = ["raccoon", "velvet", "toaster", "orbit", "pickle"];
  return (
    <>
      <div style={{ position: "absolute", left: TX, top: 500, fontFamily: mono, fontWeight: 500, fontSize: 30, color: C.mute, opacity: prog(frame, T.passphrase, 10) }}>
        Wi-Fi password
      </div>
      <div style={{ position: "absolute", left: TX, top: 550, width: TW, display: "flex", flexWrap: "wrap", gap: 16 }}>
        {words.map((w, i) => (
          <div
            key={w}
            style={{
              padding: "18px 30px",
              borderRadius: 999,
              background: C.white,
              border: `3px solid ${C.accent}`,
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 46,
              color: C.ink,
              boxShadow: "0 10px 24px rgba(0,0,0,0.07)",
              ...materialize(prog(frame, T.passphrase + 6 + i * 3, 9)),
            }}
          >
            {w}
          </div>
        ))}
      </div>
      <Note at={T.twenty} x={TX} y={820} size={38}>
        {"5 random words\nor 20+ characters"}
      </Note>
      <Verdict kind="fact" label="300,000+ years" at={T.twenty + 14} x={TX + 470} y={850} size={0.8} />
    </>
  );
};
const Fix2: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Node {...PHONE} y={560} label="Your phone" at={T.t2} />
      <Node {...ROUTER} y={560} label="Your router" at={T.t2 + 2} states={[{ at: T.live, state: "active" }]} />
      <Arrow from={{ x: LINK.from.x, y: 560 }} to={{ x: LINK.to.x, y: 560 }} at={T.t2 + 4} both label="WPA3 handshake" active={T.t2 + 10} />
      <Packet path={arrowPath({ from: { x: LINK.from.x, y: 560 }, to: { x: LINK.to.x, y: 560 } })} at={T.live} dur={14} loop={3} every={10} />
      <Note at={T.useless} until={T.older} x={TX} y={760} size={36}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span>
            Recording: <span style={{ color: "#FF3B30" }}>useless</span>
          </span>
          {frame >= T.live ? <span style={{ ...materialize(prog(frame, T.live, 10)) }}>Every guess: asks your router, live</span> : null}
          {frame >= T.blocks ? <span style={{ color: C.accent, ...materialize(prog(frame, T.blocks, 10)) }}>Kick-off trick: blocked</span> : null}
        </div>
      </Note>
      <BuildList
        card
        x={TX}
        y={760}
        w={TW}
        at={T.older}
        textSize={32}
        rows={[
          { at: T.older, text: "WPA3", mark: "check", h: 92 },
          { at: T.mixed, text: "WPA2/WPA3 mixed: older devices", mark: "check", h: 92 },
          { at: T.aes, text: "WPA2 with AES", mark: "check", h: 92 },
          { at: T.tkip, text: "TKIP, WEP: never", mark: "cross", h: 92 },
        ]}
      />
    </>
  );
};
const Fix3: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <ToggleList x={TX} y={500} w={TW} at={T.t3} size={44} rowH={150} title="Wireless" rows={[{ label: "WPS", sub: "PIN + push button", icon: "lock", on: true, flips: [T.turn + 6] }]} />
    <Note at={T.turn + 14} x={TX} y={780} size={40}>
      {"No PIN = no second door"}
    </Note>
    <Sticker src="raccoon/oops.png" at={T.turn + 10} x={W - 400} y={900} w={300} fadeBottom={60} />
  </>
);

const Fix4: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Node x={540} y={600} w={520} h={140} icon="router" iconPos="left" label="Firmware update" sub="router settings → update" at={T.t4} states={[{ at: T.fix, state: "ok" }]} />
      {frame >= T.krack ? (
        <div style={{ position: "absolute", left: TX, top: 760, width: TW, ...materialize(prog(frame, T.krack, 10)) }}>
          <div style={{ ...BIG, fontSize: 64 }}>2017: KRACK</div>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 38, color: C.mute, marginTop: 8 }}>a hole in WPA2 itself</div>
        </div>
      ) : null}
      <Verdict kind="fact" label="fixed by an update" at={T.fix + 4} x={TX} y={960} size={0.8} />
    </>
  );
};

// ---------------- Sudo gives up ----------------
const GiveUp: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="WPA3. WPS off." b="Sudo goes back to the trash." at={T.sudoChecks} bAt={T.trash - 6} until={T.crime} size={60} />
    <ToggleList
      x={TX}
      y={500}
      w={TW}
      at={T.sudoChecks}
      size={34}
      rowH={96}
      rows={[
        { label: "WPA3", on: true },
        { label: "WPS", on: false },
      ]}
    />
    <Sticker src="raccoon/trash-bin.png" at={T.trash - 4} until={T.crime} x={TX + 340} y={850} w={250} />
  </>
);
const Crime: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Not your Wi-Fi?" b="Cracking it is a crime." at={T.crime} bAt={T.crime + 20} size={80} />
    <div style={{ position: "absolute", left: TX, top: 520 }}>
      <Icon name="shield" size={260} color={C.accent} weight={1.6} />
    </div>
    <Sticker src="raccoon/side-eye.png" at={T.raccoons} x={W - 520} y={700} w={520} fadeBottom={60} />
  </>
);

export const WifiHacking: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.sudoChecks}
        tools={[
          { from: T.t1, name: "passphrase", repo: "5 random words or 20+ characters", n: 1, of: 4 },
          { from: T.t2, name: "WPA3", repo: "or WPA2 with AES, never TKIP or WEP", n: 2, of: 4 },
          { from: T.t3, name: "WPS off", repo: "router settings → wireless", n: 3, of: 4 },
          { from: T.t4, name: "firmware", repo: "keep the router updated", n: 4, of: 4 },
        ]}
      />
      <Headline a="4 settings" b="that stop all of this." at={T.stopAll - 8} until={T.t1} size={96} y={640} />

      <Win from={0} to={T.tonight}>
        <Hook T={T} />
      </Win>
      <Win from={T.tonight} to={T.join}>
        <Window T={T} />
      </Win>
      <Win from={T.join} to={T.now}>
        <Handshake T={T} />
      </Win>
      <Win from={T.now} to={T.leaked}>
        <Offline T={T} />
      </Win>
      <Win from={T.leaked} to={T.door}>
        <CrackTimes T={T} />
      </Win>
      <Win from={T.door} to={T.hands}>
        <Wps T={T} />
      </Win>
      <Win from={T.hands} to={T.stopAll - 8}>
        <HandsOver T={T} />
      </Win>
      <Win from={T.t1} to={T.t2}>
        <Fix1 T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <Fix2 T={T} />
      </Win>
      <Win from={T.t3} to={T.t4}>
        <Fix3 T={T} />
      </Win>
      <Win from={T.t4} to={T.sudoChecks}>
        <Fix4 T={T} />
      </Win>
      <Win from={T.sudoChecks} to={T.crime}>
        <GiveUp T={T} />
      </Win>
      <Win from={T.crime} to={T.save}>
        <Crime T={T} />
      </Win>

      <SaveOutro
        at={T.save}
        h={420}
        fontSize={28}
        title="router settings"
        lines={[
          [dim("# your router's settings page")],
          [{ t: "Wi-Fi password ", c: TERM.green, b: true }, { t: "5 random words / 20+" }],
          [{ t: "Security       ", c: TERM.green, b: true }, { t: "WPA3 (or WPA2-AES)" }],
          [{ t: "WPS            ", c: TERM.green, b: true }, { t: "off" }],
          [{ t: "Firmware       ", c: TERM.green, b: true }, { t: "update" }],
          [dim("# never TKIP, never WEP")],
        ]}
        question={"Is WPS still on\nat your place?"}
      />
      <EndCard at={T.follow} comment={T.comment} line="Follow for more security tricks." question="Is WPS still on at your place?" />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("wifi-hacking/voice.mp3")} />
      <Sfx name="whoosh" at={[T.tonight, T.join, T.now, T.leaked, T.door, T.hands, T.stopAll - 8, T.t1, T.t2, T.t3, T.t4, T.sudoChecks, T.crime, T.save, T.follow]} />
      <Sfx name="switch" at={[T.mixed + 4, T.turn + 6]} />
      <Sfx name="ding" at={[T.years, T.eleven, T.fix]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
export const WifiHackingCover: React.FC = () => (
  <Cover title="Hackers crack Wi-Fi." sub="4 settings stop them." chips={["WPA3", "WPS off", "long passphrase"]} size={86}>
    <ToggleList
      x={CX}
      y={450}
      w={CW}
      at={-100}
      size={38}
      rowH={110}
      rows={[
        { label: "WPA3", sub: "no offline guessing", icon: "shieldCheck", on: true, at: -100 },
        { label: "WPS", sub: "the second door", icon: "lock", on: false, at: -100 },
        { label: "Firmware updates", sub: "automatic", icon: "refresh", on: true, at: -100 },
      ]}
    />
    <Sticker src="raccoon/side-eye.png" at={-100} x={1080 - 400} y={800} w={400} fadeBottom={60} />
    <div style={{ position: "absolute", left: CX, top: 860, fontFamily: mono, fontWeight: 500, fontSize: 36, lineHeight: 1.35, color: C.mute, whiteSpace: "pre" }}>
      {"5 random words:\n300,000+ years"}
    </div>
  </Cover>
);
