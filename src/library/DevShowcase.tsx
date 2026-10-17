import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CodeBlock } from "../components/dev/CodeBlock";
import { DiffView } from "../components/dev/DiffView";
import { HttpExchange } from "../components/dev/HttpExchange";
import { JsonTree } from "../components/dev/JsonTree";
import { LogStream } from "../components/dev/LogStream";
import { Pipeline } from "../components/dev/Pipeline";
import { ResourceMeters } from "../components/dev/ResourceMeters";
import { StackTrace } from "../components/dev/StackTrace";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the dev group (2026-10-11): code, diffs, JSON, HTTP, logs, CI, resources, stack traces.
// Section frames: code 0, diff 110, json 200, http 290, logs + pipeline 380, meters + pipeline row 470,
// stack traces 540.

const Label: React.FC<{ at: number; x?: number; y: number; children: string }> = ({ at, x = TX, y, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: mono, fontWeight: 500, fontSize: 26, color: C.mute, opacity: prog(frame, at, 8) }}>
      {children}
    </div>
  );
};

const USERS_TS = `type User = { id: number; name: string };

async function getUser(id: number) {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}\`);
  }
  return (await res.json()) as User;
}`;

const DEPLOY_SH = `#!/usr/bin/env bash
set -euo pipefail
npm ci && npm run build
rsync -az ./dist/ "$HOST:/var/www/app"
echo "deployed $(git rev-parse --short HEAD)"`;

