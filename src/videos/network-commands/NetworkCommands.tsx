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
import { Terminal, termColX, termLineY, termRing, type Block, type Line } from "../../components/Terminal";
import { ToolHeader } from "../../components/ToolHeader";
import { Arrow } from "../../components/diagram/Arrow";
import { Badge } from "../../components/diagram/Badge";
import { anchors, CARD_SHADOW, Node } from "../../components/diagram/Node";
import { GREEN, RED } from "../../components/layouts/Mark";
import { Camera } from "../../components/motion/Camera";
import { PunchWord, Reaction } from "../../components/social/PunchWord";
import { Spinner } from "../../components/ui/Loading";
import { PhoneFrame } from "../../components/windows/PhoneFrame";
import { Icon, type IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, materialize, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/network-commands/captions.json";

// 5 network commands IT people use: ping, ipconfig getifaddr, nslookup, traceroute, lsof.
// Facts + sources (Apple man pages, checked 2026-10-13): SudoRaccoon/Videos/network-commands.md → Facts checked.
// Outputs follow the real macOS formats with made-up numbers; IPs are private (192.168.x), CGNAT (100.64.x) or
// documentation ranges (203.0.113.x, 198.51.100.x); example.com's addresses are its real ones (checked 2026-10-13).

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

export const NetworkCommandsComposition = () => (
  <>
    <Composition id="NetworkCommands" component={NetworkCommands} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="NetworkCommandsCover" component={NetworkCommandsCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      touches: at("touches"),
      story: at("3"),
      wont: at("won't"),
      blame: at("blame"),
      // 1/5 ping
      t1: at("one"),
      ping: at("ping-c41111"),
      knocks: at("knocks"),
      ms: at("milliseconds"),
      online: at("online"),
      no: at("no"),
      got: at("got"),
      // 2/5 ipconfig
      t2: at("two"),
      ipc: at("ipconfiggetifaddren0"),
      macs: at("mac's"),
      n192: at("192168"),
      nothing: at("nothing"),
      linux: at("linux"),
      had: at("had"),
      // 3/5 nslookup
      t3: at("three"),
      ns: at("nslookupexamplecom"),
      dns: at("dns"),
      ip: at("ip"),
      sudos2: at("sudo's", 2),
      connection: at("connection"),
      timed: at("timed"),
      pingWorks: at("ping"),
      always: at("always"),
      restart: at("restart"),
      sw: at("switch"),
      snacks: at("snacks"),
      // 4/5 traceroute
      t4: at("four", 2),
      tr: at("traceroutegooglecom"),
      every: at("every"),
      hop: at("hop"),
      jump: at("jump"),
      jump2: at("jump", 2),
      stars: at("stars"),
      win4: at("windows", 2),
      // 5/5 lsof
      t5: at("five", 2),
      lsof: at("lsof-np-i3000"),
      port: at("port"),
      shows: at("shows"),
      process: at("process"),
      kill: at("kill"),
      free: at("free"),
      win5: at("windows", 3),
      // outro
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

const IconNote: React.FC<{ icon: IconName; at: number; until?: number; x?: number; y: number; size?: number; tint?: string; children: React.ReactNode }> = ({
  icon,
  at,
  until,
  x = TX,
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
const zoomTo = (at: number, cx: number, py: number, s: number, sy: number, dur = 16) => {
  const cy = py - (sy - H / 2) / s;
  return { at, x: cx - W / s / 2 + 40, y: cy - 10, w: W / s - 80, h: 20, dur };
};
const lineMid = (ty: number, line: number, fs: number) => termLineY(ty, line, fs) + (fs * 1.38) / 2;
// window height for `rows` text rows (the body loses ~148 px to title bar + padding)
const termH = (rows: number, fs: number) => Math.ceil(rows * fs * 1.38 + 150);

// ---------------- terminal content (real macOS formats) ----------------
// ping -c 4 1.1.1.1 (BSD ping: icmp_seq starts at 0, 3 decimals, population stddev)
const PING_FS = 22;
const PING_CMD = "ping -c 4 1.1.1.1";
const PING_TIMES = ["12.301", "11.874", "11.214", "12.219"];
const pingReply = (i: number) => `64 bytes from 1.1.1.1: icmp_seq=${i} ttl=57 time=${PING_TIMES[i]} ms`;
const PING_TIME_COL = pingReply(0).indexOf("time=");
const PING_STATS = "4 packets transmitted, 4 packets received, 0.0% packet loss";
const PING_H = termH(10, PING_FS); // ping never returns to the prompt on screen

// ipconfig getifaddr en0 → just the address
const IPC_FS = 30;
const IPC_CMD = "ipconfig getifaddr en0";
const MY_IP = "192.168.1.23";
const IPC_H = termH(3, IPC_FS);

// nslookup example.com (BIND 9 nslookup; tabs expanded to 8-column stops)
const NS_FS = 26;
const NS_CMD = "nslookup example.com";
const NS_OUT: Line[] = [
  "Server:         192.168.1.1",
  "Address:        192.168.1.1#53",
  "",
  "Non-authoritative answer:",
  "Name:   example.com",
  [{ t: "Address: 104.20.23.154", b: true }],
  "Name:   example.com",
  [{ t: "Address: 172.66.147.243", b: true }],
];
const NS_TIMEOUT = ";; connection timed out; no servers could be reached";
const NS_H = termH(10, NS_FS);
const NS2_FS = 22; // Sudo's run: timeout + ping -c 1 (ping's stats line is 59 columns)

// traceroute google.com (macOS: 64 hops max = net.inet.ip.ttl, 3 probes per hop, "*" = no answer in 5 s)
const TR_FS = 19;
const TR_CMD = "traceroute google.com";
const TR_HEAD = "traceroute to google.com (142.250.185.78), 64 hops max, 52 byte packets";
const hopLine = (n: number, host: string, t: [string, string, string]) => `${String(n).padStart(2)}  ${host} (${host})  ${t[0]} ms  ${t[1]} ms  ${t[2]} ms`;
const TR_HOPS: string[] = [
  hopLine(1, "192.168.1.1", ["2.104", "1.873", "1.902"]),
  hopLine(2, "100.64.0.1", ["8.517", "9.022", "8.871"]),
  " 3  * * *",
  hopLine(4, "203.0.113.9", ["11.204", "10.988", "11.430"]),
  hopLine(5, "198.51.100.14", ["12.019", "11.876", "12.240"]),
  hopLine(6, "142.250.185.78", ["12.611", "12.388", "12.502"]),
];
const TR_H = termH(9, TR_FS);

// npm run dev → EADDRINUSE, then lsof -nP -i :3000 (columns aligned like lsof does) and kill
const LS_FS = 17;
const LS_ERR = "Error: listen EADDRINUSE: address already in use :::3000";
const LS_CMD = "lsof -nP -i :3000";
const LS_HEAD = "COMMAND  PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME";
const LS_ROW = "node    4127 sudo   23u  IPv6 0x9f3c51d2a8e07b41      0t0  TCP *:3000 (LISTEN)";
const LS_NAME_COL = LS_ROW.indexOf("*:3000");
const LS_H = termH(7, LS_FS);

// ---------------- hook: the suspects ----------------
const SUSPECTS: { label: string; icon: IconName }[] = [
  { label: "you", icon: "laptop" },
  { label: "Wi-Fi", icon: "wifi" },
  { label: "DNS", icon: "server" },
  { label: "route", icon: "globe" },
  { label: "app", icon: "plug" },
];
const CARD_Y = 590;
const CARD_H = 330;
const SUSPECT_Y = CARD_Y + 160;
const suspectX = (i: number) => TX + 90 + i * 180;
const SUSPECT_W = 112;

const Suspects: React.FC<{ y?: number; at?: number }> = ({ y = SUSPECT_Y, at = -100 }) => (
  <>
    {SUSPECTS.map((s, i) => (
      <Node key={s.label} x={suspectX(i)} y={y} w={SUSPECT_W} shape="circle" icon={s.icon} label={s.label} size={30} at={at} />
    ))}
    {SUSPECTS.slice(1).map((s, i) => (
      <Arrow key={s.label} at={at} from={{ x: suspectX(i) + SUSPECT_W / 2 + 6, y }} to={{ x: suspectX(i + 1) - SUSPECT_W / 2 - 6, y }} width={3} />
    ))}
    {SUSPECTS.map((s, i) => {
      const a = anchors({ x: suspectX(i), y, w: SUSPECT_W, shape: "circle" });
      return <Badge key={s.label} x={a.tr.x + 4} y={a.tr.y - 4} icon="question" tone="blue" size={44} at={at} />;
    })}
  </>
);

const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Internet broken?" b="5 commands IT people type first." until={T.story} size={80} />
    <div style={{ position: "absolute", left: TX, top: CARD_Y, width: TW, height: CARD_H, borderRadius: 32, background: C.white, boxShadow: CARD_SHADOW }}>
      <div style={{ position: "absolute", left: 36, top: 28, fontFamily: sans, fontWeight: 600, fontSize: 34, letterSpacing: "-0.02em", color: C.mute }}>Who's to blame?</div>
    </div>
    <Suspects />
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 590} edgeY={CARD_Y} w={300} h={230} overhang={34} />
    <Note at={-100} x={TX} y={CARD_Y + CARD_H + 40} font="mono" size={30}>
      ping · ipconfig · nslookup · traceroute · lsof
    </Note>
    <IconNote icon="router" at={T.touches} y={CARD_Y + CARD_H + 160}>
      Restart the router? Not yet.
    </IconNote>
  </>
);

// ---------------- story: 3 a.m., the snack app won't load ----------------
const PHONE_W = 380;
const SnackApp: React.FC<{ T: Cues }> = ({ T }) => {
  const frame = useCurrentFrame();
  const fail = prog(frame, T.wont, 10);
  const s = PHONE_W / 420;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: sans }}>
      <div style={{ position: "absolute", left: 28 * s, top: 90 * s, display: "flex", alignItems: "center", gap: 14 * s }}>
        <Icon name="pizza" size={52 * s} color={C.accent} weight={2.2} />
        <span style={{ fontWeight: 700, fontSize: 40 * s, letterSpacing: "-0.03em", color: C.ink }}>Snack delivery</span>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 28 * s, top: (180 + i * 96) * s, width: 340 * s, height: 72 * s, borderRadius: 18 * s, background: C.soft, opacity: 1 - fail * 0.5 }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 520 * s, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 * s }}>
        <div style={{ position: "relative", width: 72 * s, height: 72 * s }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...materialize(1 - fail) }}>
            <Spinner size={64 * s} />
          </div>
          {fail > 0 ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...materialize(fail) }}>
              <Icon name="wifiOff" size={68 * s} color={RED} weight={2.2} draw={prog(frame, T.wont + 2, 14)} />
            </div>
          ) : null}
        </div>
        <div style={{ position: "relative", height: 70 * s, width: "100%" }}>
          <div style={{ position: "absolute", width: "100%", textAlign: "center", fontWeight: 600, fontSize: 30 * s, color: C.mute, opacity: 1 - fail }}>Loading…</div>
          <div style={{ position: "absolute", width: "100%", textAlign: "center", fontWeight: 600, fontSize: 30 * s, color: RED, ...materialize(fail) }}>
            Can't reach the server.
          </div>
        </div>
      </div>
    </div>
  );
};

