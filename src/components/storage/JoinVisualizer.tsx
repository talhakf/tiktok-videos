import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, presence } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

export type JoinMode = "INNER JOIN" | "LEFT JOIN" | "FULL JOIN";

export type JoinUserRow = {
  id: number;
  name: string;
};

export type JoinOrderRow = {
  orderId: string;
  userId: number;
  item: string;
};

const DEFAULT_USERS: JoinUserRow[] = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Linus" },
  { id: 3, name: "Sudo" },
];

const DEFAULT_ORDERS: JoinOrderRow[] = [
  { orderId: "#901", userId: 1, item: "Mech Key" },
  { orderId: "#902", userId: 2, item: "ThinkPad" },
  { orderId: "#903", userId: 99, item: "Espresso" },
];

/**
 * SQL Join (`INNER JOIN` / `LEFT JOIN` / `FULL JOIN`) row matcher (`JoinVisualizer`).
 * Shows a left table (`users`), a right table (`orders`), animated SVG connector lines between
 * matching foreign keys (`user.id = order.user_id`), and the resulting joined table below
 * (highlighting `NULL` padding on `LEFT JOIN` at `switchAt`).
 */
export const JoinVisualizer: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  matchAt?: number;
  switchAt?: number;
  fullJoinAt?: number;
  initialMode?: JoinMode;
  switchedMode?: JoinMode;
  users?: JoinUserRow[];
  orders?: JoinOrderRow[];
}> = ({
  x = TX,
  y,
  w = 900,
  h = 790,
  at,
  until,
  matchAt,
  switchAt,
  fullJoinAt,
  initialMode = "INNER JOIN",
  switchedMode = "LEFT JOIN",
  users = DEFAULT_USERS,
  orders = DEFAULT_ORDERS,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const tMatch = matchAt ?? at + 12;
  const matchP = prog(frame, tMatch, 16, easeInOut);
  const switchP = switchAt !== undefined ? prog(frame, switchAt, 12, easeOut) : 0;
  const fullP = fullJoinAt !== undefined ? prog(frame, fullJoinAt, 12, easeOut) : 0;

  const mode: JoinMode =
    fullP > 0.5 ? "FULL JOIN" : switchP > 0.5 ? switchedMode : initialMode;

  const isLeftOrFull = mode === "LEFT JOIN" || mode === "FULL JOIN";
  const isFull = mode === "FULL JOIN";

  const leftJoinP =
    mode === "LEFT JOIN" || mode === "FULL JOIN"
      ? switchAt !== undefined && initialMode === "INNER JOIN"
        ? switchP
        : matchP
      : 0;

  const fullJoinRowP =
    mode === "FULL JOIN"
      ? fullJoinAt !== undefined
        ? fullP
        : matchP
      : 0;

  const accentTone = toneColors("accent");
  const warnTone = toneColors("warn");
  const goodTone = toneColors("good");

  // Layout geometry for top source tables and SVG connector canvas
  const tableW = 316;
  const gapW = w - 64 - tableW * 2; // 900 - 64 - 632 = 204
  const headH = 42;
  const rowH = 52;
  const tableH = headH + users.length * rowH;

  const rowCenterY = (idx: number) => headH + idx * rowH + rowH / 2;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={vis}
      filename="join_query.sql"
      icon="database"
      right={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: isFull ? goodTone.bg : isLeftOrFull ? warnTone.bg : accentTone.bg,
            color: isFull ? goodTone.fg : isLeftOrFull ? warnTone.fg : accentTone.fg,
            fontFamily: mono,
            fontSize: 19,
            fontWeight: 700,
          }}
        >
          <Icon name="merge" size={18} color={isFull ? goodTone.fg : isLeftOrFull ? warnTone.fg : accentTone.fg} weight={2.2} />
          {mode}
        </div>
      }
    >
      <div
        style={{
          padding: "20px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          height: "100%",
          boxSizing: "border-box",
          fontFamily: sans,
        }}
      >
        {/* 1. SQL Query Header Strip */}
        <div
          style={{
            padding: "12px 20px",
            borderRadius: 16,
            background: "#F5F5F7",
            border: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 19,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ color: C.accent, fontWeight: 700 }}>SELECT</span>
            <span style={{ color: C.ink }}>u.id, u.name, o.item</span>
            <span style={{ color: C.accent, fontWeight: 700 }}>FROM</span>
            <span style={{ color: C.ink, fontWeight: 700 }}>users u</span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 8,
                background: isLeftOrFull ? "rgba(255,159,10,0.2)" : BLUE_TINT,
                color: isLeftOrFull ? "#A05A00" : C.accent,
                border: `1.5px solid ${isLeftOrFull ? AMBER : C.accent}`,
                fontWeight: 700,
              }}
            >
              {mode}
            </span>
            <span style={{ color: C.ink, fontWeight: 700 }}>orders o</span>
            <span style={{ color: C.mute }}>ON u.id = o.user_id</span>
          </div>
        </div>

        {/* 2. Left Table (users) + SVG Connectors + Right Table (orders) */}
        <div style={{ position: "relative", height: tableH, display: "flex", alignItems: "flex-start" }}>
          {/* Left Table: users */}
          <div
            style={{
              width: tableW,
              height: tableH,
              borderRadius: 18,
              border: `1.5px solid ${C.line}`,
              background: C.white,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                height: headH,
                background: "#F2F2F4",
                borderBottom: `1px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                fontFamily: mono,
                fontSize: 16,
                fontWeight: 700,
                color: C.mute,
              }}
            >
              <span style={{ color: C.ink }}>users (left)</span>
              <span>PK: id</span>
            </div>
            {users.map((u, idx) => {
              const hasMatch = orders.some((o) => o.userId === u.id);
              const active = hasMatch && matchP > 0.2;
              const keptLeft = !hasMatch && isLeftOrFull && leftJoinP > 0.2;
              const dimmed = !hasMatch && !isLeftOrFull && matchP > 0.4;
              return (
                <div
                  key={u.id}
                  style={{
                    height: rowH,
                    borderTop: idx > 0 ? `1px solid ${C.line}` : undefined,
                    background: active ? BLUE_TINT : keptLeft ? "rgba(255,159,10,0.12)" : C.white,
                    opacity: dimmed ? 0.42 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        padding: "2px 9px",
                        borderRadius: 7,
                        background: active ? C.accent : keptLeft ? AMBER : "#E8E8ED",
                        color: active || keptLeft ? C.white : C.ink,
                        fontFamily: mono,
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      id: {u.id}
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>{u.name}</span>
                  </div>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 14,
                      fontWeight: 700,
                      color: active ? C.accent : keptLeft ? "#A05A00" : C.mute,
                    }}
                  >
                    {hasMatch ? "match ✓" : keptLeft ? "+ NULL" : "dropped"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Middle SVG Foreign Key Connectors */}
          <svg
            width={gapW}
            height={tableH}
            viewBox={`0 0 ${gapW} ${tableH}`}
            style={{ overflow: "visible", flexShrink: 0 }}
          >
            {users.map((u, uIdx) => {
              const oIdx = orders.findIndex((o) => o.userId === u.id);
              const y1 = rowCenterY(uIdx);
              if (oIdx >= 0) {
                const y2 = rowCenterY(oIdx);
                const d = `M 0 ${y1} C ${gapW * 0.45} ${y1}, ${gapW * 0.55} ${y2}, ${gapW} ${y2}`;
                return (
                  <g key={u.id}>
                    <path
                      d={d}
                      fill="none"
                      stroke="rgba(0,0,0,0.08)"
                      strokeWidth={3}
                    />
                    {matchP > 0 ? (
                      <>
                        <path
                          d={d}
                          fill="none"
                          stroke={C.accent}
                          strokeWidth={3.5}
                          strokeLinecap="round"
                          pathLength={1}
                          strokeDasharray={1}
                          strokeDashoffset={1 - matchP}
                        />
                        <circle cx={0} cy={y1} r={5} fill={C.accent} opacity={matchP} />
                        <circle cx={gapW} cy={y2} r={5} fill={C.accent} opacity={matchP} />
                      </>
                    ) : null}
                  </g>
                );
              }
              // Unmatched left row: draw dashed amber connector when LEFT JOIN is active
              return (
                <g key={u.id} opacity={leftJoinP}>
                  <path
                    d={`M 0 ${y1} L ${gapW * 0.62} ${y1}`}
                    fill="none"
                    stroke={AMBER}
                    strokeWidth={3}
                    strokeDasharray="6 6"
                  />
                  <circle cx={0} cy={y1} r={5} fill={AMBER} />
                  <rect
                    x={gapW * 0.62 - 4}
                    y={y1 - 14}
                    width={68}
                    height={28}
                    rx={8}
                    fill="rgba(255,159,10,0.18)"
                    stroke={AMBER}
                    strokeWidth={1.5}
                  />
                  <text
                    x={gapW * 0.62 + 30}
                    y={y1 + 5}
                    textAnchor="middle"
                    fontFamily={mono}
                    fontSize={14}
                    fontWeight={700}
                    fill="#A05A00"
                  >
                    NULL
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Right Table: orders */}
          <div
            style={{
              width: tableW,
              height: tableH,
              borderRadius: 18,
              border: `1.5px solid ${C.line}`,
              background: C.white,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                height: headH,
                background: "#F2F2F4",
                borderBottom: `1px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                fontFamily: mono,
                fontSize: 16,
                fontWeight: 700,
                color: C.mute,
              }}
            >
              <span style={{ color: C.ink }}>orders (right)</span>
              <span>FK: user_id</span>
            </div>
            {orders.map((o, idx) => {
              const hasMatch = users.some((u) => u.id === o.userId);
              const active = hasMatch && matchP > 0.2;
              const keptFull = !hasMatch && isFull && fullJoinRowP > 0.2;
              const dimmed = !hasMatch && !isFull && matchP > 0.4;
              return (
                <div
                  key={o.orderId}
                  style={{
                    height: rowH,
                    borderTop: idx > 0 ? `1px solid ${C.line}` : undefined,
                    background: active ? BLUE_TINT : keptFull ? tint(GREEN, 0.12) : C.white,
                    opacity: dimmed ? 0.42 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        padding: "2px 9px",
                        borderRadius: 7,
                        background: active ? C.accent : keptFull ? GREEN : "#E8E8ED",
                        color: active || keptFull ? C.white : C.ink,
                        fontFamily: mono,
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      uid: {o.userId}
                    </span>
                    <span style={{ fontSize: 19, fontWeight: 600, color: C.ink }}>{o.item}</span>
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>{o.orderId}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Resulting Joined Table */}
        <div
          style={{
            flex: 1,
            borderRadius: 20,
            border: `1.5px solid ${C.line}`,
            background: C.white,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
          }}
        >
          {/* Result Header */}
          <div
            style={{
              height: 46,
              background: "#F2F2F4",
              borderBottom: `1px solid ${C.line}`,
              display: "grid",
              gridTemplateColumns: "110px 180px 150px 1fr 170px",
              alignItems: "center",
              padding: "0 20px",
              fontFamily: mono,
              fontSize: 16,
              fontWeight: 700,
              color: C.mute,
            }}
          >
            <span>u.id</span>
            <span>u.name</span>
            <span>o.order_id</span>
            <span>o.item</span>
            <span style={{ textAlign: "right" }}>join rule</span>
          </div>

          {/* Matched rows */}
          <ResultRow
            p={matchP}
            uid="1"
            name="Ada"
            orderId="#901"
            item="Mech Key"
            tag="u.id = 1 ✓"
            tone="accent"
          />
          <ResultRow
            p={matchP}
            uid="2"
            name="Linus"
            orderId="#902"
            item="ThinkPad"
            tag="u.id = 2 ✓"
            tone="accent"
          />

          {/* Left Join NULL-padded row */}
          {leftJoinP > 0 ? (
            <ResultRow
              p={leftJoinP}
              uid="3"
              name="Sudo"
              orderId="NULL"
              item="NULL"
              nullRight
              tag="LEFT JOIN padded"
              tone="warn"
            />
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                background: "#FAFAFC",
                borderTop: `1px solid ${C.line}`,
                fontFamily: mono,
                fontSize: 17,
                color: C.mute,
              }}
            >
              <span>row u.id = 3 (&apos;Sudo&apos;) excluded by INNER JOIN (0 matching orders)</span>
              <span style={{ fontWeight: 700, color: C.accent }}>2 rows returned</span>
            </div>
          )}

          {/* Optional Full Join orphan order row */}
          {fullJoinRowP > 0 ? (
            <ResultRow
              p={fullJoinRowP}
              uid="NULL"
              name="NULL"
              orderId="#903"
              item="Espresso"
              nullLeft
              tag="FULL JOIN padded"
              tone="good"
            />
          ) : null}
        </div>
      </div>
    </DevCard>
  );
};

const ResultRow: React.FC<{
  p: number;
  uid: string;
  name: string;
  orderId: string;
  item: string;
  nullLeft?: boolean;
  nullRight?: boolean;
  tag: string;
  tone: "accent" | "warn" | "good";
}> = ({ p, uid, name, orderId, item, nullLeft, nullRight, tag, tone }) => {
  const tc = toneColors(tone);
  const nullPill = (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 7,
        background: "rgba(255,159,10,0.22)",
        border: `1.5px solid ${AMBER}`,
        color: "#A05A00",
        fontFamily: mono,
        fontSize: 16,
        fontWeight: 700,
      }}
    >
      NULL
    </span>
  );

  return (
    <div
      style={{
        height: 58,
        borderTop: `1px solid ${C.line}`,
        background: nullRight || nullLeft ? "rgba(255,159,10,0.07)" : C.white,
        display: "grid",
        gridTemplateColumns: "110px 180px 150px 1fr 170px",
        alignItems: "center",
        padding: "0 20px",
        ...materialize(p),
      }}
    >
      <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.ink }}>
        {nullLeft ? nullPill : uid}
      </span>
      <span style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>
        {nullLeft ? nullPill : name}
      </span>
      <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 600, color: C.mute }}>
        {nullRight ? nullPill : orderId}
      </span>
      <span style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>
        {nullRight ? nullPill : item}
      </span>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 8,
            background: tc.bg,
            color: tc.fg,
            fontFamily: mono,
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          {tag}
        </span>
      </div>
    </div>
  );
};
