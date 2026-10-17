import { interpolateColors, useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TX } from "../../layout";
import { C, easeInOut, easeOut, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { BLUE_TINT, GREEN, lerp, presence, RED } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

/**
 * SQL ACID Transaction & Rollback visualizer (`AcidTransactions`).
 * Shows two account balances (`Alice: $500`, `Bob: $200`) and a live SQL transaction log:
 * `BEGIN`, `UPDATE alice - $100`, either `CRASH / ERROR` at `crashAt` + `ROLLBACK` at `rollbackAt`
 * (restoring Alice's `$500` atomically), or `COMMIT` at `commitAt` locking both changes in green.
 */
export const AcidTransactions: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  fromName?: string;
  toName?: string;
  fromInitial?: number;
  toInitial?: number;
  amount?: number;
  beginAt?: number;
  debitAt?: number;
  crashAt?: number;
  rollbackAt?: number;
  creditAt?: number;
  commitAt?: number;
}> = ({
  x = TX,
  y,
  w = 900,
  h = 700,
  at,
  until,
  fromName = "Alice",
  toName = "Bob",
  fromInitial = 500,
  toInitial = 200,
  amount = 100,
  beginAt,
  debitAt,
  crashAt,
  rollbackAt,
  creditAt,
  commitAt,
}) => {
  const frame = useCurrentFrame();
  const vis = presence(frame, at, until);
  if (vis === null) return null;

  const tBegin = beginAt ?? at + 8;
  const tDebit = debitAt ?? at + 24;

  const beginP = prog(frame, tBegin, 10, easeOut);
  const debitP = prog(frame, tDebit, 12, easeInOut);
  const crashP = crashAt !== undefined ? prog(frame, crashAt, 10, easeOut) : 0;
  const rollbackP = rollbackAt !== undefined ? prog(frame, rollbackAt, 14, easeInOut) : 0;
  const tCredit = creditAt ?? (commitAt !== undefined ? commitAt - 16 : undefined);
  const creditP = tCredit !== undefined ? prog(frame, tCredit, 12, easeInOut) : 0;
  const commitP = commitAt !== undefined ? prog(frame, commitAt, 12, easeOut) : 0;

  // Compute live balances
  const aliceAfterDebit = fromInitial - amount * debitP;
  const aliceBalance = Math.round(lerp(aliceAfterDebit, fromInitial, rollbackP));
  const bobBalance = Math.round(toInitial + amount * creditP);

  const isCommitted = commitP > 0.5;
  const isRolledBack = rollbackP > 0.5;
  const isCrashed = crashP > 0.5 && !isRolledBack;
  const isDirty = debitP > 0.5 && !isRolledBack && !isCommitted;

  const goodTone = toneColors("good");
  const badTone = toneColors("bad");
  const warnTone = toneColors("warn");
  const accentTone = toneColors("accent");

  // Header status badge
  const statusBadge = (() => {
    if (isCommitted) {
      return { bg: goodTone.bg, fg: goodTone.fg, icon: "lock" as const, text: "COMMITTED · durable" };
    }
    if (isRolledBack) {
      return { bg: accentTone.bg, fg: accentTone.fg, icon: "refresh" as const, text: "ROLLED BACK · atomic" };
    }
    if (isCrashed) {
      return { bg: badTone.bg, fg: badTone.fg, icon: "warning" as const, text: "CRASHED · uncommitted" };
    }
    if (beginP > 0.2) {
      return { bg: warnTone.bg, fg: warnTone.fg, icon: "clock" as const, text: "TX #4092 · in flight" };
    }
    return { bg: "#F2F2F4", fg: C.mute, icon: "database" as const, text: "idle" };
  })();

  const aliceBorder = isCommitted
    ? GREEN
    : isRolledBack
      ? C.accent
      : isCrashed
        ? RED
        : isDirty
          ? AMBER
          : C.line;

  const aliceBg = isCommitted
    ? "#EEFAF1"
    : isRolledBack
      ? BLUE_TINT
      : isCrashed
        ? "#FFF1F0"
        : isDirty
          ? "rgba(255,159,10,0.08)"
          : "#F8F8FA";

  const bobBorder = isCommitted
    ? GREEN
    : creditP > 0.5
      ? AMBER
      : isCrashed
        ? RED
        : C.line;

  const bobBg = isCommitted
    ? "#EEFAF1"
    : creditP > 0.5
      ? "rgba(255,159,10,0.08)"
      : isCrashed
        ? "#FFF1F0"
        : "#F8F8FA";

  const totalBalance = aliceBalance + bobBalance;
  const expectedTotal = fromInitial + toInitial;

  return (
    <DevCard
      x={x}
      y={y}
      w={w}
      h={h}
      p={vis}
      filename="tx_transfer.sql"
      icon="database"
      right={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: statusBadge.bg,
            color: statusBadge.fg,
            fontFamily: mono,
            fontSize: 19,
            fontWeight: 700,
          }}
        >
          <Icon name={statusBadge.icon} size={18} color={statusBadge.fg} weight={2.2} />
          {statusBadge.text}
        </div>
      }
    >
      <div
        style={{
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          height: "100%",
          boxSizing: "border-box",
          fontFamily: sans,
        }}
      >
        {/* 1. Account Balance Cards */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Alice Card */}
          <div
            style={{
              flex: 1,
              padding: "18px 24px",
              borderRadius: 22,
              background: aliceBg,
              border: `2.5px solid ${aliceBorder}`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="user" size={24} color={C.ink} weight={2} />
                <span style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>{fromName}</span>
                <span style={{ fontFamily: mono, fontSize: 18, color: C.mute }}>id = 1</span>
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  background: isCommitted
                    ? tint(GREEN, 0.16)
                    : isRolledBack
                      ? tint(C.accent, 0.14)
                      : isDirty
                        ? "rgba(255,159,10,0.2)"
                        : "rgba(0,0,0,0.06)",
                  color: isCommitted
                    ? "#248A3D"
                    : isRolledBack
                      ? C.accent
                      : isDirty
                        ? "#A05A00"
                        : C.mute,
                }}
              >
                {isCommitted
                  ? "committed"
                  : isRolledBack
                    ? "restored (+$100)"
                    : isDirty
                      ? `dirty (-$${amount})`
                      : "clean"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 52,
                  fontWeight: 700,
                  color: isCommitted ? "#248A3D" : isRolledBack ? C.accent : isCrashed ? "#C9281E" : C.ink,
                  letterSpacing: "-0.03em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ${aliceBalance}
              </div>
              <div style={{ fontFamily: mono, fontSize: 18, color: C.mute }}>
                start: ${fromInitial}
              </div>
            </div>
          </div>

          {/* Transfer Connector */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              width: 120,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                background: isRolledBack ? BLUE_TINT : isCrashed ? badTone.bg : "#F2F2F4",
                color: isRolledBack ? C.accent : isCrashed ? badTone.fg : C.ink,
                fontFamily: mono,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {isRolledBack ? "UNDO" : `$${amount}`}
            </div>
            <Icon
              name={isCrashed ? "crossCircle" : isRolledBack ? "refresh" : "arrowRight"}
              size={34}
              color={isCommitted ? GREEN : isRolledBack ? C.accent : isCrashed ? RED : C.mute}
              weight={2.2}
            />
            <div style={{ fontFamily: mono, fontSize: 15, color: C.mute }}>
              sum: ${totalBalance}
            </div>
          </div>

          {/* Bob Card */}
          <div
            style={{
              flex: 1,
              padding: "18px 24px",
              borderRadius: 22,
              background: bobBg,
              border: `2.5px solid ${bobBorder}`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="user" size={24} color={C.ink} weight={2} />
                <span style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>{toName}</span>
                <span style={{ fontFamily: mono, fontSize: 18, color: C.mute }}>id = 2</span>
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontFamily: mono,
                  fontSize: 16,
                  fontWeight: 700,
                  background: isCommitted
                    ? tint(GREEN, 0.16)
                    : isCrashed
                      ? badTone.bg
                      : creditP > 0.5
                        ? "rgba(255,159,10,0.2)"
                        : "rgba(0,0,0,0.06)",
                  color: isCommitted
                    ? "#248A3D"
                    : isCrashed
                      ? badTone.fg
                      : creditP > 0.5
                        ? "#A05A00"
                        : C.mute,
                }}
              >
                {isCommitted
                  ? `committed (+$${amount})`
                  : isCrashed
                    ? "never credited!"
                    : creditP > 0.5
                      ? `dirty (+$${amount})`
                      : "unchanged"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 52,
                  fontWeight: 700,
                  color: isCommitted ? "#248A3D" : C.ink,
                  letterSpacing: "-0.03em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ${bobBalance}
              </div>
              <div style={{ fontFamily: mono, fontSize: 18, color: C.mute }}>
                start: ${toInitial}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Transaction Log (WAL) */}
        <div
          style={{
            flex: 1,
            borderRadius: 20,
            background: "#F5F5F7",
            border: `1px solid ${C.line}`,
            padding: "16px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
            <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.mute }}>
              transaction log (write-ahead log)
            </span>
            <span
              style={{
                fontFamily: mono,
                fontSize: 17,
                fontWeight: 600,
                color: totalBalance === expectedTotal ? "#248A3D" : "#C9281E",
              }}
            >
              invariant: ${fromName} + ${toName} = ${totalBalance} {totalBalance === expectedTotal ? "✓" : `≠ $${expectedTotal} (missing $${expectedTotal - totalBalance}!)`}
            </span>
          </div>

          {/* Step 1: BEGIN */}
          <TxStepRow
            p={beginP}
            step="01"
            sql="BEGIN TRANSACTION;"
            badge="tx #4092 open"
            tone="accent"
          />

          {/* Step 2: DEBIT ALICE */}
          <TxStepRow
            p={debitP}
            step="02"
            sql={`UPDATE accounts SET bal = bal - ${amount} WHERE name = '${fromName}';`}
            badge={isRolledBack ? `undone → $${fromInitial}` : `${fromName}: $${fromInitial} → $${fromInitial - amount}`}
            tone={isRolledBack ? "accent" : isCommitted ? "good" : "warn"}
            struck={isRolledBack}
          />

          {/* Step 3: Either CRASH or CREDIT BOB */}
          {crashAt !== undefined ? (
            <TxStepRow
              p={crashP}
              step="03"
              sql={`UPDATE accounts SET bal = bal + ${amount} WHERE name = '${toName}';`}
              badge="⚡ CRASH · server died mid-tx"
              tone="bad"
            />
          ) : (
            <TxStepRow
              p={creditP}
              step="03"
              sql={`UPDATE accounts SET bal = bal + ${amount} WHERE name = '${toName}';`}
              badge={`${toName}: $${toInitial} → $${toInitial + amount}`}
              tone={isCommitted ? "good" : "warn"}
            />
          )}

          {/* Step 4: Either ROLLBACK or COMMIT */}
          {rollbackAt !== undefined ? (
            <TxStepRow
              p={rollbackP}
              step="04"
              sql={`ROLLBACK; -- restore ${fromName} to $${fromInitial}`}
              badge="all or nothing ✓"
              tone="good"
            />
          ) : commitAt !== undefined ? (
            <TxStepRow
              p={commitP}
              step="04"
              sql="COMMIT; -- fsync WAL & lock both updates"
              badge="persisted ✓"
              tone="good"
            />
          ) : null}
        </div>

        {/* 3. Footer ACID summary strip */}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { k: "Atomicity", d: "all steps or none", active: isRolledBack || isCrashed || isCommitted },
            { k: "Consistency", d: `sum stays $${expectedTotal}`, active: isRolledBack || isCommitted },
            { k: "Isolation", d: "no dirty reads", active: isDirty },
            { k: "Durability", d: "survives crash", active: isCommitted },
          ].map((pill) => {
            const c = pill.active ? C.accent : C.mute;
            return (
              <div
                key={pill.k}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: pill.active ? BLUE_TINT : "#F5F5F7",
                  border: `1.5px solid ${pill.active ? interpolateColors(0.5, [0, 1], [C.line, C.accent]) : C.line}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <div style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: pill.active ? C.accent : C.ink }}>
                  {pill.k}
                </div>
                <div style={{ fontFamily: mono, fontSize: 15, color: c }}>{pill.d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </DevCard>
  );
};

const TxStepRow: React.FC<{
  p: number;
  step: string;
  sql: string;
  badge: string;
  tone: "accent" | "warn" | "bad" | "good";
  struck?: boolean;
}> = ({ p, step, sql, badge, tone, struck }) => {
  if (p <= 0) return null;
  const tc = toneColors(tone);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderRadius: 12,
        background: C.white,
        borderLeft: `4px solid ${tc.edge}`,
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        ...materialize(p),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span style={{ fontFamily: mono, fontSize: 17, fontWeight: 700, color: C.mute }}>{step}</span>
        <span
          style={{
            fontFamily: mono,
            fontSize: 19,
            fontWeight: 600,
            color: struck ? C.mute : C.ink,
            textDecoration: struck ? "line-through" : undefined,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {sql}
        </span>
      </div>
      <div
        style={{
          padding: "4px 12px",
          borderRadius: 8,
          background: tc.bg,
          color: tc.fg,
          fontFamily: mono,
          fontSize: 16,
          fontWeight: 700,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {badge}
      </div>
    </div>
  );
};