const Story: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="3 a.m. Snacks won't load." b="Who's to blame?" at={T.story} bAt={T.blame - 6} size={76} />
    <PhoneFrame x={TX} y={470} w={PHONE_W} at={T.story} time="3:07">
      <SnackApp T={T} />
    </PhoneFrame>
    <Sticker src="raccoon/night-snack.png" at={T.story + 8} x={TX + 450} y={830} w={440} fadeBottom={70} />
    <Reaction at={T.blame} x={TX + 790} y={800} glyph="?" size={120} />
  </>
);

// ---------------- 1/5 ping ----------------
const ONE_NOTE_Y = TY + PING_H + 40;
const Ping: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(24, T.knocks - T.ping - 16); // types while the command is spoken
  const first = T.ping + tf + 4; // header + first reply
  const blocks: Block[] = [
    { at: T.ping, cmd: PING_CMD, typeFrames: tf, outDelay: 4, out: ["PING 1.1.1.1 (1.1.1.1): 56 data bytes", pingReply(0)] },
    { at: first + 2, out: [] }, // ping is still running: keep the prompt away until it exits
    { at: first + 30, out: [pingReply(1)] }, // one reply per second, like the real thing
    { at: first + 60, out: [pingReply(2)] },
    { at: first + 90, out: [pingReply(3)] },
    { at: first + 92, out: ["", "--- 1.1.1.1 ping statistics ---", PING_STATS, "round-trip min/avg/max/stddev = 11.214/11.902/12.301/0.428 ms"] },
  ];
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={PING_H} fontSize={PING_FS} enterAt={T.t1} blocks={blocks} />
      <Circle at={Math.max(T.ms, first + 96)} until={T.got} {...termRing(TX, TY, PING_FS, 2, PING_TIME_COL, "time=12.301 ms".length, 4)} />
      <Circle at={T.got + 4} {...termRing(TX, TY, PING_FS, 8, 0, PING_STATS.indexOf(",", 30))} />
      <IconNote icon="check" tint={GREEN} at={T.online} until={T.no} y={ONE_NOTE_Y}>
        {"Replies with ms?\nYou're online."}
      </IconNote>
      <IconNote icon="cross" tint={RED} at={T.no} until={T.got} y={ONE_NOTE_Y}>
        {"No replies?\nIt's on your side."}
      </IconNote>
      <IconNote icon="check" tint={GREEN} at={T.got} y={ONE_NOTE_Y}>
        {"Sudo: 4 replies.\nThe internet is there."}
      </IconNote>
      <Sticker src="raccoon/pointing.png" at={T.knocks} x={TX + 640} y={ONE_NOTE_Y - 20} w={250} />
    </>
  );
};

