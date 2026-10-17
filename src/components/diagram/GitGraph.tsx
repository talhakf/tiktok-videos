import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { appleSpring, C, easeInOut, materialize, mono, prog } from "../../theme";
import { lerp, Pt } from "./Node";

// Git commit graph, data-driven. Commits flow left → right on horizontal lanes (lane 0 = main).
// Everything is a pure function of the frame: commits glide (rebase replay), pills move (branch / HEAD),
// commits dim or disappear (reset). Short hashes and branch names are mono.

export type GitCommit = { id: string; lane: number; x?: number; label?: string; at: number; parents?: string[]; color?: string };
export type GitMove = { id: string; to: { lane: number; x: number }; at: number; dur?: number; newLabel?: string; parents?: string[] };
export type GitBranch = { name: string; commit: string; at: number; moveTo?: { commit: string; at: number }[]; side?: "top" | "bottom" };

const MOVE = 18; // frames a commit takes to glide
const PILL_MOVE = 14;
const PILL_H = 46;

/**
 * Commit graph at `x, y` (centre of the first column on lane 0). `colGap` / `laneGap` px between columns / lanes.
 * Edges draw in at a commit's `at`, then its dot pops. `moves` glide a commit to a new spot (new short hash,
 * new parents) for a rebase replay; `drop` dims a commit (or `remove`s it) for a reset. `branches` are pills
 * above (or `side: "bottom"` below) their commit and glide along `moveTo`; `head` is the blue HEAD pill.
 */
