import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Composition, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { Captions } from "../../components/Captions";
import { Cover, CoverStill, CW, CX } from "../../components/Cover";
import { DataTable } from "../../components/data/DataTable";
import { Arrow, arrowPath, Packet, Tunnel } from "../../components/diagram/Arrow";
import { Badge } from "../../components/diagram/Badge";
import { LayerStack } from "../../components/diagram/LayerStack";
import { anchors, CARD_SHADOW, Node } from "../../components/diagram/Node";
import { Note, Sticker } from "../../components/Doodles";
import { EndCard } from "../../components/EndCard";
import { Headline } from "../../components/Headline";
import { GREEN, Mark, RED } from "../../components/layouts/Mark";
import { VsSplit } from "../../components/layouts/VsSplit";
import { PeekOver } from "../../components/PeekOver";
import { cheatLines, SaveOutro } from "../../components/SaveOutro";
import { DocsQuote } from "../../components/social/DocsQuote";
import { UrlBar } from "../../components/windows/UrlBar";
import { Icon, type IconName } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { makeCues } from "../../lib/cues";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { C, H, mono, prog, sans, W } from "../../theme";
import captionsJson from "../../../public/dark-web/captions.json";

// How the dark web actually works: normal web vs Tor 3-relay onion routing vs Surface / Deep / Dark web (.onion).
// Verified facts + sources (Tor Project docs & U.S. Naval Research Lab): SudoRaccoon/Videos/dark-web.md → Facts checked (2026-10-13).

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