// ---------------- 2/5 ipconfig getifaddr en0 ----------------
const TWO_NOTE_Y = TY + IPC_H + 40;
const MAC_NODE = { x: TX + 150, y: 1010, w: 150, shape: "circle" as const };
const ROUTER_NODE = { x: TX + 560, y: 1010, w: 150, shape: "circle" as const };
const Ipconfig: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(20, T.macs - T.ipc - 16);
  const r = anchors(ROUTER_NODE);
  return (
    <>
      <Terminal x={TX} y={TY} w={TW} h={IPC_H} fontSize={IPC_FS} enterAt={T.t2} blocks={[{ at: T.ipc, cmd: IPC_CMD, typeFrames: tf, out: [[{ t: MY_IP, b: true }]] }]} />
      <Circle at={T.macs + 4} {...termRing(TX, TY, IPC_FS, 1, 0, MY_IP.length)} />
      <IconNote icon="wifi" at={T.macs} until={T.n192} y={TWO_NOTE_Y}>
        {"en0 = Wi-Fi\non most MacBooks"}
      </IconNote>
      <IconNote icon="check" tint={GREEN} at={T.n192} until={T.nothing} y={TWO_NOTE_Y}>
        {"192.168.x.x?\nThe router let you in."}
      </IconNote>
      <IconNote icon="cross" tint={RED} at={T.nothing} until={T.linux} y={TWO_NOTE_Y}>
        {"Empty, or 169.254.x.x?\nWi-Fi problem."}
      </IconNote>
      <Note at={T.linux} until={T.had} x={TX} y={TWO_NOTE_Y} font="mono" size={34}>
        {"Linux:   ip addr\nWindows: ipconfig"}
      </Note>
      <IconNote icon="check" tint={GREEN} at={T.had} y={TWO_NOTE_Y}>
        {"Sudo has an address.\nThe Wi-Fi is fine."}
      </IconNote>
      {/* Mac → router: the address is the router letting you in */}
      <Node {...MAC_NODE} icon="laptop" label="Mac" at={T.macs} size={30} />
      <Node
        {...ROUTER_NODE}
        icon="router"
        label="router"
        at={T.macs + 4}
        size={30}
        states={[
          { at: T.n192, state: "ok" },
          { at: T.nothing, state: "error" },
          { at: T.had, state: "ok" },
        ]}
      />
      <Arrow at={T.macs + 8} from={anchors(MAC_NODE).right} to={anchors(ROUTER_NODE).left} active={T.n192} label={MY_IP} labelMono both />
      <Badge
        x={r.tr.x + 4}
        y={r.tr.y - 4}
        icon="check"
        tone="green"
        at={T.n192}
        changes={[
          { at: T.nothing, icon: "cross", tone: "red" },
          { at: T.had, icon: "check", tone: "green" },
        ]}
      />
      <Sticker src="raccoon/pointing.png" at={T.had} x={TX + 700} y={880} w={210} flip />
    </>
  );
};

