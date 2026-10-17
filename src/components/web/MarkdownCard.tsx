import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER } from "../dev/card";
import { CARD_SHADOW, GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type AlertTone = "note" | "tip" | "important" | "warning" | "caution";
export type MarkdownKind = "alert" | "details" | "kbd" | "diff";

export type MarkdownCardProps = {
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  raw: string[];
  renderAt: number;
  kind: MarkdownKind;
  alertTone?: AlertTone;
  title?: string;
  body?: string;
  openAt?: number;
  keys?: string[];
};

const ALERT_META: Record<AlertTone, { label: string; color: string; icon: IconName }> = {
  note: { label: "NOTE", color: C.accent, icon: "info" },
  tip: { label: "TIP", color: "#248A3D", icon: "bolt" },
  important: { label: "IMPORTANT", color: "#8957E5", icon: "bell" },
  warning: { label: "WARNING", color: AMBER, icon: "warning" },
  caution: { label: "CAUTION", color: RED, icon: "crossCircle" },
};

const colorRawLine = (line: string): string => {
  const trimmed = line.trim();
  if (trimmed.startsWith("> [!")) return TERM.blue;
  if (trimmed.startsWith("<details") || trimmed.startsWith("</details") || trimmed.startsWith("<summary")) return TERM.purple;
  if (trimmed.includes("<kbd>")) return TERM.yellow;
  if (trimmed.startsWith("```")) return TERM.dim;
  if (trimmed.startsWith("+")) return TERM.green;
  if (trimmed.startsWith("-")) return TERM.red;
  return TERM.fg;
};

/**
 * GitHub Markdown raw syntax → rendered preview card.
 * Shows raw Markdown in a top dark mono pane, then materializes the rendered GitHub preview at `renderAt`.
 */
export const MarkdownCard: React.FC<MarkdownCardProps> = ({
  x = TX,
  y,
  w = 900,
  at,
  until,
  raw,
  renderAt,
  kind,
  alertTone = "note",
  title,
  body,
  openAt,
  keys = ["Ctrl", "Shift", "P"],
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const renderP = prog(frame, renderAt, 12, easeOut);
  const openP = openAt !== undefined ? prog(frame, openAt, 12, easeInOut) : 1;
  const alertInfo = ALERT_META[alertTone];

  const diffLines =
    kind === "diff"
      ? (body ? body.split("\n") : raw.filter((l) => !l.trim().startsWith("```")))
      : [];

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
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {/* Top pane: Raw Markdown syntax */}
      <div style={{ background: TERM.bg, padding: "20px 30px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="code" size={24} color={TERM.dim} />
            <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 600, color: TERM.dim }}>README.md · raw</span>
          </div>
          <span
            style={{
              fontFamily: mono,
              fontSize: 20,
              fontWeight: 600,
              color: TERM.blue,
              padding: "3px 12px",
              borderRadius: 8,
              background: "rgba(100,168,255,0.14)",
            }}
          >
            markdown
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontVariantLigatures: "none" }}>
          {raw.map((line, i) => {
            const lp = prog(frame, at + 2 + i * 2, 8, easeOut);
            return (
              <div
                key={i}
                style={{
                  fontFamily: mono,
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: colorRawLine(line),
                  whiteSpace: "pre-wrap",
                  opacity: lp,
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom pane: Rendered GitHub preview */}
      {renderP > 0 ? (
        <div style={{ ...materialize(renderP, 0.97, 6) }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 30px",
              background: "#F2F2F4",
              borderTop: `1px solid ${C.line}`,
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="eye" size={22} color={C.mute} />
              <span style={{ fontSize: 21, fontWeight: 600, color: C.mute }}>Preview</span>
            </div>
            <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 600, color: C.accent }}>rendered</span>
          </div>

          <div style={{ padding: "26px 32px", background: C.white }}>
            {kind === "alert" ? (
              <div
                style={{
                  borderLeft: `6px solid ${alertInfo.color}`,
                  background: tint(alertInfo.color, 0.08),
                  borderRadius: "0 18px 18px 0",
                  padding: "20px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon name={alertInfo.icon} size={28} color={alertInfo.color} draw={prog(frame, renderAt + 2, 12)} />
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 24,
                      fontWeight: 700,
                      color: alertInfo.color,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {alertInfo.label}
                  </span>
                  {title ? (
                    <span style={{ fontSize: 25, fontWeight: 700, color: C.ink, marginLeft: 6 }}>{title}</span>
                  ) : null}
                </div>
                {body ? (
                  <div style={{ fontSize: 26, fontWeight: 500, color: C.ink, lineHeight: 1.38 }}>{body}</div>
                ) : null}
              </div>
            ) : null}

            {kind === "details" ? (
              <div
                style={{
                  borderRadius: 18,
                  border: `1px solid ${C.line}`,
                  background: C.paper,
                  padding: "18px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <svg
                    width={22}
                    height={22}
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      transform: `rotate(${openP * 90}deg)`,
                      flexShrink: 0,
                    }}
                  >
                    <path d="M8 5l9 7-9 7z" fill={C.ink} />
                  </svg>
                  <span style={{ fontSize: 27, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>
                    {title ?? "Click to expand"}
                  </span>
                  {openAt !== undefined ? (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontFamily: mono,
                        fontSize: 20,
                        fontWeight: 600,
                        padding: "3px 12px",
                        borderRadius: 999,
                        background: openP > 0.5 ? tint(GREEN, 0.14) : C.soft,
                        color: openP > 0.5 ? "#248A3D" : C.mute,
                      }}
                    >
                      {openP > 0.5 ? "open" : "collapsed"}
                    </span>
                  ) : null}
                </div>
                {openP > 0 && body ? (
                  <div
                    style={{
                      height: openP * 78,
                      overflow: "hidden",
                      opacity: openP,
                    }}
                  >
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: `1px solid ${C.line}`,
                        fontFamily: mono,
                        fontSize: 24,
                        fontWeight: 500,
                        color: C.ink,
                      }}
                    >
                      {body}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {kind === "kbd" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                {title ? (
                  <span style={{ fontSize: 27, fontWeight: 600, color: C.ink, marginRight: 6 }}>{title}</span>
                ) : null}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {keys.map((k, i) => {
                    const kp = prog(frame, renderAt + 3 + i * 3, 9, easeOut);
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, ...materialize(kp, 0.94, 4) }}>
                        {i > 0 ? (
                          <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 600, color: C.mute }}>+</span>
                        ) : null}
                        <kbd
                          style={{
                            fontFamily: mono,
                            fontSize: 25,
                            fontWeight: 700,
                            color: C.ink,
                            background: C.paper,
                            border: "1px solid rgba(0,0,0,0.22)",
                            borderBottomWidth: 4,
                            borderRadius: 12,
                            padding: "8px 18px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                          }}
                        >
                          {k}
                        </kbd>
                      </div>
                    );
                  })}
                </div>
                {body ? (
                  <span style={{ fontSize: 25, fontWeight: 500, color: C.mute, marginLeft: "auto" }}>{body}</span>
                ) : null}
              </div>
            ) : null}

            {kind === "diff" ? (
              <div
                style={{
                  borderRadius: 16,
                  border: `1px solid ${C.line}`,
                  overflow: "hidden",
                  fontFamily: mono,
                  fontSize: 24,
                  fontWeight: 500,
                }}
              >
                {diffLines.map((line, i) => {
                  const isAdd = line.startsWith("+");
                  const isDel = line.startsWith("-");
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "10px 20px",
                        background: isAdd ? tint(GREEN, 0.13) : isDel ? tint(RED, 0.11) : C.paper,
                        color: isAdd ? "#248A3D" : isDel ? "#C9281E" : C.ink,
                        borderTop: i > 0 ? `1px solid ${C.line}` : undefined,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};
