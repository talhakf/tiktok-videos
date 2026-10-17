import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BackoffTimeline } from "../components/cloud/BackoffTimeline";
import { DockerLayers } from "../components/cloud/DockerLayers";
import { EnvCard } from "../components/cloud/EnvCard";
import { K8sCluster } from "../components/cloud/K8sCluster";
import { UptimeBar } from "../components/cloud/UptimeBar";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the cloud & DevOps group: DockerLayers, K8sCluster, EnvCard, UptimeBar, BackoffTimeline.
// Five 120-frame sections across 600 frames (fps: 30, 1080x1920).

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({
  at,
  x = TX,
  y,
  children,
}) => {
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

export const CloudShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. DockerLayers: image layer cache hit then cache invalidation cascade */}
    <Win from={0} to={120}>
      <Label at={0} y={255}>
        DockerLayers · cacheHitAt 26 · invalidateFrom L2 at 62
      </Label>
      <DockerLayers
        at={2}
        x={TX}
        y={310}
        cacheHitAt={26}
        invalidateFrom={{ index: 2, at: 62 }}
      />
    </Win>

    {/* 2. K8sCluster: Ingress routing, CrashLoopBackOff, self-healing & horizontal scaling */}
    <Win from={120} to={240}>
      <Label at={120} y={255}>
        K8sCluster · crashAt 150 · healAt 182 · scale +1 at 196
      </Label>
      <K8sCluster
        at={122}
        x={TX}
        y={310}
        pods={[
          { name: "api-7f8b9-x2k", version: "v2.4.0", cpu: "140m", mem: "248Mi" },
          {
            name: "api-7f8b9-m9p",
            version: "v2.4.0",
            cpu: "165m",
            mem: "264Mi",
            crashAt: 150,
            healAt: 182,
          },
          { name: "api-7f8b9-q4v", version: "v2.4.0", cpu: "120m", mem: "230Mi" },
          {
            name: "api-7f8b9-z8n",
            version: "v2.4.0",
            cpu: "110m",
            mem: "212Mi",
            at: 196,
          },
        ]}
      />
    </Win>

    {/* 3. EnvCard: production secret reveal + GitHub leak banner, and development card */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        EnvCard · production · revealAt 266 · leakAt 296
      </Label>
      <EnvCard
        at={242}
        x={TX}
        y={310}
        env="production"
        filename=".env.production"
        revealAt={266}
        vars={[
          { key: "NODE_ENV", value: "production" },
          { key: "PORT", value: "8080" },
          {
            key: "DATABASE_URL",
            value: "postgres://app:p9x2k@db.internal:5432/prod",
            secret: true,
          },
          {
            key: "STRIPE_SECRET_KEY",
            value: "sk_live_51Nx92kL8mQ4vR7pZ",
            secret: true,
            leakAt: 296,
          },
          {
            key: "JWT_SIGNING_SECRET",
            value: "9f8e7d6c5b4a3f2e1d0c9b8a",
            secret: true,
          },
        ]}
      />
      <Label at={248} y={910}>
        EnvCard · development · local secrets masked
      </Label>
      <EnvCard
        at={250}
        x={TX}
        y={965}
        env="development"
        filename=".env.local"
        vars={[
          { key: "NODE_ENV", value: "development" },
          { key: "API_BASE_URL", value: "http://localhost:3000" },
          { key: "REDIS_PASSWORD", value: "dev_local_pass", secret: true },
        ]}
      />
    </Win>

    {/* 4. UptimeBar: 45-bar heartbeat monitor with outage & degraded incidents */}
    <Win from={360} to={480}>
      <Label at={360} y={255}>
        UptimeBar · 45 bars · incident at 402
      </Label>
      <UptimeBar
        at={362}
        x={TX}
        y={310}
        service="api.sudo.sh"
        uptimePct="99.98%"
        status="operational"
        filename="status.sudo.sh"
        incidents={[
          {
            index: 31,
            label: "502 Bad Gateway · 4m outage",
            at: 402,
            severity: "down",
          },
        ]}
      />
      <Label at={368} y={730}>
        UptimeBar · degraded · latency spikes
      </Label>
      <UptimeBar
        at={370}
        x={TX}
        y={785}
        service="auth-worker"
        uptimePct="99.12%"
        status="degraded"
        latency="412 ms"
        filename="workers.sudo.sh"
        incidents={[
          {
            index: 14,
            label: "TLS handshake timeout",
            at: 392,
            severity: "degraded",
          },
          {
            index: 38,
            label: "Redis pool exhausted · p99 1.4s",
            at: 422,
            severity: "degraded",
          },
        ]}
      />
    </Win>

    {/* 5. BackoffTimeline: exponential retry hops (200 OK vs 429 Rate Limit shield) */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        BackoffTimeline · 1s → 2s → 4s → 8s → 16s · 200 OK
      </Label>
      <BackoffTimeline
        at={482}
        x={TX}
        y={310}
        outcome="ok"
        filename="retry-client.ts"
      />
      <Label at={488} y={815}>
        BackoffTimeline · 429 Too Many Requests shield
      </Label>
      <BackoffTimeline
        at={490}
        x={TX}
        y={870}
        outcome="rate_limited"
        filename="rate-limiter.ts"
      />
    </Win>
  </AbsoluteFill>
);
