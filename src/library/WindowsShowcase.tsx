import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BrowserWindow } from "../components/windows/BrowserWindow";
import { EditorWindow } from "../components/windows/EditorWindow";
import { FinderWindow } from "../components/windows/FinderWindow";
import { LogoCard } from "../components/windows/LogoCard";
import { MacWindow } from "../components/windows/MacWindow";
import { NotificationBanner, PhoneFrame } from "../components/windows/PhoneFrame";
import { Pointer } from "../components/windows/Pointer";
import { SystemPrompt } from "../components/windows/SystemPrompt";
import { UrlBar } from "../components/windows/UrlBar";
import { C, mono, prog, sans, TERM } from "../theme";

// Preview of the windows and UI mockups, six sections of 100 frames:
// 1 LogoCard + MacWindow, 2 BrowserWindow (+ private), 3 UrlBar + Pointer, 4 PhoneFrame + NotificationBanner,
// 5 FinderWindow + Pointer + SystemPrompt, 6 EditorWindow.

const Label: React.FC<{ t: string; x: number; y: number; at: number; until: number }> = ({ t, x, y, at, until }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= until + 6) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontSize: 24, color: C.mute, opacity: prog(frame, at, 8) * (1 - prog(frame, until, 6)) }}>
      {t}
    </div>
  );
};

const Para: React.FC<{ w: string; h?: number; c?: string }> = ({ w, h = 18, c = C.soft }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: c, marginBottom: 16 }} />
);

// A plain mock web page for the browser body (no real site, no logos).
const MockPage: React.FC = () => (
  <div style={{ padding: "44px 56px", fontFamily: sans, color: C.ink }}>
    <div style={{ fontSize: 22, color: C.mute, fontWeight: 600, marginBottom: 14 }}>raccoon / dotfiles</div>
    <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 28 }}>My terminal setup</div>
    <Para w="92%" />
    <Para w="84%" />
    <Para w="60%" />
    <div style={{ height: 260, borderRadius: 20, background: TERM.bg, margin: "30px 0", padding: 30, fontFamily: mono, fontSize: 24, color: TERM.fg }}>
      <span style={{ color: TERM.green }}>$ </span>git clone github.com/raccoon/dotfiles
    </div>
    {[90, 76, 88, 50, 82, 70, 94, 64].map((v, i) => (
      <Para key={i} w={`${v}%`} />
    ))}
  </div>
);

