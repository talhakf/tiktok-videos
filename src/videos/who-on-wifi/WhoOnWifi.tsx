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
import { dim, Terminal, termRing, type Block, type Line } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { DataTable, type Cell, type TableFocus } from "../../components/data/DataTable";
import { ChatThread } from "../../components/layouts/ChatThread";
import { RED } from "../../components/layouts/Mark";
import { Gauge } from "../../components/data/Gauge";
import { BrowserWindow } from "../../components/windows/BrowserWindow";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, materialize, mono, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/who-on-wifi/captions.json";

// See who is on your Wi-Fi: arp -a (ip neigh on Linux), sudo nmap -sn, the router's device list.
// Sequel to wifi-passwords. Fake home network only (192.168.1.x, made-up MACs; the first three bytes of the
// non-random ones are real vendor prefixes from nmap-mac-prefixes, so nmap's vendor names are what it would print).
// Facts + sources: SudoRaccoon/Videos/who-on-wifi.md. Design + motion: Playbook/Design system.md.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

// ---------------- the fake network ----------------
const NET = {
  router: { ip: "192.168.1.1", mac: "00:1a:4f:41:8e:02", vendor: "AVM GmbH" },
  me: { name: "bandits-macbook", ip: "192.168.1.20", mac: "a4:83:e7:2d:05:9c" },
  tv: { name: "living-room-tv", ip: "192.168.1.23", mac: "5c:ad:76:1b:90:3e", vendor: "Shenzhen TCL New Technology" },
  phone: { name: "iPhone", ip: "192.168.1.31", mac: "7a:1f:3c:9e:42:b1", vendor: "Unknown" }, // private MAC: 2nd hex digit a
  sudo: { name: "sudos-laptop", ip: "192.168.1.42", mac: "d4:3b:04:7c:19:e5", vendor: "Intel Corporate" },
};
const SCAN = "sudo nmap -sn 192.168.1.0/24";
// macOS `arp -a` prints MAC bytes without leading zeros
const macOsMac = (m: string) => m.split(":").map((b) => b.replace(/^0(?=.)/, "")).join(":");
const arpLine = (d: { ip: string; mac: string }): Line => [dim("? ("), { t: d.ip }, dim(") at "), { t: macOsMac(d.mac) }, dim(" on en0 ifscope [ethernet]")];
const neighLine = (d: { ip: string; mac: string }, state: string): Line => [{ t: d.ip }, dim(" dev wlan0 lladdr "), { t: d.mac }, dim(` ${state}`)];
const report = (d: { ip: string; mac: string; vendor: string }, latency: string): Line[] => [
  `Nmap scan report for ${d.ip}`,
  [dim(`Host is up (${latency} latency).`)],
  [dim("MAC Address: "), { t: d.mac.toUpperCase() }, { t: ` (${d.vendor})`, c: d.vendor === "Unknown" ? TERM.yellow : TERM.fg }],
];

const TABLE_HEAD = ["Device", "IP", "MAC"];
const tableRows = (busted = true, withSudo = true): Cell[][] =>
  [
    [NET.me.name, NET.me.ip, NET.me.mac],
    [NET.tv.name, NET.tv.ip, NET.tv.mac],
    [NET.phone.name, NET.phone.ip, NET.phone.mac],
    ...(withSudo ? [[busted ? { t: NET.sudo.name, tone: "bad" as const } : NET.sudo.name, NET.sudo.ip, NET.sudo.mac]] : []),
  ] as Cell[][];
const TABLE_W = [0.34, 0.29, 0.37];

export const WhoOnWifiComposition = () => (
  <>
    <Composition id="WhoOnWifi" component={WhoOnWifi} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="WhoOnWifiCover" component={WhoOnWifiCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      steps: at("three"), // "in three steps"
      story: at("bandit's"),
      slow: at("slow"),
      wasnt: at("wasn't"),
      t1: at("one"),
      arp: at("arp-a"),
      lists: at("lists"),
      ip: at("ip"),
      mac: at("mac"),
      linux: at("linux"),
      neigh: at("ipneigh"),
      fast: at("fast"),
      hide: at("hide"),
      t2: at("two"),
      nmap: at("sudonmap-sn"),
      net1: at("network"),
      knocks: at("knocks"),
      everyone: at("everyone"),
      answers: at("answers"),
      needs: at("needs"),
      approves: at("approves"),
      only: at("only"),
      t3: at("three", 2),
      often: at("often"),
      connected: at("connected"),
      full: at("full"),
      names: at("names"),
      random: at("random-looking"),
      relax: at("relax"),
      iphones: at("iphones"),
      but: at("but", 2),
      laptop: at("sudos-laptop"),
      change: at("change"),
      out: at("out"),
      offline: at("offline"),
      snacks: at("snacks"),
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

// ---------------- hook: the router's device list, Sudo's laptop already ringed ----------------
const HOOK_Y = 600;
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Someone is on your Wi-Fi." b="Here's how to see who." until={T.story} size={68} />
    <DataTable
      header={TABLE_HEAD}
      rows={tableRows()}
      x={TX}
      y={HOOK_Y}
      w={TW}
      at={-100}
      rowAt={[-100, -100, -100, -100]}
      widths={TABLE_W}
      size={28}
      monoCols={[1, 2]}
      focus={[{ at: -100, row: 3 }]}
    />
    {/* between the IP and MAC header labels */}
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 372} edgeY={HOOK_Y} w={210} h={165} overhang={24} />
    <Note at={T.steps} x={TX} y={HOOK_Y + 450}>
      arp · nmap · router page
    </Note>
  </>
);

