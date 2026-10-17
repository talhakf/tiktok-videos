import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { DataTable } from "../components/data/DataTable";
import { Gauge } from "../components/data/Gauge";
import { Waveform } from "../components/data/Waveform";
import { Machine } from "../components/diagram/Machine";
import { PortPanel } from "../components/diagram/PortPanel";
import { ChatThread } from "../components/layouts/ChatThread";
import { Timeline } from "../components/layouts/Timeline";
import { ToggleList } from "../components/layouts/ToggleList";
import { dim, green } from "../components/Terminal";
import { GuessList } from "../components/text/GuessList";
import { TmuxWindow } from "../components/windows/TmuxWindow";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the second batch (2026-10-11): tmux, chat, function box, guess reel, table, switches, gauge,
// waveform, timeline, port panel. Section frames: tmux 0, chat + waveform 100, machine 190, guesses 280,
// table + switches 370, gauge + timeline 460, ports 540.

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontWeight: 500, fontSize: 26, color: C.mute, opacity: prog(frame, at, 8) }}>
      {children}
    </div>
  );
};

export const MoreShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. TmuxWindow: split right, split down, focus, detach, attach */}
    <Win from={0} to={100}>
      <Label at={0} y={250}>
        TmuxWindow · % at 24, " at 46, detach 70, attach 86
      </Label>
      <TmuxWindow
        at={2}
        x={TX}
        y={310}
        w={900}
        h={760}
        windows={["zsh", "server"]}
        focus={[{ pane: "a", at: 60 }]}
        detachAt={70}
        attachAt={86}
        panes={[
          { id: "a", blocks: [{ at: 6, cmd: "npm run dev", out: [dim("ready on"), green("localhost:3000")] }] },
          { id: "b", split: { of: "a", dir: "right", at: 24 }, blocks: [{ at: 36, cmd: "git status", out: [dim("On branch main"), "nothing to commit"] }] },
          { id: "c", split: { of: "b", dir: "down", at: 46 }, blocks: [{ at: 54, cmd: "htop" }] },
        ]}
      />
    </Win>

    {/* 2. ChatThread with typing dots + read receipt, Waveform pill */}
    <Win from={100} to={190}>
      <Label at={100} y={250}>
        ChatThread · typing · read
      </Label>
      <ChatThread
        at={102}
        x={TX}
        y={300}
        contact="Mika"
        readAt={160}
        messages={[
          { at: 112, typing: 10, text: "what's the wifi\npassword?" },
          { at: 130, me: true, text: "no idea, I'm connected" },
          { at: 150, typing: 8, me: true, text: "wait, my laptop knows it" },
        ]}
      />
      <Label at={104} y={960}>
        Waveform · pill · speaks 120–170
      </Label>
      <Waveform at={106} x={TX} y={1010} pill speak={[[120, 170]]} />
    </Win>

    {/* 3. Machine: input → sha256 → hash, one-way */}
    <Win from={190} to={280}>
      <Label at={190} y={250}>
        Machine · drop 204 · print 218 · one-way 240
      </Label>
      <Machine
        at={192}
        x={TX}
        y={310}
        input='"snacks"'
        inputLabel="your password"
        label="sha256"
        output={"960c7cf08d103197b9336164e50b5cf8\n2dc6d638d7bea0eec7cc675f945f970b"}
        outputLabel="what the site stores"
        inAt={204}
        outAt={218}
        oneWayAt={240}
      />
    </Win>

    {/* 4. GuessList: dictionary attack hits on the 9th guess */}
    <Win from={280} to={370}>
      <Label at={280} y={250}>
        GuessList · countTo · hit = last
      </Label>
      <GuessList
        at={282}
        x={TX}
        y={300}
        title="leaked-passwords.txt"
        countTo={14344391}
        rate={5}
        words={["123456", "password", "qwerty", "iloveyou", "monkey", "dragon", "sunshine", "letmein", "football", "trashpanda", "snacks"]}
      />
    </Win>

    {/* 5. DataTable with focus glide, ToggleList flipping */}
    <Win from={370} to={460}>
      <Label at={370} y={250}>
        DataTable · focus row 3 → cell
      </Label>
      <DataTable
        at={372}
        x={TX}
        y={300}
        widths={[0.3, 0.7]}
        monoCols={[0]}
        header={["port", "who uses it"]}
        focus={[{ at: 396, row: 3 }, { at: 412, row: 5, col: 1 }]}
        rows={[
          ["22", "ssh"],
          ["80", "http"],
          ["443", "https"],
          ["3000", { t: "dev servers", tone: "accent" }],
          ["5173", "vite"],
          ["8080", { t: "http alternate", tone: "warn" }],
        ]}
      />
      <Label at={380} y={940}>
        ToggleList · flips at 420, 430
      </Label>
      <ToggleList
        at={382}
        x={TX}
        y={990}
        rows={[
          { label: "Private browsing", sub: "hides history on this device", icon: "eyeOff", flips: [420] },
          { label: "VPN", sub: "hides your IP from websites", icon: "shield", on: true, flips: [430] },
        ]}
      />
    </Win>

    {/* 6. Gauge with two moves, Timeline with playhead */}
    <Win from={460} to={540}>
      <Label at={460} y={250}>
        Gauge · 0 → 412 → 87
      </Label>
      <Gauge at={462} x={TX + 130} y={300} size={640} max={500} ticks={[0, 100, 200, 300, 400, 500]} unit="Mbps" label="download" keys={[{ at: 468, value: 412 }, { at: 500, value: 87 }]} />
      <Label at={470} y={940}>
        Timeline · playhead 1970 → 2026 → 2038
      </Label>
      <Timeline
        at={472}
        x={TX + 40}
        y={1180}
        w={820}
        min={1970}
        max={2038}
        events={[
          { value: 1970, label: "0", sub: "1 Jan 1970", at: 476 },
          { value: 2026, label: "today", sub: "1.79 billion s", at: 482 },
          { value: 2038, label: "overflow", sub: "19 Jan 03:14:07", at: 488, side: "up" },
        ]}
        playhead={[{ at: 494, value: 1970 }, { at: 502, value: 2026 }, { at: 520, value: 2038 }]}
      />
    </Win>

    {/* 7. PortPanel: knock on an open and a closed port, a clash on 3000 */}
    <Win from={540} to={600}>
      <Label at={540} y={250}>
        PortPanel · knocks · clash
      </Label>
      <PortPanel
        at={542}
        x={TX}
        y={300}
        ports={[
          { port: 3000, app: "next dev" },
          { port: 5173, app: "vite" },
          { port: 8080 },
        ]}
        knocks={[{ port: 5173, at: 554 }, { port: 8080, at: 562 }]}
        clashes={[{ port: 3000, at: 572, app: "npm start" }]}
      />
    </Win>
  </AbsoluteFill>
);
