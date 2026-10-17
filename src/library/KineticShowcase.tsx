import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CalloutLoupe } from "../components/kinetic/CalloutLoupe";
import { SlotMachineText } from "../components/kinetic/SlotMachineText";
import { SplitFlapBoard } from "../components/kinetic/SplitFlapBoard";
import { SpotlightCode } from "../components/kinetic/SpotlightCode";
import { StepProgressBar } from "../components/kinetic/StepProgressBar";
import { TX, TW } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the kinetic typography, callouts & micro-animations group (600 frames @ 30fps, 1080x1920).
// Section frames: SlotMachineText 0..120, SpotlightCode 120..240, SplitFlapBoard 240..360,
// CalloutLoupe 360..480, StepProgressBar 480..600.

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

const VERIFY_TOKEN_TS = `export async function verifySession(token: string) {
  const [header, payload, sig] = token.split(".");
  const meta = JSON.parse(atob(header));

  if (meta.alg === "none") {
    return JSON.parse(atob(payload));
  }

  const valid = await hmacVerify(header + "." + payload, sig);
  return valid ? JSON.parse(atob(payload)) : null;
}`;

const NGINX_YAML = `server:
  listen: 443 ssl http2
  tls_protocols: TLSv1.3
  proxy_read_timeout: 30s
  rate_limit_burst: 120
  access_log: /var/log/edge.log`;

