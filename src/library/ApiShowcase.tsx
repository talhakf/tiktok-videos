import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GrpcProtobufCard } from "../components/api/GrpcProtobufCard";
import { PaginationCompare } from "../components/api/PaginationCompare";
import { RateLimiterBucket } from "../components/api/RateLimiterBucket";
import { RestVsGraphql } from "../components/api/RestVsGraphql";
import { WebhookFlow } from "../components/api/WebhookFlow";
import { Backdrop } from "../components/Backdrop";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the api group (API Architecture, GraphQL, gRPC & Webhooks):
// 0..120: RestVsGraphql · 120..240: WebhookFlow · 240..360: GrpcProtobufCard · 360..480: RateLimiterBucket · 480..600: PaginationCompare

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

export const ApiShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. RestVsGraphql: 3 sequential REST round-trips vs 1 GraphQL nested query */}
    <Win from={0} to={120}>
      <Label at={0} y={265}>
        RestVsGraphql · 3 REST round-trips (over-fetched) vs 1 GraphQL query (1.2 KB)
      </Label>
      <RestVsGraphql
        at={2}
        x={TX}
        y={330}
        restAt={8}
        graphqlAt={46}
      />
    </Win>

    {/* 2. WebhookFlow: Noisy repeated polling vs event-driven HMAC Webhook push */}
    <Win from={120} to={240}>
      <Label at={120} y={265}>
        WebhookFlow · GET /status polling × 5 vs POST /webhooks/stripe (HMAC verified)
      </Label>
      <WebhookFlow
        at={122}
        x={TX}
        y={330}
        pollAt={128}
        webhookAt={168}
      />
    </Win>

    {/* 3. GrpcProtobufCard: Verbose JSON (45 B) compacting into Protobuf wire bytes (10 B) */}
    <Win from={240} to={360}>
      <Label at={240} y={265}>
        GrpcProtobufCard · JSON 45 bytes → Protobuf 10 bytes (78% smaller)
      </Label>
      <GrpcProtobufCard
        at={242}
        x={TX}
        y={330}
        encodeAt={268}
      />
    </Win>

    {/* 4. RateLimiterBucket: Token bucket capacity=4 draining to 429 Too Many Requests */}
    <Win from={360} to={480}>
      <Label at={360} y={265}>
        RateLimiterBucket · capacity 4 · 200 OK drain → 429 burst reject → +1 refill
      </Label>
      <RateLimiterBucket
        at={362}
        x={TX}
        y={330}
        capacity={4}
        refillRate="+1 token / sec"
      />
    </Win>

    {/* 5. PaginationCompare: OFFSET 100000 scan (420 ms) vs Keyset cursor seek (0.3 ms) */}
    <Win from={480} to={600}>
      <Label at={480} y={265}>
        PaginationCompare · OFFSET 100000 (420 ms) vs WHERE id &gt; 100000 (0.3 ms)
      </Label>
      <PaginationCompare
        at={482}
        x={TX}
        y={330}
        offsetAt={488}
        cursorAt={526}
      />
    </Win>
  </AbsoluteFill>
);
