import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon, IconName } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, easeInOut, materialize, mono, prog, sans, SHADOW_WINDOW, TERM } from "../../theme";
import { Tone, toneColors } from "../dev/card";
import { CARD_SHADOW, presence } from "../diagram/Node";

export type SegmentedTabItem = {
  label: string;
  title: string;
  body: string;
  code?: string;
  stat?: string;
  icon?: IconName;
  tone?: Tone;
};

export type TabSwitchCue = {
  index: number;
  at: number;
};

const glideTab = (frame: number, initial: number, cues: TabSwitchCue[] = [], dur = 12) => {
  let v = initial;
  for (const c of [...cues].sort((a, b) => a.at - b.at)) {
    if (frame < c.at) break;
    const t = prog(frame, c.at, dur, easeInOut);
    v = v + (c.index - v) * t;
    if (t < 1) break;
  }
  return v;
};

const tabWeight = (pos: number, idx: number) => Math.max(0, 1 - Math.abs(pos - idx));

/**
 * Apple-style sliding Segmented Control card: top segmented pill bar where the
 * white active thumb glides smoothly between tabs at `switches` and cross-fades the card body.
 */
export const SegmentedTabs: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  initial?: number;
  tabs: SegmentedTabItem[];
  switches?: TabSwitchCue[];
  dark?: boolean;
}> = ({ x = TX, y = TY, w = TW, h = 470, at = 0, until, initial = 0, tabs, switches = [], dark = false }) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until, 10, 8);
  if (vis === null || tabs.length === 0) return null;

  const s = glideTab(frame, initial, switches, 12);
  const barPad = 6;
  const barW = w - 64;
  const barH = 76;
  const segW = (barW - barPad * 2) / tabs.length;

  const fg = dark ? TERM.fg : C.ink;
  const subFg = dark ? TERM.dim : C.mute;
  const lineCol = dark ? "rgba(255,255,255,0.1)" : C.line;
  const trackBg = dark ? "#2C2C2E" : "#E5E5EA";
  const thumbBg = dark ? "#3A3A3C" : C.white;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 32,
        background: dark ? TERM.bg : C.white,
        border: `1.5px solid ${lineCol}`,
        boxShadow: dark ? SHADOW_WINDOW : CARD_SHADOW,
        padding: "28px 32px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: sans,
        overflow: "hidden",
        ...materialize(vis),
      }}
    >
      {/* Top Segmented Control Pill Bar */}
      <div
        style={{
          position: "relative",
          width: barW,
          height: barH,
          borderRadius: 20,
          background: trackBg,
          flexShrink: 0,
        }}
      >
        {/* Dividers between inactive segments */}
        {tabs.slice(1).map((_, i) => {
          const hide = Math.max(tabWeight(s, i), tabWeight(s, i + 1));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: barPad + segW * (i + 1) - 0.75,
                top: barH * 0.26,
                height: barH * 0.48,
                width: 1.5,
                background: dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)",
                opacity: 1 - hide,
              }}
            />
          );
        })}

        {/* Gliding active thumb */}
        <div
          style={{
            position: "absolute",
            left: barPad + s * segW,
            top: barPad,
            width: segW,
            height: barH - barPad * 2,
            borderRadius: 15,
            background: thumbBg,
            border: "0.5px solid rgba(0,0,0,0.05)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)",
          }}
        />

        {/* Segment labels */}
        {tabs.map((tab, i) => {
          const wgt = tabWeight(s, i);
          return (
            <div
              key={tab.label}
              style={{
                position: "absolute",
                left: barPad + i * segW,
                top: 0,
                width: segW,
                height: barH,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 25,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: interpolateColors(wgt, [0, 1], [subFg, fg]),
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      {/* Cross-fading Tab Body Stage */}
      <div style={{ position: "relative", flex: 1, marginTop: 26 }}>
        {tabs.map((tab, i) => {
          const wgt = tabWeight(s, i);
          if (wgt <= 0.01) return null;
          const tc = toneColors(tab.tone ?? "accent", dark);
          const offsetX = (i - s) * 28;

          return (
            <div
              key={tab.label}
              style={{
                position: "absolute",
                inset: 0,
                opacity: wgt,
                translate: `${offsetX}px 0px`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {tab.icon ? (
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: 16,
                          background: tc.bg,
                          border: `1.5px solid ${tc.edge}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name={tab.icon} size={32} color={tc.fg} weight={2} />
                      </div>
                    ) : null}
                    <div
                      style={{
                        fontSize: 33,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        color: fg,
                        lineHeight: 1.15,
                      }}
                    >
                      {tab.title}
                    </div>
                  </div>

                  {tab.stat ? (
                    <div
                      style={{
                        height: 46,
                        padding: "0 18px",
                        borderRadius: 14,
                        background: tc.bg,
                        border: `1.5px solid ${tc.edge}`,
                        color: tc.fg,
                        fontFamily: mono,
                        fontSize: 23,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tab.stat}
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    marginTop: 18,
                    fontSize: 26,
                    fontWeight: 500,
                    color: subFg,
                    lineHeight: 1.4,
                  }}
                >
                  {tab.body}
                </div>
              </div>

              {tab.code ? (
                <div
                  style={{
                    height: 82,
                    padding: "0 24px",
                    borderRadius: 18,
                    background: dark ? "#161618" : C.paper,
                    border: `1px solid ${lineCol}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: mono,
                    fontSize: 24,
                    fontWeight: 500,
                    color: fg,
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tab.code}</span>
                  <Icon name="terminal" size={26} color={subFg} weight={1.9} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