export const DarkWebComposition = () => (
  <>
    <Composition id="DarkWeb" component={DarkWeb} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="DarkWebCover" component={DarkWebCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      onion1: at("onion", 1),
      // Beat 1: Normal web
      normal: at("normal"),
      snacks: at("snacks"),
      request: at("request"),
      straight: at("straight"),
      https: at("https"),
      provider: at("provider"),
      ip1: at("ip", 1),
      visit1: at("site", 2),
      // Beat 2A: 1990s NRL origin
      nineties: at("nineties"),
      naval: at("naval"),
      onion2: at("onion", 2),
      intelligence: at("intelligence"),
      tor1: at("tor", 1),
      // Beat 2B: 3 relays & 3 encryption layers
      tor2: at("tor", 2),
      relays: at("relays"),
      guard1: at("guard", 1),
      middle1: at("middle", 1),
      exit1: at("exit", 1),
      wraps: at("wraps"),
      layers: at("layers"),
      innermost: at("innermost"),
      middleKey: at("middle", 2),
      outermost: at("outermost"),
      // Beat 3: Peeling each layer & Who knows what
      each: at("each"),
      guardPeels: at("guard", 3),
      layerOne: at("one"),
      ip2: at("ip", 2),
      notSite: at("not"),
      middlePeels: at("middle", 5),
      layerTwo: at("two"),
      neither: at("neither"),
      exitPeels: at("exit", 4),
      reaches: at("reaches"),
      without: at("without"),
      noSingle: at("single"),
      // Beat 4A: Surface vs Deep vs Dark web
      mix: at("mix"),
      surface: at("surface"),
      publicPages: at("public"),
      engines: at("engines"),
      deep2: at("deep", 2),
      login: at("login"),
      inbox1: at("inbox", 1),
      banking: at("banking"),
      cloud: at("cloud"),
      ninety: at("90"),
      dark3: at("dark", 3),
      slice: at("slice"),
      // Beat 4B: .onion inside Tor & real-world users
      onion3: at("onion", 3),
      never: at("never"),
      journalists: at("journalists"),
      whistleblowers: at("whistleblowers"),
      censored: at("censored"),
      // Outro + CTA
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

const termH = (rows: number, fs: number) => Math.ceil(rows * fs * 1.38 + 150);

const IconNote: React.FC<{
  icon: IconName;
  at: number;
  until?: number;
  x?: number;
  y: number;
  size?: number;
  tint?: string;
  children: React.ReactNode;
}> = ({ icon, at, until, x = TX, y, size = 34, tint = C.accent, children }) => {
  const frame = useCurrentFrame();
  return (
    <Note at={at} until={until} x={x} y={y} size={size}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Icon name={icon} size={44} color={tint} weight={2.2} draw={prog(frame, at + 2, 14)} />
        <span>{children}</span>
      </div>
    </Note>
  );
};

// ---------------- Hook: 3-relay onion circuit payoff on screen from frame 0 ----------------
const HOOK_CARD_Y = 530;
const HOOK_CARD_H = 420;
const HOOK_NODE_Y = HOOK_CARD_Y + 220;
const HOOK_W = 114;
const hookX = (i: number) => TX + 88 + i * 181;
const HOOK_NODES: { label: string; icon: IconName; relay?: boolean }[] = [
  { label: "Sudo", icon: "laptop" },
  { label: "Guard", icon: "shield", relay: true },
  { label: "Middle", icon: "server", relay: true },
  { label: "Exit", icon: "globe", relay: true },
  { label: "Site", icon: "pizza" },
];

const HookCircuit: React.FC<{ y?: number; at?: number }> = ({ y = HOOK_NODE_Y, at = -100 }) => {
  const tunnelPath = arrowPath({ from: { x: hookX(1) - 48, y }, to: { x: hookX(3) + 48, y } });
  return (
    <>
      <Tunnel path={tunnelPath} at={at} width={132} label="3 layers of encryption" chipDy={-105} />
      {HOOK_NODES.slice(1).map((n, i) => (
        <Arrow
          key={n.label}
          at={at}
          from={{ x: hookX(i) + HOOK_W / 2 + 6, y }}
          to={{ x: hookX(i + 1) - HOOK_W / 2 - 6, y }}
          active={i >= 0 && i <= 2}
          width={3.5}
        />
      ))}
      {HOOK_NODES.map((n, i) => (
        <Node
          key={n.label}
          x={hookX(i)}
          y={y}
          w={HOOK_W}
          shape="circle"
          icon={n.icon}
          label={n.label}
          size={28}
          at={at}
          state={n.relay ? "active" : "idle"}
        />
      ))}
      {HOOK_NODES.map((n, i) => {
        if (!n.relay) return null;
        const a = anchors({ x: hookX(i), y, w: HOOK_W, shape: "circle" });
        return <Badge key={n.label} x={a.tr.x + 4} y={a.tr.y - 4} icon="lock" tone="blue" size={44} at={at} />;
      })}
    </>
  );
};

const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="How the dark web works" b="3 relays. 3 locked layers." until={T.normal} size={74} />
    <div
      style={{
        position: "absolute",
        left: TX,
        top: HOOK_CARD_Y,
        width: TW,
        height: HOOK_CARD_H,
        borderRadius: 32,
        background: C.white,
        boxShadow: CARD_SHADOW,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 26,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 32,
          letterSpacing: "-0.02em",
          color: C.mute,
        }}
      >
        Onion routing (Tor)
      </div>
    </div>
    <HookCircuit />
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 590} edgeY={HOOK_CARD_Y} w={270} h={205} overhang={32} />
    <Note at={-100} until={T.onion1} x={TX} y={HOOK_CARD_Y + HOOK_CARD_H + 36} font="mono" size={30}>
      guard · middle · exit · .onion
    </Note>
    <IconNote icon="lock" at={T.onion1} y={HOOK_CARD_Y + HOOK_CARD_H + 36}>
      Built like an onion: 3 locked layers
    </IconNote>
  </>
);

// ---------------- Beat 1: Normal web (ISP sees both ends) ----------------
const NW_Y = 665;
const SUDO_NW = { x: TX + 125, y: NW_Y, w: 230, h: 185 };
const ISP_NW = { x: TX + 450, y: NW_Y, w: 240, h: 185 };
const SITE_NW = { x: TX + 775, y: NW_Y, w: 230, h: 185 };

