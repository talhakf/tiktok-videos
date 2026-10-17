import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GraphTraversal } from "../components/algo/GraphTraversal";
import { HashMapCard } from "../components/algo/HashMapCard";
import { LinkedList } from "../components/algo/LinkedList";
import { SortingBars } from "../components/algo/SortingBars";
import { StackQueue } from "../components/algo/StackQueue";
import { Backdrop } from "../components/Backdrop";
import { TX } from "../layout";
import { Win } from "../lib/timing";
import { C, mono, prog } from "../theme";

// Preview of the algo group (Algorithms & Data Structures):
// 0..120: SortingBars · 120..240: GraphTraversal · 240..360: HashMapCard · 360..480: StackQueue · 480..600: LinkedList

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

export const AlgoShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />

    {/* 1. SortingBars: array sorting swaps & binary search tile narrowing */}
    <Win from={0} to={120}>
      <Label at={0} y={250}>
        SortingBars · compare (blue) · gliding swap (amber) · sorted (green)
      </Label>
      <SortingBars
        at={2}
        x={TX}
        y={300}
        h={620}
        title="quicksort partition & swap"
        values={[48, 19, 72, 31, 86, 12, 57]}
        steps={[
          {
            at: 14,
            values: [48, 19, 72, 31, 86, 12, 57],
            compare: [0, 5],
            pivot: 3,
            note: "compare 48 > 12",
          },
          {
            at: 32,
            values: [12, 19, 72, 31, 86, 48, 57],
            swap: [0, 5],
            pivot: 3,
            note: "swap [0] ↔ [5]",
          },
          {
            at: 52,
            values: [12, 19, 72, 31, 86, 48, 57],
            compare: [2, 3],
            pivot: 3,
            note: "compare 72 > 31",
          },
          {
            at: 68,
            values: [12, 19, 31, 72, 86, 48, 57],
            swap: [2, 3],
            sorted: [0, 1, 2],
            note: "swap [2] ↔ [3]",
          },
          {
            at: 86,
            values: [12, 19, 31, 48, 57, 72, 86],
            swap: [3, 5],
            sorted: [0, 1, 2, 3, 4, 5, 6],
            note: "sorted O(n log n)",
          },
        ]}
      />

      <Label at={8} y={960}>
        SortingBars · mode="tiles" · binary search for 57
      </Label>
      <SortingBars
        at={10}
        x={TX}
        y={1010}
        h={390}
        mode="tiles"
        title="binary search · target = 57"
        values={[12, 19, 31, 48, 57, 72, 86]}
        steps={[
          {
            at: 24,
            values: [12, 19, 31, 48, 57, 72, 86],
            compare: [3, 3],
            range: [0, 6],
            note: "mid [3] = 48 < 57 → go right",
          },
          {
            at: 54,
            values: [12, 19, 31, 48, 57, 72, 86],
            compare: [5, 5],
            range: [4, 6],
            note: "mid [5] = 72 > 57 → go left",
          },
          {
            at: 82,
            values: [12, 19, 31, 48, 57, 72, 86],
            sorted: [4],
            range: [4, 4],
            note: "found 57 at index [4]!",
          },
        ]}
      />
    </Win>

    {/* 2. GraphTraversal: Dijkstra / BFS shortest path with bottom frontier queue strip */}
    <Win from={120} to={240}>
      <Label at={120} y={260}>
        GraphTraversal · Dijkstra traversal (132..188) → shortest path (196)
      </Label>
      <GraphTraversal
        at={122}
        x={TX}
        y={320}
        h={840}
        title="Dijkstra shortest path · A → F"
        mode="dijkstra"
        nodes={[
          { id: "A", label: "A", x: 140, y: 390, cost: "d=0" },
          { id: "B", label: "B", x: 380, y: 215, cost: "d=4" },
          { id: "C", label: "C", x: 380, y: 565, cost: "d=2" },
          { id: "D", label: "D", x: 600, y: 215, cost: "d=9" },
          { id: "E", label: "E", x: 600, y: 565, cost: "d=5" },
          { id: "F", label: "F", x: 785, y: 390, cost: "d=6" },
        ]}
        edges={[
          { from: "A", to: "B", weight: "4" },
          { from: "A", to: "C", weight: "2" },
          { from: "C", to: "B", weight: "1" },
          { from: "B", to: "D", weight: "5" },
          { from: "C", to: "E", weight: "3" },
          { from: "E", to: "D", weight: "4" },
          { from: "D", to: "F", weight: "2" },
          { from: "E", to: "F", weight: "1" },
        ]}
        visitOrder={[
          { id: "A", at: 132 },
          { id: "C", at: 146 },
          { id: "B", at: 158 },
          { id: "E", at: 170 },
          { id: "F", at: 182 },
          { id: "D", at: 190 },
        ]}
        pathOrder={[
          { id: "A", at: 198 },
          { id: "C", at: 204 },
          { id: "E", at: 210 },
          { id: "F", at: 216 },
        ]}
      />
    </Win>

    {/* 3. HashMapCard: Hash table buckets, collision chaining, and O(1) lookup */}
    <Win from={240} to={360}>
      <Label at={240} y={260}>
        HashMapCard · hash(k) % 6 · collision chain on [2] (296) · lookup (330)
      </Label>
      <HashMapCard
        at={242}
        x={TX}
        y={320}
        h={760}
        buckets={6}
        entries={[
          { key: "pizza", value: "$12", bucket: 2, at: 254 },
          { key: "donut", value: "$4", bucket: 0, at: 274 },
          { key: "taco", value: "$9", bucket: 2, at: 296 },
          { key: "ramen", value: "$15", bucket: 4, at: 314 },
        ]}
        lookup={{ key: "taco", bucket: 2, at: 332 }}
      />
    </Win>

    {/* 4. StackQueue: Stack (LIFO) vs Queue (FIFO) */}
    <Win from={360} to={480}>
      <Label at={360} y={250}>
        StackQueue · mode="stack" (LIFO) · push & pop with gliding top badge
      </Label>
      <StackQueue
        at={362}
        x={TX}
        y={300}
        h={530}
        mode="stack"
        initialItems={["main()"]}
        ops={[
          { at: 374, kind: "push", label: "parse()" },
          { at: 392, kind: "push", label: "lex()" },
          { at: 414, kind: "pop", label: "lex()" },
          { at: 436, kind: "push", label: "eval()" },
          { at: 456, kind: "pop", label: "eval()" },
        ]}
      />

      <Label at={366} y={870}>
        StackQueue · mode="queue" (FIFO) · enqueue & dequeue with head / tail
      </Label>
      <StackQueue
        at={368}
        x={TX}
        y={920}
        h={500}
        mode="queue"
        initialItems={["job #1", "job #2"]}
        ops={[
          { at: 382, kind: "push", label: "job #3" },
          { at: 406, kind: "pop", label: "job #1" },
          { at: 430, kind: "push", label: "job #4" },
          { at: 454, kind: "pop", label: "job #2" },
        ]}
      />
    </Win>

    {/* 5. LinkedList: slow/fast pointers + pointer-rewiring node insertion */}
    <Win from={480} to={600}>
      <Label at={480} y={250}>
        LinkedList · slow & fast tortoise-and-hare pointers
      </Label>
      <LinkedList
        at={482}
        x={TX}
        y={300}
        h={470}
        title="linked list · slow & fast pointers"
        values={["10", "20", "30", "40"]}
        highlight={[
          { index: 0, at: 492, label: "slow" },
          { index: 0, at: 492, label: "fast" },
          { index: 1, at: 514, label: "slow" },
          { index: 2, at: 514, label: "fast" },
          { index: 2, at: 538, label: "slow" },
          { index: 3, at: 538, label: "fast" },
        ]}
      />

      <Label at={486} y={815}>
        LinkedList · O(1) pointer insert after [1] (rewire at 516)
      </Label>
      <LinkedList
        at={488}
        x={TX}
        y={865}
        h={550}
        title="linked list · insert node('25') after [1]"
        values={["10", "20", "30", "40"]}
        highlight={[{ index: 1, at: 500, label: "prev" }]}
        insert={{ afterIndex: 1, label: "25", at: 516 }}
      />
    </Win>
  </AbsoluteFill>
);