export const WindowsShowcase: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Backdrop />

    {/* 1: LogoCard + MacWindow */}
    <Label t="LogoCard" x={90} y={210} at={4} until={90} />
    <LogoCard name="git" icon="branch" sub="git-scm.com" at={6} until={90} y={260} />
    <Label t="MacWindow" x={90} y={720} at={14} until={92} />
    <MacWindow x={90} y={770} w={900} h={600} title="Notes" at={16} until={92}>
      <div style={{ padding: "40px 48px", fontFamily: sans, color: C.ink }}>
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 24 }}>Things to back up</div>
        {["~/.ssh", "~/.gitconfig", "the dotfiles repo"].map((t) => (
          <div key={t} style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.7 }}>
            {t}
          </div>
        ))}
      </div>
    </MacWindow>

    {/* 2: BrowserWindow, typed URL + loading + scroll, and the private variant */}
    <Label t="BrowserWindow" x={90} y={200} at={100} until={192} />
    <BrowserWindow
      x={90}
      y={250}
      w={900}
      h={760}
      url="github.com/raccoon/dotfiles"
      at={102}
      until={194}
      typeAt={110}
      loadAt={140}
      scroll={{ to: 340, at: 160, dur: 30 }}
    >
      <MockPage />
    </BrowserWindow>
    <Label t="BrowserWindow private" x={90} y={1050} at={118} until={192} />
    <BrowserWindow x={90} y={1100} w={900} h={380} url="accounts.example.com/login" at={120} until={194} private>
      <div style={{ padding: "48px 56px", fontFamily: sans }}>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", color: C.ink, marginBottom: 24 }}>Sign in</div>
        <Para w="70%" h={56} />
      </div>
    </BrowserWindow>

    {/* 3: UrlBar quiz + Pointer */}
    <Label t="UrlBar" x={90} y={360} at={200} until={292} />
    <UrlBar url="paypal.com" x={90} y={420} w={900} at={202} until={294} parts="domain" state="safe" stateAt={252} />
    <UrlBar url="paypa1.com" x={90} y={560} w={900} at={204} until={294} parts="domain" state="danger" stateAt={252} mark={{ t: "1", at: 258 }} />
    <UrlBar url="https://paypal.com.secure-login.io/verify" x={90} y={700} w={900} at={206} until={294} parts="domain" state="danger" stateAt={252} size={34} />
    <UrlBar url="raccoon.dev/videos" x={90} y={860} w={560} at={208} until={294} size={32} font="mono" align="left" />
    <Label t="Pointer" x={690} y={1200} at={212} until={292} />
    <Pointer
      path={[
        { x: 760, y: 1140, at: 214 },
        { x: 600, y: 640, at: 222 },
        { x: 420, y: 500, at: 262, dur: 16 },
      ]}
      clicks={[244, 282]}
      until={292}
    />

    {/* 4: PhoneFrame + NotificationBanner */}
    <Label t="PhoneFrame + NotificationBanner" x={90} y={240} at={300} until={392} />
    <PhoneFrame x={300} y={300} w={480} at={302} until={394} screen={C.paper}>
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: sans, color: C.ink }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: C.mute }}>Saturday 10 October</div>
        <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: "-0.04em" }}>9:41</div>
      </div>
      <NotificationBanner
        x={10}
        y={66}
        w={438}
        at={326}
        until={384}
        app="Messages"
        title="Raccoon"
        body="did you just push to main?"
        icon="speech"
        tint="#34C759"
      />
    </PhoneFrame>

    {/* 5: FinderWindow + Pointer + SystemPrompt */}
    <Label t="FinderWindow" x={90} y={200} at={400} until={492} />
    <FinderWindow
      x={90}
      y={250}
      w={900}
      h={540}
      at={402}
      until={494}
      sidebar
      items={[
        { name: "projects", kind: "folder" },
        { name: "photos", kind: "folder" },
        { name: "notes.txt", kind: "file" },
        { name: "secrets.env", kind: "file", ext: "env" },
        { name: "backup", kind: "folder" },
        { name: "install.sh", kind: "file", ext: "sh" },
      ]}
      select={[{ name: "secrets.env", at: 436 }]}
    />
    <Pointer
      path={[
        { x: 860, y: 760, at: 412 },
        { x: 470, y: 600, at: 418 },
      ]}
      clicks={[436]}
      until={446}
    />
    <Label t="SystemPrompt" x={230} y={840} at={444} until={492} />
    <SystemPrompt
      at={446}
      y={890}
      title="Terminal wants to use your keychain"
      message="Enter your password to allow this."
      password
      typeAt={462}
      confirm="Allow"
      pressAt={486}
    />

    {/* 6: EditorWindow, merge conflict + cursor + typed line + vim status */}
    <Label t="EditorWindow" x={90} y={250} at={500} until={594} />
    <EditorWindow
      x={90}
      y={300}
      w={900}
      h={600}
      title="greet.py — vim"
      at={502}
      until={596}
      lines={[
        [{ t: "def ", c: TERM.purple }, { t: "greet", c: TERM.blue }, { t: "(name):" }],
        { t: "<<<<<<< HEAD", c: TERM.dim },
        [{ t: "    return ", c: TERM.purple }, { t: 'f"hi {name}"', c: TERM.green }],
        { t: "=======", c: TERM.dim },
        [{ t: "    return ", c: TERM.purple }, { t: 'f"hello, {name}!"', c: TERM.green }],
        { t: ">>>>>>> feature", c: TERM.dim },
        "",
        [{ t: "print", c: TERM.blue }, { t: "(greet(" }, { t: '"raccoon"', c: TERM.green }, { t: "))" }],
        { code: [{ t: "# keep theirs, drop ours", c: TERM.dim }], typeAt: 556 },
      ]}
      bands={[
        { from: 2, to: 3, color: TERM.blue, label: "ours", at: 516 },
        { from: 4, to: 6, color: TERM.green, label: "theirs", at: 524 },
      ]}
      cursor={[
        { line: 1, col: 1, at: 502 },
        { line: 5, col: 5, at: 536 },
        { line: 9, col: 25, at: 556, bar: true },
      ]}
      status={[
        { t: "", at: 0 },
        { t: "-- insert --", at: 552 },
      ]}
      statusRight="greet.py  5:5"
    />
  </AbsoluteFill>
);