// ---------------- story: Bandit's Wi-Fi is slow at 3 a.m., Sudo denies everything ----------------
const Story: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <ChatThread
      x={TX}
      y={230}
      w={TW}
      contact="Bandit"
      messages={[
        { at: T.slow, typing: 12, text: "why is my wifi\nso slow at 3am" },
        { at: T.wasnt, me: true, text: "wasn't me" },
      ]}
    />
    <Gauge x={TX} y={720} size={540} at={T.story} keys={[{ at: T.slow, value: 3, color: RED }]} from={240} max={300} unit="Mbps" label="Bandit's Wi-Fi" dur={22} />
    <Sticker src="raccoon/scheming.png" at={T.wasnt + 4} x={TX + 640} y={860} w={230} />
  </>
);

// ---------------- 1/3 arp -a (+ ip neigh on Linux) ----------------
const FS = 21.5; // the real output lines are up to 64 characters wide
const ARP_H = 300;
const NEIGH_Y = TY + ARP_H + 36;
const NEIGH_H = 270;
const Arp: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const tf = 12;
  const r = (line: number, col: number, cols: number, rows = 1) => termRing(TX, TY, FS, line, col, cols, rows);
  return (
    <>
      <Terminal
        x={TX}
        y={TY}
        w={TW}
        h={ARP_H}
        fontSize={FS}
        title="bandit@macbook: ~"
        enterAt={T.t1}
        blocks={[{ at: T.arp, cmd: "arp -a", typeFrames: tf, outDelay: Math.max(4, T.lists - (T.arp + tf)), out: [arpLine(NET.router), arpLine(NET.tv), arpLine(NET.phone)] }]}
      />
      {/* "? (" = 3 columns; MACs start at column 19 (router) or 20 (two-digit hosts) */}
      <Circle at={T.ip} until={T.mac} {...r(1, 3, 12, 3)} />
      <Circle at={T.mac} until={T.linux} {...r(1, 19, 18, 3)} />
      {/* the Linux window only appears on "Linux" (materialize), not as an empty box for the whole beat */}
      <div style={{ position: "absolute", inset: 0, ...materialize(prog(frame, T.linux - 2, 10), 0.97, 8), transformOrigin: `50% ${NEIGH_Y}px` }}>
      <Terminal
        x={TX}
        y={NEIGH_Y}
        w={TW}
        h={NEIGH_H}
        fontSize={FS}
        title="linux: ~"
        enterAt={T.linux}
        blocks={[
          {
            at: T.neigh - 4,
            cmd: "ip neigh",
            typeFrames: 12,
            out: [neighLine(NET.router, "REACHABLE"), neighLine(NET.tv, "STALE"), neighLine(NET.phone, "REACHABLE")],
          },
        ]}
      />
      </div>
      <Note at={T.fast} x={TX} y={NEIGH_Y + NEIGH_H + 34} size={36}>
        {"Only devices it\nsaw lately"}
      </Note>
      <Sticker src="raccoon/sneaking.png" at={T.hide} x={W - 430} y={NEIGH_Y + NEIGH_H + 26} w={430} from="right" />
    </>
  );
};

