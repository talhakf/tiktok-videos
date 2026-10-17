import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BoxModel } from "../components/dom/BoxModel";
import { EventLoop } from "../components/dom/EventLoop";
import { FlexPlayground } from "../components/dom/FlexPlayground";
import { StorageTable } from "../components/dom/StorageTable";
import { WaterfallChart } from "../components/dom/WaterfallChart";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the Frontend / Browser / DOM & CSS group:
// 0..120 EventLoop, 120..240 BoxModel, 240..360 FlexPlayground, 360..480 WaterfallChart, 480..600 StorageTable.

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
        fontSize: 26,
        color: C.mute,
        opacity: prog(frame, at, 8),
      }}
    >
      {children}
    </div>
  );
};

export const DomShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. EventLoop: sync stack -> Promise microtask -> setTimeout task */}
    <Win from={0} to={120}>
      <Label at={0} y={260}>
        EventLoop · call stack → microtask queue → task queue
      </Label>
      <EventLoop
        at={2}
        x={TX}
        y={320}
        steps={[
          {
            at: 6,
            stack: ["main()", "console.log('1')"],
            micro: [],
            macro: [],
            logs: ["1"],
            note: "sync stack runs first",
          },
          {
            at: 26,
            stack: ["main()"],
            micro: ["promise.then"],
            macro: ["setTimeout(0)"],
            logs: ["1"],
            note: "queues microtask & timer",
          },
          {
            at: 48,
            stack: ["main()", "console.log('4')"],
            micro: ["promise.then"],
            macro: ["setTimeout(0)"],
            logs: ["1", "4"],
            note: "main() finishes sync work",
          },
          {
            at: 70,
            stack: ["promise.then"],
            micro: [],
            macro: ["setTimeout(0)"],
            logs: ["1", "4", "3 (micro)"],
            note: "microtasks drain before timers",
          },
          {
            at: 94,
            stack: ["setTimeout(0)"],
            micro: [],
            macro: [],
            logs: ["1", "4", "3 (micro)", "2 (macro)"],
            note: "task queue runs last",
          },
        ]}
      />
    </Win>

    {/* 2. BoxModel: content-box (348px) -> border-box (300px) */}
    <Win from={120} to={240}>
      <Label at={120} y={260}>
        BoxModel · content-box (total: 348px) → border-box (total: 300px)
      </Label>
      <BoxModel
        at={122}
        x={TX}
        y={320}
        widthPx={300}
        heightPx={160}
        paddingPx={20}
        borderPx={4}
        marginPx={24}
        borderBoxAt={168}
      />
    </Win>

    {/* 3. FlexPlayground: justify-content & align-items gliding */}
    <Win from={240} to={360}>
      <Label at={240} y={260}>
        FlexPlayground · justify-content & align-items states
      </Label>
      <FlexPlayground
        at={242}
        x={TX}
        y={320}
        states={[
          {
            at: 244,
            justify: "flex-start",
            align: "flex-start",
            rule: "justify-content: flex-start; align-items: flex-start;",
          },
          {
            at: 268,
            justify: "center",
            align: "center",
            rule: "justify-content: center; align-items: center;",
          },
          {
            at: 296,
            justify: "space-between",
            align: "center",
            rule: "justify-content: space-between; align-items: center;",
          },
          {
            at: 326,
            justify: "space-around",
            align: "flex-end",
            rule: "justify-content: space-around; align-items: flex-end;",
          },
        ]}
      />
    </Win>

    {/* 4. WaterfallChart: DevTools network waterfall */}
    <Win from={360} to={480}>
      <Label at={360} y={260}>
        WaterfallChart · DNS / TCP / Wait TTFB / Download
      </Label>
      <WaterfallChart
        at={362}
        x={TX}
        y={320}
        loadMs={420}
        focus={[
          { index: 2, at: 392, tone: "warn", label: "bundle download 145 ms" },
          { index: 3, at: 428, tone: "bad", label: "slow DB query (TTFB 150 ms)" },
        ]}
        requests={[
          {
            name: "index.html",
            status: 200,
            type: "document",
            size: "4.2 kB",
            startMs: 0,
            dnsMs: 24,
            tcpMs: 36,
            ttfbMs: 42,
            downloadMs: 18,
          },
          {
            name: "styles.css",
            status: 200,
            type: "stylesheet",
            size: "18.4 kB",
            startMs: 120,
            ttfbMs: 28,
            downloadMs: 44,
          },
          {
            name: "app.js",
            status: 200,
            type: "script",
            size: "142 kB",
            startMs: 120,
            ttfbMs: 35,
            downloadMs: 145,
          },
          {
            name: "api/user",
            status: 200,
            type: "fetch",
            size: "1.8 kB",
            startMs: 240,
            ttfbMs: 150,
            downloadMs: 30,
          },
        ]}
      />
    </Win>

    {/* 5. StorageTable: DevTools Application -> Cookies inspector */}
    <Win from={480} to={600}>
      <Label at={480} y={260}>
        StorageTable · Cookies · HttpOnly / Secure / SameSite
      </Label>
      <StorageTable
        at={482}
        x={TX}
        y={320}
        kind="Cookies"
        origin="https://app.example.com"
        focus={[
          { index: 0, at: 510, tone: "good", label: "HttpOnly + Strict (safe)" },
          { index: 2, at: 548, tone: "bad", label: "exposed to XSS (no HttpOnly)" },
        ]}
        rows={[
          {
            key: "session_id",
            value: "s%3A9f8e7d6c5b4a...",
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            size: "68 B",
            expires: "7d",
          },
          {
            key: "csrf_token",
            value: "c4b1-90a2-77e1",
            httpOnly: false,
            secure: true,
            sameSite: "Lax",
            size: "36 B",
            expires: "Session",
          },
          {
            key: "auth_jwt",
            value: "eyJhbGciOiJIUzI1Ni...",
            httpOnly: false,
            secure: false,
            sameSite: "None",
            size: "214 B",
            expires: "30d",
          },
          {
            key: "theme",
            value: "light",
            httpOnly: false,
            secure: true,
            sameSite: "Lax",
            size: "10 B",
            expires: "1y",
          },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
