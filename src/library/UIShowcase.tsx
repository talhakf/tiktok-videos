import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { AlertDialog } from "../components/ui/AlertDialog";
import { CommandPalette } from "../components/ui/CommandPalette";
import { ContextMenu } from "../components/ui/ContextMenu";
import { Button, TextField } from "../components/ui/Form";
import { Keyboard } from "../components/ui/Keyboard";
import { Skeleton, Spinner } from "../components/ui/Loading";
import { SegmentedControl, Tabs } from "../components/ui/SegmentedControl";
import { Snackbar, Toasts } from "../components/ui/Toast";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the app UI mockups (src/components/ui/). Section frames: keyboard + segmented control + tabs 0,
// context menu + snackbar 90, command palettes 180, toasts + skeleton + spinner 270, alerts 360, form 460.

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontWeight: 500, fontSize: 26, color: C.mute, opacity: prog(frame, at, 8) }}>
      {children}
    </div>
  );
};

const APPS = [
  { label: "Terminal", sub: "Application", icon: "terminal" as const },
  { label: "TextEdit", sub: "Application", icon: "file" as const },
  { label: "Time Machine", sub: "Application", icon: "clock" as const },
  { label: "Activity Monitor", sub: "Application", icon: "trendUp" as const },
  { label: "Disk Utility", sub: "Application", icon: "disk" as const },
  { label: "System Settings", sub: "Application", icon: "chip" as const },
];

const COMMANDS = [
  { label: "git: commit", icon: "commit" as const },
  { label: "git: push", icon: "upload" as const },
  { label: "git: pull", icon: "download" as const },
  { label: "toggle terminal", icon: "terminal" as const },
  { label: "format document", icon: "code" as const },
];