// ---------------- 2/3 sudo nmap -sn ----------------
const NMAP_H = 612; // 17 rows, no scroll (the rings rely on it)
const Nmap: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(30, T.net1 + 10 - T.nmap);
  const step = (T.answers - T.knocks - 6) / 5;
  const hosts: Line[][] = [
    report(NET.router, "0.0031s"),
    report(NET.tv, "0.042s"),
    report(NET.phone, "0.11s"),
    report(NET.sudo, "0.0090s"),
    [`Nmap scan report for ${NET.me.ip}`, [dim("Host is up.")]], // the scanning Mac itself: no MAC line
  ];
  const blocks: Block[] = [
    { at: T.nmap, cmd: SCAN, typeFrames: tf, out: [[dim("Starting Nmap 7.95 ( https://nmap.org ) at 2026-10-13 03:07 UTC")]], outDelay: Math.max(4, T.knocks - (T.nmap + tf)) },
    ...hosts.map((out, i) => ({ at: Math.round(T.knocks + 6 + i * step), out })),
    { at: T.answers, out: [[{ t: "Nmap done: 256 IP addresses " }, { t: "(5 hosts up)", c: TERM.green, b: true }, { t: " scanned in 2.07 seconds" }]] },
  ];
  const r = (line: number, col: number, cols: number, rows = 1) => termRing(TX, TY, FS, line, col, cols, rows);
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={NMAP_H} fontSize={FS} title="bandit@macbook: ~" enterAt={T.t2} blocks={blocks} />
      {/* rows: 0 cmd, 1 Starting, 2–4 router, 5–7 tv, 8–10 phone, 11–13 Sudo's laptop (new: arp missed it), 14–15 this Mac, 16 done */}
      <Circle at={T.everyone} until={T.answers + 2} {...r(11, 0, 50, 3)} />
      <Circle at={T.answers + 4} until={T.needs} {...r(16, 28, 12)} />
      <Circle at={T.needs} until={T.only} {...r(0, 4, 4)} />
      <Note at={T.nmap + 10} until={T.needs} x={TX} y={TY + NMAP_H + 34} font="mono" size={32}>
        {"brew install nmap\napt install nmap"}
      </Note>
      <Note at={T.needs + 2} until={T.only} x={TX} y={TY + NMAP_H + 34} size={36}>
        {"With sudo it uses ARP\nand shows MAC addresses"}
      </Note>
      <Sticker src="raccoon/celebrate.png" at={T.approves} until={T.only} x={TX + 640} y={TY + NMAP_H + 10} w={230} fadeBottom={50} />
      <Note at={T.only} x={TX} y={TY + NMAP_H + 34} size={38}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Icon name="shield" size={44} color={C.accent} weight={2.2} />
          Only scan your own network
        </div>
      </Note>
    </>
  );
};

// ---------------- 3/3 router page → random MAC → Sudo's laptop → password changed ----------------
const BR_H = 640;
const PAGE_Y = TY + 84; // browser body top (84 px toolbar)
const TB_X = 30;
const TB_Y = 120;
const TB_W = TW - 60;
const RouterPage: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const typeFrames = Math.max(24, T.connected - 18 - T.often);
  const loadAt = T.often + typeFrames + 2;
  const focus: TableFocus[] = [
    { at: T.random, row: 2, col: 2 },
    { at: T.laptop, row: 3 },
  ];
  const gone = frame >= T.out;
  const swap = prog(frame, T.out, 10);
  const pageHead = (
    <div style={{ position: "absolute", left: TB_X + 6, top: 34, fontFamily: sans, display: "flex", alignItems: "baseline", gap: 18 }}>
      <span style={{ fontWeight: 700, fontSize: 44, letterSpacing: "-0.03em", color: C.ink }}>Connected devices</span>
      <span style={{ fontWeight: 600, fontSize: 32, color: C.mute }}>{gone ? "3" : "4"} online</span>
    </div>
  );
  return (
    <>
      <BrowserWindow x={TX} y={TY} w={TW} h={BR_H} url={NET.router.ip} at={T.t3} typeAt={T.often} typeFrames={typeFrames} loadAt={loadAt} loadDur={20} pageColor={C.paper}>
        {pageHead}
        {!gone ? (
          <DataTable header={TABLE_HEAD} rows={tableRows(frame >= T.laptop)} x={TB_X} y={TB_Y} w={TB_W} at={loadAt + 8} stagger={3} widths={TABLE_W} size={28} monoCols={[1, 2]} focus={focus} />
        ) : (
          <div style={materialize(swap, 0.98, 8)}>
            <DataTable header={TABLE_HEAD} rows={tableRows(false, false)} x={TB_X} y={TB_Y} w={TB_W} at={-100} rowAt={[-100, -100, -100]} widths={TABLE_W} size={28} monoCols={[1, 2]} />
          </div>
        )}
      </BrowserWindow>
      {/* names column on "full list, with names" */}
      <Circle at={T.names} until={T.random} x={TX + TB_X} y={PAGE_Y + TB_Y + 76} w={TB_W * TABLE_W[0]} h={84 * 4} />
      <Note at={T.connected + 20} until={T.iphones} x={TX} y={TY + BR_H + 34} size={34}>
        {"Not it? Try 192.168.0.1\nLogin: on the router's label"}
      </Note>
      <Note at={T.iphones} until={T.but} x={TX} y={TY + BR_H + 34} size={34}>
        {"2nd digit 2, 6, a or e\n= private address"}
      </Note>
      <Sticker src="raccoon/hands-up.png" at={T.laptop + 4} until={T.offline} x={TX + 650} y={TY + BR_H + 30} w={240} fadeBottom={30} />
      <Note at={T.change} until={T.offline} x={TX} y={TY + BR_H + 34} size={34}>
        {"Wi-Fi settings → new password\n(WPA2 or WPA3)"}
      </Note>
    </>
  );
};

