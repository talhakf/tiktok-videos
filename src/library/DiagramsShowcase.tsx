import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Arrow, arrowPath, Packet, PathSpec, Tunnel } from "../components/diagram/Arrow";
import { Badge } from "../components/diagram/Badge";
import { CellGrid, Pipe } from "../components/diagram/CellGrid";
import { FolderTree } from "../components/diagram/FolderTree";
import { GitGraph } from "../components/diagram/GitGraph";
import { LayerStack } from "../components/diagram/LayerStack";
import { anchors, Database, Node, NodeBox } from "../components/diagram/Node";
import { C, materialize, mono, prog } from "../theme";

// Preview of the diagram components: five 120-frame scenes (network path + VPN, home network,
// merge vs rebase, Linux folder tree, VM vs container + queues). Grey mono tags name the components.

const Tag: React.FC<{ x: number; y: number; at?: number; children: React.ReactNode }> = ({ x, y, at = 0, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontWeight: 500, fontSize: 24, color: C.mute, whiteSpace: "nowrap", ...materialize(prog(frame, at, 9)) }}>
      {children}
    </div>
  );
};

const NetworkScene: React.FC = () => {
  const you: NodeBox = { x: 150, y: 640, shape: "circle", w: 150 };
  const cafe: NodeBox = { ...you, x: 410 };
  const isp: NodeBox = { ...you, x: 670 };
  const site: NodeBox = { ...you, x: 930 };
  const a = [you, cafe, isp, site].map(anchors);
  const hops: PathSpec[] = [0, 1, 2].map((i) => ({ from: a[i].right, to: a[i + 1].left }));
  const through = arrowPath({ from: a[0].center, to: a[3].center });
  // second row: node shapes, states, arrow kinds, database
  const api: NodeBox = { x: 270, y: 1130, w: 340, icon: "server", iconPos: "left" };
  const db: NodeBox = { x: 830, y: 1130, w: 200, h: 220 };
  const cache: NodeBox = { x: 540, y: 1430, w: 240, shape: "pill" };
  const A = anchors(api);
  const D = anchors(db);
  const K = anchors(cache);
  const query: PathSpec = { from: A.right, to: D.left };
  return (
    <>
      <Tag x={90} y={300}>Node (circle) · Arrow · Packet · Badge · Tunnel</Tag>
      <Tunnel path={through} at={70} width={104} label="encrypted tunnel" chipDy={-118} />
      <Node {...you} label="you" icon="laptop" at={0} />
      <Node {...cafe} label="café wi-fi" icon="wifi" at={5} />
      <Node {...isp} label="provider" icon="cloud" at={10} />
      <Node {...site} label="website" icon="globe" at={15} />
      {hops.map((h, i) => (
        <Arrow key={i} {...h} at={12 + i * 5} dur={10} />
      ))}
      <Packet path={through} at={30} dur={34} label="GET /" />
      <Badge {...a[1].tr} icon="eye" tone="red" at={44} changes={[{ at: 86, icon: "eyeOff", tone: "grey" }]} />
      <Badge {...a[2].tr} icon="eye" tone="red" at={52} changes={[{ at: 90, icon: "eyeOff", tone: "grey" }]} />
      <Packet path={through} at={88} dur={30} icon="lock" />

      <Tag x={90} y={930} at={20}>Node (box, pill) · Database · states · elbow, curve, dashed, both</Tag>
      <Node {...api} label="api" sub=":443" subMono at={22} states={[{ at: 58, state: "active" }, { at: 92, state: "error" }]} />
      <Database {...db} label="users" sub="pg 16" at={28} states={[{ at: 74, state: "ok" }]} />
      <Node {...cache} label="cache" at={34} states={[{ at: 96, state: "dim" }]} />
      <Arrow {...query} at={40} both label="query" labelMono active={58} />
      <Arrow from={A.bottom} to={K.left} kind="elbow" route="vh" at={46} dashed />
      <Arrow from={K.right} to={D.bottom} kind="curve" bend={60} at={52} />
      <Packet path={arrowPath(query)} at={60} dur={20} trail />
    </>
  );
};

