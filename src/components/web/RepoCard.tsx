import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type RepoItem = {
  label: string;
  sub?: string;
  badge?: string;
  at?: number;
};

export type RepoCardProps = {
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  owner: string;
  name: string;
  desc: string;
  stars: number | string;
  lang?: { name: string; color?: string };
  license?: string;
  topics?: string[];
  items?: RepoItem[];
};

const formatStarCount = (n: number): string => {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 100 || Number.isInteger(k) ? `${Math.round(k)}K` : `${k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(Math.round(n));
};

/**
 * Unbranded GitHub-style repository card with animated star counter, topic pills,
 * optional curriculum/folder items, and language/license footer.
 */
export const RepoCard: React.FC<RepoCardProps> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  owner,
  name,
  desc,
  stars,
  lang,
  license,
  topics = [],
  items = [],
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const starP = prog(frame, at + 3, 20, easeOut);
  const starText = typeof stars === "number" ? formatStarCount(lerp(0, stars, starP)) : stars;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        borderRadius: 28,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        padding: "32px 36px",
        fontFamily: sans,
        display: "flex",
        flexDirection: "column",
        gap: 22,
        ...materialize(vis),
      }}
    >
      {/* Repo header: icon + owner/name + star pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Icon name="bookmark" size={34} color={C.accent} draw={prog(frame, at + 2, 12)} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 10, overflow: "hidden" }}>
          <span style={{ fontSize: 32, fontWeight: 500, color: C.mute, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
            {owner} /
          </span>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: C.accent,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 20px",
            borderRadius: 999,
            background: "rgba(255,159,10,0.12)",
            border: `1px solid ${tint(AMBER, 0.35)}`,
            flexShrink: 0,
          }}
        >
          <Icon name="star" size={26} color={AMBER} />
          <span style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: C.ink }}>{starText}</span>
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 29, fontWeight: 500, color: C.ink, lineHeight: 1.35, letterSpacing: "-0.01em" }}>
        {desc}
      </div>

      {/* Topic pills */}
      {topics.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {topics.map((t, i) => {
            const tp = prog(frame, at + 6 + i * 2, 9, easeOut);
            return (
              <div
                key={t}
                style={{
                  padding: "6px 18px",
                  borderRadius: 999,
                  background: BLUE_TINT,
                  color: C.accent,
                  fontFamily: mono,
                  fontSize: 22,
                  fontWeight: 600,
                  opacity: tp,
                }}
              >
                {t}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Optional preview items (folders, curriculum modules, tools) */}
      {items.length > 0 ? (
        <div
          style={{
            borderRadius: 20,
            border: `1px solid ${C.line}`,
            background: C.paper,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {items.map((item, i) => {
            const itemAt = item.at ?? at + 8 + i * 4;
            const ip = prog(frame, itemAt, 9, easeOut);
            if (ip <= 0) return null;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 24px",
                  borderTop: i > 0 ? `1px solid ${C.line}` : undefined,
                  ...materialize(ip, 0.98, 4),
                }}
              >
                <Icon name="folder" size={26} color={C.accent} />
                <span style={{ fontFamily: mono, fontSize: 25, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>
                  {item.label}
                </span>
                {item.sub ? (
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 500,
                      color: C.mute,
                      flex: 1,
                      minWidth: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.sub}
                  </span>
                ) : (
                  <span style={{ flex: 1 }} />
                )}
                {item.badge ? (
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 21,
                      fontWeight: 600,
                      padding: "4px 14px",
                      borderRadius: 999,
                      background: tint(C.accent, 0.12),
                      color: C.accent,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Footer metadata */}
      {lang || license ? (
        <div style={{ display: "flex", alignItems: "center", gap: 28, paddingTop: 2 }}>
          {lang ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: lang.color ?? C.accent,
                }}
              />
              <span style={{ fontSize: 24, fontWeight: 600, color: C.mute }}>{lang.name}</span>
            </div>
          ) : null}
          {license ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="shieldCheck" size={24} color={C.mute} />
              <span style={{ fontSize: 24, fontWeight: 500, color: C.mute }}>{license}</span>
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <Icon name="branch" size={24} color={C.mute} />
            <span style={{ fontFamily: mono, fontSize: 23, fontWeight: 500, color: C.mute }}>main</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export type RepoSummary = {
  owner: string;
  name: string;
  desc: string;
  stars: string;
  at?: number;
  highlight?: boolean;
};

export type RepoListProps = {
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  repos: RepoSummary[];
};

/**
 * Compact stacked list of multiple repositories for summary/comparison beats.
 */
export const RepoList: React.FC<RepoListProps> = ({ x = TX, y, w = 900, at, until, repos }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {repos.map((r, i) => {
        const rowAt = r.at ?? at + i * 5;
        const rp = prog(frame, rowAt, 10, easeOut);
        if (rp <= 0) return null;
        return (
          <div
            key={`${r.owner}/${r.name}`}
            style={{
              borderRadius: 24,
              background: r.highlight ? BLUE_TINT : C.white,
              border: `2px solid ${r.highlight ? C.accent : C.line}`,
              boxShadow: CARD_SHADOW,
              padding: "22px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              ...materialize(rp, 0.97, 5),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Icon name="bookmark" size={28} color={r.highlight ? C.accent : C.mute} />
              <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 27, fontWeight: 500, color: C.mute }}>{r.owner} /</span>
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: r.highlight ? C.accent : C.ink,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {r.name}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 16px",
                  borderRadius: 999,
                  background: "rgba(255,159,10,0.12)",
                }}
              >
                <Icon name="star" size={22} color={AMBER} />
                <span style={{ fontFamily: mono, fontSize: 23, fontWeight: 700, color: C.ink }}>{r.stars}</span>
              </div>
            </div>
            <div style={{ fontSize: 25, fontWeight: 500, color: C.mute, paddingLeft: 42 }}>{r.desc}</div>
          </div>
        );
      })}
    </div>
  );
};
