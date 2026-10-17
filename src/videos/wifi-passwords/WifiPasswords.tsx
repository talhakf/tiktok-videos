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
import { SaveOutro } from "../../components/SaveOutro";
import { dim, Terminal, termRing, type Line } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { Badge } from "../../components/diagram/Badge";
import { ChatThread } from "../../components/layouts/ChatThread";
import { QrCode } from "../../components/text/QrCode";
import { SystemPrompt } from "../../components/windows/SystemPrompt";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/wifi-passwords/captions.json";

// Your computer remembers every Wi-Fi password: one command each on Mac, Linux and Windows.
// Facts + sources: SudoRaccoon/Videos/wifi-passwords.md. Design + motion: Playbook/Design system.md.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

const SSID = "TrashCafe";
const PASS = "snacks4ever";
const MAC_CMD = `security find-generic-password -wa ${SSID}`;
const NM_CMD = "nmcli device wifi show-password";
const WIN_CMD = `netsh wlan show profile name="${SSID}" key=clear`;
// The string nmcli encodes in its QR code (the standard Wi-Fi QR format); the card scans for real.
const WIFI_QR = `WIFI:S:${SSID};T:WPA;P:${PASS};;`;

export const WifiPasswordsComposition = () => (
  <>
    <Composition id="WifiPasswords" component={WifiPasswords} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="WifiPasswordsCover" component={WifiPasswordsCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      pw1: at("password"),
      oneCmd: at("one"), // "One command shows your Wi-Fi password"
      story: at("sudo's"),
      friend: at("friend"),
      online: at("online"),
      snacks: at("snacks"),
      idea: at("idea"),
      t1: at("one", 2),
      type: at("type"),
      and1: at("and", 2),
      network: at("network"),
      asks: at("asks"),
      macPw: at("mac", 2),
      then: at("then"),
      prints: at("prints"),
      pw4: at("password", 4),
      t2: at("two"),
      nmcli: at("nmclidevicewifishow-password"),
      you: at("you"),
      pw5: at("password", 5),
      qr: at("qr"),
      friend2: at("friend", 2),
      scan: at("scan"),
      t3: at("three"),
      netsh: at("netshwlanshowprofile"),
      keyclear: at("keyclear"),
      pw6: at("password", 6),
      key: at("key"),
      warn: at("only"),
      anyone: at("anyone"),
      unlocked: at("unlocked"),
      lock: at("lock"),
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

// ---------------- hook: the payoff is on screen from frame 0 ----------------
const HOOK_TY = 600;
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Your computer remembers" b="every Wi-Fi password." until={T.story} size={72} />
    <Terminal
      x={TX}
      y={HOOK_TY}
      w={TW}
      h={300}
      blocks={[{ at: -200, cmd: MAC_CMD, out: [[{ t: PASS, c: TERM.green, b: true }]] }]}
    />
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 560} edgeY={HOOK_TY} w={300} h={230} overhang={34} />
    <Circle at={T.pw1} {...termRing(TX, HOOK_TY, 28, 1, 0, PASS.length)} />
    <Note at={T.oneCmd} x={TX} y={HOOK_TY + 340}>
      Mac · Linux · Windows
    </Note>
  </>
);

// ---------------- story: a friend asks, Sudo is connected but forgot it ----------------
const Story: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <ChatThread
      x={TX}
      y={230}
      w={TW}
      contact="Bandit"
      messages={[
        { at: T.friend, typing: 14, text: "what's the café wifi\npassword?" },
        { at: T.online, me: true, text: "i'm on it right now" },
        { at: T.idea, me: true, text: "no idea what it is" },
      ]}
    />
    <Note at={T.online + 6} x={TX} y={850}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Icon name="wifi" size={44} color={C.accent} weight={2.2} />
        {SSID} · connected
      </div>
    </Note>
    <Sticker src="raccoon/night-snack.png" at={T.snacks} x={650} y={800} w={340} fadeBottom={70} />
  </>
);

