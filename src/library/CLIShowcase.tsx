import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BatteryTank } from "../components/cli/BatteryTank";
import { CronCard } from "../components/cli/CronCard";
import { GitAreas } from "../components/cli/GitAreas";
import { ShellExpand } from "../components/cli/ShellExpand";
import { StreamPipes } from "../components/cli/StreamPipes";
import { TuiPicker } from "../components/cli/TuiPicker";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the CLI, Shell, Linux & Git Internals group:
// Section frames: CronCard 0..100, ShellExpand 100..200, StreamPipes 200..300,
// GitAreas 300..400, TuiPicker 400..500, BatteryTank 500..600.

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontWeight: 500, fontSize: 26, color: C.mute, opacity: prog(frame, at, 8) }}>
      {children}
    </div>
  );
};

export const CLIShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. CronCard: 5-star expression breakdown, gliding focus, and 60x minute warning morph */}
    <Win from={0} to={100}>
      <Label at={0} y={255}>
        CronCard · 0 3 * * * → * 3 * * * (warn at 52)
      </Label>
      <CronCard
        at={2}
        x={TX}
        y={310}
        expr={["0", "3", "*", "*", "*"]}
        command="backup.sh"
        meaning="At 03:00 every day"
        focusField={[
          { index: 1, at: 16, until: 48 },
          { index: 0, at: 32, until: 88 },
        ]}
        steps={[
          {
            at: 52,
            expr: ["*", "3", "*", "*", "*"],
            command: "backup.sh",
            meaning: "Runs every minute from 03:00 to 03:59 (60×)!",
            warn: true,
          },
        ]}
      />
      <Label at={8} y={760}>
        CronCard · */15 9-17 * * 1-5 · weekday work hours
      </Label>
      <CronCard
        at={10}
        x={TX}
        y={815}
        expr={["*/15", "9-17", "*", "*", "1-5"]}
        command="sync-metrics.sh"
        meaning="Every 15 min, 09:00–17:59, Mon–Fri"
        focusField={[
          { index: 0, at: 24 },
          { index: 4, at: 56 },
        ]}
      />
    </Win>

    {/* 2. ShellExpand: Bash/Zsh brace expansion fan-out */}
    <Win from={100} to={200}>
      <Label at={100} y={255}>
        ShellExpand · cp app.conf&#123;,.bak&#125; · expandAt 124
      </Label>
      <ShellExpand
        at={102}
        x={TX}
        y={310}
        before="cp app.conf{,.bak}"
        highlightSpan={[11, 18]}
        expandAt={124}
        after={["cp", "app.conf", "app.conf.bak"]}
        sub="what bash actually runs"
      />
      <Label at={108} y={780}>
        ShellExpand · mkdir -p app/&#123;src,tests&#125;/&#123;api,ui&#125; · expandAt 146
      </Label>
      <ShellExpand
        at={110}
        x={TX}
        y={835}
        before="mkdir -p app/{src,tests}/{api,ui}"
        highlightSpan={[13, 33]}
        expandAt={146}
        after={["app/src/api", "app/src/ui", "app/tests/api", "app/tests/ui"]}
        sub="cartesian product (2 × 2 = 4 dirs)"
      />
    </Win>

    {/* 3. StreamPipes: Linux file descriptors (0, 1, 2) & 2>&1 redirection merge */}
    <Win from={200} to={300}>
      <Label at={200} y={255}>
        StreamPipes · flowAt 214 · 2&gt;&amp;1 redirectAt 248
      </Label>
      <StreamPipes
        at={202}
        x={TX}
        y={310}
        command="ls snacks.txt /missing"
        operator="2>&1"
        stdoutTarget="out.txt"
        stderrTarget="screen (leaked!)"
        flowAt={214}
        redirectAt={248}
      />
      <Label at={208} y={820}>
        StreamPipes · | tee · split stream to file &amp; screen
      </Label>
      <StreamPipes
        at={210}
        x={TX}
        y={875}
        command="npm test"
        operator="| tee"
        stdoutTarget="test.log + screen"
        stderrTarget="screen (errors)"
        flowAt={226}
      />
    </Win>

    {/* 4. GitAreas: Working tree · Staging index · .git repo */}
    <Win from={300} to={400}>
      <Label at={300} y={255}>
        GitAreas · git rm --cached .env (328) · add &amp; commit (354, 376)
      </Label>
      <GitAreas
        at={302}
        x={TX}
        y={310}
        h={520}
        files={[
          {
            name: ".env",
            col: 1,
            status: "staged",
            moves: [{ at: 328, toCol: 0, status: "ignored" }],
          },
          {
            name: "src/api.ts",
            col: 0,
            status: "modified",
            moves: [
              { at: 354, toCol: 1, status: "staged", keepCopyInOldCol: true },
              { at: 376, toCol: 2, status: "tracked", keepCopyInOldCol: true },
            ],
          },
          {
            name: "README.md",
            col: 2,
            status: "tracked",
          },
        ]}
        actionBanner={[
          {
            at: 306,
            cmd: "git status",
            desc: ".env accidentally staged in index!",
            tone: "warn",
          },
          {
            at: 328,
            cmd: "git rm --cached .env",
            desc: "Removes .env from Staging index — keeps .env safe on disk",
            tone: "good",
          },
          {
            at: 354,
            cmd: "git add src/api.ts",
            desc: "Copies snapshot from Working tree → Staging index",
            tone: "accent",
          },
          {
            at: 376,
            cmd: 'git commit -m "feat: api"',
            desc: "Writes staged index tree into .git repo (HEAD)",
            tone: "good",
          },
        ]}
      />
      <Label at={308} y={880}>
        GitAreas · git restore --staged config.json (344)
      </Label>
      <GitAreas
        at={310}
        x={TX}
        y={935}
        h={430}
        files={[
          {
            name: "config.json",
            col: 1,
            status: "staged",
            moves: [{ at: 344, toCol: 0, status: "modified" }],
          },
          {
            name: "package.json",
            col: 2,
            status: "tracked",
          },
        ]}
        actionBanner={[
          {
            at: 344,
            cmd: "git restore --staged config.json",
            desc: "Unstages config.json back to Working tree without losing edits",
            tone: "accent",
          },
        ]}
      />
    </Win>

    {/* 5. TuiPicker: interactive fuzzy finder for fzf, zoxide zi & lazygit */}
    <Win from={400} to={500}>
      <Label at={400} y={255}>
        TuiPicker · zoxide zi / fzf · query "tok" · typeAt 416
      </Label>
      <TuiPicker
        at={402}
        x={TX}
        y={310}
        h={560}
        title="zoxide zi — fzf"
        prompt="zi > "
        query="tok"
        typeAt={416}
        fpc={5}
        items={[
          { text: "~/Projects/dotfiles/zsh", score: "42.0", sub: "2h ago" },
          { text: "~/Work/api-gateway/src", score: "68.5", sub: "yesterday" },
          { text: "~/Projects/tiktok-videos", score: "148.2", sub: "now" },
          { text: "~/Notes/auth-tokens.md", score: "91.4", sub: "3d ago" },
          { text: "/var/log/nginx", score: "19.0", sub: "1w ago" },
          { text: "~/Projects/rust-tokenizer", score: "84.0", sub: "5d ago" },
        ]}
        preview={{
          title: "git diff — HEAD",
          lines: [
            "@@ -12,4 +12,6 @@",
            " export const TX = 90;",
            " export const TW = 900;",
            "-const OLD_FPS = 24;",
            "+export const FPS = 30;",
            "+export const SAFE_TOP = 200;",
            " ",
            " # 6 files changed",
          ],
        }}
      />
      <Label at={408} y={920}>
        TuiPicker · lazygit branches · query "fix" · typeAt 432
      </Label>
      <TuiPicker
        at={410}
        x={TX}
        y={975}
        h={430}
        title="lazygit — branches"
        prompt="/ "
        query="fix"
        typeAt={432}
        fpc={5}
        items={[
          { text: "main", score: "HEAD", sub: "0 ahead · 0 behind" },
          { text: "feat/tui-picker", score: "2m", sub: "3 commits ahead" },
          { text: "hotfix/cron-tz-bug", score: "now", sub: "1 commit ahead" },
          { text: "chore/deps-update", score: "4d", sub: "merged" },
        ]}
      />
    </Win>

    {/* 6. BatteryTank: OS menu bar 100% claim vs degraded Wh capacity */}
    <Win from={500} to={600}>
      <Label at={500} y={255}>
        BatteryTank · 52.5 Wh design vs 39.8 Wh max · revealAt 532
      </Label>
      <BatteryTank
        at={502}
        x={TX}
        y={310}
        reportedPct={100}
        designWh={52.5}
        fullChargeWh={39.8}
        cycles={618}
        revealAt={532}
      />
    </Win>
  </AbsoluteFill>
);
