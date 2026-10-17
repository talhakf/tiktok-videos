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
import { Terminal, type Block } from "../../components/Terminal";
import { HttpExchange } from "../../components/dev/HttpExchange";
import { JsonTree } from "../../components/dev/JsonTree";
import { Arrow, arrowPath, Packet } from "../../components/diagram/Arrow";
import { Badge } from "../../components/diagram/Badge";
import { anchors, Node } from "../../components/diagram/Node";
import { BuildList } from "../../components/layouts/BuildList";
import { GREEN, RED } from "../../components/layouts/Mark";
import { VsSplit } from "../../components/layouts/VsSplit";
import { LetterSplit } from "../../components/text/LetterSplit";
import { Icon, type IconName } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { durationFromCaptions, Sfx, Win } from "../../lib/timing";
import { makeCues } from "../../lib/cues";
import { C, prog, sans, TERM, W, H } from "../../theme";
import captionsJson from "../../../public/api-curl/captions.json";

// What an API is, with one curl.
// Facts + sources (GitHub REST API + RFC 9110, checked 2026-10-13): SudoRaccoon/Videos/api-curl.md → Facts checked.

const captions = captionsJson as Caption[];
const FPS = 30;
const DURATION = durationFromCaptions(captions, FPS);

export const ApiCurlComposition = () => (
  <>
    <Composition id="ApiCurl" component={ApiCurl} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    <CoverStill id="ApiCurlCover" component={ApiCurlCover} />
  </>
);

const useT = () => {
  const { fps } = useVideoConfig();
  return useMemo(() => {
    const { at, last, end } = makeCues(captions, fps);
    return {
      // 1. Hook
      shown: at("shown"),
      thousand: at("thousand"),
      // 2. Analogy: Sudo + restaurant kitchen + waiter
      imagine: at("imagine"),
      snacks: at("snacks"),
      kitchen: at("kitchen"),
      allowed: at("allowed"),
      menu: at("menu"),
      waiter: at("waiter"),
      api2: at("api", 2),
      application: at("application"),
      orders: at("orders"),
      kitchen2: at("kitchen", 2),
      waiter2: at("waiter", 2),
      data: at("data"),
      // 3a. Live terminal demo + JSON tree
      watch: at("watch"),
      curlCmd: at("curlhttpsapigithubcomuserstorvalds"),
      browser: at("browser"),
      key: at("key"),
      request: at("request"),
      json: at("json"),
      login: at("login"),
      repos: at("publicrepos"),
      followers: at("followers"),
      location: at("location"),
      // 3b. Why JSON instead of HTML?
      why: at("why"),
      html: at("html"),
      buttons: at("buttons"),
      colors: at("colors"),
      human: at("human"),
      json3: at("json", 3),
      skips: at("skips"),
      pairs: at("key-value"),
      line: at("line"),
      // 4. Anatomy of an API call
      every2: at("every", 2),
      first: at("first"),
      method: at("method"),
      get: at("get"),
      post: at("post"),
      second: at("second"),
      url: at("url"),
      endpoint: at("endpoint"),
      snacksPath: at("snacks", 2),
      third: at("third"),
      status: at("status"),
      ok200: at("200ok"),
      notfound: at("404notfound"),
      forbidden: at("403forbidden"),
      tries: at("tries"),
      unlock: at("postfridgeunlock"),
      // 5. Everyday examples
      once: at("once"),
      scenes: at("scenes"),
      weather: at("weather"),
      forecast: at("getforecast"),
      tapping: at("tapping"),
      api5: at("api", 5),
      watching: at("watching"),
      pizza: at("pizza"),
      api6: at("api", 6),
      // 6. Outro + CTA
      save: at("save"),
      follow: last("follow"),
      comment: last("comment"),
      end,
    };
  }, [fps]);
};
type Cues = ReturnType<typeof useT>;