// ---------------- 3/5 nslookup ----------------
const THREE_NOTE_Y = TY + NS_H + 40;
const Nslookup: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(20, T.dns - T.ns - 12);
  const retype = T.sudos2 + 2;
  const addrCols = "Address: 172.66.147.243".length;
  return (
    <>
      <Win from={T.t3} to={T.sudos2}>
        <Terminal x={TX} y={TY} w={TW} h={NS_H} fontSize={NS_FS} enterAt={T.t3} blocks={[{ at: T.ns, cmd: NS_CMD, typeFrames: tf, out: NS_OUT }]} />
        <Circle at={T.ip} {...termRing(TX, TY, NS_FS, 6, 0, addrCols)} />
        <Circle at={T.ip + 4} {...termRing(TX, TY, NS_FS, 8, 0, addrCols)} />
      </Win>
      <Win from={T.sudos2} to={T.t4}>
        <Terminal
          x={TX}
          y={TY}
          w={TW}
          h={NS_H}
          fontSize={NS2_FS}
          enterAt={T.sudos2}
          blocks={[
            { at: retype, cmd: NS_CMD, typeFrames: 12, outDelay: Math.max(4, T.connection - (retype + 12)), out: [[{ t: NS_TIMEOUT, c: TERM.red, b: true }]] },
            {
              at: T.pingWorks - 4,
              cmd: "ping -c 1 1.1.1.1",
              typeFrames: 10,
              outDelay: 2,
              out: [
                "PING 1.1.1.1 (1.1.1.1): 56 data bytes",
                [{ t: "64 bytes from 1.1.1.1: icmp_seq=0 ttl=57 time=11.874 ms", b: true }],
                "",
                "--- 1.1.1.1 ping statistics ---",
                "1 packets transmitted, 1 packets received, 0.0% packet loss",
                "round-trip min/avg/max/stddev = 11.874/11.874/11.874/0.000 ms",
              ],
            },
          ]}
        />
        <Circle at={T.timed + 4} {...termRing(TX, TY, NS2_FS, 1, 0, NS_TIMEOUT.length)} />
        <Circle at={T.pingWorks + 16} {...termRing(TX, TY, NS2_FS, 4, 0, "64 bytes from 1.1.1.1: icmp_seq=0 ttl=57 time=11.874 ms".length)} />
      </Win>
      <IconNote icon="search" at={T.dns} until={T.ip} y={THREE_NOTE_Y}>
        {"DNS = the internet's\nphone book"}
      </IconNote>
      <IconNote icon="arrowRight" at={T.ip} until={T.sudos2} y={THREE_NOTE_Y}>
        {"Name in,\nIP address out."}
      </IconNote>
      <IconNote icon="check" tint={GREEN} at={T.pingWorks} until={T.always} y={THREE_NOTE_Y}>
        ping 1.1.1.1 works
      </IconNote>
      <IconNote icon="cross" tint={RED} at={T.pingWorks + 10} until={T.always} y={THREE_NOTE_Y + 130}>
        example.com doesn't
      </IconNote>
      <PunchWord text={"It's always\nDNS."} at={T.always} until={T.restart} y={THREE_NOTE_Y + 10} size={110} align="left" />
      <Sticker src="raccoon/gasp.png" at={T.timed} until={T.snacks} x={TX + 670} y={THREE_NOTE_Y - 10} w={230} fadeBottom={70} />
      <IconNote icon="refresh" at={T.restart} y={THREE_NOTE_Y}>
        Restart the router
      </IconNote>
      <IconNote icon="server" at={T.sw} y={THREE_NOTE_Y + 130}>
        {"or set DNS to 1.1.1.1"}
      </IconNote>
      <Sticker src="raccoon/night-snack.png" at={T.snacks} x={TX + 560} y={THREE_NOTE_Y + 20} w={340} fadeBottom={70} />
    </>
  );
};

