import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER, DevCard, TAB_H, Tone, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";

export type GitFileStatus = "modified" | "staged" | "tracked" | "ignored" | "untracked";

export type GitFileMove = {
  at: number;
  toCol: 0 | 1 | 2;
  status?: GitFileStatus;
  keepCopyInOldCol?: boolean;
};

export type GitFileItem = {
  name: string;
  col: 0 | 1 | 2;
  status?: GitFileStatus;
  at?: number;
  moves?: GitFileMove[];
};

export type GitActionBanner = {
  at: number;
  cmd: string;
  desc: string;
  tone?: Tone;
};

const COLS: { title: string; sub: string; icon: IconName }[] = [
  { title: "Working tree", sub: "disk files", icon: "folder" },
  { title: "Staging index", sub: ".git/index", icon: "box" },
  { title: ".git repo", sub: "HEAD commits", icon: "commit" },
];

const statusLook = (status: GitFileStatus = "modified") => {
  switch (status) {
    case "staged":
      return { bg: "#EEFAF1", border: GREEN, fg: "#248A3D", tag: "staged" };
    case "tracked":
      return { bg: BLUE_TINT, border: C.accent, fg: C.accent, tag: "HEAD" };
    case "ignored":
      return { bg: "#F5F5F7", border: "rgba(0,0,0,0.22)", fg: C.mute, tag: "ignored", dashed: true };
    case "untracked":
      return { bg: "#FFF1F0", border: RED, fg: "#C9281E", tag: "untracked" };
    case "modified":
    default:
      return { bg: "rgba(255,159,10,0.14)", border: AMBER, fg: "#A05A00", tag: "modified" };
  }
};

export const GitAreas: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  files: GitFileItem[];
  actionBanner?: GitActionBanner[];
}> = ({ x = TX, y, w = 900, h = 520, at, until, files, actionBanner = [] }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const padX = 26;
  const gap = 16;
  const colW = (w - padX * 2 - gap * 2) / 3;
  const bodyH = h - TAB_H;
  const hasBanners = actionBanner.length > 0;
  const colTop = 22;
  const colH = bodyH - colTop - (hasBanners ? 102 : 26);

  // Active action banner
  const sortedBanners = [...actionBanner].sort((a, b) => a.at - b.at);
  let activeBanner: GitActionBanner | null = null;
  for (const b of sortedBanners) {
    if (b.at <= frame) activeBanner = b;
  }

  // Build renderable file tokens (including kept copies in old columns and moving tokens)
  type RenderCard = {
    key: string;
    name: string;
    rowIdx: number;
    colX: number;
    status: GitFileStatus;
    enterAt: number;
    ghost?: string;
  };

  const cards: RenderCard[] = [];

  files.forEach((f, fi) => {
    const fileAt = f.at ?? at + 6 + fi * 3;
    if (frame < fileAt) return;

    const moves = [...(f.moves ?? [])].sort((a, b) => a.at - b.at);
    let curCol = f.col;
    let prevCol = f.col;
    let curStatus: GitFileStatus = f.status ?? (f.col === 2 ? "tracked" : f.col === 1 ? "staged" : "modified");
    let moveStart: number | null = null;

    moves.forEach((m, mi) => {
      if (frame >= m.at) {
        if (m.keepCopyInOldCol) {
          cards.push({
            key: `${fi}-copy-${mi}`,
            name: f.name,
            rowIdx: fi,
            colX: padX + curCol * (colW + gap),
            status: curStatus,
            enterAt: fileAt,
          });
        } else if (curCol === 1 && m.toCol === 0 && m.status === "ignored") {
          // Leave a subtle "removed from index" ghost in Staging index when git rm --cached runs
          cards.push({
            key: `${fi}-ghost-${mi}`,
            name: f.name,
            rowIdx: fi,
            colX: padX + 1 * (colW + gap),
            status: "ignored",
            enterAt: m.at,
            ghost: "untracked",
          });
        }
        prevCol = curCol;
        curCol = m.toCol;
        if (m.status) curStatus = m.status;
        moveStart = m.at;
      }
    });

    const moveP = moveStart !== null ? prog(frame, moveStart, 14, easeInOut) : 1;
    const colX = lerp(padX + prevCol * (colW + gap), padX + curCol * (colW + gap), moveP);

    cards.push({
      key: `${fi}-main`,
      name: f.name,
      rowIdx: fi,
      colX,
      status: curStatus,
      enterAt: fileAt,
    });
  });

  const bannerTone = toneColors(activeBanner?.tone ?? "accent");

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename="git areas — tree · index · repo" icon="branch" right=".git internals">
      {/* Three column lanes */}
      {COLS.map((c, ci) => {
        const left = padX + ci * (colW + gap);
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left,
              top: colTop,
              width: colW,
              height: colH,
              borderRadius: 20,
              background: "#F5F5F7",
              border: `1.5px solid ${C.line}`,
              overflow: "hidden",
              ...materialize(prog(frame, at + 2 + ci * 2, 10, easeOut)),
            }}
          >
            {/* Column header */}
            <div
              style={{
                height: 66,
                background: C.white,
                borderBottom: `1px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name={c.icon} size={24} color={C.ink} weight={2} />
                <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, color: C.ink, letterSpacing: "-0.01em" }}>
                  {c.title}
                </span>
              </div>
              <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 15, color: C.mute }}>{c.sub}</span>
            </div>
          </div>
        );
      })}

      {/* File cards rendered above columns so they can glide smoothly across column borders */}
      {cards.map((card) => {
        const look = statusLook(card.status);
        const cardP = prog(frame, card.enterAt, 10, easeOut);
        const rowTop = colTop + 82 + card.rowIdx * 74;
        const isGhost = Boolean(card.ghost);

        return (
          <div
            key={card.key}
            style={{
              position: "absolute",
              left: card.colX + 14,
              top: rowTop,
              width: colW - 28,
              height: 60,
              borderRadius: 14,
              background: isGhost ? "rgba(255,255,255,0.55)" : look.bg,
              border: `${isGhost ? 1.5 : 2}px ${look.dashed || isGhost ? "dashed" : "solid"} ${look.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              boxShadow: isGhost ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
              ...materialize(cardP),
              opacity: cardP * (isGhost ? 0.55 : 1),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <Icon
                name={isGhost ? "cross" : "fileCode"}
                size={20}
                color={look.fg}
                weight={2}
              />
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 18,
                  color: isGhost ? C.mute : C.ink,
                  textDecoration: isGhost ? "line-through" : "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {card.name}
              </span>
            </div>

            <span
              style={{
                padding: "3px 8px",
                borderRadius: 8,
                background: C.white,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 13,
                color: look.fg,
                flexShrink: 0,
              }}
            >
              {card.ghost ?? look.tag}
            </span>
          </div>
        );
      })}

      {/* Bottom command & explanation banner */}
      {activeBanner ? (
        <div
          style={{
            position: "absolute",
            left: padX,
            right: padX,
            bottom: 18,
            height: 66,
            borderRadius: 16,
            background: bannerTone.bg,
            border: `2px solid ${bannerTone.edge}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            ...materialize(prog(frame, activeBanner.at, 9, easeOut)),
          }}
        >
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              background: TERM.bg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 19,
              color: TERM.fg,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: TERM.green }}>$ </span>
            {activeBanner.cmd}
          </div>

          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 20,
              color: bannerTone.fg,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginLeft: 16,
            }}
          >
            {activeBanner.desc}
          </div>
        </div>
      ) : null}
    </DevCard>
  );
};