const HomeScene: React.FC = () => {
  const modem: NodeBox = { x: 540, y: 470, w: 380, icon: "modem", iconPos: "left" };
  const router: NodeBox = { ...modem, y: 680, icon: "router" };
  const sw: NodeBox = { ...modem, y: 890, icon: "switch" };
  const devs: NodeBox[] = [220, 540, 860].map((x) => ({ x, y: 1210, w: 250, icon: "laptop" }));
  const [M, R, S] = [modem, router, sw].map(anchors);
  const down: PathSpec[] = [
    { from: M.bottom, to: R.top },
    { from: R.bottom, to: S.top },
  ];
  const fan: PathSpec[] = devs.map((d) => ({ from: S.bottom, to: anchors(d).top, kind: "elbow", route: "vhv" }));
  const names = ["laptop", "tv", "phone"];
  const icons = ["laptop", "window", "phone"] as const;
  return (
    <>
      <Tag x={90} y={300}>Node (icon left / top) · elbow Arrow · Packet loop · error ring</Tag>
      <Node {...modem} label="modem" sub="203.0.113.7" subMono at={0} />
      <Node {...router} label="router" sub="192.168.1.1" subMono at={10} states={[{ at: 40, state: "active" }, { at: 70, state: "idle" }]} />
      <Node {...sw} label="switch" sub="8 ports" at={20} />
      {down.map((p, i) => (
        <Arrow key={i} {...p} at={6 + i * 10} dur={9} />
      ))}
      {devs.map((d, i) => (
        <Node key={i} {...d} icon={icons[i]} label={names[i]} at={30 + i * 3} states={i === 2 ? [{ at: 84, state: "error" }] : i === 1 ? [{ at: 70, state: "active" }] : []} />
      ))}
      {fan.map((p, i) => (
        <Arrow key={i} {...p} at={28 + i * 2} dur={12} active={i === 1 ? 70 : undefined} />
      ))}
      <Packet path={arrowPath({ from: M.bottom, to: S.top })} at={40} dur={22} loop={2} every={26} />
      <Packet path={arrowPath(fan[1])} at={60} dur={18} label="dhcp" />
      <Badge {...anchors(devs[2]).tr} icon="warning" tone="red" at={88} />
    </>
  );
};

const GitScene: React.FC = () => {
  return (
    <>
      <Tag x={90} y={300}>GitGraph · merge, then reset (drop + HEAD move)</Tag>
      <Tag x={90} y={350} at={84}>
        <span style={{ color: C.ink }}>git reset --hard HEAD~1</span>
      </Tag>
      <GitGraph
        x={170}
        y={560}
        colGap={170}
        commits={[
          { id: "a", lane: 0, x: 0, label: "a1f3c9e", at: 0 },
          { id: "b", lane: 0, x: 1, label: "7c2d4b0", at: 6, parents: ["a"] },
          { id: "c", lane: 1, x: 2, label: "e94b1a2", at: 14, parents: ["b"] },
          { id: "d", lane: 1, x: 3, label: "3b8f0d6", at: 22, parents: ["c"] },
          { id: "e", lane: 0, x: 2, label: "5d0e7f1", at: 30, parents: ["b"] },
          { id: "m", lane: 0, x: 4, label: "9a6c2e8", at: 50, parents: ["e", "d"] },
        ]}
        branches={[
          { name: "main", commit: "b", at: 8, moveTo: [{ commit: "e", at: 32 }, { commit: "m", at: 52 }, { commit: "e", at: 86 }] },
          { name: "feature", commit: "c", at: 16, moveTo: [{ commit: "d", at: 24 }], side: "bottom" },
        ]}
        head={[
          { commit: "b", at: 10 },
          { commit: "e", at: 34 },
          { commit: "m", at: 54 },
          { commit: "e", at: 88 },
        ]}
        drop={[{ id: "m", at: 86 }]}
      />
      <Tag x={90} y={900} at={40}>GitGraph · rebase replay (moves + new hashes)</Tag>
      <GitGraph
        x={170}
        y={1160}
        colGap={170}
        commits={[
          { id: "a", lane: 0, x: 0, label: "a1f3c9e", at: 40 },
          { id: "b", lane: 0, x: 1, label: "7c2d4b0", at: 44, parents: ["a"] },
          { id: "c", lane: 1, x: 2, label: "e94b1a2", at: 48, parents: ["b"], color: C.accent },
          { id: "d", lane: 1, x: 3, label: "3b8f0d6", at: 52, parents: ["c"], color: C.accent },
          { id: "e", lane: 0, x: 2, label: "5d0e7f1", at: 56, parents: ["b"] },
        ]}
        moves={[
          { id: "c", to: { lane: 0, x: 3 }, at: 70, newLabel: "c27a9f4", parents: ["e"] },
          { id: "d", to: { lane: 0, x: 4 }, at: 76, newLabel: "f05e3b8" },
        ]}
        branches={[
          { name: "main", commit: "e", at: 58 },
          { name: "feature", commit: "d", at: 54, side: "bottom" },
        ]}
        head={[{ commit: "d", at: 56 }]}
      />
    </>
  );
};

