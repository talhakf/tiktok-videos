import { useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, RED } from "../diagram/Node";
import { outP } from "../layouts/Mark";
import { tint } from "../windows/MacWindow";

// 3D flip flashcard for quiz hooks and command reveal beats:
// starts on the front face (question / command) and smoothly flips 180° around Y at `flipAt`
// to reveal the back face (answer / explanation + optional code snippet).

export type FlashcardTone = "accent" | "good" | "bad";

export const Flashcard: React.FC<{
  at?: number;
  until?: number;
  flipAt: number;
  flipDur?: number;
  frontTitle: string;
  frontSub?: string;
  frontCode?: string;
  frontTag?: string;
  frontIcon?: IconName;
  backTitle: string;
  backSub?: string;
  backCode?: string;
  backTag?: string;
  backIcon?: IconName;
  tone?: FlashcardTone;
  dark?: boolean;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}> = ({
  at = 0,
  until,
  flipAt,
  flipDur = 18,
  frontTitle,
  frontSub,
  frontCode,
  frontTag = "question",
  frontIcon = "question",
  backTitle,
  backSub,
  backCode,
  backTag = "answer",
  backIcon,
  tone = "accent",
  dark = false,
  x = TX,
  y = TY,
  w = TW,
  h = 520,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = outP(frame, until);
  if (out >= 1) return null;

  const p = prog(frame, at, 10);
  const flip = prog(frame, flipAt, flipDur, easeInOut);
  const lift = Math.sin(flip * Math.PI);
  const deg = flip * 180;
  const showBack = flip >= 0.5;

  const tc = toneColors(tone, dark);
  const backBorder = tone === "good" ? GREEN : tone === "bad" ? RED : C.accent;
  const backSurface = dark
    ? TERM.bg
    : tone === "good"
      ? "#F2FBF4"
      : tone === "bad"
        ? "#FFF5F5"
        : BLUE_TINT;
  const resolvedBackIcon: IconName =
    backIcon ?? (tone === "good" ? "checkCircle" : tone === "bad" ? "crossCircle" : "sparkle");

  const cardBg = dark ? TERM.bg : C.white;
  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;

  const renderFace = (opts: {
    isBack: boolean;
    tag: string;
    icon: IconName;
    title: string;
    sub?: string;
    code?: string;
  }) => {
    const { isBack, tag, icon, title, sub, code } = opts;
    const badgeBg = isBack ? tc.bg : dark ? "rgba(255,255,255,0.08)" : C.soft;
    const badgeFg = isBack ? tc.fg : mute;
    const iconDraw = isBack ? prog(frame, flipAt + Math.floor(flipDur * 0.45), 12) : prog(frame, at + 2, 12);

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 36,
          background: isBack ? backSurface : cardBg,
          border: `${isBack ? 3 : 1.5}px solid ${isBack ? backBorder : C.line}`,
          boxShadow: dark || lift > 0.1 ? SHADOW_WINDOW : CARD_SHADOW,
          padding: "40px 48px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: isBack ? "rotateY(180deg)" : "rotateY(0deg)",
          opacity: isBack ? (showBack ? 1 : 0) : showBack ? 0 : 1,
          fontFamily: sans,
        }}
      >
        {/* Top bar: pill tag + flip indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 22px",
              borderRadius: 999,
              background: badgeBg,
              border: isBack ? `1.5px solid ${tint(backBorder, 0.35)}` : undefined,
            }}
          >
            <Icon name={icon} size={28} color={badgeFg} weight={2.2} draw={iconDraw} />
            <span
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 24,
                color: badgeFg,
                letterSpacing: "-0.01em",
              }}
            >
              {tag}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 22,
              color: mute,
            }}
          >
            <Icon name="refresh" size={24} color={mute} weight={2} />
            <span>{isBack ? "2 / 2" : "1 / 2"}</span>
          </div>
        </div>

        {/* Center content: title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "auto 0" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 52,
              lineHeight: 1.12,
              letterSpacing: "-0.035em",
              color: fg,
              whiteSpace: "pre-wrap",
            }}
          >
            {title}
          </div>
          {sub ? (
            <div
              style={{
                fontWeight: 500,
                fontSize: 32,
                lineHeight: 1.3,
                letterSpacing: "-0.015em",
                color: mute,
                whiteSpace: "pre-wrap",
              }}
            >
              {sub}
            </div>
          ) : null}
        </div>

        {/* Bottom code bar */}
        {code ? (
          <div
            style={{
              padding: "20px 28px",
              borderRadius: 22,
              background: dark ? "#141416" : isBack ? C.white : TERM.bg,
              border: `1px solid ${dark || !isBack ? "rgba(255,255,255,0.08)" : C.line}`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontVariantLigatures: "none",
            }}
          >
            <Icon
              name="terminal"
              size={30}
              color={isBack && !dark ? tc.fg : TERM.blue}
              weight={2}
            />
            <span
              style={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 30,
                color: isBack && !dark ? C.ink : TERM.fg,
                whiteSpace: "pre",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {code}
            </span>
          </div>
        ) : (
          <div style={{ height: 8 }} />
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        ...materialize(p * (1 - out), 0.95, 8),
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          perspective: "1400px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `rotateY(${deg}deg) scale(${1 + lift * 0.04})`,
          }}
        >
          {renderFace({
            isBack: false,
            tag: frontTag,
            icon: frontIcon,
            title: frontTitle,
            sub: frontSub,
            code: frontCode,
          })}
          {renderFace({
            isBack: true,
            tag: backTag,
            icon: resolvedBackIcon,
            title: backTitle,
            sub: backSub,
            code: backCode,
          })}
        </div>
      </div>
    </div>
  );
};
