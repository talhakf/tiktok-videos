import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { easeInOut, easeOut, materialize, mono, prog, TERM } from "../../theme";
import { DevCard, TAB_H } from "../dev/card";
import { lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type TuiPickerItem = {
  text: string;
  score?: string;
  sub?: string;
};

export type TuiPreview = {
  title: string;
  lines: string[];
};

/** Computes fuzzy subsequence match indices and a relevance rank score for `text` against `query`. */
const fuzzyScore = (text: string, q: string) => {
  const matched = new Set<number>();
  if (!q) return { isMatch: true, score: 0, matched };
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();

  // Prefer contiguous substring match first
  const subIdx = lower.indexOf(ql);
  if (subIdx >= 0) {
    for (let i = 0; i < ql.length; i++) matched.add(subIdx + i);
    // Bonus for matching later path segment (basename) or closer to start
    const slashIdx = lower.lastIndexOf("/");
    const inBasename = subIdx > slashIdx ? 200 : 0;
    return { isMatch: true, score: 1000 + inBasename - subIdx, matched };
  }

  // Otherwise greedy subsequence match
  let qi = 0;
  let gaps = 0;
  let lastIdx = -1;
  for (let i = 0; i < lower.length && qi < ql.length; i++) {
    if (lower[i] === ql[qi]) {
      matched.add(i);
      if (lastIdx >= 0) gaps += i - lastIdx - 1;
      lastIdx = i;
      qi++;
    }
  }
  if (qi < ql.length) return { isMatch: false, score: -1000, matched: new Set<number>() };
  return { isMatch: true, score: 500 - gaps * 10, matched };
};

const rankOrder = (items: TuiPickerItem[], q: string) => {
  const scored = items.map((item, origIdx) => {
    const res = fuzzyScore(item.text, q);
    return { origIdx, ...res };
  });
  scored.sort((a, b) => {
    if (a.isMatch !== b.isMatch) return a.isMatch ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    return a.origIdx - b.origIdx;
  });
  const rankByOrig = new Map<number, { rank: number; isMatch: boolean; matched: Set<number> }>();
  scored.forEach((s, rank) => {
    rankByOrig.set(s.origIdx, { rank, isMatch: s.isMatch, matched: s.matched });
  });
  return {
    rankByOrig,
    matchCount: scored.filter((s) => s.isMatch).length,
    topOrigIdx: scored[0]?.origIdx ?? 0,
  };
};

export const TuiPicker: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  title?: string;
  prompt?: string;
  query: string;
  typeAt: number;
  fpc?: number;
  items: TuiPickerItem[];
  preview?: TuiPreview;
}> = ({ x = TX, y, w = 900, h = 560, at, until, title = "fzf", prompt = "> ", query, typeAt, fpc = 4, items, preview }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const stepFpc = Math.max(1, fpc);
  const typedLen =
    frame < typeAt ? 0 : Math.min(query.length, Math.floor((frame - typeAt) / stepFpc) + 1);
  const prevLen = Math.max(0, typedLen - 1);

  const curQ = query.slice(0, typedLen);
  const prevQ = query.slice(0, prevLen);

  const curRank = rankOrder(items, curQ);
  const prevRank = rankOrder(items, prevQ);

  // Smoothly glide rows when a new character causes re-ranking
  const charStepStart = typeAt + (typedLen - 1) * stepFpc;
  const glideP = typedLen > 0 ? prog(frame, charStepStart, Math.min(8, stepFpc + 3), easeInOut) : 1;

  const bodyH = h - TAB_H;
  const pad = 24;
  const hasPreview = Boolean(preview);
  const leftW = hasPreview ? Math.round((w - pad * 3) * 0.54) : w - pad * 2;
  const rightW = hasPreview ? w - pad * 3 - leftW : 0;

  const inputH = 62;
  const listTop = pad + inputH + 16;
  const rowH = 56;
  const blinkOn = Math.floor(frame / 15) % 2 === 0;
  const typingActive = frame >= typeAt && typedLen < query.length;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark filename={title} icon="search" right={`${curRank.matchCount}/${items.length} matches`}>
      {/* Query input bar */}
      <div
        style={{
          position: "absolute",
          left: pad,
          top: pad,
          width: leftW,
          height: inputH,
          borderRadius: 14,
          background: "#262629",
          border: `2px solid ${tint(TERM.blue, 0.55)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          fontFamily: mono,
          fontSize: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", whiteSpace: "pre" }}>
          <span style={{ color: TERM.blue, fontWeight: 700 }}>{prompt}</span>
          <span style={{ color: TERM.fg, fontWeight: 700 }}>{curQ}</span>
          <span
            style={{
              display: "inline-block",
              width: 13,
              height: 26,
              marginLeft: 2,
              background: typingActive || blinkOn ? TERM.blue : "transparent",
              verticalAlign: "middle",
            }}
          />
        </div>
        <span style={{ fontSize: 18, color: TERM.dim, fontWeight: 500 }}>
          {curRank.matchCount}/{items.length}
        </span>
      </div>

      {/* Gliding top-match selection bar */}
      {items.length > 0 ? (
        <div
          style={{
            position: "absolute",
            left: pad,
            top: listTop,
            width: leftW,
            height: rowH - 6,
            borderRadius: 12,
            background: tint(TERM.blue, 0.18),
            borderLeft: `4px solid ${TERM.blue}`,
          }}
        />
      ) : null}

      {/* Fuzzy-ranked items list */}
      {items.map((item, origIdx) => {
        const curInfo = curRank.rankByOrig.get(origIdx)!;
        const prevInfo = prevRank.rankByOrig.get(origIdx)!;
        const visualRank = lerp(prevInfo.rank, curInfo.rank, glideP);
        const top = listTop + visualRank * rowH;
        if (top + rowH > bodyH - 12) return null;

        const isSelected = curInfo.rank === 0;
        const enterP = prog(frame, at + 4 + origIdx * 2, 9, easeOut);
        const matchOpacity = curInfo.isMatch ? 1 : 0.28;

        return (
          <div
            key={origIdx}
            style={{
              position: "absolute",
              left: pad,
              top,
              width: leftW,
              height: rowH - 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              fontFamily: mono,
              fontSize: 20,
              ...materialize(enterP),
              opacity: enterP * matchOpacity,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <span style={{ color: isSelected ? TERM.blue : "transparent", fontWeight: 700 }}>▸</span>
              {item.score ? (
                <span
                  style={{
                    padding: "2px 7px",
                    borderRadius: 6,
                    background: isSelected ? tint(TERM.green, 0.2) : "rgba(255,255,255,0.07)",
                    color: isSelected ? TERM.green : TERM.yellow,
                    fontSize: 15,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {item.score}
                </span>
              ) : null}
              <div
                style={{
                  whiteSpace: "pre",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {Array.from(item.text).map((ch, ci) => {
                  const hit = curInfo.matched.has(ci);
                  return (
                    <span
                      key={ci}
                      style={{
                        color: hit ? TERM.blue : isSelected ? TERM.fg : "#C7C7CC",
                        fontWeight: hit || isSelected ? 700 : 500,
                        background: hit ? tint(TERM.blue, 0.22) : undefined,
                        borderRadius: hit ? 4 : 0,
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </div>
            </div>

            {item.sub ? (
              <span
                style={{
                  color: TERM.dim,
                  fontSize: 16,
                  fontWeight: 500,
                  marginLeft: 12,
                  flexShrink: 0,
                }}
              >
                {item.sub}
              </span>
            ) : null}
          </div>
        );
      })}

      {/* Right-hand split preview pane */}
      {preview ? (
        <div
          style={{
            position: "absolute",
            right: pad,
            top: pad,
            width: rightW,
            height: bodyH - pad * 2,
            borderRadius: 16,
            background: "#161618",
            border: "1.5px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            ...materialize(prog(frame, at + 6, 10, easeOut)),
          }}
        >
          <div
            style={{
              height: 48,
              background: "#242427",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 16px",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 17,
              color: TERM.fg,
            }}
          >
            <Icon name="fileCode" size={20} color={TERM.blue} weight={2} />
            <span>{preview.title}</span>
          </div>

          <div
            style={{
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontFamily: mono,
              fontSize: 17,
              lineHeight: 1.42,
            }}
          >
            {preview.lines.map((line, li) => {
              const color = line.startsWith("+")
                ? TERM.green
                : line.startsWith("-")
                  ? TERM.red
                  : line.startsWith("@@") || line.startsWith("#")
                    ? TERM.cyan
                    : TERM.fg;
              const bg = line.startsWith("+")
                ? tint(TERM.green, 0.14)
                : line.startsWith("-")
                  ? tint(TERM.red, 0.14)
                  : "transparent";
              return (
                <div
                  key={li}
                  style={{
                    color,
                    background: bg,
                    padding: "2px 8px",
                    borderRadius: 6,
                    whiteSpace: "pre",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </DevCard>
  );
};