const TreeScene: React.FC = () => (
  <>
    <Tag x={90} y={300}>FolderTree · stagger · highlight walk · collapsed</Tag>
    <FolderTree
      x={110}
      y={400}
      at={0}
      descX={430}
      w={860}
      rowH={70}
      items={[
        { path: "/", desc: "root of everything" },
        { path: "/bin", desc: "programs" },
        { path: "/etc", desc: "settings" },
        { path: "/etc/ssh", desc: "ssh config" },
        { path: "/home", desc: "people's files" },
        { path: "/home/you", desc: "your files" },
        { path: "/home/you/.bashrc", file: true, desc: "shell setup" },
        { path: "/tmp", desc: "wiped on reboot" },
        { path: "/usr", desc: "installed software", collapsed: true },
        { path: "/usr/lib" },
        { path: "/var", desc: "logs, caches" },
        { path: "/var/log", desc: "logs" },
        { path: "/dev", desc: "devices as files" },
      ]}
      highlight={[
        { path: "/etc", at: 36 },
        { path: "/home/you", at: 54 },
        { path: "/var/log", at: 72 },
        { path: "/tmp", at: 90 },
        { path: null, at: 110 },
      ]}
    />
  </>
);

const StackScene: React.FC = () => {
  const bottom = 1000;
  const h = (n: number) => n * 88 + (n - 1) * 10;
  const pipe = { x: 90, y: 1390, w: 620, h: 104 };
  const toDb: PathSpec = { from: { x: pipe.x + pipe.w + 10, y: pipe.y + pipe.h / 2 }, to: { x: 836, y: pipe.y + pipe.h / 2 } };
  return (
    <>
      <Tag x={90} y={300}>LayerStack ×2 · brackets · split layers</Tag>
      <Tag x={110} y={360}>
        <span style={{ color: C.ink, fontSize: 28 }}>virtual machine</span>
      </Tag>
      <Tag x={610} y={360} at={3}>
        <span style={{ color: C.ink, fontSize: 28 }}>container</span>
      </Tag>
      <LayerStack
        x={110}
        y={bottom - h(6)}
        w={390}
        layers={[
          { label: "hardware", icon: "chip", at: 0, tone: "ink" },
          { label: "host os", at: 5, tone: "soft" },
          { label: "hypervisor", at: 10, tone: "blue" },
          { label: ["guest os", "guest os"], at: 15 },
          { label: ["libs", "libs"], at: 20 },
          { label: ["app", "app"], at: 25, tone: "accent" },
        ]}
        brackets={[{ from: 3, to: 5, label: "per app", at: 34, side: "left" }]}
      />
      <LayerStack
        x={590}
        y={bottom - h(5)}
        w={390}
        layers={[
          { label: "hardware", icon: "chip", at: 3, tone: "ink" },
          { label: "host os", at: 8, tone: "soft" },
          { label: "container engine", at: 13, tone: "blue" },
          { label: ["libs", "libs"], at: 18 },
          { label: ["app", "app"], at: 23, tone: "accent" },
        ]}
        brackets={[{ from: 3, to: 4, label: "per app", at: 37 }]}
      />
      <Tag x={90} y={1060} at={36}>CellGrid · Pipe · Database</Tag>
      <CellGrid
        x={330}
        y={1120}
        rows={2}
        cols={6}
        cell={78}
        at={38}
        rowLabels={["partition 1", "partition 2"]}
        fills={[
          { index: 0, at: 48, until: 96, label: "1" },
          { index: 6, at: 52, label: "2" },
          { index: 1, at: 56, label: "3" },
          { index: 7, at: 60, label: "4" },
          { index: 2, at: 64, label: "5" },
        ]}
      />
      <Pipe
        {...pipe}
        at={44}
        label="queue"
        items={[
          { label: "m1", at: 50, out: 92 },
          { label: "m2", at: 58 },
          { label: "m3", at: 66 },
          { label: "m4", at: 74 },
        ]}
      />
      <Arrow {...toDb} at={50} dur={8} />
      <Database x={920} y={pipe.y + pipe.h / 2} w={150} h={170} label="orders" size={26} at={46} states={[{ at: 104, state: "active" }]} />
      <Packet path={arrowPath(toDb)} at={94} dur={12} label="m1" />
    </>
  );
};

/** Five timed scenes, one per diagram use case, 120 frames each. */
export const DiagramsShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    {[NetworkScene, HomeScene, GitScene, TreeScene, StackScene].map((Scene, i) => (
      <Sequence key={i} from={i * 120} durationInFrames={120}>
        <Scene />
      </Sequence>
    ))}
  </AbsoluteFill>
);