const IconNote: React.FC<{
  icon: IconName;
  at: number;
  until?: number;
  x?: number;
  y: number;
  size?: number;
  tint?: string;
  children: React.ReactNode;
}> = ({ icon, at, until, x = TX, y, size, tint = C.accent, children }) => {
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

// window height for `rows` text rows (the body loses ~148 px to title bar + padding)
const termH = (rows: number, fs: number) => Math.ceil(rows * fs * 1.38 + 150);

const CURL_CMD = "curl https://api.github.com/users/torvalds";

const TORVALDS_DATA = {
  login: "torvalds",
  name: "Linus Torvalds",
  public_repos: 12,
  followers: 327655,
  location: "Portland, OR",
};

// ---------------- 1. Hook: request -> JSON from frame 0 ----------------
const HOOK_Y = 485;
const Hook: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="What an API actually is." b="One curl command." until={T.imagine} size={74} />
    <HttpExchange
      x={TX}
      y={HOOK_Y}
      w={TW}
      at={-100}
      sendAt={-80}
      respondAt={-40}
      latency="42 ms"
      gap={84}
      size={25}
      host="api.github.com"
      request={{ method: "GET", path: "/users/torvalds" }}
      response={{
        status: 200,
        reason: "OK",
        body: '{\n  "login": "torvalds",\n  "public_repos": 12,\n  "followers": 327655\n}',
      }}
    />
    <PeekOver src="raccoon/peek-paws.png" at={-100} x={TX + 610} edgeY={HOOK_Y} w={260} h={195} overhang={30} />
    <Note at={-100} until={T.thousand} x={TX} y={1065} font="mono" size={28}>
      {CURL_CMD}
    </Note>
    <IconNote icon="phone" at={T.thousand} y={1055}>
      {"Every app on your phone:\n1,000× a day"}
    </IconNote>
  </>
);

// ---------------- 2. Analogy: Sudo, menu + waiter, server kitchen ----------------
const APP_NODE = { x: TX + 135, y: 585, w: 230, h: 185 };
const API_NODE = { x: TX + 450, y: 585, w: 240, h: 185 };
const KITCHEN_NODE = { x: TX + 765, y: 585, w: 230, h: 185 };

const Analogy: React.FC<{ T: Cues }> = ({ T }) => {
  const aApp = anchors(APP_NODE);
  const aApi = anchors(API_NODE);
  const aKit = anchors(KITCHEN_NODE);
  const toApi = arrowPath({ from: aApp.right, to: aApi.left });
  const toKit = arrowPath({ from: aApi.right, to: aKit.left });
  return (
    <>
      <Headline a="Snacks in the kitchen." b="The menu and the waiter." at={T.imagine} bAt={T.menu - 4} size={74} />

      <Node {...APP_NODE} icon="laptop" label="Your app" sub="Sudo" at={T.imagine} size={32} />
      <Node
        {...API_NODE}
        icon="clipboard"
        label="API"
        sub="menu + waiter"
        at={T.menu - 6}
        size={32}
        states={[
          { at: T.menu, state: "active" },
          { at: T.waiter2, state: "ok" },
        ]}
      />
      <Node
        {...KITCHEN_NODE}
        icon="server"
        label="Server"
        sub="the kitchen"
        at={T.kitchen - 6}
        size={32}
        states={[
          { at: T.allowed, state: "error" },
          { at: T.menu, state: "idle" },
          { at: T.kitchen2, state: "active" },
          { at: T.data, state: "ok" },
        ]}
      />

      <Badge
        x={aKit.tr.x - 4}
        y={aKit.tr.y + 4}
        icon="lock"
        tone="red"
        size={48}
        at={T.allowed}
        changes={[
          { at: T.kitchen2, icon: "bolt", tone: "blue" },
          { at: T.data, icon: "check", tone: "green" },
        ]}
      />

      <Arrow at={T.menu} from={aApp.right} to={aApi.left} active={T.orders} both />
      <Arrow at={T.waiter - 4} from={aApi.right} to={aKit.left} active={T.kitchen2} both />

      <Packet path={toApi} at={T.orders} dur={22} label="GET /snacks" />
      <Packet path={toKit} at={T.orders + 20} dur={20} label="GET /snacks" />
      <Packet path={toKit} at={T.waiter2 - 6} dur={18} label="{ snacks }" color={GREEN} reverse />
      <Packet path={toApi} at={T.waiter2 + 12} dur={20} label="{ snacks }" color={GREEN} reverse />

      <LetterSplit
        chunks={[
          { t: "A", meaning: "Application" },
          { t: "P", meaning: "Programming" },
          { t: "I", meaning: "Interface" },
        ]}
        at={T.api2}
        splitAt={T.application - 4}
        until={T.orders - 2}
        x={TX}
        y={750}
        w={TW}
        size={96}
        gap={155}
        meaningW={230}
        color={C.accent}
      />

      <IconNote icon="lock" tint={RED} at={T.allowed} until={T.menu} y={1020}>
        {"No direct access\nto the server's kitchen"}
      </IconNote>
      <IconNote icon="clipboard" at={T.menu} until={T.waiter} y={1020}>
        {"Menu = what you're\nallowed to ask for"}
      </IconNote>
      <IconNote icon="arrowRight" at={T.waiter} until={T.api2} y={1020}>
        {"Waiter = takes order\nand brings data back"}
      </IconNote>
      <IconNote icon="check" tint={GREEN} at={T.orders} y={1020} size={34}>
        {"App orders → Server cooks\n→ Waiter brings data"}
      </IconNote>

      <Sticker src="raccoon/standing-front.png" at={T.imagine + 6} until={T.orders} x={TX + 690} y={960} w={185} />
      <Sticker src="raccoon/crepe.png" at={T.waiter2} x={TX + 650} y={965} w={245} />
    </>
  );
};

