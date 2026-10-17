import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { AMBER, DevCard, TAB_H, toneColors } from "../dev/card";
import { GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type PasswordEntry = {
  label: string;
  mask: string;
  hashAlgo: string;
  guessesPerSec: string;
  timeToCrack: string;
  crackedAt?: number;
  safe?: boolean;
};

const HEAD_H = 56;
const ROW_H = 148;
const PAD_B = 16;

export const passwordCrackerH = (count: number, hasTab = true) =>
  (hasTab ? TAB_H : 0) + HEAD_H + count * ROW_H + PAD_B;

const GLYPHS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*";

/** Deterministic frame-driven spinning brute-force candidate string. */
const spinGuess = (target: string, frame: number, rowIdx: number, lockProgress: number, maxLen = 16) => {
  const display = target.slice(0, maxLen);
  let out = "";
  for (let i = 0; i < display.length; i++) {
    const threshold = (i + 1) / display.length;
    if (lockProgress >= threshold) {
      out += display[i];
    } else {
      const idx = Math.abs(frame * 5 + i * 19 + rowIdx * 37) % GLYPHS.length;
      out += GLYPHS[idx];
    }
  }
  return out;
};

/**
 * Brute-force / Hash cracking speed & entropy comparator:
 * compares password/hash rows, animating a rapid spinning guess ticker that
 * cracks weak/unsalted MD5 passwords in red vs Argon2id + passphrases holding strong in green.
 */
export const PasswordCracker: React.FC<{
  entries: PasswordEntry[];
  x?: number;
  y?: number;
  w?: number;
  at: number;
  until?: number;
  dark?: boolean;
  filename?: string;
  right?: React.ReactNode;
}> = ({
  entries,
  x = TX,
  y = TY,
  w = TW,
  at,
  until,
  dark = false,
  filename = "hashcat-benchmark.log",
  right = "8× GPU rig · brute-force",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const h = passwordCrackerH(entries.length, filename !== undefined);
  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const lineCol = dark ? "rgba(255,255,255,0.09)" : C.line;

  const badLook = toneColors("bad", dark);
  const goodLook = toneColors("good", dark);
  const accentLook = toneColors("accent", dark);
  const warnLook = toneColors("warn", dark);

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} dark={dark} filename={filename} icon="key" right={right}>
      {/* Header Strip */}
      <div
        style={{
          height: HEAD_H,
          padding: "0 28px",
          borderBottom: `1px solid ${lineCol}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 18,
          color: mute,
          background: dark ? "rgba(255,255,255,0.02)" : "#FAFAFC",
        }}
      >
        <div>PASSWORD CANDIDATE &amp; LIVE TICKER</div>
        <div>HASH SPEED &amp; TIME TO CRACK</div>
      </div>

      {/* Rows */}
      <div>
        {entries.map((entry, i) => {
          const rowStart = at + 4 + i * 5;
          const rowIn = prog(frame, rowStart, 10, easeOut);

          const isSafe = Boolean(entry.safe);
          const crackFrame = entry.crackedAt ?? (isSafe ? Infinity : rowStart + 24);
          const isCracked = !isSafe && frame >= crackFrame;
          const crackP = !isSafe ? prog(frame, crackFrame, 10, easeOut) : 0;
          const safeP = isSafe ? prog(frame, rowStart + 14, 12, easeOut) : 0;

          // Lock-on progress for weak passwords (0 -> 1 as frame approaches crackFrame)
          const spinWindow = Math.max(8, crackFrame - rowStart);
          const lockProgress = isSafe
            ? 0
            : isCracked
              ? 1
              : Math.max(0, Math.min(0.85, (frame - rowStart) / spinWindow));

          const tickerText = spinGuess(entry.label, frame, i, lockProgress, 18);

          // Row tone interpolation
          const activeLook = isSafe
            ? {
                bg: interpolateColors(safeP, [0, 1], [accentLook.bg, goodLook.bg]),
                edge: interpolateColors(safeP, [0, 1], [accentLook.edge, goodLook.edge]),
                fg: interpolateColors(safeP, [0, 1], [accentLook.fg, goodLook.fg]),
              }
            : {
                bg: interpolateColors(crackP, [0, 1], [warnLook.bg, badLook.bg]),
                edge: interpolateColors(crackP, [0, 1], [warnLook.edge, badLook.edge]),
                fg: interpolateColors(crackP, [0, 1], [warnLook.fg, badLook.fg]),
              };

          // Progress bar fill: weak passwords race to 100% red at crackFrame; safe passphrases hold a green shield bar
          const attackFill = isSafe
            ? 1
            : Math.max(0.08, Math.min(1, (frame - rowStart) / Math.max(10, crackFrame - rowStart)));

          return (
            <div
              key={`${entry.label}-${i}`}
              style={{
                height: ROW_H,
                padding: "16px 28px",
                boxSizing: "border-box",
                borderBottom: i < entries.length - 1 ? `1px solid ${lineCol}` : undefined,
                background: isCracked
                  ? tint(RED, dark ? 0.08 : 0.04)
                  : isSafe && safeP > 0.5
                    ? tint(GREEN, dark ? 0.08 : 0.04)
                    : "transparent",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                ...materialize(rowIn),
              }}
            >
              {/* Top Row: Icon + Password + Verdict Pill */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: isCracked ? RED : isSafe ? GREEN : activeLook.bg,
                      border: isCracked || isSafe ? undefined : `1.5px solid ${activeLook.edge}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      name={isCracked ? "unlock" : isSafe ? "shieldCheck" : "refresh"}
                      size={25}
                      color={isCracked || isSafe ? C.white : activeLook.fg}
                      weight={2.2}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          fontFamily: mono,
                          fontWeight: 700,
                          fontSize: 25,
                          color: isCracked ? badLook.fg : isSafe ? goodLook.fg : fg,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {isSafe ? entry.label : tickerText}
                      </span>
                    </div>

                    {/* Live Spinning Guess Ticker & Mask */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: mono, fontSize: 18 }}>
                      <span style={{ color: mute }}>mask: {entry.mask}</span>
                      <span style={{ color: lineCol }}>•</span>
                      {isCracked ? (
                        <span style={{ color: badLook.fg, fontWeight: 700 }}>
                          hash matched: &quot;{entry.label}&quot;
                        </span>
                      ) : (
                        <span style={{ color: isSafe ? mute : activeLook.fg, fontWeight: 600 }}>
                          trying: {spinGuess(entry.label, frame + 11, i + 3, 0, 14)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Verdict + Time to Crack */}
                <div
                  style={{
                    height: 48,
                    padding: "0 18px",
                    borderRadius: 14,
                    background: activeLook.bg,
                    border: `2px solid ${activeLook.edge}`,
                    color: activeLook.fg,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      background: isCracked ? RED : isSafe ? GREEN : AMBER,
                    }}
                  />
                  <span>{isCracked ? "CRACKED" : isSafe ? "HOLDING" : "CRACKING"}</span>
                  <span style={{ opacity: 0.45 }}>·</span>
                  <span>{entry.timeToCrack}</span>
                </div>
              </div>

              {/* Bottom Row: Hash Algo + Guesses/sec + Strength Bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    height: 34,
                    padding: "0 12px",
                    borderRadius: 8,
                    background: dark ? "rgba(255,255,255,0.06)" : "#EFEFF4",
                    color: fg,
                    display: "flex",
                    alignItems: "center",
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {entry.hashAlgo}
                </div>

                <div
                  style={{
                    fontFamily: mono,
                    fontWeight: 500,
                    fontSize: 18,
                    color: mute,
                    flexShrink: 0,
                  }}
                >
                  {entry.guessesPerSec} guesses/s
                </div>

                {/* Progress / Resistance Track */}
                <div
                  style={{
                    flex: 1,
                    height: 10,
                    borderRadius: 5,
                    background: dark ? "rgba(255,255,255,0.08)" : "#E5E5EA",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.round(attackFill * 100)}%`,
                      height: "100%",
                      borderRadius: 5,
                      background: isSafe ? GREEN : isCracked ? RED : AMBER,
                    }}
                  />
                </div>

                <div
                  style={{
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: 18,
                    color: isSafe ? goodLook.fg : isCracked ? badLook.fg : mute,
                    width: 115,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {isSafe ? "unbreakable" : isCracked ? "compromised" : "testing..."}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DevCard>
  );
};
