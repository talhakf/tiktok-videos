import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { NeuralNet } from "../components/ai/NeuralNet";
import { SamplingCard } from "../components/ai/SamplingCard";
import { StreamingChat } from "../components/ai/StreamingChat";
import { TokenizerCard } from "../components/ai/TokenizerCard";
import { VectorSpace } from "../components/ai/VectorSpace";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the AI / LLM component group (600 frames @ 30fps):
// 0..120: TokenizerCard, 120..240: StreamingChat, 240..360: VectorSpace,
// 360..480: NeuralNet, 480..600: SamplingCard.

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

export const AIShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. TokenizerCard: subword BPE splitting + token IDs + context meter */}
    <Win from={0} to={120}>
      <Label at={0} y={255}>
        TokenizerCard · BPE subwords · splitAt 20 · idsAt 42
      </Label>
      <TokenizerCard
        at={2}
        x={TX}
        y={310}
        h={430}
        splitAt={20}
        idsAt={42}
        contextUsed={1284}
        contextMax={4096}
        tokens={[
          { text: "The", id: 791 },
          { text: " rac", id: 18412 },
          { text: "coon", id: 29871 },
          { text: " ran", id: 10932 },
          { text: " sudo", id: 24918 },
          { text: " rm", id: 15840 },
          { text: " -rf", id: 4829 },
          { text: " /", id: 611 },
        ]}
      />

      <Label at={10} y={795}>
        TokenizerCard · dark · JSON payload · splitAt 28
      </Label>
      <TokenizerCard
        at={12}
        x={TX}
        y={850}
        h={420}
        dark
        filename="prompt.tokens"
        model="o200k_base"
        splitAt={28}
        idsAt={48}
        contextUsed={3420}
        contextMax={8192}
        tokens={[
          { text: '{"', id: 4913 },
          { text: "role", id: 3785 },
          { text: '":', id: 1298 },
          { text: ' "user"', id: 1521 },
          { text: ',"', id: 2131 },
          { text: "temp", id: 8114 },
          { text: '":', id: 1298 },
          { text: " 0.0", id: 220 },
          { text: "}", id: 92 },
        ]}
      />
    </Win>

    {/* 2. StreamingChat: user prompt, collapsible reasoning, token-by-token streaming */}
    <Win from={120} to={240}>
      <Label at={120} y={255}>
        StreamingChat · thinkAt 132 · streamAt 160
      </Label>
      <StreamingChat
        at={122}
        x={TX}
        y={310}
        h={540}
        thinkAt={132}
        streamAt={160}
        framesPerToken={1.5}
        speedLabel="142 tok/s"
        prompt="Why did my Docker container exit with code 137?"
        thought="Exit code 137 = 128 + 9 (SIGKILL). Inspecting cgroup memory limits and Linux OOM killer."
        thoughtLabel="Thought for 1.4s"
        response="Exit code 137 means the container received SIGKILL (128 + 9). In almost all cases, the Linux OOM killer terminated your process because it exceeded its container memory limit."
      />

      <Label at={128} y={900}>
        StreamingChat · dark · fast stream
      </Label>
      <StreamingChat
        at={130}
        x={TX}
        y={955}
        h={500}
        dark
        model="sudo-coder-32b"
        thinkAt={140}
        streamAt={162}
        framesPerToken={1.3}
        speedLabel="218 tok/s"
        prompt="Give me a one-liner to find what owns port 8080."
        thought="Checking lsof -i :8080 and ss -lptn 'sport = :8080' on Linux/macOS."
        thoughtLabel="Thought for 0.6s"
        response="Run `sudo lsof -i :8080` (or `ss -lptn 'sport = :8080'` on Linux) to see the exact PID and process name."
      />
    </Win>

    {/* 3. VectorSpace: 2D embedding coordinates & cosine similarity */}
    <Win from={240} to={360}>
      <Label at={240} y={255}>
        VectorSpace · 2D embeddings · queryAt 268
      </Label>
      <VectorSpace
        at={242}
        x={TX}
        y={310}
        h={660}
        queryAt={268}
        neighborsCount={2}
        clusterNames={{ a: "Cluster A · wildlife", b: "Cluster B · Linux kernel" }}
        points={[
          { label: "trash panda", x: 0.24, y: 0.78, cluster: "a", similarity: 0.94 },
          { label: "bandit mask", x: 0.34, y: 0.62, cluster: "a", similarity: 0.89 },
          { label: "night forager", x: 0.14, y: 0.56, cluster: "a", similarity: 0.81 },
          { label: "epoll_wait()", x: 0.74, y: 0.28, cluster: "b", similarity: 0.19 },
          { label: "page table", x: 0.82, y: 0.42, cluster: "b", similarity: 0.23 },
          { label: "sudo daemon", x: 0.68, y: 0.18, cluster: "b", similarity: 0.14 },
          { label: 'query: "raccoon"', x: 0.22, y: 0.70, cluster: "query" },
        ]}
      />
    </Win>

    {/* 4. NeuralNet: multi-layer forward pass & softmax probabilities */}
    <Win from={360} to={480}>
      <Label at={360} y={255}>
        NeuralNet · forward pass · pulseAt 380
      </Label>
      <NeuralNet
        at={362}
        x={TX}
        y={310}
        h={620}
        pulseAt={380}
        hopDur={18}
        layers={[
          { label: "Input (x)", nodes: ["tokens", "pos_id", "mask", "context"] },
          { label: "Hidden 1", nodes: ["h₁", "h₂", "h₃", "h₄", "h₅"] },
          { label: "Hidden 2", nodes: ["z₁", "z₂", "z₃", "z₄"] },
          { label: "Output", nodes: ["trash", "door", "fridge"] },
        ]}
        probabilities={[0.78, 0.15, 0.07]}
        winnerIndex={0}
      />
    </Win>

    {/* 5. SamplingCard: temperature reshaping & next-token selection */}
    <Win from={480} to={600}>
      <Label at={480} y={255}>
        SamplingCard · temperature 1.0 → 0.2 · pickAt 538
      </Label>
      <SamplingCard
        at={482}
        x={TX}
        y={310}
        h={580}
        prompt="The raccoon opened the"
        temperature={1.0}
        tempTo={{ at: 506, value: 0.2 }}
        pickAt={538}
        pickedIndex={0}
        candidates={[
          ["trash", 0.62],
          ["door", 0.21],
          ["terminal", 0.12],
          ["fridge", 0.05],
        ]}
      />
    </Win>
  </AbsoluteFill>
);