// ---------------- 3a. Live terminal demo: curl + JsonTree ----------------
const TERM_FS = 23;
const TERM_H = termH(2, TERM_FS);
const LiveDemo: React.FC<{ T: Cues }> = ({ T }) => {
  const tf = Math.max(28, T.browser - T.curlCmd - 12);
  const blocks: Block[] = [
    {
      at: T.curlCmd - 4,
      cmd: CURL_CMD,
      typeFrames: tf,
      outDelay: Math.max(6, T.request - (T.curlCmd - 4 + tf)),
      out: [[{ t: '{ "login": "torvalds", "id": 1024025, ... }', c: TERM.green, b: true }]],
    },
  ];
  return (
    <>
      <Headline a="One curl in the terminal." b="No browser. No API key." at={T.watch} bAt={T.browser - 4} size={74} />
      <Terminal x={TX} y={400} w={TW} h={TERM_H} fontSize={TERM_FS} enterAt={T.watch} blocks={blocks} />
      <JsonTree
        data={TORVALDS_DATA}
        x={TX}
        y={635}
        w={TW}
        at={T.json - 10}
        size={25}
        filename="api.github.com/users/torvalds"
        right="200 OK · JSON"
        focus={[
          { path: "login", at: T.login, until: T.repos },
          { path: "public_repos", at: T.repos, until: T.followers },
          { path: "followers", at: T.followers, until: T.location, tone: "good" },
          { path: "location", at: T.location },
        ]}
      />
      <IconNote icon="key" at={T.browser} until={T.json} y={1040}>
        {"Public GitHub API:\n60 requests/hr, no key"}
      </IconNote>
      <IconNote icon="code" at={T.json} until={T.followers} y={1040}>
        {"JSON = key-value pairs\nreturned by the server"}
      </IconNote>
      <IconNote icon="users" tint={GREEN} at={T.followers} y={1040}>
        {"Live GitHub profile data\nin one command"}
      </IconNote>
      <Sticker src="raccoon/pointing.png" at={T.json + 4} x={TX + 650} y={985} w={235} />
    </>
  );
};

// ---------------- 3b. Why JSON instead of HTML? ----------------
const HtmlVsJson: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="Why JSON, not HTML?" b="Webpages vs raw data." at={T.why} bAt={T.json3 - 4} size={72} />
    <VsSplit
      x={TX}
      y={425}
      w={TW}
      h={550}
      at={T.why + 6}
      winner={{ index: 1, at: T.json3 }}
      columns={[
        {
          label: "HTML",
          icon: "window",
          lines: [
            { t: '<div class="btn">', mono: true, at: T.html },
            { t: "Buttons & layout", mark: "cross", at: T.buttons },
            { t: "Colors & fonts", mark: "cross", at: T.colors },
            { t: "For human eyes", mark: "cross", at: T.human },
          ],
        },
        {
          label: "JSON",
          icon: "code",
          lines: [
            { t: '"followers": 327655', mono: true, at: T.json3 },
            { t: "Skips the webpage", mark: "check", at: T.skips },
            { t: "Key-value pairs", mark: "check", at: T.pairs },
            { t: "Read in 1 line", mark: "check", at: T.line },
          ],
        },
      ]}
    />
    <IconNote icon="eye" at={T.html} until={T.json3} y={1025}>
      {"Webpages wrap data\nin visual styling"}
    </IconNote>
    <IconNote icon="bolt" tint={GREEN} at={T.json3} y={1025}>
      {"data.followers → 327655\nReady for your code"}
    </IconNote>
    <Sticker src="raccoon/scheming.png" at={T.json3 + 6} x={TX + 675} y={1005} w={215} fadeBottom={45} />
  </>
);

