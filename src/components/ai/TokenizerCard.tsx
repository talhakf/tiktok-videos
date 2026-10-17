import { useCurrentFrame } from "remotion";
import { DevCard, TAB_H } from "../dev/card";
import { lerp, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";
import { TX, TW, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";

export type TokenChip = {
  text: string;
  id: number;
  color?: string;
};

const PALETTE = ["#0071E3", "#34C759", "#FF9F0A", "#AF52DE", "#FF3B30", "#00C7BE"];

/** Renders leading spaces as a visible middle-dot marker once split is active. */
const formatSubword = (text: string, splitP: number) => {
  if (splitP < 0.45 || !text.startsWith(" ")) return { lead: "", rest: text };
  return { lead: "·", rest: text.slice(1) };
};

/**
 * Subword BPE tokenizer visualizer: shows input text splitting into tinted token pills at `splitAt`,
 * reveals numeric token IDs below each chip at `idsAt`, and displays a bottom summary bar with
 * character vs token counts and a context window fill meter.
 */
export const TokenizerCard: React.FC<{
  tokens: TokenChip[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  splitAt?: number;
  idsAt?: number;
  model?: string;
  contextUsed?: number;
  contextMax?: number;
  dark?: boolean;
  filename?: string;
  style?: React.CSSProperties;
}> = ({
  tokens,
  x = TX,
  y = TY,
  w = TW,
  h = 430,
  at = 0,
  until,
  splitAt,
  idsAt,
  model = "cl100k_base",
  contextUsed,
  contextMax = 4096,
  dark = false,
  filename = "tokenizer.bpe",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const splitStart = splitAt ?? at + 16;
  const idsStart = idsAt ?? splitStart + 18;
  const splitP = prog(frame, splitStart, 14, easeInOut);
  const idsHeaderP = prog(frame, idsStart, 10, easeOut);

  const totalChars = tokens.reduce((acc, t) => acc + t.text.length, 0);
  const activeTokens = Math.max(1, Math.round(lerp(1, tokens.length, splitP)));
  const usedTok = contextUsed ?? tokens.length;
  const meterP = prog(frame, splitStart, 22, easeInOut);
  const fillFrac = Math.min(1, Math.max(0.04, (usedTok / contextMax) * meterP));

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const line = dark ? "rgba(255,255,255,0.10)" : C.line;
  const bodyH = h - (filename !== undefined ? TAB_H : 0);
  const footerH = 84;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="binary"
      right={model}
      style={style}
    >
      {/* Top status row */}
      <div
        style={{
          padding: "22px 34px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 600,
          color: mute,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: splitP > 0.5 ? C.accent : mute,
            }}
          />
          <span>{splitP < 0.5 ? "Raw input string" : "Subword tokens (BPE)"}</span>
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 20,
            fontWeight: 600,
            color: C.accent,
            ...materialize(idsHeaderP),
          }}
        >
          vocab id ↓
        </div>
      </div>

      {/* Token chips container */}
      <div
        style={{
          padding: "16px 34px",
          height: bodyH - footerH - 62,
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-start",
          alignItems: "flex-start",
          columnGap: lerp(0, 12, splitP),
          rowGap: lerp(8, 18, splitP),
        }}
      >
        {tokens.map((tok, i) => {
          const baseColor = tok.color ?? PALETTE[i % PALETTE.length];
          const chipBg = tint(baseColor, (dark ? 0.24 : 0.14) * splitP);
          const chipBorder = tint(baseColor, (dark ? 0.55 : 0.38) * splitP);
          const idP = prog(frame, idsStart + i * 2, 10, easeOut);
          const { lead, rest } = formatSubword(tok.text, splitP);

          return (
            <div
              key={`${tok.id}-${i}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  height: 54,
                  paddingLeft: lerp(0, 14, splitP),
                  paddingRight: lerp(0, 14, splitP),
                  borderRadius: 14,
                  background: chipBg,
                  border: `2px solid ${chipBorder}`,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 30,
                  color: fg,
                  whiteSpace: "pre",
                  letterSpacing: "-0.01em",
                }}
              >
                {lead ? (
                  <span style={{ color: baseColor, opacity: splitP, marginRight: 2, fontWeight: 700 }}>
                    {lead}
                  </span>
                ) : null}
                <span>{rest}</span>
              </div>

              {/* Token ID label below chip */}
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 19,
                  color: baseColor,
                  fontVariantNumeric: "tabular-nums",
                  ...materialize(idP),
                }}
              >
                {tok.id}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom summary bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: footerH,
          borderTop: `1px solid ${line}`,
          background: dark ? "rgba(255,255,255,0.03)" : "#FAFAFC",
          padding: "0 34px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: mono,
          fontSize: 22,
          fontWeight: 600,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div>
            <span style={{ color: mute }}>chars </span>
            <span style={{ color: fg, fontVariantNumeric: "tabular-nums" }}>{totalChars}</span>
          </div>
          <div>
            <span style={{ color: mute }}>tokens </span>
            <span
              style={{
                display: "inline-block",
                padding: "2px 12px",
                borderRadius: 10,
                background: tint(C.accent, 0.12),
                color: C.accent,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {activeTokens}
            </span>
          </div>
          <div>
            <span style={{ color: mute }}>ratio </span>
            <span style={{ color: fg, fontVariantNumeric: "tabular-nums" }}>
              {(totalChars / Math.max(1, tokens.length)).toFixed(1)}c/t
            </span>
          </div>
        </div>

        {/* Context window fill meter */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: mute, fontSize: 20 }}>context</span>
          <div
            style={{
              width: 150,
              height: 14,
              borderRadius: 7,
              background: dark ? "rgba(255,255,255,0.12)" : C.soft,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${fillFrac * 100}%`,
                height: "100%",
                borderRadius: 7,
                background: C.accent,
              }}
            />
          </div>
          <span style={{ color: fg, fontSize: 20, fontVariantNumeric: "tabular-nums" }}>
            {Math.round(usedTok * meterP).toLocaleString()}/{contextMax.toLocaleString()}
          </span>
        </div>
      </div>
    </DevCard>
  );
};
