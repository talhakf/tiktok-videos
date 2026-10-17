import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { alpha, BLUE_TINT, GREEN, lerp, presence, Pt } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { appleSpring, C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { tint } from "../windows/MacWindow";

export type RebaseVsMergeProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  /** Frame when merge commit M appears (top) and feature commits F1, F2 lift & replay onto main (bottom). */
  actionAt?: number;
  mode?: "compare" | "merge" | "rebase";
  filename?: string;
  right?: string;
  dark?: boolean;
  style?: React.CSSProperties;
};

type CommitDef = {
  id: string;
  hash: string;
  rebasedHash?: string;
  col: number;
  lane: 0 | 1;
  rebasedCol?: number;
  rebasedLane?: 0 | 1;
  enterOffset: number;
};

const BASE_COMMITS: CommitDef[] = [
  { id: "C1", hash: "a1b2c3", col: 0, lane: 0, enterOffset: 4 },
  { id: "C2", hash: "d4e5f6", col: 1, lane: 0, enterOffset: 8 },
  { id: "C3", hash: "9f8e7d", col: 2, lane: 0, enterOffset: 12 },
  { id: "F1", hash: "3c4d5e", rebasedHash: "b8c9d0", col: 2, lane: 1, rebasedCol: 3, rebasedLane: 0, enterOffset: 15 },
  { id: "F2", hash: "7a8b9c", rebasedHash: "f1e2d3", col: 3, lane: 1, rebasedCol: 4, rebasedLane: 0, enterOffset: 19 },
];

const edgePath = (a: Pt, b: Pt) => {
  const dx = b.x - a.x;
  if (Math.abs(a.y - b.y) < 1) return `M${a.x} ${a.y} L${b.x} ${b.y}`;
  return `M${a.x} ${a.y} C${a.x + dx * 0.55} ${a.y} ${b.x - dx * 0.55} ${b.y} ${b.x} ${b.y}`;
};

/**
 * Side-by-side / stacked Git commit graph comparing `git merge main` (preserving the diverged
 * feature branch diamond + creating a 2-parent merge commit `M`) vs `git rebase main`
 * (lifting feature commits `F1, F2` and replaying them linearly as `F1', F2'` on top of `main` at `actionAt`).
 */