// ---------------- 4/5 traceroute ----------------
const TR_ZOOM = 1.2; // the whole window at 1.2×: terminal top lands at y 400, just under the header
const TR_SY = 400 + (lineMid(TY, 3.5, TR_FS) - TY) * TR_ZOOM;
const FOUR_NOTE_Y = Math.round(400 + TR_H * TR_ZOOM + 30);
const Traceroute: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(20, T.every - T.tr - 20);
  const hopsAt = T.tr + tf + 8;
  const blocks: Block[] = [
    { at: T.tr, cmd: TR_CMD, typeFrames: tf, outDelay: 2, out: [TR_HEAD] },
    { at: T.tr + tf + 3, out: [] }, // still running: no prompt between the header and the hops
    ...TR_HOPS.map((l, i) => ({ at: hopsAt + 6 + i * 9 + (i >= 3 ? 12 : 0), out: [i === 2 ? ([{ t: l, c: TERM.dim }] as Line) : l] })),
  ];
  const widest = Math.max(...TR_HOPS.map((l) => l.length));
  return (
    <>
      {/* once the hops print, the whole window glides to 1.2× (19 px rows read at ~23 px), every column stays in view */}
      <Camera keys={[zoomTo(T.every - 2, TX + TW / 2, lineMid(TY, 3.5, TR_FS), TR_ZOOM, TR_SY, 18)]}>
        <Terminal x={TX} y={TY} w={TW} h={TR_H} fontSize={TR_FS} enterAt={T.t4} blocks={blocks} />
        <Circle at={T.hop} until={T.jump2} {...termRing(TX, TY, TR_FS, 2, 0, TR_HOPS[0].length)} />
        <Circle at={T.jump2 + 4} until={T.stars} {...termRing(TX, TY, TR_FS, 5, 0, widest, 3)} />
        <Circle at={T.stars} {...termRing(TX, TY, TR_FS, 4, 0, TR_HOPS[2].length)} />
      </Camera>
      <IconNote icon="router" at={T.hop} until={T.jump} y={FOUR_NOTE_Y}>
        {"Hop 1 =\nyour router"}
      </IconNote>
      <IconNote icon="wifi" tint={RED} at={T.jump} until={T.jump2} y={FOUR_NOTE_Y}>
        {"Slow at hop 1?\nBlame the Wi-Fi."}
      </IconNote>
      <IconNote icon="trendUp" tint={RED} at={T.jump2} until={T.stars} y={FOUR_NOTE_Y}>
        {"Slow from later on?\nYour provider."}
      </IconNote>
      <IconNote icon="info" at={T.stars} until={T.win4} y={FOUR_NOTE_Y}>
        {"* * * = no answer.\nUsually fine."}
      </IconNote>
      <Note at={T.win4} x={TX} y={FOUR_NOTE_Y} font="mono" size={34}>
        Windows: tracert
      </Note>
      <Sticker src="raccoon/sneaking.png" at={T.every} x={W - 380} y={FOUR_NOTE_Y + 150} w={380} from="right" />
    </>
  );
};

