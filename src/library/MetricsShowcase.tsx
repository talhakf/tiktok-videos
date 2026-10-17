import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CandlestickChart } from "../components/metrics/CandlestickChart";
import { CohortHeatmap } from "../components/metrics/CohortHeatmap";
import { GaugeSpeedometer } from "../components/metrics/GaugeSpeedometer";
import { SankeyFlow } from "../components/metrics/SankeyFlow";
import { WaterfallBreakdown } from "../components/metrics/WaterfallBreakdown";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the Finance, SaaS Metrics, Benchmarks & Charts Pack 2 group:
// 1. CandlestickChart (0..120)
// 2. CohortHeatmap (120..240)
// 3. SankeyFlow (240..360)
// 4. GaugeSpeedometer (360..480)
// 5. WaterfallBreakdown (480..600)

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

export const MetricsShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. CandlestickChart: API latency spike + financial flash crash */}
    <Win from={0} to={120}>
      <Label at={0} y={255}>
        CandlestickChart · p99 latency OHLC · spike callout at 54
      </Label>
      <CandlestickChart
        at={2}
        y={305}
        h={540}
        title="p99 API latency · OHLC"
        subtitle="10s sampling windows · us-east-1 gateway"
        rightBadge="248 ms peak"
        unit="ms"
        invertColors
        candles={[
          { open: 42, high: 56, low: 38, close: 48, label: "10:00" },
          { open: 48, high: 62, low: 44, close: 45, label: "10:10" },
          { open: 45, high: 58, low: 40, close: 52, label: "10:20" },
          { open: 52, high: 74, low: 49, close: 68, label: "10:30" },
          { open: 68, high: 248, low: 64, close: 196, label: "10:40" },
          { open: 196, high: 210, low: 92, close: 104, label: "10:50" },
          { open: 104, high: 112, low: 54, close: 58, label: "11:00" },
          { open: 58, high: 64, low: 41, close: 44, label: "11:10" },
        ]}
        eventCallout={{
          index: 4,
          label: "GC stop-the-world pause",
          sub: "p99 spiked to 248 ms",
          at: 54,
          tone: "bad",
        }}
      />

      <Label at={14} y={880}>
        CandlestickChart · dark · flash crash callout at 68
      </Label>
      <CandlestickChart
        at={16}
        y={930}
        h={520}
        dark
        title="NVDA · 5m orderbook"
        subtitle="automated stop-loss cascade"
        unit="$"
        prefixUnit
        candles={[
          { open: 124, high: 128, low: 122, close: 127, label: "09:30" },
          { open: 127, high: 132, low: 126, close: 131, label: "09:35" },
          { open: 131, high: 135, low: 129, close: 134, label: "09:40" },
          { open: 134, high: 136, low: 128, close: 130, label: "09:45" },
          { open: 130, high: 131, low: 98, close: 106, label: "09:50" },
          { open: 106, high: 122, low: 104, close: 119, label: "09:55" },
          { open: 119, high: 129, low: 118, close: 128, label: "10:00" },
        ]}
        eventCallout={{
          index: 4,
          label: "Flash liquidity sweep",
          sub: "wick down to $98",
          at: 68,
          tone: "warn",
        }}
      />
    </Win>

    {/* 2. CohortHeatmap: Weekly retention triangle + dark server latency matrix */}
    <Win from={120} to={240}>
      <Label at={120} y={255}>
        CohortHeatmap · weekly retention cohorts · highlight at 176
      </Label>
      <CohortHeatmap
        at={122}
        y={305}
        h={555}
        title="Weekly CLI retention by cohort"
        subtitle="share of developers still running daily after N weeks"
        rowLabels={["Sep W1", "Sep W2", "Sep W3", "Sep W4", "Oct W1"]}
        colLabels={["Wk 0", "Wk 1", "Wk 2", "Wk 3", "Wk 4"]}
        cells={[
          [1.0, 0.64, 0.48, 0.41, 0.39],
          [1.0, 0.68, 0.52, 0.46, null],
          [1.0, 0.82, 0.74, null, null],
          [1.0, 0.79, null, null, null],
          [1.0, null, null, null, null],
        ]}
        highlightCell={{
          row: 2,
          col: 2,
          label: "74% retained after v2.0 onboarding",
          at: 176,
          tone: "accent",
        }}
      />

      <Label at={134} y={895}>
        CohortHeatmap · dark · worker tail latency by region
      </Label>
      <CohortHeatmap
        at={136}
        y={945}
        h={515}
        dark
        palette="red"
        formatCell="ms"
        title="Edge worker p95 latency"
        subtitle="region × time-of-day load matrix"
        rowLabels={["us-east", "eu-west", "ap-south", "sa-east"]}
        colLabels={["00:00", "06:00", "12:00", "18:00"]}
        cells={[
          [0.14, 0.18, 0.32, 0.28],
          [0.16, 0.29, 0.44, 0.24],
          [0.22, 0.52, 0.92, 0.48],
          [0.19, 0.25, 0.38, 0.34],
        ]}
        highlightCell={{
          row: 2,
          col: 2,
          label: "184 ms cold-start hotspot",
          at: 188,
          tone: "bad",
        }}
      />
    </Win>

    {/* 3. SankeyFlow: Cloud cost breakdown + dark traffic split */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        SankeyFlow · proportional cubic-Bezier ribbons · focus at 292
      </Label>
      <SankeyFlow
        at={242}
        y={305}
        h={555}
        title="Monthly AWS spend breakdown"
        subtitle="where $14,200/mo actually goes"
        source={{
          label: "AWS invoice",
          total: "$14.2K",
          sub: "october billing cycle",
          icon: "cloud",
        }}
        targets={[
          { label: "NAT Gateway & egress", value: "$6,390 / mo", share: 45, tone: "bad" },
          { label: "EKS compute nodes", value: "$4,260 / mo", share: 30, tone: "accent" },
          { label: "RDS Postgres multi-AZ", value: "$2,130 / mo", share: 15, tone: "warn" },
          { label: "S3 + CloudFront CDN", value: "$1,420 / mo", share: 10, tone: "good" },
        ]}
        focusIndex={{ index: 0, at: 292 }}
      />

      <Label at={254} y={895}>
        SankeyFlow · dark · ingress request routing
      </Label>
      <SankeyFlow
        at={256}
        y={945}
        h={515}
        dark
        title="Ingress traffic resolution"
        subtitle="120K req/s at Cloudflare edge"
        source={{
          label: "Edge ingress",
          total: "120K/s",
          sub: "HTTPS port 443",
          icon: "globe",
        }}
        targets={[
          { label: "Edge KV cache hit", value: "86.4K req/s", share: 72, tone: "good" },
          { label: "Origin API workers", value: "25.2K req/s", share: 21, tone: "accent" },
          { label: "WAF blocked / rate-limit", value: "8.4K req/s", share: 7, tone: "bad" },
        ]}
      />
    </Win>

    {/* 4. GaugeSpeedometer: Lighthouse score sweep + dark gauge */}
    <Win from={360} to={480}>
      <Label at={360} y={255}>
        GaugeSpeedometer · 240° arc · sweep 42 → 98 at 405
      </Label>
      <GaugeSpeedometer
        at={362}
        y={305}
        h={575}
        title="Lighthouse performance audit"
        subtitle="after code-splitting & AVIF hero compression"
        fromValue={42}
        value={98}
        sweepAt={405}
        metrics={[
          { label: "FCP", value: "0.6 s", status: "good" },
          { label: "LCP", value: "1.1 s", status: "good" },
          { label: "TBT", value: "20 ms", status: "good" },
          { label: "CLS", value: "0.00", status: "good" },
        ]}
      />

      <Label at={374} y={915}>
        GaugeSpeedometer · dark · unoptimized client bundle
      </Label>
      <GaugeSpeedometer
        at={376}
        y={965}
        h={545}
        dark
        title="Legacy SPA benchmark"
        subtitle="4.2 MB unminified main.js on 4G"
        value={38}
        metrics={[
          { label: "FCP", value: "3.4 s", status: "bad" },
          { label: "LCP", value: "6.8 s", status: "bad" },
          { label: "TBT", value: "890 ms", status: "bad" },
          { label: "CLS", value: "0.18", status: "warn" },
        ]}
      />
    </Win>

    {/* 5. WaterfallBreakdown: Bundle size optimization + SaaS MRR bridge */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        WaterfallBreakdown · bundle size reduction bridge
      </Label>
      <WaterfallBreakdown
        at={482}
        y={305}
        h={550}
        title="Client bundle reduction bridge"
        subtitle="gzipped JS payload from initial build to ship"
        unit="KB"
        steps={[
          { label: "Initial", delta: 480, isTotal: true },
          { label: "Auth SDK", delta: 65 },
          { label: "Drop moment", delta: -170 },
          { label: "Tree-shake", delta: -135 },
          { label: "Brotli -11", delta: -95 },
          { label: "Final", delta: 0, isTotal: true },
        ]}
      />

      <Label at={494} y={890}>
        WaterfallBreakdown · dark · SaaS MRR net retention bridge
      </Label>
      <WaterfallBreakdown
        at={496}
        y={940}
        h={530}
        dark
        positiveIsGood
        title="Q3 monthly recurring revenue"
        subtitle="net dollar retention 118%"
        unit="K"
        prefixUnit={false}
        steps={[
          { label: "Start MRR", delta: 120, isTotal: true },
          { label: "New logos", delta: 34 },
          { label: "Expansion", delta: 22 },
          { label: "Contraction", delta: -9 },
          { label: "Churn", delta: -15 },
          { label: "End MRR", delta: 0, isTotal: true },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
