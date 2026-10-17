import { interpolateColors, useCurrentFrame } from "remotion";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { CodeLang, DARK_SYNTAX, LIGHT_SYNTAX, tokenizeLine } from "../dev/syntax";
import { alpha, GREEN, presence } from "../diagram/Node";
import { Icon } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, mono, prog, sans, TERM } from "../../theme";

export type ConflictChoice = "current" | "incoming" | "both";

export type ConflictResolverProps = {
  x?: number;
  y?: number;
  w?: number;
  at: number;
  until?: number;
  /** Frame when the chosen action pill presses and conflict markers collapse into clean code. */
  resolveAt?: number;
  /** Frame after resolveAt when the resolved highlight tint settles into plain code. */
  settleAt?: number;
  choice?: ConflictChoice;
  filename?: string;
  currentBranch?: string;
  incomingBranch?: string;
  beforeLines?: string[];
  currentLines?: string[];
  incomingLines?: string[];
  afterLines?: string[];
  lang?: CodeLang;
  size?: number;
  dark?: boolean;
  style?: React.CSSProperties;
};

type RowSpec = {
  kind: "ctx" | "marker-start" | "current" | "marker-sep" | "incoming" | "marker-end";
  text: string;
};

/**
 * 3-way Merge Conflict editor card: renders conflict markers (`<<<<<<< HEAD (Current)`, `=======`,
 * `>>>>>>> feat/auth (Incoming)`) with clickable-style IDE lens pills (`Accept Current` | `Accept Incoming` | `Accept Both`)
 * that press at `resolveAt` and smoothly collapse the conflict markers into clean resolved code.
 */