// ---------------- 5/5 lsof -nP -i :3000 ----------------
const FIVE_SY = 760; // screen y of the zoomed lsof rows
const FIVE_NOTE_Y = 1040;
const Lsof: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(20, T.port - T.lsof - 24); // types while the command is spoken
  const rowY = lineMid(TY, 3.5, LS_FS); // between header and the node row
  const blocks: Block[] = [
    { at: T.t5 - 200, cmd: "npm run dev", typeFrames: 1, outDelay: 0, out: [[{ t: LS_ERR, c: TERM.red }]] },
    { at: T.lsof, cmd: LS_CMD, typeFrames: tf, outDelay: Math.max(4, T.shows - (T.lsof + tf)), out: [LS_HEAD, [{ t: LS_ROW, b: true }]] },
    { at: T.kill, cmd: "kill 4127", typeFrames: 10, outDelay: 2 },
  ];
  return (
    <>
      <Camera
        keys={[
          zoomTo(T.t5 + 2, termColX(TX, 28, LS_FS), lineMid(TY, 1.5, LS_FS), 1.6, FIVE_SY),
          zoomTo(T.shows - 4, termColX(TX, 58, LS_FS), rowY, 1.8, FIVE_SY),
          zoomTo(T.process - 4, termColX(TX, 22, LS_FS), rowY, 1.8, FIVE_SY),
          zoomTo(T.kill - 4, termColX(TX, 28, LS_FS), lineMid(TY, 4, LS_FS), 1.6, FIVE_SY),
        ]}
      >
        <Terminal x={TX} y={TY} w={TW} h={LS_H} fontSize={LS_FS} enterAt={T.t5} blocks={blocks} />
        <Circle at={T.port} until={T.shows - 4} {...termRing(TX, TY, LS_FS, 1, 0, LS_ERR.length)} />
        <Circle at={T.shows + 8} until={T.process - 4} {...termRing(TX, TY, LS_FS, 4, LS_NAME_COL, "*:3000 (LISTEN)".length)} />
        <Circle at={T.process + 8} until={T.kill - 2} {...termRing(TX, TY, LS_FS, 4, 0, "node    4127".length)} />
        <Circle at={T.kill + 12} {...termRing(TX, TY, LS_FS, 5, 4, "kill 4127".length)} />
      </Camera>
      <IconNote icon="warning" tint={RED} at={T.port} until={T.shows} y={FIVE_NOTE_Y}>
        {"Port 3000\nalready in use"}
      </IconNote>
      <IconNote icon="plug" at={T.shows} until={T.process} y={FIVE_NOTE_Y}>
        {"node is sitting\non :3000"}
      </IconNote>
      <IconNote icon="cursor" at={T.process} until={T.free} y={FIVE_NOTE_Y}>
        {"4127 = its\nprocess ID (PID)"}
      </IconNote>
      <IconNote icon="check" tint={GREEN} at={T.free} until={T.win5} y={FIVE_NOTE_Y}>
        {"kill 4127:\nport 3000 is free"}
      </IconNote>
      <Note at={T.win5} x={TX} y={FIVE_NOTE_Y} font="mono" size={34}>
        {"Windows:\nnetstat -ano"}
      </Note>
      <Sticker src="raccoon/scheming.png" at={T.kill} x={TX + 660} y={FIVE_NOTE_Y - 10} w={230} />
    </>
  );
};

