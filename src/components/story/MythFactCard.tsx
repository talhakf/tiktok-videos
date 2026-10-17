import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { CARD_SHADOW, GREEN, RED } from "../diagram/Node";
import { Mark, outP } from "../layouts/Mark";
import { tint } from "../windows/MacWindow";

// High-impact Myth vs Fact card:
// Top section shows the common belief (`myth`), which gets struck through and stamped with a red
// "Myth" badge at `revealAt`, while the bottom section materializes with the verified truth (`fact`
// + optional `proofCode`) and a green "Fact" badge.

export const MythFactCard: React.FC<{
  at?: number;
  until?: number;
  myth: string;
  mythSub?: string;
  revealAt: number;
  fact: string;
  factSub?: string;
  proofCode?: string;
  x?: number;
  y?: number;
  w?: number;
}> = ({
  at = 0,
  until,
  myth,
  mythSub,
  revealAt,
  fact,
  factSub,
  proofCode,
  x = TX,
  y = TY,
  w = TW,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;

  const p = prog(frame, at, 10);
  const rev = prog(frame, revealAt, 10);
  const strike = prog(frame, revealAt + 2, 12, easeInOut);
  const factP = prog(frame, revealAt + 4, 12);

  const mythTextColor = interpolateColors(rev, [0, 1], [C.ink, C.mute]);
  const mythBorderColor = interpolateColors(rev, [0, 1], ["rgba(0,0,0,0.07)", tint(RED, 0.45)]);
  const mythBgColor = interpolateColors(rev, [0, 1], [C.white, "#FFF8F7"]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        fontFamily: sans,
        ...materialize(p * (1 - out), 0.95, 8),
      }}
    >
      {/* Top Card: Common belief -> stamped Myth at revealAt */}
      <div
        style={{
          borderRadius: 34,
          background: mythBgColor,
          border: `2px solid ${mythBorderColor}`,
          boxShadow: CARD_SHADOW,
          padding: "34px 40px 38px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          {/* Pre-reveal label */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 20px",
              borderRadius: 999,
              background: C.soft,
              opacity: 1 - rev * 0.4,
            }}
          >
            <Icon name="speech" size={26} color={C.mute} weight={2} />
            <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 22, color: C.mute }}>
              common belief
            </span>
          </div>

          {/* Red Myth Stamp Badge */}
          {frame >= revealAt ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 24px",
                borderRadius: 999,
                background: tint(RED, 0.12),
                border: `2px solid ${RED}`,
                ...materialize(rev, 0.95, 6),
              }}
            >
              <Mark kind="cross" size={34} color={RED} draw={prog(frame, revealAt + 2, 9)} />
              <span
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 28,
                  letterSpacing: "-0.02em",
                  color: "#C9281E",
                }}
              >
                Myth
              </span>
            </div>
          ) : null}
        </div>

        {/* Myth statement with animated strike-through bar */}
        <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 44,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              color: mythTextColor,
              whiteSpace: "pre-wrap",
            }}
          >
            {myth}
          </div>
          {strike > 0 ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                width: `${strike * 100}%`,
                height: 6,
                borderRadius: 3,
                background: RED,
                transform: "translateY(-50%)",
                opacity: 0.85,
              }}
            />
          ) : null}
        </div>

        {mythSub ? (
          <div
            style={{
              marginTop: 12,
              fontWeight: 500,
              fontSize: 28,
              color: C.mute,
            }}
          >
            {mythSub}
          </div>
        ) : null}
      </div>

      {/* Bottom Card: Expands / materializes with the verified Fact */}
      {frame >= revealAt ? (
        <div
          style={{
            borderRadius: 34,
            background: C.white,
            border: `2.5px solid ${GREEN}`,
            boxShadow: CARD_SHADOW,
            padding: "34px 40px 38px",
            boxSizing: "border-box",
            ...materialize(factP, 0.95, 8),
            translate: `0px ${(1 - factP) * 24}px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 24px",
                borderRadius: 999,
                background: tint(GREEN, 0.14),
                border: `2px solid ${GREEN}`,
              }}
            >
              <Mark kind="check" size={34} color={GREEN} draw={prog(frame, revealAt + 6, 10)} />
              <span
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 28,
                  letterSpacing: "-0.02em",
                  color: "#248A3D",
                }}
              >
                Fact
              </span>
            </div>

            <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 22, color: "#248A3D" }}>
              verified
            </span>
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 44,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              color: C.ink,
              whiteSpace: "pre-wrap",
            }}
          >
            {fact}
          </div>

          {factSub ? (
            <div
              style={{
                marginTop: 10,
                fontWeight: 500,
                fontSize: 28,
                color: C.mute,
              }}
            >
              {factSub}
            </div>
          ) : null}

          {proofCode ? (
            <div
              style={{
                marginTop: 24,
                padding: "18px 26px",
                borderRadius: 20,
                background: TERM.bg,
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontVariantLigatures: "none",
              }}
            >
              <Icon name="terminal" size={28} color={TERM.green} weight={2} />
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 28,
                  color: TERM.fg,
                  whiteSpace: "pre",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {proofCode}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