export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  x = TX,
  y = TY,
  w = TW,
  at,
  until,
  resolveAt,
  settleAt,
  choice = "incoming",
  filename = "src/auth/token.ts",
  currentBranch = "HEAD (Current)",
  incomingBranch = "feat/auth (Incoming)",
  beforeLines = [
    "export async function verifySession(token: string) {",
    "  const payload = decodeJwt(token);",
  ],
  currentLines = [
    "  const ttl = 3600;",
    "  return payload.exp > Date.now() / 1000;",
  ],
  incomingLines = [
    "  const ttl = Number(process.env.SESSION_TTL ?? 7200);",
    "  return verifySignature(token, ttl) && !payload.revoked;",
  ],
  afterLines = [
    "}",
  ],
  lang = "ts",
  size = 23,
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const resAt = resolveAt ?? at + 44;
  const setAt = settleAt ?? resAt + 24;

  // Pill press animation (presses at resAt - 4 .. resAt + 4, then conflict collapses at resAt + 2 .. resAt + 16)
  const pressIn = prog(frame, resAt - 5, 5);
  const pressOut = prog(frame, resAt + 1, 6);
  const pressDepth = pressIn * (1 - pressOut);
  const collapse = prog(frame, resAt + 2, 14, easeInOut);
  const settle = prog(frame, setAt, 12);

  const pal = dark ? DARK_SYNTAX : LIGHT_SYNTAX;
  const goodTone = toneColors("good", dark);
  const accentTone = toneColors("accent", dark);
  const warnTone = toneColors("warn", dark);
  const muted = dark ? TERM.dim : "#8E8E93";

  const rows: RowSpec[] = [
    ...beforeLines.map((t): RowSpec => ({ kind: "ctx", text: t })),
    { kind: "marker-start", text: `<<<<<<< ${currentBranch}` },
    ...currentLines.map((t): RowSpec => ({ kind: "current", text: t })),
    { kind: "marker-sep", text: "=======" },
    ...incomingLines.map((t): RowSpec => ({ kind: "incoming", text: t })),
    { kind: "marker-end", text: `>>>>>>> ${incomingBranch}` },
    ...afterLines.map((t): RowSpec => ({ kind: "ctx", text: t })),
  ];

  const lh = Math.round(size * 1.62);
  const lensH = 54 * (1 - collapse);
  const padY = 18;

  // Compute each row's height multiplier (1 -> 0 when collapsed out)
  const keepsRow = (kind: RowSpec["kind"]) => {
    if (kind === "ctx") return true;
    if (kind === "marker-start" || kind === "marker-sep" || kind === "marker-end") return false;
    if (kind === "current") return choice === "current" || choice === "both";
    if (kind === "incoming") return choice === "incoming" || choice === "both";
    return true;
  };

  const rowMetrics = rows.map((r, i) => {
    const keep = keepsRow(r.kind);
    const hf = keep ? 1 : 1 - collapse;
    const enter = prog(frame, at + 4 + i * 1.6, 8);
    return { hf, enter, keep };
  });

  const codeBodyH = rowMetrics.reduce((acc, m) => acc + m.hf * lh, 0);
  const statusStripH = 62;
  const cardH = TAB_H + statusStripH + lensH + padY * 2 + codeBodyH;

  const pills: { id: ConflictChoice; label: string }[] = [
    { id: "current", label: "Accept Current" },
    { id: "incoming", label: "Accept Incoming" },
    { id: "both", label: "Accept Both" },
  ];

  const rightStatus = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 14px",
        borderRadius: 999,
        background: collapse > 0.5 ? goodTone.bg : warnTone.bg,
        border: `1.5px solid ${collapse > 0.5 ? goodTone.edge : warnTone.edge}`,
        fontFamily: mono,
        fontWeight: 700,
        fontSize: 18,
        color: collapse > 0.5 ? goodTone.fg : warnTone.fg,
      }}
    >
      <Icon
        name={collapse > 0.5 ? "check" : "warning"}
        size={18}
        color={collapse > 0.5 ? goodTone.fg : warnTone.fg}
        weight={2.4}
      />
      <span>{collapse > 0.5 ? "conflict resolved" : "1 merge conflict"}</span>
    </div>
  );

  // Track y position and visible line numbers
  let curY = statusStripH + padY;
  let lineNum = 1;

  return (
    <DevCard x={x} y={y} w={w} h={cardH} p={p} dark={dark} filename={filename} icon="fileCode" right={rightStatus} style={style}>
      {/* Top 3-way merge summary bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: statusStripH,
          padding: "0 28px",
          background: dark ? "#242426" : "#F8F8FA",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mono, fontWeight: 700, fontSize: 19, color: goodTone.fg }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: GREEN, display: "inline-block" }} />
            <span>Current: HEAD</span>
          </div>
          <span style={{ color: muted, fontFamily: mono, fontSize: 19 }}>vs</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mono, fontWeight: 700, fontSize: 19, color: accentTone.fg }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: C.accent, display: "inline-block" }} />
            <span>Incoming: feat/auth</span>
          </div>
        </div>

        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 19, color: collapse > 0.6 ? goodTone.fg : muted }}>
          {collapse > 0.6
            ? `Accepted ${choice} change · ready to git add`
            : "Choose resolution strategy"}
        </div>
      </div>

      {/* Editor rows + inline action lens bar right above marker-start */}
      {rows.map((r, i) => {
        const { hf, enter, keep } = rowMetrics[i];

        // Render the clickable action pills bar immediately before `marker-start`
        let lensNode: React.ReactNode = null;
        if (r.kind === "marker-start" && lensH > 0.5) {
          const lensTop = curY;
          curY += lensH;
          lensNode = (
            <div
              key="conflict-lens"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: lensTop,
                height: lensH,
                overflow: "hidden",
                opacity: (1 - collapse) * prog(frame, at + 8, 8),
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingLeft: 76,
                background: dark ? "rgba(255,255,255,0.03)" : "#F5F5F7",
                borderTop: `1px solid ${C.line}`,
              }}
            >
              <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 17, color: muted, marginRight: 4 }}>
                Merge lens:
              </span>
              {pills.map((pl) => {
                const isSelected = pl.id === choice;
                const activePress = isSelected && frame >= resAt - 5;
                const pillScale = isSelected ? 1 - 0.06 * pressDepth : 1;
                return (
                  <div
                    key={pl.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 16px",
                      borderRadius: 10,
                      background: activePress
                        ? C.accent
                        : dark
                          ? TERM.bar
                          : C.white,
                      border: `1.5px solid ${activePress ? C.accent : isSelected ? alpha(C.accent, 0.5) : C.line}`,
                      boxShadow: activePress ? "0 4px 12px rgba(0,113,227,0.25)" : "0 1px 3px rgba(0,0,0,0.06)",
                      fontFamily: sans,
                      fontWeight: 600,
                      fontSize: 18,
                      color: activePress ? C.white : dark ? TERM.fg : C.ink,
                      scale: String(pillScale),
                    }}
                  >
                    {activePress ? <Icon name="check" size={18} color={C.white} weight={2.6} /> : null}
                    <span>{pl.label}</span>
                  </div>
                );
              })}
            </div>
          );
        }

        const rowTop = curY;
        curY += hf * lh;
        if (hf <= 0.001) return lensNode;

        const isMarker = r.kind === "marker-start" || r.kind === "marker-sep" || r.kind === "marker-end";
        const isCurrent = r.kind === "current";
        const isIncoming = r.kind === "incoming";

        const showLineNo = !isMarker && (keep || collapse < 0.5);
        const thisLineNo = showLineNo ? lineNum++ : undefined;

        // Background tint for conflict sections
        let rowBg = "rgba(0,0,0,0)";
        let leftEdgeColor = "transparent";

        if (r.kind === "marker-start") {
          rowBg = alpha(GREEN, dark ? 0.24 : 0.18);
          leftEdgeColor = GREEN;
        } else if (isCurrent) {
          const tintWeight = keep ? 1 - settle * 0.85 : 1;
          rowBg = interpolateColors(tintWeight, [0, 1], ["rgba(0,0,0,0)", alpha(GREEN, dark ? 0.15 : 0.1)]);
          leftEdgeColor = interpolateColors(settle, [0, 1], [GREEN, "rgba(0,0,0,0)"]);
        } else if (r.kind === "marker-sep") {
          rowBg = alpha(AMBER, dark ? 0.2 : 0.14);
          leftEdgeColor = AMBER;
        } else if (r.kind === "marker-end") {
          rowBg = alpha(C.accent, dark ? 0.24 : 0.18);
          leftEdgeColor = C.accent;
        } else if (isIncoming) {
          const tintWeight = keep ? 1 - settle * 0.85 : 1;
          rowBg = interpolateColors(tintWeight, [0, 1], ["rgba(0,0,0,0)", alpha(C.accent, dark ? 0.16 : 0.1)]);
          leftEdgeColor = interpolateColors(settle, [0, 1], [C.accent, GREEN]);
        }

        const tokens = isMarker ? [{ t: r.text, k: "plain" as const }] : tokenizeLine(r.text, lang);
        const markerColor =
          r.kind === "marker-start"
            ? goodTone.fg
            : r.kind === "marker-end"
              ? accentTone.fg
              : warnTone.fg;

        return (
          <div key={i}>
            {lensNode}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: rowTop,
                height: hf * lh,
                overflow: "hidden",
                background: rowBg,
                borderLeft: `5px solid ${leftEdgeColor}`,
                opacity: enter * (keep ? 1 : 1 - collapse),
                translate: `${(1 - enter) * 14}px 0px`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: lh,
                  width: "100%",
                  fontFamily: mono,
                  fontWeight: isMarker ? 700 : 500,
                  fontSize: size,
                  lineHeight: `${lh}px`,
                  whiteSpace: "pre",
                }}
              >
                {/* Line number gutter */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    width: 56,
                    textAlign: "right",
                    color: muted,
                    fontVariantNumeric: "tabular-nums",
                    fontSize: size * 0.88,
                  }}
                >
                  {thisLineNo ?? ""}
                </div>

                {/* Code or conflict marker text */}
                <div style={{ position: "absolute", left: 74, color: isMarker ? markerColor : undefined }}>
                  {tokens.map((tk, k) => (
                    <span key={k} style={{ color: isMarker ? markerColor : pal[tk.k] }}>
                      {tk.t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </DevCard>
  );
};