// ---------------- 1/3 Mac ----------------
const MAC_H = 520;
const Mac: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = T.and1 - T.type;
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={MAC_H}
        enterAt={T.t1}
        blocks={[{ at: T.type + 2, cmd: MAC_CMD, typeFrames: tf, outDelay: Math.max(4, T.prints - (T.type + 2 + tf)), out: [[{ t: PASS, c: TERM.green, b: true }]] }]}
      />
      {/* the network name is the last word of the command */}
      <Circle at={T.network} until={T.asks} {...termRing(TX, TY, 28, 0, 4 + MAC_CMD.length - SSID.length, SSID.length)} />
      <Note at={T.network + 4} until={T.asks} x={TX} y={TY + MAC_H + 40} font="mono" size={34}>
        {SSID} = the Wi-Fi name
      </Note>
      <SystemPrompt
        at={T.asks}
        y={TY + 90}
        title="security wants to use the System keychain."
        message="Enter an administrator's name and password to allow this."
        password
        typeAt={T.macPw}
        pressAt={T.then}
      />
      <Circle at={T.pw4} {...termRing(TX, TY, 28, 1, 0, PASS.length)} />
      <Note at={T.pw4 + 4} x={TX} y={TY + MAC_H + 40}>
        It asks for your Mac password first
      </Note>
      <Sticker src="raccoon/scheming.png" at={T.prints} x={TX + 660} y={TY + MAC_H + 150} w={230} />
    </>
  );
};

// ---------------- 2/3 Linux ----------------
const NM_H = 580;
const QR = 330;
const Linux: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = 40;
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={NM_H}
        enterAt={T.t2}
        blocks={[
          {
            at: T.nmcli,
            cmd: NM_CMD,
            typeFrames: tf,
            outDelay: Math.max(4, T.you - (T.nmcli + tf)),
            out: [[dim("SSID: "), { t: SSID }], [dim("Security: "), { t: "WPA" }], [dim("Password: "), { t: PASS, c: TERM.green, b: true }]],
          },
        ]}
      />
      <Circle at={T.pw5} until={T.qr} {...termRing(TX, TY, 28, 3, 0, 10 + PASS.length)} />
      {/* nmcli prints the QR code under the password; here it sits beside the text so all of it fits */}
      <QrCode text={WIFI_QR} at={T.qr - 4} x={TX + TW - QR - 40} y={TY + 150} size={QR} dur={18} />
      <Circle at={T.scan} x={TX + TW - QR - 52} y={TY + 138} w={QR + 24} h={QR + 24} />
      <Note at={T.friend2} x={TX} y={TY + NM_H + 40}>
        Your friend scans it and joins
      </Note>
      <Sticker src="raccoon/duo-huddle.png" at={T.friend2 + 6} x={TX + 650} y={TY + NM_H + 30} w={230} />
    </>
  );
};

// ---------------- 3/3 Windows ----------------
const WIN_H = 520;
const WFS = 25;
const pad = (label: string) => `    ${label.padEnd(23)}: `;
const Windows: React.FC<{ T: Cues }> = ({ T }) => {
  const at = T.netsh;
  const tf = T.keyclear + 18 - at;
  const out: Line[] = [
    `Profile ${SSID} on interface Wi-Fi:`,
    [dim("…")],
    "Security settings",
    "-----------------",
    pad("Authentication") + "WPA2-Personal",
    pad("Security key") + "Present",
    [{ t: pad("Key Content") }, { t: PASS, c: TERM.green, b: true }],
  ];
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={WIN_H}
        title="Command Prompt"
        prompt="C:\> "
        fontSize={WFS}
        enterAt={T.t3}
        blocks={[{ at, cmd: WIN_CMD, typeFrames: tf, outDelay: Math.max(4, T.pw6 - (at + tf)), out }]}
      />
      <Circle at={T.key} {...termRing(TX, TY, WFS, 7, 4, 36)} />
      <Note at={T.key + 8} x={TX} y={TY + WIN_H + 40} font="mono" size={30}>
        {"netsh wlan show profiles\n= every saved network"}
      </Note>
      <Sticker src="raccoon/pointing.png" at={T.pw6} x={TX + 640} y={TY + WIN_H + 20} w={250} />
    </>
  );
};