const NormalWeb: React.FC<{ T: Cues }> = ({ T }) => {
  const s = anchors(SUDO_NW);
  const isp = anchors(ISP_NW);
  const site = anchors(SITE_NW);
  const leg1 = arrowPath({ from: s.right, to: isp.left });
  const leg2 = arrowPath({ from: isp.right, to: site.left });
  const fullPath = arrowPath({ from: s.right, to: site.left });
  return (
    <>
      <Headline a="On the normal web" b="Your provider sees both ends." at={T.normal} bAt={T.provider - 4} size={74} />
      <Tunnel path={fullPath} at={T.https} width={96} label="HTTPS encrypts content, not who talks to whom" chipDy={-136} />
      <Arrow at={T.request} from={s.right} to={isp.left} active={T.https} width={4} />
      <Arrow at={T.straight} from={isp.right} to={site.left} active={T.https} width={4} />
      <Node {...SUDO_NW} icon="laptop" label="Sudo" sub="198.51.100.7" subMono at={T.normal} size={32} />
      <Node
        {...ISP_NW}
        icon="router"
        label="Provider"
        sub="ISP / Wi-Fi"
        at={T.normal + 4}
        size={32}
        states={[{ at: T.provider, state: "error" }]}
      />
      <Node {...SITE_NW} icon="pizza" label="Site" sub="snacks.example" subMono at={T.normal + 8} size={32} />
      <Packet path={leg1} at={T.request} dur={16} icon="pizza" />
      <Packet path={leg2} at={T.request + 14} dur={16} icon="pizza" />
      <Badge x={isp.tr.x - 6} y={isp.tr.y + 4} icon="eye" tone="red" size={56} at={T.provider} />

      <IconNote icon="clock" at={T.snacks} until={T.https} y={895}>
        {"3 a.m. snack order\ngoes straight to the site"}
      </IconNote>
      <IconNote icon="lock" tint={GREEN} at={T.https} until={T.ip1} y={895}>
        {"HTTPS locks the box,\nnot the address label"}
      </IconNote>
      <IconNote icon="eye" tint={RED} at={T.ip1} y={880}>
        {"Sees your IP: 198.51.100.7"}
      </IconNote>
      <IconNote icon="eye" tint={RED} at={T.visit1} y={1010}>
        {"Sees the site: snacks.example"}
      </IconNote>
      <Sticker src="raccoon/night-snack.png" at={T.snacks} until={T.ip1} x={TX + 590} y={860} w={310} fadeBottom={70} />
      <Sticker src="raccoon/gasp.png" at={T.ip1} x={TX + 670} y={885} w={230} fadeBottom={70} />
    </>
  );
};

// ---------------- Beat 2A: 1990s U.S. Naval Research Lab origin ----------------
const OriginNRL: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="1990s: Naval Research Lab" b="Built to hide traffic paths." at={T.nineties} bAt={T.intelligence - 4} size={72} />
    <DocsQuote
      at={T.naval}
      y={430}
      size={39}
      site="Tor Project · History"
      url="torproject.org/about/history"
      quote={"Onion routing was developed in the mid-1990s at the U.S. Naval Research Laboratory to protect U.S. intelligence communications."}
      highlight="Onion routing"
      highlightAt={T.onion2}
      verifiedAt={T.tor1}
      verifiedLabel="Became Tor (The Onion Router)"
    />
    <IconNote icon="shieldCheck" at={T.intelligence} y={965}>
      {"Goal: hide metadata &\ntraffic paths on the wire"}
    </IconNote>
    <Sticker src="raccoon/cool-outfit.png" at={T.nineties + 6} x={TX + 670} y={895} w={195} fadeBottom={60} />
  </>
);

// ---------------- Beat 2B: 3 Relays + 3 Concentric Encryption Layers ----------------
const RELAY_Y = 485;
const GUARD_B2 = { x: TX + 145, y: RELAY_Y, w: 260, h: 130, iconPos: "left" as const };
const MID_B2 = { x: TX + 450, y: RELAY_Y, w: 260, h: 130, iconPos: "left" as const };
const EXIT_B2 = { x: TX + 755, y: RELAY_Y, w: 260, h: 130, iconPos: "left" as const };

