import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans, TERM } from "../../theme";
import { toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

/**
 * `OFFSET 100000 LIMIT 20` (scanning & discarding 100,000 rows in `420 ms`)
 * vs Keyset / Cursor Pagination (`WHERE id > 100000 LIMIT 20` jumping straight
 * via B-Tree index in `0.3 ms`) visual comparison card.
 */
export const PaginationCompare: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  offsetAt?: number;
  cursorAt?: number;
  offsetVal?: number;
  limitVal?: number;
  offsetLatency?: string;
  cursorLatency?: string;
}> = ({
  x = TX,
  y,
  w = TW,
  h = 860,
  at,
  until,
  offsetAt,
  cursorAt,
  offsetVal = 100000,
  limitVal = 20,
  offsetLatency = "420 ms",
  cursorLatency = "0.3 ms",
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const badTone = toneColors("bad");
  const warnTone = toneColors("warn");
  const goodTone = toneColors("good");

  const oStart = offsetAt ?? at + 6;
  const cStart = cursorAt ?? at + 44;

  const scanP = prog(frame, oStart + 4, 28, easeInOut);
  const scannedCount = Math.round(lerp(0, offsetVal, scanP));

  const cursorCardP = prog(frame, cStart, 12, easeOut);
  const arcJumpP = prog(frame, cStart + 6, 16, easeInOut);
  const cursorHitP = prog(frame, cStart + 18, 10, easeOut);

  const discardedBlocks = [
    { range: "1 .. 25k", threshold: 0.25 },
    { range: "25k .. 50k", threshold: 0.5 },
    { range: "50k .. 75k", threshold: 0.75 },
    { range: "75k .. 100k", threshold: 1.0 },
  ];

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
        overflow: "hidden",
        fontFamily: sans,
        ...materialize(vis),
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          height: 74,
          padding: "0 30px",
          borderBottom: `1px solid ${C.line}`,
          background: "#FAFAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: cursorHitP > 0.2 ? goodTone.bg : warnTone.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="database"
              size={22}
              color={cursorHitP > 0.2 ? goodTone.fg : warnTone.fg}
              weight={2.1}
            />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
            OFFSET scan vs Keyset cursor pagination
          </div>
        </div>

        <div
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: cursorHitP > 0.2 ? goodTone.bg : badTone.bg,
            border: `1.5px solid ${cursorHitP > 0.2 ? GREEN : RED}`,
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 700,
            color: cursorHitP > 0.2 ? goodTone.fg : badTone.fg,
          }}
        >
          {cursorHitP > 0.2 ? "1,400× faster · B-Tree seek" : `Scanning ${offsetVal.toLocaleString()} rows`}
        </div>
      </div>

      <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* TOP SECTION: OFFSET 100000 LIMIT 20 (Full Sequential Scan & Discard) */}
        <div
          style={{
            borderRadius: 22,
            background: "#FAFAFC",
            border: `1.5px solid ${tint(RED, 0.3)}`,
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: badTone.bg,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: badTone.fg,
                }}
              >
                OFFSET PAGINATION
              </span>
              <span style={{ fontSize: 19, fontWeight: 600, color: C.ink }}>
                Reads &amp; discards {offsetVal.toLocaleString()} rows from disk
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                background: badTone.bg,
                border: `1.5px solid ${RED}`,
                fontFamily: mono,
                fontSize: 18,
                fontWeight: 700,
                color: badTone.fg,
              }}
            >
              <Icon name="clock" size={18} color={badTone.fg} weight={2.3} />
              {offsetLatency} · O(N)
            </div>
          </div>

          {/* SQL Query Strip */}
          <div
            style={{
              borderRadius: 14,
              background: TERM.bg,
              padding: "12px 18px",
              fontFamily: mono,
              fontSize: 16.5,
              color: TERM.fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ color: TERM.purple, fontWeight: 700 }}>SELECT</span> *{" "}
              <span style={{ color: TERM.purple, fontWeight: 700 }}>FROM</span> events{" "}
              <span style={{ color: TERM.purple, fontWeight: 700 }}>ORDER BY</span> id{" "}
              <span style={{ color: TERM.red, fontWeight: 700 }}>
                OFFSET {offsetVal}
              </span>{" "}
              <span style={{ color: TERM.yellow, fontWeight: 700 }}>LIMIT {limitVal}</span>;
            </div>
            <span style={{ color: TERM.red, fontSize: 14, fontWeight: 700 }}>page #5,001</span>
          </div>

          {/* Visual Row Tape: 4 Discarded Blocks (1..100,000) + 1 Kept Slice (20 rows) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) 1.15fr", gap: 10 }}>
              {discardedBlocks.map((b, idx) => {
                const blockFill = Math.max(
                  0,
                  Math.min(1, (scanP - idx * 0.25) / 0.25),
                );
                const discarded = blockFill >= 0.95;
                return (
                  <div
                    key={b.range}
                    style={{
                      height: 84,
                      borderRadius: 14,
                      background: discarded ? badTone.bg : C.white,
                      border: `2px solid ${blockFill > 0 ? RED : C.line}`,
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: mono,
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: blockFill > 0 ? badTone.fg : C.mute,
                      }}
                    >
                      <span>id {b.range}</span>
                      <Icon
                        name="trash"
                        size={15}
                        color={blockFill > 0 ? badTone.fg : C.mute}
                        weight={2.2}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 13,
                        fontWeight: 700,
                        color: discarded ? badTone.fg : C.mute,
                      }}
                    >
                      {discarded ? "DISCARDED" : blockFill > 0 ? "scanning..." : "25,000 rows"}
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 999,
                        background: "rgba(0,0,0,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${blockFill * 100}%`,
                          height: "100%",
                          background: RED,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Target 20 Rows Slice */}
              <div
                style={{
                  height: 84,
                  borderRadius: 14,
                  background: scanP >= 0.98 ? BLUE_TINT : C.white,
                  border: `2px solid ${scanP >= 0.98 ? C.accent : C.line}`,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: scanP >= 0.98 ? C.accent : C.mute,
                  }}
                >
                  100,001..020
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: scanP >= 0.98 ? C.accent : C.ink,
                  }}
                >
                  RETURN {limitVal}
                </div>
                <div style={{ fontFamily: mono, fontSize: 12, color: C.mute }}>
                  after 100k scan
                </div>
              </div>
            </div>

            {/* Live Discard Counter */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: mono,
                fontSize: 15.5,
                fontWeight: 700,
                color: badTone.fg,
                padding: "4px 6px 0",
              }}
            >
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                Rows scanned &amp; thrown in trash: {scannedCount.toLocaleString()} / {offsetVal.toLocaleString()}
              </span>
              <span>Rows returned: {limitVal} (99.98% wasted I/O)</span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Keyset / Cursor Pagination (WHERE id > 100000 LIMIT 20) */}
        <div
          style={{
            borderRadius: 22,
            background: "#F5FBF7",
            border: `2px solid ${GREEN}`,
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            ...materialize(cursorCardP),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: goodTone.bg,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: goodTone.fg,
                }}
              >
                KEYSET / CURSOR
              </span>
              <span style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>
                Jumps straight via B-Tree index on primary key
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                background: goodTone.bg,
                border: `1.5px solid ${GREEN}`,
                fontFamily: mono,
                fontSize: 18,
                fontWeight: 700,
                color: goodTone.fg,
              }}
            >
              <Icon name="bolt" size={18} color={goodTone.fg} weight={2.3} />
              {cursorLatency} · O(log n)
            </div>
          </div>

          {/* SQL Query Strip */}
          <div
            style={{
              borderRadius: 14,
              background: TERM.bg,
              padding: "12px 18px",
              fontFamily: mono,
              fontSize: 16.5,
              color: TERM.fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ color: TERM.purple, fontWeight: 700 }}>SELECT</span> *{" "}
              <span style={{ color: TERM.purple, fontWeight: 700 }}>FROM</span> events{" "}
              <span style={{ color: TERM.green, fontWeight: 700 }}>
                WHERE id &gt; {offsetVal}
              </span>{" "}
              <span style={{ color: TERM.purple, fontWeight: 700 }}>ORDER BY</span> id{" "}
              <span style={{ color: TERM.yellow, fontWeight: 700 }}>LIMIT {limitVal}</span>;
            </div>
            <span style={{ color: TERM.green, fontSize: 14, fontWeight: 700 }}>cursor={offsetVal}</span>
          </div>

          {/* Visual B-Tree Jump Over Skipped Rows -> Direct Target Slice */}
          <div style={{ position: "relative", paddingTop: 28 }}>
            {/* SVG Jump Arc */}
            <svg
              width={790}
              height={48}
              style={{
                position: "absolute",
                left: 0,
                top: -6,
                pointerEvents: "none",
                overflow: "visible",
              }}
            >
              <path
                d="M 85 36 Q 360 -16 640 32"
                fill="none"
                stroke={GREEN}
                strokeWidth={3.5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - arcJumpP}
              />
              {arcJumpP > 0.85 ? (
                <path
                  d="M 630 24 L 642 33 L 628 38"
                  fill="none"
                  stroke={GREEN}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </svg>

            <div
              style={{
                position: "absolute",
                left: 255,
                top: -4,
                padding: "2px 10px",
                borderRadius: 999,
                background: goodTone.bg,
                border: `1.5px solid ${GREEN}`,
                fontFamily: mono,
                fontSize: 13.5,
                fontWeight: 700,
                color: goodTone.fg,
                ...materialize(Math.max(0.2, arcJumpP)),
              }}
            >
              B-Tree index seek → id &gt; {offsetVal.toLocaleString()}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 200px", gap: 12, alignItems: "center" }}>
              {/* B-Tree Root Pointer */}
              <div
                style={{
                  height: 78,
                  borderRadius: 14,
                  background: C.white,
                  border: `2px solid ${GREEN}`,
                  padding: "10px 14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="sitemap" size={18} color={goodTone.fg} weight={2.2} />
                  <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.ink }}>
                    idx_events_pk
                  </span>
                </div>
                <span style={{ fontFamily: mono, fontSize: 13, color: goodTone.fg, fontWeight: 700 }}>
                  3 tree hops
                </span>
              </div>

              {/* Greyed-out Skipped 100,000 rows */}
              <div
                style={{
                  height: 78,
                  borderRadius: 14,
                  background: "#EFEFF4",
                  border: `1.5px dashed rgba(0,0,0,0.18)`,
                  padding: "0 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: 0.65,
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: C.mute }}>
                  id 1 .. {offsetVal.toLocaleString()}
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: C.white,
                    fontFamily: mono,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: C.mute,
                  }}
                >
                  0 rows scanned · untouched
                </span>
              </div>

              {/* Direct Hit 20 Rows */}
              <div
                style={{
                  height: 78,
                  borderRadius: 14,
                  background: goodTone.bg,
                  border: `2.5px solid ${GREEN}`,
                  padding: "10px 14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  ...materialize(Math.max(0.3, cursorHitP)),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: goodTone.fg }}>
                    100,001..020
                  </span>
                  <Icon name="check" size={17} color={goodTone.fg} weight={2.5} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: C.ink }}>
                  Read {limitVal} rows · {cursorLatency}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
