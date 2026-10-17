import { interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";
import { RED } from "../layouts/Mark";
import { MacWindow, tint } from "./MacWindow";

// Unbranded macOS-Mail-style mockups (added 2026-10-12 for email-plus): an inbox list where new mail
// arrives at the top and pushes the rest down, and an open message whose To / From line can mark one
// part of the address (a "+tag", a look-alike domain) with a tinted pill and a blue focus ring.
// Fake addresses only (yourname@…, *.example).

/** A tinted pill + focus ring that locks onto a piece of inline text at `at` (ring until `ringUntil`). */
const MarkedText: React.FC<{ text: string; at: number; ringUntil?: number; color?: string; frame: number }> = ({ text, at, ringUntil, color = C.accent, frame }) => {
  const p = prog(frame, at, 10);
  const ring = p * (ringUntil !== undefined ? 1 - prog(frame, ringUntil, 8) : 1);
  return (
    // the margin opens a little room so the ring never touches the neighbouring characters
    <span style={{ position: "relative", margin: `0 ${0.16 * p}em`, color: interpolateColors(p, [0, 1], [C.ink, color]) }}>
      <span
        style={{
          position: "absolute",
          left: "-0.08em",
          right: "-0.08em",
          top: "-0.1em",
          bottom: "-0.1em",
          borderRadius: "0.3em",
          background: tint(color, 0.12 * p),
          boxShadow: `0 0 0 ${3 * ring}px ${tint(color, 0.9 * ring)}`,
          scale: String(1.12 - 0.12 * p),
          opacity: p,
        }}
      />
      <span style={{ position: "relative" }}>{text}</span>
    </span>
  );
};

/** Address with an optional marked substring (first occurrence). */
const Address: React.FC<{ text: string; mark?: MailMark; frame: number }> = ({ text, mark, frame }) => {
  if (!mark || frame < mark.at) return <>{text}</>;
  const i = text.indexOf(mark.text);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <MarkedText text={mark.text} at={mark.at} ringUntil={mark.ringUntil} color={mark.color} frame={frame} />
      {text.slice(i + mark.text.length)}
    </>
  );
};

export type MailMark = { text: string; at: number; ringUntil?: number; color?: string };

/**
 * Open message: From (avatar initial + name), To (mono address, `toMark` marks part of it), Subject,
 * grey body lines and an optional red "Spam" chip. Header rows stagger in after `at`.
 */
export const MailMessage: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  from: string;
  fromAddress?: string;
  to: string;
  toMark?: MailMark;
  subject: string;
  body?: string[];
  time?: string;
  spam?: boolean;
  title?: string;
  size?: number; // To-line font size
}>
= ({ x, y, w = 900, h = 560, at, until, from, fromAddress, to, toMark, subject, body = [], time = "9:41", spam, title = "Mail", size = 40 }) => {
  const frame = useCurrentFrame();
  const row = (i: number): React.CSSProperties => ({ ...materialize(at <= 0 ? 1 : prog(frame, at + 4 + i * 2, 9), 0.98, 6) });
  return (
    <MacWindow x={x} y={y} w={w} h={h} at={at} until={until} title={title}>
      <div style={{ padding: "30px 40px", fontFamily: sans, display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, ...row(0) }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, background: spam ? tint(RED, 0.14) : C.soft, color: spam ? RED : C.mute, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 34, flexShrink: 0 }}>
            {from.slice(0, 1)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: C.ink, whiteSpace: "nowrap" }}>{from}</div>
            {fromAddress ? <div style={{ fontFamily: mono, fontSize: 24, color: C.mute, whiteSpace: "nowrap" }}>{fromAddress}</div> : null}
          </div>
          {spam ? (
            <div style={{ padding: "6px 18px", borderRadius: 999, background: tint(RED, 0.12), color: RED, fontWeight: 700, fontSize: 24 }}>spam</div>
          ) : null}
          <div style={{ fontSize: 24, color: C.mute }}>{time}</div>
        </div>
        <div style={{ height: 1, background: C.line, ...row(1) }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, ...row(1) }}>
          <span style={{ fontWeight: 600, fontSize: 28, color: C.mute, width: 54, flexShrink: 0 }}>To:</span>
          <span style={{ fontFamily: mono, fontWeight: 500, fontSize: size, color: C.ink, whiteSpace: "nowrap" }}>
            <Address text={to} mark={toMark} frame={frame} />
          </span>
        </div>
        <div style={{ height: 1, background: C.line, ...row(2) }} />
        <div style={{ fontWeight: 700, fontSize: 40, letterSpacing: "-0.03em", lineHeight: 1.1, color: C.ink, ...row(2) }}>{subject}</div>
        {body.map((b, i) => (
          <div key={i} style={{ fontSize: 28, lineHeight: 1.3, color: C.mute, ...row(3 + i) }}>
            {b}
          </div>
        ))}
      </div>
    </MacWindow>
  );
};