const ThreeLayers: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="3 relays. 3 locked layers." b="Wrapped inside out." at={T.tor2} bAt={T.wraps - 2} size={72} />
    <Arrow at={T.middle1} from={anchors(GUARD_B2).right} to={anchors(MID_B2).left} active={T.outermost} width={3.5} />
    <Arrow at={T.exit1} from={anchors(MID_B2).right} to={anchors(EXIT_B2).left} active={T.middleKey} width={3.5} />
    <Node
      {...GUARD_B2}
      icon="shield"
      label="Guard"
      sub="Relay 1"
      at={T.guard1}
      size={30}
      states={[{ at: T.outermost, state: "active" }]}
    />
    <Node
      {...MID_B2}
      icon="server"
      label="Middle"
      sub="Relay 2"
      at={T.middle1}
      size={30}
      states={[{ at: T.middleKey, state: "active" }]}
    />
    <Node
      {...EXIT_B2}
      icon="globe"
      label="Exit"
      sub="Relay 3"
      at={T.exit1}
      size={30}
      states={[{ at: T.innermost, state: "active" }]}
    />

    <LayerStack
      x={TX}
      y={610}
      w={TW}
      layerH={82}
      gap={12}
      size={28}
      layers={[
        { label: "Snack request  (destination: snacks.example)", icon: "pizza", at: T.wraps, tone: "soft" },
        { label: "Layer 3 (innermost) — encrypted for Exit relay", icon: "key", at: T.innermost, tone: "white" },
        { label: "Layer 2 (middle) — encrypted for Middle relay", icon: "key", at: T.middleKey, tone: "blue" },
        { label: "Layer 1 (outermost) — encrypted for Guard relay", icon: "lock", at: T.outermost, tone: "accent" },
      ]}
    />

    <IconNote icon="lock" at={T.wraps} until={T.innermost} y={1015}>
      {"Sudo wraps the request\nin 3 locked layers"}
    </IconNote>
    <IconNote icon="key" at={T.innermost} y={1015}>
      {"Innermost → Exit relay\nOutermost → Guard relay"}
    </IconNote>
    <Sticker src="raccoon/scheming.png" at={T.wraps + 4} x={TX + 685} y={995} w={210} />
  </>
);

// ---------------- Beat 3: Peeling Each Layer & Who Knows What ----------------
const CIRCUIT_Y = 485;
const C_W = 112;
const cX = (i: number) => TX + 82 + i * 184;

