import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { ColumnChart } from "../components/charts/ColumnChart";
import { ContributionGrid } from "../components/charts/ContributionGrid";
import { Donut } from "../components/charts/Donut";
import { LineChart } from "../components/charts/LineChart";
import { PollResult } from "../components/charts/PollResult";
import { Sparkline } from "../components/charts/Sparkline";
import { StackedBar } from "../components/charts/StackedBar";
import { CARD_SHADOW, RED } from "../components/diagram/Node";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, materialize, mono, prog, sans } from "../theme";

// Preview of the charts group: line, column, donut, sparkline, heat grid, poll, stacked bar.
// Section frames: lines 0, columns + stacked bar 110, donut + sparklines 220, polls 330, heat grid 450.

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontWeight: 500, fontSize: 26, color: C.mute, opacity: prog(frame, at, 8) }}>
      {children}
    </div>
  );
};

/** Demo stat card with a sparkline (the way Sparkline is meant to be used). */
const SparkCard: React.FC<{ at: number; x: number; y: number; label: string; value: string; values: number[]; color?: string }> = ({ at, x, y, label, value, values, color }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 280,
        padding: 28,
        boxSizing: "border-box",
        borderRadius: 28,
        background: C.white,
        boxShadow: CARD_SHADOW,
        fontFamily: sans,
        ...materialize(prog(frame, at, 10)),
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 600, color: C.mute, letterSpacing: "-0.01em" }}>{label}</div>
      <div style={{ marginTop: 6, marginBottom: 18, fontSize: 52, fontWeight: 700, color: C.ink, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <Sparkline at={at + 6} values={values} w={224} h={64} color={color} />
    </div>
  );
};

const MONTHS = ["Jan", "", "", "Apr", "", "", "Jul", "", "", "Oct", "", ""];

export const ChartsShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. LineChart: two series (blue vs grey), then one series with a marker */}
    <Win from={0} to={110}>
      <Label at={0} y={250}>
        LineChart · 2 series · highlight
      </Label>
      <LineChart
        at={2}
        x={TX}
        y={310}
        h={540}
        unit="ms"
        yLabel="startup time"
        xLabels={["v1", "", "", "", "", "", "", "v8"]}
        series={[
          { label: "before", values: [420, 450, 470, 520, 560, 610, 650, 700] },
          { label: "after", values: [420, 400, 330, 260, 190, 150, 130, 120], highlight: true },
        ]}
      />
      <Label at={20} y={950}>
        LineChart · 1 series · marker at 76
      </Label>
      <LineChart
        at={22}
        x={TX}
        y={1010}
        h={460}
        yLabel="stars"
        xLabels={MONTHS}
        series={[{ label: "this year", values: [1200, 1350, 1500, 1900, 2600, 3100, 5800, 8400, 9900, 11200, 12100, 12800] }]}
        marker={{ at: 76, x: 6, label: "front page" }}
      />
    </Win>

    {/* 2. ColumnChart with a focus cue, StackedBar */}
    <Win from={110} to={220}>
      <Label at={110} y={250}>
        ColumnChart · stagger · focus at 160
      </Label>
      <ColumnChart
        at={112}
        x={TX}
        y={310}
        h={520}
        unit="s"
        decimals={1}
        focus={{ index: 3, at: 160 }}
        labelFont="mono"
        columns={[
          { label: "npm", value: 14.2 },
          { label: "yarn", value: 9.8 },
          { label: "pnpm", value: 6.1 },
          { label: "bun", value: 1.4 },
        ]}
      />
      <Label at={124} y={920}>
        StackedBar · where 512 GB went
      </Label>
      <StackedBar
        at={126}
        x={TX}
        y={980}
        title="your disk"
        total="512 GB"
        unit="GB"
        parts={[
          { label: "node_modules", value: 212, highlight: true },
          { label: "Docker images", value: 118 },
          { label: "photos", value: 96 },
          { label: "free", value: 86 },
        ]}
      />
    </Win>

    {/* 3. Donut with pull-out, Sparkline cards */}
    <Win from={220} to={330}>
      <Label at={220} y={250}>
        Donut · center count · pull at 276
      </Label>
      <Donut
        at={222}
        x={TX}
        y={320}
        size={440}
        pullAt={276}
        legendW={400}
        center={{ value: 1284, label: "repos" }}
        slices={[
          { label: "MIT", value: 46, highlight: true },
          { label: "Apache 2.0", value: 22 },
          { label: "GPL", value: 17 },
          { label: "other", value: 15 },
        ]}
      />
      <Label at={240} y={900}>
        Sparkline · inside cards
      </Label>
      <SparkCard at={242} x={TX} y={960} label="stars" value="12.8K" values={[2, 3, 3, 4, 6, 7, 9, 12, 13]} />
      <SparkCard at={246} x={TX + 310} y={960} label="issues" value="341" values={[9, 8, 9, 7, 8, 6, 7, 6, 5]} color={C.mute} />
      <SparkCard at={250} x={TX + 620} y={960} label="build" value="4.2 s" values={[2, 2.1, 2.2, 2.4, 2.9, 3.1, 3.6, 3.9, 4.2]} color={RED} />
    </Win>

    {/* 4. PollResult: with a right answer, and a plain winner */}
    <Win from={330} to={450}>
      <Label at={330} y={250}>
        PollResult · right + wrong · mark at 384
      </Label>
      <PollResult
        at={332}
        x={TX}
        y={310}
        question="What does rm -rf / do on Linux?"
        markAt={384}
        votes={2417}
        options={[
          { label: "deletes everything", value: 73, wrong: true },
          { label: "refuses, needs --no-preserve-root", value: 18, correct: true },
          { label: "asks for a password", value: 9 },
        ]}
      />
      <Label at={344} y={920}>
        PollResult · no answer = winner in blue
      </Label>
      <PollResult
        at={346}
        x={TX}
        y={980}
        labelFont="mono"
        options={[
          { label: "vim", value: 412 },
          { label: "nano", value: 288 },
          { label: "emacs", value: 97 },
        ]}
      />
    </Win>

    {/* 5. ContributionGrid filling, then a streak */}
    <Win from={450} to={600}>
      <Label at={450} y={250}>
        ContributionGrid · seed 7 · streak at 516
      </Label>
      <ContributionGrid
        at={452}
        x={TX}
        y={420}
        weeks={18}
        seed={7}
        dayLabels={["", "Mon", "", "Wed", "", "Fri", ""]}
        streak={{ from: 64, to: 79, at: 516, label: "16-day streak" }}
      />
    </Win>
  </AbsoluteFill>
);
