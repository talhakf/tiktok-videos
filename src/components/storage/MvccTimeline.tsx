import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

/**
 * Postgres MVCC (Multi-Version Concurrency Control) snapshot card (`MvccTimeline`).
 * Shows how a concurrent `Reader (tx 101)` keeps reading tuple version `v1 (xmin: 90, xmax: 102)`
 * without blocking while `Writer (tx 102)` writes `v2 (xmin: 102)` ("Readers never block writers").
 */
export const MvccTimeline: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  readAt?: number;
  writeAt?: number;
  commitAt?: number;
}> = ({
  x = TX,
  y,
  w = 900,
  h = 740,
  at,
  until,
  readAt,
  writeAt,
  commitAt,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const tRead = readAt ?? at + 10;
  const tWrite = writeAt ?? at + 34;
  const tCommit = commitAt ?? at + 68;

  const readP = prog(frame, tRead, 12, easeOut);
  const writeP = prog(frame, tWrite, 14, easeInOut);
  const commitP = prog(frame, tCommit, 12, easeOut);

  const isWriting = writeP > 0.2;
  const isCommitted = commitP > 0.5;

  const goodTone = toneColors("good");
  const warnTone = toneColors("warn");

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={vis}
      filename="postgres_mvcc.heap"
      icon="layers"
      right={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: goodTone.bg,
            color: goodTone.fg,
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          <Icon name="bolt" size={18} color={goodTone.fg} weight={2.2} />
          Readers never block writers
        </div>
      }
    >
      <div
        style={{
          padding: "22px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          height: "100%",
          boxSizing: "border-box",
          fontFamily: sans,
        }}
      >
        {/* 1. Heap Page Tuple Versions (v1 -> v2) */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 22,
            background: "#F5F5F7",
            border: `1px solid ${C.line}`,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="database" size={22} color={C.ink} weight={2} />
              <span style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>
                Heap Page #04 · Tuple Version Chain
              </span>
            </div>
            <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 600, color: C.mute }}>
              no in-place overwrite · append new tuple version
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 18 }}>
            {/* Tuple v1 Card */}
            <div
              style={{
                flex: 1,
                borderRadius: 18,
                background: readP > 0.2 ? BLUE_TINT : C.white,
                border: `2.5px solid ${readP > 0.2 ? C.accent : C.line}`,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      background: C.accent,
                      color: C.white,
                      fontFamily: mono,
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    v1
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 600, color: C.mute }}>
                    ctid (0,1)
                  </span>
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: tint(C.accent, 0.14),
                    color: C.accent,
                    fontFamily: mono,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  read by tx 101
                </span>
              </div>

              {/* xmin / xmax badges */}
              <div style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: C.white,
                    border: `1px solid ${C.line}`,
                    fontFamily: mono,
                    fontSize: 16,
                  }}
                >
                  <span style={{ color: C.mute }}>xmin: </span>
                  <span style={{ fontWeight: 700, color: "#248A3D" }}>90</span>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: isWriting ? "rgba(255,159,10,0.16)" : C.white,
                    border: `1.5px solid ${isWriting ? AMBER : C.line}`,
                    fontFamily: mono,
                    fontSize: 16,
                  }}
                >
                  <span style={{ color: C.mute }}>xmax: </span>
                  <span style={{ fontWeight: 700, color: isWriting ? "#A05A00" : C.mute }}>
                    {isWriting ? "102" : "∞ (0)"}
                  </span>
                </div>
              </div>

              {/* Row payload */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: C.white,
                  border: `1px solid ${C.line}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: mono,
                  fontSize: 18,
                }}
              >
                <span style={{ color: C.ink, fontWeight: 600 }}>user: &apos;alice&apos;</span>
                <span style={{ color: C.accent, fontWeight: 700, fontSize: 22 }}>$500</span>
              </div>
            </div>

            {/* Version Pointer Arrow */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 66,
                gap: 6,
                opacity: writeP > 0 ? Math.max(0.25, writeP) : 0.25,
              }}
            >
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.mute }}>
                t_ctid
              </span>
              <Icon
                name="arrowRight"
                size={30}
                color={isCommitted ? GREEN : isWriting ? AMBER : C.mute}
                weight={2.2}
              />
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.mute }}>
                (0,2)
              </span>
            </div>

            {/* Tuple v2 Card */}
            <div
              style={{
                flex: 1,
                borderRadius: 18,
                background: isCommitted
                  ? "#EEFAF1"
                  : isWriting
                    ? "rgba(255,159,10,0.10)"
                    : "#FAFAFC",
                border: `2.5px ${isWriting ? "solid" : "dashed"} ${
                  isCommitted ? GREEN : isWriting ? AMBER : C.line
                }`,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: isWriting ? "0 4px 12px rgba(0,0,0,0.04)" : undefined,
                ...(writeP > 0 ? materialize(writeP) : { opacity: 0.4 }),
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      background: isCommitted ? GREEN : isWriting ? AMBER : "#E8E8ED",
                      color: isWriting ? C.white : C.mute,
                      fontFamily: mono,
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    v2
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 600, color: C.mute }}>
                    ctid (0,2)
                  </span>
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: isCommitted ? goodTone.bg : isWriting ? warnTone.bg : "#E8E8ED",
                    color: isCommitted ? goodTone.fg : isWriting ? warnTone.fg : C.mute,
                    fontFamily: mono,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {isCommitted ? "committed · head" : isWriting ? "written by tx 102" : "free slot"}
                </span>
              </div>

              {/* xmin / xmax badges */}
              <div style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: C.white,
                    border: `1.5px solid ${isCommitted ? GREEN : isWriting ? AMBER : C.line}`,
                    fontFamily: mono,
                    fontSize: 16,
                  }}
                >
                  <span style={{ color: C.mute }}>xmin: </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: isCommitted ? "#248A3D" : isWriting ? "#A05A00" : C.mute,
                    }}
                  >
                    {isWriting ? "102" : "—"}
                  </span>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: C.white,
                    border: `1px solid ${C.line}`,
                    fontFamily: mono,
                    fontSize: 16,
                  }}
                >
                  <span style={{ color: C.mute }}>xmax: </span>
                  <span style={{ fontWeight: 700, color: C.mute }}>{isWriting ? "∞ (0)" : "—"}</span>
                </div>
              </div>

              {/* Row payload */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: C.white,
                  border: `1px solid ${C.line}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: mono,
                  fontSize: 18,
                }}
              >
                <span style={{ color: C.ink, fontWeight: 600 }}>user: &apos;alice&apos;</span>
                <span
                  style={{
                    color: isCommitted ? "#248A3D" : isWriting ? "#A05A00" : C.mute,
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                >
                  {isWriting ? "$400" : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Concurrent Reader & Writer Transaction Lanes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
          {/* Lane 1: Reader (tx 101) */}
          <div
            style={{
              padding: "16px 22px",
              borderRadius: 18,
              background: BLUE_TINT,
              border: `2px solid ${C.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              ...materialize(readP),
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="eye" size={22} color={C.accent} weight={2.2} />
                <span style={{ fontSize: 21, fontWeight: 700, color: C.ink }}>
                  Reader (tx 101)
                </span>
                <span
                  style={{
                    padding: "2px 9px",
                    borderRadius: 7,
                    background: C.white,
                    color: C.accent,
                    fontFamily: mono,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  snapshot = 101
                </span>
              </div>
              <span style={{ fontFamily: mono, fontSize: 17, color: C.mute }}>
                SELECT balance → sees v1 (xmin: 90 ≤ 101 &lt; xmax: 102)
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: C.white,
                  border: `1.5px solid ${C.accent}`,
                  fontFamily: mono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.accent,
                }}
              >
                reads v1 = $500 · 0 locks
              </div>
            </div>
          </div>

          {/* Lane 2: Writer (tx 102) */}
          <div
            style={{
              padding: "16px 22px",
              borderRadius: 18,
              background: isCommitted ? "#EEFAF1" : isWriting ? "rgba(255,159,10,0.10)" : "#F5F5F7",
              border: `2px solid ${isCommitted ? GREEN : isWriting ? AMBER : C.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: isWriting ? 1 : 0.55,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon
                  name={isCommitted ? "checkCircle" : "code"}
                  size={22}
                  color={isCommitted ? GREEN : isWriting ? AMBER : C.mute}
                  weight={2.2}
                />
                <span style={{ fontSize: 21, fontWeight: 700, color: C.ink }}>
                  Writer (tx 102)
                </span>
                <span
                  style={{
                    padding: "2px 9px",
                    borderRadius: 7,
                    background: C.white,
                    color: isCommitted ? "#248A3D" : "#A05A00",
                    fontFamily: mono,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {isCommitted ? "COMMITTED" : isWriting ? "WRITING v2" : "WAITING"}
                </span>
              </div>
              <span style={{ fontFamily: mono, fontSize: 17, color: C.mute }}>
                UPDATE balance = $400 → stamps v1.xmax = 102 &amp; appends v2 (xmin: 102)
              </span>
            </div>

            <div
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                background: C.white,
                border: `1.5px solid ${isCommitted ? GREEN : isWriting ? AMBER : C.line}`,
                fontFamily: mono,
                fontSize: 18,
                fontWeight: 700,
                color: isCommitted ? "#248A3D" : isWriting ? "#A05A00" : C.mute,
              }}
            >
              {isCommitted ? "v2 ($400) live ✓" : isWriting ? "writes v2 ($400)" : "queued"}
            </div>
          </div>
        </div>

        {/* 3. MVCC Visibility Rule Footer */}
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 14,
            background: "#F5F5F7",
            border: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 16,
            color: C.mute,
          }}
        >
          <span>
            <strong style={{ color: C.ink }}>MVCC visibility rule:</strong> xmin ≤ snapshot_txid &lt; xmax
          </span>
          <span style={{ color: C.accent, fontWeight: 700 }}>
            dead v1 cleaned later by VACUUM
          </span>
        </div>
      </div>
    </DevCard>
  );
};