const PeelingCircuit: React.FC<{ T: Cues }> = ({ T }) => {
  const p01 = arrowPath({ from: { x: cX(0) + C_W / 2 + 6, y: CIRCUIT_Y }, to: { x: cX(1) - C_W / 2 - 6, y: CIRCUIT_Y } });
  const p12 = arrowPath({ from: { x: cX(1) + C_W / 2 + 6, y: CIRCUIT_Y }, to: { x: cX(2) - C_W / 2 - 6, y: CIRCUIT_Y } });
  const p23 = arrowPath({ from: { x: cX(2) + C_W / 2 + 6, y: CIRCUIT_Y }, to: { x: cX(3) - C_W / 2 - 6, y: CIRCUIT_Y } });
  const p34 = arrowPath({ from: { x: cX(3) + C_W / 2 + 6, y: CIRCUIT_Y }, to: { x: cX(4) - C_W / 2 - 6, y: CIRCUIT_Y } });

  const gA = anchors({ x: cX(1), y: CIRCUIT_Y, w: C_W, shape: "circle" });
  const mA = anchors({ x: cX(2), y: CIRCUIT_Y, w: C_W, shape: "circle" });
  const eA = anchors({ x: cX(3), y: CIRCUIT_Y, w: C_W, shape: "circle" });

  return (
    <>
      <Headline a="Each relay peels 1 layer" b="Nobody knows both ends." at={T.each} bAt={T.noSingle - 4} size={74} />

      <Arrow at={T.each + 2} from={{ x: cX(0) + C_W / 2 + 6, y: CIRCUIT_Y }} to={{ x: cX(1) - C_W / 2 - 6, y: CIRCUIT_Y }} active={T.guardPeels} width={3.5} />
      <Arrow at={T.each + 4} from={{ x: cX(1) + C_W / 2 + 6, y: CIRCUIT_Y }} to={{ x: cX(2) - C_W / 2 - 6, y: CIRCUIT_Y }} active={T.middlePeels} width={3.5} />
      <Arrow at={T.each + 6} from={{ x: cX(2) + C_W / 2 + 6, y: CIRCUIT_Y }} to={{ x: cX(3) - C_W / 2 - 6, y: CIRCUIT_Y }} active={T.exitPeels} width={3.5} />
      <Arrow at={T.each + 8} from={{ x: cX(3) + C_W / 2 + 6, y: CIRCUIT_Y }} to={{ x: cX(4) - C_W / 2 - 6, y: CIRCUIT_Y }} active={T.reaches} width={3.5} />

      <Node x={cX(0)} y={CIRCUIT_Y} w={C_W} shape="circle" icon="laptop" label="Sudo" size={26} at={T.each} />
      <Node
        x={cX(1)}
        y={CIRCUIT_Y}
        w={C_W}
        shape="circle"
        icon="shield"
        label="Guard"
        size={26}
        at={T.each + 2}
        states={[
          { at: T.guardPeels, state: "active" },
          { at: T.middlePeels, state: "ok" },
        ]}
      />
      <Node
        x={cX(2)}
        y={CIRCUIT_Y}
        w={C_W}
        shape="circle"
        icon="server"
        label="Middle"
        size={26}
        at={T.each + 4}
        states={[
          { at: T.middlePeels, state: "active" },
          { at: T.exitPeels, state: "ok" },
        ]}
      />
      <Node
        x={cX(3)}
        y={CIRCUIT_Y}
        w={C_W}
        shape="circle"
        icon="globe"
        label="Exit"
        size={26}
        at={T.each + 6}
        states={[
          { at: T.exitPeels, state: "active" },
          { at: T.noSingle, state: "ok" },
        ]}
      />
      <Node
        x={cX(4)}
        y={CIRCUIT_Y}
        w={C_W}
        shape="circle"
        icon="pizza"
        label="Site"
        size={26}
        at={T.each + 8}
        states={[{ at: T.reaches, state: "ok" }]}
      />

      <Badge x={gA.tr.x + 4} y={gA.tr.y - 4} icon="key" tone="blue" size={42} at={T.guardPeels} />
      <Badge x={mA.tr.x + 4} y={mA.tr.y - 4} icon="key" tone="blue" size={42} at={T.middlePeels} />
      <Badge x={eA.tr.x + 4} y={eA.tr.y - 4} icon="key" tone="blue" size={42} at={T.exitPeels} />

      <Packet path={p01} at={T.guardPeels - 10} dur={20} icon="lock" label="3" />
      <Packet path={p12} at={T.middlePeels - 10} dur={20} icon="lock" label="2" />
      <Packet path={p23} at={T.exitPeels - 10} dur={20} icon="lock" label="1" />
      <Packet path={p34} at={T.reaches - 6} dur={20} icon="pizza" color={GREEN} />

      <DataTable
        x={TX}
        y={635}
        w={TW}
        at={T.each + 8}
        rowH={80}
        size={28}
        widths={[0.23, 0.21, 0.28, 0.28]}
        header={["Hop", "Peels", "Knows You?", "Knows Site?"]}
        rowAt={[T.guardPeels, T.middlePeels, T.exitPeels]}
        rows={[
          [
            { t: "1. Guard", b: true },
            { t: "Layer 1", mono: true, tone: "accent" },
            { t: "✓ Your IP", tone: "good" },
            { t: "✕ Locked", tone: "bad" },
          ],
          [
            { t: "2. Middle", b: true },
            { t: "Layer 2", mono: true, tone: "accent" },
            { t: "✕ Guard only", tone: "bad" },
            { t: "✕ Exit only", tone: "bad" },
          ],
          [
            { t: "3. Exit", b: true },
            { t: "Layer 3", mono: true, tone: "accent" },
            { t: "✕ Unknown", tone: "bad" },
            { t: "✓ Sees site", tone: "good" },
          ],
        ]}
        focus={[
          { at: T.layerOne, row: 0, col: 1 },
          { at: T.ip2, row: 0, col: 2 },
          { at: T.notSite, row: 0, col: 3 },
          { at: T.layerTwo, row: 1, col: 1 },
          { at: T.neither, row: 1, col: 2, cols: 2 },
          { at: T.reaches, row: 2, col: 3 },
          { at: T.without, row: 2, col: 2 },
        ]}
      />

      <IconNote icon="shield" at={T.guardPeels} until={T.middlePeels} y={985}>
        {"Guard: knows your IP,\ncannot see the site"}
      </IconNote>
      <IconNote icon="eyeOff" at={T.middlePeels} until={T.exitPeels} y={985}>
        {"Middle: only sees\nGuard ↔ Exit"}
      </IconNote>
      <IconNote icon="globe" at={T.exitPeels} until={T.noSingle} y={985}>
        {"Exit: connects to site,\nno idea Sudo sent it"}
      </IconNote>
      <IconNote icon="shieldCheck" tint={GREEN} at={T.noSingle} y={985}>
        {"0 relays know both\nwho you are & the site"}
      </IconNote>

      <Sticker src="raccoon/pointing.png" at={T.guardPeels + 8} until={T.noSingle} x={TX + 670} y={945} w={215} flip />
      <Sticker src="raccoon/celebrate.png" at={T.noSingle} x={TX + 660} y={945} w={225} fadeBottom={60} />
    </>
  );
};