// ---------------- Sudo is offline, with snacks ----------------
const Offline: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const ICON = 300;
  return (
    <>
      <Headline a="Sudo is offline." b="With snacks." at={T.offline} bAt={T.snacks} size={84} />
      <div style={{ position: "absolute", left: TX + 20, top: 470, opacity: prog(frame, T.offline + 2, 10) }}>
        <Icon name="wifiOff" size={ICON} color={C.mute} weight={1.6} draw={prog(frame, T.offline + 2, 18)} />
      </div>
      <Sticker src="raccoon/night-snack.png" at={T.snacks - 4} x={TX + 340} y={760} w={560} fadeBottom={80} />
    </>
  );
};

export const WhoOnWifi: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.random}
        tools={[
          { from: T.t1, name: "arp -a", repo: "Mac · Windows · Linux: ip neigh", n: 1, of: 3 },
          { from: T.t2, name: "nmap -sn", repo: "free · scans the whole network", n: 2, of: 3 },
          { from: T.t3, name: "router page", repo: "192.168.1.1 · connected devices", n: 3, of: 3 },
        ]}
      />
      <Headline a="Random-looking MAC?" b="Probably a phone." at={T.random} bAt={T.relax} until={T.but} size={72} />
      <Headline a="sudos-laptop?" b="Change the password." at={T.but} bAt={T.change} until={T.offline} size={72} />

      <Win from={0} to={T.story}>
        <Hook T={T} />
      </Win>
      <Win from={T.story} to={T.t1}>
        <Story T={T} />
      </Win>
      <Win from={T.t1} to={T.t2}>
        <Arp T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <Nmap T={T} />
      </Win>
      <Win from={T.t3} to={T.offline}>
        <RouterPage T={T} />
      </Win>
      <Win from={T.offline} to={T.save}>
        <Offline T={T} />
      </Win>

      <SaveOutro
        at={T.save}
        h={370}
        fontSize={27}
        lines={[
          [dim("# devices your computer saw")],
          [{ t: "arp -a", c: TERM.green, b: true }, dim("      # linux: ip neigh")],
          [dim("# everyone who answers")],
          [{ t: SCAN, c: TERM.green, b: true }],
          [dim("# the full list, with names")],
          [{ t: "192.168.1.1", c: TERM.green, b: true }, dim(" → connected devices")],
        ]}
        question={"How many devices\ndid you find?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="How many devices did you find?" />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("who-on-wifi/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.t1, T.t2, T.t3, T.random, T.but, T.offline, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.arp, T.neigh - 4, T.nmap]} />
      <Sfx name="switch" at={[T.often]} />
      <Sfx name="ding" at={[T.answers, T.connected]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 560;
export const WhoOnWifiCover: React.FC = () => (
  <Cover title="See who is on" sub="your Wi-Fi." chips={["arp -a", "nmap -sn", "router page"]}>
    {/* suspicious Sudo: straight right edge on the canvas edge, straight bottom hidden under the card */}
    <Sticker src="raccoon/side-eye.png" at={-100} x={1080 - 400} y={CTY - 280} w={400} fadeBottom={44} />
    <DataTable
      header={TABLE_HEAD}
      rows={tableRows()}
      x={CX}
      y={CTY}
      w={CW}
      at={-100}
      rowAt={[-100, -100, -100, -100]}
      widths={TABLE_W}
      size={30}
      rowH={90}
      monoCols={[1, 2]}
      focus={[{ at: -100, row: 3 }]}
    />
    <div style={{ position: "absolute", left: CX, top: CTY + 81 + 4 * 90 + 36, fontFamily: mono, fontWeight: 500, fontSize: 34, color: C.mute }}>
      3 ways · 1 masked freeloader
    </div>
  </Cover>
);
