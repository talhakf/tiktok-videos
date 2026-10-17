import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BTree } from "../components/arch/BTree";
import { BigOChart } from "../components/arch/BigOChart";
import { CacheFlow } from "../components/arch/CacheFlow";
import { LoadBalancer } from "../components/arch/LoadBalancer";
import { SqlInjectionCard } from "../components/arch/SqlInjectionCard";
import { Backdrop } from "../components/Backdrop";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the arch group (Databases, Architecture & CS):
// 0..120: BTree · 120..240: SqlInjectionCard · 240..360: CacheFlow · 360..480: LoadBalancer · 480..600: BigOChart

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

export const ArchShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. BTree: 3-level database index traversal */}
    <Win from={0} to={120}>
      <Label at={0} y={265}>
        BTree · root (18) → internal (42) → leaf row pointer (68)
      </Label>
      <BTree
        at={2}
        x={TX}
        y={330}
        searchKey="pizza"
        hopsLabel="3 hops · 0.02 ms"
        root={{ keys: ["A – M", "N – Z"], activeAt: 18 }}
        branches={[
          { keys: ["A – F", "G – M"], parentIndex: 0 },
          { keys: ["N – R", "S – Z"], activeAt: 42, parentIndex: 1 },
        ]}
        leaves={[
          { label: "'apple'", rowRef: "row #18,204", branchIndex: 0 },
          { label: "'mango'", rowRef: "row #209,110", branchIndex: 0 },
          { label: "'pizza'", rowRef: "row #412,890", activeAt: 68, branchIndex: 1 },
          { label: "'zebra'", rowRef: "row #891,002", branchIndex: 1 },
        ]}
      />
    </Win>

    {/* 2. SqlInjectionCard: typing -> 3-part anatomy -> safe parameterized query */}
    <Win from={120} to={240}>
      <Label at={120} y={265}>
        SqlInjectionCard · typeAt 128 · explainAt 162 · paramAt 200
      </Label>
      <SqlInjectionCard
        at={122}
        x={TX}
        y={330}
        input="' OR 1=1 --"
        typeAt={128}
        fpc={2}
        explainAt={162}
        paramAt={200}
      />
    </Win>

    {/* 3. CacheFlow: Redis RAM miss -> DB fallback -> RAM hit + live TTL */}
    <Win from={240} to={360}>
      <Label at={240} y={265}>
        CacheFlow · missAt 250 · hitAt 302 · TTL countdown
      </Label>
      <CacheFlow
        at={242}
        x={TX}
        y={330}
        cacheLabel="Redis (RAM)"
        cacheLatency="0.2 ms"
        dbLabel="Postgres (Disk)"
        dbLatency="185 ms"
        missAt={250}
        hitAt={302}
        ttl={{ from: 60, at: 292, key: "user:42", val: '{ name: "Ada", role: "admin" }' }}
      />
    </Win>

    {/* 4. LoadBalancer: Reverse proxy round-robin + backend crash failover */}
    <Win from={360} to={480}>
      <Label at={360} y={265}>
        LoadBalancer · round-robin · app-02 crashAt 412
      </Label>
      <LoadBalancer
        at={362}
        x={TX}
        y={330}
        proxyLabel="Nginx / Cloudflare"
        proxySub=":443"
        algorithm="round-robin"
        servers={[
          { label: "app-01", sub: "10.0.1.11:8080" },
          { label: "app-02", sub: "10.0.1.12:8080", crashAt: 412, recoverAt: 458 },
          { label: "app-03", sub: "10.0.1.13:8080" },
        ]}
        requests={[
          { at: 370, targetIndex: 0, label: "GET /feed" },
          { at: 384, targetIndex: 1, label: "POST /pay" },
          { at: 398, targetIndex: 2, label: "GET /user" },
          { at: 418, targetIndex: 0, label: "GET /search" },
          { at: 434, targetIndex: 2, label: "GET /items" },
        ]}
      />
    </Win>

    {/* 5. BigOChart: Complexity coordinate plot + live operation counter */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        BigOChart · highlight O(log n) vs O(n²) · nValue 10 → 1,000
      </Label>
      <BigOChart
        at={482}
        x={TX}
        y={310}
        h={560}
        drawAt={488}
        dur={28}
        highlight="O(log n)"
        nValue={{ from: 10, to: 1000, at: 510, dur: 45 }}
      />
      <Label at={492} y={900}>
        BigOChart · highlight O(n²) quadratic blowup
      </Label>
      <BigOChart
        at={494}
        x={TX}
        y={955}
        h={560}
        drawAt={500}
        dur={28}
        highlight="O(n²)"
        nValue={{ from: 100, to: 5000, at: 520, dur: 45 }}
      />
    </Win>
  </AbsoluteFill>
);
