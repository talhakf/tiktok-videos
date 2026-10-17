import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, focusTrack, TAB_H, toneColors } from "../dev/card";
import { BLUE_TINT, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type CronTuple = [string, string, string, string, string];

export type CronFocusCue = {
  index: number;
  at: number;
  until?: number;
};

export type CronStepCue = {
  at: number;
  expr: CronTuple;
  meaning: string;
  warn?: boolean;
  command?: string;
};

const FIELD_META: { name: string; range: string }[] = [
  { name: "minute", range: "0–59" },
  { name: "hour", range: "0–23" },
  { name: "day of month", range: "1–31" },
  { name: "month", range: "1–12" },
  { name: "day of week", range: "0–6" },
];

export const CronCard: React.FC<{
  x?: number;
  y: number;
  w?: number;
  at: number;
  until?: number;
  expr: CronTuple;
  command?: string;
  meaning: string;
  warn?: boolean;
  focusField?: CronFocusCue[];
  steps?: CronStepCue[];
}> = ({ x = TX, y, w = 900, at, until, expr, command, meaning, warn = false, focusField = [], steps = [] }) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const baseState: CronStepCue = { at, expr, meaning, warn, command };
  const allSteps = [baseState, ...[...steps].sort((a, b) => a.at - b.at)];
  let curIdx = 0;
  for (let i = 0; i < allSteps.length; i++) {
    if (allSteps[i].at <= frame) curIdx = i;
  }
  const cur = allSteps[curIdx];
  const prev = curIdx > 0 ? allSteps[curIdx - 1] : baseState;
  const stepP = curIdx > 0 ? prog(frame, cur.at, 12, easeInOut) : 1;

  const focus = focusTrack(frame, focusField, 10, 8);
  const focusIdx = focus
    ? lerp(focus.prev ? focus.prev.index : focus.cur.index, focus.cur.index, focus.t)
    : null;

  const padX = 32;
  const gap = 16;
  const slotW = (w - padX * 2 - gap * 4) / 5;
  const slotTop = 26;
  const slotH = 112;
  const h = TAB_H + 318;

  const activeCmd = cur.command ?? command;
  const isWarn = Boolean(cur.warn);
  const prevWarn = Boolean(prev.warn);
  const warnWeight = lerp(prevWarn ? 1 : 0, isWarn ? 1 : 0, stepP);

  const okColors = toneColors("accent");
  const badColors = toneColors("bad");
  const bannerBg = interpolateColors(warnWeight, [0, 1], [okColors.bg, badColors.bg]);
  const bannerEdge = interpolateColors(warnWeight, [0, 1], [okColors.edge, badColors.edge]);
  const bannerFg = interpolateColors(warnWeight, [0, 1], [okColors.fg, badColors.fg]);

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={p}
      filename="crontab -e"
      icon="clock"
      right={activeCmd ? `${cur.expr.join(" ")} ${activeCmd}` : "cron schedule"}
    >
      {/* Gliding focus ring behind the focused field slot */}
      {focus && focusIdx !== null ? (
        <div
          style={{
            position: "absolute",
            left: padX + focusIdx * (slotW + gap) - 6,
            top: slotTop - 6,
            width: slotW + 12,
            height: slotH + 74,
            borderRadius: 24,
            background: tint(C.accent, 0.08),
            border: `2.5px solid ${C.accent}`,
            opacity: focus.o,
          }}
        />
      ) : null}

      {/* 5 Crontab expression slots */}
      {FIELD_META.map((meta, i) => {
        const enterP = prog(frame, at + 4 + i * 2, 10, easeOut);
        const token = cur.expr[i];
        const prevToken = prev.expr[i];
        const changed = curIdx > 0 && token !== prevToken;
        const tokenPop = changed ? prog(frame, cur.at, 10, easeOut) : 1;
        const slotWarn = isWarn && i === 0 && token === "*";
        const isFocused =
          focus !== null &&
          ((focus.cur.index === i && focus.t >= 0.5) || (focus.prev?.index === i && focus.t < 0.5));

        const borderColor = slotWarn
          ? RED
          : isFocused
            ? C.accent
            : "rgba(0,0,0,0.12)";
        const boxBg = slotWarn
          ? "#FFF1F0"
          : isFocused
            ? BLUE_TINT
            : "#F5F5F7";
        const tokenColor = slotWarn ? RED : isFocused ? C.accent : C.ink;

        return (
          <div
            key={meta.name}
            style={{
              position: "absolute",
              left: padX + i * (slotW + gap),
              top: slotTop,
              width: slotW,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              ...materialize(enterP),
            }}
          >
            <div
              style={{
                width: "100%",
                height: slotH,
                borderRadius: 20,
                background: boxBg,
                border: `2.5px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: token.length > 3 ? 34 : 44,
                  color: tokenColor,
                  letterSpacing: "-0.02em",
                  ...materialize(tokenPop, 0.92, 4),
                }}
              >
                {token}
              </div>
              {slotWarn ? (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 10,
                    padding: "2px 8px",
                    borderRadius: 8,
                    background: tint(AMBER, 0.2),
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#A05A00",
                  }}
                >
                  every min
                </div>
              ) : null}
            </div>

            <div
              style={{
                marginTop: 10,
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 19,
                color: isFocused ? C.accent : C.ink,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {meta.name}
            </div>
            <div
              style={{
                marginTop: 2,
                fontFamily: mono,
                fontWeight: 500,
                fontSize: 17,
                color: isFocused ? C.accent : C.mute,
                whiteSpace: "nowrap",
              }}
            >
              ({meta.range})
            </div>
          </div>
        );
      })}

      {/* Meaning translator banner */}
      <div
        style={{
          position: "absolute",
          left: padX,
          right: padX,
          bottom: 24,
          height: 82,
          borderRadius: 20,
          background: bannerBg,
          border: `2px solid ${bannerEdge}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          ...materialize(prog(frame, at + 10, 10, easeOut)),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <Icon
            name={isWarn ? "warning" : "calendar"}
            size={32}
            color={bannerFg}
            weight={2.1}
          />
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 26,
              color: bannerFg,
              letterSpacing: "-0.015em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {cur.meaning}
          </div>
        </div>

        {activeCmd ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 12,
              background: C.white,
              border: `1px solid ${C.line}`,
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 21,
              color: C.ink,
              flexShrink: 0,
            }}
          >
            <Icon name="terminal" size={22} color={C.mute} weight={2} />
            {activeCmd}
          </div>
        ) : null}
      </div>
    </DevCard>
  );
};
