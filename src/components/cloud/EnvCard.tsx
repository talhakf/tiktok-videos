import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type EnvVar = {
  key: string;
  value: string;
  secret?: boolean;
  revealAt?: number;
  leakAt?: number;
};

export const DEFAULT_ENV_VARS: EnvVar[] = [
  { key: "NODE_ENV", value: "production" },
  { key: "PORT", value: "8080" },
  { key: "DATABASE_URL", value: "postgres://app:p9x2k@db.internal:5432/prod", secret: true, revealAt: 26 },
  { key: "STRIPE_SECRET_KEY", value: "sk_live_51Nx92kL8mQ4vR7pZ", secret: true, revealAt: 26, leakAt: 54 },
  { key: "JWT_SIGNING_SECRET", value: "9f8e7d6c5b4a3f2e1d0c9b8a", secret: true },
];

/**
 * .env & Environment Variables card.
 * Displays `vars` with an environment pill (`development` / `production`), masked secret dots `••••••••`
 * that can reveal on cue, and a red warning banner when `leakAt` fires (e.g. "Committed to GitHub!").
 */
export const EnvCard: React.FC<{
  vars?: EnvVar[];
  env?: "development" | "production" | "staging";
  x: number;
  y: number;
  w?: number;
  at?: number;
  until?: number;
  revealAt?: number;
  leakAt?: number;
  leakMessage?: string;
  filename?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({
  vars = DEFAULT_ENV_VARS,
  env = "production",
  x,
  y,
  w = 900,
  at = 0,
  until,
  revealAt,
  leakAt,
  leakMessage = "Committed to GitHub! Secret key exposed in public repo",
  filename = ".env",
  dark = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const rowH = 68;
  const padY = 20;
  const bannerSlotH = 92;
  const bodyH = padY * 2 + vars.length * rowH + bannerSlotH;
  const h = (filename ? TAB_H : 0) + bodyH;

  // Earliest leak frame across card prop or any row
  const rowLeakFrames = vars.map((v) => v.leakAt).filter((f): f is number => f !== undefined);
  const firstLeakAt =
    leakAt !== undefined
      ? leakAt
      : rowLeakFrames.length > 0
        ? Math.min(...rowLeakFrames)
        : undefined;

  const isLeaked = firstLeakAt !== undefined && frame >= firstLeakAt;
  const leakBannerP = firstLeakAt !== undefined ? prog(frame, firstLeakAt, 10, easeOut) : 0;

  const envTone =
    env === "production"
      ? { bg: tint(AMBER, 0.16), fg: "#A05A00", dot: AMBER }
      : env === "staging"
        ? { bg: tint(C.accent, 0.12), fg: C.accent, dot: C.accent }
        : { bg: tint(GREEN, 0.15), fg: "#248A3D", dot: GREEN };

  const envPill = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 16px",
        borderRadius: 999,
        background: envTone.bg,
        color: envTone.fg,
        fontFamily: mono,
        fontWeight: 700,
        fontSize: 19,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          background: envTone.dot,
        }}
      />
      {env}
    </div>
  );

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      dark={dark}
      filename={filename}
      icon="key"
      right={envPill}
      style={style}
    >
      <div style={{ position: "absolute", inset: 0, padding: `${padY}px 0` }}>
        {vars.map((v, i) => {
          const rowEnter = prog(frame, at + 4 + i * 3, 9, easeOut);
          const rowLeakAt = v.leakAt ?? (v.secret && leakAt !== undefined ? leakAt : undefined);
          const rowLeakP = rowLeakAt !== undefined ? prog(frame, rowLeakAt, 9, easeInOut) : 0;

          const effRevealAt = v.revealAt ?? revealAt ?? rowLeakAt;
          const revP =
            v.secret && effRevealAt !== undefined
              ? prog(frame, effRevealAt, 10, easeOut)
              : v.secret
                ? 0
                : 1;

          const badTone = toneColors("bad", dark);
          const rowBg = interpolateColors(
            rowLeakP,
            [0, 1],
            ["rgba(0,0,0,0)", badTone.bg]
          );

          return (
            <div
              key={v.key}
              style={{
                position: "relative",
                height: rowH,
                padding: "0 32px",
                background: rowBg,
                borderLeft: rowLeakP > 0.05 ? `6px solid ${badTone.edge}` : "6px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: rowEnter,
                translate: `${(1 - rowEnter) * 12}px 0px`,
              }}
            >
              {/* Line number */}
              <div
                style={{
                  width: 32,
                  fontFamily: mono,
                  fontWeight: 500,
                  fontSize: 21,
                  color: dark ? TERM.dim : C.mute,
                  userSelect: "none",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>

              {/* Variable Key */}
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 23,
                  color: rowLeakP > 0.5 ? badTone.fg : dark ? TERM.blue : C.ink,
                  whiteSpace: "nowrap",
                }}
              >
                {v.key}
              </div>

              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 500,
                  fontSize: 23,
                  color: dark ? TERM.dim : C.mute,
                }}
              >
                =
              </div>

              {/* Variable Value (plain or masked/revealed secret) */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  position: "relative",
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {v.secret ? (
                  <>
                    {/* Masked dots pill */}
                    {revP < 1 ? (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "6px 14px",
                          borderRadius: 10,
                          background: dark ? "rgba(255,255,255,0.08)" : "#EFEFF4",
                          fontFamily: mono,
                          fontWeight: 700,
                          fontSize: 22,
                          letterSpacing: "0.12em",
                          color: dark ? TERM.dim : C.mute,
                          opacity: 1 - revP,
                        }}
                      >
                        <Icon name="lock" size={20} color={dark ? TERM.dim : C.mute} weight={2.2} />
                        ••••••••••••••
                      </div>
                    ) : null}

                    {/* Revealed secret value */}
                    {revP > 0 ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "6px 14px",
                          borderRadius: 10,
                          background:
                            rowLeakP > 0.3
                              ? tint(RED, 0.14)
                              : tint(C.accent, 0.1),
                          fontFamily: mono,
                          fontWeight: 600,
                          fontSize: 21,
                          color:
                            rowLeakP > 0.3
                              ? badTone.fg
                              : dark
                                ? TERM.yellow
                                : C.accent,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                          ...materialize(revP, 0.96, 5),
                        }}
                      >
                        <Icon
                          name={rowLeakP > 0.3 ? "unlock" : "eye"}
                          size={21}
                          color={rowLeakP > 0.3 ? badTone.fg : C.accent}
                          weight={2.2}
                        />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                          "{v.value}"
                        </span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily: mono,
                      fontWeight: 500,
                      fontSize: 23,
                      color: dark ? TERM.green : "#248A3D",
                      whiteSpace: "nowrap",
                    }}
                  >
                    "{v.value}"
                  </div>
                )}
              </div>

              {/* Leaked badge on the right */}
              {rowLeakP > 0.05 ? (
                <div
                  style={{
                    padding: "6px 14px",
                    borderRadius: 10,
                    background: RED,
                    color: C.white,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                    ...materialize(rowLeakP, 0.9, 4),
                  }}
                >
                  <Icon name="warning" size={19} color={C.white} weight={2.4} />
                  LEAKED
                </div>
              ) : v.secret ? (
                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 600,
                    fontSize: 17,
                    color: dark ? TERM.dim : C.mute,
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    flexShrink: 0,
                  }}
                >
                  secret
                </div>
              ) : null}
            </div>
          );
        })}

        {/* Bottom status / leak warning banner */}
        <div style={{ padding: "14px 28px 0" }}>
          {isLeaked ? (
            <div
              style={{
                height: 66,
                borderRadius: 18,
                background: dark ? tint(RED, 0.22) : "#FFF1F0",
                border: `2px solid ${RED}`,
                padding: "0 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                ...materialize(leakBannerP, 0.95, 6),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Icon name="warning" size={28} color={RED} weight={2.3} />
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: 23,
                    letterSpacing: "-0.01em",
                    color: dark ? "#FFD2CF" : "#C9281E",
                  }}
                >
                  {leakMessage}
                </span>
              </div>
              <span
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 18,
                  color: RED,
                  padding: "5px 12px",
                  borderRadius: 8,
                  background: tint(RED, 0.14),
                }}
              >
                git push · main
              </span>
            </div>
          ) : (
            <div
              style={{
                height: 66,
                borderRadius: 18,
                background: dark ? "#262629" : "#F5F5F8",
                border: `1px solid ${C.line}`,
                padding: "0 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: mono,
                fontSize: 20,
                color: dark ? TERM.dim : C.mute,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="shieldCheck" size={24} color="#248A3D" weight={2.1} />
                <span>.gitignore includes .env · secrets local only</span>
              </div>
              <span>{vars.filter((v) => v.secret).length} secrets masked</span>
            </div>
          )}
        </div>
      </div>
    </DevCard>
  );
};
