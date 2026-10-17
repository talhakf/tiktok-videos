import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BreakpointStepper } from "../components/debug/BreakpointStepper";
import { FlameGraph } from "../components/debug/FlameGraph";
import { MemoryProfiler } from "../components/debug/MemoryProfiler";
import { StackTraceCard } from "../components/debug/StackTraceCard";
import { TestRunnerCard } from "../components/debug/TestRunnerCard";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the debug / testing / profiling / observability group:
// FlameGraph (0..120), TestRunnerCard (120..240), StackTraceCard (240..360),
// BreakpointStepper (360..480), MemoryProfiler (480..600).

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

const CHECKOUT_TS = `function calcTotal(price: number, code?: string) {
  let subtotal = price;
  const discount = code === "VIP" ? 30 : 0;
  subtotal = subtotal - discount;
  const total = Math.round(subtotal * 1.08);
  return total;
}`;

const BSEARCH_PY = `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid`;

export const DebugShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. FlameGraph: CPU profiling spans + red/amber bottleneck callout */}
    <Win from={0} to={120}>
      <Label at={0} y={255}>
        FlameGraph · cpu profile · hotspotAt 42
      </Label>
      <FlameGraph
        at={2}
        x={TX}
        y={310}
        hotspotAt={42}
        hotspotLabel="78% of CPU time"
        frames={[
          { level: 0, start: 0, width: 1, fn: "handleRequest(req)", selfMs: "240 ms" },
          { level: 1, start: 0.02, width: 0.16, fn: "verifyJwt()", selfMs: "38 ms" },
          { level: 1, start: 0.2, width: 0.78, fn: "renderFeed()", selfMs: "187 ms" },
          { level: 2, start: 0.2, width: 0.78, fn: "serializeItems()", selfMs: "187 ms", hotspot: true },
          { level: 3, start: 0.24, width: 0.42, fn: "JSON.stringify()", selfMs: "101 ms" },
        ]}
      />
      <Label at={14} y={840}>
        FlameGraph · dark · worker thread · hotspotAt 62
      </Label>
      <FlameGraph
        at={16}
        x={TX}
        y={895}
        dark
        filename="worker-thread.cpuprofile"
        right="120 ms · main thread"
        totalMs={120}
        hotspotAt={62}
        hotspotLabel="82% in regexbacktrack"
        frames={[
          { level: 0, start: 0, width: 1, fn: "processBatch(rows)", selfMs: "120 ms" },
          { level: 1, start: 0.04, width: 0.82, fn: "validateEmailRegex()", selfMs: "98 ms", hotspot: true },
          { level: 2, start: 0.1, width: 0.68, fn: "RegExp.prototype.exec", selfMs: "82 ms" },
        ]}
      />
    </Win>

    {/* 2. TestRunnerCard: Vitest failure diff box -> fixAt flips to green PASS & 100% coverage */}
    <Win from={120} to={240}>
      <Label at={120} y={255}>
        TestRunnerCard · vitest · fail diff → fixAt 176 · 100% cov
      </Label>
      <TestRunnerCard
        at={122}
        x={TX}
        y={310}
        runner="vitest"
        suite="src/auth/session.test.ts"
        fixAt={176}
        initialCoverage={84}
        fixedCoverage={100}
        tests={[
          { name: "creates signed session cookie", ms: 8, status: "pass", at: 128 },
          { name: "rejects expired refresh token", ms: 12, status: "pass", at: 134 },
          {
            name: "returns user.id for guest session",
            ms: 41,
            status: "fail",
            at: 140,
            expected: '"guest_anon_01"',
            received: "undefined (TypeError)",
          },
          { name: "rotates csrf secret on login", ms: 6, status: "pass", at: 146 },
        ]}
      />
      <Label at={132} y={935}>
        TestRunnerCard · pytest · dark
      </Label>
      <TestRunnerCard
        at={134}
        x={TX}
        y={990}
        dark
        runner="pytest"
        suite="tests/test_billing.py"
        initialCoverage={100}
        tests={[
          { name: "test_invoice_subtotal_cents", ms: 5, status: "pass", at: 142 },
          { name: "test_idempotency_key_replay", ms: 9, status: "pass", at: 148 },
          { name: "test_legacy_webhook_v1", ms: 0, status: "skip", at: 154 },
        ]}
      />
    </Win>

    {/* 3. StackTraceCard: Minified crash transforms at sourceMapAt into clean TypeScript trace */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        StackTraceCard · minified bundle → sourceMapAt 284
      </Label>
      <StackTraceCard
        at={242}
        x={TX}
        y={310}
        sourceMapAt={284}
        error="TypeError"
        message="Cannot read 'id' of undefined"
      />
    </Win>

    {/* 4. BreakpointStepper: IDE Step Debugger with gliding yellow highlight & live Locals */}
    <Win from={360} to={480}>
      <Label at={360} y={255}>
        BreakpointStepper · step over 372 → 396 → 420 → 444
      </Label>
      <BreakpointStepper
        at={362}
        x={TX}
        y={310}
        lang="ts"
        filename="debugger · checkout.ts"
        code={CHECKOUT_TS}
        breakpoints={[2]}
        steps={[
          { at: 372, line: 2, locals: { price: "120", code: '"VIP"', subtotal: "120" }, note: "hit breakpoint" },
          { at: 396, line: 3, locals: { price: "120", code: '"VIP"', subtotal: "120", discount: "30" }, note: "VIP matched" },
          { at: 420, line: 4, locals: { price: "120", discount: "30", subtotal: "90" }, note: "subtotal updated" },
          { at: 444, line: 5, locals: { subtotal: "90", discount: "30", total: "97" }, note: "+8% tax applied" },
        ]}
      />
      <Label at={368} y={795}>
        BreakpointStepper · dark · python loop
      </Label>
      <BreakpointStepper
        at={370}
        x={TX}
        y={850}
        dark
        lang="python"
        filename="debugger · bsearch.py"
        code={BSEARCH_PY}
        breakpoints={[4]}
        steps={[
          { at: 382, line: 2, locals: { target: "42", lo: "0", hi: "7" } },
          { at: 410, line: 4, locals: { target: "42", lo: "0", hi: "7", mid: "3" }, note: "nums[3] == 19" },
          { at: 438, line: 4, locals: { target: "42", lo: "4", hi: "7", mid: "5" }, note: "nums[5] == 42 ✓" },
        ]}
      />
    </Win>

    {/* 5. MemoryProfiler: Healthy saw-tooth GC curve vs runaway memory leak */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        MemoryProfiler · saw-tooth GC vs runaway leak · leakAt 500
      </Label>
      <MemoryProfiler
        at={482}
        x={TX}
        y={310}
        h={580}
        leakAt={500}
        retainedLabel="14,200 detached listeners · 1.8 GB"
      />
    </Win>
  </AbsoluteFill>
);