// ---------------- Beat 4A: Surface Web vs Deep Web vs Dark Web ----------------
const WebComparison: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Surface vs. Deep vs. Dark" b="90%+ is the deep web." at={T.mix} bAt={T.deep2 - 4} size={70} />
    <VsSplit
      x={TX}
      y={440}
      w={TW}
      h={505}
      at={T.surface - 6}
      stagger={18}
      winner={{ index: 1, at: T.ninety }}
      columns={[
        {
          label: "Surface",
          icon: "search",
          lines: [
            { t: "Public pages", at: T.publicPages, mark: "check" },
            { t: "Search engines", at: T.engines },
            { t: "News & blogs", at: T.engines + 6 },
            { t: "~4–10% of web", at: T.engines + 12, mono: true },
          ],
        },
        {
          label: "Deep Web",
          icon: "mail",
          lines: [
            { t: "Behind a login", at: T.login, mark: "check" },
            { t: "Email inbox", at: T.inbox1 },
            { t: "Online banking", at: T.banking },
            { t: "Cloud drive", at: T.cloud },
            { t: "90%+ of web", at: T.ninety, mono: true },
          ],
        },
        {
          label: "Dark Web",
          icon: "lock",
          lines: [
            { t: "Overlay networks", at: T.dark3 + 2, mark: "check" },
            { t: "Inside Tor only", at: T.dark3 + 8 },
            { t: ".onion sites", at: T.dark3 + 14, mono: true },
            { t: "Tiny slice", at: T.slice, mono: true },
          ],
        },
      ]}
    />
    <IconNote icon="search" at={T.surface} until={T.deep2} y={985}>
      {"Surface web = indexed\nby search engines"}
    </IconNote>
    <IconNote icon="mail" tint={GREEN} at={T.deep2} until={T.dark3} y={985}>
      {"Deep web = 90%+ of the\nweb you already use!"}
    </IconNote>
    <IconNote icon="lock" at={T.dark3} y={985}>
      {"Dark web = tiny slice\nreachable via Tor"}
    </IconNote>
    <Sticker src="raccoon/side-eye.png" at={T.deep2 + 6} x={TX + 620} y={955} w={270} fadeBottom={60} />
  </>
);