export const RebaseVsMerge: React.FC<RebaseVsMergeProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h,
  at,
  until,
  actionAt,
  mode = "compare",
  filename = "git-history.graph",
  right = "merge vs rebase",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const actAt = actionAt ?? at + 36;
  const single = mode !== "compare";
  const cardH = h ?? (single ? 420 : 720);
  const bodyH = cardH - (filename !== undefined ? TAB_H : 0);
  const paneH = single ? bodyH : bodyH / 2;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const mainColor = dark ? TERM.fg : C.ink;
  const featColor = dark ? TERM.blue : C.accent;
  const mergeColor = "#FF9F0A";
  const goodTone = toneColors("good", dark);
  const warnTone = toneColors("warn", dark);
  const accentTone = toneColors("accent", dark);

  const x0 = 118;
  const colGap = (w - x0 * 2) / 4; // 5 columns: 0, 1, 2, 3, 4
  const dotR = 20;

  const renderMergePane = (topOffset: number, height: number) => {
    const lane0Y = topOffset + height * 0.46;
    const lane1Y = topOffset + height * 0.77;
    const mergeP = prog(frame, actAt, 16, easeInOut);
    const mSpring = frame >= actAt ? appleSpring(frame - actAt, fps, { response: 0.38 }) : 0;

    const posOf = (col: number, lane: number): Pt => ({
      x: x0 + col * colGap,
      y: lane === 0 ? lane0Y : lane1Y,
    });

    const c1 = posOf(0, 0);
    const c2 = posOf(1, 0);
    const c3 = posOf(2, 0);
    const f1 = posOf(2, 1);
    const f2 = posOf(3, 1);
    const mPos = posOf(4, 0);

    const headX = lerp(f2.x, mPos.x, mergeP);
    const headY = lerp(f2.y, mPos.y, mergeP);

    const baseEdges = [
      { key: "c1-c2", a: c1, b: c2, color: mainColor, enterAt: at + 8 },
      { key: "c2-c3", a: c2, b: c3, color: mainColor, enterAt: at + 12 },
      { key: "c2-f1", a: c2, b: f1, color: featColor, enterAt: at + 15 },
      { key: "f1-f2", a: f1, b: f2, color: featColor, enterAt: at + 19 },
    ];

    return (
      <div style={{ position: "absolute", left: 0, top: topOffset, width: w, height, overflow: "hidden" }}>
        {/* Pane header */}
        <div
          style={{
            position: "absolute",
            left: 32,
            right: 32,
            top: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 18px",
                borderRadius: 12,
                background: dark ? TERM.bar : "#F2F2F4",
                border: `1px solid ${C.line}`,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 22,
                color: fg,
              }}
            >
              <Icon name="merge" size={24} color={featColor} weight={2.2} />
              <span>$ git merge main</span>
            </div>
            <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 21, color: mute }}>
              preserves branch diamond
            </span>
          </div>

          <div
            style={{
              padding: "6px 16px",
              borderRadius: 999,
              background: mergeP > 0.1 ? warnTone.bg : accentTone.bg,
              border: `1.5px solid ${mergeP > 0.1 ? warnTone.edge : accentTone.edge}`,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 19,
              color: mergeP > 0.1 ? warnTone.fg : accentTone.fg,
            }}
          >
            {mergeP > 0.2 ? "non-linear · merge commit M" : "diverged history"}
          </div>
        </div>

        {/* SVG edges + nodes */}
        <svg width={w} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {baseEdges.map((e) => {
            const dP = prog(frame, e.enterAt, 10, easeInOut);
            if (dP <= 0) return null;
            return (
              <path
                key={e.key}
                d={edgePath(e.a, e.b)}
                fill="none"
                stroke={e.color}
                strokeWidth={5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - dP}
              />
            );
          })}

          {/* Merge commit edges C3 -> M and F2 -> M */}
          {mergeP > 0 ? (
            <>
              <path
                d={edgePath(c3, mPos)}
                fill="none"
                stroke={mainColor}
                strokeWidth={5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - mergeP}
              />
              <path
                d={edgePath(f2, mPos)}
                fill="none"
                stroke={featColor}
                strokeWidth={5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - mergeP}
              />
            </>
          ) : null}

          {/* Base commit circles */}
          {BASE_COMMITS.map((c) => {
            const t = frame - (at + c.enterOffset);
            if (t < 0) return null;
            const sp = appleSpring(t, fps, { response: 0.35 });
            const pt = posOf(c.col, c.lane);
            const col = c.lane === 0 ? mainColor : featColor;
            return (
              <g key={c.id}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={dotR * (0.55 + 0.45 * sp)}
                  fill={dark ? TERM.bg : C.white}
                  stroke={col}
                  strokeWidth={5.5}
                />
                <text
                  x={pt.x}
                  y={pt.y + 6}
                  textAnchor="middle"
                  fill={col}
                  style={{ fontFamily: mono, fontWeight: 700, fontSize: 16 }}
                  opacity={prog(frame, at + c.enterOffset + 2, 8)}
                >
                  {c.id}
                </text>
              </g>
            );
          })}

          {/* Merge commit node M */}
          {frame >= actAt ? (
            <g>
              <circle
                cx={mPos.x}
                cy={mPos.y}
                r={(dotR + 6) * mSpring}
                fill={tint(mergeColor, 0.14)}
              />
              <circle
                cx={mPos.x}
                cy={mPos.y}
                r={dotR * (0.55 + 0.45 * mSpring)}
                fill={dark ? TERM.bg : C.white}
                stroke={mergeColor}
                strokeWidth={5.5}
              />
              <text
                x={mPos.x}
                y={mPos.y + 6}
                textAnchor="middle"
                fill={mergeColor}
                style={{ fontFamily: mono, fontWeight: 700, fontSize: 16 }}
              >
                M
              </text>
            </g>
          ) : null}
        </svg>

        {/* Commit hashes below dots */}
        {BASE_COMMITS.map((c) => {
          const hp = prog(frame, at + c.enterOffset + 4, 8);
          if (hp <= 0) return null;
          const pt = posOf(c.col, c.lane);
          return (
            <div
              key={c.id}
              style={{
                position: "absolute",
                left: pt.x,
                top: pt.y + dotR + 8,
                translate: "-50% 0",
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 18,
                color: mute,
                opacity: hp,
              }}
            >
              {c.hash}
            </div>
          );
        })}

        {mergeP > 0 ? (
          <div
            style={{
              position: "absolute",
              left: mPos.x,
              top: mPos.y + dotR + 8,
              translate: "-50% 0",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 18,
              color: mergeColor,
              ...materialize(mergeP),
            }}
          >
            e9f0a1
          </div>
        ) : null}

        {/* Branch pill: main on C3 */}
        <div
          style={{
            position: "absolute",
            left: c3.x,
            top: c3.y - dotR - 46,
            translate: "-50% 0",
            height: 36,
            padding: "0 14px",
            borderRadius: 18,
            background: dark ? TERM.bar : C.white,
            border: `2px solid ${mainColor}`,
            display: "flex",
            alignItems: "center",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: mainColor,
            ...materialize(prog(frame, at + 14, 8)),
          }}
        >
          main
        </div>

        {/* Branch pill: feat/auth gliding from F2 -> M */}
        <div
          style={{
            position: "absolute",
            left: headX,
            top: headY - dotR - 46,
            translate: "-50% 0",
            height: 36,
            padding: "0 14px",
            borderRadius: 18,
            background: C.accent,
            border: `2px solid ${C.accent}`,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: C.white,
            boxShadow: "0 4px 10px rgba(0,113,227,0.22)",
            ...materialize(prog(frame, at + 20, 8)),
          }}
        >
          <span>HEAD → feat</span>
        </div>
      </div>
    );
  };

  const renderRebasePane = (topOffset: number, height: number) => {
    const lane0Y = topOffset + height * 0.46;
    const lane1Y = topOffset + height * 0.77;

    const posOf = (col: number, lane: number): Pt => ({
      x: x0 + col * colGap,
      y: lane === 0 ? lane0Y : lane1Y,
    });

    const c1 = posOf(0, 0);
    const c2 = posOf(1, 0);
    const c3 = posOf(2, 0);
    const f1Orig = posOf(2, 1);
    const f2Orig = posOf(3, 1);
    const f1Target = posOf(3, 0);
    const f2Target = posOf(4, 0);

    // F1 lifts and glides at actAt, F2 lifts and glides at actAt + 6
    const pF1 = prog(frame, actAt, 18, easeInOut);
    const pF2 = prog(frame, actAt + 6, 18, easeInOut);

    // Slight upward arc during lift
    const liftArc = (t: number) => Math.sin(t * Math.PI) * -22;

    const f1Live: Pt = {
      x: lerp(f1Orig.x, f1Target.x, pF1),
      y: lerp(f1Orig.y, f1Target.y, pF1) + liftArc(pF1),
    };
    const f2Live: Pt = {
      x: lerp(f2Orig.x, f2Target.x, pF2),
      y: lerp(f2Orig.y, f2Target.y, pF2) + liftArc(pF2),
    };

    const f1Parent: Pt = {
      x: lerp(c2.x, c3.x, pF1),
      y: lerp(c2.y, c3.y, pF1),
    };

    const f1Color = interpolateColors(pF1, [0, 1], [featColor, GREEN]);
    const f2Color = interpolateColors(pF2, [0, 1], [featColor, GREEN]);

    return (
      <div style={{ position: "absolute", left: 0, top: topOffset, width: w, height, overflow: "hidden" }}>
        {/* Pane header */}
        <div
          style={{
            position: "absolute",
            left: 32,
            right: 32,
            top: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 18px",
                borderRadius: 12,
                background: dark ? TERM.bar : "#F2F2F4",
                border: `1px solid ${C.line}`,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 22,
                color: fg,
              }}
            >
              <Icon name="branch" size={24} color={GREEN} weight={2.2} />
              <span>$ git rebase main</span>
            </div>
            <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 21, color: mute }}>
              replays F1&apos;, F2&apos; atop main
            </span>
          </div>

          <div
            style={{
              padding: "6px 16px",
              borderRadius: 999,
              background: pF2 > 0.2 ? goodTone.bg : accentTone.bg,
              border: `1.5px solid ${pF2 > 0.2 ? goodTone.edge : accentTone.edge}`,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 19,
              color: pF2 > 0.2 ? goodTone.fg : accentTone.fg,
            }}
          >
            {pF2 > 0.2 ? "linear history · F1', F2'" : "2 commits to replay"}
          </div>
        </div>

        {/* SVG edges + nodes */}
        <svg width={w} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* Main branch edges */}
          {[
            { key: "r-c1-c2", a: c1, b: c2, enterAt: at + 8 },
            { key: "r-c2-c3", a: c2, b: c3, enterAt: at + 12 },
          ].map((e) => {
            const dP = prog(frame, e.enterAt, 10, easeInOut);
            if (dP <= 0) return null;
            return (
              <path
                key={e.key}
                d={edgePath(e.a, e.b)}
                fill="none"
                stroke={mainColor}
                strokeWidth={5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - dP}
              />
            );
          })}

          {/* Ghost original feature branch left behind when rebasing */}
          {pF1 > 0.05 ? (
            <g opacity={0.26 * pF1}>
              <path d={edgePath(c2, f1Orig)} fill="none" stroke={mute} strokeWidth={3.5} strokeDasharray="7 7" />
              <path d={edgePath(f1Orig, f2Orig)} fill="none" stroke={mute} strokeWidth={3.5} strokeDasharray="7 7" />
              <circle cx={f1Orig.x} cy={f1Orig.y} r={dotR - 2} fill="none" stroke={mute} strokeWidth={3.5} strokeDasharray="6 5" />
              <circle cx={f2Orig.x} cy={f2Orig.y} r={dotR - 2} fill="none" stroke={mute} strokeWidth={3.5} strokeDasharray="6 5" />
            </g>
          ) : null}

          {/* Moving feature edges */}
          {prog(frame, at + 15, 10) > 0 ? (
            <path
              d={edgePath(f1Parent, f1Live)}
              fill="none"
              stroke={f1Color}
              strokeWidth={5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - prog(frame, at + 15, 10)}
            />
          ) : null}
          {prog(frame, at + 19, 10) > 0 ? (
            <path
              d={edgePath(f1Live, f2Live)}
              fill="none"
              stroke={f2Color}
              strokeWidth={5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - prog(frame, at + 19, 10)}
            />
          ) : null}

          {/* Main commits C1, C2, C3 */}
          {BASE_COMMITS.slice(0, 3).map((c) => {
            const t = frame - (at + c.enterOffset);
            if (t < 0) return null;
            const sp = appleSpring(t, fps, { response: 0.35 });
            const pt = posOf(c.col, c.lane);
            return (
              <g key={c.id}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={dotR * (0.55 + 0.45 * sp)}
                  fill={dark ? TERM.bg : C.white}
                  stroke={mainColor}
                  strokeWidth={5.5}
                />
                <text
                  x={pt.x}
                  y={pt.y + 6}
                  textAnchor="middle"
                  fill={mainColor}
                  style={{ fontFamily: mono, fontWeight: 700, fontSize: 16 }}
                >
                  {c.id}
                </text>
              </g>
            );
          })}

          {/* Gliding F1 -> F1' and F2 -> F2' */}
          {[
            { def: BASE_COMMITS[3], pos: f1Live, p: pF1, color: f1Color, label: pF1 > 0.5 ? "F1'" : "F1" },
            { def: BASE_COMMITS[4], pos: f2Live, p: pF2, color: f2Color, label: pF2 > 0.5 ? "F2'" : "F2" },
          ].map(({ def, pos, p: moveP, color, label }) => {
            const t = frame - (at + def.enterOffset);
            if (t < 0) return null;
            const sp = appleSpring(t, fps, { response: 0.35 });
            return (
              <g key={def.id}>
                {moveP > 0.1 ? (
                  <circle cx={pos.x} cy={pos.y} r={dotR + 6} fill={alpha(GREEN, 0.14 * moveP)} />
                ) : null}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={dotR * (0.55 + 0.45 * sp)}
                  fill={dark ? TERM.bg : C.white}
                  stroke={color}
                  strokeWidth={5.5}
                />
                <text
                  x={pos.x}
                  y={pos.y + 6}
                  textAnchor="middle"
                  fill={color}
                  style={{ fontFamily: mono, fontWeight: 700, fontSize: 15 }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Main commit hashes */}
        {BASE_COMMITS.slice(0, 3).map((c) => {
          const hp = prog(frame, at + c.enterOffset + 4, 8);
          if (hp <= 0) return null;
          const pt = posOf(c.col, c.lane);
          return (
            <div
              key={c.id}
              style={{
                position: "absolute",
                left: pt.x,
                top: pt.y + dotR + 8,
                translate: "-50% 0",
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 18,
                color: mute,
                opacity: hp,
              }}
            >
              {c.hash}
            </div>
          );
        })}

        {/* Gliding F1/F2 hashes */}
        {[
          { def: BASE_COMMITS[3], pos: f1Live, moveP: pF1, color: f1Color },
          { def: BASE_COMMITS[4], pos: f2Live, moveP: pF2, color: f2Color },
        ].map(({ def, pos, moveP, color }) => {
          const hp = prog(frame, at + def.enterOffset + 4, 8);
          if (hp <= 0) return null;
          return (
            <div
              key={def.id}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y + dotR + 8,
                translate: "-50% 0",
                fontFamily: mono,
                fontWeight: moveP > 0.5 ? 700 : 500,
                fontSize: 18,
                color: moveP > 0.5 ? color : mute,
                opacity: hp,
              }}
            >
              {moveP > 0.5 ? def.rebasedHash : def.hash}
            </div>
          );
        })}

        {/* Orphaned label under ghost branch */}
        {pF1 > 0.25 ? (
          <div
            style={{
              position: "absolute",
              left: (f1Orig.x + f2Orig.x) / 2,
              top: lane1Y + dotR + 6,
              translate: "-50% 0",
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 17,
              color: mute,
              opacity: 0.65 * pF1,
            }}
          >
            old commits replaced
          </div>
        ) : null}

        {/* Branch pill: main on C3 */}
        <div
          style={{
            position: "absolute",
            left: c3.x,
            top: c3.y - dotR - 46,
            translate: "-50% 0",
            height: 36,
            padding: "0 14px",
            borderRadius: 18,
            background: dark ? TERM.bar : C.white,
            border: `2px solid ${mainColor}`,
            display: "flex",
            alignItems: "center",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: mainColor,
            ...materialize(prog(frame, at + 14, 8)),
          }}
        >
          main
        </div>

        {/* Branch pill: HEAD -> feat gliding with F2' */}
        <div
          style={{
            position: "absolute",
            left: f2Live.x,
            top: f2Live.y - dotR - 46,
            translate: "-50% 0",
            height: 36,
            padding: "0 14px",
            borderRadius: 18,
            background: pF2 > 0.5 ? GREEN : BLUE_TINT,
            border: `2px solid ${pF2 > 0.5 ? GREEN : C.accent}`,
            display: "flex",
            alignItems: "center",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: pF2 > 0.5 ? C.white : C.accent,
            ...materialize(prog(frame, at + 20, 8)),
          }}
        >
          HEAD → feat
        </div>
      </div>
    );
  };

  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} dark={dark} filename={filename} icon="branch" right={right} style={style}>
      {mode === "merge" ? (
        renderMergePane(0, bodyH)
      ) : mode === "rebase" ? (
        renderRebasePane(0, bodyH)
      ) : (
        <>
          {renderMergePane(0, paneH)}
          <div
            style={{
              position: "absolute",
              left: 28,
              right: 28,
              top: paneH,
              height: 1,
              background: C.line,
            }}
          />
          {renderRebasePane(paneH, paneH)}
        </>
      )}
    </DevCard>
  );
};