export const GitGraph: React.FC<{
  x: number;
  y: number;
  commits: GitCommit[];
  branches?: GitBranch[];
  head?: { commit: string; at: number }[];
  headLabel?: string;
  moves?: GitMove[];
  drop?: { id: string; at: number; remove?: boolean }[];
  colGap?: number;
  laneGap?: number;
  dot?: number;
  laneColors?: string[];
  until?: number;
}> = ({
  x,
  y,
  commits,
  branches = [],
  head = [],
  headLabel = "HEAD",
  moves = [],
  drop = [],
  colGap = 130,
  laneGap = 160,
  dot = 17,
  laneColors = [C.ink, C.accent, C.mute],
  until,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = until !== undefined ? prog(frame, until, 8) : 0;
  if (out >= 1) return null;
  const laneColor = (lane: number) => laneColors[Math.abs(Math.round(lane)) % laneColors.length];
  const byId = new Map(commits.map((c, i) => [c.id, { ...c, x: c.x ?? i }]));

  // live state of one commit: position, colour, labels, parents (old + new while a move crossfades)
  const live = (id: string) => {
    const c = byId.get(id)!;
    let lane = c.lane;
    let col = c.x;
    let color = c.color ?? laneColor(c.lane);
    let label = c.label;
    let oldLabel: string | undefined;
    let labelP = 1;
    let parents = c.parents ?? [];
    let oldParents: string[] = [];
    let parentP = 1;
    for (const m of moves.filter((mv) => mv.id === id && mv.at <= frame).sort((a, b) => a.at - b.at)) {
      const dur = m.dur ?? MOVE;
      const p = prog(frame, m.at, dur, easeInOut);
      color = interpolateColors(p, [0, 1], [color, c.color ?? laneColor(m.to.lane)]);
      lane = lerp(lane, m.to.lane, p);
      col = lerp(col, m.to.x, p);
      if (m.newLabel) {
        oldLabel = label;
        label = m.newLabel;
        labelP = prog(frame, m.at + dur * 0.35, dur * 0.65, easeInOut);
      }
      if (m.parents) {
        oldParents = parents;
        parents = m.parents;
        parentP = p;
      }
    }
    const d = drop.find((dr) => dr.id === id && dr.at <= frame);
    const dim = d ? prog(frame, d.at, 10, easeInOut) : 0;
    const fade = 1 - dim * (d?.remove ? 1 : 0.75);
    const pos: Pt = { x: x + col * colGap, y: y + lane * laneGap };
    return { c, pos, color, label, oldLabel, labelP, parents, oldParents, parentP, fade };
  };

  const states = commits.filter((c) => frame >= c.at).map((c) => live(c.id));
  const stateOf = new Map(states.map((s) => [s.c.id, s]));

  // edges: color of the endpoint farther from main
  const edges: { key: string; d: string; color: string; draw: number; opacity: number }[] = [];
  for (const s of states) {
    const add = (pid: string, weight: number, drawn: boolean) => {
      const ps = stateOf.get(pid);
      if (!ps || weight <= 0) return;
      const a = ps.pos;
      const b = s.pos;
      const dx = b.x - a.x;
      const d = Math.abs(a.y - b.y) < 0.5 ? `M${a.x} ${a.y} L${b.x} ${b.y}` : `M${a.x} ${a.y} C${a.x + dx * 0.55} ${a.y} ${b.x - dx * 0.55} ${b.y} ${b.x} ${b.y}`;
      const far = Math.abs(ps.c.lane) > Math.abs(s.c.lane) ? ps.color : s.color;
      edges.push({ key: `${pid}-${s.c.id}-${drawn}`, d, color: far, draw: drawn ? prog(frame, s.c.at, 10, easeInOut) : 1, opacity: weight * Math.min(ps.fade, s.fade) });
    };
    s.parents.forEach((pid) => add(pid, s.oldParents.length ? s.parentP : 1, s.oldParents.length === 0));
    s.oldParents.filter((pid) => !s.parents.includes(pid)).forEach((pid) => add(pid, 1 - s.parentP, true));
  }

  // pills: branches in order, then HEAD; each glides between commits and stacks on shared commits
  type Pill = { name: string; head?: boolean; side: "top" | "bottom"; cues: { commit: string; at: number }[] };
  const pills: Pill[] = [
    ...branches.map((b) => ({ name: b.name, side: b.side ?? "top", cues: [{ commit: b.commit, at: b.at }, ...(b.moveTo ?? [])] })),
    ...(head.length ? [{ name: headLabel, head: true, side: "top" as const, cues: head }] : []),
  ];
  const targetAt = (pl: Pill, t: number) => [...pl.cues].filter((q) => q.at <= t).sort((a, b) => a.at - b.at).pop()?.commit;
  const stackAt = (i: number, t: number) => {
    const me = targetAt(pills[i], t);
    return pills.slice(0, i).filter((o) => o.side === pills[i].side && targetAt(o, t) === me).length;
  };
  const events = pills.flatMap((pl) => pl.cues.map((q) => q.at)).sort((a, b) => a - b);

  const hashY = dot + 12;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {edges.map((e) =>
          e.draw > 0 ? (
            <path
              key={e.key}
              d={e.d}
              fill="none"
              stroke={e.color}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={e.opacity}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - e.draw}
            />
          ) : null,
        )}
        {states.map((s) => {
          const t = frame - s.c.at - (s.c.parents?.length ? 6 : 0);
          if (t < 0) return null;
          const sp = appleSpring(t, fps, { response: 0.35 });
          return (
            <circle
              key={s.c.id}
              cx={s.pos.x}
              cy={s.pos.y}
              r={dot * (0.55 + 0.45 * sp)}
              fill={C.white}
              stroke={s.color}
              strokeWidth={5.5}
              opacity={Math.min(1, sp * 1.6) * s.fade}
            />
          );
        })}
      </svg>
      {states.map((s) => {
        const p = prog(frame, s.c.at + 6, 9);
        if (p <= 0) return null;
        const style: React.CSSProperties = {
          position: "absolute",
          left: s.pos.x,
          top: s.pos.y + hashY,
          translate: "-50% 0",
          fontFamily: mono,
          fontWeight: 500,
          fontSize: 22,
          color: C.mute,
          whiteSpace: "nowrap",
        };
        return (
          <div key={s.c.id} style={{ opacity: s.fade }}>
            {s.oldLabel && s.labelP < 1 ? <div style={{ ...style, opacity: 1 - s.labelP, filter: `blur(${s.labelP * 6}px)` }}>{s.oldLabel}</div> : null}
            {s.label ? (
              <div style={{ ...style, ...materialize(Math.min(p, s.oldLabel ? s.labelP : 1)), color: s.oldLabel ? s.color : C.mute }}>{s.label}</div>
            ) : null}
          </div>
        );
      })}
      {pills.map((pl, i) => {
        const first = pl.cues[0];
        if (frame < first.at || !stateOf.has(first.commit)) return null;
        // glide position along the cues, and the stack slot along all pill events
        let pos = stateOf.get(first.commit)!.pos;
        for (const q of pl.cues.slice(1)) {
          if (q.at > frame || !stateOf.has(q.commit)) continue;
          const p = prog(frame, q.at, PILL_MOVE, easeInOut);
          const to = stateOf.get(q.commit)!.pos;
          pos = { x: lerp(pos.x, to.x, p), y: lerp(pos.y, to.y, p) };
        }
        let slot = stackAt(i, first.at);
        for (const e of events) if (e > first.at && e <= frame) slot = lerp(slot, stackAt(i, e), prog(frame, e, PILL_MOVE, easeInOut));
        const p = prog(frame, first.at, 9);
        const top = pl.side === "top" ? pos.y - dot - 16 - PILL_H - slot * (PILL_H + 8) : pos.y + hashY + 42 + slot * (PILL_H + 8);
        const color = pl.head ? C.accent : stateOf.get(targetAt(pl, frame) ?? first.commit)?.color ?? C.ink;
        return (
          <div
            key={pl.name + i}
            style={{
              position: "absolute",
              left: pos.x,
              top,
              height: PILL_H,
              translate: "-50% 0",
              padding: "0 18px",
              borderRadius: PILL_H / 2,
              display: "flex",
              alignItems: "center",
              background: pl.head ? C.accent : C.white,
              border: `2.5px solid ${pl.head ? C.accent : color}`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 22,
              color: pl.head ? C.white : color,
              whiteSpace: "nowrap",
              transformOrigin: pl.side === "top" ? "50% 100%" : "50% 0%",
              ...materialize(p),
            }}
          >
            {pl.name}
          </div>
        );
      })}
    </div>
  );
};
