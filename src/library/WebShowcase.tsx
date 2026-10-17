import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { FfmpegTimeline } from "../components/web/FfmpegTimeline";
import { MarkdownCard } from "../components/web/MarkdownCard";
import { RepoCard, RepoList } from "../components/web/RepoCard";
import { ResourceCard } from "../components/web/ResourceCard";
import { MailInbox, MailMessage } from "../components/windows/Mail";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the web, GitHub, Markdown, media & mail components across 600 frames:
// 1. RepoCard & RepoList (0..120)
// 2. MarkdownCard: alert + collapsible <details> + <kbd> (120..240)
// 3. FfmpegTimeline: trim + audio strip + size reduction (240..360)
// 4. ResourceCard: CyberChef + security lab steps (360..480)
// 5. MailInbox + MailMessage (480..600)

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: mono,
        fontWeight: 500,
        fontSize: 25,
        color: C.mute,
        opacity: prog(frame, at, 8),
      }}
    >
      {children}
    </div>
  );
};

export const WebShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. RepoCard & RepoList */}
    <Win from={0} to={120}>
      <Label at={0} y={245}>
        RepoCard · stars count up · curriculum items
      </Label>
      <RepoCard
        at={2}
        x={TX}
        y={295}
        owner="kamranahmedse"
        name="developer-roadmap"
        desc="Interactive roadmaps, guides and educational content to help developers grow in their careers."
        stars={312000}
        lang={{ name: "TypeScript", color: "#0071E3" }}
        license="MIT · Free"
        topics={["roadmap", "computer-science", "career"]}
        items={[
          { label: "frontend/", sub: "HTML, CSS, React, state & testing", badge: "updated", at: 14 },
          { label: "backend/", sub: "APIs, databases, caching & auth", badge: "core", at: 20 },
        ]}
      />
      <Label at={18} y={870}>
        RepoList · stacked comparison · highlight
      </Label>
      <RepoList
        at={20}
        x={TX}
        y={920}
        repos={[
          {
            owner: "codecrafters-io",
            name: "build-your-own-x",
            desc: "Master programming by recreating your favorite technologies from scratch.",
            stars: "488K",
            at: 24,
            highlight: true,
          },
          {
            owner: "ossu",
            name: "computer-science",
            desc: "Path to a free self-taught education in Computer Science.",
            stars: "178K",
            at: 30,
          },
          {
            owner: "public-apis",
            name: "public-apis",
            desc: "A collective list of free APIs for use in software and web development.",
            stars: "332K",
            at: 36,
          },
        ]}
      />
    </Win>

    {/* 2. MarkdownCard: alert + collapsible <details> + <kbd> */}
    <Win from={120} to={240}>
      <Label at={120} y={240}>
        MarkdownCard · alert (warning) · renderAt 132
      </Label>
      <MarkdownCard
        at={122}
        x={TX}
        y={285}
        kind="alert"
        alertTone="warning"
        renderAt={132}
        raw={[
          "> [!WARNING]",
          "> Dropping this column deletes all production tokens.",
        ]}
        body="Dropping this column deletes all production tokens."
      />

      <Label at={138} y={670}>
        MarkdownCard · details · openAt 175
      </Label>
      <MarkdownCard
        at={140}
        x={TX}
        y={715}
        kind="details"
        renderAt={152}
        openAt={175}
        raw={[
          "<details><summary>View stack trace (14 lines)</summary>",
          "  Error: ECONNREFUSED 127.0.0.1:5432 at Pool.connect",
          "</details>",
        ]}
        title="View stack trace (14 lines)"
        body="Error: ECONNREFUSED 127.0.0.1:5432 at Pool.connect"
      />

      <Label at={156} y={1135}>
        MarkdownCard · kbd · renderAt 168
      </Label>
      <MarkdownCard
        at={158}
        x={TX}
        y={1180}
        kind="kbd"
        renderAt={168}
        raw={["Press <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>"]}
        title="Command palette"
        keys={["Cmd", "Shift", "P"]}
        body="Opens quick actions"
      />
    </Win>

    {/* 3. FfmpegTimeline: trim + audio strip + size reduction */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        FfmpegTimeline · trim 258 · muteAudio 282 · output 306
      </Label>
      <FfmpegTimeline
        at={242}
        x={TX}
        y={310}
        inputName="recording.mov"
        inputSize="142 MB"
        duration={60}
        trim={{ start: 10, end: 45, at: 258 }}
        muteAudioAt={282}
        output={{ name: "output.mp4", size: "8.4 MB", badge: "94% smaller", at: 306 }}
      />

      <Label at={252} y={860}>
        FfmpegTimeline · fast clip extract
      </Label>
      <FfmpegTimeline
        at={254}
        x={TX}
        y={915}
        inputName="demo-raw.mp4"
        inputSize="64 MB"
        duration={30}
        trim={{ start: 4, end: 18, at: 274 }}
        output={{ name: "preview.gif", size: "2.1 MB", badge: "clean loop", at: 314 }}
      />
    </Win>

    {/* 4. ResourceCard: CyberChef + security lab steps */}
    <Win from={360} to={480}>
      <Label at={360} y={250}>
        ResourceCard · CyberChef recipe pipeline
      </Label>
      <ResourceCard
        at={362}
        x={TX}
        y={300}
        url="gchq.github.io/CyberChef"
        title="CyberChef"
        category="Data & crypto"
        badge="100% Free · No login"
        steps={[
          { label: "From Hex", code: "53 47 56 73 62 47 38 3d", result: "SGVsbG8=", at: 374 },
          { label: "From Base64", code: "SGVsbG8=", result: "Hello", at: 392 },
          { label: "Plaintext decoded", result: "flag{cyberchef_rocks}", ok: true, at: 410 },
        ]}
      />

      <Label at={380} y={845}>
        ResourceCard · interactive security lab
      </Label>
      <ResourceCard
        at={382}
        x={TX}
        y={895}
        url="overthewire.org/wargames/bandit"
        title="OverTheWire: Bandit"
        category="Linux & SSH"
        badge="Free SSH lab"
        steps={[
          { label: "Connect via SSH", code: "ssh bandit0@bandit.labs.overthewire.org -p 2220", at: 398 },
          { label: "Read level password", code: "cat ./-readme", result: "ZjLjTmM6FvvyRnrb", ok: true, at: 420 },
        ]}
      />
    </Win>

    {/* 5. MailInbox + MailMessage */}
    <Win from={480} to={600}>
      <Label at={480} y={240}>
        MailInbox · new mail arrives 500 · tag ring 520
      </Label>
      <MailInbox
        at={482}
        x={TX}
        y={288}
        w={900}
        h={510}
        rowH={110}
        focus={[{ row: 0, at: 506, until: 556 }]}
        markTag={{ row: 0, at: 520, until: 570 }}
        rows={[
          {
            from: "Shady Dealz",
            tag: "+shop",
            subject: "You won a free tablet!",
            preview: "Click here immediately to claim your prize...",
            time: "9:42",
            unread: true,
            spam: true,
            at: 500,
          },
          {
            from: "GitHub",
            tag: "+dev",
            subject: "[raccoon/dotfiles] PR #42 merged",
            preview: "Merged 2 commits into main",
            time: "9:18",
          },
          {
            from: "Linear",
            tag: "+work",
            subject: "Cycle 14 summary",
            preview: "12 issues completed this week",
            time: "Yesterday",
          },
        ]}
      />

      <Label at={488} y={845}>
        MailMessage · +tag address mark 514
      </Label>
      <MailMessage
        at={490}
        x={TX}
        y={895}
        w={900}
        h={530}
        from="Shady Dealz"
        fromAddress="promo@shady-dealz.example"
        to="yourname+shop@gmail.com"
        toMark={{ text: "+shop", at: 514, color: "#FF3B30" }}
        subject="We sold your email address"
        body={[
          "Because you signed up with +shop, you know exactly who leaked it.",
          "Filter to:yourname+shop@gmail.com → Delete it.",
        ]}
        spam
      />
    </Win>
  </AbsoluteFill>
);
