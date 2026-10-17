import { useCurrentFrame } from "remotion";
import { Icon } from "../../icons/Icons";
import { TW, TX, TY } from "../../layout";
import { C, materialize, mono, prog, sans } from "../../theme";
import { AMBER, DevCard, toneColors } from "../dev/card";
import { BLUE_TINT, CARD_SHADOW, GREEN, presence, RED, WIRE } from "../diagram/Node";
import { tint } from "../windows/MacWindow";

// Concurrency Mutex Deadlock visualizer:
// shows Thread A holding Mutex 1 & waiting for Mutex 2, while Thread B holds Mutex 2 & waiting for Mutex 1
// (lighting up the circular wait cycle in red at `deadlockAt`, and resolving it via consistent lock ordering
// `Mutex 1 → Mutex 2` in green at `fixAt`).

export type DeadlockGraphProps = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  at: number;
  until?: number;
  acquireAt?: number;
  waitAt?: number;
  deadlockAt?: number;
  fixAt?: number;
  filename?: string;
  right?: string;
};

export const DeadlockGraph: React.FC<DeadlockGraphProps> = ({
  x = TX,
  y = TY,
  w = TW,
  h = 880,
  at,
  until,
  acquireAt,
  waitAt,
  deadlockAt,
  fixAt,
  filename = "mutex-deadlock.rs",
  right = "resource allocation graph",
}) => {
  const frame = useCurrentFrame();
  const p = presence(frame, at, until);
  if (p === null) return null;

  const tAcq = acquireAt ?? at + 12;
  const tWait = waitAt ?? at + 26;
  const tDead = deadlockAt ?? at + 42;
  const tFix = fixAt ?? at + 72;

  const acqP = prog(frame, tAcq, 10);
  const waitP = prog(frame, tWait, 10);
  const isDead = frame >= tDead && frame < tFix;
  const isFixed = frame >= tFix;

  const badTone = toneColors("bad");
  const goodTone = toneColors("good");
  const warnTone = toneColors("warn");
  const accentTone = toneColors("accent");

  const mainColor = isFixed ? GREEN : isDead ? RED : C.accent;
  const nodeBg = isFixed ? goodTone.bg : isDead ? badTone.bg : C.white;
  const nodeBorder = isFixed ? GREEN : isDead ? RED : C.line;

  return (
    <DevCard x={x} y={y} w={w} h={h} p={p} filename={filename} icon="lock" right={right}>
      {/* Top Status Banner */}
      <div
        style={{
          margin: "24px 32px 0",
          height: 64,
          borderRadius: 18,
          background: isFixed ? goodTone.bg : isDead ? badTone.bg : BLUE_TINT,
          border: `2px solid ${isFixed ? GREEN : isDead ? RED : tint(C.accent, 0.35)}`,
          padding: "0 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Icon
            name={isFixed ? "checkCircle" : isDead ? "warning" : "clock"}
            size={28}
            color={isFixed ? goodTone.fg : isDead ? RED : C.accent}
          />
          <span
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 23,
              color: isFixed ? goodTone.fg : isDead ? badTone.fg : C.ink,
              letterSpacing: "-0.01em",
            }}
          >
            {isFixed
              ? "resolved · global lock order: mutex 1 → mutex 2"
              : isDead
                ? "deadlock! circular wait cycle (A → M2 → B → M1 → A)"
                : "two threads acquiring shared mutex locks..."}
          </span>
        </div>
        <div
          style={{
            padding: "6px 14px",
            borderRadius: 12,
            background: C.white,
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 18,
            color: isFixed ? goodTone.fg : isDead ? RED : C.accent,
            border: `1px solid ${C.line}`,
          }}
        >
          {isFixed ? "cycle-free ✓" : isDead ? "0% progress" : "locking"}
        </div>
      </div>

      {/* Main Diamond Graph Canvas */}
      <div style={{ position: "relative", width: w, height: 460 }}>
        {/* SVG Edges connecting Mutex 1 (top), Thread A (left), Mutex 2 (bottom), Thread B (right) */}
        <svg
          width={w}
          height={460}
          viewBox={`0 0 ${w} 460`}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <defs>
            <marker id="dl-arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 1 1 L 9 5 L 1 9 z" fill={C.accent} />
            </marker>
            <marker id="dl-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 1 1 L 9 5 L 1 9 z" fill={RED} />
            </marker>
            <marker id="dl-arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 1 1 L 9 5 L 1 9 z" fill={GREEN} />
            </marker>
            <marker id="dl-arrow-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 1 1 L 9 5 L 1 9 z" fill={AMBER} />
            </marker>
          </defs>

          {/* 1. Top-Left: Mutex 1 -> Thread A (Thread A holds Mutex 1) */}
          {acqP > 0 ? (
            <path
              d="M 326 88 Q 205 88 185 162"
              fill="none"
              stroke={isFixed ? GREEN : isDead ? RED : C.accent}
              strokeWidth={4}
              strokeLinecap="round"
              markerEnd={`url(#dl-arrow-${isFixed ? "green" : isDead ? "red" : "blue"})`}
              opacity={acqP}
            />
          ) : null}

          {/* 2. Bottom-Left: Thread A -> Mutex 2 (Deadlock: waits for M2; Fixed: acquires M2 second) */}
          {waitP > 0 ? (
            <path
              d="M 185 288 Q 205 368 326 368"
              fill="none"
              stroke={isFixed ? GREEN : isDead ? RED : AMBER}
              strokeWidth={4}
              strokeDasharray={isFixed ? undefined : "10 8"}
              strokeLinecap="round"
              markerEnd={`url(#dl-arrow-${isFixed ? "green" : isDead ? "red" : "amber"})`}
              opacity={waitP}
            />
          ) : null}

          {/* 3. Bottom-Right: Mutex 2 <-> Thread B */}
          {acqP > 0 && !isFixed ? (
            <path
              d="M 574 368 Q 695 368 715 288"
              fill="none"
              stroke={isDead ? RED : C.accent}
              strokeWidth={4}
              strokeLinecap="round"
              markerEnd={`url(#dl-arrow-${isDead ? "red" : "blue"})`}
              opacity={acqP}
            />
          ) : null}

          {/* When fixed: Thread B also requests Mutex 1 first, then Mutex 2 */}
          {isFixed ? (
            <>
              <path
                d="M 715 162 Q 695 88 574 88"
                fill="none"
                stroke={GREEN}
                strokeWidth={3.5}
                strokeDasharray="8 7"
                strokeLinecap="round"
                markerEnd="url(#dl-arrow-green)"
              />
              <path
                d="M 715 288 Q 695 368 574 368"
                fill="none"
                stroke={GREEN}
                strokeWidth={3.5}
                strokeDasharray="8 7"
                strokeLinecap="round"
                markerEnd="url(#dl-arrow-green)"
              />
            </>
          ) : null}

          {/* 4. Top-Right (before fix): Thread B -> Mutex 1 (waits for M1, completing circular wait!) */}
          {waitP > 0 && !isFixed ? (
            <path
              d="M 715 162 Q 695 88 574 88"
              fill="none"
              stroke={isDead ? RED : AMBER}
              strokeWidth={4}
              strokeDasharray="10 8"
              strokeLinecap="round"
              markerEnd={`url(#dl-arrow-${isDead ? "red" : "amber"})`}
              opacity={waitP}
            />
          ) : null}
        </svg>

        {/* Edge Labels */}
        {acqP > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 145,
              top: 72,
              padding: "4px 12px",
              borderRadius: 10,
              background: isFixed ? goodTone.bg : isDead ? badTone.bg : accentTone.bg,
              color: isFixed ? goodTone.fg : isDead ? badTone.fg : C.accent,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 17,
              border: `1px solid ${mainColor}`,
            }}
          >
            {isFixed ? "1. locks M1" : "holds M1"}
          </div>
        ) : null}

        {waitP > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 135,
              top: 356,
              padding: "4px 12px",
              borderRadius: 10,
              background: isFixed ? goodTone.bg : isDead ? badTone.bg : warnTone.bg,
              color: isFixed ? goodTone.fg : isDead ? badTone.fg : warnTone.fg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 17,
              border: `1px solid ${isFixed ? GREEN : isDead ? RED : AMBER}`,
            }}
          >
            {isFixed ? "2. locks M2 ✓" : "waits for M2"}
          </div>
        ) : null}

        {acqP > 0 ? (
          <div
            style={{
              position: "absolute",
              right: 135,
              top: 356,
              padding: "4px 12px",
              borderRadius: 10,
              background: isFixed ? goodTone.bg : isDead ? badTone.bg : accentTone.bg,
              color: isFixed ? goodTone.fg : isDead ? badTone.fg : C.accent,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 17,
              border: `1px solid ${mainColor}`,
            }}
          >
            {isFixed ? "2. then M2 ✓" : "holds M2"}
          </div>
        ) : null}

        {waitP > 0 ? (
          <div
            style={{
              position: "absolute",
              right: 135,
              top: 72,
              padding: "4px 12px",
              borderRadius: 10,
              background: isFixed ? goodTone.bg : isDead ? badTone.bg : warnTone.bg,
              color: isFixed ? goodTone.fg : isDead ? badTone.fg : warnTone.fg,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 17,
              border: `1px solid ${isFixed ? GREEN : isDead ? RED : AMBER}`,
            }}
          >
            {isFixed ? "1. waits M1" : "waits for M1"}
          </div>
        ) : null}

        {/* TOP NODE: Mutex 1 */}
        <div
          style={{
            position: "absolute",
            left: w / 2 - 115,
            top: 38,
            width: 230,
            height: 100,
            borderRadius: 50,
            background: nodeBg,
            border: `3px solid ${nodeBorder}`,
            boxShadow: CARD_SHADOW,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <Icon name={isFixed ? "unlock" : "lock"} size={32} color={mainColor} />
          <div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 25, color: C.ink }}>mutex 1</div>
            <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 17, color: C.mute }}>order: #1</div>
          </div>
        </div>

        {/* BOTTOM NODE: Mutex 2 */}
        <div
          style={{
            position: "absolute",
            left: w / 2 - 115,
            top: 318,
            width: 230,
            height: 100,
            borderRadius: 50,
            background: nodeBg,
            border: `3px solid ${nodeBorder}`,
            boxShadow: CARD_SHADOW,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <Icon name={isFixed ? "unlock" : "lock"} size={32} color={mainColor} />
          <div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 25, color: C.ink }}>mutex 2</div>
            <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 17, color: C.mute }}>order: #2</div>
          </div>
        </div>

        {/* LEFT NODE: Thread A */}
        <div
          style={{
            position: "absolute",
            left: 55,
            top: 168,
            width: 240,
            height: 118,
            borderRadius: 24,
            background: nodeBg,
            border: `3px solid ${nodeBorder}`,
            boxShadow: CARD_SHADOW,
            padding: "0 20px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Icon name="cpu" size={38} color={mainColor} />
          <div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, color: C.ink }}>thread A</div>
            <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 18, color: isFixed ? goodTone.fg : isDead ? RED : C.mute }}>
              {isFixed ? "runs M1 → M2" : isDead ? "blocked ∞" : "worker-1"}
            </div>
          </div>
        </div>

        {/* RIGHT NODE: Thread B */}
        <div
          style={{
            position: "absolute",
            right: 55,
            top: 168,
            width: 240,
            height: 118,
            borderRadius: 24,
            background: nodeBg,
            border: `3px solid ${nodeBorder}`,
            boxShadow: CARD_SHADOW,
            padding: "0 20px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Icon name="cpu" size={38} color={mainColor} />
          <div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, color: C.ink }}>thread B</div>
            <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 18, color: isFixed ? goodTone.fg : isDead ? RED : C.mute }}>
              {isFixed ? "queued M1 → M2" : isDead ? "blocked ∞" : "worker-2"}
            </div>
          </div>
        </div>

        {/* Center Cycle / Fix Pill */}
        {frame >= tDead ? (
          <div
            style={{
              position: "absolute",
              left: w / 2,
              top: 228,
              translate: "-50% -50%",
              padding: "10px 22px",
              borderRadius: 24,
              background: isFixed ? goodTone.bg : badTone.bg,
              border: `2.5px solid ${isFixed ? GREEN : RED}`,
              boxShadow: CARD_SHADOW,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 20,
              color: isFixed ? goodTone.fg : badTone.fg,
              ...materialize(prog(frame, isFixed ? tFix : tDead, 9)),
            }}
          >
            <Icon name={isFixed ? "check" : "refresh"} size={24} color={isFixed ? GREEN : RED} />
            {isFixed ? "DAG · no cycle" : "circular wait"}
          </div>
        ) : null}
      </div>

      {/* Bottom Code Comparison Strip: Lock Acquisition Order */}
      <div style={{ display: "flex", gap: 24, padding: "0 32px" }}>
        {/* Thread A Lock Order */}
        <div
          style={{
            flex: 1,
            height: 228,
            borderRadius: 22,
            background: "#F8F8FA",
            border: `2px solid ${C.line}`,
            padding: "18px 22px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>fn thread_a()</span>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                background: BLUE_TINT,
                color: C.accent,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 17,
              }}
            >
              M1 then M2
            </span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 21, lineHeight: 1.65, color: C.ink }}>
            <div>
              <span style={{ color: C.mute }}>1 </span>
              <span>let _g1 = </span>
              <span style={{ fontWeight: 700, color: C.accent }}>mutex_1.lock()</span>;
            </div>
            <div>
              <span style={{ color: C.mute }}>2 </span>
              <span>let _g2 = </span>
              <span style={{ fontWeight: 700, color: C.accent }}>mutex_2.lock()</span>;
            </div>
            <div style={{ color: C.mute }}>3 transfer(a, b);</div>
          </div>
        </div>

        {/* Thread B Lock Order (flips from M2->M1 to M1->M2 at fixAt!) */}
        <div
          style={{
            flex: 1,
            height: 228,
            borderRadius: 22,
            background: isFixed ? goodTone.bg : isDead ? badTone.bg : "#F8F8FA",
            border: `2px solid ${isFixed ? GREEN : isDead ? RED : WIRE}`,
            padding: "18px 22px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 21, color: C.ink }}>fn thread_b()</span>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                background: C.white,
                color: isFixed ? goodTone.fg : badTone.fg,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 17,
                border: `1px solid ${isFixed ? GREEN : RED}`,
              }}
            >
              {isFixed ? "M1 then M2 (fixed)" : "M2 then M1 (bug!)"}
            </span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 21, lineHeight: 1.65, color: C.ink }}>
            <div>
              <span style={{ color: C.mute }}>1 </span>
              <span>let _g1 = </span>
              <span style={{ fontWeight: 700, color: isFixed ? goodTone.fg : badTone.fg }}>
                {isFixed ? "mutex_1.lock()" : "mutex_2.lock()"}
              </span>
              ;
            </div>
            <div>
              <span style={{ color: C.mute }}>2 </span>
              <span>let _g2 = </span>
              <span style={{ fontWeight: 700, color: isFixed ? goodTone.fg : badTone.fg }}>
                {isFixed ? "mutex_2.lock()" : "mutex_1.lock()"}
              </span>
              ;
            </div>
            <div style={{ color: C.mute }}>3 transfer(b, a);</div>
          </div>
        </div>
      </div>
    </DevCard>
  );
};