// ---------------- the catch: anyone at your unlocked laptop ----------------
const LAP = 440;
const LAP_X = (W - LAP) / 2;
const LAP_Y = 380;
const Warning: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Headline a="Only networks it joined." b="Anyone at your laptop, too." at={T.warn} bAt={T.anyone} size={66} />
      <div style={{ position: "absolute", left: LAP_X, top: LAP_Y, opacity: prog(frame, T.warn + 4, 10) }}>
        <Icon name="laptop" size={LAP} color={C.ink} weight={1.4} draw={prog(frame, T.warn + 4, 18)} />
      </div>
      <div style={{ position: "absolute", left: LAP_X + (12.5 / 24) * LAP - 70, top: LAP_Y + (10.25 / 24) * LAP - 70, opacity: prog(frame, T.warn + 14, 10) }}>
        <Icon name="wifi" size={140} color={C.accent} weight={2} draw={prog(frame, T.warn + 14, 16)} />
      </div>
      <Badge
        x={LAP_X + (19.5 / 24) * LAP}
        y={LAP_Y + (5 / 24) * LAP}
        size={84}
        icon="unlock"
        tone="red"
        at={T.unlocked}
        changes={[{ at: T.lock, icon: "lock", tone: "green" }]}
      />
      <Sticker src="raccoon/sneaking.png" at={T.anyone} until={T.lock + 6} x={W - 520} y={860} w={520} from="right" />
      <Note at={T.lock + 8} x={TX} y={880}>
        {"Lock it before snacks:\nCtrl+Cmd+Q on Mac · Win+L on Windows"}
      </Note>
    </>
  );
};

const cheat = (os: string, cmd: string): Line[] => [[dim(`# ${os}`)], [{ t: cmd, c: TERM.green, b: true }]];

export const WifiPasswords: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.warn}
        tools={[
          { from: T.t1, name: "Mac", repo: "security · built in", n: 1, of: 3 },
          { from: T.t2, name: "Linux", repo: "nmcli · NetworkManager", n: 2, of: 3 },
          { from: T.t3, name: "Windows", repo: "netsh · Command Prompt", n: 3, of: 3 },
        ]}
      />

      <Win from={0} to={T.story}>
        <Hook T={T} />
      </Win>
      <Win from={T.story} to={T.t1}>
        <Story T={T} />
      </Win>
      <Win from={T.t1} to={T.t2}>
        <Mac T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <Linux T={T} />
      </Win>
      <Win from={T.t3} to={T.warn}>
        <Windows T={T} />
      </Win>
      <Win from={T.warn} to={T.save}>
        <Warning T={T} />
      </Win>

      <SaveOutro
        at={T.save}
        h={360}
        fontSize={28}
        lines={[...cheat("mac", "security find-generic-password -wa <wifi>"), ...cheat("linux", NM_CMD), ...cheat("windows", 'netsh wlan show profile name="<wifi>" key=clear')]}
        question={"Mac, Linux\nor Windows?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="Mac, Linux or Windows?" />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("wifi-passwords/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.t1, T.t2, T.t3, T.warn, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.type + 2, T.nmcli, T.netsh]} />
      <Sfx name="switch" at={[T.then, T.lock]} />
      <Sfx name="ding" at={[T.prints, T.you, T.pw6]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 640;
export const WifiPasswordsCover: React.FC = () => (
  <Cover title="Show any saved" sub="Wi-Fi password." chips={["Mac", "Linux", "Windows"]}>
    <Terminal x={CX} y={CTY} w={CW} h={300} fontSize={28} blocks={[{ at: -200, cmd: MAC_CMD, out: [[{ t: PASS, c: TERM.green, b: true }]] }]} />
    <div
      style={{
        position: "absolute",
        ...(({ x, y, w, h }) => ({ left: x, top: y, width: w, height: h }))(termRing(CX, CTY, 28, 1, 0, PASS.length)),
        borderRadius: 16,
        border: `4px solid ${C.accent}`,
        background: `${C.accent}24`,
      }}
    />
    <div style={{ position: "absolute", left: CX + 560, top: CTY + 34 - 240, width: 340, height: 240, overflow: "hidden" }}>
      <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={320} from="below" shadow={false} />
    </div>
    <div style={{ position: "absolute", left: CX, top: CTY + 330, fontFamily: sans, fontWeight: 600, fontSize: 36, color: C.mute }}>
      One command. No app needed.
    </div>
  </Cover>
);
