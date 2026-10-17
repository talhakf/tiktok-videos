import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { C, materialize, mono, prog, sans } from "../../theme";
import { presence, tint } from "./MacWindow";
import { splitUrl } from "./BrowserWindow";

// A standalone URL pill, e.g. quiz options in a phishing video ("paypal.com" vs "paypa1.com").

type Part = { t: string; c?: string; b?: boolean };
const STATE = { neutral: C.line, safe: "#34C759", danger: "#FF3B30" };

/** Grey everything except the registrable domain ("login.paypal.com/x" → "paypal.com" in ink). */
const domainParts = (url: string): Part[] => {
  const { proto, host, rest } = splitUrl(url);
  const labels = host.split(".");
  const n = labels.length;
  const keep = n >= 3 && labels[n - 2].length <= 3 && labels[n - 1].length === 2 ? 3 : 2; // co.uk, com.au
  const sub = labels.slice(0, Math.max(0, n - keep)).join(".");
  return [
    { t: proto + (sub ? sub + "." : ""), c: C.mute },
    { t: labels.slice(-keep).join("."), c: C.ink, b: true },
    { t: rest, c: C.mute },
  ].filter((p) => p.t);
};

/**
 * URL pill. `parts: "domain"` greys everything but the registrable domain (or pass coloured parts).
 * `state` "safe" / "danger" turns the border green / red and swaps the padlock for a green lock or a red
 * warning; with `stateAt` it starts neutral and switches at that frame (the quiz reveal). `mark` tints the
 * first match of a substring at a frame (e.g. the "1" in "paypa1.com"). `size` = font size; x, y = top-left.
 */
export const UrlBar: React.FC<{
  url: string;
  x: number;
  y: number;
  w?: number;
  at?: number;
  until?: number;
  size?: number;
  parts?: "domain" | Part[];
  state?: "neutral" | "safe" | "danger";
  stateAt?: number;
  mark?: { t: string; at: number; color?: string };
  font?: "sans" | "mono";
  align?: "center" | "left";
}> = ({ url, x, y, w = 640, at = 0, until, size = 40, parts, state = "neutral", stateAt, mark, font = "sans", align = "center" }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;
  const sp = state === "neutral" ? 0 : stateAt === undefined ? 1 : prog(frame, stateAt, 6);
  const border = interpolateColors(sp, [0, 1], [STATE.neutral, STATE[state]]);
  const segs: Part[] = parts === "domain" ? domainParts(url) : parts ?? [{ t: url, c: C.ink }];

  // Split the parts around the marked substring so it can carry its own tint.
  const full = segs.map((s) => s.t).join("");
  const ms = mark ? full.indexOf(mark.t) : -1;
  const me = ms + (mark?.t.length ?? 0);
  const mp = mark && ms >= 0 ? prog(frame, mark.at, 6) : 0;
  const mc = mark?.color ?? STATE.danger;
  const spans: React.ReactNode[] = [];
  let off = 0;
  segs.forEach((s, i) => {
    const cuts = [0, ms - off, me - off, s.t.length].map((c) => Math.max(0, Math.min(s.t.length, c)));
    for (let k = 0; k < 3; k++) {
      const t = s.t.slice(cuts[k], cuts[k + 1]);
      if (!t) continue;
      const marked = k === 1 && mp > 0;
      spans.push(
        <span
          key={`${i}-${k}`}
          style={{
            color: marked ? interpolateColors(mp, [0, 1], [s.c ?? C.ink, mc]) : s.c ?? C.ink,
            fontWeight: s.b || marked ? 700 : 500,
            background: marked ? tint(mc, 0.14 * mp) : undefined,
            borderRadius: 6,
            padding: marked ? "0 2px" : undefined,
          }}
        >
          {t}
        </span>,
      );
    }
    off += s.t.length;
  });

  const ic = size * 0.9;
  const icon = (name: "lock" | "warning", color: string, o: number) => (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Icon name={name} size={ic} color={color} weight={2.1} />
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: size * 2.1,
        borderRadius: size * 1.05,
        background: C.white,
        border: `3px solid ${border}`,
        boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: size * 0.35,
        padding: `0 ${size * 0.8}px`,
        fontFamily: font === "mono" ? mono : sans,
        fontSize: size,
        letterSpacing: font === "mono" ? 0 : "-0.01em",
        whiteSpace: "pre",
        ...materialize(p),
      }}
    >
      <div style={{ position: "relative", width: ic, height: ic, flexShrink: 0 }}>
        {icon("lock", state === "safe" ? interpolateColors(sp, [0, 1], [C.mute, STATE.safe]) : C.mute, state === "danger" ? 1 - sp : 1)}
        {state === "danger" ? icon("warning", STATE.danger, sp) : null}
      </div>
      <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{spans}</div>
    </div>
  );
};
