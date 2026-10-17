import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, materialize, prog, sans } from "../../theme";
import { MacWindow, NavChevrons } from "./MacWindow";

// A Finder window: optional sidebar and an icon grid of folders and files that stagger in.

/** Filled macOS-style folder (light blue body, darker back tab). `size` = width in px. */
export const FolderGlyph: React.FC<{ size?: number }> = ({ size = 110 }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80" style={{ display: "block" }}>
    <path d="M4 12a6 6 0 0 1 6-6h24a6 6 0 0 1 4.3 1.8L43 13h47a6 6 0 0 1 6 6v8H4z" fill="#6AB0F7" />
    <rect x={4} y={20} width={92} height={56} rx={6} fill="#8CC4FF" />
    <rect x={4} y={20} width={92} height={3} rx={1.5} fill="#A6D2FF" />
  </svg>
);

/** White document with a folded corner and a few grey text lines. `size` = height in px. */
export const FileGlyph: React.FC<{ size?: number; ext?: string }> = ({ size = 110, ext }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 80 100" style={{ display: "block" }}>
    <path d="M10 3h40l22 22v68a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" fill="#FFFFFF" stroke="#C7C7CC" strokeWidth={2} strokeLinejoin="round" />
    <path d="M50 3v18a4 4 0 0 0 4 4h18" fill="#EDEDF0" stroke="#C7C7CC" strokeWidth={2} strokeLinejoin="round" />
    {ext ? (
      <text x={39} y={72} textAnchor="middle" fontFamily={sans} fontWeight={700} fontSize={15} fill={C.mute}>
        {ext}
      </text>
    ) : (
      [38, 48, 58, 68].map((ly, i) => <rect key={ly} x={18} y={ly} width={i === 3 ? 26 : 44} height={4} rx={2} fill="#D8D8DC" />)
    )}
  </svg>
);

export type FinderItem = { name: string; kind: "folder" | "file"; at?: number; ext?: string };

/**
 * Finder window. `items` stagger in after the window (40 ms apart) unless an item has its own `at`.
 * `select`: at each `at`, that item becomes the selection (grey tile behind the icon, blue label like
 * Finder). `sidebar`: true for the default favourites or a list of names; `sidebarActive` highlights one.
 */
export const FinderWindow: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  at?: number;
  until?: number;
  items: FinderItem[];
  select?: { name: string; at: number }[];
  sidebar?: boolean | string[];
  sidebarActive?: string;
  iconSize?: number;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, title = "Downloads", at = 0, until, items, select = [], sidebar, sidebarActive, iconSize = 110, style }) => {
  const frame = useCurrentFrame();
  const side = sidebar === true ? ["Recents", "Applications", "Desktop", "Documents", "Downloads"] : sidebar || [];
  const sideW = side.length ? 250 : 0;
  const cellW = iconSize * 1.6;
  const cols = Math.max(1, Math.floor((w - sideW - 40) / cellW));
  const sel = select.filter((s) => frame >= s.at).pop();
  const selP = sel ? prog(frame, sel.at, 4) : 0;

  const toolbar = (
    <>
      <NavChevrons />
      <div style={{ flex: 1, fontFamily: sans, fontWeight: 700, fontSize: 26, letterSpacing: "-0.015em", color: C.ink }}>{title}</div>
      <Icon name="search" size={28} color={C.mute} weight={2} />
    </>
  );

  return (
    <MacWindow x={x} y={y} w={w} h={h} at={at} until={until} toolbar={toolbar} style={style} bodyStyle={{ display: "flex" }}>
      {side.length ? (
        <div style={{ width: sideW, flexShrink: 0, background: "#F2F2F4", borderRight: `1px solid ${C.line}`, padding: "22px 14px", fontFamily: sans }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: C.mute, padding: "0 12px 10px" }}>Favorites</div>
          {side.map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 48,
                padding: "0 12px",
                borderRadius: 10,
                background: s === (sidebarActive ?? title) ? "rgba(0,0,0,0.07)" : undefined,
                fontSize: 22,
                fontWeight: 500,
                color: C.ink,
              }}
            >
              <Icon name="folder" size={26} color={C.accent} weight={2} />
              {s}
            </div>
          ))}
        </div>
      ) : null}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cellW}px)`,
          justifyContent: "space-evenly",
          alignContent: "start",
          rowGap: 26,
          padding: "30px 20px",
          fontFamily: sans,
        }}
      >
        {items.map((it, i) => {
          const t = it.at ?? at + 6 + i * 1.2;
          const p = frame < t ? 0 : prog(frame, t, 8);
          const on = sel?.name === it.name ? selP : 0;
          return (
            <div key={it.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, ...materialize(p) }}>
              <div
                style={{
                  width: iconSize + 24,
                  height: iconSize + 16,
                  borderRadius: 14,
                  background: `rgba(0,0,0,${0.07 * on})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {it.kind === "folder" ? <FolderGlyph size={iconSize} /> : <FileGlyph size={iconSize * 0.95} ext={it.ext} />}
              </div>
              <div
                style={{
                  maxWidth: cellW - 8,
                  padding: "2px 10px",
                  borderRadius: 8,
                  background: on ? interpolateColors(on, [0, 1], ["rgba(0,113,227,0)", C.accent]) : undefined,
                  color: interpolateColors(on, [0, 1], [C.ink, C.white]),
                  fontSize: 21,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  textAlign: "center",
                  overflowWrap: "anywhere",
                }}
              >
                {it.name}
              </div>
            </div>
          );
        })}
      </div>
    </MacWindow>
  );
};
