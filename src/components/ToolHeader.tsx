import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../icons/Icons";
import { C, materialize, prog, sans } from "../theme";

export type Tool = { from: number; name: React.ReactNode; icon?: IconName; repo?: string; n?: number; of?: number };

const TRAVEL = 60;
const DUR = 12;

// Big tool name + repo + "1/5". Direction-aware: the next tool comes in from the right while the
// previous one leaves to the left (like an iOS navigation push), with blur bridging the swap.
export const ToolHeader: React.FC<{ tools: Tool[]; x: number; y: number; w: number; until?: number }> = ({
  tools,
  x,
  y,
  w,
  until,
}) => {
  const frame = useCurrentFrame();
  const idx = tools.findLastIndex((t) => frame >= t.from);
  if (idx < 0) return null;
  const t = tools[idx];
  const exit = until !== undefined ? prog(frame, until, 8) : 0;
  if (exit >= 1) return null;
  const p = prog(frame, t.from, DUR);
  const prev = idx > 0 && p < 1 ? tools[idx - 1] : null;

  const Head: React.FC<{ tool: Tool; style: React.CSSProperties }> = ({ tool, style }) => (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, ...style }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", fontFamily: sans }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {tool.icon ? <Icon name={tool.icon} size={76} color={C.accent} weight={2.1} draw={prog(frame, tool.from, 14)} /> : null}
          <span style={{ fontWeight: 700, fontSize: 112, lineHeight: 1, letterSpacing: "-0.045em", color: C.ink }}>{tool.name}</span>
        </div>
        {tool.n !== undefined ? (
          <span style={{ fontWeight: 600, fontSize: 52, letterSpacing: "-0.02em", color: C.mute, fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color: C.accent }}>{tool.n}</span>/{tool.of}
          </span>
        ) : null}
      </div>
      {tool.repo ? (
        <div style={{ marginTop: 12, fontFamily: sans, fontWeight: 500, fontSize: 30, color: C.mute }}>{tool.repo}</div>
      ) : null}
    </div>
  );

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 200, opacity: 1 - exit }}>
      {prev ? <Head tool={prev} style={{ ...materialize(1 - p, 1, 8), translate: `${-p * TRAVEL}px 0px` }} /> : null}
      <Head
        tool={t}
        style={{ ...materialize(p, 1, 8), translate: `${(1 - p) * (idx === 0 ? 0 : TRAVEL)}px ${idx === 0 ? (1 - p) * 16 : 0}px` }}
      />
    </div>
  );
};
