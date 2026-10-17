import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX, TW, TY } from "../../layout";
import { C, easeOut, materialize, mono, prog, sans } from "../../theme";
import { alpha, BLUE_TINT, CARD_SHADOW, GREEN, presence, RED } from "../diagram/Node";

export type CalendarMarkKind = "accent" | "good" | "bad" | "ring";

export type CalendarMark = {
  day: number;
  kind: CalendarMarkKind;
  label?: string;
  at?: number;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Clean Apple-style monthly calendar card:
 * - `month: string`, `daysInMonth?: number` (default 31), `startDay?: number` (0=Mon..6=Sun, default 3)
 * - `marks: { day: number; kind: "accent" | "good" | "bad" | "ring"; label?: string; at?: number }[]`
 *   for cron schedules, release dates, streaks, and backup audits.
 */
export const CalendarGrid: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at?: number;
  until?: number;
  month: string;
  subtitle?: string;
  daysInMonth?: number;
  startDay?: number;
  marks?: CalendarMark[];
}> = ({
  x = TX,
  y = TY,
  w = TW,
  h,
  at = 0,
  until,
  month,
  subtitle,
  daysInMonth = 31,
  startDay = 3,
  marks = [],
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until, 10, 8);
  if (vis === null) return null;

  const markMap = new Map<number, CalendarMark>();
  for (const m of marks) markMap.set(m.day, m);

  const totalSlots = startDay + daysInMonth;
  const rows = Math.ceil(totalSlots / 7);
  const cellH = rows > 5 ? 92 : 104;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: C.white,
        border: `1px solid ${C.line}`,
        boxShadow: CARD_SHADOW,
        padding: "32px 36px 34px",
        fontFamily: sans,
        color: C.ink,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        ...materialize(vis),
      }}
    >
      {/* Header: Month title + optional mono subtitle / cron badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 15,
              background: alpha(RED, 0.11),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="calendar" size={30} color={RED} weight={2.1} />
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{month}</div>
        </div>

        {subtitle ? (
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: C.paper,
              border: `1px solid ${C.line}`,
              fontFamily: mono,
              fontSize: 21,
              fontWeight: 600,
              color: C.ink,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Day-of-week header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 10,
          paddingBottom: 4,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        {WEEKDAYS.map((dayName, i) => (
          <div
            key={dayName}
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: 600,
              color: i >= 5 ? C.mute : C.ink,
              opacity: i >= 5 ? 0.7 : 0.85,
              letterSpacing: "-0.01em",
            }}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* 7-column calendar days grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 10,
        }}
      >
        {Array.from({ length: rows * 7 }, (_, slot) => {
          const dayNum = slot - startDay + 1;
          if (dayNum < 1 || dayNum > daysInMonth) {
            return (
              <div
                key={`empty-${slot}`}
                style={{
                  height: cellH,
                  borderRadius: 18,
                  background: "rgba(0,0,0,0.018)",
                }}
              />
            );
          }

          const mark = markMap.get(dayNum);
          const markAt = mark?.at ?? at + 8;
          const mp = mark ? prog(frame, markAt, 10, easeOut) : 0;

          let bg = C.paper;
          let border = "1.5px solid transparent";
          let numCol = C.ink;
          let badgeCol = C.mute;

          if (mark && mp > 0) {
            if (mark.kind === "accent") {
              bg = alpha(C.accent, mp);
              border = `2px solid ${alpha(C.accent, mp)}`;
              numCol = mp > 0.5 ? C.white : C.ink;
              badgeCol = mp > 0.5 ? "rgba(255,255,255,0.9)" : C.accent;
            } else if (mark.kind === "good") {
              bg = alpha(GREEN, 0.14 * mp);
              border = `2px solid ${alpha(GREEN, mp)}`;
              numCol = "#248A3D";
              badgeCol = "#248A3D";
            } else if (mark.kind === "bad") {
              bg = alpha(RED, 0.13 * mp);
              border = `2px solid ${alpha(RED, mp)}`;
              numCol = RED;
              badgeCol = RED;
            } else if (mark.kind === "ring") {
              bg = alpha( C.accent, 0.08 * mp);
              border = `3px solid ${alpha(C.accent, mp)}`;
              numCol = C.accent;
              badgeCol = C.accent;
            }
          }

          return (
            <div
              key={dayNum}
              style={{
                position: "relative",
                height: cellH,
                borderRadius: 18,
                background: bg || BLUE_TINT,
                border,
                scale: mark && mp > 0 && mp < 1 ? String(0.94 + 0.06 * mp) : "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "6px 4px",
              }}
            >
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 27,
                  fontWeight: mark && mp > 0 ? 700 : 600,
                  color: numCol,
                  lineHeight: 1.05,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {dayNum}
              </span>

              {mark && mp > 0 ? (
                mark.label ? (
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 15,
                      fontWeight: 700,
                      color: badgeCol,
                      opacity: mp,
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {mark.label}
                  </span>
                ) : (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      background: badgeCol,
                      opacity: mp,
                    }}
                  />
                )
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