// ---------------- 4. Anatomy of an API call: Method, Endpoint, Status ----------------
const ANAT_Y = 430;
const Anatomy: React.FC<{ T: Cues }> = ({ T }) => (
  <>
    <Headline a="3 parts of an API call." b="Method · Endpoint · Status" at={T.every2} bAt={T.first} size={72} />

    <Win from={T.every2} to={T.forbidden}>
      <HttpExchange
        x={TX}
        y={ANAT_Y}
        w={TW}
        at={T.every2}
        sendAt={T.every2 + 10}
        respondAt={T.every2 + 26}
        latency="42 ms"
        gap={96}
        size={25}
        host="api.github.com"
        request={{ method: "GET", path: "/users/torvalds" }}
        response={{
          status: 200,
          reason: "OK",
          body: '{\n  "login": "torvalds",\n  "followers": 327655\n}',
        }}
      />
      {/* 1. Method chip ring */}
      <Circle at={T.method} until={T.second} x={TX + 22} y={ANAT_Y + 12} w={104} h={68} />
      {/* 2. URL endpoint ring */}
      <Circle at={T.url} until={T.third} x={TX + 128} y={ANAT_Y + 12} w={305} h={68} />
      {/* 3. Status pill ring */}
      <Circle at={T.status} x={TX + 22} y={ANAT_Y + 166 + 96 + 12} w={195} h={68} />

      <IconNote icon="download" at={T.get} until={T.post} y={1020}>
        {"GET = read data\n(changes nothing)"}
      </IconNote>
      <IconNote icon="upload" at={T.post} until={T.second} y={1020}>
        {"POST = send or create\ndata on the server"}
      </IconNote>
      <IconNote icon="link" at={T.url} until={T.third} y={1020}>
        {"Endpoint = which item\n(/users/torvalds, /snacks)"}
      </IconNote>
      <IconNote icon="check" tint={GREEN} at={T.ok200} until={T.notfound} y={1020}>
        {"200 OK =\nrequest worked"}
      </IconNote>
      <IconNote icon="cross" tint={RED} at={T.notfound} y={1020}>
        {"404 Not Found =\ndoesn't exist"}
      </IconNote>
      <Sticker src="raccoon/pointing.png" at={T.first + 4} x={TX + 655} y={980} w={230} flip />
    </Win>

    <Win from={T.forbidden} to={T.once}>
      <HttpExchange
        x={TX}
        y={ANAT_Y}
        w={TW}
        at={T.forbidden}
        sendAt={T.forbidden + 8}
        respondAt={T.forbidden + 22}
        latency="9 ms"
        gap={96}
        size={25}
        host="api.kitchen.local"
        request={{ method: "POST", path: "/fridge/unlock", body: '{ "user": "sudo", "snacks": "all" }' }}
        response={{
          status: 403,
          reason: "Forbidden",
          body: '{ "error": "Permission denied: locked" }',
        }}
      />
      <Circle at={T.unlock} x={TX + 22} y={ANAT_Y + 225 + 96 + 12} w={290} h={68} />
      <IconNote icon="lock" tint={RED} at={T.forbidden + 4} y={1015}>
        {"403 Forbidden =\nno permission (nice try)"}
      </IconNote>
      <Sticker src="raccoon/hands-up.png" at={T.tries} x={TX + 650} y={985} w={235} fadeBottom={50} />
    </Win>
  </>
);

// ---------------- 5. Everyday examples ----------------
const PHONE_NODE = { x: TX + 170, y: 925, w: 240, h: 130, iconPos: "left" as const };
const CLOUD_NODE = { x: TX + 690, y: 925, w: 260, h: 130, iconPos: "left" as const };

