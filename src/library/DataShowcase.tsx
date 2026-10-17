import { AbsoluteFill, Sequence } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BarCompare } from "../components/data/BarCompare";
import { BinaryRow } from "../components/data/BinaryRow";
import { Clock } from "../components/data/Clock";
import { Countdown } from "../components/data/Countdown";
import { MetricChange } from "../components/data/MetricChange";
import { NumberTicker } from "../components/data/NumberTicker";
import { ProgressBar } from "../components/data/ProgressBar";
import { Terminal } from "../components/Terminal";
import { Annotate } from "../components/text/Annotate";
import { LetterSplit } from "../components/text/LetterSplit";
import { Marker } from "../components/text/Marker";
import { QrCode, qrTerminalRows } from "../components/text/QrCode";
import { SecretText } from "../components/text/SecretText";
import { C, mono, sans } from "../theme";

// Preview of the data and text components: five 4-second sections (frames 0, 120, 240, 360, 480).

const WIFI = "WIFI:T:WPA;S:SnackNet;P:trashpanda42;;";

const Tag: React.FC<{ x: number; y: number; children: string }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontWeight: 500, fontSize: 22, color: C.mute }}>{children}</div>
);

const Section: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => (
  <Sequence from={from} durationInFrames={120} layout="none">
    {children}
  </Sequence>
);

export const DataShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1: hook metric, tickers, marker */}
    <Section from={0}>
      <Tag x={90} y={220}>MetricChange</Tag>
      <MetricChange before={125} after={15} unit="ms" label="startup time" at={4} changeAt={30} x={90} y={270} />
      <Tag x={90} y={790}>NumberTicker</Tag>
      <NumberTicker from={0} to={1048576} at={10} start={14} dur={40} x={90} y={830} size={110} />
      <NumberTicker from={1999} to={2038} at={20} start={40} roll x={90} y={970} size={110} color={C.accent} />
      <Tag x={90} y={1150}>Marker</Tag>
      <div style={{ position: "absolute", left: 90, top: 1190, width: 900, fontFamily: sans, fontWeight: 600, fontSize: 60, letterSpacing: "-0.02em", lineHeight: 1.3, color: C.ink }}>
        passwords are <Marker at={50}>hashed</Marker>,
        <br />
        not <Marker kind="strike" at={66}>encrypted</Marker>. <Marker kind="underline" at={82}>usually</Marker>.
      </div>
    </Section>

    {/* 2: bar chart, progress, countdown */}
    <Section from={120}>
      <Tag x={90} y={220}>BarCompare (log scale)</Tag>
      <BarCompare
        at={4}
        x={90}
        y={270}
        log
        labelFont="mono"
        rows={[
          { label: "6 chars", value: 5, display: "5 seconds" },
          { label: "8 chars", value: 1.21e6, display: "2 weeks" },
          { label: "10 chars", value: 1.6e8, display: "5 years" },
          { label: "12 chars", value: 4.16e9, display: "132 years", highlight: true },
        ]}
      />
      <Tag x={90} y={680}>ProgressBar</Tag>
      <ProgressBar
        at={10}
        x={90}
        y={720}
        label="downloading node_modules"
        keys={[
          { at: 18, value: 0 },
          { at: 48, value: 0.42 },
          { at: 62, value: 0.46 },
          { at: 96, value: 1 },
        ]}
      />
      <Tag x={90} y={900}>Countdown</Tag>
      <Countdown at={8} x={380} y={950} size={320} />
    </Section>

    {/* 3: year 2038 */}
    <Section from={240}>
      <Tag x={90} y={220}>Clock (jumpTo)</Tag>
      <Clock start="2038-01-19T03:14:07Z" at={4} jumpTo={{ at: 34, value: "1901-12-13T20:45:52Z", color: "#FF3B30" }} format="stacked" label="UTC" x={90} y={270} size={150} />
      <Tag x={90} y={600}>NumberTicker (roll)</Tag>
      <NumberTicker from={2147483647} to={-2147483648} at={4} start={34} dur={30} roll x={90} y={640} size={96} />
      <Tag x={90} y={800}>BinaryRow</Tag>
      <BinaryRow value={2147483647} steps={[{ at: 34, value: -2147483648 }]} at={6} x={90} y={840} />
    </Section>

    {/* 4: URL anatomy, word origins, look-alike */}
    <Section from={360}>
      <Tag x={90} y={220}>Annotate</Tag>
      <Annotate
        text="https://login.paypa1.com/verify"
        at={4}
        x={90}
        y={260}
        segments={[
          { from: 0, to: 5, label: "scheme", at: 12 },
          { from: 8, to: 13, label: "subdomain", at: 18 },
          { from: 14, to: 24, label: "domain", at: 24, color: "#FF3B30" },
          { from: 24, to: 31, label: "path", at: 30 },
        ]}
        focus={{ index: 2, at: 60 }}
      />
      <Tag x={90} y={600}>LetterSplit</Tag>
      <LetterSplit
        chunks={[{ t: "g", meaning: "global" }, { t: "re", meaning: "regular expression" }, { t: "p", meaning: "print" }]}
        at={8}
        splitAt={30}
        font="mono"
        x={90}
        y={650}
      />
      <Tag x={90} y={980}>LetterSplit (zoom)</Tag>
      <LetterSplit chunks={[{ t: "paypa1" }]} at={14} zoom={{ index: 5, at: 56, label: "a one, not an l", color: "#FF3B30" }} x={90} y={1300} size={140} />
    </Section>

    {/* 5: Wi-Fi secret and QR */}
    <Section from={480}>
      <Tag x={90} y={220}>SecretText (field)</Tag>
      <SecretText text="trashpanda42" at={4} revealAt={24} field label="Wi-Fi password" x={90} y={260} />
      <Tag x={90} y={470}>SecretText (scramble, inline)</Tag>
      <div style={{ position: "absolute", left: 90, top: 505, fontFamily: sans, fontWeight: 600, fontSize: 48, color: C.ink, letterSpacing: "-0.02em" }}>
        key: <SecretText text="trashpanda42" at={4} revealAt={40} scramble size={48} />
      </div>
      <Tag x={90} y={610}>QrCode</Tag>
      <QrCode text={WIFI} at={20} mode="sweep" x={90} y={650} size={400} label="SnackNet" />
      <Tag x={530} y={610}>qrTerminalRows</Tag>
      <Terminal
        x={530}
        y={650}
        w={460}
        h={600}
        fontSize={10}
        title="sudo@laptop: ~"
        blocks={[{ at: 30, cmd: "wifi-qr SnackNet", out: qrTerminalRows(WIFI) }]}
      />
    </Section>
  </AbsoluteFill>
);