// ---------------- Beat 4B: .onion Services & Real-World Users ----------------
const ONION_Y = 740;
const ONION_YOU = { x: TX + 135, y: ONION_Y, w: 220, h: 165 };
const ONION_MID = { x: TX + 450, y: ONION_Y, w: 240, h: 165 };
const ONION_SRV = { x: TX + 765, y: ONION_Y, w: 220, h: 165 };

const OnionServices: React.FC<{ T: Cues }> = ({ T }) => {
  const u = anchors(ONION_YOU);
  const m = anchors(ONION_MID);
  const s = anchors(ONION_SRV);
  const tPath = arrowPath({ from: { x: ONION_YOU.x - 95, y: ONION_Y }, to: { x: ONION_SRV.x + 95, y: ONION_Y } });
  return (
    <>
      <Headline a=".onion stays inside Tor" b="Never uses an exit relay." at={T.onion3 - 4} bAt={T.never - 2} size={74} />
      <UrlBar
        url="https://torproject...v3.onion"
        x={TX}
        y={425}
        w={TW}
        size={38}
        at={T.onion3 - 2}
        font="mono"
        state="safe"
        stateAt={T.onion3 + 6}
        mark={{ t: ".onion", at: T.onion3 + 2, color: C.accent }}
      />

      <Tunnel path={tPath} at={T.onion3 + 2} width={195} label="100% inside the Tor network — no Exit relay" chipDy={-126} />
      <Arrow at={T.onion3 + 6} from={u.right} to={m.left} both active width={4} />
      <Arrow at={T.onion3 + 10} from={m.right} to={s.left} both active width={4} />
      <Node {...ONION_YOU} icon="laptop" label="You" sub="Tor client" at={T.onion3} state="active" size={30} />
      <Node
        {...ONION_MID}
        icon="shieldCheck"
        label="Tor Circuit"
        sub="no exit relay"
        subMono
        at={T.never}
        state="ok"
        size={30}
      />
      <Node {...ONION_SRV} icon="lock" label=".onion site" sub="onion service" at={T.onion3 + 4} state="active" size={30} />

      <IconNote icon="shieldCheck" tint={GREEN} at={T.never} until={T.journalists} y={965}>
        {"Traffic never leaves\nthe Tor tunnel"}
      </IconNote>
      <IconNote icon="users" at={T.journalists} y={965}>
        {"Used daily by journalists,\nwhistleblowers & citizens"}
      </IconNote>
      <Sticker src="raccoon/peek-pillar.png" at={T.journalists - 4} x={W - 205} y={880} w={205} from="right" />
    </>
  );
};