export type InboxRow = {
  from: string;
  subject: string;
  preview?: string;
  tag?: string; // the "+tag" the mail was sent to, shown as a mono chip next to the sender
  time?: string;
  unread?: boolean;
  spam?: boolean; // red chip
  at?: number; // arrives at the top (grows in, pushes the rows below down); omitted = there from the start
};

/**
 * Inbox list in a light window. Rows are listed top first; a row with `at` arrives (height grows, it
 * materializes) and pushes the others down. `focus` tints one row blue; `markTag` rings a row's tag chip.
 */
export const MailInbox: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  rows: InboxRow[];
  title?: string;
  rowH?: number;
  focus?: { row: number; at: number; until?: number }[];
  markTag?: { row: number; at: number; until?: number };
}> = ({ x, y, w = 900, h = 600, at, until, rows, title = "Inbox", rowH = 116, focus = [], markTag }) => {
  const frame = useCurrentFrame();
  return (
    <MacWindow x={x} y={y} w={w} h={h} at={at} until={until} title={title}>
      <div style={{ fontFamily: sans }}>
        {rows.map((r, i) => {
          const g = r.at === undefined ? 1 : prog(frame, r.at, 10, easeOut);
          if (g <= 0) return null;
          const f = focus.find((q) => q.row === i && frame >= q.at && (q.until === undefined || frame < q.until + 8));
          const fp = f ? prog(frame, f.at, 8) * (f.until !== undefined ? 1 - prog(frame, f.until, 8) : 1) : 0;
          const tagColor = r.spam ? RED : C.accent;
          const ring = markTag && markTag.row === i ? prog(frame, markTag.at, 10) * (markTag.until !== undefined ? 1 - prog(frame, markTag.until, 8) : 1) : 0;
          return (
            <div key={i} style={{ height: rowH * g, overflow: "hidden" }}>
              <div
                style={{
                  height: rowH,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "0 34px 0 22px",
                  borderBottom: `1px solid ${C.line}`,
                  background: tint("#0071E3", 0.08 * fp),
                  ...materialize(g, 0.98, 6),
                  translate: `0px ${interpolate(g, [0, 1], [-rowH * 0.4, 0])}px`,
                }}
              >
                <div style={{ width: 14, height: 14, borderRadius: 7, background: r.unread ? C.accent : "transparent", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", color: C.ink, whiteSpace: "nowrap" }}>{r.from}</span>
                    {r.tag ? (
                      <span
                        style={{
                          fontFamily: mono,
                          fontWeight: 500,
                          fontSize: 24,
                          padding: "3px 12px",
                          borderRadius: 10,
                          background: tint(tagColor, 0.1),
                          color: tagColor,
                          whiteSpace: "nowrap",
                          boxShadow: ring > 0 ? `0 0 0 ${4 * ring}px ${tint(C.accent, 0.9 * ring)}` : undefined,
                        }}
                      >
                        {r.tag}
                      </span>
                    ) : null}
                    {r.spam ? (
                      <span style={{ fontWeight: 700, fontSize: 22, padding: "3px 12px", borderRadius: 999, background: tint(RED, 0.12), color: RED }}>spam</span>
                    ) : null}
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 24, color: C.mute, whiteSpace: "nowrap" }}>{r.time ?? ""}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 27, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 4 }}>{r.subject}</div>
                  {r.preview ? (
                    <div style={{ fontSize: 25, color: C.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{r.preview}</div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </MacWindow>
  );
};