export const DevShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. CodeBlock: light ts with a gliding highlight, dark bash typing in */}
    <Win from={0} to={110}>
      <Label at={0} y={255}>
        CodeBlock · ts · highlight 4 → 5-7 (36, 58)
      </Label>
      <CodeBlock
        at={2}
        x={TX}
        y={310}
        size={26}
        lang="ts"
        filename="users.ts"
        right="ts"
        code={USERS_TS}
        highlight={[
          { lines: 4, at: 36 },
          { lines: [5, 7], at: 58, tone: "warn", label: "check status" },
        ]}
      />
      <Label at={10} y={835}>
        CodeBlock · dark · bash · typeAt 20
      </Label>
      <CodeBlock at={12} x={TX} y={890} size={26} lang="bash" dark filename="deploy.sh" code={DEPLOY_SH} typeAt={20} cps={3} />
    </Win>

    {/* 2. DiffView: before → after on a python file, a plain unified diff below */}
    <Win from={110} to={200}>
      <Label at={110} y={255}>
        DiffView · applyAt 135 · settleAt 165
      </Label>
      <DiffView
        at={112}
        x={TX}
        y={310}
        lang="python"
        filename="settings.py"
        applyAt={135}
        settleAt={165}
        lines={[
          "@@ -1,6 +1,6 @@",
          " import os",
          " ",
          "-DEBUG = True",
          "-PORT = 80",
          '+DEBUG = os.getenv("DEBUG") == "1"',
          '+PORT = int(os.getenv("PORT", "8080"))',
          " ",
          " def main():",
        ]}
      />
      <Label at={118} y={845}>
        DiffView · js · old / new line numbers
      </Label>
      <DiffView
        at={120}
        x={TX}
        y={900}
        lang="js"
        filename="src/api.js"
        lines={[
          "@@ -10,3 +10,4 @@ async function load(url) {",
          "   // fetch() returns a promise",
          "-  const data = await fetch(url).json();",
          "+  const res = await fetch(url);",
          "+  const data = await res.json();",
          "   return data;",
        ]}
      />
    </Win>

    {/* 3. JsonTree: open roles, open address, focus glides */}
    <Win from={200} to={290}>
      <Label at={200} y={255}>
        JsonTree · open 216, 232 · focus 248 → 262
      </Label>
      <JsonTree
        at={202}
        x={TX}
        y={310}
        filename="user.json"
        data={{
          id: 42,
          name: "Ada Lovelace",
          active: true,
          roles: ["admin", "editor"],
          address: { city: "London", zip: null },
          last_login: "2026-10-11T03:07:12Z",
        }}
        expand={[
          { path: "roles", at: 216 },
          { path: "address", at: 232 },
        ]}
        focus={[
          { path: "roles.1", at: 248 },
          { path: "address.city", at: 262 },
        ]}
      />
    </Win>

    {/* 4. HttpExchange: POST → 201 with latency, GET → 404 */}
    <Win from={290} to={380}>
      <Label at={290} y={255}>
        HttpExchange · send 304 · respond 326
      </Label>
      <HttpExchange
        at={292}
        x={TX}
        y={310}
        sendAt={304}
        respondAt={326}
        latency="128 ms"
        host="api.example.com"
        request={{
          method: "POST",
          path: "/api/users",
          headers: [
            ["Content-Type", "application/json"],
            ["Accept", "application/json"],
          ],
          body: '{ "name": "Ada" }',
        }}
        response={{
          status: 201,
          headers: [
            ["Location", "/api/users/42"],
            ["Content-Type", "application/json"],
          ],
          body: '{ "id": 42, "name": "Ada" }',
        }}
      />
      <Label at={330} y={1035}>
        HttpExchange · 404
      </Label>
      <HttpExchange
        at={332}
        x={TX}
        y={1085}
        gap={90}
        sendAt={338}
        respondAt={352}
        latency="9 ms"
        host="api.example.com"
        request={{ method: "GET", path: "/api/users/7" }}
        response={{ status: 404, body: '{ "error": "user not found" }' }}
      />
    </Win>

    {/* 5. LogStream scrolling + focus on the error, Pipeline column failing at test */}
    <Win from={380} to={470}>
      <Label at={380} y={255}>
        LogStream · scrolls · focus error 428
      </Label>
      <LogStream
        at={382}
        x={TX}
        y={310}
        h={500}
        filename="server.log"
        focus={[{ index: 7, at: 428, tone: "bad" }]}
        lines={[
          { at: 386, time: "03:07:12", level: "info", text: "server listening on :3000" },
          { at: 390, time: "03:07:15", level: "info", text: "GET /api/users 200 12ms" },
          { at: 394, time: "03:07:16", level: "info", text: "GET /api/users/42 200 9ms" },
          { at: 398, time: "03:07:18", level: "warn", text: "slow query: 812ms (users.find)" },
          { at: 402, time: "03:07:19", level: "info", text: "POST /api/login 200 31ms" },
          { at: 406, time: "03:07:20", level: "debug", text: "pool: 10 idle, 0 busy" },
          { at: 410, time: "03:07:21", level: "warn", text: "db connection lost, retrying" },
          { at: 414, time: "03:07:21", level: "error", text: "connect ECONNREFUSED 127.0.0.1:5432" },
          { at: 418, time: "03:07:21", level: "error", text: "GET /api/users 500 3ms" },
          { at: 422, time: "03:07:22", level: "info", text: "retry 1/5 in 2s" },
        ]}
      />
      <Label at={384} y={865}>
        Pipeline · column · test fails 436
      </Label>
      <Pipeline
        at={386}
        x={TX}
        y={920}
        filename="ci.yml"
        right="push to main"
        steps={[
          { label: "install", sub: "npm ci", startAt: 394, endAt: 410, duration: "18s" },
          { label: "test", sub: "npm test", startAt: 410, endAt: 436, result: "fail", duration: "41s" },
          { label: "build", sub: "npm run build", endAt: 440, result: "skip" },
          { label: "deploy", sub: "rsync to the server", endAt: 442, result: "skip" },
        ]}
      />
    </Win>

    {/* 6. Pipeline row passing, ResourceMeters: one core pinned, memory climbing */}
    <Win from={470} to={540}>
      <Label at={470} y={255}>
        Pipeline · row · all pass
      </Label>
      <Pipeline
        at={472}
        x={TX}
        y={310}
        dir="row"
        steps={[
          { label: "install", startAt: 478, endAt: 488, duration: "12s" },
          { label: "test", startAt: 488, endAt: 500, duration: "41s" },
          { label: "build", startAt: 500, endAt: 512, duration: "1m 3s" },
          { label: "deploy", startAt: 512, endAt: 526, duration: "22s" },
        ]}
      />
      <Label at={474} y={705}>
        ResourceMeters · core 3 → 100% at 494 · mem 506
      </Label>
      <ResourceMeters
        at={476}
        x={TX}
        y={760}
        filename="htop"
        cores={[
          { label: "1", keys: [{ at: 482, value: 12 }, { at: 494, value: 18 }] },
          { label: "2", keys: [{ at: 482, value: 8 }] },
          { label: "3", keys: [{ at: 482, value: 23 }, { at: 494, value: 100 }] },
          { label: "4", keys: [{ at: 482, value: 5 }] },
          { label: "5", keys: [{ at: 482, value: 14 }, { at: 506, value: 72 }] },
          { label: "6", keys: [{ at: 482, value: 9 }] },
          { label: "7", keys: [{ at: 482, value: 31 }, { at: 494, value: 12 }] },
          { label: "8", keys: [{ at: 482, value: 6 }] },
        ]}
        rows={[
          { label: "mem", display: "of", max: 16, unit: "GiB", keys: [{ at: 482, value: 3.1 }, { at: 506, value: 15.2 }] },
          { label: "swp", display: "of", max: 2, unit: "GiB", keys: [{ at: 482, value: 0 }, { at: 512, value: 1.4 }] },
        ]}
      />
    </Win>

    {/* 7. StackTrace: js (focus glides to the caller), python traceback */}
    <Win from={540} to={600}>
      <Label at={540} y={255}>
        StackTrace · js · focus 556 → 572
      </Label>
      <StackTrace
        at={542}
        x={TX}
        y={310}
        error="TypeError"
        message="fetch(...).json is not a function"
        focus={[
          { index: 0, at: 556 },
          { index: 1, at: 572 },
        ]}
        frames={[
          { fn: "load", file: "src/api.js", line: 11, col: 33 },
          { fn: "main", file: "src/index.js", line: 5, col: 16 },
          { fn: "process.processTicksAndRejections", file: "node:internal/process/task_queues", line: 95, col: 5, lib: true },
        ]}
      />
      <Label at={546} y={875}>
        StackTrace · python
      </Label>
      <StackTrace
        at={548}
        x={TX}
        y={930}
        format="python"
        error="KeyError"
        message="'email'"
        focus={[{ index: 1, at: 566, tone: "bad" }]}
        frames={[
          { fn: "<module>", file: "app.py", line: 9 },
          { fn: "get_user", file: "app.py", line: 5 },
        ]}
      />
    </Win>
  </AbsoluteFill>
);
