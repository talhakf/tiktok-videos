import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CiPipelineCard } from "../components/git/CiPipelineCard";
import { ConflictResolver } from "../components/git/ConflictResolver";
import { GitBisectTrack } from "../components/git/GitBisectTrack";
import { RebaseVsMerge } from "../components/git/RebaseVsMerge";
import { ReflogTimeline } from "../components/git/ReflogTimeline";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the Git & CI/CD Workflows Pack 2 library components:
// RebaseVsMerge, GitBisectTrack, ConflictResolver, CiPipelineCard, ReflogTimeline.

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

export const GitShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. RebaseVsMerge: git merge main (diamond + merge commit M) vs git rebase main (linear replay F1', F2') */}
    <Win from={0} to={120}>
      <Label at={0} y={255}>
        RebaseVsMerge · merge commit M vs rebase F1&apos;, F2&apos; · actionAt 42
      </Label>
      <RebaseVsMerge at={2} x={TX} y={310} actionAt={42} />
    </Win>

    {/* 2. GitBisectTrack: O(log2 N) binary search across 16 and 32 commits */}
    <Win from={120} to={240}>
      <Label at={120} y={255}>
        GitBisectTrack · 16 commits · halving search range
      </Label>
      <GitBisectTrack at={122} x={TX} y={310} total={16} />

      <Label at={128} y={885}>
        GitBisectTrack · dark · 32 commits
      </Label>
      <GitBisectTrack at={130} x={TX} y={940} total={32} dark filename="bisect-32.log" />
    </Win>

    {/* 3. ConflictResolver: 3-way merge conflict editor card */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        ConflictResolver · Accept Incoming · resolveAt 284
      </Label>
      <ConflictResolver at={242} x={TX} y={310} resolveAt={284} choice="incoming" />

      <Label at={248} y={875}>
        ConflictResolver · dark · Accept Both · resolveAt 296
      </Label>
      <ConflictResolver
        at={250}
        x={TX}
        y={930}
        dark
        resolveAt={296}
        choice="both"
        filename="src/config/cors.ts"
        beforeLines={["export const allowedOrigins = ["]}
        currentLines={['  "https://app.sudo.dev",']}
        incomingLines={['  "https://staging.sudo.dev",']}
        afterLines={["];"]}
      />
    </Win>

    {/* 4. CiPipelineCard: GitHub Actions / CI-CD DAG board */}
    <Win from={360} to={480}>
      <Label at={360} y={255}>
        CiPipelineCard · DAG · all checks pass → deploy prod
      </Label>
      <CiPipelineCard at={362} x={TX} y={310} />

      <Label at={368} y={865}>
        CiPipelineCard · E2E fails → deploy blocked
      </Label>
      <CiPipelineCard
        at={370}
        x={TX}
        y={920}
        failJobId="e2e"
        filename=".github/workflows/release.yml"
      />
    </Win>

    {/* 5. ReflogTimeline: git reset --hard HEAD~3 -> git reflog -> git checkout b4f92a1 */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        ReflogTimeline · reset --hard 500 · reflog 522 · restore 550
      </Label>
      <ReflogTimeline
        at={482}
        x={TX}
        y={310}
        resetAt={500}
        reflogAt={522}
        restoreAt={550}
      />
    </Win>
  </AbsoluteFill>
);