const Everyday: React.FC<{ T: Cues }> = ({ T }) => {
  const aPhone = anchors(PHONE_NODE);
  const aCloud = anchors(CLOUD_NODE);
  const wire = arrowPath({ from: aPhone.right, to: aCloud.left });
  return (
    <>
      <Headline a="Every app on your phone." b="API calls under the hood." at={T.once} bAt={T.scenes - 6} size={74} />
      <BuildList
        x={TX}
        y={420}
        w={TW}
        at={T.once + 8}
        card
        rows={[
          { at: T.weather - 4, doneAt: T.forecast, mark: 1, cmd: "GET /forecast?city=portland", text: "Weather app — temperature & rain" },
          { at: T.tapping - 2, doneAt: T.api5, mark: 2, cmd: "POST /oauth/google", text: "Sign in with Google — verify login" },
          { at: T.watching - 2, doneAt: T.api6, mark: 3, cmd: "GET /orders/pizza/location", text: "Pizza tracker — live driver map" },
        ]}
      />
      <Node {...PHONE_NODE} icon="phone" label="Phone" sub="UI" at={T.once + 10} size={30} />
      <Node
        {...CLOUD_NODE}
        icon="cloud"
        label="Server APIs"
        sub="JSON"
        at={T.once + 14}
        size={30}
        states={[
          { at: T.forecast, state: "active" },
          { at: T.api6, state: "ok" },
        ]}
      />
      <Arrow at={T.once + 18} from={aPhone.right} to={aCloud.left} active={T.forecast} label="HTTPS" labelMono both />
      <Packet path={wire} at={T.forecast} dur={22} label="GET /forecast" />
      <Packet path={wire} at={T.api5 - 6} dur={22} label="POST /oauth" />
      <Packet path={wire} at={T.api6 - 6} dur={22} label="{ lat, lng }" color={GREEN} reverse />

      <IconNote icon="globe" at={T.once + 16} y={1045}>
        {"Apps are buttons on top\nof API requests"}
      </IconNote>
      <Sticker src="raccoon/laughing.png" at={T.pizza} x={TX + 660} y={1030} w={225} />
    </>
  );
};

export const ApiCurl: React.FC = () => {
  const T = useT();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />

      <Win from={0} to={T.imagine}>
        <Hook T={T} />
      </Win>
      <Win from={T.imagine} to={T.watch}>
        <Analogy T={T} />
      </Win>
      <Win from={T.watch} to={T.why}>
        <LiveDemo T={T} />
      </Win>
      <Win from={T.why} to={T.every2}>
        <HtmlVsJson T={T} />
      </Win>
      <Win from={T.every2} to={T.once}>
        <Anatomy T={T} />
      </Win>
      <Win from={T.once} to={T.save}>
        <Everyday T={T} />
      </Win>

      <SaveOutro
        at={T.save}
        h={termH(5, 24)}
        fontSize={24}
        title="api cheat sheet"
        lines={cheatLines(
          [
            ["curl api.github.com/users/torvalds", "live JSON"],
            ["GET /path", "read data"],
            ["POST /path", "send data"],
            ["200 OK / 404", "worked / missing"],
            ["403 Forbidden", "no permission"],
          ],
          36,
        )}
        sub="macOS, Linux, or Windows Terminal — no API key needed"
        question={"What API should\nSudo call next?"}
      />
      <EndCard at={T.follow} comment={T.comment} question="What API should Sudo call next?" line="Follow for more terminal explainers." />

      <Captions captions={captions} top={1340} />

      <Audio src={staticFile("api-curl/voice.mp3")} />
      <Sfx name="whoosh" at={[T.imagine, T.watch, T.why, T.every2, T.forbidden, T.once, T.save, T.follow]} />
      <Sfx name="mouse-click" at={[T.curlCmd - 4, T.method, T.url, T.status]} />
      <Sfx name="ding" at={[T.waiter2, T.followers, T.json3, T.ok200, T.api6]} />
    </AbsoluteFill>
  );
};

// Cover (1080×1440, uploaded separately in TikTok Studio): headline + the payoff visual + chips. Not a video frame.
const CTY = 480;
export const ApiCurlCover: React.FC = () => (
  <Cover title="What an API is." sub="One curl command." size={88} chips={["curl", "GET / POST", "JSON", "200 OK"]}>
    <HttpExchange
      x={CX}
      y={CTY}
      w={CW}
      at={-100}
      sendAt={-80}
      respondAt={-40}
      latency="42 ms"
      gap={80}
      size={25}
      host="api.github.com"
      request={{ method: "GET", path: "/users/torvalds" }}
      response={{
        status: 200,
        reason: "OK",
        body: '{\n  "login": "torvalds",\n  "public_repos": 12,\n  "followers": 327655\n}',
      }}
    />
    <div style={{ position: "absolute", left: CX + 600, top: CTY + 34 - 220, width: 320, height: 220, overflow: "hidden" }}>
      <Sticker src="raccoon/peek-paws.png" at={-100} x={10} y={10} w={290} from="below" shadow={false} />
    </div>
  </Cover>
);
