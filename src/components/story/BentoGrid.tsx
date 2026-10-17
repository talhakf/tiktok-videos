import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { BLUE_TINT, CARD_SHADOW } from "../diagram/Node";
import { outP } from "../layouts/Mark";
import { tint } from "../windows/MacWindow";

// 2x2 or 2-column Apple-style Bento summary board for high-save summary beats and covers.
// Each cell supports `span?: 1 | 2`, `highlight?: boolean`, `stat?: string`, `icon?: IconName`,
// `title: string`, `sub?: string`, and `code?: string`.

export type BentoCell = {
  title: string;
  sub?: string;
  code?: string;
  stat?: string;
  icon?: IconName;
  span?: 1 | 2;
  highlight?: boolean;
  dark?: boolean;
  at?: number;
};

export const BentoGrid: React.FC<{
  at?: number;
  until?: number;
  cells: BentoCell[];
  x?: number;
  y?: number;
  w?: number;
  gap?: number;
  rowH?: number;
}> = ({ at = 0, until, cells, x = TX, y = TY, w = TW, gap = 22, rowH = 260 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridAutoRows: `${rowH}px`,
        gap,
        fontFamily: sans,
        opacity: 1 - out,
      }}
    >
      {cells.map((cell, i) => {
        const cellAt = cell.at ?? at + i * 3;
        if (frame < cellAt) return <div key={i} style={{ gridColumn: cell.span === 2 ? "span 2" : "span 1" }} />;
        const p = prog(frame, cellAt, 10);
        const isDark = Boolean(cell.dark);
        const isHl = Boolean(cell.highlight);

        const bg = isDark ? TERM.bg : isHl ? BLUE_TINT : C.white;
        const border = isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : isHl
            ? `2.5px solid ${C.accent}`
            : `1px solid ${C.line}`;
        const titleColor = isDark ? TERM.fg : C.ink;
        const subColor = isDark ? TERM.dim : C.mute;
        const accentColor = isDark ? TERM.blue : C.accent;

        return (
          <div
            key={i}
            style={{
              gridColumn: cell.span === 2 ? "span 2" : "span 1",
              borderRadius: 34,
              background: bg,
              border,
              boxShadow: isDark ? SHADOW_WINDOW : CARD_SHADOW,
              padding: "30px 34px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              ...materialize(p, 0.95, 8),
              translate: `0px ${(1 - p) * 20}px`,
            }}
          >
            {/* Top row: Icon badge and/or large stat */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              {cell.icon ? (
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background: isDark
                      ? "rgba(255,255,255,0.08)"
                      : isHl
                        ? tint(C.accent, 0.14)
                        : C.soft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    name={cell.icon}
                    size={32}
                    color={isHl || isDark ? accentColor : C.ink}
                    weight={2.1}
                    draw={prog(frame, cellAt + 2, 12)}
                  />
                </div>
              ) : null}

              {cell.stat ? (
                <div
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: cell.span === 2 ? 64 : 56,
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    color: isHl || isDark ? accentColor : C.ink,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {cell.stat}
                </div>
              ) : null}
            </div>

            {/* Bottom row: Title, subtitle, and optional code pill */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: cell.span === 2 ? 40 : 34,
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                  color: titleColor,
                }}
              >
                {cell.title}
              </div>

              {cell.sub ? (
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: 25,
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                    color: subColor,
                  }}
                >
                  {cell.sub}
                </div>
              ) : null}

              {cell.code ? (
                <div
                  style={{
                    marginTop: 4,
                     alignSelf: "flex-start",
                    padding: "8px 18px",
                    borderRadius: 14,
                    background: isDark ? "rgba(255,255,255,0.08)" : isHl ? C.white : C.paper,
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : C.line}`,
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 24,
                    color: isDark ? TERM.green : C.ink,
                    fontVariantLigatures: "none",
                    whiteSpace: "pre",
                  }}
                >
                  {cell.code}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