export const DarkWeb: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <Win from={0} to={T.normal}>
        <Hook T={T} />
      </Win>
      <Win from={T.normal} to={T.nineties}>
        <NormalWeb T={T} />
      </Win>
      <Win from={T.nineties} to={T.tor2}>
        <OriginNRL T={T} />
      </Win>
      <Win from={T.tor2} to={T.each}>
        <ThreeLayers T={T} />
      </Win>
      <Win from={T.each} to={T.mix}>
        <PeelingCircuit T={T} />
      </Win>
      <Win from={T.mix} to={T.onion3 - 4}>
        <WebComparison T={T} />
      </Win>
      <Win from={T.onion3 - 4} to={T.save}>
        <OnionServices T={T} />
      </Win>

      <SaveOutro
        at={T.save}
        h={termH(5, 25)}
        fontSize={25}
        title="tor & dark web"
        lines={cheatLines(
          [
            ["Guard relay", "knows your IP, peels layer 1"],
            ["Middle relay", "knows Guard + Exit, peels 2"],
            ["Exit relay", "knows the site, peels layer 3"],
            ["Deep web", "login pages (email, banking)"],
            ["Dark web", ".onion sites inside Tor only"],
          ],
          15,
        )}
        sub="Tor = The Onion Router (U.S. Naval Research Lab)"
        question={"Did you know your\ninbox is deep web?"}
      />
      <EndCard
        at={T.follow}
        comment={T.comment}
        question="Did you know your email inbox is on the deep web?"
        line="Follow for more tech explainers."
      />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("dark-web/voice.mp3")} />
      <Sfx
        name="whoosh"
        at={[T.normal, T.nineties, T.tor2, T.each, T.mix, T.onion3 - 4, T.save, T.follow]}
      />
      <Sfx name="switch" at={[T.innermost, T.middleKey, T.outermost, T.guardPeels, T.middlePeels, T.exitPeels]} />
      <Sfx name="ding" at={[T.tor1, T.noSingle, T.ninety, T.never]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + 3-relay onion visual + chips.
const COVER_CARD_Y = 470;
const COVER_CARD_H = 610;
const COVER_NODE_Y = COVER_CARD_Y + 215;
const COVER_W_NODE = 114;
const coverX = (i: number) => CX + 90 + i * 185;

export const DarkWebCover: React.FC = () => {
  const tPath = arrowPath({ from: { x: coverX(1) - 48, y: COVER_NODE_Y }, to: { x: coverX(3) + 48, y: COVER_NODE_Y } });
  const rows: { name: string; ip: boolean; site: boolean }[] = [
    { name: "1. Guard relay", ip: true, site: false },
    { name: "2. Middle relay", ip: false, site: false },
    { name: "3. Exit relay", ip: false, site: true },
  ];
  return (
    <Cover title="How the dark web" sub="actually works." size={94} chips={["Tor", "3 relays", ".onion", "deep web"]}>
      <div
        style={{
          position: "absolute",
          left: CX,
          top: COVER_CARD_Y,
          width: CW,
          height: COVER_CARD_H,
          borderRadius: 34,
          background: C.white,
          boxShadow: CARD_SHADOW,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 36,
            top: 24,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "-0.02em",
            color: C.mute,
          }}
        >
          Onion routing: 3 relays, 3 layers
        </div>

        {/* Summary pills at bottom of the card */}
        <div
          style={{
            position: "absolute",
            left: 32,
            right: 32,
            bottom: 28,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {rows.map((r) => (
            <div
              key={r.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 24px",
                borderRadius: 18,
                background: C.paper,
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 27,
                color: C.ink,
              }}
            >
              <span>{r.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 28, fontFamily: mono, fontSize: 24 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: r.ip ? "#248A3D" : "#C9281E" }}>
                  <Mark kind={r.ip ? "check" : "cross"} size={26} color={r.ip ? GREEN : RED} draw={1} />
                  Your IP
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: r.site ? "#248A3D" : "#C9281E" }}>
                  <Mark kind={r.site ? "check" : "cross"} size={26} color={r.site ? GREEN : RED} draw={1} />
                  Site
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tunnel path={tPath} at={-100} width={128} label="3 layers of encryption" chipDy={-102} />
      {HOOK_NODES.slice(1).map((n, i) => (
        <Arrow
          key={n.label}
          at={-100}
          from={{ x: coverX(i) + COVER_W_NODE / 2 + 6, y: COVER_NODE_Y }}
          to={{ x: coverX(i + 1) - COVER_W_NODE / 2 - 6, y: COVER_NODE_Y }}
          active={i >= 0 && i <= 2}
          width={3.5}
        />
      ))}
      {HOOK_NODES.map((n, i) => (
        <Node
          key={n.label}
          x={coverX(i)}
          y={COVER_NODE_Y}
          w={COVER_W_NODE}
          shape="circle"
          icon={n.icon}
          label={n.label}
          size={27}
          at={-100}
          state={n.relay ? "active" : "idle"}
        />
      ))}
      {HOOK_NODES.map((n, i) => {
        if (!n.relay) return null;
        const a = anchors({ x: coverX(i), y: COVER_NODE_Y, w: COVER_W_NODE, shape: "circle" });
        return <Badge key={n.label} x={a.tr.x + 4} y={a.tr.y - 4} icon="lock" tone="blue" size={42} at={-100} />;
      })}

      <div style={{ position: "absolute", left: CX + 600, top: COVER_CARD_Y + 32 - 220, width: 320, height: 220, overflow: "hidden" }}>
        <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={290} from="below" shadow={false} />
      </div>
    </Cover>
  );
};