export const KineticShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. SlotMachineText: vertical rolling word-wheel headline cards */}
    <Win from={0} to={120}>
      <Label at={0} y={260}>
        SlotMachineText · rolling word-wheel · 24 → 54 → 84
      </Label>
      <SlotMachineText
        at={2}
        x={TX}
        y={315}
        w={TW}
        label="Deploy policy"
        prefix="Ship fast, break "
        words={[
          { text: "nothing", at: 24, tone: "good", icon: "shieldCheck", sub: "142 integration checks passing" },
          { text: "staging", at: 54, tone: "warn", icon: "warning", sub: "canary error rate above 1.5%" },
          { text: "prod at 3am", at: 84, tone: "bad", icon: "flame", sub: "pagerduty alert triggered on main" },
        ]}
      />

      <Label at={10} y={655}>
        SlotMachineText · dark · read latency reel
      </Label>
      <SlotMachineText
        at={12}
        x={TX}
        y={710}
        w={TW}
        dark
        label="Query path"
        prefix="Read from "
        words={[
          { text: "L1 memory", at: 32, tone: "good", icon: "bolt", sub: "p99 latency: 0.4 ms" },
          { text: "Redis cluster", at: 62, tone: "accent", icon: "database", sub: "p99 latency: 4.8 ms" },
          { text: "cold disk", at: 90, tone: "warn", icon: "disk", sub: "p99 latency: 185 ms" },
        ]}
      />
    </Win>

    {/* 2. SpotlightCode: code focus & 0.25 dim-mask inspector card */}
    <Win from={120} to={240}>
      <Label at={120} y={260}>
        SpotlightCode · dark · focus glides 140 → 168 → 198
      </Label>
      <SpotlightCode
        at={122}
        x={TX}
        y={315}
        w={TW}
        lang="ts"
        filename="auth/verifyToken.ts"
        right="ts"
        code={VERIFY_TOKEN_TS}
        focus={[
          { fromLine: 2, toLine: 3, at: 140, tone: "accent", note: "decode JWT header" },
          { fromLine: 5, toLine: 7, at: 168, tone: "bad", note: "alg: none bypass!" },
          { fromLine: 9, toLine: 10, at: 198, tone: "good", note: "HMAC signature check" },
        ]}
      />

      <Label at={130} y={880}>
        SpotlightCode · light · yaml inspector
      </Label>
      <SpotlightCode
        at={132}
        x={TX}
        y={935}
        w={TW}
        dark={false}
        lang="yaml"
        filename="edge-gateway.yml"
        right="yaml"
        code={NGINX_YAML}
        focus={[
          { fromLine: 2, toLine: 3, at: 152, tone: "good", note: "TLS 1.3 enforced" },
          { fromLine: 5, toLine: 5, at: 186, tone: "warn", note: "burst cap: 120 req/s" },
        ]}
      />
    </Win>

    {/* 3. SplitFlapBoard: mechanical departure-board / cipher character flip display */}
    <Win from={240} to={360}>
      <Label at={240} y={260}>
        SplitFlapBoard · light · flipAt 252
      </Label>
      <SplitFlapBoard
        at={242}
        x={TX}
        y={315}
        w={TW}
        label="Release status"
        icon="checkCircle"
        tone="good"
        target="PROD DEPLOYED"
        flipAt={252}
        sub="release v2.4.0 · 0 errors · us-east-1"
      />

      <Label at={250} y={620}>
        SplitFlapBoard · dark · cipher lock at 276
      </Label>
      <SplitFlapBoard
        at={252}
        x={TX}
        y={675}
        w={TW}
        dark
        label="Network scanner"
        icon="lock"
        tone="accent"
        target="PORT 5432 OPEN"
        flipAt={276}
        sub="postgres listening on 0.0.0.0:5432"
      />

      <Label at={260} y={980}>
        SplitFlapBoard · incident alert · flipAt 298
      </Label>
      <SplitFlapBoard
        at={262}
        x={TX}
        y={1035}
        w={TW}
        label="Edge firewall"
        icon="warning"
        tone="bad"
        target="RATE LIMIT HIT"
        flipAt={298}
        sub="429 Too Many Requests · ip 198.51.100.42"
      />
    </Win>

    {/* 4. CalloutLoupe: magnified command / code loupe card */}
    <Win from={360} to={480}>
      <Label at={360} y={260}>
        CalloutLoupe · magnified command inspection · zoomAt 380
      </Label>
      <CalloutLoupe
        at={362}
        x={TX}
        y={315}
        w={TW}
        sourceText="curl -sSf https://install.example.sh | sh -s -- -y"
        highlightRange={[37, 44]}
        zoomText="| sh -s"
        zoomAt={380}
        tone="bad"
        icon="warning"
        label="bash"
        title="Pipes remote script straight into your shell"
        bullets={[
          "Executes arbitrary remote bytes before you can inspect them",
          "If the connection drops mid-stream, partial commands still run",
          "Download to a file first, verify its SHA-256 hash, then execute",
        ]}
      />
    </Win>

    {/* 5. StepProgressBar: multi-step horizontal & vertical process trackers */}
    <Win from={480} to={600}>
      <Label at={480} y={260}>
        StepProgressBar · horizontal · 4 steps (492..540)
      </Label>
      <StepProgressBar
        at={482}
        x={TX}
        y={315}
        w={TW}
        dir="horizontal"
        title="Zero-downtime schema migration"
        steps={[
          { label: "Snapshot", sub: "pg_dump 14s", at: 492, status: "done" },
          { label: "Add column", sub: "nullable", at: 508, status: "done" },
          { label: "Backfill", sub: "2.4M rows", at: 524, status: "done" },
          { label: "Cutover", sub: "swap views", at: 540, status: "done" },
        ]}
      />

      <Label at={488} y={660}>
        StepProgressBar · vertical · error on step 3 (554)
      </Label>
      <StepProgressBar
        at={490}
        x={TX}
        y={715}
        w={TW}
        dir="vertical"
        title="API request verification"
        steps={[
          { label: "TLS 1.3 handshake", sub: "cipher TLS_AES_256_GCM_SHA384", at: 506, status: "done" },
          { label: "JWT signature check", sub: "RS256 public key matched", at: 530, status: "done" },
          { label: "RBAC scope policy", sub: "missing scope: admin:write", at: 554, status: "error" },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