export const UIShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. Keyboard: cmd + shift + 4, SegmentedControl, Tabs */}
    <Win from={0} to={90}>
      <Label at={0} y={250}>
        Keyboard · light 12 · cmd 30, shift 36, 4 at 46
      </Label>
      <Keyboard
        at={2}
        x={TX}
        y={300}
        highlight={[{ keys: ["cmd", "shift", "4"], at: 12, until: 76 }]}
        press={[
          { key: "cmd", at: 30, hold: 26 },
          { key: "shift", at: 36, hold: 20 },
          { key: "4", at: 46 },
        ]}
      />
      <Label at={4} y={760}>
        SegmentedControl · 0 → 1 at 40 → 2 at 60
      </Label>
      <SegmentedControl
        at={6}
        x={TX}
        y={810}
        segments={["light", "dark", "auto"]}
        select={[
          { index: 1, at: 40 },
          { index: 2, at: 60 },
        ]}
      />
      <Label at={8} y={970}>
        Tabs · 0 → 2 at 44 → 1 at 66
      </Label>
      <Tabs
        at={10}
        x={TX}
        y={1010}
        tabs={["Wi-Fi", "Ethernet", "VPN"]}
        select={[
          { index: 2, at: 44 },
          { index: 1, at: 66 },
        ]}
      />
    </Win>

    {/* 2. ContextMenu: hover moves, choose "Copy", Snackbar */}
    <Win from={90} to={180}>
      <Label at={90} y={250}>
        ContextMenu · hover 100, 110, 122 · choose 140
      </Label>
      <ContextMenu
        at={92}
        x={TX}
        y={310}
        w={520}
        hover={[
          { item: "Open", at: 100 },
          { item: "Get Info", at: 110 },
          { item: "Copy", at: 122 },
        ]}
        chooseAt={140}
        items={[
          { label: "Open", shortcut: "⌘o" },
          { label: "Get Info", shortcut: "⌘i", icon: "info" },
          { label: "Rename", icon: "file" },
          "-",
          { label: "Copy", shortcut: "⌘c", icon: "clipboard" },
          { label: "Show hidden files", shortcut: "⌘⇧.", checked: true },
          "-",
          { label: "Move to Trash", shortcut: "⌘⌫", icon: "trash", danger: true },
        ]}
      />
      <Label at={146} y={1130}>
        Snackbar · at 150
      </Label>
      <Snackbar at={150} y={1190} text="Copied to clipboard" />
    </Win>

    {/* 3. CommandPalette: Spotlight filtering, command palette with arrows */}
    <Win from={180} to={270}>
      <Label at={180} y={250}>
        CommandPalette · rows 4 · types "term" 192 · enter 240
      </Label>
      <CommandPalette at={182} x={TX} y={300} items={APPS} rows={4} query="term" typeAt={192} fpc={7} enterAt={240} placeholder="Spotlight Search" />
      <Label at={186} y={860}>
        showAll · types "git" 204 · select 1 at 228 · enter 250
      </Label>
      <CommandPalette
        at={188}
        x={TX}
        y={910}
        items={COMMANDS}
        query="git"
        typeAt={204}
        fpc={6}
        showAll
        select={[{ index: 1, at: 228 }]}
        enterAt={250}
        placeholder="type a command"
      />
    </Win>

    {/* 4. Toasts stacking, Skeleton resolving, Spinner */}
    <Win from={270} to={360}>
      <Label at={270} y={250}>
        Toasts · 274, 288, 302 · first leaves 336
      </Label>
      <Toasts
        y={300}
        toasts={[
          { at: 274, until: 336, app: "Terminal", title: "Build finished", body: "npm run build exited with 0", icon: "terminal", tint: C.ink },
          { at: 288, app: "Mail", title: "Your code: 482 913", body: "it expires in 10 minutes", icon: "mail" },
          { at: 302, app: "Calendar", title: "Standup in 5 minutes", icon: "calendar", tint: C.mute },
        ]}
      />
      <Label at={272} y={860}>
        Skeleton · resolves at 320
      </Label>
      <Skeleton
        at={274}
        x={TX}
        y={910}
        avatar="user"
        resolveAt={320}
        rows={[
          { w: 0.5, text: "Sudo the Raccoon" },
          { w: 0.85, text: "terminal tricks in 30 seconds" },
          { w: 0.6, text: "@sudoraccoon", mono: true, size: 26 },
        ]}
      />
      <Label at={276} y={1180}>
        Spinner · 40, 56, 80
      </Label>
      <Spinner at={278} x={TX} y={1250} size={40} />
      <Spinner at={278} x={TX + 90} y={1242} size={56} start={4} />
      <Spinner at={278} x={TX + 200} y={1230} size={80} color={C.accent} start={8} />
    </Win>

    {/* 5. AlertDialog: mac destructive, ios cancel */}
    <Win from={360} to={460}>
      <Label at={360} y={250}>
        AlertDialog mac · press delete 420
      </Label>
      <AlertDialog
        at={362}
        y={300}
        icon="trash"
        title="Delete “node_modules”?"
        message="This item will be deleted immediately. You can’t undo this action."
        buttons={[
          { label: "Cancel", kind: "cancel" },
          { label: "Delete", kind: "destructive" },
        ]}
        pressAt={420}
      />
      <Label at={366} y={860}>
        AlertDialog ios · press cancel 436
      </Label>
      <AlertDialog
        at={368}
        y={910}
        variant="ios"
        title="Turn off Wi-Fi?"
        message="You will lose the connection to this network."
        buttons={[
          { label: "Cancel", kind: "cancel" },
          { label: "Turn Off", kind: "destructive" },
        ]}
        press={0}
        pressAt={436}
      />
    </Win>

    {/* 6. Form: email ok, password masked, Button press → spinner → done, code error */}
    <Win from={460} to={600}>
      <Label at={460} y={250}>
        TextField · types 470 · ok 500
      </Label>
      <TextField
        at={462}
        x={TX}
        y={300}
        label="Email"
        placeholder="name@example.com"
        value="trash@panda.dev"
        typeAt={470}
        fpc={2}
        states={[{ at: 500, kind: "ok" }]}
      />
      <TextField at={466} x={TX} y={500} label="Password" placeholder="Required" value="snacks4ever" mask typeAt={504} fpc={2} blurAt={530} />
      <Label at={468} y={700}>
        Button · press 534 · load 536 · done 566
      </Label>
      <Button at={470} x={TX} y={750} w={900} label="Sign in" pressAt={534} loadAt={536} loadingLabel="Signing in…" doneAt={566} doneLabel="Signed in" />
      <Label at={472} y={900}>
        TextField mono · error 556
      </Label>
      <TextField
        at={474}
        x={TX}
        y={950}
        label="Verification code"
        value="482 913"
        monoValue
        typeAt={540}
        fpc={2}
        states={[{ at: 556, kind: "error", message: "This code has expired" }]}
      />
      <Button at={476} x={TX} y={1180} label="Send a new code" kind="secondary" icon="refresh" pressAt={580} />
    </Win>
  </AbsoluteFill>
);