export const NetworkCommands: React.FC = () => {
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
        <Ping T={T} />
      </Win>
      <Win from={T.t2} to={T.t3}>
        <Ipconfig T={T} />
      </Win>
      <Win from={T.t3} to={T.t4}>
        <Nslookup T={T} />
      </Win>
      <Win from={T.t4} to={T.t5}>
        <Traceroute T={T} />
      </Win>
      <Win from={T.t5} to={T.save}>
        <Lsof T={T} />
      </Win>

      {/* after the lsof camera, so the header always sits on top */}
      <ToolHeader
        x={TX}
        y={210}
        w={TW}
        until={T.save}
        tools={[
          { from: T.t1, name: "ping", repo: "built in · Windows: ping -n 4", n: 1, of: 5 },
          { from: T.t2, name: "ipconfig", repo: "macOS · Linux: ip addr · Windows: ipconfig", n: 2, of: 5 },
          { from: T.t3, name: "nslookup", repo: "built in on Mac + Windows · DNS lookup", n: 3, of: 5 },
          { from: T.t4, name: "traceroute", repo: "built in · Windows: tracert", n: 4, of: 5 },
          { from: T.t5, name: "lsof", repo: "Mac + Linux · Windows: netstat -ano", n: 5, of: 5 },
        ]}
      />

      <SaveOutro
        at={T.save}
        h={termH(5, 26)}
        fontSize={26}
        lines={cheatLines(
          [
            [PING_CMD, "online at all?"],
            [IPC_CMD, "your local IP"],
            [NS_CMD, "is DNS working?"],
            [TR_CMD, "where it slows"],
            [LS_CMD, "who has the port"],
          ],
          24,
        )}
        sub="Windows: ping · ipconfig · tracert · netstat -ano"
        question={"Which one\ndidn't you know?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="Which one didn't you know?" line="Follow for more terminal tricks." />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("network-commands/voice.mp3")} />
      <Sfx name="whoosh" at={[T.story, T.t1, T.t2, T.t3, T.t4, T.t5, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.ping, T.ipc, T.ns, T.sudos2 + 2, T.tr, T.lsof, T.kill]} />
      <Sfx name="ding" at={[T.online, T.snacks, T.free]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 710;
const CFS = 27;
export const NetworkCommandsCover: React.FC = () => (
  <Cover title="Internet broken?" sub="5 commands IT people type first." size={92} chips={["Wi-Fi", "DNS", "route", "ports"]}>
    <Terminal
      x={CX}
      y={CTY}
      w={CW}
      h={termH(5, CFS)}
      fontSize={CFS}
      title="cheat sheet"
      blocks={[
        {
          at: -100,
          out: cheatLines(
            [
              [PING_CMD, "online?"],
              [IPC_CMD, "your IP"],
              [NS_CMD, "DNS ok?"],
              [TR_CMD, "where slow?"],
              [LS_CMD, "who has :3000"],
            ],
            24,
          ),
        },
      ]}
    />
    <div style={{ position: "absolute", left: CX + 600, top: CTY + 34 - 240, width: 340, height: 240, overflow: "hidden" }}>
      <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={320} from="below" shadow={false} />
    </div>
  </Cover>
);
